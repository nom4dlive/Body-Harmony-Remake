<?php
// api/upload.php
require_once 'config.php';
require_once 'cors.php';

// Auth Check (Admin Only for now)
$headers = getallheaders();
$token = null;

if (isset($headers['Authorization'])) {
    if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
        $token = $matches[1];
    }
}

// 1. Validate Token
if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT user_id FROM admin_sessions WHERE token = ? AND expires_at > NOW()");
    $stmt->execute([$token]);
    $adminId = $stmt->fetchColumn();

    if (!$adminId) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or Expired Session']);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database Error']);
    exit;
}

// 2. Validate File
if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$maxSize = 5 * 1024 * 1024; // 5MB

if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Allowed: JPG, PNG, WEBP, GIF']);
    exit;
}

if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large. Max 5MB.']);
    exit;
}

// 3. Process Upload
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique name
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_') . '.' . $ext;
$targetPath = $uploadDir . $filename;
$publicPath = 'uploads/' . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    echo json_encode([
        'success' => true,
        'filepath' => $publicPath,
        'full_url' => '/api/../' . $publicPath // Relative to API base, frontend handles normalization typically
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write file to disk. Check permissions.']);
}
