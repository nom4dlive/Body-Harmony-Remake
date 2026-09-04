<?php
// apps/web-app/src/backend/api/v1/Services/EvolutionApiService.php
namespace BodyHarmony\Services;

use Exception;

class EvolutionApiService {
    private string $baseUrl;
    private string $globalKey;

    public function __construct() {
        $this->baseUrl = rtrim(getenv('EVOLUTION_API_URL') ?: 'https://evolution.bodyharmony.com.br', '/');
        $this->globalKey = getenv('EVOLUTION_API_KEY') ?: 'bh_evo_global_key_v31_2026_secure';
    }

    private function request(string $endpoint, string $method = 'GET', array $data = []): array {
        $url = $this->baseUrl . $endpoint;
        $ch = curl_init($url);
        
        $headers = [
            'Content-Type: application/json',
            'apikey: ' . $this->globalKey
        ];

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        if (!empty($data) && $method !== 'GET') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            error_log("[EVO_API_WARN] cURL Error on {$endpoint}: " . $error);
            return [
                'status' => 500,
                'error' => $error,
                'data' => []
            ];
        }

        $decoded = json_decode((string)$response, true);
        return [
            'status' => $httpCode,
            'data' => $decoded ?: []
        ];
    }

    public function createInstance(string $instanceName, string $token = ''): array {
        $payload = [
            'instanceName' => $instanceName,
            'token' => $token ?: ('token_' . $instanceName . '_v31'),
            'qrcode' => true,
            'integration' => 'WHATSAPP-BAILEYS'
        ];
        
        return $this->request('/instance/create', 'POST', $payload);
    }

    public function connectInstance(string $instanceName): array {
        return $this->request('/instance/connect/' . urlencode($instanceName), 'GET');
    }

    public function getOrGenerateQrCode(string $instanceName): array {
        $res = $this->connectInstance($instanceName);
        $base64 = $res['data']['base64'] ?? ($res['data']['qrcode']['base64'] ?? '');
        $pairingCode = $res['data']['pairingCode'] ?? null;

        if (empty($base64) && ($res['status'] === 404 || empty($res['data']))) {
            $createRes = $this->createInstance($instanceName);
            $base64 = $createRes['data']['qrcode']['base64'] ?? ($createRes['data']['base64'] ?? '');
            $pairingCode = $createRes['data']['pairingCode'] ?? $pairingCode;

            if (empty($base64)) {
                $connectRes = $this->connectInstance($instanceName);
                $base64 = $connectRes['data']['base64'] ?? ($connectRes['data']['qrcode']['base64'] ?? '');
                $pairingCode = $connectRes['data']['pairingCode'] ?? $pairingCode;
            }
        }

        return [
            'success' => !empty($base64) || !empty($pairingCode),
            'qr' => $base64,
            'pairingCode' => $pairingCode,
            'status' => $res['status']
        ];
    }

    public function logoutInstance(string $instanceName): array {
        return $this->request('/instance/logout/' . urlencode($instanceName), 'DELETE');
    }

    public function deleteInstance(string $instanceName): array {
        return $this->request('/instance/delete/' . urlencode($instanceName), 'DELETE');
    }

    public function fetchInstances(): array {
        return $this->request('/instance/fetchInstances', 'GET');
    }

    /**
     * Configura Webhook direto da Evolution API v2 para o backend PHP
     */
    public function setWebhook(string $instanceName, string $webhookUrl, array $events = ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE', 'QRCODE_UPDATED']): array {
        $payload = [
            'webhook' => [
                'enabled' => true,
                'url' => $webhookUrl,
                'webhook_by_events' => false,
                'events' => $events
            ]
        ];

        return $this->request('/webhook/set/' . urlencode($instanceName), 'POST', $payload);
    }

    /**
     * Consulta status do webhook da instância
     */
    public function findWebhook(string $instanceName): array {
        return $this->request('/webhook/find/' . urlencode($instanceName), 'GET');
    }

    /**
     * Dispara mensagem de texto simples com suporte a quote (Evolution API v2)
     */
    public function sendTextMessage(string $instanceName, string $phone, string $text, ?string $quotedMessageId = null): array {
        if (str_contains($phone, '@g.us') || str_contains($phone, '@s.whatsapp.net') || str_contains($phone, '@lid')) {
            $target = trim($phone);
        } else {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            if (!str_starts_with($cleanPhone, '55')) {
                $cleanPhone = '55' . $cleanPhone;
            }
            $target = $cleanPhone;
        }

        $payload = [
            'number' => $target,
            'text' => $text,
            'delay' => 600
        ];

        if (!empty($quotedMessageId)) {
            $payload['quoted'] = [
                'key' => [
                    'id' => $quotedMessageId
                ]
            ];
        }

        return $this->request('/message/sendText/' . urlencode($instanceName), 'POST', $payload);
    }

    /**
     * Dispara áudio simulando nota de voz gravada na hora (PTT - Evolution API v2)
     */
    public function sendWhatsAppAudio(string $instanceName, string $phone, string $audioUrl): array {
        if (str_contains($phone, '@g.us') || str_contains($phone, '@s.whatsapp.net') || str_contains($phone, '@lid')) {
            $target = trim($phone);
        } else {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            if (!str_starts_with($cleanPhone, '55')) {
                $cleanPhone = '55' . $cleanPhone;
            }
            $target = $cleanPhone;
        }

        $payload = [
            'number' => $target,
            'audio' => $audioUrl,
            'delay' => 600,
            'encoding' => true
        ];

        return $this->request('/message/sendWhatsAppAudio/' . urlencode($instanceName), 'POST', $payload);
    }

    /**
     * Envia documento, foto ou vídeo (Evolution API v2)
     */
    public function sendMedia(string $instanceName, string $phone, string $mediaUrl, string $mediaType = 'document', string $caption = '', string $fileName = '', ?string $quotedMessageId = null): array {
        if (str_contains($phone, '@g.us') || str_contains($phone, '@s.whatsapp.net') || str_contains($phone, '@lid')) {
            $target = trim($phone);
        } else {
            $cleanPhone = preg_replace('/\D/', '', $phone);
            if (!str_starts_with($cleanPhone, '55')) {
                $cleanPhone = '55' . $cleanPhone;
            }
            $target = $cleanPhone;
        }

        $payload = [
            'number' => $target,
            'mediatype' => $mediaType, // 'image', 'document', 'video'
            'media' => $mediaUrl,
            'caption' => $caption,
            'fileName' => $fileName ?: basename($mediaUrl),
            'delay' => 600
        ];

        if (!empty($quotedMessageId)) {
            $payload['quoted'] = [
                'key' => [
                    'id' => $quotedMessageId
                ]
            ];
        }

        return $this->request('/message/sendMedia/' . urlencode($instanceName), 'POST', $payload);
    }

    /**
     * Busca foto oficial de perfil do WhatsApp
     */
    public function fetchProfilePicture(string $instanceName, string $phone): ?string {
        $cleanPhone = preg_replace('/\D/', '', $phone);
        if (!str_starts_with($cleanPhone, '55')) {
            $cleanPhone = '55' . $cleanPhone;
        }

        $payload = [
            'number' => $cleanPhone
        ];

        $res = $this->request('/chat/fetchProfilePictureUrl/' . urlencode($instanceName), 'POST', $payload);
        return $res['data']['profilePictureUrl'] ?? null;
    }

    /**
     * Valida se número existe no WhatsApp
     */
    public function checkWhatsAppNumber(string $instanceName, string $phone): bool {
        $cleanPhone = preg_replace('/\D/', '', $phone);
        if (!str_starts_with($cleanPhone, '55')) {
            $cleanPhone = '55' . $cleanPhone;
        }

        $payload = [
            'numbers' => [$cleanPhone]
        ];

        $res = $this->request('/chat/whatsappNumbers/' . urlencode($instanceName), 'POST', $payload);
        $result = $res['data'][0] ?? [];
        return !empty($result['exists']);
    }

    /**
     * Consulta chats recentes na Evolution API v2 (/chat/findChats/{instance})
     */
    public function findChats(string $instanceName, int $limit = 25): array {
        $payload = [
            'limit' => $limit
        ];
        return $this->request('/chat/findChats/' . urlencode($instanceName), 'POST', $payload);
    }

    /**
     * Consulta mensagens de um chat na Evolution API v2 (/chat/findMessages/{instance})
     */
    public function findMessages(string $instanceName, string $remoteJid, int $limit = 30): array {
        $payload = [
            'where' => [
                'key' => [
                    'remoteJid' => $remoteJid
                ]
            ],
            'limit' => $limit
        ];
        return $this->request('/chat/findMessages/' . urlencode($instanceName), 'POST', $payload);
    }
}
