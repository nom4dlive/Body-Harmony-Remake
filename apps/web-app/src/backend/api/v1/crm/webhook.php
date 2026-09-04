<?php
// apps/web-app/src/backend/api/v1/crm/webhook.php
// Chatwoot & Evolution API Webhook Ingress — Auto-Matching, Sync & Burner Lead Handoff (PLAN-153 / PLAN-155)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/CrmBridgeService.php';
require_once __DIR__ . '/../Services/BurnerDispatchService.php';

use BodyHarmony\Services\CrmBridgeService;
use BodyHarmony\Services\BurnerDispatchService;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed. Use POST.']);
    exit;
}

$rawPayload = file_get_contents('php://input');
$data = json_decode($rawPayload, true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload.']);
    exit;
}

global $pdo, $db;
$dbConn = $pdo ?? $db;

// -----------------------------------------------------------------------------
// 1. DETECÇÃO DE EVENTO DA EVOLUTION API (MESSAGES_UPSERT em Instâncias Burner)
// -----------------------------------------------------------------------------
$instance = $data['instance'] ?? '';
$evoEvent = $data['event'] ?? '';

if (str_starts_with($instance, 'inst_burner_') && ($evoEvent === 'messages.upsert' || isset($data['data']['message']))) {
    $msgData = $data['data'] ?? [];
    $keyInfo = $msgData['key'] ?? [];
    $fromMe = $keyInfo['fromMe'] ?? false;

    // Apenas mensagens recebidas do cliente (não enviadas pelo bot)
    if (!$fromMe) {
        $remoteJid = $keyInfo['remoteJid'] ?? '';
        $fromPhone = explode('@', $remoteJid)[0] ?? '';
        $senderName = $msgData['pushName'] ?? null;
        $messageText = $msgData['message']['conversation'] 
            ?? $msgData['message']['extendedTextMessage']['text'] 
            ?? '';

        if (!empty($fromPhone)) {
            $burnerService = new BurnerDispatchService($dbConn);
            $handoffResult = $burnerService->handleIncomingBurnerMessage(
                $instance,
                $fromPhone,
                $messageText,
                $senderName
            );

            echo json_encode([
                'success' => true,
                'type' => 'burner_reply_intercepted',
                'handoff' => $handoffResult
            ]);
            exit;
        }
    }
}

// -----------------------------------------------------------------------------
// 2. DETECÇÃO DE EVENTOS DO CHATWOOT (Auto-Matching & CRM Bridge)
// -----------------------------------------------------------------------------
$event = $data['event'] ?? '';
$contactId = null;
$phone = null;
$email = null;

if (isset($data['sender']['id'])) {
    $contactId = (int)$data['sender']['id'];
    $phone = $data['sender']['phone_number'] ?? null;
    $email = $data['sender']['email'] ?? null;
} elseif (isset($data['contact']['id'])) {
    $contactId = (int)$data['contact']['id'];
    $phone = $data['contact']['phone_number'] ?? null;
    $email = $data['contact']['email'] ?? null;
} elseif (isset($data['id']) && $event === 'contact_created') {
    $contactId = (int)$data['id'];
    $phone = $data['phone_number'] ?? null;
    $email = $data['email'] ?? null;
}

if (!$phone && isset($data['conversation']['meta']['sender']['phone_number'])) {
    $phone = $data['conversation']['meta']['sender']['phone_number'];
}

if (!$contactId || !$phone) {
    echo json_encode([
        'success' => true,
        'matched' => false,
        'tipo_usuario' => 'DESCONHECIDO',
        'message' => 'Ignored: No contact phone or ID detected in event payload.',
        'event' => $event
    ]);
    exit;
}

try {
    $crmBridge = new CrmBridgeService($dbConn);
    $result = $crmBridge->resolveAndSync($contactId, (string)$phone, $email ? (string)$email : null);

    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'CRM Bridge processing error: ' . $e->getMessage()
    ]);
}
