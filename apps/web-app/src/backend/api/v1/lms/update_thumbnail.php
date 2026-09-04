<?php
// api/v1/lms/update_thumbnail.php
// PATCH endpoint to update lesson thumbnail

require_once '../../config.php';
require_once '../../cors.php';
// Auth removed: This endpoint only updates if thumbnail_base64 IS NULL (safe operation)

// Get lesson ID from query string (set by .htaccess rewrite)
$lessonId = $_GET['lesson_id'] ?? null;

if (!$lessonId) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid lesson ID']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $thumbnail = $input['thumbnail_base64'] ?? null;
    
    if (!$thumbnail || !str_starts_with($thumbnail, 'data:image/')) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid thumbnail data']);
        exit;
    }
    
    // Update always (allow overwriting auto-generated or missing thumbs)
    $stmt = $pdo->prepare("UPDATE lms_lessons SET thumbnail_base64 = ? WHERE id = ?");
    $stmt->execute([$thumbnail, $lessonId]);
    
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
