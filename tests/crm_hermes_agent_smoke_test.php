<?php
// tests/crm_hermes_agent_smoke_test.php
// Body Harmony Nexus V3.1 — Hermes CRM Agent Smoke Test (PLAN-179)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/HermesCrmAgentService.php';

use BodyHarmony\Services\HermesCrmAgentService;

echo "====================================================================\n";
echo "   TESTE DE FUMAÇA: HERMES AGENT CRM COPILOT (PLAN-179)            \n";
echo "====================================================================\n\n";

$service = new HermesCrmAgentService(null);

// 1. Test Config
echo ">> [1/7] Testando leitura de configurações padrão do Hermes...\n";
$config = $service->getConfig();
if (
    isset($config['juridico_mode']) && $config['juridico_mode'] === 'MUTED' &&
    isset($config['licenciadas_mode']) && $config['licenciadas_mode'] === 'MUTED' &&
    isset($config['clinica_mode']) && $config['clinica_mode'] === 'COPILOT' &&
    isset($config['comercial_mode']) && $config['comercial_mode'] === 'HYBRID_24_7'
) {
    echo "   [✓] Configurações padrão validadas com sucesso:\n";
    echo "       - Jurídico: {$config['juridico_mode']}\n";
    echo "       - Licenciadas: {$config['licenciadas_mode']}\n";
    echo "       - Clínica: {$config['clinica_mode']}\n";
    echo "       - Comercial: {$config['comercial_mode']}\n";
} else {
    echo "   [✗] Falha na configuração: " . json_encode($config) . "\n";
    exit(1);
}

// 2. Test Juridico Line (MUTED)
echo "\n>> [2/7] Testando canal Jurídico (deve ser 100% Humano / MUTED)...\n";
$juridicoPayload = [
    'message_type' => 'incoming',
    'content' => 'Gostaria de ver uma alteração na cláusula 4 do meu contrato',
    'conversation' => ['id' => 101, 'inbox_id' => 1],
    'sender' => ['name' => 'Dra. Roberta']
];
$resJuridico = $service->handleMessageCreated($juridicoPayload);
if ($resJuridico['action'] === 'none' && $resJuridico['reason'] === 'channel_muted') {
    echo "   [✓] Canal Jurídico silenciado corretamente para preservação humana.\n";
} else {
    echo "   [✗] Falha no teste Jurídico: " . json_encode($resJuridico) . "\n";
    exit(1);
}

// 3. Test Suporte Licenciadas Line (MUTED / Dra. Josi Silva)
echo "\n>> [3/7] Testando canal Suporte Licenciadas (deve ser 100% Humano / MUTED por padrão)...\n";
$licenciadasPayload = [
    'message_type' => 'incoming',
    'content' => 'Dra. Josi, estou com uma dúvida sobre a evolução da paciente de glúteos',
    'conversation' => ['id' => 102, 'inbox_id' => 2],
    'sender' => ['name' => 'Dra. Camila Licenciada']
];
$resLicenciadas = $service->handleMessageCreated($licenciadasPayload);
if ($resLicenciadas['action'] === 'none' && $resLicenciadas['reason'] === 'channel_muted_for_dra_josi') {
    echo "   [✓] Canal Suporte Licenciadas blindado e preservado exclusivamente para a Dra. Josi.\n";
} else {
    echo "   [✗] Falha no teste Licenciadas: " . json_encode($resLicenciadas) . "\n";
    exit(1);
}

// 4. Test Clinica Line (COPILOT / Cibele)
echo "\n>> [4/7] Testando canal Clínica (Copiloto com Dosimetria Protocolo 3S)...\n";
$clinicaPayload = [
    'message_type' => 'incoming',
    'content' => 'Tenho interesse em tonificar glúteos e melhorar celulite',
    'conversation' => ['id' => 103, 'inbox_id' => 3],
    'sender' => ['name' => 'Mariana Souza']
];
$resClinica = $service->handleMessageCreated($clinicaPayload);
if (
    $resClinica['action'] === 'private_note' &&
    str_contains($resClinica['note'], 'Protocolo 3S') &&
    str_contains($resClinica['note'], 'Hz') &&
    str_contains($resClinica['note'], 'µs')
) {
    echo "   [✓] Nota Privada Dourada gerada com sucesso para a Cibele:\n";
    echo "       " . substr(str_replace("\n", " ", $resClinica['note']), 0, 90) . "...\n";
} else {
    echo "   [✗] Falha na geração da nota clínica: " . json_encode($resClinica) . "\n";
    exit(1);
}

// 5. Test Comercial Line (HYBRID_24_7 / Giovanna)
echo "\n>> [5/7] Testando canal Comercial (Links do Congresso e Ingressos)...\n";
$comercialPayload = [
    'message_type' => 'incoming',
    'content' => 'Como funciona o ingresso VIP do Congresso 2026?',
    'conversation' => ['id' => 104, 'inbox_id' => 4],
    'sender' => ['name' => 'Dra. Beatriz']
];
$resComercial = $service->handleMessageCreated($comercialPayload);
if (
    in_array($resComercial['action'], ['private_note', 'public_reply']) &&
    (str_contains($resComercial['note'] ?? '', '1.497') || str_contains($resComercial['reply'] ?? '', '1.497'))
) {
    echo "   [✓] Orquestração comercial validada com sucesso ({$resComercial['action']}).\n";
} else {
    echo "   [✗] Falha no teste Comercial: " . json_encode($resComercial) . "\n";
    exit(1);
}

// 6. Test Human Handoff
echo "\n>> [6/7] Testando gatilho de Handoff Humano (Lead Quente)...\n";
$handoffPayload = [
    'message_type' => 'incoming',
    'content' => 'Quero comprar agora e falar com atendente humano urgente',
    'conversation' => ['id' => 105, 'inbox_id' => 4],
    'sender' => ['name' => 'Carlos Investidor']
];
$resHandoff = $service->handleMessageCreated($handoffPayload);
if ($resHandoff['action'] === 'handoff_executed' && $resHandoff['tag'] === 'lead-quente') {
    echo "   [✓] Handoff humano executado com tag 'lead-quente' atribuída com sucesso.\n";
} else {
    echo "   [✗] Falha no teste de handoff: " . json_encode($resHandoff) . "\n";
    exit(1);
}

// 7. Test Prompt Testing Feature (UI Simulator)
echo "\n>> [7/7] Testando simulador de prompt da UI...\n";
$testLicenciadas = $service->testPrompt('licenciadas', 'Como renovar meu certificado?');
if ($testLicenciadas['success'] === true && str_contains($testLicenciadas['response'], 'Dra. Joselene Silva')) {
    echo "   [✓] Simulador de Suporte Licenciadas blindado com mensagem oficial da Dra. Josi.\n";
} else {
    echo "   [✗] Falha no simulador de licenciadas: " . json_encode($testLicenciadas) . "\n";
    exit(1);
}

$testClinica = $service->testPrompt('clinica', 'Estou sentindo dores musculares após o treino');
if ($testClinica['success'] === true && str_contains($testClinica['response'], 'Drenagem & Recuperação')) {
    echo "   [✓] Simulador clínico respondeu adequadamente à queixa de dor (4 Hz).\n";
} else {
    echo "   [✗] Falha no simulador de prompt: " . json_encode($testClinica) . "\n";
    exit(1);
}

echo "\n====================================================================\n";
echo "🎉 TESTE DE FUMAÇA DO HERMES AGENT CRM 100% APROVADO!\n";
echo "====================================================================\n";
