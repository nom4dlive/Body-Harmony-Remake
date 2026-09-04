<?php
// tests/debug_nexus.php
// Debug script to test NexusDashboardController outputs with corrected paths

// 1. Setup paths
$apiPath = realpath(__DIR__ . '/../apps/web-app/src/backend/api');
if (!$apiPath) {
    die("API path not found\n");
}

require_once $apiPath . '/config.php';

// Mock Response class if not available via autoload
if (!class_exists('Response')) {
    class Response {
        public static function json($data, $status = 200) {
            echo "STATUS: $status\n";
            echo json_encode($data, JSON_PRETTY_PRINT);
            exit;
        }
        public static function error($message, $status = 500) {
            echo "ERROR STATUS: $status\n";
            echo "MESSAGE: $message\n";
            exit;
        }
    }
}

// 2. Load Controller
require_once $apiPath . '/v1/Controllers/NexusDashboardController.php';

// 3. Test
echo "--- Testing getSecurityMetrics ---\n";
$controller = new NexusDashboardController();
$controller->getSecurityMetrics();
