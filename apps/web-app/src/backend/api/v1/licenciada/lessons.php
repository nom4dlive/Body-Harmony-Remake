<?php
/**
 * GET /api/v1/licenciada/lessons
 * Returns student's lessons categorized by progress status
 * 
 * NOTE: This file is included from index.php via router.
 * Auth is handled by middleware, $pdo is global from config.php
 * 
 * Response:
 * {
 *   "success": true,
 *   "in_progress": [{ id, title, duration, progress_percent, thumbnail, module_title }],
 *   "completed": [{ id, title, duration, progress_percent, thumbnail, module_title, completed_at }]
 * }
 */

// $pdo is already available from index.php (via config.php)
// Auth is already validated by middleware in index.php

global $pdo;

// Get student ID from middleware-validated session
$studentId = null;

// Try to get student ID from Authorization header (JWT)
$headers = getallheaders_robust();
$authHeader = $headers['AUTHORIZATION'] ?? $headers['AUTHORIZATION'] ?? '';

if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
    $token = $matches[1];
    
    // Validate token and get student ID
    $stmt = $pdo->prepare("
        SELECT s.id as licenciada_id 
        FROM licenciada_devices sd 
        INNER JOIN licenciadas s ON s.id = sd.licenciada_id 
        WHERE sd.device_token = ? AND sd.is_active = 1
    ");
    $stmt->execute([$token]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($session) {
        $studentId = $session['licenciada_id'];
    }
}

if (!$studentId) {
    global $loggedUser;
    if ($loggedUser && isset($loggedUser['id'])) {
        $studentId = $loggedUser['id'];
    } else {
        Response::json(['error' => 'Unauthorized'], 401);
        return;
    }
}

try {
    // Get all lessons with progress for this student
    $stmt = $pdo->prepare("
        SELECT 
            l.id,
            l.title,
            l.duration_seconds,
            l.thumbnail,
            l.video_url,
            m.title as module_title,
            m.id as module_id,
            COALESCE(p.progress_percent, 0) as progress_percent,
            COALESCE(p.is_completed, 0) as is_completed,
            p.updated_at as completed_at
        FROM lms_lessons l
        INNER JOIN lms_modules m ON m.id = l.module_id
        LEFT JOIN lms_progress p ON p.lesson_id = l.id AND p.licenciada_id = ?
        WHERE l.is_active = 1 AND m.is_active = 1
        ORDER BY m.display_order ASC, l.display_order ASC
    ");
    $stmt->execute([$studentId]);
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $inProgress = [];
    $completed = [];
    
    foreach ($lessons as $lesson) {
        // Format duration
        $durationSeconds = (int)$lesson['duration_seconds'];
        $minutes = floor($durationSeconds / 60);
        $seconds = $durationSeconds % 60;
        $duration = sprintf('%02d:%02d', $minutes, $seconds);
        
        $lessonData = [
            'id' => (int)$lesson['id'],
            'title' => $lesson['title'],
            'duration' => $duration,
            'duration_seconds' => $durationSeconds,
            'progress_percent' => (int)$lesson['progress_percent'],
            'thumbnail' => $lesson['thumbnail'],
            'video_url' => $lesson['video_url'],
            'module_id' => (int)$lesson['module_id'],
            'module_title' => $lesson['module_title']
        ];
        
        if ($lesson['is_completed']) {
            $lessonData['completed_at'] = $lesson['completed_at'];
            $completed[] = $lessonData;
        } elseif ((int)$lesson['progress_percent'] > 0) {
            $inProgress[] = $lessonData;
        }
    }
    
    Response::json([
        'success' => true,
        'in_progress' => $inProgress,
        'completed' => $completed,
        'total_lessons' => count($lessons),
        'total_in_progress' => count($inProgress),
        'total_completed' => count($completed)
    ]);
    
} catch (Exception $e) {
    error_log("Lessons endpoint error: " . $e->getMessage());
    Response::json(['error' => 'Failed to fetch lessons data'], 500);
}
