<?php
// Controllers/BarracksController.php

class BarracksController {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    // GET /api/v1/admin/users
    public function getUsers() {
        try {
            $stmt = $this->pdo->query("
                SELECT
                    l.id,
                    l.name,
                    l.instagram,
                    l.whatsapp,
                    l.is_active AS active,
                    l.last_login_at AS last_seen,
                    l.force_password_change,
                    l.cpf,
                    l.state,
                    l.max_devices,
                    l.is_tester,
                    l.failed_login_attempts,
                    l.locked_until,
                    COUNT(CASE WHEN ld.is_active = 1 THEN ld.id END) AS device_count
                FROM licenciadas l
                LEFT JOIN licenciada_devices ld ON ld.licenciada_id = l.id
                GROUP BY 
                    l.id, l.name, l.instagram, l.whatsapp, l.is_active, 
                    l.last_login_at, l.force_password_change, l.cpf, 
                    l.state, l.max_devices, l.is_tester, l.failed_login_attempts, l.locked_until
                ORDER BY l.name ASC
            ");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::json(['success' => true, 'users' => $users]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /api/v1/admin/users — action dispatcher
    public function manageUser() {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';
        $userId = $input['user_id'] ?? null;

        try {
            switch ($action) {
                case 'ban':
                    $this->pdo->prepare("UPDATE licenciadas SET is_active = 0 WHERE id = ?")->execute([$userId]);
                    Response::json(['success' => true, 'message' => 'Usuária banida.']);
                    break;

                case 'unban':
                    $this->pdo->prepare("UPDATE licenciadas SET is_active = 1 WHERE id = ?")->execute([$userId]);
                    Response::json(['success' => true, 'message' => 'Acesso restaurado.']);
                    break;

                case 'clear_devices':
                    $this->pdo->prepare("DELETE FROM licenciada_devices WHERE licenciada_id = ?")->execute([$userId]);
                    Response::json(['success' => true, 'message' => 'Dispositivos removidos.']);
                    break;
                
                case 'toggle_tester':
                    $current = $this->pdo->prepare("SELECT is_tester FROM licenciadas WHERE id = ?");
                    $current->execute([$userId]);
                    $newVal = $current->fetchColumn() ? 0 : 1;
                    $this->pdo->prepare("UPDATE licenciadas SET is_tester = ? WHERE id = ?")->execute([$newVal, $userId]);
                    Response::json(['success' => true, 'message' => $newVal ? 'Conta marcada como TESTER.' : 'Flag TESTER removida.']);
                    break;

                case 'reset_lifecycle':
                    if (!empty($input['force_password'])) {
                        $defaultHash = '$2y$12$luoClyG.xSRedqjR//w94O/W7ei50nf371shSMVUcYZVlryUyvYWC'; // Mudar123!
                        $this->pdo->prepare("UPDATE licenciadas SET force_password_change = 1, password_hash = ? WHERE id = ?")
                            ->execute([$defaultHash, $userId]);
                    }
                    if (!empty($input['revoke_lgpd'])) {
                        // V41: lgpd_status is the current column
                        $this->pdo->prepare("UPDATE licenciadas SET lgpd_status = NULL WHERE id = ?")->execute([$userId]);
                    }
                    if (!empty($input['clear_devices'])) {
                        $this->pdo->prepare("DELETE FROM licenciada_devices WHERE licenciada_id = ?")->execute([$userId]);
                    }
                    if (!empty($input['clear_throttling'])) {
                        $this->pdo->prepare("UPDATE licenciadas SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?")->execute([$userId]);
                    }
                    if (isset($input['max_devices'])) {
                        $this->pdo->prepare("UPDATE licenciadas SET max_devices = ? WHERE id = ?")->execute([(int)$input['max_devices'], $userId]);
                    }
                    Response::json(['success' => true, 'message' => 'Lifecycle resetado.']);
                    break;

                case 'reset_password':
                    $password = $input['password'] ?? '';
                    if (strlen($password) < 6) Response::error('Senha muito curta.', 400);
                    $hash = password_hash($password, PASSWORD_DEFAULT);
                    $this->pdo->prepare("UPDATE licenciadas SET password_hash = ?, force_password_change = 0 WHERE id = ?")
                        ->execute([$hash, $userId]);
                    Response::json(['success' => true, 'message' => 'Senha alterada.']);
                    break;

                case 'delete':
                    $this->pdo->prepare("DELETE FROM licenciada_devices WHERE licenciada_id = ?")->execute([$userId]);
                    $this->pdo->prepare("DELETE FROM licenciadas WHERE id = ?")->execute([$userId]);
                    Response::json(['success' => true, 'message' => 'Usuária removida.']);
                    break;

                default:
                    Response::error('Ação inválida.', 400);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /api/v1/admin/users/check-access
    public function checkAccess() {
        $input = json_decode(file_get_contents('php://input'), true);
        $studentId = $input['student_id'] ?? null;
        if (!$studentId) Response::error('student_id obrigatório.', 400);

        try {
            $stmt = $this->pdo->prepare("SELECT id, name, is_active, force_password_change, last_login_at FROM licenciadas WHERE id = ? LIMIT 1");
            $stmt->execute([$studentId]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$student) Response::error('Licenciada não encontrada.', 404);

            $devStmt = $this->pdo->prepare("SELECT COUNT(*) FROM licenciada_devices WHERE licenciada_id = ? AND is_active = 1");
            $devStmt->execute([$studentId]);
            $activeDevices = (int)$devStmt->fetchColumn();

            Response::json([
                'success' => true,
                'report' => [
                    'account_status' => $student['is_active'] ? 'ACTIVE' : 'BANNED',
                    'active_devices' => $activeDevices,
                    'device_status' => $activeDevices > 0 ? 'OK' : 'NO_DEVICES',
                    'recent_activity' => $student['last_login_at'] ?? 'Never',
                    'force_password' => (bool)$student['force_password_change']
                ]
            ]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // GET /api/v1/admin/admins
    public function getAdmins() {
        try {
            $stmt = $this->pdo->query("SELECT id, username, email, role, created_at FROM admin_users ORDER BY role DESC, username ASC");
            $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::json(['success' => true, 'admins' => $admins]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /api/v1/admin/admins  
    public function manageAdmin() {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        try {
            switch ($action) {
                case 'create':
                    $username = $input['username'] ?? '';
                    $password = $input['password'] ?? '';
                    $role = $input['role'] ?? 'admin';
                    if (!$username || !$password) Response::error('username e password obrigatórios.', 400);
                    $hash = password_hash($password, PASSWORD_DEFAULT);
                    $this->pdo->prepare("INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)")
                        ->execute([$username, $hash, $role]);
                    Response::json(['success' => true, 'message' => 'Admin criado.']);
                    break;

                case 'delete':
                    $id = $input['id'] ?? null;
                    if (!$id) Response::error('id obrigatório.', 400);
                    $this->pdo->prepare("DELETE FROM admin_users WHERE id = ?")->execute([$id]);
                    Response::json(['success' => true, 'message' => 'Admin removido.']);
                    break;

                case 'reset_password':
                    $id = $input['id'] ?? null;
                    $password = $input['password'] ?? '';
                    if (!$id || strlen($password) < 6) Response::error('Dados inválidos.', 400);
                    $hash = password_hash($password, PASSWORD_DEFAULT);
                    $this->pdo->prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?")->execute([$hash, $id]);
                    Response::json(['success' => true, 'message' => 'Senha de admin alterada.']);
                    break;

                default:
                    Response::error('Ação inválida.', 400);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
