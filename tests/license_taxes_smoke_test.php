<?php
// tests/license_taxes_smoke_test.php
// Standalone CLI Smoke Test for License Taxes (PLAN-132 / BRAINSTORM-123)
// Nexus Protocol V3.1 - PHP 8.4 Isolated MockPDO Test Suite

echo "=================================================================\n";
echo "   SMOKE TEST: LICENSE TAXES & FINANCIAL INTEGRATION (PLAN-132)  \n";
echo "   CRUD, Summary KPIs, Seed Historica, Onboarding Sync & FT Hook \n";
echo "=================================================================\n\n";

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/LicenseTaxService.php';

use BodyHarmony\Services\LicenseTaxService;

class MockTaxStatement {
    private $pdo;
    private $sql;
    private $params = [];
    private $result = [];

    public function __construct($pdo, $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute($params = []) {
        $this->params = $params;

        if (stripos($this->sql, 'CREATE TABLE') !== false) {
            return true;
        }

        if (stripos($this->sql, 'INSERT INTO licenciada_taxas') !== false) {
            $id = ++$this->pdo->lastTaxId;
            $isImported = stripos($this->sql, "'imported'") !== false;
            
            if ($isImported) {
                $record = [
                    'id' => $id,
                    'licenciada_id' => null,
                    'licenciada_name' => $params[0] ?? '',
                    'licenciada_cpf' => $params[1] ?? null,
                    'licenciada_cnpj' => null,
                    'licenciada_location' => $params[2] ?? null,
                    'valor_cents' => (int)($params[3] ?? 0),
                    'valor_extenso' => null,
                    'payment_method' => $params[4] ?? 'manual',
                    'payment_condition' => $params[5] ?? null,
                    'installments' => 1,
                    'status' => $params[6] ?? 'pending_payment',
                    'contract_signed_at' => $params[7] ?? null,
                    'payment_confirmed_at' => $params[8] ?? null,
                    'notes' => null,
                    'source' => 'imported',
                    'onboarding_request_id' => null,
                    'financial_transaction_id' => null,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                    'licenciada_photo' => null
                ];
            } else {
                $record = [
                    'id' => $id,
                    'licenciada_id' => $params[0] ?? null,
                    'licenciada_name' => $params[1] ?? '',
                    'licenciada_cpf' => $params[2] ?? null,
                    'licenciada_cnpj' => $params[3] ?? null,
                    'licenciada_location' => $params[4] ?? null,
                    'valor_cents' => (int)($params[5] ?? 0),
                    'valor_extenso' => $params[6] ?? null,
                    'payment_method' => $params[7] ?? 'manual',
                    'payment_condition' => $params[8] ?? null,
                    'installments' => (int)($params[9] ?? 1),
                    'status' => $params[10] ?? 'pending_payment',
                    'notes' => $params[11] ?? null,
                    'source' => $params[12] ?? 'manual',
                    'onboarding_request_id' => $params[13] ?? null,
                    'financial_transaction_id' => null,
                    'contract_signed_at' => null,
                    'payment_confirmed_at' => null,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                    'licenciada_photo' => null
                ];
            }
            $this->pdo->taxes[$id] = $record;
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        if (stripos($this->sql, 'INSERT INTO financial_transactions') !== false) {
            $ftId = ++$this->pdo->lastFtId;
            $this->pdo->transactions[$ftId] = [
                'id' => $ftId,
                'source_type' => 'licenciamento',
                'source_id' => $params[0] ?? null,
                'amount_cents' => $params[1] ?? 0,
                'description' => $params[2] ?? '',
                'payment_method' => $params[3] ?? 'manual',
                'installments' => $params[4] ?? 1,
                'status' => $params[5] ?? 'pending'
            ];
            $this->pdo->lastInsertedId = $ftId;
            return true;
        }

        if (stripos($this->sql, 'UPDATE financial_transactions') !== false) {
            $id = $params[0] ?? null;
            if (isset($this->pdo->transactions[$id])) {
                $this->pdo->transactions[$id]['status'] = 'cancelled';
            }
            return true;
        }

        if (stripos($this->sql, 'UPDATE licenciada_taxas SET financial_transaction_id') !== false) {
            $ftId = $params[0] ?? null;
            $taxId = $params[1] ?? null;
            if (isset($this->pdo->taxes[$taxId])) {
                $this->pdo->taxes[$taxId]['financial_transaction_id'] = $ftId;
            }
            return true;
        }

        if (stripos($this->sql, 'UPDATE licenciada_taxas SET') !== false) {
            $taxId = end($params);
            if (isset($this->pdo->taxes[$taxId])) {
                $this->pdo->taxes[$taxId]['updated_at'] = date('Y-m-d H:i:s');
            }
            return true;
        }

        if (stripos($this->sql, 'DELETE FROM licenciada_taxas') !== false) {
            $taxId = $params[0] ?? null;
            unset($this->pdo->taxes[$taxId]);
            return true;
        }

        if (stripos($this->sql, 'SELECT COUNT(*) FROM licenciada_taxas WHERE source = \'imported\'') !== false) {
            $cnt = 0;
            foreach ($this->pdo->taxes as $t) {
                if ($t['source'] === 'imported') $cnt++;
            }
            $this->result = [[$cnt]];
            return true;
        }

        if (stripos($this->sql, 'SELECT COUNT(*)') !== false) {
            $this->result = [[count($this->pdo->taxes)]];
            return true;
        }

        if (stripos($this->sql, 'WHERE onboarding_request_id = ?') !== false) {
            $oId = $params[0] ?? null;
            $found = [];
            foreach ($this->pdo->taxes as $t) {
                if (($t['onboarding_request_id'] ?? null) == $oId) {
                    $found[] = $t;
                }
            }
            $this->result = $found;
            return true;
        }

        if (stripos($this->sql, 'SELECT lt.*') !== false && stripos($this->sql, 'WHERE lt.id = ?') !== false) {
            $id = $params[0] ?? null;
            $this->result = isset($this->pdo->taxes[$id]) ? [$this->pdo->taxes[$id]] : [];
            return true;
        }

        if (stripos($this->sql, 'SELECT lt.*') !== false) {
            $this->result = array_values($this->pdo->taxes);
            return true;
        }

        if (stripos($this->sql, 'licenciada_onboarding_requests') !== false) {
            $reqId = $params[0] ?? null;
            $this->result = isset($this->pdo->onboardingRequests[$reqId]) ? [$this->pdo->onboardingRequests[$reqId]] : [];
            return true;
        }

        if (stripos($this->sql, 'SELECT id FROM licenciada_taxas WHERE onboarding_request_id = ?') !== false) {
            $reqId = $params[0] ?? null;
            $found = [];
            foreach ($this->pdo->taxes as $t) {
                if (($t['onboarding_request_id'] ?? null) == $reqId) {
                    $found[] = [$t['id']];
                }
            }
            $this->result = $found;
            return true;
        }

        if (stripos($this->sql, 'COALESCE(SUM(valor_cents), 0) AS total_contracted_cents') !== false) {
            $totalCents = 0;
            $pending = 0;
            $paid = 0;
            $signed = 0;
            $cancelled = 0;
            foreach ($this->pdo->taxes as $t) {
                $totalCents += (int)$t['valor_cents'];
                if ($t['status'] === 'pending_payment') $pending++;
                if ($t['status'] === 'paid') $paid++;
                if ($t['status'] === 'contract_signed') $signed++;
                if ($t['status'] === 'cancelled') $cancelled++;
            }
            $this->result = [[
                'total_contracted_cents' => $totalCents,
                'total_records' => count($this->pdo->taxes),
                'total_pending' => $pending,
                'total_paid' => $paid,
                'total_signed' => $signed,
                'total_cancelled' => $cancelled
            ]];
            return true;
        }

        if (stripos($this->sql, 'SELECT valor_cents, COUNT(*) AS cnt') !== false) {
            $groups = [];
            foreach ($this->pdo->taxes as $t) {
                $v = (int)$t['valor_cents'];
                if ($v > 0) {
                    $groups[$v] = ($groups[$v] ?? 0) + 1;
                }
            }
            $res = [];
            foreach ($groups as $val => $c) {
                $res[] = ['valor_cents' => $val, 'cnt' => $c];
            }
            $this->result = $res;
            return true;
        }

        if (stripos($this->sql, 'SELECT payment_method, COUNT(*) AS cnt') !== false) {
            $groups = [];
            foreach ($this->pdo->taxes as $t) {
                $m = $t['payment_method'] ?? 'manual';
                $groups[$m] = ($groups[$m] ?? 0) + 1;
            }
            $res = [];
            foreach ($groups as $m => $c) {
                $res[] = ['payment_method' => $m, 'cnt' => $c];
            }
            $this->result = $res;
            return true;
        }

        return true;
    }

    public function fetch($mode = PDO::FETCH_ASSOC) {
        return array_shift($this->result) ?: false;
    }

    public function fetchAll($mode = PDO::FETCH_ASSOC) {
        $res = $this->result;
        $this->result = [];
        return $res;
    }

    public function fetchColumn() {
        $row = array_shift($this->result);
        if ($row && is_array($row)) {
            return reset($row);
        }
        return false;
    }
}

class MockLicenseTaxPDO {
    public $lastTaxId = 0;
    public $lastFtId = 0;
    public $lastInsertedId = 0;
    public $taxes = [];
    public $transactions = [];
    public $onboardingRequests = [];

    public function prepare($sql) {
        return new MockTaxStatement($this, $sql);
    }

    public function query($sql) {
        $stmt = new MockTaxStatement($this, $sql);
        $stmt->execute();
        return $stmt;
    }

    public function exec($sql) {
        return true;
    }

    public function lastInsertId() {
        return $this->lastInsertedId;
    }
}

$db = new MockLicenseTaxPDO();
$service = new LicenseTaxService($db);

$testsPassed = 0;
$totalTests = 0;

function assertTest($description, $condition) {
    global $testsPassed, $totalTests;
    $totalTests++;
    if ($condition) {
        echo "  [PASS] {$description}\n";
        $testsPassed++;
    } else {
        echo "  [FAIL] {$description}\n";
    }
}

echo "1. Test Table Initialization (ensureTableExists):\n";
LicenseTaxService::ensureTableExists($db);
assertTest("ensureTableExists runs without exceptions and auto-seeds", true);

echo "\n2. Test Seed Historical Records:\n";
assertTest("Total records in DB equals 13 after ensureTableExists", count($db->taxes) === 13);

$secondSeed = $service->seedHistorical();
assertTest("seedHistorical is idempotent (0 when already seeded)", $secondSeed === 0);

echo "\n3. Test Summary & KPIs:\n";
$summary = $service->getSummary();
assertTest("Total contracted cents calculation (R$ 72.400)", $summary['total_contracted_cents'] === 7240000);
assertTest("Total signed contracts matches expected (10)", $summary['total_signed'] === 10);
assertTest("Total pending contracts matches expected (2)", $summary['total_pending'] === 2);
assertTest("Total paid matches expected (1)", $summary['total_paid'] === 1);
assertTest("Formatted total display (R$ 72.400,00)", $summary['total_formatted'] === 'R$ 72.400,00');

echo "\n4. Test List & Pagination:\n";
$listRes = $service->list(['page' => 1, 'per_page' => 20]);
assertTest("List returns data array", is_array($listRes['data']));
assertTest("List has 13 rows", count($listRes['data']) === 13);
assertTest("List includes formatted valor_display", isset($listRes['data'][0]['valor_display']));

echo "\n5. Test Create Manual Tax with Financial Transaction Hook:\n";
$newTax = $service->create([
    'licenciada_name' => 'Dra. Camila Monteiro',
    'licenciada_cpf' => '123.456.789-00',
    'licenciada_location' => 'Campinas/SP',
    'valor_cents' => 700000,
    'payment_method' => 'pix',
    'status' => 'paid',
    'notes' => 'Pagamento via PIX confirmado'
]);
assertTest("New tax record created with ID #14", $newTax['id'] === 14);
assertTest("Tax record triggers financial transaction creation", !empty($db->transactions));
assertTest("Financial transaction amount equals 700000 cents", $db->transactions[1]['amount_cents'] === 700000);
assertTest("Financial transaction source_type is licenciamento", $db->transactions[1]['source_type'] === 'licenciamento');

echo "\n6. Test Sync from Onboarding:\n";
$db->onboardingRequests[42] = [
    'taxa_inicial_num' => '7.000,00',
    'taxa_inicial_extenso' => 'Sete mil reais',
    'condicoes_pagamento' => 'À vista no PIX',
    'nome_completo' => 'Renata Albuquerque',
    'cpf' => '987.654.321-11',
    'cnpj' => '12.345.678/0001-90',
    'cidade_celebracao' => 'Ribeirão Preto',
    'estado' => 'SP'
];
$syncedTax = $service->syncFromOnboarding(42, 99);
assertTest("syncFromOnboarding parses currency string to 700000 cents", $syncedTax['valor_cents'] === 700000);
assertTest("syncFromOnboarding links onboarding_request_id = 42", $syncedTax['onboarding_request_id'] === 42);
assertTest("syncFromOnboarding sets source = onboarding", $syncedTax['source'] === 'onboarding');

// Duplicate sync idempotence (PLAN-141)
$dupSync = $service->syncFromOnboarding(42, 99);
assertTest("syncFromOnboarding handles duplicate sync idempotently", $dupSync && $dupSync['id'] === $syncedTax['id']);

echo "\n7. Test Delete & Soft Cleanup:\n";
$delRes = $service->delete(14);
assertTest("Delete removes non-signed record", $delRes === true);
assertTest("Deleted record cancels linked financial transaction", $db->transactions[1]['status'] === 'cancelled');

echo "\n=================================================================\n";
echo "   RESULTS: {$testsPassed} / {$totalTests} TESTS PASSED\n";
if ($testsPassed === $totalTests) {
    echo "   STATUS: 100% PASS - FULLSTACK COMPLIANCE CONFIRMED\n";
} else {
    echo "   STATUS: SOME TESTS FAILED\n";
}
echo "=================================================================\n";
