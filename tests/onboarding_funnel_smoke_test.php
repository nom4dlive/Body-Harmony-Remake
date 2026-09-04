<?php
// tests/onboarding_funnel_smoke_test.php
// Standalone CLI Smoke Test for Licenciada Onboarding Funnel (PLAN-064)
// Nexus Protocol V3.1 - PHP 8.4 Isolated MockPDO Test Suite

echo "=================================================================\n";
echo "   SMOKE TEST: LICENCIADA ONBOARDING FUNNEL (PLAN-064)          \n";
echo "   Tokens, OCR, 1-Click Contract, WhatsApp & 2-Step Validation  \n";
echo "=================================================================\n\n";

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/SimpleOcrService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/AgendaService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/OnboardingService.php';

use BodyHarmony\Services\SimpleOcrService;
use BodyHarmony\Services\AgendaService;
use BodyHarmony\Services\OnboardingService;

// =========================================================================
// MOCK PDO IMPLEMENTATION FOR ISOLATED CLI TESTING
// =========================================================================

class MockOnboardingStatement {
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
                'token' => $params[0] ?? $params['token'] ?? '',
                'categoria' => $params[1] ?? $params['categoria'] ?? 'Licenciamento',
                'telefone_whatsapp' => $params[2] ?? $params['telefone_whatsapp'] ?? '',
                'nome_candidata' => $params[3] ?? $params['nome_candidata'] ?? null,
                'created_by_admin_id' => $params[4] ?? $params['created_by_admin_id'] ?? null,
                'expires_at' => $params[5] ?? $params['expires_at'] ?? date('Y-m-d H:i:s', strtotime('+7 days')),
                'used_at' => null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        // 2. UPDATE licenciada_onboarding_tokens SET used_at
        if (stripos($this->sql, 'UPDATE licenciada_onboarding_tokens') !== false) {
            $tokenId = (int)($params[0] ?? $params['id'] ?? 0);
            if (isset($this->pdo->tokens[$tokenId])) {
                $this->pdo->tokens[$tokenId]['used_at'] = date('Y-m-d H:i:s');
                $this->pdo->tokens[$tokenId]['updated_at'] = date('Y-m-d H:i:s');
                return true;
            }
            return false;
        }

        // 3. INSERT INTO licenciada_onboarding_requests
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
                'is_cnpj_em_abertura' => $params[8] ?? 0,
                'rg' => $params[9] ?? '',
                'email' => $params[10] ?? '',
                'telefone_whatsapp' => $params[11] ?? '',
                'instagram' => $params[12] ?? null,
                'cep' => $params[13] ?? '',
                'endereco' => $params[14] ?? '',
                'numero' => $params[15] ?? '',
                'complemento' => $params[16] ?? '',
                'bairro' => $params[17] ?? '',
                'cidade' => $params[18] ?? '',
                'estado' => $params[19] ?? '',
                'documento_img' => $params[20] ?? null,
                'comprovante_pagamento_img' => $params[21] ?? null,
                'comprovante_residencia_img' => $params[22] ?? null,
                'contrato_social_img' => $params[23] ?? null,
                'certificados_imgs' => $params[24] ?? null,
                'ocr_extracted_data' => $params[25] ?? '{}',
                'ocr_confidence' => $params[26] ?? 0.0,
                'status' => 'PRE_CADASTRO',
                'contract_uuid' => null,
                'licenciada_id' => null,
                'agenda_event_id' => null,
                'taxa_inicial_num' => '7.000,00',
                'taxa_inicial_extenso' => 'sete mil reais',
                'condicoes_pagamento' => 'à vista via PIX',
                'valor_minimo_sessao' => '150,00',
                'cidade_celebracao' => 'Assis/SP',
                'last_reminder_sent_at' => null,
                'payment_confirmed_at' => null,
                'payment_confirmed_by_admin_id' => null,
                'activated_at' => null,
                'admin_notes' => null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        // 4. UPDATE licenciada_onboarding_requests
        if (stripos($this->sql, 'UPDATE licenciada_onboarding_requests') !== false) {
            if (stripos($this->sql, 'agenda_event_id') !== false) {
                $eventId = $params[0];
                $reqId = (int)$params[1];
                if (isset($this->pdo->requests[$reqId])) {
                    $this->pdo->requests[$reqId]['agenda_event_id'] = $eventId;
                    return true;
                }
            } elseif (stripos($this->sql, 'SET licenciada_id = ?') !== false) {
                $licId = (int)$params[0];
                $reqId = (int)$params[1];
                if (isset($this->pdo->requests[$reqId])) {
                    $this->pdo->requests[$reqId]['licenciada_id'] = $licId;
                    return true;
                }
            } elseif (stripos($this->sql, 'contract_uuid = ?') !== false) {
                $contractUuid = $params[0];
                $taxaNum = $params[1];
                $taxaExtenso = $params[2];
                $condicoes = $params[3];
                $cidadeCelebracao = $params[4];
                $reqId = (int)$params[5];
                if (isset($this->pdo->requests[$reqId])) {
                    $this->pdo->requests[$reqId]['contract_uuid'] = $contractUuid;
                    $this->pdo->requests[$reqId]['status'] = 'CONTRATO_EMITIDO';
                    $this->pdo->requests[$reqId]['taxa_inicial_num'] = $taxaNum;
                    $this->pdo->requests[$reqId]['taxa_inicial_extenso'] = $taxaExtenso;
                    $this->pdo->requests[$reqId]['condicoes_pagamento'] = $condicoes;
                    $this->pdo->requests[$reqId]['cidade_celebracao'] = $cidadeCelebracao;
                    $this->pdo->requests[$reqId]['updated_at'] = date('Y-m-d H:i:s');
                    return true;
                }
            } elseif (stripos($this->sql, 'last_reminder_sent_at') !== false) {
                $reqId = (int)$params[0];
                if (isset($this->pdo->requests[$reqId])) {
                    $this->pdo->requests[$reqId]['last_reminder_sent_at'] = date('Y-m-d H:i:s');
                    return true;
                }
            } elseif (stripos($this->sql, "SET status = 'ATIVO_LIBERADO'") !== false) {
                $licId = (int)$params[0];
                $reqId = (int)end($params);
                if (isset($this->pdo->requests[$reqId])) {
                    $this->pdo->requests[$reqId]['status'] = 'ATIVO_LIBERADO';
                    $this->pdo->requests[$reqId]['licenciada_id'] = $licId;
                    $this->pdo->requests[$reqId]['payment_confirmed_at'] = date('Y-m-d H:i:s');
                    $this->pdo->requests[$reqId]['activated_at'] = date('Y-m-d H:i:s');
                    return true;
                }
            } elseif (stripos($this->sql, "nome = ?, cpf = ?") !== false) {
                // PLAN-067: Update full validated fields
                $reqId = (int)end($params);
                if (isset($this->pdo->requests[$reqId])) {
                    $this->pdo->requests[$reqId]['nome'] = $params[0];
                    $this->pdo->requests[$reqId]['cpf'] = $params[1];
                    $this->pdo->requests[$reqId]['rg'] = $params[2];
                    $this->pdo->requests[$reqId]['email'] = $params[3];
                    $this->pdo->requests[$reqId]['telefone_whatsapp'] = $params[4];
                    $this->pdo->requests[$reqId]['instagram'] = $params[5];
                    $this->pdo->requests[$reqId]['cnpj'] = $params[6];
                    $this->pdo->requests[$reqId]['razao_social'] = $params[7];
                    $this->pdo->requests[$reqId]['nome_fantasia'] = $params[8];
                    $this->pdo->requests[$reqId]['is_cnpj_em_abertura'] = $params[9];
                    $this->pdo->requests[$reqId]['cep'] = $params[10];
                    $this->pdo->requests[$reqId]['endereco'] = $params[11];
                    $this->pdo->requests[$reqId]['numero'] = $params[12];
                    $this->pdo->requests[$reqId]['complemento'] = $params[13];
                    $this->pdo->requests[$reqId]['bairro'] = $params[14];
                    $this->pdo->requests[$reqId]['cidade'] = $params[15];
                    $this->pdo->requests[$reqId]['estado'] = $params[16];
                    $this->pdo->requests[$reqId]['admin_notes'] .= "\n" . $params[17];
                    $this->pdo->requests[$reqId]['updated_at'] = date('Y-m-d H:i:s');
                    return true;
                }
            } elseif (stripos($this->sql, "SET status = ?") !== false) {
                $status = $params[0];
                $notes = $params[1];
                $reqId = (int)$params[2];
                if (isset($this->pdo->requests[$reqId])) {
                    $this->pdo->requests[$reqId]['status'] = $status;
                    $this->pdo->requests[$reqId]['admin_notes'] .= "\n" . $notes;
                    return true;
                }
            }
            return true;
        }

        // 5. INSERT INTO gestor_agenda_events
        if (stripos($this->sql, 'INSERT INTO gestor_agenda_events') !== false) {
            $id = ++$this->pdo->lastAgendaId;
            $this->pdo->agendaEvents[$id] = [
                'id' => $id,
                'event_type' => $params['event_type'] ?? 'pendencia',
                'title' => $params['title'] ?? '',
                'description' => $params['description'] ?? '',
                'start_datetime' => $params['start_datetime'] ?? date('Y-m-d H:i:s'),
                'end_datetime' => $params['end_datetime'] ?? null,
                'priority' => $params['priority'] ?? 'alta',
                'status' => $params['status'] ?? 'pendente',
                'color' => $params['color'] ?? '#ED7E13',
                'client_type' => $params['client_type'] ?? 'licenciada',
                'client_id' => $params['client_id'] ?? null,
                'created_by_admin_id' => $params['created_by_admin_id'] ?? 1,
                'assigned_to_admin_id' => $params['assigned_to_admin_id'] ?? null,
                'metadata' => $params['metadata'] ?? null,
                'deleted_at' => null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        // 6. UPDATE gestor_agenda_events
        if (stripos($this->sql, 'UPDATE gestor_agenda_events') !== false) {
            $id = (int)($params['id'] ?? 0);
            if (isset($this->pdo->agendaEvents[$id])) {
                if (isset($params['status'])) {
                    $this->pdo->agendaEvents[$id]['status'] = $params['status'];
                }
                $this->pdo->agendaEvents[$id]['updated_at'] = date('Y-m-d H:i:s');
                return true;
            }
            return false;
        }

        // 7. INSERT INTO contracts
        if (stripos($this->sql, 'INSERT INTO contracts') !== false) {
            $id = ++$this->pdo->lastContractId;
            $uuid = $params[0] ?? '';
            if (count($params) >= 8) {
                $templateId = $params[1] ?? null;
                $title = $params[2] ?? '';
                $variablesPayload = $params[3] ?? '{}';
                $renderedHtml = $params[4] ?? '';
                $signToken = $params[7] ?? '';
            } else {
                $templateId = null;
                $title = $params[1] ?? '';
                $variablesPayload = $params[2] ?? '{}';
                $renderedHtml = '';
                $signToken = $params[3] ?? '';
            }
            $this->pdo->contracts[$uuid] = [
                'id' => $id,
                'uuid' => $uuid,
                'template_id' => $templateId,
                'title' => $title,
                'status' => 'PENDING_SIGNATURE',
                'variables_payload' => $variablesPayload,
                'rendered_html' => $renderedHtml,
                'sign_token' => $signToken,
                'sign_token_expires_at' => date('Y-m-d H:i:s', strtotime('+15 days')),
                'created_by' => 1,
                'licenciada_id' => null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        // 8. UPDATE contracts
        if (stripos($this->sql, 'UPDATE contracts') !== false) {
            $licId = (int)$params[0];
            $uuid = $params[1];
            if (isset($this->pdo->contracts[$uuid])) {
                $this->pdo->contracts[$uuid]['status'] = 'SIGNED';
                $this->pdo->contracts[$uuid]['licenciada_id'] = $licId;
                $this->pdo->contracts[$uuid]['updated_at'] = date('Y-m-d H:i:s');
                return true;
            }
            return false;
        }

        // 9. INSERT INTO licenciadas (REGRA 8: Strict 'cpf')
        if (stripos($this->sql, 'INSERT INTO licenciadas') !== false) {
            $id = ++$this->pdo->lastLicenciadaId;
            if (stripos($this->sql, 'razao_social') !== false) {
                $this->pdo->licenciadas[$id] = [
                    'id' => $id,
                    'name' => $params[0],
                    'razao_social' => $params[1] ?? null,
                    'nome_fantasia' => $params[2] ?? null,
                    'cpf' => $params[3], // REGRA 8
                    'cnpj' => $params[4] ?? null,
                    'email' => $params[5],
                    'username' => $params[6],
                    'whatsapp' => $params[7],
                    'whatsapp_number' => $params[8],
                    'instagram' => $params[9] ?? null,
                    'state' => $params[10],
                    'location' => $params[11],
                    'cep' => $params[12] ?? null,
                    'endereco' => $params[13] ?? null,
                    'numero' => $params[14] ?? null,
                    'complemento' => $params[15] ?? null,
                    'bairro' => $params[16] ?? null,
                    'photo_url' => $params[17] ?? null,
                    'documentos_anexos' => $params[18] ?? null,
                    'origem_onboarding_request_id' => $params[19] ?? null,
                    'is_active' => 1,
                    'renewal_date' => $params[20] ?? date('Y-m-d', strtotime('+1 year')),
                    'admin_notes' => $params[21] ?? null,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ];
            } else {
                $this->pdo->licenciadas[$id] = [
                    'id' => $id,
                    'name' => $params[0],
                    'razao_social' => null,
                    'nome_fantasia' => null,
                    'cpf' => $params[1], // REGRA 8
                    'cnpj' => null,
                    'email' => $params[2],
                    'username' => $params[3],
                    'whatsapp' => $params[4],
                    'whatsapp_number' => $params[5],
                    'instagram' => null,
                    'state' => $params[6],
                    'location' => $params[7],
                    'cep' => null,
                    'endereco' => null,
                    'numero' => null,
                    'complemento' => null,
                    'bairro' => null,
                    'photo_url' => $params[8] ?? null,
                    'documentos_anexos' => null,
                    'origem_onboarding_request_id' => null,
                    'is_active' => 1,
                    'renewal_date' => $params[9] ?? date('Y-m-d', strtotime('+1 year')),
                    'admin_notes' => $params[10] ?? null,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ];
            }
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        // 10. UPDATE licenciadas
        if (stripos($this->sql, 'UPDATE licenciadas') !== false) {
            $licId = (int)end($params);
            if (isset($this->pdo->licenciadas[$licId])) {
                $this->pdo->licenciadas[$licId]['is_active'] = 1;
                return true;
            }
            return false;
        }

        return true;
    }

    public function fetch($mode = null) {
        // SELECT * FROM licenciada_onboarding_tokens WHERE token = ?
        if (stripos($this->sql, 'FROM licenciada_onboarding_tokens') !== false && stripos($this->sql, 'WHERE token = ?') !== false) {
            $token = $this->params[0] ?? '';
            foreach ($this->pdo->tokens as $tok) {
                if ($tok['token'] === $token) {
                    return $tok;
                }
            }
            return false;
        }

        // SELECT r.*, t.token ... FROM licenciada_onboarding_requests WHERE r.id = ?
        if (stripos($this->sql, 'FROM licenciada_onboarding_requests') !== false && stripos($this->sql, 'WHERE r.id = ?') !== false) {
            $id = (int)($this->params[0] ?? 0);
            if (isset($this->pdo->requests[$id])) {
                $req = $this->pdo->requests[$id];
                $tokenId = $req['token_id'];
                $req['original_token_str'] = $this->pdo->tokens[$tokenId]['token'] ?? null;
                $req['token_expires_at'] = $this->pdo->tokens[$tokenId]['expires_at'] ?? null;
                return $req;
            }
            return false;
        }

        // SELECT * FROM contracts WHERE uuid = ?
        if (stripos($this->sql, 'FROM contracts WHERE uuid = ?') !== false) {
            $uuid = $this->params[0] ?? '';
            return $this->pdo->contracts[$uuid] ?? false;
        }

        // SELECT id, name, cpf, email, username FROM licenciadas WHERE cpf = ? (REGRA 8)
        if (stripos($this->sql, 'FROM licenciadas WHERE cpf = ?') !== false) {
            $cpf = $this->params[0] ?? '';
            foreach ($this->pdo->licenciadas as $lic) {
                if ($lic['cpf'] === $cpf) {
                    return $lic;
                }
            }
            return false;
        }

        return false;
    }

    public function fetchAll($mode = null) {
        // PLAN-066: SELECT status, COUNT(*) AS total FROM licenciada_onboarding_requests GROUP BY status
        if (stripos($this->sql, 'FROM licenciada_onboarding_requests') !== false
            && stripos($this->sql, 'GROUP BY status') !== false) {
            $counts = [];
            foreach ($this->pdo->requests as $req) {
                $s = strtoupper($req['status'] ?? 'PRE_CADASTRO');
                if (!isset($counts[$s])) $counts[$s] = 0;
                $counts[$s]++;
            }
            $rows = [];
            foreach ($counts as $status => $total) {
                $rows[] = ['status' => $status, 'total' => $total];
            }
            return $rows;
        }

        // TOKENS: SELECT t.* ... FROM licenciada_onboarding_tokens
        if (stripos($this->sql, 'FROM licenciada_onboarding_tokens') !== false) {
            $results = [];
            foreach ($this->pdo->tokens as $tok) {
                $used = false;
                foreach ($this->pdo->requests as $r) {
                    if (($r['token_id'] ?? null) == $tok['id']) {
                        $used = true;
                        break;
                    }
                }
                if (!$used) {
                    $results[] = [
                        'token_id' => $tok['id'],
                        'id' => $tok['id'],
                        'token' => $tok['token'],
                        'categoria' => $tok['categoria'],
                        'telefone_whatsapp' => $tok['telefone_whatsapp'],
                        'nome_candidata' => $tok['nome_candidata'] ?? '',
                        'created_at' => $tok['created_at'] ?? date('Y-m-d H:i:s'),
                        'expires_at' => $tok['expires_at'] ?? date('Y-m-d H:i:s', strtotime('+7 days')),
                        'used_at' => $tok['used_at'] ?? null
                    ];
                }
            }
            return $results;
        }

        // DEFAULT: SELECT r.* ... FROM licenciada_onboarding_requests (listagem do funil)
        if (stripos($this->sql, 'FROM licenciada_onboarding_requests') !== false) {
            $results = [];
            foreach ($this->pdo->requests as $req) {
                $results[] = $req;
            }
            return $results;
        }
        return [];
    }

    public function fetchColumn() {
        // PLAN-066: COUNT queries para alertas, ativações e contratos
        if (stripos($this->sql, 'COUNT(*)') !== false
            || stripos($this->sql, 'COUNT(*) AS total') !== false) {
            // Alertas: AGUARDANDO_ASSINATURA sem lembrete nas últimas 24h
            if (stripos($this->sql, "'AGUARDANDO_ASSINATURA'") !== false) {
                $count = 0;
                foreach ($this->pdo->requests as $req) {
                    if (($req['status'] ?? '') === 'AGUARDANDO_ASSINATURA') {
                        $count++;
                    }
                }
                return $count;
            }
            // Ativações no período
            if (stripos($this->sql, "'ATIVO_LIBERADO'") !== false && stripos($this->sql, 'activated_at') !== false) {
                $count = 0;
                foreach ($this->pdo->requests as $req) {
                    if (($req['status'] ?? '') === 'ATIVO_LIBERADO') $count++;
                }
                return $count;
            }
            // Contratos emitidos no período
            if (stripos($this->sql, 'contract_uuid IS NOT NULL') !== false) {
                $count = 0;
                foreach ($this->pdo->requests as $req) {
                    if (!empty($req['contract_uuid'])) $count++;
                }
                return $count;
            }
            return 1; // fallback genérico
        }
        return 1;
    }
}

class MockOnboardingPDO extends PDO {
    public $tokens = [];
    public $requests = [];
    public $agendaEvents = [];
    public $contracts = [];
    public $licenciadas = [];

    public $lastTokenId = 0;
    public $lastRequestId = 0;
    public $lastAgendaId = 0;
    public $lastContractId = 0;
    public $lastLicenciadaId = 0;
    public $lastInsertedId = 0;

    public function __construct() {}

    #[\ReturnTypeWillChange]
    public function prepare(string $query, array $options = []): MockOnboardingStatement {
        return new MockOnboardingStatement($this, $query);
    }

    #[\ReturnTypeWillChange]
    public function lastInsertId(?string $name = null): string|false {
        return (string)$this->lastInsertedId;
    }

    #[\ReturnTypeWillChange]
    public function beginTransaction(): bool { return true; }
    #[\ReturnTypeWillChange]
    public function commit(): bool { return true; }
    #[\ReturnTypeWillChange]
    public function rollBack(): bool { return true; }
    #[\ReturnTypeWillChange]
    public function inTransaction(): bool { return false; }
}

// =========================================================================
// RUN SMOKE TESTS
// =========================================================================

$pdo = new MockOnboardingPDO();
$ocrService = new SimpleOcrService();
$agendaService = new AgendaService($pdo);
$onboardingService = new OnboardingService($pdo, $agendaService, null, $ocrService);

$testsPassed = 0;
$totalTests = 11;
$errors = [];

// -------------------------------------------------------------------------
// [TEST 1] Geração e Validação de Token de Onboarding Seguro
// -------------------------------------------------------------------------
echo "[TEST 1] Geração e Validação de Token de Onboarding Seguro... ";
try {
    $tokenResult = $onboardingService->createToken([
        'categoria' => 'Licenciamento',
        'telefone_whatsapp' => '11987654321',
        'nome_candidata' => 'Dra. Camila Silveira',
        'expires_in_days' => 7
    ], 1);

    if (empty($tokenResult['token']) || strlen($tokenResult['token']) !== 64) {
        throw new Exception("Token de 64 caracteres não foi gerado corretamente.");
    }
    if (empty($tokenResult['public_link']) || strpos($tokenResult['public_link'], '/onboarding/') === false) {
        throw new Exception("Link público de onboarding inválido.");
    }
    if (empty($tokenResult['whatsapp_message']) || strpos($tokenResult['whatsapp_message'], 'Camila Silveira') === false) {
        throw new Exception("Template de mensagem de convite WhatsApp não contém o nome.");
    }

    // Validate token
    $val = $onboardingService->validateToken($tokenResult['token']);
    if (!$val || empty($val['valid']) || $val['token'] !== $tokenResult['token']) {
        throw new Exception("Falha na validação do token recém-gerado.");
    }

    echo "OK (Token 64-hex: " . substr($tokenResult['token'], 0, 12) . "...)\n";
    $testsPassed++;
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = "TEST 1: " . $e->getMessage();
}

// -------------------------------------------------------------------------
// [TEST 2] Validação de CPF (Módulo 11) & Extração Defensiva OCR
// -------------------------------------------------------------------------
echo "[TEST 2] Validação de CPF (Módulo 11) & Extração Defensiva OCR... ";
try {
    // 1. CPF Validation
    $validCpf = "12345678909"; // Known invalid check digits
    $validModulo11 = "52998224725"; // Valid CPF
    if ($ocrService->validateCpf("11111111111") !== false) {
        throw new Exception("Dígitos repetidos 111.111.111-11 deveriam ser rejeitados.");
    }
    if ($ocrService->validateCpf($validModulo11) !== true) {
        throw new Exception("CPF válido {$validModulo11} foi rejeitado pelo Módulo 11.");
    }

    // 2. OCR Extraction from Simulated Document
    $sampleDocText = "
        REPÚBLICA FEDERATIVA DO BRASIL
        CARTEIRA DE IDENTIDADE
        Nome: Dra. Camila Silveira
        RG: 12.345.678-9 SSP/SP
        CPF: 529.982.247-25
        Endereço: Av. Paulista, 1000 - Bela Vista
        Bairro: Bela Vista
        Cidade: São Paulo
        UF: SP
        CEP: 01310-100
    ";

    $ocrRes = $ocrService->processDocument($sampleDocText);
    if (empty($ocrRes['extracted_data']['cpf']) || $ocrRes['extracted_data']['cpf'] !== '529.982.247-25') {
        throw new Exception("Falha na extração do CPF pelo OCR.");
    }
    if (empty($ocrRes['extracted_data']['nome']) || strpos($ocrRes['extracted_data']['nome'], 'Camila') === false) {
        throw new Exception("Falha na extração do Nome pelo OCR.");
    }
    if ($ocrRes['confidence'] < 70.0) {
        throw new Exception("Confiança do OCR abaixo do esperado ({$ocrRes['confidence']}%).");
    }

    // 3. Defensive zero-crash test with corrupt string
    $corrupt = $ocrService->processDocument(chr(0) . chr(255) . "random non-sense binary");
    if (!isset($corrupt['confidence']) || $corrupt['confidence'] > 0.0) {
        throw new Exception("Texto corrompido não retornou confidence 0.");
    }

    echo "OK (CPF validado, OCR extraído com {$ocrRes['confidence']}% confiança)\n";
    $testsPassed++;
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = "TEST 2: " . $e->getMessage();
}

// -------------------------------------------------------------------------
// [TEST 3] Submissão de Pré-cadastro Público & Gatilho na Agenda (#ED7E13)
// -------------------------------------------------------------------------
echo "[TEST 3] Submissão de Pré-cadastro Público & Gatilho na Agenda... ";
try {
    $createdToken = $tokenResult['token'];
    $submitRes = $onboardingService->submitPublicOnboarding($createdToken, [
        'nome' => 'Dra. Camila Silveira',
        'cpf' => '529.982.247-25',
        'rg' => '12.345.678-9',
        'email' => 'camila.silveira@estetica.com.br',
        'telefone_whatsapp' => '11987654321',
        'cep' => '01310-100',
        'endereco' => 'Av. Paulista',
        'numero' => '1000',
        'complemento' => 'Sala 102',
        'bairro' => 'Bela Vista',
        'cidade' => 'São Paulo',
        'estado' => 'SP',
        'categoria' => 'Licenciamento'
    ], null);

    if (empty($submitRes['success']) || empty($submitRes['onboarding_id'])) {
        throw new Exception("Falha ao submeter formulário público de onboarding.");
    }

    $requestId = (int)$submitRes['onboarding_id'];
    $reqDetail = $onboardingService->getRequestById($requestId);
    if (!$reqDetail || $reqDetail['request']['status'] !== 'PRE_CADASTRO') {
        throw new Exception("Status inicial da solicitação deve ser PRE_CADASTRO.");
    }

    // Verify token was marked as used
    $tokenCheck = $onboardingService->validateToken($createdToken);
    if ($tokenCheck['valid'] !== false || ($tokenCheck['reason'] ?? '') !== 'already_used') {
        throw new Exception("Token deveria estar marcado como utilizado (already_used).");
    }

    // Verify Agenda Event creation
    if (empty($submitRes['agenda_event_id']) || !isset($pdo->agendaEvents[$submitRes['agenda_event_id']])) {
        throw new Exception("Tarefa de onboarding na Agenda do Gestor não foi criada.");
    }
    $agendaEvt = $pdo->agendaEvents[$submitRes['agenda_event_id']];
    if ($agendaEvt['priority'] !== 'alta' || $agendaEvt['color'] !== '#ED7E13') {
        throw new Exception("Prioridade da agenda deve ser 'alta' e cor '#ED7E13'.");
    }

    echo "OK (Onboarding #{$requestId}, Agenda Event #{$submitRes['agenda_event_id']})\n";
    $testsPassed++;
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = "TEST 3: " . $e->getMessage();
}

// -------------------------------------------------------------------------
// [TEST 4] Geração de Contrato em 1-Clique com Preenchimento Automático
// -------------------------------------------------------------------------
echo "[TEST 4] Emissão de Contrato em 1-Clique com Auto-preenchimento... ";
try {
    $contractRes = $onboardingService->generateContract1Click($requestId, [
        'taxa_inicial_num' => '7.000,00',
        'taxa_inicial_extenso' => 'sete mil reais',
        'condicoes_pagamento' => 'à vista via PIX',
        'cidade_celebracao' => 'São Paulo/SP'
    ], 1);

    if (empty($contractRes['success']) || empty($contractRes['contract_uuid'])) {
        throw new Exception("Falha na geração do contrato em 1-clique.");
    }
    if (empty($contractRes['sign_url']) || strpos($contractRes['sign_url'], '/assinar/') === false) {
        throw new Exception("Link de assinatura digital inválido.");
    }

    $reqDetail = $onboardingService->getRequestById($requestId);
    if ($reqDetail['request']['status'] !== 'CONTRATO_EMITIDO') {
        throw new Exception("Status da solicitação deve ser CONTRATO_EMITIDO.");
    }

    // Verify contract in DB
    $contractUuid = $contractRes['contract_uuid'];
    if (!isset($pdo->contracts[$contractUuid])) {
        throw new Exception("Contrato não encontrado na tabela contracts.");
    }

    $savedContract = $pdo->contracts[$contractUuid];
    $payload = json_decode($savedContract['variables_payload'], true);
    if ($payload['LICENCIADA_CPF'] !== '529.982.247-25') {
        throw new Exception("Variável LICENCIADA_CPF não foi preenchida corretamente (REGRA 8).");
    }
    if ($payload['LICENCIADA_NOME_RAZAO'] !== 'Dra. Camila Silveira') {
        throw new Exception("Variável LICENCIADA_NOME_RAZAO incorreta.");
    }

    echo "OK (Contrato UUID: " . substr($contractUuid, 0, 16) . "... Sign Token: " . substr($contractRes['sign_token'], 0, 12) . "...)\n";
    $testsPassed++;
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = "TEST 4: " . $e->getMessage();
}

// -------------------------------------------------------------------------
// [TEST 5] Régua de Cobrança e Follow-up WhatsApp 24h
// -------------------------------------------------------------------------
echo "[TEST 5] Régua de WhatsApp 24h & Follow-up de Assinatura... ";
try {
    $reminderRes = $onboardingService->sendWhatsAppReminder($requestId, 'lembrete_24h');

    if (empty($reminderRes['success']) || empty($reminderRes['whatsapp_url'])) {
        throw new Exception("Falha ao gerar régua de WhatsApp.");
    }
    if (strpos($reminderRes['text'], 'Camila Silveira') === false || strpos($reminderRes['text'], '/assinar/') === false) {
        throw new Exception("Mensagem de lembrete não contém nome ou link de assinatura.");
    }

    $reqDetail = $onboardingService->getRequestById($requestId);
    if (empty($reqDetail['request']['last_reminder_sent_at'])) {
        throw new Exception("Timestamp last_reminder_sent_at não foi atualizado.");
    }

    echo "OK (WhatsApp URL gerada: " . substr($reminderRes['whatsapp_url'], 0, 35) . "...)\n";
    $testsPassed++;
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = "TEST 5: " . $e->getMessage();
}

// -------------------------------------------------------------------------
// [TEST 6] Validação de Pagamento em 2 Etapas e Ativação no DB (licenciadas.cpf)
// -------------------------------------------------------------------------
echo "[TEST 6] Validação de Pagamento & Ativação (Strict CPF Invariant)... ";
try {
    $activateRes = $onboardingService->confirmPaymentAndActivate($requestId, [
        'payment_method' => 'PIX',
        'notes' => 'Comprovante conferido pelo Gestor Financeiro.'
    ], 1);

    if (empty($activateRes['success']) || empty($activateRes['licenciada_id'])) {
        throw new Exception("Falha ao confirmar pagamento e ativar licenciada.");
    }
    if (empty($activateRes['lms_access_granted'])) {
        throw new Exception("Flag lms_access_granted deve ser true.");
    }

    $licenciadaId = (int)$activateRes['licenciada_id'];
    if (!isset($pdo->licenciadas[$licenciadaId])) {
        throw new Exception("Licenciada #{$licenciadaId} não foi inserida na tabela licenciadas.");
    }

    $licRecord = $pdo->licenciadas[$licenciadaId];
    // Strict Constitution REGRA 8: Check column 'cpf'
    if (empty($licRecord['cpf']) || $licRecord['cpf'] !== '529.982.247-25') {
        throw new Exception("Coluna física 'cpf' da licenciada não foi preenchida (REGRA 8 violada).");
    }
    if ($licRecord['is_active'] != 1) {
        throw new Exception("Licenciada deve estar com is_active = 1.");
    }

    // Verify request updated to ATIVO_LIBERADO
    $reqDetail = $onboardingService->getRequestById($requestId);
    if ($reqDetail['request']['status'] !== 'ATIVO_LIBERADO') {
        throw new Exception("Status final da solicitação deve ser ATIVO_LIBERADO.");
    }

    // Verify contract updated to SIGNED
    if ($pdo->contracts[$contractUuid]['status'] !== 'SIGNED' || $pdo->contracts[$contractUuid]['licenciada_id'] !== $licenciadaId) {
        throw new Exception("Contrato deve ser marcado como SIGNED e vinculado à licenciada.");
    }

    echo "OK (Licenciada ID #{$licenciadaId}, CPF: {$licRecord['cpf']}, Status: ATIVO_LIBERADO)\n";
    $testsPassed++;
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = "TEST 6: " . $e->getMessage();
}

// -------------------------------------------------------------------------
// [TEST 7] Transição e Contabilização dos 5 Estágios do Funil Kanban
// -------------------------------------------------------------------------
echo "[TEST 7] Agregação e Contabilização dos 5 Estágios do Kanban... ";
try {
    // Add second lead in PRE_CADASTRO
    $token2 = $onboardingService->createToken([
        'categoria' => 'Licenciamento',
        'telefone_whatsapp' => '21999998888',
        'nome_candidata' => 'Dra. Luana Ramos'
    ], 1);

    $onboardingService->submitPublicOnboarding($token2['token'], [
        'nome' => 'Dra. Luana Ramos',
        'cpf' => '654.321.987-00',
        'rg' => '22.333.444-5',
        'email' => 'luana@estetica.com.br',
        'telefone_whatsapp' => '21999998888',
        'cidade' => 'Rio de Janeiro',
        'estado' => 'RJ'
    ]);

    $funnel = $onboardingService->getFunnelStages();

    if (empty($funnel['success']) || !isset($funnel['columns']) || !isset($funnel['stages'])) {
        throw new Exception("Estrutura do funil Kanban inválida.");
    }

    $requiredColumns = ['pre_cadastro', 'contrato_emitido', 'aguardando_assinatura', 'validar_pagamento', 'ativo_liberado'];
    foreach ($requiredColumns as $col) {
        if (!isset($funnel['columns'][$col]) || !is_array($funnel['columns'][$col])) {
            throw new Exception("Coluna {$col} ausente no Kanban.");
        }
    }

    if (count($funnel['columns']['ativo_liberado']) !== 1) {
        throw new Exception("Coluna ativo_liberado deveria conter 1 card.");
    }
    if (count($funnel['columns']['pre_cadastro']) !== 1) {
        throw new Exception("Coluna pre_cadastro deveria conter 1 card.");
    }
    if ($funnel['total'] !== 2) {
        throw new Exception("Total de itens no funil deveria ser 2.");
    }

    echo "OK (5 Colunas Validadas, Total: {$funnel['total']} cards)\n";
    $testsPassed++;
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = "TEST 7: " . $e->getMessage();
}

// =========================================================================
// [TEST 8] PLAN-066 — Métricas Agregadas do Funil (Dashboard Widget)
// -------------------------------------------------------------------------
echo "[TEST 8] Métricas Agregadas do Funil (PLAN-066)... ";
try {
    $metricsResult = $onboardingService->getMetrics(30);

    if (empty($metricsResult['success'])) {
        throw new Exception("Resposta de métricas sem success=true.");
    }

    $m = $metricsResult['metrics'] ?? null;
    if (!is_array($m)) {
        throw new Exception("Campo 'metrics' ausente ou inválido.");
    }

    // Verifica campos obrigatórios
    $requiredFields = [
        'total', 'por_estagio', 'taxa_conversao_pct', 'taxa_abandono_pct',
        'alertas_assinatura_pendente', 'ativacoes_no_periodo',
        'contratos_emitidos_no_periodo', 'periodo_dias'
    ];
    foreach ($requiredFields as $field) {
        if (!array_key_exists($field, $m)) {
            throw new Exception("Campo obrigatório '{$field}' ausente nas métricas.");
        }
    }

    // Verifica os 6 estágios do funil em por_estagio
    $requiredStages = ['PRE_CADASTRO', 'CONTRATO_EMITIDO', 'AGUARDANDO_ASSINATURA',
                       'VALIDAR_PAGAMENTO', 'ATIVO_LIBERADO', 'CANCELADO'];
    foreach ($requiredStages as $stage) {
        if (!array_key_exists($stage, $m['por_estagio'])) {
            throw new Exception("Estágio '{$stage}' ausente em por_estagio.");
        }
        if (!is_int($m['por_estagio'][$stage])) {
            throw new Exception("Contagem do estágio '{$stage}' deve ser inteiro.");
        }
    }

    // Verifica tipos e intervalos
    if (!is_int($m['total']) || $m['total'] < 0) {
        throw new Exception("Campo 'total' deve ser inteiro >= 0.");
    }
    if (!is_float($m['taxa_conversao_pct']) && !is_int($m['taxa_conversao_pct'])) {
        throw new Exception("Campo 'taxa_conversao_pct' deve ser numérico.");
    }
    if ($m['taxa_conversao_pct'] < 0 || $m['taxa_conversao_pct'] > 100) {
        throw new Exception("taxa_conversao_pct deve estar entre 0 e 100 (recebido: {$m['taxa_conversao_pct']}).");
    }
    if ($m['periodo_dias'] !== 30) {
        throw new Exception("periodo_dias deveria ser 30, recebido: {$m['periodo_dias']}.");
    }

    // Consistência: soma dos estágios deve igualar o total
    $sumStages = array_sum($m['por_estagio']);
    if ($sumStages !== $m['total']) {
        throw new Exception("Soma dos estágios ({$sumStages}) difere de total ({$m['total']}).");
    }

    $conv = $m['taxa_conversao_pct'];
    echo "OK (Total: {$m['total']}, Conversão: {$conv}%, Alertas: {$m['alertas_assinatura_pendente']})\n";
    $testsPassed++;
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = "TEST 8: " . $e->getMessage();
}

// =========================================================================
// [TEST 9] PLAN-067 — Download de Todos os Documentos em ZIP
// -------------------------------------------------------------------------
echo "[TEST 9] Download de Todos os Documentos em ZIP (PLAN-067)... ";
try {
    $zipResult = $onboardingService->generateDocumentsZip(1);

    if (empty($zipResult['zip_path']) || empty($zipResult['filename'])) {
        throw new Exception("Estrutura de retorno do ZIP inválida.");
    }

    if (!file_exists($zipResult['zip_path'])) {
        throw new Exception("Arquivo ZIP temporário não foi gerado no disco: {$zipResult['zip_path']}");
    }

    if (strpos($zipResult['filename'], '.zip') === false) {
        throw new Exception("Nome de arquivo não possui extensão .zip");
    }

    // Limpa arquivo temporário do teste
    @unlink($zipResult['zip_path']);

    echo "OK (ZIP gerado: {$zipResult['filename']})\n";
    $testsPassed++;
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = "TEST 9: " . $e->getMessage();
}

// =========================================================================
// [TEST 10] PLAN-067 — Aprovação, Criação de Licenciada & Contrato DRAFT
// -------------------------------------------------------------------------
echo "[TEST 10] Homologação, Validação Manual & Integração (PLAN-067)... ";
try {
    $approveResult = $onboardingService->approveAndIntegrateLicenciada(2, [
        'nome' => 'Dra. Luana Ramos de Souza',
        'cpf' => '654.321.987-00',
        'rg' => '22.333.444-5',
        'email' => 'luana.souza@estetica.com.br',
        'telefone_whatsapp' => '21999998888',
        'instagram' => '@dra.luanaramos',
        'cnpj' => '12.345.678/0001-99',
        'razao_social' => 'Luana Ramos Estética Avançada Ltda',
        'nome_fantasia' => 'Clínica Luana Ramos',
        'is_cnpj_em_abertura' => false,
        'cep' => '22000-000',
        'endereco' => 'Av. Atlântica',
        'numero' => '500',
        'complemento' => 'Sala 302',
        'bairro' => 'Copacabana',
        'cidade' => 'Rio de Janeiro',
        'estado' => 'RJ',
        'admin_notes' => 'Homologada com sucesso pelo gestor.'
    ], 1);

    if (empty($approveResult['success']) || empty($approveResult['licenciada_id'])) {
        throw new Exception("Falha na aprovação da licenciada.");
    }

    if (empty($approveResult['contract_uuid']) || empty($approveResult['sign_url'])) {
        throw new Exception("Contrato DRAFT ou URL de assinatura não foi gerada.");
    }

    // Verifica se a licenciada foi criada no mock de licenciadas
    $licId = $approveResult['licenciada_id'];
    if (!isset($pdo->licenciadas[$licId])) {
        throw new Exception("Licenciada #{$licId} não encontrada na tabela central.");
    }

    $lic = $pdo->licenciadas[$licId];
    if ($lic['name'] !== 'Dra. Luana Ramos de Souza') {
        throw new Exception("Nome da licenciada não corresponde.");
    }
    if ($lic['cpf'] !== '654.321.987-00') { // REGRA 8
        throw new Exception("CPF da licenciada incorreto.");
    }
    if ($lic['cnpj'] !== '12.345.678/0001-99') {
        throw new Exception("CNPJ da licenciada não foi gravado.");
    }
    if ($lic['instagram'] !== '@dra.luanaramos') {
        throw new Exception("Instagram da licenciada não foi gravado.");
    }

    echo "OK (Licenciada ID #{$licId}, Contrato UUID: {$approveResult['contract_uuid']}, Status: CONTRATO_EMITIDO)\n";
    $testsPassed++;
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = "TEST 10: " . $e->getMessage();
}

// =========================================================================
// [TEST 11] Streaming Autenticado e Resolução de Anexos de Onboarding
// -------------------------------------------------------------------------
echo "[TEST 11] Streaming Autenticado e Resolução de Anexos de Onboarding... ";
try {
    // Cria arquivo temporário de teste para validar resolveUploadPath e getDocumentPath
    $testDocDir = sys_get_temp_dir() . '/test_onboarding_uploads';
    if (!file_exists($testDocDir)) {
        @mkdir($testDocDir, 0777, true);
    }
    $sampleDocPath = $testDocDir . '/identidade_test_1.jpg';
    file_put_contents($sampleDocPath, 'FAKE_JPEG_BINARY_DATA');

    // Atualiza mock do lead 1 com o caminho temporário
    $pdo->requests[1]['documento_img'] = $sampleDocPath;

    $docResult = $onboardingService->getDocumentPath(1, 'doc_frente');

    if (!$docResult || empty($docResult['full_path'])) {
        throw new Exception("Falha ao resolver caminho do documento através de getDocumentPath.");
    }

    if ($docResult['mime_type'] !== 'image/jpeg') {
        throw new Exception("MIME Type incorreto detectado: {$docResult['mime_type']}");
    }

    if (!file_exists($docResult['full_path'])) {
        throw new Exception("Arquivo resolvido não existe fisicamente no disco.");
    }

    // Limpa arquivo temporário
    @unlink($sampleDocPath);
    @rmdir($testDocDir);

    echo "OK (Documento resolvido: {$docResult['filename']}, MIME: {$docResult['mime_type']})\n";
    $testsPassed++;
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    $errors[] = "TEST 11: " . $e->getMessage();
}

// =========================================================================
// SUMMARY & VERDICT
// =========================================================================

echo "\n=================================================================\n";
echo "                   RESUMO DA EXECUÇÃO DO TESTE                   \n";
echo "=================================================================\n";
echo "Total de Testes: {$totalTests}\n";
echo "Aprovados:       {$testsPassed}\n";
echo "Falhas:          " . count($errors) . "\n\n";

if ($testsPassed === $totalTests && empty($errors)) {
    echo "VEREDICTO: [PASS] - 100% DOS REQUISITOS BACKEND (PLAN-067) APROVADOS.\n";
    echo "Conformidade Constitucional Nexus Protocol V3.1: 100% OK.\n";
    exit(0);
} else {
    echo "VEREDICTO: [FAIL] - Erros encontrados:\n";
    foreach ($errors as $err) {
        echo " - {$err}\n";
    }
    exit(1);
}

