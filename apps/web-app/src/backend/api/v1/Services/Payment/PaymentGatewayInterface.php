<?php

namespace BodyHarmony\Services\Payment;

/**
 * PaymentGatewayInterface — Interface Abstrata para Gateways de Pagamento
 * Suporta Asaas, Stone e Mock Fallback (Nexus Protocol V3.1)
 */
interface PaymentGatewayInterface {
    /**
     * Gera uma cobrança via PIX
     * @param array $data ['amount_cents', 'customer_name', 'customer_email', 'customer_cpf', 'customer_phone', 'description', 'external_reference']
     * @return array ['ok' => bool, 'payment_id' => string, 'pix_qr_code' => string, 'pix_copy_paste' => string, 'expiration' => string, 'is_mock' => bool, 'raw' => mixed]
     */
    public function createPixCharge(array $data): array;

    /**
     * Processa uma cobrança via Cartão de Crédito com parcelamento e juros
     * @param array $data ['amount_cents', 'installments', 'card_data' => [...], 'customer_name', 'customer_email', 'customer_cpf', 'customer_phone', 'description', 'external_reference']
     * @return array ['ok' => bool, 'payment_id' => string, 'status' => string, 'amount_cents' => int, 'installments' => int, 'installment_value_cents' => int, 'is_mock' => bool, 'raw' => mixed]
     */
    public function createCreditCardCharge(array $data): array;

    /**
     * Cria fatura hospedada com suporte a 3DS e múltiplos métodos de pagamento (Fallback de segurança)
     * @param array $data ['amount_cents', 'installments', 'customer_name', 'customer_email', 'customer_cpf', 'customer_phone', 'description', 'external_reference']
     * @return array ['ok' => bool, 'payment_id' => string, 'invoice_url' => string, 'status' => string, 'amount_cents' => int, 'installments' => int, 'is_mock' => bool]
     */
    public function createHostedInvoice(array $data): array;

    /**
     * Consulta o status de um pagamento
     * @param string $paymentId
     * @return array ['ok' => bool, 'status' => string, 'paid' => bool, 'raw' => mixed]
     */
    public function getPaymentStatus(string $paymentId): array;

    /**
     * Calcula as opções de parcelamento repassando os juros ao comprador
     * @param int $baseAmountCents
     * @param int $maxInstallments
     * @return array Array de opções de parcelamento [{ 'installment': int, 'total_cents': int, 'installment_cents': int, 'has_interest': bool, 'interest_rate': float }]
     */
    public function calculateInstallments(int $baseAmountCents, int $maxInstallments = 12): array;
}
