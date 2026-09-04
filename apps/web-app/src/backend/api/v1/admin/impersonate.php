<?php
// api/v1/admin/impersonate.php
// Ghost Mode - Admin Impersonation API

require_once '../../config.php';
require_once '../../cors.php';
require_once '../../auth_check.php'; // Admin Only
require_once './error_handler.php'; // Error Handler

header('Content-Type: application/json; charset=utf-8');

try {
    // Verify superadmin role
    if ($_SESSION['user']['role'] !== 'superadmin') {
        NexusErrorHandler::respond(403, NexusErrorHandler::ERR_FORBIDDEN,
            'Superadmin access required for impersonation.',
            [
                'required_role' => 'superadmin',
                'current_role' => $_SESSION['user']['role']
            ]
        );
    }
    
    $rawInput = file_get_contents('php://input');
    $input = NexusErrorHandler::validateInput($rawInput);
    $studentId = NexusErrorHandler::requireParam($input, 'licenciada_id', 'Licenciada ID');
    
    // Get student info
    $stmt = $pdo->prepare("SELECT id, name, whatsapp, is_active as active FROM licenciadas WHERE id = ?");
    $stmt->execute([$studentId]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$student) {
        NexusErrorHandler::respond(404, NexusErrorHandler::ERR_NOT_FOUND,
            "Student with ID {$studentId} not found in database.",
            ['student_id' => $studentId]
        );
    }
    
    // Generate device token (same algorithm as auth_student.php)
    $deviceToken = bin2hex(random_bytes(32));
    $deviceFingerprint = 'NEXUS_GHOST_MODE_' . $_SESSION['user']['username'];
    
    // Insert ghost device
    $stmt = $pdo->prepare("
        INSERT INTO licenciada_devices (licenciada_id, device_token, user_agent, last_used_at) 
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([$studentId, $deviceToken, $deviceFingerprint]);
    
    // Create impersonation log table if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_impersonation_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            licenciada_id INT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45),
            FOREIGN KEY (admin_id) REFERENCES admin_users(id),
            FOREIGN KEY (licenciada_id) REFERENCES licenciadas(id)
        )
    ");
    
    // Log impersonation
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $stmt = $pdo->prepare("
        INSERT INTO admin_impersonation_log (admin_id, licenciada_id, ip_address) 
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$_SESSION['user']['id'], $studentId, $ipAddress]);
    
    // Log to error log for audit trail
    error_log("[GHOST MODE] Admin {$_SESSION['user']['username']} (ID {$_SESSION['user']['id']}) impersonated student {$student['name']} (ID {$studentId}) from IP {$ipAddress}");
    
    // Return student session data
    echo json_encode([
        'success' => true,
        'message' => 'Ghost mode activated',
        'student' => [
            'id' => $student['id'],
            'name' => $student['name'],
            'whatsapp' => $student['whatsapp'],
            'token' => $deviceToken
        ],
        'device_token' => $deviceToken,
        'warning' => 'This is a ghost session. All actions will be logged.'
    ]);
    
} catch (PDOException $e) {
    NexusErrorHandler::respond(500, NexusErrorHandler::ERR_DATABASE,
        'Database operation failed during impersonation.',
        ['error' => $e->getMessage(), 'hint' => 'Check database connection']
    );
}
