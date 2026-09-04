<?php

require_once __DIR__ . '/../Services/ShopService.php';
require_once __DIR__ . '/../Services/StonePaymentService.php';
require_once __DIR__ . '/../Services/Payment/AsaasGatewayService.php';

use BodyHarmony\Services\ShopService;
use BodyHarmony\Services\StonePaymentService;
use BodyHarmony\Services\Payment\AsaasGatewayService;

class ShopController {
    private $db;
    private ShopService $shopService;

    public function __construct() {
        global $pdo, $db;
        $this->db = $pdo ?? $db;
        $this->shopService = new ShopService($this->db);
    }

    private function isAdmin(): bool {
        global $loggedUser;
        if (!empty($loggedUser['is_admin']) || in_array($loggedUser['role'] ?? '', ['superadmin', 'admin'], true)) {
            return true;
        }
        $role = $_SESSION['role'] ?? $_SESSION['user_role'] ?? '';
        return in_array($role, ['superadmin', 'admin'], true) || !empty($_SESSION['admin_user_id']) || !empty($_SESSION['user_id']);
    }

    private function getAdminId(): int {
        global $loggedUser;
        if (!empty($loggedUser['id'])) {
            return (int)$loggedUser['id'];
        }
        return (int)($_SESSION['admin_user_id'] ?? $_SESSION['user_id'] ?? 1);
    }

    /**
     * GET /api/v1/shop/products
     */
    public function listProducts() {
        try {
            $category = $_GET['category'] ?? null;
            $products = $this->shopService->listProducts($category, true);
            Response::json(['success' => true, 'data' => $products]);
        } catch (Throwable $e) {
            error_log('[ShopController] listProducts error: ' . $e->getMessage());
            Response::error('Erro ao listar produtos da loja.', 500);
        }
    }

    /**
     * GET /api/v1/shop/products/{slug}
     */
    public function getProduct($slug) {
        try {
            $product = $this->shopService->getProduct($slug);
            if (!$product) {
                Response::error('Produto não encontrado.', 404);
                return;
            }
            Response::json(['success' => true, 'data' => $product]);
        } catch (Throwable $e) {
            error_log('[ShopController] getProduct error: ' . $e->getMessage());
            Response::error('Erro ao consultar produto.', 500);
        }
    }

    /**
     * POST /api/v1/shop/checkout
     */
    public function processCheckout() {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body || empty($body['product_id']) || empty($body['customer'])) {
            Response::error('Dados incompletos para o checkout.', 400);
            return;
        }

        try {
            $productId = (int)$body['product_id'];
            $customer = $body['customer'];
            $payment = $body['payment'] ?? [
                'method' => $body['payment_method'] ?? 'card',
                'installments' => $body['installments'] ?? 1,
                'card' => $body['card'] ?? []
            ];

            $result = $this->shopService->processCheckout($customer, $productId, $payment);
            
            if ($result['success']) {
                Response::json($result, 200);
            } else {
                Response::json($result, 422);
            }
        } catch (Throwable $e) {
            error_log('[ShopController] processCheckout error: ' . $e->getMessage());
            Response::error('Falha ao processar pagamento na Stone: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/v1/shop/webhook
     * Stone Payments Webhook — processa notificacoes de status de pagamento
     */
    public function handleWebhook() {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body) {
            Response::error('Payload vazio.', 400);
            return;
        }

        error_log('[Stone Webhook] Received: ' . json_encode(array_keys($body)));

        try {
            $chargeId = $body['id'] ?? $body['charge_id'] ?? null;
            $status = $body['status'] ?? null;
            $paidAt = $body['paid_at'] ?? null;
            $amount = $body['amount'] ?? null;

            if (!$chargeId) {
                Response::json(['success' => true, 'received' => true, 'note' => 'No charge_id']);
                return;
            }

            $stmt = $this->db->prepare("
                SELECT id, customer_name, customer_email, amount_cents, payment_status
                FROM shop_orders
                WHERE stone_charge_id = ?
                LIMIT 1
            ");
            $stmt->execute([$chargeId]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                error_log("[Stone Webhook] Order not found for charge_id: {$chargeId}");
                Response::json(['success' => true, 'received' => true, 'note' => 'Order not found']);
                return;
            }

            $newStatus = match($status) {
                'captured', 'paid' => 'PAID',
                'failed', 'declined' => 'FAILED',
                'refunded' => 'CANCELLED',
                default => $order['payment_status']
            };

            if ($newStatus !== $order['payment_status']) {
                $upd = $this->db->prepare("
                    UPDATE shop_orders
                    SET payment_status = ?,
                        stone_raw_response = ?
                    WHERE id = ?
                ");
                $upd->execute([$newStatus, json_encode($body), $order['id']]);

                if ($newStatus === 'PAID' && $order['payment_status'] !== 'PAID') {
                    $this->createFinancialTransactionFromOrder($order, $amount);
                }

                error_log("[Stone Webhook] Order #{$order['id']} status updated: {$order['payment_status']} -> {$newStatus}");
            }

            Response::json(['success' => true, 'received' => true]);
        } catch (\Throwable $e) {
            error_log('[Stone Webhook] Processing error: ' . $e->getMessage());
            Response::json(['success' => true, 'received' => true]);
        }
    }

    /**
     * Cria financial_transaction quando pagamento Stone e confirmado via webhook
     */
    private function createFinancialTransactionFromOrder(array $order, ?int $webhookAmount) {
        try {
            $amountCents = $webhookAmount ?? $order['amount_cents'];

            $productCategory = null;
            if (!empty($order['product_id'])) {
                $stmtProd = $this->db->prepare("SELECT category FROM shop_products WHERE id = ?");
                $stmtProd->execute([$order['product_id']]);
                $prodRow = $stmtProd->fetch(PDO::FETCH_ASSOC);
                $productCategory = $prodRow['category'] ?? null;
            }

            $taxTag = 'nao_definido';
            if ($productCategory && stripos($productCategory, 'licenciamento') !== false) {
                $taxTag = 'servicos_medicos_educacionais';
            } elseif ($productCategory && (stripos($productCategory, 'cosmet') !== false || stripos($productCategory, 'estetic') !== false)) {
                $taxTag = 'estetica_cosmetica';
            }

            $stmt = $this->db->prepare("
                INSERT INTO financial_transactions
                    (source_type, source_id, type, amount_cents, description, category,
                     tax_tag, payment_method, status, confirmed_at)
                VALUES ('shop_order', ?, 'revenue', ?, ?, ?, ?, 'card', 'confirmed', NOW())
            ");
            $stmt->execute([
                $order['id'],
                $amountCents,
                "Venda Stone: {$order['customer_name']}",
                $productCategory,
                $taxTag
            ]);

            error_log("[Stone Webhook] financial_transaction created for order #{$order['id']}: R$ " . number_format($amountCents / 100, 2, ',', '.'));
        } catch (\Throwable $e) {
            error_log("[Stone Webhook] Error creating financial_transaction for order #{$order['id']}: " . $e->getMessage());
        }
    }

    /**
     * GET /api/v1/admin/shop/orders
     */
    public function listAdminOrders() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $filters = [
                'status' => $_GET['status'] ?? null,
                'search' => $_GET['search'] ?? null
            ];
            $orders = $this->shopService->listOrders($filters);
            Response::json(['success' => true, 'data' => $orders]);
        } catch (Throwable $e) {
            error_log('[ShopController] listAdminOrders error: ' . $e->getMessage());
            Response::error('Erro ao listar pedidos.', 500);
        }
    }

    /**
     * GET /api/v1/admin/shop/leads
     */
    public function listAdminLeads() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $filters = [
                'status' => $_GET['status'] ?? null,
                'search' => $_GET['search'] ?? null
            ];
            $leads = $this->shopService->listLeads($filters);
            Response::json(['success' => true, 'data' => $leads]);
        } catch (Throwable $e) {
            error_log('[ShopController] listAdminLeads error: ' . $e->getMessage());
            Response::error('Erro ao listar leads da loja.', 500);
        }
    }

    /**
     * POST /api/v1/admin/shop/orders/{id}/validate
     */
    public function validateOrder($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $adminId = $this->getAdminId();
            $body = json_decode(file_get_contents('php://input'), true);
            $notes = $body['notes'] ?? null;

            $res = $this->shopService->validateOrder((int)$id, $adminId, $notes);
            Response::json($res);
        } catch (Throwable $e) {
            error_log('[ShopController] validateOrder error: ' . $e->getMessage());
            Response::error('Erro ao validar pedido: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/v1/admin/shop/checkin
     */
    public function checkinTicket() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $adminId = $this->getAdminId();
            $body = json_decode(file_get_contents('php://input'), true);
            $identifier = $body['ticket_identifier'] ?? ($body['code'] ?? ($body['token'] ?? ''));

            if (empty($identifier)) {
                Response::error('Identificador do ingresso é obrigatório.', 400);
                return;
            }

            $res = $this->shopService->checkinTicket((string)$identifier, $adminId);
            Response::json($res);
        } catch (Throwable $e) {
            error_log('[ShopController] checkinTicket error: ' . $e->getMessage());
            Response::error('Erro no credenciamento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/v1/shop/tickets/{token} (Público)
     */
    public function getPublicTicket($token) {
        try {
            $ticket = $this->shopService->getTicketPublic((string)$token);
            if (!$ticket) {
                Response::error('Ingresso não encontrado ou inválido.', 404);
                return;
            }
            Response::json(['success' => true, 'data' => $ticket]);
        } catch (Throwable $e) {
            error_log('[ShopController] getPublicTicket error: ' . $e->getMessage());
            Response::error('Erro ao consultar ingresso.', 500);
        }
    }

    /**
     * PUT /api/v1/admin/shop/orders/{id} (Superadmin / Admin RBAC)
     */
    public function updateOrder($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            $ok = $this->shopService->updateOrder((int)$id, $body);
            Response::json(['success' => $ok]);
        } catch (Throwable $e) {
            error_log('[ShopController] updateOrder error: ' . $e->getMessage());
            Response::error('Erro ao atualizar pedido: ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/v1/admin/shop/orders/{id} (Superadmin / Admin RBAC)
     */
    public function deleteOrder($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $ok = $this->shopService->deleteOrder((int)$id);
            Response::json(['success' => $ok]);
        } catch (Throwable $e) {
            error_log('[ShopController] deleteOrder error: ' . $e->getMessage());
            Response::error('Erro ao excluir pedido: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/v1/admin/shop/leads/{id} (Superadmin / Admin RBAC)
     */
    public function updateLead($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            $ok = $this->shopService->updateLead((int)$id, $body);
            Response::json(['success' => $ok]);
        } catch (Throwable $e) {
            error_log('[ShopController] updateLead error: ' . $e->getMessage());
            Response::error('Erro ao atualizar lead: ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/v1/admin/shop/leads/{id} (Superadmin / Admin RBAC)
     */
    public function deleteLead($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $ok = $this->shopService->deleteLead((int)$id);
            Response::json(['success' => $ok]);
        } catch (Throwable $e) {
            error_log('[ShopController] deleteLead error: ' . $e->getMessage());
            Response::error('Erro ao excluir lead: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/v1/admin/shop/products
     */
    public function listAdminProducts() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $category = $_GET['category'] ?? null;
            $products = $this->shopService->listProducts($category, false); // false = ALL products (active + inactive)
            Response::json(['success' => true, 'data' => $products]);
        } catch (Throwable $e) {
            error_log('[ShopController] listAdminProducts error: ' . $e->getMessage());
            Response::error('Erro ao listar catálogo administrativo.', 500);
        }
    }

    /**
     * POST /api/v1/admin/shop/products
     */
    public function createAdminProduct() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body || empty($body['name'])) {
                Response::error('Nome do produto é obrigatório.', 400);
                return;
            }

            $product = $this->shopService->createProduct($body);
            Response::json(['success' => true, 'data' => $product], 201);
        } catch (Throwable $e) {
            error_log('[ShopController] createAdminProduct error: ' . $e->getMessage());
            Response::error('Erro ao criar produto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/v1/admin/shop/products/{id}
     * POST /api/v1/admin/shop/products/{id}
     */
    public function updateAdminProduct($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) {
                Response::error('Payload vazio.', 400);
                return;
            }

            $ok = $this->shopService->updateProduct((int)$id, $body);
            Response::json(['success' => $ok]);
        } catch (Throwable $e) {
            error_log('[ShopController] updateAdminProduct error: ' . $e->getMessage());
            Response::error('Erro ao atualizar produto.', 500);
        }
    }

    /**
     * DELETE /api/v1/admin/shop/products/{id}
     */
    public function deleteAdminProduct($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $ok = $this->shopService->deleteProduct((int)$id);
            Response::json(['success' => $ok]);
        } catch (Throwable $e) {
            error_log('[ShopController] deleteAdminProduct error: ' . $e->getMessage());
            Response::error('Erro ao excluir produto.', 500);
        }
    }

    /**
     * POST /api/v1/admin/shop/products/{id}/toggle-status
     */
    public function toggleProductStatus($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $res = $this->shopService->toggleProductStatus((int)$id);
            Response::json(['success' => true, 'data' => $res]);
        } catch (Throwable $e) {
            error_log('[ShopController] toggleProductStatus error: ' . $e->getMessage());
            Response::error('Erro ao alternar status do produto.', 500);
        }
    }

    /**
     * POST /api/v1/admin/shop/products/{id}/image
     */
    public function uploadProductImage($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        if (!isset($_FILES['file']) && !isset($_FILES['image'])) {
            Response::error('Nenhum arquivo enviado.', 400);
            return;
        }

        $file = $_FILES['file'] ?? $_FILES['image'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::error('Erro no upload do arquivo (código ' . $file['error'] . ').', 400);
            return;
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
        if (!in_array($ext, $allowed, true)) {
            Response::error('Formato inválido. Formatos permitidos: JPG, PNG, WEBP, SVG.', 400);
            return;
        }

        $uploadDir = defined('PUBLIC_UPLOADS_DIR') ? PUBLIC_UPLOADS_DIR . '/shop/' : __DIR__ . '/../../../../public_html/uploads/shop/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = 'prod_' . (int)$id . '_' . time() . '.' . $ext;
        $targetPath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Falha ao gravar arquivo no disco.', 500);
            return;
        }

        $publicUrl = '/uploads/shop/' . $fileName;
        $this->shopService->updateProduct((int)$id, ['image_url' => $publicUrl]);

        Response::json([
            'success' => true,
            'image_url' => $publicUrl,
            'message' => 'Foto atualizada com sucesso!'
        ]);
    }

    /**
     * POST /api/v1/admin/congresso/gallery/upload
     * Upload de foto para a galeria do carrossel do Espaço Full Sales (PLAN-110)
     */
    public function uploadCongressoPhoto() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        if (!isset($_FILES['file']) && !isset($_FILES['image'])) {
            Response::error('Nenhum arquivo enviado.', 400);
            return;
        }

        $file = $_FILES['file'] ?? $_FILES['image'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::error('Erro no upload do arquivo (código ' . $file['error'] . ').', 400);
            return;
        }

        if ($file['size'] > 5242880) {
            Response::error('Arquivo muito grande. Limite: 5MB.', 400);
            return;
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];
        if (!in_array($ext, $allowed, true)) {
            Response::error('Formato inválido. Formatos permitidos: JPG, PNG, WEBP.', 400);
            return;
        }

        // Validação de MIME type
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($mimeType, $allowedMimes, true)) {
            Response::error('Tipo de arquivo não permitido.', 400);
            return;
        }

        $uploadDir = defined('PUBLIC_UPLOADS_DIR') ? PUBLIC_UPLOADS_DIR . '/congresso/' : __DIR__ . '/../../../../public_html/uploads/congresso/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = 'cong_' . time() . '.' . $ext;
        $targetPath = $uploadDir . basename($fileName);

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Falha ao gravar arquivo no disco.', 500);
            return;
        }

        $publicUrl = '/uploads/congresso/' . $fileName;

        Response::json([
            'success'  => true,
            'url'      => $publicUrl,
            'filename' => $fileName,
            'message'  => 'Foto enviada com sucesso!'
        ]);
    }

    /**
     * GET /api/v1/shop/settings
     */
    public function getPublicSettings() {
        try {
            $settings = $this->shopService->getSettings();
            Response::json(['success' => true, 'data' => $settings]);
        } catch (Throwable $e) {
            error_log('[ShopController] getPublicSettings error: ' . $e->getMessage());
            Response::error('Erro ao carregar configurações da loja.', 500);
        }
    }

    /**
     * GET /api/v1/admin/shop/settings
     */
    public function getAdminSettings() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $settings = $this->shopService->getSettings();
            Response::json(['success' => true, 'data' => $settings]);
        } catch (Throwable $e) {
            error_log('[ShopController] getAdminSettings error: ' . $e->getMessage());
            Response::error('Erro ao carregar configurações da loja.', 500);
        }
    }

    /**
     * POST /api/v1/admin/shop/settings
     */
    public function updateAdminSettings() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!is_array($body)) {
                Response::error('Payload inválido.', 400);
                return;
            }

            $this->shopService->updateSettings($body);
            $settings = $this->shopService->getSettings();
            Response::json(['success' => true, 'data' => $settings, 'message' => 'Textos e configurações da loja atualizados com sucesso!']);
        } catch (Throwable $e) {
            error_log('[ShopController] updateAdminSettings error: ' . $e->getMessage());
            Response::error('Erro ao salvar configurações da loja.', 500);
        }
    }

    /**
     * POST /api/v1/admin/shop/products/{id}/generate-payment-link
     * Gera um Link de Pagamento no Asaas para o produto especificado
     */
    public function generateAsaasPaymentLink($productId) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $productId = (int)$productId;

            // Buscar produto
            $stmt = $this->db->prepare("SELECT * FROM `shop_products` WHERE `id` = ? LIMIT 1");
            $stmt->execute([$productId]);
            $product = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$product) {
                Response::error('Produto não encontrado.', 404);
                return;
            }

            // Instanciar gateway Asaas
            $gateway = new AsaasGatewayService();

            // Criar link de pagamento
            $result = $gateway->createPaymentLink([
                'name' => $product['name'],
                'description' => $product['tagline'] ?? ($product['description'] ?? ''),
                'value_cents' => (int)$product['price_cents'],
                'max_installments' => 12,
                'external_reference' => 'shop_product_' . $productId
            ]);

            if (!$result['ok']) {
                Response::error($result['error'] ?? 'Falha ao gerar link de pagamento no Asaas.', 500);
                return;
            }

            // Salvar o link gerado no produto
            $updateStmt = $this->db->prepare("UPDATE `shop_products` SET `payment_link_url` = ? WHERE `id` = ?");
            $updateStmt->execute([$result['payment_link_url'], $productId]);

            Response::json([
                'success' => true,
                'data' => [
                    'payment_link_url' => $result['payment_link_url'],
                    'payment_link_id' => $result['payment_link_id'],
                    'is_mock' => $result['is_mock'] ?? false
                ],
                'message' => 'Link de pagamento Asaas gerado com sucesso.'
            ]);
        } catch (\Throwable $e) {
            error_log('[ShopController] generateAsaasPaymentLink error: ' . $e->getMessage());
            Response::error('Erro ao gerar link de pagamento: ' . $e->getMessage(), 500);
        }
    }
}


