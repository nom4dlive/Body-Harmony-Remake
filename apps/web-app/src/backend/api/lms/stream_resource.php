<?php
// api/lms/stream_resource.php
require_once '../config.php';
require_once '../cors.php';

// 1. Validate Parameters
$resourceId = $_GET['id'] ?? null;
$expires = $_GET['expires'] ?? 0;
$signature = $_GET['signature'] ?? '';

if (!$resourceId || !$expires || !$signature) {
    http_response_code(403);
    die("Missing signature parameters");
}

if (time() > $expires) {
    http_response_code(410); // Gone
    die("Link expired");
}

// 2. Validate Signature
$secret = getenv('APP_SECRET') ?: 'BodyHarmonySecretKey2026';
$expectedSig = hash_hmac('sha256', "$resourceId:$expires", $secret);

if (!hash_equals($expectedSig, $signature)) {
    http_response_code(403);
    die("Invalid signature");
}

// 3. Resolve Filename from Database
try {
    $stmt = $pdo->prepare("SELECT file_path, file_type FROM lms_resources WHERE id = ? AND status = 'approved'");
    $stmt->execute([$resourceId]);
    $resource = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$resource || empty($resource['file_path'])) {
        http_response_code(404);
        die("Resource content not found");
    }

} catch (PDOException $e) {
    http_response_code(500);
    die("Database Error");
}

// 4. Stream File
$baseUploadDir = dirname(__DIR__, 3) . '/private_uploads';
$filePath = $baseUploadDir . '/' . $resource['file_path'];

if (!file_exists($filePath)) {
    error_log("Stream Resource Error: File not found at " . $filePath);
    http_response_code(404);
    echo "File missing on server.";
    exit;
}

$fileSize = filesize($filePath);
$offset = 0;
$length = $fileSize;

// Range Support (Crucial for Audio Players)
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
header('Content-Type: ' . $resource['file_type']);
header('Content-Length: ' . $length);
header('Accept-Ranges: bytes');
header('Content-Disposition: inline; filename="' . basename($filePath) . '"');
header('Cache-Control: private, max-age=3600'); 

$fp = fopen($filePath, 'rb');
fseek($fp, $offset);

$bufferSize = 1024 * 8;
$bytesSent = 0;

while (!feof($fp) && $bytesSent < $length) {
    echo fread($fp, min($bufferSize, $length - $bytesSent));
    $bytesSent += $bufferSize;
    flush();
}

fclose($fp);
exit;
