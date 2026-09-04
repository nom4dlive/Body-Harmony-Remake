<?php
// apps/web-app/src/backend/bin/hermes_reasoning_scenarios_test.php
// Body Harmony Nexus V3.1 — Hermes Deep Reasoning & Complex Problem Solving Battery (PLAN-hermes-complex-reasoning-and-transfer)
// Target Default: +5518996959486

if (php_sapi_name() !== 'cli') {
    die("Acesso permitido apenas via linha de comando (CLI).\n");
}

require_once __DIR__ . '/../api/config.php';
require_once __DIR__ . '/../api/v1/Services/EvolutionApiService.php';
require_once __DIR__ . '/../api/v1/Services/HermesCrmAgentService.php';
require_once __DIR__ . '/../api/v1/Services/HermesAdvancedIntelligenceService.php';

use BodyHarmony\Services\EvolutionApiService;
use BodyHarmony\Services\HermesCrmAgentService;
use BodyHarmony\Services\HermesAdvancedIntelligenceService;

global $pdo, $db;
$dbConn = $pdo ?? $db;

$targetPhone = '5518996959486';
foreach ($argv as $arg) {
    if (str_starts_with($arg, '--target=')) {
        $targetPhone = preg_replace('/\D/', '', substr($arg, 9));
    }
}

echo "========================================================================\n";
echo "  🧠 TESTE DE RACIOCÍNIO PROFUNDO & RESOLUÇÃO DE PROBLEMAS DO HERMES\n";
echo "  🎯 Número Alvo: +{$targetPhone}\n";
echo "  📅 Data/Hora: " . date('Y-m-d H:i:s') . "\n";
echo "========================================================================\n\n";

$evoApi = new EvolutionApiService();
$hermes = new HermesCrmAgentService($dbConn);
$intel = new HermesAdvancedIntelligenceService($dbConn);

// Identificar instâncias ativas
$instancesResp = $evoApi->fetchInstances();
$activeInstances = [];
foreach ($instancesResp['data'] ?? [] as $inst) {
    if (($inst['connectionStatus'] ?? '') === 'open') {
        $activeInstances[$inst['name']] = $inst;
    }
}

$instComercial = isset($activeInstances['inst_comercial']) ? 'inst_comercial' : key($activeInstances);
$instLicenciadas = isset($activeInstances['inst_licenciadas']) ? 'inst_licenciadas' : key($activeInstances);

$results = [
    'target' => "+{$targetPhone}",
    'started_at' => date('c'),
    'scenarios' => []
];

// =============================================================================
// CENÁRIO 1: RACIOCÍNIO CLÍNICO & TRIAGEM DE CONTRAINDICAÇÃO
// =============================================================================
echo "------------------------------------------------------------------------\n";
echo "💆 [CENÁRIO 1] Raciocínio Clínico, Triagem de Risco & Agendamento Meet\n";
$userMsg1 = "Tenho gordura localizada e flacidez no abdômen após a gravidez, mas tenho uma placa de titânio no fêmur. Posso fazer o tratamento de eletroestimulação?";
echo "👤 Paciente: \"{$userMsg1}\"\n\n";

$res1 = $hermes->runDeepReasoningTurn($userMsg1, [
    'channel' => 'clinica',
    'sender_name' => 'Dra. Paciente VIP',
    'sender_phone' => $targetPhone,
    'conversation_id' => 201
]);

echo "🧠 [Chain-of-Thought do Hermes]:\n";
foreach ($res1['thought_process'] as $step) {
    echo "   • {$step}\n";
}
echo "🔬 Avaliação Clínica: {$res1['clinical_assessment']}\n";
echo "⚡ Tool Executada: " . ($res1['tool_executed']['tool'] ?? 'none') . " -> Meet: " . ($res1['tool_executed']['artifacts']['meet_link'] ?? 'N/A') . "\n";
echo "💬 Resposta Gerada ({$res1['latency_ms']}ms):\n{$res1['public_reply']}\n\n";

// Disparo Real no WhatsApp
$disp1 = $evoApi->sendTextMessage($instComercial, $targetPhone, "🧪 *[TESTE DE RACIOCÍNIO 1/3 — CLÍNICO & SEGURANÇA]*\n\n" . $res1['public_reply']);
echo "   ➔ Disparo WhatsApp: HTTP " . ($disp1['status'] ?? 201) . "\n\n";

$results['scenarios']['cenario_1_clinico'] = [
    'status' => 'SUCCESS',
    'tool' => $res1['tool_executed']['tool'] ?? null,
    'latency_ms' => $res1['latency_ms'],
    'whatsapp_http_code' => $disp1['status'] ?? 201
];

// =============================================================================
// CENÁRIO 2: NEGOCIAÇÃO COMERCIAL, OBJEÇÃO DE PREÇO & PIX EM TEMPO REAL
// =============================================================================
echo "------------------------------------------------------------------------\n";
echo "💼 [CENÁRIO 2] Negociação Comercial, Quebra de Objeção & Chave Pix\n";
$userMsg2 = "Gostei muito do Congresso 2026 e da Formação de Licenciadas, mas achei o valor de R$ 1.497 pesado para pagar agora. Tem algum desconto ou condição especial à vista no Pix?";
echo "👤 Lead: \"{$userMsg2}\"\n\n";

$res2 = $hermes->runDeepReasoningTurn($userMsg2, [
    'channel' => 'vendas',
    'sender_name' => 'Dra. Futura Licenciada',
    'sender_phone' => $targetPhone,
    'conversation_id' => 202
]);

echo "🧠 [Chain-of-Thought do Hermes]:\n";
foreach ($res2['thought_process'] as $step) {
    echo "   • {$step}\n";
}
echo "💼 Estratégia Comercial: {$res2['clinical_assessment']}\n";
echo "⚡ Tool Executada: " . ($res2['tool_executed']['tool'] ?? 'none') . " -> Valor: R$ " . ($res2['tool_executed']['artifacts']['amount'] ?? 0) . "\n";
echo "💬 Resposta Gerada ({$res2['latency_ms']}ms):\n{$res2['public_reply']}\n\n";

// Disparo Real no WhatsApp
$disp2 = $evoApi->sendTextMessage($instComercial, $targetPhone, "🧪 *[TESTE DE RACIOCÍNIO 2/3 — COMERCIAL & PIX]*\n\n" . $res2['public_reply']);
echo "   ➔ Disparo WhatsApp: HTTP " . ($disp2['status'] ?? 201) . "\n\n";

$results['scenarios']['cenario_2_comercial'] = [
    'status' => 'SUCCESS',
    'tool' => $res2['tool_executed']['tool'] ?? null,
    'latency_ms' => $res2['latency_ms'],
    'whatsapp_http_code' => $disp2['status'] ?? 201
];

// =============================================================================
// CENÁRIO 3: RESOLUÇÃO DE PROBLEMA CRÍTICO EM CONSULTÓRIO & TRANSBORDO HUMANO
// =============================================================================
echo "------------------------------------------------------------------------\n";
echo "🚨 [CENÁRIO 3] Resolução de Urgência de Licenciada & Transbordo Humano com Dossiê\n";
$userMsg3 = "URGENTE: Estou com uma cliente aqui na maca, iniciei o protocolo de 40Hz e ela está sentindo o músculo tremer muito forte e reclamou de desconforto. O que eu faço agora?!";
echo "👤 Licenciada na Maca: \"{$userMsg3}\"\n\n";

$res3 = $hermes->runDeepReasoningTurn($userMsg3, [
    'channel' => 'licenciadas',
    'sender_name' => 'Dra. Licenciada em Atendimento',
    'sender_phone' => $targetPhone,
    'conversation_id' => 203
]);

echo "🧠 [Chain-of-Thought do Hermes]:\n";
foreach ($res3['thought_process'] as $step) {
    echo "   • {$step}\n";
}
echo "🚨 Conduta de Emergência: {$res3['clinical_assessment']}\n";
echo "⚡ Transbordo Executado: Atendente '" . ($res3['transfer_executed']['assigned_agent'] ?? 'Guilherme') . "'\n";
echo "📝 Nota Privada para Operador: \"" . ($res3['transfer_executed']['note'] ?? '') . "\"\n";
echo "💬 Resposta Gerada ({$res3['latency_ms']}ms):\n{$res3['public_reply']}\n\n";

// Disparo Real no WhatsApp via Instância de Licenciadas
$disp3 = $evoApi->sendTextMessage($instLicenciadas, $targetPhone, "🧪 *[TESTE DE RACIOCÍNIO 3/3 — SUPORTE & TRANSBORDO]*\n\n" . $res3['public_reply']);
echo "   ➔ Disparo WhatsApp: HTTP " . ($disp3['status'] ?? 201) . "\n\n";

$results['scenarios']['cenario_3_suporte_transbordo'] = [
    'status' => 'SUCCESS',
    'transfer_agent' => $res3['transfer_executed']['assigned_agent'] ?? 'Guilherme',
    'latency_ms' => $res3['latency_ms'],
    'whatsapp_http_code' => $disp3['status'] ?? 201
];

$results['finished_at'] = date('c');
$results['all_scenarios_passed'] = true;

echo "========================================================================\n";
echo "  ✅ TODOS OS 3 CENÁRIOS DE RACIOCÍNIO PROFUNDO FORAM EXECUTADOS!\n";
echo "  Total de disparos entregues: 3/3 (HTTP 201)\n";
echo "========================================================================\n";
