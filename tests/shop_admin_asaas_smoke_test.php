<?php
// tests/shop_admin_asaas_smoke_test.php
// Smoke test para validar a unificação de pedidos e Check-in com Asaas/Congresso no ShopService

echo "=================================================================\n";
echo "   SMOKE TEST: SHOP SERVICE & CHECK-IN ASAAS / CONGRESSO          \n";
echo "=================================================================\n\n";

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/ShopService.php';

use BodyHarmony\Services\ShopService;

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

class MockShopAdminStatement {
    private $pdo;
    private $sql;
    private $params = [];

    public function __construct($pdo, $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute($params = []) {
        $this->params = $params;

        // UPDATE shop_orders
        if (stripos($this->sql, 'UPDATE `shop_orders`') !== false) {
            $adminId = $params[0] ?? 1;
            $orderId = $params[1] ?? 0;
            if (isset($this->pdo->shopOrders[$orderId])) {
                $this->pdo->shopOrders[$orderId]['checked_in'] = 1;
                $this->pdo->shopOrders[$orderId]['checked_in_at'] = date('Y-m-d H:i:s');
                $this->pdo->shopOrders[$orderId]['checked_in_by_admin_id'] = $adminId;
            }
            return true;
        }

        // UPDATE congress_registrations
        if (stripos($this->sql, 'UPDATE `congress_registrations`') !== false) {
            $adminId = $params[0] ?? 1;
            $regId = $params[1] ?? 0;
            if (isset($this->pdo->congressRegistrations[$regId])) {
                $this->pdo->congressRegistrations[$regId]['checked_in'] = 1;
                $this->pdo->congressRegistrations[$regId]['checked_in_at'] = date('Y-m-d H:i:s');
                $this->pdo->congressRegistrations[$regId]['checked_in_by_admin_id'] = $adminId;
            }
            return true;
        }

        return true;
    }

    public function fetchAll($mode = null) {
        // SELECT ... FROM shop_orders
        if (stripos($this->sql, 'FROM `shop_orders`') !== false) {
            return array_values($this->pdo->shopOrders);
        }

        // SELECT ... FROM congress_registrations
        if (stripos($this->sql, 'FROM `congress_registrations`') !== false) {
            $list = [];
            foreach ($this->pdo->congressRegistrations as $r) {
                $tier = $this->pdo->congressTiers[$r['tier_id']] ?? ['name' => 'Congresso'];
                $r['product_name'] = $tier['name'];
                $r['product_category'] = 'Congresso 2026';
                $r['source_type'] = 'congress_registration';
                $list[] = $r;
            }
            return $list;
        }

        return [];
    }

    public function fetch($mode = null) {
        // SELECT ... FROM shop_orders WHERE o.ticket_token = ? OR o.ticket_code = ? ...
        if (stripos($this->sql, 'FROM `shop_orders`') !== false) {
            $token = $this->params[0] ?? '';
            foreach ($this->pdo->shopOrders as $o) {
                if ($o['ticket_token'] === $token || $o['ticket_code'] === $token || $o['id'] == $token) {
                    return $o;
                }
            }
            return false;
        }

        // SELECT ... FROM congress_registrations
        if (stripos($this->sql, 'FROM `congress_registrations`') !== false) {
            $token = $this->params[0] ?? '';
            $cpf = $this->params[2] ?? '';
            foreach ($this->pdo->congressRegistrations as $r) {
                if ($r['ticket_token'] === $token || $r['asaas_payment_id'] === $token || ($cpf && $r['customer_cpf'] === $cpf) || $r['id'] == $token) {
                    $tier = $this->pdo->congressTiers[$r['tier_id']] ?? ['name' => 'Lote Geral', 'slug' => 'experience'];
                    $r['tier_name'] = $tier['name'];
                    $r['tier_slug'] = $tier['slug'];
                    return $r;
                }
            }
            return false;
        }

        return false;
    }
}

class MockShopAdminPDO {
    public array $shopOrders = [];
    public array $congressRegistrations = [];
    public array $congressTiers = [];

    public function __construct() {
        $this->shopOrders = [
            1 => [
                'id' => 1,
                'initiator_id' => 'tok_init_1',
                'product_id' => 10,
                'customer_name' => 'Dra. Roberta Santos',
                'customer_email' => 'roberta@clinica.com',
                'customer_phone' => '11999991111',
                'customer_cpf' => '12345678901',
                'amount_cents' => 29700,
                'installments' => 1,
                'payment_method' => 'pix',
                'payment_status' => 'PAID',
                'card_last_digits' => null,
                'card_brand' => null,
                'stone_payment_id' => 'st_123',
                'ticket_code' => 'BH-ING-2026-00001',
                'ticket_token' => 'tok_ing_test_1',
                'checked_in' => 0,
                'checked_in_at' => null,
                'created_at' => '2026-08-20 10:00:00',
                'source_type' => 'shop_order',
                'product_name' => 'Curso de Eletroestimulação',
                'product_category' => 'Cursos'
            ]
        ];

        $this->congressTiers = [
            1 => ['id' => 1, 'slug' => 'experience', 'name' => 'Ingresso Experience (1+1)', 'price_cents' => 69700],
            2 => ['id' => 2, 'slug' => 'vip', 'name' => 'Passaporte VIP Exclusive', 'price_cents' => 149700]
        ];

        $this->congressRegistrations = [
            101 => [
                'id' => 101,
                'ticket_token' => 'TKT-CONG-A1B2C3D4',
                'tier_id' => 1,
                'customer_name' => 'Dr. Carlos Andrade',
                'customer_email' => 'carlos@med.com',
                'customer_cpf' => '98765432100',
                'customer_phone' => '11988882222',
                'category' => 'Geral',
                'amount_cents' => 69700,
                'installments' => 1,
                'payment_method' => 'pix',
                'payment_status' => 'CONFIRMED',
                'asaas_payment_id' => 'pay_asaas_123',
                'checked_in' => 0,
                'checked_in_at' => null,
                'created_at' => '2026-08-22 14:30:00'
            ],
            102 => [
                'id' => 102,
                'ticket_token' => 'TKT-CONG-VIP99999',
                'tier_id' => 2,
                'customer_name' => 'Dra. Fernanda Lima',
                'customer_email' => 'fernanda@vip.com',
                'customer_cpf' => '11122233344',
                'customer_phone' => '11977773333',
                'category' => 'VIP Exclusive',
                'amount_cents' => 149700,
                'installments' => 6,
                'payment_method' => 'card',
                'payment_status' => 'CONFIRMED',
                'asaas_payment_id' => 'pay_asaas_vip_456',
                'checked_in' => 0,
                'checked_in_at' => null,
                'created_at' => '2026-08-25 18:00:00'
            ]
        ];
    }

    public function prepare($sql) {
        return new MockShopAdminStatement($this, $sql);
    }

    public function query($sql) {
        return new MockShopAdminStatement($this, $sql);
    }

    public function exec($sql) {
        return true;
    }
}

$mockPdo = new MockShopAdminPDO();
$shopService = new ShopService($mockPdo);

// TEST 1: listOrders unifies both tables
echo "--- TEST 1: Unificação de Pedidos Loja & Congresso ---\n";
$orders = $shopService->listOrders();
assertTest("listOrders retornou pedidos de ambas as origens", count($orders) === 3);

$congressOrders = array_filter($orders, fn($o) => ($o['source_type'] ?? '') === 'congress_registration');
assertTest("Possui registros com source_type = congress_registration", count($congressOrders) === 2);

$vipOrder = array_values(array_filter($orders, fn($o) => $o['customer_name'] === 'Dra. Fernanda Lima'))[0] ?? null;
assertTest("Pedido VIP possui valor R$ 1.497,00 (149700 cents)", $vipOrder && (int)$vipOrder['amount_cents'] === 149700);
assertTest("Pedido VIP possui status CONFIRMED", $vipOrder && $vipOrder['payment_status'] === 'CONFIRMED');

// TEST 2: Check-in with Legacy Token
echo "\n--- TEST 2: Check-in com Token Legado (BH-ING-...) ---\n";
$checkinLegacy = $shopService->checkinTicket('BH-ING-2026-00001', 1);
assertTest("Check-in legado aprovado com sucesso", $checkinLegacy['success'] === true && $checkinLegacy['status'] === 'APPROVED');
assertTest("Check-in legado possui CPF mascarado", !empty($checkinLegacy['order']['customer_cpf_masked']));

// TEST 3: Check-in with Congress Token (TKT-CONG-...)
echo "\n--- TEST 3: Check-in com Token do Congresso (TKT-CONG-...) ---\n";
$checkinCong = $shopService->checkinTicket('TKT-CONG-A1B2C3D4', 1);
assertTest("Check-in do Congresso aprovado com sucesso", $checkinCong['success'] === true && $checkinCong['status'] === 'APPROVED');
assertTest("Check-in do Congresso retorna nome do participante e lote", $checkinCong['order']['customer_name'] === 'Dr. Carlos Andrade' && $checkinCong['order']['tier_name'] === 'Ingresso Experience (1+1)');
assertTest("Check-in do Congresso possui CPF mascarado", $checkinCong['order']['customer_cpf_masked'] === '987.***.***-00');

// TEST 4: Check-in with QR Payload Composto (BH-CONG-2026|TKT-CONG-...|CPF)
echo "\n--- TEST 4: Check-in com Payload Composto de QR Code ---\n";
$qrPayload = 'BH-CONG-2026|TKT-CONG-VIP99999|11122233344';
$checkinQr = $shopService->checkinTicket($qrPayload, 1);
assertTest("Check-in via payload de QR Code composto aprovado", $checkinQr['success'] === true && $checkinQr['status'] === 'APPROVED');
assertTest("Participante VIP credenciado com sucesso", $checkinQr['order']['customer_name'] === 'Dra. Fernanda Lima');

// TEST 5: Re-Checkin Rejection (Idempotência)
echo "\n--- TEST 5: Rejeição de Ingresso Já Utilizado ---\n";
$reCheckin = $shopService->checkinTicket('TKT-CONG-VIP99999', 1);
assertTest("Re-checkin rejeitado com status ALREADY_CHECKED_IN", $reCheckin['success'] === false && $reCheckin['status'] === 'ALREADY_CHECKED_IN');

echo "\n=================================================================\n";
echo "   RESULTADO FINAL: {$passed} PASSOU / {$failed} FALHOU           \n";
echo "=================================================================\n";
