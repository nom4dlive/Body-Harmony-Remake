<?php
require_once '../../config.php';
header('Content-Type: application/json; charset=utf-8');
require_once '../../auth_check.php';

// RBAC
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

try {
    $response = [];

    // 1. DAU (Last 30 Days)
    $stmt = $pdo->query("
        SELECT 
            DATE(created_at) as date, 
            COUNT(DISTINCT student_id) as active_users 
        FROM lms_access_logs 
        WHERE created_at >= NOW() - INTERVAL 30 DAY 
        GROUP BY DATE(created_at) 
        ORDER BY date ASC
    ");
    $response['dau'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Device Stats
    // Naive classification based on user_agent
    $stmt = $pdo->query("SELECT user_agent FROM student_devices");
    $devices = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $stats = ['Mobile' => 0, 'Desktop' => 0, 'Tablet' => 0];
    foreach ($devices as $d) {
        $d = strtolower($d);
        if (strpos($d, 'android') !== false || strpos($d, 'iphone') !== false) {
            $stats['Mobile']++;
        } elseif (strpos($d, 'ipad') !== false) {
            $stats['Tablet']++;
        } else {
            // Default to Desktop, but could be specific
            $stats['Desktop']++;
        }
    }
    $response['devices'] = [
        ['name' => 'Mobile', 'value' => $stats['Mobile']],
        ['name' => 'Desktop', 'value' => $stats['Desktop']],
        ['name' => 'Tablet', 'value' => $stats['Tablet']]
    ];

    // 3. Churn Risk (Inactive > 15 Days)
    // Users active in general, but no logs in last 15 days
    $stmt = $pdo->query("
        SELECT id, name, instagram, whatsapp 
        FROM students 
        WHERE is_active = 1 
        AND id NOT IN (
            SELECT DISTINCT student_id 
            FROM lms_access_logs 
            WHERE created_at >= NOW() - INTERVAL 15 DAY
        )
        LIMIT 20
    ");
    $response['churn_risk'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
