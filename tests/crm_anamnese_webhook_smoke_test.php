<?php
// tests/crm_anamnese_webhook_smoke_test.php
// Body Harmony Nexus V3.1 — CRM Anamnese Webhook Smoke Test (PLAN-171)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmAutomationService.php';

use BodyHarmony\Services\CrmAutomationService;

echo "===============================================================\n";
echo "   TESTE DE FUMAÇA: CRM ANAMNESE WEBHOOK & LABELS (PLAN-171)   \n";
echo "===============================================================\n\n";

class MockAnamneseStatement {
    private array $data;
    public function __construct(array $data = []) { $this->data = $data; }
    public function execute(?array $params = null): bool { return true; }
    public function fetchAll(int $mode = PDO::FETCH_ASSOC): array { return $this->data; }
    public function fetch(int $mode = PDO::FETCH_ASSOC): mixed { return $this->data[0] ?? false; }
}

class MockAnamnesePDO {
    public function prepare(string $query, array $options = []): MockAnamneseStatement {
        return new MockAnamneseStatement([
            [
                'id' => 101,
                'phone_e164' => '5518996959486',
                'name' => 'Camila Silveira',
                'notes' => 'Sensibilidade cutânea declarada'
            ]
        ]);
    }
    public function exec(string $statement): int|false { return 1; }
    public function lastInsertId(?string $name = null): string|false { return '101'; }
}

$mockDb = new MockAnamnesePDO();
$service = new CrmAutomationService($mockDb, 'https://crm.bodyharmony.com.br', 'wxvcKsycZEXjrqM7dxD72oNm', 'http://evolution-api:8080');

// Test Anamnese Webhook Submissions
$payloadNormal = [
    'nome' => 'Camila Silveira',
    'whatsapp' => '5518996959486',
    'cpf' => '321.654.987-00',
    'marcapasso' => 'Não',
    'gestante' => 'Não',
    'protese_metalica' => 'Não',
    'sensibilidade_cutanea' => 'Sim',
    'observacoes' => 'Deseja foco em definição muscular'
];

echo ">> [1/2] Testando submissão de anamnese padrão...\n";
$res1 = $service->handleAnamneseWebhook($payloadNormal);
if ($res1['success'] === true && $res1['contraindications_flag'] === false) {
    echo "   [✓] Ficha processada com sucesso. Patient ID: {$res1['patient_id']}\n";
    echo "   [✓] Status clínico: Apta para procedimento\n";
} else {
    echo "❌ Falha no processamento de anamnese padrão.\n";
    exit(1);
}

// Test Anamnese with Severe Contraindication
$payloadSevere = [
    'nome' => 'Patrícia Alencar',
    'whatsapp' => '5518996959486',
    'marcapasso' => 'Sim',
    'gestante' => 'Não',
    'observacoes' => 'Paciente com marca-passo cardíaco'
];

echo "\n>> [2/2] Testando submissão com contraindicação severa (Marcapasso)...\n";
$res2 = $service->handleAnamneseWebhook($payloadSevere);
if ($res2['success'] === true && $res2['contraindications_flag'] === true) {
    echo "   [✓] Flag de contraindicação ativada corretamente (ALERTA MÉDICO)\n";
} else {
    echo "❌ Falha na detecção de contraindicação severa.\n";
    exit(1);
}

echo "\n===============================================================\n";
echo "🎉 TESTE DE FUMAÇA DO WEBHOOK DE ANAMNESE 100% APROVADO!\n";
echo "===============================================================\n";
