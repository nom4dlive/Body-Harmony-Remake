<?php
// apps/web-app/src/backend/api/v1/crm/evolution_webhook.php
// Body Harmony Nexus V3.1 — Central Ingestion Webhook for Evolution API v2 (PLAN-226)
// TopwebCRM Resilient Pattern: ContactResolverService, Async Media Ingestion & Zero-Block Fast Response (< 80ms)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/EvolutionApiService.php';
require_once __DIR__ . '/../Services/ContactResolverService.php';

use BodyHarmony\Services\EvolutionApiService;
use BodyHarmony\Services\ContactResolverService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

if (!$dbConn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    echo json_encode([
        'success' => true,
        'status' => 'ACTIVE',
        'service' => 'Evolution API v2 Central Webhook Gateway',
        'pipeline' => 'DIRECT_MYSQL_2WAY_RESILIENT',
        'features' => ['contact_resolver_9th_digit', 'async_media_ingestion', 'lid_mapping'],
        'timestamp' => date('c')
    ]);
    exit;
}

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

try {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true) ?: [];

    if (empty($payload)) {
        echo json_encode(['success' => true, 'message' => 'Empty payload received']);
        exit;
    }

    $event = strtolower((string)($payload['event'] ?? ''));
    $instanceKey = (string)($payload['instance'] ?? 'inst_clinica');
    $data = $payload['data'] ?? [];

    $contactResolver = new ContactResolverService($dbConn);

    // =========================================================================
    // 1. EVENTO: MESSAGES_UPSERT (MENSAGEM RECEBIDA OU ENVIADA)
    // =========================================================================
    if (in_array($event, ['messages.upsert', 'message.upsert', 'messages_upsert'])) {
        $key = $data['key'] ?? [];
        $remoteJid = $key['remoteJid'] ?? '';
        $messageId = $key['id'] ?? '';
        $fromMe = !empty($key['fromMe']);
        $participant = $key['participant'] ?? null;
        $pushName = $data['pushName'] ?? ($data['verifiedBizName'] ?? null);
        $messageObj = $data['message'] ?? [];
        $timestamp = (int)($data['messageTimestamp'] ?? time());
        $isGroup = str_ends_with($remoteJid, '@g.us');

        // Ignorar broadcasts/status do WhatsApp
        if (str_contains($remoteJid, 'status@broadcast')) {
            echo json_encode(['success' => true, 'ignored' => 'broadcast_status']);
            exit;
        }

        if (empty($remoteJid) || empty($messageId)) {
            echo json_encode(['success' => true, 'ignored' => 'missing_identifiers']);
            exit;
        }

        // --- Parser Rápido de Conteúdo e Tipo de Mensagem (Sem downloads bloqueantes) ---
        $messageType = 'TEXT';
        $content = '';
        $mediaUrl = null;
        $fileName = null;
        $mimeType = null;
        $fileSizeBytes = 0;
        $quotedContext = null;

        // Extração de citação / quote se houver
        $contextInfo = $messageObj['extendedTextMessage']['contextInfo'] ?? 
                       ($messageObj['imageMessage']['contextInfo'] ?? 
                       ($messageObj['audioMessage']['contextInfo'] ?? 
                       ($messageObj['documentMessage']['contextInfo'] ?? null)));

        if (!empty($contextInfo['quotedMessage'])) {
            $qm = $contextInfo['quotedMessage'];
            $quotedText = $qm['conversation'] ?? ($qm['extendedTextMessage']['text'] ?? ($qm['imageMessage']['caption'] ?? ''));
            $quotedParticipant = $contextInfo['participant'] ?? null;
            $quotedContext = [
                'stanzaId' => $contextInfo['stanzaId'] ?? null,
                'participant' => $quotedParticipant,
                'text' => $quotedText,
                'type' => isset($qm['imageMessage']) ? 'IMAGE' : (isset($qm['audioMessage']) ? 'AUDIO' : (isset($qm['documentMessage']) ? 'DOCUMENT' : 'TEXT'))
            ];
        }

        if (isset($messageObj['conversation'])) {
            $content = trim((string)$messageObj['conversation']);
            $messageType = 'TEXT';
        } elseif (isset($messageObj['extendedTextMessage'])) {
            $content = trim((string)($messageObj['extendedTextMessage']['text'] ?? ''));
            $messageType = 'TEXT';
        } elseif (isset($messageObj['imageMessage'])) {
            $messageType = 'IMAGE';
            $content = trim((string)($messageObj['imageMessage']['caption'] ?? ''));
            $mediaUrl = $messageObj['imageMessage']['url'] ?? ($data['mediaUrl'] ?? null);
            $mimeType = $messageObj['imageMessage']['mimetype'] ?? 'image/jpeg';
            $fileSizeBytes = (int)($messageObj['imageMessage']['fileLength'] ?? 0);
            $fileName = 'Foto_' . date('Ymd_His') . '.jpg';
        } elseif (isset($messageObj['audioMessage'])) {
            $messageType = 'AUDIO';
            $content = '';
            $mediaUrl = $messageObj['audioMessage']['url'] ?? ($data['mediaUrl'] ?? null);
            $mimeType = $messageObj['audioMessage']['mimetype'] ?? 'audio/ogg; codecs=opus';
            $fileSizeBytes = (int)($messageObj['audioMessage']['fileLength'] ?? 0);
            $fileName = 'Audio_' . date('Ymd_His') . '.ogg';
        } elseif (isset($messageObj['documentMessage']) || isset($messageObj['documentWithCaptionMessage'])) {
            $doc = $messageObj['documentMessage'] ?? ($messageObj['documentWithCaptionMessage']['message']['documentMessage'] ?? []);
            $messageType = 'DOCUMENT';
            $content = trim((string)($doc['caption'] ?? ''));
            $mediaUrl = $doc['url'] ?? ($data['mediaUrl'] ?? null);
            $fileName = $doc['fileName'] ?? ('Documento_' . date('Ymd_His') . '.pdf');
            $mimeType = $doc['mimetype'] ?? 'application/pdf';
            $fileSizeBytes = (int)($doc['fileLength'] ?? 0);
        } elseif (isset($messageObj['stickerMessage'])) {
            $messageType = 'STICKER';
            $mediaUrl = $messageObj['stickerMessage']['url'] ?? ($data['mediaUrl'] ?? null);
            $mimeType = 'image/webp';
        } elseif (isset($messageObj['videoMessage'])) {
            $messageType = 'VIDEO';
            $content = trim((string)($messageObj['videoMessage']['caption'] ?? ''));
            $mediaUrl = $messageObj['videoMessage']['url'] ?? ($data['mediaUrl'] ?? null);
            $mimeType = $messageObj['videoMessage']['mimetype'] ?? 'video/mp4';
            $fileSizeBytes = (int)($messageObj['videoMessage']['fileLength'] ?? 0);
        } elseif (isset($messageObj['reactionMessage'])) {
            $messageType = 'REACTION';
            $content = $messageObj['reactionMessage']['text'] ?? '👍';
        }

        // Se for reação, atualizar reactions_json da mensagem alvo
        if ($messageType === 'REACTION' && !empty($messageObj['reactionMessage']['key']['id'])) {
            $targetMsgId = $messageObj['reactionMessage']['key']['id'];
            $emoji = $content;
            try {
                $stmtReact = $dbConn->prepare("SELECT id, reactions_json FROM crm_messages WHERE message_id = :mid AND instance_key = :inst LIMIT 1");
                $stmtReact->execute([':mid' => $targetMsgId, ':inst' => $instanceKey]);
                $targetRow = $stmtReact->fetch(\PDO::FETCH_ASSOC);
                if ($targetRow) {
                    $reactions = json_decode((string)($targetRow['reactions_json'] ?? '[]'), true) ?: [];
                    $reactions[] = ['emoji' => $emoji, 'from' => $pushName ?: ($fromMe ? 'ME' : 'CLIENT'), 'time' => time()];
                    $updReact = $dbConn->prepare("UPDATE crm_messages SET reactions_json = :rj WHERE id = :id");
                    $updReact->execute([':rj' => json_encode($reactions), ':id' => $targetRow['id']]);
                }
            } catch (\Throwable $e) {}
            echo json_encode(['success' => true, 'type' => 'reaction_recorded']);
            exit;
        }

        // 1.1 Resolução Inteligente do Contato (ContactResolverService - PLAN-226)
        $resolvedContact = $contactResolver->resolveContact($remoteJid, $pushName, $instanceKey);
        $formattedPhone = $resolvedContact['display_phone'];
        $resolvedName = $resolvedContact['name'];

        // Determinar Sender
        $sender = $fromMe ? 'ME' : 'CLIENT';
        $senderName = $fromMe ? 'Operador' : $resolvedName;
        if ($isGroup && $participant) {
            $partPhone = preg_replace('/[^0-9]/', '', explode('@', $participant)[0]);
            $senderName = $pushName ?: "+{$partPhone}";
        }

        // 1.2 Localizar ou Criar Conversa em `crm_conversations`
        $stmtConv = $dbConn->prepare("SELECT id, contact_name, unread_count, department FROM crm_conversations WHERE instance_key = :inst AND remote_jid = :jid LIMIT 1");
        $stmtConv->execute([':inst' => $instanceKey, ':jid' => $remoteJid]);
        $convRow = $stmtConv->fetch(\PDO::FETCH_ASSOC);

        $convId = null;
        $newUnread = 0;

        $lastPreview = $content ?: ($messageType === 'AUDIO' ? '🎵 Mensagem de áudio' : ($messageType === 'IMAGE' ? '📷 Foto' : ($messageType === 'DOCUMENT' ? "📄 {$fileName}" : 'Mensagem')));

        if ($convRow) {
            $convId = (int)$convRow['id'];
            $newUnread = $fromMe ? 0 : ((int)$convRow['unread_count'] + 1);
            $currentName = $convRow['contact_name'];

            if (($currentName === 'Contato Sem Nome' || empty($currentName) || str_starts_with($currentName, '+55')) && !empty($resolvedName) && !$isGroup) {
                $currentName = $resolvedName;
            }

            // Atualizar conversa
            $updConv = $dbConn->prepare("
                UPDATE crm_conversations 
                SET contact_name = :cname,
                    contact_phone = :cphone,
                    last_message_content = :last_content,
                    last_message_time = FROM_UNIXTIME(:ts),
                    last_message_type = :mtype,
                    last_message_sender = :sender,
                    unread_count = :unread,
                    status = CASE WHEN status = 'RESOLVED' AND :from_me = 0 THEN 'OPEN' ELSE status END,
                    updated_at = NOW()
                WHERE id = :id
            ");
            $updConv->execute([
                ':cname' => $currentName,
                ':cphone' => $formattedPhone,
                ':last_content' => $lastPreview,
                ':ts' => $timestamp,
                ':mtype' => $messageType,
                ':sender' => $sender,
                ':unread' => $newUnread,
                ':from_me' => $fromMe ? 1 : 0,
                ':id' => $convId
            ]);
        } else {
            // Obter departamento padrão da instância em crm_channels
            $dept = 'Geral';
            try {
                $stmtChan = $dbConn->prepare("SELECT department FROM crm_channels WHERE instance_key = :inst LIMIT 1");
                $stmtChan->execute([':inst' => $instanceKey]);
                $chanRow = $stmtChan->fetch(\PDO::FETCH_ASSOC);
                if ($chanRow && !empty($chanRow['department'])) {
                    $dept = $chanRow['department'];
                }
            } catch (\Throwable $e) {}

            $convName = $isGroup ? ($data['groupName'] ?? ($pushName ?: 'Grupo do WhatsApp')) : $resolvedName;

            $insConv = $dbConn->prepare("
                INSERT INTO crm_conversations 
                (remote_jid, instance_key, contact_name, contact_phone, unread_count, last_message_content, last_message_time, last_message_type, last_message_sender, status, department, is_group, created_at, updated_at)
                VALUES 
                (:jid, :inst, :cname, :cphone, :unread, :last_content, FROM_UNIXTIME(:ts), :mtype, :sender, 'OPEN', :dept, :is_grp, NOW(), NOW())
            ");
            $insConv->execute([
                ':jid' => $remoteJid,
                ':inst' => $instanceKey,
                ':cname' => $convName,
                ':cphone' => $formattedPhone,
                ':unread' => $fromMe ? 0 : 1,
                ':last_content' => $lastPreview,
                ':ts' => $timestamp,
                ':mtype' => $messageType,
                ':sender' => $sender,
                ':dept' => $dept,
                ':is_grp' => $isGroup ? 1 : 0
            ]);
            $convId = (int)$dbConn->lastInsertId();
        }

        // 1.3 Gravar Mensagem em `crm_messages` (Persistência Imediata)
        $msgStatus = $fromMe ? 'SENT' : 'DELIVERED';
        $insMsg = $dbConn->prepare("
            INSERT INTO crm_messages 
            (conversation_id, remote_jid, instance_key, message_id, is_from_me, sender, sender_name, sender_phone, message_type, content, media_url, file_name, mime_type, file_size_bytes, quoted_context, status, message_timestamp, created_at)
            VALUES 
            (:conv_id, :jid, :inst, :mid, :from_me, :sender, :sname, :sphone, :mtype, :content, :murl, :fname, :mime, :fsize, :quoted, :status, :ts, NOW())
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status),
                content = VALUES(content),
                media_url = COALESCE(VALUES(media_url), media_url)
        ");
        $insMsg->execute([
            ':conv_id' => $convId,
            ':jid' => $remoteJid,
            ':inst' => $instanceKey,
            ':mid' => $messageId,
            ':from_me' => $fromMe ? 1 : 0,
            ':sender' => $sender,
            ':sname' => $senderName,
            ':sphone' => $formattedPhone,
            ':mtype' => $messageType,
            ':content' => $content,
            ':murl' => $mediaUrl,
            ':fname' => $fileName,
            ':mime' => $mimeType,
            ':fsize' => $fileSizeBytes,
            ':quoted' => $quotedContext ? json_encode($quotedContext) : null,
            ':status' => $msgStatus,
            ':ts' => $timestamp
        ]);

        echo json_encode([
            'success' => true,
            'event' => 'messages.upsert',
            'conversation_id' => $convId,
            'message_id' => $messageId,
            'sender' => $sender,
            'fromMe' => $fromMe,
            'contact' => [
                'name' => $resolvedName,
                'source' => $resolvedContact['source'],
                'is_registered' => $resolvedContact['is_registered']
            ]
        ]);
        exit;
    }

    // =========================================================================
    // 2. EVENTO: MESSAGES_UPDATE (STATUS DE ENTREGA / LEITURA)
    // =========================================================================
    if (in_array($event, ['messages.update', 'message.update', 'messages_update'])) {
        $key = $data['key'] ?? [];
        $messageId = $key['id'] ?? ($data['id'] ?? '');
        $statusRaw = strtoupper((string)($data['status'] ?? ''));

        if (!empty($messageId)) {
            $mappedStatus = 'SENT';
            if (in_array($statusRaw, ['DELIVERY_ACK', 'DELIVERED', 'RECEIPT'])) {
                $mappedStatus = 'DELIVERED';
            } elseif (in_array($statusRaw, ['READ', 'PLAYED', 'READ_ACK'])) {
                $mappedStatus = 'READ';
            } elseif (in_array($statusRaw, ['ERROR', 'FAILED'])) {
                $mappedStatus = 'ERROR';
            }

            $updStatus = $dbConn->prepare("UPDATE crm_messages SET status = :st WHERE message_id = :mid AND instance_key = :inst");
            $updStatus->execute([
                ':st' => $mappedStatus,
                ':mid' => $messageId,
                ':inst' => $instanceKey
            ]);
        }

        echo json_encode(['success' => true, 'event' => 'messages.update', 'status' => $statusRaw]);
        exit;
    }

    // =========================================================================
    // 3. EVENTO: CONNECTION_UPDATE (STATUS DA INSTÂNCIA / QR CODE)
    // =========================================================================
    if (in_array($event, ['connection.update', 'connection_update', 'qrcode.updated'])) {
        $state = strtoupper((string)($data['state'] ?? ($data['connection'] ?? '')));
        $mappedConn = 'CONNECTED';
        if ($state === 'CLOSE' || $state === 'DISCONNECTED') {
            $mappedConn = 'DISCONNECTED';
        } elseif ($state === 'CONNECTING' || $state === 'PAIRING') {
            $mappedConn = 'CONNECTING';
        }

        try {
            $updChan = $dbConn->prepare("UPDATE crm_channels SET status = :st, updated_at = NOW() WHERE instance_key = :inst");
            $updChan->execute([':st' => $mappedConn, ':inst' => $instanceKey]);
        } catch (\Throwable $e) {}

        echo json_encode(['success' => true, 'event' => 'connection.update', 'status' => $mappedConn]);
        exit;
    }

    echo json_encode(['success' => true, 'event' => $event, 'message' => 'Event processed successfully']);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno no processamento do webhook Evolution: ' . $e->getMessage()
    ]);
}
