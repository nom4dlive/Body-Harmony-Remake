<?php
// apps/web-app/src/backend/api/v1/crm/google_calendar.php
// Body Harmony Nexus V3.1 — Google Calendar API Controller (PLAN-177)

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../Services/GoogleWorkspaceService.php';

use BodyHarmony\Services\GoogleWorkspaceService;

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

global $pdo, $db;
$dbConn = $pdo ?? $db ?? null;

$service = new GoogleWorkspaceService($dbConn);

if ($method === 'GET') {
    $calendarId = $_GET['calendar_id'] ?? 'primary';
    $maxResults = (int)($_GET['max_results'] ?? 25);
    $timeMin = $_GET['time_min'] ?? null;

    $result = $service->listAppointments($calendarId, $maxResults, $timeMin);
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?: $_POST;

    $action = $_GET['action'] ?? $input['action'] ?? 'create';

    if ($action === 'sync') {
        $result = $service->syncBidirectionalEvents();
        echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    $calendarId = $input['calendar_id'] ?? 'primary';
    $result = $service->createAppointment($calendarId, $input);

    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Método não permitido.']);

