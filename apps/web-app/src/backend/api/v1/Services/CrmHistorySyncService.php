<?php
namespace BodyHarmony\Services;

use PDO;
use Exception;

/**
 * ==============================================================================
 * CRM HISTORY SYNC SERVICE — IMPORT & EXPORT ENGINE (PLAN-165)
 * ==============================================================================
 * Nexus Protocol V3.1 — Ingestão Retroativa com Preservação de Timestamps Originais,
 * Normalização Telefônica, Enriquecimento com Licenciadas e Exportação Compilada.
 * ==============================================================================
 */
class CrmHistorySyncService {
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
        $this->chatwootUrl = $chatwootUrl ?? getenv('CHATWOOT_URL') ?: 'https://crm.bodyharmony.com.br';
        $this->apiToken = $apiToken ?? getenv('CHATWOOT_API_TOKEN') ?: 'wxvcKsycZEXjrqM7dxD72oNm';
        $this->accountId = $accountId;
    }

    /**
     * Normaliza telefone brasileiro e extrai variações.
     */
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

    /**
     * Localiza metadados da Licenciada pelo telefone.
     */
    public function findLicenciadaByPhone(string $phone): ?array {
        if (!$this->db) return null;

        $phoneData = $this->normalizePhone($phone);
        $p8 = '%' . $phoneData['last8'];
        $p9 = '%' . $phoneData['last9'];

        try {
            // REGRA 8 e 12: Mapeamento estrito de colunas em 'licenciadas'
            $stmt = $this->db->prepare("
                SELECT id, name, cpf, whatsapp, email, location, state 
                FROM licenciadas 
                WHERE (whatsapp LIKE :p8 OR whatsapp LIKE :p9)
                AND is_active = 1 
                LIMIT 1
            ");
            $stmt->execute([':p8' => $p8, ':p9' => $p9]);
            $lic = $stmt->fetch(PDO::FETCH_ASSOC);
            return $lic ?: null;
        } catch (\Throwable $e) {
            error_log("[CRM_HISTORY_SYNC] Error matching licenciada: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Importa lote de mensagens para uma caixa de entrada no Chatwoot.
     *
     * @param int $inboxId ID da caixa de entrada
     * @param array $messages Lista de mensagens [{ phone, content, created_at, message_type, sender_name }]
     * @return array
     */
    public function importHistory(int $inboxId, array $messages): array {
        if ($inboxId <= 0) {
            throw new Exception("ID da caixa de entrada inválido.");
        }

        if (empty($messages)) {
            throw new Exception("Nenhuma mensagem fornecida para importação.");
        }

        $totalReceived = count($messages);
        $importedCount = 0;
        $skippedCount = 0;
        $contactsMatched = 0;
        $processedHashes = [];

        // Modo Mock para testes rápidos / CLI
        if ($this->chatwootUrl === 'mock') {
            foreach ($messages as $msg) {
                if (empty($msg['phone']) || empty($msg['content'])) {
                    $skippedCount++;
                    continue;
                }
                $lic = $this->findLicenciadaByPhone($msg['phone']);
                if ($lic) {
                    $contactsMatched++;
                }
                $importedCount++;
            }

            return [
                'status' => 'success',
                'data' => [
                    'total_received' => $totalReceived,
                    'imported_count' => $importedCount,
                    'skipped_count' => $skippedCount,
                    'contacts_matched' => $contactsMatched
                ],
                'message' => "Importação concluída no modo simulado ({$importedCount} mensagens importadas)."
            ];
        }

        // Cache de contatos e conversas abertas na execução atual
        $contactCache = []; // phone => contact_id
        $conversationCache = []; // contact_id => conversation_id

        foreach ($messages as $msg) {
            $phone = trim($msg['phone'] ?? '');
            $content = trim($msg['content'] ?? '');

            if (empty($phone) || empty($content)) {
                $skippedCount++;
                continue;
            }

            // Deduplicação básica no mesmo lote
            $msgTimestamp = !empty($msg['created_at']) 
                ? (is_numeric($msg['created_at']) ? (int)$msg['created_at'] : strtotime($msg['created_at']))
                : time();

            $hash = md5($phone . '|' . $content . '|' . floor($msgTimestamp / 60));
            if (isset($processedHashes[$hash])) {
                $skippedCount++;
                continue;
            }
            $processedHashes[$hash] = true;

            $normPhone = $this->normalizePhone($phone);
            $lic = $this->findLicenciadaByPhone($phone);
            if ($lic) {
                $contactsMatched++;
            }

            $contactName = $msg['sender_name'] ?? ($lic['name'] ?? 'Contato ' . $normPhone['formatted_e164']);

            try {
                // 1. Obter ou Criar Contato no Chatwoot
                if (!isset($contactCache[$normPhone['formatted_e164']])) {
                    $contactId = $this->findOrCreateContact($normPhone['formatted_e164'], $contactName, $lic);
                    $contactCache[$normPhone['formatted_e164']] = $contactId;
                } else {
                    $contactId = $contactCache[$normPhone['formatted_e164']];
                }

                if (!$contactId) {
                    $skippedCount++;
                    continue;
                }

                // 2. Obter ou Criar Conversa na Caixa de Entrada
                if (!isset($conversationCache[$contactId])) {
                    $convId = $this->findOrCreateConversation($inboxId, $contactId);
                    $conversationCache[$contactId] = $convId;
                } else {
                    $convId = $conversationCache[$contactId];
                }

                if (!$convId) {
                    $skippedCount++;
                    continue;
                }

                // 3. Injetar Mensagem com Timestamp Original
                $msgType = strtolower($msg['message_type'] ?? 'incoming') === 'outgoing' ? 1 : 0;
                $success = $this->createMessage($convId, $content, $msgType, $msgTimestamp);

                if ($success) {
                    $importedCount++;
                } else {
                    $skippedCount++;
                }
            } catch (\Throwable $e) {
                error_log("[CRM_IMPORT_ERR] Falha ao processar mensagem: " . $e->getMessage());
                $skippedCount++;
            }
        }

        return [
            'status' => 'success',
            'data' => [
                'total_received' => $totalReceived,
                'imported_count' => $importedCount,
                'skipped_count' => $skippedCount,
                'contacts_matched' => $contactsMatched
            ],
            'message' => "Processamento concluído com sucesso ({$importedCount} mensagens importadas)."
        ];
    }

    /**
     * Exporta histórico de conversas de uma caixa de entrada.
     */
    public function exportHistory(int $inboxId, string $format = 'json'): array {
        if ($inboxId <= 0) {
            throw new Exception("ID da caixa de entrada inválido.");
        }

        if ($this->chatwootUrl === 'mock') {
            return [
                'status' => 'success',
                'data' => [
                    'inbox_id' => $inboxId,
                    'exported_at' => date('c'),
                    'total_conversations' => 1,
                    'conversations' => [
                        [
                            'id' => 101,
                            'contact' => [
                                'name' => 'Licenciada Exemplo',
                                'phone_number' => '+5518999999999',
                                'cpf' => '000.000.000-00'
                            ],
                            'messages_count' => 2,
                            'messages' => [
                                [
                                    'id' => 1001,
                                    'content' => 'Olá, preciso do contrato atualizado.',
                                    'message_type' => 'incoming',
                                    'created_at' => time() - 3600
                                ],
                                [
                                    'id' => 1002,
                                    'content' => 'Olá! Seu contrato foi enviado com sucesso.',
                                    'message_type' => 'outgoing',
                                    'created_at' => time() - 3000
                                ]
                            ]
                        ]
                    ]
                ]
            ];
        }

        $endpoint = rtrim($this->chatwootUrl, '/') . "/api/v1/accounts/{$this->accountId}/conversations?inbox_id={$inboxId}&status=all&api_access_token=" . urlencode($this->apiToken);
        $convsRes = $this->execCurl($endpoint, 'GET');

        $conversations = [];
        if ($convsRes['http_code'] >= 200 && $convsRes['http_code'] < 300) {
            $convsData = json_decode($convsRes['body'], true) ?: [];
            $rawList = $convsData['data']['payload'] ?? ($convsData['payload'] ?? []);

            foreach ($rawList as $conv) {
                $convId = $conv['id'] ?? null;
                if (!$convId) continue;

                // Buscar mensagens da conversa
                $msgEndpoint = rtrim($this->chatwootUrl, '/') . "/api/v1/accounts/{$this->accountId}/conversations/{$convId}/messages?api_access_token=" . urlencode($this->apiToken);
                $msgRes = $this->execCurl($msgEndpoint, 'GET');
                $messages = [];
                if ($msgRes['http_code'] >= 200 && $msgRes['http_code'] < 300) {
                    $msgData = json_decode($msgRes['body'], true) ?: [];
                    $rawMsgs = $msgData['payload'] ?? [];
                    foreach ($rawMsgs as $m) {
                        $messages[] = [
                            'id' => $m['id'] ?? null,
                            'content' => $m['content'] ?? '',
                            'message_type' => ($m['message_type'] ?? 0) === 1 ? 'outgoing' : 'incoming',
                            'created_at' => $m['created_at'] ?? time(),
                            'sender' => $m['sender']['name'] ?? 'Desconhecido'
                        ];
                    }
                }

                $metaLic = null;
                $phone = $conv['meta']['sender']['phone_number'] ?? null;
                if ($phone) {
                    $metaLic = $this->findLicenciadaByPhone($phone);
                }

                $conversations[] = [
                    'id' => $convId,
                    'contact' => [
                        'name' => $conv['meta']['sender']['name'] ?? 'Sem Nome',
                        'phone_number' => $phone,
                        'cpf' => $metaLic['cpf'] ?? null,
                        'cidade' => $metaLic['location'] ?? null,
                        'uf' => $metaLic['state'] ?? null
                    ],
                    'status' => $conv['status'] ?? 'open',
                    'messages_count' => count($messages),
                    'messages' => $messages
                ];
            }
        }

        return [
            'status' => 'success',
            'data' => [
                'inbox_id' => $inboxId,
                'exported_at' => date('c'),
                'total_conversations' => count($conversations),
                'conversations' => $conversations
            ]
        ];
    }

    private function findOrCreateContact(string $phone, string $name, ?array $lic = null): ?int {
        $endpoint = rtrim($this->chatwootUrl, '/') . "/api/v1/accounts/{$this->accountId}/contacts?api_access_token=" . urlencode($this->apiToken);
        $payload = [
            'name' => $name,
            'phone_number' => $phone,
            'custom_attributes' => [
                'cpf' => $lic['cpf'] ?? '',
                'cidade' => $lic['location'] ?? '',
                'uf' => $lic['state'] ?? '',
                'importado_via' => 'PLAN-165'
            ]
        ];

        $res = $this->execCurl($endpoint, 'POST', $payload);
        if ($res['http_code'] >= 200 && $res['http_code'] < 300) {
            $data = json_decode($res['body'], true) ?: [];
            return $data['payload']['contact']['id'] ?? ($data['id'] ?? null);
        }

        // Se contato já existe, busca por telefone
        $searchEndpoint = rtrim($this->chatwootUrl, '/') . "/api/v1/accounts/{$this->accountId}/contacts/search?q=" . urlencode($phone) . "&api_access_token=" . urlencode($this->apiToken);
        $searchRes = $this->execCurl($searchEndpoint, 'GET');
        if ($searchRes['http_code'] >= 200 && $searchRes['http_code'] < 300) {
            $sData = json_decode($searchRes['body'], true) ?: [];
            $first = $sData['payload'][0] ?? null;
            return $first['id'] ?? null;
        }

        return null;
    }

    private function findOrCreateConversation(int $inboxId, int $contactId): ?int {
        $endpoint = rtrim($this->chatwootUrl, '/') . "/api/v1/accounts/{$this->accountId}/conversations?api_access_token=" . urlencode($this->apiToken);
        $payload = [
            'inbox_id' => $inboxId,
            'contact_id' => $contactId,
            'status' => 'open'
        ];

        $res = $this->execCurl($endpoint, 'POST', $payload);
        if ($res['http_code'] >= 200 && $res['http_code'] < 300) {
            $data = json_decode($res['body'], true) ?: [];
            return $data['id'] ?? null;
        }

        return null;
    }

    private function createMessage(int $conversationId, string $content, int $msgType, int $timestamp): bool {
        $endpoint = rtrim($this->chatwootUrl, '/') . "/api/v1/accounts/{$this->accountId}/conversations/{$conversationId}/messages?api_access_token=" . urlencode($this->apiToken);
        $payload = [
            'content' => $content,
            'message_type' => $msgType,
            'private' => false,
            'created_at' => $timestamp
        ];

        $res = $this->execCurl($endpoint, 'POST', $payload);
        return ($res['http_code'] >= 200 && $res['http_code'] < 300);
    }

    private function execCurl(string $url, string $method = 'GET', ?array $data = null): array {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $headers = [
            'Content-Type: application/json',
            'api_access_token: ' . $this->apiToken,
            'api-access-token: ' . $this->apiToken
        ];

        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        return [
            'http_code' => $httpCode,
            'body' => $body,
            'error' => $error ?: null
        ];
    }
}
