<?php
// api/v1/admin/diagnose.php
// System Diagnostics & Autoconfig Utility

require_once '../../config.php';
require_once '../../cors.php';

// Simple secret-based protection for diagnostics if not logged in
$secret = $_GET['secret'] ?? '';
$is_authenticated = false;

// Try to authenticate via session/token first
try {
    require_once '../../auth_check.php';
    $is_authenticated = true;
} catch (Exception $e) {
    // Fallback to shared secret from .env if defined
    $env_secret = getenv('DIAGNOSTIC_SECRET') ?: 'bh_debug_2026';
    if ($secret === $env_secret) {
        $is_authenticated = true;
    }
}

if (!$is_authenticated) {
    header('HTTP/1.1 401 Unauthorized');
    die(json_encode(['error' => 'Unauthorized. Provide valid token or ?secret=...']));
}

header('Content-Type: application/json; charset=utf-8');

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'env' => [
        'php_version' => PHP_VERSION,
        'os' => PHP_OS,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    ],
    'checks' => []
];

// 1. Database Connectivity
try {
    $start = microtime(true);
    // Use the global $pdo from config.php
    $stmt = $pdo->query("SELECT 1");
    $end = microtime(true);
    
    $results['checks']['database'] = [
        'status' => 'OK',
        'latency_ms' => round(($end - $start) * 1000, 2),
        'persistent' => $pdo->getAttribute(PDO::ATTR_PERSISTENT) ? 'YES' : 'NO',
        'connection_limit_hit' => false
    ];
} catch (PDOException $e) {
    $results['checks']['database'] = [
        'status' => 'ERROR',
        'message' => $e->getMessage(),
        'code' => $e->getCode(),
        'connection_limit_hit' => (strpos($e->getMessage(), '1226') !== false)
    ];
}

// 2. Directory Permissions
$dirs = [
    'uploads' => __DIR__ . '/../../../../public_html/uploads',
    'logs' => __DIR__ . '/../../v1/logs',
    'temp' => sys_get_temp_dir()
];

$results['checks']['permissions'] = [];
foreach ($dirs as $name => $path) {
    $results['checks']['permissions'][$name] = [
        'path' => $path,
        'exists' => file_exists($path),
        'writable' => is_writable($path)
    ];
}

// 3. Environment File
$env_path = __DIR__ . '/../../.env';
$results['checks']['env_file'] = [
    'exists' => file_exists($env_path),
    'readable' => is_readable($env_path),
    'size' => file_exists($env_path) ? filesize($env_path) : 0
];

// 4. Critical Dependencies
$results['checks']['extensions'] = [
    'pdo_mysql' => extension_loaded('pdo_mysql'),
    'gd' => extension_loaded('gd'),
    'mbstring' => extension_loaded('mbstring'),
    'openssl' => extension_loaded('openssl')
];

echo json_encode($results, JSON_PRETTY_PRINT);
