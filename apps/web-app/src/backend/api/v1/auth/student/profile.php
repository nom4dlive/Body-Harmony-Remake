<?php
// PUT /api/v1/auth/student/profile - Update student profile
require_once __DIR__ . '/../../Core/Response.php';
require_once __DIR__ . '/../../Core/Auth.php';
require_once __DIR__ . '/../../Core/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'PUT' && $method !== 'POST') {
    Response::json(['error' => 'Method not allowed'], 405);
    exit;
}

// Authenticate student
$studentId = Auth::validateStudent();
if (!$studentId) {
    Response::json(['error' => 'Unauthorized'], 401);
    exit;
}

// Get request body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    Response::json(['error' => 'Invalid JSON body'], 400);
    exit;
}

try {
    $pdo = getDbConnection();

    // Build update query dynamically
    $updates = [];
    $params = [];

    // Allowed fields to update
    $allowedFields = ['whatsapp', 'instagram', 'username'];

    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updates[] = "$field = ?";
            $params[] = trim($input[$field]);
        }
    }

    // Handle password change
    if (!empty($input['password'])) {
        $newPassword = $input['password'];
        if (strlen($newPassword) < 6) {
            Response::json(['error' => 'Password must be at least 6 characters'], 400);
            exit;
        }
        $updates[] = "password_hash = ?";
        $params[] = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    if (empty($updates)) {
        Response::json(['error' => 'No fields to update'], 400);
        exit;
    }

    // Add student ID to params
    $params[] = $studentId;

    $sql = "UPDATE students SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Log the update
    $logStmt = $pdo->prepare("
        INSERT INTO audit_logs (action, user_type, user_id, description, ip_address, created_at)
        VALUES ('STUDENT_PROFILE_UPDATE', 'student', ?, ?, ?, NOW())
    ");
    $logStmt->execute([
        $studentId,
        'Student updated profile fields: ' . implode(', ', array_keys(array_filter($input))),
        $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ]);

    // Fetch updated student data
    $fetchStmt = $pdo->prepare("SELECT id, name, username, email, whatsapp, instagram, photo_url FROM students WHERE id = ?");
    $fetchStmt->execute([$studentId]);
    $updatedStudent = $fetchStmt->fetch(PDO::FETCH_ASSOC);

    Response::json([
        'success' => true,
        'message' => 'Profile updated successfully',
        'student' => $updatedStudent
    ]);


}
catch (Exception $e) {
    error_log("Profile update error: " . $e->getMessage());
    Response::json(['error' => 'Failed to update profile'], 500);
}
