<?php
// apps/web-app/src/backend/api/v1/crm/google_oauth.php
// Body Harmony Nexus V3.2 — Google OAuth2 Web Flow Controller (PLAN-207)

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/GoogleWorkspaceService.php';

use BodyHarmony\Services\GoogleWorkspaceService;

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

global $pdo, $db;
$dbConn = $pdo ?? $db;

try {
    $service = new GoogleWorkspaceService($dbConn);
    $action = $_GET['action'] ?? ($_POST['action'] ?? 'config');

    // 1. Obter Configuração Atual de OAuth
    if ($action === 'config' || $action === 'get_config') {
        $config = $service->getOAuthConfig();
        echo json_encode($config, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    // 2. Gerar URL de Consentimento Google
    if ($action === 'auth_url' || $action === 'get_auth_url') {
        $clientId = $_GET['client_id'] ?? null;
        $res = $service->getAuthUrl($clientId);
        echo json_encode($res, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    // 3. Callback do Google (quando o usuário clica em Permitir no Google)
    if ($action === 'callback') {
        $code = $_GET['code'] ?? ($_POST['code'] ?? null);
        $error = $_GET['error'] ?? null;

        if ($error) {
            header('Content-Type: text/html; charset=utf-8');
            echo "<!DOCTYPE html><html><body style='font-family:sans-serif;text-align:center;padding:2rem;background:#F8FAFC;color:#0A3E60;'>"
               . "<h2 style='color:#EF4444;'>❌ Autorização Cancelada</h2>"
               . "<p>O acesso ao Google Workspace não foi concedido: " . htmlspecialchars($error) . "</p>"
               . "<script>if(window.opener){window.opener.postMessage({type:'GOOGLE_AUTH_ERROR',error:'" . addslashes($error) . "'},'*');} setTimeout(()=>window.close(),2500);</script>"
               . "</body></html>";
            exit;
        }

        if ($code) {
            $exchangeRes = $service->exchangeCodeForToken($code);
            header('Content-Type: text/html; charset=utf-8');
            if ($exchangeRes['success']) {
                echo "<!DOCTYPE html><html><head><title>Autenticado com Sucesso</title></head><body style='font-family:sans-serif;text-align:center;padding:3rem;background:#F8FAFC;color:#0A3E60;'>"
                   . "<h2 style='color:#10B981;'>✓ Google Workspace Conectado!</h2>"
                   . "<p>Conta <strong>bodyharmony36@gmail.com</strong> sincronizada com sucesso.</p>"
                   . "<p style='color:#64748B;font-size:0.85rem;'>Fechando esta janela e atualizando o painel do CRM...</p>"
                   . "<script>"
                   . "if(window.opener){ window.opener.postMessage({type:'GOOGLE_AUTH_SUCCESS', message:'Token gravado com sucesso'},'*'); }"
                   . "setTimeout(function(){ window.close(); }, 1200);"
                   . "</script>"
                   . "</body></html>";
                exit;
            } else {
                echo "<!DOCTYPE html><html><body style='font-family:sans-serif;text-align:center;padding:2rem;background:#F8FAFC;color:#0A3E60;'>"
                   . "<h2 style='color:#EF4444;'>⚠️ Falha ao Gravar Token</h2>"
                   . "<p>" . htmlspecialchars($exchangeRes['message'] ?? 'Erro desconhecido') . "</p>"
                   . "<script>if(window.opener){window.opener.postMessage({type:'GOOGLE_AUTH_ERROR',error:'Falha ao trocar token'},'*');}</script>"
                   . "</body></html>";
                exit;
            }
        }

        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Código de autorização não recebido.']);
        exit;
    }

    // 4. Salvar Credenciais de Cliente (Client ID e Secret)
    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $body = json_decode($raw, true) ?: $_POST;
        $postAction = $body['action'] ?? $action;

        if ($postAction === 'save_credentials') {
            $clientId = $body['client_id'] ?? '';
            $clientSecret = $body['client_secret'] ?? '';
            $res = $service->saveClientCredentials($clientId, $clientSecret);
            echo json_encode($res, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            exit;
        }

        if ($postAction === 'exchange_code') {
            $code = $body['code'] ?? '';
            $res = $service->exchangeCodeForToken($code);
            echo json_encode($res, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            exit;
        }
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
