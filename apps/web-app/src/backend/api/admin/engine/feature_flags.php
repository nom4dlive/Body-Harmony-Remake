<?php
require_once '../../config.php';
header('Content-Type: application/json');
require_once '../../auth_check.php';

// RBAC Check
try {
    $stmt = $pdo->prepare("SELECT role FROM admin_users WHERE id = ?");
    $stmt->execute([$current_user_id]);
    $user = $stmt->fetch();
    if (!$user || $user['role'] !== 'superadmin') {
        throw new Exception('Unauthorized');
    }
} catch (Exception $e) {
    http_response_code(403);
    echo json_encode(['error' => 'Access Denied']);
    exit;
}

// Simple Config Table Approach
// Using site_config table created in V11 schema

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT config_value FROM site_config WHERE config_key = 'maintenance_mode'");
    $stmt->execute();
    $res = $stmt->fetch();
    $isActive = $res ? ($res['config_value'] === '1') : false;

    echo json_encode(['maintenance_mode' => $isActive]);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $status = isset($input['status']) && $input['status'] == true ? '1' : '0';

    $stmt = $pdo->prepare("INSERT INTO site_config (config_key, config_value) VALUES ('maintenance_mode', ?) ON DUPLICATE KEY UPDATE config_value = ?");
    $stmt->execute([$status, $status]);

    echo json_encode(['success' => true, 'maintenance_mode' => $status === '1']);
}
?>
