<?php
// apps/web-app/src/backend/api/v1/Core/NexusLogger.php

class NexusLogger {
    private static $pdo = null;

    /**
     * Initialize with PDO connection
     */
    public static function init($pdo) {
        self::$pdo = $pdo;
    }

    /**
     * Log a system or security event
     * 
     * @param string $action Categorized action (e.g., 'SYSTEM_ERROR', 'AUTH_FAILED')
     * @param string $description Human readable description
     * @param array $details Extra JSON data for debugging
     * @param string $userType 'system', 'admin', or 'student'
     * @param int $userId ID of the actor
     * @param string $severity 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
     */
    public static function log($action, $description, $details = [], $userType = 'system', $userId = 0, $severity = null) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $jsonDetails = !empty($details) ? json_encode($details, JSON_UNESCAPED_UNICODE) : null;

        // Auto-determine severity if not provided
        if (!$severity) {
            if (strpos($action, 'ERROR') !== false || strpos($action, 'EXCEPTION') !== false) {
                $severity = 'ERROR';
            } elseif (strpos($action, 'FAILED') !== false || strpos($action, 'BREACH') !== false) {
                $severity = 'WARNING';
            } else {
                $severity = 'INFO';
            }
        }

        // 1. Database Logging (Primary)
        if (self::$pdo) {
            try {
                // Sanitize sensitive data in details
                $cleanDetails = $details;
                $sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'authorization'];
                
                if (is_array($cleanDetails)) {
                    array_walk_recursive($cleanDetails, function(&$value, $key) use ($sensitiveKeys) {
                        if (in_array(strtolower($key), $sensitiveKeys)) {
                            $value = '***REDACTED***';
                        }
                    });
                }
                $jsonDetails = !empty($cleanDetails) ? json_encode($cleanDetails, JSON_UNESCAPED_UNICODE) : null;

                $stmt = self::$pdo->prepare("
                    INSERT INTO audit_logs (action, severity, description, details, user_id, user_type, ip_address, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                ");
                $stmt->execute([$action, $severity, $description, $jsonDetails, $userId, $userType, $ip]);
            } catch (Exception $e) {
                // Fail silently to file log if DB fails
                self::logToFile("DB_LOG_FAILURE: " . $e->getMessage() . " | Original Action: $action");
            }
        }

        // 2. File Logging (Backup/Redundancy)
        $logMsg = sprintf("[%s] [%s] [%s] [%s] %s %s", 
            date('Y-m-d H:i:s'), 
            strtoupper($severity),
            strtoupper($userType), 
            $action, 
            $description, 
            $jsonDetails ? "| Details: $jsonDetails" : ""
        );
        self::logToFile($logMsg);
    }

    /**
     * Log to a physical file (nexus_system.log)
     */
    private static function logToFile($message) {
        $logDir = defined('LOGS_DIR') ? LOGS_DIR : (dirname(__FILE__, 6) . '/logs');
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }
        $logFile = $logDir . '/nexus_system.log';
        @file_put_contents($logFile, $message . PHP_EOL, FILE_APPEND);
    }

    /**
     * Global Error Handler
     */
    public static function handleError($errno, $errstr, $errfile, $errline) {
        if (!(error_reporting() & $errno)) return false;

        $severity = 'ERROR';
        switch ($errno) {
            case E_USER_ERROR: $severity = 'CRITICAL'; break;
            case E_USER_WARNING: case E_WARNING: $severity = 'WARNING'; break;
            case E_USER_NOTICE: case E_NOTICE: $severity = 'NOTICE'; break;
        }

        self::log("PHP_$severity", "Error $errno: $errstr in $errfile on line $errline", [
            'file' => $errfile,
            'line' => $errline,
            'code' => $errno
        ]);

        return false; // Continue to standard handle
    }

    /**
     * Global Exception Handler
     */
    public static function handleException($exception) {
        self::log('PHP_EXCEPTION', $exception->getMessage(), [
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ]);
        
        // Ensure JSON response for API robustness
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json');
        }
        
        echo json_encode([
            'success' => false, 
            'error' => 'Nexus Exception: ' . $exception->getMessage(),
            'file' => (getenv('APP_ENV') !== 'production') ? $exception->getFile() : null,
            'line' => (getenv('APP_ENV') !== 'production') ? $exception->getLine() : null
        ]);
        exit;
    }
}
