<?php
// tests/crm_history_sync_smoke_test.php
// Body Harmony Nexus V3.1 — CRM History Sync Smoke Test (PLAN-165)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmHistorySyncService.php';

use BodyHarmony\Services\CrmHistorySyncService;

echo "===============================================================\n";
echo "    TESTE DE FUMAÇA: CRM HISTORY SYNC ENGINE (PLAN-165)        \n";
echo "===============================================================\n\n";

// 1. Phone normalization test
echo ">> [1/3] Testando normalização telefônica e extração de dígitos...\n";
$service = new CrmHistorySyncService(null, 'mock', 'token_mock', 1);

$norm1 = $service->normalizePhone('18996959486');
$norm2 = $service->normalizePhone('+55 (18) 99695-9486');

if ($norm1['formatted_e164'] === '+5518996959486' && $norm2['formatted_e164'] === '+5518996959486') {
    echo "✅ Normalização telefônica aprovada: {$norm1['formatted_e164']}\n";
} else {
    echo "❌ Falha na normalização telefônica.\n";
    exit(1);
}

// 2. Import History in Mock Mode
echo "\n>> [2/3] Testando motor de importação retroativa em lote...\n";
$sampleBatch = [
    [
        'phone' => '18996959486',
        'content' => 'Olá, gostaria de saber o status do meu contrato.',
        'created_at' => time() - 86400,
        'message_type' => 'incoming',
        'sender_name' => 'Dra. Teste'
    ],
    [
        'phone' => '18996959486',
        'content' => 'Seu contrato já foi emitido e está pronto para assinatura.',
        'created_at' => time() - 80000,
        'message_type' => 'outgoing',
        'sender_name' => 'Atendimento Body Harmony'
    ],
    [
        'phone' => '', // Mensagem inválida para testar skipped
        'content' => 'Mensagem sem telefone',
        'created_at' => time(),
        'message_type' => 'incoming'
    ]
];

$importResult = $service->importHistory(1, $sampleBatch);

if ($importResult['status'] === 'success' && $importResult['data']['imported_count'] === 2 && $importResult['data']['skipped_count'] === 1) {
    echo "✅ Importação retroativa aprovada: {$importResult['data']['imported_count']} importadas, {$importResult['data']['skipped_count']} ignoradas.\n";
} else {
    echo "❌ Falha no teste de importação: " . json_encode($importResult) . "\n";
    exit(1);
}

// 3. Export History in Mock Mode
echo "\n>> [3/3] Testando motor de exportação de conversas da Inbox...\n";
$exportResult = $service->exportHistory(1, 'json');

if ($exportResult['status'] === 'success' && !empty($exportResult['data']['conversations'])) {
    $conv = $exportResult['data']['conversations'][0];
    echo "✅ Exportação aprovada: Conversa ID {$conv['id']} com {$conv['messages_count']} mensagens estruturadas.\n";
} else {
    echo "❌ Falha no teste de exportação: " . json_encode($exportResult) . "\n";
    exit(1);
}

echo "\n===============================================================\n";
echo "🎉 TESTE DE FUMAÇA DO PLAN-165 CONCLUÍDO COM 100% DE SUCESSO!\n";
echo "===============================================================\n";
