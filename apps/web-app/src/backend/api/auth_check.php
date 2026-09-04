<?php
// api/auth_check.php
require_once 'config.php';

$headers = function_exists('getallheaders') ? getallheaders() : [];
$token = null;

$authHeader = null;
if (isset($headers['Authorization'])) {
    $authHeader = $headers['Authorization'];
} elseif (isset($headers['authorization'])) {
    $authHeader = $headers['authorization'];
} elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
    $authHeader = $_SERVER['HTTP_X_AUTH_TOKEN'];
} elseif (isset($headers['X-Auth-Token'])) {
    $authHeader = $headers['X-Auth-Token'];
} elseif (isset($headers['x-auth-token'])) {
    $authHeader = $headers['x-auth-token'];
}

if ($authHeader) {
    if (preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        $token = $matches[1];
    } else {
        $token = trim($authHeader);
    }
}

if (!$token && !empty($_GET['token'])) {
    $token = trim($_GET['token']);
}

if (!$token) {
    http_response_code(401);
    die(json_encode(['success' => false, 'error' => 'Unauthorized: Token de autorização não fornecido.']));
}

$stmt = $pdo->prepare("SELECT user_id FROM admin_sessions WHERE token = ? AND expires_at > NOW()");
$stmt->execute([$token]);
$current_user_id = $stmt->fetchColumn();

if (!$current_user_id) {
    http_response_code(401);
    die(json_encode(['success' => false, 'error' => 'Session expired: Sessão expirada ou inválida.']));
}
