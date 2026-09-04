<?php
// apps/web-app/src/backend/bin/reconcile_crm.php
// Body Harmony Nexus V3.1 — Anti-Drift CRM Reconciliation CLI Engine (PLAN-226)
// Recovers orphaned or dropped WhatsApp messages from Evolution API v2 directly into MySQL.

require_once __DIR__ . '/../api/config.php';
require_once __DIR__ . '/../api/v1/Services/EvolutionApiService.php';
require_once __DIR__ . '/../api/v1/Services/ContactResolverService.php';

use BodyHarmony\Services\EvolutionApiService;
use BodyHarmony\Services\ContactResolverService;

global $pdo, $db;
$dbConn = $pdo ?? $db;

if (!$dbConn) {
    echo "❌ Erro crítico: Falha na conexão com o banco de dados MySQL.\n";
    exit(1);
}

$startTime = microtime(true);
$contactResolver = new ContactResolverService($dbConn);
$evoService = new EvolutionApiService();

echo "========================================================\n";
echo "🛡️ Body Harmony CRM — Reconciliação Anti-Deriva (CLI)\n";
echo "========================================================\n";
echo "Horário de Execução: " . date('d/m/Y H:i:s') . "\n\n";

// 1. Obter canais ativos
$instances = [];
try {
    $stmt = $dbConn->query("SELECT instance_key, name, department FROM crm_channels WHERE status = 'CONNECTED' OR status IS NULL OR status = 'DISCONNECTED'");
    $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    foreach ($rows as $r) {
        $instances[] = [
            'key' => $r['instance_key'],
            'name' => $r['name'],
            'dept' => $r['department'] ?? 'Geral'
        ];
    }
} catch (\Throwable $e) {
    echo "⚠️ Aviso ao listar canais do banco: " . $e->getMessage() . "\n";
}

if (empty($instances)) {
    $instances = [
        ['key' => 'inst_clinica', 'name' => 'Linha 01 — Clínica', 'dept' => 'CLINICA'],
        ['key' => 'inst_juridico', 'name' => 'Linha 02 — Jurídico', 'dept' => 'JURIDICO'],
        ['key' => 'inst_comercial', 'name' => 'Linha 03 — Vendas', 'dept' => 'VENDAS'],
        ['key' => 'inst_licenciadas', 'name' => 'Linha 04 — Licenciadas', 'dept' => 'SUPORTE']
    ];
}

$totalChatsScanned = 0;
$totalMessagesChecked = 0;
$totalReconciled = 0;

foreach ($instances as $inst) {
    $instKey = $inst['key'];
    $instName = $inst['name'];
    $dept = $inst['dept'];

    echo "🔍 Verificando instância: [{$instKey}] ({$instName})...\n";

    $chatsRes = $evoService->findChats($instKey, 50);
    if (empty($chatsRes['success']) || empty($chatsRes['chats'])) {
        echo "   ℹ️ Nenhum chat ativo ou instância offline na Evolution API.\n\n";
        continue;
    }

    $chats = $chatsRes['chats'];
    $chatsCount = count($chats);
    $totalChatsScanned += $chatsCount;
    echo "   📦 Encontrados {$chatsCount} chats ativos. Auditando mensagens...\n";

    foreach ($chats as $chat) {
        $remoteJid = $chat['id'] ?? ($chat['remoteJid'] ?? ($chat['jid'] ?? ''));
        if (empty($remoteJid) || str_contains($remoteJid, 'status@broadcast')) {
            continue;
        }

        $pushName = $chat['name'] ?? ($chat['pushName'] ?? null);
        $isGroup = str_ends_with($remoteJid, '@g.us');

        // Resolver contato com 9º dígito e LIDs
        $resolvedContact = $contactResolver->resolveContact($remoteJid, $pushName, $instKey);
        $contactName = $resolvedContact['name'];
        $contactPhone = $resolvedContact['display_phone'];

        // Buscar últimas 50 mensagens do chat na Evolution API
        $msgRes = $evoService->findMessages($instKey, $remoteJid, 50);
        if (empty($msgRes['success']) || empty($msgRes['messages'])) {
            continue;
        }

        $remoteMsgs = $msgRes['messages'];
        $msgCount = count($remoteMsgs);
        $totalMessagesChecked += $msgCount;

        // Localizar ou Criar Conversa em crm_conversations
        $stmtConv = $dbConn->prepare("SELECT id, contact_name FROM crm_conversations WHERE instance_key = :inst AND remote_jid = :jid LIMIT 1");
        $stmtConv->execute([':inst' => $instKey, ':jid' => $remoteJid]);
        $convRow = $stmtConv->fetch(\PDO::FETCH_ASSOC);

        $convId = null;
        if ($convRow) {
            $convId = (int)$convRow['id'];
        } else {
            $insConv = $dbConn->prepare("
                INSERT INTO crm_conversations 
                (remote_jid, instance_key, contact_name, contact_phone, unread_count, last_message_content, last_message_time, last_message_type, last_message_sender, status, department, is_group, created_at, updated_at)
                VALUES 
                (:jid, :inst, :cname, :cphone, 0, 'Sincronizado via Reconciliação Anti-Deriva', NOW(), 'TEXT', 'CLIENT', 'OPEN', :dept, :is_grp, NOW(), NOW())
            ");
            $insConv->execute([
                ':jid' => $remoteJid,
                ':inst' => $instKey,
                ':cname' => $contactName,
                ':cphone' => $contactPhone,
                ':dept' => $dept,
                ':is_grp' => $isGroup ? 1 : 0
            ]);
            $convId = (int)$dbConn->lastInsertId();
        }

        // Auditar cada mensagem contra o MySQL
        foreach ($remoteMsgs as $m) {
            $key = $m['key'] ?? [];
            $messageId = $key['id'] ?? ($m['id'] ?? '');
            if (empty($messageId)) {
                continue;
            }

            $fromMe = !empty($key['fromMe']);
            $sender = $fromMe ? 'ME' : 'CLIENT';
            $senderName = $fromMe ? 'Operador' : $contactName;
            $msgTimestamp = (int)($m['messageTimestamp'] ?? time());
            $messageObj = $m['message'] ?? [];

            // Parser de tipo e conteúdo
            $messageType = 'TEXT';
            $content = '';
            $mediaUrl = null;

            if (isset($messageObj['conversation'])) {
                $content = trim((string)$messageObj['conversation']);
            } elseif (isset($messageObj['extendedTextMessage'])) {
                $content = trim((string)($messageObj['extendedTextMessage']['text'] ?? ''));
            } elseif (isset($messageObj['imageMessage'])) {
                $messageType = 'IMAGE';
                $content = trim((string)($messageObj['imageMessage']['caption'] ?? ''));
                $mediaUrl = $messageObj['imageMessage']['url'] ?? null;
            } elseif (isset($messageObj['audioMessage'])) {
                $messageType = 'AUDIO';
                $mediaUrl = $messageObj['audioMessage']['url'] ?? null;
            } elseif (isset($messageObj['documentMessage'])) {
                $messageType = 'DOCUMENT';
                $content = trim((string)($messageObj['documentMessage']['caption'] ?? ''));
                $mediaUrl = $messageObj['documentMessage']['url'] ?? null;
            }

            // Verificar se já existe no banco
            $stmtCheck = $dbConn->prepare("SELECT id FROM crm_messages WHERE message_id = :mid AND instance_key = :inst LIMIT 1");
            $stmtCheck->execute([':mid' => $messageId, ':inst' => $instKey]);
            if ($stmtCheck->fetch()) {
                continue; // Mensagem já reconciliada e íntegra
            }

            // Inserir mensagem órfã recuperada
            $insMsg = $dbConn->prepare("
                INSERT INTO crm_messages 
                (conversation_id, remote_jid, instance_key, message_id, is_from_me, sender, sender_name, sender_phone, message_type, content, media_url, status, message_timestamp, created_at)
                VALUES 
                (:conv_id, :jid, :inst, :mid, :from_me, :sender, :sname, :sphone, :mtype, :content, :murl, :status, :ts, NOW())
            ");
            $insMsg->execute([
                ':conv_id' => $convId,
                ':jid' => $remoteJid,
                ':inst' => $instKey,
                ':mid' => $messageId,
                ':from_me' => $fromMe ? 1 : 0,
                ':sender' => $sender,
                ':sname' => $senderName,
                ':sphone' => $contactPhone,
                ':mtype' => $messageType,
                ':content' => $content,
                ':murl' => $mediaUrl,
                ':status' => $fromMe ? 'SENT' : 'DELIVERED',
                ':ts' => $msgTimestamp
            ]);

            $totalReconciled++;
        }
    }
    echo "   ✅ Instância [{$instKey}] concluída.\n\n";
}

$elapsed = round(microtime(true) - $startTime, 2);

echo "========================================================\n";
echo "📊 Relatório Final da Reconciliação Anti-Deriva:\n";
echo "========================================================\n";
echo "• Chats Auditados:       {$totalChatsScanned}\n";
echo "• Mensagens Verificadas: {$totalMessagesChecked}\n";
echo "• Mensagens Recuperadas: {$totalReconciled}\n";
echo "• Tempo Total:           {$elapsed}s\n";
echo "========================================================\n";
echo "🎉 Concluído com Sucesso!\n";
