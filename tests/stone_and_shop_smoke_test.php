<?php
// tests/stone_and_shop_smoke_test.php
// Smoke test para validar StonePaymentService e ShopService (Nexus Protocol V3.1)

echo "=================================================================\n";
echo "   SMOKE TEST: STONE PAYMENTS API & SHOP SERVICE VALIDATION      \n";
echo "=================================================================\n\n";

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/StonePaymentService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/ShopService.php';

use BodyHarmony\Services\StonePaymentService;
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

// 1. Instantiation & Sandbox Host Header Test
echo "--- TEST 1: StonePaymentService Initialization ---\n";
$stoneService = new StonePaymentService('sk_test_123456789', 'sandbox');
assertTest("StonePaymentService instanciado", is_object($stoneService));

// 2. Mock in-memory PDO for ShopService
class MockShopStatement {
    private $pdo;
    private $sql;
    private $params = [];

    public function __construct($pdo, $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute($params = []) {
        $this->params = $params;

        if (stripos($this->sql, 'INSERT INTO `shop_products`') !== false) {
            $id = ++$this->pdo->lastProductId;
            $this->pdo->products[$id] = [
                'id' => $id,
                'slug' => $params[0],
                'name' => $params[1],
                'tagline' => $params[2],
                'description' => $params[3],
                'long_description' => $params[4],
                'price_cents' => $params[5],
                'category' => $params[6],
                'image_url' => $params[7],
                'features_json' => $params[8],
                'stock_limit' => $params[9],
                'is_active' => 1,
                'sort_order' => $params[10]
            ];
            return true;
        }

        if (stripos($this->sql, 'INSERT INTO `shop_orders`') !== false) {
            $id = ++$this->pdo->lastOrderId;
            $this->pdo->orders[$id] = [
                'id' => $id,
                'initiator_id' => $params[0],
                'product_id' => $params[1],
                'customer_name' => $params[2],
                'customer_email' => $params[3],
                'customer_phone' => $params[4],
                'customer_cpf' => $params[5],
                'customer_city' => $params[6],
                'customer_neighborhood' => $params[7],
                'amount_cents' => $params[8],
                'payment_method' => $params[9],
                'installments' => $params[10],
                'payment_status' => 'PENDING'
            ];
            $this->pdo->lastInsertId = $id;
            return true;
        }

        if (stripos($this->sql, 'UPDATE `shop_orders`') !== false) {
            $id = (int)$params[5];
            if (isset($this->pdo->orders[$id])) {
                $this->pdo->orders[$id]['payment_status'] = $params[0];
                $this->pdo->orders[$id]['stone_charge_id'] = $params[1];
                $this->pdo->orders[$id]['stone_raw_response'] = $params[2];
                $this->pdo->orders[$id]['pix_qr_code'] = $params[3];
                $this->pdo->orders[$id]['pix_copy_paste'] = $params[4];
            }
            return true;
        }

        if (stripos($this->sql, 'INSERT INTO `shop_leads`') !== false) {
            $id = ++$this->pdo->lastLeadId;
            $this->pdo->leads[$id] = [
                'id' => $id,
                'order_id' => $params[0],
                'product_id' => $params[1],
                'name' => $params[2],
                'email' => $params[3],
                'phone' => $params[4],
                'city' => $params[5],
                'neighborhood' => $params[6],
                'offering_title' => $params[7],
                'status' => $params[8],
                'value_cents' => $params[9],
                'notes' => $params[10]
            ];
            $this->pdo->lastInsertId = $id;
            return true;
        }

        return true;
    }

    public function fetchAll($mode = null) {
        if (stripos($this->sql, 'FROM `shop_products`') !== false) {
            return array_values($this->pdo->products);
        }
        if (stripos($this->sql, 'FROM `shop_orders`') !== false) {
            return array_values($this->pdo->orders);
        }
        if (stripos($this->sql, 'FROM `shop_leads`') !== false) {
            return array_values($this->pdo->leads);
        }
        return [];
    }

    public function fetch($mode = null) {
        if (stripos($this->sql, 'FROM `shop_products`') !== false) {
            $val = $this->params[0] ?? '';
            foreach ($this->pdo->products as $p) {
                if ($p['slug'] === $val || (string)$p['id'] === (string)$val) {
                    return $p;
                }
            }
        }
        return false;
    }

    public function fetchColumn() {
        if (stripos($this->sql, 'COUNT(*) FROM shop_products') !== false) {
            return count($this->pdo->products);
        }
        return 0;
    }
}

class MockShopPDO {
    public $products = [];
    public $orders = [];
    public $leads = [];
    public $lastProductId = 0;
    public $lastOrderId = 0;
    public $lastLeadId = 0;
    public $lastInsertId = 0;

    public function exec($sql) {
        return true;
    }

    public function query($sql) {
        return new MockShopStatement($this, $sql);
    }

    public function prepare($sql) {
        return new MockShopStatement($this, $sql);
    }

    public function lastInsertId() {
        return $this->lastInsertId;
    }
}

echo "\n--- TEST 2: ShopService Mock Database & Seeding ---\n";
$mockDb = new MockShopPDO();
$shopService = new ShopService($mockDb, $stoneService);
$products = $shopService->listProducts();
assertTest("Produtos semeados com sucesso na base", count($products) >= 4);

$vip = $shopService->getProduct('ingresso-vip');
assertTest("Consulta de produto por slug (ingresso-vip)", $vip !== null && $vip['price_cents'] === 149700);

// 3. Checkout Simulation
echo "\n--- TEST 3: Checkout Processing & Lead Generation ---\n";
$customer = [
    'name' => 'Dra. Roberta Estética',
    'email' => 'roberta@clinica.com.br',
    'phone' => '11999998888',
    'cpf' => '12345678901',
    'city' => 'São Paulo',
    'neighborhood' => 'Jardins'
];

$paymentData = [
    'method' => 'card',
    'installments' => 12,
    'card' => [
        'holder_name' => 'ROBERTA ESTETICA',
        'number' => '4705980000007171',
        'expiration_date' => '2812',
        'cvv' => '123'
    ]
];

$checkoutRes = $shopService->processCheckout($customer, (int)$vip['id'], $paymentData);
assertTest("Order ID gerado no checkout", !empty($checkoutRes['order_id']));
assertTest("Lead gerado no CRM do Gestor", !empty($checkoutRes['lead_id']));

$orders = $shopService->listOrders();
assertTest("Listagem de pedidos no Gestor", count($orders) >= 1);

$leads = $shopService->listLeads();
assertTest("Listagem de leads no CRM", count($leads) >= 1 && $leads[0]['email'] === 'roberta@clinica.com.br');

echo "\n=================================================================\n";
echo "RESULTADOS: {$passed} PASSADOS | {$failed} FALHADOS\n";
echo "=================================================================\n";

if ($failed > 0) {
    exit(1);
}
