<?php

namespace BodyHarmony\Services\Payment;

use Exception;
use Throwable;

require_once __DIR__ . '/PaymentGatewayInterface.php';

/**
 * AsaasGatewayService — Gateway de Pagamentos Asaas API v3 com Mock Fallback
 * Nexus Protocol V3.1 Compliant
 */
class AsaasGatewayService implements PaymentGatewayInterface {
    private string $apiKey;
    private string $environment;
    private string $baseUrl;
    private bool $isMock;
    private bool $notificationDisabled;

    /**
     * @param ?string $apiKey Chave Asaas (opcional, busca em getenv('ASAAS_API_KEY'))
     * @param ?string $environment 'production', 'sandbox' ou 'mock'
     * @param ?bool $notificationDisabled Desativa notificações nativas do Asaas (default: true)
     */
    public function __construct(?string $apiKey = null, ?string $environment = null, ?bool $notificationDisabled = null) {
        $envKey = $apiKey ?? getenv('ASAAS_API_KEY') ?: (defined('ASAAS_API_KEY') ? ASAAS_API_KEY : '');
        $this->apiKey = trim((string)$envKey);

        $envMode = $environment ?? getenv('ASAAS_ENVIRONMENT') ?: (defined('ASAAS_ENVIRONMENT') ? ASAAS_ENVIRONMENT : 'production');
        $this->environment = strtolower(trim((string)$envMode));

        if ($notificationDisabled !== null) {
            $this->notificationDisabled = $notificationDisabled;
        } else {
            $envNotif = getenv('ASAAS_DISABLE_NOTIFICATIONS');
            if ($envNotif === false && isset($_ENV['ASAAS_DISABLE_NOTIFICATIONS'])) {
                $envNotif = $_ENV['ASAAS_DISABLE_NOTIFICATIONS'];
            }
            if ($envNotif === null || $envNotif === false || $envNotif === '') {
                $this->notificationDisabled = true; // Por padrão, desativa notificações nativas do Asaas (Nexus V3.1)
            } else {
                $this->notificationDisabled = ($envNotif === true || $envNotif === '1' || strtolower((string)$envNotif) === 'true');
            }
        }

        // Auto-detecção de ambiente Sandbox pelo prefixo da chave (ex: $aact_hmlg_...)
        if (stripos($this->apiKey, 'hmlg') !== false) {
            $this->environment = 'sandbox';
        }

        // Se a chave não existir ou for placeholder/mock, ativa automaticamente o modo mock
        if (empty($this->apiKey) || $this->environment === 'mock' || in_array($this->apiKey, ['mock', 'sandbox_mock', 'your_asaas_api_key_here'], true)) {
            $this->isMock = true;
            $this->baseUrl = 'https://sandbox.asaas.com/api/v3';
        } else {
            $this->isMock = false;
            $this->baseUrl = ($this->environment === 'sandbox')
                ? 'https://sandbox.asaas.com/api/v3'
                : 'https://api.asaas.com/v3';
        }
    }

    public function isNotificationDisabled(): bool {
        return $this->notificationDisabled;
    }

    public function isMockMode(): bool {
        return $this->isMock;
    }

    public function getEnvironment(): string {
        return $this->environment;
    }

    public function getBaseUrl(): string {
        return $this->baseUrl;
    }

    /**
     * Obtém o IP real do cliente final para o antifraude do Asaas (remoteIp)
     */
    public function getClientRemoteIp(): ?string {
        $candidates = [
            $_SERVER['HTTP_CF_CONNECTING_IP'] ?? null,
            $_SERVER['HTTP_X_REAL_IP'] ?? null,
            isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0] : null,
            $_SERVER['REMOTE_ADDR'] ?? null
        ];
        foreach ($candidates as $ip) {
            if ($ip) {
                $clean = trim($ip);
                if (filter_var($clean, FILTER_VALIDATE_IP)) {
                    return $clean;
                }
            }
        }
        return null;
    }

    /**
     * Executa chamada HTTP à API do Asaas
     */
    private function request(string $method, string $endpoint, ?array $body = null): array {
        if ($this->isMock) {
            throw new Exception("AsaasGatewayService está em modo Mock. Requisições HTTP reais desativadas.");
        }

        $url = rtrim($this->baseUrl, '/') . '/' . ltrim($endpoint, '/');
        $ch = curl_init();

        $headers = [
            'Content-Type: application/json',
            'access_token: ' . $this->apiKey,
            'User-Agent: BodyHarmony-Congress-Nexus/3.1'
        ];

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        // SSL seguro com fallback defensivo para ambientes de desenvolvimento sem certifi bundle
        $sslVerify = (PHP_OS_FAMILY !== 'Windows' || !empty(ini_get('curl.cainfo')));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $sslVerify);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, $sslVerify ? 2 : 0);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($body !== null) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
            }
        } elseif ($method === 'GET') {
            curl_setopt($ch, CURLOPT_HTTPGET, true);
        }

        $rawResponse = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return [
                'ok' => false,
                'status' => $httpCode ?: 500,
                'error' => "cURL Error: " . $curlError,
                'data' => null
            ];
        }

        $json = json_decode($rawResponse, true);
        if ($httpCode >= 200 && $httpCode < 300) {
            return [
                'ok' => true,
                'status' => $httpCode,
                'data' => $json
            ];
        }

        $errorMessage = $json['errors'][0]['description'] ?? ($json['message'] ?? "HTTP Error $httpCode");
        return [
            'ok' => false,
            'status' => $httpCode,
            'error' => $errorMessage,
            'data' => $json
        ];
    }

    /**
     * Localiza ou cria o cliente no Asaas com sincronização estrita de CPF
     */
    private function getOrCreateCustomer(array $customerData): array {
        if ($this->isMock) {
            return [
                'ok' => true,
                'customer_id' => 'cus_mock_' . substr(md5($customerData['email'] ?? 'test'), 0, 10)
            ];
        }

        $name = trim($customerData['name'] ?? 'Participante Congresso');
        $email = trim($customerData['email'] ?? '');
        $rawCpf = $customerData['cpf'] ?? '';
        $cpfCnpj = preg_replace('/\D/', '', $rawCpf);
        $rawPhone = preg_replace('/\D/', '', $customerData['phone'] ?? '');
        
        // Tratar telefone: se vier com 55 na frente (DDI) e mais de 11 dígitos, remover o 55
        if (strlen($rawPhone) >= 12 && substr($rawPhone, 0, 2) === '55') {
            $rawPhone = substr($rawPhone, 2);
        }
        $mobilePhone = (strlen($rawPhone) >= 10 && strlen($rawPhone) <= 11) ? $rawPhone : null;

        if (empty($cpfCnpj) || (strlen($cpfCnpj) !== 11 && strlen($cpfCnpj) !== 14)) {
            return [
                'ok' => false,
                'error' => 'CPF/CNPJ inválido ou não informado para a cobrança.'
            ];
        }

        // 1. Busca por CPF se disponível
        try {
            $search = $this->request('GET', 'customers?cpfCnpj=' . urlencode($cpfCnpj));
            if (!empty($search['ok']) && !empty($search['data']['data'][0]['id'])) {
                $existing = $search['data']['data'][0];
                $customerId = $existing['id'];

                // Atualizar dados de contato se necessário
                $updatePayload = [];
                if (empty($existing['mobilePhone']) && $mobilePhone) {
                    $updatePayload['mobilePhone'] = $mobilePhone;
                }
                if (!empty($updatePayload)) {
                    $this->request('POST', "customers/{$customerId}", $updatePayload);
                }

                return [
                    'ok' => true,
                    'customer_id' => $customerId
                ];
            }
        } catch (Throwable $e) {}

        // 2. Busca por E-mail
        if ($email) {
            try {
                $searchEmail = $this->request('GET', 'customers?email=' . urlencode($email));
                if (!empty($searchEmail['ok']) && !empty($searchEmail['data']['data'][0]['id'])) {
                    $existing = $searchEmail['data']['data'][0];
                    $customerId = $existing['id'];

                    // Sincronizar CPF e telefone no cliente já existente no Asaas
                    $updatePayload = [
                        'cpfCnpj' => $cpfCnpj,
                        'name' => $name
                    ];
                    if ($mobilePhone) {
                        $updatePayload['mobilePhone'] = $mobilePhone;
                    }

                    $this->request('POST', "customers/{$customerId}", $updatePayload);

                    return [
                        'ok' => true,
                        'customer_id' => $customerId
                    ];
                }
            } catch (Throwable $e) {}
        }

        // 3. Criação de novo cliente
        $createPayload = [
            'name' => $name,
            'email' => $email ?: 'participante@bodyharmony.com.br',
            'cpfCnpj' => $cpfCnpj,
            'notificationDisabled' => $this->notificationDisabled
        ];
        if ($mobilePhone) {
            $createPayload['mobilePhone'] = $mobilePhone;
        }

        $res = $this->request('POST', 'customers', $createPayload);
        if (!empty($res['ok']) && !empty($res['data']['id'])) {
            return [
                'ok' => true,
                'customer_id' => $res['data']['id']
            ];
        }

        $errorDetail = $res['error'] ?? 'Falha ao cadastrar cliente no Asaas.';
        error_log("[AsaasGatewayService] Falha ao criar cliente Asaas: {$errorDetail}");
        return [
            'ok' => false,
            'error' => "Erro no cadastro do cliente Asaas: {$errorDetail}"
        ];
    }

    /**
     * Gera cobrança via PIX
     */
    public function createPixCharge(array $data): array {
        $amountCents = (int)($data['amount_cents'] ?? 0);
        $amountReais = round($amountCents / 100, 2);
        $reference = $data['external_reference'] ?? ('bh-cong-' . bin2hex(random_bytes(6)));

        if ($this->isMock) {
            $mockPaymentId = 'pay_mock_pix_' . bin2hex(random_bytes(8));
            $pixKey = '00020126580014br.gov.bcb.pix0136' . bin2hex(random_bytes(16)) . '520400005303986540' . number_format($amountReais, 2, '.', '') . '5802BR5912Body Harmony6009Sao Paulo62070503***6304MOCK';
            
            // Gerador de QR Code visual para renderização imediata
            $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($pixKey);
            $expiration = date('Y-m-d H:i:s', time() + 86400); // 24 horas

            return [
                'ok' => true,
                'payment_id' => $mockPaymentId,
                'pix_qr_code' => $qrCodeUrl,
                'pix_copy_paste' => $pixKey,
                'expiration' => $expiration,
                'amount_cents' => $amountCents,
                'notification_disabled' => $this->notificationDisabled,
                'is_mock' => true,
                'raw' => [
                    'id' => $mockPaymentId,
                    'status' => 'PENDING',
                    'billingType' => 'PIX',
                    'value' => $amountReais,
                    'notificationDisabled' => $this->notificationDisabled
                ]
            ];
        }

        $custRes = $this->getOrCreateCustomer([
            'name' => $data['customer_name'] ?? 'Participante Congresso',
            'email' => $data['customer_email'] ?? '',
            'cpf' => $data['customer_cpf'] ?? '',
            'phone' => $data['customer_phone'] ?? ''
        ]);

        if (empty($custRes['ok']) || empty($custRes['customer_id'])) {
            return [
                'ok' => false,
                'error' => $custRes['error'] ?? 'Não foi possível registrar o cliente no Asaas.',
                'is_mock' => false
            ];
        }

        $customerId = $custRes['customer_id'];
        $dueDate = date('Y-m-d', time() + (2 * 86400)); // Vencimento em 2 dias
        $payload = [
            'customer' => $customerId,
            'billingType' => 'PIX',
            'value' => $amountReais,
            'dueDate' => $dueDate,
            'description' => $data['description'] ?? 'Inscrição - 1º Congresso Brasileiro de Musculação Elétrica',
            'externalReference' => $reference,
            'postalService' => false,
            'notificationDisabled' => $this->notificationDisabled
        ];

        $res = $this->request('POST', 'payments', $payload);
        if (!$res['ok']) {
            return [
                'ok' => false,
                'error' => $res['error'] ?? 'Falha ao criar cobrança PIX no Asaas',
                'is_mock' => false,
                'raw' => $res['data'] ?? null
            ];
        }

        $paymentId = $res['data']['id'];

        // Obter QR Code PIX
        $qrRes = $this->request('GET', "payments/{$paymentId}/pixQrCode");
        $pixQrCode = $qrRes['data']['encodedImage'] ?? null;
        $pixCopyPaste = $qrRes['data']['payload'] ?? null;
        $expiration = $qrRes['data']['expirationDate'] ?? date('Y-m-d H:i:s', time() + 86400);

        if ($pixQrCode && strpos($pixQrCode, 'data:image') === false) {
            $pixQrCode = 'data:image/png;base64,' . $pixQrCode;
        }

        $invoiceUrl = $res['data']['invoiceUrl'] ?? null;
        $bankSlipUrl = $res['data']['bankSlipUrl'] ?? null;

        return [
            'ok' => true,
            'payment_id' => $paymentId,
            'pix_qr_code' => $pixQrCode,
            'pix_copy_paste' => $pixCopyPaste,
            'invoice_url' => $invoiceUrl,
            'bank_slip_url' => $bankSlipUrl,
            'expiration' => $expiration,
            'amount_cents' => $amountCents,
            'notification_disabled' => $this->notificationDisabled,
            'is_mock' => false,
            'raw' => $res['data']
        ];
    }

    /**
     * Processa cobrança via Cartão de Crédito
     */
    public function createCreditCardCharge(array $data): array {
        $baseAmountCents = (int)($data['amount_cents'] ?? 0);
        $installments = max(1, min(12, (int)($data['installments'] ?? 1)));
        $reference = $data['external_reference'] ?? ('bh-cong-' . bin2hex(random_bytes(6)));

        // Calcular valor total com repasse de juros
        $installmentOptions = $this->calculateInstallments($baseAmountCents, 12);
        $selectedOption = $installmentOptions[$installments - 1] ?? $installmentOptions[0];
        $totalAmountCents = $selectedOption['total_cents'];
        $installmentValueCents = $selectedOption['installment_cents'];
        $totalReais = round($totalAmountCents / 100, 2);
        $installmentValueReais = round($installmentValueCents / 100, 2);

        $card = $data['card_data'] ?? [];
        $holder = $data['holder_info'] ?? null;
        $isDifferentHolder = !empty($holder) && (isset($holder['is_same_as_attendee']) && $holder['is_same_as_attendee'] === false || !empty($holder['name']));

        // Suporte híbrido a CPF (11 dígitos) e CNPJ (14 dígitos)
        $rawDoc = !empty($holder['cpf_cnpj']) ? $holder['cpf_cnpj'] : ($holder['cpf'] ?? '');
        $holderDoc = ($isDifferentHolder && !empty($rawDoc)) ? preg_replace('/\D/', '', $rawDoc) : preg_replace('/\D/', '', $data['customer_cpf'] ?? '');

        $holderName = ($isDifferentHolder && !empty($holder['name'])) ? trim($holder['name']) : ($card['holder_name'] ?? ($data['customer_name'] ?? ''));
        $holderPhone = ($isDifferentHolder && !empty($holder['phone'])) ? preg_replace('/\D/', '', $holder['phone']) : preg_replace('/\D/', '', $data['customer_phone'] ?? '');
        $holderPostalCode = ($isDifferentHolder && !empty($holder['postal_code'])) ? preg_replace('/\D/', '', $holder['postal_code']) : preg_replace('/\D/', '', $data['customer_postal_code'] ?? '01310-100');
        $holderAddressNumber = ($isDifferentHolder && !empty($holder['address_number'])) ? trim($holder['address_number']) : ($data['customer_address_number'] ?? '100');
        $holderAddressComplement = $holder['address_complement'] ?? ($data['customer_address_complement'] ?? null);
        $holderEmail = $data['customer_email'] ?? 'participante@bodyharmony.com.br';

        if ($this->isMock) {
            $mockPaymentId = 'pay_mock_card_' . bin2hex(random_bytes(8));
            return [
                'ok' => true,
                'payment_id' => $mockPaymentId,
                'status' => 'CONFIRMED',
                'amount_cents' => $totalAmountCents,
                'installments' => $installments,
                'installment_value_cents' => $installmentValueCents,
                'is_mock' => true,
                'notification_disabled' => $this->notificationDisabled,
                'message' => 'Pagamento simulado com sucesso (Modo Mock)',
                'raw' => [
                    'id' => $mockPaymentId,
                    'status' => 'CONFIRMED',
                    'billingType' => 'CREDIT_CARD',
                    'value' => $totalReais,
                    'installmentCount' => $installments,
                    'notificationDisabled' => $this->notificationDisabled,
                    'creditCardHolderInfo' => [
                        'name' => $holderName,
                        'email' => $holderEmail,
                        'cpfCnpj' => $holderDoc,
                        'postalCode' => $holderPostalCode,
                        'addressNumber' => $holderAddressNumber,
                        'phone' => $holderPhone
                    ]
                ]
            ];
        }

        // Se o titular for diferente, o cliente financeiro no Asaas é criado em nome do titular do cartão
        // para eliminar 100% de divergência de titularidade na análise de risco da adquirente
        $payerData = $isDifferentHolder ? [
            'name' => $holderName,
            'email' => $holderEmail,
            'cpf' => $holderDoc,
            'phone' => $holderPhone,
            'postalCode' => $holderPostalCode,
            'addressNumber' => $holderAddressNumber
        ] : [
            'name' => $data['customer_name'] ?? '',
            'email' => $data['customer_email'] ?? '',
            'cpf' => $data['customer_cpf'] ?? '',
            'phone' => $data['customer_phone'] ?? ''
        ];

        $custRes = $this->getOrCreateCustomer($payerData);

        if (empty($custRes['ok']) || empty($custRes['customer_id'])) {
            return [
                'ok' => false,
                'error' => $custRes['error'] ?? 'Não foi possível registrar o cliente no Asaas para pagamento com cartão.',
                'is_mock' => false
            ];
        }

        $customerId = $custRes['customer_id'];

        $payload = [
            'customer' => $customerId,
            'billingType' => 'CREDIT_CARD',
            'dueDate' => date('Y-m-d'),
            'description' => $data['description'] ?? 'Inscrição - 1º Congresso Brasileiro de Musculação Elétrica',
            'externalReference' => $reference,
            'notificationDisabled' => $this->notificationDisabled,
            'creditCard' => [
                'holderName' => $holderName,
                'number' => preg_replace('/\D/', '', $card['number'] ?? ''),
                'expiryMonth' => str_pad((string)($card['expiry_month'] ?? ''), 2, '0', STR_PAD_LEFT),
                'expiryYear' => (string)($card['expiry_year'] ?? ''),
                'ccv' => (string)($card['ccv'] ?? '')
            ],
            'creditCardHolderInfo' => [
                'name' => $holderName,
                'email' => $holderEmail,
                'cpfCnpj' => $holderDoc,
                'postalCode' => $holderPostalCode,
                'addressNumber' => $holderAddressNumber,
                'phone' => $holderPhone,
                'mobilePhone' => $holderPhone
            ]
        ];

        // Injeta remoteIp obrigatório para correta análise antifraude da adquirente
        $remoteIp = $data['remote_ip'] ?? $this->getClientRemoteIp();
        if ($remoteIp) {
            $payload['remoteIp'] = $remoteIp;
        }

        if ($holderAddressComplement) {
            $payload['creditCardHolderInfo']['addressComplement'] = $holderAddressComplement;
        }

        if ($installments > 1) {
            $payload['installmentCount'] = $installments;
            $payload['installmentValue'] = $installmentValueReais;
        } else {
            $payload['value'] = $totalReais;
        }

        $res = $this->request('POST', 'payments', $payload);
        if (!$res['ok']) {
            return [
                'ok' => false,
                'error' => $res['error'] ?? 'Falha ao processar cartão de crédito no Asaas',
                'is_mock' => false,
                'raw' => $res['data'] ?? null
            ];
        }

        $status = $res['data']['status'] ?? 'PENDING';
        return [
            'ok' => true,
            'payment_id' => $res['data']['id'],
            'status' => ($status === 'RECEIVED' || $status === 'CONFIRMED') ? 'CONFIRMED' : $status,
            'amount_cents' => $totalAmountCents,
            'installments' => $installments,
            'installment_value_cents' => $installmentValueCents,
            'is_mock' => false,
            'raw' => $res['data']
        ];
    }

    /**
     * Cria fatura hospedada com suporte a 3DS e múltiplos métodos (Fallback de segurança)
     */
    public function createHostedInvoice(array $data): array {
        $baseAmountCents = (int)($data['amount_cents'] ?? 0);
        $installments = max(1, min(12, (int)($data['installments'] ?? 1)));
        $reference = $data['external_reference'] ?? ('bh-cong-inv-' . bin2hex(random_bytes(6)));

        $installmentOptions = $this->calculateInstallments($baseAmountCents, 12);
        $selectedOption = $installmentOptions[$installments - 1] ?? $installmentOptions[0];
        $totalAmountCents = $selectedOption['total_cents'];
        $installmentValueCents = $selectedOption['installment_cents'];
        $totalReais = round($totalAmountCents / 100, 2);
        $installmentValueReais = round($installmentValueCents / 100, 2);

        $holder = $data['holder_info'] ?? null;
        $isDifferentHolder = !empty($holder) && (isset($holder['is_same_as_attendee']) && $holder['is_same_as_attendee'] === false || !empty($holder['name']));
        $rawDoc = !empty($holder['cpf_cnpj']) ? $holder['cpf_cnpj'] : ($holder['cpf'] ?? '');
        $holderDoc = ($isDifferentHolder && !empty($rawDoc)) ? preg_replace('/\D/', '', $rawDoc) : preg_replace('/\D/', '', $data['customer_cpf'] ?? '');
        $holderName = ($isDifferentHolder && !empty($holder['name'])) ? trim($holder['name']) : ($data['customer_name'] ?? '');
        $holderPhone = ($isDifferentHolder && !empty($holder['phone'])) ? preg_replace('/\D/', '', $holder['phone']) : preg_replace('/\D/', '', $data['customer_phone'] ?? '');
        $holderPostalCode = ($isDifferentHolder && !empty($holder['postal_code'])) ? preg_replace('/\D/', '', $holder['postal_code']) : preg_replace('/\D/', '', $data['customer_postal_code'] ?? '01310-100');
        $holderAddressNumber = ($isDifferentHolder && !empty($holder['address_number'])) ? trim($holder['address_number']) : ($data['customer_address_number'] ?? '100');

        if ($this->isMock) {
            $mockPaymentId = 'pay_mock_hosted_' . bin2hex(random_bytes(8));
            return [
                'ok' => true,
                'payment_id' => $mockPaymentId,
                'invoice_url' => "https://sandbox.asaas.com/i/{$mockPaymentId}",
                'status' => 'PENDING',
                'amount_cents' => $totalAmountCents,
                'installments' => $installments,
                'installment_value_cents' => $installmentValueCents,
                'billing_type' => 'CREDIT_CARD',
                'is_mock' => true,
                'message' => 'Fatura Asaas com 3DS gerada com sucesso (Modo Mock)',
                'raw' => [
                    'id' => $mockPaymentId,
                    'billingType' => 'CREDIT_CARD',
                    'installmentCount' => $installments,
                    'installmentValue' => $installmentValueReais
                ]
            ];
        }

        $payerData = $isDifferentHolder ? [
            'name' => $holderName,
            'email' => $data['customer_email'] ?? 'participante@bodyharmony.com.br',
            'cpf' => $holderDoc,
            'phone' => $holderPhone,
            'postalCode' => $holderPostalCode,
            'addressNumber' => $holderAddressNumber
        ] : [
            'name' => $data['customer_name'] ?? '',
            'email' => $data['customer_email'] ?? '',
            'cpf' => $data['customer_cpf'] ?? '',
            'phone' => $data['customer_phone'] ?? ''
        ];

        $custRes = $this->getOrCreateCustomer($payerData);
        if (empty($custRes['ok']) || empty($custRes['customer_id'])) {
            return [
                'ok' => false,
                'error' => $custRes['error'] ?? 'Não foi possível registrar o cliente no Asaas para a fatura 3DS.',
                'is_mock' => false
            ];
        }

        $payload = [
            'customer' => $custRes['customer_id'],
            'billingType' => $data['billing_type'] ?? 'UNDEFINED',
            'dueDate' => date('Y-m-d', strtotime('+3 days')),
            'description' => $data['description'] ?? 'Inscrição - 1º Congresso Brasileiro de Musculação Elétrica',
            'externalReference' => $reference,
            'notificationDisabled' => $this->notificationDisabled
        ];

        $remoteIp = $data['remote_ip'] ?? $this->getClientRemoteIp();
        if ($remoteIp) {
            $payload['remoteIp'] = $remoteIp;
        }

        if ($installments > 1) {
            $payload['installmentCount'] = $installments;
            $payload['installmentValue'] = $installmentValueReais;
        } else {
            $payload['value'] = $totalReais;
        }

        $res = $this->request('POST', 'payments', $payload);
        if (!$res['ok']) {
            return [
                'ok' => false,
                'error' => $res['error'] ?? 'Falha ao gerar fatura Asaas com 3DS',
                'is_mock' => false,
                'raw' => $res['data'] ?? null
            ];
        }

        $invoiceUrl = $res['data']['invoiceUrl'] ?? ($res['data']['bankSlipUrl'] ?? null);

        return [
            'ok' => true,
            'payment_id' => $res['data']['id'],
            'invoice_url' => $invoiceUrl,
            'status' => 'PENDING',
            'amount_cents' => $totalAmountCents,
            'installments' => $installments,
            'installment_value_cents' => $installmentValueCents,
            'billing_type' => 'CREDIT_CARD',
            'is_mock' => false,
            'raw' => $res['data']
        ];
    }

    /**
     * Consulta status de pagamento
     */
    public function getPaymentStatus(string $paymentId): array {
        if ($this->isMock || strpos($paymentId, 'pay_mock_') === 0) {
            return [
                'ok' => true,
                'status' => 'CONFIRMED',
                'paid' => true,
                'is_mock' => true,
                'raw' => ['id' => $paymentId, 'status' => 'CONFIRMED']
            ];
        }

        $res = $this->request('GET', "payments/{$paymentId}");
        if (!$res['ok']) {
            return [
                'ok' => false,
                'status' => 'UNKNOWN',
                'paid' => false,
                'error' => $res['error'] ?? 'Erro ao consultar pagamento'
            ];
        }

        $status = $res['data']['status'] ?? 'PENDING';
        $paid = in_array($status, ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'], true);

        return [
            'ok' => true,
            'status' => $status,
            'paid' => $paid,
            'is_mock' => false,
            'raw' => $res['data']
        ];
    }

    /**
     * Simula o pagamento de uma cobrança no ambiente Sandbox (Asaas API)
     */
    public function simulatePayment(string $paymentId, ?float $value = null): array {
        if ($this->isMock || strpos($paymentId, 'pay_mock_') === 0) {
            return [
                'ok' => true,
                'status' => 'RECEIVED',
                'is_mock' => true,
                'message' => 'Pagamento simulado com sucesso em modo Mock'
            ];
        }

        // 1. Tentar confirmação via receiveInCash (Oficial Asaas Sandbox)
        $cashPayload = [
            'paymentDate' => date('Y-m-d')
        ];
        if ($value !== null && $value > 0) {
            $cashPayload['value'] = $value;
        }
        $resCash = $this->request('POST', "payments/{$paymentId}/receiveInCash", $cashPayload);
        if (!empty($resCash['ok'])) {
            return [
                'ok' => true,
                'status' => $resCash['data']['status'] ?? 'RECEIVED',
                'raw' => $resCash['data']
            ];
        }

        // 2. Fallback para simulatePayment endpoint
        $body = [];
        if ($value !== null) {
            $body['value'] = $value;
        }

        $res = $this->request('POST', "payments/{$paymentId}/simulatePayment", $body);
        if (!empty($res['ok'])) {
            return [
                'ok' => true,
                'status' => $res['data']['status'] ?? 'RECEIVED',
                'raw' => $res['data']
            ];
        }

        return [
            'ok' => false,
            'error' => $resCash['error'] ?? ($res['error'] ?? 'Falha ao simular pagamento no Asaas Sandbox'),
            'raw' => $resCash['data'] ?? ($res['data'] ?? null)
        ];
    }

    /**
     * Calcula opções de parcelamento com repasse de juros ao comprador
     * Taxa de juros: 1x sem juros; 2x a 12x com acréscimo de 2.29% a.m. (tabela padrão Asaas com repasse)
     */
    public function calculateInstallments(int $baseAmountCents, int $maxInstallments = 12): array {
        $options = [];
        $monthlyRate = 0.0229; // 2.29% a.m.

        for ($n = 1; $n <= $maxInstallments; $n++) {
            if ($n === 1) {
                $options[] = [
                    'installment' => 1,
                    'total_cents' => $baseAmountCents,
                    'installment_cents' => $baseAmountCents,
                    'total_formatted' => 'R$ ' . number_format($baseAmountCents / 100, 2, ',', '.'),
                    'installment_formatted' => '1x de R$ ' . number_format($baseAmountCents / 100, 2, ',', '.'),
                    'has_interest' => false,
                    'interest_rate' => 0.0
                ];
                continue;
            }

            // Coeficiente de financiamento (Tabela Price): PMT = PV * [ i / (1 - (1+i)^-n) ]
            $factor = ($monthlyRate * pow(1 + $monthlyRate, $n)) / (pow(1 + $monthlyRate, $n) - 1);
            $installmentCents = (int)ceil($baseAmountCents * $factor);
            $totalCents = $installmentCents * $n;

            $options[] = [
                'installment' => $n,
                'total_cents' => $totalCents,
                'installment_cents' => $installmentCents,
                'total_formatted' => 'R$ ' . number_format($totalCents / 100, 2, ',', '.'),
                'installment_formatted' => "{$n}x de R$ " . number_format($installmentCents / 100, 2, ',', '.'),
                'has_interest' => true,
                'interest_rate' => round($monthlyRate * 100, 2)
            ];
        }

        return $options;
    }
    /**
     * Cria um Link de Pagamento no Asaas (POST /paymentLinks)
     * Usado para gerar links de checkout da Shop que redirecionam o comprador
     */
    public function createPaymentLink(array $data): array {
        $name = trim($data['name'] ?? 'Produto Body Harmony');
        $description = trim($data['description'] ?? '');
        $valueCents = (int)($data['value_cents'] ?? 0);
        $valueReais = round($valueCents / 100, 2);
        $chargeType = $data['charge_type'] ?? 'DETACHED'; // DETACHED = sem vencimento fixo
        $billingType = $data['billing_type'] ?? 'UNDEFINED'; // UNDEFINED = aceita todos os métodos
        $maxInstallments = (int)($data['max_installments'] ?? 12);
        $dueDateLimitDays = (int)($data['due_date_limit_days'] ?? 5);
        if ($dueDateLimitDays <= 0) {
            $dueDateLimitDays = 5;
        }
        $externalReference = $data['external_reference'] ?? null;

        if ($this->isMock) {
            $mockId = 'plink_mock_' . bin2hex(random_bytes(8));
            $mockUrl = 'https://sandbox.asaas.com/c/mock_' . bin2hex(random_bytes(6));
            return [
                'ok' => true,
                'payment_link_id' => $mockId,
                'payment_link_url' => $mockUrl,
                'is_mock' => true,
                'raw' => [
                    'id' => $mockId,
                    'url' => $mockUrl,
                    'name' => $name,
                    'value' => $valueReais,
                    'active' => true
                ]
            ];
        }

        $payload = [
            'name' => $name,
            'value' => $valueReais,
            'billingType' => $billingType,
            'chargeType' => $chargeType,
            'dueDateLimitDays' => $dueDateLimitDays,
            'notificationEnabled' => !$this->notificationDisabled,
            'maxInstallmentCount' => $maxInstallments
        ];

        if (!empty($description)) {
            $payload['description'] = $description;
        }
        if ($externalReference) {
            $payload['externalReference'] = $externalReference;
        }

        $res = $this->request('POST', 'paymentLinks', $payload);
        if (!$res['ok']) {
            return [
                'ok' => false,
                'error' => $res['error'] ?? 'Falha ao criar link de pagamento no Asaas',
                'is_mock' => false,
                'raw' => $res['data'] ?? null
            ];
        }

        return [
            'ok' => true,
            'payment_link_id' => $res['data']['id'] ?? null,
            'payment_link_url' => $res['data']['url'] ?? null,
            'is_mock' => false,
            'raw' => $res['data']
        ];
    }

    /**
     * Consulta um Link de Pagamento existente no Asaas
     */
    public function getPaymentLink(string $linkId): array {
        if ($this->isMock || strpos($linkId, 'plink_mock_') === 0) {
            return [
                'ok' => true,
                'active' => true,
                'is_mock' => true,
                'raw' => ['id' => $linkId, 'active' => true]
            ];
        }

        $res = $this->request('GET', "paymentLinks/{$linkId}");
        if (!$res['ok']) {
            return [
                'ok' => false,
                'error' => $res['error'] ?? 'Erro ao consultar link de pagamento',
                'raw' => $res['data'] ?? null
            ];
        }

        return [
            'ok' => true,
            'active' => $res['data']['active'] ?? false,
            'is_mock' => false,
            'raw' => $res['data']
        ];
    }
}
