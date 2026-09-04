<?php
// apps/web-app/src/backend/api/v1/crm/anamnese_webhook.php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../Services/CrmAutomationService.php';

use BodyHarmony\Services\CrmAutomationService;

header('Content-Type: application/json');

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $input = file_get_contents('php://input');
    $payload = json_decode($input, true) ?? $_POST ?? [];

    $service = new CrmAutomationService($dbConn);
    $result = $service->handleAnamneseWebhook($payload);

    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
