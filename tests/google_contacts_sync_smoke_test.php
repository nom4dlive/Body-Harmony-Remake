<?php
// tests/google_contacts_sync_smoke_test.php
// Body Harmony Nexus V3.1 — Google Contacts Sync Smoke Test (PLAN-172)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/GoogleContactsSyncService.php';

use BodyHarmony\Services\GoogleContactsSyncService;

echo "===============================================================\n";
echo "   TESTE DE FUMAÇA: GOOGLE CONTACTS & AGENDA SYNC (PLAN-172)   \n";
echo "===============================================================\n\n";

class MockGoogleContactsStatement {
    private array $data;
    public function __construct(array $data = []) { $this->data = $data; }
    public function execute(?array $params = null): bool { return true; }
    public function fetchAll(int $mode = PDO::FETCH_ASSOC): array { return $this->data; }
    public function fetch(int $mode = PDO::FETCH_ASSOC): mixed { return $this->data[0] ?? false; }
}

class MockGoogleContactsPDO {
    public function prepare(string $query, array $options = []): MockGoogleContactsStatement {
        if (str_contains($query, 'FROM licenciadas')) {
            return new MockGoogleContactsStatement([
                [
                    'id' => 1,
                    'name' => 'Renata Licenciada Teste',
                    'cpf' => '12345678900',
                    'whatsapp' => '5518996959486',
                    'email' => 'renata@licenciada.com.br',
                    'location' => 'São Paulo',
                    'state' => 'SP',
                    'photo_url' => null,
                    'is_active' => 1,
                    'created_at' => '2026-01-01 00:00:00'
                ]
            ]);
        }
        if (str_contains($query, 'FROM crm_patient_profiles')) {
            return new MockGoogleContactsStatement([
                [
                    'phone' => '5518996959486',
                    'name' => 'Camila Paciente',
                    'cpf' => '98765432100'
                ]
            ]);
        }
        if (str_contains($query, 'FROM alunas')) {
            return new MockGoogleContactsStatement([
                [
                    'id' => 10,
                    'name' => 'Beatriz Aluna Curso',
                    'cpf' => '45678912300',
                    'whatsapp' => '5518996959486',
                    'email' => 'beatriz@curso.com'
                ]
            ]);
        }
        return new MockGoogleContactsStatement([
            [
                'total' => 3,
                'lic' => 1,
                'pac' => 1,
                'alu' => 1,
                'last_sync' => '2026-08-30 15:00:00'
            ]
        ]);
    }
    public function exec(string $statement): int|false { return 1; }
}

$mockDb = new MockGoogleContactsPDO();
$service = new GoogleContactsSyncService($mockDb);

// 1. Test Naming Formats
echo ">> [1/3] Testando regras de padronização oficial de nomes...\n";
$licName = $service->formatContactName('Mariana Silva', 'LICENCIADA', 'Curitiba', 'PR');
$pacName = $service->formatContactName('Carla Mendes', 'PACIENTE', 'Assis', 'SP');
$aluName = $service->formatContactName('Fernanda Costa', 'ALUNA');

if ($licName === '👑 [Licenciada] Mariana Silva - Curitiba/PR' &&
    $pacName === '[Paciente] Carla Mendes - Assis/SP' &&
    $aluName === '[Aluna] Fernanda Costa - Cursos') {
    echo "   [✓] Formato Licenciada: {$licName}\n";
    echo "   [✓] Formato Paciente: {$pacName}\n";
    echo "   [✓] Formato Aluna: {$aluName}\n";
} else {
    echo "❌ Falha na padronização de nomes.\n";
    exit(1);
}

// 2. Test Batch Synchronization
echo "\n>> [2/3] Testando sincronização em lote (Licenciadas, Pacientes e Alunas)...\n";
$batchRes = $service->syncAllContacts();
if ($batchRes['success'] === true && $batchRes['synced_count'] >= 3) {
    echo "   [✓] Contatos sincronizados: {$batchRes['synced_count']}\n";
    foreach ($batchRes['sample_formats'] as $sample) {
        echo "   [✓] Exemplo salvo: {$sample}\n";
    }
} else {
    echo "❌ Falha na sincronização em lote.\n";
    exit(1);
}

// 3. Test Stats Calculation
echo "\n>> [3/3] Testando recuperação de estatísticas da agenda...\n";
$stats = $service->getStats();
if ($stats['total_synced'] >= 3 && $stats['licenciadas_count'] === 1) {
    echo "   [✓] Total sincronizado: {$stats['total_synced']}\n";
    echo "   [✓] Licenciadas: {$stats['licenciadas_count']}, Pacientes: {$stats['pacientes_count']}, Alunas: {$stats['alunas_count']}\n";
} else {
    echo "❌ Falha no cálculo de estatísticas.\n";
    exit(1);
}

echo "\n===============================================================\n";
echo "🎉 TESTE DE FUMAÇA DO GOOGLE CONTACTS 100% APROVADO!\n";
echo "===============================================================\n";
