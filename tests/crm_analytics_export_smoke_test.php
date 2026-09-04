<?php
// tests/crm_analytics_export_smoke_test.php
// Body Harmony Nexus V3.1 — CRM Analytics & Looker Studio Export Smoke Test (PLAN-173)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmAnalyticsService.php';

use BodyHarmony\Services\CrmAnalyticsService;

echo "===============================================================\n";
echo "   TESTE DE FUMAÇA: CRM EXECUTIVE ANALYTICS EXPORT (PLAN-173)  \n";
echo "===============================================================\n\n";

class MockAnalyticsStatement {
    private array $data;
    public function __construct(array $data = []) { $this->data = $data; }
    public function execute(?array $params = null): bool { return true; }
    public function fetchAll(int $mode = PDO::FETCH_ASSOC): array { return $this->data; }
    public function fetch(int $mode = PDO::FETCH_ASSOC): mixed { return $this->data[0] ?? false; }
}

class MockAnalyticsPDO {
    public function prepare(string $query, array $options = []): MockAnalyticsStatement {
        return new MockAnalyticsStatement([
            [
                'total' => 60,
                'confirmed' => 56,
                'noshow' => 3
            ]
        ]);
    }
}

$mockDb = new MockAnalyticsPDO();
$service = new CrmAnalyticsService($mockDb);

// 1. Test Executive Metrics JSON Schema
echo ">> [1/2] Testando geração de métricas consolidadas (JSON)...\n";
$metrics = $service->getExecutiveMetrics('30d');

if ($metrics['success'] === true &&
    isset($metrics['clinic_kpis']['total_appointments']) &&
    isset($metrics['congress_sales_kpis']['gross_revenue']) &&
    count($metrics['attendants_metrics']) === 2) {
    echo "   [✓] Receita Bruta Congresso: R$ " . number_format($metrics['congress_sales_kpis']['gross_revenue'], 2, ',', '.') . "\n";
    echo "   [✓] Taxa de Confirmação Clínica: {$metrics['clinic_kpis']['confirmation_rate_percent']}%\n";
    echo "   [✓] Atendentes monitoradas: {$metrics['attendants_metrics'][0]['name']} e {$metrics['attendants_metrics'][1]['name']}\n";
} else {
    echo "❌ Falha na extração de métricas consolidadas.\n";
    exit(1);
}

// 2. Test CSV Export Format
echo "\n>> [2/2] Testando exportação de telemetria em CSV...\n";
$csv = $service->exportCsv();

if (str_contains($csv, 'Faturamento Bruto Congresso') && str_contains($csv, 'Taxa de Confirmacao Clinica')) {
    echo "   [✓] Feed CSV para Looker Studio formatado com sucesso!\n";
} else {
    echo "❌ Falha na formatação CSV.\n";
    exit(1);
}

echo "\n===============================================================\n";
echo "🎉 TESTE DE FUMAÇA DO ANALYTICS & LOOKER STUDIO 100% APROVADO!\n";
echo "===============================================================\n";
