<?php
// apps/web-app/src/backend/api/index.php
/**
 * API Proxy Router
 * Redireciona requisições da raiz /api para /api/v1 preservando rotas.
 * Essencial para compatibilidade com o frontend que usa API_BASE = '/api'.
 */

$uri = $_SERVER['REQUEST_URI'];
if (strpos($uri, 'env_writer.php') !== false) {
    require_once __DIR__ . '/env_writer.php';
    exit;
}
$method = $_SERVER['REQUEST_METHOD'];

// Remove query string para o match de rota se necessário
$path = parse_url($uri, PHP_URL_PATH);

// Normalização para o Router.php em v1/Core/Router.php
// O Router espera que a URI comece com /api/v1 para dar o strip e sobrar apenas a rota.
if (strpos($uri, '/api/v1/') === false && strpos($uri, '/api/') === 0) {
    // Transformamos /api/algo em /api/v1/algo temporariamente para o dispatch
    $proxyUri = str_replace('/api/', '/api/v1/', $uri);
    $_SERVER['REQUEST_URI'] = $proxyUri;
}

require_once __DIR__ . '/v1/index.php';
