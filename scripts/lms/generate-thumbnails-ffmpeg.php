<?php
// scripts/lms/generate-thumbnails-ffmpeg.php
// Script CLI/Web para extração de miniaturas (thumbnails) de vídeos locais do LMS em lote usando FFmpeg

// Habilitar execução Web com segurança (token) ou via CLI
if (php_sapi_name() !== 'cli') {
    $token = $_GET['token'] ?? '';
    if ($token !== 'NEXUS_THUMBS_2026') {
        header('HTTP/1.1 403 Forbidden');
        echo json_encode(['success' => false, 'message' => 'Acesso proibido. Token inválido.']);
        exit(0);
    }

    // Fechar a conexão HTTP e continuar rodando em background (FastCGI/LiteSpeed)
    ignore_user_abort(true);
    set_time_limit(0);
    
    // Limpar buffers de saída
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    ob_start();
    echo json_encode([
        'success' => true,
        'message' => 'Geração de miniaturas em lote iniciada em segundo plano.'
    ]);
    $size = ob_get_length();
    
    header("Content-Length: $size");
    header("Connection: close");
    header("Content-Type: application/json");
    
    ob_end_flush();
    flush();
    
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    }
}

// Carregar configurações do banco se não estiver em modo de teste
if (!defined('TEST_MODE')) {
    $configPath = __DIR__ . '/../../apps/web-app/src/backend/api/config.php'; // Local dev
    if (!file_exists($configPath)) {
        $configPath = __DIR__ . '/../../api/config.php'; // Production
    }
    require_once $configPath;
}

set_time_limit(0);
ini_set('memory_limit', '1G');

$options = getopt("f", ["force"]);
$force = isset($options['f']) || isset($options['force']) || !empty($_GET['force']);

if (!defined('PRIVATE_UPLOADS_DIR')) {
    $uploadsPath = realpath(__DIR__ . '/../../private_uploads'); // Local dev
    if (!$uploadsPath || !file_exists($uploadsPath)) {
        $uploadsPath = realpath(__DIR__ . '/../../../private_uploads'); // Production
    }
    define('PRIVATE_UPLOADS_DIR', $uploadsPath);
}

$thumbDir = PRIVATE_UPLOADS_DIR . '/thumbnails';
if (!file_exists($thumbDir)) {
    mkdir($thumbDir, 0755, true);
}

$statusFile = $thumbDir . '/batch_status.json';

// Função auxiliar para atualizar o status
function updateStatus($data) {
    global $statusFile;
    $data['updated_at'] = time();
    file_put_contents($statusFile, json_encode($data, JSON_PRETTY_PRINT));
}

// 1. Lock de Processamento para evitar execuções simultâneas
$pid = getmypid();
$currentStatus = [];
if (file_exists($statusFile)) {
    $currentStatus = json_decode(file_get_contents($statusFile), true) ?: [];
    if (!empty($currentStatus['is_running'])) {
        $oldPid = $currentStatus['pid'] ?? 0;
        $updatedAt = $currentStatus['updated_at'] ?? 0;
        $isStale = (time() - $updatedAt) > 300; // 5 minutos sem atualização = travado/morto
        
        if (!$isStale) {
            $isCli = (php_sapi_name() === 'cli');
            $processActive = false;
            
            if ($oldPid) {
                if (strncasecmp(PHP_OS, 'WIN', 3) === 0) {
                    $processActive = winProcessExists($oldPid);
                } else {
                    $processActive = posixProcessExists($oldPid);
                }
            }
            
            if ($isCli ? $processActive : true) {
                if ($isCli) {
                    echo "Aviso: Já existe uma geração em lote ativa rodando no PID $oldPid.\n";
                    exit(0);
                } else {
                    header('Content-Type: application/json');
                    echo json_encode([
                        'success' => false,
                        'message' => 'Já existe uma geração de miniaturas ativa em andamento.'
                    ]);
                    exit(0);
                }
            }
        }
    }
}

function winProcessExists($pid) {
    $output = [];
    exec("tasklist /FI \"PID eq $pid\"", $output);
    return count($output) > 3;
}

function posixProcessExists($pid) {
    return file_exists("/proc/$pid");
}

// Inicializar status
$initialStatus = [
    'is_running' => true,
    'pid' => $pid,
    'total_videos' => 0,
    'converted' => 0,
    'pending' => 0,
    'progress_percent' => 0,
    'last_error' => null
];
updateStatus($initialStatus);

try {
    // 2. Buscar aulas para geração de thumbnails
    $sql = "SELECT id, title, video_ref, thumbnail_ref, video_type FROM lms_lessons WHERE is_active = 1 AND video_type IN ('local', 'hostinger')";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $totalVideos = count($lessons);
    $toBeConverted = [];

    foreach ($lessons as $lesson) {
        if ($force || empty($lesson['thumbnail_ref'])) {
            $toBeConverted[] = $lesson;
        }
    }

    $pending = count($toBeConverted);
    $converted = $totalVideos - $pending;

    $initialStatus['total_videos'] = $totalVideos;
    $initialStatus['converted'] = $converted;
    $initialStatus['pending'] = $pending;
    $initialStatus['progress_percent'] = $totalVideos > 0 ? round(($converted / $totalVideos) * 100) : 100;
    updateStatus($initialStatus);

    echo "Total de aulas locais cadastradas: $totalVideos\n";
    echo "Com miniatura preenchida: $converted\n";
    echo "Pendentes para geração: $pending\n";

    if ($pending === 0) {
        echo "Nenhuma miniatura pendente para geração.\n";
        $initialStatus['is_running'] = false;
        $initialStatus['progress_percent'] = 100;
        updateStatus($initialStatus);
        exit(0);
    }

    // Detectar binário FFmpeg estático ou global
    $ffmpegBin = 'ffmpeg';
    $localFfmpeg = realpath(__DIR__ . '/bin/ffmpeg');
    if (!$localFfmpeg) {
        $localFfmpeg = realpath(__DIR__ . '/../bin/ffmpeg');
    }
    if ($localFfmpeg && file_exists($localFfmpeg)) {
        $ffmpegBin = $localFfmpeg;
        @chmod($ffmpegBin, 0755);
    }

    // 3. Processar vídeos sequencialmente
    foreach ($toBeConverted as $index => $lesson) {
        $lessonId = $lesson['id'];
        $title = $lesson['title'];
        $rawRef = $lesson['video_ref'];
        
        echo "[Processando] Aula ID: $lessonId - $title...\n";

        if (strpos($rawRef, 'hostinger:') === 0) {
            $rawRef = substr($rawRef, 10);
        }

        $rawRef = str_replace(['../', '..\\'], '', $rawRef);
        $fileName = basename($rawRef);

        $sourcePath = PRIVATE_UPLOADS_DIR . '/lessons/' . $fileName;
        if (!file_exists($sourcePath)) {
            $sourcePath = PRIVATE_UPLOADS_DIR . '/' . $rawRef;
            if (!file_exists($sourcePath)) {
                $sourcePath = PRIVATE_UPLOADS_DIR . '/' . $fileName;
            }
        }

        if (!file_exists($sourcePath)) {
            $errorMsg = "Erro: Arquivo MP4 fonte não encontrado para Aula ID $lessonId ($title). Path: $sourcePath";
            echo "$errorMsg\n";
            $initialStatus['last_error'] = $errorMsg;
            updateStatus($initialStatus);
            continue;
        }

        // Nome da miniatura baseado na aula
        $thumbFileName = "lesson_{$lessonId}_" . time() . ".jpg";
        $destinationPath = $thumbDir . '/' . $thumbFileName;

        // Comando FFmpeg com nice -n 19 para menor prioridade, thread única e seek a 3 segundos
        $nicePrefix = (strncasecmp(PHP_OS, 'WIN', 3) === 0) ? '' : 'nice -n 19 ';
        $cmd = sprintf(
            $nicePrefix . escapeshellcmd($ffmpegBin) . ' -y -ss 00:00:03 -i %s -vframes 1 -threads 1 %s 2>&1',
            escapeshellarg($sourcePath),
            escapeshellarg($destinationPath)
        );

        $output = [];
        $returnVar = 0;
        exec($cmd, $output, $returnVar);

        if ($returnVar !== 0) {
            $errorMsg = "Erro na extração de frame FFmpeg para Aula ID $lessonId ($title). Saída: " . implode("\n", array_slice($output, -3));
            echo "$errorMsg\n";
            $initialStatus['last_error'] = $errorMsg;
            updateStatus($initialStatus);
            continue;
        }

        // Atualizar banco de dados
        $relativeThumbPath = 'thumbnails/' . $thumbFileName;
        $updateStmt = $pdo->prepare("UPDATE lms_lessons SET thumbnail_ref = ? WHERE id = ?");
        $updateStmt->execute([$relativeThumbPath, $lessonId]);

        // Invalida o cache do lms de todas as alunas e licenciadas
        if (class_exists('ResponseCache')) {
            ResponseCache::clear("api_lms_modules_");
            ResponseCache::clear("admin_lms_modules_");
        }

        // Atualizar contadores
        $converted++;
        $pending--;

        $initialStatus['converted'] = $converted;
        $initialStatus['pending'] = $pending;
        $initialStatus['progress_percent'] = round(($converted / $totalVideos) * 100);
        updateStatus($initialStatus);

        echo "Sucesso: Aula ID $lessonId Thumbnail gerada.\n";
    }

    echo "Processamento em lote de thumbnails concluído com sucesso.\n";
    $initialStatus['is_running'] = false;
    $initialStatus['progress_percent'] = 100;
    updateStatus($initialStatus);

} catch (Exception $e) {
    echo "Erro Crítico: " . $e->getMessage() . "\n";
    $initialStatus['is_running'] = false;
    $initialStatus['last_error'] = $e->getMessage();
    updateStatus($initialStatus);
    exit(1);
}
