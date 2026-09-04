<?php
// tests/crm_contacts_bulk_sync_smoke_test.php
// Body Harmony Nexus V3.1 — Contacts Bulk Sync Smoke Test (PLAN-176)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmContactsBulkSyncService.php';

use BodyHarmony\Services\CrmContactsBulkSyncService;

echo "====================================================================\n";
echo "   TESTE DE FUMAÇA: BULK SYNC 104 LICENCIADAS (PLAN-176)           \n";
echo "====================================================================\n\n";

$service = new CrmContactsBulkSyncService(null);

// 1. Test Phone Normalization
echo ">> [1/2] Testando normalização de telefones internacionais (+55)...\n";
$norm1 = $service->normalizePhone('18997242050');
$norm2 = $service->normalizePhone('5518996959486');
$norm3 = $service->normalizePhone('+55 (18) 99619-3745');

if ($norm1 === '+5518997242050' && $norm2 === '+5518996959486' && $norm3 === '+5518996193745') {
    echo "   [✓] Normalização para formato internacional E.164 (+55): OK\n";
} else {
    echo "   [✗] Falha na normalização: {$norm1}, {$norm2}, {$norm3}\n";
    exit(1);
}

// 2. Test Sync Execution
echo "\n>> [2/2] Testando execução de sincronização em massa...\n";
$res = $service->syncAllLicenciadas();

if ($res['success'] === true && $res['total_licenciadas'] >= 100) {
    echo "   [✓] Sincronização aprovada: {$res['synced_count']} licenciadas ativas processadas.\n";
} else {
    echo "   [✗] Falha no sync: " . json_encode($res) . "\n";
    exit(1);
}

echo "\n====================================================================\n";
echo "🎉 TESTE DE FUMAÇA DE SYNC DE LICENCIADAS 100% APROVADO!\n";
echo "====================================================================\n";
