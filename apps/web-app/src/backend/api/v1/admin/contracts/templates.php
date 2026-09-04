<?php
// apps/web-app/src/backend/api/v1/admin/contracts/templates.php

require_once __DIR__ . '/../../../cors.php';
require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../../../auth_check.php';
require_once __DIR__ . '/ensure_tables.php';
require_once __DIR__ . '/../../Services/ContractSchemaHelper.php';

use BodyHarmony\Services\ContractSchemaHelper;

header('Content-Type: application/json; charset=utf-8');

$pdo = getDbConnection();
ensureContractsTablesExist($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// Helper wrapper for backwards compatibility
function normalizeVariablesSchema($rawSchema, string $htmlContent): array {
    return ContractSchemaHelper::normalizeVariablesSchema($rawSchema, $htmlContent);
}

// =========================================================================
// 1. GET: List templates (optional filter by category or id)
// =========================================================================
if ($method === 'GET') {
    try {
        $category = $_GET['category'] ?? null;
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM contract_templates WHERE id = ?");
            $stmt->execute([$id]);
            $t = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$t) {
                http_response_code(404);
                echo json_encode(['ok' => false, 'error' => 'Modelo não encontrado.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $sections = normalizeVariablesSchema($t['variables_schema'] ?? null, $t['content_html']);

            echo json_encode([
                'ok' => true,
                'template' => [
                    'id' => (int)$t['id'],
                    'slug' => $t['slug'],
                    'title' => $t['title'],
                    'category' => $t['category'],
                    'description' => $t['description'],
                    'version' => $t['version'],
                    'sections' => $sections,
                    'content_html' => $t['content_html'],
                    'is_active' => (bool)$t['is_active'],
                    'created_at' => $t['created_at'],
                    'updated_at' => $t['updated_at']
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $sql = "SELECT * FROM contract_templates WHERE is_active = 1";
        $params = [];
        if (!empty($category) && $category !== 'ALL') {
            $sql .= " AND category = ?";
            $params[] = $category;
        }
        $sql .= " ORDER BY id ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rawTemplates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $templates = [];
        foreach ($rawTemplates as $t) {
            $sections = normalizeVariablesSchema($t['variables_schema'] ?? null, $t['content_html']);

            $templates[] = [
                'id' => (int)$t['id'],
                'slug' => $t['slug'],
                'title' => $t['title'],
                'category' => $t['category'],
                'description' => $t['description'],
                'version' => $t['version'],
                'sections' => $sections,
                'default_content_html' => $t['content_html'],
                'is_active' => (bool)$t['is_active']
            ];
        }

        echo json_encode([
            'ok' => true,
            'templates' => $templates
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =========================================================================
// 2. POST: Create new template (with auto-detection of {{TAGS}})
// =========================================================================
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Payload JSON inválido.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $title = trim($input['title'] ?? '');
    $category = trim($input['category'] ?? 'Licenciamento');
    $description = trim($input['description'] ?? '');
    $contentHtml = trim($input['content_html'] ?? '');
    $version = trim($input['version'] ?? 'v1.0');
    $slug = trim($input['slug'] ?? '');

    if (empty($title) || empty($contentHtml)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Título e Conteúdo do modelo são obrigatórios.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (empty($slug)) {
        $slug = preg_replace('/[^a-z0-9]+/', '-', strtolower(trim($title)));
        $slug = trim($slug, '-');
    }

    // Auto-detect variables and structure into sections
    $variablesSchema = normalizeVariablesSchema($input['variables_schema'] ?? null, $contentHtml);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO contract_templates (slug, title, category, description, version, variables_schema, content_html, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ");
        $stmt->execute([
            $slug,
            $title,
            $category,
            $description,
            $version,
            json_encode($variablesSchema, JSON_UNESCAPED_UNICODE),
            $contentHtml
        ]);

        $newId = (int)$pdo->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'ok' => true,
            'message' => 'Modelo de contrato criado com sucesso!',
            'template' => [
                'id' => $newId,
                'slug' => $slug,
                'title' => $title,
                'category' => $category,
                'detected_variables' => $variablesSchema
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Erro ao salvar modelo: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =========================================================================
// 3. PUT: Update existing template
// =========================================================================
if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)($input['id'] ?? 0);

    if (!$id) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'ID do modelo é obrigatório para atualização.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $title = trim($input['title'] ?? '');
    $category = trim($input['category'] ?? '');
    $description = trim($input['description'] ?? '');
    $contentHtml = trim($input['content_html'] ?? '');
    $version = trim($input['version'] ?? '');
    $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

    try {
        // Auto-detect and normalize variables
        $variablesSchema = !empty($contentHtml) ? normalizeVariablesSchema($input['variables_schema'] ?? null, $contentHtml) : null;

        $stmt = $pdo->prepare("
            UPDATE contract_templates 
            SET title = COALESCE(NULLIF(?, ''), title),
                category = COALESCE(NULLIF(?, ''), category),
                description = COALESCE(NULLIF(?, ''), description),
                version = COALESCE(NULLIF(?, ''), version),
                content_html = COALESCE(NULLIF(?, ''), content_html),
                variables_schema = CASE WHEN ? IS NOT NULL THEN ? ELSE variables_schema END,
                is_active = ?,
                updated_at = NOW()
            WHERE id = ?
        ");

        $schemaJson = $variablesSchema ? json_encode($variablesSchema, JSON_UNESCAPED_UNICODE) : null;

        $stmt->execute([
            $title,
            $category,
            $description,
            $version,
            $contentHtml,
            $schemaJson,
            $schemaJson,
            $isActive,
            $id
        ]);

        echo json_encode([
            'ok' => true,
            'message' => 'Modelo de contrato atualizado com sucesso!'
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Erro ao atualizar modelo: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =========================================================================
// 4. DELETE: Deactivate template
// =========================================================================
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'ID do modelo é obrigatório.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE contract_templates SET is_active = 0, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['ok' => true, 'message' => 'Modelo desativado com sucesso!'], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método HTTP não suportado.'], JSON_UNESCAPED_UNICODE);
