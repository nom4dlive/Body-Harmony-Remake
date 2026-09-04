<?php
/**
 * ==============================================================================
 * SMOKE TEST: CRM BRIDGE SERVICE & AUTO-LINKER POR TELEFONE/CPF (PLAN-153)
 * ==============================================================================
 * Nexus Protocol V3.1 — REGRA 6 Compliant: Pure Services & Mock PDO Isolation.
 * Zero HTTP controllers or global header execution.
 * ==============================================================================
 */

if (file_exists(__DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmBridgeService.php')) {
    require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmBridgeService.php';
} elseif (file_exists(__DIR__ . '/CrmBridgeService.php')) {
    require_once __DIR__ . '/CrmBridgeService.php';
} else {
    require_once 'CrmBridgeService.php';
}

use BodyHarmony\Services\CrmBridgeService;

echo "\n===============================================================\n";
echo "  TEST SUITE: CRM BRIDGE & AUTO-LINKER (PLAN-153 / BLOCO 3)    \n";
echo "===============================================================\n\n";

$passCount = 0;
$failCount = 0;

function assertTest(string $description, bool $condition, ?string $details = null): void {
    global $passCount, $failCount;
    if ($condition) {
        echo "  [\033[32mPASS\033[0m] {$description}\n";
        $passCount++;
    } else {
        echo "  [\033[31mFAIL\033[0m] {$description}\n";
        if ($details) echo "         \033[33mDetail: {$details}\033[0m\n";
        $failCount++;
    }
}

/**
 * Mock PDO Provider for CrmBridge Testing
 */
class MockPDOCrmBridge {
    public array $licenciadas = [];
    public array $contracts = [];
    public array $onboarding = [];
    public array $shopLeads = [];

    public function __construct() {
        // 1. Licenciada Mestre (Dra. Josi Silva)
        $this->licenciadas = [
            [
                'id' => 1,
                'name' => 'Dra. Joselene Aparecida da Silva',
                'cpf' => '36208232864',
                'whatsapp' => '5518996959486',
                'email' => 'josi@bodyharmony.com.br',
                'location' => 'Assis',
                'state' => 'SP',
                'photo_url' => null,
                'is_active' => 1,
                'created_at' => '2026-01-01 10:00:00'
            ]
        ];

        // 2. Contrato / Aluna
        $this->contracts = [
            [
                'id' => 101,
                'client_name' => 'Camila Santos de Souza',
                'client_document' => '12345678900',
                'client_phone' => '+55 (11) 98888-7777',
                'client_email' => 'camila@email.com',
                'client_city' => 'São Paulo',
                'client_state' => 'SP',
                'status' => 'SIGNED'
            ]
        ];

        // 3. Onboarding Request
        $this->onboarding = [
            [
                'id' => 201,
                'full_name' => 'Renata Oliveira',
                'cpf' => '98765432100',
                'whatsapp' => '21977776666',
                'email' => 'renata@email.com',
                'status' => 'EM_ANALISE',
                'cidade' => 'Niterói',
                'estado' => 'RJ'
            ]
        ];

        // 4. Shop Lead
        $this->shopLeads = [
            [
                'id' => 301,
                'name' => 'Mariana Costa',
                'email' => 'mariana@email.com',
                'whatsapp' => '31966665555',
                'status' => 'PROSPECT'
            ]
        ];
    }

    public function prepare(string $sql) {
        return new MockStmtCrmBridge($this, $sql);
    }
}

class MockStmtCrmBridge {
    private MockPDOCrmBridge $pdo;
    private string $sql;
    private array $params = [];
    private ?array $lastResult = null;

    public function __construct(MockPDOCrmBridge $pdo, string $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute(array $params = []): bool {
        $this->params = $params;
        $sql = $this->sql;

        // Search Licenciadas
        if (str_contains($sql, 'FROM licenciadas')) {
            $p8 = str_replace('%', '', $params[':p8'] ?? '');
            $p9 = str_replace('%', '', $params[':p9'] ?? '');
            foreach ($this->pdo->licenciadas as $row) {
                $clean = preg_replace('/\D/', '', $row['whatsapp']);
                if (str_contains($clean, $p8) || str_contains($clean, $p9)) {
                    $this->lastResult = $row;
                    return true;
                }
            }
            $this->lastResult = null;
            return true;
        }

        // Search Contracts
        if (str_contains($sql, 'FROM contracts')) {
            if (str_contains($sql, 'SELECT status FROM contracts')) {
                // Lookup contract status by CPF or Phone
                $this->lastResult = ['status' => 'SIGNED'];
                return true;
            }
            $p8 = str_replace('%', '', $params[':p8'] ?? '');
            $p9 = str_replace('%', '', $params[':p9'] ?? '');
            foreach ($this->pdo->contracts as $row) {
                $clean = preg_replace('/\D/', '', $row['client_phone']);
                if (str_contains($clean, $p8) || str_contains($clean, $p9)) {
                    $this->lastResult = $row;
                    return true;
                }
            }
            $this->lastResult = null;
            return true;
        }

        // Search Onboarding
        if (str_contains($sql, 'FROM licenciada_onboarding_requests')) {
            $p8 = str_replace('%', '', $params[':p8'] ?? '');
            $p9 = str_replace('%', '', $params[':p9'] ?? '');
            foreach ($this->pdo->onboarding as $row) {
                $clean = preg_replace('/\D/', '', $row['whatsapp']);
                if (str_contains($clean, $p8) || str_contains($clean, $p9)) {
                    $this->lastResult = $row;
                    return true;
                }
            }
            $this->lastResult = null;
            return true;
        }

        // Search Shop Leads
        if (str_contains($sql, 'FROM shop_leads')) {
            $p8 = str_replace('%', '', $params[':p8'] ?? '');
            $p9 = str_replace('%', '', $params[':p9'] ?? '');
            foreach ($this->pdo->shopLeads as $row) {
                $clean = preg_replace('/\D/', '', $row['whatsapp']);
                if (str_contains($clean, $p8) || str_contains($clean, $p9)) {
                    $this->lastResult = $row;
                    return true;
                }
            }
            $this->lastResult = null;
            return true;
        }

        $this->lastResult = null;
        return true;
    }

    public function fetch(int $mode = PDO::FETCH_ASSOC) {
        return $this->lastResult ?: false;
    }

    public function fetchColumn() {
        if ($this->lastResult && isset($this->lastResult['status'])) {
            return $this->lastResult['status'];
        }
        return false;
    }
}

// Instantiate Service with Mock PDO
$mockDb = new MockPDOCrmBridge();
$service = new CrmBridgeService($mockDb, 'mock', 'test_token', 1);

// -----------------------------------------------------------------------------
// TEST 1: Phone Normalization Engine
// -----------------------------------------------------------------------------
echo ">> [1/7] Testing Phone Normalization Engine...\n";
$norm1 = $service->normalizePhone('+55 (18) 99695-9486');
assertTest('Removes +55 DDI prefix cleanly', $norm1['digits_no_55'] === '18996959486');
assertTest('Extracts last 8 digits correctly', $norm1['last8'] === '96959486');
assertTest('Extracts last 9 digits correctly', $norm1['last9'] === '996959486');
assertTest('Extracts DDD correctly', $norm1['ddd'] === '18');

// -----------------------------------------------------------------------------
// TEST 2: Auto-Matching Licenciada (Mestre & 9º Dígito Resilience)
// -----------------------------------------------------------------------------
echo "\n>> [2/7] Testing Auto-Matching Licenciada & 9º Dígito...\n";
$resLic = $service->resolveContactByPhone('+55 18 99695-9486');
assertTest('Matches Dra. Josi Silva (Com +55 e 9º dígito)', $resLic['matched'] === true);
assertTest('Identifies type as LICENCIADA', $resLic['tipo_usuario'] === 'LICENCIADA');
assertTest('Retrieves official CPF', $resLic['cpf'] === '36208232864');
assertTest('Formats Location (Assis / SP)', $resLic['cidade_uf'] === 'Assis / SP');

$resLicNo9 = $service->resolveContactByPhone('1896959486'); // Sem o 9º dígito
assertTest('Matches Dra. Josi Silva (Sem o 9º dígito / 8 dígitos)', $resLicNo9['matched'] === true);


// -----------------------------------------------------------------------------
// TEST 3: Auto-Matching Aluna / Contrato
// -----------------------------------------------------------------------------
echo "\n>> [3/7] Testing Auto-Matching Aluna / Contratos...\n";
$resAluna = $service->resolveContactByPhone('(11) 98888-7777');
assertTest('Matches Camila Santos', $resAluna['matched'] === true);
assertTest('Identifies type as ALUNA', $resAluna['tipo_usuario'] === 'ALUNA');
assertTest('Retrieves Contract Status (SIGNED)', $resAluna['status_contrato'] === 'SIGNED');

// -----------------------------------------------------------------------------
// TEST 4: Auto-Matching Onboarding Request
// -----------------------------------------------------------------------------
echo "\n>> [4/7] Testing Auto-Matching Onboarding Funnel...\n";
$resOnb = $service->resolveContactByPhone('55 21 97777-6666');
assertTest('Matches Renata Oliveira', $resOnb['matched'] === true);
assertTest('Identifies type as ONBOARDING', $resOnb['tipo_usuario'] === 'ONBOARDING');
assertTest('Retrieves Onboarding Status (EM_ANALISE)', $resOnb['status_contrato'] === 'EM_ANALISE');

// -----------------------------------------------------------------------------
// TEST 5: Auto-Matching Shop Leads
// -----------------------------------------------------------------------------
echo "\n>> [5/7] Testing Auto-Matching Shop Leads...\n";
$resLead = $service->resolveContactByPhone('31 96666-5555');
assertTest('Matches Mariana Costa', $resLead['matched'] === true);
assertTest('Identifies type as LEAD', $resLead['tipo_usuario'] === 'LEAD');

// -----------------------------------------------------------------------------
// TEST 6: Unknown Fallback Contact
// -----------------------------------------------------------------------------
echo "\n>> [6/7] Testing Fallback for Unknown Numbers...\n";
$resUnknown = $service->resolveContactByPhone('99 91111-2222');
assertTest('Returns matched = false for unknown', $resUnknown['matched'] === false);
assertTest('Identifies type as DESCONHECIDO', $resUnknown['tipo_usuario'] === 'DESCONHECIDO');

// -----------------------------------------------------------------------------
// TEST 7: Attribute Sync & Full Orchestration (resolveAndSync)
// -----------------------------------------------------------------------------
echo "\n>> [7/7] Testing Attribute Sync & Orchestration...\n";
$syncRes = $service->resolveAndSync(42, '+55 18 99695-9486');
assertTest('Full resolveAndSync returns success', $syncRes['success'] === true);
assertTest('Sync payload contains custom_attributes', isset($syncRes['sync']['synced_attributes']['custom_attributes']));
assertTest('Custom attributes contain cpf, status_contrato, cidade_uf, tipo_usuario', 
    isset($syncRes['sync']['synced_attributes']['custom_attributes']['cpf']) &&
    isset($syncRes['sync']['synced_attributes']['custom_attributes']['status_contrato']) &&
    isset($syncRes['sync']['synced_attributes']['custom_attributes']['cidade_uf']) &&
    isset($syncRes['sync']['synced_attributes']['custom_attributes']['tipo_usuario'])
);

echo "\n===============================================================\n";
echo "  FINAL RESULT: {$passCount} PASSED / {$failCount} FAILED\n";
echo "===============================================================\n\n";

if ($failCount > 0) {
    exit(1);
}
exit(0);
