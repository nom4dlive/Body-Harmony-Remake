<?php
// tests/social_channels_smoke_test.php
// Body Harmony Nexus V3.1 — Social Channels (Instagram & Telegram) Smoke Test (PLAN-172)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/SocialChannelsService.php';

use BodyHarmony\Services\SocialChannelsService;

echo "===============================================================\n";
echo "   TESTE DE FUMAÇA: SOCIAL CHANNELS & CHATWOOT (PLAN-172)      \n";
echo "===============================================================\n\n";

$service = new SocialChannelsService(null, 'https://crm.bodyharmony.com.br', 'wxvcKsycZEXjrqM7dxD72oNm');

// 1. Test Channels Status Structure
echo ">> [1/2] Testando obtenção de status dos canais sociais...\n";
$statusRes = $service->getChannelsStatus();

if ($statusRes['success'] === true && is_array($statusRes['channels']) && count($statusRes['channels']) >= 3) {
    echo "   [✓] Canais verificados com sucesso (" . count($statusRes['channels']) . " canais ativos)\n";
    foreach ($statusRes['channels'] as $chan) {
        $statusStr = $chan['is_connected'] ? '🟢 Conectado' : '🟡 Pendente';
        echo "   [✓] Canal: {$chan['name']} | Atendente: {$chan['assigned_agent']} | {$statusStr}\n";
    }
} else {
    echo "❌ Falha na recuperação de status dos canais.\n";
    exit(1);
}

// 2. Test Input Validation for Telegram/Instagram Connect
echo "\n>> [2/2] Testando validação de parâmetros de conexão...\n";
$emptyTg = $service->connectTelegramBot('');
if ($emptyTg['success'] === false) {
    echo "   [✓] Validação de token vazio do Telegram aprovada\n";
} else {
    echo "❌ Falha na validação de token vazio do Telegram.\n";
    exit(1);
}

$emptyMeta = $service->connectMetaInstagram('', '');
if ($emptyMeta['success'] === false) {
    echo "   [✓] Validação de credenciais vazias do Meta/Instagram aprovada\n";
} else {
    echo "❌ Falha na validação do Meta/Instagram.\n";
    exit(1);
}

echo "\n===============================================================\n";
echo "🎉 TESTE DE FUMAÇA DOS CANAIS SOCIAIS 100% APROVADO!\n";
echo "===============================================================\n";
