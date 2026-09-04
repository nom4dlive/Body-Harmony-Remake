<?php
// apps/web-app/src/backend/api/v1/crm/hermes_rlhf.php
// Body Harmony CRM — RLHF Feedback Intake & Model Alignment Endpoint (PLAN-195)

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

        if (empty($payload['original_output']) && empty($payload['input_context'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Conteúdo da sugestão ou contexto original é obrigatório para registrar RLHF.'
            ]);
            exit;
        }

        $result = $intelService->recordRlhfFeedback($payload);
        echo json_encode($result);
        exit;
    }

    // GET: Listar histórico recente de calibrações
    $stmt = $dbConn ? $dbConn->query("SELECT * FROM crm_hermes_rlhf_feedback ORDER BY id DESC LIMIT 50") : null;
    $list = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

    echo json_encode([
        'success' => true,
        'total_feedbacks' => count($list),
        'feedbacks' => $list
    ]);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao processar feedback RLHF: ' . $e->getMessage()
    ]);
}
