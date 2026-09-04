<?php
// apps/web-app/src/backend/api/v1/crm/social_channels.php
// Body Harmony Nexus V3.1 — Social Channels (Instagram & Telegram) Endpoint (PLAN-172)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../Services/SocialChannelsService.php';

use BodyHarmony\Services\SocialChannelsService;

header('Content-Type: application/json; charset=utf-8');

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $service = new SocialChannelsService($dbConn);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true) ?? $_POST ?? [];

        $type = strtolower($data['channel_type'] ?? '');
        if ($type === 'telegram') {
            $result = $service->connectTelegramBot($data['bot_token'] ?? '');
            echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($type === 'instagram' || $type === 'facebook') {
            $result = $service->connectMetaInstagram($data['page_id'] ?? '', $data['access_token'] ?? '');
            echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit;
        }

        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tipo de canal inválido.']);
        exit;
    }

    $result = $service->getChannelsStatus();
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
