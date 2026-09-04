<?php
// apps/web-app/src/backend/api/v1/crm/instance_disconnect.php
// Body Harmony Nexus V3.1 — CRM Instance Disconnect (Logout) Endpoint (PLAN-158)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/CrmBridgeService.php';

use BodyHarmony\Services\CrmBridgeService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

$instance = $_GET['instance'] ?? $_POST['instance'] ?? 'juridico';
if (empty($instance)) {
    $rawInput = file_get_contents('php://input');
    if ($rawInput) {
        $jsonInput = json_decode($rawInput, true);
        $instance = $jsonInput['instance'] ?? 'juridico';
    }
}

try {
    $service = new CrmBridgeService($dbConn);
    $result = $service->disconnectInstance($instance);
    echo json_encode($result);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'instance_key' => $instance,
        'error' => 'Erro ao desconectar instância: ' . $e->getMessage()
    ]);
}
