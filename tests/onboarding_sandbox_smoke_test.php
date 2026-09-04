<?php
// tests/onboarding_sandbox_smoke_test.php
// Standalone CLI Smoke Test for Onboarding Sandbox & Governance (PLAN-083)
// Nexus Protocol V3.1 - PHP 8.4 Isolated MockPDO Test Suite

echo "=================================================================\n";
echo "   SMOKE TEST: ONBOARDING SANDBOX & TEST MANAGEMENT (PLAN-083)   \n";
echo "   Valid CPF/CNPJ Generator, Quick Mock, Safe Delete, Purge, RBAC\n";
echo "=================================================================\n\n";

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/SimpleOcrService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/AgendaService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/OnboardingService.php';

use BodyHarmony\Services\SimpleOcrService;
use BodyHarmony\Services\AgendaService;
use BodyHarmony\Services\OnboardingService;

// =========================================================================
// MOCK PDO IMPLEMENTATION FOR CLI ENVIRONMENT (ZERO EXTENSION DEPENDENCY)
// =========================================================================

class MockSandboxStatement {
    private $pdo;
    private $sql;
    private $params = [];
    private $lastQueryResult = [];

    public function __construct($pdo, $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute($params = []) {
        $this->params = $params;

        // 1. INSERT INTO licenciada_onboarding_tokens
        if (stripos($this->sql, 'INSERT INTO licenciada_onboarding_tokens') !== false) {
            $id = ++$this->pdo->lastTokenId;
            $this->pdo->tokens[$id] = [
                'id' => $id,
                'token' => $params[0] ?? '',
                'categoria' => $params[1] ?? 'Licenciamento',
                'telefone_whatsapp' => $params[2] ?? '',
                'nome_candidata' => $params[3] ?? null,
                'created_by_admin_id' => $params[4] ?? null,
                'expires_at' => date('Y-m-d H:i:s', strtotime('+7 days')),
                'used_at' => null,
                'is_test' => (int)($params['is_test'] ?? (stripos($this->sql, '1, NOW()') !== false ? 1 : 0)),
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        // 2. INSERT INTO licenciada_onboarding_requests
        if (stripos($this->sql, 'INSERT INTO licenciada_onboarding_requests') !== false) {
            $id = ++$this->pdo->lastRequestId;
            $this->pdo->requests[$id] = [
                'id' => $id,
                'token_id' => $params[0] ?? null,
                'token_str' => $params[1] ?? null,
                'categoria' => $params[2] ?? 'Licenciamento',
                'template_slug' => 'licenciamento-padrao',
                'nome' => $params[3] ?? '',
                'razao_social' => $params[4] ?? null,
                'nome_fantasia' => $params[5] ?? null,
                'cpf' => $params[6] ?? '',
                'cnpj' => $params[7] ?? null,
                'is_cnpj_em_abertura' => 0,
                'rg' => $params[8] ?? null,
                'email' => $params[9] ?? '',
                'telefone_whatsapp' => $params[10] ?? '',
                'instagram' => $params[11] ?? null,
                'cep' => $params[12] ?? '',
                'endereco' => $params[13] ?? '',
                'numero' => $params[14] ?? '',
                'complemento' => 'Sala 1',
                'bairro' => $params[15] ?? '',
                'cidade' => $params[16] ?? '',
                'estado' => $params[17] ?? '',
                'ocr_extracted_data' => $params[18] ?? '{}',
                'ocr_confidence' => 98.5,
                'status' => 'PRE_CADASTRO',
                'is_test' => (stripos($this->sql, "'PRE_CADASTRO', 1,") !== false) ? 1 : 0,
                'assigned_admin_id' => $params[19] ?? null,
                'future_cohort_tag' => $params[20] ?? null,
                'contract_uuid' => null,
                'licenciada_id' => null,
                'deleted_at' => null,
                'admin_notes' => null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        // 3. UPDATE licenciada_onboarding_requests (Delegação e Soft-Delete)
        if (stripos($this->sql, 'UPDATE licenciada_onboarding_requests') !== false) {
            if (stripos($this->sql, 'deleted_at = NOW()') !== false) {
                $reqId = (int)end($params);
                if (isset($this->pdo->requests[$reqId])) {
                    $this->pdo->requests[$reqId]['deleted_at'] = date('Y-m-d H:i:s');
                    $this->pdo->requests[$reqId]['admin_notes'] .= "\n[Soft-Deleted]";
                    return true;
                }
            } elseif (stripos($this->sql, 'assigned_admin_id = ?') !== false) {
                $assignedId = (int)$params[0];
                $cohortTag = $params[1];
                $reqId = (int)end($params);
                if (isset($this->pdo->requests[$reqId])) {
                    $this->pdo->requests[$reqId]['assigned_admin_id'] = $assignedId;
                    if ($cohortTag) $this->pdo->requests[$reqId]['future_cohort_tag'] = $cohortTag;
                    $this->pdo->requests[$reqId]['updated_at'] = date('Y-m-d H:i:s');
                    return true;
                }
            }
            return true;
        }

        // 4. DELETE FROM licenciada_onboarding_requests
        if (stripos($this->sql, 'DELETE FROM licenciada_onboarding_requests') !== false) {
            $reqId = (int)($params[0] ?? 0);
            if ($reqId > 0 && isset($this->pdo->requests[$reqId])) {
                unset($this->pdo->requests[$reqId]);
                return true;
            }
            return true;
        }

        // 5. DELETE FROM licenciada_onboarding_tokens
        if (stripos($this->sql, 'DELETE FROM licenciada_onboarding_tokens') !== false) {
            if (stripos($this->sql, 'WHERE id = ?') !== false) {
                $tId = (int)($params[0] ?? 0);
                if (isset($this->pdo->tokens[$tId])) {
                    unset($this->pdo->tokens[$tId]);
                }
            } elseif (stripos($this->sql, 'is_test = 1') !== false) {
                foreach ($this->pdo->tokens as $tId => $tok) {
                    if (!empty($tok['is_test'])) {
                        unset($this->pdo->tokens[$tId]);
                    }
                }
            }
            return true;
        }

        // 6. SELECT / QUERIES
        if (stripos($this->sql, 'SELECT') !== false) {
            $this->lastQueryResult = [];

            // A. Single lead by ID
            if (stripos($this->sql, 'WHERE r.id = ?') !== false || stripos($this->sql, 'WHERE id = ?') !== false) {
                $reqId = (int)($params[0] ?? 0);
                if (isset($this->pdo->requests[$reqId])) {
                    $this->lastQueryResult = [$this->pdo->requests[$reqId]];
                }
                return true;
            }

            // B. Check contract status
            if (stripos($this->sql, 'FROM contracts WHERE uuid = ?') !== false) {
                $uuid = $params[0] ?? '';
                foreach ($this->pdo->contracts as $c) {
                    if ($c['uuid'] === $uuid) {
                        $this->lastQueryResult = [['status' => $c['status']]];
                        return true;
                    }
                }
                return true;
            }

            // C. SELECT id FROM licenciada_onboarding_requests WHERE is_test = 1
            if (stripos($this->sql, 'WHERE is_test = 1') !== false && stripos($this->sql, 'deleted_at') === false) {
                foreach ($this->pdo->requests as $r) {
                    if (!empty($r['is_test']) && empty($r['deleted_at'])) {
                        $this->lastQueryResult[] = $r['id'];
                    }
                }
                return true;
            }

            // D. getFunnelStages
            if (stripos($this->sql, 'FROM licenciada_onboarding_requests r') !== false) {
                foreach ($this->pdo->requests as $r) {
                    $deleted = !empty($r['deleted_at']);
                    $isTest = !empty($r['is_test']);

                    if (stripos($this->sql, 'r.is_test = 1 AND r.deleted_at IS NULL') !== false) {
                        if ($isTest && !$deleted) $this->lastQueryResult[] = $r;
                    } elseif (stripos($this->sql, '(r.is_test = 0 OR r.is_test IS NULL) AND r.deleted_at IS NULL') !== false) {
                        if (!$isTest && !$deleted) $this->lastQueryResult[] = $r;
                    } elseif (stripos($this->sql, 'r.deleted_at IS NULL') !== false) {
                        if (!$deleted) $this->lastQueryResult[] = $r;
                    } elseif (stripos($this->sql, 'r.deleted_at IS NOT NULL') !== false) {
                        if ($deleted) $this->lastQueryResult[] = $r;
                    } else {
                        $this->lastQueryResult[] = $r;
                    }
                }
                return true;
            }

            // E. Pending tokens
            if (stripos($this->sql, 'FROM licenciada_onboarding_tokens t') !== false) {
                $usedTokenIds = [];
                foreach ($this->pdo->requests as $r) {
                    if (!empty($r['token_id'])) $usedTokenIds[] = $r['token_id'];
                }
                foreach ($this->pdo->tokens as $t) {
                    if (!in_array($t['id'], $usedTokenIds) && empty($t['used_at'])) {
                        $this->lastQueryResult[] = $t;
                    }
                }
                return true;
            }

            // F. Stages count for getMetrics
            if (stripos($this->sql, 'GROUP BY status') !== false) {
                $counts = [];
                foreach ($this->pdo->requests as $r) {
                    if (empty($r['is_test']) && empty($r['deleted_at'])) {
                        $st = $r['status'];
                        $counts[$st] = ($counts[$st] ?? 0) + 1;
                    }
                }
                foreach ($counts as $st => $tot) {
                    $this->lastQueryResult[] = ['status' => $st, 'total' => $tot];
                }
                return true;
            }

            // Fallback count queries
            if (stripos($this->sql, 'COUNT(*)') !== false) {
                $this->lastQueryResult = [['total' => 0]];
                return true;
            }
        }

        return true;
    }

    public function fetch($mode = PDO::FETCH_ASSOC) {
        return !empty($this->lastQueryResult) ? $this->lastQueryResult[0] : false;
    }

    public function fetchAll($mode = PDO::FETCH_ASSOC) {
        return $this->lastQueryResult;
    }

    public function fetchColumn($col = 0) {
        if (!empty($this->lastQueryResult)) {
            $row = $this->lastQueryResult[0];
            if (is_array($row)) {
                return reset($row);
            }
            return $row;
        }
        return false;
    }
}

class MockSandboxPDO {
    public $lastTokenId = 0;
    public $lastRequestId = 0;
    public $lastInsertedId = 0;
    public $tokens = [];
    public $requests = [];
    public $contracts = [];

    public function prepare($sql) {
        return new MockSandboxStatement($this, $sql);
    }

    public function exec($sql) {
        $stmt = new MockSandboxStatement($this, $sql);
        $stmt->execute();
        return 1;
    }

    public function lastInsertId() {
        return $this->lastInsertedId;
    }
}

// Instantiate test environment
$mockPdo = new MockSandboxPDO();
$service = new OnboardingService($mockPdo);

$totalTests = 0;
$passedTests = 0;

function assertTest(string $desc, bool $condition) {
    global $totalTests, $passedTests;
    $totalTests++;
    if ($condition) {
        $passedTests++;
        echo "  [PASS] {$desc}\n";
    } else {
        echo "  [FAIL] {$desc}\n";
    }
}

// -------------------------------------------------------------------------
// TEST 1: Gerador de CPF Válido
// -------------------------------------------------------------------------
echo "\n--- TEST 1: Validação do Gerador de CPF Matemático ---\n";
$cpf = $service->generateValidCpf();
$cpfDigits = preg_replace('/\D/', '', $cpf);
assertTest("CPF gerado possui 11 dígitos ({$cpf})", strlen($cpfDigits) === 11);

$d1 = 0;
for ($i = 0; $i < 9; $i++) $d1 += (int)$cpfDigits[$i] * (10 - $i);
$d1 = 11 - ($d1 % 11);
if ($d1 >= 10) $d1 = 0;

$d2 = 0;
for ($i = 0; $i < 10; $i++) $d2 += (int)$cpfDigits[$i] * (11 - $i);
$d2 = 11 - ($d2 % 11);
if ($d2 >= 10) $d2 = 0;

assertTest("Dígitos verificadores do CPF calculados com precisão ({$cpfDigits[9]}{$cpfDigits[10]})", (int)$cpfDigits[9] === $d1 && (int)$cpfDigits[10] === $d2);

// -------------------------------------------------------------------------
// TEST 2: Gerador de CNPJ Válido
// -------------------------------------------------------------------------
echo "\n--- TEST 2: Validação do Gerador de CNPJ Matemático ---\n";
$cnpj = $service->generateValidCnpj();
$cnpjDigits = preg_replace('/\D/', '', $cnpj);
assertTest("CNPJ gerado possui 14 dígitos ({$cnpj})", strlen($cnpjDigits) === 14);

$w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
$cd1 = 0;
for ($i = 0; $i < 12; $i++) $cd1 += (int)$cnpjDigits[$i] * $w1[$i];
$cd1 = 11 - ($cd1 % 11);
if ($cd1 >= 10) $cd1 = 0;

$w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
$cd2 = 0;
for ($i = 0; $i < 13; $i++) $cd2 += (int)$cnpjDigits[$i] * $w2[$i];
$cd2 = 11 - ($cd2 % 11);
if ($cd2 >= 10) $cd2 = 0;

assertTest("Dígitos verificadores do CNPJ calculados com precisão ({$cnpjDigits[12]}{$cnpjDigits[13]})", (int)$cnpjDigits[12] === $cd1 && (int)$cnpjDigits[13] === $cd2);

// -------------------------------------------------------------------------
// TEST 3: Geração Instantânea de Lead de Teste (1-Clique)
// -------------------------------------------------------------------------
echo "\n--- TEST 3: Geração Instantânea de Lead Mock no Sandbox ---\n";
$mock1 = $service->generateQuickMockLead(1, 'Licenciamento', 'Turma Outubro 2026');
assertTest("Retorno com success = true", !empty($mock1['success']));
assertTest("Lead mock criado com flag is_test = 1", (int)$mock1['mock_lead']['is_test'] === 1);
assertTest("Lead mock no estágio PRE_CADASTRO", $mock1['mock_lead']['status'] === 'PRE_CADASTRO');
assertTest("Tag de turma futura vinculada", $mock1['mock_lead']['future_cohort_tag'] === 'Turma Outubro 2026');

$mock2 = $service->generateQuickMockLead(2, 'Ouvinte', 'Expansão Sul');
assertTest("Segundo mock criado com sucesso (Ouvinte)", $mock2['mock_lead']['categoria'] === 'Ouvinte');

// -------------------------------------------------------------------------
// TEST 4: Filtros de Visualização (Reais vs Testes vs Todos)
// -------------------------------------------------------------------------
echo "\n--- TEST 4: Filtros de Visualização e Segregação no Funil ---\n";
// Cria 1 lead real
$realId = ++$mockPdo->lastRequestId;
$mockPdo->requests[$realId] = [
    'id' => $realId,
    'nome' => 'Dra. Real de Produção',
    'cpf' => '123.456.789-00',
    'email' => 'real@clinica.com.br',
    'telefone_whatsapp' => '(11) 98888-7777',
    'status' => 'PRE_CADASTRO',
    'is_test' => 0,
    'deleted_at' => null
];

$funnelReal = $service->getFunnelStages(['view_mode' => 'real']);
assertTest("view_mode = real retorna apenas o lead real de produção (1 item)", count($funnelReal['items']) === 1 && $funnelReal['items'][0]['nome'] === 'Dra. Real de Produção');

$funnelTest = $service->getFunnelStages(['view_mode' => 'test']);
assertTest("view_mode = test retorna os 2 leads de teste mock", count($funnelTest['items']) === 2);

$funnelAll = $service->getFunnelStages(['view_mode' => 'all']);
assertTest("view_mode = all retorna o total combinado (3 itens)", count($funnelAll['items']) === 3);

// -------------------------------------------------------------------------
// TEST 5: Atribuição / Delegação de Gestor Responsável
// -------------------------------------------------------------------------
echo "\n--- TEST 5: Delegação de Gestor Responsável ---\n";
$targetLeadId = $mock1['mock_lead']['id'];
$okAssign = $service->assignRequest($targetLeadId, 2, 'Turma VIP 2026', 1);
assertTest("Reatribuição executada com sucesso", $okAssign === true);

$detail = $service->getRequestById($targetLeadId);
assertTest("assigned_admin_id atualizado para 2", (int)$detail['request']['assigned_admin_id'] === 2);
assertTest("future_cohort_tag atualizada para Turma VIP 2026", $detail['request']['future_cohort_tag'] === 'Turma VIP 2026');

// -------------------------------------------------------------------------
// TEST 6: Exclusão Segura (Hard-Delete de Teste / Rascunho)
// -------------------------------------------------------------------------
echo "\n--- TEST 6: Exclusão Física em Cascata de Lead de Teste ---\n";
$delRes = $service->deleteRequest($targetLeadId, 1);
assertTest("Ação executada com sucesso (hard_deleted)", $delRes['action'] === 'hard_deleted');

$deletedCheck = $service->getRequestById($targetLeadId);
assertTest("Registro #{$targetLeadId} não existe mais no banco de dados", $deletedCheck === null);

// TEST 6B: Exclusão de Token Puro (id = tok_XX)
echo "\n--- TEST 6B: Exclusão de Link/Token Puro (tok_XX) ---\n";
$tokId = ++$mockPdo->lastTokenId;
$mockPdo->tokens[$tokId] = [
    'id' => $tokId,
    'token' => 'sample-test-token-xyz',
    'telefone_whatsapp' => '11999998888',
    'categoria' => 'Licenciamento',
    'is_test' => 1
];
$delTokRes = $service->deleteRequest("tok_{$tokId}", 1);
assertTest("Exclusão de token 'tok_{$tokId}' bem-sucedida", $delTokRes['success'] === true && $delTokRes['action'] === 'hard_deleted');
assertTest("Token #{$tokId} removido da base de dados", !isset($mockPdo->tokens[$tokId]));

// -------------------------------------------------------------------------
// TEST 7: Blindagem Jurídica de Contrato Assinado (Soft-Delete)
// -------------------------------------------------------------------------
echo "\n--- TEST 7: Blindagem Jurídica de Contrato SIGNED ---\n";
$signedUuid = 'contract-signed-uuid-777';
$mockPdo->contracts[] = ['uuid' => $signedUuid, 'status' => 'SIGNED'];
$signedId = ++$mockPdo->lastRequestId;
$mockPdo->requests[$signedId] = [
    'id' => $signedId,
    'nome' => 'Dra. Contrato Assinado',
    'cpf' => '999.888.777-66',
    'email' => 'assinado@med.com.br',
    'telefone_whatsapp' => '(11) 97777-6666',
    'status' => 'ATIVO_LIBERADO',
    'contract_uuid' => $signedUuid,
    'is_test' => 0,
    'deleted_at' => null,
    'admin_notes' => null
];

$delSignedRes = $service->deleteRequest($signedId, 1);
assertTest("Exclusão física bloqueada; soft-delete/arquivamento aplicado (action = soft_deleted_archived)", $delSignedRes['action'] === 'soft_deleted_archived');

$checkSigned = $service->getRequestById($signedId);
assertTest("Registro permanece no banco com deleted_at preenchido", !empty($checkSigned['request']['deleted_at']));

// -------------------------------------------------------------------------
// TEST 8: Purga em Massa de Leads de Teste
// -------------------------------------------------------------------------
echo "\n--- TEST 8: Purga em Massa de Testes pelo Superadmin ---\n";
$service->generateQuickMockLead(1);
$service->generateQuickMockLead(1);
$service->generateQuickMockLead(1);

$purgeRes = $service->purgeAllTestRequests(1);
assertTest("Purga executada com sucesso", $purgeRes['success'] === true && $purgeRes['purged_count'] >= 3);

$checkAfterPurge = $service->getFunnelStages(['view_mode' => 'test']);
assertTest("0 leads de teste restantes no sistema", count($checkAfterPurge['items']) === 0);

// -------------------------------------------------------------------------
// TEST 9: Métricas Descontaminadas de Teste
// -------------------------------------------------------------------------
echo "\n--- TEST 9: Métricas Oficiais Descontaminadas ---\n";
$metrics = $service->getMetrics();
assertTest("Métricas retornam success = true", !empty($metrics['success']));
assertTest("Total oficial considera apenas leads reais não-deletados (1 lead real)", (int)$metrics['metrics']['total'] === 1);

// -------------------------------------------------------------------------
// RESULTADO FINAL
// -------------------------------------------------------------------------
echo "\n=================================================================\n";
echo "   RESULTADO FINAL: {$passedTests} / {$totalTests} TESTES APROVADOS\n";
if ($passedTests === $totalTests) {
    echo "   STATUS: 🟢 100% PASS - ONBOARDING SANDBOX COMPLETO & SEGURO\n";
    echo "=================================================================\n\n";
    exit(0);
} else {
    echo "   STATUS: 🔴 FALHAS DETECTADAS NOS TESTES\n";
    echo "=================================================================\n\n";
    exit(1);
}
