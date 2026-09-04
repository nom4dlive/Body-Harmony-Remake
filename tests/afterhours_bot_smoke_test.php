<?php
// tests/afterhours_bot_smoke_test.php
// Body Harmony Nexus V3.1 — After-Hours AI Bot Smoke Test (PLAN-173)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/AfterHoursAiService.php';

use BodyHarmony\Services\AfterHoursAiService;

echo "===============================================================\n";
echo "   TESTE DE FUMAÇA: AFTER-HOURS AI BOT & SCHEDULE (PLAN-173)   \n";
echo "===============================================================\n\n";

class MockAfterHoursStatement {
    private array $data;
    public function __construct(array $data = []) { $this->data = $data; }
    public function execute(?array $params = null): bool { return true; }
    public function fetchAll(int $mode = PDO::FETCH_ASSOC): array { return $this->data; }
    public function fetch(int $mode = PDO::FETCH_ASSOC): mixed { return $this->data[0] ?? false; }
}

class MockAfterHoursPDO {
    public function prepare(string $query, array $options = []): MockAfterHoursStatement {
        return new MockAfterHoursStatement([
            [
                'id' => 1,
                'is_enabled' => 1,
                'weekday_start' => '18:00',
                'weekday_end' => '08:00',
                'weekend_enabled' => 1,
                'custom_greeting' => 'Olá! Sou a Dra. Harmony AI.'
            ]
        ]);
    }
    public function exec(string $statement): int|false { return 1; }
}

$mockDb = new MockAfterHoursPDO();
$service = new AfterHoursAiService($mockDb, 'https://crm.bodyharmony.com.br', 'wxvcKsycZEXjrqM7dxD72oNm');

// 1. Test Schedule Rules (Night time vs Day time)
echo ">> [1/3] Testando detecção de horário fora do expediente...\n";
$nightTime = new DateTime('2026-08-30 21:30:00', new DateTimeZone('America/Sao_Paulo'));
$dayTime = new DateTime('2026-08-31 14:00:00', new DateTimeZone('America/Sao_Paulo')); // Monday 14:00

$isNightAfterHours = $service->isAfterHours($nightTime);
$isDayAfterHours = $service->isAfterHours($dayTime);

if ($isNightAfterHours === true && $isDayAfterHours === false) {
    echo "   [✓] Noite (21:30) identificada como PLANTÃO NOTURNO: SIM\n";
    echo "   [✓] Dia comercial (Seg 14:00) identificado como EXPEDIENTE HUMANO: SIM\n";
} else {
    echo "❌ Falha na regra de horário de atendimento.\n";
    exit(1);
}

// 2. Test Welcome Message & Congress Intent
echo "\n>> [2/3] Testando acolhimento autônomo e intenção de Congresso...\n";
$congressoReply = $service->generateAfterHoursReply('Quero comprar 2 ingressos vip para o congresso', '5518996959486');

if ($congressoReply['success'] === true && $congressoReply['intent'] === 'congress_purchase_interest' && $congressoReply['priority_escalation'] === true) {
    echo "   [✓] Intenção identificada: {$congressoReply['intent']}\n";
    echo "   [✓] Escalation de prioridade para a Giovanna ativado com sucesso!\n";
} else {
    echo "❌ Falha no processamento de intenção de compra.\n";
    exit(1);
}

// 3. Test Clinic Appointment Intent
echo "\n>> [3/3] Testando intenção de agendamento na Clínica...\n";
$clinicReply = $service->generateAfterHoursReply('Gostaria de agendar uma avaliação de eletroestimulação na matriz', '5518996959486');

if ($clinicReply['success'] === true && $clinicReply['intent'] === 'clinic_appointment_interest' && $clinicReply['priority_escalation'] === true) {
    echo "   [✓] Intenção identificada: {$clinicReply['intent']}\n";
    echo "   [✓] Escalation de prioridade para a Cibele ativado com sucesso!\n";
} else {
    echo "❌ Falha no processamento de intenção clínica.\n";
    exit(1);
}

echo "\n===============================================================\n";
echo "🎉 TESTE DE FUMAÇA DO PLANTÃO NOTURNO IA 100% APROVADO!\n";
echo "===============================================================\n";
