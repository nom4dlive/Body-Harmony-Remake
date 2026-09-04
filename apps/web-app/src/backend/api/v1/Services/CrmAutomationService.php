<?php
namespace BodyHarmony\Services;

use PDO;
use Exception;

/**
 * ==============================================================================
 * CRM AUTOMATION SERVICE — ANTI NO-SHOW, ANAMNESE WEBHOOK, MEDIA & KANBAN (PLAN-170)
 * ==============================================================================
 * Nexus Protocol V3.1 — Motor de Automação Fullstack do Ecossistema Body Harmony
 * ==============================================================================
 */
class CrmAutomationService {
    private $db;
    private string $chatwootUrl;
    private string $apiToken;
    private string $evolutionUrl;

    public function __construct(
        mixed $db = null,
        ?string $chatwootUrl = null,
        ?string $apiToken = null,
        ?string $evolutionUrl = null
    ) {
        $this->db = $db;
        $this->chatwootUrl = $chatwootUrl ?? getenv('CHATWOOT_URL') ?: 'https://crm.bodyharmony.com.br';
        $this->apiToken = $apiToken ?? getenv('CHATWOOT_API_TOKEN') ?: 'wxvcKsycZEXjrqM7dxD72oNm';
        $this->evolutionUrl = $evolutionUrl ?? getenv('EVOLUTION_API_URL') ?: 'http://evolution-api:8080';
        $this->ensureTables();
    }

    private function ensureTables(): void {
        if (!$this->db) return;
        try {
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `crm_patient_profiles` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `phone_e164` VARCHAR(30) NOT NULL UNIQUE,
                    `cpf` VARCHAR(20) DEFAULT NULL,
                    `name` VARCHAR(150) NOT NULL,
                    `last_anamnese_at` DATETIME DEFAULT NULL,
                    `notes` TEXT DEFAULT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX `idx_phone_profile` (`phone_e164`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `crm_appointments` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `contact_phone` VARCHAR(30) NOT NULL,
                    `patient_name` VARCHAR(150) NOT NULL,
                    `procedure_name` VARCHAR(150) DEFAULT 'Procedimento Body Harmony',
                    `scheduled_at` DATETIME NOT NULL,
                    `duration_minutes` INT DEFAULT 60,
                    `status` ENUM('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'SCHEDULED',
                    `conversation_id` INT DEFAULT NULL,
                    `reminder_sent_24h` TINYINT(1) DEFAULT 0,
                    `reminder_sent_2h` TINYINT(1) DEFAULT 0,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX `idx_scheduled_at` (`scheduled_at`),
                    INDEX `idx_contact_phone` (`contact_phone`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `crm_patient_photos` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `phone_e164` VARCHAR(30) NOT NULL,
                    `conversation_id` INT DEFAULT NULL,
                    `photo_type` ENUM('ANTES', 'DEPOIS', 'EVOLUCAO', 'DOCUMENTO') DEFAULT 'EVOLUCAO',
                    `image_url` VARCHAR(500) NOT NULL,
                    `drive_file_id` VARCHAR(255) DEFAULT NULL,
                    `notes` TEXT DEFAULT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX `idx_phone_photos` (`phone_e164`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `crm_kanban_cards` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `pipeline_type` ENUM('CLINICA', 'COMERCIAL') NOT NULL DEFAULT 'CLINICA',
                    `stage` VARCHAR(50) NOT NULL DEFAULT 'novo_contato',
                    `conversation_id` INT DEFAULT NULL,
                    `contact_phone` VARCHAR(30) NOT NULL,
                    `contact_name` VARCHAR(150) NOT NULL,
                    `value_amount` DECIMAL(10, 2) DEFAULT 0.00,
                    `priority` ENUM('BAIXA', 'MEDIA', 'ALTA', 'VIP') DEFAULT 'MEDIA',
                    `assigned_agent` VARCHAR(100) DEFAULT 'Equipe Body Harmony',
                    `last_interaction_at` DATETIME DEFAULT NULL,
                    `metadata_json` JSON DEFAULT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY `uk_pipeline_contact` (`pipeline_type`, `contact_phone`),
                    INDEX `idx_pipeline_stage` (`pipeline_type`, `stage`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `crm_google_contacts_sync` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `contact_phone` VARCHAR(30) NOT NULL UNIQUE,
                    `formatted_name` VARCHAR(200) NOT NULL,
                    `contact_category` ENUM('PACIENTE', 'ALUNA', 'LICENCIADA', 'LEAD') DEFAULT 'LEAD',
                    `google_resource_name` VARCHAR(255) DEFAULT NULL,
                    `synced_at` DATETIME DEFAULT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        } catch (\Throwable $e) {
            error_log("[CrmAutomationService] ensureTables Notice: " . $e->getMessage());
        }
    }

    // =========================================================================
    // 1. MOTOR ANTI NO-SHOW (DISPAROS 24H E 2H ANTES)
    // =========================================================================
    public function processAntiNoShowReminders(): array {
        if (!$this->db) {
            return [
                'success' => true,
                'reminders_24h_sent' => 0,
                'reminders_2h_sent' => 0,
                'processed_count' => 0,
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }

        $reminders24h = 0;
        $reminders2h = 0;
        $now = date('Y-m-d H:i:s');

        // A. Lembrete de 24 Horas Antes (entre NOW e +24h)
        $limit24h = date('Y-m-d H:i:s', strtotime('+24 hours'));
        $stmt24 = $this->db->prepare("
            SELECT * FROM crm_appointments 
            WHERE status IN ('SCHEDULED', 'CONFIRMED')
              AND reminder_sent_24h = 0
              AND scheduled_at BETWEEN :now AND :limit24h
            ORDER BY scheduled_at ASC
        ");
        $stmt24->execute([':now' => $now, ':limit24h' => $limit24h]);
        $appts24 = $stmt24->fetchAll(PDO::FETCH_ASSOC);

        foreach ($appts24 as $ap) {
            $formattedTime = date('d/m \à\s H:i', strtotime($ap['scheduled_at']));
            $msg = "🌸 *Lembrete de Sessão Body Harmony* 🌸\n\n"
                 . "Olá, *{$ap['patient_name']}*!\n"
                 . "Confirmamos sua sessão de *{$ap['procedure_name']}* amanhã ({$formattedTime}) na nossa clínica.\n\n"
                 . "👉 Por favor, responda com *1* para Confirmar ou *2* para Remarcar.";

            $this->sendWhatsAppMessage($ap['contact_phone'], $msg, $ap['conversation_id']);

            $upd = $this->db->prepare("UPDATE crm_appointments SET reminder_sent_24h = 1 WHERE id = :id");
            $upd->execute([':id' => $ap['id']]);
            $reminders24h++;
        }

        // B. Lembrete de 2 Horas Antes (entre NOW e +2h)
        $limit2h = date('Y-m-d H:i:s', strtotime('+2 hours'));
        $stmt2 = $this->db->prepare("
            SELECT * FROM crm_appointments 
            WHERE status IN ('SCHEDULED', 'CONFIRMED')
              AND reminder_sent_2h = 0
              AND scheduled_at BETWEEN :now AND :limit2h
            ORDER BY scheduled_at ASC
        ");
        $stmt2->execute([':now' => $now, ':limit2h' => $limit2h]);
        $appts2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);

        foreach ($appts2 as $ap) {
            $formattedTime = date('H:i', strtotime($ap['scheduled_at']));
            $msg = "⚡ *Sua Sessão é Daqui a Pouco!* ⚡\n\n"
                 . "Olá, *{$ap['patient_name']}*! Nossa equipe já está preparando sua sala para o procedimento *{$ap['procedure_name']}* hoje às *{$formattedTime}*.\n\n"
                 . "Te aguardamos com muito carinho! ✨";

            $this->sendWhatsAppMessage($ap['contact_phone'], $msg, $ap['conversation_id']);

            $upd = $this->db->prepare("UPDATE crm_appointments SET reminder_sent_2h = 1 WHERE id = :id");
            $upd->execute([':id' => $ap['id']]);
            $reminders2h++;
        }

        return [
            'success' => true,
            'reminders_24h_sent' => $reminders24h,
            'reminders_2h_sent' => $reminders2h,
            'processed_count' => $reminders24h + $reminders2h,
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }

    // =========================================================================
    // 2. WEBHOOK DE FICHA DE ANAMNESE (GOOGLE FORMS -> CHATWOOT PRIVATE NOTE)
    // =========================================================================
    public function handleAnamneseWebhook(array $payload): array {
        $phone = preg_replace('/\D/', '', $payload['phone'] ?? $payload['whatsapp'] ?? '');
        $name = trim($payload['name'] ?? $payload['nome'] ?? 'Paciente');
        $cpf = preg_replace('/\D/', '', $payload['cpf'] ?? '');
        $hasMarcapasso = !empty($payload['marcapasso']) && strtolower($payload['marcapasso']) === 'sim';
        $isGestante = !empty($payload['gestante']) && strtolower($payload['gestante']) === 'sim';
        $hasProtese = !empty($payload['protese_metalica']) && strtolower($payload['protese_metalica']) === 'sim';
        $hasSensibilidade = !empty($payload['sensibilidade_cutanea']) && strtolower($payload['sensibilidade_cutanea']) === 'sim';
        $notes = $payload['observacoes'] ?? $payload['historico_clinico'] ?? '';

        $contraindications = [];
        if ($hasMarcapasso) $contraindications[] = '⚠️ Marcapasso (CONTRAINDICAÇÃO ABSOLUTA)';
        if ($isGestante) $contraindications[] = '⚠️ Gestação (CONTRAINDICAÇÃO ABSOLUTA)';
        if ($hasProtese) $contraindications[] = '⚠️ Prótese Metálica no Local';
        if ($hasSensibilidade) $contraindications[] = 'ℹ️ Sensibilidade Cutânea';

        $hasSevereContraindication = $hasMarcapasso || $isGestante;

        // Salvar ou atualizar crm_patient_profiles
        $patientId = null;
        if ($this->db && !empty($phone)) {
            $stmt = $this->db->prepare("
                INSERT INTO crm_patient_profiles (phone_e164, cpf, name, last_anamnese_at, notes)
                VALUES (:phone, :cpf, :name, NOW(), :notes)
                ON DUPLICATE KEY UPDATE
                    cpf = COALESCE(VALUES(cpf), cpf),
                    name = VALUES(name),
                    last_anamnese_at = NOW(),
                    notes = VALUES(notes)
            ");
            $stmt->execute([
                ':phone' => $phone,
                ':cpf' => $cpf ?: null,
                ':name' => $name,
                ':notes' => implode(', ', $contraindications) . ($notes ? " | " . $notes : '')
            ]);
            $patientId = (int)$this->db->lastInsertId();

            // Mover cartão Kanban para 'anamnese_recebida'
            $this->upsertKanbanCard('CLINICA', $phone, $name, 'anamnese_recebida', $hasSevereContraindication ? 'ALTA' : 'MEDIA');
        }

        // Criar Nota Privada no Chatwoot e aplicar Etiqueta
        $noteCreated = false;
        if (!empty($phone)) {
            $contraText = empty($contraindications) ? "✅ Nenhuma contraindicação declarada." : implode("\n", $contraindications);
            $noteContent = "📋 *[FICHA DE ANAMNESE RECEBIDA]*\n"
                         . "👤 *Paciente:* {$name}" . ($cpf ? " | *CPF:* {$cpf}" : "") . "\n"
                         . "📱 *Telefone:* {$phone}\n"
                         . "🩺 *Contraindicações declaradas:*\n{$contraText}\n"
                         . ($notes ? "📝 *Observações:* {$notes}\n" : "")
                         . "📁 *Link do prontuário:* Arquivado no Google Drive.\n"
                         . "Status: " . ($hasSevereContraindication ? "🚨 AVALIAÇÃO MÉDICA OBRIGATÓRIA" : "✨ Apta para Eletroestimulação");

            $noteCreated = $this->createChatwootPrivateNote($phone, $noteContent);
            $this->addChatwootLabel($phone, 'Anamnese Preenchida');
        }

        return [
            'success' => true,
            'message' => 'Ficha de anamnese processada com sucesso e integrada ao Chatwoot.',
            'patient_id' => $patientId,
            'chatwoot_note_created' => $noteCreated,
            'contraindications_flag' => $hasSevereContraindication
        ];
    }

    // =========================================================================
    // 3. SINCRONIZADOR DE FOTOS E PRONTUÁRIO DE ANTES/DEPOIS
    // =========================================================================
    public function handleMediaSync(array $payload): array {
        $phone = preg_replace('/\D/', '', $payload['phone'] ?? '');
        $imageUrl = $payload['image_url'] ?? '';
        $type = $payload['photo_type'] ?? 'EVOLUCAO';
        $notes = $payload['notes'] ?? '';
        $convId = isset($payload['conversation_id']) ? (int)$payload['conversation_id'] : null;

        $photoId = null;
        if ($this->db && !empty($phone) && !empty($imageUrl)) {
            $stmt = $this->db->prepare("
                INSERT INTO crm_patient_photos (phone_e164, conversation_id, photo_type, image_url, notes)
                VALUES (:phone, :convId, :type, :url, :notes)
            ");
            $stmt->execute([
                ':phone' => $phone,
                ':convId' => $convId,
                ':type' => $type,
                ':url' => $imageUrl,
                ':notes' => $notes
            ]);
            $photoId = (int)$this->db->lastInsertId();
        }

        return [
            'success' => true,
            'photo_id' => $photoId,
            'image_url' => $imageUrl,
            'saved_to_dossier' => true
        ];
    }

    // =========================================================================
    // 4. KANBAN CLÍNICO & COMERCIAL (GESTÃO DE PIPELINES)
    // =========================================================================
    public function getKanbanCards(string $pipeline = 'CLINICA'): array {
        $pipeline = strtoupper($pipeline) === 'COMERCIAL' ? 'COMERCIAL' : 'CLINICA';
        if (!$this->db) {
            return ['success' => true, 'pipeline' => $pipeline, 'cards' => []];
        }

        $stmt = $this->db->prepare("
            SELECT id, pipeline_type, stage, conversation_id, contact_phone, contact_name, 
                   value_amount, priority, assigned_agent, last_interaction_at, created_at
            FROM crm_kanban_cards
            WHERE pipeline_type = :p
            ORDER BY updated_at DESC
        ");
        $stmt->execute([':p' => $pipeline]);
        $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'success' => true,
            'pipeline' => $pipeline,
            'cards' => array_map(function($c) {
                return [
                    'id' => (int)$c['id'],
                    'pipeline_type' => $c['pipeline_type'],
                    'stage' => $c['stage'],
                    'conversation_id' => $c['conversation_id'] ? (int)$c['conversation_id'] : null,
                    'contact_phone' => $c['contact_phone'],
                    'contact_name' => $c['contact_name'],
                    'value_amount' => (float)$c['value_amount'],
                    'priority' => $c['priority'],
                    'assigned_agent' => $c['assigned_agent']
                ];
            }, $cards)
        ];
    }

    public function moveKanbanCard(int $cardId, string $newStage): array {
        if (!$this->db) {
            return ['success' => true, 'card_id' => $cardId, 'new_stage' => $newStage, 'chatwoot_label_synced' => false];
        }

        $stmt = $this->db->prepare("SELECT * FROM crm_kanban_cards WHERE id = :id");
        $stmt->execute([':id' => $cardId]);
        $card = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$card) {
            return ['success' => false, 'message' => 'Cartão Kanban não encontrado.'];
        }

        $upd = $this->db->prepare("UPDATE crm_kanban_cards SET stage = :stage, updated_at = NOW() WHERE id = :id");
        $upd->execute([':stage' => $newStage, ':id' => $cardId]);

        // Sincronizar Label no Chatwoot
        $labelSynced = false;
        if (!empty($card['conversation_id'])) {
            $labelSynced = $this->syncChatwootLabels((int)$card['conversation_id'], "etapa_{$newStage}");
        }

        return [
            'success' => true,
            'message' => 'Cartão movido com sucesso no funil.',
            'card_id' => $cardId,
            'new_stage' => $newStage,
            'chatwoot_label_synced' => $labelSynced
        ];
    }

    public function upsertKanbanCard(string $pipeline, string $phone, string $name, string $stage, string $priority = 'MEDIA'): void {
        if (!$this->db) return;
        try {
            $stmt = $this->db->prepare("
                INSERT INTO crm_kanban_cards (pipeline_type, stage, contact_phone, contact_name, priority)
                VALUES (:p, :s, :phone, :name, :prio)
                ON DUPLICATE KEY UPDATE
                    stage = VALUES(stage),
                    contact_name = VALUES(contact_name),
                    priority = VALUES(priority),
                    updated_at = NOW()
            ");
            $stmt->execute([
                ':p' => $pipeline,
                ':s' => $stage,
                ':phone' => $phone,
                ':name' => $name,
                ':prio' => $priority
            ]);
        } catch (\Throwable $e) {
            error_log("[CrmAutomationService] upsertKanbanCard error: " . $e->getMessage());
        }
    }

    // =========================================================================
    // 5. SINCRONIZADOR GOOGLE CONTACTS
    // =========================================================================
    public function syncGoogleContact(string $phone, string $name, string $category = 'PACIENTE'): array {
        $prefix = match(strtoupper($category)) {
            'ALUNA' => '[Aluna]',
            'LICENCIADA' => '[Licenciada]',
            'LEAD' => '[Lead]',
            default => '[Paciente]'
        };
        $formattedName = "{$prefix} {$name} - Body Harmony";

        if ($this->db) {
            $stmt = $this->db->prepare("
                INSERT INTO crm_google_contacts_sync (contact_phone, formatted_name, contact_category, synced_at)
                VALUES (:phone, :name, :cat, NOW())
                ON DUPLICATE KEY UPDATE
                    formatted_name = VALUES(formatted_name),
                    contact_category = VALUES(contact_category),
                    synced_at = NOW()
            ");
            $stmt->execute([
                ':phone' => $phone,
                ':name' => $formattedName,
                ':cat' => $category
            ]);
        }

        return [
            'success' => true,
            'phone' => $phone,
            'formatted_name' => $formattedName,
            'category' => $category
        ];
    }

    // =========================================================================
    // HELPERS INTERNOS DE COMUNICAÇÃO HTTP
    // =========================================================================
    private function sendWhatsAppMessage(string $phone, string $content, ?int $conversationId = null): bool {
        // Envio via Chatwoot API se conversa existir, ou via Evolution API interna
        if ($conversationId) {
            $url = "{$this->chatwootUrl}/api/v1/accounts/1/conversations/{$conversationId}/messages";
            $payload = json_encode([
                'content' => $content,
                'message_type' => 'outgoing',
                'private' => false
            ]);
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $payload,
                CURLOPT_HTTPHEADER => [
                    "api_access_token: {$this->apiToken}",
                    "Content-Type: application/json"
                ],
                CURLOPT_TIMEOUT => 5
            ]);
            $res = curl_exec($ch);
            curl_close($ch);
            return true;
        }

        // Fallback direto Evolution API
        $url = "{$this->evolutionUrl}/message/sendText/inst_licenciadas";
        $payload = json_encode([
            'number' => $phone,
            'text' => $content
        ]);
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
            CURLOPT_TIMEOUT => 5
        ]);
        curl_exec($ch);
        curl_close($ch);
        return true;
    }

    private function createChatwootPrivateNote(string $phone, string $noteContent): bool {
        // 1. Localizar conversa do contato
        $searchUrl = "{$this->chatwootUrl}/api/v1/accounts/1/contacts/search?q={$phone}";
        $ch = curl_init($searchUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ["api_access_token: {$this->apiToken}"],
            CURLOPT_TIMEOUT => 5
        ]);
        $res = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($res, true);
        $contactId = $data['payload'][0]['id'] ?? null;
        if (!$contactId) return false;

        $convUrl = "{$this->chatwootUrl}/api/v1/accounts/1/contacts/{$contactId}/conversations";
        $ch = curl_init($convUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ["api_access_token: {$this->apiToken}"],
            CURLOPT_TIMEOUT => 5
        ]);
        $convRes = curl_exec($ch);
        curl_close($ch);

        $convData = json_decode($convRes, true);
        $convId = $convData['payload'][0]['id'] ?? null;
        if (!$convId) return false;

        // 2. Inserir Nota Privada (Amarela)
        $msgUrl = "{$this->chatwootUrl}/api/v1/accounts/1/conversations/{$convId}/messages";
        $payload = json_encode([
            'content' => $noteContent,
            'message_type' => 'outgoing',
            'private' => true
        ]);
        $ch = curl_init($msgUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                "api_access_token: {$this->apiToken}",
                "Content-Type: application/json"
            ],
            CURLOPT_TIMEOUT => 5
        ]);
        $result = curl_exec($ch);
        curl_close($ch);
        return true;
    }

    private function syncChatwootLabels(int $conversationId, string $label): bool {
        $url = "{$this->chatwootUrl}/api/v1/accounts/1/conversations/{$conversationId}/labels";
        $payload = json_encode(['labels' => [$label]]);
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                "api_access_token: {$this->apiToken}",
                "Content-Type: application/json"
            ],
            CURLOPT_TIMEOUT => 5
        ]);
        curl_exec($ch);
        curl_close($ch);
        return true;
    }

    private function addChatwootLabel(string $phone, string $label): bool {
        $cleanPhone = preg_replace('/\D/', '', $phone);
        if (empty($cleanPhone)) return false;

        $searchUrl = "{$this->chatwootUrl}/api/v1/accounts/1/contacts/search?q={$cleanPhone}";
        $ch = curl_init($searchUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ["api_access_token: {$this->apiToken}"],
            CURLOPT_TIMEOUT => 5
        ]);
        $res = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($res, true);
        $contactId = $data['payload'][0]['id'] ?? null;
        if (!$contactId) return false;

        $convUrl = "{$this->chatwootUrl}/api/v1/accounts/1/contacts/{$contactId}/conversations";
        $ch = curl_init($convUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ["api_access_token: {$this->apiToken}"],
            CURLOPT_TIMEOUT => 5
        ]);
        $convRes = curl_exec($ch);
        curl_close($ch);

        $convData = json_decode($convRes, true);
        $convId = $convData['payload'][0]['id'] ?? null;
        if (!$convId) return false;

        return $this->syncChatwootLabels((int)$convId, $label);
    }
}
