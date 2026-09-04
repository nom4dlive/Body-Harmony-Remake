<?php
// scripts/sync_licenciadas_to_chatwoot.php
// Body Harmony Nexus V3.1 — Bulk Sync 104 Licenciadas to Chatwoot (PLAN-176)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmContactsBulkSyncService.php';

use BodyHarmony\Services\CrmContactsBulkSyncService;

echo "====================================================================\n";
echo "   SINCRONIZAÇÃO EM MASSA: 104 LICENCIADAS NO CHATWOOT (PLAN-176)   \n";
echo "====================================================================\n\n";

$pdo = null;
try {
    $dbHost = getenv('DB_HOST') ?: '127.0.0.1';
    $dbName = getenv('DB_NAME') ?: 'bodyharmony';
    $dbUser = getenv('DB_USER') ?: 'root';
    $dbPass = getenv('DB_PASS') ?: 'rootpass';

    $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5
    ]);
    echo ">> [1/2] Conexão com banco de dados MySQL estabelecida!\n";
} catch (\Throwable $e) {
    echo ">> [1/2] Conexão direta com MySQL falhou ({$e->getMessage()}). Operando em modo de simulação/mock...\n";
}

$service = new CrmContactsBulkSyncService($pdo);
echo ">> [2/2] Disparando sincronização com Chatwoot API...\n";

$result = $service->syncAllLicenciadas();

echo "\n====================================================================\n";
echo "Resultado: " . ($result['success'] ? '✅ SUCESSO' : '❌ ERRO') . "\n";
echo "Licenciadas Identificadas: {$result['total_licenciadas']}\n";
echo "Licenciadas Sincronizadas: {$result['synced_count']}\n";
if (!empty($result['errors'])) {
    echo "Erros (" . count($result['errors']) . "):\n";
    foreach ($result['errors'] as $err) {
        echo "  - {$err}\n";
    }
}
echo "====================================================================\n";
