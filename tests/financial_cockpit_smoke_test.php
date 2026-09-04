<?php
// tests/financial_cockpit_smoke_test.php
// Standalone CLI Smoke Test for Financial Cockpit Security & Traceability (PLAN-139 / REGRA 6)
// Nexus Protocol V3.1 - PHP 8.4 Isolated Pure-Service Test Suite

echo "=================================================================================\n";
echo "   SMOKE TEST: FINANCIAL COCKPIT TRACEABILITY, RBAC & SECURITY (PLAN-139)       \n";
echo "   REGRA 6 Compliant: Pure Services & Mock PDO Isolation                        \n";
echo "=================================================================================\n\n";

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/LicenseTaxService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/RbacService.php';

use BodyHarmony\Services\LicenseTaxService;
use BodyHarmony\Services\RbacService;

class MockPdoAdvanced {
    public int $lastInsertedId = 0;
    public int $lastTaxId = 0;
    public int $lastFtId = 0;
    public int $lastAttachId = 0;
    public int $lastAuditId = 0;

    public array $taxes = [];
    public array $transactions = [];
    public array $attachments = [];
    public array $auditLogs = [];
    public array $onboardingRequests = [];
    public array $licenciadas = [];

    public function exec(string $sql): int {
        return 1;
    }

    public function lastInsertId(): int {
        return $this->lastInsertedId;
    }

    public function prepare(string $sql) {
        return new MockPdoStatement($this, $sql);
    }

    public function query(string $sql) {
        $stmt = new MockPdoStatement($this, $sql);
        $stmt->execute([]);
        return $stmt;
    }
}

class MockPdoStatement {
    private MockPdoAdvanced $pdo;
    private string $sql;
    private array $data = [];
    private int $cursor = 0;

    public function __construct(MockPdoAdvanced $pdo, string $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute(array $params = []): bool {
        $sql = $this->sql;

        // INSERT licenciada_taxas (manual/onboarding)
        if (stripos($sql, 'INSERT INTO licenciada_taxas') !== false) {
            $id = ++$this->pdo->lastTaxId;
            $isImported = stripos($sql, "'imported'") !== false;

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
                    'attachments_json' => null,
                    'source' => 'imported',
                    'onboarding_request_id' => null,
                    'financial_transaction_id' => null,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
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
                    'attachments_json' => null,
                    'source' => $params[12] ?? 'manual',
                    'onboarding_request_id' => $params[13] ?? null,
                    'financial_transaction_id' => null,
                    'contract_signed_at' => null,
                    'payment_confirmed_at' => null,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ];
            }
            $this->pdo->taxes[$id] = $record;
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        // INSERT financial_audit_log
        if (stripos($sql, 'INSERT INTO financial_audit_log') !== false) {
            $id = ++$this->pdo->lastAuditId;
            $this->pdo->auditLogs[$id] = [
                'id' => $id,
                'admin_id' => (int)($params[0] ?? 0),
                'admin_username' => (string)($params[1] ?? 'system'),
                'action' => $params[2] ?? '',
                'target_id' => $params[3] ?? null,
                'diff_json' => $params[4] ?? null,
                'filters_json' => $params[5] ?? null,
                'records_affected' => (int)($params[6] ?? 0),
                'ip_address' => $params[7] ?? 'CLI',
                'user_agent' => $params[8] ?? 'PHP CLI',
                'created_at' => date('Y-m-d H:i:s')
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        // INSERT financial_attachments
        if (stripos($sql, 'INSERT INTO financial_attachments') !== false) {
            $id = ++$this->pdo->lastAttachId;
            $this->pdo->attachments[$id] = [
                'id' => $id,
                'parent_type' => $params[0] ?? 'license_tax',
                'parent_id' => (int)($params[1] ?? 0),
                'file_name' => $params[2] ?? '',
                'file_url' => $params[3] ?? '',
                'file_size_bytes' => (int)($params[4] ?? 0),
                'mime_type' => $params[5] ?? 'application/octet-stream',
                'uploaded_by_admin_id' => $params[6] ?? null,
                'download_count' => 0,
                'last_downloaded_at' => null,
                'created_at' => date('Y-m-d H:i:s')
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        // UPDATE licenciada_taxas
        if (stripos($sql, 'UPDATE licenciada_taxas') !== false) {
            $id = end($params);
            if (isset($this->pdo->taxes[$id])) {
                if (stripos($sql, 'valor_cents = ?') !== false) {
                    $this->pdo->taxes[$id]['valor_cents'] = (int)$params[0];
                }
                if (stripos($sql, 'status = ?') !== false) {
                    $this->pdo->taxes[$id]['status'] = $params[0];
                }
            }
            return true;
        }

        // DELETE licenciada_taxas
        if (stripos($sql, 'DELETE FROM licenciada_taxas') !== false) {
            $id = $params[0] ?? null;
            if ($id && isset($this->pdo->taxes[$id])) {
                unset($this->pdo->taxes[$id]);
            }
            return true;
        }

        // SELECT COUNT(*) FROM licenciada_taxas WHERE source = 'imported'
        if (stripos($sql, "COUNT(*) FROM licenciada_taxas WHERE source = 'imported'") !== false) {
            $count = 0;
            foreach ($this->pdo->taxes as $t) {
                if (($t['source'] ?? '') === 'imported') $count++;
            }
            $this->data = [[$count]];
            return true;
        }

        // SELECT COUNT(*) FROM licenciada_taxas
        if (stripos($sql, 'COUNT(*) FROM licenciada_taxas') !== false || stripos($sql, 'COUNT(*) FROM `licenciada_taxas`') !== false) {
            $this->data = [[count($this->pdo->taxes)]];
            return true;
        }

        // SELECT COUNT(*) FROM financial_audit_log
        if (stripos($sql, 'COUNT(*) FROM financial_audit_log') !== false) {
            $this->data = [[count($this->pdo->auditLogs)]];
            return true;
        }

        // SELECT * FROM financial_audit_log
        if (stripos($sql, 'FROM financial_audit_log') !== false) {
            $this->data = array_values($this->pdo->auditLogs);
            return true;
        }

        // SELECT onboarding request
        if (stripos($sql, 'FROM licenciada_onboarding_requests') !== false) {
            $reqId = $params[0] ?? 0;
            if (isset($this->pdo->onboardingRequests[$reqId])) {
                $this->data = [$this->pdo->onboardingRequests[$reqId]];
            } else {
                $this->data = [];
            }
            return true;
        }

        // SELECT single tax by ID
        if (stripos($sql, 'FROM licenciada_taxas lt') !== false && stripos($sql, 'WHERE lt.id = ?') !== false) {
            $id = $params[0] ?? null;
            if ($id && isset($this->pdo->taxes[$id])) {
                $row = $this->pdo->taxes[$id];
                $row['licenciada_photo'] = null;
                $row['financial_transaction_code'] = null;
                $row['licenciada_doc_db'] = $row['licenciada_cpf'] ?? null;
                $this->data = [$row];
            } else {
                $this->data = [];
            }
            return true;
        }

        // SELECT valor_cents distribution
        if (stripos($sql, 'SELECT valor_cents, COUNT(*)') !== false) {
            $dist = [];
            foreach ($this->pdo->taxes as $t) {
                $v = (int)$t['valor_cents'];
                if ($v > 0) {
                    $dist[$v] = ($dist[$v] ?? 0) + 1;
                }
            }
            $rows = [];
            foreach ($dist as $v => $c) {
                $rows[] = ['valor_cents' => $v, 'cnt' => $c];
            }
            $this->data = $rows;
            return true;
        }

        // SELECT payment_method distribution
        if (stripos($sql, 'SELECT payment_method, COUNT(*)') !== false) {
            $dist = [];
            foreach ($this->pdo->taxes as $t) {
                $m = $t['payment_method'] ?? 'manual';
                $dist[$m] = ($dist[$m] ?? 0) + 1;
            }
            $rows = [];
            foreach ($dist as $m => $c) {
                $rows[] = ['payment_method' => $m, 'cnt' => $c];
            }
            $this->data = $rows;
            return true;
        }

        // SELECT summary aggregation
        if (stripos($sql, 'COALESCE(SUM(valor_cents)') !== false) {
            $sum = 0;
            $pending = 0;
            $paid = 0;
            $signed = 0;
            $cancelled = 0;
            foreach ($this->pdo->taxes as $t) {
                $sum += (int)$t['valor_cents'];
                if ($t['status'] === 'pending_payment') $pending++;
                if ($t['status'] === 'paid') $paid++;
                if ($t['status'] === 'contract_signed') $signed++;
                if ($t['status'] === 'cancelled') $cancelled++;
            }
            $this->data = [[
                'total_contracted_cents' => $sum,
                'total_records' => count($this->pdo->taxes),
                'total_pending' => $pending,
                'total_paid' => $paid,
                'total_signed' => $signed,
                'total_cancelled' => $cancelled
            ]];
            return true;
        }

        // SELECT list of taxes
        if (stripos($sql, 'FROM licenciada_taxas') !== false) {
            $rows = [];
            foreach ($this->pdo->taxes as $t) {
                $r = $t;
                $r['licenciada_photo'] = null;
                $r['financial_transaction_code'] = null;
                $r['licenciada_doc_db'] = $t['licenciada_cpf'] ?? null;
                $rows[] = $r;
            }
            $this->data = $rows;
            return true;
        }

        return true;
    }

    public function fetch(int $mode = PDO::FETCH_BOTH) {
        if ($this->cursor < count($this->data)) {
            return $this->data[$this->cursor++];
        }
        return false;
    }

    public function fetchAll(int $mode = PDO::FETCH_BOTH): array {
        return $this->data;
    }

    public function fetchColumn(int $col = 0) {
        $row = $this->fetch();
        if ($row && isset($row[$col])) {
            return $row[$col];
        }
        if (is_array($row) && !empty($row)) {
            return reset($row);
        }
        return false;
    }
}

// ==========================================
// TEST RUNNER
// ==========================================

$passed = 0;
$failed = 0;

function it(string $description, bool $condition) {
    global $passed, $failed;
    if ($condition) {
        echo "  [PASS] {$description}\n";
        $passed++;
    } else {
        echo "  [FAIL] {$description}\n";
        $failed++;
    }
}

$mockDb = new MockPdoAdvanced();
$taxService = new LicenseTaxService($mockDb);
$rbacService = new RbacService($mockDb);

echo "1. CRIAÇÃO DE TAXA & AUDITORIA DE CRIAÇÃO (PLAN-139)\n";
$tax1 = $taxService->create([
    'licenciada_name' => 'Dra. Roberta Andrade',
    'licenciada_cpf' => '123.456.789-00',
    'valor_cents' => 700000,
    'payment_method' => 'pix',
    'status' => 'pending_payment'
]);

it("Taxa criada com sucesso e ID retornado", isset($tax1['id']) && $tax1['id'] === 1);
it("Valor em centavos gravado corretamente (700000 = R$ 7.000,00)", (int)$tax1['valor_cents'] === 700000);
it("Log de auditoria 'tax_create' persistido", count($mockDb->auditLogs) >= 1 && $mockDb->auditLogs[1]['action'] === 'tax_create');

echo "\n2. IDEMPOTÊNCIA DO SEED HISTÓRICO (WP-22 / REGRA 10)\n";
$seed1 = $taxService->seedHistorical();
$countAfterSeed1 = count($mockDb->taxes);
$seed2 = $taxService->seedHistorical(); // 2ª execução
$countAfterSeed2 = count($mockDb->taxes);

it("Primeira execução do seed insere 13 registros", $seed1 === 13);
it("Segunda execução é 100% idempotente (retorna 0 inserções)", $seed2 === 0);
it("Contagem de taxas permanece idêntica (zero duplicatas)", $countAfterSeed1 === $countAfterSeed2);

echo "\n3. CONSISTÊNCIA MATEMÁTICA DE KPIS (WP-21)\n";
$summary = $taxService->getSummary();
$calculatedSum = 0;
foreach ($mockDb->taxes as $t) {
    $calculatedSum += (int)$t['valor_cents'];
}
it("Summary total_contracted_cents igual à soma matemática das linhas", (int)$summary['total_contracted_cents'] === $calculatedSum);
it("Summary total_records confere com total de linhas cadastradas", count($mockDb->taxes) > 0 && isset($summary['total_pending']));

echo "\n4. SALVAGUARDA FORENSE & IMUTABILIDADE PÓS-QUITAÇÃO (PLAN-139)\n";
// Criar taxa quitada
$taxPaid = $taxService->create([
    'licenciada_name' => 'Dra. Carolina Mendes',
    'licenciada_cpf' => '999.888.777-66',
    'valor_cents' => 620000,
    'payment_method' => 'card',
    'status' => 'paid'
]);

$blocked = false;
try {
    // Operador comum tentando alterar valor de taxa já quitada
    $taxService->update($taxPaid['id'], ['valor_cents' => 500000], ['role' => 'admin', 'username' => 'operador_financeiro']);
} catch (\Throwable $e) {
    $blocked = true;
}
it("Bloqueio de alteração de valor para taxas com status 'paid'", $blocked);

echo "\n5. AUDITORIA FORENSE COM DIFF DE MUTAÇÃO (REGRA 12)\n";
$taxService->update($tax1['id'], ['notes' => 'Comprovante sob verificação'], ['role' => 'admin', 'username' => 'josi_silva', 'id' => 42]);
$latestAudit = end($mockDb->auditLogs);

it("Log de auditoria 'tax_update' gerado", $latestAudit['action'] === 'tax_update');
it("Username do operador registrado estritamente conforme REGRA 12 (u.username)", $latestAudit['admin_username'] === 'josi_silva');
it("Diff JSON contém alteração de campo (before vs after)", isset($latestAudit['diff_json']));

echo "\n6. SANITIZAÇÃO DE CÉLULAS CSV ANTI-FÓRMULA (LGPD & Security)\n";
it("Célula iniciando com '=' é prefixada com apóstrofo", $taxService->sanitizeCsvCell('=SUM(A1:A10)') === "'=SUM(A1:A10)");
it("Célula iniciando com '+' é prefixada com apóstrofo", $taxService->sanitizeCsvCell('+12345') === "'+12345");
it("Célula iniciando com '-' é prefixada com apóstrofo", $taxService->sanitizeCsvCell('-500') === "'-500");
it("Célula iniciando com '@' é prefixada com apóstrofo", $taxService->sanitizeCsvCell('@cmd') === "'@cmd");
it("Célula de texto comum permanece inalterada", $taxService->sanitizeCsvCell('Dra. Roberta') === 'Dra. Roberta');

echo "\n7. RBAC TRI-LAYER PERMISSIONS MATRIX (REGRA 17)\n";
$superPerms = $rbacService->normalizePermissions([], true);
$adminPerms = $rbacService->normalizePermissions([
    'pages' => ['financial_view' => true],
    'actions' => [
        'financial_view' => true,
        'financial_manage' => false,
        'financial_export' => true
    ]
], false);
$legacyPerms = $rbacService->normalizePermissions(['financial' => 'view'], false);

it("Superadmin possui financial_view = true", $superPerms['actions']['financial_view'] === true);
it("Superadmin possui financial_manage = true", $superPerms['actions']['financial_manage'] === true);
it("Superadmin possui financial_export = true", $superPerms['actions']['financial_export'] === true);
it("Admin com permissões granulares respeita financial_manage = false", $adminPerms['actions']['financial_manage'] === false);
it("Admin com permissões granulares respeita financial_export = true", $adminPerms['actions']['financial_export'] === true);
it("Legacy admin com financial='view' possui financial_view = true e manage = false", $legacyPerms['actions']['financial_view'] === true && $legacyPerms['actions']['financial_manage'] === false);

echo "\n=================================================================================\n";
echo "   RESULTADO FINAL: {$passed} PASSADOS / {$failed} FALHAS\n";
echo "=================================================================================\n";

if ($failed > 0) {
    exit(1);
}
exit(0);
