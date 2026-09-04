<?php
// tests/google_workspace_service_smoke_test.php
// Body Harmony Nexus V3.1 — Google Workspace Service Smoke Test (PLAN-177)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/GoogleWorkspaceService.php';

use BodyHarmony\Services\GoogleWorkspaceService;

echo "====================================================================\n";
echo "   TESTE DE FUMAÇA: GOOGLE WORKSPACE SUITE CENTRAL (PLAN-177)      \n";
echo "====================================================================\n\n";

$service = new GoogleWorkspaceService(null);

// 1. Test People/Contacts formatting
echo ">> [1/3] Testando formatação de nomes institucionais (People API)...\n";
$nameLic = $service->formatContactName('Dra. Ana Paula', 'LICENCIADA', 'Curitiba', 'PR');
$namePac = $service->formatContactName('Mariana Silva', 'PACIENTE', 'Assis', 'SP');
$nameAlu = $service->formatContactName('Beatriz Lima', 'ALUNA');

if (str_contains($nameLic, '👑 [Licenciada]') && str_contains($namePac, '[Paciente]') && str_contains($nameAlu, '[Aluna]')) {
    echo "   [✓] Nomenclaturas padronizadas aprovadas:\n";
    echo "       - {$nameLic}\n";
    echo "       - {$namePac}\n";
    echo "       - {$nameAlu}\n";
} else {
    echo "   [✗] Falha na formatação de nomes.\n";
    exit(1);
}

// 2. Test Calendar Appointment Creation
echo "\n>> [2/3] Testando criação de agendamento no Google Calendar com Google Meet...\n";
$evt = $service->createAppointment('primary', [
    'patient_name' => 'Mariana Silva',
    'patient_phone' => '18996959486',
    'start_time' => '2026-09-01T09:00:00-03:00',
    'end_time' => '2026-09-01T10:00:00-03:00',
    'create_meet' => true
]);

if ($evt['success'] === true && !empty($evt['event_id']) && !empty($evt['html_link'])) {
    echo "   [✓] Agendamento criado com sucesso!\n";
    echo "       - Event ID: {$evt['event_id']}\n";
    echo "       - Meet Link: " . ($evt['meet_link'] ?: 'N/A') . "\n";
    echo "       - Link do Calendário: {$evt['html_link']}\n";
} else {
    echo "   [✗] Falha no agendamento: " . json_encode($evt) . "\n";
    exit(1);
}

// 3. Test Drive Folder Creation
echo "\n>> [3/3] Testando criação de pasta de prontuário no Google Drive...\n";
$folder = $service->ensurePatientFolder('Mariana Silva', '36208232864', 'PRONTUARIO');

if ($folder['success'] === true && !empty($folder['folder_id']) && !empty($folder['folder_url'])) {
    echo "   [✓] Pasta do Drive provisionada com sucesso!\n";
    echo "       - Folder ID: {$folder['folder_id']}\n";
    echo "       - URL: {$folder['folder_url']}\n";
    echo "       - Caminho: {$folder['folder_path']}\n";
} else {
    echo "   [✗] Falha na criação da pasta: " . json_encode($folder) . "\n";
    exit(1);
}

echo "\n====================================================================\n";
echo "🎉 TESTE DE FUMAÇA DO GOOGLE WORKSPACE 100% APROVADO!\n";
echo "====================================================================\n";
