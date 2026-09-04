<?php
// api/v1/admin/admins.php
// Admin Management API for Nexus Barracks

require_once '../../config.php';
require_once '../../cors.php';
require_once '../../auth_check.php'; // Admin Only
require_once './error_handler.php'; // Error Handler

$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json; charset=utf-8');

try {
    if ($method === 'GET') {
        // List all admins
        $stmt = $pdo->query("
            SELECT id, username, role, created_at 
            FROM admin_users 
            ORDER BY created_at DESC
        ");
        
        $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'admins' => $admins]);
        exit;
    }
    
    if ($method === 'POST') {
        $rawInput = file_get_contents('php://input');
        $input = NexusErrorHandler::validateInput($rawInput);
        $action = NexusErrorHandler::requireAction($input);
        
        $allowedActions = ['create', 'delete', 'reset_password'];
        NexusErrorHandler::validateAction($action, $allowedActions);
        
        switch ($action) {
            case 'create':
                $username = NexusErrorHandler::requireParam($input, 'username', 'Username');
                $password = NexusErrorHandler::requireParam($input, 'password', 'Password');
                $role = $input['role'] ?? 'admin';
                
                // Validate role
                if (!in_array($role, ['admin', 'superadmin'])) {
                    NexusErrorHandler::respond(400, NexusErrorHandler::ERR_VALIDATION,
                        "Invalid role '{$role}'. Must be 'admin' or 'superadmin'.",
                        ['received_role' => $role, 'valid_roles' => ['admin', 'superadmin']]
                    );
                }
                
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                
                $stmt = $pdo->prepare("INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)");
                $stmt->execute([$username, $passwordHash, $role]);
                $newId = $pdo->lastInsertId();
                
                // Log the action
                error_log("[NEXUS] Admin {$_SESSION['user']['username']} created admin ID {$newId} ({$username}, role: {$role})");
                
                echo json_encode(['success' => true, 'message' => 'Admin created', 'id' => $newId]);
                break;
                
            case 'delete':
                $adminId = NexusErrorHandler::requireParam($input, 'id', 'Admin ID');
                
                // Prevent self-deletion
                if ($adminId == $_SESSION['user']['id']) {
                    NexusErrorHandler::respond(403, NexusErrorHandler::ERR_FORBIDDEN,
                        'Cannot delete yourself. Self-deletion is not allowed.',
                        ['admin_id' => $adminId]
                    );
                }
                
                // Get admin username for logging
                $stmt = $pdo->prepare("SELECT username FROM admin_users WHERE id = ?");
                $stmt->execute([$adminId]);
                $admin = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Delete admin
                $stmt = $pdo->prepare("DELETE FROM admin_users WHERE id = ?");
                $stmt->execute([$adminId]);
                
                // Log the action
                error_log("[NEXUS] Admin {$_SESSION['user']['username']} deleted admin ID {$adminId} ({$admin['username']})");
                
                echo json_encode(['success' => true, 'message' => 'Admin deleted']);
                break;
                
            case 'reset_password':
                $adminId = NexusErrorHandler::requireParam($input, 'id', 'Admin ID');
                $password = NexusErrorHandler::requireParam($input, 'password', 'Password');
                
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                
                $stmt = $pdo->prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?");
                $stmt->execute([$passwordHash, $adminId]);
                
                // Log the action
                error_log("[NEXUS] Admin {$_SESSION['user']['username']} reset password for admin ID {$adminId}");
                
                echo json_encode(['success' => true, 'message' => 'Password reset successfully']);
                break;
                
            default:
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
        ['error' => $e->getMessage(), 'hint' => 'Check database connection']
    );
}
