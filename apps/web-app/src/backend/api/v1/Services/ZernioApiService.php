<?php
// apps/web-app/src/backend/api/v1/Services/ZernioApiService.php
// Official Zernio API Service for Instagram Integration (@bodyharmonyoficial)
// Nexus Protocol V4.9 - PLAN-201

namespace BodyHarmony\Services;

class ZernioApiService {
    private string $apiKey;
    private string $baseUrl;
    private string $defaultAccountId;

    public function __construct(?string $apiKey = null) {
        $this->apiKey = $apiKey ?: (getenv('ZERNIO_API_KEY') ?: '');
        $this->baseUrl = rtrim(getenv('ZERNIO_BASE_URL') ?: 'https://zernio.com/api/v1', '/');
        $this->defaultAccountId = getenv('ZERNIO_INSTAGRAM_ACCOUNT_ID') ?: '';
    }

    /**
     * Executa requisições HTTP seguras contra a API do Zernio
     */
    private function request(string $endpoint, string $method = 'GET', ?array $data = null): array {
        $url = "{$this->baseUrl}/" . ltrim($endpoint, '/');
        $ch = curl_init($url);

        $headers = [
            "Authorization: Bearer {$this->apiKey}",
            "Content-Type: application/json"
        ];

        $options = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 12,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ];

        if ($method === 'POST') {
            $options[CURLOPT_POST] = true;
            if ($data !== null) {
                $options[CURLOPT_POSTFIELDS] = json_encode($data);
            }
        } elseif ($method === 'PUT') {
            $options[CURLOPT_CUSTOMREQUEST] = 'PUT';
            if ($data !== null) {
                $options[CURLOPT_POSTFIELDS] = json_encode($data);
            }
        } elseif ($method === 'DELETE') {
            $options[CURLOPT_CUSTOMREQUEST] = 'DELETE';
        }

        curl_setopt_array($ch, $options);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            return [
                'success' => false,
                'http_code' => $httpCode,
                'error' => "Falha na conexão com Zernio API: {$curlError}"
            ];
        }

        $decoded = json_decode($response, true);
        if ($httpCode >= 200 && $httpCode < 300) {
            return [
                'success' => true,
                'http_code' => $httpCode,
                'data' => $decoded ?: $response
            ];
        }

        return [
            'success' => false,
            'http_code' => $httpCode,
            'error' => $decoded['error'] ?? "Erro HTTP {$httpCode} retornado pelo Zernio",
            'raw' => $decoded
        ];
    }

    /**
     * Lista contas conectadas
     */
    public function getAccounts(): array {
        return $this->request('/accounts');
    }

    /**
     * Lista conversas de Direct Messages do Instagram
     */
    public function getInstagramConversations(int $limit = 50): array {
        $res = $this->request("/inbox/conversations?limit={$limit}");
        if (!$res['success']) {
            return $res;
        }

        $payload = $res['data']['data'] ?? $res['data']['conversations'] ?? (is_array($res['data']) && isset($res['data'][0]) ? $res['data'] : []);
        $mapped = [];

        foreach ($payload as $conv) {
            if (($conv['platform'] ?? '') !== 'instagram') {
                continue;
            }

            $mapped[] = [
                'id' => 'ig_' . ($conv['id'] ?? uniqid()),
                'raw_id' => (string)($conv['id'] ?? ''),
                'accountId' => $conv['accountId'] ?? $this->defaultAccountId,
                'platform' => 'INSTAGRAM',
                'line' => 'Instagram Direct (@bodyharmonyoficial)',
                'department' => 'INSTAGRAM',
                'name' => $conv['participantName'] ?: ($conv['participantUsername'] ? '@' . $conv['participantUsername'] : 'Seguidor Instagram'),
                'username' => $conv['participantUsername'] ?? '',
                'avatar_url' => $conv['participantPicture'] ?? null,
                'phone' => '@' . ($conv['participantUsername'] ?? 'instagram'),
                'doc' => 'Instagram Lead',
                'city' => 'Instagram Direct',
                'category' => 'LEAD INSTAGRAM',
                'unread' => (int)($conv['unreadCount'] ?? 0),
                'lastMsg' => $conv['lastMessage'] ?: 'Interação de Instagram',
                'time' => !empty($conv['updatedTime']) ? date('H:i', strtotime($conv['updatedTime'])) : date('H:i'),
                'instagram_url' => $conv['url'] ?? "https://instagram.com/{$conv['participantUsername']}",
                'stage' => 'Engajamento'
            ];
        }

        return [
            'success' => true,
            'total' => count($mapped),
            'conversations' => $mapped
        ];
    }

    /**
     * Busca mensagens de uma conversa de Instagram Direct
     */
    public function getConversationMessages(string $conversationId, ?string $accountId = null): array {
        $cleanId = str_starts_with($conversationId, 'ig_') ? substr($conversationId, 3) : $conversationId;
        $accId = $accountId ?: $this->defaultAccountId;

        $res = $this->request("/inbox/conversations/{$cleanId}/messages?accountId={$accId}");
        if (!$res['success']) {
            return $res;
        }

        $messages = $res['data']['data'] ?? $res['data']['messages'] ?? (is_array($res['data']) && isset($res['data'][0]) ? $res['data'] : []);
        $mapped = [];

        foreach ($messages as $msg) {
            $isMe = ($msg['direction'] ?? '') === 'outgoing';
            $mapped[] = [
                'id' => $msg['id'] ?? uniqid(),
                'sender' => $isMe ? 'Body Harmony (@bodyharmonyoficial)' : ($msg['senderName'] ?? 'Cliente'),
                'isMe' => $isMe,
                'type' => !empty($msg['attachments']) ? 'MEDIA' : 'TEXT',
                'text' => $msg['message'] ?? '',
                'time' => !empty($msg['createdAt']) ? date('H:i', strtotime($msg['createdAt'])) : date('H:i'),
                'created_at' => $msg['createdAt'] ?? date('c'),
                'attachments' => $msg['attachments'] ?? [],
                'is_story_mention' => (bool)($msg['isStoryMention'] ?? false)
            ];
        }

        return [
            'success' => true,
            'count' => count($mapped),
            'messages' => $mapped
        ];
    }

    /**
     * Envia uma resposta direta (DM) no Instagram
     */
    public function sendDirectMessage(string $conversationId, string $text, array $attachments = []): array {
        $cleanId = str_starts_with($conversationId, 'ig_') ? substr($conversationId, 3) : $conversationId;

        $payload = [
            'message' => $text
        ];
        if (!empty($attachments)) {
            $payload['attachments'] = $attachments;
        }

        return $this->request("/inbox/conversations/{$cleanId}/messages", 'POST', $payload);
    }

    /**
     * Marca uma conversa como lida
     */
    public function markConversationRead(string $conversationId): array {
        $cleanId = str_starts_with($conversationId, 'ig_') ? substr($conversationId, 3) : $conversationId;
        return $this->request("/inbox/conversations/{$cleanId}/read", 'POST');
    }
}
