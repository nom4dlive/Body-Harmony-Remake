<?php
// apps/web-app/src/backend/api/v1/crm/inbox_update.php
// Body Harmony Nexus V3.1 — CRM Inbox Name Update Endpoint (PLAN-164)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/CrmBridgeService.php';

use BodyHarmony\Services\CrmBridgeService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

// Resolução de inboxId a partir da rota ou query/body
$inboxId = isset($inboxId) ? (int)$inboxId : 0;
if ($inboxId <= 0 && isset($_GET['inboxId'])) {
    $inboxId = (int)$_GET['inboxId'];
}

// Leitura do payload JSON
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: [];

if ($inboxId <= 0 && !empty($body['inboxId'])) {
    $inboxId = (int)$body['inboxId'];
}

$newName = trim($body['name'] ?? '');

if ($inboxId <= 0 || empty($newName)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'ID da caixa de entrada e novo nome são obrigatórios.'
    ]);
    exit();
}

try {
    $service = new CrmBridgeService($dbConn);
    $result = $service->updateInboxName($inboxId, $newName);
    echo json_encode($result);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
