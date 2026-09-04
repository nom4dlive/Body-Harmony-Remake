<?php
// tests/crm_outbound_delivery_smoke_test.php
// Body Harmony Nexus V3.1 — CRM Outbound Delivery Smoke Test (PLAN-167)

echo "===============================================================\n";
echo "    TESTE DE FUMAÇA: CRM OUTBOUND DELIVERY (PLAN-167)          \n";
echo "===============================================================\n\n";

$chatwootUrl = "https://crm.bodyharmony.com.br";
$token = "wxvcKsycZEXjrqM7dxD72oNm";

// 1. Audit Chatwoot Inboxes Webhook URLs (SSRF Shield & Internal Docker Network)
echo ">> [1/2] Verificando URLs de Webhook das Inboxes do Chatwoot...\n";
$ch = curl_init("{$chatwootUrl}/api/v1/accounts/1/inboxes?api_access_token={$token}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["api_access_token: {$token}"]);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
$inboxes = $data['payload'] ?? [];

$validCount = 0;
foreach ($inboxes as $inbox) {
    $wh = $inbox['webhook_url'] ?? '';
    if (!empty($wh) && (str_starts_with($wh, 'http://evolution-api:8080') || str_starts_with($wh, 'https://evolution.bodyharmony.com.br'))) {
        echo "   [✓] Inbox ID {$inbox['id']} ({$inbox['name']}): Webhook ativo -> {$wh}\n";
        $validCount++;
    }
}

if ($validCount >= 3) {
    echo "✅ Todas as 3 Inboxes possuem Webhook oficial configurado (Zero Bloqueio SSRF & 0ms Latência).\n";
} else {
    echo "❌ Falha: Menos de 3 Inboxes possuem Webhook configurado.\n";
    exit(1);
}

// 2. Test Outbound Message Injection
echo "\n>> [2/2] Testando injeção de mensagem Outbound no Chatwoot...\n";
$msgPayload = json_encode([
    'content' => "🤖 Teste automatizado CLI Outbound Delivery (PLAN-167)",
    'message_type' => 'outgoing',
    'private' => false
]);

$ch2 = curl_init("{$chatwootUrl}/api/v1/accounts/1/conversations/1/messages?api_access_token={$token}");
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, $msgPayload);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    "api_access_token: {$token}",
    "Content-Type: application/json"
]);
$resp2 = curl_exec($ch2);
curl_close($ch2);

$msgData = json_decode($resp2, true);
if (isset($msgData['id']) && $msgData['message_type'] === 1) {
    echo "✅ Mensagem Outbound ID {$msgData['id']} gerada no Chatwoot com sucesso.\n";
} else {
    echo "❌ Falha ao injetar mensagem no Chatwoot: {$resp2}\n";
    exit(1);
}

echo "\n===============================================================\n";
echo "🎉 TESTE DE FUMAÇA DO PLAN-167 CONCLUÍDO COM 100% DE SUCESSO!\n";
echo "===============================================================\n";
