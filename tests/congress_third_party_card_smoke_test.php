<?php
/**
 * Teste de Fumaça: Cartão de Terceiros, Notificações Asaas e Lookup de Ingressos (PLAN-161)
 * Nexus Protocol V3.1 Compliant
 */

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/Payment/PaymentGatewayInterface.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/Payment/AsaasGatewayService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CongressTicketService.php';

use BodyHarmony\Services\Payment\AsaasGatewayService;
use BodyHarmony\Services\CongressTicketService;

$passed = 0;
$failed = 0;

function assertThirdParty(string $desc, bool $condition, $extra = null): void {
    global $passed, $failed;
    if ($condition) {
        $passed++;
        echo "  \033[32m[PASS]\033[0m {$desc}\n";
    } else {
        $failed++;
        echo "  \033[31m[FAIL]\033[0m {$desc}";
        if ($extra !== null) {
            echo " -- INFO: " . (is_scalar($extra) ? $extra : json_encode($extra));
        }
        echo "\n";
    }
}

echo "=================================================================\n";
echo "   SMOKE TEST: CARTÃO DE TERCEIROS, LOOKUP & NOTIFICAÇÕES ASAAS  \n";
echo "=================================================================\n\n";

// -------------------------------------------------------------------------
// 1. Teste de Notificações Asaas (ASAAS_DISABLE_NOTIFICATIONS)
// -------------------------------------------------------------------------
echo "--- TEST 1: Controle de Notificações Nativas do Asaas ---\n";

$gatewayDefault = new AsaasGatewayService('', 'mock');
assertThirdParty("Notificações desativadas por padrão (notificationDisabled = true)", $gatewayDefault->isNotificationDisabled() === true);

$gatewayEnabled = new AsaasGatewayService('', 'mock', false);
assertThirdParty("Suporte a override manual para habilitar notificações", $gatewayEnabled->isNotificationDisabled() === false);

$mockPix = $gatewayDefault->createPixCharge([
    'amount_cents' => 69700,
    'customer_name' => 'Maria Silva',
    'customer_email' => 'maria@teste.com',
    'customer_cpf' => '12345678901',
    'customer_phone' => '11999998888'
]);
assertThirdParty("Cobrança PIX contém notification_disabled = true", !empty($mockPix['notification_disabled']));
assertThirdParty("Payload bruto PIX contém notificationDisabled = true", $mockPix['raw']['notificationDisabled'] === true);

// -------------------------------------------------------------------------
// 2. Teste de Cartão de Terceiros (creditCardHolderInfo)
// -------------------------------------------------------------------------
echo "\n--- TEST 2: Suporte a Cartão de Terceiros (Antifraude Asaas) ---\n";

// Caso 2.1: Titular é o próprio participante
$cardSameHolder = $gatewayDefault->createCreditCardCharge([
    'amount_cents' => 69700,
    'installments' => 1,
    'customer_name' => 'Dra. Camila Aluna',
    'customer_email' => 'camila@aluna.com',
    'customer_cpf' => '11122233344',
    'customer_phone' => '11911112222',
    'card_data' => [
        'holder_name' => 'CAMILA ALUNA',
        'number' => '4000000000000001',
        'expiry_month' => '12',
        'expiry_year' => '2028',
        'ccv' => '123'
    ],
    'holder_info' => [
        'is_same_as_attendee' => true
    ]
]);

$holderRawSame = $cardSameHolder['raw']['creditCardHolderInfo'] ?? [];
assertThirdParty("Mesmo titular: nome no holderInfo é da aluna", $holderRawSame['name'] === 'CAMILA ALUNA');
assertThirdParty("Mesmo titular: CPF no holderInfo é da aluna", $holderRawSame['cpfCnpj'] === '11122233344');

// Caso 2.2: Titular é terceiro (ex: cônjuge ou empresa)
$cardThirdParty = $gatewayDefault->createCreditCardCharge([
    'amount_cents' => 149700,
    'installments' => 12,
    'customer_name' => 'Dra. Camila Aluna',
    'customer_email' => 'camila@aluna.com',
    'customer_cpf' => '11122233344',
    'customer_phone' => '11911112222',
    'card_data' => [
        'holder_name' => 'ROBERTO TITULAR SILVA',
        'number' => '4000000000000002',
        'expiry_month' => '05',
        'expiry_year' => '2030',
        'ccv' => '456'
    ],
    'holder_info' => [
        'is_same_as_attendee' => false,
        'name' => 'Roberto Titular Silva',
        'cpf' => '999.888.777-66',
        'phone' => '(11) 98888-7777',
        'postal_code' => '04578-000',
        'address_number' => '1540'
    ]
]);

$holderRawThird = $cardThirdParty['raw']['creditCardHolderInfo'] ?? [];
assertThirdParty("Terceiro titular: nome no holderInfo é do titular", $holderRawThird['name'] === 'Roberto Titular Silva');
assertThirdParty("Terceiro titular: CPF sanitizado no holderInfo", $holderRawThird['cpfCnpj'] === '99988877766');
assertThirdParty("Terceiro titular: telefone sanitizado no holderInfo", $holderRawThird['phone'] === '11988887777');
assertThirdParty("Terceiro titular: CEP do titular informado", in_array($holderRawThird['postalCode'], ['04578-000', '04578000'], true), $holderRawThird['postalCode']);
assertThirdParty("Terceiro titular: número da residência informado", $holderRawThird['addressNumber'] === '1540', $holderRawThird['addressNumber'] ?? null);

// Caso 2.3: Titular é Empresa/Clínica (CNPJ - 14 dígitos)
$cardPj = $gatewayDefault->createCreditCardCharge([
    'amount_cents' => 69700,
    'installments' => 1,
    'customer_name' => 'Dra. Marina Schneider',
    'customer_email' => 'marina@clinica.com.br',
    'customer_cpf' => '25594222200',
    'customer_phone' => '69984482348',
    'card_data' => [
        'holder_name' => 'CLINICA HARMONY ESTETICA LTDA',
        'number' => '4000000000000003',
        'expiry_month' => '10',
        'expiry_year' => '2029',
        'ccv' => '789'
    ],
    'holder_info' => [
        'is_same_as_attendee' => false,
        'name' => 'Clinica Harmony Estetica Ltda',
        'cpf_cnpj' => '12.345.678/0001-90',
        'phone' => '(69) 98448-2348',
        'postal_code' => '76974-000',
        'address_number' => '250'
    ]
]);

$holderRawPj = $cardPj['raw']['creditCardHolderInfo'] ?? [];
assertThirdParty("Cartão Corporativo (PJ): aceita CNPJ de 14 dígitos", $holderRawPj['cpfCnpj'] === '12345678000190', $holderRawPj['cpfCnpj'] ?? null);
assertThirdParty("Cartão Corporativo (PJ): razão social no holderInfo", $holderRawPj['name'] === 'Clinica Harmony Estetica Ltda');
assertThirdParty("Cartão Corporativo (PJ): número da fatura passado", $holderRawPj['addressNumber'] === '250');

// Caso 2.4: Fallback Hosted Invoice com 3DS
$hostedInv = $gatewayDefault->createHostedInvoice([
    'amount_cents' => 55760,
    'installments' => 3,
    'customer_name' => 'Dra. Marina Schneider',
    'customer_email' => 'marina@clinica.com.br',
    'customer_cpf' => '25594222200',
    'customer_phone' => '69984482348',
    'description' => 'Congresso Body Harmony — Ingresso Experience',
    'external_reference' => 'TKT-TEST-HOSTED-1'
]);

assertThirdParty("Fallback 3DS: cria cobrança hospedada com sucesso", !empty($hostedInv['ok']) && !empty($hostedInv['payment_id']));
assertThirdParty("Fallback 3DS: gera invoice_url válida para autenticação bancária", !empty($hostedInv['invoice_url']) && strpos($hostedInv['invoice_url'], 'http') === 0, $hostedInv['invoice_url'] ?? null);
assertThirdParty("Fallback 3DS: status inicial é PENDING aguardando aprovação", $hostedInv['status'] === 'PENDING');
assertThirdParty("Fallback 3DS: billingType é estritamente CREDIT_CARD para elegibilidade de antecipação", ($hostedInv['billing_type'] ?? '') === 'CREDIT_CARD' && ($hostedInv['raw']['billingType'] ?? '') === 'CREDIT_CARD');

// -------------------------------------------------------------------------
// 3. Teste de Lookup de Ingressos por CPF e E-mail
// -------------------------------------------------------------------------
echo "\n--- TEST 3: Endpoint de Auto-Recuperação e Lookup de Ingressos ---\n";

class MockLookupPDO extends PDO {
    public array $registrations = [];
    public array $tiers = [
        1 => ['id' => 1, 'slug' => 'vip', 'name' => 'Ingresso VIP Exclusive', 'price_cents' => 149700, 'features_json' => '[]', 'is_active' => 1],
        2 => ['id' => 2, 'slug' => 'experience', 'name' => 'Ingresso Experience', 'price_cents' => 69700, 'features_json' => '[]', 'is_active' => 1]
    ];
    public int $lastInsertId = 0;

    public function __construct() {}
    public function query(string $query, ?int $fetchMode = null, ...$fetch_mode_args): PDOStatement|false {
        return new MockLookupStatement($this, $query);
    }
    public function prepare(string $query, array $options = []): PDOStatement|false {
        return new MockLookupStatement($this, $query);
    }
    public function lastInsertId(?string $name = null): string|false {
        return (string)$this->lastInsertId;
    }
}

class MockLookupStatement extends PDOStatement {
    private MockLookupPDO $pdo;
    private string $sql;
    private array $params = [];
    private array $resultRows = [];
    private int $fetchIndex = 0;

    public function __construct(MockLookupPDO $pdo, string $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute(?array $params = null): bool {
        $this->params = $params ?? [];
        $this->fetchIndex = 0;
        $this->resultRows = [];

        if (stripos($this->sql, 'INSERT INTO `congress_registrations`') !== false || stripos($this->sql, 'INSERT INTO congress_registrations') !== false) {
            $id = count($this->pdo->registrations) + 1;
            $this->pdo->lastInsertId = $id;
            return true;
        }

        if (stripos($this->sql, 'FROM `congress_registrations`') !== false || stripos($this->sql, 'FROM congress_registrations') !== false) {
            if (stripos($this->sql, 'customer_email') !== false) {
                $email = strtolower($this->params[0] ?? '');
                foreach ($this->pdo->registrations as $r) {
                    if (strtolower($r['customer_email']) === $email) {
                        $this->resultRows[] = $r;
                    }
                }
            } elseif (stripos($this->sql, 'customer_cpf') !== false) {
                $cpf1 = $this->params[0] ?? '';
                $cpf2 = $this->params[1] ?? ($this->params[0] ?? '');
                foreach ($this->pdo->registrations as $r) {
                    if ($r['customer_cpf'] === $cpf1 || $r['customer_cpf'] === $cpf2) {
                        $this->resultRows[] = $r;
                    }
                }
            }
        }

        return true;
    }

    public function fetch(?int $mode = PDO::FETCH_DEFAULT, int $cursorOrientation = PDO::FETCH_ORI_NEXT, int $cursorOffset = 0): mixed {
        if ($this->fetchIndex < count($this->resultRows)) {
            return $this->resultRows[$this->fetchIndex++];
        }

        if (stripos($this->sql, 'FROM `congress_tiers` WHERE `id` =') !== false) {
            $id = (int)($this->params[0] ?? 0);
            return $this->pdo->tiers[$id] ?? false;
        }

        return false;
    }
}

$mockDb = new MockLookupPDO();
$mockDb->registrations = [
    [
        'id' => 1,
        'ticket_token' => 'TKT-CONG-TEST123456',
        'tier_id' => 1,
        'tier_name' => 'Ingresso VIP Exclusive',
        'tier_slug' => 'vip',
        'customer_name' => 'Dra. Juliana Mendes',
        'customer_email' => 'juliana@clinica.com.br',
        'customer_cpf' => '32165498700',
        'customer_phone' => '11987654321',
        'category' => 'Geral',
        'amount_cents' => 149700,
        'payment_method' => 'card',
        'payment_status' => 'CONFIRMED',
        'checked_in' => 0,
        'checked_in_at' => null
    ],
    [
        'id' => 2,
        'ticket_token' => 'TKT-CONG-TEST789012',
        'tier_id' => 2,
        'tier_name' => 'Ingresso Experience (1+1)',
        'tier_slug' => 'experience',
        'customer_name' => 'Dra. Juliana Mendes',
        'customer_email' => 'juliana@clinica.com.br',
        'customer_cpf' => '32165498700',
        'customer_phone' => '11987654321',
        'category' => 'Geral',
        'amount_cents' => 69700,
        'payment_method' => 'pix',
        'payment_status' => 'FREE_APPROVED',
        'checked_in' => 0,
        'checked_in_at' => null
    ]
];

$lookupService = new CongressTicketService($mockDb);

// 3.1 Lookup por CPF formatado
$resCpfFormat = $lookupService->lookupTickets('321.654.987-00');
assertThirdParty("Lookup por CPF formatado retorna sucesso", $resCpfFormat['ok'] === true);
assertThirdParty("Lookup por CPF localizou 2 ingressos da participante", count($resCpfFormat['data']) === 2);
assertThirdParty("Ingresso 1 possui token correto", ($resCpfFormat['data'][0]['ticket_token'] ?? '') === 'TKT-CONG-TEST123456');
assertThirdParty("Ingresso possui CPF mascarado (321.***.***-00)", ($resCpfFormat['data'][0]['customer_cpf_masked'] ?? '') === '321.***.***-00');
assertThirdParty("Ingresso possui URL de QR Code gerada", !empty($resCpfFormat['data'][0]['qr_code_url']));

// 3.2 Lookup por E-mail
$resEmail = $lookupService->lookupTickets('juliana@clinica.com.br');
assertThirdParty("Lookup por E-mail retorna sucesso", $resEmail['ok'] === true && count($resEmail['data']) === 2);

// 3.3 Lookup por CPF inexistente
$resEmpty = $lookupService->lookupTickets('000.000.000-00');
assertThirdParty("Lookup inexistente retorna ok = true com lista vazia", $resEmpty['ok'] === true && empty($resEmpty['data']));

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
echo "\n=================================================================\n";
echo "   RESULTADO FINAL DOS TESTES (PLAN-161)                        \n";
echo "   PASSOU: {$passed} | FALHOU: {$failed}                        \n";
echo "=================================================================\n";

if ($failed > 0) {
    exit(1);
} else {
    exit(0);
}
