<?php
// tests/crm_status_smoke_test.php
// Body Harmony Nexus V3.1 — CRM Realtime Status & QR Code Smoke Test (PLAN-158)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmBridgeService.php';

use BodyHarmony\Services\CrmBridgeService;

echo "===============================================================\n";
echo "    TESTE DE FUMAÇA: CRM REALTIME STATUS & QR CODE (PLAN-158)  \n";
echo "===============================================================\n\n";

$service = new CrmBridgeService(null, null, null, 1, 'https://evolution.bodyharmony.com.br', 'bh_evo_global_key_v31_2026_secure');

// 1. Test getInstancesStatus
echo ">> [1/2] Testando consulta de status em tempo real...\n";
$statusResult = $service->getInstancesStatus();

if ($statusResult['success'] === true && !empty($statusResult['instances'])) {
    echo "✅ Status retornado com sucesso (" . count($statusResult['instances']) . " instâncias):\n";
    foreach ($statusResult['instances'] as $inst) {
        $badge = $inst['is_connected'] ? '🟢 Conectado' : '🟡 ' . $inst['status'];
        echo "   - {$inst['title']} ({$inst['key']}): {$badge} | Phone: " . ($inst['phone_number'] ?: 'N/A') . "\n";
    }
} else {
    echo "❌ Falha ao obter status das instâncias.\n";
    exit(1);
}

// 2. Test connectInstance (QR Code Generation)
echo "\n>> [2/2] Testando geração de QR Code para inst_juridico...\n";
$connectResult = $service->connectInstance('juridico');

if ($connectResult['success'] === true) {
    $hasQr = !empty($connectResult['qrcode_base64']);
    $hasPairing = !empty($connectResult['pairing_code']);
    echo "✅ Conexão solicitada com sucesso! QR Code Presente: " . ($hasQr ? 'SIM' : 'NÃO') . " | Pairing Code: " . ($hasPairing ? $connectResult['pairing_code'] : 'N/A') . "\n";
} else {
    echo "❌ Falha ao solicitar conexão da instância.\n";
    exit(1);
}

echo "\n===============================================================\n";
echo "🎉 100% DOS TESTES DE STATUS E QR CODE APROVADOS (PLAN-158)!\n";
echo "===============================================================\n";
