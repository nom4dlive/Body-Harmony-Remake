<?php
// apps/web-app/src/backend/api/v1/Controllers/NexusDashboardController.php

class NexusDashboardController {
    
    private $db;

    public function __construct() {
        global $pdo;
        $this->db = $pdo;
    }

    public function getSystemStatus() {
        try {
            // 1. Measure DB Latency
            $start = microtime(true);
            $this->db->query("SELECT 1");
            $dbLatencyMs = round((microtime(true) - $start) * 1000, 2);

            // 2. Active Sessions (Admins currently online)
            $activeSessions = 0;
            if ($this->tableExists('admin_sessions')) {
                $activeSessions = (int)$this->db->query("
                    SELECT COUNT(*) 
                    FROM admin_sessions 
                    WHERE expires_at > NOW()
                ")->fetchColumn();
            }

            // 3. Error Rate (Last 1 Hour)
            $errorRate = 0;
            if ($this->tableExists('audit_logs')) {
                $errorRate = (int)$this->db->query("
                    SELECT COUNT(*) 
                    FROM audit_logs 
                    WHERE severity = 'error' 
                    AND created_at >= NOW() - INTERVAL 1 HOUR
                ")->fetchColumn();
            }

            // 4. Disk Space
            $diskFree = @disk_free_space(__DIR__) ?: 0;
            $diskTotal = @disk_total_space(__DIR__) ?: 1;
            $diskUsed = $diskTotal - $diskFree;

            // 5. Determine System Status
            $status = 'operational';
            if ($dbLatencyMs > 100 || $errorRate > 10) {
                $status = 'degraded';
            }

            // 6. Response with metrics object (Frontend expects this structure)
            Response::json([
                'success' => true,
                'status' => $status,
                'metrics' => [
                    'active_sessions' => $activeSessions,
                    'db_latency_ms' => $dbLatencyMs,
                    'disk_free_space' => (int)$diskFree,  // In bytes
                    'php_version' => phpversion(),
                    'error_rate_1h' => $errorRate
                ],
                // Additional fields for compatibility
                'uptime' => shell_exec('uptime -p') ?: 'Uptime unavailable',
                'disk' => [
                    'total_gb' => round($diskTotal / 1073741824, 2),
                    'used_gb' => round($diskUsed / 1073741824, 2),
                    'free_gb' => round($diskFree / 1073741824, 2),
                    'usage_percent' => round(($diskUsed / $diskTotal) * 100, 2) . '%'
                ],
                'memory' => [
                    'used_mb' => round(memory_get_usage(true) / 1048576, 2),
                    'limit' => ini_get('memory_limit')
                ]
            ]);

        } catch (Exception $e) {
            Response::error('Failed to get system status: ' . $e->getMessage(), 500);
        }
    }

    public function getSecurityMetrics() {
        try {
            // 2. Blocked IPs
            $blockedIps = 0;
            if ($this->tableExists('lms_access_logs')) {
                 $stmt = $this->db->query("SELECT COUNT(DISTINCT ip_address) as count FROM lms_access_logs WHERE action = 'block_ip' AND created_at >= NOW() - INTERVAL 24 HOUR");
                 $blockedIps = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            }

            // 3. Failed Logins & Suspicious
            $failedLogins = 0;
            $suspiciousIps = 0;
            $recentAlerts = [];

            if ($this->tableExists('auth_logs')) {
                $failedLogins = $this->db->query("SELECT COUNT(*) FROM auth_logs WHERE status != 'success' AND created_at >= NOW() - INTERVAL 24 HOUR")->fetchColumn();
                
                $suspiciousIps = $this->db->query("
                    SELECT COUNT(DISTINCT ip_address) 
                    FROM auth_logs 
                    WHERE status != 'success' 
                    AND created_at >= NOW() - INTERVAL 24 HOUR 
                    GROUP BY ip_address 
                    HAVING COUNT(*) > 5
                ")->rowCount();

                // Auth Alerts (Last 10)
                $stmt = $this->db->query("
                    SELECT a.email, a.ip_address, a.status, a.risk_score, a.risk_details, a.created_at, s.name as student_name 
                    FROM auth_logs a
                    LEFT JOIN licenciadas s ON 
                        s.email COLLATE utf8mb4_unicode_ci = a.email COLLATE utf8mb4_unicode_ci 
                        OR s.cpf COLLATE utf8mb4_unicode_ci = a.email COLLATE utf8mb4_unicode_ci 
                        OR s.username COLLATE utf8mb4_unicode_ci = a.email COLLATE utf8mb4_unicode_ci
                    ORDER BY a.created_at DESC 
                    LIMIT 20
                ");
                $recentAlerts = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Map status to success boolean for frontend Watchtower
                foreach ($recentAlerts as &$alert) {
                    $alert['success'] = ($alert['status'] === 'success');
                    $alert['risk_details_parsed'] = json_decode($alert['risk_details'] ?? '[]', true);
                    
                    // Enhancement: Add licensee name for better context in WarRoom
                    if (!empty($alert['student_name'])) {
                        $alert['email'] = $alert['student_name'] . ' (' . $alert['email'] . ')';
                    }
                }
            }

            // 4. Sessions
            $activeAdmins = 0;
            if ($this->tableExists('admin_sessions')) {
                $activeAdmins = $this->db->query("SELECT COUNT(*) FROM admin_sessions WHERE expires_at > NOW()")->fetchColumn();
            }
            
            // 4b. Admin Logins (Last 24h) - FIXED: Should count actual logins, not sessions
            $adminLogins24h = 0;
            if ($this->tableExists('audit_logs')) {
                $adminLogins24h = (int)$this->db->query("
                    SELECT COUNT(DISTINCT user_id) 
                    FROM audit_logs 
                    WHERE action = 'ADMIN_LOGIN' 
                    AND created_at >= NOW() - INTERVAL 1 DAY
                ")->fetchColumn();
            }
            
            // Count active licenciadas via devices
            $activeStudents = 0;
            if ($this->tableExists('licenciada_devices')) {
                 $activeStudents = $this->db->query("SELECT COUNT(*) FROM licenciada_devices WHERE last_used_at >= NOW() - INTERVAL 1 HOUR")->fetchColumn();
            }

            Response::json([
                'success' => true,
                'metrics' => [ // Legacy support
                    'failed_logins_24h' => (int)$failedLogins,
                    'suspicious_ips' => (int)$suspiciousIps,
                    'admin_logins_24h' => (int)$adminLogins24h,  // ✅ FIXED: Now uses actual login count
                    'waf_status' => 'active' 
                ],
                // Structure expected by WarRoom Dashboard
                'threats' => [
                    'failed_logins_24h' => (int)$failedLogins,
                    'blocked_ips_24h' => (int)$blockedIps,
                    'suspicious_activities' => (int)$suspiciousIps
                ],
                'sessions' => [
                    'active_admins' => (int)$activeAdmins,
                    'active_students' => (int)$activeStudents,
                    'total_active' => (int)($activeAdmins + $activeStudents)
                ],
                'deployment' => [
                    'last_deploy' => '2026-02-09 14:00', // Placeholder or read from file
                    'environment' => 'Production' // or Development
                ],
                'auth_alerts' => $recentAlerts
            ]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    private function tableExists($table) {
        try {
            $stmt = $this->db->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$table]);
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }
}
