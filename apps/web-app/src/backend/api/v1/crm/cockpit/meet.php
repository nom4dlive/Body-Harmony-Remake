<?php
// apps/web-app/src/backend/api/v1/crm/cockpit/meet.php
// Body Harmony Nexus V3.1 — CRM Cockpit Instant Meet Room Generator (PLAN-166)

require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../../../cors.php';
require_once __DIR__ . '/../../Services/CrmCockpitService.php';

use BodyHarmony\Services\CrmCockpitService;

header('Content-Type: application/json; charset=utf-8');

try {
    $service = new CrmCockpitService();
    $title = $_GET['title'] ?? 'Avaliação Online Body Harmony';
    $result = $service->generateMeetRoom($title);
    echo json_encode($result);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
