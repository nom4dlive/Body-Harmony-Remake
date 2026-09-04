<?php
// api/v1/Controllers/AnalyticsController.php

require_once __DIR__ . '/../libs/LoggerService.php';

class AnalyticsController {
    private $db;
    private $logger;

    public function __construct() {
        global $pdo;
        $this->db = $pdo;
        $this->logger = new LoggerService($pdo);
    }

    /**
     * Get recent access logs (Paginated)
     * GET /admin/analytics/logs?page=1&limit=50
     */
    public function getLogs() {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = ($page - 1) * $limit;

        $stmt = $this->db->prepare("
            SELECT 
                l.*, 
                COALESCE(s.name, a.username, 'Ghost') as student_name,
                COALESCE(s.email, a.email) as email
            FROM lms_access_logs l
            LEFT JOIN licenciadas s ON l.licenciada_id = s.id
            LEFT JOIN admin_users a ON l.admin_id = a.id
            ORDER BY l.created_at DESC 
            LIMIT ? OFFSET ?
        ");
        
        // Bind parameters safely 
        // Note: PDO LIMIT/OFFSET usually require integer binding or strict mode off
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Decode metadata
        foreach ($logs as &$log) {
            if ($log['metadata']) {
                $log['metadata'] = json_decode($log['metadata'], true);
            }
        }

        Response::json(['data' => $logs, 'page' => $page, 'limit' => $limit]);
    }

    /**
     * Get Security Alerts (Multi-IP Users)
     * GET /admin/analytics/alerts
     */
    public function getSecurityAlerts() {
        // V57: Usa licenciada_devices como sinal de compartilhamento
        // Ignora IPv6 (CGNAT / privacidade iOS) para eliminar falsos positivos
        // V82 FIX: SQL estava raw sem wrapper de query
        $stmt = $this->db->query("
            SELECT 
                d.licenciada_id,
                COUNT(DISTINCT d.device_token) as device_count,
                COUNT(DISTINCT CASE WHEN d.ip_address NOT LIKE '%:%' THEN d.ip_address END) as ipv4_count,
                GROUP_CONCAT(DISTINCT CASE WHEN d.ip_address NOT LIKE '%:%' THEN d.ip_address END ORDER BY d.ip_address SEPARATOR ', ') as ipv4_list
            FROM licenciada_devices d
            JOIN licenciadas l ON d.licenciada_id = l.id
            WHERE d.last_used_at > DATE_SUB(NOW(), INTERVAL 72 HOUR)
              AND l.is_tester = 0
            GROUP BY d.licenciada_id
            HAVING device_count > 3 OR ipv4_count > 2
        ");
        $suspicious = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $alerts = [];
        foreach ($suspicious as $s) {
            $stmtDetails = $this->db->prepare("SELECT id, name, email, whatsapp FROM licenciadas WHERE id = ?");
            $stmtDetails->execute([$s['licenciada_id']]);
            $student = $stmtDetails->fetch(PDO::FETCH_ASSOC);
            if (!$student) continue;
            
            $alerts[] = [
                'licenciada'   => $student,
                'ip_count'     => (int)$s['ipv4_count'],
                'device_count' => (int)$s['device_count'],
                'ips'          => $s['ipv4_list'],
                'risk_level'   => $s['device_count'] > 5 ? 'CRITICAL' : 'HIGH'
            ];
        }

        Response::json(['alerts' => $alerts]);
    }
    
    /**
     * Get Dashboard Stats
     * GET /admin/analytics/stats
     */
    public function getStats() {
        // 1. Active Users (Last 7 Days)
        $stmtActive = $this->db->query("
            SELECT COUNT(DISTINCT licenciada_id) 
            FROM lms_access_logs 
            WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        ");
        $activeUsers = $stmtActive->fetchColumn();

        // 2. Total Certificates Issued
        $stmtCerts = $this->db->query("SELECT COUNT(*) FROM lms_certificates");
        $totalCerts = $stmtCerts->fetchColumn();

        // 3. Total Lessons Completed
        $stmtCompleted = $this->db->query("SELECT COUNT(*) FROM lms_progress WHERE is_completed = 1");
        $totalCompleted = $stmtCompleted->fetchColumn();

        Response::json([
            'active_users_7d' => $activeUsers,
            'total_certificates' => $totalCerts,
            'lessons_completed' => $totalCompleted
        ]);
    }

    /**
     * Watchtower - Comprehensive Analytics Dashboard
     * GET /admin/analytics/watchtower
     */
    public function watchtower() {
        try {
            // 1. Active Users (Last 24h, 7d, 30d)
            $stmt24h = $this->db->query("
                SELECT COUNT(DISTINCT licenciada_id) 
                FROM lms_access_logs 
                WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ");
            $active24h = $stmt24h->fetchColumn();

            $stmt7d = $this->db->query("
                SELECT COUNT(DISTINCT licenciada_id) 
                FROM lms_access_logs 
                WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            ");
            $active7d = $stmt7d->fetchColumn();

            $stmt30d = $this->db->query("
                SELECT COUNT(DISTINCT licenciada_id) 
                FROM lms_access_logs 
                WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
            ");
            $active30d = $stmt30d->fetchColumn();

            // 2. Total Licenciadas
            $stmtTotal = $this->db->query("SELECT COUNT(*) FROM licenciadas WHERE is_active = 1");
            $totalStudents = $stmtTotal->fetchColumn();

            // 3. Lessons Completed (Total)
            $stmtCompleted = $this->db->query("SELECT COUNT(*) FROM lms_progress WHERE is_completed = 1");
            $lessonsCompleted = $stmtCompleted->fetchColumn();

            // 4. Average Progress
            $stmtAvgProgress = $this->db->query("SELECT AVG(progress_percent) FROM lms_progress");
            $avgProgress = round($stmtAvgProgress->fetchColumn() ?: 0, 2);

            // 5. Recent Activity (Last 10 events)
            $stmtActivity = $this->db->prepare("
                SELECT 
                    l.*, 
                    COALESCE(s.name, a.username, 'Ghost') as student_name 
                FROM lms_access_logs l
                LEFT JOIN licenciadas s ON l.licenciada_id = s.id
                LEFT JOIN admin_users a ON l.admin_id = a.id
                ORDER BY l.created_at DESC 
                LIMIT 10
            ");
            $stmtActivity->execute();
            $recentActivity = $stmtActivity->fetchAll(PDO::FETCH_ASSOC);

            // 6. Top Licenciadas (Most lessons completed)
            $stmtTop = $this->db->query("
                SELECT s.name, s.instagram, COUNT(p.id) as completed_count
                FROM licenciadas s
                JOIN lms_progress p ON s.id = p.licenciada_id
                WHERE p.is_completed = 1
                GROUP BY s.id, s.name, s.instagram
                ORDER BY completed_count DESC
                LIMIT 5
            ");
            $topStudents = $stmtTop->fetchAll(PDO::FETCH_ASSOC);

            // 7. Security Alerts V57 — JOIN único (elimina N+1 queries)
            $stmtAlerts = $this->db->query("
                SELECT 
                    d.licenciada_id,
                    l.id, l.name,
                    COUNT(DISTINCT d.device_token) as device_count,
                    COUNT(DISTINCT CASE WHEN d.ip_address NOT LIKE '%:%' THEN d.ip_address END) as ipv4_count,
                    GROUP_CONCAT(DISTINCT CASE WHEN d.ip_address NOT LIKE '%:%' THEN d.ip_address END ORDER BY d.ip_address SEPARATOR ', ') as ips
                FROM licenciada_devices d
                INNER JOIN licenciadas l ON l.id = d.licenciada_id
                WHERE d.last_used_at > DATE_SUB(NOW(), INTERVAL 72 HOUR)
                  AND l.is_tester = 0
                GROUP BY d.licenciada_id, l.id, l.name
                HAVING device_count > 3 OR ipv4_count > 2
                LIMIT 20
            ");
            $suspicious = $stmtAlerts->fetchAll(PDO::FETCH_ASSOC);

            $alertsDetail = [];
            foreach ($suspicious as $s) {
                $alertsDetail[] = [
                    'licenciada_id' => $s['licenciada_id'],
                    'name'          => $s['name'],
                    'ip_count'      => (int)$s['ipv4_count'],
                    'device_count'  => (int)$s['device_count'],
                    'ips'           => $s['ips'],
                    'risk_level'    => $s['device_count'] > 5 ? 'CRITICAL' : 'HIGH'
                ];
            }

            Response::json([
                'success' => true,
                'metrics' => [
                    'active_users' => [
                        'last_24h' => (int)$active24h,
                        'last_7d' => (int)$active7d,
                        'last_30d' => (int)$active30d
                    ],
                    'total_licenciadas' => (int)$totalStudents,
                    'lessons_completed' => (int)$lessonsCompleted,
                    'avg_progress' => (float)$avgProgress
                ],
                'recent_activity' => $recentActivity,
                'top_licenciadas' => $topStudents,
                'security_alerts' => $alertsDetail,
                'alert_count' => count($alertsDetail)
            ]);
        } catch (Exception $e) {
            Response::error('Watchtower Error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Bot Support Stats — Staging / Conversion Funnel
     * GET /admin/analytics/bot-stats
     * V95 — Cache 60s. Graceful fallback se tabela ausente.
     */
    public function getBotStats() {
        try {
            // Verifica se a tabela existe antes de consultar
            $tableCheck = $this->db->query(
                "SELECT COUNT(*) FROM information_schema.tables
                 WHERE table_schema = DATABASE()
                 AND table_name = 'bot_cadastro_staging'"
            );
            if (!$tableCheck || (int)$tableCheck->fetchColumn() === 0) {
                Response::json([
                    'pending'  => 0,
                    'approved' => 0,
                    'rejected' => 0,
                    'total'    => 0,
                    'source'   => 'table_not_found'
                ]);
                return;
            }

            $stmt = $this->db->query(
                "SELECT status, COUNT(*) as total
                 FROM bot_cadastro_staging
                 GROUP BY status"
            );
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $stats = ['pending' => 0, 'approved' => 0, 'rejected' => 0];
            foreach ($rows as $row) {
                $key = strtolower($row['status']);
                if (isset($stats[$key])) {
                    $stats[$key] = (int)$row['total'];
                }
            }
            $stats['total'] = array_sum($stats);
            $stats['source'] = 'bot_cadastro_staging';

            Response::json($stats);
        } catch (Exception $e) {
            // Fallback silencioso — nunca derruba o Dashboard
            Response::json([
                'pending'  => 0,
                'approved' => 0,
                'rejected' => 0,
                'total'    => 0,
                'source'   => 'error',
                'error'    => $e->getMessage()
            ]);
        }
    }

    /**
     * War Room - Deep Analytics
     * GET /admin/analytics/war-room
     */
    public function warRoom() {
        try {
            $response = [];

            // 1. DAU (Last 30 Days)
            $stmt = $this->db->query("
                SELECT 
                    DATE(created_at) as date, 
                    COUNT(DISTINCT licenciada_id) as active_users 
                FROM lms_access_logs 
                WHERE created_at >= NOW() - INTERVAL 30 DAY 
                GROUP BY DATE(created_at) 
                ORDER BY date ASC
            ");
            $response['dau'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 2. Device Stats
            $stmt = $this->db->query("SELECT user_agent FROM licenciada_devices");
            $devices = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $stats = ['Mobile' => 0, 'Desktop' => 0, 'Tablet' => 0];
            foreach ($devices as $d) {
                $d = strtolower($d);
                if (strpos($d, 'android') !== false || strpos($d, 'iphone') !== false) {
                    $stats['Mobile']++;
                } elseif (strpos($d, 'ipad') !== false) {
                    $stats['Tablet']++;
                } else {
                    $stats['Desktop']++;
                }
            }
            $response['devices'] = [
                ['name' => 'Mobile', 'value' => $stats['Mobile']],
                ['name' => 'Desktop', 'value' => $stats['Desktop']],
                ['name' => 'Tablet', 'value' => $stats['Tablet']]
            ];

            // 3. Churn Risk (Inactive > 15 Days)
            $stmt = $this->db->query("
                SELECT id, name, instagram, whatsapp 
                FROM licenciadas 
                WHERE is_active = 1 
                AND id NOT IN (
                    SELECT DISTINCT licenciada_id 
                    FROM lms_access_logs 
                    WHERE created_at >= NOW() - INTERVAL 15 DAY
                )
                LIMIT 50
            ");
            $response['churn_risk'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::json($response);

        } catch (Exception $e) {
            Response::error('War Room Error: ' . $e->getMessage(), 500);
        }
    }
}
