<?php
require_once '../config.php';

// Validate Credentials vs Database (Nom4d God Mode)
// 1. IP Whitelist Check (Security Hardening)
$allowedIps = getenv('NEXUS_ALLOWED_IPS'); // Comma separated IPs
if ($allowedIps) {
    $currentIp = $_SERVER['REMOTE_ADDR'];
    $allowedList = array_map('trim', explode(',', $allowedIps));
    
    // Add localhost exceptions
    $allowedList[] = '127.0.0.1';
    $allowedList[] = '::1';

    if (!in_array($currentIp, $allowedList)) {
        // Log Access Attempt
        error_log("[NEXUS BLOCKED] Unauthorized IP: $currentIp");
        http_response_code(403);
        echo json_encode(['error' => 'Access Denied: Restricted Area']);
        exit;
    }
}

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

try {
    $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        
        if ($user['role'] !== 'superadmin') {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient Clearance (Not God Mode)']);
            exit;
        }

        // Generate Token
        $token = bin2hex(random_bytes(32));
        $expires_at = date('Y-m-d H:i:s', time() + (24 * 60 * 60)); // 24h

        // Store Session
        $insert = $pdo->prepare("INSERT INTO admin_sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
        $insert->execute([$user['id'], $token, $expires_at]);

        echo json_encode([
            'success' => true,
            'token' => $token, // Proper Bearer Token
            'role' => $user['role'],
            'message' => 'Welcome back, Commander.'
        ]);

    } else {
        // Fallback: Check Master Password (Legacy/Rescue) without username check if desired, 
        // OR strict username+pass. Let's keep strict for Nexus.
        http_response_code(401);
        echo json_encode(['error' => 'Invalid Credentials. Intruder Alert dispatched.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'System Failure']);
}
?>
