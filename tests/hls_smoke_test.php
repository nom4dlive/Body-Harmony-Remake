<?php
// tests/hls_smoke_test.php
// Smoke test para validar a conversão HLS e integridade de arquivos usando MockPDO puro

echo "=== INICIANDO TESTE DE FUMAÇA HLS (MOCK-PDO) ===\n";

define('TEST_MODE', true);

// 1. Resolver caminhos
$projectRoot = realpath(__DIR__ . '/..');
if (!defined('PRIVATE_UPLOADS_DIR')) {
    define('PRIVATE_UPLOADS_DIR', $projectRoot . '/private_uploads');
}

$sampleVideo = PRIVATE_UPLOADS_DIR . '/lessons/smoke_test_sample.mp4';
$lessonsDir = PRIVATE_UPLOADS_DIR . '/lessons';

if (!file_exists($lessonsDir)) {
    mkdir($lessonsDir, 0755, true);
}

// 2. Definir classes Mock de Banco de Dados
class MockPDO {
    public $lessons = [];
    public $modules = [];
    public $lastInsertId = 1;
    public $queriesRun = [];

    public function __construct() {
        $this->modules = [
            ['id' => 1, 'title' => 'Módulo Teste HLS', 'description' => 'Descrição do Módulo Teste', 'is_active' => 1]
        ];
        // Inicializar com a aula de teste pendente
        $this->lessons = [
            [
                'id' => 9999, // ID alto de teste
                'module_id' => 1,
                'title' => 'Smoke Test Lesson HLS',
                'description' => 'Aula temporária para teste de fumaça',
                'video_type' => 'local',
                'video_ref' => 'lessons/smoke_test_sample.mp4',
                'hls_path' => null,
                'is_active' => 1
            ]
        ];
    }

    public function prepare($sql) {
        $this->queriesRun[] = $sql;
        return new MockStatement($this, $sql);
    }

    public function query($sql) {
        $this->queriesRun[] = $sql;
        return new MockStatement($this, $sql);
    }

    public function lastInsertId($name = null) {
        return $this->lastInsertId;
    }
}

class MockStatement {
    private $pdo;
    private $sql;
    private $params = [];

    public function __construct($pdo, $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute($params = []) {
        $this->params = $params;
        if (strpos($this->sql, 'UPDATE lms_lessons') !== false) {
            $hlsPath = $params[0];
            $lessonId = $params[1];
            foreach ($this->pdo->lessons as &$lesson) {
                if ($lesson['id'] == $lessonId) {
                    $lesson['hls_path'] = $hlsPath;
                }
            }
        }
        return true;
    }

    public function fetchAll($mode = null, ...$args) {
        if (strpos($this->sql, 'SELECT') !== false && strpos($this->sql, 'lms_lessons') !== false) {
            return $this->pdo->lessons;
        }
        return [];
    }

    public function fetchColumn($column = 0) {
        return 9999; // Retorna o ID ou contadores esperados
    }
}

$pdo = new MockPDO();
$lessonId = 9999;

try {
    // 3. Gerar vídeo temporário MP4 com FFmpeg
    echo "1. Gerando vídeo de teste MP4 de 1s...\n";
    $genCmd = sprintf(
        'ffmpeg -y -f lavfi -i color=c=black:s=640x360:d=1 -f lavfi -i anullsrc=r=44100:cl=mono:d=1 -c:v libx264 -c:a aac -pix_fmt yuv420p %s 2>&1',
        escapeshellarg($sampleVideo)
    );

    $genOutput = [];
    $genRet = 0;
    exec($genCmd, $genOutput, $genRet);

    if ($genRet !== 0 || !file_exists($sampleVideo)) {
        echo "Falha ao criar o vídeo de teste MP4. Saída do FFmpeg: " . implode("\n", $genOutput) . "\n";
        exit(1);
    }
    echo "   ✓ Vídeo de teste gerado com sucesso em: $sampleVideo\n";

} catch (Exception $e) {
    echo "Falha na inicialização do ambiente de testes: " . $e->getMessage() . "\n";
    exit(1);
}

// Registrar a função de shutdown para validação e limpeza
register_shutdown_function(function() use (&$pdo, $sampleVideo, $lessonId) {
    $success = false;
    try {
        echo "4. Validando resultados do processamento...\n";
        
        // A. Verificar HLS Path no Mock
        $hlsPath = $pdo->lessons[0]['hls_path'] ?? null;
        $expectedHlsPath = 'hls/' . $lessonId . '/master.m3u8';
        if ($hlsPath !== $expectedHlsPath) {
            throw new Exception("Erro: hls_path no banco de dados está incorreto. Obtido: '$hlsPath', Esperado: '$expectedHlsPath'");
        }
        echo "   ✓ Banco de dados Mock atualizado com o hls_path correto.\n";

        // B. Verificar existência dos arquivos do HLS
        $createdHlsDir = PRIVATE_UPLOADS_DIR . '/hls/' . $lessonId;
        $playlistFile = $createdHlsDir . '/master.m3u8';
        
        if (!file_exists($playlistFile) || filesize($playlistFile) === 0) {
            throw new Exception("Erro: Arquivo master.m3u8 não foi criado ou está vazio em $playlistFile");
        }
        echo "   ✓ Arquivo master.m3u8 gerado com sucesso.\n";

        // Buscar fragmentos .ts
        $tsFiles = glob($createdHlsDir . '/*.ts');
        if (count($tsFiles) === 0) {
            throw new Exception("Erro: Nenhum fragmento de vídeo .ts foi gerado em $createdHlsDir");
        }
        echo "   ✓ Fragmentos de vídeo .ts gerados (" . count($tsFiles) . " arquivo(s)).\n";

        // C. Verificar .htaccess HLS
        $htaccessFile = PRIVATE_UPLOADS_DIR . '/hls/.htaccess';
        if (!file_exists($htaccessFile)) {
            throw new Exception("Erro: Arquivo .htaccess ausente na pasta hls/");
        }
        
        $htaccessContent = file_get_contents($htaccessFile);
        if (strpos($htaccessContent, 'Access-Control-Allow-Origin') === false || strpos($htaccessContent, 'immutable') === false) {
            throw new Exception("Erro: Arquivo .htaccess na pasta hls/ não possui as diretivas corretas de CORS e Cache-Control.");
        }
        echo "   ✓ Arquivo .htaccess CORS & CDN Cache validado na pasta hls/.\n";

        echo "\n🟢 TESTE DE FUMAÇA HLS APROVADO COM SUCESSO!\n";
        $success = true;

    } catch (Exception $e) {
        echo "\n🔴 TESTE DE FUMAÇA FALHOU: " . $e->getMessage() . "\n";
    }

    echo "\n5. Iniciando limpeza de dados temporários...\n";
    
    // Remover vídeo fonte
    if (file_exists($sampleVideo)) {
        @unlink($sampleVideo);
        echo "   ✓ Arquivo MP4 temporário removido.\n";
    }

    // Remover pasta HLS temporária
    $createdHlsDir = PRIVATE_UPLOADS_DIR . '/hls/' . $lessonId;
    if ($lessonId && file_exists($createdHlsDir)) {
        $files = glob($createdHlsDir . '/*');
        foreach ($files as $file) {
            if (is_file($file)) @unlink($file);
        }
        @rmdir($createdHlsDir);
        echo "   ✓ Pasta HLS temporária e fragmentos removidos.\n";
    }
    
    $statusFile = PRIVATE_UPLOADS_DIR . '/hls/batch_status.json';
    if (file_exists($statusFile)) {
        @unlink($statusFile);
    }

    // Se o teste falhou, sair com código de erro 1
    if (!$success) {
        exit(1);
    }
});

// 3. Executar o script convert-all-hls.php
echo "3. Executando convert-all-hls.php...\n";
require_once __DIR__ . '/../scripts/lms/convert-all-hls.php';
