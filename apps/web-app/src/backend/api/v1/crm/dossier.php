<?php
// apps/web-app/src/backend/api/v1/crm/dossier.php
// CRM Dossiê 360º Embed Data Endpoint (PLAN-154)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/CrmBridgeService.php';

use BodyHarmony\Services\CrmBridgeService;

header('Content-Type: application/json; charset=utf-8');
header("Content-Security-Policy: frame-ancestors 'self' https://crm.bodyharmony.com.br;");
header("X-Frame-Options: ALLOW-FROM https://crm.bodyharmony.com.br");
header("Access-Control-Allow-Origin: *");

$phone = $_GET['phone'] ?? '';
if (empty($phone)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Parâmetro obrigatório "phone" não informado.'
    ]);
    exit;
}

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $crmBridge = new CrmBridgeService($dbConn);
    $dossier = $crmBridge->getDossierByPhone((string)$phone);

    echo json_encode([
        'success' => true,
        'dossier' => $dossier
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao carregar dossiê: ' . $e->getMessage()
    ]);
}
