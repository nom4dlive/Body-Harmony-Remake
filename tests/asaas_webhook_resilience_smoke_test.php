<?php
/**
 * Asaas Webhook Resilience Smoke Test (Nexus Protocol V3.2)
 * Valida a rota, simulação de eventos PAYMENT_CONFIRMED e resposta HTTP 200/Ping
 */

$baseUrl = "https://bodyharmony.com.br/api/v1/payments/webhook/asaas";

echo "========================================================\n";
echo "   ASAAS WEBHOOK RESILIENCE SMOKE TEST (PLAN-230)\n";
echo "========================================================\n\n";

$allPassed = true;

// Teste 1: GET Ping de Disponibilidade
echo "[1/3] Testando GET ping de disponibilidade...\n";
$ch = curl_init($baseUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPGET, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "   ✅ GET Ping retornou status HTTP 200 OK. Resposta: {$response}\n";
} else {
    echo "   ❌ GET Ping FALHOU com status HTTP {$httpCode}\n";
    $allPassed = false;
}

// Teste 2: POST Evento Simulado PAYMENT_CONFIRMED com Header asaas-access-token
echo "\n[2/3] Testando POST de evento PAYMENT_CONFIRMED...\n";
$payload = json_encode([
    'event' => 'PAYMENT_CONFIRMED',
    'payment' => [
        'id' => 'pay_smoke_test_' . time(),
        'customer' => 'cus_smoke_test',
        'value' => 697.00,
        'netValue' => 670.00,
        'billingType' => 'PIX',
        'status' => 'RECEIVED',
        'externalReference' => 'TKT-CONG-SMOKE-TEST'
    ]
]);

$ch = curl_init($baseUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'asaas-access-token: smoke_test_access_token'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "   ✅ POST Evento retornou status HTTP 200 OK. Resposta: {$response}\n";
} else {
    echo "   ❌ POST Evento FALHOU com status HTTP {$httpCode}\n";
    $allPassed = false;
}

// Teste 3: POST Evento com Trailing Slash (/payments/webhook/asaas/)
echo "\n[3/3] Testando POST com trailing slash (/payments/webhook/asaas/)...\n";
$ch = curl_init($baseUrl . '/');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'asaas-access-token: smoke_test_access_token'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "   ✅ POST Trailing Slash retornou status HTTP 200 OK.\n";
} else {
    echo "   ❌ POST Trailing Slash FALHOU com status HTTP {$httpCode}\n";
    $allPassed = false;
}

echo "\n========================================================\n";
if ($allPassed) {
    echo "🎉 RESULTADO: TODOS OS TESTES PASSARAM COM SUCESSO!\n";
    exit(0);
} else {
    echo "❌ RESULTADO: FALHA EM UM OU MAIS TESTES.\n";
    exit(1);
}
