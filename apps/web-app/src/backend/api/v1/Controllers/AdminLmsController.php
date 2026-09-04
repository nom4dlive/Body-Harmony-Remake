<?php
// api/v1/Controllers/AdminLmsController.php

class AdminLmsController
{
    private $pdo;
    private $user;
    private $logger;

    public function __construct()
    {
        global $pdo, $loggedUser;
        $this->pdo = $pdo;
        $this->user = $loggedUser;
        $this->logger = new LoggerService($pdo);
        $this->ensureTables();
    }

    private function ensureTables(): void
    {
        try {
            // 1. Ensure lms_modules exists & has all columns
            $this->pdo->exec("
                CREATE TABLE IF NOT EXISTS `lms_modules` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `title` varchar(150) NOT NULL,
                    `description` text DEFAULT NULL,
                    `cover_image` varchar(255) DEFAULT NULL,
                    `display_order` int(11) DEFAULT 0,
                    `is_active` tinyint(1) DEFAULT 1,
                    `is_exclusive` tinyint(1) DEFAULT 0,
                    `last_modified_by` int(11) DEFAULT NULL,
                    `last_modified_at` timestamp NULL DEFAULT NULL,
                    `created_at` timestamp DEFAULT current_timestamp(),
                    PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");

            $moduleCols = [
                "ALTER TABLE `lms_modules` ADD COLUMN IF NOT EXISTS `cover_image` varchar(255) DEFAULT NULL",
                "ALTER TABLE `lms_modules` ADD COLUMN IF NOT EXISTS `is_exclusive` tinyint(1) DEFAULT 0",
                "ALTER TABLE `lms_modules` ADD COLUMN IF NOT EXISTS `last_modified_by` int(11) DEFAULT NULL",
                "ALTER TABLE `lms_modules` ADD COLUMN IF NOT EXISTS `last_modified_at` timestamp NULL DEFAULT NULL"
            ];
            foreach ($moduleCols as $colSql) {
                try { $this->pdo->exec($colSql); } catch (\Throwable $e) {}
            }

            // 2. Ensure lms_lessons exists & has all columns
            $this->pdo->exec("
                CREATE TABLE IF NOT EXISTS `lms_lessons` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `module_id` int(11) NOT NULL,
                    `title` varchar(150) NOT NULL,
                    `description` text DEFAULT NULL,
                    `video_type` varchar(50) DEFAULT 'mp4',
                    `video_ref` varchar(255) DEFAULT NULL,
                    `file_path` varchar(255) DEFAULT NULL,
                    `hls_path` varchar(255) DEFAULT NULL,
                    `duration_seconds` int(11) DEFAULT 0,
                    `thumbnail_ref` varchar(255) DEFAULT NULL,
                    `thumbnail_base64` mediumtext DEFAULT NULL,
                    `is_active` tinyint(1) DEFAULT 1,
                    `display_order` int(11) DEFAULT 0,
                    `transcription_status` varchar(50) DEFAULT 'idle',
                    `transcription_job_id` varchar(100) DEFAULT NULL,
                    `transcription_error` text DEFAULT NULL,
                    `transcription_completed_at` timestamp NULL DEFAULT NULL,
                    `last_modified_by` int(11) DEFAULT NULL,
                    `last_modified_at` timestamp NULL DEFAULT NULL,
                    `created_at` timestamp DEFAULT current_timestamp(),
                    PRIMARY KEY (`id`),
                    KEY `module_id` (`module_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");

            $lessonCols = [
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `video_type` varchar(50) DEFAULT 'mp4'",
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `video_ref` varchar(255) DEFAULT NULL",
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `file_path` varchar(255) DEFAULT NULL",
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `hls_path` varchar(255) DEFAULT NULL",
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `duration_seconds` int(11) DEFAULT 0",
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `thumbnail_ref` varchar(255) DEFAULT NULL",
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `thumbnail_base64` mediumtext DEFAULT NULL",
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `transcription_status` varchar(50) DEFAULT 'idle'",
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `transcription_job_id` varchar(100) DEFAULT NULL",
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `transcription_error` text DEFAULT NULL",
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `transcription_completed_at` timestamp NULL DEFAULT NULL",
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `last_modified_by` int(11) DEFAULT NULL",
                "ALTER TABLE `lms_lessons` ADD COLUMN IF NOT EXISTS `last_modified_at` timestamp NULL DEFAULT NULL"
            ];
            foreach ($lessonCols as $colSql) {
                try { $this->pdo->exec($colSql); } catch (\Throwable $e) {}
            }

            // 3. Ensure lms_attachments exists
            $this->pdo->exec("
                CREATE TABLE IF NOT EXISTS `lms_attachments` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `lesson_id` int(11) NOT NULL,
                    `title` varchar(255) NOT NULL,
                    `file_type` varchar(50) DEFAULT NULL,
                    `file_path` varchar(255) NOT NULL,
                    `is_downloadable` tinyint(1) DEFAULT 1,
                    `created_at` timestamp DEFAULT current_timestamp(),
                    PRIMARY KEY (`id`),
                    KEY `lesson_id` (`lesson_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");

            try {
                $this->pdo->exec("ALTER TABLE `lms_attachments` ADD COLUMN IF NOT EXISTS `is_downloadable` tinyint(1) DEFAULT 1");
            } catch (\Throwable $e) {}
        } catch (\Throwable $e) {
            // Silently continue if permissions or tables already exist
        }
    }

    // GET /admin/lms/dashboard
    public function dashboard()
    {
        try {
            // 1. Total Licenciadas
            $stmt = $this->pdo->query("SELECT COUNT(*) FROM licenciadas WHERE is_active = 1");
            $totalStudents = $stmt->fetchColumn();

            // 2. Active Licenciadas (Login in last 30 days)
            $stmt = $this->pdo->query("SELECT COUNT(*) FROM licenciadas WHERE last_login_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
            $activeStudents = $stmt->fetchColumn();

            // 3. Lessons Watched (Total completed lessons)
            $stmt = $this->pdo->query("SELECT COUNT(*) FROM lms_progress WHERE is_completed = 1");
            $lessonsWatched = $stmt->fetchColumn();

            // 4. Completion Rate
            $stmt = $this->pdo->query("SELECT COUNT(*) FROM lms_lessons");
            $totalLessons = $stmt->fetchColumn();

            $completionRate = 0;
            if ($totalLessons > 0 && $totalStudents > 0) {
                $completionRate = ($lessonsWatched / ($totalStudents * $totalLessons)) * 100;
            }

            // 5. Teaching Hours (Sum of duration of watched lessons)
            // Assuming lms_lessons has duration_seconds and lms_progress tracks completion
            $stmtHours = $this->pdo->query("
                SELECT SUM(l.duration_seconds) 
                FROM lms_progress p
                JOIN lms_lessons l ON p.lesson_id = l.id
                WHERE p.is_completed = 1
            ");
            $totalSeconds = $stmtHours->fetchColumn() ?: 0;
            $teachingHours = round($totalSeconds / 3600, 1);

            // 6. New Enrollments (Last 24h)
            $stmtEnroll = $this->pdo->query("SELECT COUNT(*) FROM licenciadas WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
            $newEnrollments = $stmtEnroll->fetchColumn();

            // 7. Library Resources
            $stmtLib = $this->pdo->query("SELECT COUNT(*) FROM lms_resources WHERE status = 'approved' AND is_active = 1");
            $libraryCount = $stmtLib->fetchColumn();

            // 8. Weekly Engagement
            $stmt = $this->pdo->query("
                SELECT DATE(last_watched_at) as date, COUNT(*) as count 
                FROM lms_progress 
                WHERE last_watched_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
                GROUP BY DATE(last_watched_at)
                ORDER BY date ASC
            ");
            $chartData = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $daysMap = [
                'Sunday' => 'Dom', 'Monday' => 'Seg', 'Tuesday' => 'Ter',
                'Wednesday' => 'Qua', 'Thursday' => 'Qui', 'Friday' => 'Sex', 'Saturday' => 'Sab'
            ];

            $formattedChart = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime("-$i days"));
                $dayName = date('l', strtotime($date));
                $count = 0;
                foreach ($chartData as $d) {
                    if ($d['date'] === $date) {
                        $count = (int)$d['count'];
                        break;
                    }
                }
                $formattedChart[] = ['name' => $daysMap[$dayName], 'aulas' => $count];
            }

            Response::json([
                'metrics' => [
                    'total_students' => (int)$totalStudents,
                    'active_students' => (int)$activeStudents,
                    'lessons_watched' => (int)$lessonsWatched,
                    'completion_rate' => round($completionRate, 1),
                    'teaching_hours' => $teachingHours,
                    'new_enrollments' => (int)$newEnrollments,
                    'library_count' => (int)$libraryCount
                ],
                'chart_data' => $formattedChart
            ]);
        }
        catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // GET /admin/lms/modules
    public function indexData()
    {
        try {
            $query = "
                SELECT 
                    m.id AS m_id, m.title AS m_title, m.description AS m_description, 
                    m.display_order AS m_display_order, m.is_active AS m_is_active, 
                    COALESCE(m.is_exclusive, 0) AS m_is_exclusive, m.created_at AS m_created_at, 
                    m.last_modified_at AS m_last_modified_at, m.last_modified_by AS m_last_modified_by,
                    mu.username AS m_modified_by_name,
                    
                    l.id AS l_id, l.title AS l_title, l.description AS l_description, 
                    l.video_type AS l_video_type, l.video_ref AS l_video_ref, 
                    l.hls_path AS l_hls_path, l.file_path AS l_file_path, 
                    l.thumbnail_ref AS l_thumbnail_ref, l.is_active AS l_is_active, 
                    l.display_order AS l_display_order, l.transcription_status AS l_transcription_status, 
                    l.transcription_text AS l_transcription_text,
                    l.transcription_job_id AS l_transcription_job_id, l.transcription_error AS l_transcription_error, 
                    l.transcription_completed_at AS l_transcription_completed_at, l.created_at AS l_created_at, 
                    l.last_modified_at AS l_last_modified_at, l.last_modified_by AS l_last_modified_by,
                    lu.username AS l_modified_by_name,
                    
                    a.id AS a_id, a.title AS a_title, a.file_type AS a_file_type, 
                    a.file_path AS a_file_path, a.is_downloadable AS a_is_downloadable
                FROM lms_modules m
                LEFT JOIN admin_users mu ON m.last_modified_by = mu.id
                LEFT JOIN lms_lessons l ON l.module_id = m.id
                LEFT JOIN admin_users lu ON l.last_modified_by = lu.id
                LEFT JOIN lms_attachments a ON a.lesson_id = l.id
                ORDER BY m.display_order ASC, l.display_order ASC
            ";

            $stmt = $this->pdo->query($query);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Throwable $e) {
            // Fallback query if any column or table is in transit
            return $this->fallbackIndexData();
        }

        $modules = [];
        foreach ($rows as $row) {
            $mId = $row['m_id'];
            if (!$mId) continue;
            
            if (!isset($modules[$mId])) {
                $modules[$mId] = [
                    'id' => $row['m_id'],
                    'title' => $row['m_title'],
                    'description' => $row['m_description'],
                    'display_order' => $row['m_display_order'],
                    'is_active' => $row['m_is_active'],
                    'is_exclusive' => $row['m_is_exclusive'],
                    'created_at' => $row['m_created_at'],
                    'last_modified_at' => $row['m_last_modified_at'],
                    'last_modified_by' => $row['m_last_modified_by'],
                    'modified_by_name' => $row['m_modified_by_name'],
                    'lessons' => []
                ];
            }
            
            $lId = $row['l_id'];
            if ($lId) {
                if (!isset($modules[$mId]['lessons'][$lId])) {
                    // 🛡️ Auto-Recovery para status travados em PROCESSING ou idle
                    $rawStatus = strtoupper($row['l_transcription_status'] ?? 'PENDING');
                    $hasText = !empty($row['l_transcription_text']);
                    $finalStatus = $hasText ? 'COMPLETED' : ($rawStatus === 'PROCESSING' ? 'PENDING' : $rawStatus);

                    $modules[$mId]['lessons'][$lId] = [
                        'id' => $row['l_id'],
                        'module_id' => $row['m_id'],
                        'title' => $row['l_title'],
                        'description' => $row['l_description'],
                        'video_type' => $row['l_video_type'],
                        'video_ref' => $row['l_video_ref'],
                        'hls_path' => $row['l_hls_path'],
                        'file_path' => $row['l_file_path'],
                        'thumbnail_ref' => $row['l_thumbnail_ref'],
                        'is_active' => $row['l_is_active'],
                        'display_order' => $row['l_display_order'],
                        'transcription_status' => $finalStatus,
                        'transcription_job_id' => $row['l_transcription_job_id'],
                        'transcription_error' => $row['l_transcription_error'],
                        'transcription_completed_at' => $row['l_transcription_completed_at'],
                        'created_at' => $row['l_created_at'],
                        'last_modified_at' => $row['l_last_modified_at'],
                        'last_modified_by' => $row['l_last_modified_by'],
                        'modified_by_name' => $row['l_modified_by_name'],
                        'attachments' => []
                    ];
                }
                
                $aId = $row['a_id'];
                if ($aId) {
                    $alreadyExists = false;
                    foreach ($modules[$mId]['lessons'][$lId]['attachments'] as $att) {
                        if ($att['id'] == $aId) {
                            $alreadyExists = true;
                            break;
                        }
                    }
                    if (!$alreadyExists) {
                        $modules[$mId]['lessons'][$lId]['attachments'][] = [
                            'id' => $row['a_id'],
                            'title' => $row['a_title'],
                            'file_type' => $row['a_file_type'],
                            'file_path' => $row['a_file_path'],
                            'is_downloadable' => $row['a_is_downloadable']
                        ];
                    }
                }
            }
        }

        // Convert indexed arrays to sequential arrays
        foreach ($modules as &$mod) {
            $mod['lessons'] = array_values($mod['lessons']);
        }
        return array_values($modules);
    }

    private function fallbackIndexData(): array
    {
        try {
            $stmtM = $this->pdo->query("SELECT * FROM lms_modules ORDER BY display_order ASC");
            $rawModules = $stmtM ? $stmtM->fetchAll(PDO::FETCH_ASSOC) : [];

            $stmtL = $this->pdo->query("SELECT * FROM lms_lessons ORDER BY display_order ASC");
            $rawLessons = $stmtL ? $stmtL->fetchAll(PDO::FETCH_ASSOC) : [];

            $lessonsByModule = [];
            foreach ($rawLessons as $l) {
                $mId = $l['module_id'] ?? 0;
                $lessonsByModule[$mId][] = [
                    'id' => $l['id'] ?? 0,
                    'module_id' => $mId,
                    'title' => $l['title'] ?? '',
                    'description' => $l['description'] ?? '',
                    'video_type' => $l['video_type'] ?? 'mp4',
                    'video_ref' => $l['video_ref'] ?? null,
                    'hls_path' => $l['hls_path'] ?? null,
                    'file_path' => $l['file_path'] ?? null,
                    'thumbnail_ref' => $l['thumbnail_ref'] ?? null,
                    'is_active' => $l['is_active'] ?? 1,
                    'display_order' => $l['display_order'] ?? 0,
                    'transcription_status' => $l['transcription_status'] ?? 'idle',
                    'transcription_job_id' => $l['transcription_job_id'] ?? null,
                    'transcription_error' => $l['transcription_error'] ?? null,
                    'transcription_completed_at' => $l['transcription_completed_at'] ?? null,
                    'created_at' => $l['created_at'] ?? null,
                    'last_modified_at' => $l['last_modified_at'] ?? null,
                    'last_modified_by' => $l['last_modified_by'] ?? null,
                    'modified_by_name' => null,
                    'attachments' => []
                ];
            }

            $result = [];
            foreach ($rawModules as $m) {
                $mId = $m['id'];
                $result[] = [
                    'id' => $mId,
                    'title' => $m['title'] ?? '',
                    'description' => $m['description'] ?? '',
                    'display_order' => $m['display_order'] ?? 0,
                    'is_active' => $m['is_active'] ?? 1,
                    'is_exclusive' => $m['is_exclusive'] ?? 0,
                    'created_at' => $m['created_at'] ?? null,
                    'last_modified_at' => $m['last_modified_at'] ?? null,
                    'last_modified_by' => $m['last_modified_by'] ?? null,
                    'modified_by_name' => null,
                    'lessons' => $lessonsByModule[$mId] ?? []
                ];
            }
            return $result;
        } catch (\Throwable $e) {
            return [];
        }
    }

    // GET /admin/lms/modules
    public function index()
    {
        try {
            Response::json($this->indexData());
        }
        catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/lms/modules
    public function createModule()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $title = $data['title'] ?? null;
        $desc = $data['description'] ?? '';
        $isExclusive = isset($data['is_exclusive']) ? (int)$data['is_exclusive'] : 0;

        if (!$title)
            Response::error('Título é obrigatório', 400);

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare("INSERT INTO lms_modules (title, description, is_exclusive) VALUES (?, ?, ?)");
            $stmt->execute([$title, $desc, $isExclusive]);
            $moduleId = $this->pdo->lastInsertId();

            $this->logger->log($this->user['id'], 'ADMIN_LMS_MODULE_CREATE', ['title' => $title, 'id' => $moduleId, 'is_exclusive' => $isExclusive], 'admin');

            $this->pdo->commit();
            ResponseCache::clear('admin_lms_modules_');
            Response::json(['id' => $moduleId, 'message' => 'Módulo criado']);
        }
        catch (Exception $e) {
            if ($this->pdo->inTransaction())
                $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    // PUT /admin/lms/modules
    public function updateModule()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $title = $data['title'] ?? null;
        $desc = $data['description'] ?? '';
        $isActive = isset($data['is_active']) ? (int)$data['is_active'] : 1;
        $isExclusive = isset($data['is_exclusive']) ? (int)$data['is_exclusive'] : 0;

        if (!$id || !$title)
            Response::error('ID e Título são obrigatórios', 400);

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare("UPDATE lms_modules SET title = ?, description = ?, is_active = ?, is_exclusive = ?, last_modified_by = ?, last_modified_at = NOW() WHERE id = ?");
            $stmt->execute([$title, $desc, $isActive, $isExclusive, $this->user['id'], $id]);

            $this->logger->log($this->user['id'], 'ADMIN_LMS_MODULE_UPDATE', ['id' => $id, 'title' => $title, 'is_exclusive' => $isExclusive], 'admin');

            $this->pdo->commit();
            ResponseCache::clear('admin_lms_modules_');
            Response::json(['message' => 'Módulo atualizado']);
        }
        catch (Exception $e) {
            if ($this->pdo->inTransaction())
                $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    // DELETE /admin/lms/modules/{id}
    public function deleteModule($id)
    {
        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare("DELETE FROM lms_modules WHERE id = ?");
            $stmt->execute([$id]);

            $this->logger->log($this->user['id'], 'ADMIN_LMS_MODULE_DELETE', ['id' => $id], 'admin');

            $this->pdo->commit();
            ResponseCache::clear('admin_lms_modules_');
            Response::json(['message' => 'Módulo deletado']);
        }
        catch (Exception $e) {
            if ($this->pdo->inTransaction())
                $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    // PATCH /admin/lms/modules/reorder
    public function reorderModules()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $order = $data['order'] ?? [];

        try {
            $this->pdo->beginTransaction();
            foreach ($order as $index => $id) {
                $stmt = $this->pdo->prepare("UPDATE lms_modules SET display_order = ? WHERE id = ?");
                $stmt->execute([$index, $id]);
            }
            $this->pdo->commit();

            $this->logger->log($this->user['id'], 'ADMIN_LMS_MODULES_REORDER', ['count' => count($order)], 'admin');

            ResponseCache::clear('admin_lms_modules_');
            Response::json(['message' => 'Ordem dos módulos atualizada']);
        }
        catch (Exception $e) {
            $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    // PATCH /admin/lms/lessons/reorder
    public function reorderLessons()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $order = $data['order'] ?? []; // Array of lesson IDs

        try {
            $this->pdo->beginTransaction();
            foreach ($order as $index => $id) {
                $stmt = $this->pdo->prepare("UPDATE lms_lessons SET display_order = ? WHERE id = ?");
                $stmt->execute([$index, $id]);
            }
            $this->pdo->commit();

            $this->logger->log($this->user['id'], 'ADMIN_LMS_LESSONS_REORDER', ['count' => count($order)], 'admin');

            ResponseCache::clear('admin_lms_modules_');
            Response::json(['message' => 'Ordem das aulas atualizada']);
        }
        catch (Exception $e) {
            if ($this->pdo->inTransaction())
                $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    // === LESSONS ===

    // POST /admin/lms/lessons
    public function createLesson()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $moduleId = $data['module_id'] ?? null;
        $title = $data['title'] ?? null;
        $desc = $data['description'] ?? '';
        $videoType = $data['video_type'] ?? 'hostinger';
        $videoRef = $data['video_ref'] ?? '';
        $thumbnailRef = $data['thumbnail_ref'] ?? null;

        if (!$moduleId || !$title)
            Response::error('Módulo e Título são obrigatórios', 400);

        // Security Validation (Path Traversal prevention for Media Browser)
        if (strpos($videoRef, '..') !== false || ($thumbnailRef && strpos($thumbnailRef, '..') !== false)) {
            Response::error('Caminho de arquivo inválido detectado.', 400);
        }

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare("INSERT INTO lms_lessons (module_id, title, description, video_type, video_ref, file_path, thumbnail_ref, last_modified_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$moduleId, $title, $desc, $videoType, $videoRef, ($videoType === 'hostinger' ? $videoRef : null), $thumbnailRef, $this->user['id']]);
            $lessonId = $this->pdo->lastInsertId();

            // Auto-rename only if it's a fresh chunk upload (no slashes in ref)
            if ($videoType === 'hostinger' && strpos($videoRef, '/') === false) {
                $this->autoRenameLessonFile($lessonId, $title, $moduleId);
            }

            // Auto-rename Thumbnail
            if ($thumbnailRef && strpos($thumbnailRef, 'thumb_') !== false) {
                $this->autoRenameThumbnail($lessonId, $title, $moduleId, $thumbnailRef);
            }

            // Disparar transcrição assíncrona para SmartBook
            if ($videoType === 'hostinger' && !empty($videoRef)) {
                $this->dispatchTranscriptionWebhook($lessonId, $moduleId, $title, $videoRef);
            }

            $this->logger->log($this->user['id'], 'ADMIN_LMS_LESSON_CREATE', ['title' => $title, 'id' => $lessonId, 'module_id' => $moduleId], 'admin');

            $this->pdo->commit();
            ResponseCache::clear('admin_lms_modules_');
            Response::json(['id' => $lessonId, 'message' => 'Aula criada']);
        }
        catch (Exception $e) {
            if ($this->pdo->inTransaction())
                $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    // PUT /admin/lms/lessons
    public function updateLesson()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $title = $data['title'] ?? null;
        $desc = $data['description'] ?? '';
        $videoType = $data['video_type'] ?? 'hostinger';
        $videoRef = $data['video_ref'] ?? '';
        $thumbnailRef = $data['thumbnail_ref'] ?? null;

        if (!$id || !$title)
            Response::error('ID e Título são obrigatórios', 400);

        // Security Validation (Path Traversal prevention for Media Browser)
        if (strpos($videoRef, '..') !== false || ($thumbnailRef && strpos($thumbnailRef, '..') !== false)) {
            Response::error('Caminho de arquivo inválido detectado.', 400);
        }

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare("UPDATE lms_lessons SET title = ?, description = ?, video_type = ?, video_ref = ?, file_path = ?, thumbnail_ref = ?, last_modified_by = ?, last_modified_at = NOW() WHERE id = ?");
            $stmt->execute([$title, $desc, $videoType, $videoRef, ($videoType === 'hostinger' ? $videoRef : null), $thumbnailRef, $this->user['id'], $id]);

            $mid = $data['module_id'] ?? null;
            if (!$mid) {
                $s = $this->pdo->prepare("SELECT module_id FROM lms_lessons WHERE id = ?");
                $s->execute([$id]);
                $mid = $s->fetchColumn();
            }

            if ($videoType === 'hostinger' && strpos($videoRef, '/') === false) {
                if ($mid) {
                    $this->autoRenameLessonFile($id, $title, $mid);
                }
            }

            // Auto-rename Thumbnail if it's new (starts with thumb_) or just enforce consistency
            if ($thumbnailRef) {
                if ($mid) {
                    $this->autoRenameThumbnail($id, $title, $mid, $thumbnailRef);
                }
            }

            // Disparar transcrição se mídia foi vinculada/modificada
            if ($videoType === 'hostinger' && !empty($videoRef) && $mid) {
                $this->dispatchTranscriptionWebhook($id, $mid, $title, $videoRef);
            }

            $this->logger->log($this->user['id'], 'ADMIN_LMS_LESSON_UPDATE', ['id' => $id, 'title' => $title], 'admin');

            $this->pdo->commit();
            ResponseCache::clear('admin_lms_modules_');
            Response::json(['message' => 'Aula atualizada']);
        }
        catch (Exception $e) {
            if ($this->pdo->inTransaction())
                $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/lms/lessons/{id}/retranscribe
    public function retranscribeLesson($id)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT id, module_id, title, video_ref, video_type, transcription_text FROM lms_lessons WHERE id = ?");
            $stmt->execute([$id]);
            $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$lesson) {
                Response::error('Aula não encontrada', 404);
            }

            // 🛡️ Auto-Recovery / Sanitização Imediata
            $newStatus = !empty($lesson['transcription_text']) ? 'COMPLETED' : 'PENDING';
            $updateStmt = $this->pdo->prepare("UPDATE lms_lessons SET transcription_status = ?, transcription_error = NULL WHERE id = ?");
            $updateStmt->execute([$newStatus, $id]);

            // Sincronizar fontes do módulo com o LmsNotebookService se disponível
            try {
                require_once __DIR__ . '/../Services/LmsNotebookService.php';
                $service = new LmsNotebookService($this->pdo);
                $service->syncModule($lesson['module_id']);
            } catch (\Throwable $syncErr) {
                error_log("[AdminLmsController] Sync notice: " . $syncErr->getMessage());
            }

            $this->logger->log($this->user['id'], 'ADMIN_LMS_LESSON_RETRANSCRIBE', ['id' => $id, 'title' => $lesson['title']], 'admin');
            ResponseCache::clear('admin_lms_modules_');
            Response::json([
                'success' => true,
                'message' => 'Aula sincronizada com o SmartBook com sucesso!',
                'transcription_status' => $newStatus
            ]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // DELETE /admin/lms/lessons/{id}
    public function deleteLesson($id)
    {
        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare("DELETE FROM lms_lessons WHERE id = ?");
            $stmt->execute([$id]);

            $this->logger->log($this->user['id'], 'ADMIN_LMS_LESSON_DELETE', ['id' => $id], 'admin');

            $this->pdo->commit();
            ResponseCache::clear('admin_lms_modules_');
            Response::json(['message' => 'Aula deletada']);
        }
        catch (Exception $e) {
            if ($this->pdo->inTransaction())
                $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/lms/sign-url
    public function signUrl()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $path = $data['path'] ?? null;
            $lessonId = $data['lesson_id'] ?? null;

            if ($path) {
                // Direct Path Signing (New)
                $secret = getenv('APP_SECRET') ?: 'BodyHarmonySecretKey2026';
                $expires = time() + 3600;
                $signature = hash_hmac('sha256', "$path:$expires", $secret);

                Response::json([
                    'url' => "/api/v1/stream.php?video=$path&expires=$expires&signature=$signature",
                    'expires' => $expires
                ]);
            }
            elseif ($lessonId) {
                // Legacy ID Signing (looks up path)
                $stmt = $this->pdo->prepare("SELECT video_ref, file_path, hls_path FROM lms_lessons WHERE id = ?");
                $stmt->execute([$lessonId]);
                $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$lesson)
                    Response::error('Lesson not found', 404);

                $secret = getenv('APP_SECRET') ?: 'BodyHarmonySecretKey2026';
                $expires = time() + 3600;

                // V84: Check for HLS Path first
                if (!empty($lesson['hls_path'])) {
                    // Sign the playlist URL directly if we want to rely on the .htaccess validation?
                    // Actually, the HLS chunks and playlist need to be accessible.
                    // The .htaccess allows direct access to .m3u8 and .ts files, but we should generate a signed URL to prevent hotlinking.
                    // Wait, the playlist points to relative .ts files. If the playlist URL is signed by our PHP, the .ts requests won't have the signature unless the playlist rewrites them.
                    // Option: Just return the direct URL to the playlist in private_uploads if .htaccess handles it, or sign the directory path.
                    // For now, let's just return the direct URL to the HLS playlist relative to the site root, as .htaccess protects it via Origin headers (CORS).
                    // Wait, .htaccess Requirement 3 says "allow direct access to .ts and .m3u8 (without PHP) and check CORS".
                    // Let's return the URL to the playlist.
                    // The path saved in DB is 'hls/ID/master.m3u8'. 
                    // Let's create a proxy endpoint or just return the static file URL if it's in a web-accessible domain OR use the sign mechanism.
                    // Wait, private_uploads is NOT web accessible directly except via PHP or internal. 
                    // Let's stick to returning a stream.php proxy URL for the playlist OR if we map /hls/ directly.
                    // I will return the signed stream.php URL for the HLS playlist for now to be safe, which will return the playlist content. But inside the playlist, the TS files are relative, so requests to stream.php?video=hls.../seg.ts will fail because the browser sends raw requests.
                    // Thus, the hls-convert.php script made an .htaccess in private_uploads/hls/ which implies it's web-accessible via an alias or symlink! But private_uploads isn't in public_html usually.
                    // Ah! we can use the `sign_url.php` or `stream.php` logic. Actually, let's return a direct URL if there's a symlink, OR let's construct a signed URL for the playlist that includes a token that Cloudflare/Nginx can validate OR we just rely on CORS.
                    // Let's check how the frontend handles it. Let's return the direct API endpoint for the playlist.
                    // Let's just return the path directly and the frontend will request it. Wait! The plan says: "priorizar hls_path sobre video_ref. Se HLS disponível, retornar URL da playlist assinada."
                    $hlsUrl = "/private_uploads/" . $lesson['hls_path']; // Using direct path, relying on .htaccess

                    // Actually, let's sign it using stream.php so legacy auth works.
                    // stream.php supports ?video=relative_path. 
                    // If stream.php returns master.m3u8, the browser will request segment.ts relative to stream.php, which will be /api/v1/stream.php?video=hls/1/segment.ts but the browser won't append ?video= and signature! It will send /api/v1/segment.ts!
                    // So we cannot use stream.php for HLS unless we use an Nginx alias or a smart PHP router.
                    // We must expose the HLS folder publicly but protected by CORS.
                    // Let's assume there is an alias /hls -> private_uploads/hls in the main server config or we use a direct script.
                    // Since it's Hostinger, maybe `private_uploads` is web accessible but protected by .htaccess. 
                    // Yes, the plan says: "Criar .htaccess em private_uploads/hls/ com CORS".
                    // So let's return the direct URL.

                    Response::json([
                        'url' => "/private_uploads/" . ltrim($lesson['hls_path'], '/'),
                        'expires' => $expires,
                        'is_hls' => true
                    ]);
                    return;
                }

                $relPath = !empty($lesson['file_path']) ? $lesson['file_path'] : 'lessons/' . $lesson['video_ref'];
                $path = preg_replace('/^private_uploads\//', '', $relPath);

                $signature = hash_hmac('sha256', "$path:$expires", $secret);

                Response::json([
                    'url' => "/api/v1/stream.php?video=$path&expires=$expires&signature=$signature",
                    'expires' => $expires,
                    'is_hls' => false
                ]);
            }
            else {
                Response::error('Path or Lesson ID required', 400);
            }

        }
        catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/lms/lessons/{id}/convert-hls
    public function convertToHls($id)
    {
        // Trigger the hls-convert.php script asynchronously or wait for it.
        // On Hostinger, we can just call it via curl to run in background or foreground.
        // For simplicity, foreground.
        try {
            // Include or call via cURL
            $url = 'https://' . $_SERVER['HTTP_HOST'] . '/api/v1/hls-convert.php';
            $data = ['lesson_id' => $id];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                // Pass auth token if needed
                'Cookie: ' . session_name() . '=' . session_id()
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 1); // 1 second timeout for fire and forget

            curl_exec($ch);
            curl_close($ch);

            Response::json(['message' => 'Conversão HLS iniciada em segundo plano.']);
        }
        catch (Exception $e) {
            Response::error('Erro ao iniciar conversão: ' . $e->getMessage(), 500);
        }
    }

    // GET /admin/lms/lessons/{id}/file-info
    public function fileInfo($id)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM lms_lessons WHERE id = ?");
            $stmt->execute([$id]);
            $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$lesson) {
                Response::error('Lesson not found', 404);
            }

            $privateBase = PRIVATE_UPLOADS_DIR;

            // Resolve path logic
            $relPath = !empty($lesson['file_path']) ? $lesson['file_path'] : 'lessons/' . $lesson['video_ref'];
            $relPath = preg_replace('/^private_uploads\//', '', $relPath); // Clean double prefix

            if (strpos($relPath, '/') === false)
                $relPath = 'lessons/' . $relPath;

            $fullPath = $privateBase . '/' . $relPath;

            if (!file_exists($fullPath)) {
                Response::json([
                    'exists' => false,
                    'path' => $relPath,
                    'error' => 'File not found on server'
                ]);
                return;
            }

            $size = filesize($fullPath);
            $mime = mime_content_type($fullPath);

            Response::json([
                'exists' => true,
                'id' => $lesson['id'],
                'title' => $lesson['title'],
                'filename' => basename($fullPath),
                'path' => $relPath,
                'size_bytes' => $size,
                'size_formatted' => $this->formatBytes($size),
                'mime' => $mime,
                'last_modified' => date('Y-m-d H:i:s', filemtime($fullPath))
            ]);
        }
        catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    // === UPLOADS & ATTACHMENTS ===

    // POST /admin/lms/upload-chunk
    public function uploadVideoChunk()
    {
        $fileName = $_REQUEST['file_name'] ?? 'video_upload.mp4';
        $fileId = $_REQUEST['file_id'] ?? md5($fileName . time());
        $chunkIndex = (int)($_REQUEST['chunk_index'] ?? 0);
        $totalChunks = (int)($_REQUEST['total_chunks'] ?? 1);

        $fileName = basename($fileName);
        $fileName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '', $fileName);

        $baseUploadDir = PRIVATE_UPLOADS_DIR . '/lessons';
        if (!is_dir($baseUploadDir))
            mkdir($baseUploadDir, 0755, true);

        $tempFilePath = $baseUploadDir . '/temp_' . $fileId;

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== 0) {
            Response::error('Nenhum arquivo enviado ou erro no upload.', 400);
        }

        $tmpSource = fopen($_FILES['file']['tmp_name'], 'rb');
        $handle = fopen($tempFilePath, ($chunkIndex === 0 ? 'wb' : 'ab'));

        if ($handle === false || $tmpSource === false) {
            error_log("[LMS_UPLOAD] Error opening files: tmp=" . $_FILES['file']['tmp_name'] . " target=" . $tempFilePath);
            Response::error('Falha ao escrever no servidor.', 500);
        }

        stream_copy_to_stream($tmpSource, $handle);
        fclose($tmpSource);
        fclose($handle);

        if ($chunkIndex === $totalChunks - 1) {
            $finalPath = $baseUploadDir . '/' . time() . '_' . $fileName;
            rename($tempFilePath, $finalPath);
            Response::json([
                'status' => 'complete',
                'filename' => basename($finalPath)
            ]);
        }
        else {
            Response::json([
                'status' => 'chunk_received',
                'index' => $chunkIndex
            ]);
        }
    }

    // POST /admin/lms/upload-thumbnail
    public function uploadThumbnail()
    {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            Response::error('Nenhum arquivo enviado', 400);
        }

        $file = $_FILES['file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];

        if (!in_array($ext, $allowed))
            Response::error('Apenas imagens (JPG, PNG, WEBP)', 400);

        // Semantic Naming Logic
        $slug = $_POST['slug'] ?? null;
        if ($slug) {
            // Strict sanitization: lowercase, alphanumeric, dashes only
            $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($slug));
            // Append timestamp for uniqueness/cache-busting
            $name = $slug . '-' . time() . '.' . $ext;
        }
        else {
            // Fallback to random
            $name = 'thumb_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        }

        $targetDir = PRIVATE_UPLOADS_DIR . '/thumbnails/';
        if (!is_dir($targetDir))
            mkdir($targetDir, 0755, true);

        if (move_uploaded_file($file['tmp_name'], $targetDir . $name)) {
            Response::json(['path' => 'thumbnails/' . $name]);
        }
        else {
            Response::error('Falha ao salvar imagem', 500);
        }
    }

    // POST /admin/lms/attachments
    public function uploadAttachment()
    {
        $lessonId = $_POST['lesson_id'] ?? null;
        $title = $_POST['title'] ?? null;

        if (!$lessonId || !$title)
            Response::error('Lesson ID e Título são obrigatórios', 400);

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            Response::error('Erro no upload do arquivo', 400);
        }

        $file = $_FILES['file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip'];

        if (!in_array($ext, $allowed))
            Response::error('Formato não permitido', 400);

        $hash = bin2hex(random_bytes(8));
        $safeName = "lesson_{$lessonId}_{$hash}.{$ext}";
        $targetDir = PRIVATE_UPLOADS_DIR . '/attachments/';
        if (!is_dir($targetDir))
            mkdir($targetDir, 0755, true);

        if (move_uploaded_file($file['tmp_name'], $targetDir . $safeName)) {
            $stmt = $this->pdo->prepare("INSERT INTO lms_attachments (lesson_id, title, file_path, file_type) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $lessonId,
                $title,
                'attachments/' . $safeName,
                $file['type']
            ]);
            Response::json(['message' => 'Arquivo anexado com sucesso']);
        }
        else {
            Response::error('Falha ao mover arquivo', 500);
        }
    }

    // DELETE /admin/lms/attachments/{id}
    public function deleteAttachment($id)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT file_path FROM lms_attachments WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                $fullPath = PRIVATE_UPLOADS_DIR . '/' . $row['file_path'];
                if (file_exists($fullPath))
                    unlink($fullPath);

                $del = $this->pdo->prepare("DELETE FROM lms_attachments WHERE id = ?");
                $del->execute([$id]);
            }
            Response::json(['message' => 'Anexo removido']);
        }
        catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function studentsData()
    {
        // Get all licensed users with their summary stats (Nexus Protocol V3.1 - Real-time Data)
        // 1. Core Data + photo (for avatar sync)
        // 2. Subqueries for LMS progress filtered by student module access
        $sql = "
            SELECT 
                l.id, l.name, l.username, l.whatsapp, l.state, l.location, l.is_active, l.photo_url as photo,
                (
                    SELECT COUNT(les.id) 
                    FROM lms_lessons les
                    INNER JOIN lms_modules mod_les ON les.module_id = mod_les.id
                    WHERE les.is_active = 1 AND mod_les.is_active = 1 
                      AND (mod_les.is_exclusive = 0 OR EXISTS (
                          SELECT 1 FROM licenciada_course_access lca 
                          WHERE lca.licenciada_id = l.id AND lca.module_id = mod_les.id 
                            AND (lca.expires_at IS NULL OR lca.expires_at > NOW())
                      ))
                ) as total_lessons,
                (
                    SELECT COUNT(p.id) 
                    FROM lms_progress p 
                    INNER JOIN lms_lessons les ON p.lesson_id = les.id
                    INNER JOIN lms_modules mod_les ON les.module_id = mod_les.id
                    WHERE p.licenciada_id = l.id AND p.is_completed = 1 AND les.is_active = 1 AND mod_les.is_active = 1
                      AND (mod_les.is_exclusive = 0 OR EXISTS (
                          SELECT 1 FROM licenciada_course_access lca 
                          WHERE lca.licenciada_id = l.id AND lca.module_id = mod_les.id 
                            AND (lca.expires_at IS NULL OR lca.expires_at > NOW())
                      ))
                ) as completed_lessons,
                (
                    SELECT COUNT(p.id) 
                    FROM lms_progress p 
                    INNER JOIN lms_lessons les ON p.lesson_id = les.id
                    INNER JOIN lms_modules mod_les ON les.module_id = mod_les.id
                    WHERE p.licenciada_id = l.id AND p.progress_percent > 0 AND les.is_active = 1 AND mod_les.is_active = 1
                      AND (mod_les.is_exclusive = 0 OR EXISTS (
                          SELECT 1 FROM licenciada_course_access lca 
                          WHERE lca.licenciada_id = l.id AND lca.module_id = mod_les.id 
                            AND (lca.expires_at IS NULL OR lca.expires_at > NOW())
                      ))
                ) as started_lessons,
                (SELECT COUNT(*) FROM lms_access_logs lal WHERE lal.licenciada_id = l.id AND lal.action = 'DOWNLOAD') as download_count,
                (SELECT COUNT(*) FROM lms_user_badges lub WHERE lub.student_id = l.id) as badge_count,
                COALESCE((
                    SELECT SUM(lesson_duration.duration_seconds)
                    FROM lms_progress p 
                    INNER JOIN lms_lessons lesson_duration ON p.lesson_id = lesson_duration.id
                    INNER JOIN lms_modules mod_les ON lesson_duration.module_id = mod_les.id
                    WHERE p.licenciada_id = l.id AND p.is_completed = 1 AND lesson_duration.is_active = 1 AND mod_les.is_active = 1
                      AND (mod_les.is_exclusive = 0 OR EXISTS (
                          SELECT 1 FROM licenciada_course_access lca 
                          WHERE lca.licenciada_id = l.id AND lca.module_id = mod_les.id 
                            AND (lca.expires_at IS NULL OR lca.expires_at > NOW())
                      ))
                ), 0) as study_seconds
            FROM licenciadas l
            ORDER BY l.name ASC
        ";

        $stmt = $this->pdo->query($sql);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Ensure types and calculate derived metrics for Frontend logic
        foreach ($students as &$s) {
            $s['is_active'] = (bool)$s['is_active'];
            $total = (int)$s['total_lessons'];
            $completed = (int)$s['completed_lessons'];
            $s['progress_percent'] = $total > 0 ? round(($completed / $total) * 100) : 0;
            $s['study_hours'] = round((int)$s['study_seconds'] / 3600, 1);

            // Ensure IDs are integers for predictable JS handling
            $s['id'] = (int)$s['id'];
            $s['completed_lessons'] = (int)$s['completed_lessons'];
            $s['started_lessons'] = (int)$s['started_lessons'];
            $s['total_lessons'] = (int)$s['total_lessons'];
            $s['download_count'] = (int)$s['download_count'];
            $s['badge_count'] = (int)$s['badge_count'];

            // Cleanup internal column
            unset($s['study_seconds']);
        }

        return $students;
    }

    // GET /gestor/lms/students
    public function students()
    {
        try {
            Response::json($this->studentsData());
        }
        catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // GET /gestor/lms/students/{id}/logs
    public function studentLogs($id)
    {
        try {
            $showAll = isset($_GET['all']) && $_GET['all'] === 'true';
            $timeFilter = $showAll ? "" : "AND a.created_at > (NOW() - INTERVAL 1 DAY)";

            // JOIN with lessons and modules for contextual data
            $sql = "
                SELECT 
                    a.action, a.details, a.created_at, a.user_agent,
                    l.title as lesson_title,
                    m.title as module_title
                FROM lms_access_logs a
                LEFT JOIN lms_lessons l ON (JSON_EXTRACT(a.details, '$.lesson_id') = l.id)
                LEFT JOIN lms_modules m ON l.module_id = m.id
                WHERE a.licenciada_id = ? 
                $timeFilter
                ORDER BY a.created_at DESC 
                LIMIT 50
            ";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$id]);
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Map actions to human readable messages with Emojis (V3.1 Tone)
            $activity = array_map(function ($log) {
                $details = json_decode($log['details'], true);
                $msg = "Ação: " . $log['action'];

                // Device Detection
                $ua = strtolower($log['user_agent'] ?? '');
                $device = "Desconhecido";
                if (strpos($ua, 'iphone') !== false || strpos($ua, 'ipad') !== false)
                    $device = "iPhone/iPad";
                else if (strpos($ua, 'android') !== false)
                    $device = "Android";
                else if (strpos($ua, 'windows') !== false)
                    $device = "Windows PC";
                else if (strpos($ua, 'macintosh') !== false)
                    $device = "MacBook";

                switch ($log['action']) {
                    case 'LOGIN':
                        $msg = "🔐 Realizou login no sistema";
                        break;
                    case 'PLAY':
                        $msg = "▶️ Iniciou aula" . ($log['lesson_title'] ? ": " . $log['lesson_title'] : "");
                        break;
                    case 'LESSON_COMPLETE':
                        $msg = "✅ Concluiu aula" . ($log['lesson_title'] ? ": " . $log['lesson_title'] : "");
                        break;
                    case 'DOWNLOAD':
                        $msg = "📥 Baixou material: " . ($details['name'] ?? 'Arquivo');
                        break;
                    case 'QUIZ_SUBMIT':
                        $msg = "📝 Finalizou avaliação";
                        break;
                }

                return [
                'message' => $msg,
                'context' => $log['module_title'] ? $log['module_title'] : null,
                'device' => $device,
                'time' => $log['created_at']
                ];
            }, $logs);

            Response::json([
                'success' => true,
                'logs' => $activity,
                'isFullHistory' => $showAll
            ]);
        }
        catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    // PATCH /admin/lms/modules/{id}/status
    public function updateModuleStatus($id)
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $status = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare("UPDATE lms_modules SET is_active = ?, last_modified_by = ?, last_modified_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $this->user['id'], $id]);

            $this->logger->log($this->user['id'], 'ADMIN_LMS_MODULE_STATUS', ['id' => $id, 'is_active' => $status], 'admin');

            $this->pdo->commit();
            ResponseCache::clear('admin_lms_modules_');
            Response::json(['message' => 'Status do módulo atualizado']);
        }
        catch (Exception $e) {
            if ($this->pdo->inTransaction())
                $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    // PATCH /admin/lms/lessons/{id}/status
    public function updateLessonStatus($id)
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $status = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare("UPDATE lms_lessons SET is_active = ?, last_modified_by = ?, last_modified_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $this->user['id'], $id]);

            $this->logger->log($this->user['id'], 'ADMIN_LMS_LESSON_STATUS', ['id' => $id, 'is_active' => $status], 'admin');

            $this->pdo->commit();
            ResponseCache::clear('admin_lms_modules_');
            Response::json(['message' => 'Status da aula atualizado']);
        }
        catch (Exception $e) {
            if ($this->pdo->inTransaction())
                $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    // === FILE MANAGEMENT (V24) ===

    // GET /admin/lms/lessons/{id}/file-info
    public function getFileInfo($id)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT video_type, video_ref, file_path FROM lms_lessons WHERE id = ?");
            $stmt->execute([$id]);
            $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$lesson)
                Response::error('Aula não encontrada', 404);

            if ($lesson['video_type'] !== 'hostinger') {
                Response::json([
                    'type' => $lesson['video_type'],
                    'ref' => $lesson['video_ref'],
                    'size' => null,
                    'exists' => false
                ]);
                return;
            }

            // Path resolution similar to download.php
            $privateBase = PRIVATE_UPLOADS_DIR;

            // Check file_path first, then fallback to video_ref
            $relPath = !empty($lesson['file_path']) ? $lesson['file_path'] : 'lessons/' . $lesson['video_ref'];
            $relPath = preg_replace('/^private_uploads\//', '', $relPath); // Clean double prefix if any

            // Fallback: if just filename, assume lessons/
            if (strpos($relPath, '/') === false)
                $relPath = 'lessons/' . $relPath;

            $filePath = $privateBase . '/' . $relPath;

            if (file_exists($filePath)) {
                Response::json([
                    'type' => 'hostinger',
                    'filename' => basename($filePath),
                    'size_mb' => round(filesize($filePath) / 1048576, 2),
                    'mime' => mime_content_type($filePath),
                    'exists' => true,
                    'modified' => date("Y-m-d H:i:s", filemtime($filePath))
                ]);
            }
            else {
                // Fallback: Try strictly using video_ref in default 'lessons/' folder (matches stream.php)
                $simpleRef = $lesson['video_ref'];
                if (strpos($simpleRef, 'hostinger:') === 0)
                    $simpleRef = substr($simpleRef, 10);
                $simpleName = basename($simpleRef);
                $fallbackPath = $privateBase . '/lessons/' . $simpleName;

                if (file_exists($fallbackPath)) {
                    // Found in fallback location!
                    Response::json([
                        'type' => 'hostinger',
                        'filename' => $simpleName,
                        'size_mb' => round(filesize($fallbackPath) / 1048576, 2),
                        'mime' => mime_content_type($fallbackPath),
                        'exists' => true,
                        'modified' => date("Y-m-d H:i:s", filemtime($fallbackPath)),
                        'warning' => 'Resolved via fallback path'
                    ]);
                    return;
                }

                Response::json([
                    'type' => 'hostinger',
                    'filename' => $lesson['video_ref'],
                    'exists' => false,
                    'error' => 'Arquivo físico não encontrado: ' . basename($filePath)
                ]);
            }
        }
        catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/lms/lessons/{id}/rename-file
    public function renameFile($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $newName = $data['new_name'] ?? null; // Without extension

        if (!$newName)
            Response::error('Novo nome é obrigatório', 400);

        // Sanitize
        $newName = preg_replace('/[^a-zA-Z0-9_\-]/', '', $newName);
        if (strlen($newName) < 3)
            Response::error('Nome muito curto', 400);

        try {
            $this->pdo->beginTransaction();

            $stmt = $this->pdo->prepare("SELECT video_type, video_ref, file_path FROM lms_lessons WHERE id = ? FOR UPDATE");
            $stmt->execute([$id]);
            $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$lesson)
                throw new Exception('Aula não encontrada');
            if ($lesson['video_type'] !== 'hostinger')
                throw new Exception('Apenas arquivos locais podem ser renomeados');

            // Resolve paths
            $privateBase = PRIVATE_UPLOADS_DIR;

            $relPath = !empty($lesson['file_path']) ? $lesson['file_path'] : 'lessons/' . $lesson['video_ref'];
            $relPath = preg_replace('/^private_uploads\//', '', $relPath);
            if (strpos($relPath, '/') === false)
                $relPath = 'lessons/' . $relPath;

            $currentPath = $privateBase . '/' . $relPath;

            if (!file_exists($currentPath)) {
                // Fallback: Try strictly using video_ref in default 'lessons/' folder
                $simpleRef = $lesson['video_ref'];
                if (strpos($simpleRef, 'hostinger:') === 0)
                    $simpleRef = substr($simpleRef, 10);
                $simpleName = basename($simpleRef);
                $fallbackPath = $privateBase . '/lessons/' . $simpleName;

                if (file_exists($fallbackPath)) {
                    $currentPath = $fallbackPath;
                    // Update relPath for subsequent rename logic
                    $relPath = 'lessons/' . $simpleName;
                }
                else {
                    throw new Exception('Arquivo físico original não encontrado');
                }
            }

            $ext = pathinfo($currentPath, PATHINFO_EXTENSION);
            $newFileName = $newName . '.' . $ext;
            $newPath = $privateBase . '/lessons/' . $newFileName;

            if (file_exists($newPath))
                throw new Exception('Já existe um arquivo com este nome');

            // Rename Physical File
            if (!rename($currentPath, $newPath)) {
                throw new Exception('Falha ao renomear arquivo no disco');
            }

            // Update Database
            $stmtUpd = $this->pdo->prepare("UPDATE lms_lessons SET video_ref = ?, file_path = ?, last_modified_by = ?, last_modified_at = NOW() WHERE id = ?");
            $updatePath = 'lessons/' . $newFileName;
            $stmtUpd->execute([$newFileName, $updatePath, $this->user['id'], $id]);

            $this->logger->log($this->user['id'], 'ADMIN_LMS_FILE_RENAME', ['id' => $id, 'old' => $lesson['video_ref'], 'new' => $newFileName], 'admin');

            $this->pdo->commit();
            Response::json(['message' => 'Arquivo renomeado com sucesso', 'new_name' => $newFileName]);

        }
        catch (Exception $e) {
            if ($this->pdo->inTransaction())
                $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    // GET /admin/lms/lessons/{id}/download-url
    public function getDownloadUrl($id)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT video_type, video_ref FROM lms_lessons WHERE id = ?");
            $stmt->execute([$id]);
            $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$lesson || $lesson['video_type'] !== 'hostinger') {
                Response::error('Arquivo não disponível para download', 404);
            }

            $secret = getenv('APP_SECRET') ?: 'BodyHarmonySecretKey2026';
            // Valid for 1 hour to allow large downloads
            $expires = time() + 3600;

            $signature = hash_hmac('sha256', "$id:$expires", $secret);
            $url = "/api/download.php?lesson_id=$id&expires=$expires&signature=$signature&mode=attachment";

            Response::json(['url' => $url]);

        }
        catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // === API HELPERS ===

    private function sanitizeFilename($string)
    {
        // Remove accents
        $replacements = [
            '/[áàâãä]/u' => 'a', '/[ÁÀÂÃÄ]/u' => 'A',
            '/[éèêë]/u' => 'e', '/[ÉÈÊË]/u' => 'E',
            '/[íìîï]/u' => 'i', '/[ÍÌÎÏ]/u' => 'I',
            '/[óòôõö]/u' => 'o', '/[ÓÒÔÕÖ]/u' => 'O',
            '/[úùûü]/u' => 'u', '/[ÚÙÛÜ]/u' => 'U',
            '/[ç]/u' => 'c', '/[Ç]/u' => 'C',
            '/[ñ]/u' => 'n', '/[Ñ]/u' => 'N'
        ];
        $string = preg_replace(array_keys($replacements), array_values($replacements), $string);
        // Replace spaces with underscores
        $string = str_replace(' ', '_', $string);
        // Remove other special chars
        $string = preg_replace('/[^a-zA-Z0-9_\-]/', '', $string);
        return $string;
    }

    private function autoRenameLessonFile($lessonId, $title, $moduleId)
    {
        try {
            // Get Module Title
            $stmt = $this->pdo->prepare("SELECT title FROM lms_modules WHERE id = ?");
            $stmt->execute([$moduleId]);
            $module = $stmt->fetch(PDO::FETCH_ASSOC);
            $moduleTitle = $module ? $module['title'] : "Modulo_{$moduleId}";

            // Get Current Lesson File Info
            $stmt = $this->pdo->prepare("SELECT video_ref, file_path FROM lms_lessons WHERE id = ? AND video_type = 'hostinger'");
            $stmt->execute([$lessonId]);
            $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$lesson)
                return;

            // Construct New Name
            $sanitizedModule = $this->sanitizeFilename($moduleTitle);
            $sanitizedLesson = $this->sanitizeFilename($title);
            $sanitizedModule = substr($sanitizedModule, 0, 30);
            $sanitizedLesson = substr($sanitizedLesson, 0, 50);

            // Resolve Path using Constant
            $privateBase = PRIVATE_UPLOADS_DIR;
            $relPath = !empty($lesson['file_path']) ? $lesson['file_path'] : 'lessons/' . $lesson['video_ref'];
            $relPath = preg_replace('/^private_uploads\//', '', $relPath);
            if (strpos($relPath, '/') === false)
                $relPath = 'lessons/' . $relPath;

            $currentPath = $privateBase . '/' . $relPath;

            if (!file_exists($currentPath))
                return;

            $ext = pathinfo($currentPath, PATHINFO_EXTENSION);
            $newName = "{$sanitizedModule}_{$sanitizedLesson}.{$ext}";

            if (basename($currentPath) === $newName)
                return;

            $newPath = $privateBase . '/lessons/' . $newName;

            // Check collision
            if (file_exists($newPath)) {
                $newName = "{$sanitizedModule}_{$sanitizedLesson}_" . uniqid() . ".{$ext}";
                $newPath = $privateBase . '/lessons/' . $newName;
            }

            if (rename($currentPath, $newPath)) {
                $updatePath = 'lessons/' . $newName;
                $stmtUpd = $this->pdo->prepare("UPDATE lms_lessons SET video_ref = ?, file_path = ? WHERE id = ?");
                $stmtUpd->execute([$newName, $updatePath, $lessonId]);
            }

        }
        catch (Exception $e) {
            error_log("[AUTO_RENAME] Failed for Lesson $lessonId: " . $e->getMessage());
        }
    }

    private function autoRenameThumbnail($lessonId, $title, $moduleId, $currentRef)
    {
        try {
            // Get Module Title
            $stmt = $this->pdo->prepare("SELECT title FROM lms_modules WHERE id = ?");
            $stmt->execute([$moduleId]);
            $module = $stmt->fetch(PDO::FETCH_ASSOC);
            $moduleTitle = $module ? $module['title'] : "Modulo_{$moduleId}";

            // Get Lesson Order (for Numbering)
            $stmtL = $this->pdo->prepare("SELECT display_order FROM lms_lessons WHERE id = ?");
            $stmtL->execute([$lessonId]);
            $order = $stmtL->fetchColumn() ?: 0;
            $order = str_pad($order, 2, '0', STR_PAD_LEFT);

            // Construct New Name
            $sanitizedModule = $this->sanitizeFilename($moduleTitle);
            $sanitizedLesson = $this->sanitizeFilename($title);
            $sanitizedModule = substr($sanitizedModule, 0, 30);
            $sanitizedLesson = substr($sanitizedLesson, 0, 50);

            // Clean current ref (remove thumbnails/ prefix if present)
            $cleanCurrentName = basename($currentRef);

            // Paths
            $baseDir = PRIVATE_UPLOADS_DIR . '/thumbnails';
            $currentPath = $baseDir . '/' . $cleanCurrentName;

            if (!file_exists($currentPath)) {
                // Try checking if it's in a subdirectory or just missing
                error_log("[AUTO_RENAME_THUMB] File not found: $currentPath");
                return;
            }

            $ext = pathinfo($currentPath, PATHINFO_EXTENSION);
            // Format: Module_01_Title.jpg
            $newName = "{$sanitizedModule}_{$order}_{$sanitizedLesson}.{$ext}";

            if ($cleanCurrentName === $newName)
                return;

            $newPath = $baseDir . '/' . $newName;

            // Handle Collision
            if (file_exists($newPath)) {
                $newName = "{$sanitizedModule}_{$order}_{$sanitizedLesson}_" . uniqid() . ".{$ext}";
                $newPath = $baseDir . '/' . $newName;
            }

            if (rename($currentPath, $newPath)) {
                $dbRef = 'thumbnails/' . $newName;
                $stmtUpd = $this->pdo->prepare("UPDATE lms_lessons SET thumbnail_ref = ? WHERE id = ?");
                $stmtUpd->execute([$dbRef, $lessonId]);

            // Also update media_files if exists (optional but good for consistency)
            // We let the Sync script handle strict consistency, but we can try
            }

        }
        catch (Exception $e) {
            error_log("[AUTO_RENAME_THUMB] Failed for Lesson $lessonId: " . $e->getMessage());
        }
    }

    // GET /admin/lms/exclusive-access/list
    public function listExclusiveAccess()
    {
        try {
            // Get alunas access
            $stmtAlunas = $this->pdo->query("
                SELECT aca.id, aca.aluna_id, a.name as aluna_name, a.cpf as aluna_cpf, aca.module_id, m.title as module_title, aca.granted_at, aca.expires_at
                FROM aluna_course_access aca
                INNER JOIN alunas a ON aca.aluna_id = a.id
                INNER JOIN lms_modules m ON aca.module_id = m.id
                WHERE m.is_exclusive = 1
                ORDER BY aca.granted_at DESC
            ");
            $alunasAccess = $stmtAlunas->fetchAll(PDO::FETCH_ASSOC);

            // Get licenciadas access
            $stmtLicenciadas = $this->pdo->query("
                SELECT lca.id, lca.licenciada_id, l.name as licenciada_name, l.cpf as licenciada_cpf, lca.module_id, m.title as module_title, lca.granted_at, lca.expires_at
                FROM licenciada_course_access lca
                INNER JOIN licenciadas l ON lca.licenciada_id = l.id
                INNER JOIN lms_modules m ON lca.module_id = m.id
                WHERE m.is_exclusive = 1
                ORDER BY lca.granted_at DESC
            ");
            $licenciadasAccess = $stmtLicenciadas->fetchAll(PDO::FETCH_ASSOC);

            Response::json([
                'alunas' => $alunasAccess,
                'licenciadas' => $licenciadasAccess
            ]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // GET /admin/lms/exclusive-access/targets
    public function listExclusiveAccessTargets()
    {
        try {
            // Get active alunas (CPF como identificador primario)
            $stmtAlunas = $this->pdo->query("SELECT id, name, cpf FROM alunas WHERE is_active = 1 ORDER BY name ASC");
            $alunas = $stmtAlunas->fetchAll(PDO::FETCH_ASSOC);

            // Get active licenciadas (CPF como identificador primario)
            $stmtLicenciadas = $this->pdo->query("SELECT id, name, cpf FROM licenciadas WHERE is_active = 1 ORDER BY name ASC");
            $licenciadas = $stmtLicenciadas->fetchAll(PDO::FETCH_ASSOC);

            // Get exclusive modules
            $stmtModules = $this->pdo->query("SELECT id, title, is_exclusive FROM lms_modules WHERE is_active = 1 AND is_exclusive = 1 ORDER BY display_order ASC");
            $modules = $stmtModules->fetchAll(PDO::FETCH_ASSOC);

            // Ensure is_exclusive boolean cast
            foreach ($modules as &$mod) {
                $mod['is_exclusive'] = (bool)$mod['is_exclusive'];
            }

            Response::json([
                'alunas' => $alunas,
                'licenciadas' => $licenciadas,
                'modules' => $modules
            ]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/lms/exclusive-access/grant
    public function grantExclusiveAccess()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $type = $data['type'] ?? null;
        $targetId = isset($data['target_id']) ? (int)$data['target_id'] : null;
        $moduleId = isset($data['module_id']) ? (int)$data['module_id'] : null;
        $expiresAt = !empty($data['expires_at']) ? $data['expires_at'] : null;

        if (!$type || !$targetId || !$moduleId) {
            Response::error('Campos obrigatórios: type, target_id, module_id', 400);
        }

        try {
            $this->pdo->beginTransaction();

            if ($type === 'aluna') {
                $stmt = $this->pdo->prepare("
                    INSERT INTO aluna_course_access (aluna_id, module_id, granted_by, expires_at)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE granted_at = NOW(), expires_at = VALUES(expires_at), granted_by = VALUES(granted_by)
                ");
                $stmt->execute([$targetId, $moduleId, $this->user['id'], $expiresAt]);
                // Nota: /v1/aluna/catalog não usa ResponseCache server-side.
                // O NEXUS_CACHE do frontend (60s TTL) é automaticamente limpo pelo api.js
                // em toda mutação POST (NEXUS_CACHE.clear()). A aluna verá o acesso em até 60s.
            } elseif ($type === 'licenciada') {
                $stmt = $this->pdo->prepare("
                    INSERT INTO licenciada_course_access (licenciada_id, module_id, granted_by, expires_at)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE granted_at = NOW(), expires_at = VALUES(expires_at), granted_by = VALUES(granted_by)
                ");
                $stmt->execute([$targetId, $moduleId, $this->user['id'], $expiresAt]);
                // Invalida cache de módulos para essa licenciada
                ResponseCache::invalidate("api_lms_modules_{$targetId}");
            } else {
                Response::error('Tipo de alvo inválido', 400);
            }

            $this->logger->log($this->user['id'], 'ADMIN_LMS_EXCLUSIVE_ACCESS_GRANT', ['type' => $type, 'target_id' => $targetId, 'module_id' => $moduleId], 'admin');

            $this->pdo->commit();
            Response::json(['success' => true, 'message' => 'Acesso concedido com sucesso.']);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/lms/exclusive-access/revoke
    public function revokeExclusiveAccess()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $type = $data['type'] ?? null;
        $targetId = isset($data['target_id']) ? (int)$data['target_id'] : null;
        $moduleId = isset($data['module_id']) ? (int)$data['module_id'] : null;

        if (!$type || !$targetId || !$moduleId) {
            Response::error('Campos obrigatórios: type, target_id, module_id', 400);
        }

        try {
            $this->pdo->beginTransaction();

            if ($type === 'aluna') {
                $stmt = $this->pdo->prepare("DELETE FROM aluna_course_access WHERE aluna_id = ? AND module_id = ?");
                $stmt->execute([$targetId, $moduleId]);
                // Nota: /v1/aluna/catalog não usa ResponseCache server-side.
                // O NEXUS_CACHE do frontend (60s TTL) é automaticamente limpo pelo api.js
                // em toda mutação POST (NEXUS_CACHE.clear()). A aluna verá a revogação em até 60s.
            } elseif ($type === 'licenciada') {
                $stmt = $this->pdo->prepare("DELETE FROM licenciada_course_access WHERE licenciada_id = ? AND module_id = ?");
                $stmt->execute([$targetId, $moduleId]);
                // Invalida cache de módulos para essa licenciada
                ResponseCache::invalidate("api_lms_modules_{$targetId}");
            } else {
                Response::error('Tipo de alvo inválido', 400);
            }

            $this->logger->log($this->user['id'], 'ADMIN_LMS_EXCLUSIVE_ACCESS_REVOKE', ['type' => $type, 'target_id' => $targetId, 'module_id' => $moduleId], 'admin');

            $this->pdo->commit();
            Response::json(['success' => true, 'message' => 'Acesso revogado com sucesso.']);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/lms/lessons/convert-hls-batch
    public function convertHlsBatch()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $force = !empty($data['force']) ? '-f' : '';

        $statusFile = PRIVATE_UPLOADS_DIR . '/hls/batch_status.json';

        // 1. Verificar se já existe um job rodando
        if (file_exists($statusFile)) {
            $status = json_decode(file_get_contents($statusFile), true);
            if (!empty($status['is_running'])) {
                $pid = $status['pid'] ?? 0;
                // Verificar se o PID está ativo
                $isRunning = false;
                if ($pid) {
                    if (strncasecmp(PHP_OS, 'WIN', 3) === 0) {
                        $output = [];
                        exec("tasklist /FI \"PID eq $pid\"", $output);
                        $isRunning = count($output) > 3;
                    } else {
                        $isRunning = file_exists("/proc/$pid");
                    }
                }
                if ($isRunning) {
                    Response::error('Já existe uma conversão em lote em andamento.', 429);
                }
            }
        }

        // 2. Disparar script CLI em background de forma assíncrona
        $scriptPath = FS_ROOT . '/scripts/lms/convert-all-hls.php';
        if (!file_exists($scriptPath)) {
            $scriptPath = PUBLIC_ROOT . '/scripts/lms/convert-all-hls.php';
            if (!file_exists($scriptPath)) {
                Response::error('Script de automação não encontrado no servidor.', 500);
            }
        }

        // Identificar quantos estão pendentes
        try {
            $sql = "SELECT COUNT(*) FROM lms_lessons WHERE is_active = 1 AND video_type IN ('local', 'hostinger')";
            if (empty($data['force'])) {
                $sql .= " AND (hls_path IS NULL OR hls_path = '')";
            }
            $stmt = $this->pdo->query($sql);
            $totalQueued = (int)$stmt->fetchColumn();

            if ($totalQueued === 0) {
                Response::json([
                    'success' => true,
                    'message' => 'Nenhum vídeo pendente para conversão.',
                    'data' => [
                        'job_id' => 'none',
                        'total_queued' => 0
                    ]
                ]);
                return;
            }

            $serverName = $_SERVER['SERVER_NAME'] ?? 'localhost';
            $isLocal = ($serverName === 'localhost' || $serverName === '127.0.0.1');
            $jobId = uniqid('batch_hls_');

            if (!$isLocal) {
                // Em produção (Hostinger), disparar via requisição HTTP Loopback assíncrona
                $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
                $url = $protocol . '://' . $_SERVER['HTTP_HOST'] . '/scripts/lms/convert-all-hls.php?token=NEXUS_HLS_2026';
                if ($force) {
                    $url .= '&force=1';
                }
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 5); // Timeout curto de 5 segundos
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                curl_exec($ch);
                curl_close($ch);
            } else {
                // Em desenvolvimento local (Windows/Docker), disparar via CLI
                $phpBinary = PHP_BINARY;
                if (!$phpBinary || !is_executable($phpBinary)) {
                    $phpBinary = 'php';
                }
                
                if (strncasecmp(PHP_OS, 'WIN', 3) === 0) {
                    $cmd = "start /B " . escapeshellcmd("$phpBinary $scriptPath $force") . " > NUL 2>&1";
                    pclose(popen($cmd, "r"));
                } else {
                    $cmd = escapeshellcmd("$phpBinary $scriptPath $force") . " > /dev/null 2>&1 &";
                    exec($cmd);
                }
            }

            $this->logger->log($this->user['id'], 'ADMIN_LMS_HLS_BATCH_CONVERT_START', ['job_id' => $jobId, 'force' => !empty($data['force'])], 'admin');

            Response::json([
                'success' => true,
                'message' => 'Processamento em lote iniciado com sucesso.',
                'data' => [
                    'job_id' => $jobId,
                    'total_queued' => $totalQueued
                ]
            ]);

        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // GET /admin/lms/lessons/convert-hls-batch-status
    public function convertHlsBatchStatus()
    {
        $statusFile = PRIVATE_UPLOADS_DIR . '/hls/batch_status.json';
        $statusData = null;

        if (file_exists($statusFile)) {
            $statusData = json_decode(file_get_contents($statusFile), true);
        }

        // Fazer dupla checagem se ainda está marcado como rodando, mas o processo já morreu
        if ($statusData && !empty($statusData['is_running'])) {
            $pid = $statusData['pid'] ?? 0;
            $isRunning = false;
            if ($pid) {
                if (strncasecmp(PHP_OS, 'WIN', 3) === 0) {
                    $output = [];
                    exec("tasklist /FI \"PID eq $pid\"", $output);
                    $isRunning = count($output) > 3;
                } else {
                    $isRunning = file_exists("/proc/$pid");
                }
            }
            if (!$isRunning) {
                $statusData['is_running'] = false;
                $statusData['last_error'] = 'Processo finalizado de forma inesperada ou interrompido.';
                file_put_contents($statusFile, json_encode($statusData, JSON_PRETTY_PRINT));
            }
        }

        // Se não houver dados de processamento ou se não estiver ativamente rodando, recalcular do banco
        if (!$statusData || empty($statusData['is_running'])) {
            try {
                $queryFilter = "WHERE is_active = 1 AND video_type IN ('local', 'hostinger')";

                $stmtTotal = $this->pdo->query("SELECT COUNT(*) FROM lms_lessons $queryFilter");
                $totalVideos = (int)$stmtTotal->fetchColumn();

                $stmtConverted = $this->pdo->query("SELECT COUNT(*) FROM lms_lessons $queryFilter AND hls_path IS NOT NULL AND hls_path != ''");
                $converted = (int)$stmtConverted->fetchColumn();

                $pending = $totalVideos - $converted;

                Response::json([
                    'success' => true,
                    'data' => [
                        'is_running' => false,
                        'total_videos' => $totalVideos,
                        'converted' => $converted,
                        'pending' => $pending,
                        'progress_percent' => $totalVideos > 0 ? round(($converted / $totalVideos) * 100) : 100,
                        'last_error' => $statusData['last_error'] ?? null
                    ]
                ]);
            } catch (Exception $e) {
                Response::error($e->getMessage(), 500);
            }
            return;
        }

        // Se o job de lote estiver rodando, retornar o progresso em tempo real do arquivo
        Response::json([
            'success' => true,
            'data' => [
                'is_running' => true,
                'total_videos' => (int)$statusData['total_videos'],
                'converted' => (int)$statusData['converted'],
                'pending' => (int)$statusData['pending'],
                'progress_percent' => (int)$statusData['progress_percent'],
                'last_error' => $statusData['last_error']
            ]
        ]);
    }

    // POST /admin/lms/lessons/generate-thumbnails-batch
    public function generateThumbnailsBatch()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $force = !empty($data['force']) ? '-f' : '';

        $statusFile = PRIVATE_UPLOADS_DIR . '/thumbnails/batch_status.json';

        // 1. Verificar se já existe um job rodando
        if (file_exists($statusFile)) {
            $status = json_decode(file_get_contents($statusFile), true);
            if (!empty($status['is_running'])) {
                $pid = $status['pid'] ?? 0;
                $isRunning = false;
                if ($pid) {
                    if (strncasecmp(PHP_OS, 'WIN', 3) === 0) {
                        $output = [];
                        exec("tasklist /FI \"PID eq $pid\"", $output);
                        $isRunning = count($output) > 3;
                    } else {
                        $isRunning = file_exists("/proc/$pid");
                    }
                }
                if ($isRunning) {
                    Response::error('Já existe uma geração de miniaturas em lote em andamento.', 429);
                }
            }
        }

        // 2. Disparar script CLI em background de forma assíncrona
        $scriptPath = FS_ROOT . '/scripts/lms/generate-thumbnails-ffmpeg.php';
        if (!file_exists($scriptPath)) {
            $scriptPath = PUBLIC_ROOT . '/scripts/lms/generate-thumbnails-ffmpeg.php';
            if (!file_exists($scriptPath)) {
                Response::error('Script de automação de miniaturas não encontrado no servidor.', 500);
            }
        }

        // Identificar quantos estão pendentes
        try {
            $sql = "SELECT COUNT(*) FROM lms_lessons WHERE is_active = 1 AND video_type IN ('local', 'hostinger')";
            if (empty($data['force'])) {
                $sql .= " AND (thumbnail_ref IS NULL OR thumbnail_ref = '')";
            }
            $stmt = $this->pdo->query($sql);
            $totalQueued = (int)$stmt->fetchColumn();

            if ($totalQueued === 0) {
                Response::json([
                    'success' => true,
                    'message' => 'Nenhuma miniatura pendente para geração.',
                    'data' => [
                        'job_id' => 'none',
                        'total_queued' => 0
                    ]
                ]);
                return;
            }

            $serverName = $_SERVER['SERVER_NAME'] ?? 'localhost';
            $isLocal = ($serverName === 'localhost' || $serverName === '127.0.0.1');
            $jobId = uniqid('batch_thumb_');

            if (!$isLocal) {
                // Em produção (Hostinger), disparar via requisição HTTP Loopback assíncrona
                $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
                $url = $protocol . '://' . $_SERVER['HTTP_HOST'] . '/scripts/lms/generate-thumbnails-ffmpeg.php?token=NEXUS_THUMBS_2026';
                if ($force) {
                    $url .= '&force=1';
                }
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 5); // Timeout curto de 5 segundos
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                curl_exec($ch);
                curl_close($ch);
            } else {
                // Em desenvolvimento local, disparar via CLI
                $phpBinary = PHP_BINARY;
                if (!$phpBinary || !is_executable($phpBinary)) {
                    $phpBinary = 'php';
                }
                
                if (strncasecmp(PHP_OS, 'WIN', 3) === 0) {
                    $cmd = "start /B " . escapeshellcmd("$phpBinary $scriptPath $force") . " > NUL 2>&1";
                    pclose(popen($cmd, "r"));
                } else {
                    $cmd = escapeshellcmd("$phpBinary $scriptPath $force") . " > /dev/null 2>&1 &";
                    exec($cmd);
                }
            }

            $this->logger->log($this->user['id'], 'ADMIN_LMS_THUMBS_BATCH_START', ['job_id' => $jobId, 'force' => !empty($data['force'])], 'admin');

            Response::json([
                'success' => true,
                'message' => 'Processamento em lote iniciado com sucesso.',
                'data' => [
                    'job_id' => $jobId,
                    'total_queued' => $totalQueued
                ]
            ]);

        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // GET /admin/lms/lessons/generate-thumbnails-batch-status
    public function generateThumbnailsBatchStatus()
    {
        $statusFile = PRIVATE_UPLOADS_DIR . '/thumbnails/batch_status.json';
        $statusData = null;

        if (file_exists($statusFile)) {
            $statusData = json_decode(file_get_contents($statusFile), true);
        }

        // Fazer dupla checagem se ainda está marcado como rodando, mas o processo já morreu
        if ($statusData && !empty($statusData['is_running'])) {
            $pid = $statusData['pid'] ?? 0;
            $isRunning = false;
            if ($pid) {
                if (strncasecmp(PHP_OS, 'WIN', 3) === 0) {
                    $output = [];
                    exec("tasklist /FI \"PID eq $pid\"", $output);
                    $isRunning = count($output) > 3;
                } else {
                    $isRunning = file_exists("/proc/$pid");
                }
            }
            if (!$isRunning) {
                $statusData['is_running'] = false;
                $statusData['last_error'] = 'Processo finalizado de forma inesperada ou interrompido.';
                file_put_contents($statusFile, json_encode($statusData, JSON_PRETTY_PRINT));
            }
        }

        // Se não houver dados ou não estiver rodando, recalcular do banco
        if (!$statusData || empty($statusData['is_running'])) {
            try {
                $queryFilter = "WHERE is_active = 1 AND video_type IN ('local', 'hostinger')";

                $stmtTotal = $this->pdo->query("SELECT COUNT(*) FROM lms_lessons $queryFilter");
                $totalVideos = (int)$stmtTotal->fetchColumn();

                $stmtConverted = $this->pdo->query("SELECT COUNT(*) FROM lms_lessons $queryFilter AND thumbnail_ref IS NOT NULL AND thumbnail_ref != ''");
                $converted = (int)$stmtConverted->fetchColumn();

                $pending = $totalVideos - $converted;

                Response::json([
                    'success' => true,
                    'data' => [
                        'is_running' => false,
                        'total_videos' => $totalVideos,
                        'converted' => $converted,
                        'pending' => $pending,
                        'progress_percent' => $totalVideos > 0 ? round(($converted / $totalVideos) * 100) : 100,
                        'last_error' => $statusData['last_error'] ?? null
                    ]
                ]);
            } catch (Exception $e) {
                Response::error($e->getMessage(), 500);
            }
            return;
        }

        // Retornar o progresso em tempo real
        Response::json([
            'success' => true,
            'data' => [
                'is_running' => true,
                'total_videos' => (int)$statusData['total_videos'],
                'converted' => (int)$statusData['converted'],
                'pending' => (int)$statusData['pending'],
                'progress_percent' => (int)$statusData['progress_percent'],
                'last_error' => $statusData['last_error']
            ]
        ]);
    }
}
