<?php
// api/v1/stream.php
// Unified video stream handler — supports both ?video=path and ?id=lessonId
// V2 - Compatible with AdminLmsController and LmsController signatures

require_once __DIR__ . '/../config.php';

// Optimization for streaming
set_time_limit(0);
ini_set('memory_limit', '512M');
if (function_exists('apache_setenv')) @apache_setenv('no-gzip', 1);
if (ob_get_level()) ob_end_clean();

$expires   = intval($_GET['expires'] ?? 0);
$signature = $_GET['signature'] ?? '';
$videoParam = $_GET['video'] ?? null;   // AdminLmsController: ?video=path
$idParam    = $_GET['id'] ?? null;       // LmsController: ?id=lessonId

$secret = getenv('APP_SECRET') ?: 'BodyHarmonySecretKey2026';

if (!$expires || !$signature) {
    http_response_code(403);
    die("Missing signature parameters");
}

if (time() > $expires) {
    http_response_code(410);
    die("Link expired");
}

// --- Resolve the video path ---
if ($videoParam) {
    // Mode 1: ?video=relative_path (from AdminLmsController)
    $expectedSig = hash_hmac('sha256', "$videoParam:$expires", $secret);
    if (!hash_equals($expectedSig, $signature)) {
        http_response_code(403);
        die("Invalid signature");
    }
    // Clean path traversal attempts
    $videoPath = ltrim($videoParam, '/');
    $videoPath = str_replace(['../', '..\\'], '', $videoPath);
    
} elseif ($idParam) {
    // Mode 2: ?id=lessonId (from LmsController, legacy)
    $expectedSig = hash_hmac('sha256', "$idParam:$expires", $secret);
    if (!hash_equals($expectedSig, $signature)) {
        http_response_code(403);
        die("Invalid signature");
    }
    // Resolve via database
    try {
        $stmt = $pdo->prepare("SELECT video_ref, file_path FROM lms_lessons WHERE id = ?");
        $stmt->execute([$idParam]);
        $lesson = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$lesson || empty($lesson['video_ref'])) {
            http_response_code(404);
            die("Video content not found");
        }
        $rawRef = $lesson['video_ref'];
        if (strpos($rawRef, 'hostinger:') === 0) $rawRef = substr($rawRef, 10);
        $videoPath = 'lessons/' . basename($rawRef);
    } catch (Exception $e) {
        http_response_code(500);
        die("Database error");
    }
} else {
    http_response_code(400);
    die("Missing video parameter");
}

// --- Resolve physical path ---
if (!defined('PRIVATE_UPLOADS_DIR')) {
    define('PRIVATE_UPLOADS_DIR', realpath(__DIR__ . '/../../../../private_uploads'));
}

// Security: Clean path and prevent traversal
$videoPath = str_replace(['../', '..\\'], '', $videoPath);
$filePath = PRIVATE_UPLOADS_DIR . '/' . $videoPath;

// Diagnostic logging for 404s
if (!file_exists($filePath)) {
    error_log("LMS STREAM 404: Initial path not found: $filePath");
    
    // Fallback 1: Try adding 'lessons/' prefix if not present
    $fileName = basename($filePath);
    $lessonsPath = PRIVATE_UPLOADS_DIR . '/lessons/' . $fileName;
    
    if (file_exists($lessonsPath)) {
        $filePath = $lessonsPath;
        error_log("LMS STREAM: Found via Fallback 1 (lessons/): $filePath");
    } else {
        // Fallback 2: Try base private_uploads dir
        $basePath = PRIVATE_UPLOADS_DIR . '/' . $fileName;
        if (file_exists($basePath)) {
            $filePath = $basePath;
            error_log("LMS STREAM: Found via Fallback 2 (base): $filePath");
        } else {
            error_log("LMS STREAM: File definitively NOT FOUND. Checked: $filePath, $lessonsPath, $basePath");
            http_response_code(404);
            echo json_encode([
                "error" => "File not found", 
                "checked" => $fileName,
                "hint" => "Ensure file exists in private_uploads/lessons/"
            ]);
            exit;
        }
    }
}

// --- Stream ---
$fileSize = filesize($filePath);
$offset = 0;
$length = $fileSize;

if (isset($_SERVER['HTTP_RANGE'])) {
    if (preg_match('/bytes=(\d+)-(\d+)?/', $_SERVER['HTTP_RANGE'], $m)) {
        $offset = intval($m[1]);
        $end = isset($m[2]) ? intval($m[2]) : $fileSize - 1;
        $length = $end - $offset + 1;
        http_response_code(206);
        header("Content-Range: bytes $offset-$end/$fileSize");
    }
}

$ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
$mime = ($ext === 'mp4') ? 'video/mp4' : (($ext === 'mov') ? 'video/quicktime' : 'video/octet-stream');

header("Content-Type: $mime");
header("Content-Length: $length");
header("Accept-Ranges: bytes");
header("Content-Disposition: inline; filename=\"" . basename($filePath) . "\"");
// V76: Habilita cache local de byte-ranges (segurança mantida pela validação do HMAC inicial)
header("Cache-Control: public, max-age=86400, immutable");

$fp = fopen($filePath, 'rb');
if (!$fp) { http_response_code(500); die("Could not open file"); }

fseek($fp, $offset);
$bufferSize = 1048576;
$bytesSent  = 0;

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
