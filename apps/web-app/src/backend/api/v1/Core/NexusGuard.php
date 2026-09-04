<?php

class NexusGuard {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function handle() {
        $headers = getallheaders();
        $token = null;

        // 1. Extract Token
        if (isset($headers['Authorization']) && preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            $token = $matches[1];
        }

        if (!$token) {
            Response::error('Nexus Gatekeeper: Token missing', 401);
        }

        // 2. Validate Session
        $stmt = $this->pdo->prepare("
            SELECT u.* 
            FROM admin_sessions s
            JOIN admin_users u ON s.user_id = u.id
            WHERE s.token = ? AND s.expires_at > NOW() AND s.is_active = 1
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            Response::error('Nexus Gatekeeper: Session invalid or expired', 401);
        }

        // 3. Enforce Superadmin (nom4d or role='superadmin')
        // ID 5 is nom4d hardcoded as per project context, or verify role
        if ($user['role'] !== 'superadmin' && $user['id'] != 5) {
            // Log unauthorized attempt
            $this->logBreach($user['id'], $_SERVER['REQUEST_URI']);
            Response::error('Nexus Gatekeeper: Access Denied (Level 5 Required)', 403);
        }

        return $user;
    }

    private function logBreach($userId, $uri) {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $userId, 
                'NEXUS_BREACH_ATTEMPT', 
                "Unauthorized access attempt to $uri", 
                $_SERVER['REMOTE_ADDR'] ?? 'Unknown'
            ]);
        } catch (Exception $e) {
            // Fail silently to avoid exposing errors on breach
        }
    }
}
