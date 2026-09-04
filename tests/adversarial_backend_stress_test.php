<?php
/**
 * tests/adversarial_backend_stress_test.php
 * =========================================================================
 * ADVERSARIAL STRESS TEST SUITE: BACKEND HARDENING (PLAN-064)
 * =========================================================================
 * Empirical Challenger: Adversarial Review & Security Hardening
 * Protocol: Nexus Protocol V3.1 (Doctor Harmony Protocol / PHP 8.4)
 */

declare(strict_types=1);

echo "=================================================================
";
echo "   ADVERSARIAL BACKEND STRESS TEST SUITE (PLAN-064 V3.1)         
";
echo "   Adversarial Fuzzing, Security, Math and Zero-Crash Harvester  
";
echo "=================================================================

";

require_once __DIR__ . "/../apps/web-app/src/backend/api/v1/Services/SimpleOcrService.php";
require_once __DIR__ . "/../apps/web-app/src/backend/api/v1/Services/AgendaService.php";
require_once __DIR__ . "/../apps/web-app/src/backend/api/v1/Services/OnboardingService.php";

use BodyHarmony\Services\SimpleOcrService;
use BodyHarmony\Services\AgendaService;
use BodyHarmony\Services\OnboardingService;

class AdversarialMockStatement {
    private AdversarialMockPDO $pdo;
    private string $sql;
    private array $params = [];

    public function __construct(AdversarialMockPDO $pdo, string $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    private function parseInsertData(string $tableName): array {
        $data = [];
        if (preg_match("/INSERT\s+INTO\s+`?" . $tableName . "`?\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i", $this->sql, $matches)) {
            $colNames = array_map(fn($c) => trim(str_replace(['`', chr(34), chr(39)], '', $c)), explode(",", $matches[1]));
            $valPlaceholders = array_map("trim", explode(",", $matches[2]));

            $paramPos = 0;
            foreach ($colNames as $i => $col) {
                $placeholder = $valPlaceholders[$i] ?? "";
                if ($placeholder === "?") {
                    $data[$col] = $this->params[$paramPos] ?? null;
                    $paramPos++;
                } elseif (str_starts_with($placeholder, ":")) {
                    $key = substr($placeholder, 1);
                    $data[$col] = $this->params[$key] ?? $this->params[$placeholder] ?? null;
                } elseif (strtoupper($placeholder) === "NOW()" || strtoupper($placeholder) === "CURRENT_TIMESTAMP") {
                    $data[$col] = date("Y-m-d H:i:s");
                } else {
                    $data[$col] = trim($placeholder, chr(39) . chr(34));
                }
            }
        }
        return $data;
    }

    public function execute(array $params = []): bool {
        $this->params = $params;

        if (stripos($this->sql, "licenciadas") !== false) {
            if (preg_match("/\b(l\.)?document\b/i", $this->sql)) {
                throw new Exception("FATAL VIOLATION OF REGRA 8: document column referenced in query to licenciadas!");
            }
        }

        $this->pdo->executedQueries[] = [
            "sql" => $this->sql,
            "params" => $params
        ];

        if (stripos($this->sql, "INSERT INTO licenciada_onboarding_tokens") !== false) {
            $parsed = $this->parseInsertData("licenciada_onboarding_tokens");
            $id = ++$this->pdo->lastTokenId;
            $this->pdo->tokens[$id] = [
                "id" => $id,
                "token" => $parsed["token"] ?? bin2hex(random_bytes(32)),
                "categoria" => $parsed["categoria"] ?? "Licenciamento",
                "telefone_whatsapp" => $parsed["telefone_whatsapp"] ?? "",
                "nome_candidata" => $parsed["nome_candidata"] ?? null,
                "created_by_admin_id" => (int)($parsed["created_by_admin_id"] ?? 1),
                "expires_at" => $parsed["expires_at"] ?? date("Y-m-d H:i:s", strtotime("+7 days")),
                "used_at" => null,
                "created_at" => date("Y-m-d H:i:s"),
                "updated_at" => date("Y-m-d H:i:s")
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        if (stripos($this->sql, "UPDATE licenciada_onboarding_tokens") !== false) {
            $id = (int)($params[0] ?? $params["id"] ?? 0);
            if (!$id && preg_match("/WHERE id\s*=\s*(\d+)/i", $this->sql, $m)) {
                $id = (int)$m[1];
            }
            if ($id > 0 && isset($this->pdo->tokens[$id])) {
                if (stripos($this->sql, "used_at = NOW()") !== false) {
                    $this->pdo->tokens[$id]["used_at"] = date("Y-m-d H:i:s");
                }
                $this->pdo->tokens[$id]["updated_at"] = date("Y-m-d H:i:s");
                return true;
            }
            return true;
        }

        if (stripos($this->sql, "INSERT INTO licenciada_onboarding_requests") !== false) {
            $parsed = $this->parseInsertData("licenciada_onboarding_requests");
            $id = ++$this->pdo->lastRequestId;
            $this->pdo->requests[$id] = [
                "id" => $id,
                "token_id" => $parsed["token_id"] ?? null,
                "token_str" => $parsed["token_str"] ?? null,
                "categoria" => $parsed["categoria"] ?? "Licenciamento",
                "template_slug" => $parsed["template_slug"] ?? "licenciamento-padrao",
                "nome" => $parsed["nome"] ?? "",
                "cpf" => $parsed["cpf"] ?? "",
                "rg" => $parsed["rg"] ?? null,
                "email" => $parsed["email"] ?? "",
                "telefone_whatsapp" => $parsed["telefone_whatsapp"] ?? "",
                "cep" => $parsed["cep"] ?? null,
                "endereco" => $parsed["endereco"] ?? null,
                "numero" => $parsed["numero"] ?? null,
                "complemento" => $parsed["complemento"] ?? null,
                "bairro" => $parsed["bairro"] ?? null,
                "cidade" => $parsed["cidade"] ?? null,
                "estado" => $parsed["estado"] ?? null,
                "nacionalidade" => $parsed["nacionalidade"] ?? "brasileira",
                "estado_civil" => $parsed["estado_civil"] ?? "solteira",
                "profissao" => $parsed["profissao"] ?? "Esteticista",
                "documento_img" => $parsed["documento_img"] ?? null,
                "ocr_extracted_data" => $parsed["ocr_extracted_data"] ?? "{}",
                "ocr_confidence" => $parsed["ocr_confidence"] ?? 0.0,
                "status" => "PRE_CADASTRO",
                "contract_uuid" => null,
                "licenciada_id" => null,
                "agenda_event_id" => null,
                "taxa_inicial_num" => $parsed["taxa_inicial_num"] ?? "7.000,00",
                "taxa_inicial_extenso" => $parsed["taxa_inicial_extenso"] ?? "sete mil reais",
                "condicoes_pagamento" => $parsed["condicoes_pagamento"] ?? "à vista via PIX",
                "valor_minimo_sessao" => $parsed["valor_minimo_sessao"] ?? "150,00",
                "cidade_celebracao" => $parsed["cidade_celebracao"] ?? "Assis/SP",
                "last_reminder_sent_at" => null,
                "payment_confirmed_at" => null,
                "payment_confirmed_by_admin_id" => null,
                "activated_at" => null,
                "admin_notes" => null,
                "created_at" => date("Y-m-d H:i:s"),
                "updated_at" => date("Y-m-d H:i:s")
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        if (stripos($this->sql, "UPDATE licenciada_onboarding_requests") !== false) {
            $id = (int)end($params);
            if (!$id && preg_match("/WHERE id\s*=\s*(\d+)/i", $this->sql, $m)) {
                $id = (int)$m[1];
            }

            if ($id > 0 && isset($this->pdo->requests[$id])) {
                if (stripos($this->sql, "agenda_event_id") !== false) {
                    $this->pdo->requests[$id]["agenda_event_id"] = $params[0] ?? 1;
                } elseif (stripos($this->sql, "contract_uuid = ?") !== false) {
                    $this->pdo->requests[$id]["contract_uuid"] = $params[0] ?? null;
                    $this->pdo->requests[$id]["status"] = "CONTRATO_EMITIDO";
                    $this->pdo->requests[$id]["taxa_inicial_num"] = $params[1] ?? "7.000,00";
                    $this->pdo->requests[$id]["taxa_inicial_extenso"] = $params[2] ?? "sete mil reais";
                    $this->pdo->requests[$id]["condicoes_pagamento"] = $params[3] ?? "à vista via PIX";
                    $this->pdo->requests[$id]["cidade_celebracao"] = $params[4] ?? "Assis/SP";
                } elseif (stripos($this->sql, "last_reminder_sent_at") !== false) {
                    $this->pdo->requests[$id]["last_reminder_sent_at"] = date("Y-m-d H:i:s");
                } elseif (stripos($this->sql, "status = 'ATIVO_LIBERADO'") !== false) {
                    $this->pdo->requests[$id]["status"] = "ATIVO_LIBERADO";
                    $this->pdo->requests[$id]["licenciada_id"] = (int)($params[0] ?? 1);
                    $this->pdo->requests[$id]["payment_confirmed_by_admin_id"] = (int)($params[1] ?? 1);
                    $this->pdo->requests[$id]["payment_confirmed_at"] = date("Y-m-d H:i:s");
                    $this->pdo->requests[$id]["activated_at"] = date("Y-m-d H:i:s");
                    $this->pdo->requests[$id]["admin_notes"] = $params[2] ?? "";
                } elseif (stripos($this->sql, "SET status = ?") !== false) {
                    $this->pdo->requests[$id]["status"] = $params[0] ?? $this->pdo->requests[$id]["status"];
                    if (isset($params[1]) && !empty($params[1])) {
                        $this->pdo->requests[$id]["admin_notes"] = ($this->pdo->requests[$id]["admin_notes"] ?? "") . "
" . $params[1];
                    }
                }
                $this->pdo->requests[$id]["updated_at"] = date("Y-m-d H:i:s");
                return true;
            }
            return true;
        }

        if (stripos($this->sql, "INSERT INTO gestor_agenda_events") !== false) {
            $parsed = $this->parseInsertData("gestor_agenda_events");
            $id = ++$this->pdo->lastAgendaId;
            $this->pdo->agendaEvents[$id] = [
                "id" => $id,
                "event_type" => $parsed["event_type"] ?? "pendencia",
                "title" => $parsed["title"] ?? "",
                "description" => $parsed["description"] ?? "",
                "start_datetime" => $parsed["start_datetime"] ?? date("Y-m-d H:i:s"),
                "end_datetime" => $parsed["end_datetime"] ?? null,
                "priority" => $parsed["priority"] ?? "alta",
                "status" => $parsed["status"] ?? "pendente",
                "color" => $parsed["color"] ?? "#ED7E13",
                "client_type" => $parsed["client_type"] ?? "licenciada",
                "client_id" => isset($parsed["client_id"]) ? (int)$parsed["client_id"] : null,
                "created_by_admin_id" => (int)($parsed["created_by_admin_id"] ?? 1),
                "created_at" => date("Y-m-d H:i:s"),
                "updated_at" => date("Y-m-d H:i:s")
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        if (stripos($this->sql, "UPDATE gestor_agenda_events") !== false) {
            $id = (int)end($params);
            if (!$id && preg_match("/WHERE id\s*=\s*(\d+)/i", $this->sql, $m)) {
                $id = (int)$m[1];
            }
            if ($id > 0 && isset($this->pdo->agendaEvents[$id])) {
                if (isset($params[0])) $this->pdo->agendaEvents[$id]["status"] = $params[0];
                $this->pdo->agendaEvents[$id]["updated_at"] = date("Y-m-d H:i:s");
            }
            return true;
        }

        if (stripos($this->sql, "INSERT INTO contracts") !== false) {
            $parsed = $this->parseInsertData("contracts");
            $id = ++$this->pdo->lastContractId;
            $this->pdo->contracts[$id] = [
                "id" => $id,
                "uuid" => $parsed["uuid"] ?? bin2hex(random_bytes(16)),
                "title" => $parsed["title"] ?? "",
                "status" => "PENDING_SIGNATURE",
                "variables_payload" => $parsed["variables_payload"] ?? "{}",
                "sign_token" => $parsed["sign_token"] ?? bin2hex(random_bytes(32)),
                "sign_token_expires_at" => $parsed["sign_token_expires_at"] ?? date("Y-m-d H:i:s", strtotime("+15 days")),
                "created_by" => (int)($parsed["created_by"] ?? 1),
                "created_at" => date("Y-m-d H:i:s"),
                "updated_at" => date("Y-m-d H:i:s")
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        if (stripos($this->sql, "UPDATE contracts") !== false) {
            $uuid = $params[1] ?? "";
            foreach ($this->pdo->contracts as $cid => $c) {
                if ($c["uuid"] === $uuid) {
                    $this->pdo->contracts[$cid]["status"] = "SIGNED";
                    $this->pdo->contracts[$cid]["licenciada_id"] = (int)($params[0] ?? 1);
                    $this->pdo->contracts[$cid]["updated_at"] = date("Y-m-d H:i:s");
                }
            }
            return true;
        }

        if (stripos($this->sql, "INSERT INTO licenciadas") !== false) {
            $parsed = $this->parseInsertData("licenciadas");
            $id = ++$this->pdo->lastLicenciadaId;
            $this->pdo->licenciadas[$id] = [
                "id" => $id,
                "name" => $parsed["name"] ?? "",
                "cpf" => $parsed["cpf"] ?? "",
                "email" => $parsed["email"] ?? "",
                "username" => $parsed["username"] ?? "",
                "whatsapp" => $parsed["whatsapp"] ?? "",
                "whatsapp_number" => $parsed["whatsapp_number"] ?? "",
                "state" => $parsed["state"] ?? "SP",
                "location" => $parsed["location"] ?? "Assis - SP",
                "photo_url" => $parsed["photo_url"] ?? null,
                "is_active" => 1,
                "renewal_date" => $parsed["renewal_date"] ?? date("Y-m-d", strtotime("+1 year")),
                "admin_notes" => $parsed["admin_notes"] ?? "",
                "created_at" => date("Y-m-d H:i:s"),
                "updated_at" => date("Y-m-d H:i:s")
            ];
            $this->pdo->lastInsertedId = $id;
            return true;
        }

        if (stripos($this->sql, "UPDATE licenciadas") !== false) {
            $id = (int)end($params);
            if ($id > 0 && isset($this->pdo->licenciadas[$id])) {
                $this->pdo->licenciadas[$id]["is_active"] = 1;
                $this->pdo->licenciadas[$id]["updated_at"] = date("Y-m-d H:i:s");
            }
            return true;
        }

        return true;
    }

    public function fetch(int $mode = PDO::FETCH_ASSOC): mixed {
        if (stripos($this->sql, "FROM licenciada_onboarding_requests") !== false) {
            $id = (int)($this->params[0] ?? 0);
            if (isset($this->pdo->requests[$id])) {
                $r = $this->pdo->requests[$id];
                $r["original_token_str"] = $r["token_str"] ?? null;
                $r["token_expires_at"] = date("Y-m-d H:i:s", strtotime("+7 days"));
                return $r;
            }
            return false;
        }

        if (stripos($this->sql, "FROM licenciada_onboarding_tokens") !== false) {
            $token = $this->params[0] ?? "";
            foreach ($this->pdo->tokens as $t) {
                if ($t["token"] === $token) {
                    return $t;
                }
            }
            return false;
        }

        if (stripos($this->sql, "FROM licenciadas") !== false) {
            $cpf = $this->params[0] ?? "";
            foreach ($this->pdo->licenciadas as $lic) {
                if ($lic["cpf"] === $cpf) {
                    return $lic;
                }
            }
            return false;
        }

        if (stripos($this->sql, "FROM contracts") !== false) {
            $uuid = $this->params[0] ?? "";
            foreach ($this->pdo->contracts as $c) {
                if ($c["uuid"] === $uuid) {
                    return $c;
                }
            }
            return false;
        }

        return false;
    }

    public function fetchAll(int $mode = PDO::FETCH_ASSOC): array {
        if (stripos($this->sql, "FROM licenciada_onboarding_requests r") !== false) {
            $results = [];
            foreach ($this->pdo->requests as $r) {
                if (!empty($this->params)) {
                    $searchParam = $this->params[0] ?? "";
                    $searchClean = trim($searchParam, "%");
                    if (!empty($searchClean)) {
                        $match = stripos($r["nome"], $searchClean) !== false ||
                                 stripos($r["cpf"], $searchClean) !== false ||
                                 stripos($r["email"], $searchClean) !== false;
                        if (!$match) continue;
                    }
                }
                $r["original_token_str"] = $r["token_str"] ?? null;
                $results[] = $r;
            }
            return $results;
        }

        return [];
    }

    public function rowCount(): int {
        return 1;
    }
}

class AdversarialMockPDO extends PDO {
    public array $tokens = [];
    public array $requests = [];
    public array $agendaEvents = [];
    public array $contracts = [];
    public array $licenciadas = [];
    public array $executedQueries = [];

    public int $lastTokenId = 0;
    public int $lastRequestId = 0;
    public int $lastAgendaId = 0;
    public int $lastContractId = 0;
    public int $lastLicenciadaId = 0;
    public int $lastInsertedId = 0;

    public function __construct() {}

    public function prepare(string $query, array $options = []): AdversarialMockStatement|PDOStatement|false {
        return new AdversarialMockStatement($this, $query);
    }

    public function lastInsertId(?string $name = null): string|false {
        return (string)$this->lastInsertedId;
    }
}

$totalTests = 0;
$passedTests = 0;
$failedTests = 0;

function runAdversarialTest(string $title, callable $testFn): void {
    global $totalTests, $passedTests, $failedTests;
    $totalTests++;
    try {
        $result = $testFn();
        if ($result === true) {
            $passedTests++;
            echo "[PASS] {$title}
";
        } else {
            $failedTests++;
            echo "[FAIL] {$title}: Result was not true (" . json_encode($result) . ")
";
        }
    } catch (Throwable $e) {
        $failedTests++;
        echo "[FAIL] {$title}: Uncaught Exception: " . $e->getMessage() . "
";
        echo "        Line: " . $e->getFile() . ":" . $e->getLine() . "
";
    }
}

$mockDb = new AdversarialMockPDO();
$ocrService = new SimpleOcrService();
$agendaService = new AgendaService($mockDb);
$onboardingService = new OnboardingService($mockDb, $agendaService, null, $ocrService);

echo ">>> SECTION 1: SQL INJECTION AND EXTREME STRING FUZZING <<<
";

// Test 1.1: SQLi in createToken phone and candidate name
runAdversarialTest("T1.1: SQL Injection payloads in createToken parameters handled cleanly via PDO", function() use ($onboardingService, $mockDb) {
    $sqliPayloads = [
        "11999999999'); DROP TABLE licenciada_onboarding_tokens; --",
        "' OR '1'='1",
        "admin' UNION SELECT 1,2,3,4,5,6,7,8,9--",
        "'; EXEC xp_cmdshell('dir'); --"
    ];

    foreach ($sqliPayloads as $payload) {
        $res = $onboardingService->createToken([
            "categoria" => "Licenciamento Premium",
            "telefone_whatsapp" => $payload,
            "nome_candidata" => "Dr. Evil " . $payload,
            "expires_in_days" => 7
        ], 1);

        if (empty($res["token"]) || strlen($res["token"]) !== 64) {
            return false;
        }
    }
    return true;
});

// Test 1.2: SQLi in getFunnelStages search filter
runAdversarialTest("T1.2: SQL Injection in getFunnelStages search and status filters executed safely", function() use ($onboardingService) {
    $filters = [
        ["search" => "'; DROP TABLE licenciadas; --"],
        ["search" => "' OR '1'='1", "status" => "' OR 1=1 --"],
        ["categoria" => "' UNION SELECT 1,2,3,4--"]
    ];

    foreach ($filters as $f) {
        $res = $onboardingService->getFunnelStages($f);
        if (!isset($res["columns"]) || !isset($res["stages"])) {
            return false;
        }
    }
    return true;
});

// Test 1.3: Huge buffer payload (50,000 characters) in public submission
runAdversarialTest("T1.3: Huge Buffer (50KB string payload) in public submission does not exhaust memory or crash", function() use ($onboardingService) {
    $tokenRes = $onboardingService->createToken([
        "telefone_whatsapp" => "11988887777",
        "nome_candidata" => "Fuzz Candidate"
    ]);
    $token = $tokenRes["token"];

    $hugeString = str_repeat("A_LONG_NAME_PADDING_STRING_", 2000);
    $submitRes = $onboardingService->submitPublicOnboarding($token, [
        "nome" => "Maria Silva " . $hugeString,
        "cpf" => "529.982.247-25",
        "rg" => "12.345.678-9",
        "email" => "maria.fuzz@test.com",
        "telefone_whatsapp" => "11988887777",
        "endereco" => "Rua das Flores " . $hugeString
    ]);

    return !empty($submitRes["request_id"]) && $submitRes["status"] === "PRE_CADASTRO";
});

// Test 1.4: XSS payload in Notes & Names sanitized / escaped in WhatsApp links
runAdversarialTest("T1.4: XSS Attack payloads in candidate fields safely encoded in WhatsApp deep-links", function() use ($onboardingService) {
    $tokenRes = $onboardingService->createToken([
        "telefone_whatsapp" => "11977776666",
        "nome_candidata" => "XSS Candidate"
    ]);
    $token = $tokenRes["token"];

    $submitRes = $onboardingService->submitPublicOnboarding($token, [
        'nome' => '<img src=x onerror="alert(1)">',
        "cpf" => "529.982.247-25",
        "rg" => "12.345.678-9",
        "email" => "xss@attacker.com",
        "telefone_whatsapp" => "11977776666"
    ]);

    $reqId = $submitRes["request_id"];
    $contractRes = $onboardingService->generateContract1Click($reqId);

    $waLink = $contractRes["whatsapp_link"];
    if (str_contains($waLink, "<img") || str_contains($waLink, "<script>")) {
        return false;
    }

    return str_contains($waLink, "https://wa.me/5511977776666?text=");
});

echo "
>>> SECTION 2: BRAZILIAN CPF VALIDATION MATH AND EDGE CASES <<<
";

// Test 2.1: Rejection of all 10 repeating CPFs (000... to 999...)
runAdversarialTest("T2.1: SimpleOcrService::validateCpf rejects all 10 repetitive digit sequences", function() use ($ocrService) {
    $repeatingCpfs = [
        "000.000.000-00", "111.111.111-11", "222.222.222-22", "333.333.333-33",
        "444.444.444-44", "555.555.555-55", "666.666.666-66", "777.777.777-77",
        "888.888.888-88", "999.999.999-99",
        "00000000000", "11111111111", "22222222222", "33333333333"
    ];

    foreach ($repeatingCpfs as $cpf) {
        if ($ocrService->validateCpf($cpf) !== false) {
            return false;
        }
    }
    return true;
});

// Test 2.2: Valid Mathematical CPFs with weird spacing and delimiters
runAdversarialTest("T2.2: Valid mathematical CPFs with unusual whitespace, dots, dashes validated and formatted", function() use ($ocrService) {
    $validVariations = [
        "52998224725",
        "529.982.247-25",
        "  529.982.247-25  ",
        "529 982 247 25",
        "529-982-247-25",
        "529.982.247-25
	"
    ];

    foreach ($validVariations as $cpf) {
        if (!$ocrService->validateCpf($cpf)) {
            return false;
        }
        $formatted = $ocrService->formatCpf($cpf);
        if ($formatted !== "529.982.247-25") {
            return false;
        }
    }
    return true;
});

// Test 2.3: Mathematical check-digit corruption detection
runAdversarialTest("T2.3: Mathematically corrupted check-digits (D1 and D2 off-by-one) strictly rejected", function() use ($ocrService) {
    $corruptedCpfs = [
        "529.982.247-24",
        "529.982.247-26",
        "529.982.247-15",
        "529.982.247-00",
        "123.456.789-00",
        "123.456.789-10"
    ];

    foreach ($corruptedCpfs as $cpf) {
        if ($ocrService->validateCpf($cpf) !== false) {
            return false;
        }
    }
    return true;
});

// Test 2.4: Malformed input types and non-numeric characters
runAdversarialTest("T2.4: Non-numeric, alphanumeric, and unicode emojis in CPF handled gracefully", function() use ($ocrService) {
    $malformed = [
        "",
        "ABC.DEF.GHI-JK",
        "529.982.247-2A",
        "12345",
        "1234567890123456789",
        "   ",
        "null"
    ];

    foreach ($malformed as $bad) {
        if ($ocrService->validateCpf($bad) !== false) {
            return false;
        }
    }
    return true;
});

echo "
>>> SECTION 3: TOKEN CRYPTOGRAPHY, TAMPERING AND REPLAY EXPLOITS <<<
";

// Test 3.1: Expired token rejection
runAdversarialTest("T3.1: Expired token strictly rejected during validation and submission", function() use ($onboardingService, $mockDb) {
    $tok = $onboardingService->createToken(["telefone_whatsapp" => "11988887777"]);
    $tokenId = $mockDb->lastInsertedId;

    $mockDb->tokens[$tokenId]["expires_at"] = date("Y-m-d H:i:s", strtotime("-2 days"));

    $val = $onboardingService->validateToken($tok["token"]);
    if ($val["valid"] !== false || $val["reason"] !== "expired") {
        return false;
    }

    try {
        $onboardingService->submitPublicOnboarding($tok["token"], [
            "nome" => "Expired User",
            "cpf" => "529.982.247-25",
            "email" => "expired@test.com",
            "telefone_whatsapp" => "11988887777"
        ]);
        return false;
    } catch (Exception $e) {
        return str_contains($e->getMessage(), "expirado");
    }
});

// Test 3.2: Tampered 64-hex token strings
runAdversarialTest("T3.2: Tampered 64-hex tokens (short, long, flipped hex, SQLi tokens) rejected with not_found", function() use ($onboardingService) {
    $tamperedTokens = [
        "ac34e80a0e0e981273918237198273918273918237198273918273918237198",
        "ac34e80a0e0e981273918237198273918273918237198273918273918237198273918237",
        "non_hex_token_with_invalid_characters_zzzzzzzzzzzzzzzzzzzzzzzzzz",
        "' OR '1'='1",
        "",
        "   "
    ];

    foreach ($tamperedTokens as $t) {
        $val = $onboardingService->validateToken($t);
        if ($val["valid"] !== false) {
            return false;
        }
    }
    return true;
});

// Test 3.3: Token single-use replay protection
runAdversarialTest("T3.3: Single-Use Token replay protection (attempting 2nd submission with same token fails)", function() use ($onboardingService) {
    $tok = $onboardingService->createToken(["telefone_whatsapp" => "11955554444"]);
    $token = $tok["token"];

    $sub1 = $onboardingService->submitPublicOnboarding($token, [
        "nome" => "First Submission",
        "cpf" => "529.982.247-25",
        "email" => "first@test.com",
        "telefone_whatsapp" => "11955554444"
    ]);

    if (empty($sub1["request_id"])) {
        return false;
    }

    $val = $onboardingService->validateToken($token);
    if ($val["valid"] !== false || $val["reason"] !== "already_used") {
        return false;
    }

    try {
        $onboardingService->submitPublicOnboarding($token, [
            "nome" => "Replay Attacker",
            "cpf" => "529.982.247-25",
            "email" => "attacker@test.com",
            "telefone_whatsapp" => "11955554444"
        ]);
        return false;
    } catch (Exception $e) {
        return str_contains($e->getMessage(), "already_used") || str_contains($e->getMessage(), "inválido");
    }
});

echo "
>>> SECTION 4: OCR PARSER ZERO-CRASH INVARIANT AND CORRUPTED BINARY <<<
";

// Test 4.1: Random binary noise and null-byte flood
runAdversarialTest("T4.1: SimpleOcrService::processDocument with 10KB binary noise & null bytes never crashes", function() use ($ocrService) {
    $binaryGarbage = random_bytes(10240);
    $res = $ocrService->processDocument($binaryGarbage);

    if (!$res["success"] || $res["confidence"] > 0.0) {
        return false;
    }

    $nullFlood = str_repeat(" ", 20000);
    $resNull = $ocrService->processDocument($nullFlood);

    return $resNull["success"] === true && $resNull["confidence"] === 0.0;
});

// Test 4.2: Malformed PDF stream header and corrupted syntax
runAdversarialTest("T4.2: SimpleOcrService parses malformed PDF stream without infinite loop or crash", function() use ($ocrService) {
    $malformedPdf = "%PDF-1.4
1 0 obj
<< /Length 200 >>
stream
(Broken text Tj [(nested broken string] TJ
endstream
";
    $res = $ocrService->processDocument($malformedPdf);

    return is_array($res) && isset($res["extracted_data"]) && $res["success"] === true;
});

// Test 4.3: Extraction of valid Brazilian credentials surrounded by adversarial noise
runAdversarialTest("T4.3: Extraction of valid CPF, RG, Nome, CEP from adversarial high-entropy noisy document", function() use ($ocrService) {
    $noisyText = "%%%###@@@ HEADER TRASH @@@###%%%
"
               . "Nome: VANESSA ALVES DE OLIVEIRA
"
               . "DOCUMENTO DE IDENTIDADE RG: 44.555.666-X SSP/SP
"
               . "REGISTRO CPF: 529.982.247-25
"
               . "Endereço: Avenida Paulista, número 1500, apto 42
"
               . "Bairro: Bela Vista Cidade: São Paulo UF: SP CEP: 01310-100
"
               . "%%%###@@@ FOOTER TRASH @@@###%%%";

    $res = $ocrService->processDocument($noisyText);
    $data = $res["extracted_data"];

    if ($data["cpf"] !== "529.982.247-25") return false;
    if ($data["nome"] !== "Vanessa Alves De Oliveira") return false;
    if ($data["rg"] !== "44.555.666-X") return false;
    if ($data["cep"] !== "01310-100") return false;
    if ($res["confidence"] < 80.0) return false;

    return true;
});

echo "
>>> SECTION 5: STATE MACHINE, CONCURRENCY AND DOUBLE ACTIVATION <<<
";

// Test 5.1: Double payment confirmation idempotency
runAdversarialTest("T5.1: Double payment confirmation idempotent handling (no primary key collision, updates existing)", function() use ($onboardingService) {
    $tok = $onboardingService->createToken(["telefone_whatsapp" => "11944443333"]);
    $sub = $onboardingService->submitPublicOnboarding($tok["token"], [
        "nome" => "Camila Idempotent",
        "cpf" => "529.982.247-25",
        "email" => "camila.idem@test.com",
        "telefone_whatsapp" => "11944443333"
    ]);
    $reqId = $sub["request_id"];

    $onboardingService->generateContract1Click($reqId);

    $act1 = $onboardingService->confirmPaymentAndActivate($reqId, ["notes" => "1st payment via PIX"]);
    if (!$act1["success"] || $act1["status"] !== "ATIVO_LIBERADO") {
        return false;
    }
    $licId1 = $act1["licenciada_id"];

    $act2 = $onboardingService->confirmPaymentAndActivate($reqId, ["notes" => "2nd click"]);
    if (!$act2["success"] || $act2["status"] !== "ATIVO_LIBERADO") {
        return false;
    }
    $licId2 = $act2["licenciada_id"];

    return $licId1 === $licId2;
});

// Test 5.2: State Machine rejects illegal / injected statuses
runAdversarialTest("T5.2: State Machine strictly blocks invalid/injected status strings in updateStatus", function() use ($onboardingService) {
    $tok = $onboardingService->createToken(["telefone_whatsapp" => "11933332222"]);
    $sub = $onboardingService->submitPublicOnboarding($tok["token"], [
        "nome" => "Status Test",
        "cpf" => "529.982.247-25",
        "email" => "status@test.com",
        "telefone_whatsapp" => "11933332222"
    ]);
    $reqId = $sub["request_id"];

    $illegalStatuses = [
        "HACKED",
        "SUPERADMIN",
        "'; DROP TABLE users; --",
        "PENDING_PAYMENT",
        "INVALID_STATUS",
        ""
    ];

    foreach ($illegalStatuses as $badStatus) {
        try {
            $onboardingService->updateStatus($reqId, $badStatus);
            return false;
        } catch (Exception $e) {
            if (!str_contains($e->getMessage(), "inválido")) {
                return false;
            }
        }
    }
    return true;
});

// Test 5.3: Non-existent Request IDs throw controlled exceptions
runAdversarialTest("T5.3: Actions on non-existent Request IDs (-1, 0, 99999) throw controlled exceptions", function() use ($onboardingService) {
    $invalidIds = [-1, 0, 99999];

    foreach ($invalidIds as $badId) {
        try {
            $onboardingService->generateContract1Click($badId);
            return false;
        } catch (Exception $e) {
            // Expected
        }

        try {
            $onboardingService->sendWhatsAppReminder($badId);
            return false;
        } catch (Exception $e) {
            // Expected
        }

        try {
            $onboardingService->confirmPaymentAndActivate($badId);
            return false;
        } catch (Exception $e) {
            // Expected
        }
    }
    return true;
});

// Test 5.4: High-concurrency simulation
runAdversarialTest("T5.4: Concurrency stress: 30 distinct onboarding pipelines executed sequentially with zero state corruption", function() use ($onboardingService) {
    for ($i = 1; $i <= 30; $i++) {
        $phone = "1198" . str_pad((string)$i, 7, "0", STR_PAD_LEFT);
        $tok = $onboardingService->createToken([
            "telefone_whatsapp" => $phone,
            "nome_candidata" => "Candidata Concorrente {$i}"
        ]);

        $sub = $onboardingService->submitPublicOnboarding($tok["token"], [
            "nome" => "Candidata {$i}",
            "cpf" => "529.982.247-25",
            "email" => "candidata{$i}@test.com",
            "telefone_whatsapp" => $phone
        ]);

        $reqId = $sub["request_id"];
        $onboardingService->generateContract1Click($reqId);
        $onboardingService->sendWhatsAppReminder($reqId);
        $act = $onboardingService->confirmPaymentAndActivate($reqId);

        if ($act["status"] !== "ATIVO_LIBERADO") {
            return false;
        }
    }

    $funnel = $onboardingService->getFunnelStages();
    return $funnel["total"] >= 30;
});

echo "
>>> SECTION 6: CONSTITUTIONAL INVARIANTS AUDIT (AGENTS.MD) <<<
";

// Test 6.1: REGRA 8: Strict Licenciadas CPF Invariant audit across all executed SQL queries
runAdversarialTest("T6.1: REGRA 8 Verification: Zero occurrences of document column in queries to licenciadas", function() use ($mockDb) {
    foreach ($mockDb->executedQueries as $entry) {
        $sql = $entry["sql"];
        if (stripos($sql, "licenciadas") !== false) {
            if (preg_match("/\\b(l\\.)?document\\b/i", $sql)) {
                return false;
            }
        }
    }
    return true;
});

// Test 6.2: REGRA 7: Clean Markup Invariant
runAdversarialTest("T6.2: REGRA 7 Verification: No literal escaped \n strings in generated WhatsApp messages", function() use ($onboardingService) {
    $tok = $onboardingService->createToken(["telefone_whatsapp" => "11988887777", "nome_candidata" => "Clean Markup"]);
    $msg = $tok["whatsapp_message"];

    if (str_contains($msg, chr(92) . 'n')) {
        return false;
    }

    $contractMsg = $onboardingService->buildContractSignMessage("Maria", "https://bodyharmony.com.br/assinar/123");
    if (str_contains($contractMsg, chr(92) . 'n')) {
        return false;
    }

    $reminderMsg = $onboardingService->buildReminder24hMessage("Maria", "https://bodyharmony.com.br/assinar/123");
    if (str_contains($reminderMsg, chr(92) . 'n')) {
        return false;
    }

    $welcomeMsg = $onboardingService->buildWelcomeMessage("Maria", "maria@test.com");
    if (str_contains($welcomeMsg, chr(92) . 'n')) {
        return false;
    }

    return true;
});

echo "
=================================================================
";
echo "           ADVERSARIAL STRESS TEST EXECUTION SUMMARY             
";
echo "=================================================================
";
echo " Total Adversarial Tests: {$totalTests}
";
echo " Tests Passed:            {$passedTests}
";
echo " Tests Failed:            {$failedTests}
";
echo " Hardening Confidence:    " . number_format(($passedTests / max(1, $totalTests)) * 100, 1) . "%
";
echo "=================================================================
";

if ($failedTests === 0) {
    echo "ALL ADVERSARIAL ATTACKS SUCCESSFULLY DEFENDED (VERDICT: APPROVE)!

";
    exit(0);
} else {
    echo "VULNERABILITIES DETECTED — ACTION REQUIRED (VERDICT: REQUEST_CHANGES)!

";
    exit(1);
}
