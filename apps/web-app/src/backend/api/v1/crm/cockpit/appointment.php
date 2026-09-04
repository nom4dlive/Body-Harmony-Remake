<?php
// apps/web-app/src/backend/api/v1/crm/cockpit/appointment.php
// Body Harmony Nexus V3.1 — CRM Cockpit Create Appointment Endpoint (PLAN-166)

require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../../../cors.php';
require_once __DIR__ . '/../../Services/CrmCockpitService.php';

use BodyHarmony\Services\CrmCockpitService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);

if (!is_array($data)) {
    $data = $_POST;
}

try {
    $service = new CrmCockpitService($dbConn);
    $result = $service->createAppointment($data);
    echo json_encode($result);
} catch (\Throwable $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
