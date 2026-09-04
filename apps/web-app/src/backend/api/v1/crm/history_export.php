<?php
// apps/web-app/src/backend/api/v1/crm/history_export.php
// Body Harmony Nexus V3.1 — CRM History Export Endpoint (PLAN-165)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/CrmHistorySyncService.php';

use BodyHarmony\Services\CrmHistorySyncService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

$inboxId = (int)($_GET['inbox_id'] ?? 0);
$format = $_GET['format'] ?? 'json';

if ($inboxId <= 0) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'ID da caixa de entrada é obrigatório para exportação.'
    ]);
    exit();
}

try {
    $service = new CrmHistorySyncService($dbConn);
    $result = $service->exportHistory($inboxId, $format);
    echo json_encode($result);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
