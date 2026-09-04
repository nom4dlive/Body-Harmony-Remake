<?php
// apps/web-app/src/backend/api/v1/crm/analytics_export.php
// Body Harmony Nexus V3.1 — CRM Analytics Export Endpoint (PLAN-173)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../Services/CrmAnalyticsService.php';

use BodyHarmony\Services\CrmAnalyticsService;

$format = $_GET['format'] ?? 'json';

if ($format === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="bodyharmony_crm_analytics_' . date('Ymd') . '.csv"');
    
    global $pdo, $db;
    $dbConn = $pdo ?? $db;
    $service = new CrmAnalyticsService($dbConn);
    echo $service->exportCsv();
    exit;
}

header('Content-Type: application/json; charset=utf-8');

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $period = $_GET['period'] ?? '30d';
    $service = new CrmAnalyticsService($dbConn);
    $result = $service->getExecutiveMetrics($period);

    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
