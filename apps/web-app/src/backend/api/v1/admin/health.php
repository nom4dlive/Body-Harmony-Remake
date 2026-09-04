<?php
// api/v1/admin/health.php
// Server Health Monitoring API

require_once '../../config.php';
require_once '../../cors.php';
require_once '../../auth_check.php'; // Admin Only

header('Content-Type: application/json; charset=utf-8');

try {
    $health = [];
    
    // MySQL Status
    try {
        $stmt = $pdo->query("SELECT VERSION() as version");
        $mysqlVersion = $stmt->fetch(PDO::FETCH_ASSOC)['version'];
        
        $stmt = $pdo->query("SHOW STATUS LIKE 'Uptime'");
        $uptime = $stmt->fetch(PDO::FETCH_ASSOC)['Value'];
        $uptimeDays = floor($uptime / 86400);
        $uptimeHours = floor(($uptime % 86400) / 3600);
        
        $stmt = $pdo->query("SHOW STATUS LIKE 'Threads_connected'");
        $threads = $stmt->fetch(PDO::FETCH_ASSOC)['Value'];
        
        $health['mysql'] = [
            'status' => 'connected',
            'version' => $mysqlVersion,
            'uptime' => "{$uptimeDays} days {$uptimeHours} hours",
            'threads' => (int)$threads
        ];
    } catch (PDOException $e) {
        $health['mysql'] = [
            'status' => 'error',
            'error' => $e->getMessage()
        ];
    }
    
    // PHP Status
    $health['php'] = [
        'version' => PHP_VERSION,
        'memory_limit' => ini_get('memory_limit'),
        'memory_usage' => round(memory_get_usage(true) / 1024 / 1024, 2) . 'M',
        'opcache_enabled' => function_exists('opcache_get_status') && opcache_get_status() !== false
    ];
    
    // Disk Usage
    $diskTotal = disk_total_space('/');
    $diskFree = disk_free_space('/');
    $diskUsed = $diskTotal - $diskFree;
    $diskPercent = round(($diskUsed / $diskTotal) * 100, 2);
    
    $health['disk'] = [
        'total' => round($diskTotal / 1024 / 1024 / 1024, 2) . 'GB',
        'used' => round($diskUsed / 1024 / 1024 / 1024, 2) . 'GB',
        'free' => round($diskFree / 1024 / 1024 / 1024, 2) . 'GB',
        'percent' => $diskPercent
    ];
    
    // Apache Status (if available)
    if (function_exists('apache_get_version')) {
        $health['apache'] = [
            'version' => apache_get_version(),
            'status' => 'running'
        ];
    }
    
    echo json_encode(['success' => true, 'health' => $health]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Health check failed: ' . $e->getMessage()]);
}
