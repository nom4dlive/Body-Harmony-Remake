<?php
// apps/web-app/src/backend/api/ping_asaas.php
require_once __DIR__ . '/config.php';
EnvLoader::load();

require_once __DIR__ . '/v1/Services/Payment/AsaasGatewayService.php';

use BodyHarmony\Services\Payment\AsaasGatewayService;

header('Content-Type: application/json; charset=utf-8');

// 1. Obter IP de saida da Hostinger
$ch = curl_init('https://api.ipify.org?format=json');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$ipRes = curl_exec($ch);
curl_close($ch);
$ipData = json_decode($ipRes, true);
$outboundIp = $ipData['ip'] ?? 'desconhecido';

// 2. Testar chamada no Asaas
$gateway = new AsaasGatewayService();
$testLink = $gateway->createPaymentLink([
    'name' => 'Teste Diagnostico IP',
    'value_cents' => 10000,
    'max_installments' => 1
]);

echo json_encode([
    'server_outbound_ip' => $outboundIp,
    'asaas_environment' => $gateway->getEnvironment(),
    'asaas_is_mock' => $gateway->isMockMode(),
    'asaas_response' => $testLink
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
