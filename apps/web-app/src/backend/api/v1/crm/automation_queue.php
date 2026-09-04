<?php
// apps/web-app/src/backend/api/v1/crm/automation_queue.php
// Body Harmony CRM — Event-Driven Automation Queue with Human-in-the-Loop Validation (PLAN-195)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/HermesAdvancedIntelligenceService.php';

use BodyHarmony\Services\HermesAdvancedIntelligenceService;

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $intelService = new HermesAdvancedIntelligenceService($dbConn);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $raw = file_get_contents('php://input');
        $payload = json_decode($raw, true) ?: $_POST;

        $queueId = (int)($payload['queue_id'] ?? 0);
        $action = strtoupper($payload['action'] ?? 'APPROVE');
        $operatorId = $payload['operator_id'] ?? 'Atendente';
        $customMsg = $payload['custom_message'] ?? null;

        if (!$queueId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID da fila obrigatório.']);
            exit;
        }

        $res = $intelService->processAutomationAction($queueId, $action, $operatorId, $customMsg);
        echo json_encode($res);
        exit;
    }

    // GET: Listar itens na fila de automação
    $status = $_GET['status'] ?? null;
    $res = $intelService->getAutomationQueue($status);
    echo json_encode($res);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao processar fila de automações: ' . $e->getMessage()
    ]);
}
