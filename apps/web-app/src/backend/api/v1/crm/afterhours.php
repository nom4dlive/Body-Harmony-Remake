<?php
// apps/web-app/src/backend/api/v1/crm/afterhours.php
// Body Harmony Nexus V3.1 — After-Hours AI Endpoint (PLAN-173)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../Services/AfterHoursAiService.php';

use BodyHarmony\Services\AfterHoursAiService;

header('Content-Type: application/json; charset=utf-8');

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $service = new AfterHoursAiService($dbConn);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true) ?? $_POST ?? [];

        // Modo simulação de mensagem
        if (!empty($data['simulate_message'])) {
            $reply = $service->generateAfterHoursReply(
                $data['simulate_message'],
                $data['phone'] ?? '5518996959486',
                $data['channel'] ?? 'whatsapp'
            );
            echo json_encode($reply, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Atualização de configurações de horário
        $result = $service->updateSettings($data);
        echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    $result = $service->getSettings();
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
