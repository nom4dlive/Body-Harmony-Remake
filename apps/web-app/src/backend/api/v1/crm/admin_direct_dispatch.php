<?php
// apps/web-app/src/backend/api/v1/crm/admin_direct_dispatch.php
// Hermes Autonomous Proactive Direct Dispatch Endpoint (PLAN-191 - Nexus Protocol V4.9)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/HermesCrmAgentService.php';

use BodyHarmony\Services\HermesCrmAgentService;

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'METHOD_NOT_ALLOWED',
        'message' => 'Apenas requisições POST são permitidas neste endpoint.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data || empty($data['target_phone']) || empty($data['objective'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'INVALID_PAYLOAD',
            'message' => 'Campos obrigatórios ausentes: target_phone e objective.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $targetPhone = (string)$data['target_phone'];
    $instance = (string)($data['instance'] ?? 'inst_comercial');
    $objective = (string)$data['objective'];
    $context = (array)($data['context'] ?? []);

    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $hermesService = new HermesCrmAgentService($dbConn);
    $result = $hermesService->dispatchProactiveMessage($instance, $targetPhone, $objective, $context);

    if (!$result['success'] && ($result['error'] ?? '') === 'DISPATCH_FORBIDDEN_NON_ADMIN') {
        http_response_code(403);
    } elseif (!$result['success']) {
        http_response_code(502);
    } else {
        http_response_code(200);
    }

    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'INTERNAL_SERVER_ERROR',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
