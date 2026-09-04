<?php
// api/v1/Controllers/LgpdController.php

class LgpdController {
    private $db;

    public function __construct() {
        global $pdo;
        $this->db = $pdo;
    }

    /**
     * POST /lgpd/consent
     * Records or revokes consent for a specific policy.
     */
    public function recordConsent() {
        global $loggedUser;
        if (!$loggedUser) Response::error('Unauthorized', 401);

        $data = json_decode(file_get_contents('php://input'), true);
        $policyType = $data['policy'] ?? null;
        $action = $data['action'] ?? null;
        $version = $data['version'] ?? 'v1.0';
        $meta = $data['meta'] ?? [];

        if (!in_array($policyType, ['terms', 'privacy', 'data_processing', 'ai_usage'])) {
            Response::error('Invalid policy type', 400);
        }
        if (!in_array($action, ['accepted', 'revoked'])) {
            Response::error('Invalid action', 400);
        }

        try {
            // 1. Determine Target Table
            $isAdmin = !empty($loggedUser['is_admin']);
            $tableName = $isAdmin ? 'admin_users' : 'licenciadas';
            $userId = $loggedUser['id'];

            // 2. Fetch current status
            $stmtS = $this->db->prepare("SELECT lgpd_status FROM $tableName WHERE id = ?");
            $stmtS->execute([$userId]);
            
            $statusRaw = $stmtS->fetchColumn();
            $currentStatus = $statusRaw ? json_decode($statusRaw, true) : [];
            if (!is_array($currentStatus)) $currentStatus = [];
            
            // 3. Update flag
            $currentStatus[$policyType] = ($action === 'accepted');
            $currentStatus['last_updated'] = time();

            // 4. Persist
            $stmtU = $this->db->prepare("UPDATE $tableName SET lgpd_status = ? WHERE id = ?");
            $stmtU->execute([json_encode($currentStatus), $userId]);

            // 5. Log Consent
            try {
                $stmtLog = $this->db->prepare("
                    INSERT INTO lgpd_consent_logs 
                    (licenciada_id, consent_version, ip_address, user_agent, policy_type, action, meta_data) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                
                $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
                $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
                
                // For admins, we use negative ID to distinguish in logs if needed, or stick to real ID
                $logId = $isAdmin ? (-1 * $userId) : $userId;

                $stmtLog->execute([
                    $logId, 
                    $version, 
                    $ip, 
                    $ua, 
                    $policyType, 
                    $action, 
                    json_encode(array_merge($meta, ['is_admin' => $isAdmin]))
                ]);
            } catch (Exception $logEx) {
                error_log("LGPD Log Warning: " . $logEx->getMessage());
            }

            Response::json(['success' => true, 'status' => $currentStatus]);

        } catch (Exception $e) {
            Response::error('Failed to record consent: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /lgpd/status
     * Returns the merged consent status for the logged user.
     */
    public function getStatus() {
        global $loggedUser;
        if (!$loggedUser) Response::error('Unauthorized', 401);

        try {
            $isAdmin = !empty($loggedUser['is_admin']);
            $tableName = $isAdmin ? 'admin_users' : 'licenciadas';
            $userId = $loggedUser['id'];

            $stmt = $this->db->prepare("SELECT lgpd_status FROM $tableName WHERE id = ?");
            $stmt->execute([$userId]);
            $rawStatus = $stmt->fetchColumn();
            $status = $rawStatus ? json_decode($rawStatus, true) : [];

            // Default values
            $defaults = [
                'terms' => false,
                'privacy' => false,
                'ai_usage' => false
            ];

            Response::json(array_merge($defaults, (array)$status));
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /lgpd/terms
     * Static terms content.
     */
    public function getTerms() {
        $terms = [
            'version' => 'v1.0',
            'effective_date' => '2026-02-18',
            'content' => [
                'terms' => "Termos de Uso do Body Harmony...",
                'privacy' => "Política de Privacidade...",
                'ai_usage' => "Consentimento para uso de Inteligência Artificial (Doctor Harmony)..."
            ]
        ];

        Response::json($terms);
    }
}
