<?php
// apps/web-app/src/backend/api/v1/crm/hermes_agent_webhook.php
// Body Harmony Nexus V3.1 — Hermes Autonomous Webhook & Whitelist Interactive Mode (V4.9)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/EvolutionApiService.php';
require_once __DIR__ . '/../Services/HermesCrmAgentService.php';
require_once __DIR__ . '/../Services/HermesAdvancedIntelligenceService.php';

use BodyHarmony\Services\EvolutionApiService;
use BodyHarmony\Services\HermesCrmAgentService;
use BodyHarmony\Services\HermesAdvancedIntelligenceService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

$service = new HermesCrmAgentService($dbConn);
$evoApi = new EvolutionApiService();
$intel = new HermesAdvancedIntelligenceService($dbConn);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$whitelistedPhone = '5518996959486';

try {
    if ($method === 'GET') {
        echo json_encode([
            'success' => true,
            'service' => 'Hermes Autonomous Webhook Listener',
            'interactive_whitelist_target' => "+{$whitelistedPhone}",
            'config' => $service->getConfig(),
            'prompts' => $service->getPromptsConfig(),
            'is_after_hours' => $service->isAfterHours()
        ]);
        exit;
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?: [];
        $action = $data['action'] ?? '';

        // 1. Ações diretas via API administrativa / UI
        if ($action === 'test_prompt') {
            $channel = $data['channel'] ?? 'clinica';
            $message = $data['message'] ?? 'Olá, gostaria de saber sobre eletroestimulação para celulite';
            $operator = $data['operator'] ?? [];
            echo json_encode($service->testPrompt($channel, $message, $operator));
            exit;
        }

        if ($action === 'update_config') {
            echo json_encode($service->updateConfig($data['config'] ?? []));
            exit;
        }

        if ($action === 'update_prompts') {
            echo json_encode($service->updatePromptsConfig($data['prompts'] ?? []));
            exit;
        }

        if ($action === 'copilot_draft') {
            $msg = $data['message'] ?? '';
            $line = $data['line'] ?? ($data['channel'] ?? 'CLINICA');
            $patient = $data['patient'] ?? ($data['contact'] ?? []);
            $operator = $data['operator'] ?? [];
            $history = $data['history'] ?? ($data['conversation_history'] ?? []);
            echo json_encode($service->generateCopilotDraft($msg, $line, $patient, $operator, $history));
            exit;
        }

        if ($action === 'internal_assistant_chat') {
            $query = $data['query'] ?? ($data['message'] ?? '');
            $operator = $data['operator'] ?? [];
            $history = $data['history'] ?? [];
            $contact = $data['contact'] ?? ($data['patient'] ?? []);
            echo json_encode($service->internalAssistantChat($query, $operator, $history, $contact));
            exit;
        }

        if ($action === 'summarize_dossier') {
            $convId = (int)($data['conversation_id'] ?? 0);
            $messages = $data['messages'] ?? [];
            $contact = $data['contact'] ?? ($data['patient'] ?? []);
            echo json_encode($service->generateDossierSummary($convId, $messages, $contact));
            exit;
        }

        if ($action === 'deep_reasoning') {
            $msg = $data['message'] ?? '';
            $ctx = $data['context'] ?? [];
            echo json_encode($service->runDeepReasoningTurn($msg, $ctx));
            exit;
        }

        if ($action === 'execute_tool') {
            $tool = $data['tool'] ?? '';
            $args = $data['args'] ?? [];
            echo json_encode($service->executeToolCall($tool, $args));
            exit;
        }

        // ---------------------------------------------------------------------
        // 2. PARSER DE WEBHOOK DE ENTRADA (Evolution API v2 & Chatwoot)
        // ---------------------------------------------------------------------
        $senderPhone = '';
        $content = '';
        $isFromMe = false;
        $instanceName = $data['instance'] ?? 'inst_comercial';
        $event = $data['event'] ?? ($data['data']['event'] ?? '');

        // Formato Evolution API v2 (messages.upsert)
        if (isset($data['data']['key'])) {
            $key = $data['data']['key'] ?? [];
            $remoteJid = $key['remoteJid'] ?? '';
            $senderPhone = preg_replace('/\D/', '', explode('@', $remoteJid)[0] ?? '');
            $isFromMe = !empty($key['fromMe']);

            $msgObj = $data['data']['message'] ?? [];
            $content = $msgObj['conversation'] ?? ($msgObj['extendedTextMessage']['text'] ?? ($msgObj['imageMessage']['caption'] ?? ''));
        }
        // Formato Chatwoot (message_created)
        elseif (isset($data['message_type'])) {
            $messageType = $data['message_type'] ?? '';
            $isFromMe = ($messageType !== 'incoming');
            $senderPhone = preg_replace('/\D/', '', $data['sender']['phone_number'] ?? ($data['conversation']['meta']['sender']['phone_number'] ?? ''));
            $content = $data['content'] ?? '';
            $inboxId = (int)($data['conversation']['inbox_id'] ?? 1);
            $instanceName = match ($inboxId) {
                7 => 'inst_licenciadas',
                3 => 'inst_comercial',
                default => 'inst_comercial'
            };
        }

        // Ignorar mensagens enviadas pelo próprio bot
        if ($isFromMe || empty(trim($content))) {
            echo json_encode(['success' => true, 'action' => 'ignored', 'reason' => 'outgoing_or_empty']);
            exit;
        }

        // ---------------------------------------------------------------------
        // 2.5 PORTÃO DE DEDUPLICAÇÃO (Elimina Disparos Duplos Chatwoot + Evolution)
        // ---------------------------------------------------------------------
        $msgHash = md5($senderPhone . '_' . trim($content));
        $dedupFile = sys_get_temp_dir() . '/hermes_dedup_' . $msgHash;
        if (file_exists($dedupFile) && (time() - filemtime($dedupFile)) < 25) {
            echo json_encode(['success' => true, 'action' => 'ignored_duplicate', 'sender' => $senderPhone]);
            exit;
        }
        @touch($dedupFile);

        // ---------------------------------------------------------------------
        // 3. WHITELIST EXCLUSIVA DE SEGURANÇA (+5518996959486)
        // ---------------------------------------------------------------------
        $cleanWhitelisted = '5518996959486';
        $isTarget = ($senderPhone === $cleanWhitelisted || $senderPhone === '18996959486');

        if (!$isTarget) {
            // Em produção durante o teste, ignorar ou apenas criar nota interna
            echo json_encode([
                'success' => true,
                'action' => 'ignored_non_whitelisted',
                'sender' => $senderPhone,
                'reason' => 'exclusive_test_mode_active'
            ]);
            exit;
        }

        // ---------------------------------------------------------------------
        // 4. PROCESSAMENTO AUTÔNOMO VIA MOTOR DE RACIOCÍNIO PROFUNDO
        // ---------------------------------------------------------------------
        $channel = match ($instanceName) {
            'inst_licenciadas' => 'licenciadas',
            'inst_juridico' => 'juridico',
            default => 'vendas'
        };

        $reasoningResult = $service->runDeepReasoningTurn($content, [
            'channel' => $channel,
            'sender_name' => 'Guilherme',
            'sender_phone' => $senderPhone,
            'instance_name' => $instanceName
        ]);

        $replyText = $reasoningResult['public_reply'] ?? 'Olá! Mensagem recebida pelo Hermes.';

        // Disparo da Resposta Direta de Volta ao WhatsApp do Gestor
        $dispatch = $evoApi->sendTextMessage($instanceName, $senderPhone, $replyText);

        // Registro de Auditoria Forense
        $intel->logAuditAction([
            'conversation_id' => 999,
            'line_code' => strtoupper($channel),
            'action_type' => 'AUTONOMOUS_INTERACTIVE_REPLY',
            'user_input' => $content,
            'ai_output' => $replyText,
            'tool_name' => $reasoningResult['tool_executed']['tool'] ?? 'deep_reasoning',
            'sentiment_status' => 'POSITIVE',
            'execution_time_ms' => $reasoningResult['latency_ms'] ?? 100
        ]);

        // Gravação em log estruturado de interações do gestor
        $logFile = __DIR__ . '/../../tmp/hermes_gestor_interactions.json';
        $existingLogs = file_exists($logFile) ? (json_decode(file_get_contents($logFile), true) ?: []) : [];
        $existingLogs[] = [
            'timestamp' => date('c'),
            'instance' => $instanceName,
            'user_message' => $content,
            'hermes_reply' => $replyText,
            'thought_process' => $reasoningResult['thought_process'] ?? [],
            'tool_executed' => $reasoningResult['tool_executed'] ?? null,
            'transfer_executed' => $reasoningResult['transfer_executed'] ?? null,
            'latency_ms' => $reasoningResult['latency_ms'] ?? 0
        ];
        @file_put_contents($logFile, json_encode($existingLogs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        echo json_encode([
            'success' => true,
            'action' => 'autonomous_replied',
            'target' => "+{$senderPhone}",
            'instance_used' => $instanceName,
            'reply' => $replyText,
            'dispatch_status' => $dispatch['status'] ?? 201
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno no Hermes Agent: ' . $e->getMessage()
    ]);
}
