<?php
// tests/crm_health_smoke_test.php
// Body Harmony Nexus V3.1 — CRM Health Check Smoke Test (PLAN-178)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmHealthCheckService.php';

use BodyHarmony\Services\CrmHealthCheckService;

echo "====================================================================\n";
echo "   TESTE DE FUMAÇA: CRM HEALTH CHECK UNIFICADO (PLAN-178)          \n";
echo "====================================================================\n\n";

$service = new CrmHealthCheckService(null);

// 1. Test Full Diagnosis Structure
echo ">> [1/4] Testando estrutura completa do diagnóstico...\n";
$result = $service->runFullDiagnosis();

if (
    isset($result['status']) &&
    isset($result['timestamp']) &&
    isset($result['checks']) &&
    is_array($result['checks'])
) {
    echo "   [✓] Estrutura de resposta válida: status={$result['status']}, timestamp={$result['timestamp']}\n";
} else {
    echo "   [✗] Estrutura de resposta inválida: " . json_encode($result) . "\n";
    exit(1);
}

// 2. Test All 5 Probes Present
echo "\n>> [2/4] Verificando presença dos 5 probes obrigatórios...\n";
$requiredChecks = ['database_mysql', 'whatsapp_instances', 'google_service_account', 'redis_queue', 'chatwoot_bridge'];
$missingChecks = [];

foreach ($requiredChecks as $check) {
    if (!isset($result['checks'][$check])) {
        $missingChecks[] = $check;
    }
}

if (empty($missingChecks)) {
    echo "   [✓] Todos os 5 probes presentes: " . implode(', ', $requiredChecks) . "\n";
} else {
    echo "   [✗] Probes ausentes: " . implode(', ', $missingChecks) . "\n";
    exit(1);
}

// 3. Test MySQL Probe (sem DB = fallback OK)
echo "\n>> [3/4] Testando probe MySQL (modo CLI sem banco)...\n";
$mysqlProbe = $result['checks']['database_mysql'];

if ($mysqlProbe['status'] === 'ok') {
    $latency = $mysqlProbe['latency_ms'] ?? 'N/A';
    echo "   [✓] MySQL probe OK (latência: {$latency}ms)\n";
} else {
    echo "   [✗] MySQL probe falhou: " . json_encode($mysqlProbe) . "\n";
    exit(1);
}

// 4. Test WhatsApp Instances Structure
echo "\n>> [4/4] Testando estrutura de instâncias WhatsApp...\n";
$waInstances = $result['checks']['whatsapp_instances'];
$officialLines = ['juridico', 'licenciadas', 'clinica', 'comercial'];
$allPresent = true;

foreach ($officialLines as $line) {
    if (!isset($waInstances[$line])) {
        $allPresent = false;
        echo "   [✗] Linha '{$line}' ausente na resposta\n";
    }
}

if ($allPresent) {
    echo "   [✓] Todas as 4 linhas oficiais presentes:\n";
    foreach ($officialLines as $line) {
        $status = $waInstances[$line];
        $emoji = $status === 'open' ? '🟢' : ($status === 'unknown' ? '🟡' : '🔴');
        echo "       - {$emoji} {$line}: {$status}\n";
    }
} else {
    exit(1);
}

// 5. Test Overall Status Logic
echo "\n>> [BONUS] Validando lógica de status agregado...\n";
$validStatuses = ['healthy', 'degraded', 'unhealthy'];

if (in_array($result['status'], $validStatuses)) {
    echo "   [✓] Status agregado válido: {$result['status']}\n";
} else {
    echo "   [✗] Status inválido: {$result['status']}\n";
    exit(1);
}

echo "\n====================================================================\n";
echo "🎉 TESTE DE FUMAÇA DO CRM HEALTH CHECK 100% APROVADO!\n";
echo "====================================================================\n";
