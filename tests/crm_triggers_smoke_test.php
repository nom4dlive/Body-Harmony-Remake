<?php
/**
 * ==============================================================================
 * SMOKE TEST: CRM EMBED DOSSIER & REACTIVE TRIGGERS (PLAN-154 & PLAN-155)
 * ==============================================================================
 * Nexus Protocol V3.1 — REGRA 6 Compliant: Pure Services & Mock Isolation.
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
echo "  TEST SUITE: CRM EMBED DOSSIER & TRIGGERS (PLAN-154 / PLAN-155)\n";
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
 * Mock PDO Provider for Triggers & Dossier Testing
 */
class MockPDOTiggers {
    public array $licenciadas = [];
    public array $contracts = [];
    public array $taxas = [];

    public function __construct() {
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

        $this->contracts = [
            [
                'id' => 101,
                'contract_number' => 'BH-LIC-2026-001',
                'client_name' => 'Camila Santos',
                'client_document' => '12345678900',
                'client_phone' => '11988887777',
                'client_email' => 'camila@email.com',
                'client_city' => 'São Paulo',
                'client_state' => 'SP',
                'status' => 'SIGNED',
                'pdf_url' => 'https://bodyharmony.com.br/contracts/bh-lic-001.pdf',
                'sign_token' => 'tok_sign_12345'
            ]
        ];

        $this->taxas = [
            ['id' => 1, 'licenciada_id' => 1, 'status' => 'paid'],
            ['id' => 2, 'licenciada_id' => 1, 'status' => 'paid']
        ];
    }

    public function prepare(string $sql) {
        return new MockStmtTriggers($this, $sql);
    }
}

class MockStmtTriggers {
    private MockPDOTiggers $pdo;
    private string $sql;
    private ?array $lastResult = null;

    public function __construct(MockPDOTiggers $pdo, string $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute(array $params = []): bool {
        $sql = $this->sql;

        if (str_contains($sql, 'FROM licenciadas')) {
            $p8 = str_replace('%', '', $params[':p8'] ?? '');
            $p9 = str_replace('%', '', $params[':p9'] ?? '');
            $pFull = str_replace('%', '', $params[':full'] ?? '');
            foreach ($this->pdo->licenciadas as $row) {
                $clean = preg_replace('/\D/', '', $row['whatsapp']);
                if (str_contains($clean, $p8) || str_contains($clean, $p9) || str_contains($clean, $pFull)) {
                    $this->lastResult = $row;
                    return true;
                }
            }
            $this->lastResult = null;
            return true;
        }

        if (str_contains($sql, 'FROM contracts')) {
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

        if (str_contains($sql, 'FROM licenciada_taxas')) {
            $this->lastResult = ['total_taxas' => 2, 'taxas_pagas' => 2];
            return true;
        }

        $this->lastResult = null;
        return true;
    }

    public function fetch(int $mode = PDO::FETCH_ASSOC) {
        return $this->lastResult ?: false;
    }

    public function fetchColumn() {
        return false;
    }
}

$mockDb = new MockPDOTiggers();
$service = new CrmBridgeService($mockDb, 'mock', 'test_token', 1, 'mock', 'test_evo_key');

// -----------------------------------------------------------------------------
// TEST 1: Dossiê 360 Embed Generation (Licenciada)
// -----------------------------------------------------------------------------
echo ">> [1/5] Testing Dossiê 360 Embed Generation for Licenciada...\n";
$dossierLic = $service->getDossierByPhone('+55 (18) 99695-9486');
assertTest('Generates dossier with matched = true', $dossierLic['matched'] === true);
assertTest('Identifies user type as LICENCIADA', $dossierLic['tipo_usuario'] === 'LICENCIADA');
assertTest('Contains CPF: 36208232864', ($dossierLic['data']['cpf'] ?? '') === '36208232864');
assertTest('Contains Financial Summary (EM_DIA)', ($dossierLic['data']['financial_summary']['status_financeiro'] ?? '') === 'EM_DIA');

// -----------------------------------------------------------------------------
// TEST 2: Dossiê 360 Embed Generation (Aluna / Contratos)
// -----------------------------------------------------------------------------
echo "\n>> [2/5] Testing Dossiê 360 Embed Generation for Aluna...\n";
$dossierAluna = $service->getDossierByPhone('11988887777');
assertTest('Generates dossier for Aluna with matched = true', $dossierAluna['matched'] === true);
assertTest('Identifies user type as ALUNA', $dossierAluna['tipo_usuario'] === 'ALUNA');
assertTest('Contains Sign URL', !empty($dossierAluna['data']['sign_url']));
assertTest('Contains Contract PDF URL', !empty($dossierAluna['data']['contract_pdf_url']));

// -----------------------------------------------------------------------------
// TEST 3: Gatilho 1 — Emissão de Contrato (WhatsApp Jurídico)
// -----------------------------------------------------------------------------
echo "\n>> [3/5] Testing Gatilho 1: Emissão de Contrato (inst_juridico)...\n";
$trigger1 = $service->triggerContractIssuance(
    '+55 (18) 99695-9486',
    'Dra. Joselene Silva',
    'https://bodyharmony.com.br/assinar/bh-lic-test',
    'mock'
);
assertTest('Trigger 1 executes with dispatched = true', $trigger1['dispatched'] === true);
assertTest('Trigger 1 returns success = true', $trigger1['success'] === true);
assertTest('Routes via instance "inst_juridico"', $trigger1['instance'] === 'inst_juridico');
assertTest('Message contains candidate name', str_contains($trigger1['api_result']['message'] ?? '', 'Dra. Joselene Silva'));
assertTest('Message contains sign URL', str_contains($trigger1['api_result']['message'] ?? '', 'https://bodyharmony.com.br/assinar/bh-lic-test'));

// -----------------------------------------------------------------------------
// TEST 4: Gatilho 2 — Mentoria Agendada (WhatsApp Licenciadas)
// -----------------------------------------------------------------------------
echo "\n>> [4/5] Testing Gatilho 2: Lembrete de Mentoria (inst_licenciadas)...\n";
$trigger2 = $service->triggerMentorshipReminder(
    '+55 (18) 99695-9486',
    'Dra. Joselene Silva',
    'Hoje às 19:00',
    'https://meet.google.com/bh-mentoria-room',
    'mock'
);
assertTest('Trigger 2 executes with scheduled = true', $trigger2['scheduled'] === true);
assertTest('Trigger 2 returns success = true', $trigger2['success'] === true);
assertTest('Routes via instance "inst_licenciadas"', $trigger2['instance'] === 'inst_licenciadas');
assertTest('Message contains scheduled datetime', str_contains($trigger2['api_result']['message'] ?? '', 'Hoje às 19:00'));
assertTest('Message contains meeting link', str_contains($trigger2['api_result']['message'] ?? '', 'https://meet.google.com/bh-mentoria-room'));

// -----------------------------------------------------------------------------
// TEST 5: Tolerância a Falhas com WhatsApp Offline (Unreachable Host)
// -----------------------------------------------------------------------------
echo "\n>> [5/5] Testing Offline Evolution API Fault Tolerance...\n";
$offlineTrigger = $service->triggerContractNotification(
    '18996959486',
    'Dra. Joselene Silva',
    'https://bodyharmony.com.br/assinar/test',
    'http://127.0.0.1:9999' // Porta inexistente/offline
);
assertTest('Offline trigger does not throw fatal error', is_array($offlineTrigger));
assertTest('Offline trigger preserves dispatched = true', $offlineTrigger['dispatched'] === true);
assertTest('Offline trigger returns whatsapp_sent = false', $offlineTrigger['whatsapp_sent'] === false);

echo "\n===============================================================\n";
echo "  FINAL RESULT: {$passCount} PASSED / {$failCount} FAILED\n";
echo "===============================================================\n\n";

if ($failCount > 0) {
    exit(1);
}
exit(0);
