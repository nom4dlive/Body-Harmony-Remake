<?php
// apps/web-app/src/backend/api/v1/crm/triggers.php
// CRM Reactive WhatsApp Triggers Endpoint (PLAN-154)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/CrmBridgeService.php';

use BodyHarmony\Services\CrmBridgeService;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed. Use POST.']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true) ?: [];

$action = $payload['action'] ?? '';
$phone = $payload['phone'] ?? '';

if (empty($action) || empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Parâmetros "action" e "phone" são obrigatórios.']);
    exit;
}

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;
    $crmBridge = new CrmBridgeService($dbConn);

    if ($action === 'contract_issuance') {
        $candidateName = $payload['candidate_name'] ?? 'Licenciada / Aluna';
        $signUrl = $payload['sign_url'] ?? 'https://bodyharmony.com.br/assinar';
        $res = $crmBridge->triggerContractIssuance((string)$phone, (string)$candidateName, (string)$signUrl);
        echo json_encode(['success' => true, 'trigger' => 'contract_issuance', 'result' => $res]);
        exit;
    }

    if ($action === 'mentorship_reminder') {
        $menteeName = $payload['mentee_name'] ?? 'Licenciada';
        $datetime = $payload['datetime'] ?? date('d/m/Y \à\s H:i', strtotime('+2 hours'));
        $meetingLink = $payload['meeting_link'] ?? 'https://meet.google.com/body-harmony-mentoria';
        $res = $crmBridge->triggerMentorshipReminder((string)$phone, (string)$menteeName, (string)$datetime, (string)$meetingLink);
        echo json_encode(['success' => true, 'trigger' => 'mentorship_reminder', 'result' => $res]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => "Ação desconhecida: {$action}"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao processar gatilho: ' . $e->getMessage()]);
}
