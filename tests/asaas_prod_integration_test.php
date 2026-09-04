<?php
// tests/asaas_prod_integration_test.php
// Suite de testes de integracao para o Gateway Asaas e Webhook

require_once __DIR__ . '/../apps/web-app/src/backend/api/config.php';
EnvLoader::load();

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Core/Response.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/Payment/AsaasGatewayService.php';

use BodyHarmony\Services\Payment\AsaasGatewayService;

echo "=================================================================\n";
echo "   TEST SUITE: ASAAS PRODUCTION GATEWAY & WEBHOOK INTEGRATION    \n";
echo "=================================================================\n\n";

$passed = 0;
$failed = 0;

function assertCheck(string $desc, bool $condition, string $extra = '') {
    global $passed, $failed;
    if ($condition) {
        echo "  [PASS] {$desc}\n";
        $passed++;
    } else {
        echo "  [FAIL] {$desc} " . ($extra ? "($extra)" : '') . "\n";
        $failed++;
    }
}

// 1. Validar inicializacao do AsaasGatewayService em Producao
$gateway = new AsaasGatewayService();

assertCheck("Gateway detecta ambiente Production", $gateway->getEnvironment() === 'production', "Env: " . $gateway->getEnvironment());
assertCheck("Gateway nao esta em modo Mock forcado quando chave valida presente", !$gateway->isMockMode(), "isMock: " . ($gateway->isMockMode() ? 'true' : 'false'));
assertCheck("Gateway Base URL e api.asaas.com/v3", $gateway->getBaseUrl() === 'https://api.asaas.com/v3', "BaseUrl: " . $gateway->getBaseUrl());
assertCheck("Notificacoes automaticas estao ativas (notificationDisabled=false)", $gateway->isNotificationDisabled() === false);

// 2. Validar calculo de parcelamento (Tabela Price)
$installments = $gateway->calculateInstallments(69700, 12);
assertCheck("Parcelamento retorna 12 opcoes", count($installments) === 12);
assertCheck("1x e sem juros (R$ 697,00)", $installments[0]['total_cents'] === 69700 && $installments[0]['has_interest'] === false);
assertCheck("12x calcula juros compostos", $installments[11]['total_cents'] > 69700 && $installments[11]['has_interest'] === true);

// 3. Validar criacao de mock para ambiente isolado
$mockGateway = new AsaasGatewayService('mock', 'mock');
$mockLink = $mockGateway->createPaymentLink([
    'name' => 'Teste Produto',
    'value_cents' => 15000,
    'description' => 'Descricao do teste'
]);
assertCheck("createPaymentLink em modo mock retorna URL valida", !empty($mockLink['payment_link_url']));
assertCheck("createPaymentLink mock retorna payment_link_id", !empty($mockLink['payment_link_id']));

// 4. Validar configuracao de token de Webhook
$expectedToken = getenv('ASAAS_WEBHOOK_TOKEN') ?: ($_ENV['ASAAS_WEBHOOK_TOKEN'] ?? '');
assertCheck("Token do Webhook esta configurado", !empty($expectedToken) && strpos($expectedToken, 'whsec_') === 0);

echo "\n=================================================================\n";
echo "   RESULTADO FINAL: {$passed} PASSOU / {$failed} FALHOU\n";
echo "=================================================================\n";
