<?php
// api/auth_student_check.php - V41: student → licenciada
require_once 'config.php';

$headers = getallheaders_robust();
$token = $headers['X-DEVICE-TOKEN'] ?? null;

if (!$token) {
    // Fallback search for token in Authorization header if X-Device-Token is missing
    if (isset($headers['AUTHORIZATION'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['AUTHORIZATION'], $matches)) {
            $token = $matches[1];
        }
    }
}

// Fallback to GET/POST param for some legacy calls or debugging
if (!$token) {
    $token = $_GET['token'] ?? $_POST['token'] ?? null;
}

if (!$token) {
    http_response_code(401);
    header('Content-Type: application/json');
    die(json_encode(['error' => 'X-Device-Token required']));
}

try {
    // 1. Validate Device Token
    $stmt = $pdo->prepare("SELECT licenciada_id FROM licenciada_devices WHERE device_token = ?");
    $stmt->execute([$token]);
    $licenciadaId = $stmt->fetchColumn();

    if (!$licenciadaId) {
        http_response_code(401);
        header('Content-Type: application/json');
        die(json_encode(['error' => 'Invalid or expired licenciada session']));
    }

    // 2. Fetch Licenciada Info
    $stmt = $pdo->prepare("SELECT * FROM licenciadas WHERE id = ?");
    $stmt->execute([$licenciadaId]);
    $loggedStudent = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2b. Fallback Admin as Licenciada (Ghost Mode)
    if (!$loggedStudent && $licenciadaId < 0) {
        // This is a simulated licenciada ID (Admin)
        $adminId = abs($licenciadaId);
        $stmtAdmin = $pdo->prepare("SELECT * FROM admin_users WHERE id = ?");
        $stmtAdmin->execute([$adminId]);
        $admin = $stmtAdmin->fetch(PDO::FETCH_ASSOC);
        if ($admin) {
            $loggedStudent = [
                'id' => $licenciadaId, // maintain the negative ID
                'name' => ucfirst($admin['username']) . ' (Admin)',
                'is_active' => 1,
                'role' => $admin['role'] ?? 'admin'
            ];
        }
    }

    if (!$loggedStudent || !$loggedStudent['is_active']) {
        http_response_code(403);
        header('Content-Type: application/json');
        die(json_encode(['error' => 'Licenciada inactive or not found']));
    }

    // Success - $loggedStudent is available for controllers
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    die(json_encode(['error' => 'Auth Database Error']));
}
