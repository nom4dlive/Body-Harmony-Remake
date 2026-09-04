<?php
// tests/congress_checkout_smoke_test.php
// Smoke test para validar o Módulo do Congresso Body Harmony & Asaas Gateway (Nexus Protocol V3.1)

echo "=================================================================\n";
echo "   SMOKE TEST: CONGRESSO BODY HARMONY & ASAAS GATEWAY MOCK/LIVE   \n";
echo "=================================================================\n\n";

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/Payment/PaymentGatewayInterface.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/Payment/AsaasGatewayService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CongressTicketService.php';

use BodyHarmony\Services\Payment\PaymentGatewayInterface;
use BodyHarmony\Services\Payment\AsaasGatewayService;
use BodyHarmony\Services\CongressTicketService;

$passed = 0;
$failed = 0;

function assertTest(string $desc, bool $condition) {
    global $passed, $failed;
    if ($condition) {
        echo "  [PASS] {$desc}\n";
        $passed++;
    } else {
        echo "  [FAIL] {$desc}\n";
        $failed++;
    }
}

// -------------------------------------------------------------
// TEST 1: AsaasGatewayService Mock Fallback & Live Mode Check
// -------------------------------------------------------------
echo "--- TEST 1: AsaasGatewayService Initialization & Mock Detection ---\n";
$mockGateway = new AsaasGatewayService('', 'mock');
assertTest("Gateway instanciado em modo Mock por padrão quando chave vazia", $mockGateway->isMockMode() === true);

$sandboxKey = getenv('ASAAS_SANDBOX_KEY') ?: '$aact_hmlg_mock_token_for_environment_detection_only_000111222333444555666777';
$sandboxGateway = new AsaasGatewayService($sandboxKey);
assertTest("Gateway detecta prefixo hmlg e ativa modo Sandbox automaticamente", $sandboxGateway->getEnvironment() === 'sandbox');
assertTest("Gateway Sandbox direciona para https://sandbox.asaas.com/api/v3", $sandboxGateway->getBaseUrl() === 'https://sandbox.asaas.com/api/v3');
assertTest("Gateway Sandbox opera em modo Live (não mock)", $sandboxGateway->isMockMode() === false);

// -------------------------------------------------------------
// TEST 2: Cálculo de Parcelamento de 1x a 12x com Juros
// -------------------------------------------------------------
echo "\n--- TEST 2: Cálculo de Parcelamento com Repasse de Juros ---\n";
$installments = $mockGateway->calculateInstallments(69700, 12);
assertTest("Retornou 12 opções de parcelamento", count($installments) === 12);
assertTest("1x sem juros possui total de R$ 697,00", $installments[0]['total_cents'] === 69700 && $installments[0]['has_interest'] === false);
assertTest("12x possui juros aplicados e valor total superior à base", $installments[11]['total_cents'] > 69700 && $installments[11]['has_interest'] === true);

// -------------------------------------------------------------
// TEST 3: Geração de Cobrança PIX e Cartão (Mock Mode)
// -------------------------------------------------------------
echo "\n--- TEST 3: Cobranças PIX e Cartão em Modo Mock ---\n";
$pixResult = $mockGateway->createPixCharge([
    'amount_cents' => 69700,
    'customer_name' => 'Dra. Roberta Andrade',
    'customer_email' => 'roberta@clinica.com.br',
    'customer_cpf' => '12345678901',
    'customer_phone' => '11999998888',
    'description' => 'Ingresso Experience Congresso'
]);

assertTest("PIX Mock gerado com sucesso", !empty($pixResult['ok']) && $pixResult['is_mock'] === true);
assertTest("PIX Mock possui QR Code e Copia e Cola", !empty($pixResult['pix_qr_code']) && !empty($pixResult['pix_copy_paste']));
assertTest("PIX Mock possui identificador de pagamento", strpos($pixResult['payment_id'], 'pay_mock_pix_') === 0);

$cardResult = $mockGateway->createCreditCardCharge([
    'amount_cents' => 149700,
    'installments' => 6,
    'customer_name' => 'Dr. Fernando Dias',
    'customer_email' => 'fernando@estetica.com',
    'customer_cpf' => '98765432100',
    'customer_phone' => '11988887777',
    'card_data' => [
        'holder_name' => 'FERNANDO DIAS',
        'number' => '4111111111111111',
        'expiry_month' => '12',
        'expiry_year' => '2028',
        'ccv' => '123'
    ]
]);

assertTest("Cartão Mock gerado com sucesso", !empty($cardResult['ok']) && $cardResult['is_mock'] === true);
assertTest("Cartão Mock retorna status CONFIRMED", $cardResult['status'] === 'CONFIRMED');
assertTest("Cartão Mock calculou 6 parcelas", $cardResult['installments'] === 6 && $cardResult['installment_value_cents'] > 0);

// -------------------------------------------------------------
// TEST 4: Mock In-Memory PDO para CongressTicketService
// -------------------------------------------------------------
echo "\n--- TEST 4: CongressTicketService & Motor de Cupons ---\n";

class MockCongressStatement {
    private $pdo;
    private $sql;
    private $params = [];
    private $fetchIndex = 0;
    private $resultRows = [];

    public function __construct($pdo, $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute($params = []) {
        $this->params = $params;

        // INSERT INTO congress_registrations
        if (stripos($this->sql, 'INSERT INTO `congress_registrations`') !== false) {
            $id = ++$this->pdo->lastRegId;
            $this->pdo->registrations[$id] = [
                'id' => $id,
                'ticket_token' => $params[0],
                'tier_id' => $params[1],
                'customer_name' => $params[2],
                'customer_email' => $params[3],
                'customer_cpf' => $params[4],
                'customer_phone' => $params[5],
                'category' => $params[6] ?? 'Geral',
                'athlete_category' => $params[7] ?? null,
                'instagram_handle' => $params[8] ?? null,
                'accreditation_notes' => $params[9] ?? null,
                'coupon_code' => $params[10] ?? null,
                'discount_cents' => $params[11] ?? 0,
                'amount_cents' => $params[12] ?? 0,
                'payment_method' => (stripos($this->sql, "'free'") !== false) ? 'free' : ((stripos($this->sql, "'pix'") !== false) ? 'pix' : 'card'),
                'payment_status' => (stripos($this->sql, "'FREE_APPROVED'") !== false) ? 'FREE_APPROVED' : ((stripos($this->sql, "'PENDING'") !== false) ? 'PENDING' : 'CONFIRMED'),
                'asaas_payment_id' => $params[13] ?? ($params[7] ?? null),
                'checked_in' => 0,
                'checked_in_at' => null,
                'created_at' => date('Y-m-d H:i:s')
            ];
            $this->pdo->lastInsertId = $id;
            return true;
        }

        // UPDATE congress_registrations
        if (stripos($this->sql, 'UPDATE `congress_registrations`') !== false || stripos($this->sql, 'UPDATE congress_registrations') !== false) {
            $newStatus = $params[0] ?? 'CONFIRMED';
            $targetId = $params[1] ?? 0;
            foreach ($this->pdo->registrations as &$reg) {
                if ($reg['id'] == $targetId || (isset($params[2]) && ($reg['asaas_payment_id'] === $params[1] || $reg['ticket_token'] === $params[2]))) {
                    $reg['payment_status'] = $newStatus;
                }
            }
            return true;
        }

        return true;
    }

    public function fetch($mode = null) {
        if ($this->fetchIndex < count($this->resultRows)) {
            return $this->resultRows[$this->fetchIndex++];
        }

        // SELECT * FROM congress_tiers WHERE id = ?
        if (stripos($this->sql, 'FROM `congress_tiers` WHERE `id` =') !== false) {
            $id = (int)($this->params[0] ?? 0);
            return $this->pdo->tiers[$id] ?? false;
        }

        // SELECT * FROM congress_coupons WHERE code = ?
        if (stripos($this->sql, 'FROM `congress_coupons` WHERE `code` =') !== false) {
            $code = $this->params[0] ?? '';
            return $this->pdo->coupons[$code] ?? false;
        }

        // SELECT id, name FROM licenciadas WHERE is_active = 1 AND UPPER(name) LIKE ?
        if (stripos($this->sql, 'FROM `licenciadas`') !== false) {
            $nameSearch = rtrim($this->params[0] ?? '', '%');
            $shortSearch = strlen($nameSearch) >= 3 ? substr($nameSearch, 0, 3) : $nameSearch;
            foreach ($this->pdo->licenciadas as $lic) {
                if (stripos($lic['name'], $nameSearch) === 0 || stripos($lic['name'], $shortSearch) === 0) {
                    return $lic;
                }
            }
            return false;
        }

        // SELECT id, ticket_token, payment_status FROM congress_registrations WHERE asaas_payment_id = ? OR ticket_token = ?
        if (stripos($this->sql, 'FROM `congress_registrations`') !== false || stripos($this->sql, 'FROM congress_registrations') !== false) {
            $p0 = $this->params[0] ?? '';
            $p1 = $this->params[1] ?? ($this->params[0] ?? '');
            foreach ($this->pdo->registrations as $reg) {
                if (($p0 && ($reg['ticket_token'] === $p0 || $reg['asaas_payment_id'] === $p0)) ||
                    ($p1 && ($reg['ticket_token'] === $p1 || $reg['asaas_payment_id'] === $p1))) {
                    $tier = $this->pdo->tiers[$reg['tier_id']] ?? ['name' => 'Lote Geral', 'slug' => 'experience'];
                    $reg['tier_name'] = $tier['name'];
                    $reg['tier_slug'] = $tier['slug'];
                    return $reg;
                }
            }
            return false;
        }

        return false;
    }

    public function fetchColumn() {
        if (stripos($this->sql, 'SELECT COUNT(*)') !== false) {
            if (stripos($this->sql, 'congress_tiers') !== false) {
                return count($this->pdo->tiers);
            }
            if (stripos($this->sql, 'congress_coupons') !== false) {
                return count($this->pdo->coupons);
            }
        }
        return 0;
    }

    public function fetchAll($mode = null) {
        if (stripos($this->sql, 'FROM `congress_tiers`') !== false) {
            return array_values($this->pdo->tiers);
        }
        return [];
    }

    public function setResultRows(array $rows) {
        $this->resultRows = $rows;
        $this->fetchIndex = 0;
    }
}

class MockCongressPDO {
    public $tiers = [];
    public $coupons = [];
    public $registrations = [];
    public $licenciadas = [];
    public $lastRegId = 0;
    public $lastInsertId = 0;

    public function __construct() {
        $this->tiers = [
            1 => [
                'id' => 1,
                'slug' => 'vip',
                'name' => 'Passaporte VIP Exclusive',
                'subtitle' => 'Apenas 40 vagas',
                'price_cents' => 149700,
                'original_price_cents' => 199700,
                'max_slots' => 40,
                'features_json' => json_encode(['Vip Table', 'Happy Hour']),
                'sort_order' => 2,
                'is_active' => 1,
                'sold_slots' => 0
            ],
            2 => [
                'id' => 2,
                'slug' => 'experience',
                'name' => 'Ingresso Experience',
                'subtitle' => 'Melhor opção Custo-Benefício',
                'price_cents' => 69700,
                'original_price_cents' => 99700,
                'max_slots' => null,
                'features_json' => json_encode(['Acesso Completo', 'Certificado']),
                'sort_order' => 1,
                'is_active' => 1,
                'sold_slots' => 0
            ]
        ];

        $this->coupons = [
            'ATLETA100' => [
                'id' => 1,
                'code' => 'ATLETA100',
                'type' => 'ATLETA_CONVIDADA',
                'discount_percentage' => 100.00,
                'discount_cents' => 0,
                'requires_accreditation' => 1,
                'is_active' => 1
            ],
            'CONVIDADA100' => [
                'id' => 2,
                'code' => 'CONVIDADA100',
                'type' => 'ATLETA_CONVIDADA',
                'discount_percentage' => 100.00,
                'discount_cents' => 0,
                'requires_accreditation' => 1,
                'is_active' => 1
            ],
            'LICENCIADA20' => [
                'id' => 3,
                'code' => 'LICENCIADA20',
                'type' => 'LICENCIADA_NOMINAL',
                'discount_percentage' => 20.00,
                'discount_cents' => 0,
                'requires_accreditation' => 0,
                'is_active' => 1
            ]
        ];

        $this->licenciadas = [
            1 => [
                'id' => 1,
                'name' => 'Joselene Silva',
                'cpf' => '36208232864',
                'whatsapp' => '18996959486',
                'is_active' => 1
            ]
        ];
    }

    public function exec($sql) {
        return true;
    }

    public function query($sql) {
        $stmt = new MockCongressStatement($this, $sql);
        if (stripos($sql, 'FROM `congress_tiers`') !== false) {
            $stmt->setResultRows(array_values($this->tiers));
        }
        return $stmt;
    }

    public function prepare($sql) {
        return new MockCongressStatement($this, $sql);
    }

    public function lastInsertId() {
        return $this->lastInsertId;
    }
}

$mockDb = new MockCongressPDO();
$ticketService = new CongressTicketService($mockDb, $mockGateway);

// Teste de Listagem de Tiers
$tiers = $ticketService->getTiers();
assertTest("getTiers retornou 2 lotes ativos", count($tiers) === 2);
assertTest("Lote VIP possui valor R$ 1.497,00 e 40 vagas", $tiers[0]['price_cents'] === 149700 && $tiers[0]['max_slots'] === 40);
assertTest("Lote Experience possui valor R$ 697,00", $tiers[1]['price_cents'] === 69700);

// Teste de Cupons
$couponLic20 = $ticketService->validateCoupon('LICENCIADA20', 2);
assertTest("Cupom LICENCIADA20 concede 20% de desconto", $couponLic20['ok'] === true && $couponLic20['data']['discount_percentage'] == 20.0);
assertTest("Valor final com 20% de desconto é R$ 557,60", $couponLic20['data']['final_amount_cents'] === 55760);

$couponJosi20 = $ticketService->validateCoupon('JOSI20', 2);
assertTest("Cupom nominal JOSI20 dinâmico de Licenciada validado com sucesso", $couponJosi20['ok'] === true && $couponJosi20['data']['discount_percentage'] == 20.0);

$couponAtleta = $ticketService->validateCoupon('ATLETA100', 2);
assertTest("Cupom ATLETA100 concede 100% de desconto", $couponAtleta['ok'] === true && $couponAtleta['data']['discount_percentage'] == 100.0);
assertTest("Cupom ATLETA100 exige credenciamento obrigatório", $couponAtleta['data']['requires_accreditation'] === true);

$couponInvalid = $ticketService->validateCoupon('CUPOM_FALSO_XYZ', 2);
assertTest("Cupom inexistente rejeitado", $couponInvalid['ok'] === false);

// -------------------------------------------------------------
// TEST 5: Processamento de Checkout (PIX, Cartão e Gratuito)
// -------------------------------------------------------------
echo "\n--- TEST 5: Fluxo de Checkout e Credenciamento com QR Code ---\n";

// 5.1 Bloqueio de 100% sem dados de atleta
$blockedException = false;
try {
    $ticketService->checkout([
        'tier_id' => 2,
        'customer_name' => 'Camila Atleta',
        'customer_email' => 'camila@atleta.com',
        'customer_cpf' => '11122233344',
        'customer_phone' => '11977776666',
        'payment_method' => 'free',
        'coupon_code' => 'ATLETA100',
        'accreditation_data' => [] // VAZIO PROPOSITALMENTE
    ]);
} catch (Exception $e) {
    $blockedException = true;
}
assertTest("Checkout 100% OFF bloqueado quando categoria da atleta ausente", $blockedException === true);

// 5.2 Checkout 100% com dados de atleta completos
$freeCheckout = $ticketService->checkout([
    'tier_id' => 2,
    'customer_name' => 'Camila Atleta',
    'customer_email' => 'camila@atleta.com',
    'customer_cpf' => '11122233344',
    'customer_phone' => '11977776666',
    'payment_method' => 'free',
    'coupon_code' => 'ATLETA100',
    'accreditation_data' => [
        'athlete_category' => 'Bikini Fitness Pro',
        'instagram_handle' => '@camilafit'
    ]
]);
assertTest("Checkout 100% aprovado com status FREE_APPROVED", $freeCheckout['ok'] === true && $freeCheckout['data']['payment_status'] === 'FREE_APPROVED');
assertTest("Credencial possui token único TKT-CONG- e QR Code URL", strpos($freeCheckout['data']['ticket_token'], 'TKT-CONG-') === 0 && !empty($freeCheckout['data']['qr_code_url']));

// 5.3 Checkout PIX Pago
$pixCheckout = $ticketService->checkout([
    'tier_id' => 2,
    'customer_name' => 'Dr. Lucas Medeiros',
    'customer_email' => 'lucas@clinica.com.br',
    'customer_cpf' => '22233344455',
    'customer_phone' => '11988882222',
    'payment_method' => 'pix'
]);
assertTest("Checkout PIX retorna status PENDING com QR Code e Copia e Cola", $pixCheckout['ok'] === true && $pixCheckout['data']['payment_status'] === 'PENDING' && !empty($pixCheckout['data']['pix_copy_paste']));

// 5.4 Consulta de Ingresso por Token
$ticketData = $ticketService->getTicketByToken($freeCheckout['data']['ticket_token']);
assertTest("getTicketByToken localiza ingresso emitido", $ticketData !== null);
assertTest("Ingresso possui CPF mascarado e dados do evento", !empty($ticketData['customer_cpf_masked']) && $ticketData['event_name'] === '1º Congresso Brasileiro de Musculação Elétrica');

// 5.5 Webhook de Confirmação Asaas
$webhookRes = $ticketService->handleAsaasWebhook([
    'event' => 'PAYMENT_RECEIVED',
    'payment' => [
        'id' => 'pay_mock_webhook_123',
        'externalReference' => $pixCheckout['data']['ticket_token']
    ]
]);
assertTest("Webhook Asaas processado com sucesso", $webhookRes['ok'] === true);

$updatedTicket = $ticketService->getTicketByToken($pixCheckout['data']['ticket_token']);
assertTest("Status do ingresso atualizado para CONFIRMED via webhook", $updatedTicket['payment_status'] === 'CONFIRMED');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
echo "\n=================================================================\n";
echo "   RESULTADO FINAL DOS TESTES DO CONGRESSO BODY HARMONY          \n";
echo "   PASSOU: {$passed} | FALHOU: {$failed}                        \n";
echo "=================================================================\n";

if ($failed > 0) {
    exit(1);
} else {
    exit(0);
}
