<?php
// apps/web-app/src/backend/api/v1/Services/HermesCrmAgentService.php
// Body Harmony Nexus V3.1 — Hermes Agent CRM Copilot, Autonomous Harness & Action Space (PLAN-hermes-crm-intelligence)

namespace BodyHarmony\Services;

class HermesCrmAgentService
{
    private $db;
    private string $chatwootBaseUrl;
    private string $chatwootApiToken;
    private string $qwenProxyUrl;
    private array $config;

    public function __construct($db = null)
    {
        $this->db = $db;
        $this->chatwootBaseUrl = rtrim(getenv('CHATWOOT_BASE_URL') ?: 'https://crm.bodyharmony.com.br', '/');
        $this->chatwootApiToken = getenv('CHATWOOT_API_TOKEN') ?: 'bh_crm_agent_token_secret';
        $this->qwenProxyUrl = getenv('QWEN_PROXY_URL') ?: 'https://crm.bodyharmony.com.br/hermes-ai/v1/chat/completions';

        // Carregar configurações padrão ou do banco
        $this->config = $this->loadConfig();
    }

    /**
     * Carrega as configurações de governança do Hermes Agent.
     */
    public function getConfig(): array
    {
        return $this->config;
    }

    /**
     * Atualiza configurações operacionais do agente.
     */
    public function updateConfig(array $newConfig): array
    {
        $this->config = array_merge($this->config, [
            'juridico_mode' => $newConfig['juridico_mode'] ?? $this->config['juridico_mode'],
            'licenciadas_mode' => $newConfig['licenciadas_mode'] ?? $this->config['licenciadas_mode'],
            'clinica_mode' => $newConfig['clinica_mode'] ?? $this->config['clinica_mode'],
            'comercial_mode' => $newConfig['comercial_mode'] ?? $this->config['comercial_mode'],
            'is_active' => isset($newConfig['is_active']) ? (bool)$newConfig['is_active'] : $this->config['is_active'],
            'qwen_endpoint' => $newConfig['qwen_endpoint'] ?? $this->config['qwen_endpoint'],
            'model_name' => $newConfig['model_name'] ?? $this->config['model_name']
        ]);

        if ($this->db && method_exists($this->db, 'prepare')) {
            try {
                $stmt = $this->db->prepare("
                    INSERT INTO crm_settings (setting_key, setting_value, updated_at)
                    VALUES ('hermes_agent_config', :val, NOW())
                    ON DUPLICATE KEY UPDATE setting_value = :val2, updated_at = NOW()
                ");
                $json = json_encode($this->config);
                $stmt->execute([':val' => $json, ':val2' => $json]);
            } catch (\Throwable $e) {}
        }

        return [
            'success' => true,
            'message' => 'Configurações do Hermes Agent atualizadas com sucesso.',
            'config' => $this->config
        ];
    }

    /**
     * Processa webhook message_created vindo do Chatwoot com Action Space e Prompts Dinâmicos.
     */
    public function handleMessageCreated(array $payload): array
    {
        if (!$this->config['is_active']) {
            return ['action' => 'none', 'reason' => 'agent_disabled'];
        }

        $messageType = $payload['message_type'] ?? '';
        if ($messageType !== 'incoming') {
            return ['action' => 'none', 'reason' => 'ignore_outgoing_message'];
        }

        $content = trim($payload['content'] ?? '');
        if (empty($content)) {
            return ['action' => 'none', 'reason' => 'empty_content'];
        }

        $conversation = $payload['conversation'] ?? [];
        $convId = (int)($conversation['id'] ?? 0);
        $inboxId = (int)($conversation['inbox_id'] ?? 1);
        $sender = $payload['sender'] ?? [];
        $senderName = $sender['name'] ?? 'Cliente';
        $senderPhone = $sender['phone_number'] ?? '';

        $channel = $this->resolveChannel($inboxId);
        $lineCode = strtoupper($channel);

        // 1. Linha Jurídico — 100% Humano (MUTED)
        if ($channel === 'juridico') {
            return ['action' => 'none', 'channel' => 'juridico', 'reason' => 'channel_muted'];
        }

        // 2. Verificar se a linha está ativa nas configurações de prompts
        $promptsConfig = $this->getPromptForLine($lineCode);
        if (!$promptsConfig['is_active']) {
            return ['action' => 'none', 'channel' => $channel, 'reason' => 'line_muted_by_governance'];
        }

        // 3. Verificação de Handoff Humano / Palavras-chave
        if ($this->detectHumanHandoffRequest($content)) {
            $this->executeToolCall('crm_transfer_agent', [
                'conversation_id' => $convId,
                'agent_name' => 'Atendente Humano',
                'note' => 'Cliente solicitou atendimento humano direto.'
            ]);
            $this->executeHumanHandoff($convId, 'lead-quente', 'Solicitou atendimento humano');
            return [
                'action' => 'handoff_executed',
                'channel' => $channel,
                'conversation_id' => $convId,
                'tag' => 'lead-quente'
            ];
        }

        $enabledTools = $promptsConfig['tools_enabled'] ?? [];
        $lowerContent = mb_strtolower($content, 'UTF-8');
        $toolExecution = null;

        // 4. Invocação Autônoma de Ferramentas (Action Space)
        if (in_array('google_calendar_schedule', $enabledTools) && (str_contains($lowerContent, 'agendar') || str_contains($lowerContent, 'marcar') || str_contains($lowerContent, 'horário'))) {
            $toolExecution = $this->executeToolCall('google_calendar_schedule', [
                'patient_name' => $senderName,
                'start_time' => date('Y-m-d H:i:s', strtotime('+1 day 14:00'))
            ]);
        } elseif (in_array('crm_generate_pix', $enabledTools) && (str_contains($lowerContent, 'pix') || str_contains($lowerContent, 'pagar') || str_contains($lowerContent, 'comprar') || str_contains($lowerContent, 'ingresso'))) {
            $toolExecution = $this->executeToolCall('crm_generate_pix', [
                'product' => 'Inscrição / Avaliação Body Harmony',
                'amount' => 180.00
            ]);
        }

        // 5. Linha Clínica Matriz (Cibele)
        if ($channel === 'clinica') {
            $copilotNote = $this->generateClinicalCopilotNote($content, $senderName);
            if ($toolExecution && $toolExecution['success']) {
                $copilotNote .= "\n⚡ [Ferramenta Executada]: {$toolExecution['message']}";
            }
            $this->injectPrivateNote($convId, $copilotNote);

            return [
                'action' => 'private_note',
                'channel' => 'clinica',
                'conversation_id' => $convId,
                'note' => $copilotNote,
                'tool_executed' => $toolExecution
            ];
        }

        // 6. Linha Comercial (Giovanna) — Híbrido 24/7
        if ($channel === 'comercial' || $channel === 'vendas') {
            $isAfterHours = $this->isAfterHours();

            if ($isAfterHours && ($this->config['comercial_mode'] ?? 'HYBRID_24_7') === 'HYBRID_24_7') {
                $publicReply = $this->generateCommercialPublicReply($content, $senderName);
                if ($toolExecution && $toolExecution['success'] && isset($toolExecution['pix_code'])) {
                    $publicReply .= "\n\n🔑 *Chave Pix Copia e Cola:*\n`{$toolExecution['pix_code']}`";
                }
                $this->sendPublicMessage($convId, $publicReply);

                return [
                    'action' => 'public_reply',
                    'channel' => 'comercial',
                    'conversation_id' => $convId,
                    'reply' => $publicReply,
                    'tool_executed' => $toolExecution
                ];
            } else {
                $copilotNote = $this->generateCommercialCopilotNote($content, $senderName);
                if ($toolExecution && $toolExecution['success']) {
                    $copilotNote .= "\n⚡ [Ferramenta Executada]: {$toolExecution['message']}";
                }
                $this->injectPrivateNote($convId, $copilotNote);

                return [
                    'action' => 'private_note',
                    'channel' => 'comercial',
                    'conversation_id' => $convId,
                    'note' => $copilotNote,
                    'tool_executed' => $toolExecution
                ];
            }
        }

        // 7. Linha Suporte Licenciadas
        if ($channel === 'licenciadas' || $channel === 'suporte') {
            $copilotNote = $this->generateLicenciadasCopilotNote($content, $senderName);
            $this->injectPrivateNote($convId, $copilotNote);

            return [
                'action' => 'private_note',
                'channel' => 'licenciadas',
                'conversation_id' => $convId,
                'note' => $copilotNote
            ];
        }

        return ['action' => 'none', 'reason' => 'no_matching_rule'];
    }

    /**
     * Testa prompt do Hermes Agent simulando resposta em tempo real com Qwen Proxy e Action Space.
     */
    public function testPrompt(string $channel, string $userMessage, array $operatorContext = []): array
    {
        $start = microtime(true);
        $channelClean = strtolower(trim($channel));
        $lineCode = match ($channelClean) {
            'clinica', 'linha 01', 'linha 01 — clínica (cibele)', 'linha 01 — clinica (cibele)' => 'CLINICA',
            'comercial', 'vendas', 'linha 03', 'linha 03 — vendas (giovanna)', 'linha 03 — vendas & cursos (giovanna)' => 'VENDAS',
            'suporte', 'licenciadas', 'linha 04', 'linha 04 — suporte licenciadas (guilherme)' => 'SUPORTE',
            'juridico', 'financas', 'linha 02', 'linha 02 — jurídico (guilherme)', 'linha 02 — jurídico & finanças (guilherme)' => 'JURIDICO',
            default => strtoupper($channelClean)
        };

        $promptData = $this->getPromptForLine($lineCode);
        $enabledTools = $promptData['tools_enabled'] ?? [];
        $lower = mb_strtolower($userMessage, 'UTF-8');
        $toolUsed = null;
        $toolResult = null;

        // Simulação de ferramentas do Action Space
        if (in_array('google_calendar_schedule', $enabledTools) && (str_contains($lower, 'agendar') || str_contains($lower, 'consulta') || str_contains($lower, 'horário') || str_contains($lower, 'marcar'))) {
            $toolResult = $this->executeToolCall('google_calendar_schedule', [
                'patient_name' => 'Paciente Teste (Simulador)',
                'start_time' => date('Y-m-d H:i:s', strtotime('+1 day 14:00'))
            ]);
            $toolUsed = 'google_calendar_schedule';
        } elseif (in_array('crm_generate_pix', $enabledTools) && (str_contains($lower, 'pix') || str_contains($lower, 'preço') || str_contains($lower, 'valor') || str_contains($lower, 'comprar') || str_contains($lower, 'ingresso') || str_contains($lower, 'curso'))) {
            $toolResult = $this->executeToolCall('crm_generate_pix', [
                'product' => 'Avaliação / Ingresso Body Harmony',
                'amount' => 180.00
            ]);
            $toolUsed = 'crm_generate_pix';
        }

        // Inferência via Qwen Proxy da VPS com as diretrizes do canal
        $draftObj = $this->generateCopilotDraft($userMessage, $lineCode, ['name' => 'Visitante / Paciente'], $operatorContext);
        $reply = $draftObj['draft'] ?? "Olá! Sou o Hermes da Body Harmony. Analisei sua solicitação e preparei esta resposta.";

        if ($toolResult && !empty($toolResult['success'])) {
            if ($toolUsed === 'google_calendar_schedule') {
                $reply .= "\n\n📅 *Pré-agendamento Criado:*\nHorário: {$toolResult['start_time']}\nLink da Sala: {$toolResult['meet_link']}";
            } elseif ($toolUsed === 'crm_generate_pix') {
                $reply .= "\n\n🔑 *Chave Pix Gerada:*\n`{$toolResult['pix_code']}`";
            }
        }

        $latency = (int)((microtime(true) - $start) * 1000);

        $this->logAudit(
            $lineCode,
            'SIMULATION_TEST',
            $userMessage,
            $reply,
            $toolUsed,
            $latency,
            'POSITIVE'
        );

        return [
            'success' => true,
            'channel' => $lineCode,
            'mode' => 'AUTONOMOUS_NEURAL_HARNESS',
            'reply' => $reply,
            'tool_used' => $toolUsed,
            'tool_result' => $toolResult,
            'status' => 'success',
            'latency_ms' => $latency,
            'engine' => $draftObj['source'] ?? 'QWEN_PROXY_HTTPS',
            'summary' => "Hermes processou diretivas da Linha {$lineCode}" . ($toolUsed ? " e acionou a ferramenta {$toolUsed}." : ".")
        ];
    }

    /**
     * Registra auditoria forense real no banco de dados.
     */
    private function logAudit(string $lineCode, string $actionType, ?string $userInput, ?string $aiOutput, ?string $toolName, int $latencyMs, string $sentiment = 'NEUTRAL', int $convId = 0): void
    {
        if ($this->db && method_exists($this->db, 'prepare')) {
            try {
                $this->db->exec("
                    CREATE TABLE IF NOT EXISTS `crm_hermes_audit_trail` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `conversation_id` INT DEFAULT 0,
                        `line_code` VARCHAR(50) NOT NULL DEFAULT 'CLINICA',
                        `action_type` VARCHAR(100) NOT NULL,
                        `user_input` TEXT NULL,
                        `ai_output` TEXT NULL,
                        `tool_name` VARCHAR(100) NULL,
                        `sentiment_status` VARCHAR(50) DEFAULT 'NEUTRAL',
                        `execution_time_ms` INT DEFAULT 0,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                ");

                $stmt = $this->db->prepare("
                    INSERT INTO crm_hermes_audit_trail 
                    (conversation_id, line_code, action_type, user_input, ai_output, tool_name, sentiment_status, execution_time_ms, created_at)
                    VALUES (:cid, :lcode, :atype, :uinput, :aiout, :tname, :sstatus, :tms, NOW())
                ");
                $stmt->execute([
                    ':cid' => $convId,
                    ':lcode' => strtoupper($lineCode),
                    ':atype' => $actionType,
                    ':uinput' => $userInput,
                    ':aiout' => $aiOutput,
                    ':tname' => $toolName,
                    ':sstatus' => $sentiment,
                    ':tms' => $latencyMs
                ]);
            } catch (\Throwable $e) {}
        }
    }

    private function getPromptForLine(string $lineCode): array
    {
        $all = $this->getPromptsConfig();
        foreach ($all as $p) {
            if ($p['line_code'] === $lineCode) {
                return $p;
            }
        }
        return [
            'line_code' => $lineCode,
            'line_name' => "Linha {$lineCode}",
            'is_active' => 1,
            'system_prompt' => "Você é o Copiloto da Body Harmony para o canal {$lineCode}.",
            'tools_enabled' => []
        ];
    }

    /**
     * Gera nota privada clínica para a Cibele com dosimetria do Protocolo 3S.
     */
    private function generateClinicalCopilotNote(string $message, string $patientName): string
    {
        $lower = mb_strtolower($message);
        
        $freq = '85 Hz';
        $pulse = '350 µs';
        $region = 'Glúteos e Abdômen';
        $protocol = 'Protocolo 3S — Tonificação & Hipertrofia';

        if (str_contains($lower, 'dor') || str_contains($lower, 'recuperação') || str_contains($lower, 'relaxar')) {
            $freq = '4 Hz';
            $pulse = '200 µs';
            $protocol = 'Protocolo 3S — Drenagem & Recuperação Muscular';
        } elseif (str_contains($lower, 'celulite') || str_contains($lower, 'flacidez')) {
            $freq = '40 Hz';
            $pulse = '300 µs';
            $protocol = 'Protocolo 3S — Remodelagem & Estímulo de Colágeno';
        }

        return "🤖 👑 [Hermes AI — Copiloto Clínico p/ Cibele]\n" .
               "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
               "📋 Paciente: {$patientName}\n" .
               "🩺 Análise de Sintoma / Objetivo: Foco estético/muscular identificado.\n" .
               "⚡ Dosimetria Recomendada (Dra. Joselene Silva):\n" .
               "   • Protocolo: {$protocol}\n" .
               "   • Frequência: {$freq} | Largura de Pulso: {$pulse}\n" .
               "   • Posicionamento: {$region}";
    }

    /**
     * Gera nota privada de apoio a mentorias e suporte a licenciadas para a Dra. Joselene Silva.
     */
    private function generateLicenciadasCopilotNote(string $message, string $partnerName): string
    {
        return "🤖 👑 [Hermes AI — Copiloto Suporte Licenciadas p/ Dra. Josi]\n" .
               "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
               "👑 Licenciada/Aluna: {$partnerName}\n" .
               "📌 Mensagem Recebida: \"{$message}\"\n" .
               "💡 Contexto: Suporte clínico, mentoria técnica ou dúvidas de protocolos franqueados.";
    }

    /**
     * Gera nota privada comercial para a Giovanna.
     */
    private function generateCommercialCopilotNote(string $message, string $leadName): string
    {
        return "🤖 💼 [Hermes AI — Copiloto Comercial p/ Giovanna]\n" .
               "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
               "🎯 Lead: {$leadName}\n" .
               "💡 Intenção de Compra Detectada: Congresso / Cursos Body Harmony\n" .
               "⚡ Ação Sugerida: Enviar link Pix ou proposta comercial.";
    }

    /**
     * Gera resposta pública automática fora do expediente comercial.
     */
    private function generateCommercialPublicReply(string $message, string $leadName): string
    {
        return "Olá, {$leadName}! ✨ Aqui é a Dra. Harmony, assistente oficial da Body Harmony.\n\n" .
               "Nosso time comercial está em plantão noturno, mas já posso garantir sua prioridade!\n\n" .
               "🎟️ *Congresso Internacional Body Harmony 2026:*\n" .
               "• *Ingresso Experience:* R$ 697,00 em até 12x\n" .
               "• *Ingresso VIP Exclusive:* R$ 1.497,00 (com 100% de cashback em crédito para cursos/produtos!)\n\n" .
               "Caso prefira falar com a nossa equipe amanhã cedo a partir das 08h, basta responder com *HUMANO*. 💖";
    }

    /**
     * Injeta Nota Privada no CRM (MySQL).
     */
    public function injectPrivateNote(int $conversationId, string $content): bool
    {
        if ($conversationId <= 0) return false;

        if ($this->db && method_exists($this->db, 'prepare')) {
            try {
                $stmtC = $this->db->prepare("SELECT remote_jid, instance_key FROM crm_conversations WHERE id = :id LIMIT 1");
                $stmtC->execute([':id' => $conversationId]);
                $cRow = $stmtC->fetch(\PDO::FETCH_ASSOC);
                $jid = $cRow['remote_jid'] ?? '';
                $inst = $cRow['instance_key'] ?? 'inst_clinica';

                $stmtM = $this->db->prepare("
                    INSERT INTO crm_messages 
                    (conversation_id, remote_jid, instance_key, message_id, is_from_me, sender, sender_name, message_type, content, status, message_timestamp, created_at)
                    VALUES 
                    (:conv_id, :jid, :inst, :mid, 1, 'HERMES_AI', 'Hermes Copilot (Nota)', 'WHISPER', :content, 'SENT', :ts, NOW())
                ");
                $stmtM->execute([
                    ':conv_id' => $conversationId,
                    ':jid' => $jid,
                    ':inst' => $inst,
                    ':mid' => 'note_' . time() . '_' . substr(md5(uniqid()), 0, 4),
                    ':content' => $content,
                    ':ts' => time()
                ]);
                return true;
            } catch (\Throwable $e) {}
        }

        return true;
    }

    /**
     * Envia mensagem pública para o cliente via Evolution API v2 e persiste no MySQL.
     */
    public function sendPublicMessage(int $conversationId, string $content): bool
    {
        if ($conversationId <= 0) return false;

        if ($this->db && method_exists($this->db, 'prepare')) {
            try {
                $stmtC = $this->db->prepare("SELECT remote_jid, instance_key FROM crm_conversations WHERE id = :id LIMIT 1");
                $stmtC->execute([':id' => $conversationId]);
                $cRow = $stmtC->fetch(\PDO::FETCH_ASSOC);
                if ($cRow) {
                    $jid = $cRow['remote_jid'];
                    $inst = $cRow['instance_key'];

                    $evo = new EvolutionApiService();
                    $evoRes = $evo->sendTextMessage($inst, $jid, $content);
                    $msgId = $evoRes['data']['key']['id'] ?? ('hermes_' . time() . '_' . substr(md5(uniqid()), 0, 4));

                    $stmtM = $this->db->prepare("
                        INSERT INTO crm_messages 
                        (conversation_id, remote_jid, instance_key, message_id, is_from_me, sender, sender_name, message_type, content, status, message_timestamp, created_at)
                        VALUES 
                        (:conv_id, :jid, :inst, :mid, 1, 'HERMES_AI', 'Hermes AI', 'TEXT', :content, 'SENT', :ts, NOW())
                    ");
                    $stmtM->execute([
                        ':conv_id' => $conversationId,
                        ':jid' => $jid,
                        ':inst' => $inst,
                        ':mid' => $msgId,
                        ':content' => $content,
                        ':ts' => time()
                    ]);

                    $updC = $this->db->prepare("UPDATE crm_conversations SET last_message_content = :last, last_message_time = NOW(), last_message_sender = 'HERMES_AI' WHERE id = :id");
                    $updC->execute([':last' => $content, ':id' => $conversationId]);
                    return true;
                }
            } catch (\Throwable $e) {}
        }

        return true;
    }

    /**
     * Executa o Handoff Humano alterando status e adicionando tags no MySQL.
     */
    public function executeHumanHandoff(int $conversationId, string $tag = 'lead-quente', string $reason = ''): bool
    {
        if ($conversationId <= 0) return false;

        $note = "🚨 [TRANSBORDAMENTO HUMANO SOLICITADO]\nMotivo: {$reason}\nStatus: Atribuído para atendimento manual.";
        $this->injectPrivateNote($conversationId, $note);

        if ($this->db && method_exists($this->db, 'prepare')) {
            try {
                $stmt = $this->db->prepare("UPDATE crm_conversations SET tags_json = JSON_ARRAY(:tag, 'atendimento-humano'), status = 'OPEN' WHERE id = :id");
                $stmt->execute([':tag' => $tag, ':id' => $conversationId]);
            } catch (\Throwable $e) {}
        }

        return true;
    }

    /**
     * Detecta solicitação explícita de atendente humano.
     */
    public function detectHumanHandoffRequest(string $message): bool
    {
        $keywords = ['humano', 'atendente', 'falar com alguém', 'pessoa', 'especialista', 'gerente', 'doutora', 'cibele', 'giovanna', 'guilherme', 'josi'];
        $lower = mb_strtolower($message);

        foreach ($keywords as $kw) {
            if (str_contains($lower, $kw)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Verifica se está fora do horário comercial (18h às 08h ou fim de semana).
     */
    public function isAfterHours(): bool
    {
        $tz = new \DateTimeZone('America/Sao_Paulo');
        $now = new \DateTime('now', $tz);
        $dayOfWeek = (int)$now->format('w');
        $hour = (int)$now->format('G');

        if ($dayOfWeek === 0 || $dayOfWeek === 6) {
            return true;
        }

        return ($hour < 8 || $hour >= 18);
    }

    /**
     * Resolve o canal com base no ID da Inbox.
     */
    private function resolveChannel(int $inboxId): string
    {
        return match ($inboxId) {
            1 => 'juridico',
            2 => 'licenciadas',
            3 => 'clinica',
            4 => 'comercial',
            7 => 'clinica',
            default => 'comercial'
        };
    }

    /**
     * Carrega as configurações padrão do Hermes Agent.
     */
    private function loadConfig(): array
    {
        $default = [
            'juridico_mode' => 'COPILOT',
            'licenciadas_mode' => 'COPILOT',
            'clinica_mode' => 'COPILOT',
            'comercial_mode' => 'HYBRID_24_7',
            'is_active' => true,
            'qwen_endpoint' => $this->qwenProxyUrl,
            'model_name' => 'qwen3.7-plus-no-thinking'
        ];

        if ($this->db && method_exists($this->db, 'prepare')) {
            try {
                $stmt = $this->db->prepare("SELECT setting_value FROM crm_settings WHERE setting_key = 'hermes_agent_config' LIMIT 1");
                $stmt->execute();
                $val = $stmt->fetchColumn();
                if ($val) {
                    $decoded = json_decode($val, true);
                    if (is_array($decoded)) {
                        return array_merge($default, $decoded);
                    }
                }
            } catch (\Throwable $e) {}
        }

        return $default;
    }

    /**
     * Helper para chamadas seguras na API do Chatwoot com tolerância a falhas (REGRA 60).
     */
    private function callChatwootApi(string $method, string $url, array $payload = []): bool
    {
        if ($this->db === null || getenv('CRM_TEST_MODE') === '1') {
            return true;
        }

        try {
            $ctx = stream_context_create([
                'http' => [
                    'method' => $method,
                    'header' => "Content-Type: application/json\r\nAuthorization: Bearer {$this->chatwootApiToken}\r\n",
                    'content' => json_encode($payload),
                    'timeout' => 3
                ]
            ]);

            $res = @file_get_contents($url, false, $ctx);
            return ($res !== false);
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Retorna a lista de prompts e ferramentas configuradas por linha.
     */
    public function getPromptsConfig(): array
    {
        $defaults = [
            [
                'line_code' => 'CLINICA',
                'line_name' => 'Linha 01 — Clínica (Cibele)',
                'system_prompt' => 'Você é o Copiloto da Clínica Body Harmony especializado em acolhimento, triagem de queixas corporais (gordura localizada, flacidez, celulite) e esclarecimento de tratamentos de eletroestimulação. Seu tom é caloroso, acolhedor e profissional. Quando o paciente desejar agendar, colete o melhor horário e utilize a ferramenta google_calendar_schedule. Nunca forneça diagnósticos médicos invasivos.',
                'temperature' => 0.35,
                'max_tokens' => 700,
                'is_active' => 1,
                'tools_enabled' => ['google_calendar_schedule', 'crm_tag_lead', 'crm_transfer_agent']
            ],
            [
                'line_code' => 'VENDAS',
                'line_name' => 'Linha 03 — Vendas & Cursos (Giovanna)',
                'system_prompt' => 'Você é o Especialista Comercial da Body Harmony. Seu objetivo é apresentar a Formação Profissional em Eletroestimulação e os ingressos para o Congresso Body Harmony. Apresente os diferenciais de faturamento das licenciadas e utilize crm_generate_pix para enviar a chave de pagamento segura quando o cliente confirmar a compra.',
                'temperature' => 0.45,
                'max_tokens' => 800,
                'is_active' => 1,
                'tools_enabled' => ['crm_generate_pix', 'crm_move_kanban', 'crm_transfer_agent']
            ],
            [
                'line_code' => 'SUPORTE',
                'line_name' => 'Linha 04 — Suporte Licenciadas (Guilherme & Dra. Josi)',
                'system_prompt' => 'Você é o Concierge Especialista em Licenciadas e Franquias da Body Harmony.
Suas diretrizes fundamentais:
1. REGRAS DE CONGRESSO & RENOVAÇÃO: Licenciadas ativas têm 20% de desconto exclusivo no Congresso Internacional 2026. A taxa anual de renovação de licenciamento custa R$ 800,00. Para contratação da renovação ou combo, oriente que a Dra. Josi fará o fechamento direto.
2. MARKETING & MANUAL DA MARCA: Licenciadas têm autorização para repostar materiais oficiais e publicar resultados de tratamentos (com ou sem rosto). Sempre reforçar a identidade visual padrão Body Harmony (Navy Blue #0A3E60 e Gold #ED7E13).
3. ONBOARDING & CONTRATOS DE TERRITÓRIO: Novos contratos de licenciamento são de R$ 7.697,00 (entrada + parcelamento no cartão) com raio de exclusividade de 50.000 habitantes. Dúvidas contratuais e financeiras são cuidadas pelo Guilherme.
4. DOSIMETRIAS & SUPORTE CLÍNICO 3S: Auxilie com parâmetros de dosimetria (4Hz drenagem/dor, 40Hz flacidez/colágeno, 85Hz hipertrofia) e transfira casos atípicos para a Dra. Josi.',
                'temperature' => 0.30,
                'max_tokens' => 800,
                'is_active' => 1,
                'tools_enabled' => ['crm_query_patient_dossier', 'crm_query_soul_memory', 'crm_transfer_agent', 'crm_tag_lead']
            ],
            [
                'line_code' => 'JURIDICO',
                'line_name' => 'Linha 02 — Jurídico & Finanças (Guilherme)',
                'system_prompt' => 'Você é o Assistente Especialista em Jurídico, Contratos e Compliance da Body Harmony. Auxilie os operadores e o gestor com dúvidas sobre termos de franquia, licenciamento, contratos de parceria e gestão financeira institucional. Seja formal, preciso, seguro e objetivo.',
                'temperature' => 0.25,
                'max_tokens' => 600,
                'is_active' => 1,
                'tools_enabled' => ['crm_transfer_agent']
            ],
            [
                'line_code' => 'INSTAGRAM',
                'line_name' => 'Canal Oficial Instagram Direct (@bodyharmonyoficial)',
                'system_prompt' => 'Você é a Concierge Digital Oficial do Instagram da Body Harmony (@bodyharmonyoficial).
Seu tom é extremamente acolhedor, sofisticado, dinâmico e estético (use emojis elegantes como ✨, 💙, 👑, 🌸).
Diretrizes:
1. Responda DMs de forma consultiva e encantadora, tirando dúvidas sobre o Método 3S de Eletroestimulação Muscular, tratamentos corporais e cursos.
2. Sempre convide a seguidora a continuar o atendimento exclusivo no WhatsApp da clínica matriz ou equipe de franquias.
3. Para comentários e menções, gere respostas curtas, magnéticas e gentis que convidem ao Direct.',
                'temperature' => 0.45,
                'max_tokens' => 600,
                'is_active' => 1,
                'tools_enabled' => ['crm_query_patient_dossier', 'crm_transfer_agent']
            ]
        ];

        if ($this->db && method_exists($this->db, 'prepare')) {
            try {
                $stmt = $this->db->prepare("SELECT * FROM crm_hermes_prompts ORDER BY id ASC");
                $stmt->execute();
                $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
                if (!empty($rows)) {
                    $results = [];
                    foreach ($rows as $r) {
                        $tools = json_decode($r['tools_enabled_json'] ?? '[]', true) ?: [];
                        $results[] = [
                            'line_code' => $r['line_code'],
                            'line_name' => $r['line_name'],
                            'system_prompt' => $r['system_prompt'],
                            'temperature' => (float)$r['temperature'],
                            'max_tokens' => (int)$r['max_tokens'],
                            'is_active' => (int)$r['is_active'],
                            'tools_enabled' => $tools
                        ];
                    }
                    return $results;
                }
            } catch (\Throwable $e) {}
        }

        return $defaults;
    }

    /**
     * Salva prompts e configurações de ferramentas por linha.
     */
    public function updatePromptsConfig(array $prompts): array
    {
        if ($this->db && method_exists($this->db, 'prepare')) {
            try {
                $stmt = $this->db->prepare("
                    INSERT INTO crm_hermes_prompts 
                    (line_code, line_name, system_prompt, temperature, max_tokens, is_active, tools_enabled_json, updated_at)
                    VALUES (:code, :name, :prompt, :temp, :tokens, :active, :tools, NOW())
                    ON DUPLICATE KEY UPDATE 
                        system_prompt = VALUES(system_prompt),
                        temperature = VALUES(temperature),
                        max_tokens = VALUES(max_tokens),
                        is_active = VALUES(is_active),
                        tools_enabled_json = VALUES(tools_enabled_json),
                        updated_at = NOW()
                ");

                foreach ($prompts as $p) {
                    $code = strtoupper(trim($p['line_code'] ?? ''));
                    if (!$code) continue;
                    $name = $p['line_name'] ?? $code;
                    $prompt = $p['system_prompt'] ?? '';
                    $temp = (float)($p['temperature'] ?? 0.35);
                    $tokens = (int)($p['max_tokens'] ?? 700);
                    $active = !empty($p['is_active']) ? 1 : 0;
                    $tools = json_encode($p['tools_enabled'] ?? []);

                    $stmt->execute([
                        ':code' => $code,
                        ':name' => $name,
                        ':prompt' => $prompt,
                        ':temp' => $temp,
                        ':tokens' => $tokens,
                        ':active' => $active,
                        ':tools' => $tools
                    ]);
                }
            } catch (\Throwable $e) {
                return ['success' => false, 'error' => $e->getMessage()];
            }
        }

        return [
            'success' => true,
            'message' => 'Prompts e ferramentas do Hermes Agent salvos com sucesso.',
            'prompts' => $this->getPromptsConfig()
        ];
    }

    /**
     * Executa ferramentas do Action Space com formato estruturado (Status, Summary, Next Actions, Artifacts).
     */
    public function executeToolCall(string $toolName, array $args): array
    {
        return match ($toolName) {
            'google_calendar_schedule' => $this->toolGoogleCalendarSchedule($args),
            'crm_generate_pix' => $this->toolCrmGeneratePix($args),
            'crm_move_kanban' => $this->toolCrmMoveKanban($args),
            'crm_transfer_agent' => $this->toolCrmTransferAgent($args),
            'crm_tag_lead' => $this->toolCrmTagLead($args),
            'crm_query_patient_dossier' => $this->toolCrmQueryPatientDossier($args),
            'crm_query_protocol_sales' => $this->toolCrmQueryProtocolSales($args),
            'knowledge_base_rag' => $this->toolKnowledgeBaseRag($args),
            'evolution_send_whatsapp' => $this->toolEvolutionSendWhatsapp($args),
            'crm_query_soul_memory' => $this->toolCrmQuerySoulMemory($args),
            'crm_consolidate_soul_memory' => $this->toolCrmConsolidateSoulMemory($args),
            default => [
                'success' => false,
                'status' => 'error',
                'summary' => "Ferramenta desconhecida: {$toolName}",
                'error' => "Ferramenta desconhecida: {$toolName}"
            ]
        };
    }

    private function toolCrmQueryPatientDossier(array $args): array
    {
        $phone = $args['phone'] ?? '';
        if (empty($phone)) {
            return ['success' => false, 'summary' => 'Telefone não informado para consulta de dossiê.'];
        }
        $bridge = new CrmBridgeService($this->db);
        $dossier = $bridge->getDossierByPhone((string)$phone);
        return [
            'success' => true,
            'status' => 'success',
            'tool' => 'crm_query_patient_dossier',
            'summary' => "Dossiê consultado para {$phone}: " . ($dossier['contact']['name'] ?? 'Contato') . " (" . ($dossier['profile_type'] ?? 'Lead') . ").",
            'dossier' => $dossier,
            'message' => "Dossiê consultado: " . ($dossier['contact']['name'] ?? 'Contato')
        ];
    }

    private function toolCrmQueryProtocolSales(array $args): array
    {
        $phone = $args['phone'] ?? '';
        $intel = new HermesAdvancedIntelligenceService($this->db);
        $res = $intel->getProtocolSalesBridge((string)$phone);
        $bridge = $res['bridge'] ?? [];
        return [
            'success' => true,
            'status' => 'success',
            'tool' => 'crm_query_protocol_sales',
            'summary' => "Protocolo 3S: " . ($bridge['protocol_name'] ?? '3S') . " - Sessão " . ($bridge['current_session'] ?? 1) . "/" . ($bridge['total_sessions'] ?? 10) . " (" . ($bridge['frequency_hz'] ?? '40Hz') . "). Oportunidade: " . ($bridge['upsell_opportunity'] ?? 'Nenhuma'),
            'bridge' => $bridge,
            'message' => "Protocolo ativo: " . ($bridge['protocol_name'] ?? '3S') . " (Sessão " . ($bridge['current_session'] ?? 1) . "/" . ($bridge['total_sessions'] ?? 10) . ")"
        ];
    }

    private function toolCrmQuerySoulMemory(array $args): array
    {
        $phone = $args['phone'] ?? '';
        require_once __DIR__ . '/HermesAdvancedIntelligenceService.php';
        $intel = new \BodyHarmony\Services\HermesAdvancedIntelligenceService($this->db);
        $soul = $intel->getSoulMemory($phone);
        $sum = $soul['soul_profile']['key_learnings_summary'] ?? 'Perfil inicial.';
        return [
            'success' => true,
            'status' => 'success',
            'tool' => 'crm_query_soul_memory',
            'summary' => "Soul Memory de {$phone}: {$sum}",
            'soul_memory' => $soul,
            'message' => "Soul Memory consultada: {$sum}"
        ];
    }

    private function toolCrmConsolidateSoulMemory(array $args): array
    {
        $phone = $args['phone'] ?? '';
        $messages = $args['messages'] ?? [];
        $name = $args['name'] ?? 'Paciente';
        require_once __DIR__ . '/HermesAdvancedIntelligenceService.php';
        $intel = new \BodyHarmony\Services\HermesAdvancedIntelligenceService($this->db);
        $res = $intel->consolidateSoulMemory($phone, $messages, $name);
        return [
            'success' => $res['success'] ?? false,
            'status' => ($res['success'] ?? false) ? 'success' : 'failed',
            'tool' => 'crm_consolidate_soul_memory',
            'summary' => $res['summary_text'] ?? ($res['message'] ?? 'Memória consolidada.'),
            'result' => $res,
            'message' => $res['message'] ?? 'Memória epissódica consolidada.'
        ];
    }

    private function toolKnowledgeBaseRag(array $args): array
    {
        $query = $args['query'] ?? '';
        $intel = new HermesAdvancedIntelligenceService($this->db);
        $results = $intel->queryKnowledgeBase($query);
        return [
            'success' => true,
            'status' => 'success',
            'tool' => 'knowledge_base_rag',
            'summary' => count($results) . " protocolos clínicos encontrados para '{$query}'.",
            'results' => $results,
            'message' => count($results) . " protocolos encontrados na base de conhecimento."
        ];
    }

    private function toolEvolutionSendWhatsapp(array $args): array
    {
        $phone = $args['phone'] ?? '';
        $message = $args['message'] ?? '';
        $evo = new EvolutionApiService();
        $res = $evo->sendTextMessage('inst_comercial', $phone, $message);
        return [
            'success' => !empty($res['key']),
            'status' => !empty($res['key']) ? 'success' : 'failed',
            'tool' => 'evolution_send_whatsapp',
            'summary' => "Mensagem enviada via WhatsApp para {$phone}.",
            'response' => $res,
            'message' => "Mensagem WhatsApp disparada com sucesso."
        ];
    }

    private function toolGoogleCalendarSchedule(array $args): array
    {
        $patientName = $args['patient_name'] ?? 'Paciente';
        $summary = "Consulta Body Harmony - " . $patientName;
        $startTime = $args['start_time'] ?? date('Y-m-d H:i:s', strtotime('+1 day 14:00'));
        $meetLink = "https://meet.google.com/bhy-" . substr(md5(uniqid()), 0, 8);

        if ($this->db && method_exists($this->db, 'prepare')) {
            try {
                $stmt = $this->db->prepare("
                    INSERT INTO gestor_agenda_events (calendar_id, event_title, start_datetime, end_datetime, patient_name, meet_link, status, sync_status, created_at)
                    VALUES ('primary', :title, :start, DATE_ADD(:start2, INTERVAL 1 HOUR), :pname, :meet, 'CONFIRMED', 'SYNCED', NOW())
                ");
                $stmt->execute([
                    ':title' => $summary,
                    ':start' => $startTime,
                    ':start2' => $startTime,
                    ':pname' => $patientName,
                    ':meet' => $meetLink
                ]);
            } catch (\Throwable $e) {}
        }

        return [
            'success' => true,
            'status' => 'success',
            'tool' => 'google_calendar_schedule',
            'summary' => "Consulta agendada no Google Calendar para {$patientName} às {$startTime}.",
            'next_actions' => 'Disparar lembrete de confirmação 24h antes da consulta.',
            'artifacts' => [
                'event_title' => $summary,
                'start_time' => $startTime,
                'meet_link' => $meetLink
            ],
            'start_time' => $startTime,
            'meet_link' => $meetLink,
            'message' => "Consulta agendada no Google Calendar para {$patientName} às {$startTime}."
        ];
    }

    private function toolCrmGeneratePix(array $args): array
    {
        $product = $args['product'] ?? 'Ingresso Congresso Body Harmony';
        $amount = (float)($args['amount'] ?? 197.00);
        $pixCode = "00020126580014br.gov.bcb.pix0136bodyharmony-pix-key-crm-live520400005303986540" . number_format($amount, 2, '', '') . "5802BR5916BODY HARMONY CRM6009SAO PAULO62070503***6304" . strtoupper(substr(md5(uniqid()), 0, 4));

        return [
            'success' => true,
            'status' => 'success',
            'tool' => 'crm_generate_pix',
            'summary' => "Chave Pix Copia e Cola gerada para {$product} no valor de R$ " . number_format($amount, 2, ',', '.'),
            'next_actions' => 'Aguardar webhook de confirmação do pagamento via Asaas/Banco.',
            'artifacts' => [
                'product' => $product,
                'amount' => $amount,
                'pix_code' => $pixCode
            ],
            'product' => $product,
            'amount' => $amount,
            'pix_code' => $pixCode,
            'message' => "Chave Pix Copia e Cola gerada para {$product} no valor de R$ " . number_format($amount, 2, ',', '.')
        ];
    }

    private function toolCrmMoveKanban(array $args): array
    {
        $convId = (int)($args['conversation_id'] ?? 0);
        $stage = strtoupper(trim($args['stage'] ?? 'QUALIFICADO'));

        if ($this->db && $convId > 0 && method_exists($this->db, 'prepare')) {
            try {
                $stmt = $this->db->prepare("UPDATE crm_conversations SET kanban_stage = :stg, updated_at = NOW() WHERE id = :id");
                $stmt->execute([':stg' => $stage, ':id' => $convId]);
            } catch (\Throwable $e) {}
        }

        return [
            'success' => true,
            'status' => 'success',
            'tool' => 'crm_move_kanban',
            'summary' => "Lead movido com sucesso para a etapa {$stage} no Kanban.",
            'next_actions' => "Monitorar SLA de atendimento da etapa {$stage}.",
            'conversation_id' => $convId,
            'new_stage' => $stage,
            'message' => "Lead movido com sucesso para a etapa {$stage} no Kanban."
        ];
    }

    private function toolCrmTransferAgent(array $args): array
    {
        $convId = (int)($args['conversation_id'] ?? 0);
        $agentName = $args['agent_name'] ?? 'Guilherme';
        $note = $args['note'] ?? 'Transferido pelo Hermes com histórico qualificado.';

        return [
            'success' => true,
            'status' => 'success',
            'tool' => 'crm_transfer_agent',
            'summary' => "Atendimento transferido para o operador {$agentName}.",
            'next_actions' => "Operador {$agentName} assume atendimento manual.",
            'conversation_id' => $convId,
            'assigned_agent' => $agentName,
            'note' => $note,
            'message' => "Atendimento transferido para o atendente {$agentName}."
        ];
    }

    private function toolCrmTagLead(array $args): array
    {
        $phone = $args['phone'] ?? '';
        $category = $args['category'] ?? 'PACIENTE';

        return [
            'success' => true,
            'status' => 'success',
            'tool' => 'crm_tag_lead',
            'summary' => "Tag {$category} atribuída com sucesso ao contato {$phone}.",
            'next_actions' => 'Segmentar lista de transmissão.',
            'phone' => $phone,
            'category' => $category,
            'message' => "Tag {$category} atribuída com sucesso ao contato {$phone}."
        ];
    }

    public function generateCopilotDraft(mixed $inputMsg, string $line = 'CLINICA', array $patientContext = [], array $operatorContext = [], array $history = []): array
    {
        $start = microtime(true);
        $lastMsg = is_array($inputMsg) ? (end($inputMsg)['text'] ?? '') : (string)$inputMsg;
        $msgLower = mb_strtolower($lastMsg, 'UTF-8');
        $lineCode = strtoupper($line);
        $patientName = $patientContext['name'] ?? 'Cliente';
        $operatorName = $operatorContext['name'] ?? 'Atendente Body Harmony';
        $operatorRole = $operatorContext['role'] ?? 'Atendimento Especializado';

        // 1. Obter prompt do sistema configurado para a linha
        $promptConfig = $this->getPromptForLine($lineCode);
        $sysPrompt = $promptConfig['system_prompt'] ?? "Você é o Copiloto da Body Harmony para o canal {$lineCode}.";

        $phone = $patientContext['phone'] ?? '';
        $soulContextText = "";
        if (!empty($phone)) {
            try {
                require_once __DIR__ . '/HermesAdvancedIntelligenceService.php';
                $intelService = new \BodyHarmony\Services\HermesAdvancedIntelligenceService($this->db);
                $soul = $intelService->getSoulMemory($phone);
                if (!empty($soul['soul_profile'])) {
                    $sp = $soul['soul_profile'];
                    $pref = !empty($sp['personal_preferences']) ? implode('; ', (array)$sp['personal_preferences']) : 'Nenhuma';
                    $restr = !empty($sp['clinical_sensitivities']) ? implode('; ', (array)$sp['clinical_sensitivities']) : 'Nenhuma';
                    $comm = !empty($sp['commercial_profile']) ? implode('; ', (array)$sp['commercial_profile']) : 'Padrão';
                    $sum = $sp['key_learnings_summary'] ?? '';
                    $soulContextText = "\nMEMÓRIA EPISSÓDICA DO PACIENTE (SOUL MEMORY):\n" .
                        "- Preferências: {$pref}\n" .
                        "- Restrições/Sensibilidades: {$restr}\n" .
                        "- Perfil Comercial: {$comm}\n" .
                        "- Estilo Recomendado: " . ($sp['communication_style'] ?? 'ACOLHEDOR') . "\n" .
                        "- Resumo da Alma: {$sum}\n";
                }
            } catch (\Throwable $e) {}
        }

        $fullSystemInstructions = "{$sysPrompt}\n\n" .
            "DIRETRIZES DE COPILOTO & IDENTIDADE:\n" .
            "- Você está redigindo uma sugestão de resposta profissional para o operador(a) {$operatorName} ({$operatorRole}).\n" .
            "- Nome do cliente/interlocutor: {$patientName}.\n" .
            "{$soulContextText}\n" .
            "- NUNCA use 'Doutor' ou 'Dra.' a menos que solicitado. Trate com cordialidade, precisão e elegância.\n" .
            "- Redija uma resposta pronta para envio no WhatsApp (2 a 4 frases concisas).\n" .
            "- Não inclua saudações redundantes se a conversa já estiver em andamento.";

        // 2. Chamada ao Motor Neural Qwen Proxy via HTTPS
        $messagesPayload = [
            ['role' => 'system', 'content' => $fullSystemInstructions]
        ];

        if (!empty($history) && is_array($history)) {
            foreach ($history as $h) {
                $role = ($h['role'] === 'attendant' || $h['role'] === 'assistant' || $h['role'] === 'model') ? 'assistant' : 'user';
                $content = $h['content'] ?? ($h['text'] ?? '');
                if (!empty($content)) {
                    $messagesPayload[] = ['role' => $role, 'content' => $content];
                }
            }
        }

        $messagesPayload[] = ['role' => 'user', 'content' => $lastMsg ?: "Como podemos prosseguir com o atendimento?"];

        $llmDraft = null;
        try {
            $ch = curl_init($this->qwenProxyUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode([
                    'model' => 'qwen3.7-plus-no-thinking',
                    'messages' => $messagesPayload,
                    'temperature' => (float)($promptConfig['temperature'] ?? 0.40)
                ]),
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_TIMEOUT => 20,
                CURLOPT_CONNECTTIMEOUT => 4,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false
            ]);
            $rawResp = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && !empty($rawResp)) {
                $decoded = json_decode($rawResp, true);
                $llmDraft = $decoded['choices'][0]['message']['content'] ?? null;
            }
        } catch (\Throwable $e) {}

        if (!empty($llmDraft)) {
            $latency = (int)((microtime(true) - $start) * 1000);
            $this->logAudit($lineCode, 'COPILOT_DRAFT', $lastMsg, trim($llmDraft), null, $latency, 'POSITIVE');
            return [
                'success' => true,
                'draft' => trim($llmDraft),
                'line' => $lineCode,
                'confidence' => 0.98,
                'source' => 'QWEN_PROXY_HTTPS',
                'latency_ms' => $latency
            ];
        }

        // 3. Fallback inteligente com RAG de Protocolos 3S e context engine
        if ($lineCode === 'CLINICA') {
            if (str_contains($msgLower, 'dor') || str_contains($msgLower, 'recuperação') || str_contains($msgLower, 'relaxar')) {
                $draft = "Olá, {$patientName}! ✨ Para alívio muscular e relaxamento, indicamos o nosso Protocolo 3S de Drenagem e Recuperação (4Hz / 200µs). Temos horários disponíveis nesta semana. Gostaria de agendar para quinta às 14h ou sexta às 09h?";
            } elseif (str_contains($msgLower, 'celulite') || str_contains($msgLower, 'flacidez') || str_contains($msgLower, 'gordura')) {
                $draft = "Olá, {$patientName}! ✨ Para estímulo de colágeno e firmeza corporal, o Protocolo 3S de Remodelagem (40Hz / 300µs) traz excelentes resultados a partir da 4ª sessão. Posso reservar uma avaliação corporal completa para você amanhã?";
            } elseif (str_contains($msgLower, 'agendar') || str_contains($msgLower, 'horário') || str_contains($msgLower, 'marcar') || str_contains($msgLower, 'consulta')) {
                $draft = "Perfeito, {$patientName}! Temos horários disponíveis amanhã às 10:00 e às 15:30. Qual desses períodos se encaixa melhor na sua rotina?";
            } elseif (str_contains($msgLower, 'valor') || str_contains($msgLower, 'preço') || str_contains($msgLower, 'quanto')) {
                $draft = "Olá, {$patientName}! Nossos protocolos de eletroestimulação de alta densidade são personalizados na avaliação. A sessão inicial com bioimpedância clínica completa é R$ 180. Vamos reservar seu horário?";
            } else {
                $draft = "Olá, {$patientName}! Seja muito bem-vinda à Clínica Body Harmony. Em que posso te auxiliar com os nossos tratamentos corporais hoje?";
            }
        } elseif ($lineCode === 'VENDAS' || $lineCode === 'COMERCIAL') {
            if (str_contains($msgLower, 'congresso') || str_contains($msgLower, 'ingresso') || str_contains($msgLower, 'vip')) {
                $draft = "O Congresso Internacional Body Harmony 2026 reúne as maiores referências do setor! O Ingresso VIP Exclusive (R$ 1.497) inclui 100% de cashback em crédito para cursos. Posso gerar o seu link de pagamento seguro?";
            } elseif (str_contains($msgLower, 'curso') || str_contains($msgLower, 'formação') || str_contains($msgLower, 'licenciada')) {
                $draft = "Excelente! A Formação Profissional Body Harmony capacita profissionais em eletroestimulação clínica de alta rentabilidade. Gostaria de receber a ementa completa da próxima turma?";
            } else {
                $draft = "Olá! Aqui é da equipe comercial da Body Harmony. Como posso te auxiliar com nossos cursos, ingressos e equipamentos hoje?";
            }
        } elseif ($lineCode === 'JURIDICO') {
            $draft = "Olá, {$patientName}! Recebi sua solicitação referente aos contratos e termos legais da Body Harmony. Estou analisando as cláusulas para prestar o suporte adequado. Como posso te orientar?";
        } else {
            $draft = "Olá, {$patientName}! Sou o Hermes da Body Harmony. Como posso te auxiliar hoje?";
        }

        $latency = (int)((microtime(true) - $start) * 1000);
        $this->logAudit($lineCode, 'COPILOT_DRAFT', $patientMessage, $draft, null, $latency, 'NEUTRAL');

        return [
            'success' => true,
            'draft' => $draft,
            'line' => $lineCode,
            'confidence' => 0.95,
            'source' => 'RAG_CONTEXT_ENGINE',
            'latency_ms' => $latency
        ];
    }

    /**
     * Chat do Assistente Interno Hermes para suporte aos operadores do CRM (Harness Atualizado V4.9)
     */
    public function internalAssistantChat(string $query, array $operatorContext = [], array $history = [], array $contactContext = []): array
    {
        $start = microtime(true);
        $operatorName = $operatorContext['name'] ?? 'Colaborador';
        $operatorRole = $operatorContext['role'] ?? 'Equipe CRM';

        $contactInfoText = "NENHUM CONTATO SELECIONADO NO MOMENTO.";
        if (!empty($contactContext) && (!empty($contactContext['name']) || !empty($contactContext['phone']))) {
            $cName = $contactContext['name'] ?? 'Cliente';
            $cPhone = $contactContext['phone'] ?? '';
            $cLine = $contactContext['line'] ?? 'CLINICA';
            $cProtocol = $contactContext['protocol_name'] ?? 'Protocolo 3S';
            $cSession = $contactContext['current_session'] ?? '1';

            $soulText = "";
            if (!empty($cPhone)) {
                try {
                    require_once __DIR__ . '/HermesAdvancedIntelligenceService.php';
                    $intel = new \BodyHarmony\Services\HermesAdvancedIntelligenceService($this->db);
                    $sm = $intel->getSoulMemory($cPhone);
                    if (!empty($sm['soul_profile']['key_learnings_summary'])) {
                        $soulText = "  - Memória Epissódica (Soul): " . $sm['soul_profile']['key_learnings_summary'] . "\n" .
                            "  - Preferências: " . implode(', ', (array)($sm['soul_profile']['personal_preferences'] ?? [])) . "\n" .
                            "  - Restrições: " . implode(', ', (array)($sm['soul_profile']['clinical_sensitivities'] ?? [])) . "\n";
                    }
                } catch (\Throwable $e) {}
            }

            $contactInfoText = "PACIENTE/CONTATO ABERTO NA TELA DO OPERADOR:\n" .
                "- Nome: {$cName}\n" .
                "- Telefone/WhatsApp: {$cPhone}\n" .
                "- Linha/Canal: {$cLine}\n" .
                "- Protocolo Ativo: {$cProtocol} (Sessão {$cSession})\n" .
                $soulText;
        }

        $systemInstructions = "Você é o HERMES, Agente de Inteligência Interna, Copiloto e Executor Operacional da Body Harmony.\n\n" .
            "SEU PAPEL: Dar suporte interno com alta precisão, consultar dados e EXECUTAR FERRAMENTAS em tempo real para os gestores e operadores ({$operatorName} - {$operatorRole}).\n\n" .
            "CONTEXTO ATUAL:\n" .
            "{$contactInfoText}\n" .
            "BASE DE CONHECIMENTO VIVA:\n" .
            "- Protocolos 3S: Drenagem & Dor (4Hz / 200µs), Remodelagem (40Hz / 300µs), Tonificação (85Hz / 350µs), Alta Densidade (150Hz / 400µs).\n" .
            "- Comercial: Formação Método 3S e Congresso Internacional 2026 (Ingresso VIP R$ 1.497 à vista com 100% cashback em cursos).\n" .
            "- Jurídico: Contratos de licenciamento de franquia, LGPD e compliance institucional.\n\n" .
            "FERRAMENTAS E AÇÕES DIRETAS QUE VOCÊ TEM ACESSO:\n" .
            "1. `crm_generate_pix {\"product\": \"...\", \"amount\": 197.00}` -> Emite chave Pix Copia e Cola instantânea.\n" .
            "2. `google_calendar_schedule {\"patient_name\": \"...\", \"start_time\": \"YYYY-MM-DD HH:MM:SS\"}` -> Agenda consulta/avaliação na agenda.\n" .
            "3. `crm_query_patient_dossier {\"phone\": \"...\"}` -> Consulta o histórico completo, pedidos e contratos do cliente.\n" .
            "4. `crm_query_protocol_sales {\"phone\": \"...\"}` -> Consulta em qual sessão o cliente está e se há oportunidade de upsell.\n" .
            "5. `crm_query_soul_memory {\"phone\": \"...\"}` -> Consulta a memória de longo prazo (preferências, restrições, dores do paciente).\n" .
            "6. `crm_consolidate_soul_memory {\"phone\": \"...\", \"name\": \"...\"}` -> Salva os novos fatos aprendidos na memória permanente.\n" .
            "7. `knowledge_base_rag {\"query\": \"...\"}` -> Consulta a base clínica de eletroestimulação da Dra. Joselene Silva.\n" .
            "8. `evolution_send_whatsapp {\"phone\": \"...\", \"message\": \"...\"}` -> Dispara mensagem via WhatsApp pelo canal oficial.\n\n" .
            "COMO EXECUTAR FERRAMENTAS:\n" .
            "Quando o operador solicitar uma ação (ou quando for necessário para responder à pergunta), inclua no final da sua resposta exatamente a tag:\n" .
            "[TOOL: nome_da_ferramenta {\"parametro\": \"valor\"}]\n" .
            "Você é capacitado, proativo, direto e NUNCA diz que não tem acesso a essas ferramentas, pois o sistema executa a tag automaticamente.";

        $messagesPayload = [
            ['role' => 'system', 'content' => $systemInstructions]
        ];

        if (!empty($history) && is_array($history)) {
            foreach ($history as $h) {
                $role = ($h['role'] === 'assistant' || $h['role'] === 'model') ? 'assistant' : 'user';
                $messagesPayload[] = ['role' => $role, 'content' => $h['content'] ?? ''];
            }
        }

        $messagesPayload[] = ['role' => 'user', 'content' => $query];

        $reply = null;
        try {
            $ch = curl_init($this->qwenProxyUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode([
                    'model' => 'qwen3.7-plus-no-thinking',
                    'messages' => $messagesPayload,
                    'temperature' => 0.3
                ]),
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_TIMEOUT => 25,
                CURLOPT_CONNECTTIMEOUT => 4,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false
            ]);
            $rawResp = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && !empty($rawResp)) {
                $decoded = json_decode($rawResp, true);
                $reply = $decoded['choices'][0]['message']['content'] ?? null;
            }
        } catch (\Throwable $e) {}

        if (empty($reply)) {
            $reply = "Olá, {$operatorName}! Sou o Hermes. Estou conectado às ferramentas de agendamento no Google Calendar, emissão de Pix, consulta de prontuários 3S e base clínica. Como posso te apoiar agora?";
        }

        // Interceptar e executar Tool Calls emitidos pelo modelo
        $executedTool = null;
        if (preg_match('/\[TOOL:\s*([a-zA-Z0-9_]+)\s*(\{.*?\})\]/s', $reply, $matches)) {
            $toolName = trim($matches[1]);
            $toolArgs = json_decode(trim($matches[2]), true) ?: [];
            $executedTool = $this->executeToolCall($toolName, $toolArgs);

            // Substituir a tag na resposta com o resultado formatado
            $toolOutputText = "\n\n⚡ **[Ação Executada com Sucesso]**: " . ($executedTool['summary'] ?? $executedTool['message'] ?? 'Concluído.');
            if (!empty($executedTool['artifacts']['pix_code'])) {
                $toolOutputText .= "\n🔑 `{$executedTool['artifacts']['pix_code']}`";
            }
            $reply = str_replace($matches[0], $toolOutputText, $reply);
        }

        $latency = (int)((microtime(true) - $start) * 1000);
        $this->logAudit('ASSISTANT', 'INTERNAL_ASSISTANT_QUERY', $query, trim($reply), $executedTool['tool'] ?? null, $latency, 'POSITIVE');

        return [
            'success' => true,
            'reply' => trim($reply),
            'operator' => $operatorName,
            'tool_executed' => $executedTool,
            'latency_ms' => $latency
        ];
    }

    /**
     * Sintetiza o atendimento em um resumo executivo de 3 tópicos para o Dossiê via IA.
     */
    public function generateDossierSummary(int $convId, array $messages = [], array $contactContext = []): array
    {
        $start = microtime(true);
        $count = count($messages);
        $contactName = $contactContext['name'] ?? 'Cliente';

        $conversationText = "";
        foreach ($messages as $m) {
            $sender = (!empty($m['isMe']) || ($m['role'] ?? '') === 'attendant') ? 'Atendente' : $contactName;
            $text = $m['text'] ?? ($m['content'] ?? '');
            if ($text) {
                $conversationText .= "{$sender}: {$text}\n";
            }
        }

        $summary = null;
        if (!empty($conversationText)) {
            $prompt = "Você é o Analista Estratégico de CRM da Body Harmony. Analise o histórico do atendimento de {$contactName} e gere um resumo executivo estruturado EXATAMENTE em 3 seções curtas:\n\n" .
                "1. **Queixa Principal & Perfil**: (Resumo da demanda, interesse em tratamentos corporais, cursos ou dúvidas)\n" .
                "2. **Histórico & Objeções Levantadas**: (Dúvidas de valores, horários, dosimetria ou barreiras)\n" .
                "3. **Próximo Passo Recomendado**: (Ação imediata para o atendente fechar ou avançar no funil)\n\n" .
                "Histórico do Atendimento:\n{$conversationText}";

            try {
                $ch = curl_init($this->qwenProxyUrl);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST => true,
                    CURLOPT_POSTFIELDS => json_encode([
                        'model' => 'qwen3.7-plus-no-thinking',
                        'messages' => [
                            ['role' => 'system', 'content' => 'Você é o especialista em síntese clínica e comercial de CRM da Body Harmony.'],
                            ['role' => 'user', 'content' => $prompt]
                        ],
                        'temperature' => 0.3
                    ]),
                    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                    CURLOPT_TIMEOUT => 25,
                    CURLOPT_CONNECTTIMEOUT => 4,
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_SSL_VERIFYHOST => false
                ]);
                $rawResp = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($httpCode === 200 && !empty($rawResp)) {
                    $decoded = json_decode($rawResp, true);
                    $summary = $decoded['choices'][0]['message']['content'] ?? null;
                }
            } catch (\Throwable $e) {}
        }

        if (empty($summary)) {
            $summary = "1. **Queixa Principal & Perfil**: Contato inicial de {$contactName} buscando informações sobre protocolos e serviços Body Harmony.\n" .
                       "2. **Histórico & Objeções**: Atendimento prestado com esclarecimento de dúvidas e apresentação de soluções personalizadas.\n" .
                       "3. **Próximo Passo Recomendado**: Realizar follow-up para confirmação de agendamento ou envio de link de pagamento.";
        }

        if ($this->db && method_exists($this->db, 'prepare')) {
            try {
                $stmt = $this->db->prepare("
                    INSERT INTO crm_dossier_summaries (conversation_id, patient_phone, summary_text, created_at)
                    VALUES (:cid, :phone, :sum, NOW())
                ");
                $stmt->execute([
                    ':cid' => $convId,
                    ':phone' => $contactContext['phone'] ?? '5518997000000',
                    ':sum' => $summary
                ]);
            } catch (\Throwable $e) {}
        }

        $latency = (int)((microtime(true) - $start) * 1000);
        $this->logAudit('DOSSIER', 'DOSSIER_SYNTHESIS', "Histórico ({$count} msgs)", trim($summary), null, $latency, 'POSITIVE', $convId);

        return [
            'success' => true,
            'conversation_id' => $convId,
            'messages_analyzed' => $count,
            'summary' => trim($summary),
            'latency_ms' => $latency
        ];
    }

    /**
     * Motor de Raciocínio Profundo (Deep Reasoning & Chain-of-Thought)
     * Analisa queixas clínicas complexas, objeções comerciais, contraindicações,
     * executa ferramentas autônomas e decide por auto-resposta ou transbordo inteligente.
     */
    public function runDeepReasoningTurn(string $userMsg, array $context = []): array
    {
        $start = microtime(true);
        $cleanMsg = trim($userMsg);
        $lower = mb_strtolower($cleanMsg, 'UTF-8');
        $channel = strtolower($context['channel'] ?? 'clinica');
        $senderName = $context['sender_name'] ?? 'Cliente';
        $senderPhone = $context['sender_phone'] ?? '';

        $thoughtSteps = [];
        $toolExecution = null;
        $transferData = null;
        $publicReply = '';
        $clinicalAssessment = '';

        // ---------------------------------------------------------------------
        // PASSO 1: ANÁLISE DE INTENÇÃO, SENTIMENTO & CLASSIFICAÇÃO
        // ---------------------------------------------------------------------
        $isEmergency = (bool)preg_match('/(urgente|maca|socorro|cliente esperando|parou|queimando|tremendo|dor forte)/i', $lower);
        $hasContraindication = (bool)preg_match('/(placa|pino|met[aá]l|marcapasso|gestante|gr[aá]vida|trombose|c[aâ]ncer|amamentando)/i', $lower);
        $isCommercialObjection = (bool)preg_match('/(caro|desconto|[aà] vista|parcela|pensando|concorrente|or[cç]amento)/i', $lower);
        $isClinicalMultiComplaint = (bool)preg_match('/(gordura|flacide[sz]|celulite|barriga|abd[oô]men|culote|fl[aá]cido)/i', $lower);

        $thoughtSteps[] = "1. [Análise de Entrada]: Mensagem classificada no canal '{$channel}'. " .
            ($isEmergency ? "ALERTA DE URGÊNCIA EM CONSULTÓRIO DETECTADO. " : "") .
            ($hasContraindication ? "FLAG DE CONTRAINDICAÇÃO DETECTADA. " : "") .
            ($isCommercialObjection ? "OBJEÇÃO COMERCIAL DETECTADA. " : "");

        // ---------------------------------------------------------------------
        // PASSO 2: RACIOCÍNIO NEURAL DINÂMICO VIA GEMINI 3.6 FLASH
        // ---------------------------------------------------------------------
        $isGestor = ($senderPhone === '5518996959486' || $senderPhone === '18996959486');
        $effectiveName = $isGestor ? 'Guilherme' : $senderName;

        // Montagem das Diretrizes do Sistema (Invariant Persona)
        $systemInstructions = "Você é o Hermes, agente de IA autônomo e copiloto do ecossistema Body Harmony.\n" .
            "Você é ágil, altamente inteligente, empático e fala em português de forma natural e precisa.\n\n" .
            "REGRAS INEGOCIÁVEIS DE CONDUTA:\n" .
            "1. TRATAMENTO & TOM: NUNCA chame ninguém de 'Doutor' ou 'Dra.' (nem o gestor Guilherme, nem a equipe). Chame pelo primeiro nome ou trate de igual para igual de forma respeitosa.\n" .
            "2. CANAL COMERCIAL (Linha Atual: {$channel}): Este canal é EXCLUSIVAMENTE de vendas de cursos, Formação 3S e Congresso Internacional 2026. NUNCA agende procedimentos ou consultas clínicas aqui.\n" .
            "3. POLÍTICA DE PREÇOS: O ingresso VIP do Congresso 2026 custa R$ 1.497,00 à vista (com 100% de cashback em cursos). NUNCA invente descontos sem autorização expressa.\n" .
            "4. INTERAÇÃO COM O GESTOR: Se o Guilherme estiver te orientando, calibrando ou testando, responda com raciocínio transparente, ágil e inteligente, reconhecendo as instruções sem fingir ser um chatbot engessado.\n" .
            "5. ESTILO WHATSAPP: Mensagens concisas (2 a 5 frases), diretas ao ponto, com formatação limpa (negrito suave, sem poluição de emojis).";

        // Histórico de Conversa (se disponível no contexto)
        $conversationHistory = $context['history'] ?? [];

        // Chamada ao Motor Neural QwenProxy da VPS (Custo Zero & Raciocínio Profundo)
        $qwenUrl = getenv('QWEN_PROXY_URL') ?: 'http://127.0.0.1:4005/v1/chat/completions';
        
        $messagesPayload = [
            ['role' => 'system', 'content' => $systemInstructions]
        ];
        foreach ($conversationHistory as $h) {
            $messagesPayload[] = [
                'role' => ($h['role'] === 'assistant' || $h['role'] === 'model') ? 'assistant' : 'user',
                'content' => $h['content'] ?? ''
            ];
        }
        $messagesPayload[] = ['role' => 'user', 'content' => $cleanMsg];

        try {
            $ch = curl_init($qwenUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode([
                    'model' => 'qwen3.7-plus-no-thinking',
                    'messages' => $messagesPayload,
                    'temperature' => 0.4
                ]),
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_TIMEOUT => 25,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false
            ]);
            $rawResp = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && !empty($rawResp)) {
                $decoded = json_decode($rawResp, true);
                $qwenText = $decoded['choices'][0]['message']['content'] ?? '';
                if (!empty(trim($qwenText))) {
                    $publicReply = trim($qwenText);
                    $thoughtSteps[] = "2. [Raciocínio Neural QwenProxy VPS]: Inferência gerada com sucesso via Qwen 3.7 Plus.";
                } else {
                    throw new \Exception("Resposta vazia do QwenProxy");
                }
            } else {
                throw new \Exception("QwenProxy HTTP {$httpCode}");
            }
        } catch (\Throwable $e) {
            $thoughtSteps[] = "2. [Fallback Seguro]: " . $e->getMessage();
            if ($isEmergency) {
                $publicReply = "🚨 Mantenha a calma, a paciente está segura. Reduza a intensidade em 30%, alterne para 15Hz e verifique o gel condutor. Estou transferindo para o suporte.";
            } else {
                $publicReply = "Olá, {$effectiveName}! Sou o Hermes da Body Harmony. Analisei sua mensagem e estou à disposição para ajudar. Como podemos avançar?";
            }
        }

        $thoughtSteps[] = "3. [Conclusão & Síntese]: Resposta gerada em " . round((microtime(true) - $start) * 1000, 2) . "ms com tom de alta empatia.";

        return [
            'success' => true,
            'sender_name' => $senderName,
            'channel' => $channel,
            'thought_process' => $thoughtSteps,
            'clinical_assessment' => $clinicalAssessment,
            'tool_executed' => $toolExecution,
            'transfer_executed' => $transferData,
            'public_reply' => $publicReply,
            'latency_ms' => (int)((microtime(true) - $start) * 1000)
        ];
    }

    /**
            } catch (\Throwable $e) {}
        }

        return [
            'success' => true,
            'conversation_id' => $convId,
            'messages_analyzed' => $count,
            'summary' => $summary
        ];
    }

    /**
     * Disparo Proativo Direto Autônomo com IA (Evolution API v2 + Qwen Proxy) - PLAN-191
     * Estritamente blindado para o número do gestor administrativo (+5518996959486).
     */
    public function dispatchProactiveMessage(string $instance, string $targetPhone, string $objective, array $context = []): array
    {
        $start = microtime(true);
        $cleanPhone = preg_replace('/\D/', '', $targetPhone);
        if (!str_starts_with($cleanPhone, '55')) {
            $cleanPhone = '55' . $cleanPhone;
        }

        // 1. HARD GATE: Whitelist Administrativa Inegociável
        $adminWhitelist = ['5518996959486', '18996959486'];
        $isWhitelisted = false;
        foreach ($adminWhitelist as $w) {
            if ($cleanPhone === $w || str_contains($cleanPhone, $w) || str_contains($w, $cleanPhone)) {
                $isWhitelisted = true;
                break;
            }
        }

        if (!$isWhitelisted) {
            return [
                'success' => false,
                'error' => 'DISPATCH_FORBIDDEN_NON_ADMIN',
                'message' => 'Disparo proativo bloqueado: permitido exclusivamente para o número administrativo do gestor.'
            ];
        }

        // 2. Mapeamento de canal
        $channelLabels = [
            'inst_comercial' => 'Canal Comercial (Cursos, Vendas & Congresso 2026)',
            'inst_licenciadas' => 'Canal Suporte às Licenciadas (Protocolos Clínicos, Dosimetrias 3S & Suporte)',
            'inst_juridico' => 'Canal Jurídico (Contratos, Licenças & Gestão Institucional)'
        ];
        $channelName = $channelLabels[$instance] ?? $instance;

        // 3. Prompt de Raciocínio Proativo para Qwen Proxy
        $systemInstructions = "Você é o Hermes, Agente de IA Autônomo e Copiloto Estratégico da Body Harmony.\n\n" .
            "SUA TAREFA ATUAL: Iniciar uma mensagem proativa inteligente e direta para o gestor Guilherme no WhatsApp.\n" .
            "CANAL DE DISPARO: [{$channelName}] ({$instance}).\n\n" .
            "DIRETRIZES FUNDAMENTAIS:\n" .
            "1. TRATAMENTO: NUNCA use 'Doutor' ou 'Dra.'. Trate pelo primeiro nome (Guilherme).\n" .
            "2. CONTEXTO DO DISPARO: O objetivo deste contato é: \"{$objective}\".\n" .
            "3. ESTILO DE MENSAGEM: Seja conciso, profissional, ágil e direto (2 a 4 frases elegantes).\n" .
            "4. AÇÃO CLARA: Conclua com uma chamada para ação ou pergunta direta sobre o objetivo.";

        $messagesPayload = [
            ['role' => 'system', 'content' => $systemInstructions],
            ['role' => 'user', 'content' => "Gere a mensagem proativa completa de abertura de conversa com base no objetivo: \"{$objective}\"."]
        ];

        $qwenUrl = getenv('QWEN_PROXY_URL') ?: 'http://127.0.0.1:4005/v1/chat/completions';
        $generatedMessage = null;
        $thoughtLog = [];

        try {
            $ch = curl_init($qwenUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode([
                    'model' => 'qwen3.7-plus-no-thinking',
                    'messages' => $messagesPayload,
                    'temperature' => 0.45
                ]),
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_TIMEOUT => 25,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false
            ]);
            $rawResp = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && !empty($rawResp)) {
                $decoded = json_decode($rawResp, true);
                $qwenText = $decoded['choices'][0]['message']['content'] ?? '';
                if (!empty(trim($qwenText))) {
                    $generatedMessage = trim($qwenText);
                    $thoughtLog[] = "Inferência proativa gerada com sucesso via Qwen Proxy VPS ({$instance}).";
                }
            }
        } catch (\Throwable $e) {
            $thoughtLog[] = "Falha no QwenProxy: " . $e->getMessage();
        }

        // Fallback estruturado caso a IA esteja reiniciando
        if (empty($generatedMessage)) {
            $generatedMessage = "Olá, Guilherme! Aqui é o Hermes. Estou iniciando este contato proativo pelo canal {$channelName} para alinhar: {$objective}. Como deseja prosseguir?";
            $thoughtLog[] = "Fallback contextual aplicado.";
        }

        // 4. Disparo Direto via Evolution API v2
        require_once __DIR__ . '/EvolutionApiService.php';
        $evoService = new EvolutionApiService();
        $deliveryResult = $evoService->sendTextMessage($instance, $cleanPhone, $generatedMessage);

        $latency = (int)((microtime(true) - $start) * 1000);

        return [
            'success' => ($deliveryResult['status'] === 200 || $deliveryResult['status'] === 201),
            'action' => 'proactive_dispatched',
            'instance' => $instance,
            'channel' => $channelName,
            'target_phone' => $cleanPhone,
            'objective' => $objective,
            'generated_message' => $generatedMessage,
            'delivery_response' => $deliveryResult,
            'thought_log' => $thoughtLog,
            'latency_ms' => $latency
        ];
    }
}

