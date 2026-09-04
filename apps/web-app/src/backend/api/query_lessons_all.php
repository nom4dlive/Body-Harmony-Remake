<?php
// apps/web-app/src/backend/api/query_lessons_all.php
header('Content-Type: application/json');

require_once __DIR__ . '/config.php';

try {
    $stmt = $pdo->prepare("SELECT id, title, video_ref, thumbnail_ref, thumbnail_base64 FROM lms_lessons WHERE id IN (45, 48, 49, 50, 51)");
    $stmt->execute();
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "lessons" => $lessons
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
