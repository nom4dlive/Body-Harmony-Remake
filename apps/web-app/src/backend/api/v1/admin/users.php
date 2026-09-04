<?php
// api/v1/admin/users.php
// User Management API for Nexus Barracks

require_once '../../config.php';
require_once '../../cors.php';
require_once '../../auth_check.php'; // Admin Only
require_once './error_handler.php'; // Error Handler

$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json; charset=utf-8');

try {
    if ($method === 'GET') {
        // List all students with device_count and last_seen
        $stmt = $pdo->query("
            SELECT 
                s.id, 
                s.name, 
                s.instagram, 
                s.whatsapp, 
                s.is_active as active,
                s.state,
                s.city,
                COUNT(DISTINCT sd.id) as device_count,
                MAX(la.created_at) as last_seen
            FROM licenciadas s
            LEFT JOIN licenciada_devices sd ON s.id = sd.licenciada_id
            LEFT JOIN lms_access_logs la ON s.id = la.licenciada_id
            GROUP BY s.id
            ORDER BY s.name ASC
        ");
        
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'users' => $users]);
        exit;
    }
    
    if ($method === 'POST') {
        // Robust input validation
        $rawInput = file_get_contents('php://input');
        $input = NexusErrorHandler::validateInput($rawInput);
        $action = NexusErrorHandler::requireAction($input);
        
        // Validate action
        $allowedActions = ['ban', 'unban', 'clear_devices', 'check_access', 'create', 'delete', 'reset_password'];
        NexusErrorHandler::validateAction($action, $allowedActions);
        
        switch ($action) {
            case 'ban':
                $userId = NexusErrorHandler::requireParam($input, 'user_id', 'User ID');
                
                $stmt = $pdo->prepare("UPDATE licenciadas SET is_active = 0 WHERE id = ?");
                $stmt->execute([$userId]);
                
                // Log the action
                error_log("[NEXUS] Admin {$_SESSION['user']['username']} banned student ID {$userId}");
                
                echo json_encode(['success' => true, 'message' => 'User banned successfully']);
                break;
                
            case 'unban':
                $userId = NexusErrorHandler::requireParam($input, 'user_id', 'User ID');
                
                $stmt = $pdo->prepare("UPDATE licenciadas SET is_active = 1 WHERE id = ?");
                $stmt->execute([$userId]);
                
                // Log the action
                error_log("[NEXUS] Admin {$_SESSION['user']['username']} unbanned student ID {$userId}");
                
                echo json_encode(['success' => true, 'message' => 'User unbanned successfully']);
                break;
                
            case 'clear_devices':
                $userId = NexusErrorHandler::requireParam($input, 'user_id', 'User ID');
                
                $stmt = $pdo->prepare("DELETE FROM licenciada_devices WHERE licenciada_id = ?");
                $stmt->execute([$userId]);
                $deletedCount = $stmt->rowCount();
                
                // Log the action
                error_log("[NEXUS] Admin {$_SESSION['user']['username']} cleared {$deletedCount} devices for student ID {$userId}");
                
                echo json_encode(['success' => true, 'message' => "Cleared {$deletedCount} devices", 'deleted_count' => $deletedCount]);
                break;
                
            case 'check_access':
                $userId = NexusErrorHandler::requireParam($input, 'user_id', 'User ID');
                
                // Get student info
                $stmt = $pdo->prepare("SELECT id, name, is_active as active FROM licenciadas WHERE id = ?");
                $stmt->execute([$userId]);
                $student = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$student) {
                    NexusErrorHandler::respond(404, NexusErrorHandler::ERR_NOT_FOUND,
                        "Student with ID {$userId} not found in database.",
                        ['user_id' => $userId]
                    );
                }
                
                // Get device count
                $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM licenciada_devices WHERE licenciada_id = ?");
                $stmt->execute([$userId]);
                $deviceCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                // Get recent activity
                $stmt = $pdo->prepare("SELECT created_at as timestamp FROM lms_access_logs WHERE licenciada_id = ? ORDER BY created_at DESC LIMIT 1");
                $stmt->execute([$userId]);
                $lastActivity = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $report = [
                    'account_status' => $student['active'] == 1 ? 'ACTIVE' : 'BANNED',
                    'active_devices' => $deviceCount,
                    'device_status' => $deviceCount >= 3 ? 'LIMIT REACHED' : 'OK',
                    'recent_activity' => $lastActivity ? $lastActivity['timestamp'] : 'Never logged in'
                ];
                
                echo json_encode(['success' => true, 'report' => $report]);
                break;
                
            case 'create':
                $name = NexusErrorHandler::requireParam($input, 'name', 'Student Name');
                $whatsapp = NexusErrorHandler::requireParam($input, 'whatsapp', 'WhatsApp');
                $password = NexusErrorHandler::requireParam($input, 'password', 'Password');
                
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                
                $stmt = $pdo->prepare("INSERT INTO licenciadas (name, whatsapp, password_hash, is_active) VALUES (?, ?, ?, 1)");
                $stmt->execute([$name, $whatsapp, $passwordHash]);
                $newId = $pdo->lastInsertId();
                
                // Log the action
                error_log("[NEXUS] Admin {$_SESSION['user']['username']} created student ID {$newId} ({$name})");
                
                echo json_encode(['success' => true, 'message' => 'Student created', 'id' => $newId]);
                break;
                
            case 'delete':
                $userId = NexusErrorHandler::requireParam($input, 'user_id', 'User ID');
                
                // Get student name for logging
                $stmt = $pdo->prepare("SELECT name FROM licenciadas WHERE id = ?");
                $stmt->execute([$userId]);
                $student = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Delete student (cascade will handle devices and logs)
                $stmt = $pdo->prepare("DELETE FROM licenciadas WHERE id = ?");
                $stmt->execute([$userId]);
                
                // Log the action
                error_log("[NEXUS] Admin {$_SESSION['user']['username']} deleted student ID {$userId} ({$student['name']})");
                
                echo json_encode(['success' => true, 'message' => 'Student deleted']);
                break;
                
            case 'reset_password':
                $userId = NexusErrorHandler::requireParam($input, 'user_id', 'User ID');
                $password = NexusErrorHandler::requireParam($input, 'password', 'Password');
                
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                
                $stmt = $pdo->prepare("UPDATE licenciadas SET password_hash = ? WHERE id = ?");
                $stmt->execute([$passwordHash, $userId]);
                
                // Log the action
                error_log("[NEXUS] Admin {$_SESSION['user']['username']} reset password for student ID {$userId}");
                
                echo json_encode(['success' => true, 'message' => 'Password reset successfully']);
                break;
                
            default:
                // This should never be reached due to validateAction, but just in case
                NexusErrorHandler::respond(400, NexusErrorHandler::ERR_INVALID_ACTION,
                    "Unknown action '{$action}'.",
                    ['received_action' => $action]
                );
        }
        exit;
    }
    
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    
} catch (PDOException $e) {
    NexusErrorHandler::respond(500, NexusErrorHandler::ERR_DATABASE,
        'Database operation failed.',
        [
            'error' => $e->getMessage(),
            'hint' => 'Check database connection and query syntax'
        ]
    );
}
