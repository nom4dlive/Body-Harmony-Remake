<?php
// apps/web-app/src/backend/bin/crm_worker.php
// Body Harmony Nexus V3.1 — CLI Background Worker Daemon / Cron Runner
// Usage: php crm_worker.php [--dry-run]

if (php_sapi_name() !== 'cli') {
    die("Acesso permitido apenas via linha de comando (CLI).\n");
}

require_once __DIR__ . '/../api/config.php';
require_once __DIR__ . '/../api/v1/Services/CrmBackgroundWorkerService.php';

use BodyHarmony\Services\CrmBackgroundWorkerService;

global $pdo, $db;
$dbConn = $pdo ?? $db;

$isDryRun = in_array('--dry-run', $argv);

echo "[" . date('Y-m-d H:i:s') . "] Iniciando CRM Background Worker (Nexus V4.4)...\n";

if ($isDryRun) {
    echo "[DRY-RUN] Modo de teste ativado. Nenhuma mensagem externa será despachada.\n";
}

$worker = new CrmBackgroundWorkerService($dbConn);
$result = $worker->runFullCycle();

echo "[" . date('Y-m-d H:i:s') . "] Ciclo Concluído em {$result['execution_time_ms']}ms. Total processado: {$result['total_items_processed']}.\n";
echo "Detalhes: " . json_encode($result['details'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
