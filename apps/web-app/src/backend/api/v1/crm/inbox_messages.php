<?php
// apps/web-app/src/backend/api/v1/crm/inbox_messages.php
// CRM V4 Direct Messages & Outbound Dispatch Endpoint (PLAN-224 - Direct 2-Way Pipeline)
// WhatsApp <-> Evolution API v2 <-> PHP/MySQL <-> React 18

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/EvolutionApiService.php';
require_once __DIR__ . '/../Services/ZernioApiService.php';

use BodyHarmony\Services\EvolutionApiService;
use BodyHarmony\Services\ZernioApiService;

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Operator-Role, X-Operator-Lines");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

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

    $evoApi = new EvolutionApiService();

    // -------------------------------------------------------------------------
    // GET: BUSCAR MENSAGENS DE UMA CONVERSA (LEITURA DIRETA NO MYSQL)
    // -------------------------------------------------------------------------
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $rawConvId = trim($_GET['conversation_id'] ?? '');
        $phone = trim($_GET['phone'] ?? '');

        // 1. Tratamento para Instagram Direct via Zernio (se aplicável)
        if (str_starts_with($rawConvId, 'ig_')) {
            $zernio = new ZernioApiService();
            $res = $zernio->getConversationMessages($rawConvId);
            echo json_encode($res);
            exit;
        }

        // 2. Resolver conversa no MySQL
        $convId = null;
        $remoteJid = null;
        $instanceKey = 'inst_clinica';

        // Normalização de prefixos legados (cw_, conv_)
        $numericId = preg_replace('/^(cw_|conv_)/', '', $rawConvId);
        if (is_numeric($numericId) && (int)$numericId > 0) {
            $stmtC = $dbConn->prepare("SELECT id, remote_jid, instance_key FROM crm_conversations WHERE id = :id LIMIT 1");
            $stmtC->execute([':id' => (int)$numericId]);
            $cRow = $stmtC->fetch(\PDO::FETCH_ASSOC);
            if ($cRow) {
                $convId = (int)$cRow['id'];
                $remoteJid = $cRow['remote_jid'];
                $instanceKey = $cRow['instance_key'];
            }
        }

        // Se não achou por ID numérico, buscar por remote_jid ou telefone
        if (!$convId && (!empty($rawConvId) || !empty($phone))) {
            $targetLookup = !empty($rawConvId) ? $rawConvId : $phone;
            $cleanLookup = preg_replace('/[^0-9]/', '', $targetLookup);

            $stmtC = $dbConn->prepare("
                SELECT id, remote_jid, instance_key FROM crm_conversations 
                WHERE remote_jid = :target 
                   OR remote_jid LIKE :likeTarget 
                   OR contact_phone LIKE :likePhone 
                LIMIT 1
            ");
            $stmtC->execute([
                ':target' => $targetLookup,
                ':likeTarget' => "%{$cleanLookup}%",
                ':likePhone' => "%{$cleanLookup}%"
            ]);
            $cRow = $stmtC->fetch(\PDO::FETCH_ASSOC);
            if ($cRow) {
                $convId = (int)$cRow['id'];
                $remoteJid = $cRow['remote_jid'];
                $instanceKey = $cRow['instance_key'];
            }
        }

        $messages = [];

        if ($convId || $remoteJid) {
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
                ORDER BY created_at ASC, id ASC
                LIMIT 300
            ";
            $stmtM = $dbConn->prepare($query);
            $params = $convId ? [':conv_id' => $convId] : [':jid' => $remoteJid];
            $stmtM->execute($params);
            $rows = $stmtM->fetchAll(\PDO::FETCH_ASSOC);

            foreach ($rows as $row) {
                $isFromMe = (bool)$row['is_from_me'];
                $senderType = $row['sender'];
                $msgType = strtoupper($row['message_type']);
                $content = trim((string)$row['content']);
                $quotedContext = $row['quoted_context'] ? json_decode($row['quoted_context'], true) : null;
                $reactions = $row['reactions_json'] ? json_decode($row['reactions_json'], true) : [];

                // Normalizar status
                $status = strtolower($row['status'] ?: 'sent');

                $messages[] = [
                    'id' => 'msg_' . ($row['id'] ?? $row['message_id']),
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
        }

        // Se não houver mensagens ainda, retornar mensagem de boas-vindas da linha
        if (empty($messages)) {
            $messages = [
                [
                    'id' => 'm_init',
                    'sender' => 'CLIENT',
                    'senderName' => 'Contato',
                    'text' => 'Olá! Gostaria de atendimento sobre a Body Harmony.',
                    'time' => date('H:i', strtotime('-5 minutes')),
                    'type' => 'TEXT',
                    'status' => 'read',
                    'reactions' => []
                ]
            ];
        }

        echo json_encode([
            'success' => true,
            'conversation_id' => $convId,
            'remote_jid' => $remoteJid,
            'messages' => $messages
        ]);
        exit;
    }

    // -------------------------------------------------------------------------
    // POST: DISPARAR MENSAGEM / ÁUDIO / MÍDIA / NOTA INTERNA OU MARCAR COMO LIDA
    // -------------------------------------------------------------------------
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true) ?: [];

        $action = $_POST['action'] ?? ($input['action'] ?? 'send_message');
        $rawConvId = trim((string)($_POST['conversation_id'] ?? ($input['conversation_id'] ?? '')));

        // 1. AÇÃO: MARCAR CONVERSA COMO LIDA
        if ($action === 'mark_read') {
            $numericId = preg_replace('/^(cw_|conv_)/', '', $rawConvId);
            if (is_numeric($numericId)) {
                $upd = $dbConn->prepare("UPDATE crm_conversations SET unread_count = 0 WHERE id = :id");
                $upd->execute([':id' => (int)$numericId]);
            }
            echo json_encode(['success' => true, 'marked_read' => true]);
            exit;
        }

        // 2. AÇÃO: ENVIAR MENSAGEM
        $text = trim((string)($_POST['text'] ?? ($_POST['message'] ?? ($input['text'] ?? ($input['message'] ?? '')))));
        $isWhisper = !empty($_POST['is_whisper']) || !empty($input['is_whisper']);
        $phone = trim((string)($_POST['phone'] ?? ($input['phone'] ?? '')));
        $mediaType = strtolower(trim((string)($_POST['media_type'] ?? ($input['media_type'] ?? 'text'))));
        $quotedMessageId = trim((string)($_POST['quoted_message_id'] ?? ($input['quoted_message_id'] ?? '')));

        $hasFile = (!empty($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) ||
                   (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) ||
                   (!empty($_FILES['audio']) && $_FILES['audio']['error'] === UPLOAD_ERR_OK);

        if (empty($text) && !$hasFile) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Mensagem ou arquivo obrigatório.']);
            exit;
        }

        // Resolver conversa no MySQL
        $convId = null;
        $remoteJid = null;
        $instanceKey = 'inst_clinica';
        $contactName = 'Contato';

        $numericId = preg_replace('/^(cw_|conv_)/', '', $rawConvId);
        if (is_numeric($numericId) && (int)$numericId > 0) {
            $stmtC = $dbConn->prepare("SELECT id, remote_jid, instance_key, contact_name, contact_phone FROM crm_conversations WHERE id = :id LIMIT 1");
            $stmtC->execute([':id' => (int)$numericId]);
            $cRow = $stmtC->fetch(\PDO::FETCH_ASSOC);
            if ($cRow) {
                $convId = (int)$cRow['id'];
                $remoteJid = $cRow['remote_jid'];
                $instanceKey = $cRow['instance_key'];
                $contactName = $cRow['contact_name'];
            }
        }

        if (!$remoteJid) {
            if (!empty($phone)) {
                $clean = preg_replace('/[^0-9]/', '', $phone);
                if (!str_starts_with($clean, '55')) {
                    $clean = '55' . $clean;
                }
                $remoteJid = $clean . '@s.whatsapp.net';
            } elseif (!empty($rawConvId) && (str_contains($rawConvId, '@s.whatsapp.net') || str_contains($rawConvId, '@g.us'))) {
                $remoteJid = $rawConvId;
            } else {
                $remoteJid = '5518996959486@s.whatsapp.net';
            }
        }

        $sent = false;
        $uploadedUrl = null;
        $fileName = null;
        $fileSize = 0;
        $mimeType = null;
        $finalMsgType = $isWhisper ? 'WHISPER' : 'TEXT';

        // 2.1 Processamento de Upload de Mídia
        if ($hasFile) {
            $file = $_FILES['file'] ?? ($_FILES['image'] ?? $_FILES['audio']);
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION) ?: ($mediaType === 'audio' ? 'webm' : 'jpg'));
            $filename = 'crm_' . ($mediaType ?: 'media') . '_' . time() . '_' . substr(md5(uniqid()), 0, 8) . '.' . $ext;
            
            $baseCandidates = [
                $_SERVER['DOCUMENT_ROOT'] ?? null,
                realpath(__DIR__ . '/../../..'),
                __DIR__ . '/../../..'
            ];
            $publicRoot = null;
            foreach ($baseCandidates as $candidate) {
                if ($candidate && is_dir($candidate)) {
                    $publicRoot = $candidate;
                    break;
                }
            }
            $publicRoot = $publicRoot ?: __DIR__ . '/../../..';
            $uploadDir = rtrim(str_replace('\\', '/', $publicRoot), '/') . '/uploads/crm/';
            if (!is_dir($uploadDir)) {
                @mkdir($uploadDir, 0755, true);
            }
            $dest = $uploadDir . $filename;
            if (@move_uploaded_file($file['tmp_name'], $dest)) {
                $uploadedUrl = "https://bodyharmony.com.br/uploads/crm/{$filename}";
                $fileName = $file['name'] ?? $filename;
                $fileSize = (int)$file['size'];
                $mimeType = $file['type'] ?: 'application/octet-stream';

                if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                    $finalMsgType = 'IMAGE';
                } elseif (in_array($ext, ['webm', 'mp3', 'ogg', 'wav', 'm4a'])) {
                    $finalMsgType = 'AUDIO';
                } else {
                    $finalMsgType = 'DOCUMENT';
                }
            }
        }

        $evoMessageId = 'bh_msg_' . time() . '_' . substr(md5(uniqid()), 0, 6);

        // 2.2 Disparo direto para a Evolution API v2 (Se não for nota interna)
        if (!$isWhisper && $remoteJid) {
            if ($finalMsgType === 'AUDIO' && $uploadedUrl) {
                $evoRes = $evoApi->sendWhatsAppAudio($instanceKey, $remoteJid, $uploadedUrl);
            } elseif (($finalMsgType === 'IMAGE' || $finalMsgType === 'DOCUMENT' || $finalMsgType === 'VIDEO') && $uploadedUrl) {
                $evoMediaType = strtolower($finalMsgType);
                $evoRes = $evoApi->sendMedia($instanceKey, $remoteJid, $uploadedUrl, $evoMediaType, $text, $fileName, $quotedMessageId ?: null);
            } else {
                $evoRes = $evoApi->sendTextMessage($instanceKey, $remoteJid, $text, $quotedMessageId ?: null);
            }

            if (!empty($evoRes['data']['key']['id'])) {
                $evoMessageId = $evoRes['data']['key']['id'];
                $sent = true;
            } elseif ($evoRes['status'] === 200 || $evoRes['status'] === 201) {
                $sent = true;
            }
        } else {
            $sent = true; // Whispers salvam localmente com sucesso
        }

        // 2.3 Persistência Imediata no MySQL
        $lastPreview = $text ?: ($finalMsgType === 'AUDIO' ? '🎵 Mensagem de áudio' : ($finalMsgType === 'IMAGE' ? '📷 Foto' : ($finalMsgType === 'DOCUMENT' ? "📄 {$fileName}" : 'Nota interna')));

        if ($convId) {
            $updConv = $dbConn->prepare("
                UPDATE crm_conversations 
                SET last_message_content = :last_content,
                    last_message_time = NOW(),
                    last_message_type = :mtype,
                    last_message_sender = 'ME',
                    updated_at = NOW()
                WHERE id = :id
            ");
            $updConv->execute([
                ':last_content' => $lastPreview,
                ':mtype' => $finalMsgType,
                ':id' => $convId
            ]);
        }

        $insMsg = $dbConn->prepare("
            INSERT INTO crm_messages 
            (conversation_id, remote_jid, instance_key, message_id, is_from_me, sender, sender_name, sender_phone, message_type, content, media_url, file_name, mime_type, file_size_bytes, quoted_context, status, message_timestamp, created_at)
            VALUES 
            (:conv_id, :jid, :inst, :mid, 1, 'ME', 'Operador', '', :mtype, :content, :murl, :fname, :mime, :fsize, :quoted, :status, :ts, NOW())
        ");
        $insMsg->execute([
            ':conv_id' => $convId,
            ':jid' => $remoteJid,
            ':inst' => $instanceKey,
            ':mid' => $evoMessageId,
            ':mtype' => $finalMsgType,
            ':content' => $text,
            ':murl' => $uploadedUrl,
            ':fname' => $fileName,
            ':mime' => $mimeType,
            ':fsize' => $fileSize,
            ':quoted' => !empty($quotedMessageId) ? json_encode(['stanzaId' => $quotedMessageId]) : null,
            ':status' => $sent ? 'SENT' : 'ERROR',
            ':ts' => time()
        ]);
        $insertedId = $dbConn->lastInsertId();

        echo json_encode([
            'success' => true,
            'sent' => $sent,
            'conversation_id' => $convId,
            'message' => [
                'id' => 'msg_' . ($insertedId ?: $evoMessageId),
                'messageId' => $evoMessageId,
                'sender' => 'ME',
                'senderName' => 'Operador',
                'text' => $text,
                'time' => date('H:i'),
                'type' => $finalMsgType,
                'status' => $sent ? 'sent' : 'error',
                'mediaUrl' => $uploadedUrl,
                'fileName' => $fileName,
                'fileSize' => $fileSize ? number_format($fileSize / 1024, 1) . ' KB' : null
            ]
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno ao processar mensagens: ' . $e->getMessage()
    ]);
}
