<?php
// apps/web-app/src/backend/api/v1/crm/google_status.php
// Body Harmony Nexus V3.2 — Google Workspace Integration Status & Diagnostics (PLAN-205)

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/GoogleWorkspaceService.php';
require_once __DIR__ . '/../Services/GoogleContactsSyncService.php';

use BodyHarmony\Services\GoogleWorkspaceService;
use BodyHarmony\Services\GoogleContactsSyncService;

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

global $pdo, $db;
$dbConn = $pdo ?? $db;

try {
    $service = new GoogleWorkspaceService($dbConn);
    $action = $_GET['action'] ?? ($_POST['action'] ?? 'status');

    if ($method === 'GET') {
        if ($action === 'probe') {
            $probe = $service->runLiveProbe();
            echo json_encode($probe, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            exit;
        }

        $status = $service->getStatus();

        // Adiciona métricas de contatos sincronizados
        try {
            $contactsSvc = new GoogleContactsSyncService($dbConn, 'bodyharmony36@gmail.com');
            $stats = $contactsSvc->getStats();
            $status['synced_contacts_count'] = $stats['total_synced'] ?? 0;
        } catch (\Throwable $e) {
            $status['synced_contacts_count'] = 0;
        }

        echo json_encode($status, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $body = json_decode($raw, true) ?: $_POST;
        $postAction = $body['action'] ?? $action;

        if ($postAction === 'probe' || $postAction === 'test_probe') {
            $probe = $service->runLiveProbe();
            echo json_encode($probe, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            exit;
        }

        if ($postAction === 'save_token') {
            $tokenJson = $body['token_json'] ?? '';
            $res = $service->saveUserTokenJson($tokenJson);
            echo json_encode($res, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            exit;
        }

        if ($postAction === 'disconnect') {
            $res = $service->disconnect();
            echo json_encode($res, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            exit;
        }

        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Ação POST desconhecida: {$postAction}"]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'is_connected' => false,
        'account' => 'bodyharmony36@gmail.com',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
