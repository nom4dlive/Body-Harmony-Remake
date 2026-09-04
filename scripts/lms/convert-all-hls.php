<?php
// scripts/lms/convert-all-hls.php
// Script CLI para conversão de vídeos locais do LMS para HLS em lote

// Habilitar execução Web com segurança (token) ou via CLI
if (php_sapi_name() !== 'cli') {
    $token = $_GET['token'] ?? '';
    if ($token !== 'NEXUS_HLS_2026') {
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
        'message' => 'Conversão em lote iniciada em segundo plano.'
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

$hlsBaseDir = PRIVATE_UPLOADS_DIR . '/hls';
if (!file_exists($hlsBaseDir)) {
    mkdir($hlsBaseDir, 0755, true);
}

$statusFile = $hlsBaseDir . '/batch_status.json';

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
            
            // Em CLI validamos o processo. Em Web, confiamos no is_running + non-stale
            if ($isCli ? $processActive : true) {
                if ($isCli) {
                    echo "Aviso: Já existe uma conversão em lote ativa rodando no PID $oldPid.\n";
                    exit(0);
                } else {
                    header('Content-Type: application/json');
                    echo json_encode([
                        'success' => false,
                        'message' => 'Já existe uma conversão em lote ativa em andamento.'
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
    // 2. Buscar vídeos para conversão
    $sql = "SELECT id, title, video_ref, hls_path FROM lms_lessons WHERE is_active = 1 AND video_type IN ('local', 'hostinger')";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $totalVideos = count($lessons);
    $toBeConverted = [];

    foreach ($lessons as $lesson) {
        if ($force || empty($lesson['hls_path'])) {
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

    echo "Total de vídeos cadastrados: $totalVideos\n";
    echo "Já convertidos: $converted\n";
    echo "Pendentes para conversão: $pending\n";

    if ($pending === 0) {
        echo "Nenhum vídeo pendente para conversão.\n";
        $initialStatus['is_running'] = false;
        $initialStatus['progress_percent'] = 100;
        updateStatus($initialStatus);
        exit(0);
    }

    // Otimizar a gravação do .htaccess HLS global
    $htaccessPath = $hlsBaseDir . '/.htaccess';
    if (!file_exists($htaccessPath)) {
        $htaccessContent = <<<EOT
Options -Indexes
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://bodyharmony.com.br"
    Header set Access-Control-Allow-Methods "GET, HEAD, OPTIONS"
    Header set Access-Control-Allow-Headers "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
    Header set Cache-Control "public, max-age=2592000, immutable"
</IfModule>
<FilesMatch "\.(ts|m3u8)$">
    Require all granted
</FilesMatch>
EOT;
        file_put_contents($htaccessPath, $htaccessContent);
    }

    // Detectar binário FFmpeg estático ou global
    $ffmpegBin = 'ffmpeg';
    $localFfmpeg = __DIR__ . '/bin/ffmpeg';
    if (file_exists($localFfmpeg)) {
        $ffmpegBin = $localFfmpeg;
        @chmod($ffmpegBin, 0755);
    }

    // 3. Processar vídeos sequencialmente
    foreach ($toBeConverted as $index => $lesson) {
        $lessonId = $lesson['id'];
        $title = $lesson['title'];
        $rawRef = $lesson['video_ref'];
        
        echo "[Processando] ID: $lessonId - $title...\n";

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
            $errorMsg = "Erro: Arquivo MP4 fonte não encontrado para ID $lessonId ($title). Path: $sourcePath";
            echo "$errorMsg\n";
            $initialStatus['last_error'] = $errorMsg;
            updateStatus($initialStatus);
            continue;
        }

        $hlsOutDir = $hlsBaseDir . '/' . $lessonId;
        if (!file_exists($hlsOutDir)) {
            mkdir($hlsOutDir, 0755, true);
        }

        $masterPlaylist = $hlsOutDir . '/master.m3u8';

        // Comando FFmpeg com nice -n 19 para menor prioridade no Linux
        $nicePrefix = (strncasecmp(PHP_OS, 'WIN', 3) === 0) ? '' : 'nice -n 19 ';
        $cmd = sprintf(
            $nicePrefix . escapeshellcmd($ffmpegBin) . ' -y -i %s -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls %s 2>&1',
            escapeshellarg($sourcePath),
            escapeshellarg($masterPlaylist)
        );

        $output = [];
        $returnVar = 0;
        exec($cmd, $output, $returnVar);

        if ($returnVar !== 0) {
            $errorMsg = "Erro na conversão FFmpeg para ID $lessonId ($title). Saída: " . implode("\n", array_slice($output, -3));
            echo "$errorMsg\n";
            $initialStatus['last_error'] = $errorMsg;
            updateStatus($initialStatus);
            continue;
        }

        // Atualizar banco de dados
        $relativeHlsPath = 'hls/' . $lessonId . '/master.m3u8';
        $updateStmt = $pdo->prepare("UPDATE lms_lessons SET hls_path = ? WHERE id = ?");
        $updateStmt->execute([$relativeHlsPath, $lessonId]);

        // Atualizar contadores
        $converted++;
        $pending--;

        $initialStatus['converted'] = $converted;
        $initialStatus['pending'] = $pending;
        $initialStatus['progress_percent'] = round(($converted / $totalVideos) * 100);
        updateStatus($initialStatus);

        echo "Sucesso: ID $lessonId HLS gerado.\n";
    }

    echo "Processamento em lote concluído com sucesso.\n";
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
