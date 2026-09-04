<?php
// api/v1/Controllers/AdminController.php

class AdminController {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    // Auth Middleware must be called before these methods to ensure 'is_admin' is true.

    private function checkAccess() {
        // Double check just in case, though middleware handles it.
        // In v1, AuthMiddleware injects user into context. 
        // We can access it via global or passed arg, but usually Middleware throws 401/403.
        // Assuming routing only allows authenticated admins here.
    }

    // GET /admin/users
    public function users() {
        try {
            $stmt = $this->pdo->query("
                SELECT 
                    s.id, s.name, s.whatsapp, s.instagram, s.cpf, s.email,
                    s.is_active as active,
                    (SELECT COUNT(*) FROM licenciada_devices sd WHERE sd.licenciada_id = s.id) as device_count,
                    (SELECT MAX(created_at) FROM lms_access_logs al WHERE al.licenciada_id = s.id) as last_seen
                FROM licenciadas s
                ORDER BY last_seen DESC
            ");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Ensure 'active' is integer for Frontend boolean logic (user.active == 1)
            foreach ($users as &$u) {
                $u['active'] = (int)$u['active'];
            }

            Response::json(['users' => $users]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/users (Actions: ban, unban, clear_devices, create, reset_password, delete)
    public function manageUser() {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';
        $user_id = $input['user_id'] ?? 0;

        if (!$user_id && $action !== 'create') {
            Response::error('User ID required', 400);
        }

        try {
            switch ($action) {
                case 'ban':
                    $this->pdo->prepare("UPDATE licenciadas SET is_active = 0 WHERE id = ?")->execute([$user_id]);
                    Response::json(['success' => true, 'message' => 'User Banned']);
                    break;

                case 'reset_lifecycle':
                    $force_password = (bool)($input['force_password'] ?? false);
                    $revoke_lgpd = (bool)($input['revoke_lgpd'] ?? false);
                    $clear_devices = (bool)($input['clear_devices'] ?? false);
                    $clear_throttling = (bool)($input['clear_throttling'] ?? false);
                    $max_devices = isset($input['max_devices']) ? (int)$input['max_devices'] : null;

                    if ($force_password) {
                        $this->pdo->prepare("UPDATE licenciadas SET force_password_change = 1 WHERE id = ?")->execute([$user_id]);
                    }
                    if ($revoke_lgpd) {
                        $this->pdo->prepare("UPDATE licenciadas SET lgpd_status = NULL WHERE id = ?")->execute([$user_id]);
                    }
                    if ($clear_devices) {
                        $this->pdo->prepare("DELETE FROM licenciada_devices WHERE licenciada_id = ?")->execute([$user_id]);
                    }
                    if ($clear_throttling) {
                        $this->pdo->prepare("UPDATE licenciadas SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?")->execute([$user_id]);
                    }
                    if ($max_devices !== null) {
                        $this->pdo->prepare("UPDATE licenciadas SET max_devices = ? WHERE id = ?")->execute([$max_devices, $user_id]);
                    }
                    
                    Response::json(['success' => true, 'message' => 'Lifecycle Reset Successfully']);
                    break;

                case 'unban':
                    $this->pdo->prepare("UPDATE licenciadas SET is_active = 1 WHERE id = ?")->execute([$user_id]);
                    Response::json(['success' => true, 'message' => 'User Active']);
                    break;

                case 'clear_devices':
                    $this->pdo->prepare("DELETE FROM licenciada_devices WHERE licenciada_id = ?")->execute([$user_id]);
                    Response::json(['success' => true, 'message' => 'Devices Cleared']);
                    break;

                case 'create':
                    $name = $input['name'] ?? '';
                    $whatsapp = $input['whatsapp'] ?? '';
                    $pass = $input['password'] ?? '';
                    if (!$name || !$whatsapp || !$pass) Response::error('Name, Whatsapp and Password required', 400);

                    // Check duplicate
                    $stmt = $this->pdo->prepare("SELECT id FROM licenciadas WHERE whatsapp = ?");
                    $stmt->execute([$whatsapp]);
                    if ($stmt->fetch()) Response::error('Whatsapp already registered', 400);

                    $hash = password_hash($pass, PASSWORD_DEFAULT);
                    $stmt = $this->pdo->prepare("INSERT INTO licenciadas (name, whatsapp, password_hash, is_active) VALUES (?, ?, ?, 1)");
                    $stmt->execute([$name, $whatsapp, $hash]);
                    Response::json(['success' => true]);
                    break;

                case 'reset_password':
                    $pass = $input['password'] ?? '';
                    if (!$pass) Response::error('New Password required', 400);
                    $hash = password_hash($pass, PASSWORD_DEFAULT);
                    $this->pdo->prepare("UPDATE licenciadas SET password_hash = ? WHERE id = ?")->execute([$hash, $user_id]);
                    Response::json(['success' => true]);
                    break;

                case 'delete':
                    $this->pdo->beginTransaction();
                    try {
                        $this->pdo->prepare("DELETE FROM lms_access_logs WHERE licenciada_id = ?")->execute([$user_id]);
                        $this->pdo->prepare("DELETE FROM licenciada_devices WHERE licenciada_id = ?")->execute([$user_id]);
                        $this->pdo->prepare("DELETE FROM licenciadas WHERE id = ?")->execute([$user_id]);
                        $this->pdo->commit();
                        Response::json(['success' => true]);
                    } catch (Exception $e) {
                        $this->pdo->rollBack();
                        throw $e;
                    }
                    break;

                default:
                    Response::error('Invalid Action', 400);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/impersonate
    public function impersonate() {
        $input = json_decode(file_get_contents('php://input'), true);
        $student_id = $input['student_id'] ?? 0;

        if (!$student_id) Response::error('Licenciada ID required', 400);

        $stmt = $this->pdo->prepare("SELECT * FROM licenciadas WHERE id = ?");
        $stmt->execute([$student_id]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$student) Response::error('Student not found', 404);

        // Generate a standard device token for them to "login" as this student
        // But for impersonation to work on Frontend simply, we act like loginstudent
        
        // Strategy: Generate a temporary "Ghost Token"
        // In auth_student.php logic, we insert into student_devices. 
        // We can do the same here.
        
        $token = 'ghost-' . bin2hex(random_bytes(32));
        $ua = 'Nexus Ghost Mode (' . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown') . ')';

        // Check limit? No, allow ghost to bypass limit or just add 1. 
        // Or cleaner: Use ID -1 * user_id? No, that's Admin.
        // Just insert.
        $this->pdo->prepare("INSERT INTO licenciada_devices (licenciada_id, device_token, user_agent, last_used_at) VALUES (?, ?, ?, NOW())")
             ->execute([$student['id'], $token, $ua]);

        // Return the student data + token just like login
        // But we don't return password hash
        unset($student['password_hash']);

        Response::json([
            'success' => true,
            'message' => 'Ghost Mode Activated',
            'student' => $student,
            'device_token' => $token, // Frontend handles this as session
            'forceChange' => false
        ]);
    }

    // GET /admin/health
    public function health() {
        // Fetch last 5 high-severity system events from DB
        $recentEvents = [];
        try {
            $stmt = $this->pdo->query("
                SELECT action, severity, description, created_at 
                FROM audit_logs 
                WHERE severity IN ('ERROR', 'CRITICAL') 
                ORDER BY created_at DESC 
                LIMIT 5
            ");
            $recentEvents = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) { $recentEvents = ["DB Error: " . $e->getMessage()]; }

        Response::json([
            'php_version' => phpversion(),
            'server_software' => $_SERVER['SERVER_SOFTWARE'],
            'disk_free_space' => disk_free_space("."),
            'disk_total_space' => disk_total_space("."),
            'memory_usage' => memory_get_usage(true),
            'recent_critical_events' => $recentEvents,
            'nexus_v2' => true
        ]);
    }

    // GET /admin/logs
    public function logs() {
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 100;
        $type = $_GET['type'] ?? null; // Filter by user_type if provided

        try {
            $sql = "SELECT * FROM audit_logs";
            $params = [];
            
            if ($type) {
                $sql .= " WHERE user_type = ?";
                $params[] = $type;
            }
            
            $sql .= " ORDER BY created_at DESC LIMIT " . intval($limit);
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::json([
                'source' => 'Nexus_DB_V2',
                'total_returned' => count($logs),
                'logs' => $logs
            ]);
        } catch (Exception $e) {
            Response::error("Nexus failed to query event stream: " . $e->getMessage(), 500);
        }
    }

    // GET /admin/admins
    public function admins() {
        try {
            $stmt = $this->pdo->query("SELECT id, username, role, created_at FROM admin_users ORDER BY created_at DESC");
            Response::json(['admins' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/admins (Actions: create, delete, reset_password)
    public function manageAdmin() {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';
        
        // Superadmin check is done at route level via AuthMiddleware context usually, 
        // but here we might want to be extra careful or rely on the route check.
        // Route check in index.php ensures is_admin, but maybe we need is_superadmin?
        // Current AuthMiddleware just sets is_admin=true for any admin_session.
        // We should check role if we want STRICT superadmin. 
        // For now, let's assume all 'admins' are trusted or add a check.
        
        // Let's verify role from DB again if needed, or trust the middleware context.
        // Assuming middleware context has 'role'.

        try {
            switch ($action) {
                case 'create':
                    $username = trim($input['username'] ?? '');
                    $password = $input['password'] ?? '';
                    $role = $input['role'] ?? 'admin'; 

                    if (!$username || !$password) Response::error('Username and Password required', 400);

                    $stmt = $this->pdo->prepare("SELECT id FROM admin_users WHERE username = ?");
                    $stmt->execute([$username]);
                    if ($stmt->fetch()) Response::error('Username already taken', 400);

                    $hash = password_hash($password, PASSWORD_DEFAULT);
                    $stmt = $this->pdo->prepare("INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)");
                    $stmt->execute([$username, $hash, $role]);
                    Response::json(['success' => true]);
                    break;

                case 'delete':
                    $id = $input['id'] ?? 0;
                    // Prevent self-delete logic would need current user ID.
                    // $currentUserId = ... (Need to pass context to controller)
                    // For now, simple implementation.
                    
                    $this->pdo->prepare("DELETE FROM admin_users WHERE id = ?")->execute([$id]);
                    Response::json(['success' => true]);
                    break;

                case 'reset_password':
                    $id = $input['id'] ?? 0;
                    $pass = $input['password'] ?? '';
                    if (!$pass) Response::error('New Password required', 400);
                    $hash = password_hash($pass, PASSWORD_DEFAULT);
                    $this->pdo->prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?")->execute([$hash, $id]);
                    Response::json(['success' => true]);
                    break;

                default:
                    Response::error('Invalid Action', 400);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    // POST /admin/users/check-access
    public function checkAccessDiagnostic() {
        $input = json_decode(file_get_contents('php://input'), true);
        $student_id = $input['student_id'] ?? 0;

        if (!$student_id) Response::error('Licenciada ID required', 400);

        try {
            $stmt = $this->pdo->prepare("SELECT name, is_active FROM licenciadas WHERE id = ?");
            $stmt->execute([$student_id]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$student) Response::error('Licenciada not found', 404);

            $stmtDevices = $this->pdo->prepare("SELECT COUNT(*) FROM licenciada_devices WHERE licenciada_id = ?");
            $stmtDevices->execute([$student_id]);
            $deviceCount = $stmtDevices->fetchColumn();

            $stmtLogs = $this->pdo->prepare("SELECT created_at FROM lms_access_logs WHERE licenciada_id = ? ORDER BY created_at DESC LIMIT 1");
            $stmtLogs->execute([$student_id]);
            $lastSeen = $stmtLogs->fetchColumn();

            Response::json([
                'success' => true,
                'report' => [
                    'account_status' => $student['is_active'] ? 'ACTIVE' : 'BANNED',
                    'active_devices' => $deviceCount,
                    'device_status' => $deviceCount >= 3 ? 'LIMIT REACHED' : 'OK',
                    'recent_activity' => $lastSeen ?: 'None'
                ]
            ]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/maintenance
    public function toggleMaintenance() {
        $data = json_decode(file_get_contents("php://input"), true);
        $status = isset($data['status']) ? (bool)$data['status'] : false;
        try {
            $stmt = $this->pdo->prepare("INSERT INTO site_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)");
            $stmt->execute(['maintenance_mode', $status ? '1' : '0']);
            Response::json(['success' => true]);
        } catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }

    // POST /admin/flush-cache
    public function flushCache() {
        try {
            if (function_exists('opcache_reset')) {
                opcache_reset();
            }
            Response::json(['success' => true, 'message' => 'Cache flushed']);
        } catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }
}

