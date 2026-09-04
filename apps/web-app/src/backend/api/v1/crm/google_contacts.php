<?php
// apps/web-app/src/backend/api/v1/crm/google_contacts.php
// Body Harmony Nexus V3.1 — Google Contacts Endpoint (PLAN-172 / V4.2)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../Services/GoogleWorkspaceService.php';
require_once __DIR__ . '/../Services/GoogleContactsSyncService.php';

use BodyHarmony\Services\GoogleWorkspaceService;
use BodyHarmony\Services\GoogleContactsSyncService;

header('Content-Type: application/json; charset=utf-8');

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $wsService = new GoogleWorkspaceService($dbConn);
    $syncService = new GoogleContactsSyncService($dbConn);

    $action = $_GET['action'] ?? ($_POST['action'] ?? 'stats');

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if ($action === 'list') {
            $limit = (int)($_GET['limit'] ?? 50);
            $query = trim($_GET['search'] ?? '');
            $category = trim($_GET['category'] ?? 'ALL');
            $res = $wsService->listGoogleContacts($limit, $query, $category);
            echo json_encode($res, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stats = $syncService->getStats();
        echo json_encode([
            'success' => true,
            'stats' => $stats
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $raw = file_get_contents('php://input');
        $body = json_decode($raw, true) ?: $_POST;
        $postAction = $body['action'] ?? $action;

        if ($postAction === 'save' || $postAction === 'sync_one') {
            $res = $wsService->createOrUpdateGoogleContact($body);
            echo json_encode($res, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit;
        }

        $result = $syncService->syncAllContacts();
        echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

