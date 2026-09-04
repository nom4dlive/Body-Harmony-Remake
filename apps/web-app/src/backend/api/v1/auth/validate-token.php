<?php
/**
 * Unified Token Validation Endpoint — Nexus Protocol V3.1
 * POST /api/v1/auth/validate-token.php
 * Valida Bearer Token contra admin_sessions (GESTOR) e licenciada_devices (LICENCIADA)
 * REGRA 13 (LazyDb / PDO Connection Invariant)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Device-Token, X-Auth-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Resolução defensiva de includes
if (file_exists(__DIR__ . '/../../config.php')) {
    require_once __DIR__ . '/../../config.php';
} elseif (file_exists(__DIR__ . '/../config.php')) {
    require_once __DIR__ . '/../config.php';
}

$headers = function_exists('getallheaders') ? getallheaders() : [];
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
$token = null;

if ($authHeader && preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
    $token = trim($matches[1]);
}

if (!$token) {
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true) ?? [];
    $token = $body['token'] ?? $_GET['token'] ?? $_POST['token'] ?? null;
}

if (!$token) {
    http_response_code(401);
    echo json_encode([
        'valid' => false,
        'error' => 'Token de autorização não fornecido.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

global $pdo, $db;
$dbConn = $pdo ?? $db;

if (!$dbConn && function_exists('get_db_connection')) {
    $dbConn = get_db_connection();
}

if (!$dbConn) {
    http_response_code(401);
    echo json_encode([
        'valid' => false,
        'error' => 'Sessão inválida ou banco inacessível.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // 1. Checa admin_sessions (Perfil GESTOR)
    $stmtAdmin = $dbConn->prepare("
        SELECT s.user_id, u.username, u.role 
        FROM admin_sessions s
        JOIN admin_users u ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > NOW()
        LIMIT 1;
    ");
    $stmtAdmin->execute([$token]);
    $admin = $stmtAdmin->fetch(PDO::FETCH_ASSOC);

    if ($admin) {
        http_response_code(200);
        echo json_encode([
            'valid' => true,
            'user_id' => 'admin_' . $admin['user_id'],
            'role' => 'GESTOR',
            'username' => $admin['username'],
            'name' => ucfirst($admin['username']),
            'permissions' => ['*']
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2. Checa licenciada_devices (Perfil LICENCIADA)
    $stmtLic = $dbConn->prepare("
        SELECT d.licenciada_id, l.name, l.cpf, l.is_active, d.is_active AS device_active
        FROM licenciada_devices d
        JOIN licenciadas l ON d.licenciada_id = l.id
        WHERE d.device_token = ?
        LIMIT 1;
    ");
    $stmtLic->execute([$token]);
    $licenciada = $stmtLic->fetch(PDO::FETCH_ASSOC);

    if ($licenciada) {
        // Se a licenciada existe no banco e não está explicitamente desativada
        if (!isset($licenciada['is_active']) || $licenciada['is_active'] == 1) {
            http_response_code(200);
            echo json_encode([
                'valid' => true,
                'user_id' => 'licenciada_' . $licenciada['licenciada_id'],
                'role' => 'LICENCIADA',
                'username' => $licenciada['cpf'] ?? $licenciada['name'],
                'name' => $licenciada['name'],
                'permissions' => ['smartbook:read', 'smartbook:query', 'smartbook:transform']
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // 3. Checa licenciadas diretamente por ID ou CPF (se token for numérico ou formatado)
    $cleanToken = preg_replace('/^licenciada_|^lic_/', '', $token);
    if (is_numeric($cleanToken) || strlen($cleanToken) === 11 || strlen($cleanToken) === 14) {
        $stmtDirect = $dbConn->prepare("
            SELECT id, name, cpf, is_active 
            FROM licenciadas 
            WHERE id = ? OR cpf = ? OR username = ? 
            LIMIT 1;
        ");
        $stmtDirect->execute([$cleanToken, $cleanToken, $cleanToken]);
        $licDirect = $stmtDirect->fetch(PDO::FETCH_ASSOC);

        if ($licDirect && (!isset($licDirect['is_active']) || $licDirect['is_active'] == 1)) {
            http_response_code(200);
            echo json_encode([
                'valid' => true,
                'user_id' => 'licenciada_' . $licDirect['id'],
                'role' => 'LICENCIADA',
                'username' => $licDirect['cpf'] ?? $licDirect['name'],
                'name' => $licDirect['name'],
                'permissions' => ['smartbook:read', 'smartbook:query', 'smartbook:transform']
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // 4. Token não encontrado ou expirado
    http_response_code(401);
    echo json_encode([
        'valid' => false,
        'error' => 'Sessão inválida ou expirada.'
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'valid' => false,
        'error' => 'Sessão inválida: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
