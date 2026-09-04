<?php
// api/download.php (Unified Secure Gateway V23 - Final Path Fix)
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/v1/libs/LoggerService.php';

// disable buffering for streaming
error_reporting(0); // Suppress warnings/notices to prevent binary corruption
ini_set('display_errors', 0);
if (ob_get_level()) ob_end_clean();

// High Resource Limits for PDF Processing
set_time_limit(300); // 5 minutes
ini_set('memory_limit', '512M');

// 1. Authentication & Security
$headers = [];
if (function_exists('getallheaders')) {
    $headers = getallheaders();
}
// Robust Fallback for Hostinger/CGI
foreach ($_SERVER as $name => $value) {
    if (substr($name, 0, 5) == 'HTTP_') {
        $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
        $headers[$name] = $value; // Keep raw key too
    }
}

$token = $headers['X-Device-Token'] ?? $headers['HTTP_X_DEVICE_TOKEN'] ?? null;
$userId = 0;
$userType = 'licenciada';

// A. Token Auth
if (!$token) {
    $authHeader = $headers['Authorization'] ?? $headers['HTTP_AUTHORIZATION'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
    if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) { 
        $token = $matches[1]; 
    }
}

if ($token) {
    // Admin check
    $stmt = $pdo->prepare("SELECT user_id FROM admin_sessions WHERE token = ? AND expires_at > NOW()");
    $stmt->execute([$token]);
    $adminId = $stmt->fetchColumn();

    if ($adminId) { 
        $userId = $adminId; 
        $userType = 'admin';
    } else {
        // Licenciada check (Sync V52)
        $stmt = $pdo->prepare("SELECT licenciada_id FROM licenciada_devices WHERE device_token = ?");
        $stmt->execute([$token]);
        $userId = $stmt->fetchColumn();
    }
}

// Load dependencies
require_once __DIR__ . '/../vendor/autoload.php'; // Libraries (mPDF, FPDI)
require_once __DIR__ . '/v1/Services/PdfWatermarkService.php';
require_once __DIR__ . '/v1/Services/PdfFingerprintService.php';
require_once __DIR__ . '/v1/Services/GeolocationService.php';

// B. Signature Auth Fallback (for Media Streaming & Protected Downloads)
if (isset($_GET['signature']) && isset($_GET['expires'])) {
    $expires = $_GET['expires'];
    $signature = $_GET['signature'];
    $resourceId = $_GET['lesson_id'] ?? ($_GET['lib_id'] ?? ($_GET['file_id'] ?? 0));
    $sigStudentId = $_GET['licenciada_id'] ?? ($_GET['student_id'] ?? 0); // Support both naming variants (V52 Sync)
    
    if (time() < $expires) {
        $secret = getenv('APP_SECRET') ?: 'BodyHarmonySecretKey2026';
        
        // Try new format (with student_id)
        $valid = false;
        if ($sigStudentId > 0) {
            // New Secure Signature
            $expectedSig = hash_hmac('sha256', "$resourceId:$sigStudentId:$expires", $secret);
            if (hash_equals($expectedSig, $signature)) {
                // If we are NOT an admin, trust the signature ID
                if ($userType !== 'admin') {
                    $userId = $sigStudentId;
                    $userType = 'licenciada';
                }
                $valid = true;
            }
        } 
        
        // Fallback to legacy format (without student_id) - for existing links/streaming
        if (!$valid && !$sigStudentId) {
            $expectedSig = hash_hmac('sha256', "$resourceId:$expires", $secret);
            if (hash_equals($expectedSig, $signature)) {
                $userId = -999; 
                $userType = 'signed_access';
                $valid = true;
            }
        }
    }
}

if (!$userId && !isset($_GET['thumb'])) { http_response_code(401); die('Unauthorized'); }

// 2. Identify Resource Type & Path Resolution
// Path Base: Standardized via config.php
$privateBase = PRIVATE_UPLOADS_DIR;

$fileId = $_GET['file_id'] ?? 0;
$libraryId = $_GET['lib_id'] ?? 0;
$caseId = $_GET['case_id'] ?? 0;
$lessonId = $_GET['lesson_id'] ?? 0; // New: Lesson Video
$thumbName = $_GET['thumb'] ?? '';

$filePath = '';
$fileName = 'arquivo';

if ($thumbName) {
    // THUMBNAIL (Auth Required)
    $cleanName = basename($thumbName);
    $filePath = $privateBase . '/thumbnails/' . $cleanName;
    $fileName = $cleanName;
    
    // Security: Verify it exists and is an image
    if (!file_exists($filePath)) { http_response_code(404); die('Thumbnail not found'); }
    $mime = mime_content_type($filePath);
    if (strpos($mime, 'image') === false) { http_response_code(403); die('Invalid file type'); }

} elseif ($caseId) {
    // ANA CASE (Admin or Owner)
    $stmt = $pdo->prepare("SELECT * FROM ai_clinical_cases WHERE id = ?");
    $stmt->execute([$caseId]);
    $case = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$case) die('Case not found');

    $canAccess = false;
    if ($userType === 'admin') $canAccess = true;
    else if ($userId == $case['licenciada_id'] || $userId == $case['license_id']) $canAccess = true;
    
    if (!$canAccess) { http_response_code(403); die('Access Denied'); }

    $filePath = $privateBase . '/' . $case['photo_path'];
    $fileName = 'ana_case_' . $case['id'] . '.' . pathinfo($case['photo_path'], PATHINFO_EXTENSION);

} elseif ($lessonId) {
    // LESSON VIDEO (Admin Only or Signed)
    // Checks for signature happen in Authentication block (B) or we check token
    // If not signed_access (userId -999), we check admin permissions
    
    if ($userType !== 'admin' && $userType !== 'signed_access') {
        http_response_code(403); die('Access Denied');
    }

    $stmt = $pdo->prepare("SELECT video_ref, file_path, video_type FROM lms_lessons WHERE id = ?");
    $stmt->execute([$lessonId]);
    $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$lesson || $lesson['video_type'] !== 'hostinger') die('Video not found or external');

    // Use explicit file_path if available, otherwise video_ref
    $relPath = !empty($lesson['file_path']) ? $lesson['file_path'] : 'lessons/' . $lesson['video_ref'];
    // Clean path if it starts with private_uploads/
    $relPath = preg_replace('/^private_uploads\//', '', $relPath);
    
    // Fallback if just filename in video_ref
    if (strpos($relPath, '/') === false) $relPath = 'lessons/' . $relPath;

    $filePath = $privateBase . '/' . $relPath;
    $fileName = basename($filePath);

} elseif ($libraryId) {
    // LIBRARY RESOURCE (Student Access Check)
    $stmt = $pdo->prepare("SELECT * FROM lms_resources WHERE id = ?");
    $stmt->execute([$libraryId]);
    $file = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$file) die('Resource not found');
    
    if ($userType === 'licenciada' || $userType === 'signed_access') {
        $access = $pdo->prepare("SELECT 1 FROM lms_resource_access WHERE resource_id = ? AND licenciada_id = ?");
        $access->execute([$libraryId, $userId]);
        if (!$access->fetchColumn()) { http_response_code(403); die('Access Denied'); }
    }
    
    $relPath = $file['file_path'];
    // Look in private_uploads/ (standard) or private_uploads/private/ (hostinger legacy fallback)
    $filePath = $privateBase . '/' . $relPath;
    if (!file_exists($filePath)) {
        $filePath = $privateBase . '/private/' . $relPath;
    }
    $fileName = $file['title'];
} else {
    // ATTACHMENT (Default)
    $stmt = $pdo->prepare("SELECT * FROM lms_attachments WHERE id = ?");
    $stmt->execute([$fileId]);
    $file = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$file) die('File not found');

    $relPath = $file['file_path'];
    $filePath = $privateBase . '/' . $relPath;
    if (!file_exists($filePath)) {
        $filePath = $privateBase . '/private/' . $relPath;
    }
    $fileName = $file['title'];
}


// 3. Serve File (with PDF Protection) (Refactored for V23)
if (!file_exists($filePath)) { 
    error_log("[DOWNLOAD ERROR] File missing: $filePath");
    http_response_code(404); die('File not on server'); 
}

// === PDF PROTECTION & AUDIT (New Logic) ===
$isPdf = (strtolower(pathinfo($filePath, PATHINFO_EXTENSION)) === 'pdf');
$isProtectedResource = true; // Apply to ALL PDFs (Library & Attachments)

// Enable protection if user is logged in OR if it's a signed link with a student ID attached
// This closes the forensic gap where shared links bypassed watermarking
$shouldProtect = ($userId > 0) || ($userType === 'signed_access' && isset($sigStudentId) && $sigStudentId > 0);

if ($isPdf && $isProtectedResource && $shouldProtect) {
    try {
        // Fetch User Data for Watermark (Respecting Admin vs Student context)
        $targetId = ($userType === 'signed_access' && $sigStudentId > 0) ? $sigStudentId : $userId;
        
        if ($userType === 'admin' && $targetId == $userId) {
            $stmt = $pdo->prepare("SELECT username as name, 'ADMIN' as cpf FROM admin_users WHERE id = ?");
        } else {
            $stmt = $pdo->prepare("SELECT name, cpf FROM licenciadas WHERE id = ?");
        }
        $stmt->execute([$targetId]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($student) {
            // Load Global Forensic Layout
            $stmtCfg = $pdo->prepare("SELECT config_value FROM site_config WHERE config_key = 'forensics_default_layout'");
            $stmtCfg->execute();
            $layoutJson = $stmtCfg->fetchColumn();
            $watermarkConfig = $layoutJson ? json_decode($layoutJson, true) : [];

            // Check if required classes exist before attempting
            if (!class_exists('\BodyHarmony\Services\PdfWatermarkService') || 
                !class_exists('\BodyHarmony\Services\PdfFingerprintService')) {
                throw new Exception("PDF Services not loaded");
            }

            // Normalization for Tofus Prevention (ASCII Transliteration)
            // e.g. "João" -> "Joao" to avoid PDF font issues
            $safeName = $student['name'];
            if (function_exists('iconv')) {
                $safeName = iconv('UTF-8', 'ASCII//TRANSLIT', $student['name']);
            }
            // Remove any remaining non-printable chars
            $safeName = preg_replace('/[^A-Za-z0-9 ]/', '', $safeName);

            // 1. Watermark
            $watermarkService = new \BodyHarmony\Services\PdfWatermarkService();
            $tempWatermarked = $watermarkService->applyWatermark($filePath, [
                'name' => $safeName ?: 'Aluno BodyHarmony', // Fallback
                'cpf' => $student['cpf']
            ], $watermarkConfig);

            // 2. Fingerprint
            $fingerprintService = new \BodyHarmony\Services\PdfFingerprintService();
            $fingerprintResult = $fingerprintService->injectFingerprint($tempWatermarked, [
                // Use correct ID even if signed_access
                'licenciada_id' => ($userType === 'signed_access' && isset($sigStudentId) && $sigStudentId > 0) ? $sigStudentId : $userId,
                'cpf' => $student['cpf'],
                'download_at' => date('c'),
                'ip' => $_SERVER['REMOTE_ADDR']
            ]);
            
            // Switch to serve the protected file
            // Note: We should delete temp file after serving, but PHP script termination makes it tricky unless we use register_shutdown_function
            $finalPath = $fingerprintResult['path'];
            $fileHash = $fingerprintResult['hash'];
            
            // Cleanup the intermediate watermark file
            @unlink($tempWatermarked);
            
            // Register cleanup for final file
            register_shutdown_function(function() use ($finalPath) {
                if (file_exists($finalPath)) @unlink($finalPath);
            });

            // Point serving logic to new file
            $filePath = $finalPath;
            
            // 3. Audit Log (Enhanced)
            $geoService = new \BodyHarmony\Services\GeolocationService();
            $location = $geoService->resolveLocation($_SERVER['REMOTE_ADDR']);
            
            // Log to ai_mentorship_logs with forensic data
            $logSql = "INSERT INTO ai_mentorship_logs 
                (licenciada_id, license_id, action, context, details, ip_address, created_at, resource_id, file_hash, geolocation) 
                VALUES (?, ?, 'DOWNLOAD_PROTECTED', ?, ?, ?, NOW(), ?, ?, ?)";
            
            $context = $libraryId ? 'LIBRARY' : 'ATTACHMENT';
            $details = json_encode(['file' => $fileName]);
            $pdo->prepare($logSql)->execute([
                $userId, $userId, $context, $details, $_SERVER['REMOTE_ADDR'], 
                $libraryId ?: $fileId, $fileHash, $location
            ]);
            
            // Skip standard logging below since we just logged
            $userType = 'logged_forensic'; 
        }
    } catch (Throwable $e) {
        // Catch BOTH Exception and Error (PHP 7+)
        $errorMsg = $e->getMessage();
        error_log("[PDF PROTECTION FAIL] Serving original file. Error: " . $errorMsg);
        header("X-BodyHarmony-Error: PDF Protection Failed - " . str_replace(["\r", "\n"], " ", $errorMsg)); // Sanitize header
        
        // Debug Mode to see why it failed
        if (isset($_GET['debug'])) {
            http_response_code(500);
            echo "<h1>PDF Protection Failed</h1>";
            echo "<pre>" . $e->getMessage() . "\n" . $e->getTraceAsString() . "</pre>";
            exit;
        }

        // Fallback Logging: Record the download of the RAW file
        try {
            $originalHash = hash_file('sha256', $filePath);
            $geoServiceFallback = new \BodyHarmony\Services\GeolocationService();
            $locationFallback = $geoServiceFallback->resolveLocation($_SERVER['REMOTE_ADDR']);
            
            $logSql = "INSERT INTO ai_mentorship_logs 
                (licenciada_id, action, interaction_type, context, details, ip_address, created_at, resource_id, file_hash, geolocation) 
                VALUES (?, 'DOWNLOAD_RAW', 'DOWNLOAD_RAW', ?, ?, ?, NOW(), ?, ?, ?)";
            
            $context = $libraryId ? 'LIBRARY' : 'ATTACHMENT';
            $details = json_encode([
                'file' => $fileName,
                'error' => $errorMsg // Log why protection failed
            ]);
            
            $pdo->prepare($logSql)->execute([
                $userId, $context, $details, $_SERVER['REMOTE_ADDR'], 
                $libraryId ?: $fileId, $originalHash, $locationFallback
            ]);
            
             // Skip standard logging below since we just logged
            $userType = 'logged_forensic_fallback'; 
            
        } catch (Throwable $logError) {
            error_log("[PDF FALLBACK LOG FAIL] Could not log raw download: " . $logError->getMessage());
        }

        // Fallback: Continue with original $filePath
        // Do NOT die here. Just let the script serve the original file.
    }
}


// Audit Log (Skip for Signature to reduce noise on streams)
if ($userType !== 'signed_access') {
    $logger = new LoggerService($pdo);
    $logger->log($userId, 'DOWNLOAD', ['type' => $libraryId ? 'LIB' : 'ATT', 'id' => $libraryId ?: $fileId, 'name' => $fileName]);
}

$fileSize = filesize($filePath);
$mime = mime_content_type($filePath);
$offset = 0;
$length = $fileSize;

// Handle Range Requests
if (isset($_SERVER['HTTP_RANGE'])) {
    if (preg_match('/bytes=(\d+)-(\d+)?/', $_SERVER['HTTP_RANGE'], $matches)) {
        $offset = intval($matches[1]);
        $end = isset($matches[2]) ? intval($matches[2]) : $fileSize - 1;
        $length = $end - $offset + 1;
        
        http_response_code(206); // Partial Content
        header("Content-Range: bytes $offset-$end/$fileSize");
    }
}

header("Content-Type: $mime");
header("Content-Length: " . $length);
header("Accept-Ranges: bytes");
header("Cache-Control: private, max-age=3600");

$mode = $_GET['mode'] ?? 'download';
$disposition = ($mode === 'view' || $mode === 'stream') ? 'inline' : 'attachment';
header("Content-Disposition: $disposition; filename=\"" . basename($filePath) . "\"");

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
