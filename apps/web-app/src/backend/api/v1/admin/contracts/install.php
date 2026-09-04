<?php
// apps/web-app/src/backend/api/v1/admin/contracts/install.php

require_once __DIR__ . '/../../../cors.php';
require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../../../auth_check.php';
require_once __DIR__ . '/ensure_tables.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = getDbConnection();
    ensureContractsTablesExist($pdo);

    // Verify templates count
    $stmt = $pdo->query("SELECT id, slug, title, category, version FROM contract_templates ORDER BY id ASC");
    $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'ok' => true,
        'message' => 'Tabelas e templates de contratos verificados e instalados com sucesso.',
        'templates_installed' => count($templates),
        'templates' => $templates
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
