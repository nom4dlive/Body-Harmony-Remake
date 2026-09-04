<?php
// api/v1/Controllers/TelegramWebhookController.php
// Nexus Guard V3.1 - Telegram Bot Webhook Handler

class TelegramWebhookController {
    private $pdo;
    private $botToken;
    private $supportGroupId;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
        $this->botToken = env('TELEGRAM_BOT_TOKEN');
        $this->supportGroupId = env('TELEGRAM_SUPPORT_GROUP_ID');
    }

    /**
     * Entrypoint for Telegram Webhook
     * POST /v1/bot/webhook
     */
    public function handle() {
        // Validate webhook token if configured (X-Telegram-Bot-Api-Secret-Token)
        $headers = getallheaders_robust();
        $secretToken = $headers['X-Telegram-Bot-Api-Secret-Token'] ?? $headers['x-telegram-bot-api-secret-token'] ?? null;
        $expectedSecret = env('TELEGRAM_WEBHOOK_SECRET');

        if ($expectedSecret && $secretToken !== $expectedSecret) {
            error_log("[BOT_WEBHOOK] Refused connection due to invalid secret token.");
            Response::json(['ok' => false, 'error' => 'Forbidden'], 403);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['message'])) {
            // Echo OK to Telegram for empty/non-message updates (like callback queries, etc.)
            Response::json(['ok' => true, 'status' => 'ignored']);
            return;
        }

        $message = $input['message'];
        $chatId = $message['chat']['id'] ?? null;
        $text = trim($message['text'] ?? '');
        $userId = $message['from']['id'] ?? null;
        $username = $message['from']['username'] ?? 'sem_username';
        $firstName = $message['from']['first_name'] ?? 'Usuario';

        if (!$chatId) {
            Response::json(['ok' => true]);
            return;
        }

        // --- COMMAND ROUTING ---
        if (strpos($text, '/start') === 0) {
            $this->handleStartCommand($chatId, $firstName);
        } elseif (strpos($text, '/id') === 0) {
            $this->handleIdCommand($chatId, $userId);
        } else {
            // Text message or question -> Human Handoff (Silence Bot)
            $this->handleHandoff($chatId, $userId, $firstName, $username, $text);
        }

        Response::json(['ok' => true, 'status' => 'processed']);
    }

    private function handleStartCommand($chatId, $firstName) {
        $welcomeText = "Ola, " . $firstName . "! Bem-vinda ao ecossistema Body Harmony.\n\n" .
                      "Aqui voce tem acesso a nossa area de treinamento exclusivo, " .
                      "biblioteca tecnica de estetica e mentoria clinica com a IA Doctor Harmony.\n\n" .
                      "Clique no botao abaixo para acessar o nosso Portal Diretamente.";
        
        $keyboard = [
            'inline_keyboard' => [[
                [
                    'text' => 'Acessar Portal 📱',
                    'web_app' => ['url' => env('SITE_URL') . '/portal-licenciada']
                ]
            ]]
        ];

        $this->sendTelegramRequest('sendMessage', [
            'chat_id' => $chatId,
            'text' => $welcomeText,
            'reply_markup' => json_encode($keyboard)
        ]);
    }

    private function handleIdCommand($chatId, $userId) {
        $reply = "🔍 DIAGNOSTICO DE ID:\n\n" .
                 "• Seu ID de Usuario: " . $userId . "\n" .
                 "• ID deste Chat: " . $chatId;
        
        $this->sendTelegramRequest('sendMessage', [
            'chat_id' => $chatId,
            'text' => $reply
        ]);
    }

    private function handleHandoff($chatId, $userId, $firstName, $username, $question) {
        if (empty($question)) return;

        // 1. Reply to Student
        $replyToUser = "Entendido, " . $firstName . ". Vou te conectar com a nossa equipe clinica de suporte para te ajudar com isso.\n\n" .
                       "Um atendente humano analisara a sua mensagem em instantes.";
        
        $this->sendTelegramRequest('sendMessage', [
            'chat_id' => $chatId,
            'text' => $replyToUser
        ]);

        // 2. Forward to Support Group
        if ($this->supportGroupId) {
            $supportMessage = "🚨 SUPORTE SOLICITADO:\n\n" .
                             "• Nome: " . $firstName . "\n" .
                             "• Username: @" . $username . "\n" .
                             "• Chat ID: " . $chatId . "\n" .
                             "• Pergunta: \"" . $question . "\"";
            
            $this->sendTelegramRequest('sendMessage', [
                'chat_id' => $this->supportGroupId,
                'text' => $supportMessage
            ]);
        }

        // 3. Log Handoff in Database
        try {
            // Check if log table exists (part of V32 schema)
            $stmt = $this->pdo->prepare("
                INSERT INTO system_broadcast_logs (message_type, recipient_details, status) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([
                'HANDOFF', 
                json_encode(['chat_id' => $chatId, 'username' => $username, 'name' => $firstName, 'text' => $question]), 
                'SENT'
            ]);
        } catch (Exception $e) {
            error_log("[BOT_WEBHOOK] Failed to write db log: " . $e->getMessage());
        }
    }

    /**
     * Sends a request to the Telegram Bot API using cURL with SSL bypass for safety.
     */
    private function sendTelegramRequest($method, $params) {
        if (!$this->botToken) {
            error_log("[BOT_WEBHOOK] Token missing, cannot send request.");
            return false;
        }

        $url = "https://api.telegram.org/bot" . $this->botToken . "/" . $method;
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        // Bypass SSL for reliable local testing (same as smoke test)
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            error_log("[BOT_WEBHOOK] Curl Error: " . $err);
            return false;
        }

        return $response;
    }
}
