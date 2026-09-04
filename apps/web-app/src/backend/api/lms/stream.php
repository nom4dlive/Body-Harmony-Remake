<?php
// api/lms/stream.php

require_once '../config.php';
require_once '../cors.php';

// Optimization for Large Streams (Video)
set_time_limit(0); // Infinite execution time for slow connections
ini_set('memory_limit', '512M'); // Buffer space
if (function_exists('apache_setenv')) {
    @apache_setenv('no-gzip', 1); // Disable Apache compression for video ranges
}
if (ob_get_level()) ob_end_clean(); // Clear any previous output buffer

// 1. Validate Parameters
$lessonId = $_GET['id'] ?? null; // Now using ID, not filename
$expires = $_GET['expires'] ?? 0;
$signature = $_GET['signature'] ?? '';

if (!$lessonId || !$expires || !$signature) {
    http_response_code(403);
    die("Missing signature parameters");
}

if (time() > $expires) {
    http_response_code(410); // Gone
    die("Link expired");
}

// 2. Validate Signature
$secret = getenv('APP_SECRET') ?: 'BodyHarmonySecretKey2026';
$expectedSig = hash_hmac('sha256', "$lessonId:$expires", $secret);

if (!hash_equals($expectedSig, $signature)) {
    http_response_code(403);
    die("Invalid signature");
}

// 3. Resolve Filename from Database
try {
    $stmt = $pdo->prepare("SELECT video_ref FROM lms_lessons WHERE id = ?");
    $stmt->execute([$lessonId]);
    $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$lesson || empty($lesson['video_ref'])) {
        http_response_code(404);
        die("Video content not found");
    }

    // Clean prefix if exists (e.g. hostinger:filename.mp4)
    $rawRef = $lesson['video_ref'];
    if (strpos($rawRef, 'hostinger:') === 0) {
        $rawRef = substr($rawRef, 10);
    }
    
    $videoFile = basename($rawRef); // Sanitize just in case

} catch (PDOException $e) {
    http_response_code(500);
    die("Database Error");
}

// 4. Stream File (V24 Standardized)
// Resolves to private_uploads/lessons/ using global constant to ensure Windows/Hostinger compatibility
$baseUploadDir = PRIVATE_UPLOADS_DIR . '/lessons';

if (!is_dir($baseUploadDir)) {
    // Diagnostic if constant is wrong
    error_log("LMS STREAM ERROR: PRIVATE_UPLOADS_DIR not found: " . PRIVATE_UPLOADS_DIR);
}

// DIAGNOSTIC LOGGING (To debug Hostinger path resolution)
if (!file_exists($baseUploadDir)) {
    error_log("LMS STREAM ERROR: baseUploadDir NOT FOUND. Checked: " . $baseUploadDir);
    error_log("DEBUG: __DIR__ is " . __DIR__);
}

$filePath = $baseUploadDir . '/' . $videoFile;

if (!file_exists($filePath)) {
    error_log("LMS STREAM ERROR: File NOT FOUND. Checked path: " . $filePath);
    if (class_exists('NexusLogger')) {
        NexusLogger::log('STREAM_FILE_MISSING', "Video file missing on server", [
            'lesson_id' => $lessonId,
            'file_path' => $filePath
        ], 'student', 0, 'ERROR');
    }
    http_response_code(404);
    echo json_encode(["error" => "Video file not found", "path_checked" => $filePath]);
    exit;
}

// Log successful stream initiation (optional, but good for "objective" oversight)
if (class_exists('NexusLogger')) {
    NexusLogger::log('STREAM_INIT', "Video streaming started", [
        'lesson_id' => $lessonId,
        'video_file' => $videoFile
    ], 'student', 0, 'INFO');
}

// HIGH-PERFORMANCE OPTIMIZATION: Nginx X-Accel-Redirect for production
$isProduction = (env('DB_STAGE') === 'PROD') && !isset($_GET['no_nginx']);
if ($isProduction) {
    header("X-Accel-Redirect: /private_internal_lessons/" . $videoFile);
    header("Content-Type: video/mp4");
    header("Content-Disposition: inline; filename=\"" . $videoFile . "\"");
    exit;
}

$fileSize = filesize($filePath);
$offset = 0;
$length = $fileSize;

// Range Support
if (isset($_SERVER['HTTP_RANGE'])) {
    if (preg_match('/bytes=(\d+)-(\d+)?/', $_SERVER['HTTP_RANGE'], $matches)) {
        $offset = intval($matches[1]);
        $end = isset($matches[2]) ? intval($matches[2]) : $fileSize - 1;
        $length = $end - $offset + 1;

        http_response_code(206);
        header("Content-Range: bytes $offset-$end/$fileSize");
    }
}

// Output Headers
header('Content-Type: video/mp4');
header('Content-Length: ' . $length);
header('Accept-Ranges: bytes');
header('X-Content-Type-Options: nosniff');
header('Content-Disposition: inline; filename="' . $videoFile . '"'); 
header('Cache-Control: private, max-age=3600'); 

$fp = fopen($filePath, 'rb');
if (!$fp) {
    http_response_code(500);
    die("Could not open file");
}

fseek($fp, $offset);

$bufferSize = 65536; // 64KB for better iOS performance
$bytesSent = 0;

while (!feof($fp) && $bytesSent < $length) {
    if (connection_aborted()) break;
    $chunk = fread($fp, min($bufferSize, $length - $bytesSent));
    if (!$chunk) break;
    echo $chunk;
    $bytesSent += strlen($chunk);
    flush(); 
}

fclose($fp);
exit;
