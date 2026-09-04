<?php
/**
 * GET /api/v1/licenciada/progress
 * Returns consolidated progress data for the logged-in licenciada (student)
 * 
 * NOTE: This file is included from index.php via router.
 * Auth is handled by middleware, $pdo is global from config.php
 * 
 * Response:
 * {
 *   "success": true,
 *   "percent": 45,
 *   "completed": 9,
 *   "total": 20,
 *   "hours": 4.5,
 *   "next_goal": "Módulo Avançado",
 *   "next_goal_sub": "Técnicas Especiais"
 * }
 */

// $pdo is already available from index.php (via config.php)
// Auth is already validated by middleware in index.php

global $pdo;

// Get student ID from middleware-validated session
$studentId = null;
$headers = getallheaders_robust();

// Nexus V121: Priorizar X-Device-Token para evitar colisão com o token de Admin (bh_auth)
$deviceToken = $headers['X-DEVICE-TOKEN'] ?? '';
if ($deviceToken) {
    $stmt = $pdo->prepare("
        SELECT s.id as licenciada_id 
        FROM licenciada_devices sd 
        INNER JOIN licenciadas s ON s.id = sd.licenciada_id 
        WHERE sd.device_token = ? AND sd.is_active = 1
    ");
    $stmt->execute([$deviceToken]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($session) {
        $studentId = $session['licenciada_id'];
    }
}

// Fallback para Authorization Bearer se X-Device-Token não estiver presente
if (!$studentId) {
    $authHeader = $headers['AUTHORIZATION'] ?? '';
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
}

// Fallback de segurança: apenas usar loggedUser se NÃO for um administrador logado
if (!$studentId) {
    global $loggedUser;
    if ($loggedUser && isset($loggedUser['id']) && empty($loggedUser['is_admin'])) {
        $studentId = $loggedUser['id'];
    } else {
        Response::json(['error' => 'Unauthorized - Student ID not resolved (Token Clash protection active)'], 401);
        return;
    }
}

try {
    // 1. Get true total from active lessons belonging to accessible modules
    $totalStmt = $pdo->prepare("
        SELECT COUNT(l.id) as total 
        FROM lms_lessons l
        INNER JOIN lms_modules m ON l.module_id = m.id
        WHERE l.is_active = 1 AND m.is_active = 1
          AND (m.is_exclusive = 0 OR EXISTS (
              SELECT 1 FROM licenciada_course_access lca 
              WHERE lca.licenciada_id = ? AND lca.module_id = m.id 
                AND (lca.expires_at IS NULL OR lca.expires_at > NOW())
          ))
    ");
    $totalStmt->execute([$studentId]);
    $totalLessons = (int)($totalStmt->fetchColumn() ?: 0);

    // 2. Get progress stats from lms_progress for active lessons in accessible modules
    $progressStmt = $pdo->prepare("
        SELECT 
            COUNT(*) as started_lessons,
            SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons,
            SUM(CASE WHEN p.is_completed = 1 THEN l.duration_seconds ELSE 0 END) as total_seconds
        FROM lms_progress p
        INNER JOIN lms_lessons l ON l.id = p.lesson_id
        INNER JOIN lms_modules m ON l.module_id = m.id
        WHERE p.licenciada_id = ? AND l.is_active = 1 AND m.is_active = 1
          AND (m.is_exclusive = 0 OR EXISTS (
              SELECT 1 FROM licenciada_course_access lca 
              WHERE lca.licenciada_id = ? AND lca.module_id = m.id 
                AND (lca.expires_at IS NULL OR lca.expires_at > NOW())
          ))
    ");
    $progressStmt->execute([$studentId, $studentId]);
    $progress = $progressStmt->fetch(PDO::FETCH_ASSOC);

    $completedLessons = (int)($progress['completed_lessons'] ?? 0);
    $totalSeconds = (int)($progress['total_seconds'] ?? 0);

    // ⚠️ V97 ANOMALY DETECTION: Log when authenticated user has zero progress
    if ($progress && (int)$progress['started_lessons'] == 0) {
        error_log("[V97_ANOMALY] licenciada_id={$studentId} has ZERO progress records. " .
                  "Total accessible lessons: {$totalLessons}");
        
        // Double-check: verify the column exists correctly
        try {
            $colCheck = $pdo->query("SHOW COLUMNS FROM lms_progress LIKE 'licenciada_id'");
            if ($colCheck->rowCount() === 0) {
                error_log("[V97_CRITICAL] lms_progress table does NOT have licenciada_id column! " .
                          "Schema may have been reset. Run V97 migration immediately.");
            }
        } catch (Exception $colErr) {
            error_log("[V97_CRITICAL] Cannot verify lms_progress schema: " . $colErr->getMessage());
        }
    }
    
    // Calculate percentage over total accessible active lessons
    $percent = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;
    
    // Calculate hours (from lesson duration, not access logs for accuracy)
    $hours = round($totalSeconds / 3600, 1);
    
    // 2. Get next goal (next incomplete accessible module or "Certificação" if all done)
    $nextGoalStmt = $pdo->prepare("
        SELECT m.title, m.description
        FROM lms_modules m
        WHERE m.is_active = 1
        AND (m.is_exclusive = 0 OR EXISTS (
            SELECT 1 FROM licenciada_course_access lca 
            WHERE lca.licenciada_id = ? AND lca.module_id = m.id 
              AND (lca.expires_at IS NULL OR lca.expires_at > NOW())
        ))
        AND m.id NOT IN (
            SELECT DISTINCT l.module_id 
            FROM lms_lessons l
            INNER JOIN lms_progress p ON p.lesson_id = l.id AND p.licenciada_id = ?
            WHERE p.is_completed = 1
            GROUP BY l.module_id
            HAVING COUNT(l.id) = (SELECT COUNT(*) FROM lms_lessons WHERE module_id = l.module_id AND is_active = 1)
        )
        ORDER BY m.display_order ASC
        LIMIT 1
    ");
    $nextGoalStmt->execute([$studentId, $studentId]);
    $nextModule = $nextGoalStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($nextModule) {
        $nextGoal = $nextModule['title'];
        $nextGoalSub = $nextModule['description'] ? substr($nextModule['description'], 0, 40) : 'Próximo Módulo';
    } else {
        // All modules completed
        $nextGoal = 'Certificação';
        $nextGoalSub = 'Solicite seu certificado';
    }
    
    Response::json([
        'success' => true,
        'percent' => $percent,
        'completed' => $completedLessons,
        'total' => $totalLessons,
        'hours' => $hours,
        'next_goal' => $nextGoal,
        'next_goal_sub' => $nextGoalSub
    ]);
    
} catch (Exception $e) {
    error_log("Progress endpoint error: " . $e->getMessage());
    Response::json(['error' => 'Failed to fetch progress data'], 500);
}
