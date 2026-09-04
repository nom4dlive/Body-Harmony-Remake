<?php
// apps/web-app/src/backend/api/v1/crm/cockpit/context.php
// Body Harmony Nexus V3.1 — CRM Cockpit 360º Context Endpoint (PLAN-166)

require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../../../cors.php';
require_once __DIR__ . '/../../Services/CrmCockpitService.php';

use BodyHarmony\Services\CrmCockpitService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

$phone = trim($_GET['phone'] ?? '');
$conversationId = isset($_GET['conversation_id']) ? (int)$_GET['conversation_id'] : null;
$name = isset($_GET['name']) ? trim($_GET['name']) : null;

if (empty($phone)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Parâmetro telefone é obrigatório.'
    ]);
    exit();
}

try {
    $service = new CrmCockpitService($dbConn);
    $result = $service->getContext($phone, $conversationId, $name);
    echo json_encode($result);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
