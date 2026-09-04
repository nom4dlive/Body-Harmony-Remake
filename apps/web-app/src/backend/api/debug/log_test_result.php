<?php
require_once '../config.php';

// log_test_result.php (Nexus Governance Internal API)
// Purpose: Record automated test results into the audit log.

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'No data provided']);
    exit;
}

$action = $input['action'] ?? 'Test Execution';
$user_type = $input['user_type'] ?? 'system';
$description = $input['description'] ?? 'Automated test suite finished.';
$ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

try {
    $stmt = $pdo->prepare("INSERT INTO audit_logs (action, user_type, description, ip_address) VALUES (?, ?, ?, ?)");
    $stmt->execute([$action, $user_type, $description, $ip]);

    echo json_encode([
        'success' => true,
        'message' => 'Nexus Audit Log updated.'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Audit failure: ' . $e->getMessage()]);
}
?>
