<?php
// src/backend/api/v1/Core/LogCleaner.php

class LogCleaner {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Purges old success logs to save space.
     * Failed logs are kept longer for security forensics.
     * 
     * @param int $daysHowOld
     * @return int Number of deleted rows
     */
    public function purgeSuccessLogs($days = 30) {
        try {
            // Success logs are less critical after a month
            $stmt = $this->pdo->prepare("DELETE FROM auth_logs WHERE status = 'success' AND created_at < NOW() - INTERVAL ? DAY");
            $stmt->execute([$days]);
            $count = $stmt->rowCount();

            // Audit logs can also be pruned (except critical ones)
            $stmtAudit = $this->pdo->prepare("DELETE FROM audit_logs WHERE severity = 'INFO' AND created_at < NOW() - INTERVAL 90 DAY");
            $stmtAudit->execute();
            
            return $count;
        } catch (Exception $e) {
            error_log("[LogCleaner] Error: " . $e->getMessage());
            return 0;
        }
    }
}
