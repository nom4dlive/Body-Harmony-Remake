<?php
/**
 * ==============================================================================
 * SMOKE TEST: BURNER DISPATCH ENGINE & LEAD HANDOFF (PLAN-155 / BLOCO 5)
 * ==============================================================================
 * Nexus Protocol V3.1 — REGRA 6 Compliant: Pure Services & Mock Isolation.
 * Zero HTTP controllers or global header execution.
 * ==============================================================================
 */

if (file_exists(__DIR__ . '/../apps/web-app/src/backend/api/v1/Services/BurnerDispatchService.php')) {
    require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/BurnerDispatchService.php';
} elseif (file_exists(__DIR__ . '/BurnerDispatchService.php')) {
    require_once __DIR__ . '/BurnerDispatchService.php';
} else {
    require_once 'BurnerDispatchService.php';
}

use BodyHarmony\Services\BurnerDispatchService;

echo "\n===============================================================\n";
echo "  TEST SUITE: BURNER DISPATCH ENGINE (PLAN-155 / BLOCO 5)      \n";
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
 * Mock PDO Provider for Burner Lead Handoff
 */
class MockPDOBurner {
    public array $leads = [];
    private int $nextId = 100;

    public function prepare(string $sql) {
        return new MockStmtBurner($this, $sql);
    }

    public function lastInsertId(): int {
        return $this->nextId++;
    }
}

class MockStmtBurner {
    private MockPDOBurner $pdo;
    private string $sql;
    private ?array $lastResult = null;

    public function __construct(MockPDOBurner $pdo, string $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute(array $params = []): bool {
        $sql = $this->sql;

        if (str_contains($sql, 'SELECT id FROM shop_leads')) {
            $p = str_replace('%', '', $params[':phone'] ?? '');
            foreach ($this->pdo->leads as $lead) {
                if (str_contains($lead['whatsapp'], $p)) {
                    $this->lastResult = ['id' => $lead['id']];
                    return true;
                }
            }
            $this->lastResult = null;
            return true;
        }

        if (str_contains($sql, 'INSERT INTO shop_leads')) {
            $id = $this->pdo->lastInsertId();
            $this->pdo->leads[] = [
                'id' => $id,
                'name' => $params[':name'] ?? '',
                'whatsapp' => $params[':whatsapp'] ?? '',
                'status' => 'LEAD_QUENTE'
            ];
            return true;
        }

        if (str_contains($sql, 'UPDATE shop_leads')) {
            $id = $params[':id'] ?? 0;
            foreach ($this->pdo->leads as &$lead) {
                if ($lead['id'] == $id) {
                    $lead['status'] = 'LEAD_QUENTE';
                    if (!empty($params[':name'])) $lead['name'] = $params[':name'];
                }
            }
            return true;
        }

        $this->lastResult = null;
        return true;
    }

    public function fetchColumn() {
        return $this->lastResult['id'] ?? false;
    }
}

$mockDb = new MockPDOBurner();
$burnerPool = ['inst_burner_01', 'inst_burner_02', 'inst_burner_03'];
$service = new BurnerDispatchService($mockDb, null, $burnerPool, 'mock', 'test_evo_key', 'mock', 'test_token', 3);

// -----------------------------------------------------------------------------
// TEST 1: Spintax Engine
// -----------------------------------------------------------------------------
echo ">> [1/6] Testing Dynamic Spintax Parser...\n";
$template = "{Olá|Oi|Ei}, {Dra.|Doutora|} tudo bem? Temos uma {proposta|oportunidade} exclusiva.";
$parsed1 = $service->parseSpintax($template);
$parsed2 = $service->parseSpintax($template);
assertTest('Spintax resolves without curly braces', !str_contains($parsed1, '{') && !str_contains($parsed1, '}'));
assertTest('Spintax output 1 contains valid text', strlen($parsed1) > 15);
assertTest('Spintax output 2 contains valid text', strlen($parsed2) > 15);

// -----------------------------------------------------------------------------
// TEST 2: Anti-Ban Random Delays (30s to 70s)
// -----------------------------------------------------------------------------
echo "\n>> [2/6] Testing Anti-Ban Random Delays...\n";
$allDelaysValid = true;
for ($i = 0; $i < 20; $i++) {
    $delay = $service->calculateRandomDelay(30, 70);
    if ($delay < 30 || $delay > 70) {
        $allDelaysValid = false;
        break;
    }
}
assertTest('Calculates 20/20 random delays strictly between 30s and 70s', $allDelaysValid);

// -----------------------------------------------------------------------------
// TEST 3: Round-Robin Burner Rotation
// -----------------------------------------------------------------------------
echo "\n>> [3/6] Testing Round-Robin Rotation across Burner Pool...\n";
$inst1 = $service->getNextBurnerInstance();
$inst2 = $service->getNextBurnerInstance();
$inst3 = $service->getNextBurnerInstance();
$inst4 = $service->getNextBurnerInstance();

assertTest('First instance is inst_burner_01', $inst1 === 'inst_burner_01');
assertTest('Second instance is inst_burner_02', $inst2 === 'inst_burner_02');
assertTest('Third instance is inst_burner_03', $inst3 === 'inst_burner_03');
assertTest('Rotates back to inst_burner_01', $inst4 === 'inst_burner_01');

// -----------------------------------------------------------------------------
// TEST 4: Campaign Enqueueing
// -----------------------------------------------------------------------------
echo "\n>> [4/6] Testing Campaign Enqueueing...\n";
$recipients = ['11999990001', '11999990002', '11999990003', '11999990004'];
$campaign = $service->enqueueCampaign($recipients, "{Olá|Oi}! Convite para o Workshop Body Harmony.");
assertTest('Campaign enqueues 4 recipients', $campaign['total_queued'] === 4);
assertTest('Campaign calculates positive duration offset', $campaign['estimated_duration_seconds'] >= 120);
assertTest('Queue preview items contain rotated burner instances', 
    $campaign['queue_preview'][0]['instance'] !== $campaign['queue_preview'][1]['instance']);

// -----------------------------------------------------------------------------
// TEST 5: Single Message Dispatch
// -----------------------------------------------------------------------------
echo "\n>> [5/6] Testing Single Dispatch with Presence Simulation...\n";
$dispatch = $service->dispatchSingle('11999998888', "{Olá|Oi} Dra. Camila, tudo bem?", 'inst_burner_02', 'mock');
assertTest('Single dispatch executes with success = true', $dispatch['success'] === true);
assertTest('Uses designated instance inst_burner_02', $dispatch['instance'] === 'inst_burner_02');
assertTest('Includes typing presence simulation', $dispatch['typing_presence_ms'] >= 2000);

// -----------------------------------------------------------------------------
// TEST 6: Intelligent Lead Handoff to Commercial
// -----------------------------------------------------------------------------
echo "\n>> [6/6] Testing Burner Reply Handoff to Commercial Inbox...\n";
$handoff = $service->handleIncomingBurnerMessage(
    'inst_burner_01',
    '5511977778888',
    'Olá! Tenho interesse no método Body Harmony, como funciona?',
    'Dra. Mariana Costa',
    'mock'
);

assertTest('Handoff flags lead_created = true', $handoff['lead_created'] === true);
assertTest('Routes ticket to Commercial Inbox (ID: 3)', $handoff['commercial_inbox_id'] === 3);
assertTest('Assigns status ATRIBUIDO_COMERCIAL_KAPRICE', $handoff['ticket_status'] === 'ATRIBUIDO_COMERCIAL_KAPRICE');
assertTest('Includes tags lead-quente and origem-burner', 
    in_array('lead-quente', $handoff['chatwoot_handoff']['tags']) &&
    in_array('origem-burner', $handoff['chatwoot_handoff']['tags'])
);

echo "\n===============================================================\n";
echo "  FINAL RESULT: {$passCount} PASSED / {$failCount} FAILED\n";
echo "===============================================================\n\n";

if ($failCount > 0) {
    exit(1);
}
exit(0);
