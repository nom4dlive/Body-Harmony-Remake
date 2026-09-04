<?php

namespace BodyHarmony\Services;

use PDO;
use Exception;
use Throwable;

require_once __DIR__ . '/StonePaymentService.php';

/**
 * ShopService — Catálogo, Pedidos, Leads e Integração com Stone API
 * Nexus Protocol V3.1 Compliant
 */
class ShopService {
    private $db;
    private StonePaymentService $stoneService;

    public function __construct($db, ?StonePaymentService $stoneService = null) {
        $this->db = $db;
        $this->stoneService = $stoneService ?? new StonePaymentService();
        $this->ensureShopTablesExist();
    }

    /**
     * Auto-ensure runtime tables (ADR-008).
     */
    private function ensureShopTablesExist(): void {
        static $checked = false;
        if ($checked) return;
        if (!is_object($this->db)) return;

        try {
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `shop_products` (
                  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `slug` VARCHAR(100) NOT NULL UNIQUE,
                  `name` VARCHAR(255) NOT NULL,
                  `tagline` VARCHAR(255) DEFAULT NULL,
                  `description` TEXT DEFAULT NULL,
                  `long_description` LONGTEXT DEFAULT NULL,
                  `price_cents` INT UNSIGNED NOT NULL DEFAULT 0,
                  `category` VARCHAR(100) NOT NULL DEFAULT 'Geral',
                  `image_url` VARCHAR(500) DEFAULT NULL,
                  `features_json` JSON DEFAULT NULL,
                  `stock_limit` INT NULL DEFAULT NULL,
                  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                  `sort_order` INT NOT NULL DEFAULT 0,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_shop_products_slug (`slug`),
                  INDEX idx_shop_products_category (`category`),
                  INDEX idx_shop_products_active (`is_active`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `shop_orders` (
                  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `initiator_id` VARCHAR(100) NOT NULL UNIQUE,
                  `product_id` INT UNSIGNED NULL,
                  `customer_name` VARCHAR(255) NOT NULL,
                  `customer_email` VARCHAR(255) NOT NULL,
                  `customer_phone` VARCHAR(50) NOT NULL,
                  `customer_cpf` VARCHAR(20) DEFAULT NULL,
                  `customer_city` VARCHAR(100) DEFAULT NULL,
                  `customer_neighborhood` VARCHAR(100) DEFAULT NULL,
                  `amount_cents` INT UNSIGNED NOT NULL DEFAULT 0,
                  `payment_method` ENUM('card', 'pix', 'boleto', 'manual') NOT NULL DEFAULT 'card',
                  `installments` INT UNSIGNED NOT NULL DEFAULT 1,
                  `payment_status` ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
                  `stone_charge_id` VARCHAR(100) DEFAULT NULL,
                  `stone_raw_response` LONGTEXT DEFAULT NULL,
                  `pix_qr_code` TEXT DEFAULT NULL,
                  `pix_copy_paste` TEXT DEFAULT NULL,
                  `validated_by_admin_id` INT UNSIGNED NULL,
                  `validated_at` DATETIME NULL,
                  `notes` TEXT DEFAULT NULL,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_shop_orders_initiator (`initiator_id`),
                  INDEX idx_shop_orders_stone_charge (`stone_charge_id`),
                  INDEX idx_shop_orders_status (`payment_status`),
                  INDEX idx_shop_orders_customer_email (`customer_email`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `shop_leads` (
                  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `order_id` INT UNSIGNED NULL,
                  `product_id` INT UNSIGNED NULL,
                  `name` VARCHAR(255) NOT NULL,
                  `email` VARCHAR(255) NOT NULL,
                  `phone` VARCHAR(50) NOT NULL,
                  `city` VARCHAR(100) DEFAULT NULL,
                  `neighborhood` VARCHAR(100) DEFAULT NULL,
                  `offering_title` VARCHAR(255) NOT NULL,
                  `status` ENUM('Novo', 'Contato', 'Proposta', 'Aguardando Pagamento', 'Pago', 'Cancelado') NOT NULL DEFAULT 'Novo',
                  `value_cents` INT UNSIGNED NOT NULL DEFAULT 0,
                  `notes` TEXT DEFAULT NULL,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_shop_leads_status (`status`),
                  INDEX idx_shop_leads_phone (`phone`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // Ensure shop_settings table exists
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `shop_settings` (
                  `setting_key` VARCHAR(100) NOT NULL PRIMARY KEY,
                  `setting_value` LONGTEXT NOT NULL,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // Ensure payment_link_url column exists
            try {
                $this->db->exec("ALTER TABLE `shop_products` ADD COLUMN `payment_link_url` VARCHAR(500) NULL AFTER `image_url`");
            } catch (\Throwable $e) {
                // Column already exists
            }

            // Ensure ticket and checkin columns exist in shop_orders (PLAN-142)
            try {
                $this->db->exec("ALTER TABLE `shop_orders` ADD COLUMN `ticket_code` VARCHAR(64) NULL AFTER `validated_at`");
            } catch (\Throwable $e) {}
            try {
                $this->db->exec("ALTER TABLE `shop_orders` ADD COLUMN `ticket_token` VARCHAR(128) NULL AFTER `ticket_code`");
            } catch (\Throwable $e) {}
            try {
                $this->db->exec("ALTER TABLE `shop_orders` ADD COLUMN `checked_in` TINYINT(1) NOT NULL DEFAULT 0 AFTER `ticket_token`");
            } catch (\Throwable $e) {}
            try {
                $this->db->exec("ALTER TABLE `shop_orders` ADD COLUMN `checked_in_at` DATETIME NULL AFTER `checked_in`");
            } catch (\Throwable $e) {}
            try {
                $this->db->exec("ALTER TABLE `shop_orders` ADD COLUMN `checked_in_by_admin_id` INT UNSIGNED NULL AFTER `checked_in_at`");
            } catch (\Throwable $e) {}
            try {
                $this->db->exec("ALTER TABLE `shop_orders` ADD INDEX idx_shop_orders_ticket_code (`ticket_code`)");
            } catch (\Throwable $e) {}
            try {
                $this->db->exec("ALTER TABLE `shop_orders` ADD INDEX idx_shop_orders_ticket_token (`ticket_token`)");
            } catch (\Throwable $e) {}

            // Seed initial products if empty
            $stmt = $this->db->query("SELECT COUNT(*) FROM shop_products");
            if ($stmt && (int)$stmt->fetchColumn() === 0) {
                $this->seedInitialProducts();
            }

            $checked = true;
        } catch (Throwable $e) {
            error_log("[ShopService] ensureShopTablesExist error: " . $e->getMessage());
        }
    }

    /**
     * Seeds catalog default products.
     */
    private function seedInitialProducts(): void {
        $seeds = [
            [
                'slug' => 'ingresso-vip',
                'name' => 'Ingresso VIP — Experience Limited',
                'tagline' => 'Acesso exclusivo aos bastidores, Josi & Kaprice, oportunidades de negócio e crédito em licenciamento.',
                'description' => 'Para quem quer ir além do congresso e ter acesso aos bastidores e às oportunidades de negócio da Body Harmony. Apenas 40 vagas.',
                'long_description' => 'O INGRESSO VIP é a experiência boutique definitiva do 1º Congresso Brasileiro de Musculação Elétrica Ativa. Garante acesso exclusivo aos bastidores com as fundadoras Josi e Kaprice, reuniões de negócios de alto nível e happy hour privado. CONDIÇÃO ESPECIAL: O valor integral de R$ 1.497 do ingresso VIP será revertido em crédito direto caso você feche o Licenciamento Territorial durante ou logo após o congresso.',
                'price_cents' => 149700,
                'category' => 'Congresso & Evento',
                'image_url' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
                'features' => ['🔥 Apenas 40 vagas VIP disponíveis', 'Acesso exclusivo aos bastidores com Josi e Kaprice', 'Oportunidades de negócios e parcerias estratégicas', '💡 Crédito integral de R$ 1.497 revertido na adesão ao Licenciamento', 'Happy Hour VIP & Networking Executivo Reservado'],
                'stock_limit' => 40,
                'sort_order' => 1
            ],
            [
                'slug' => 'ingresso-experience',
                'name' => 'Ingresso Experience — Congresso Brasileiro',
                'tagline' => 'Acesso completo à imersão científica, tecnologia e evolução corporal integrativa.',
                'description' => 'A experiência essencial do maior encontro nacional de eletroestimulação muscular. Conecte-se com PhDs e pesquisadores da saúde.',
                'long_description' => 'O INGRESSO EXPERIENCE dá acesso livre a todas as palestras, painéis científicos e área de demonstrações tecnológicas do 1º Congresso Brasileiro de Musculação Elétrica Ativa. Inclui certificado oficial de participação e kit didático.',
                'price_cents' => 69700,
                'category' => 'Congresso & Evento',
                'image_url' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
                'features' => ['Credenciamento Oficial Congresso 2026', 'Acesso a todos os painéis com PhDs e pesquisadores', 'Demonstrações práticas de tecnologias de eletroestimulação', 'Kit Didático & Certificado Oficial de Participação'],
                'stock_limit' => 200,
                'sort_order' => 2
            ],
            [
                'slug' => 'curso-academy',
                'name' => 'Formação Body Harmony Academy',
                'tagline' => 'Ciência corporal aplicada e funil de vendas direto.',
                'description' => 'Acelere seu faturamento entendendo a fundo a fisiologia integrada e executando técnicas de captação que lotam sua agenda.',
                'long_description' => 'O Academy ensina na prática a fisiologia e a gestão comercial de uma marca pessoal. São vídeo-aulas gravadas em alta definição, artigos clínicos e guias práticos para associar resultados biológicos rápidos a um plano de vendas direto.',
                'price_cents' => 199700,
                'category' => 'Curso Online',
                'image_url' => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200',
                'features' => ['Acesso imediato de forma vitalícia à plataforma', 'Mais de 120 vídeo-aulas práticas gravadas em estúdio', 'Certificação nacional inclusa'],
                'stock_limit' => null,
                'sort_order' => 3
            ],
            [
                'slug' => 'licenciamento',
                'name' => 'Licenciamento Body Harmony',
                'tagline' => 'Exclusividade territorial, marca reconhecida e faturamento garantido para clínicas.',
                'description' => 'A transição imediata da sua clínica para o modelo de alto ticket. Domine sua região e atraia pacientes dispostos a pagar até 4x mais.',
                'long_description' => 'O Licenciamento Body Harmony é para profissionais que querem aumentar seu faturamento com segurança. Ao se tornar uma licenciada, você recebe um território exclusivo garantido em contrato, acesso a protocolos clínicos testados e treinamento prático de equipe para vender pacotes comerciais de alto valor.',
                'price_cents' => 1540000,
                'category' => 'Licenciamento',
                'image_url' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
                'features' => ['Exclusividade de território blindada em contrato', 'Treinamento presencial clínico e comercial de equipe', 'Scripts comerciais validados para fechamento de pacotes'],
                'stock_limit' => null,
                'sort_order' => 4
            ],
            [
                'slug' => 'body-harmony-summit',
                'name' => 'Body Harmony Summit',
                'tagline' => 'Dois dias de imersão de negócios e conexões em São Paulo.',
                'description' => 'Conecte-se com as maiores referências em estética integrativa do país e aprenda roteiros validados de escala comercial.',
                'long_description' => 'Uma imersão presencial focada 100% em vendas de estética corporal. Realizado em São Paulo, o evento reúne palestras sobre captação ativa de clientes e abre espaço para parcerias e network comercial entre profissionais.',
                'price_cents' => 380000,
                'category' => 'Evento Presencial',
                'image_url' => 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200',
                'features' => ['Credencial VIP com acesso livre a todas as palestras', 'Almoços e jantares de network inclusos no local', 'Conexões diretas com donas de clínicas'],
                'stock_limit' => 100,
                'sort_order' => 5
            ]
        ];

        $stmt = $this->db->prepare("
            INSERT INTO `shop_products` 
            (`slug`, `name`, `tagline`, `description`, `long_description`, `price_cents`, `category`, `image_url`, `features_json`, `stock_limit`, `is_active`, `sort_order`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        ");

        foreach ($seeds as $item) {
            $stmt->execute([
                $item['slug'],
                $item['name'],
                $item['tagline'],
                $item['description'],
                $item['long_description'],
                $item['price_cents'],
                $item['category'],
                $item['image_url'],
                json_encode($item['features']),
                $item['stock_limit'],
                $item['sort_order']
            ]);
        }
    }

    /**
     * Lists active catalog products.
     */
    public function listProducts(?string $category = null, bool $onlyActive = true): array {
        $sql = "SELECT * FROM `shop_products` WHERE 1=1";
        $params = [];

        if ($onlyActive) {
            $sql .= " AND `is_active` = 1";
        }
        if (!empty($category) && $category !== 'Todos') {
            $sql .= " AND `category` = ?";
            $params[] = $category;
        }

        $sql .= " ORDER BY `sort_order` ASC, `id` ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function ($p) {
            $p['id'] = (int)$p['id'];
            $p['price_cents'] = (int)$p['price_cents'];
            $p['is_active'] = (int)$p['is_active'];
            $p['stock_limit'] = $p['stock_limit'] !== null ? (int)$p['stock_limit'] : null;
            $p['features'] = !empty($p['features_json']) ? json_decode($p['features_json'], true) : [];
            return $p;
        }, $products);
    }

    /**
     * Gets single product by slug or id.
     */
    public function getProduct($identifier): ?array {
        if (is_numeric($identifier)) {
            $stmt = $this->db->prepare("SELECT * FROM `shop_products` WHERE `id` = ? LIMIT 1");
        } else {
            $stmt = $this->db->prepare("SELECT * FROM `shop_products` WHERE `slug` = ? LIMIT 1");
        }
        $stmt->execute([$identifier]);
        $p = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$p) return null;

        $p['id'] = (int)$p['id'];
        $p['price_cents'] = (int)$p['price_cents'];
        $p['is_active'] = (int)$p['is_active'];
        $p['stock_limit'] = $p['stock_limit'] !== null ? (int)$p['stock_limit'] : null;
        $p['features'] = !empty($p['features_json']) ? json_decode($p['features_json'], true) : [];
        return $p;
    }

    /**
     * Processes Checkout with Stone API and records order + lead.
     */
    public function processCheckout(array $customer, int $productId, array $paymentData): array {
        $product = $this->getProduct($productId);
        if (!$product) {
            return [
                'success' => false,
                'status' => 'FAILED',
                'message' => 'Produto não encontrado.'
            ];
        }

        $method = $paymentData['method'] ?? 'card';
        $installments = max(1, min(12, (int)($paymentData['installments'] ?? 1)));
        $amountCents = (int)$product['price_cents'];
        $initiatorId = 'bh_' . date('YmdHis') . '_' . bin2hex(random_bytes(4));

        // Create initial order in PENDING
        $stmt = $this->db->prepare("
            INSERT INTO `shop_orders` 
            (`initiator_id`, `product_id`, `customer_name`, `customer_email`, `customer_phone`, `customer_cpf`, `customer_city`, `customer_neighborhood`, `amount_cents`, `payment_method`, `installments`, `payment_status`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
        ");
        $stmt->execute([
            $initiatorId,
            $product['id'],
            trim($customer['name'] ?? ''),
            trim(strtolower($customer['email'] ?? '')),
            trim($customer['phone'] ?? ''),
            preg_replace('/\D/', '', $customer['cpf'] ?? ''),
            trim($customer['city'] ?? ''),
            trim($customer['neighborhood'] ?? ''),
            $amountCents,
            $method,
            $installments
        ]);
        $orderId = (int)$this->db->lastInsertId();

        $paymentStatus = 'PENDING';
        $stoneChargeId = null;
        $stoneRaw = null;
        $pixQrCode = null;
        $pixCopyPaste = null;
        $leadStatus = 'Novo';

        // 1. Process Payment (direct_link, card or pix)
        if ($method === 'direct_link') {
            $paymentStatus = 'PENDING';
            $leadStatus = 'Aguardando Pagamento';
        } elseif ($method === 'card') {
            $card = $paymentData['card'] ?? [];
            $stoneRes = $this->stoneService->createCardCharge(
                $amountCents,
                $initiatorId,
                $card,
                $installments,
                'BODY HARMONY'
            );

            $stoneRaw = $stoneRes['raw'] ?? json_encode($stoneRes);
            if ($stoneRes['success'] && isset($stoneRes['data'])) {
                $stoneChargeId = $stoneRes['data']['id'] ?? null;
                $respCode = $stoneRes['data']['card_transaction']['response_code'] ?? ($stoneRes['data']['status'] ?? '');
                
                // 0000 indicates approved authorization
                if ($respCode === '0000' || ($stoneRes['data']['status'] ?? '') === 'approved') {
                    $paymentStatus = 'PAID';
                    $leadStatus = 'Pago';
                } else {
                    $paymentStatus = 'FAILED';
                    $leadStatus = 'Cancelado';
                }
            } else {
                // In sandbox / simulated fallback, check response
                $paymentStatus = 'FAILED';
                $leadStatus = 'Cancelado';
            }
        } elseif ($method === 'pix') {
            $stoneRes = $this->stoneService->createPixCharge($amountCents, $initiatorId, $customer);
            $stoneRaw = $stoneRes['raw'] ?? json_encode($stoneRes);
            if ($stoneRes['success'] && isset($stoneRes['data'])) {
                $stoneChargeId = $stoneRes['data']['id'] ?? null;
                $pixQrCode = $stoneRes['data']['pix_transaction']['qr_code'] ?? null;
                $pixCopyPaste = $stoneRes['data']['pix_transaction']['qr_code_url'] ?? null;
                $leadStatus = 'Aguardando Pagamento';
            } else {
                $leadStatus = 'Aguardando Pagamento';
            }
        }

        // Update order record
        $updateStmt = $this->db->prepare("
            UPDATE `shop_orders` 
            SET `payment_status` = ?, `stone_charge_id` = ?, `stone_raw_response` = ?, `pix_qr_code` = ?, `pix_copy_paste` = ?
            WHERE `id` = ?
        ");
        $updateStmt->execute([
            $paymentStatus,
            $stoneChargeId,
            $stoneRaw,
            $pixQrCode,
            $pixCopyPaste,
            $orderId
        ]);

        // 2. Register Lead in CRM
        $leadStmt = $this->db->prepare("
            INSERT INTO `shop_leads`
            (`order_id`, `product_id`, `name`, `email`, `phone`, `city`, `neighborhood`, `offering_title`, `status`, `value_cents`, `notes`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $leadStmt->execute([
            $orderId,
            $product['id'],
            trim($customer['name'] ?? ''),
            trim(strtolower($customer['email'] ?? '')),
            trim($customer['phone'] ?? ''),
            trim($customer['city'] ?? ''),
            trim($customer['neighborhood'] ?? ''),
            $product['name'],
            $leadStatus,
            $amountCents,
            'Lead gerado via Checkout E-Shop. Método: ' . strtoupper($method)
        ]);
        $leadId = (int)$this->db->lastInsertId();

        $redirectUrl = !empty($product['payment_link_url']) ? $product['payment_link_url'] : null;

        return [
            'success' => true,
            'order_id' => $orderId,
            'lead_id' => $leadId,
            'status' => $paymentStatus,
            'redirect_url' => $redirectUrl,
            'message' => $redirectUrl ? 'Pedido registrado com sucesso. Redirecionando para o pagamento seguro Stone...' : ($paymentStatus === 'PAID' ? 'Pagamento aprovado com sucesso!' : 'Pedido registrado. Aguardando pagamento.'),
            'stone_charge_id' => $stoneChargeId,
            'pix_qr_code' => $pixQrCode,
            'pix_copy_paste' => $pixCopyPaste
        ];
    }

    /**
     * Creates a new product in the catalog.
     */
    public function createProduct(array $data): array {
        $name = trim($data['name'] ?? '');
        if (empty($name)) {
            throw new InvalidArgumentException('O nome do produto é obrigatório.');
        }

        $slug = trim($data['slug'] ?? '');
        if (empty($slug)) {
            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
        }
        // Ensure slug is unique
        $stmtCheck = $this->db->prepare("SELECT COUNT(*) FROM `shop_products` WHERE `slug` = ?");
        $stmtCheck->execute([$slug]);
        if ((int)$stmtCheck->fetchColumn() > 0) {
            $slug .= '-' . time();
        }

        $category = trim($data['category'] ?? 'Curso Online');
        $tagline = trim($data['tagline'] ?? '');
        $description = trim($data['description'] ?? '');
        $longDescription = trim($data['long_description'] ?? '');
        $priceCents = max(0, (int)($data['price_cents'] ?? 0));
        $paymentLinkUrl = !empty($data['payment_link_url']) ? trim($data['payment_link_url']) : null;
        $imageUrl = !empty($data['image_url']) ? trim($data['image_url']) : null;
        $stockLimit = isset($data['stock_limit']) && $data['stock_limit'] !== '' && $data['stock_limit'] !== null ? (int)$data['stock_limit'] : null;
        $isActive = isset($data['is_active']) ? (int)$data['is_active'] : 1;
        $sortOrder = isset($data['sort_order']) ? (int)$data['sort_order'] : 99;

        $features = [];
        if (isset($data['features']) && is_array($data['features'])) {
            $features = array_values(array_filter(array_map('trim', $data['features'])));
        }
        $featuresJson = json_encode($features, JSON_UNESCAPED_UNICODE);

        $stmt = $this->db->prepare("
            INSERT INTO `shop_products`
            (`slug`, `name`, `tagline`, `description`, `long_description`, `price_cents`, `category`, `image_url`, `features_json`, `stock_limit`, `is_active`, `sort_order`, `payment_link_url`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $slug,
            $name,
            $tagline,
            $description,
            $longDescription,
            $priceCents,
            $category,
            $imageUrl,
            $featuresJson,
            $stockLimit,
            $isActive,
            $sortOrder,
            $paymentLinkUrl
        ]);

        $newId = (int)$this->db->lastInsertId();
        return $this->getProduct($newId);
    }

    /**
     * Updates product information including all 12 operational fields.
     */
    public function updateProduct(int $id, array $data): bool {
        $fields = [];
        $params = [];

        if (isset($data['name'])) {
            $fields[] = "`name` = ?";
            $params[] = trim($data['name']);
        }
        if (isset($data['slug'])) {
            $fields[] = "`slug` = ?";
            $params[] = trim($data['slug']);
        }
        if (isset($data['category'])) {
            $fields[] = "`category` = ?";
            $params[] = trim($data['category']);
        }
        if (isset($data['tagline'])) {
            $fields[] = "`tagline` = ?";
            $params[] = trim($data['tagline']);
        }
        if (isset($data['description'])) {
            $fields[] = "`description` = ?";
            $params[] = trim($data['description']);
        }
        if (isset($data['long_description'])) {
            $fields[] = "`long_description` = ?";
            $params[] = trim($data['long_description']);
        }
        if (isset($data['price_cents'])) {
            $fields[] = "`price_cents` = ?";
            $params[] = (int)$data['price_cents'];
        }
        if (isset($data['payment_link_url'])) {
            $fields[] = "`payment_link_url` = ?";
            $params[] = trim($data['payment_link_url']) !== '' ? trim($data['payment_link_url']) : null;
        }
        if (isset($data['is_active'])) {
            $fields[] = "`is_active` = ?";
            $params[] = (int)$data['is_active'];
        }
        if (isset($data['stock_limit'])) {
            $fields[] = "`stock_limit` = ?";
            $params[] = ($data['stock_limit'] !== null && $data['stock_limit'] !== '') ? (int)$data['stock_limit'] : null;
        }
        if (isset($data['image_url'])) {
            $fields[] = "`image_url` = ?";
            $params[] = trim($data['image_url']) !== '' ? trim($data['image_url']) : null;
        }
        if (isset($data['features'])) {
            $features = is_array($data['features']) ? array_values(array_filter(array_map('trim', $data['features']))) : [];
            $fields[] = "`features_json` = ?";
            $params[] = json_encode($features, JSON_UNESCAPED_UNICODE);
        }
        if (isset($data['sort_order'])) {
            $fields[] = "`sort_order` = ?";
            $params[] = (int)$data['sort_order'];
        }

        if (empty($fields)) {
            return false;
        }

        $params[] = $id;
        $sql = "UPDATE `shop_products` SET " . implode(', ', $fields) . " WHERE `id` = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Toggles active state of a product.
     */
    public function toggleProductStatus(int $id): array {
        $product = $this->getProduct($id);
        if (!$product) {
            throw new Exception('Produto não encontrado.');
        }

        $newStatus = $product['is_active'] ? 0 : 1;
        $stmt = $this->db->prepare("UPDATE `shop_products` SET `is_active` = ? WHERE `id` = ?");
        $stmt->execute([$newStatus, $id]);

        return [
            'id' => $id,
            'is_active' => $newStatus,
            'status_label' => $newStatus ? 'Ativo na Loja' : 'Inativo'
        ];
    }

    /**
     * Deletes a product from the database.
     */
    public function deleteProduct(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM `shop_products` WHERE `id` = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Lists orders for Gestor admin (Unifies shop_orders and congress_registrations).
     */
    public function listOrders(array $filters = []): array {
        $orders = [];
        $params = [];

        $sql = "
            SELECT 
                o.id,
                o.initiator_id,
                o.product_id,
                o.customer_name,
                o.customer_email,
                o.customer_phone,
                o.customer_cpf,
                o.amount_cents,
                o.installments,
                o.payment_method,
                o.payment_status,
                o.card_last_digits,
                o.card_brand,
                o.stone_payment_id AS gateway_payment_id,
                o.ticket_code,
                o.ticket_token,
                o.checked_in,
                o.checked_in_at,
                o.created_at,
                'shop_order' AS source_type,
                p.name AS product_name,
                p.category AS product_category 
            FROM `shop_orders` o
            LEFT JOIN `shop_products` p ON o.product_id = p.id
            WHERE 1=1
        ";

        if (!empty($filters['status'])) {
            $sql .= " AND o.payment_status = ?";
            $params[] = $filters['status'];
        }
        if (!empty($filters['search'])) {
            $sql .= " AND (o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ? OR o.initiator_id LIKE ?)";
            $term = '%' . $filters['search'] . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY o.id DESC LIMIT 100";

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Throwable $e) {
            error_log('[ShopService] listOrders shop_orders error: ' . $e->getMessage());
        }

        // Tentar unificar com congress_registrations (Gateway Asaas / PLAN-159 / PLAN-161)
        try {
            $sqlReg = "
                SELECT 
                    r.id,
                    r.ticket_token AS initiator_id,
                    r.tier_id AS product_id,
                    r.customer_name,
                    r.customer_email,
                    r.customer_phone,
                    r.customer_cpf,
                    r.amount_cents,
                    r.installments,
                    r.payment_method,
                    r.payment_status,
                    NULL AS card_last_digits,
                    NULL AS card_brand,
                    r.asaas_payment_id AS gateway_payment_id,
                    r.ticket_token AS ticket_code,
                    r.ticket_token,
                    r.checked_in,
                    r.checked_in_at,
                    r.created_at,
                    'congress_registration' AS source_type,
                    t.name AS product_name,
                    'Congresso 2026' AS product_category
                FROM `congress_registrations` r
                LEFT JOIN `congress_tiers` t ON r.tier_id = t.id
                WHERE 1=1
            ";
            $paramsReg = [];

            if (!empty($filters['status'])) {
                $sqlReg .= " AND r.payment_status = ?";
                $paramsReg[] = $filters['status'];
            }
            if (!empty($filters['search'])) {
                $sqlReg .= " AND (r.customer_name LIKE ? OR r.customer_email LIKE ? OR r.customer_phone LIKE ? OR r.ticket_token LIKE ? OR r.customer_cpf LIKE ?)";
                $term = '%' . $filters['search'] . '%';
                $paramsReg[] = $term;
                $paramsReg[] = $term;
                $paramsReg[] = $term;
                $paramsReg[] = $term;
                $paramsReg[] = $term;
            }

            $sqlReg .= " ORDER BY r.id DESC LIMIT 100";

            $stmtReg = $this->db->prepare($sqlReg);
            $stmtReg->execute($paramsReg);
            $congressOrders = $stmtReg->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($congressOrders)) {
                $orders = array_merge($orders, $congressOrders);
                usort($orders, function ($a, $b) {
                    return strtotime($b['created_at'] ?? 'now') <=> strtotime($a['created_at'] ?? 'now');
                });
                $orders = array_slice($orders, 0, 150);
            }
        } catch (\Throwable $e) {
            // Tabela congress_registrations pode não existir ainda se migration não rodou
            error_log('[ShopService] listOrders congress_registrations check: ' . $e->getMessage());
        }

        return $orders;
    }

    /**
     * Lists leads generated by shop.
     */
    public function listLeads(array $filters = []): array {
        $sql = "SELECT * FROM `shop_leads` WHERE 1=1";
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND `status` = ?";
            $params[] = $filters['status'];
        }
        if (!empty($filters['search'])) {
            $sql .= " AND (`name` LIKE ? OR `email` LIKE ? OR `phone` LIKE ? OR `offering_title` LIKE ?)";
            $term = '%' . $filters['search'] . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY `id` DESC LIMIT 100";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Validates order by Gestor admin (Human Commercial validation) and generates unique Ticket.
     */
    public function validateOrder(int $orderId, int $adminId, ?string $notes = null): array {
        // 1. Fetch current order
        $stmtOrder = $this->db->prepare("SELECT * FROM `shop_orders` WHERE `id` = ?");
        $stmtOrder->execute([$orderId]);
        $order = $stmtOrder->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            // Check if it's a congress_registration
            try {
                $stmtReg = $this->db->prepare("SELECT * FROM `congress_registrations` WHERE `id` = ?");
                $stmtReg->execute([$orderId]);
                $reg = $stmtReg->fetch(PDO::FETCH_ASSOC);
                if ($reg) {
                    $stmtUp = $this->db->prepare("UPDATE `congress_registrations` SET `payment_status` = 'CONFIRMED' WHERE `id` = ?");
                    $stmtUp->execute([$orderId]);
                    return [
                        'success' => true,
                        'ticket_code' => $reg['ticket_token'],
                        'ticket_token' => $reg['ticket_token'],
                        'message' => 'Inscrição do Congresso validada com sucesso pelo Gestor!'
                    ];
                }
            } catch (\Throwable $e) {
                // Ignore fallback error
            }
            throw new Exception("Pedido #{$orderId} não encontrado.");
        }

        // 2. Generate unique Ticket Code and Token if not present
        $ticketCode = $order['ticket_code'] ?: ('BH-ING-2026-' . str_pad((string)$orderId, 5, '0', STR_PAD_LEFT));
        $ticketToken = $order['ticket_token'] ?: ('tok_ing_' . bin2hex(random_bytes(12)));

        // 3. Update order
        $stmtUpdate = $this->db->prepare("
            UPDATE `shop_orders` 
            SET `payment_status` = 'PAID', 
                `ticket_code` = ?, 
                `ticket_token` = ?, 
                `updated_at` = NOW()
            WHERE `id` = ?
        ");
        $stmtUpdate->execute([$ticketCode, $ticketToken, $orderId]);

        return [
            'success' => true,
            'ticket_code' => $ticketCode,
            'ticket_token' => $ticketToken,
            'message' => 'Pedido validado e Ingresso Digital emitido com sucesso!'
        ];
    }

    /**
     * Performs Check-in / Credenciamento at event reception.
     * Supports legacy tokens (BH-ING-...), Asaas tokens (TKT-CONG-...), QR payloads (BH-CONG-2026|...) and IDs.
     */
    public function checkinTicket(string $identifier, int $adminId): array {
        $cleanId = trim($identifier);

        // 1. Extrair token se for payload de QR Code composto (ex: BH-CONG-2026|TKT-CONG-XXXX|12345678901)
        if (str_contains($cleanId, '|')) {
            $parts = explode('|', $cleanId);
            if (isset($parts[1]) && !empty($parts[1])) {
                $cleanId = trim($parts[1]);
            }
        }
        
        // Find order by ticket_token, ticket_code, initiator_id or ID in shop_orders
        $stmt = $this->db->prepare("
            SELECT o.*, p.name as product_name, p.category as product_category
            FROM `shop_orders` o
            LEFT JOIN `shop_products` p ON o.product_id = p.id
            WHERE o.ticket_token = ? OR o.ticket_code = ? OR o.initiator_id = ? OR o.id = ?
            LIMIT 1
        ");
        $stmt->execute([$cleanId, $cleanId, $cleanId, is_numeric($cleanId) ? (int)$cleanId : 0]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            // Tenta buscar em congress_registrations (PLAN-159 / PLAN-161)
            try {
                $cleanCpf = preg_replace('/\D/', '', $cleanId);
                $stmtReg = $this->db->prepare("
                    SELECT r.*, t.name as tier_name, t.slug as tier_slug
                    FROM `congress_registrations` r
                    LEFT JOIN `congress_tiers` t ON t.id = r.tier_id
                    WHERE r.ticket_token = ? 
                       OR r.asaas_payment_id = ? 
                       OR (r.customer_cpf = ? AND ? != '') 
                       OR r.id = ?
                    LIMIT 1
                ");
                $stmtReg->execute([
                    $cleanId, 
                    $cleanId, 
                    $cleanCpf, 
                    $cleanCpf, 
                    is_numeric($cleanId) ? (int)$cleanId : 0
                ]);
                $reg = $stmtReg->fetch(PDO::FETCH_ASSOC);

                if ($reg) {
                    $isPaid = in_array(strtoupper($reg['payment_status']), ['CONFIRMED', 'RECEIVED', 'FREE_APPROVED', 'PAID'], true);
                    if (!$isPaid) {
                        return [
                            'success' => false,
                            'status' => 'UNPAID',
                            'order' => [
                                'id' => $reg['id'],
                                'customer_name' => $reg['customer_name'],
                                'product_name' => $reg['tier_name'] ?? 'Ingresso Congresso',
                                'payment_status' => $reg['payment_status']
                            ],
                            'message' => "Atenção: A inscrição do Congresso #{$reg['id']} está com status {$reg['payment_status']}. Validação de pagamento necessária antes do check-in."
                        ];
                    }

                    if (!empty($reg['checked_in']) && (int)$reg['checked_in'] === 1) {
                        $formattedTime = date('d/m/Y \à\s H:i:s', strtotime($reg['checked_in_at'] ?? 'now'));
                        return [
                            'success' => false,
                            'status' => 'ALREADY_CHECKED_IN',
                            'order' => [
                                'id' => $reg['id'],
                                'customer_name' => $reg['customer_name'],
                                'product_name' => $reg['tier_name'] ?? 'Ingresso Congresso',
                                'ticket_code' => $reg['ticket_token'],
                                'checked_in_at' => $formattedTime
                            ],
                            'message' => "⚠️ INGRESSO DO CONGRESSO JÁ UTILIZADO! Check-in registrado em {$formattedTime}."
                        ];
                    }

                    // Efetuar check-in na tabela congress_registrations
                    $stmtCheckReg = $this->db->prepare("
                        UPDATE `congress_registrations`
                        SET `checked_in` = 1, `checked_in_at` = NOW(), `checked_in_by_admin_id` = ?
                        WHERE `id` = ?
                    ");
                    $stmtCheckReg->execute([$adminId, $reg['id']]);

                    $cpf = $reg['customer_cpf'] ?? '';
                    $maskedCpf = (strlen($cpf) === 11)
                        ? substr($cpf, 0, 3) . '.***.***-' . substr($cpf, -2)
                        : '***.***.***-**';

                    return [
                        'success' => true,
                        'status' => 'APPROVED',
                        'order' => [
                            'id' => $reg['id'],
                            'customer_name' => $reg['customer_name'],
                            'customer_email' => $reg['customer_email'],
                            'customer_phone' => $reg['customer_phone'],
                            'customer_cpf' => $cpf,
                            'customer_cpf_masked' => $maskedCpf,
                            'product_name' => $reg['tier_name'] ?? 'Ingresso Congresso Body Harmony 2026',
                            'tier_name' => $reg['tier_name'] ?? 'Passaporte Congresso',
                            'category' => $reg['category'] ?? 'Geral',
                            'ticket_code' => $reg['ticket_token'],
                            'ticket_token' => $reg['ticket_token'],
                            'checked_in_at' => date('d/m/Y H:i:s')
                        ],
                        'message' => "✅ CREDENCIAMENTO CONFIRMADO! Bem-vindo(a) ao Congresso, {$reg['customer_name']}!"
                    ];
                }
            } catch (\Throwable $e) {
                error_log('[ShopService] Check-in congress fallback error: ' . $e->getMessage());
            }

            return [
                'success' => false,
                'status' => 'NOT_FOUND',
                'message' => 'Ingresso não encontrado no sistema. Verifique o QR Code ou código digitado.'
            ];
        }

        $isPaid = in_array(strtoupper($order['payment_status']), ['PAID', 'CONFIRMED', 'RECEIVED', 'FREE_APPROVED'], true);
        if (!$isPaid) {
            return [
                'success' => false,
                'status' => 'UNPAID',
                'order' => $order,
                'message' => "Atenção: O pedido #{$order['id']} está com status {$order['payment_status']}. Validação pendente antes do check-in."
            ];
        }

        // Check if already checked in
        if (!empty($order['checked_in']) && (int)$order['checked_in'] === 1) {
            $formattedTime = date('d/m/Y \à\s H:i:s', strtotime($order['checked_in_at'] ?? 'now'));
            return [
                'success' => false,
                'status' => 'ALREADY_CHECKED_IN',
                'order' => $order,
                'message' => "⚠️ INGRESSO JÁ UTILIZADO! Check-in registrado em {$formattedTime}."
            ];
        }

        // Execute Check-in
        $stmtCheck = $this->db->prepare("
            UPDATE `shop_orders` 
            SET `checked_in` = 1, `checked_in_at` = NOW(), `checked_in_by_admin_id` = ?
            WHERE `id` = ?
        ");
        $stmtCheck->execute([$adminId, $order['id']]);

        $cpf = $order['customer_cpf'] ?? '';
        $maskedCpf = (strlen($cpf) === 11)
            ? substr($cpf, 0, 3) . '.***.***-' . substr($cpf, -2)
            : '***.***.***-**';

        return [
            'success' => true,
            'status' => 'APPROVED',
            'order' => [
                'id' => $order['id'],
                'customer_name' => $order['customer_name'],
                'customer_email' => $order['customer_email'],
                'customer_phone' => $order['customer_phone'],
                'customer_cpf' => $cpf,
                'customer_cpf_masked' => $maskedCpf,
                'product_name' => $order['product_name'] ?? 'Ingresso Congresso Body Harmony',
                'ticket_code' => $order['ticket_code'],
                'ticket_token' => $order['ticket_token'] ?? $order['ticket_code'],
                'checked_in_at' => date('d/m/Y H:i:s')
            ],
            'message' => "✅ CREDENCIAMENTO CONFIRMADO! Bem-vindo(a) {$order['customer_name']}!"
        ];
    }

    /**
     * Public verification of ticket.
     */
    public function getTicketPublic(string $token): ?array {
        $cleanToken = trim($token);
        $stmt = $this->db->prepare("
            SELECT o.id, o.customer_name, o.customer_email, o.customer_cpf, o.payment_status, o.ticket_code, o.ticket_token, o.checked_in, o.checked_in_at, o.created_at,
                   p.name as product_name, p.category as product_category
            FROM `shop_orders` o
            LEFT JOIN `shop_products` p ON o.product_id = p.id
            WHERE o.ticket_token = ? OR o.ticket_code = ?
            LIMIT 1
        ");
        $stmt->execute([$cleanToken, $cleanToken]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        return $order ?: null;
    }

    /**
     * Updates an order (Superadmin / Admin RBAC).
     */
    public function updateOrder(int $orderId, array $data): bool {
        $fields = [];
        $params = [];

        if (isset($data['customer_name'])) {
            $fields[] = "`customer_name` = ?";
            $params[] = trim($data['customer_name']);
        }
        if (isset($data['customer_email'])) {
            $fields[] = "`customer_email` = ?";
            $params[] = trim($data['customer_email']);
        }
        if (isset($data['customer_phone'])) {
            $fields[] = "`customer_phone` = ?";
            $params[] = trim($data['customer_phone']);
        }
        if (isset($data['customer_cpf'])) {
            $fields[] = "`customer_cpf` = ?";
            $params[] = trim($data['customer_cpf']);
        }
        if (isset($data['payment_status'])) {
            $fields[] = "`payment_status` = ?";
            $params[] = trim($data['payment_status']);
        }
        if (isset($data['amount_cents'])) {
            $fields[] = "`amount_cents` = ?";
            $params[] = (int)$data['amount_cents'];
        }
        if (isset($data['notes'])) {
            $fields[] = "`notes` = ?";
            $params[] = trim($data['notes']);
        }

        if (empty($fields)) return true;

        $params[] = $orderId;
        $sql = "UPDATE `shop_orders` SET " . implode(', ', $fields) . " WHERE `id` = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Deletes an order or congress registration (Superadmin / Admin RBAC).
     */
    public function deleteOrder(int $orderId): bool {
        // 1. Clean up linked leads
        try {
            $stmtLead = $this->db->prepare("DELETE FROM `shop_leads` WHERE `order_id` = ?");
            $stmtLead->execute([$orderId]);
        } catch (\Throwable $e) {}

        // 2. Delete from congress_registrations if exists
        try {
            $stmtCong = $this->db->prepare("SELECT `asaas_payment_id`, `payment_status` FROM `congress_registrations` WHERE `id` = ? LIMIT 1");
            $stmtCong->execute([$orderId]);
            $cong = $stmtCong->fetch(PDO::FETCH_ASSOC);
            if ($cong) {
                // Cancel pending charge on Asaas if possible
                if (!empty($cong['asaas_payment_id']) && $cong['payment_status'] === 'PENDING') {
                    try {
                        $gateway = new \App\Services\Payment\AsaasGatewayService();
                        $gateway->cancelPayment($cong['asaas_payment_id']);
                    } catch (\Throwable $ignored) {}
                }
                $stmtDelCong = $this->db->prepare("DELETE FROM `congress_registrations` WHERE `id` = ?");
                $stmtDelCong->execute([$orderId]);
            }
        } catch (\Throwable $e) {
            error_log('[ShopService] delete congress_registration error: ' . $e->getMessage());
        }

        // 3. Delete from shop_orders
        $stmt = $this->db->prepare("DELETE FROM `shop_orders` WHERE `id` = ?");
        return $stmt->execute([$orderId]);
    }

    /**
     * Updates a lead (Superadmin / Admin RBAC).
     */
    public function updateLead(int $leadId, array $data): bool {
        $fields = [];
        $params = [];

        if (isset($data['name'])) {
            $fields[] = "`name` = ?";
            $params[] = trim($data['name']);
        }
        if (isset($data['email'])) {
            $fields[] = "`email` = ?";
            $params[] = trim($data['email']);
        }
        if (isset($data['phone'])) {
            $fields[] = "`phone` = ?";
            $params[] = trim($data['phone']);
        }
        if (isset($data['city'])) {
            $fields[] = "`city` = ?";
            $params[] = trim($data['city']);
        }
        if (isset($data['status'])) {
            $fields[] = "`status` = ?";
            $params[] = trim($data['status']);
        }
        if (isset($data['notes'])) {
            $fields[] = "`notes` = ?";
            $params[] = trim($data['notes']);
        }

        if (empty($fields)) return true;

        $params[] = $leadId;
        $sql = "UPDATE `shop_leads` SET " . implode(', ', $fields) . " WHERE `id` = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Deletes a lead (Superadmin / Admin RBAC).
     */
    public function deleteLead(int $leadId): bool {
        $stmt = $this->db->prepare("DELETE FROM `shop_leads` WHERE `id` = ?");
        return $stmt->execute([$leadId]);
    }

    /**
     * Gets settings for the public shop and gestor CMS.
     */
    public function getSettings(): array {
        $defaults = [
            // Shop Vitrine Oficial
            'hero_title' => 'INGRESSOS, CURSOS & CAPACITAÇÕES OFICIAIS',
            'hero_title_active' => 1,
            'hero_subtitle' => 'Garanta sua vaga nos maiores eventos e programas avançados de eletroestimulação do Brasil com a segurança oficial Body Harmony.',
            'hero_subtitle_active' => 1,
            'trust_bar_active' => 1,
            'badge_1' => 'Pagamento 100% Seguro',
            'badge_1_active' => 1,
            'badge_2' => 'Vagas Oficiais Garantidas',
            'badge_2_active' => 1,
            'badge_3' => 'Confirmação Imediata',
            'badge_3_active' => 1,
            'announcement_text' => '',
            'announcement_active' => 0,
            'filters_active' => 1,
            'support_topbar_active' => 1,
            'support_title' => 'Dúvidas sobre ingressos ou inscrições?',
            'support_subtitle' => 'Nossa equipe de consultores oficiais está disponível para auxiliar você.',
            'support_whatsapp' => '5518996959486',
            'support_whatsapp_active' => 1,
            'support_whatsapp_message' => 'Olá! Gostaria de tirar dúvidas sobre os produtos e cursos da Body Harmony.',
            'support_whatsapp_button_text' => 'Atendimento Oficial',

            // PLAN-138: Gestão do Botão Loja & Ingressos (Navbar e Footer)
            'navbar_shop_button_active' => 1,
            'navbar_shop_button_text' => 'Loja & Ingressos',
            'navbar_shop_button_badge' => 'NOVO',
            'navbar_shop_button_badge_active' => 1,
            'navbar_shop_button_url' => '/shop',
            'footer_shop_link_active' => 1,

            // CMS Congresso Brasileiro de Musculação Elétrica (PLAN-093 / PLAN-200)
            'congresso_hero_badge' => '🗓️ 07 DE NOVEMBRO DE 2026',
            'congresso_hero_badge_active' => 1,
            'congresso_hero_location_badge' => '📍 AUDITÓRIO DE ALTO PADRÃO · SÃO PAULO/SP',
            'congresso_hero_title' => '1º CONGRESSO BRASILEIRO DE MUSCULAÇÃO ELÉTRICA',
            'congresso_hero_subtitle' => 'Um dia para transformar conhecimento em prática, ampliar sua visão profissional e descobrir como a musculação elétrica está criando novas oportunidades nas áreas da saúde, estética, performance e negócios.',
            'congresso_hero_support_text' => 'Tenha acesso a conteúdos relevantes, demonstrações, tecnologias, marcas, profissionais de referência. Conexões que podem impulsionar seus próximos resultados.',
            'congresso_hero_urgency_text' => 'Garanta seu ingresso agora e assegure sua participação em uma experiência única para o mercado brasileiro.',
            'congresso_date_text' => '07 de Novembro de 2026',
            'congresso_location_title' => 'Espaço Full Sales — Rua Gomes de Carvalho, 1996, 9º andar, Vila Olímpia, São Paulo/SP',
            'congresso_location_sub' => 'A 10 passos do metrô/trem · 15 min do Aeroporto de Congonhas',
            'congresso_hero_cta' => 'QUERO GARANTIR MEU INGRESSO',
            'congresso_hero_photos_json' => json_encode([['url' => '/uploads/congresso/hero_palestrantes.jpg', 'caption' => 'Palestrantes Oficiais']]),
            'congresso_hero_photo_size' => '400px',
            'congresso_hero_photo_border' => 'gold-border',

            // Seção 02: O Que É o Congresso?
            'congresso_espaco_label' => 'O Local',
            'congresso_espaco_title' => 'São Paulo Será o Palco de Uma Experiência Que Você Precisa Viver',
            'congresso_espaco_subtitle' => 'Um espaço preparado para oferecer conforto, estrutura e uma experiência completa, com palco para talks, área de expositores, demonstrações e momentos estratégicos de networking.',
            'congresso_espaco_gallery_json' => '',
            'congresso_sobre_label' => 'O Que É o Congresso?',
            'congresso_sobre_title' => 'MAIS DO QUE UM CONGRESSO. UM DIA PARA SAIR NA FRENTE.',
            'congresso_sobre_intro' => 'O Congresso de Musculação Elétrica foi criado para profissionais que não querem apenas acompanhar a evolução do setor, mas desejam entender, aplicar e aproveitar as oportunidades que esse mercado oferece.',
            'congresso_sobre_beneficios_json' => json_encode([
                'Atualizar seus conhecimentos com conteúdos direcionados',
                'Conhecer aplicações práticas da musculação elétrica',
                'Comparar tecnologias e soluções disponíveis no mercado',
                'Encontrar marcas e possíveis parceiros para o seu negócio',
                'Ampliar sua rede de contatos profissionais',
                'Identificar novas possibilidades de atuação e crescimento'
            ]),
            'congresso_sobre_quote' => 'Enquanto muitos ainda estão tentando entender o futuro do setor, você pode estar no ambiente onde essas transformações já estão acontecendo.',

            // Seção 03: Para Quem É?
            'congresso_publico_alvo_title' => 'SE VOCÊ TRABALHA COM RESULTADOS, PERFORMANCE OU TRANSFORMAÇÃO, ESTE EVENTO FOI FEITO PARA VOCÊ.',
            'congresso_publico_alvo_quote' => 'Você não precisa ter um nível específico de experiência. Precisa apenas estar disposto a aprender, se atualizar e enxergar novas oportunidades antes que elas se tornem comuns.',
            'congresso_publico_alvo_json' => json_encode([
                'Fisioterapeutas', 'Profissionais de Educação Física', 'Profissionais de estética', 'Biomédicos', 'Profissionais da área da saúde',
                'Personal trainers', 'Profissionais de performance', 'Empresários e gestores de clínicas', 'Profissionais que já utilizam a musculação elétrica', 'Profissionais que desejam ingressar ou se posicionar nesse mercado'
            ]),

            // Seção 04: Talks
            'congresso_talks_badge' => '🎙️ TALKS',
            'congresso_talks_title' => 'CONHECIMENTO PARA APLICAR, DECIDIR E CRESCER',
            'congresso_talks_desc' => 'Uma programação pensada para ir além da teoria e oferecer ideias, informações e perspectivas que podem ser aplicadas diretamente à sua rotina profissional.',
            'congresso_talks_topics_json' => json_encode(['Musculação elétrica', 'Saúde', 'Estética', 'Performance', 'Ciência', 'Treinamento', 'Tecnologia', 'Mercado', 'Empreendedorismo']),
            'congresso_talks_footer' => 'Você não vai apenas ouvir sobre tendências. Vai entender como elas podem impactar sua atuação.',

            // Seção 05: Experiências e Demonstrações
            'congresso_demos_badge' => '⚡ EXPERIÊNCIAS E DEMONSTRAÇÕES',
            'congresso_demos_title' => 'VEJA, COMPARE E ENTENDA A MUSCULAÇÃO ELÉTRICA NA PRÁTICA',
            'congresso_demos_desc' => 'O conhecimento se torna ainda mais valioso quando você consegue visualizar sua aplicação. Durante o congresso, você poderá acompanhar demonstrações práticas, conhecer equipamentos, observar diferentes aplicações e entender como a musculação elétrica pode ser utilizada em contextos de saúde, estética, treinamento e performance.',
            'congresso_demos_benefits_json' => json_encode([
                'Ampliar sua compreensão sobre a metodologia',
                'Conhecer novas possibilidades de aplicação',
                'Avaliar tecnologias com mais clareza',
                'Identificar soluções para sua rotina ou negócio',
                'Transformar informação em ação'
            ]),
            'congresso_demos_footer' => 'Você verá de perto o que pode fazer diferença na prática profissional.',

            // Seção 06: Competição de Atletas
            'congresso_competicao_badge' => '🏆 COMPETIÇÃO DE ATLETAS',
            'congresso_competicao_title' => 'UMA EXPERIÊNCIA EXCLUSIVA QUE COLOCA A MUSCULAÇÃO ELÉTRICA NO CENTRO DA PERFORMANCE',
            'congresso_competicao_desc' => 'Prepare-se para acompanhar uma competição especial, criada para mostrar o potencial da musculação elétrica em um contexto de preparação, disciplina e alto desempenho. Atletas serão preparadas utilizando a musculação elétrica como parte central de sua jornada e subirão ao palco para serem avaliadas por uma equipe de jurados.',
            'congresso_competicao_points_json' => json_encode(['Preparação', 'Estratégia', 'Evolução', 'Performance', 'Aplicação prática da metodologia']),
            'congresso_competicao_footer' => 'É uma experiência inédita em um congresso do setor e uma oportunidade de enxergar, ao vivo, até onde a musculação elétrica pode contribuir para a performance. Você realmente quer ficar de fora desse momento?',

            // Seção 07: Expositores
            'congresso_expositores_badge' => '🤝 EXPOSITORES',
            'congresso_expositores_title' => 'ENCONTRE TECNOLOGIAS, PRODUTOS E OPORTUNIDADES PARA O SEU NEGÓCIO',
            'congresso_expositores_desc' => 'A área de expositores reunirá marcas e soluções que estão movimentando o mercado da musculação elétrica. Você poderá conhecer equipamentos, produtos, tecnologias e serviços, conversar diretamente com representantes e descobrir alternativas para aprimorar sua atuação ou expandir seu negócio.',
            'congresso_expositores_benefits_json' => json_encode([
                'Comparar soluções em um único ambiente',
                'Conhecer lançamentos e novidades',
                'Tirar dúvidas diretamente com as marcas',
                'Encontrar possíveis fornecedores e parceiros',
                'Identificar oportunidades de investimento e crescimento'
            ]),
            'congresso_expositores_manifesto' => 'CONHECIMENTO + TECNOLOGIA + CONEXÕES = MAIS POSSIBILIDADES PARA VOCÊ',

            // Seção 08: Convidados Especiais
            'congresso_convidados_badge' => '✨ CONVIDADOS ESPECIAIS',
            'congresso_convidados_title' => 'ALGUNS DOS MOMENTOS MAIS IMPORTANTES AINDA SERÃO REVELADOS',
            'congresso_convidados_desc' => 'O congresso contará com convidados especiais, que serão anunciados ao longo da jornada até o evento. São profissionais e nomes capazes de ampliar sua visão, provocar novas reflexões e tornar a experiência ainda mais relevante. Mas existe um detalhe: algumas surpresas só serão descobertas por quem estiver presente.',
            'congresso_convidados_cta_text' => 'QUEM SERÃO? Garanta seu ingresso e esteja no local para acompanhar cada revelação em primeira mão.',

            // Seção 09: Networking
            'congresso_networking_badge' => '🌐 NETWORKING',
            'congresso_networking_title' => 'UMA CONEXÃO PODE MUDAR O PRÓXIMO PASSO DA SUA CARREIRA',
            'congresso_networking_desc' => 'O Congresso de Musculação Elétrica reunirá profissionais de diferentes áreas em um mesmo ambiente, criando oportunidades para conversas que dificilmente aconteceriam no dia a dia.',
            'congresso_networking_benefits_json' => json_encode([
                'Trocar experiências com profissionais do setor',
                'Conhecer pessoas com objetivos semelhantes',
                'Encontrar possíveis parceiros e clientes',
                'Compartilhar desafios e soluções',
                'Ampliar sua rede de contatos',
                'Criar oportunidades para sua carreira ou empresa'
            ]),
            'congresso_networking_footer' => 'Venha pelo conteúdo. Permaneça pelas conexões. E saia com contatos que podem continuar gerando valor muito depois do evento.',

            'congresso_palestrante_1_name' => 'Joselene Silva (Josi)',
            'congresso_palestrante_1_role' => 'Fundadora & CEO da Body Harmony',
            'congresso_palestrante_1_desc' => 'A mulher que trouxe a revolução EMS para o Brasil e construiu uma rede de licenciadas de ponta a ponta no território nacional.',
            'congresso_palestrante_1_image' => '',
            'congresso_palestrante_2_name' => 'Kaprice',
            'congresso_palestrante_2_role' => 'Co-fundadora & Diretora de Expansão',
            'congresso_palestrante_2_desc' => 'A arquiteta da metodologia Body Harmony, responsável por transformar resultados em sistema replicável.',
            'congresso_palestrante_2_image' => '',

            // Oferta & Ingressos (Sem menção a 1+1 ou 2 lugares)
            'congresso_oferta_badge' => '1º Lote de Lançamento · Vagas Limitadas',
            'congresso_oferta_title' => 'Ingresso Experience — O Melhor Custo-Benefício do Ano',
            'congresso_oferta_copy' => 'Garanta seu acesso oficial ao 1º Congresso Brasileiro de Musculação Elétrica com valor especial de 1º lote. Tenha acesso a todas as talks, demonstrações práticas, competição de atletas e feira de negócios.',
            'congresso_oferta_cta' => 'Garantir Ingresso Experience (1º Lote)',
            'congresso_oferta_note' => 'Parcelamento em até 12x no cartão. Virada de lote iminente sujeita à lotação do auditório.',
            'congresso_experience_title' => 'Ingresso Experience',
            'congresso_experience_badge' => 'Conteúdo & Networking',
            'congresso_experience_perk_badge' => 'Melhor opção Custo-Benefício',
            'congresso_experience_cta' => 'Garantir Ingresso Experience',
            'congresso_vip_title' => 'Ingresso VIP Exclusive',
            'congresso_vip_badge' => '🔥 MAIS ESCOLHIDO • APENAS 40 VAGAS',
            'congresso_vip_perk_badge' => '🎁 R$ 1.497 em Crédito Integral',
            'congresso_vip_cta' => 'Garantir Ingresso VIP + Crédito',
            'congresso_vip_subtitle' => 'Mais que um ingresso — um investimento que se converte em crédito real.',
            'congresso_vip_credit_title' => '💡 Como funciona o crédito?',
            'congresso_vip_credit_desc' => 'O valor integral do seu ingresso VIP (R$ 1.497) é contabilizado como crédito na sua adesão ao Licenciamento Body Harmony. Você não perde um centavo — transforma o custo do evento em investimento no seu negócio.',
            'congresso_vip_urgency_badge' => '🔴 40 vagas apenas',
            'congresso_countdown_label' => 'Tempo Restante',
            'congresso_countdown_title' => 'O Congresso começa em:',
            'congresso_countdown_urgency' => 'As vagas não esperam. Garanta a sua agora.',
            'congresso_countdown_cta' => 'QUERO GARANTIR MEU INGRESSO',
            'congresso_lotes_config_json' => json_encode([
                [
                    'id' => 'lote_1',
                    'title' => '1º Lote — Lançamento',
                    'price' => '697',
                    'deadline' => '2026-09-15T23:59:59',
                    'status' => 'active',
                    'show_timer' => true,
                    'timer_label' => 'Vira em:',
                    'badge' => '⚡ Vagas Limitadas',
                    'order' => 1
                ],
                [
                    'id' => 'lote_2',
                    'title' => '2º Lote — Oficial',
                    'price' => '897',
                    'deadline' => '2026-10-15T23:59:59',
                    'status' => 'upcoming',
                    'show_timer' => false,
                    'timer_label' => 'Abre em breve',
                    'badge' => 'Próximo Lote',
                    'order' => 2
                ],
                [
                    'id' => 'lote_3',
                    'title' => '3º Lote — Última Chamada',
                    'price' => '1.197',
                    'deadline' => '2026-11-06T23:59:59',
                    'status' => 'upcoming',
                    'show_timer' => false,
                    'timer_label' => 'Na Semana do Evento',
                    'badge' => 'Lote Final',
                    'order' => 3
                ]
            ]),

            // Seção 10: Por Que Participar?
            'congresso_por_que_label' => 'POR QUE PARTICIPAR?',
            'congresso_por_que_title' => 'PORQUE ESPERAR PODE CUSTAR MAIS DO QUE O SEU INGRESSO',
            'congresso_por_que_intro' => 'O mercado está evoluindo rapidamente. Novas tecnologias, métodos e oportunidades estão surgindo, e quem se atualiza primeiro se prepara melhor para tomar decisões e se posicionar.',
            'congresso_por_que_items_json' => json_encode([
                'Conteúdo direcionado para sua realidade profissional',
                'Demonstrações e experiências práticas',
                'Profissionais e especialistas do mercado',
                'Tecnologias e soluções inovadoras',
                'Marcas e expositores',
                'Networking estratégico',
                'Competição exclusiva de atletas',
                'Convidados especiais',
                'Novas possibilidades de atuação e negócios'
            ]),
            'congresso_por_que_fechamento' => 'Um único dia pode gerar ideias, contatos e aprendizados capazes de influenciar seus próximos meses de trabalho. Não espere o mercado mudar para depois tentar alcançá-lo.',

            // Seção 12: Para Quem Quer Estar à Frente
            'congresso_frente_title' => 'PARA QUEM QUER ESTAR À FRENTE',
            'congresso_frente_intro' => 'Você pode continuar observando as mudanças do mercado de longe. Ou pode participar do ambiente onde profissionais, tecnologias e oportunidades estarão reunidos.',
            'congresso_frente_items_json' => json_encode([
                'Atualizar sua visão profissional',
                'Conhecer novas aplicações',
                'Tomar decisões com mais informação',
                'Ampliar sua rede de contatos',
                'Descobrir oportunidades antes da maioria',
                'Preparar-se para o próximo capítulo da musculação elétrica no Brasil'
            ]),
            'congresso_frente_footer' => '07 DE NOVEMBRO. São Paulo. O Congresso Brasileiro de Musculação Elétrica. As vagas são limitadas, e a experiência acontece em uma única data.',

            // Seção 13: CTA Final
            'congresso_footer_title' => 'SEU LUGAR PRECISA ESTAR ENTRE OS PROFISSIONAIS QUE ESTÃO CONSTRUINDO O FUTURO DO MERCADO.',
            'congresso_footer_subtitle' => 'Garanta agora seu ingresso para o Congresso de Musculação Elétrica e tenha acesso a um dia completo de conhecimento, prática, tecnologia, conexões e oportunidades. Não deixe para decidir depois. As vagas são limitadas, e os melhores momentos do congresso só poderão ser vividos por quem estiver presente.',
            'congresso_footer_cta' => 'QUERO GARANTIR MEU INGRESSO',

            // Seção 14: Resumo Executivo
            'congresso_resumo_label' => 'MATERIAL EXECUTIVO EXCLUSIVO',
            'congresso_resumo_title' => 'QUER ENTENDER RAPIDAMENTE TUDO O QUE O EVENTO PODE OFERECER?',
            'congresso_resumo_subtitle' => 'Baixe o Resumo Executivo oficial do Congresso de Musculação Elétrica e confira as principais informações para decidir sua participação.',
            'congresso_resumo_items_json' => json_encode([
                'Programação', 'Experiências práticas', 'Talks', 'Competição de atletas', 'Expositores', 'Convidados especiais', 'Localização', 'Diferenciais do congresso', 'Benefícios para sua carreira e seu negócio'
            ]),
            'congresso_resumo_action_type' => 'whatsapp', // 'whatsapp' | 'pdf'
            'congresso_resumo_cta' => 'GERAR RESUMO EXECUTIVO',
            'congresso_resumo_pdf_url' => '',
            'congresso_resumo_whatsapp' => '5518996959486',
            'congresso_resumo_footer' => 'Não é apenas mais um evento no calendário. É uma oportunidade concentrada para aprender, testar novas ideias, conhecer pessoas estratégicas e se posicionar diante de um mercado em crescimento. Garanta seu ingresso e faça parte do próximo capítulo da musculação elétrica no Brasil.',
            'congresso_typo_hero_align' => 'center',
            'congresso_typo_hero_title_size' => 'normal',
            'congresso_typo_hero_title_weight' => '900',
            'congresso_typo_body_size' => '16px',
            'congresso_typo_section_spacing' => 'normal',
            'congresso_typo_font_family' => 'Montserrat',
            'congresso_typo_border_radius' => 'rounded_luxury',
            'congresso_shaders_active' => 1,
            'congresso_typography_json' => '',
            // PLAN-110: Galeria de fotos do carrossel do Espaço
            'congresso_espaco_gallery_json' => '',
            // PLAN-110: Espaçamento granular por seção (string de shorthand padding CSS)
            'congresso_spacing_hero'   => '8.5rem 1.5rem 6.5rem',
            'congresso_spacing_sobre'  => '7rem 1.5rem 8rem',
            'congresso_spacing_oferta' => '8rem 1.5rem 9rem',
            'congresso_spacing_vip'    => '7.5rem 1.5rem 8.5rem',
            'congresso_spacing_espaco' => '6.5rem 1.5rem 7.5rem',
            // PLAN-110: Tamanho tipográfico granular por nível (rem)
            'congresso_size_hero_h1'       => '4.5rem',
            'congresso_size_hero_subtitle' => '1.25rem',
            'congresso_size_sobre_title'   => '2.5rem',
            'congresso_size_sobre_body'    => '1.1rem',
            'congresso_size_oferta_title'  => '2.5rem',
            'congresso_size_vip_title'     => '2.5rem',
            'congresso_size_espaco_title'  => '2.5rem',
            // PLAN-137: Sistema de 3 Lotes com Status e Timer
            'congresso_lotes_active'       => 1,
            'congresso_lote_vigente'       => '2',
            'congresso_lote_1_nome'        => '1º Lote — Lançamento',
            'congresso_lote_1_exp_price'   => 'R$ 697',
            'congresso_lote_1_vip_price'   => 'R$ 1.497',
            'congresso_lote_1_deadline'    => '2026-08-20T23:59:59',
            'congresso_lote_2_nome'        => '2º Lote — Oficial',
            'congresso_lote_2_exp_price'   => 'R$ 697',
            'congresso_lote_2_vip_price'   => 'R$ 1.497',
            'congresso_lote_2_deadline'    => '2026-09-30T23:59:59',
            'congresso_lote_3_nome'        => '3º Lote — Final',
            'congresso_lote_3_exp_price'   => 'R$ 897',
            'congresso_lote_3_vip_price'   => 'R$ 1.897',
            'congresso_lote_3_deadline'    => '2026-11-06T23:59:59',

            // PLAN-164: Personalização Total de WhatsApp do Congresso
            'congresso_whatsapp_number'      => '5518996959486',
            'congresso_whatsapp_message'     => 'Olá! Gostaria de tirar dúvidas sobre o 1º Congresso Brasileiro de Musculação Elétrica.',
            'congresso_whatsapp_button_text' => 'Dúvidas no WhatsApp',
            'congresso_whatsapp_active'      => 1,

            // PLAN-166: Ordem Personalizada das Seções da Landing Page
            'congresso_sections_order'       => 'hero,sobre,oferta,vip,tabela,espaco,testemunhos,countdown,faq,footer',
        ];

        try {
            $stmt = $this->db->query("SELECT `setting_key`, `setting_value` FROM `shop_settings`");
            if ($stmt) {
                $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
                foreach ($rows as $k => $v) {
                    if (str_ends_with($k, '_active')) {
                        $defaults[$k] = (int)$v;
                    } else if (isset($defaults[$k])) {
                        $defaults[$k] = (string)$v;
                    } else {
                        $defaults[$k] = $v;
                    }
                }
            }
        } catch (\Throwable $e) {
            error_log('[ShopService] getSettings error: ' . $e->getMessage());
        }

        return $defaults;
    }

    /**
     * Updates settings for the shop CMS.
     */
    public function updateSettings(array $settings): bool {
        $stmt = $this->db->prepare("
            INSERT INTO `shop_settings` (`setting_key`, `setting_value`) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`), `updated_at` = NOW()
        ");

        foreach ($settings as $key => $val) {
            $cleanVal = is_bool($val) ? ($val ? '1' : '0') : (string)$val;
            $stmt->execute([$key, $cleanVal]);
        }

        return true;
    }
}
