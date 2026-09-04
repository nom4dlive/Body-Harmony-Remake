<?php
// api/v1/admin/logs.php
// System Logs API with Sanitization

require_once '../../config.php';
require_once '../../cors.php';
require_once '../../auth_check.php'; // Admin Only

header('Content-Type: application/json; charset=utf-8');

function sanitizeLog($line) {
    // Remove password hashes
    $line = preg_replace('/password_hash=[\'"][^\'"]+[\'"]/', 'password_hash=***', $line);
    $line = preg_replace('/password=[\'"][^\'"]+[\'"]/', 'password=***', $line);
    
    // Remove tokens
    $line = preg_replace('/token=[\'"][^\'"]+[\'"]/', 'token=***', $line);
    $line = preg_replace('/device_token=[\'"][^\'"]+[\'"]/', 'device_token=***', $line);
    $line = preg_replace('/Bearer\s+[a-zA-Z0-9]+/', 'Bearer ***', $line);
    
    // Remove API keys
    $line = preg_replace('/api_key=[\'"][^\'"]+[\'"]/', 'api_key=***', $line);
    
    // Remove credit card patterns (just in case)
    $line = preg_replace('/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/', '****-****-****-****', $line);
    
    return $line;
}

try {
    $lines = isset($_GET['lines']) ? (int)$_GET['lines'] : 100;
    $lines = min($lines, 1000); // Max 1000 lines
    
    $logs = [];
    
    // Try to read Apache error log (Docker path)
    $apacheLog = '/var/log/apache2/error.log';
    if (file_exists($apacheLog) && is_readable($apacheLog)) {
        $command = "tail -n {$lines} {$apacheLog}";
        exec($command, $output);
        
        foreach ($output as $line) {
            $logs[] = [
                'source' => 'apache',
                'line' => sanitizeLog($line)
            ];
        }
    }
    
    // Try to read API error log
    $apiLog = __DIR__ . '/../../logs/error.log';
    if (file_exists($apiLog) && is_readable($apiLog)) {
        $command = "tail -n {$lines} {$apiLog}";
        exec($command, $output);
        
        foreach ($output as $line) {
            $logs[] = [
                'source' => 'api',
                'line' => sanitizeLog($line)
            ];
        }
    }
    
    // If no logs found, return empty array
    if (empty($logs)) {
        echo json_encode([
            'success' => true, 
            'logs' => [],
            'message' => 'No logs available or insufficient permissions'
        ]);
        exit;
    }
    
    // Sort by timestamp (if parseable) or keep order
    echo json_encode([
        'success' => true,
        'logs' => $logs,
        'count' => count($logs)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to read logs: ' . $e->getMessage()]);
}
