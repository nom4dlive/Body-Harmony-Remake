<?php
require_once '../config.php';
require_once '../auth_check.php'; // Reuse auth or verify Nexus token specifically

// Verify Nexus Access
session_start();
if (!isset($_SESSION['nexus_role']) || $_SESSION['nexus_role'] !== 'god_mode') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized Watchtower Access']);
    exit;
}

// Get Active Sessions (Last 15 min)
// Assumes lms_access_logs table tracks requests with user_id and timestamp
try {
    $stmt = $pdo->query("
        SELECT 
            al.user_id, 
            s.name, 
            s.email, 
            al.ip_address, 
            al.user_agent, 
            MAX(al.accessed_at) as last_seen 
        FROM lms_access_logs al
        JOIN students s ON al.user_id = s.id
        WHERE al.accessed_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
        GROUP BY al.user_id, al.ip_address, al.user_agent
        ORDER BY last_seen DESC
    ");
    $sessions = $stmt->fetchAll();
    echo json_encode(['sessions' => $sessions]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
