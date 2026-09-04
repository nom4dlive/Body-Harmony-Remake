<?php
// apps/web-app/src/backend/api/v1/crm/worker_runner.php
// Body Harmony Nexus V3.1 — CRM Background Worker HTTP Trigger & Telemetry API

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/CrmBackgroundWorkerService.php';

use BodyHarmony\Services\CrmBackgroundWorkerService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

$worker = new CrmBackgroundWorkerService($dbConn);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

if (empty($action) && $method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?: [];
    $action = $body['action'] ?? 'run_full';
}

try {
    if ($method === 'GET') {
        $logs = $worker->getRecentLogs(15);
        echo json_encode([
            'success' => true,
            'status' => 'ACTIVE',
            'interval_minutes' => 5,
            'logs' => $logs,
            'server_time' => date('c')
        ]);
        exit;
    }

    if ($method === 'POST') {
        if ($action === 'run_reminders') {
            $res = $worker->processUpcomingReminders();
            echo json_encode($res);
            exit;
        }

        if ($action === 'run_calendar_sync') {
            $res = $worker->syncBatchGoogleCalendar();
            echo json_encode($res);
            exit;
        }

        // Padrão: Executar ciclo completo
        $res = $worker->runFullCycle();
        echo json_encode($res);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao executar worker: ' . $e->getMessage()
    ]);
}
