<?php
// api/lms/sign_url.php
require_once '../config.php';
require_once '../cors.php';
require_once '../auth_student_check.php'; // Validates Auth

$lessonId = $_GET['lesson_id'] ?? null;
if (!$lessonId) {
    http_response_code(400);
    die(json_encode(['error' => 'Lesson ID required']));
}

// Fetch to verify existence and type
$stmt = $pdo->prepare("SELECT id, video_type, hls_path FROM lms_lessons WHERE id = ?");
$stmt->execute([$lessonId]);
$lesson = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$lesson || $lesson['video_type'] !== 'hostinger') {
    http_response_code(404);
    die(json_encode(['error' => 'Video not available for streaming']));
}

$secret = getenv('APP_SECRET') ?: 'BodyHarmonySecretKey2026';
$expires = time() + 3600; // 1 Hour

$fallback = (isset($_GET['fallback']) && $_GET['fallback'] === '1') || (isset($_GET['format']) && $_GET['format'] === 'mp4');

// V84: Check for HLS Path first (unless fallback is requested)
if (!empty($lesson['hls_path']) && !$fallback) {
    $hlsUrl = "/private_uploads/" . ltrim($lesson['hls_path'], '/');
    echo json_encode(['url' => $hlsUrl, 'is_hls' => true]);
    exit;
}

// Signature Payload: lesson_id + expires
// We DO NOT include filename here, so it remains hidden.
$signature = hash_hmac('sha256', "$lessonId:$expires", $secret);

$url = "/api/lms/stream.php?id=$lessonId&expires=$expires&signature=$signature";

echo json_encode(['url' => $url, 'is_hls' => false]);
