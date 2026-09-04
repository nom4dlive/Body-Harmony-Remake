<?php
// apps/web-app/src/backend/api/v1/admin/whatsapp-templates/index.php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../contracts/ensure_tables.php';

try {
    $pdo = getDbConnection();
    ensureWhatsAppTemplatesTableExist($pdo);

    $method = $_SERVER['REQUEST_METHOD'];

    // Authenticaton check (HTTP 401 on missing session)
    if (file_exists(__DIR__ . '/../../auth_check.php')) {
        require_once __DIR__ . '/../../auth_check.php';
    }

    if ($method === 'GET') {
        $category = $_GET['category'] ?? 'ALL';
        $search = trim($_GET['search'] ?? '');

        $sql = "SELECT id, slug, category, title, description, content, variables_json, is_active, display_order, created_at, updated_at FROM whatsapp_message_templates WHERE is_active = 1";
        $params = [];

        if ($category !== 'ALL' && !empty($category)) {
            $sql .= " AND category = ?";
            $params[] = $category;
        }

        if (!empty($search)) {
            $sql .= " AND (title LIKE ? OR description LIKE ? OR content LIKE ?)";
            $searchTerm = '%' . $search . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $sql .= " ORDER BY display_order ASC, id ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'ok' => true,
            'categories' => ['LICENCIADAS', 'ALUNAS', 'CONTRATOS', 'SUPORTE'],
            'templates' => $templates
        ]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $title = trim($input['title'] ?? '');
        $category = trim($input['category'] ?? 'LICENCIADAS');
        $description = trim($input['description'] ?? '');
        $content = trim($input['content'] ?? '');
        $variables = $input['variables_json'] ?? '[]';

        if (empty($title) || empty($content)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Título e conteúdo são obrigatórios.']);
            exit;
        }

        $slug = strtolower(preg_replace('/[^a-z0-9]+/', '-', iconv('UTF-8', 'ASCII//TRANSLIT', $title))) . '-' . rand(100, 999);

        $stmt = $pdo->prepare("
            INSERT INTO whatsapp_message_templates (slug, category, title, description, content, variables_json, is_active, display_order)
            VALUES (?, ?, ?, ?, ?, ?, 1, 99)
        ");
        $stmt->execute([$slug, $category, $title, $description, $content, is_array($variables) ? json_encode($variables) : $variables]);

        echo json_encode(['ok' => true, 'message' => 'Modelo de mensagem criado com sucesso!', 'id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = (int)($input['id'] ?? 0);
        $title = trim($input['title'] ?? '');
        $category = trim($input['category'] ?? '');
        $description = trim($input['description'] ?? '');
        $content = trim($input['content'] ?? '');

        if ($id <= 0 || empty($title) || empty($content)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'ID, título e conteúdo são obrigatórios para edição.']);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE whatsapp_message_templates
            SET title = ?, category = ?, description = ?, content = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$title, $category, $description, $content, $id]);

        echo json_encode(['ok' => true, 'message' => 'Modelo de mensagem atualizado com sucesso!']);
        exit;
    }

    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'ID inválido para exclusão.']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM whatsapp_message_templates WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['ok' => true, 'message' => 'Modelo de mensagem excluído com sucesso!']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método HTTP não suportado.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Erro interno ao processar modelos de WhatsApp: ' . $e->getMessage()
    ]);
}
