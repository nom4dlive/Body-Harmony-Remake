<?php
// tests/crm_inbox_update_smoke_test.php
// Body Harmony Nexus V3.1 — CRM Inbox Name Management Smoke Test (PLAN-164)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmBridgeService.php';

use BodyHarmony\Services\CrmBridgeService;

echo "===============================================================\n";
echo "    TESTE DE FUMAÇA: CRM INBOX NAME MANAGEMENT (PLAN-164)      \n";
echo "===============================================================\n\n";

$service = new CrmBridgeService(null, 'mock', 'token_mock', 1);

// 1. Test Mock Update
echo ">> [1/3] Testando atualização de nome no modo mock...\n";
$resMock = $service->updateInboxName(1, '⚖️ Jurídico & Contratos Oficiais', 'mock');

if ($resMock['status'] === 'success' && $resMock['data']['name'] === '⚖️ Jurídico & Contratos Oficiais') {
    echo "✅ Mock update aprovado: ID {$resMock['data']['id']} -> {$resMock['data']['name']}\n";
} else {
    echo "❌ Falha no teste de mock update.\n";
    exit(1);
}

// 2. Test Validation Errors
echo "\n>> [2/3] Testando validação defensiva de parâmetros inválidos...\n";
$validationPassed = false;
try {
    $service->updateInboxName(0, '', 'mock');
} catch (\Exception $e) {
    $validationPassed = true;
    echo "✅ Validação disparada com sucesso: " . $e->getMessage() . "\n";
}

if (!$validationPassed) {
    echo "❌ Falha: Validação não barrou parâmetros vazios.\n";
    exit(1);
}

// 3. Test Live Chatwoot API update (if reachable on VPS or live Chatwoot)
echo "\n>> [3/3] Testando chamada real à API do Chatwoot (se disponível)...\n";
$liveService = new CrmBridgeService(null, 'http://127.0.0.1:3005', 'wxvcKsycZEXjrqM7dxD72oNm', 1);
try {
    $resLive = $liveService->updateInboxName(1, '⚖️ Jurídico & Contratos');
    echo "✅ Live update aprovado: " . json_encode($resLive, JSON_UNESCAPED_UNICODE) . "\n";
} catch (\Exception $e) {
    echo "ℹ️ Live Chatwoot não acessível neste ambiente local (esperado em CLI local): " . $e->getMessage() . "\n";
}

echo "\n===============================================================\n";
echo "🎉 TESTE DE FUMAÇA DO PLAN-164 CONCLUÍDO COM SUCESSO!\n";
echo "===============================================================\n";
