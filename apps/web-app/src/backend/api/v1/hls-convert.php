<?php
// api/v1/hls-convert.php
// FFmpeg wrapper for automatic HLS generation (Multi-bitrate)

require_once __DIR__ . '/../config.php';

AuthMiddleware::requireAdmin();

set_time_limit(0); // This can take a while
ini_set('memory_limit', '512M');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(["error" => "Method not allowed"]));
}

$input = json_decode(file_get_contents('php://input'), true);
$lessonId = $input['lesson_id'] ?? null;

if (!$lessonId) {
    http_response_code(400);
    die(json_encode(["error" => "lesson_id is required"]));
}

try {
    // 1. Fetch lesson
    $stmt = $pdo->prepare("SELECT video_ref, hls_path FROM lms_lessons WHERE id = ?");
    $stmt->execute([$lessonId]);
    $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$lesson || empty($lesson['video_ref'])) {
        http_response_code(404);
        die(json_encode(["error" => "Lesson or video_ref not found"]));
    }

    if (!empty($lesson['hls_path']) && !isset($input['force'])) {
        http_response_code(400);
        die(json_encode(["error" => "HLS already exists. Use force=true to regenerate."]));
    }

    // 2. Resolve paths
    if (!defined('PRIVATE_UPLOADS_DIR')) {
        define('PRIVATE_UPLOADS_DIR', realpath(__DIR__ . '/../../../../private_uploads'));
    }

    $rawRef = $lesson['video_ref'];
    if (strpos($rawRef, 'hostinger:') === 0) {
        $rawRef = substr($rawRef, 10);
    }

    // Clean path traversal attempts
    $rawRef = str_replace(['../', '..\\'], '', $rawRef);
    $fileName = basename($rawRef);

    // Path resolution logic (same as stream.php)
    $sourcePath = PRIVATE_UPLOADS_DIR . '/lessons/' . $fileName;
    if (!file_exists($sourcePath)) {
        $sourcePath = PRIVATE_UPLOADS_DIR . '/' . $rawRef;
        if (!file_exists($sourcePath)) {
            $sourcePath = PRIVATE_UPLOADS_DIR . '/' . $fileName;
        }
    }

    if (!file_exists($sourcePath)) {
        http_response_code(404);
        die(json_encode(["error" => "Source MP4 file not found at " . $sourcePath]));
    }

    // 3. Prepare HLS output directory
    $hlsOutDir = PRIVATE_UPLOADS_DIR . '/hls/' . $lessonId;
    if (!file_exists($hlsOutDir)) {
        mkdir($hlsOutDir, 0755, true);
    }

    $masterPlaylist = $hlsOutDir . '/master.m3u8';

    // 4. Secure HLS Directory with .htaccess (run once or verify)
    $hlsBaseDir = PRIVATE_UPLOADS_DIR . '/hls';
    $htaccessPath = $hlsBaseDir . '/.htaccess';
    if (!file_exists($htaccessPath)) {
        $htaccessContent = <<<EOT
Options -Indexes
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://bodyharmony.com.br"
    Header set Access-Control-Allow-Methods "GET, HEAD, OPTIONS"
    Header set Access-Control-Allow-Headers "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
    Header set Cache-Control "public, max-age=2592000, immutable"
</IfModule>
<FilesMatch "\.(ts|m3u8)$">
    Require all granted
</FilesMatch>
EOT;
        file_put_contents($htaccessPath, $htaccessContent);
    }

    // 5. Build FFmpeg command (Multi-bitrate: 480p, 720p, 1080p)
    // Note: To save CPU, we'll do a single pass single bitrate copy first as V1, 
    // or a full transcode if required. Shared hosting CPU might struggle with full transcode.
    // Let's use ultra-fast copy mode first to avoid CPU limits on Hostinger.

    // FAST COPY MODE (Uses existing video/audio codec, just segments it):
    $nicePrefix = (strncasecmp(PHP_OS, 'WIN', 3) === 0) ? '' : 'nice -n 19 ';
    $cmd = sprintf(
        $nicePrefix . 'ffmpeg -i %s -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls %s 2>&1',
        escapeshellarg($sourcePath),
        escapeshellarg($masterPlaylist)
    );

    // Run command
    $output = [];
    $returnVar = 0;
    exec($cmd, $output, $returnVar);

    if ($returnVar !== 0) {
        http_response_code(500);
        die(json_encode([
            "error" => "FFmpeg conversion failed",
            "code" => $returnVar,
            "output" => implode("\n", $output)
        ]));
    }

    // 6. Update database
    $relativeHlsPath = 'hls/' . $lessonId . '/master.m3u8';
    $updateStmt = $pdo->prepare("UPDATE lms_lessons SET hls_path = ? WHERE id = ?");
    $updateStmt->execute([$relativeHlsPath, $lessonId]);

    echo json_encode([
        "success" => true,
        "message" => "HLS conversion complete",
        "hls_path" => $relativeHlsPath,
        "lesson_id" => $lessonId
    ]);

}
catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
