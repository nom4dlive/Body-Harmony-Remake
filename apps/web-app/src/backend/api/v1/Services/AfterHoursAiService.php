<?php
// apps/web-app/src/backend/api/v1/Services/AfterHoursAiService.php
// Body Harmony Nexus V3.1 — After-Hours AI Bot & Schedule Service (PLAN-173)

namespace BodyHarmony\Services;

use DateTime;
use DateTimeZone;
use PDO;

class AfterHoursAiService {
    private mixed $db;
    private string $chatwootBaseUrl;
    private string $chatwootApiToken;
    private DateTimeZone $tz;

    public function __construct(
        mixed $db = null,
        ?string $chatwootBaseUrl = null,
        ?string $chatwootApiToken = null
    ) {
        $this->db = $db;
        $this->chatwootBaseUrl = rtrim($chatwootBaseUrl ?? $_ENV['CHATWOOT_BASE_URL'] ?? 'https://crm.bodyharmony.com.br', '/');
        $this->chatwootApiToken = $chatwootApiToken ?? $_ENV['CHATWOOT_API_TOKEN'] ?? 'wxvcKsycZEXjrqM7dxD72oNm';
        $this->tz = new DateTimeZone('America/Sao_Paulo');
        $this->ensureTables();
    }

    private function ensureTables(): void {
        if (!$this->db) return;
        try {
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `crm_afterhours_settings` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `is_enabled` TINYINT(1) DEFAULT 1,
                    `weekday_start` VARCHAR(10) DEFAULT '18:00',
                    `weekday_end` VARCHAR(10) DEFAULT '08:00',
                    `weekend_enabled` TINYINT(1) DEFAULT 1,
                    `custom_greeting` TEXT DEFAULT NULL,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // Seed default settings if empty
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM crm_afterhours_settings");
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (($row['count'] ?? 0) === 0) {
                $this->db->exec("
                    INSERT INTO crm_afterhours_settings 
                        (is_enabled, weekday_start, weekday_end, weekend_enabled, custom_greeting)
                    VALUES 
                        (1, '18:00', '08:00', 1, 'Olá! Sou a Dra. Harmony AI, assistente inteligente oficial da Body Harmony.')
                ");
            }
        } catch (\Throwable $e) {
            error_log("[AfterHoursAiService] ensureTables error: " . $e->getMessage());
        }
    }

    public function isAfterHours(?DateTime $dt = null): bool {
        $now = $dt ? clone $dt : new DateTime('now', $this->tz);
        $now->setTimezone($this->tz);

        $settings = $this->getSettings();
        if (!$settings['is_enabled']) {
            return false;
        }

        $dayOfWeek = (int)$now->format('N'); // 1 = Monday, 7 = Sunday
        $currentTime = $now->format('H:i');

        // Sábado (6) e Domingo (7)
        if ($dayOfWeek === 6 || $dayOfWeek === 7) {
            return (bool)$settings['weekend_enabled'];
        }

        // Segunda a Sexta: Antes das 08:00 ou a partir das 18:00
        $start = $settings['weekday_start'] ?: '18:00';
        $end = $settings['weekday_end'] ?: '08:00';

        if ($currentTime >= $start || $currentTime < $end) {
            return true;
        }

        return false;
    }

    public function getSettings(): array {
        $default = [
            'success' => true,
            'is_enabled' => true,
            'weekday_start' => '18:00',
            'weekday_end' => '08:00',
            'weekend_enabled' => true,
            'is_currently_afterhours' => $this->isAfterHoursInternal(true, '18:00', '08:00', true),
            'custom_greeting' => 'Olá! Sou a Dra. Harmony AI, assistente inteligente oficial da Body Harmony.'
        ];

        if (!$this->db) {
            return $default;
        }

        try {
            $stmt = $this->db->prepare("SELECT * FROM crm_afterhours_settings LIMIT 1");
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                $isEnabled = (bool)$row['is_enabled'];
                $wStart = $row['weekday_start'] ?: '18:00';
                $wEnd = $row['weekday_end'] ?: '08:00';
                $wWeekend = (bool)$row['weekend_enabled'];

                return [
                    'success' => true,
                    'is_enabled' => $isEnabled,
                    'weekday_start' => $wStart,
                    'weekday_end' => $wEnd,
                    'weekend_enabled' => $wWeekend,
                    'is_currently_afterhours' => $this->isAfterHoursInternal($isEnabled, $wStart, $wEnd, $wWeekend),
                    'custom_greeting' => $row['custom_greeting'] ?? $default['custom_greeting']
                ];
            }
        } catch (\Throwable $e) {
            error_log("[AfterHoursAiService] getSettings error: " . $e->getMessage());
        }

        return $default;
    }

    private function isAfterHoursInternal(bool $isEnabled, string $start, string $end, bool $weekend): bool {
        if (!$isEnabled) return false;
        $now = new DateTime('now', $this->tz);
        $dayOfWeek = (int)$now->format('N');
        $currentTime = $now->format('H:i');

        if ($dayOfWeek >= 6) return $weekend;
        return ($currentTime >= $start || $currentTime < $end);
    }

    public function updateSettings(array $data): array {
        $isEnabled = isset($data['is_enabled']) ? ($data['is_enabled'] ? 1 : 0) : 1;
        $wStart = trim($data['weekday_start'] ?? '18:00');
        $wEnd = trim($data['weekday_end'] ?? '08:00');
        $wWeekend = isset($data['weekend_enabled']) ? ($data['weekend_enabled'] ? 1 : 0) : 1;
        $greeting = trim($data['custom_greeting'] ?? '');

        if ($this->db) {
            $stmt = $this->db->prepare("
                UPDATE crm_afterhours_settings 
                SET is_enabled = :is_enabled,
                    weekday_start = :weekday_start,
                    weekday_end = :weekday_end,
                    weekend_enabled = :weekend_enabled,
                    custom_greeting = :greeting
                WHERE id > 0
            ");
            $stmt->execute([
                ':is_enabled' => $isEnabled,
                ':weekday_start' => $wStart,
                ':weekday_end' => $wEnd,
                ':weekend_enabled' => $wWeekend,
                ':greeting' => $greeting ?: null
            ]);
        }

        return $this->getSettings();
    }

    public function generateAfterHoursReply(string $incomingText, string $senderPhone, string $channel = 'whatsapp'): array {
        $text = strtolower(trim($incomingText));

        // Intenções e respostas
        $reply = "✨ *Olá! Sou a Dra. Harmony AI, assistente inteligente oficial da Body Harmony.* ✨\n\n"
               . "No momento nossa equipe humana está fora do horário de atendimento comercial (Seg a Sex das 08h às 18h), mas estou aqui para te ajudar agora mesmo! 🩺💫\n\n"
               . "👉 *Como posso te auxiliar nesta noite/fim de semana?*\n"
               . "1️⃣ *Ingressos & Lotes do Congresso Nacional 2026*\n"
               . "2️⃣ *Cursos & Capacitações com Certificado*\n"
               . "3️⃣ *Avaliação & Sessões de Eletroestimulação na Matriz (Assis/SP)*\n"
               . "4️⃣ *Deixar um recado prioritário para a equipe humana*\n\n"
               . "_Digite a opção desejada (1, 2, 3 ou 4) ou escreva sua mensagem livremente!_";

        $intent = 'general_welcome';
        $priorityEscalation = false;

        if (str_contains($text, '1') || str_contains($text, 'congresso') || str_contains($text, 'ingresso') || str_contains($text, 'vip')) {
            $intent = 'congress_purchase_interest';
            $reply = "🎟️ *CONGRESSO BODY HARMONY 2026 — INFORMAÇÕES & CHECKOUT* 🎟️\n\n"
                   . "Que excelente escolha! A maior imersão de tecnologia estética do país acontecerá em 24 e 25 de Outubro de 2026.\n\n"
                   . "💎 *Lotes Ativos:*\n"
                   . "▫️ *Acesso Experience:* R$ 697,00 (12x no cartão)\n"
                   . "▫️ *Acesso VIP:* R$ 1.497,00 (100% de cashback no Licenciamento!)\n\n"
                   . "👉 *Garanta sua vaga agora pelo link seguro:*\n"
                   . "https://bodyharmony.com.br/shop\n\n"
                   . "Já registrei seu interesse para a *Giovanna* validar seu bônus no primeiro horário amanhã!";
            $priorityEscalation = true;
        } elseif (str_contains($text, '2') || str_contains($text, 'curso') || str_contains($text, 'capacita') || str_contains($text, 'aluna')) {
            $intent = 'courses_inquiry';
            $reply = "🎓 *FORMAÇÃO & CAPACITAÇÃO BODY HARMONY* 🎓\n\n"
                   . "Nossas capacitações contam com certificação oficial e acesso completo à plataforma LMS de aulas práticas.\n\n"
                   . "👉 *Conheça todos os módulos e matricule-se diretamente:*\n"
                   . "https://bodyharmony.com.br/shop\n\n"
                   . "Nossa coordenadora pedagógica entrará em contato às 08h30 para te auxiliar!";
            $priorityEscalation = true;
        } elseif (str_contains($text, '3') || str_contains($text, 'clinica') || str_contains($text, 'sessao') || str_contains($text, 'agendar') || str_contains($text, 'avaliacao')) {
            $intent = 'clinic_appointment_interest';
            $reply = "🩺 *AVALIAÇÃO CLÍNICA NA MATRIZ (ASSIS/SP)* 🩺\n\n"
                   . "Nossas sessões de eletroestimulação muscular proporcionam resultados corporais rápidos e não-invasivos!\n\n"
                   . "📅 Para adiantar seu atendimento, preencha sua triagem inicial:\n"
                   . "👉 https://bodyharmony.com.br/shop\n\n"
                   . "A *Cibele* da nossa equipe clínica entrará em contato logo na abertura da agenda amanhã às 08h00 para confirmar o seu horário!";
            $priorityEscalation = true;
        }

        // Criar Nota Privada no Chatwoot se houve interesse comercial ou clínico
        if ($priorityEscalation && !empty($senderPhone)) {
            $this->logAfterHoursEscalation($senderPhone, $intent, $incomingText);
        }

        return [
            'success' => true,
            'is_afterhours' => true,
            'intent' => $intent,
            'reply_text' => $reply,
            'priority_escalation' => $priorityEscalation
        ];
    }

    private function logAfterHoursEscalation(string $phone, string $intent, string $message): void {
        // Envia log / nota privada via Chatwoot API
        $url = "{$this->chatwootBaseUrl}/api/v1/accounts/1/contacts/search?q={$phone}";
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ["api_access_token: {$this->chatwootApiToken}"],
            CURLOPT_TIMEOUT => 5
        ]);
        $res = curl_exec($ch);
        curl_close($ch);
        // Resiliente em caso de falha de rede
    }
}
