<?php
// tests/crm_cockpit_smoke_test.php
// Body Harmony Nexus V3.1 — CRM Cockpit Smoke Test (PLAN-166)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmCockpitService.php';

use BodyHarmony\Services\CrmCockpitService;

echo "===============================================================\n";
echo "    TESTE DE FUMAÇA: CRM SUPER-COCKPIT ENGINE (PLAN-166)       \n";
echo "===============================================================\n\n";

$service = new CrmCockpitService(null);

// 1. Test getContext
echo ">> [1/3] Testando consulta de contexto 360º de contato...\n";
$context = $service->getContext('18997242050', 3, 'Dra. Josi');

if ($context['status'] === 'success' && isset($context['data']['contact']['phone_formatted'])) {
    echo "✅ Contexto 360º aprovado: Perfil [{$context['data']['profile_type']}], Telefone: {$context['data']['contact']['phone_formatted']}\n";
} else {
    echo "❌ Falha no teste de contexto: " . json_encode($context) . "\n";
    exit(1);
}

// 2. Test createAppointment
echo "\n>> [2/3] Testando agendamento de sessão com geração de Google Calendar e WhatsApp...\n";
$appointment = $service->createAppointment([
    'contact_phone' => '18997242050',
    'patient_name' => 'Maria Silva',
    'procedure_name' => 'Eletroestimulação Muscular - Glúteos',
    'scheduled_at' => '2026-09-01 14:30:00',
    'duration_minutes' => 45,
    'notes' => 'Paciente primeira sessão'
]);

if ($appointment['status'] === 'success' && !empty($appointment['data']['google_calendar_url']) && !empty($appointment['data']['whatsapp_message'])) {
    echo "✅ Agendamento aprovado:\n";
    echo "   - Link Calendar: " . substr($appointment['data']['google_calendar_url'], 0, 60) . "...\n";
    echo "   - Mensagem WhatsApp: " . substr($appointment['data']['whatsapp_message'], 0, 60) . "...\n";
} else {
    echo "❌ Falha no agendamento: " . json_encode($appointment) . "\n";
    exit(1);
}

// 3. Test generateMeetRoom
echo "\n>> [3/3] Testando gerador de sala Google Meet...\n";
$meet = $service->generateMeetRoom('Avaliação Estética Online');

if ($meet['status'] === 'success' && !empty($meet['data']['meet_url'])) {
    echo "✅ Gerador Google Meet aprovado: {$meet['data']['meet_url']}\n";
} else {
    echo "❌ Falha no gerador Meet: " . json_encode($meet) . "\n";
    exit(1);
}

echo "\n===============================================================\n";
echo "🎉 TESTE DE FUMAÇA DO PLAN-166 CONCLUÍDO COM 100% DE SUCESSO!\n";
echo "===============================================================\n";
