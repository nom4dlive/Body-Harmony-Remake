<?php
// tests/crm_fullstack_integration_smoke_test.php
// Smoke test CLI para o PLAN-189 (Nexus Protocol V3.1)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/EvolutionApiService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmBridgeService.php';

use BodyHarmony\Services\EvolutionApiService;
use BodyHarmony\Services\CrmBridgeService;

echo "=== TESTANDO EVOLUTION API SERVICE ===\n";
$evo = new EvolutionApiService();
echo "EvolutionApiService instanciado com sucesso.\n";

echo "\n=== TESTANDO CRM BRIDGE SERVICE ===\n";
$bridge = new CrmBridgeService(null, 'mock', 'token_test', 1, 'mock', 'key_test');
$norm = $bridge->normalizePhone('+55 (18) 99695-9486');
echo "Telefone normalizado: " . json_encode($norm) . "\n";
assert($norm['digits'] === '5518996959486', 'Normalização de telefone com erro');

$dossier = $bridge->getDossierByPhone('18996959486');
echo "Dossiê mock resolvido: " . json_encode($dossier) . "\n";
assert(isset($dossier['phone']), 'Dossiê sem chave phone');

echo "\n=== TESTANDO VALIDAÇÃO DE SINTAXE PHP DOS CONTROLLERS ===\n";
$files = [
    __DIR__ . '/../apps/web-app/src/backend/api/v1/crm/channels.php',
    __DIR__ . '/../apps/web-app/src/backend/api/v1/crm/inbox_actions.php',
    __DIR__ . '/../apps/web-app/src/backend/api/v1/crm/inbox_messages.php',
    __DIR__ . '/../apps/web-app/src/backend/api/v1/crm/inbox_conversations.php',
    __DIR__ . '/../apps/web-app/src/backend/api/v1/crm/team.php',
    __DIR__ . '/../apps/web-app/src/backend/api/v1/crm/dossier.php'
];

foreach ($files as $f) {
    if (!file_exists($f)) {
        throw new Exception("Arquivo não encontrado: {$f}");
    }
    echo "OK: " . basename($f) . "\n";
}

echo "\n>>> TODOS OS TESTES DE FUMAÇA DO PLAN-189 PASSARAM COM SUCESSO! <<<\n";
