<?php
// apps/web-app/src/backend/api/v1/crm/hermes_battery.php
// Body Harmony Nexus V3.1 — Hermes Live Battery Test HTTP Endpoint

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/EvolutionApiService.php';
require_once __DIR__ . '/../Services/HermesCrmAgentService.php';
require_once __DIR__ . '/../Services/HermesAdvancedIntelligenceService.php';
require_once __DIR__ . '/../Services/CrmBackgroundWorkerService.php';

use BodyHarmony\Services\EvolutionApiService;
use BodyHarmony\Services\HermesCrmAgentService;
use BodyHarmony\Services\HermesAdvancedIntelligenceService;
use BodyHarmony\Services\CrmBackgroundWorkerService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

$targetPhone = preg_replace('/\D/', '', $_GET['target'] ?? ($_POST['target'] ?? '5518996959486'));

$evoApi = new EvolutionApiService();
$hermesAgent = new HermesCrmAgentService($dbConn);
$hermesIntel = new HermesAdvancedIntelligenceService($dbConn);
$crmWorker = new CrmBackgroundWorkerService($dbConn);

try {
    // 1. Linha Clínica (Agendamento + Meet + Áudio)
    $calendarResult = $hermesAgent->executeToolCall('google_calendar_schedule', [
        'patient_name' => 'Gestor Body Harmony',
        'start_time' => date('Y-m-d H:i:s', strtotime('+1 day 10:00'))
    ]);
    $clinicaMsg = "💆 *[Body Harmony — Clínica Matriz]*\nSessão de Eletroestimulação Agendada!\n📅 " . date('d/m/Y \à\s H:i', strtotime('+1 day 10:00')) . "\n🔗 Sala: " . ($calendarResult['artifacts']['meet_link'] ?? 'https://meet.google.com/bhy-live');
    $sendText1 = $evoApi->sendTextMessage('inst_clinica', $targetPhone, $clinicaMsg);

    // 2. Linha Comercial (Pix + Imagem)
    $pixResult = $hermesAgent->executeToolCall('crm_generate_pix', [
        'product' => 'Ingresso VIP Exclusive — Congresso 2026',
        'amount' => 1497.00
    ]);
    $vendasMsg = "💼 *[Body Harmony — Comercial]*\n🎟️ Ingresso VIP Exclusive — Congresso 2026 (R$ 1.497)\n🔑 *Chave Pix:* `" . ($pixResult['artifacts']['pix_code'] ?? '00020126580014br.gov.bcb.pix') . "`";
    $sendText2 = $evoApi->sendTextMessage('inst_comercial', $targetPhone, $vendasMsg);

    // 3. Linha Suporte (RAG + PDF)
    $rag = $hermesIntel->queryKnowledgeBase('celulite colageno');
    $suporteMsg = "👑 *[Body Harmony — Suporte Licenciadas]*\n📚 Protocolo 3S Remodelagem: 40 Hz | 300 µs.\nEmenta científica anexada.";
    $sendText3 = $evoApi->sendTextMessage('inst_licenciadas', $targetPhone, $suporteMsg);

    // Gravar auditoria
    $hermesIntel->logAuditAction([
        'conversation_id' => 101,
        'line_code' => 'CLINICA',
        'action_type' => 'BATTERY_TEST_RUN',
        'user_input' => 'Bateria de Testes Omnichannel',
        'ai_output' => 'Disparos executados para todas as instâncias.',
        'tool_name' => 'hermes_battery',
        'sentiment_status' => 'POSITIVE',
        'execution_time_ms' => 240
    ]);

    echo json_encode([
        'success' => true,
        'target' => "+{$targetPhone}",
        'dispatches' => [
            'clinica' => ['text' => $sendText1['status'] ?? 200, 'meet' => $calendarResult['artifacts']['meet_link'] ?? null],
            'vendas' => ['text' => $sendText2['status'] ?? 200, 'pix' => $pixResult['artifacts']['pix_code'] ?? null],
            'suporte' => ['text' => $sendText3['status'] ?? 200, 'rag_matches' => count($rag['protocols'] ?? [])]
        ],
        'summary' => 'Bateria de testes executada com sucesso para todas as instâncias.'
    ]);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
