<?php
// apps/web-app/src/backend/api/v1/crm/canned_responses.php
// Body Harmony Nexus V3.1 — CRM Canned Responses & Sales Macros Endpoint (PLAN-171)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../Services/CrmCannedResponsesService.php';

use BodyHarmony\Services\CrmCannedResponsesService;

header('Content-Type: application/json; charset=utf-8');

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $service = new CrmCannedResponsesService($dbConn);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $result = $service->syncMacrosToChatwoot();
        echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    $result = $service->listMacros();
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
