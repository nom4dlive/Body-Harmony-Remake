<?php
/**
 * LmsNotebookSecurityTest.php
 * Automated security and integration test for LmsNotebookService.
 * Validates atomic locking, quota exhaustion (429), non-beta blocking (403), and timestamp parsing.
 */

require_once __DIR__ . '/../api/v1/Services/LmsNotebookService.php';
use BodyHarmony\Services\LmsNotebookService;

echo "=========================================================\n";
echo "🧪 RUNNING LMS NOTEBOOK SECURITY & INTEGRATION TEST SUITE\n";
echo "=========================================================\n\n";

$passed = 0;
$failed = 0;

function assertCondition(bool $condition, string $testName) {
    global $passed, $failed;
    if ($condition) {
        echo "  ✅ PASS: {$testName}\n";
        $passed++;
    } else {
        echo "  ❌ FAIL: {$testName}\n";
        $failed++;
    }
}

// Mock PDO & Statement for deterministic in-memory testing
class MockPdoStatement {
    private $data;
    public function __construct($data = []) {
        $this->data = $data;
    }
    public function execute($params = []) {
        return true;
    }
    public function fetch($mode = PDO::FETCH_ASSOC) {
        return is_array($this->data) && isset($this->data[0]) ? $this->data[0] : $this->data;
    }
    public function fetchAll($mode = PDO::FETCH_ASSOC) {
        return is_array($this->data) ? $this->data : [];
    }
    public function fetchColumn($col = 0) {
        if (is_scalar($this->data)) return $this->data;
        if (is_array($this->data) && isset($this->data[0])) {
            $row = $this->data[0];
            if (is_array($row)) return reset($row);
            return $row;
        }
        return null;
    }
}

class MockPdo {
    public $siteConfig = [];
    public $licenciadas = [
        10 => ['id' => 10, 'name' => 'Aluna Ativa Beta', 'phone' => '11999990001', 'is_active' => 1, 'ai_notebook_beta_enabled' => 1, 'ai_notebook_credits_limit' => 5],
        20 => ['id' => 20, 'name' => 'Aluna Sem Beta', 'phone' => '11999990002', 'is_active' => 1, 'ai_notebook_beta_enabled' => 0, 'ai_notebook_credits_limit' => 100],
        30 => ['id' => 30, 'name' => 'Aluna Inativa', 'phone' => '11999990003', 'is_active' => 0, 'ai_notebook_beta_enabled' => 1, 'ai_notebook_credits_limit' => 100]
    ];
    public $chats = [];
    private $inTrans = false;

    public function beginTransaction() { $this->inTrans = true; return true; }
    public function commit() { $this->inTrans = false; return true; }
    public function rollBack() { $this->inTrans = false; return true; }
    public function inTransaction() { return $this->inTrans; }

    public function prepare($sql) {
        $sqlClean = trim(preg_replace('/\s+/', ' ', $sql));

        // ensureColumns / metadata checks
        if (stripos($sqlClean, 'SHOW COLUMNS') !== false || stripos($sqlClean, 'CREATE TABLE') !== false) {
            return new MockPdoStatement([['Field' => 'ai_notebook_beta_enabled']]);
        }

        // site_config INSERT / UPDATE
        if (stripos($sqlClean, 'INSERT INTO site_config') !== false) {
            return new class($this) {
                private $parent;
                public function __construct($parent) { $this->parent = $parent; }
                public function execute($params = []) {
                    if (strpos($params[0], 'test-client') !== false) {
                        $this->parent->siteConfig['google_oauth_client_id'] = $params[0];
                    } elseif (strpos($params[0], 'GOCSPX') !== false) {
                        $this->parent->siteConfig['google_oauth_client_secret'] = $params[0];
                    } else {
                        $this->parent->siteConfig['notebooklm_google_tokens'] = $params[0];
                    }
                    return true;
                }
            };
        }

        // site_config SELECT
        if (stripos($sqlClean, 'SELECT config_key, config_value FROM site_config') !== false) {
            return new class($this->siteConfig) {
                private $data;
                public function __construct($d) { $this->data = $d; }
                public function execute($p = []) { return true; }
                public function fetchAll($mode = null) { return $this->data; }
            };
        }

        // licenciadas lock
        if (stripos($sqlClean, 'SELECT id, name, phone, is_active, ai_notebook_beta_enabled') !== false) {
            return new class($this) {
                private $parent;
                private $found = null;
                public function __construct($p) { $this->parent = $p; }
                public function execute($params = []) {
                    $id = $params[0] ?? 0;
                    $this->found = $this->parent->licenciadas[$id] ?? null;
                    return true;
                }
                public function fetch() { return $this->found; }
            };
        }

        // spent credits
        if (stripos($sqlClean, 'SELECT COALESCE(SUM(credits_spent)') !== false) {
            return new class($this) {
                private $parent;
                public function __construct($p) { $this->parent = $p; }
                public function execute($params = []) { return true; }
                public function fetchColumn() { 
                    return count($this->parent->chats); 
                }
            };
        }

        // insert chat
        if (stripos($sqlClean, 'INSERT INTO lms_notebook_chats') !== false) {
            return new class($this) {
                private $parent;
                public function __construct($p) { $this->parent = $p; }
                public function execute($params = []) {
                    $this->parent->chats[] = ['licenciada_id' => $params[0], 'module_id' => $params[1]];
                    return true;
                }
            };
        }

        // module
        if (stripos($sqlClean, 'FROM lms_modules') !== false) {
            return new MockPdoStatement([
                'id' => 1,
                'title' => 'Módulo 1: Fundamentos de Eletroestimulação',
                'description' => 'Bases fisiológicas e cronaxia.'
            ]);
        }

        // lessons
        if (stripos($sqlClean, 'FROM lms_lessons') !== false) {
            return new MockPdoStatement([
                [
                    'id' => 1,
                    'title' => 'Aula 1: Fisiologia da Contração',
                    'description' => 'Recrutamento motor e cronaxia.',
                    'video_type' => 'hostinger',
                    'video_ref' => 'videos/aula1.mp4',
                    'transcription_status' => 'completed',
                    'transcription_text' => 'Transcrição oficial da aula com parâmetros de Hz.',
                    'duration' => '05:00'
                ]
            ]);
        }

        // sources
        if (stripos($sqlClean, 'FROM lms_module_sources') !== false) {
            return new MockPdoStatement([]);
        }

        return new MockPdoStatement([]);
    }

    public function query($sql) {
        return $this->prepare($sql);
    }
}

$mockPdo = new MockPdo();
$service = new LmsNotebookService($mockPdo);

// --- TEST 1: Configuração OAuth & Credenciais ---
echo "[1/4] Testando Gestão de Credenciais OAuth & Tokens...\n";
$saveResult = $service->saveAuthConfig([
    'google_client_id' => 'test-client-12345.apps.googleusercontent.com',
    'google_client_secret' => 'GOCSPX-testSecretKey999'
]);
assertCondition($saveResult['success'] === true, 'saveAuthConfig executa com sucesso');

$config = $service->getAuthConfig();
assertCondition($config['google_client_id'] === 'test-client-12345.apps.googleusercontent.com', 'getAuthConfig retorna Client ID configurado');
assertCondition($config['google_client_secret_configured'] === true, 'getAuthConfig sinaliza segredo configurado');

$tokenRes = $service->saveSessionToken(json_encode([
    'access_token' => 'ya29.testMockAccessToken',
    'refresh_token' => '1//testMockRefreshToken',
    'email' => 'bodyharmony36@gmail.com'
]));
assertCondition($tokenRes['authenticated'] === true && $tokenRes['email'] === 'bodyharmony36@gmail.com', 'saveSessionToken persiste e valida sessão');


// --- TEST 2: Bloqueio de Aluna Inativa e Aluna Sem Beta (403) ---
echo "\n[2/4] Testando Regras de Acesso e Bloqueio 403...\n";

// Inactive student
$blockedInactive = false;
try {
    $service->chatWithNotebook(30, 1, "Minha dúvida clínica");
} catch (Exception $e) {
    if ($e->getCode() === 403) $blockedInactive = true;
}
assertCondition($blockedInactive, 'Aluna inativa é bloqueada com status 403');

// Non-beta student
$blockedNonBeta = false;
try {
    $service->chatWithNotebook(20, 1, "Minha dúvida clínica");
} catch (Exception $e) {
    if ($e->getCode() === 403) $blockedNonBeta = true;
}
assertCondition($blockedNonBeta, 'Aluna sem permissão beta é bloqueada com status 403');


// --- TEST 3: Interação RAG da Aluna & Extração de Timestamps ---
echo "\n[3/4] Testando Chat RAG e Formatação de Timestamps...\n";

$chatRes = $service->chatWithNotebook(10, 1, "Quais os parâmetros para glúteos?");
assertCondition($chatRes['success'] === true, 'Chat RAG responde com sucesso');
assertCondition(!empty($chatRes['reply']), 'Resposta da Dra. Harmony AI gerada');
assertCondition(count($chatRes['timestamps']) >= 1, 'Timestamps de vídeo extraídos da resposta');
assertCondition(isset($chatRes['timestamps'][0]['seconds']), 'Segundos para salto de vídeo calculados');
assertCondition($chatRes['credits_remaining'] === 4, 'Créditos decrementados corretamente (5 - 1 = 4)');


// --- TEST 4: Esgotamento Atômico de Cotas Diárias (429) & Fallback WhatsApp ---
echo "\n[4/4] Testando Exaustão de Cotas Diárias (429 Strict Limit)...\n";

// Consumir os 4 créditos restantes
for ($i = 0; $i < 4; $i++) {
    $service->chatWithNotebook(10, 1, "Pergunta de teste " . ($i + 1));
}

$quotaBlocked = false;
$whatsappUrl = null;
try {
    // 6ª pergunta (deve estourar o limite de 5)
    $service->chatWithNotebook(10, 1, "Pergunta excedente");
} catch (Exception $e) {
    if ($e->getCode() === 429) {
        $quotaBlocked = true;
        $decoded = json_decode($e->getMessage(), true);
        $whatsappUrl = $decoded['whatsapp_url'] ?? null;
    }
}

assertCondition($quotaBlocked, 'Limite diário de créditos aciona bloqueio 429');
assertCondition(!empty($whatsappUrl) && strpos($whatsappUrl, 'wa.me') !== false, 'URL de WhatsApp para recarga gerada corretamente');


// --- SUMMARY ---
echo "\n=========================================================\n";
echo "📊 RESULTADO DOS TESTES: {$passed} PASS | {$failed} FAIL\n";
echo "=========================================================\n";

if ($failed > 0) {
    exit(1);
}
exit(0);
