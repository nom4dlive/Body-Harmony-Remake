<?php
// scripts/seed_crm_canned_responses.php
// Body Harmony Nexus V3.1 — Seed Official Canned Responses into Chatwoot (PLAN-176)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmCannedResponsesService.php';

use BodyHarmony\Services\CrmCannedResponsesService;

echo "====================================================================\n";
echo "   SEED DE RESPOSTAS RÁPIDAS & MACROS NO CHATWOOT (PLAN-176)        \n";
echo "====================================================================\n\n";

$service = new CrmCannedResponsesService();
echo ">> [1/2] Carregando macros oficiais Body Harmony...\n";
$macros = $service->getDefaultMacros();
foreach ($macros as $m) {
    echo "   - /{$m['short_code']}\n";
}

echo "\n>> [2/2] Injetando no Chatwoot API (https://crm.bodyharmony.com.br)...\n";
$res = $service->syncMacrosToChatwoot();

echo "\n====================================================================\n";
echo "Resultado: " . ($res['success'] ? '✅ SUCESSO' : '❌ ERRO') . "\n";
echo "Macros Sincronizadas: {$res['synced_count']}/" . count($macros) . "\n";
echo "====================================================================\n";
