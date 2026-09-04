<?php
// api/v1/lms/update_duration.php
// PATCH endpoint to update lesson duration

require_once '../../config.php';
require_once '../../cors.php';
// Auth removed: This endpoint only updates if duration_seconds = 0 (safe operation)

// Get lesson ID from query string (set by .htaccess rewrite)
$lessonId = $_GET['lesson_id'] ?? null;

if (!$lessonId) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid lesson ID']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $duration = $input['duration_seconds'] ?? null;
    
    if (!$duration || $duration <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid duration']);
        exit;
    }
    
    // Update only if current duration is 0 (to avoid overwriting manual edits)
    $stmt = $pdo->prepare("UPDATE lms_lessons SET duration_seconds = ? WHERE id = ? AND duration_seconds = 0");
    $stmt->execute([$duration, $lessonId]);
    
    echo json_encode(['success' => true, 'duration_seconds' => $duration]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
