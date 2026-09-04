<?php
namespace BodyHarmony\Services;

use PDO;
use Exception;

/**
 * ==============================================================================
 * CRM BRIDGE SERVICE — AUTO-LINKER & REACTIVE TRIGGERS (PLAN-153 a PLAN-155)
 * ==============================================================================
 * Nexus Protocol V3.1 — Resolução Inteligente, Normalização de 9º Dígito,
 * Dossiê 360º Embed e Gatilhos Tolerantes a Falhas (Jurídico & Licenciadas)
 * ==============================================================================
 */
class CrmBridgeService {
    private $db;
    private string $defaultChatwootUrl;
    private string $defaultApiToken;
    private int $defaultAccountId;
    private string $defaultEvolutionUrl;
    private string $defaultEvolutionKey;

    public function __construct(
        mixed $db = null,
        ?string $chatwootUrl = null,
        ?string $apiToken = null,
        int $accountId = 1,
        ?string $evolutionUrl = null,
        ?string $evolutionKey = null
    ) {
        $this->db = $db;
        $this->defaultChatwootUrl = $chatwootUrl ?? getenv('CHATWOOT_URL') ?: 'https://crm.bodyharmony.com.br';
        $this->defaultApiToken = $apiToken ?? getenv('CHATWOOT_API_TOKEN') ?: 'wxvcKsycZEXjrqM7dxD72oNm';
        $this->defaultAccountId = $accountId;
        $this->defaultEvolutionUrl = $evolutionUrl ?? getenv('EVOLUTION_URL') ?: 'https://evolution.bodyharmony.com.br';
        $this->defaultEvolutionKey = $evolutionKey ?? getenv('EVOLUTION_API_KEY') ?: 'bh_evo_global_key_v31_2026_secure';
    }

    /**
     * Normaliza e extrai variações defensivas de um número de telefone brasileiro.
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
            'last8' => $last8,
            'last9' => $last9,
            'ddd' => $ddd
        ];
    }

    /**
     * Resolve um contato a partir do número de telefone consultando em cascata as tabelas mestres.
     * Suporta normalização de 9º dígito e matching ultra-resiliente no MySQL.
     */
    public function resolveContactByPhone(string $phone, ?string $email = null): array {
        if (!$this->db) {
            return $this->buildFallbackResponse($phone);
        }

        $norm = $this->normalizePhone($phone);
        $clean = $norm['digits'];
        $cleanNo55 = $norm['digits_no_55'];
        $suffix8 = $norm['last8'];
        $suffix9 = $norm['last9'];

        $pFull = '%' . $cleanNo55 . '%';
        $p8 = '%' . $suffix8 . '%';
        $p9 = '%' . $suffix9 . '%';

        // ---------------------------------------------------------------------
        // 1. Consulta na tabela mestre `licenciadas` (REGRA 8: colunas estritas)
        // ---------------------------------------------------------------------
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, cpf, whatsapp, email, location, state, photo_url, is_active, created_at
                FROM licenciadas
                WHERE (
                    whatsapp LIKE :full 
                    OR whatsapp LIKE :p8 
                    OR whatsapp LIKE :p9
                    OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(whatsapp, '(', ''), ')', ''), '-', ''), ' ', ''), '+', '') LIKE :p8
                )
                ORDER BY is_active DESC, id ASC
                LIMIT 1
            ");
            $stmt->execute([':full' => $pFull, ':p8' => $p8, ':p9' => $p9]);
            $lic = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($lic) {
                $cpf = $lic['cpf'] ?? null;
                $contractInfo = $this->lookupContractDetails($cpf, $p8, $p9);
                $contractStatus = $contractInfo['status'] ?? ($lic['is_active'] ? 'LICENCIADA_ATIVA' : 'LICENCIADA_INATIVA');
                $cidadeUf = trim(($lic['location'] ?? '') . ' / ' . ($lic['state'] ?? ''), ' /');

                return [
                    'matched' => true,
                    'tipo_usuario' => 'LICENCIADA',
                    'nome' => $lic['name'],
                    'cpf' => $cpf,
                    'status_contrato' => $contractStatus,
                    'cidade_uf' => $cidadeUf ?: 'Não informada',
                    'entity_id' => (int)$lic['id'],
                    'entity_type' => 'licenciadas',
                    'email' => $lic['email'] ?? null,
                    'photo_url' => $lic['photo_url'] ?? null,
                    'contract_details' => $contractInfo
                ];
            }
        } catch (\Throwable $e) {}

        // ---------------------------------------------------------------------
        // 2. Consulta na tabela `contracts` (Alunas / Clientes de Contrato)
        // ---------------------------------------------------------------------
        try {
            $stmt = $this->db->prepare("
                SELECT id, contract_number, template_id, client_name, client_document, client_phone, client_email, client_city, client_state, status, pdf_url, sign_token, created_at
                FROM contracts
                WHERE (client_phone LIKE :p8 OR client_phone LIKE :p9 OR client_phone LIKE :full)
                ORDER BY id DESC
                LIMIT 1
            ");
            $stmt->execute([':p8' => $p8, ':p9' => $p9, ':full' => $pFull]);
            $ctr = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($ctr) {
                $cidadeUf = trim(($ctr['client_city'] ?? '') . ' / ' . ($ctr['client_state'] ?? ''), ' /');
                return [
                    'matched' => true,
                    'tipo_usuario' => 'ALUNA',
                    'nome' => $ctr['client_name'],
                    'cpf' => $ctr['client_document'] ?? null,
                    'status_contrato' => $ctr['status'] ?? 'SIGNED',
                    'cidade_uf' => $cidadeUf ?: 'Não informada',
                    'entity_id' => (int)$ctr['id'],
                    'entity_type' => 'contracts',
                    'email' => $ctr['client_email'] ?? null,
                    'contract_details' => [
                        'id' => $ctr['id'],
                        'contract_number' => $ctr['contract_number'] ?? null,
                        'status' => $ctr['status'] ?? 'SIGNED',
                        'pdf_url' => $ctr['pdf_url'] ?? null,
                        'sign_url' => !empty($ctr['sign_token']) ? "https://bodyharmony.com.br/assinar/{$ctr['sign_token']}" : null
                    ]
                ];
            }
        } catch (\Throwable $e) {}

        // ---------------------------------------------------------------------
        // 3. Consulta na tabela `licenciada_onboarding_requests`
        // ---------------------------------------------------------------------
        try {
            $stmt = $this->db->prepare("
                SELECT id, full_name, cpf, whatsapp, email, status,
                       COALESCE(cidade, city, '') as cidade, COALESCE(estado, state, '') as estado
                FROM licenciada_onboarding_requests
                WHERE (whatsapp LIKE :p8 OR whatsapp LIKE :p9 OR whatsapp LIKE :full)
                ORDER BY id DESC
                LIMIT 1
            ");
            $stmt->execute([':p8' => $p8, ':p9' => $p9, ':full' => $pFull]);
            $onb = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($onb) {
                $cidadeUf = trim(($onb['cidade'] ?? '') . ' / ' . ($onb['estado'] ?? ''), ' /');
                return [
                    'matched' => true,
                    'tipo_usuario' => 'ONBOARDING',
                    'nome' => $onb['full_name'],
                    'cpf' => $onb['cpf'] ?? null,
                    'status_contrato' => $onb['status'] ?? 'EM_ANALISE',
                    'cidade_uf' => $cidadeUf ?: 'Não informada',
                    'entity_id' => (int)$onb['id'],
                    'entity_type' => 'licenciada_onboarding_requests',
                    'email' => $onb['email'] ?? null
                ];
            }
        } catch (\Throwable $e) {}

        // ---------------------------------------------------------------------
        // 4. Consulta na tabela `shop_leads` (Leads da Loja/Captação)
        // ---------------------------------------------------------------------
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, email, whatsapp, status
                FROM shop_leads
                WHERE (whatsapp LIKE :p8 OR whatsapp LIKE :p9 OR whatsapp LIKE :full)
                ORDER BY id DESC
                LIMIT 1
            ");
            $stmt->execute([':p8' => $p8, ':p9' => $p9, ':full' => $pFull]);
            $lead = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($lead) {
                return [
                    'matched' => true,
                    'tipo_usuario' => 'LEAD',
                    'nome' => $lead['name'],
                    'cpf' => null,
                    'status_contrato' => 'LEAD_PROSPECT',
                    'cidade_uf' => 'Não informada',
                    'entity_id' => (int)$lead['id'],
                    'entity_type' => 'shop_leads',
                    'email' => $lead['email'] ?? null
                ];
            }
        } catch (\Throwable $e) {}

        return $this->buildFallbackResponse($phone);
    }

    /**
     * Busca detalhes completos do contrato por CPF ou telefone.
     */
    private function lookupContractDetails(?string $cpf, string $p8, string $p9): ?array {
        if (!$this->db) return null;
        try {
            $cleanCpf = preg_replace('/\D/', '', $cpf ?? '');
            if ($cleanCpf) {
                $stmt = $this->db->prepare("
                    SELECT id, contract_number, status, pdf_url, sign_token, created_at
                    FROM contracts
                    WHERE client_document LIKE :cpf OR client_phone LIKE :p8 OR client_phone LIKE :p9
                    ORDER BY id DESC
                    LIMIT 1
                ");
                $stmt->execute([':cpf' => '%' . $cleanCpf . '%', ':p8' => $p8, ':p9' => $p9]);
            } else {
                $stmt = $this->db->prepare("
                    SELECT id, contract_number, status, pdf_url, sign_token, created_at
                    FROM contracts
                    WHERE client_phone LIKE :p8 OR client_phone LIKE :p9
                    ORDER BY id DESC
                    LIMIT 1
                ");
                $stmt->execute([':p8' => $p8, ':p9' => $p9]);
            }
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) return null;

            return [
                'id' => $row['id'],
                'contract_number' => $row['contract_number'] ?? null,
                'status' => $row['status'] ?? 'SIGNED',
                'pdf_url' => $row['pdf_url'] ?? null,
                'sign_url' => !empty($row['sign_token']) ? "https://bodyharmony.com.br/assinar/{$row['sign_token']}" : null
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Busca resumo financeiro de taxas para uma licenciada.
     */
    public function lookupFinancialSummary(?int $licenciadaId): array {
        if (!$this->db || !$licenciadaId) {
            return [
                'total_taxas' => 0,
                'status_financeiro' => 'REGULAR',
                'valor_mensalidade' => 'R$ 0,00'
            ];
        }

        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as total_taxas, 
                       SUM(CASE WHEN status = 'paid' OR status = 'contract_signed' THEN 1 ELSE 0 END) as taxas_pagas
                FROM licenciada_taxas
                WHERE licenciada_id = ?
            ");
            $stmt->execute([$licenciadaId]);
            $res = $stmt->fetch(PDO::FETCH_ASSOC);

            return [
                'total_taxas' => (int)($res['total_taxas'] ?? 0),
                'taxas_pagas' => (int)($res['taxas_pagas'] ?? 0),
                'status_financeiro' => ($res['total_taxas'] > 0 && $res['taxas_pagas'] < $res['total_taxas']) ? 'PENDENTE' : 'EM_DIA'
            ];
        } catch (\Throwable $e) {
            return [
                'total_taxas' => 0,
                'status_financeiro' => 'REGULAR'
            ];
        }
    }

    /**
     * Retorna o Dossiê 360º Compacto estruturado para o Embed do Chatwoot e CRM.
     */
    public function getDossierByPhone(string $phone): array {
        $contact = $this->resolveContactByPhone($phone);
        $norm = $this->normalizePhone($phone);

        $contractDetails = $contact['contract_details'] ?? null;
        $isLicenciada = ($contact['tipo_usuario'] === 'LICENCIADA' || $contact['tipo_usuario'] === 'ONBOARDING');
        $financialSummary = $this->lookupFinancialSummary($contact['tipo_usuario'] === 'LICENCIADA' ? $contact['entity_id'] : null);

        $signUrl = $contractDetails['sign_url'] ?? null;
        if (!$signUrl && $contact['tipo_usuario'] === 'ONBOARDING') {
            $signUrl = "https://bodyharmony.com.br/onboarding/{$contact['entity_id']}";
        }

        $licenciadaProfile = null;
        if ($isLicenciada) {
            $licenciadaProfile = [
                'is_active' => true,
                'status_label' => $contact['status_contrato'] ?? 'LICENCIADA ATIVA',
                'congress_discount' => '20% OFF (Exclusivo Licenciadas)',
                'renewal_fee' => 'R$ 800,00 / ano',
                'territory' => 'Raio de 50.000 habitantes',
                'brand_manual_access' => 'LIBERADO (Padrão Luxury Navy/Gold)',
                'responsible_clinical' => 'Dra. Joselene Silva',
                'responsible_financial' => 'Guilherme'
            ];
        }

        return [
            'phone' => $norm['digits_no_55'] ?: $phone,
            'phone_formatted' => $phone,
            'matched' => $contact['matched'],
            'tipo_usuario' => $contact['tipo_usuario'],
            'name' => $contact['nome'] ?? 'Cliente',
            'document_formatted' => $contact['cpf'] ?? 'Não informado',
            'location' => $contact['cidade_uf'] ?? 'Assis/SP',
            'is_licenciada' => $isLicenciada,
            'licenciada_profile' => $licenciadaProfile,
            'data' => [
                'entity_id' => $contact['entity_id'] ?? null,
                'entity_type' => $contact['entity_type'] ?? null,
                'nome' => $contact['nome'],
                'cpf' => $contact['cpf'],
                'email' => $contact['email'] ?? null,
                'whatsapp' => $phone,
                'cidade_uf' => $contact['cidade_uf'],
                'status_contrato' => $contact['status_contrato'],
                'contract_pdf_url' => $contractDetails['pdf_url'] ?? null,
                'sign_url' => $signUrl,
                'financial_summary' => $financialSummary,
                'licenciada_profile' => $licenciadaProfile
            ]
        ];
    }

    /**
     * Envia mensagem de texto via Evolution API v2 em uma instância específica.
     * Tolerante a instâncias offline com timeout estrito de 3 segundos e log defensivo.
     */
    public function sendWhatsappMessage(string $instance, string $phone, string $message, ?string $evoUrl = null, ?string $globalKey = null): array {
        $url = $evoUrl ?? $this->defaultEvolutionUrl;
        $key = $globalKey ?? $this->defaultEvolutionKey;

        // Modo Mock para testes CLI sem Evolution API ativa
        if ($url === 'mock') {
            return [
                'success' => true,
                'whatsapp_sent' => true,
                'mock' => true,
                'instance' => $instance,
                'phone' => $phone,
                'message' => $message,
                'status' => 'DISPATCHED_MOCK'
            ];
        }

        $norm = $this->normalizePhone($phone);
        $cleanPhone = $norm['digits'];
        if (!str_starts_with($cleanPhone, '55')) {
            $cleanPhone = '55' . $cleanPhone;
        }

        $endpoint = rtrim($url, '/') . "/message/sendText/{$instance}";
        $payload = [
            'number' => $cleanPhone,
            'options' => [
                'delay' => 1200,
                'presence' => 'composing',
                'linkPreview' => true
            ],
            'textMessage' => [
                'text' => $message
            ]
        ];

        try {
            $ch = curl_init($endpoint);
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'apikey: ' . $key
                ],
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_TIMEOUT => 3
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            $success = ($httpCode >= 200 && $httpCode < 300);

            if (!$success) {
                error_log("[CRM_TRIGGER_WARN] Failed to dispatch WhatsApp via {$instance} to {$cleanPhone}: " . ($error ?: "HTTP {$httpCode}"));
            }

            return [
                'success' => $success,
                'whatsapp_sent' => $success,
                'http_code' => $httpCode,
                'error' => $error ?: null,
                'instance' => $instance,
                'response' => json_decode((string)$response, true)
            ];
        } catch (\Throwable $e) {
            error_log("[CRM_TRIGGER_WARN] Exception on WhatsApp dispatch ({$instance}): " . $e->getMessage());
            return [
                'success' => false,
                'whatsapp_sent' => false,
                'error' => $e->getMessage(),
                'instance' => $instance
            ];
        }
    }

    /**
     * GATILHO 1: Dispara mensagem de Emissão de Contrato pelo WhatsApp Jurídico.
     * Tolerante a instâncias offline (não interrompe o fluxo principal).
     */
    public function triggerContractIssuance(string $phone, string $candidateName, string $signUrl, ?string $evoUrl = null, ?string $globalKey = null): array {
        $message = "Olá, *{$candidateName}*! ⚖️\n\nSeu Contrato Oficial de Licenciamento **Body Harmony** foi gerado com sucesso pelo Departamento Jurídico e já está disponível para sua assinatura digital.\n\n🔗 *Acesse o link seguro para assinar:*\n{$signUrl}\n\nCaso tenha dúvidas sobre os termos, pode nos responder diretamente por aqui. ✨";

        $res = $this->sendWhatsappMessage('inst_juridico', $phone, $message, $evoUrl, $globalKey);

        return [
            'success' => true,
            'whatsapp_sent' => $res['whatsapp_sent'] ?? $res['success'] ?? false,
            'phone' => $phone,
            'candidate_name' => $candidateName,
            'sign_url' => $signUrl,
            'dispatched' => true,
            'instance' => 'inst_juridico',
            'api_result' => $res
        ];
    }

    /**
     * Alias para triggerContractIssuance.
     */
    public function triggerContractNotification(string $phone, string $candidateName, string $signUrl, ?string $evoUrl = null, ?string $globalKey = null): array {
        return $this->triggerContractIssuance($phone, $candidateName, $signUrl, $evoUrl, $globalKey);
    }

    /**
     * GATILHO 2: Sincroniza e agenda lembrete de Mentoria pelo WhatsApp Licenciadas.
     * Tolerante a instâncias offline (não interrompe o fluxo principal).
     */
    public function triggerMentorshipReminder(string $phone, string $menteeName, string $datetime, string $meetingLink, ?string $evoUrl = null, ?string $globalKey = null): array {
        $message = "Olá, Dra. *{$menteeName}*! 👑\n\nPassando para confirmar sua **Sessão de Mentoria Clínica & Estratégica** com a Dra. Joselene Silva.\n\n📅 *Horário:* {$datetime}\n📍 *Sala Virtual:* {$meetingLink}\n\nRecomendamos conectar-se com 5 minutos de antecedência. Estamos ansiosas pelo nosso encontro! ✨";

        $res = $this->sendWhatsappMessage('inst_licenciadas', $phone, $message, $evoUrl, $globalKey);

        return [
            'success' => true,
            'whatsapp_sent' => $res['whatsapp_sent'] ?? $res['success'] ?? false,
            'phone' => $phone,
            'mentee_name' => $menteeName,
            'datetime' => $datetime,
            'meeting_link' => $meetingLink,
            'scheduled' => true,
            'instance' => 'inst_licenciadas',
            'api_result' => $res
        ];
    }

    /**
     * Resposta padrão de fallback quando o contato não é encontrado no MySQL.
     */
    private function buildFallbackResponse(string $phone): array {
        return [
            'matched' => false,
            'tipo_usuario' => 'DESCONHECIDO',
            'nome' => 'Contato WhatsApp (' . substr($phone, -4) . ')',
            'cpf' => null,
            'status_contrato' => 'NAO_CADASTRADO',
            'cidade_uf' => 'Não informada',
            'entity_id' => null,
            'entity_type' => null
        ];
    }

    /**
     * Sincroniza os atributos customizados e o nome oficial no contato do Chatwoot via REST API.
     */
    public function syncContactAttributes(int $chatwootContactId, array $userData, ?string $chatwootUrl = null, ?string $apiToken = null, ?int $accountId = null): array {
        $url = $chatwootUrl ?? $this->defaultChatwootUrl;
        $token = $apiToken ?? $this->defaultApiToken;
        $accId = $accountId ?? $this->defaultAccountId;

        // Modo Mock para testes sem Chatwoot ativo
        if ($url === 'mock' || empty($chatwootContactId)) {
            return [
                'success' => true,
                'mock' => true,
                'chatwoot_contact_id' => $chatwootContactId,
                'synced_attributes' => [
                    'name' => $userData['nome'] ?? '',
                    'custom_attributes' => [
                        'cpf' => $userData['cpf'] ?? '',
                        'status_contrato' => $userData['status_contrato'] ?? '',
                        'cidade_uf' => $userData['cidade_uf'] ?? '',
                        'tipo_usuario' => $userData['tipo_usuario'] ?? ''
                    ]
                ]
            ];
        }

        $endpoint = rtrim($url, '/') . "/api/v1/accounts/{$accId}/contacts/{$chatwootContactId}";

        $payload = [
            'name' => $userData['nome'] ?? '',
            'custom_attributes' => [
                'cpf' => $userData['cpf'] ?? '',
                'status_contrato' => $userData['status_contrato'] ?? '',
                'cidade_uf' => $userData['cidade_uf'] ?? '',
                'tipo_usuario' => $userData['tipo_usuario'] ?? ''
            ]
        ];

        try {
            $ch = curl_init($endpoint);
            curl_setopt_array($ch, [
                CURLOPT_CUSTOMREQUEST => 'PUT',
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'api_access_token: ' . $token
                ],
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_TIMEOUT => 3
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
                'chatwoot_contact_id' => $chatwootContactId,
                'synced_attributes' => $payload
            ];
        } catch (\Throwable $e) {
            error_log("[CRM_SYNC_WARN] Chatwoot contact sync failed: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'chatwoot_contact_id' => $chatwootContactId
            ];
        }
    }

    /**
     * Orquestra a resolução do contato e envio imediato ao Chatwoot.
     */
    public function resolveAndSync(int $chatwootContactId, string $phone, ?string $email = null, ?string $chatwootUrl = null, ?string $apiToken = null, ?int $accountId = null): array {
        $resolved = $this->resolveContactByPhone($phone, $email);
        $syncResult = $this->syncContactAttributes($chatwootContactId, $resolved, $chatwootUrl, $apiToken, $accountId);

        return [
            'success' => true,
            'matched' => $resolved['matched'],
            'tipo_usuario' => $resolved['tipo_usuario'],
            'chatwoot_contact_id' => $chatwootContactId,
            'data' => [
                'nome' => $resolved['nome'],
                'cpf' => $resolved['cpf'],
                'status_contrato' => $resolved['status_contrato'],
                'cidade_uf' => $resolved['cidade_uf']
            ],
            'sync' => $syncResult
        ];
    }

    /**
     * Consulta o status em tempo real de todas as instâncias WhatsApp na Evolution API.
     */
    public function getInstancesStatus(?string $evolutionUrl = null, ?string $evolutionKey = null): array {
        $url = rtrim($evolutionUrl ?: $this->defaultEvolutionUrl, '/') . '/instance/fetchInstances';
        $apiKey = $evolutionKey ?: $this->defaultEvolutionKey;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'apikey: ' . $apiKey,
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $officialMeta = [
            'inst_juridico' => [
                'key' => 'juridico',
                'title' => '⚖️ Jurídico & Contratos',
                'subtitle' => 'Disparo de contratos e links de assinatura digital.'
            ],
            'inst_licenciadas' => [
                'key' => 'licenciadas',
                'title' => '👑 Suporte às Licenciadas',
                'subtitle' => 'Atendimento exclusivo a franqueadas, alunas e mentorias da Dra. Josi.'
            ],
            'inst_clinica' => [
                'key' => 'clinica',
                'title' => '💆 Clínica Matriz (Cibele)',
                'subtitle' => 'Acolhimento de pacientes de Assis/SP, anamneses e sessões de estética.'
            ],
            'inst_comercial' => [
                'key' => 'comercial',
                'title' => '💼 Comercial & Vendas',
                'subtitle' => 'Captação de alunas, ingressos de congressos e leads quentes.'
            ]
        ];

        $instancesList = [];

        if ($httpCode >= 200 && $httpCode < 300 && !empty($response)) {
            $data = json_decode($response, true) ?: [];

            // Process official instances
            foreach ($officialMeta as $instName => $meta) {
                $found = null;
                foreach ($data as $inst) {
                    if (($inst['name'] ?? '') === $instName) {
                        $found = $inst;
                        break;
                    }
                }

                $connectionStatus = $found['connectionStatus'] ?? 'close';
                $isConnected = in_array(strtolower($connectionStatus), ['open', 'connected']);
                $phone = $found['number'] ?? $found['ownerJid'] ?? null;
                if ($phone) {
                    $phone = explode('@', $phone)[0];
                    $phone = '+' . preg_replace('/\D/', '', $phone);
                }

                $instancesList[] = [
                    'id' => $found['id'] ?? $instName,
                    'key' => $meta['key'],
                    'instance_name' => $instName,
                    'title' => $meta['title'],
                    'subtitle' => $meta['subtitle'],
                    'status' => $connectionStatus,
                    'is_connected' => $isConnected,
                    'phone_number' => $phone,
                    'profile_name' => $found['profileName'] ?? null,
                    'updated_at' => $found['updatedAt'] ?? date('c')
                ];
            }

            // Process Burner Pool
            $burners = array_filter($data, function($item) {
                return str_contains($item['name'] ?? '', 'burner');
            });
            $activeBurners = array_filter($burners, function($b) {
                return in_array(strtolower($b['connectionStatus'] ?? ''), ['open', 'connected']);
            });

            $instancesList[] = [
                'id' => 'pool_burners',
                'key' => 'campanhas',
                'instance_name' => 'pool_campanhas',
                'title' => '⚡ Disparos Automáticos & Campanhas',
                'subtitle' => 'Envios em massa com rotação automática de chips.',
                'status' => count($activeBurners) > 0 ? 'open' : (count($burners) > 0 ? 'connecting' : 'close'),
                'is_connected' => count($activeBurners) > 0,
                'phone_number' => count($activeBurners) . ' chips ativos (' . count($burners) . ' provisionados)',
                'profile_name' => 'Motor de Campanhas',
                'updated_at' => date('c')
            ];
        } else {
            // Fallback gracefully
            foreach ($officialMeta as $instName => $meta) {
                $instancesList[] = [
                    'id' => $instName,
                    'key' => $meta['key'],
                    'instance_name' => $instName,
                    'title' => $meta['title'],
                    'subtitle' => $meta['subtitle'],
                    'status' => 'connecting',
                    'is_connected' => false,
                    'phone_number' => null,
                    'profile_name' => null,
                    'updated_at' => date('c')
                ];
            }
            $instancesList[] = [
                'id' => 'pool_burners',
                'key' => 'campanhas',
                'instance_name' => 'pool_campanhas',
                'title' => '⚡ Disparos Automáticos & Campanhas',
                'subtitle' => 'Envios em massa com rotação automática de chips.',
                'status' => 'connecting',
                'is_connected' => false,
                'phone_number' => 'Aguardando inicialização',
                'profile_name' => 'Motor de Campanhas',
                'updated_at' => date('c')
            ];
        }

        return [
            'success' => true,
            'instances' => $instancesList
        ];
    }

    /**
     * Gera o QR Code e Pairing Code para parear uma instância WhatsApp.
     */
    public function connectInstance(string $instanceKey, ?string $evolutionUrl = null, ?string $evolutionKey = null): array {
        $map = [
            'juridico' => 'inst_juridico',
            'licenciadas' => 'inst_licenciadas',
            'clinica' => 'inst_clinica',
            'comercial' => 'inst_comercial',
            'inst_juridico' => 'inst_juridico',
            'inst_licenciadas' => 'inst_licenciadas',
            'inst_clinica' => 'inst_clinica',
            'inst_comercial' => 'inst_comercial'
        ];

        $instanceName = $map[$instanceKey] ?? $instanceKey;
        $url = rtrim($evolutionUrl ?: $this->defaultEvolutionUrl, '/') . '/instance/connect/' . urlencode($instanceName);
        $apiKey = $evolutionKey ?: $this->defaultEvolutionKey;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'apikey: ' . $apiKey,
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300 && !empty($response)) {
            $data = json_decode($response, true) ?: [];
            return [
                'success' => true,
                'instance_key' => $instanceKey,
                'instance_name' => $instanceName,
                'pairing_code' => $data['pairingCode'] ?? null,
                'code' => $data['code'] ?? null,
                'qrcode_base64' => $data['base64'] ?? null,
                'status' => 'connecting',
                'message' => 'QR Code gerado com sucesso.'
            ];
        }

        return [
            'success' => false,
            'instance_key' => $instanceKey,
            'instance_name' => $instanceName,
            'pairing_code' => null,
            'qrcode_base64' => null,
            'status' => 'error',
            'message' => 'Não foi possível gerar o QR Code no momento.'
        ];
    }

    /**
     * Desconecta (logout) uma instância WhatsApp.
     */
    public function disconnectInstance(string $instanceKey, ?string $evolutionUrl = null, ?string $evolutionKey = null): array {
        $map = [
            'juridico' => 'inst_juridico',
            'licenciadas' => 'inst_licenciadas',
            'clinica' => 'inst_clinica',
            'comercial' => 'inst_comercial',
            'inst_juridico' => 'inst_juridico',
            'inst_licenciadas' => 'inst_licenciadas',
            'inst_clinica' => 'inst_clinica',
            'inst_comercial' => 'inst_comercial'
        ];

        $instanceName = $map[$instanceKey] ?? $instanceKey;
        $url = rtrim($evolutionUrl ?: $this->defaultEvolutionUrl, '/') . '/instance/logout/' . urlencode($instanceName);
        $apiKey = $evolutionKey ?: $this->defaultEvolutionKey;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'apikey: ' . $apiKey,
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $success = ($httpCode >= 200 && $httpCode < 300);

        return [
            'success' => $success,
            'instance_key' => $instanceKey,
            'instance_name' => $instanceName,
            'status' => $success ? 'disconnected' : 'error',
            'message' => $success ? 'Linha desconectada com sucesso.' : 'Erro ao desconectar linha.'
        ];
    }

    /**
     * Atualiza o nome de uma caixa de entrada no Chatwoot (PLAN-164).
     *
     * @param int $inboxId ID numérico da caixa de entrada
     * @param string $newName Novo nome amigável
     * @param string|null $chatwootUrl URL do Chatwoot (ou 'mock' para testes)
     * @param string|null $apiToken Token de acesso da API
     * @param int|null $accountId ID da conta
     * @return array
     */
    public function updateInboxName(
        int $inboxId,
        string $newName,
        ?string $chatwootUrl = null,
        ?string $apiToken = null,
        ?int $accountId = null
    ): array {
        $trimmedName = trim($newName);
        if ($inboxId <= 0 || empty($trimmedName)) {
            throw new Exception("ID da caixa de entrada e novo nome são obrigatórios.");
        }

        $url = $chatwootUrl ?? $this->defaultChatwootUrl;
        $token = $apiToken ?? $this->defaultApiToken;
        $accId = $accountId ?? $this->defaultAccountId;

        // Modo Mock para testes unitários / CLI sem dependência externa
        if ($url === 'mock') {
            return [
                'status' => 'success',
                'data' => [
                    'id' => $inboxId,
                    'name' => $trimmedName
                ],
                'message' => 'Nome da caixa de entrada atualizado com sucesso (modo simulado).'
            ];
        }

        $endpoint = rtrim($url, '/') . "/api/v1/accounts/{$accId}/inboxes/{$inboxId}?api_access_token=" . urlencode($token);
        $payload = json_encode(['name' => $trimmedName]);

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => 'PATCH',
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'api_access_token: ' . $token,
                'api-access-token: ' . $token
            ],
            CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_TIMEOUT => 4,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            $data = json_decode($response, true) ?: [];
            return [
                'status' => 'success',
                'data' => [
                    'id' => $data['id'] ?? $inboxId,
                    'name' => $data['name'] ?? $trimmedName
                ],
                'message' => 'Nome do canal atualizado com sucesso.'
            ];
        }

        throw new Exception("Falha ao atualizar canal no Chatwoot (HTTP {$httpCode}): " . ($error ?: $response));
    }
}

