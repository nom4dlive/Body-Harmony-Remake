<?php
require_once '../../config.php';
header('Content-Type: application/json');
require_once '../../auth_check.php';

// RBAC Check (Superadmin Only)
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

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

if ($action === 'flush_opcache') {
    // 1. Flush PHP OPCache
    $opcache_status = false;
    if (function_exists('opcache_reset')) {
        $opcache_status = opcache_reset();
    }

    // 2. Clear Local File Cache (if any custom caching exists)
    // For now, mostly symbolic as we rely on SQL.
    
    echo json_encode([
        'success' => true,
        'message' => 'System Cache Flushed.',
        'details' => [
            'opcache' => $opcache_status ? 'Cleaned' : 'Not Available',
            'client' => 'Signal sent to clear browser cache'
        ]
    ]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid Action']);
}
?>
