<?php
// tests/google_oauth_web_flow_test.php
// Body Harmony Nexus V3.2 — Google OAuth Web Flow Test (PLAN-207)

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/GoogleWorkspaceService.php';

use BodyHarmony\Services\GoogleWorkspaceService;

echo "====================================================================\n";
echo "   TESTE DO ASSISTENTE VISUAL GOOGLE OAUTH 1-CLIQUE (PLAN-207)     \n";
echo "====================================================================\n\n";

$service = new GoogleWorkspaceService(null);

// 1. Obter Configuração de OAuth
echo ">> [1/4] Verificando método getOAuthConfig()...\n";
$config = $service->getOAuthConfig();
if (isset($config['redirect_uri']) && isset($config['scopes']) && is_array($config['scopes'])) {
    echo "   [✓] Configuração de OAuth obtida com sucesso!\n";
    echo "       - Redirect URI: {$config['redirect_uri']}\n";
    echo "       - Client ID presente: " . ($config['has_client_id'] ? "SIM" : "NÃO") . "\n";
    echo "       - Escopos: " . implode(', ', $config['scopes']) . "\n";
} else {
    echo "   [✗] Falha ao obter configuração de OAuth: " . json_encode($config) . "\n";
    exit(1);
}

// 2. Gerar URL de Consentimento Google
echo "\n>> [2/4] Verificando geração de Auth URL (getAuthUrl)...\n";
$authUrlRes = $service->getAuthUrl('test_client_id_123.apps.googleusercontent.com');
if ($authUrlRes['success'] === true && !empty($authUrlRes['auth_url'])) {
    $url = $authUrlRes['auth_url'];
    if (str_contains($url, 'accounts.google.com') && str_contains($url, 'response_type=code') && str_contains($url, 'test_client_id_123')) {
        echo "   [✓] URL oficial de consentimento do Google gerada com sucesso!\n";
        echo "       - URL: " . substr($url, 0, 75) . "...\n";
    } else {
        echo "   [✗] URL gerada inválida: {$url}\n";
        exit(1);
    }
} else {
    echo "   [✗] Falha na geração da Auth URL: " . json_encode($authUrlRes) . "\n";
    exit(1);
}

// 3. Testar Salvamento de Credenciais Client ID / Secret
echo "\n>> [3/4] Testando saveClientCredentials()...\n";
$saveRes = $service->saveClientCredentials('SAMPLE_CLIENT_ID', 'SAMPLE_CLIENT_SECRET');
if ($saveRes['success'] === true) {
    echo "   [✓] Credenciais de cliente salvas com sucesso!\n";
} else {
    echo "   [✗] Falha ao salvar credenciais: " . json_encode($saveRes) . "\n";
    exit(1);
}

// 4. Testar Validação de Troca de Código Inválido
echo "\n>> [4/4] Testando proteção de troca de código OAuth...\n";
$exchangeRes = $service->exchangeCodeForToken('fake_invalid_code');
if ($exchangeRes['success'] === false) {
    echo "   [✓] Proteção contra código de autorização falso/inválido ativa.\n";
} else {
    echo "   [✗] Troca de código falso aceita indevidamente.\n";
    exit(1);
}

echo "\n====================================================================\n";
echo "🎉 TESTE DO FLUXO GOOGLE OAUTH WEB 100% APROVADO!\n";
echo "====================================================================\n";
