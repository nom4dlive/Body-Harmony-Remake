<?php

namespace BodyHarmony\Services;

use Exception;
use Throwable;

/**
 * Stone Payments API Service (Online 4.0 - Payments/Charges)
 * Nexus Protocol V3.1 Compliant
 */
class StonePaymentService {
    private string $baseUrl;
    private string $hostHeader;
    private string $secretKey;
    private bool $isSandbox;

    public function __construct(?string $secretKey = null, ?string $environment = null) {
        $envMode = $environment ?? (getenv('STONE_ENVIRONMENT') ?: (defined('STONE_ENVIRONMENT') ? STONE_ENVIRONMENT : 'sandbox'));
        $this->isSandbox = (strtolower($envMode) === 'sandbox' || strtolower($envMode) === 'homologacao');

        $this->baseUrl = 'https://payments.stone.com.br/v1';
        $this->hostHeader = $this->isSandbox ? 'sdx-ecommerce-payments.stone.com.br' : 'ecommerce-payments.stone.com.br';

        $resolvedKey = $secretKey ?? (getenv('STONE_SECRET_KEY') ?: (defined('STONE_SECRET_KEY') ? STONE_SECRET_KEY : 'sk_sandbox_test_key'));
        $this->secretKey = $resolvedKey;
    }

    /**
     * Executes an authenticated cURL request against Stone API.
     */
    private function executeRequest(string $method, string $path, ?array $payload = null): array {
        $url = rtrim($this->baseUrl, '/') . '/' . ltrim($path, '/');
        
        $headers = [
            'Content-Type: application/json',
            'Host: ' . $this->hostHeader,
            'Authorization: Basic ' . base64_encode($this->secretKey . ':')
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($payload !== null) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
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
                'success' => false,
                'http_code' => 0,
                'error' => 'cURL Error: ' . $curlError,
                'raw' => null
            ];
        }

        $decoded = json_decode($rawResponse, true);

        return [
            'success' => ($httpCode >= 200 && $httpCode < 300),
            'http_code' => $httpCode,
            'data' => $decoded,
            'raw' => $rawResponse
        ];
    }

    /**
     * Creates a Credit Card Charge with instant Authorization and Capture.
     */
    public function createCardCharge(
        int $amountCents,
        string $initiatorId,
        array $cardData,
        int $installments = 1,
        string $statementDescriptor = 'BODY HARMONY'
    ): array {
        $cleanNumber = preg_replace('/\D/', '', $cardData['number'] ?? '');
        $cleanExp = preg_replace('/\D/', '', $cardData['expiration_date'] ?? ''); // YYMM or MMYY
        
        // Ensure expiration is in YYMM format if provided as MM/YY or MMYY
        if (strlen($cleanExp) === 4) {
            $month = substr($cleanExp, 0, 2);
            $year = substr($cleanExp, 2, 2);
            // If month is > 12, assume it's YYMM, otherwise MMYY -> convert to YYMM
            if ((int)$month <= 12 && (int)$year <= 99) {
                $cleanExp = $year . $month;
            }
        }

        $payload = [
            'amount' => $amountCents,
            'initiator_id' => $initiatorId,
            'local_datetime' => date('Y-m-d\TH:i:s'),
            'payment_method' => 'card',
            'card_transaction' => [
                'type' => 'credit',
                'operation_type' => 'auth_and_capture',
                'installments' => max(1, min(12, $installments)),
                'installments_type' => 'merchant',
                'statement_descriptor' => substr($statementDescriptor, 0, 13),
                'card' => [
                    'entry_mode' => 'ecommerce',
                    'number' => $cleanNumber,
                    'expiration_date' => $cleanExp,
                    'cvv' => $cardData['cvv'] ?? '',
                    'holder_name' => strtoupper(trim($cardData['holder_name'] ?? ''))
                ]
            ]
        ];

        return $this->executeRequest('POST', '/charges', $payload);
    }

    /**
     * Creates a PIX Charge.
     */
    public function createPixCharge(
        int $amountCents,
        string $initiatorId,
        array $customerData,
        int $expirationSeconds = 3600
    ): array {
        $payload = [
            'amount' => $amountCents,
            'initiator_id' => $initiatorId,
            'local_datetime' => date('Y-m-d\TH:i:s'),
            'payment_method' => 'pix',
            'pix_transaction' => [
                'expires_in' => $expirationSeconds,
                'additional_information' => [
                    [
                        'name' => 'Cliente',
                        'value' => substr($customerData['name'] ?? 'Cliente Body Harmony', 0, 50)
                    ]
                ]
            ]
        ];

        return $this->executeRequest('POST', '/charges', $payload);
    }

    /**
     * Queries status of charges by id or initiator_id.
     */
    public function getCharge(?string $id = null, ?string $initiatorId = null): array {
        $params = [];
        if (!empty($id)) {
            $params['ids[]'] = $id;
        } elseif (!empty($initiatorId)) {
            $params['initiator_ids[]'] = $initiatorId;
        } else {
            return [
                'success' => false,
                'http_code' => 400,
                'error' => 'Informe id ou initiator_id para consulta.'
            ];
        }

        $queryString = http_build_query($params);
        return $this->executeRequest('GET', '/charges?' . $queryString);
    }

    /**
     * Cancels / Reverses a charge.
     */
    public function cancelCharge(?string $id = null, ?string $initiatorId = null, int $amountCents = 0, string $reason = ''): array {
        $payload = [];
        if (!empty($id)) {
            $payload['id'] = $id;
        } elseif (!empty($initiatorId)) {
            $payload['initiator_id'] = $initiatorId;
        }

        if ($amountCents > 0) {
            $payload['amount'] = $amountCents;
        }
        if (!empty($reason)) {
            $payload['reason'] = $reason;
        }

        return $this->executeRequest('POST', '/charges/cancel', $payload);
    }
}
