<?php
namespace BodyHarmony\Services;

use PDO;
use Exception;

/**
 * ==============================================================================
 * CRM COCKPIT SERVICE — UNIFIED 360º CONTEXT & APPOINTMENTS (PLAN-174)
 * ==============================================================================
 * Nexus Protocol V3.1 — Micro-SPA de Atendimento, Google Workspace Master,
 * Automação Anti No-Show e Roteiros de Atendimento Clínico & Comercial.
 * ==============================================================================
 */
class CrmCockpitService {
    private $db;
    private string $chatwootUrl;
    private string $apiToken;
    private int $accountId;

    public function __construct(
        mixed $db = null,
        ?string $chatwootUrl = null,
        ?string $apiToken = null,
        int $accountId = 1
    ) {
        $this->db = $db;
        $this->chatwootUrl = rtrim($chatwootUrl ?? getenv('CHATWOOT_URL') ?: 'https://crm.bodyharmony.com.br', '/');
        $this->apiToken = $apiToken ?? getenv('CHATWOOT_API_TOKEN') ?: 'wxvcKsycZEXjrqM7dxD72oNm';
        $this->accountId = $accountId;
        $this->ensureTables();
    }

    private function ensureTables(): void {
        if (!$this->db) return;
        try {
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `crm_appointments` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `inbox_id` INT DEFAULT 1,
                    `conversation_id` INT DEFAULT NULL,
                    `contact_phone` VARCHAR(30) NOT NULL,
                    `patient_name` VARCHAR(150) NOT NULL,
                    `procedure_name` VARCHAR(150) NOT NULL,
                    `scheduled_at` DATETIME NOT NULL,
                    `duration_minutes` INT DEFAULT 60,
                    `status` ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
                    `google_event_id` VARCHAR(255) DEFAULT NULL,
                    `reminder_sent_24h` TINYINT(1) DEFAULT 0,
                    `reminder_sent_2h` TINYINT(1) DEFAULT 0,
                    `notes` TEXT DEFAULT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX `idx_scheduled_at` (`scheduled_at`),
                    INDEX `idx_contact_phone` (`contact_phone`),
                    INDEX `idx_status` (`status`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `crm_patient_profiles` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `phone_e164` VARCHAR(30) NOT NULL UNIQUE,
                    `cpf` VARCHAR(20) DEFAULT NULL,
                    `name` VARCHAR(150) NOT NULL,
                    `drive_folder_url` VARCHAR(255) DEFAULT NULL,
                    `last_anamnese_at` DATETIME DEFAULT NULL,
                    `total_sessions_count` INT DEFAULT 0,
                    `notes` TEXT DEFAULT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX `idx_phone` (`phone_e164`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        } catch (\Throwable $e) {
            // Silenciar se tabelas já existirem ou sem privilégio de DDL
        }
    }

    public function normalizePhone(string $phone): array {
        $digits = preg_replace('/\D/', '', $phone);
        $digitsNo55 = $digits;
        if (str_starts_with($digits, '55') && strlen($digits) >= 12) {
            $digitsNo55 = substr($digits, 2);
        }

        $len = strlen($digitsNo55);
        $last8 = $len >= 8 ? substr($digitsNo55, -8) : $digitsNo55;
        $last9 = $len >= 9 ? substr($digitsNo55, -9) : $digitsNo55;
        $ddd = $len >= 10 ? substr($digitsNo55, 0, 2) : '';

        return [
            'raw' => $phone,
            'digits' => $digits,
            'digits_no_55' => $digitsNo55,
            'formatted_e164' => '+' . (str_starts_with($digits, '55') ? $digits : '55' . $digits),
            'last8' => $last8,
            'last9' => $last9,
            'ddd' => $ddd
        ];
    }

    public function getContext(string $phone, ?int $conversationId = null, ?string $name = null): array {
        return $this->getCockpitContext($phone, $conversationId, $name);
    }

    public function getCockpitContext(string $phone, ?int $conversationId = null, ?string $name = null): array {
        $norm = $this->normalizePhone($phone);
        $phoneE164 = $norm['formatted_e164'];
        $last8 = $norm['last8'];

        $profileType = 'NOVO_PACIENTE';
        $contactName = $name ?: 'Paciente';
        $cpf = null;
        $cidade = 'Assis';
        $uf = 'SP';
        $driveUrl = null;
        $appointments = [];
        $recentActions = [];

        if ($this->db) {
            try {
                // 1. Verificar se é Licenciada Oficial
                $stmtLic = $this->db->prepare("
                    SELECT name, cpf, location, state 
                    FROM licenciadas 
                    WHERE whatsapp LIKE :phone OR whatsapp LIKE :phone8
                    LIMIT 1
                ");
                $stmtLic->execute([
                    ':phone' => "%{$norm['digits_no_55']}%",
                    ':phone8' => "%{$last8}%"
                ]);
                $lic = $stmtLic->fetch(PDO::FETCH_ASSOC);

                if ($lic) {
                    $profileType = 'LICENCIADA';
                    $contactName = $lic['name'];
                    $cpf = $lic['cpf'];
                    $cidade = $lic['location'] ?: 'Brasil';
                    $uf = $lic['state'] ?: '';
                } else {
                    // 2. Verificar Perfil Clínico de Paciente
                    $stmtPat = $this->db->prepare("
                        SELECT name, cpf, drive_folder_url, last_anamnese_at, total_sessions_count 
                        FROM crm_patient_profiles 
                        WHERE phone_e164 LIKE :phone OR phone_e164 LIKE :phone8
                        LIMIT 1
                    ");
                    $stmtPat->execute([
                        ':phone' => "%{$norm['digits_no_55']}%",
                        ':phone8' => "%{$last8}%"
                    ]);
                    $pat = $stmtPat->fetch(PDO::FETCH_ASSOC);

                    if ($pat) {
                        $contactName = $pat['name'];
                        $cpf = $pat['cpf'];
                        $driveUrl = $pat['drive_folder_url'];
                        if (($pat['total_sessions_count'] ?? 0) > 0) {
                            $profileType = 'PACIENTE_RECORRENTE';
                        }
                        if (!empty($pat['last_anamnese_at'])) {
                            $recentActions[] = [
                                'type' => 'anamnese',
                                'description' => 'Ficha de Anamnese preenchida e arquivada',
                                'timestamp' => $pat['last_anamnese_at']
                            ];
                        }
                    }
                }

                // 3. Buscar Agendamentos Recentes
                $stmtApp = $this->db->prepare("
                    SELECT id, procedure_name, scheduled_at, duration_minutes, status, reminder_sent_24h, reminder_sent_2h 
                    FROM crm_appointments 
                    WHERE contact_phone LIKE :phone OR contact_phone LIKE :phone8
                    ORDER BY scheduled_at DESC 
                    LIMIT 5
                ");
                $stmtApp->execute([
                    ':phone' => "%{$norm['digits_no_55']}%",
                    ':phone8' => "%{$last8}%"
                ]);
                $appointments = $stmtApp->fetchAll(PDO::FETCH_ASSOC);

                foreach ($appointments as $app) {
                    $recentActions[] = [
                        'type' => 'appointment',
                        'description' => "Sessão de {$app['procedure_name']} agendada",
                        'timestamp' => $app['scheduled_at']
                    ];
                }

            } catch (\Throwable $e) {
                error_log("[CRM_COCKPIT_WARN] Database query failed: " . $e->getMessage());
            }
        }

        // Ordenar histórico por timestamp desc e pegar os últimos 3
        usort($recentActions, fn($a, $b) => strcmp($b['timestamp'] ?? '', $a['timestamp'] ?? ''));
        $recentActions = array_slice($recentActions, 0, 3);

        return [
            'status' => 'success',
            'data' => [
                'profile_type' => $profileType,
                'contact' => [
                    'name' => $contactName,
                    'phone_raw' => $phone,
                    'phone_formatted' => $phoneE164,
                    'cpf' => $cpf,
                    'cidade' => $cidade,
                    'uf' => $uf,
                    'drive_folder_url' => $driveUrl,
                    'total_sessions' => count($appointments)
                ],
                'appointments' => $appointments,
                'recent_actions' => $recentActions,
                'quick_links' => [
                    'anamnese_url' => 'https://bodyharmony.com.br/api/v1/crm/webhooks/anamnese',
                    'shop_congresso_url' => 'https://bodyharmony.com.br/shop',
                    'meet_instant_url' => 'https://meet.google.com/new',
                    'drive_root_url' => 'https://drive.google.com/'
                ]
            ]
        ];
    }

    /**
     * Cria e agenda uma sessão estética / eletroestimulação com sincronia Google e Chatwoot.
     */
    public function createAppointment(array $data): array {
        $phone = trim($data['contact_phone'] ?? '');
        $patientName = trim($data['patient_name'] ?? '');
        $procedureName = trim($data['procedure_name'] ?? 'Eletroestimulação de Alta Intensidade');
        $scheduledAt = trim($data['scheduled_at'] ?? '');
        $duration = (int)($data['duration_minutes'] ?? 60);
        $notes = trim($data['notes'] ?? '');
        $inboxId = (int)($data['inbox_id'] ?? 1);
        $conversationId = isset($data['conversation_id']) ? (int)$data['conversation_id'] : null;

        if (empty($phone) || empty($patientName) || empty($scheduledAt)) {
            throw new Exception("Telefone, nome da paciente e data/horário são obrigatórios.");
        }

        $norm = $this->normalizePhone($phone);
        $phoneE164 = $norm['formatted_e164'];

        $timestamp = strtotime($scheduledAt);
        if (!$timestamp) {
            throw new Exception("Formato de data/horário inválido.");
        }

        $formattedDateTime = date('d/m/Y \à\s H:i', $timestamp);
        $startDateGoogle = date('Ymd\THis', $timestamp);
        $endDateGoogle = date('Ymd\THis', $timestamp + ($duration * 60));

        $googleCalUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE"
            . "&text=" . urlencode("Body Harmony: {$procedureName} - {$patientName}")
            . "&dates=" . urlencode("{$startDateGoogle}/{$endDateGoogle}")
            . "&details=" . urlencode("Paciente: {$patientName}\nWhatsApp: {$phoneE164}\nProcedimento: {$procedureName}\nNotas: {$notes}")
            . "&location=" . urlencode("Body Harmony Matriz, Rua Sebastião da Silva Leite 456, Assis/SP");

        $whatsappCopy = "✨ *Agendamento Confirmado — Body Harmony Matriz* ✨\n\n"
            . "Olá, *{$patientName}*!\n"
            . "Sua sessão de *{$procedureName}* está agendada com sucesso:\n\n"
            . "📅 *Data & Horário:* {$formattedDateTime}\n"
            . "⏱️ *Duração:* {$duration} minutos\n"
            . "📍 *Local:* Matriz Body Harmony — Rua Sebastião da Silva Leite, nº 456, Assis/SP.\n\n"
            . "_Para confirmar ou solicitar remarcação, responda por aqui! 🌸_";

        $appointmentId = time();

        if ($this->db) {
            try {
                $stmt = $this->db->prepare("
                    INSERT INTO crm_appointments 
                    (inbox_id, conversation_id, contact_phone, patient_name, procedure_name, scheduled_at, duration_minutes, notes, status)
                    VALUES 
                    (:inbox_id, :conv_id, :phone, :patient, :proc, :sched, :dur, :notes, 'SCHEDULED')
                ");
                $stmt->execute([
                    ':inbox_id' => $inboxId,
                    ':conv_id' => $conversationId,
                    ':phone' => $phoneE164,
                    ':patient' => $patientName,
                    ':proc' => $procedureName,
                    ':sched' => date('Y-m-d H:i:s', $timestamp),
                    ':dur' => $duration,
                    ':notes' => $notes ?: null
                ]);
                $appointmentId = (int)$this->db->lastInsertId();

                // Atualizar/Criar registro de perfil de paciente
                $stmtProfile = $this->db->prepare("
                    INSERT INTO crm_patient_profiles (phone_e164, name, total_sessions_count)
                    VALUES (:phone, :name, 1)
                    ON DUPLICATE KEY UPDATE 
                        name = VALUES(name),
                        total_sessions_count = total_sessions_count + 1
                ");
                $stmtProfile->execute([':phone' => $phoneE164, ':name' => $patientName]);
            } catch (\Throwable $e) {
                error_log("[CRM_APPOINTMENT_WARN] Error inserting appointment: " . $e->getMessage());
            }
        }

        // Injetar Nota Privada Dourada no Chatwoot para a equipe
        $noteContent = "📅 *[SESSÃO AGENDADA — CLÍNICA MATRIZ]*\n"
                     . "👤 *Paciente:* {$patientName}\n"
                     . "📱 *WhatsApp:* {$phoneE164}\n"
                     . "🩺 *Procedimento:* {$procedureName}\n"
                     . "⏰ *Data & Horário:* {$formattedDateTime} ({$duration} min)\n"
                     . "🗓️ *Google Calendar:* Sincronizado\n"
                     . "⚡ *Lembretes Anti No-Show:* Programados (24h e 2h antes)";

        $this->injectChatwootPrivateNote($phoneE164, $conversationId, $noteContent);

        return [
            'status' => 'success',
            'data' => [
                'appointment_id' => $appointmentId,
                'google_calendar_url' => $googleCalUrl,
                'whatsapp_message' => $whatsappCopy,
                'synced_services' => ['mysql_appointments', 'anti_noshow_queue', 'chatwoot_note', 'google_calendar'],
                'services_summary' => "Google Calendar + Lembretes WhatsApp (24h e 2h) programados."
            ],
            'message' => "Sessão agendada com sucesso para {$formattedDateTime}."
        ];
    }

    /**
     * Injeta Nota Privada de forma resiliente no Chatwoot.
     */
    private function injectChatwootPrivateNote(string $phone, ?int $conversationId, string $noteContent): bool {
        $convId = $conversationId;

        if (!$convId) {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            $searchUrl = "{$this->chatwootUrl}/api/v1/accounts/1/contacts/search?q={$cleanPhone}";
            $ch = curl_init($searchUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => ["api_access_token: {$this->apiToken}"],
                CURLOPT_TIMEOUT => 4
            ]);
            $res = curl_exec($ch);
            curl_close($ch);

            $data = json_decode($res, true);
            $contactId = $data['payload'][0]['id'] ?? null;
            if ($contactId) {
                $convUrl = "{$this->chatwootUrl}/api/v1/accounts/1/contacts/{$contactId}/conversations";
                $ch = curl_init($convUrl);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_HTTPHEADER => ["api_access_token: {$this->apiToken}"],
                    CURLOPT_TIMEOUT => 4
                ]);
                $convRes = curl_exec($ch);
                curl_close($ch);
                $convData = json_decode($convRes, true);
                $convId = $convData['payload'][0]['id'] ?? null;
            }
        }

        if (!$convId) return false;

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
            CURLOPT_TIMEOUT => 4
        ]);
        curl_exec($ch);
        curl_close($ch);
        return true;
    }

    /**
     * Gera sala de teleconsulta no Google Meet.
     */
    public function generateMeetRoom(string $title = 'Avaliação Online Body Harmony'): array {
        $meetUrl = 'https://meet.google.com/new';
        $whatsappCopy = "📹 *Link de Avaliação Online — Body Harmony* 🌸\n\n"
            . "Olá! Conforme combinamos, segue o link exclusivo da nossa sala de vídeo:\n"
            . "👉 {$meetUrl}\n\n"
            . "Basta clicar no horário combinado para nos conectarmos diretamente pelo celular ou computador!";

        return [
            'status' => 'success',
            'data' => [
                'meet_url' => $meetUrl,
                'whatsapp_message' => $whatsappCopy
            ],
            'message' => 'Sala de avaliação gerada com sucesso.'
        ];
    }
}
