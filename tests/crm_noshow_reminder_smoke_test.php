<?php
// tests/crm_noshow_reminder_smoke_test.php
// Body Harmony Nexus V3.1 — CRM Anti No-Show Reminder Smoke Test (PLAN-171)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmAppointmentReminderService.php';

use BodyHarmony\Services\CrmAppointmentReminderService;

echo "===============================================================\n";
echo "   TESTE DE FUMAÇA: CRM ANTI NO-SHOW REMINDERS (PLAN-171)      \n";
echo "===============================================================\n\n";

class MockNoShowStatement {
    private array $data;
    public function __construct(array $data = []) { $this->data = $data; }
    public function execute(?array $params = null): bool { return true; }
    public function fetchAll(int $mode = PDO::FETCH_ASSOC): array { return $this->data; }
    public function fetch(int $mode = PDO::FETCH_ASSOC): mixed { return $this->data[0] ?? false; }
}

class MockNoShowPDO {
    public function prepare(string $query, array $options = []): MockNoShowStatement {
        if (str_contains($query, 'COUNT(*) as total')) {
            return new MockNoShowStatement([
                [
                    'total' => 5,
                    'confirmed' => 4,
                    'reminded' => 4
                ]
            ]);
        }
        return new MockNoShowStatement([
            [
                'id' => 12,
                'contact_phone' => '5518996959486',
                'patient_name' => 'Renata VIP Teste',
                'procedure_name' => 'Eletroestimulação Muscular',
                'scheduled_at' => date('Y-m-d H:i:s', strtotime('+24 hours')),
                'duration_minutes' => 60,
                'status' => 'agendado',
                'conversation_id' => 1,
                'reminder_sent_24h' => 0,
                'reminder_sent_2h' => 0
            ]
        ]);
    }
    public function exec(string $statement): int|false { return 1; }
    public function lastInsertId(?string $name = null): string|false { return '12'; }
}

$mockDb = new MockNoShowPDO();
$service = new CrmAppointmentReminderService($mockDb, 'https://crm.bodyharmony.com.br', 'wxvcKsycZEXjrqM7dxD72oNm', 'http://evolution-api:8080');

// 1. Test Reminder Processing
echo ">> [1/3] Testando disparo de lembretes 24h e 2h...\n";
$remindRes = $service->processReminders();
if ($remindRes['success'] === true && $remindRes['total_processed'] >= 1) {
    echo "   [✓] Lembretes processados: {$remindRes['total_processed']}\n";
    echo "   [✓] Lembretes 24h: {$remindRes['reminders_24h_sent']}, 2h: {$remindRes['reminders_2h_sent']}\n";
} else {
    echo "❌ Falha no processamento de lembretes.\n";
    exit(1);
}

// 2. Test Inbound Reply (Confirmação com '1')
echo "\n>> [2/3] Testando resposta interativa da paciente ('1 para Confirmar')...\n";
$replyRes = $service->processInboundReply('5518996959486', '1');
if ($replyRes['success'] === true && $replyRes['action'] === 'confirmed') {
    echo "   [✓] Resposta '1' processada com sucesso: Status atualizado para CONFIRMADO\n";
} else {
    echo "❌ Falha no processamento de confirmação interativa.\n";
    exit(1);
}

// 3. Test Inbound Reply (Remarcação com '2')
echo "\n>> [3/3] Testando solicitação de remarcação ('2 para Remarcar')...\n";
$remarcarRes = $service->processInboundReply('5518996959486', '2');
if ($remarcarRes['success'] === true && $remarcarRes['action'] === 'reschedule_requested') {
    echo "   [✓] Resposta '2' processada com sucesso: Status atualizado para REMARCAR\n";
} else {
    echo "❌ Falha no processamento de remarcação.\n";
    exit(1);
}

echo "\n===============================================================\n";
echo "🎉 TESTE DE FUMAÇA DO MOTOR ANTI NO-SHOW 100% APROVADO!\n";
echo "===============================================================\n";
