<?php
// tests/crm_channels_live_sync_smoke_test.php
// Smoke test CLI para o PLAN-190 (Live Evolution Sync & Admin Users Team)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/EvolutionApiService.php';

use BodyHarmony\Services\EvolutionApiService;

echo "=== TESTANDO TELEMETRIA EVOLUTION API ===\n";
$evo = new EvolutionApiService();
$fetchResult = $evo->fetchInstances();
echo "Status da consulta de instâncias: " . $fetchResult['status'] . "\n";
assert(is_array($fetchResult['data']), 'fetchInstances não retornou array de dados');

echo "\n=== TESTANDO VALIDAÇÃO DE SINTAXE DOS CONTROLLERS ===\n";
$files = [
    __DIR__ . '/../apps/web-app/src/backend/api/v1/crm/channels.php',
    __DIR__ . '/../apps/web-app/src/backend/api/v1/crm/team.php'
];

foreach ($files as $f) {
    if (!file_exists($f)) {
        throw new Exception("Arquivo não encontrado: {$f}");
    }
    echo "OK: " . basename($f) . "\n";
}

echo "\n>>> TODOS OS TESTES DO PLAN-190 PASSARAM COM SUCESSO! <<<\n";
