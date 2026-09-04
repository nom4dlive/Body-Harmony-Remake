<?php
// api/v1/libs/LoggerService.php

class LoggerService {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Log an event
     * 
     * @param int|null $userId
     * @param string $action 'LOGIN', 'PLAY', 'DOWNLOAD', 'QUIZ_START', 'QUIZ_SUBMIT', 'ADMIN_...'
     * @param array $metadata Key-value pairs of extra info
     * @param bool|string $userType 'licenciada', 'admin', 'system' (legacy true/false accepted)
     */
    public function log($userId, $action, $details = [], $userType = 'licenciada') {
        try {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
            
            // Map legacy Boolean to ENUM
            if ($userType === true) $userType = 'licenciada';
            if ($userType === false) $userType = 'admin';
            if (!$userId) $userType = 'system';

            $licenciada_id = ($userType === 'licenciada') ? $userId : null;
            $admin_id = ($userType === 'admin') ? $userId : null;

            $stmt = $this->pdo->prepare("
                INSERT INTO lms_access_logs 
                (licenciada_id, admin_id, user_type, action, details, ip_address, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([ $licenciada_id, $admin_id, $userType, $action, json_encode($details), $ip ]);

            return true;
        } catch (Exception $e) {
            // Logging should not break the app
            error_log("LoggerService Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get logs for a licenciada (Recent)
     */
    public function getStudentLogs($licenciadaId, $limit = 50) {
        $stmt = $this->pdo->prepare("
            SELECT * FROM lms_access_logs 
            WHERE licenciada_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        ");
        // PDO limit binding quirk workaround or just cast to int in query string if safe
        // Safe binding:
        $stmt->bindValue(1, $licenciadaId, PDO::PARAM_INT);
        $stmt->bindValue(2, (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
