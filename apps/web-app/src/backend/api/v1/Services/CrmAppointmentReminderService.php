<?php
// apps/web-app/src/backend/api/v1/Services/CrmAppointmentReminderService.php
// Body Harmony Nexus V3.1 — CRM Appointment Reminder & Anti No-Show Engine (PLAN-171)

namespace BodyHarmony\Services;

use PDO;

class CrmAppointmentReminderService {
    private mixed $db;
    private string $chatwootBaseUrl;
    private string $chatwootApiToken;
    private string $evolutionBaseUrl;
    private string $evolutionApiKey;

    public function __construct(
        mixed $db = null,
        ?string $chatwootBaseUrl = null,
        ?string $chatwootApiToken = null,
        ?string $evolutionBaseUrl = null,
        ?string $evolutionApiKey = null
    ) {
        $this->db = $db;
        $this->chatwootBaseUrl = rtrim($chatwootBaseUrl ?? $_ENV['CHATWOOT_BASE_URL'] ?? 'https://crm.bodyharmony.com.br', '/');
        $this->chatwootApiToken = $chatwootApiToken ?? $_ENV['CHATWOOT_API_TOKEN'] ?? 'wxvcKsycZEXjrqM7dxD72oNm';
        $this->evolutionBaseUrl = rtrim($evolutionBaseUrl ?? $_ENV['EVOLUTION_BASE_URL'] ?? 'http://evolution-api:8080', '/');
        $this->evolutionApiKey = $evolutionApiKey ?? $_ENV['EVOLUTION_API_KEY'] ?? 'B6D711FCDE4D4FD5936544120E713976';

        $this->ensureTables();
    }

    private function ensureTables(): void {
        if (!$this->db) return;
        try {
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `crm_appointments` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `contact_phone` VARCHAR(30) NOT NULL,
                    `patient_name` VARCHAR(150) NOT NULL,
                    `procedure_name` VARCHAR(150) DEFAULT 'Procedimento Body Harmony',
                    `scheduled_at` DATETIME NOT NULL,
                    `duration_minutes` INT DEFAULT 60,
                    `status` ENUM('agendado', 'confirmado_24h', 'confirmado_2h', 'remarcar', 'concluido', 'cancelado') DEFAULT 'agendado',
                    `conversation_id` INT DEFAULT NULL,
                    `reminder_sent_24h` TINYINT(1) DEFAULT 0,
                    `reminder_sent_2h` TINYINT(1) DEFAULT 0,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX `idx_scheduled_at` (`scheduled_at`),
                    INDEX `idx_contact_phone` (`contact_phone`),
                    INDEX `idx_status` (`status`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        } catch (\Throwable $e) {
            error_log("[CrmAppointmentReminderService] ensureTables error: " . $e->getMessage());
        }
    }

    public function processReminders(): array {
        $reminders24h = 0;
        $reminders2h = 0;

        if (!$this->db) {
            return [
                'success' => true,
                'reminders_24h_sent' => 0,
                'reminders_2h_sent' => 0,
                'total_processed' => 0,
                'stats' => ['today_total' => 0, 'confirmed' => 0, 'noshow_avoided' => 0]
            ];
        }

        // 1. Disparo 24h Antes (Janela: entre 23h e 25h antes do agendamento)
        $stmt24 = $this->db->prepare("
            SELECT * FROM crm_appointments 
            WHERE status IN ('agendado', 'SCHEDULED')
              AND reminder_sent_24h = 0
              AND scheduled_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 25 HOUR)
              AND scheduled_at >= DATE_ADD(NOW(), INTERVAL 23 HOUR)
        ");
        $stmt24->execute();
        $appts24 = $stmt24->fetchAll(PDO::FETCH_ASSOC);

        foreach ($appts24 as $ap) {
            $formattedDate = date('d/m/Y', strtotime($ap['scheduled_at']));
            $formattedTime = date('H:i', strtotime($ap['scheduled_at']));
            
            $msg = "⚡ *Confirmação de Sessão Body Harmony* ⚡\n\n"
                 . "Olá, *{$ap['patient_name']}*! Sua sessão de *{$ap['procedure_name']}* está agendada para amanhã, *{$formattedDate}* às *{$formattedTime}* na Matriz Body Harmony (Rua Sebastião da Silva Leite, nº 456, Assis/SP).\n\n"
                 . "Por favor, responda:\n"
                 . "*1* para Confirmar sua presença ✅\n"
                 . "*2* para Remarcar seu horário 🔄\n\n"
                 . "_Recomendações: Hidrate-se bem antes do procedimento e venha com roupas confortáveis!_";

            $this->sendWhatsAppMessage($ap['contact_phone'], $msg, $ap['conversation_id']);

            $upd = $this->db->prepare("UPDATE crm_appointments SET reminder_sent_24h = 1 WHERE id = :id");
            $upd->execute([':id' => $ap['id']]);
            $reminders24h++;
        }

        // 2. Disparo 2h Antes (Janela: entre 1h30 e 2h30 antes do agendamento)
        $stmt2 = $this->db->prepare("
            SELECT * FROM crm_appointments 
            WHERE status IN ('agendado', 'confirmado_24h', 'SCHEDULED', 'CONFIRMED')
              AND reminder_sent_2h = 0
              AND scheduled_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 150 MINUTE)
              AND scheduled_at >= DATE_ADD(NOW(), INTERVAL 90 MINUTE)
        ");
        $stmt2->execute();
        $appts2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);

        foreach ($appts2 as $ap) {
            $formattedTime = date('H:i', strtotime($ap['scheduled_at']));
            $msg = "⚡ *Lembrete de Sessão em Breve!* ⚡\n\n"
                 . "Olá, *{$ap['patient_name']}*! Nossa equipe já está preparando sua sala para o procedimento *{$ap['procedure_name']}* hoje às *{$formattedTime}*.\n\n"
                 . "📍 *Endereço:* Rua Sebastião da Silva Leite, nº 456, Vila Rosângela, Assis/SP.\n"
                 . "Pedimos a gentileza de chegar com 10 minutos de antecedência. Te aguardamos com muito carinho! ✨";

            $this->sendWhatsAppMessage($ap['contact_phone'], $msg, $ap['conversation_id']);

            $upd = $this->db->prepare("UPDATE crm_appointments SET reminder_sent_2h = 1 WHERE id = :id");
            $upd->execute([':id' => $ap['id']]);
            $reminders2h++;
        }

        $stats = $this->getTodayStats();

        return [
            'success' => true,
            'reminders_24h_sent' => $reminders24h,
            'reminders_2h_sent' => $reminders2h,
            'total_processed' => $reminders24h + $reminders2h,
            'stats' => $stats
        ];
    }

    public function processInboundReply(string $phone, string $message): array {
        $cleanPhone = preg_replace('/\D/', '', $phone);
        $trimmedMsg = trim($message);

        if (!$this->db || empty($cleanPhone)) {
            return ['success' => false, 'action' => 'none'];
        }

        $stmt = $this->db->prepare("
            SELECT * FROM crm_appointments 
            WHERE contact_phone = :phone 
              AND scheduled_at >= NOW() 
            ORDER BY scheduled_at ASC 
            LIMIT 1
        ");
        $stmt->execute([':phone' => $cleanPhone]);
        $appt = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$appt) {
            return ['success' => false, 'message' => 'Nenhum agendamento futuro encontrado.'];
        }

        if ($trimmedMsg === '1' || stripos($trimmedMsg, 'confirmar') !== false || stripos($trimmedMsg, 'confirmo') !== false) {
            $upd = $this->db->prepare("UPDATE crm_appointments SET status = 'confirmado_24h' WHERE id = :id");
            $upd->execute([':id' => $appt['id']]);

            $this->createChatwootPrivateNote(
                $cleanPhone, 
                "✅ *[CONFIRMAÇÃO DE PRESENÇA]*\nA paciente confirmou presença para a sessão de *{$appt['procedure_name']}* agendada para " . date('d/m/Y H:i', strtotime($appt['scheduled_at'])) . "."
            );

            return ['success' => true, 'action' => 'confirmed', 'appointment_id' => $appt['id']];
        }

        if ($trimmedMsg === '2' || stripos($trimmedMsg, 'remarcar') !== false) {
            $upd = $this->db->prepare("UPDATE crm_appointments SET status = 'remarcar' WHERE id = :id");
            $upd->execute([':id' => $appt['id']]);

            $this->createChatwootPrivateNote(
                $cleanPhone, 
                "🔄 *[SOLICITAÇÃO DE REMARCAÇÃO]*\n⚠️ A paciente solicitou remarcar a sessão de *{$appt['procedure_name']}* prevista para " . date('d/m/Y H:i', strtotime($appt['scheduled_at'])) . ". Favor entrar em contato para oferecer novos horários."
            );

            return ['success' => true, 'action' => 'reschedule_requested', 'appointment_id' => $appt['id']];
        }

        return ['success' => false, 'action' => 'unrecognized'];
    }

    public function getTodayStats(): array {
        if (!$this->db) {
            return ['today_total' => 0, 'confirmed' => 0, 'noshow_avoided' => 0];
        }

        try {
            $today = date('Y-m-d');
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status IN ('confirmado_24h', 'confirmado_2h', 'CONFIRMED', 'concluido') THEN 1 ELSE 0 END) as confirmed,
                    SUM(CASE WHEN reminder_sent_24h = 1 OR reminder_sent_2h = 1 THEN 1 ELSE 0 END) as reminded
                FROM crm_appointments 
                WHERE DATE(scheduled_at) = :today
            ");
            $stmt->execute([':today' => $today]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $total = (int)($row['total'] ?? 0);
            $confirmed = (int)($row['confirmed'] ?? 0);
            $reminded = (int)($row['reminded'] ?? 0);

            return [
                'today_total' => $total,
                'confirmed' => $confirmed,
                'noshow_avoided' => min($confirmed, $reminded)
            ];
        } catch (\Throwable $e) {
            return ['today_total' => 0, 'confirmed' => 0, 'noshow_avoided' => 0];
        }
    }

    private function sendWhatsAppMessage(string $phone, string $text, ?int $conversationId = null): bool {
        $cleanPhone = preg_replace('/\D/', '', $phone);
        if (empty($cleanPhone)) return false;

        // Se houver conversation_id no Chatwoot, envia pela API do Chatwoot
        if ($conversationId) {
            $url = "{$this->chatwootBaseUrl}/api/v1/accounts/1/conversations/{$conversationId}/messages";
            $payload = [
                'content' => $text,
                'message_type' => 'outgoing',
                'private' => false
            ];
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                "api_access_token: {$this->chatwootApiToken}"
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($code >= 200 && $code < 300) return true;
        }

        // Fallback: Disparo direto via Evolution API (instância da Clínica Matriz)
        $instance = 'inst_clinica';
        $url = "{$this->evolutionBaseUrl}/message/sendText/{$instance}";
        $payload = [
            'number' => $cleanPhone,
            'text' => $text,
            'delay' => 1200
        ];
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            "apikey: {$this->evolutionApiKey}"
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $res = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return ($code >= 200 && $code < 300);
    }

    private function createChatwootPrivateNote(string $phone, string $noteContent): bool {
        $cleanPhone = preg_replace('/\D/', '', $phone);
        if (empty($cleanPhone)) return false;

        $searchUrl = "{$this->chatwootBaseUrl}/api/v1/accounts/1/contacts/search?q=" . urlencode($cleanPhone);
        $ch = curl_init($searchUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            "api_access_token: {$this->chatwootApiToken}"
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $res = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($res, true);
        $contactId = $data['payload'][0]['id'] ?? null;
        if (!$contactId) return false;

        $convUrl = "{$this->chatwootBaseUrl}/api/v1/accounts/1/contacts/{$contactId}/conversations";
        $ch = curl_init($convUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            "api_access_token: {$this->chatwootApiToken}"
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $convRes = curl_exec($ch);
        curl_close($ch);

        $convData = json_decode($convRes, true);
        $conversationId = $convData['payload'][0]['id'] ?? null;
        if (!$conversationId) return false;

        $msgUrl = "{$this->chatwootBaseUrl}/api/v1/accounts/1/conversations/{$conversationId}/messages";
        $payload = [
            'content' => $noteContent,
            'message_type' => 'outgoing',
            'private' => true
        ];
        $ch = curl_init($msgUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            "api_access_token: {$this->chatwootApiToken}"
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $msgRes = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return ($httpCode >= 200 && $httpCode < 300);
    }
}
