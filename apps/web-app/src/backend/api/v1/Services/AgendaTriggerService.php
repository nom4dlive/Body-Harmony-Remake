<?php

namespace BodyHarmony\Services;

use PDO;
use Exception;
use Throwable;

require_once __DIR__ . '/AgendaService.php';

class AgendaTriggerService {
    private $db;
    private ?AgendaService $agendaService;

    public function __construct($db, ?AgendaService $agendaService = null) {
        $this->db = $db;
        $this->agendaService = $agendaService;
    }

    private function getAgendaService(): AgendaService {
        if ($this->agendaService === null) {
            $this->agendaService = new AgendaService($this->db);
        }
        return $this->agendaService;
    }

    /**
     * Triggered on new Licensee Registration. Auto-creates an Onboarding task.
     */
    public function onLicenseeRegistered(int $licenciadaId, string $name, string $cpf): int {
        $data = [
            'event_type' => 'pendencia',
            'title' => "Onboarding Licenciada: {$name}",
            'description' => "Enviar kit de boas-vindas, validar contrato e liberar chave LMS para a licenciada {$name} (CPF: {$cpf}).",
            'start_datetime' => date('Y-m-d H:i:s'),
            'priority' => 'alta',
            'status' => 'pendente',
            'client_id' => $licenciadaId,
            'client_type' => 'licenciada',
            'color' => '#ED7E13'
        ];

        return $this->getAgendaService()->createEvent($data, 1); // 1 = System Admin
    }

    /**
     * Triggered when a Critical Urgency Event is created. Dispatches Telegram Alert if bot is configured.
     */
    public function notifyTelegramUrgency(string $title, string $description): bool {
        $botToken = getenv('TELEGRAM_BOT_TOKEN');
        $chatId = getenv('TELEGRAM_GESTOR_GROUP_ID') ?: getenv('TELEGRAM_CHAT_ID');

        if (!$botToken || !$chatId) {
            return false;
        }

        $message = "🚨 *NOVA URGÊNCIA NO PORTAL DO GESTOR*\n\n";
        $message .= "📌 *Título:* " . $title . "\n";
        if ($description) {
            $message .= "📝 *Descrição:* " . substr($description, 0, 200) . "\n";
        }
        $message .= "⏰ *Data:* " . date('d/m/Y H:i') . "\n\n";
        $message .= "👉 [Acessar Agenda do Gestor](https://bodyharmony.com.br/portal-gestor/agenda)";

        $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
        $payload = [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => 'Markdown',
            'disable_web_page_preview' => true
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        $result = curl_exec($ch);
        curl_close($ch);

        return $result !== false;
    }
}
