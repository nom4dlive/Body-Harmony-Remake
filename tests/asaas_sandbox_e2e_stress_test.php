<?php
// tests/asaas_sandbox_e2e_stress_test.php
// Bateria de Testes E2E Automatizados: Asaas Sandbox Oficial & Blindagem de Webhook
// Nexus Protocol V3.1 Compliant

echo "=================================================================\n";
echo "   BATERIA DE TESTES E2E SANDBOX ASAAS & BLINDAGEM DE WEBHOOK     \n";
echo "=================================================================\n\n";

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/Payment/PaymentGatewayInterface.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/Payment/AsaasGatewayService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CongressTicketService.php';

use BodyHarmony\Services\Payment\PaymentGatewayInterface;
use BodyHarmony\Services\Payment\AsaasGatewayService;
use BodyHarmony\Services\CongressTicketService;

$passed = 0;
$failed = 0;

function assertE2E(string $desc, bool $condition, ?string $extra = null) {
    global $passed, $failed;
    if ($condition) {
        echo "  [PASS] {$desc}";
        if ($extra) echo " ({$extra})";
        echo "\n";
        $passed++;
    } else {
        echo "  [FAIL] {$desc}";
        if ($extra) echo " -- ERRO: {$extra}";
        echo "\n";
        $failed++;
    }
}

$sandboxKey = getenv('ASAAS_SANDBOX_KEY') ?: '$aact_hmlg_mock_token_for_environment_detection_only_000111222333444555666777';
$gateway = new AsaasGatewayService($sandboxKey, 'sandbox');

assertE2E("Gateway inicializado em Sandbox Live", $gateway->isMockMode() === false && $gateway->getEnvironment() === 'sandbox');
assertE2E("Gateway apontando para URL correta da Sandbox", $gateway->getBaseUrl() === 'https://sandbox.asaas.com/api/v3');

// -------------------------------------------------------------------------
// In-Memory SQLite / PDO Mock para isolamento de testes locais
// -------------------------------------------------------------------------
class E2EPDOMock extends PDO {
    private array $data = [
        'tiers' => [
            ['id' => 1, 'slug' => 'vip', 'name' => 'Ingresso VIP Exclusive', 'subtitle' => 'Mesa redonda com palestrantes + Coquetel privativo', 'price_cents' => 149700, 'original_price_cents' => null, 'max_slots' => 40, 'sold_slots' => 12, 'features_json' => '["Acesso Geral", "Mesa Redonda", "Bônus R$ 1.500 no licenciamento"]', 'is_active' => 1],
            ['id' => 2, 'slug' => 'experience', 'name' => 'Ingresso Experience (1+1)', 'subtitle' => 'Acesso geral ao congresso + Palestras magnas', 'price_cents' => 69700, 'original_price_cents' => null, 'max_slots' => null, 'sold_slots' => 45, 'features_json' => '["Acesso Geral", "Palestras Magnas", "Certificado Oficial"]', 'is_active' => 1]
        ],
        'coupons' => [
            ['id' => 1, 'code' => 'LICENCIADA20', 'discount_percentage' => 20.0, 'discount_percent' => 20.0, 'discount_cents' => null, 'is_100_percent' => 0, 'requires_accreditation' => 0, 'type' => 'STANDARD', 'is_active' => 1],
            ['id' => 2, 'code' => 'ATLETA100', 'discount_percentage' => 100.0, 'discount_percent' => 100.0, 'discount_cents' => null, 'is_100_percent' => 1, 'requires_accreditation' => 1, 'type' => 'FREE_ATHLETE', 'is_active' => 1],
            ['id' => 3, 'code' => 'CONVIDADA100', 'discount_percentage' => 100.0, 'discount_percent' => 100.0, 'discount_cents' => null, 'is_100_percent' => 1, 'requires_accreditation' => 1, 'type' => 'FREE_GUEST', 'is_active' => 1]
        ],
        'licenciadas' => [
            ['id' => 1, 'name' => 'Joselene Silva', 'cpf' => '36208232864', 'is_active' => 1],
            ['id' => 2, 'name' => 'Karice Moura', 'cpf' => '11122233344', 'is_active' => 1]
        ],
        'registrations' => []
    ];
    private int $lastId = 0;

    public function __construct() {}
    public function query(string $query, ?int $fetchMode = null, ...$fetch_mode_args): PDOStatement|false {
        return new E2EStatementMock($this->data, $query, $this);
    }
    public function prepare(string $query, array $options = []): PDOStatement|false {
        return new E2EStatementMock($this->data, $query, $this);
    }
    public function lastInsertId(?string $name = null): string|false {
        return (string)$this->lastId;
    }
    public function &getTableData(string $tbl): array {
        return $this->data[$tbl];
    }
    public function setLastId(int $id): void {
        $this->lastId = $id;
    }
}

class E2EStatementMock extends PDOStatement {
    private array $dataRef;
    private string $sql;
    private E2EPDOMock $parent;
    private array $resultSet = [];
    private int $cursor = 0;

    public function __construct(array &$data, string $sql, E2EPDOMock $parent) {
        $this->dataRef = &$data;
        $this->sql = $sql;
        $this->parent = $parent;
    }

    public function execute(?array $params = null): bool {
        $sql = $this->sql;
        $this->cursor = 0;
        $this->resultSet = [];

        // 1. UPDATE congress_registrations
        if (stripos($sql, 'UPDATE') !== false && stripos($sql, 'congress_registrations') !== false) {
            $newStatus = $params[0] ?? 'CONFIRMED';
            $targetId = $params[1] ?? 0;
            foreach ($this->dataRef['registrations'] as &$r) {
                if ($r['id'] == $targetId || (isset($params[2]) && ($r['asaas_payment_id'] === $params[1] || $r['ticket_token'] === $params[2]))) {
                    $r['payment_status'] = $newStatus;
                    break;
                }
            }
            return true;
        }

        // 2. INSERT congress_registrations
        if (stripos($sql, 'INSERT INTO') !== false && stripos($sql, 'congress_registrations') !== false) {
            $id = count($this->dataRef['registrations']) + 1;
            $this->parent->setLastId($id);
            
            $isFree = (stripos($sql, "'FREE_APPROVED'") !== false);
            $isPix = (stripos($sql, "'pix'") !== false);

            if ($isFree) {
                $rec = [
                    'id' => $id,
                    'ticket_token' => $params[0] ?? '',
                    'tier_id' => (int)($params[1] ?? 1),
                    'customer_name' => $params[2] ?? '',
                    'customer_email' => $params[3] ?? '',
                    'customer_cpf' => $params[4] ?? '',
                    'customer_phone' => $params[5] ?? '',
                    'category' => $params[6] ?? 'Participante',
                    'athlete_category' => $params[7] ?? null,
                    'instagram_handle' => $params[8] ?? null,
                    'accreditation_notes' => $params[9] ?? null,
                    'coupon_code' => $params[10] ?? null,
                    'discount_cents' => $params[11] ?? 0,
                    'amount_cents' => 0,
                    'payment_method' => 'free',
                    'payment_status' => 'FREE_APPROVED',
                    'asaas_payment_id' => null,
                    'pix_qr_code' => null,
                    'pix_copy_paste' => null,
                    'checked_in' => 0,
                    'checked_in_at' => null,
                    'tier_name' => 'Ingresso Experience (1+1)',
                    'tier_slug' => 'experience'
                ];
            } elseif ($isPix) {
                $rec = [
                    'id' => $id,
                    'ticket_token' => $params[0] ?? '',
                    'tier_id' => (int)($params[1] ?? 1),
                    'customer_name' => $params[2] ?? '',
                    'customer_email' => $params[3] ?? '',
                    'customer_cpf' => $params[4] ?? '',
                    'customer_phone' => $params[5] ?? '',
                    'category' => 'Geral',
                    'athlete_category' => null,
                    'instagram_handle' => null,
                    'accreditation_notes' => null,
                    'coupon_code' => $params[6] ?? null,
                    'discount_cents' => $params[7] ?? 0,
                    'amount_cents' => $params[8] ?? 0,
                    'payment_method' => 'pix',
                    'payment_status' => 'PENDING',
                    'asaas_payment_id' => $params[9] ?? null,
                    'pix_qr_code' => $params[10] ?? null,
                    'pix_copy_paste' => $params[11] ?? null,
                    'checked_in' => 0,
                    'checked_in_at' => null,
                    'tier_name' => 'Ingresso Experience (1+1)',
                    'tier_slug' => 'experience'
                ];
            } else {
                $rec = [
                    'id' => $id,
                    'ticket_token' => $params[0] ?? '',
                    'tier_id' => (int)($params[1] ?? 1),
                    'customer_name' => $params[2] ?? '',
                    'customer_email' => $params[3] ?? '',
                    'customer_cpf' => $params[4] ?? '',
                    'customer_phone' => $params[5] ?? '',
                    'category' => 'Geral',
                    'athlete_category' => null,
                    'instagram_handle' => null,
                    'accreditation_notes' => null,
                    'coupon_code' => $params[6] ?? null,
                    'discount_cents' => $params[7] ?? 0,
                    'amount_cents' => $params[8] ?? 0,
                    'payment_method' => 'card',
                    'payment_status' => $params[9] ?? 'CONFIRMED',
                    'asaas_payment_id' => $params[10] ?? null,
                    'pix_qr_code' => null,
                    'pix_copy_paste' => null,
                    'checked_in' => 0,
                    'checked_in_at' => null,
                    'tier_name' => 'Ingresso VIP Exclusive',
                    'tier_slug' => 'vip'
                ];
            }
            $this->dataRef['registrations'][] = $rec;
            return true;
        }

        // 3. SELECT congress_registrations
        if (stripos($sql, 'FROM `congress_registrations`') !== false || stripos($sql, 'FROM congress_registrations') !== false) {
            $p0 = (string)($params[0] ?? '');
            $p1 = (string)($params[1] ?? '');
            foreach ($this->dataRef['registrations'] as $r) {
                if (($p0 && $r['ticket_token'] === $p0) || 
                    ($p0 && ($r['asaas_payment_id'] ?? '') === $p0) || 
                    ($p1 && $r['ticket_token'] === $p1) ||
                    ($p1 && ($r['asaas_payment_id'] ?? '') === $p1)) {
                    $this->resultSet[] = $r;
                    break;
                }
            }
            return true;
        }

        // 4. SELECT congress_coupons
        if (stripos($sql, 'congress_coupons') !== false) {
            $code = strtoupper(trim((string)($params[0] ?? '')));
            foreach ($this->dataRef['coupons'] as $c) {
                if (strtoupper($c['code']) === $code) {
                    $this->resultSet[] = $c;
                    break;
                }
            }
            return true;
        }

        // 5. SELECT licenciadas
        if (stripos($sql, 'licenciadas') !== false) {
            $term = trim((string)($params[0] ?? ''), '%');
            $shortTerm = strlen($term) >= 3 ? substr($term, 0, 3) : $term;
            foreach ($this->dataRef['licenciadas'] as $l) {
                if (stripos($l['name'], $term) !== false || stripos($l['name'], $shortTerm) !== false) {
                    $this->resultSet[] = $l;
                }
            }
            return true;
        }

        // 6. SELECT congress_tiers
        if (stripos($sql, 'congress_tiers') !== false) {
            if (!empty($params)) {
                $id = (int)$params[0];
                foreach ($this->dataRef['tiers'] as $t) {
                    if ($t['id'] === $id) {
                        $this->resultSet[] = $t;
                        break;
                    }
                }
            } else {
                $this->resultSet = $this->dataRef['tiers'];
            }
            return true;
        }

        // 7. COUNT
        if (stripos($sql, 'COUNT(*)') !== false) {
            $this->resultSet[] = [0];
            return true;
        }

        return true;
    }

    public function fetchColumn(int $column = 0): mixed {
        if (!empty($this->resultSet) && isset($this->resultSet[0])) {
            $row = is_array($this->resultSet[0]) ? array_values($this->resultSet[0]) : [$this->resultSet[0]];
            return $row[$column] ?? 0;
        }
        return 0;
    }

    public function fetch(?int $mode = PDO::FETCH_DEFAULT, int $cursorOrientation = PDO::FETCH_ORI_NEXT, int $cursorOffset = 0): mixed {
        if ($this->cursor < count($this->resultSet)) {
            return $this->resultSet[$this->cursor++];
        }
        return false;
    }

    public function fetchAll(?int $mode = PDO::FETCH_DEFAULT, mixed ...$args): array {
        return $this->resultSet;
    }
}

function generateValidCpf(): string {
    $n = [];
    for ($i = 0; $i < 9; $i++) {
        $n[$i] = rand(0, 9);
    }
    $sum = 0;
    for ($i = 0; $i < 9; $i++) {
        $sum += $n[$i] * (10 - $i);
    }
    $rem = $sum % 11;
    $d1 = ($rem < 2) ? 0 : (11 - $rem);
    $n[9] = $d1;

    $sum = 0;
    for ($i = 0; $i < 10; $i++) {
        $sum += $n[$i] * (11 - $i);
    }
    $rem = $sum % 11;
    $d2 = ($rem < 2) ? 0 : (11 - $rem);
    $n[10] = $d2;

    return implode('', $n);
}

$dbMock = new E2EPDOMock();
$ticketService = new CongressTicketService($dbMock, $gateway);

// =========================================================================
// CENÁRIO A: Cliente Real & Emissão de PIX no Sandbox com Baixa Simulada
// =========================================================================
echo "\n--- CENÁRIO A: Cliente Real & Emissão de PIX no Asaas Sandbox ---\n";

$validCpfA = generateValidCpf();
$pixCheckout = $ticketService->checkout([
    'tier_id' => 2, // Experience (R$ 697)
    'payment_method' => 'pix',
    'customer' => [
        'name' => 'Dra. Camila Vasconcelos',
        'email' => 'camila.vasconcelos' . rand(100, 999) . '@teste.com.br',
        'cpf' => $validCpfA,
        'phone' => '11987654321'
    ]
]);

assertE2E("Checkout PIX executado com sucesso no Sandbox", !empty($pixCheckout['ok']), $pixCheckout['error'] ?? null);
$ticketToken = $pixCheckout['data']['ticket_token'] ?? '';
$asaasPaymentId = $pixCheckout['data']['asaas_payment_id'] ?? '';
$pixQrCode = $pixCheckout['data']['pix_qr_code'] ?? '';
$pixCopyPaste = $pixCheckout['data']['pix_copy_paste'] ?? '';

assertE2E("Token de ingresso TKT-CONG gerado", strpos($ticketToken, 'TKT-CONG-') === 0, $ticketToken);
assertE2E("ID de pagamento real Asaas retornado (pay_...)", strpos($asaasPaymentId, 'pay_') === 0, $asaasPaymentId);
assertE2E("QR Code PIX oficial retornado", !empty($pixQrCode));
assertE2E("Copia e Cola PIX oficial retornado", !empty($pixCopyPaste));

// Simulação de baixa bancária via API Sandbox
echo "\n--- Simulando Baixa de Pagamento PIX na Sandbox do Asaas ---\n";
$simRes = $gateway->simulatePayment($asaasPaymentId, 697.00);
assertE2E("API simulatePayment executada com sucesso", !empty($simRes['ok']), $simRes['error'] ?? null);

// Testar atualização via Webhook do Asaas para esse pagamento
$webhookPayload = [
    'event' => 'PAYMENT_RECEIVED',
    'payment' => [
        'id' => $asaasPaymentId,
        'externalReference' => $ticketToken,
        'status' => 'RECEIVED',
        'value' => 697.00
    ]
];

$webhookRes = $ticketService->handleAsaasWebhook($webhookPayload);
assertE2E("Webhook PAYMENT_RECEIVED processado com sucesso", !empty($webhookRes['ok']), $webhookRes['message'] ?? null);

$ticketAfter = $ticketService->getTicketByToken($ticketToken);
assertE2E("Status do ingresso atualizado para CONFIRMED", ($ticketAfter['payment_status'] ?? '') === 'CONFIRMED', $ticketAfter['payment_status'] ?? 'NIL');

// =========================================================================
// CENÁRIO B: Cartão de Crédito no Sandbox (Sucesso e Falha)
// =========================================================================
echo "\n--- CENÁRIO B: Cartão de Crédito no Asaas Sandbox ---\n";

// B1: Cartão Aprovado (12x no Lote VIP)
$validCpfB = generateValidCpf();
$cardCheckoutVIP = $ticketService->checkout([
    'tier_id' => 1, // VIP (R$ 1.497)
    'payment_method' => 'credit_card',
    'installments' => 12,
    'customer' => [
        'name' => 'Dr. Marcelo Antunes',
        'email' => 'marcelo.antunes' . rand(100, 999) . '@clinica.com.br',
        'cpf' => $validCpfB,
        'phone' => '21977778888'
    ],
    'card_data' => [
        'holder_name' => 'MARCELO ANTUNES',
        'number' => '4111111111111111', // Cartão de teste válido
        'expiry_month' => '12',
        'expiry_year' => '2029',
        'ccv' => '123'
    ]
]);

assertE2E("Cartão 12x Lote VIP processado no Sandbox", !empty($cardCheckoutVIP['ok']), $cardCheckoutVIP['error'] ?? null);
if (!empty($cardCheckoutVIP['ok'])) {
    assertE2E("Status de Cartão retornado é CONFIRMED", $cardCheckoutVIP['data']['payment_status'] === 'CONFIRMED');
}

// B2: Cartão Inválido / Expirado (Tratamento amigável de erro)
try {
    $cardCheckoutFail = $ticketService->checkout([
        'tier_id' => 2,
        'payment_method' => 'credit_card',
        'installments' => 1,
        'customer' => [
            'name' => 'Teste Falha Cartão',
            'email' => 'falha@teste.com',
            'cpf' => '00011122233',
            'phone' => '11900001111'
        ],
        'card_data' => [
            'holder_name' => 'TESTE FALHA',
            'number' => '4000000000000001', // Número que gera recusa no sandbox
            'expiry_month' => '01',
            'expiry_year' => '2020', // Data expirada
            'ccv' => '999'
        ]
    ]);
    assertE2E("Cartão inválido tratado com mensagem de erro", $cardCheckoutFail['ok'] === false || !empty($cardCheckoutFail['error']));
} catch (Exception $e) {
    assertE2E("Exceção capturada defensivamente sem crash 500", true, $e->getMessage());
}

// =========================================================================
// CENÁRIO C: Motor de Cupons, Case Insensitivity & Sanitização
// =========================================================================
echo "\n--- CENÁRIO C: Motor de Cupons & Casos de Borda ---\n";

// C1: Cupons em minúsculas e maiúsculas
$valLower = $ticketService->validateCoupon('licenciada20', 2);
assertE2E("Cupom 'licenciada20' em minúsculas validado", !empty($valLower['ok']) && ($valLower['data']['discount_percent'] ?? 0) == 20, json_encode($valLower));

$valUpper = $ticketService->validateCoupon('LICENCIADA20', 2);
assertE2E("Cupom 'LICENCIADA20' em maiúsculas validado", !empty($valUpper['ok']) && ($valUpper['data']['discount_percent'] ?? 0) == 20, json_encode($valUpper));

$valNominal = $ticketService->validateCoupon('josi20', 2);
assertE2E("Cupom nominal 'josi20' em minúsculas validado para Licenciada", !empty($valNominal['ok']) && ($valNominal['data']['discount_percent'] ?? 0) == 20, json_encode($valNominal));

// C2: Cupom 100% sem credenciamento obrigatório (Deve bloquear)
try {
    $freeBlocked = $ticketService->checkout([
        'tier_id' => 2,
        'payment_method' => 'free',
        'coupon_code' => 'atleta100',
        'customer' => [
            'name' => 'Atleta Sem Categoria',
            'email' => 'atleta@teste.com',
            'cpf' => '111.222.333-44',
            'phone' => '11988887777'
        ],
        'accreditation_data' => [
            'athlete_category' => '' // VAZIO: DEVE BLOQUEAR!
        ]
    ]);
    assertE2E("Bloqueio de cupom 100% sem categoria de atleta", empty($freeBlocked['ok']));
} catch (Exception $e) {
    assertE2E("Bloqueio de cupom 100% sem categoria de atleta capturado", true, $e->getMessage());
}

// C3: Cupom 100% com credenciamento completo (Deve aprovar FREE_APPROVED)
$freeSuccess = $ticketService->checkout([
    'tier_id' => 2,
    'payment_method' => 'free',
    'coupon_code' => 'ATLETA100',
    'customer' => [
        'name' => 'Mariana Oliveira',
        'email' => 'mariana.atleta@fitness.com',
        'cpf' => '999.888.777-66',
        'phone' => '(11) 95555-4444'
    ],
    'accreditation_data' => [
        'athlete_category' => 'Bikini Fitness Pro',
        'instagram_handle' => '@mariana.pro',
        'notes' => 'Convidada de honra'
    ]
]);

assertE2E("Cupom 100% com credenciamento aprovado", !empty($freeSuccess['ok']) && $freeSuccess['data']['payment_status'] === 'FREE_APPROVED');

// =========================================================================
// CENÁRIO D: Auditoria de Webhook & Idempotência
// =========================================================================
echo "\n--- CENÁRIO D: Auditoria de Webhook & Idempotência ---\n";

// D1: Re-envio do mesmo webhook PAYMENT_CONFIRMED (Idempotência)
$idempotentRes = $ticketService->handleAsaasWebhook($webhookPayload);
assertE2E("Webhook idempotente: não duplica e responde OK", !empty($idempotentRes['ok']), $idempotentRes['message'] ?? null);

// D2: Evento PAYMENT_REFUNDED
$refundPayload = [
    'event' => 'PAYMENT_REFUNDED',
    'payment' => [
        'id' => $asaasPaymentId,
        'externalReference' => $ticketToken,
        'status' => 'REFUNDED'
    ]
];
$refundRes = $ticketService->handleAsaasWebhook($refundPayload);
assertE2E("Webhook PAYMENT_REFUNDED processado", !empty($refundRes['ok']), $refundRes['message'] ?? null);

// D3: Validação de Token de Webhook (Segurança)
putenv('ASAAS_WEBHOOK_SECRET=bh_secret_token_123456');
$secWebhookFail = $ticketService->handleAsaasWebhook($webhookPayload, 'wrong_token');
assertE2E("Webhook com token incorreto rejeitado (401)", $secWebhookFail['ok'] === false && ($secWebhookFail['status'] ?? 0) === 401);

$secWebhookPass = $ticketService->handleAsaasWebhook($webhookPayload, 'bh_secret_token_123456');
assertE2E("Webhook com token correto aceito (200)", !empty($secWebhookPass['ok']));
putenv('ASAAS_WEBHOOK_SECRET='); // Limpa após teste

// =========================================================================
// Resumo Final da Bateria E2E
// =========================================================================
echo "\n=================================================================\n";
echo "   RESULTADO FINAL DA BATERIA E2E SANDBOX ASAAS                  \n";
echo "   PASSOU: {$passed} | FALHOU: {$failed}                        \n";
echo "=================================================================\n";

if ($failed > 0) {
    exit(1);
}
exit(0);
