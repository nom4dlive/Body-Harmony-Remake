<?php
// apps/web-app/src/backend/api/v1/crm/status.php
// Body Harmony Nexus V3.1 — CRM Realtime Instances Status Endpoint (PLAN-158)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/CrmBridgeService.php';

use BodyHarmony\Services\CrmBridgeService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

try {
    $service = new CrmBridgeService($dbConn);
    $result = $service->getInstancesStatus();
    echo json_encode($result);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao obter status das instâncias: ' . $e->getMessage(),
        'instances' => []
    ]);
}
