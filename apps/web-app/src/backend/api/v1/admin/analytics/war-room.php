<?php
require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../../Core/Response.php';

// Auth Check
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    Response::error('No token provided', 401);
}

// 1. DAU (30 Days)
$stmt = $pdo->query("
    SELECT 
        DATE(last_used_at) as date,
        COUNT(DISTINCT licenciada_id) as active_users
    FROM licenciada_devices
    WHERE last_used_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(last_used_at)
    ORDER BY date ASC
");
$dau = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 2. Devices Topology
$stmt = $pdo->query("
    SELECT 
        CASE 
            WHEN user_agent LIKE '%Android%' THEN 'Android'
            WHEN user_agent LIKE '%iPhone%' OR user_agent LIKE '%iPad%' THEN 'iOS'
            WHEN user_agent LIKE '%Windows%' THEN 'Windows'
            WHEN user_agent LIKE '%Mac%' THEN 'MacOS'
            ELSE 'Other' 
        END as name,
        COUNT(*) as value
    FROM licenciada_devices
    GROUP BY name
");
$devices = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 3. Churn Risk (> 15 days inactive)
$stmt = $pdo->query("
    SELECT 
        id, name, whatsapp, instagram, last_login_at
    FROM licenciadas
    WHERE last_login_at < DATE_SUB(NOW(), INTERVAL 15 DAY)
       OR last_login_at IS NULL
    ORDER BY last_login_at ASC
    LIMIT 50
");
$churn_risk = $stmt->fetchAll(PDO::FETCH_ASSOC);

Response::json([
    'dau' => $dau,
    'devices' => $devices,
    'churn_risk' => $churn_risk
], 200);
