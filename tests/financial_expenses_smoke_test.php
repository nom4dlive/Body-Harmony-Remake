<?php
/**
 * ==============================================================================
 * SMOKE TEST: FINANCIAL EXPENSES, 2-STAGE ONBOARDING & DRE EXPANDED (PLAN-141)
 * ==============================================================================
 * REGRA 6: PURE SERVICES & MOCK PDO ISOLATION (ZERO HTTP/AUTH HEADERS)
 * ==============================================================================
 */

echo "=================================================================================\n";
echo "   SMOKE TEST: FINANCIAL EXPENSES, ONBOARDING 2-STAGE & DRE EXPANDED (PLAN-141)  \n";
echo "   REGRA 6 Compliant: Pure Services & Mock PDO Isolation                        \n";
echo "=================================================================================\n\n";

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/LicenseTaxService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/FinancialService.php';

use BodyHarmony\Services\LicenseTaxService;
use BodyHarmony\Services\FinancialService;

class MockPdoExpenses {
    public int $lastInsertedId = 0;
    public int $lastTaxId = 0;
    public int $lastFtId = 0;
    public int $lastExpenseId = 0;
    public int $lastAttachId = 0;
    public int $lastAuditId = 0;

    public array $taxes = [];
    public array $transactions = [];
    public array $expenses = [];
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
        return new MockPdoExpensesStatement($this, $sql);
    }

    public function query(string $sql) {
        $stmt = new MockPdoExpensesStatement($this, $sql);
        $stmt->execute([]);
        return $stmt;
    }
}

class MockPdoExpensesStatement {
    private MockPdoExpenses $pdo;
    private string $sql;
    private array $data = [];
    private int $cursor = 0;

    public function __construct(MockPdoExpenses $pdo, string $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute(?array $params = null): bool {
        $sql = trim($this->sql);

        // ── INSERT INTO financial_transactions ──────────────────────────────
        if (stripos($sql, 'INSERT INTO financial_transactions') !== false) {
            $this->pdo->lastFtId++;
            $this->pdo->lastInsertedId = $this->pdo->lastFtId;

            if (stripos($sql, "'licenciamento'") !== false) {
                $record = [
                    'id' => $this->pdo->lastFtId,
                    'source_type' => 'licenciamento',
                    'source_id' => $params[0] ?? null,
                    'type' => 'revenue',
                    'amount_cents' => (int)($params[1] ?? 0),
                    'description' => $params[2] ?? '',
                    'category' => 'licenciamento',
                    'payment_method' => $params[3] ?? 'pix',
                    'status' => $params[5] ?? 'pending',
                    'created_at' => date('Y-m-d H:i:s')
                ];
            } else {
                $record = [
                    'id' => $this->pdo->lastFtId,
                    'source_type' => 'manual',
                    'source_id' => null,
                    'type' => 'expense',
                    'amount_cents' => (int)($params[0] ?? 0),
                    'description' => $params[1] ?? '',
                    'category' => $params[2] ?? 'outros',
                    'cost_center_id' => $params[3] ?? null,
                    'payment_method' => $params[4] ?? 'pix',
                    'status' => 'confirmed',
                    'created_at' => $params[5] ?? date('Y-m-d H:i:s')
                ];
            }

            $this->pdo->transactions[$this->pdo->lastFtId] = $record;
            return true;
        }

        // ── INSERT INTO financial_expenses ──────────────────────────────────
        if (stripos($sql, 'INSERT INTO financial_expenses') !== false) {
            $this->pdo->lastExpenseId++;
            $this->pdo->lastInsertedId = $this->pdo->lastExpenseId;
            $this->pdo->expenses[$this->pdo->lastExpenseId] = [
                'id' => $this->pdo->lastExpenseId,
                'cost_center_id' => $params[0] ?? null,
                'description' => $params[1] ?? '',
                'amount_cents' => (int)($params[2] ?? 0),
                'category' => $params[3] ?? '',
                'expense_date' => $params[4] ?? date('Y-m-d')
            ];
            return true;
        }

        // ── INSERT INTO licenciada_taxas ────────────────────────────────────
        if (stripos($sql, 'INSERT INTO licenciada_taxas') !== false) {
            $this->pdo->lastTaxId++;
            $this->pdo->lastInsertedId = $this->pdo->lastTaxId;
            $this->pdo->taxes[$this->pdo->lastTaxId] = [
                'id' => $this->pdo->lastTaxId,
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
                'source' => $params[11] ?? 'manual',
                'notes' => $params[12] ?? null,
                'onboarding_request_id' => $params[13] ?? null,
                'financial_transaction_id' => $params[14] ?? null
            ];
            return true;
        }

        // ── INSERT INTO financial_audit_log ─────────────────────────────────
        if (stripos($sql, 'INSERT INTO financial_audit_log') !== false) {
            $this->pdo->lastAuditId++;
            $this->pdo->auditLogs[] = [
                'id' => $this->pdo->lastAuditId,
                'action' => $params[0] ?? '',
                'target_type' => 'expense',
                'target_id' => $params[1] ?? 0,
                'admin_id' => $params[2] ?? 1,
                'admin_username' => $params[3] ?? '',
                'diff_json' => $params[4] ?? '{}',
                'ip_address' => $params[5] ?? '127.0.0.1',
                'created_at' => date('Y-m-d H:i:s')
            ];
            return true;
        }

        // ── INSERT INTO financial_attachments ───────────────────────────────
        if (stripos($sql, 'INSERT INTO financial_attachments') !== false) {
            $this->pdo->lastAttachId++;
            $this->pdo->attachments[] = [
                'id' => $this->pdo->lastAttachId,
                'parent_type' => $params[0] ?? 'license_tax',
                'parent_id' => $params[1] ?? 0,
                'file_name' => $params[2] ?? '',
                'file_url' => $params[3] ?? ''
            ];
            return true;
        }

        // ── UPDATE licenciada_taxas ─────────────────────────────────────────
        if (stripos($sql, 'UPDATE licenciada_taxas') !== false) {
            if (stripos($sql, 'financial_transaction_id') !== false) {
                $ftId = $params[0];
                $taxId = $params[1];
                if (isset($this->pdo->taxes[$taxId])) {
                    $this->pdo->taxes[$taxId]['financial_transaction_id'] = $ftId;
                }
            } elseif (stripos($sql, 'status = \'contract_signed\'') !== false) {
                $licId = $params[0];
                $taxId = end($params);
                if (isset($this->pdo->taxes[$taxId])) {
                    $this->pdo->taxes[$taxId]['licenciada_id'] = $licId;
                    $this->pdo->taxes[$taxId]['status'] = 'contract_signed';
                }
            }
            return true;
        }

        // ── UPDATE financial_transactions ───────────────────────────────────
        if (stripos($sql, 'UPDATE financial_transactions') !== false) {
            $ftId = $params[0] ?? 0;
            if (isset($this->pdo->transactions[$ftId])) {
                $this->pdo->transactions[$ftId]['status'] = 'confirmed';
            }
            return true;
        }

        // ── SELECT QUERIES ──────────────────────────────────────────────────
        if (stripos($sql, 'WHERE lt.id = ?') !== false) {
            $taxId = $params[0] ?? 0;
            if (isset($this->pdo->taxes[$taxId])) {
                $this->data = [$this->pdo->taxes[$taxId]];
            } else {
                $this->data = [];
            }
        } elseif (stripos($sql, 'FROM licenciada_onboarding_requests') !== false) {
            $reqId = $params[0] ?? 0;
            if (isset($this->pdo->onboardingRequests[$reqId])) {
                $this->data = [$this->pdo->onboardingRequests[$reqId]];
            } else {
                $this->data = [];
            }
        } elseif (stripos($sql, 'FROM licenciada_taxas WHERE onboarding_request_id') !== false) {
            $reqId = $params[0] ?? 0;
            $found = [];
            foreach ($this->pdo->taxes as $t) {
                if (($t['onboarding_request_id'] ?? null) == $reqId) {
                    $found[] = $t;
                }
            }
            $this->data = $found;
        } elseif (stripos($sql, 'FROM financial_attachments WHERE parent_type') !== false) {
            $this->data = [];
        } elseif (stripos($sql, 'SUM(amount_cents)') !== false && stripos($sql, 'type = \'revenue\'') !== false) {
            $rev = 0;
            foreach ($this->pdo->transactions as $t) {
                if ($t['type'] === 'revenue' && $t['status'] === 'confirmed') {
                    $rev += (int)$t['amount_cents'];
                }
            }
            $this->data = [['total_revenue' => $rev]];
        } elseif (stripos($sql, 'SUM(amount_cents)') !== false && stripos($sql, 'type = \'expense\'') !== false) {
            $grouped = [];
            foreach ($this->pdo->transactions as $t) {
                if ($t['type'] === 'expense' && $t['status'] === 'confirmed') {
                    $cat = $t['category'] ?? 'outros';
                    if (!isset($grouped[$cat])) {
                        $grouped[$cat] = ['category' => $cat, 'total_cents' => 0, 'count' => 0];
                    }
                    $grouped[$cat]['total_cents'] += (int)$t['amount_cents'];
                    $grouped[$cat]['count']++;
                }
            }
            $this->data = array_values($grouped);
        }

        return true;
    }

    public function fetch(?int $mode = null) {
        if ($this->cursor < count($this->data)) {
            return $this->data[$this->cursor++];
        }
        return false;
    }

    public function fetchAll(?int $mode = null): array {
        return $this->data;
    }

    public function fetchColumn(int $columnNumber = 0) {
        $row = $this->fetch();
        if ($row && is_array($row)) {
            $vals = array_values($row);
            return $vals[$columnNumber] ?? false;
        }
        return false;
    }
}

$mockPdo = new MockPdoExpenses();
$taxService = new LicenseTaxService($mockPdo);
$finService = new FinancialService($mockPdo);

$passed = 0;
$failed = 0;

function assertTest(string $desc, bool $condition, &$passed, &$failed) {
    if ($condition) {
        echo "  [PASS] {$desc}\n";
        $passed++;
    } else {
        echo "  [FAIL] {$desc}\n";
        $failed++;
    }
}

// ── TEST 1: CATEGORIAS DE DESPESA ───────────────────────────────────────────
echo "1. CATEGORIAS DE DESPESA VISUAIS (PLAN-141)\n";
$categories = $finService->getExpenseCategories();
assertTest("Categorias retornam array", is_array($categories), $passed, $failed);
assertTest("Categorias contêm Marketing, Infraestrutura, Eventos, Operacional, etc.", count($categories) >= 6, $passed, $failed);
assertTest("Categoria possui chave 'marketing' e cor associada", $categories[0]['key'] === 'marketing' && !empty($categories[0]['color']), $passed, $failed);

// ── TEST 2: LANÇAMENTO DE DESPESA (EXPENSE SERVICE) ─────────────────────────
echo "\n2. LANÇAMENTO DE DESPESA OPERACIONAL (MODAL 3 PASSOS)\n";
$expenseResult = $finService->createExpense([
    'amount_cents' => 45000, // R$ 450,00
    'description' => 'Meta Ads — Tráfego Pago Campanha Congresso',
    'category' => 'marketing',
    'expense_date' => date('Y-m-d'),
    'payment_method' => 'cartao_credito',
    'supplier_name' => 'Meta Platforms Inc.'
], 1, ['id' => 1, 'username' => 'josi_gestora']);

assertTest("Despesa criada com sucesso e ID retornado", !empty($expenseResult['id']), $passed, $failed);
assertTest("Valor da despesa gravado em centavos (45000)", $expenseResult['amount_cents'] === 45000, $passed, $failed);
assertTest("Valor formatado corretamente (R$ 450,00)", $expenseResult['amount_formatted'] === 'R$ 450,00', $passed, $failed);
assertTest("Categoria associada 'marketing'", $expenseResult['category'] === 'marketing', $passed, $failed);

// Check Audit Log
$auditCheck = $mockPdo->auditLogs[0] ?? null;
assertTest("Log de auditoria da despesa registrado", !empty($auditCheck), $passed, $failed);
assertTest("Operador logado gravado como 'josi_gestora' (REGRA 12)", ($auditCheck['admin_username'] ?? '') === 'josi_gestora', $passed, $failed);

// ── TEST 3: AUTO-SYNC DO ONBOARDING EM 2 ETAPAS ────────────────────────────
echo "\n3. AUTO-SYNC DO ONBOARDING EM 2 ETAPAS (EMITIDO -> ATIVADO)\n";
// Populate test onboarding request in mock
$mockPdo->onboardingRequests[99] = [
    'id' => 99,
    'nome_completo' => 'Dra. Roberta Santos',
    'cpf' => '123.456.789-00',
    'cnpj' => null,
    'cidade_celebracao' => 'São Paulo',
    'estado' => 'SP',
    'taxa_inicial_num' => '7.000,00',
    'taxa_inicial_extenso' => 'sete mil reais',
    'condicoes_pagamento' => 'à vista',
    'comprovante_pagamento_path' => '/uploads/comprovante_roberta.pdf',
    'contract_uuid' => 'bh-lic-uuid-99'
];

// Etapa 1: Contrato Emitido -> Taxa criada com status pending_payment
$stage1 = $taxService->syncFromOnboarding(99, null, 'EMITIDO');
assertTest("Etapa 1: Taxa criada automaticamente na emissão do contrato", !empty($stage1['id']), $passed, $failed);
assertTest("Etapa 1: Status inicial da taxa é 'pending_payment'", $stage1['status'] === 'pending_payment', $passed, $failed);
assertTest("Etapa 1: Valor em centavos é 700000 (R$ 7.000,00)", (int)$stage1['valor_cents'] === 700000, $passed, $failed);

// Verify linked financial transaction created in mock
$ftId = $stage1['id'];
$ftCheck1 = $mockPdo->transactions[$ftId] ?? null;
assertTest("Etapa 1: Transação financeira correspondente vinculada", !empty($ftCheck1), $passed, $failed);

// Etapa 2: Licenciada Ativada e Quitada -> Upgrade para contract_signed e confirmed
$stage2 = $taxService->syncFromOnboarding(99, 10, 'ATIVADO');
assertTest("Etapa 2: Idempotência preservada (mesmo ID retornado)", $stage2['id'] === $stage1['id'], $passed, $failed);
assertTest("Etapa 2: Status promovido para 'contract_signed'", $mockPdo->taxes[$stage1['id']]['status'] === 'contract_signed', $passed, $failed);
assertTest("Etapa 2: Licenciada ID 10 vinculado", (int)$mockPdo->taxes[$stage1['id']]['licenciada_id'] === 10, $passed, $failed);

// ── TEST 4: DRE EXPANDIDO COM PERCENTUAIS POR CATEGORIA ────────────────────
echo "\n4. DRE EXPANDIDO & MARGEM LÍQUIDA\n";
// Insert additional test expense to verify multi-category breakdown
$finService->createExpense([
    'amount_cents' => 150000, // R$ 1.500,00
    'description' => 'Servidor VPS Hostinger e Armazenamento AWS S3',
    'category' => 'infraestrutura',
    'expense_date' => date('Y-m-d'),
    'payment_method' => 'pix'
], 1, ['id' => 1, 'username' => 'admin']);

$dreExpanded = $finService->getDreExpanded(date('Y-m-01'), date('Y-m-d'));
assertTest("DRE expandido retornado com sucesso", !empty($dreExpanded['summary']), $passed, $failed);
assertTest("Receita bruta considera as transações confirmadas (R$ 7.000,00)", $dreExpanded['summary']['total_revenue_cents'] === 700000, $passed, $failed);
assertTest("Despesas totais somam R$ 1.950,00 (450 + 1500)", $dreExpanded['summary']['total_expenses_cents'] === 195000, $passed, $failed);
assertTest("Lucro líquido apurado: R$ 5.050,00 (7000 - 1950)", $dreExpanded['summary']['net_profit_cents'] === 505000, $passed, $failed);
assertTest("Margem líquida apurada em 72.1%", $dreExpanded['summary']['margin_pct'] === 72.1, $passed, $failed);
assertTest("Categorias de despesa presentes no breakdown (Marketing e Infraestrutura)", count($dreExpanded['categories']) === 2, $passed, $failed);

// Breakdown percentages
$infraCat = array_values(array_filter($dreExpanded['categories'], fn($c) => $c['key'] === 'infraestrutura'))[0] ?? null;
assertTest("Infraestrutura representa 76.9% do total de despesas", $infraCat && $infraCat['pct_of_expenses'] === 76.9, $passed, $failed);

echo "\n=================================================================================\n";
echo "   RESULTADO FINAL: {$passed} PASSADOS / {$failed} FALHAS\n";
echo "=================================================================================\n";

if ($failed > 0) {
    exit(1);
}
exit(0);
