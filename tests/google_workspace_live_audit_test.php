<?php
// tests/google_workspace_live_audit_test.php
// Body Harmony Nexus V3.2 — Google Workspace Live Audit Test (PLAN-205)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/GoogleWorkspaceService.php';

use BodyHarmony\Services\GoogleWorkspaceService;

echo "====================================================================\n";
echo "   AUDITORIA FULLSTACK: GOOGLE WORKSPACE (PLAN-205)                \n";
echo "====================================================================\n\n";

$service = new GoogleWorkspaceService(null);

// 1. Validar Conta Oficial
echo ">> [1/4] Verificando conta oficial vinculada (bodyharmony36@gmail.com)...\n";
$account = $service->getOfficialAccount();
if ($account === 'bodyharmony36@gmail.com') {
    echo "   [✓] Conta oficial configurada corretamente: {$account}\n";
} else {
    echo "   [✗] Erro: Conta oficial incorreta ({$account})\n";
    exit(1);
}

// 2. Validar Estrutura de Status e Telemetria
echo "\n>> [2/4] Verificando contrato de Status e Diagnóstico...\n";
$status = $service->getStatus();
$requiredKeys = ['success', 'is_connected', 'is_live_api', 'mode', 'account', 'auth_type', 'scopes', 'services', 'diagnostics'];
foreach ($requiredKeys as $k) {
    if (!array_key_exists($k, $status)) {
        echo "   [✗] Chave obrigatória ausente no status: {$k}\n";
        exit(1);
    }
}
echo "   [✓] Contrato de status validado com sucesso! Modo: {$status['mode']}\n";
echo "       - Is Live API: " . ($status['is_live_api'] ? "TRUE" : "FALSE") . "\n";
echo "       - Auth Type: {$status['auth_type']}\n";

// 3. Executar Sonda Viva (Live Probe Diagnostic)
echo "\n>> [3/4] Executando Sonda de Diagnóstico em Tempo Real (runLiveProbe)...\n";
$probe = $service->runLiveProbe();
if (isset($probe['success']) && isset($probe['results']['calendar']) && isset($probe['results']['drive']) && isset($probe['results']['contacts'])) {
    echo "   [✓] Sonda executada com sucesso!\n";
    echo "       - Calendar: {$probe['results']['calendar']['status']} ({$probe['results']['calendar']['latency_ms']}ms)\n";
    echo "       - Drive: {$probe['results']['drive']['status']} ({$probe['results']['drive']['latency_ms']}ms)\n";
    echo "       - Contacts: {$probe['results']['contacts']['status']} ({$probe['results']['contacts']['latency_ms']}ms)\n";
} else {
    echo "   [✗] Falha na execução da sonda viva: " . json_encode($probe) . "\n";
    exit(1);
}

// 4. Testar Validação de Salvamento Seguro de Token
echo "\n>> [4/4] Testando validador de injeção segura de token (saveUserTokenJson)...\n";
$invalidResult = $service->saveUserTokenJson("invalid-json");
if ($invalidResult['success'] === false) {
    echo "   [✓] Validador rejeitou JSON corrompido com sucesso.\n";
} else {
    echo "   [✗] Validador aceitou JSON corrompido indevidamente.\n";
    exit(1);
}

echo "\n====================================================================\n";
echo "🎉 AUDITORIA FULLSTACK DO GOOGLE WORKSPACE APROVADA!\n";
echo "====================================================================\n";
