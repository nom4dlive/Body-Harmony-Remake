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

// 1. Get Live Stats
try {
    // Active Sessions (Unique Users in last 15 mins)
    $stmt = $pdo->query("
        SELECT COUNT(DISTINCT student_id) as active 
        FROM lms_access_logs 
        WHERE created_at >= NOW() - INTERVAL 15 MINUTE
    ");
    $active_count = $stmt->fetch()['active'];

    // 2. Detect Credential Sharing (Same User, >1 Distinct IPs in last 60 mins)
    $stmt = $pdo->query("
        SELECT 
            s.name, 
            s.id as student_id,
            COUNT(DISTINCT ip_address) as ip_count,
            GROUP_CONCAT(DISTINCT ip_address) as  ips
        FROM lms_access_logs l
        JOIN students s ON l.student_id = s.id
        WHERE l.created_at >= NOW() - INTERVAL 60 MINUTE
        GROUP BY l.student_id
        HAVING ip_count > 1
    ");
    $alerts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Recent Logs Feed
    $stmt = $pdo->query("
        SELECT 
            l.id,
            s.name as user,
            l.ip_address as ip,
            l.action,
            l.created_at as time,
            'Browser' as device -- Simplification for now
        FROM lms_access_logs l
        LEFT JOIN students s ON l.student_id = s.id
        ORDER BY l.created_at DESC
        LIMIT 50
    ");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'active' => $active_count,
        'alerts' => $alerts,
        'logs' => $logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
