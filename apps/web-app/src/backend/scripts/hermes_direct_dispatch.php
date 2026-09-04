<?php
// apps/web-app/src/backend/scripts/hermes_direct_dispatch.php
// Hermes Proactive CLI Direct Dispatch Utility (PLAN-191)

require_once __DIR__ . '/../api/config.php';
require_once __DIR__ . '/../api/v1/Services/HermesCrmAgentService.php';

use BodyHarmony\Services\HermesCrmAgentService;

$options = getopt('', ['instance::', 'phone::', 'objective::']);

$instance = $options['instance'] ?? 'inst_comercial';
$phone = $options['phone'] ?? '+5518996959486';
$objective = $options['objective'] ?? 'Teste de disparo proativo autônomo do Hermes via Evolution API v2';

echo "========================================================\n";
echo " Hermes CLI Direct Proactive Dispatch (PLAN-191)\n";
echo "========================================================\n";
echo "Target Phone : {$phone}\n";
echo "Instance     : {$instance}\n";
echo "Objective    : {$objective}\n";
echo "--------------------------------------------------------\n";
echo "⚡ Executando raciocínio via Qwen Proxy e disparo direto...\n";

global $pdo, $db;
$dbConn = $pdo ?? $db;

$service = new HermesCrmAgentService($dbConn);
$result = $service->dispatchProactiveMessage($instance, $phone, $objective);

echo "\nResultado:\n";
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

if ($result['success']) {
    echo "\n✅ DISPARO PROATIVO CONCLUÍDO COM SUCESSO!\n";
    exit(0);
} else {
    echo "\n❌ FALHA NO DISPARO PROATIVO: " . ($result['error'] ?? 'UNKNOWN') . "\n";
    exit(1);
}
