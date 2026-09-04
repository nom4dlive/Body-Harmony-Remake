<?php
namespace BodyHarmony\Services;

use PDO;
use Exception;

/**
 * ==============================================================================
 * BURNER DISPATCH SERVICE — ANTI-BAN MASS DISPATCH & LEAD HANDOFF (PLAN-155)
 * ==============================================================================
 * Nexus Protocol V3.1 — Motor de Disparos em Massa com Rotação de Burners,
 * Spintax Dinâmico, Delays Randômicos e Handoff Automático para o Comercial
 * ==============================================================================
 */
class BurnerDispatchService {
    private $db;
    private $redis;
    private array $burnerPool;
    private int $currentIndex = -1;
    private string $evolutionUrl;
    private string $evolutionKey;
    private string $chatwootUrl;
    private string $chatwootToken;
    private int $commercialInboxId;
    private int $accountId;

    public function __construct(
        mixed $db = null,
        mixed $redis = null,
        array $burnerPool = ['inst_burner_01', 'inst_burner_02'],
        ?string $evolutionUrl = null,
        ?string $evolutionKey = null,
        ?string $chatwootUrl = null,
        ?string $chatwootToken = null,
        int $commercialInboxId = 3,
        int $accountId = 1
    ) {
        $this->db = $db;
        $this->redis = $redis;
        $this->burnerPool = !empty($burnerPool) ? $burnerPool : ['inst_burner_01', 'inst_burner_02'];
        $this->evolutionUrl = $evolutionUrl ?? getenv('EVOLUTION_URL') ?: 'http://127.0.0.1:8085';
        $this->evolutionKey = $evolutionKey ?? getenv('EVOLUTION_API_KEY') ?: 'bh_evo_global_key_v31_2026_secure';
        $this->chatwootUrl = $chatwootUrl ?? getenv('CHATWOOT_URL') ?: 'http://127.0.0.1:3005';
        $this->chatwootToken = $chatwootToken ?? getenv('CHATWOOT_API_TOKEN') ?: 'wxvcKsycZEXjrqM7dxD72oNm';
        $this->commercialInboxId = $commercialInboxId;
        $this->accountId = $accountId;
    }

    /**
     * Parser recursivo de Spintax dinâmico {opcao1|opcao2|...} para evitar detecção de spam.
     */
    public function parseSpintax(string $text): string {
        $pattern = '/\{([^{}]+)\}/';
        while (preg_match($pattern, $text)) {
            $text = preg_replace_callback($pattern, function ($matches) {
                $choices = explode('|', $matches[1]);
                return trim($choices[array_rand($choices)]);
            }, $text);
        }
        return $text;
    }

    /**
     * Calcula delay randômico em segundos (default: 30s a 70s) para salvaguarda anti-ban.
     */
    public function calculateRandomDelay(int $min = 30, int $max = 70): int {
        if ($min > $max) {
            $temp = $min;
            $min = $max;
            $max = $temp;
        }
        return random_int($min, $max);
    }

    /**
     * Retorna a próxima instância descartável utilizando rotação Round-Robin.
     */
    public function getNextBurnerInstance(array $customPool = []): string {
        $pool = !empty($customPool) ? $customPool : $this->burnerPool;
        if (empty($pool)) {
            return 'inst_burner_01';
        }

        // Se Redis disponível, incrementa contador atômico
        if ($this->redis && method_exists($this->redis, 'incr')) {
            try {
                $index = $this->redis->incr('crm:burner:index');
                return $pool[$index % count($pool)];
            } catch (\Throwable $e) {}
        }

        // Fallback para rotação em memória
        $this->currentIndex = ($this->currentIndex + 1) % count($pool);
        return $pool[$this->currentIndex];
    }

    /**
     * Enfileira uma campanha de prospecção para múltiplos destinatários.
     */
    public function enqueueCampaign(array $recipients, string $messageTemplate, array $options = []): array {
        $minDelay = (int)($options['min_delay'] ?? 30);
        $maxDelay = (int)($options['max_delay'] ?? 70);
        $pool = $options['burner_pool'] ?? $this->burnerPool;

        $items = [];
        $accumulatedDelay = 0;

        foreach ($recipients as $recipient) {
            $phone = preg_replace('/\D/', '', (string)$recipient);
            if (empty($phone)) continue;

            $delay = $this->calculateRandomDelay($minDelay, $maxDelay);
            $accumulatedDelay += $delay;
            $instance = $this->getNextBurnerInstance($pool);
            $parsedMessage = $this->parseSpintax($messageTemplate);

            $item = [
                'phone' => $phone,
                'instance' => $instance,
                'message' => $parsedMessage,
                'delay_seconds' => $delay,
                'scheduled_offset' => $accumulatedDelay,
                'created_at' => date('c')
            ];

            $items[] = $item;

            // Se Redis disponível, adiciona na fila de envio
            if ($this->redis && method_exists($this->redis, 'rPush')) {
                try {
                    $this->redis->rPush('crm:burner:dispatch_queue', json_encode($item));
                } catch (\Throwable $e) {}
            }
        }

        return [
            'success' => true,
            'total_queued' => count($items),
            'estimated_duration_seconds' => $accumulatedDelay,
            'burner_pool' => $pool,
            'queue_preview' => array_slice($items, 0, 5)
        ];
    }

    /**
     * Executa o disparo de uma mensagem individual com delay e simulação de presença humana.
     */
    public function dispatchSingle(
        string $phone,
        string $messageTemplate,
        ?string $forcedInstance = null,
        ?string $evoUrl = null,
        ?string $globalKey = null
    ): array {
        $url = $evoUrl ?? $this->evolutionUrl;
        $key = $globalKey ?? $this->evolutionKey;
        $instance = $forcedInstance ?: $this->getNextBurnerInstance();
        $finalMessage = $this->parseSpintax($messageTemplate);
        $delay = $this->calculateRandomDelay(30, 70);

        // Modo Mock para testes CLI sem rede ativa
        if ($url === 'mock') {
            return [
                'success' => true,
                'mock' => true,
                'phone' => $phone,
                'instance' => $instance,
                'message' => $finalMessage,
                'simulated_delay' => $delay,
                'typing_presence_ms' => 2500,
                'status' => 'DISPATCHED_MOCK'
            ];
        }

        $cleanPhone = preg_replace('/\D/', '', $phone);
        if (!str_starts_with($cleanPhone, '55')) {
            $cleanPhone = '55' . $cleanPhone;
        }

        $endpoint = rtrim($url, '/') . "/message/sendText/{$instance}";
        $payload = [
            'number' => $cleanPhone,
            'options' => [
                'delay' => random_int(2000, 4500), // Digitação humana (2s a 4.5s)
                'presence' => 'composing',
                'linkPreview' => true
            ],
            'textMessage' => [
                'text' => $finalMessage
            ]
        ];

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'apikey: ' . $key
            ],
            CURLOPT_TIMEOUT => 10
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        $success = ($httpCode >= 200 && $httpCode < 300);

        return [
            'success' => $success,
            'http_code' => $httpCode,
            'error' => $error ?: null,
            'phone' => $phone,
            'instance' => $instance,
            'message' => $finalMessage,
            'response' => json_decode((string)$response, true)
        ];
    }

    /**
     * HANDOFF INTELIGENTE DE LEADS:
     * Intercepta respostas nos números descartáveis, cadastra em `shop_leads` e
     * cria/atribui atendimento na Inbox Comercial do Chatwoot.
     */
    public function handleIncomingBurnerMessage(
        string $burnerInstance,
        string $fromPhone,
        string $messageText,
        ?string $senderName = null,
        ?string $chatwootUrl = null,
        ?string $apiToken = null
    ): array {
        $url = $chatwootUrl ?? $this->chatwootUrl;
        $token = $apiToken ?? $this->chatwootToken;
        $cleanPhone = preg_replace('/\D/', '', $fromPhone);
        $leadName = $senderName ?: 'Lead WhatsApp (' . substr($cleanPhone, -4) . ')';

        $leadCreated = false;
        $leadId = null;

        // 1. Cadastra ou atualiza o Lead na tabela `shop_leads`
        if ($this->db) {
            try {
                $stmt = $this->db->prepare("
                    SELECT id FROM shop_leads 
                    WHERE whatsapp LIKE :phone 
                    LIMIT 1
                ");
                $stmt->execute([':phone' => '%' . substr($cleanPhone, -8) . '%']);
                $existingId = $stmt->fetchColumn();

                if ($existingId) {
                    $leadId = (int)$existingId;
                    $upStmt = $this->db->prepare("
                        UPDATE shop_leads 
                        SET status = 'LEAD_QUENTE', name = COALESCE(NULLIF(:name, ''), name)
                        WHERE id = :id
                    ");
                    $upStmt->execute([':name' => $leadName, ':id' => $leadId]);
                } else {
                    $inStmt = $this->db->prepare("
                        INSERT INTO shop_leads (name, whatsapp, status)
                        VALUES (:name, :whatsapp, 'LEAD_QUENTE')
                    ");
                    $inStmt->execute([':name' => $leadName, ':whatsapp' => $cleanPhone]);
                    $leadId = (int)$this->db->lastInsertId();
                    $leadCreated = true;
                }
            } catch (\Throwable $e) {
                // Tratamento defensivo em caso de tabela ausente ou schema mock
            }
        }

        // 2. Encaminha ou cria Ticket na Inbox Comercial do Chatwoot
        $chatwootHandoff = [
            'success' => true,
            'commercial_inbox_id' => $this->commercialInboxId,
            'account_id' => $this->accountId,
            'tags' => ['lead-quente', 'origem-burner', $burnerInstance]
        ];

        if ($url !== 'mock') {
            // Chamada à API do Chatwoot para registrar/atualizar contato com tag comercial
            $contactEndpoint = rtrim($url, '/') . "/api/v1/accounts/{$this->accountId}/contacts";
            $contactPayload = [
                'name' => $leadName,
                'phone_number' => str_starts_with($cleanPhone, '+') ? $cleanPhone : '+' . $cleanPhone,
                'custom_attributes' => [
                    'origem' => 'burner_prospecting',
                    'instancia_burner' => $burnerInstance,
                    'status_prospeccao' => 'LEAD_QUENTE_RESPONDIDO'
                ]
            ];

            $ch = curl_init($contactEndpoint);
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($contactPayload),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'api_access_token: ' . $token
                ],
                CURLOPT_TIMEOUT => 6
            ]);
            $resp = curl_exec($ch);
            curl_close($ch);
            $chatwootHandoff['api_response'] = json_decode((string)$resp, true);
        }

        return [
            'burner_instance' => $burnerInstance,
            'from_phone' => $fromPhone,
            'message_text' => $messageText,
            'sender_name' => $leadName,
            'lead_created' => $leadCreated || $leadId !== null,
            'lead_id' => $leadId,
            'commercial_inbox_id' => $this->commercialInboxId,
            'ticket_status' => 'ATRIBUIDO_COMERCIAL_KAPRICE',
            'chatwoot_handoff' => $chatwootHandoff
        ];
    }
}
