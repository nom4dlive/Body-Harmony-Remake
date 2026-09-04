<?php
// apps/web-app/src/backend/bin/hermes_report_limitations.php
// Body Harmony Nexus V3.1 — Hermes Interactions & Limitations Report Generator

require_once __DIR__ . '/../api/config.php';
require_once __DIR__ . '/../api/v1/Services/HermesAdvancedIntelligenceService.php';

use BodyHarmony\Services\HermesAdvancedIntelligenceService;

global $pdo, $db;
$dbConn = $pdo ?? $db;

$logFile = __DIR__ . '/../tmp/hermes_gestor_interactions.json';
$interactions = file_exists($logFile) ? (json_decode(file_get_contents($logFile), true) ?: []) : [];

echo "========================================================================\n";
echo "  📋 RELATÓRIO DE INTERAÇÕES & LIMITAÇÕES DO HERMES AGENT\n";
echo "  🎯 Número Monitorado: +5518996959486\n";
echo "  📅 Data do Relatório: " . date('Y-m-d H:i:s') . "\n";
echo "========================================================================\n\n";

echo "📊 Total de Interações Registradas: " . count($interactions) . "\n\n";

if (empty($interactions)) {
    echo "ℹ️ Nenhuma mensagem recebida ainda no arquivo de log temporário.\n";
    echo "   Envie mensagens pelo WhatsApp +5518996959486 para qualquer um dos 3 números conectados.\n\n";
} else {
    foreach ($interactions as $idx => $item) {
        $num = $idx + 1;
        echo "[TURNO #{$num}] {$item['timestamp']} (Instância: {$item['instance']})\n";
        echo "👤 Gestor: \"{$item['user_message']}\"\n";
        echo "🤖 Hermes: \"{$item['hermes_reply']}\"\n";
        if (!empty($item['tool_executed'])) {
            echo "⚡ Ferramenta: " . ($item['tool_executed']['tool'] ?? 'N/A') . "\n";
        }
        if (!empty($item['transfer_executed'])) {
            echo "🚨 Transbordo: " . ($item['transfer_executed']['assigned_agent'] ?? 'N/A') . "\n";
        }
        echo "⏱️ Latência: {$item['latency_ms']}ms\n";
        echo "------------------------------------------------------------------------\n";
    }
}

echo "\n🔍 RESUMO DE LIMITAÇÕES ATUAIS MAPADAS PARA O ANTIGRAVITY:\n";
echo "1. Memória de Conversa Multi-Turno Longa: Necessidade de carregar todo o histórico do chatwoot na inferência.\n";
echo "2. Processamento de Áudio de Entrada (STT): Quando o gestor enviar áudio, acionar Whisper para transcrever antes de raciocinar.\n";
echo "3. Respostas Complexas com Links Dinâmicos: Gerar links encurtados ou botões interativos do WhatsApp.\n";
echo "4. Transbordo com Notificação Push: Enviar alerta via Telegram ou WhatsApp interno para o gestor quando houver transbordo.\n\n";
echo "========================================================================\n";
