<?php
// api/v1/Controllers/BroadcastController.php

class BroadcastController {
    private $db;

    public function __construct() {
        global $pdo;
        $this->db = $pdo;
    }

    /**
     * GET /admin/broadcasts
     * List all broadcasts
     */
    public function index() {
        try {
            $stmt = $this->db->query("SELECT * FROM system_broadcasts ORDER BY created_at DESC");
            $broadcasts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::json(['all_broadcasts' => $broadcasts]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /v1/broadcasts/active
     * Public/Student endpoint for active broadcasts filtered by role and read status
     */
    public function getActive() {
        try {
            global $loggedUser;
            if (!$loggedUser) {
                Response::json(['broadcasts' => []]);
                return;
            }

            $userId = $loggedUser['id'];
            $userRole = strtolower($loggedUser['role'] ?? 'licenciada');

            // Retorna apenas os NÃO LIDOS para banners/modais
            $sql = "SELECT b.* 
                    FROM system_broadcasts b
                    LEFT JOIN system_broadcast_logs bl ON bl.broadcast_id = b.id AND bl.user_id = ? AND bl.user_type = ?
                    WHERE b.is_active = 1 
                    AND bl.id IS NULL
                    ORDER BY b.created_at DESC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$userId, $userRole]);
            $all = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $filtered = array_filter($all, function($b) use ($userRole) {
                if (empty($b['target_roles'])) return true;
                $roles = json_decode($b['target_roles'], true);
                if (!is_array($roles)) return true;
                return in_array($userRole, $roles);
            });

            Response::json(['broadcasts' => array_values($filtered)]);
        } catch (Exception $e) {
            Response::json(['broadcasts' => []]);
        }
    }

    /**
     * GET /v1/broadcasts/history
     * Returns personal history of signals (last 30)
     */
    public function getHistory() {
        try {
            global $loggedUser;
            if (!$loggedUser) {
                Response::json(['history' => []]);
                return;
            }

            $userId = $loggedUser['id'];
            $userRole = strtolower($loggedUser['role'] ?? 'licenciada');

            // Retorna lidos e não lidos (limit 30)
            $sql = "SELECT b.*, (bl.id IS NOT NULL) as is_read
                    FROM system_broadcasts b
                    LEFT JOIN system_broadcast_logs bl ON bl.broadcast_id = b.id AND bl.user_id = ? AND bl.user_type = ?
                    WHERE b.is_active = 1 
                    ORDER BY b.created_at DESC
                    LIMIT 30";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$userId, $userRole]);
            $all = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $filtered = array_filter($all, function($b) use ($userRole) {
                if (empty($b['target_roles'])) return true;
                $roles = json_decode($b['target_roles'], true);
                if (!is_array($roles)) return true;
                return in_array($userRole, $roles);
            });

            Response::json(['history' => array_values($filtered)]);
        } catch (Exception $e) {
            Response::json(['history' => []]);
        }
    }

    /**
     * POST /v1/broadcasts/acknowledge
     * Mark a broadcast as read by the user
     */
    public function acknowledge() {
        global $loggedUser;
        if (!$loggedUser) Response::error('Unauthorized', 401);

        $input = json_decode(file_get_contents('php://input'), true);
        $broadcastId = $input['id'] ?? 0;
        $userId = $loggedUser['id'];
        $userType = strtolower($loggedUser['role'] ?? 'licenciada');

        if (!$broadcastId) Response::error('ID Required', 400);

        try {
            $stmt = $this->db->prepare("INSERT IGNORE INTO system_broadcast_logs (broadcast_id, user_id, user_type) VALUES (?, ?, ?)");
            $stmt->execute([$broadcastId, $userId, $userType]);
            Response::json(['success' => true]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /admin/broadcasts
     * Create or Toggle broadcast
     */
    public function manage() {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        try {
            if ($action === 'create') {
                $msg = $input['message'] ?? '';
                $title = $input['title'] ?? null;
                $type = $input['type'] ?? 'info';
                $targetRoles = isset($input['target_roles']) ? json_encode($input['target_roles']) : null;
                $targetLevels = isset($input['target_levels']) ? json_encode($input['target_levels']) : null;
                $isBlocking = $input['is_blocking'] ?? 0;
                
                if (!$msg) throw new Exception('Message required');

                $stmt = $this->db->prepare("INSERT INTO system_broadcasts (title, message, type, target_roles, target_levels, is_blocking) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$title, $msg, $type, $targetRoles, $targetLevels, $isBlocking]);
                Response::json(['success' => true]);

            } elseif ($action === 'toggle') {
                $id = $input['id'] ?? 0;
                $stmt = $this->db->prepare("UPDATE system_broadcasts SET is_active = NOT is_active WHERE id = ?");
                $stmt->execute([$id]);
                Response::json(['success' => true]);

            } else {
                Response::error('Invalid Action', 400);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * DELETE /admin/broadcasts/{id}
     */
    public function delete($id) {
        try {
            $this->db->beginTransaction();
            
            // Delete logs first
            $stmtLogs = $this->db->prepare("DELETE FROM system_broadcast_logs WHERE broadcast_id = ?");
            $stmtLogs->execute([$id]);

            $stmt = $this->db->prepare("DELETE FROM system_broadcasts WHERE id = ?");
            $stmt->execute([$id]);

            $this->db->commit();
            Response::json(['success' => true]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }
}
