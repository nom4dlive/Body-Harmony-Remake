<?php
// apps/web-app/src/backend/api/v1/crm/burner.php
// CRM Burner Dispatch Engine & Campaign Queue Endpoint (PLAN-155)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/BurnerDispatchService.php';

use BodyHarmony\Services\BurnerDispatchService;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed. Use POST.']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true) ?: [];

$action = $payload['action'] ?? 'enqueue';

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $burnerService = new BurnerDispatchService($dbConn);

    if ($action === 'enqueue') {
        $recipients = $payload['recipients'] ?? [];
        $template = $payload['message_template'] ?? '';
        $options = $payload['options'] ?? [];

        if (empty($recipients) || empty($template)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Parâmetros "recipients" e "message_template" são obrigatórios.']);
            exit;
        }

        $res = $burnerService->enqueueCampaign($recipients, $template, $options);
        echo json_encode(['success' => true, 'campaign' => $res]);
        exit;
    }

    if ($action === 'dispatch_single') {
        $phone = $payload['phone'] ?? '';
        $template = $payload['message_template'] ?? '';
        $forcedInstance = $payload['instance'] ?? null;

        if (empty($phone) || empty($template)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Parâmetros "phone" e "message_template" são obrigatórios.']);
            exit;
        }

        $res = $burnerService->dispatchSingle($phone, $template, $forcedInstance);
        echo json_encode(['success' => true, 'dispatch' => $res]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => "Ação desconhecida: {$action}"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro no motor burner: ' . $e->getMessage()]);
}
