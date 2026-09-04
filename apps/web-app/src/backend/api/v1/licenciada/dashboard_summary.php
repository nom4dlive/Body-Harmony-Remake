<?php
/**
 * GET /api/v1/licenciada/dashboard-summary
 * Unified endpoint for the Bento Dashboard
 * Nexus Protocol V3.1
 */

global $pdo;

// Auth is mandated by index.php middleware
$headers = getallheaders_robust();
$studentId = null;

// Nexus V121: Priorizar X-Device-Token para evitar colisão com o token de Admin (bh_auth)
$deviceToken = $headers['X-DEVICE-TOKEN'] ?? '';
if ($deviceToken) {
    $stmt = $pdo->prepare("SELECT licenciada_id FROM licenciada_devices WHERE device_token = ? AND is_active = 1");
    $stmt->execute([$deviceToken]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($session) $studentId = $session['licenciada_id'];
}

// Fallback para Authorization Bearer se X-Device-Token não estiver presente
if (!$studentId) {
    $authHeader = $headers['AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
        $token = $matches[1];
        $stmt = $pdo->prepare("SELECT licenciada_id FROM licenciada_devices WHERE device_token = ? AND is_active = 1");
        $stmt->execute([$token]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($session) $studentId = $session['licenciada_id'];
    }
}

// Fallback de segurança: apenas usar loggedUser se NÃO for um administrador logado
if (!$studentId) {
    global $loggedUser;
    if ($loggedUser && isset($loggedUser['id']) && empty($loggedUser['is_admin'])) {
        $studentId = $loggedUser['id'];
    }
}

if (!$studentId) {
    Response::json(['error' => 'Unauthorized - Student ID not resolved (Token Clash protection active)'], 401);
    return;
}

try {
    // 1. STATS (Filtered by accessible modules)
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

    // Get true total from accessible lessons
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
    $totalActual = (int)$totalStmt->fetchColumn();

    $completedCount = (int)($progress['completed_lessons'] ?? 0);
    $percent = $totalActual > 0 ? round(($completedCount / $totalActual) * 100) : 0;
    $hours = round((int)($progress['total_seconds'] ?? 0) / 3600, 1);

    // 2. NEXT LESSON (Smart Suggestion)
    // First check last_active_lesson_id from licenciadas (persisted via V65)
    $studentStmt = $pdo->prepare("SELECT last_active_lesson_id FROM licenciadas WHERE id = ?");
    $studentStmt->execute([$studentId]);
    $lastLessonId = $studentStmt->fetchColumn();

    $nextLesson = null;
    if ($lastLessonId) {
        $lessonStmt = $pdo->prepare("
            SELECT l.*, m.title as module_name, p.is_completed
            FROM lms_lessons l
            INNER JOIN lms_modules m ON m.id = l.module_id
            LEFT JOIN lms_progress p ON p.lesson_id = l.id AND p.licenciada_id = ?
            WHERE l.id = ? AND l.is_active = 1 AND m.is_active = 1
              AND (m.is_exclusive = 0 OR EXISTS (
                  SELECT 1 FROM licenciada_course_access lca 
                  WHERE lca.licenciada_id = ? AND lca.module_id = m.id 
                    AND (lca.expires_at IS NULL OR lca.expires_at > NOW())
              ))
        ");
        $lessonStmt->execute([$studentId, $lastLessonId, $studentId]);
        $nextLesson = $lessonStmt->fetch(PDO::FETCH_ASSOC);
    }

    // Default if no last lesson or lesson is completed: find first incomplete in accessible modules
    if (!$nextLesson || ($nextLesson['is_completed'] ?? 0) == 1) {
        $findStmt = $pdo->prepare("
            SELECT l.*, m.title as module_name, 0 as is_completed
            FROM lms_lessons l
            INNER JOIN lms_modules m ON m.id = l.module_id
            LEFT JOIN lms_progress p ON p.lesson_id = l.id AND p.licenciada_id = ?
            WHERE l.is_active = 1 AND m.is_active = 1 
              AND (m.is_exclusive = 0 OR EXISTS (
                  SELECT 1 FROM licenciada_course_access lca 
                  WHERE lca.licenciada_id = ? AND lca.module_id = m.id 
                    AND (lca.expires_at IS NULL OR lca.expires_at > NOW())
              ))
              AND (p.is_completed IS NULL OR p.is_completed = 0)
            ORDER BY m.display_order ASC, l.display_order ASC
            LIMIT 1
        ");
        $findStmt->execute([$studentId, $studentId]);
        $nextLesson = $findStmt->fetch(PDO::FETCH_ASSOC);
    }

    // 3. SIGNALS (Unread Notifications)
    $signalStmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM system_broadcasts b
        LEFT JOIN system_broadcast_logs bl ON bl.broadcast_id = b.id AND bl.user_id = ? AND bl.user_type = 'licenciada'
        WHERE b.is_active = 1 
        AND bl.id IS NULL
        AND (b.target_roles IS NULL OR b.target_roles LIKE '%\"licenciada\"%')
    ");
    $signalStmt->execute([$studentId]);
    $unreadSignals = (int)$signalStmt->fetchColumn();

    // 4. FEATURED RESOURCES
    $resourceStmt = $pdo->query("SELECT * FROM lms_resources WHERE is_active = 1 AND status = 'approved' ORDER BY created_at DESC LIMIT 3");
    $resources = $resourceStmt->fetchAll(PDO::FETCH_ASSOC);

    Response::json([
        'success' => true,
        'summary' => [
            'stats' => [
                'percent' => $percent,
                'completed' => $completedCount,
                'total' => $totalActual,
                'hours' => $hours
            ],
            'next_lesson' => $nextLesson,
            'signals' => [
                'unread' => $unreadSignals
            ],
            'resources' => $resources
        ]
    ]);

} catch (Exception $e) {
    error_log("Dashboard Summary Error: " . $e->getMessage());
    Response::json(['error' => 'Failed to build Bento summary', 'details' => $e->getMessage()], 500);
}
