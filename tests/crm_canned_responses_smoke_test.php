<?php
// tests/crm_canned_responses_smoke_test.php
// Body Harmony Nexus V3.1 — Canned Responses Smoke Test (PLAN-176)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/CrmCannedResponsesService.php';

use BodyHarmony\Services\CrmCannedResponsesService;

echo "====================================================================\n";
echo "   TESTE DE FUMAÇA: RESPOSTAS RÁPIDAS & MACROS CHATWOOT (PLAN-176) \n";
echo "====================================================================\n\n";

$service = new CrmCannedResponsesService(null);

// 1. Test Default Macros
echo ">> [1/2] Testando catálogo de macros oficiais...\n";
$macros = $service->getDefaultMacros();
$codes = array_column($macros, 'short_code');

$requiredCodes = ['congresso_exp', 'congresso_vip', 'pix_matriz', 'horarios_clinica', 'anamnese'];
$missing = array_diff($requiredCodes, $codes);

if (empty($missing)) {
    echo "   [✓] Todas as 5 macros oficiais estão presentes: " . implode(', ', $codes) . "\n";
} else {
    echo "   [✗] Faltando macros: " . implode(', ', $missing) . "\n";
    exit(1);
}

// 2. Test Content Validation
echo "\n>> [2/2] Validando dados sensíveis e conformidade institucional...\n";
$pixContent = '';
foreach ($macros as $m) {
    if ($m['short_code'] === 'pix_matriz') {
        $pixContent = $m['content'];
        break;
    }
}

if (str_contains($pixContent, '68.016.506/0001-22') && str_contains($pixContent, 'BODY HARMONY ELETROESTIMULAÇÃO LTDA.')) {
    echo "   [✓] Dados do PIX oficial 100% em conformidade com o CNPJ oficial!\n";
} else {
    echo "   [✗] Falha nos dados do PIX oficial.\n";
    exit(1);
}

echo "\n====================================================================\n";
echo "🎉 TESTE DE FUMAÇA DE MACROS CHATWOOT 100% APROVADO!\n";
echo "====================================================================\n";
