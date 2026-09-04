<?php
// apps/web-app/src/backend/api/v1/crm/inbox_poll_delta.php
// Ultra-fast Delta Polling Endpoint for Realtime Messages (< 40ms) - PLAN-225

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    if (!$dbConn) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database connection failed']);
        exit;
    }

    $rawConvId = trim((string)($_GET['conversation_id'] ?? ''));
    $rawAfterId = trim((string)($_GET['after_id'] ?? '0'));
    $phone = trim((string)($_GET['phone'] ?? ''));

    $afterId = 0;
    if (is_numeric($rawAfterId)) {
        $afterId = (int)$rawAfterId;
    } else {
        $cleanId = preg_replace('/^msg_/', '', $rawAfterId);
        if (is_numeric($cleanId)) {
            $afterId = (int)$cleanId;
        }
    }

    $convId = null;
    $remoteJid = null;

    $numericConvId = preg_replace('/^(cw_|conv_)/', '', $rawConvId);
    if (is_numeric($numericConvId) && (int)$numericConvId > 0) {
        $convId = (int)$numericConvId;
    } elseif (!empty($rawConvId) && (str_contains($rawConvId, '@s.whatsapp.net') || str_contains($rawConvId, '@g.us'))) {
        $remoteJid = $rawConvId;
    } elseif (!empty($phone)) {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        $remoteJid = (str_starts_with($cleanPhone, '55') ? $cleanPhone : '55' . $cleanPhone) . '@s.whatsapp.net';
    }

    if (!$convId && !$remoteJid) {
        echo json_encode([
            'success' => true,
            'count' => 0,
            'latest_id' => $afterId,
            'messages' => []
        ]);
        exit;
    }

    $query = "
        SELECT 
            id, conversation_id, remote_jid, instance_key, message_id,
            is_from_me, sender, sender_name, sender_phone,
            message_type, content, media_url, file_name, mime_type, file_size_bytes,
            quoted_context, reactions_json, status,
            UNIX_TIMESTAMP(created_at) as created_ts,
            created_at
        FROM crm_messages
        WHERE " . ($convId ? "conversation_id = :conv_id" : "remote_jid = :jid") . "
          AND id > :after_id
        ORDER BY id ASC
        LIMIT 50
    ";

    $stmt = $dbConn->prepare($query);
    $params = [':after_id' => $afterId];
    if ($convId) {
        $params[':conv_id'] = $convId;
    } else {
        $params[':jid'] = $remoteJid;
    }

    $stmt->execute($params);
    $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

    $messages = [];
    $maxId = $afterId;

    foreach ($rows as $row) {
        $rowId = (int)$row['id'];
        if ($rowId > $maxId) {
            $maxId = $rowId;
        }

        $isFromMe = (bool)$row['is_from_me'];
        $senderType = $row['sender'];
        $msgType = strtoupper($row['message_type']);
        $content = trim((string)$row['content']);
        $quotedContext = $row['quoted_context'] ? json_decode($row['quoted_context'], true) : null;
        $reactions = $row['reactions_json'] ? json_decode($row['reactions_json'], true) : [];
        $status = strtolower($row['status'] ?: 'sent');

        $messages[] = [
            'id' => 'msg_' . $rowId,
            'numericId' => $rowId,
            'messageId' => $row['message_id'],
            'sender' => $isFromMe ? 'ME' : ($senderType === 'HERMES_AI' ? 'HERMES_AI' : ($senderType === 'SYSTEM' ? 'SYSTEM' : 'CLIENT')),
            'senderName' => $row['sender_name'],
            'text' => $content,
            'time' => date('H:i', (int)($row['created_ts'] ?: strtotime($row['created_at']))),
            'type' => $msgType,
            'status' => $status,
            'mediaUrl' => $row['media_url'],
            'fileName' => $row['file_name'],
            'fileSize' => $row['file_size_bytes'] ? number_format($row['file_size_bytes'] / 1024, 1) . ' KB' : null,
            'quotedMessage' => $quotedContext,
            'reactions' => is_array($reactions) ? $reactions : []
        ];
    }

    echo json_encode([
        'success' => true,
        'conversation_id' => $convId ?: $remoteJid,
        'count' => count($messages),
        'latest_id' => $maxId,
        'messages' => $messages
    ]);
    exit;

} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro no polling delta: ' . $e->getMessage()
    ]);
}
