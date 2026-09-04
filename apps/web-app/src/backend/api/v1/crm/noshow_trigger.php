<?php
// apps/web-app/src/backend/api/v1/crm/noshow_trigger.php
// Body Harmony Nexus V3.1 — Anti No-Show Trigger & Stats Endpoint (PLAN-171)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../Services/CrmAppointmentReminderService.php';

use BodyHarmony\Services\CrmAppointmentReminderService;

header('Content-Type: application/json; charset=utf-8');

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $service = new CrmAppointmentReminderService($dbConn);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stats = $service->getTodayStats();
        echo json_encode([
            'success' => true,
            'reminders_24h_sent' => 0,
            'reminders_2h_sent' => 0,
            'total_processed' => 0,
            'stats' => $stats
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    $result = $service->processReminders();
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
