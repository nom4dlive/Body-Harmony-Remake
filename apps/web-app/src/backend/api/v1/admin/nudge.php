<?php
/**
 * Nudge API - Track and manage admin nudges to students
 * 
 * Actions:
 * - log: Register a nudge attempt
 * - get_history: Get nudge history for a student
 */

require_once __DIR__ . '/../../../../api/config.php';
require_once __DIR__ . '/error_handler.php';

header('Content-Type: application/json');
session_start();

// Authentication check
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] === 'student') {
    NexusErrorHandler::respond(401, NexusErrorHandler::ERR_UNAUTHORIZED,
        'Admin access required for nudge operations.');
}

// Parse and validate input
$rawInput = file_get_contents('php://input');
$input = NexusErrorHandler::validateInput($rawInput);

$action = NexusErrorHandler::requireParam($input, 'action');
NexusErrorHandler::validateAction($action, ['log', 'get_history']);

try {
    $pdo = getConnection();

    if ($action === 'log') {
        // Register nudge attempt
        $studentId = NexusErrorHandler::requireParam($input, 'licenciada_id', 'Licenciada ID');
        $type = $input['type'] ?? 'whatsapp_manual';

        // Validate type
        $validTypes = ['whatsapp_manual', 'whatsapp_auto'];
        if (!in_array($type, $validTypes)) {
            NexusErrorHandler::respond(400, NexusErrorHandler::ERR_VALIDATION_ERROR,
                "Invalid nudge type. Must be one of: " . implode(', ', $validTypes),
            ['received' => $type, 'valid_types' => $validTypes]
            );
        }

        // Insert nudge record
        $stmt = $pdo->prepare("
            INSERT INTO admin_nudges (licenciada_id, admin_username, type, created_at)
            VALUES (?, ?, ?, NOW())
        ");

        $stmt->execute([
            $studentId,
            $_SESSION['user']['username'],
            $type
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Nudge logged successfully',
            'nudge_id' => $pdo->lastInsertId(),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }

    if ($action === 'get_history') {
        // Get nudge history for a student
        $studentId = NexusErrorHandler::requireParam($input, 'licenciada_id', 'Licenciada ID');

        $stmt = $pdo->prepare("
            SELECT 
                n.id,
                n.type,
                n.created_at,
                n.admin_username
            FROM admin_nudges n
            WHERE n.licenciada_id = ?
            ORDER BY n.created_at DESC
            LIMIT 10
        ");

        $stmt->execute([$studentId]);
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'history' => $history,
            'count' => count($history)
        ]);
    }


}
catch (PDOException $e) {
    NexusErrorHandler::respond(500, NexusErrorHandler::ERR_DATABASE_ERROR,
        'Database operation failed.',
    ['error' => $e->getMessage()]
    );
}
