<?php
// apps/web-app/src/backend/bin/sync_active_chats.php
// Backfill & Sync Active Evolution API Chats and Recent Messages into MySQL (PLAN-227)
// Usage: php sync_active_chats.php

require_once __DIR__ . '/../api/config.php';
require_once __DIR__ . '/../api/v1/Services/EvolutionApiService.php';
require_once __DIR__ . '/../api/v1/Services/ContactResolverService.php';

use BodyHarmony\Services\EvolutionApiService;
use BodyHarmony\Services\ContactResolverService;

global $pdo, $db;
$dbConn = $pdo ?? $db;

if (!$dbConn) {
    echo "❌ Erro: Não foi possível conectar ao banco de dados MySQL.\n";
    exit(1);
}

$evoApi = new EvolutionApiService();
$contactResolver = new ContactResolverService($dbConn);

echo "========================================================\n";
echo "🔄 Body Harmony CRM — Sincronização e Backfill de Chats & Mensagens\n";
echo "========================================================\n\n";

$channels = [];
try {
    $stmtChannels = $dbConn->query("SELECT instance_key, name, department, type FROM crm_channels WHERE type = 'WHATSAPP' AND is_active = 1");
    $channels = $stmtChannels->fetchAll(\PDO::FETCH_ASSOC);
} catch (\Throwable $e) {}

if (empty($channels)) {
    $channels = [
        ['instance_key' => 'inst_clinica', 'name' => 'Clínica & Pacientes', 'department' => 'Clínica'],
        ['instance_key' => 'inst_juridico', 'name' => 'Jurídico & Finanças', 'department' => 'Jurídico'],
        ['instance_key' => 'inst_comercial', 'name' => 'Vendas & Comercial', 'department' => 'Vendas'],
        ['instance_key' => 'inst_vendas', 'name' => 'Vendas & Comercial', 'department' => 'Vendas'],
        ['instance_key' => 'inst_licenciadas', 'name' => 'Suporte Licenciadas', 'department' => 'Suporte'],
        ['instance_key' => 'inst_suporte', 'name' => 'Suporte Licenciadas', 'department' => 'Suporte']
    ];
}

$totalConversationsSynced = 0;
$totalMessagesSynced = 0;

foreach ($channels as $chan) {
    $inst = $chan['instance_key'];
    $dept = $chan['department'] ?? 'Geral';
    echo "📡 Consultando chats da instância: {$inst} ({$chan['name']})...\n";

    $res = $evoApi->findChats($inst, 30);
    $chats = $res['data'] ?? ($res['chats'] ?? []);

    if (empty($chats) || !is_array($chats)) {
        echo "   ⚠️ Nenhum chat ativo retornado pela Evolution API ou instância offline.\n";
        continue;
    }

    echo "   ✅ " . count($chats) . " chats encontrados. Sincronizando com MySQL...\n";

    // Pegar as 15 conversas mais recentes
    $recentChats = array_slice($chats, 0, 15);

    foreach ($recentChats as $c) {
        $remoteJid = $c['id'] ?? ($c['remoteJid'] ?? '');
        if (empty($remoteJid) || str_contains($remoteJid, 'status@broadcast')) {
            continue;
        }

        $pushName = $c['name'] ?? ($c['pushName'] ?? ($c['verifiedBizName'] ?? ''));
        $unreadCount = (int)($c['unreadCount'] ?? 0);
        $isGroup = str_ends_with($remoteJid, '@g.us') ? 1 : 0;

        // Resolução inteligente de contato com 9º dígito e LIDs
        $resolved = $contactResolver->resolveContact($remoteJid, $pushName, $inst);
        $displayName = $resolved['name'];
        $formattedPhone = $resolved['display_phone'];

        // Última mensagem de cabeçalho
        $lastMsgContent = 'Mensagem do WhatsApp';
        $lastMsgTime = time();
        $lastMsgType = 'TEXT';
        $lastMsgSender = 'CLIENT';

        if (!empty($c['lastMessage'])) {
            $lm = $c['lastMessage'];
            $lastMsgTime = (int)($lm['messageTimestamp'] ?? time());
            $fromMe = !empty($lm['key']['fromMe']);
            $lastMsgSender = $fromMe ? 'ME' : 'CLIENT';
            
            $msgObj = $lm['message'] ?? [];
            if (isset($msgObj['conversation'])) {
                $lastMsgContent = trim((string)$msgObj['conversation']);
            } elseif (isset($msgObj['extendedTextMessage'])) {
                $lastMsgContent = trim((string)($msgObj['extendedTextMessage']['text'] ?? ''));
            } elseif (isset($msgObj['imageMessage'])) {
                $lastMsgType = 'IMAGE';
                $lastMsgContent = '📷 Foto';
            } elseif (isset($msgObj['audioMessage'])) {
                $lastMsgType = 'AUDIO';
                $lastMsgContent = '🎵 Mensagem de áudio';
            } elseif (isset($msgObj['documentMessage'])) {
                $lastMsgType = 'DOCUMENT';
                $lastMsgContent = '📄 ' . ($msgObj['documentMessage']['fileName'] ?? 'Documento');
            }
        }

        // 1. Upsert em crm_conversations
        $stmtConv = $dbConn->prepare("
            INSERT INTO crm_conversations 
            (remote_jid, instance_key, contact_name, contact_phone, unread_count, last_message_content, last_message_time, last_message_type, last_message_sender, status, department, is_group, created_at, updated_at)
            VALUES 
            (:jid, :inst, :name, :phone, :unread, :last_content, FROM_UNIXTIME(:ts), :mtype, :sender, 'OPEN', :dept, :is_grp, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
                contact_name = CASE WHEN contact_name = 'Contato Sem Nome' OR contact_name LIKE '+55%' THEN VALUES(contact_name) ELSE contact_name END,
                contact_phone = VALUES(contact_phone),
                last_message_content = VALUES(last_message_content),
                last_message_time = VALUES(last_message_time),
                last_message_type = VALUES(last_message_type),
                last_message_sender = VALUES(last_message_sender),
                updated_at = NOW()
        ");

        $stmtConv->execute([
            ':jid' => $remoteJid,
            ':inst' => $inst,
            ':name' => $displayName,
            ':phone' => $formattedPhone,
            ':unread' => $unreadCount,
            ':last_content' => $lastMsgContent,
            ':ts' => $lastMsgTime,
            ':mtype' => $lastMsgType,
            ':sender' => $lastMsgSender,
            ':dept' => $dept,
            ':is_grp' => $isGroup
        ]);

        // Obter conversation_id
        $stmtGetId = $dbConn->prepare("SELECT id FROM crm_conversations WHERE instance_key = :inst AND remote_jid = :jid LIMIT 1");
        $stmtGetId->execute([':inst' => $inst, ':jid' => $remoteJid]);
        $convRow = $stmtGetId->fetch(\PDO::FETCH_ASSOC);
        $convId = $convRow ? (int)$convRow['id'] : null;

        $totalConversationsSynced++;

        // 2. Backfill das últimas 40 mensagens do chat
        if ($convId) {
            $msgRes = $evoApi->findMessages($inst, $remoteJid, 40);
            $messages = $msgRes['data'] ?? ($msgRes['messages'] ?? []);

            if (!empty($messages) && is_array($messages)) {
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

                foreach ($messages as $m) {
                    $key = $m['key'] ?? [];
                    $messageId = $key['id'] ?? ($m['id'] ?? '');
                    if (empty($messageId)) continue;

                    $fromMe = !empty($key['fromMe']);
                    $participant = $key['participant'] ?? null;
                    $msgObj = $m['message'] ?? [];
                    $msgTimestamp = (int)($m['messageTimestamp'] ?? time());
                    $mType = 'TEXT';
                    $content = '';
                    $mediaUrl = null;
                    $fileName = null;
                    $mimeType = null;
                    $fileSizeBytes = 0;
                    $quotedContext = null;

                    // Extrair Quotes
                    $contextInfo = $msgObj['extendedTextMessage']['contextInfo'] ?? 
                                   ($msgObj['imageMessage']['contextInfo'] ?? 
                                   ($msgObj['audioMessage']['contextInfo'] ?? 
                                   ($msgObj['documentMessage']['contextInfo'] ?? null)));

                    if (!empty($contextInfo['quotedMessage'])) {
                        $qm = $contextInfo['quotedMessage'];
                        $quotedText = $qm['conversation'] ?? ($qm['extendedTextMessage']['text'] ?? ($qm['imageMessage']['caption'] ?? ''));
                        $quotedContext = [
                            'stanzaId' => $contextInfo['stanzaId'] ?? null,
                            'participant' => $contextInfo['participant'] ?? null,
                            'text' => $quotedText,
                            'type' => isset($qm['imageMessage']) ? 'IMAGE' : (isset($qm['audioMessage']) ? 'AUDIO' : (isset($qm['documentMessage']) ? 'DOCUMENT' : 'TEXT'))
                        ];
                    }

                    if (isset($msgObj['conversation'])) {
                        $content = trim((string)$msgObj['conversation']);
                        $mType = 'TEXT';
                    } elseif (isset($msgObj['extendedTextMessage'])) {
                        $content = trim((string)($msgObj['extendedTextMessage']['text'] ?? ''));
                        $mType = 'TEXT';
                    } elseif (isset($msgObj['imageMessage'])) {
                        $mType = 'IMAGE';
                        $content = trim((string)($msgObj['imageMessage']['caption'] ?? ''));
                        $mediaUrl = $msgObj['imageMessage']['url'] ?? null;
                        $mimeType = $msgObj['imageMessage']['mimetype'] ?? 'image/jpeg';
                        $fileSizeBytes = (int)($msgObj['imageMessage']['fileLength'] ?? 0);
                        $fileName = 'Foto_' . date('Ymd_His', $msgTimestamp) . '.jpg';
                    } elseif (isset($msgObj['audioMessage'])) {
                        $mType = 'AUDIO';
                        $mediaUrl = $msgObj['audioMessage']['url'] ?? null;
                        $mimeType = $msgObj['audioMessage']['mimetype'] ?? 'audio/ogg; codecs=opus';
                        $fileSizeBytes = (int)($msgObj['audioMessage']['fileLength'] ?? 0);
                        $fileName = 'Audio_' . date('Ymd_His', $msgTimestamp) . '.ogg';
                    } elseif (isset($msgObj['documentMessage']) || isset($msgObj['documentWithCaptionMessage'])) {
                        $doc = $msgObj['documentMessage'] ?? ($msgObj['documentWithCaptionMessage']['message']['documentMessage'] ?? []);
                        $mType = 'DOCUMENT';
                        $content = trim((string)($doc['caption'] ?? ''));
                        $mediaUrl = $doc['url'] ?? null;
                        $fileName = $doc['fileName'] ?? ('Documento_' . date('Ymd_His', $msgTimestamp) . '.pdf');
                        $mimeType = $doc['mimetype'] ?? 'application/pdf';
                        $fileSizeBytes = (int)($doc['fileLength'] ?? 0);
                    } elseif (isset($msgObj['videoMessage'])) {
                        $mType = 'VIDEO';
                        $content = trim((string)($msgObj['videoMessage']['caption'] ?? ''));
                        $mediaUrl = $msgObj['videoMessage']['url'] ?? null;
                        $mimeType = $msgObj['videoMessage']['mimetype'] ?? 'video/mp4';
                        $fileSizeBytes = (int)($msgObj['videoMessage']['fileLength'] ?? 0);
                    }

                    $sender = $fromMe ? 'ME' : 'CLIENT';
                    $senderName = $fromMe ? 'Operador' : ($pushName ?: $displayName);
                    if ($isGroup && $participant) {
                        $pClean = preg_replace('/[^0-9]/', '', explode('@', $participant)[0]);
                        $senderName = "+{$pClean}";
                    }

                    $insMsg->execute([
                        ':conv_id' => $convId,
                        ':jid' => $remoteJid,
                        ':inst' => $inst,
                        ':mid' => $messageId,
                        ':from_me' => $fromMe ? 1 : 0,
                        ':sender' => $sender,
                        ':sname' => $senderName,
                        ':sphone' => $formattedPhone,
                        ':mtype' => $mType,
                        ':content' => $content,
                        ':murl' => $mediaUrl,
                        ':fname' => $fileName,
                        ':mime' => $mimeType,
                        ':fsize' => $fileSizeBytes,
                        ':quoted' => $quotedContext ? json_encode($quotedContext) : null,
                        ':status' => $fromMe ? 'SENT' : 'DELIVERED',
                        ':ts' => $msgTimestamp
                    ]);

                    $totalMessagesSynced++;
                }
            }
        }
    }
}

echo "\n========================================================\n";
echo "📊 Relatório de Sincronização:\n";
echo "• Conversas Sincronizadas: {$totalConversationsSynced}\n";
echo "• Mensagens Importadas:    {$totalMessagesSynced}\n";
echo "========================================================\n";
echo "✅ Concluído com Sucesso!\n";
