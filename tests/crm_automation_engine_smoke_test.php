<?php
// tests/crm_automation_engine_smoke_test.php
// Body Harmony Nexus V3.1 — CRM Full Automation Engine Smoke Test (PLAN-170)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmAutomationService.php';

use BodyHarmony\Services\CrmAutomationService;

echo "===============================================================\n";
echo "   TESTE DE FUMAÇA: CRM AUTOMATION ENGINE (PLAN-170)           \n";
echo "===============================================================\n\n";

class MockPDOStatement {
    private array $data;
    public function __construct(array $data = []) { $this->data = $data; }
    public function execute(?array $params = null): bool { return true; }
    public function fetchAll(int $mode = PDO::FETCH_ASSOC): array { return $this->data; }
    public function fetch(int $mode = PDO::FETCH_ASSOC): mixed { return $this->data[0] ?? false; }
}

class MockPDO {
    public function prepare(string $query, array $options = []): MockPDOStatement {
        if (str_contains($query, 'crm_appointments')) {
            return new MockPDOStatement([
                [
                    'id' => 1,
                    'contact_phone' => '5518996959486',
                    'patient_name' => 'Dra. Josi Silva / Teste',
                    'procedure_name' => 'Eletroestimulação Muscular',
                    'scheduled_at' => date('Y-m-d H:i:s', strtotime('+1 hour')),
                    'duration_minutes' => 60,
                    'status' => 'CONFIRMED',
                    'conversation_id' => 1,
                    'reminder_sent_24h' => 0,
                    'reminder_sent_2h' => 0
                ]
            ]);
        }
        if (str_contains($query, 'crm_kanban_cards')) {
            return new MockPDOStatement([
                [
                    'id' => 10,
                    'pipeline_type' => 'CLINICA',
                    'stage' => 'novo_contato',
                    'conversation_id' => 1,
                    'contact_phone' => '5518996959486',
                    'contact_name' => 'Paciente VIP Teste',
                    'value_amount' => 350.00,
                    'priority' => 'ALTA',
                    'assigned_agent' => 'Cibele / Matriz'
                ]
            ]);
        }
        return new MockPDOStatement([]);
    }
    public function exec(string $statement): int|false { return 1; }
    public function lastInsertId(?string $name = null): string|false { return '99'; }
}

$mockDb = new MockPDO();
$service = new CrmAutomationService($mockDb, 'https://crm.bodyharmony.com.br', 'wxvcKsycZEXjrqM7dxD72oNm', 'http://evolution-api:8080');

// 1. Test Anti No-Show Engine
echo ">> [1/4] Testando Motor Anti No-Show de Agendamentos...\n";
$noShowResult = $service->processAntiNoShowReminders();
if ($noShowResult['success'] === true && $noShowResult['processed_count'] >= 1) {
    echo "   [✓] Lembretes processados: {$noShowResult['processed_count']} (24h: {$noShowResult['reminders_24h_sent']}, 2h: {$noShowResult['reminders_2h_sent']})\n";
} else {
    echo "❌ Falha no motor Anti No-Show.\n";
    exit(1);
}

// 2. Test Anamnese Webhook & Private Note
echo "\n>> [2/4] Testando Webhook de Ficha de Anamnese (Google Forms -> Chatwoot Note)...\n";
$anamnesePayload = [
    'nome' => 'Renata Oliveira',
    'whatsapp' => '5518996959486',
    'cpf' => '123.456.789-00',
    'marcapasso' => 'Não',
    'gestante' => 'Não',
    'protese_metalica' => 'Não',
    'sensibilidade_cutanea' => 'Sim',
    'observacoes' => 'Deseja foco em glúteos e definição abdominal'
];
$anamneseResult = $service->handleAnamneseWebhook($anamnesePayload);
if ($anamneseResult['success'] === true && isset($anamneseResult['patient_id'])) {
    echo "   [✓] Anamnese processada com sucesso. Patient ID: {$anamneseResult['patient_id']}\n";
    echo "   [✓] Contraindicações severas: " . ($anamneseResult['contraindications_flag'] ? 'SIM' : 'NÃO') . "\n";
} else {
    echo "❌ Falha no webhook de anamnese.\n";
    exit(1);
}

// 3. Test Media Sync (Fotos de Antes/Depois)
echo "\n>> [3/4] Testando Sincronizador de Fotos e Prontuário de Antes/Depois...\n";
$mediaPayload = [
    'phone' => '5518996959486',
    'image_url' => 'https://bodyharmony.com.br/uploads/crm/prontuarios/evolucao_01.jpg',
    'photo_type' => 'EVOLUCAO',
    'notes' => 'Evolução pós 4ª sessão'
];
$mediaResult = $service->handleMediaSync($mediaPayload);
if ($mediaResult['success'] === true && $mediaResult['saved_to_dossier'] === true) {
    echo "   [✓] Mídia sincronizada no prontuário. Photo ID: {$mediaResult['photo_id']}\n";
} else {
    echo "❌ Falha na sincronização de mídia.\n";
    exit(1);
}

// 4. Test Kanban Pipelines & Google Contacts Sync
echo "\n>> [4/4] Testando Funil Kanban (Clínico/Comercial) & Google Contacts Sync...\n";
$kanbanCards = $service->getKanbanCards('CLINICA');
$moveResult = $service->moveKanbanCard(10, 'avaliacao_agendada');
$contactSync = $service->syncGoogleContact('5518996959486', 'Renata Oliveira', 'PACIENTE');

if (count($kanbanCards['cards']) >= 1 && $moveResult['success'] === true && str_contains($contactSync['formatted_name'], '[Paciente]')) {
    echo "   [✓] Cartões carregados no funil: " . count($kanbanCards['cards']) . "\n";
    echo "   [✓] Cartão movido para etapa: {$moveResult['new_stage']}\n";
    echo "   [✓] Google Contacts formatado: {$contactSync['formatted_name']}\n";
} else {
    echo "❌ Falha no Kanban ou sincronia de contatos.\n";
    exit(1);
}

echo "\n===============================================================\n";
echo "🎉 TESTE DE FUMAÇA DA AUTOMAÇÃO DO CRM CONCLUÍDO COM 100% DE SUCESSO!\n";
echo "===============================================================\n";
