<?php
// api/v1/Controllers/AlunaLmsController.php
// V68 — Portal Aluna Individual

require_once __DIR__ . '/../libs/LoggerService.php';

class AlunaLmsController
{
    private $pdo;
    private $aluna; // Aluna autenticada (injetada pelo guard)

    public function __construct()
    {
        global $pdo, $loggedAluna;
        $this->pdo = $pdo;
        $this->aluna = $loggedAluna ?? null;
    }

    // ----------------------------------------------------------------
    // Middleware interno: valida token de aluna e injeta $loggedAluna
    // ----------------------------------------------------------------
    public static function guardAluna($pdo)
    {
        global $loggedAluna;

        $headers = getallheaders_robust();
        $deviceToken = $headers['X-ALUNA-TOKEN'] ?? $headers['X-Device-Token'] ?? null;

        if (!$deviceToken || strpos($deviceToken, 'al_') !== 0) {
            Response::error('Token de aluna inválido ou ausente.', 401);
        }

        $stmt = $pdo->prepare("
            SELECT d.*, a.id as aluna_id, a.name, a.is_active
            FROM aluna_devices d
            INNER JOIN alunas a ON d.aluna_id = a.id
            WHERE d.device_token = ? AND d.is_active = 1
        ");
        $stmt->execute([$deviceToken]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data || !$data['is_active']) {
            Response::error('Sessão de aluna inválida ou expirada.', 401);
        }

        $pdo->prepare("UPDATE aluna_devices SET last_used_at = NOW() WHERE device_token = ?")
            ->execute([$deviceToken]);

        $loggedAluna = [
            'id' => $data['aluna_id'],
            'name' => $data['name'],
            'role' => 'aluna'
        ];

        return $loggedAluna;
    }

    // ----------------------------------------------------------------
    // GET /v1/aluna/modules
    // Retorna apenas módulos que a aluna tem acesso via aluna_course_access
    // ----------------------------------------------------------------
    public function modules()
    {
        $alunaId = $this->aluna['id'];

        try {
            $sql = "
                SELECT
                    m.id as m_id, m.title as m_title, m.description as m_desc, m.cover_image,
                    m.display_order,
                    (SELECT l2.video_ref FROM lms_lessons l2 WHERE l2.module_id = m.id AND l2.is_active = 1 ORDER BY l2.display_order ASC LIMIT 1) as first_lesson_video,
                    COUNT(DISTINCT l.id)                                     AS total_lessons,
                    COUNT(DISTINCT CASE WHEN p.is_completed = 1 THEN p.lesson_id END) AS completed_lessons
                FROM aluna_course_access aca
                INNER JOIN lms_modules m ON aca.module_id = m.id AND m.is_active = 1
                LEFT JOIN lms_lessons l  ON l.module_id = m.id AND l.is_active = 1
                LEFT JOIN aluna_progress p ON p.lesson_id = l.id AND p.aluna_id = ?
                WHERE aca.aluna_id = ?
                  AND (aca.expires_at IS NULL OR aca.expires_at > NOW())
                GROUP BY m.id, m.title, m.description, m.cover_image, m.display_order
                ORDER BY m.display_order ASC
            ";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$alunaId, $alunaId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $modules = array_map(function ($row) {
                $total = (int)$row['total_lessons'];
                $completed = (int)$row['completed_lessons'];
                return [
                'id' => $row['m_id'],
                'title' => $row['m_title'],
                'description' => $row['m_desc'],
                'thumbnail_url' => $row['cover_image'] ? basename($row['cover_image']) : null,
                'video_url' => $row['first_lesson_video'],
                'total_lessons' => $total,
                'completed_lessons' => $completed,
                'progress_percent' => $total > 0 ? round(($completed / $total) * 100) : 0,
                'has_access' => true
                ];
            }, $rows);

            Response::json($modules);
        }
        catch (PDOException $e) {
            Response::error('Erro ao carregar cursos.', 500);
        }
    }

    // ----------------------------------------------------------------
    // GET /v1/aluna/catalog
    // Retorna TODOS os módulos ativos (incluindo exclusivos como vitrine bloqueada)
    // Campo is_exclusive=true + has_access=false => card de vitrine com CTA de compra
    // ----------------------------------------------------------------
    public function catalog()
    {
        $alunaId = $this->aluna['id'];

        try {
            $sql = "
                SELECT
                    m.id as m_id, m.title as m_title, m.description as m_desc, m.cover_image,
                    m.display_order, m.is_exclusive,
                    (SELECT COUNT(*) FROM aluna_course_access aca 
                     WHERE aca.aluna_id = ? AND aca.module_id = m.id 
                     AND (aca.expires_at IS NULL OR aca.expires_at > NOW())) as has_access,
                    (SELECT l2.video_ref FROM lms_lessons l2 WHERE l2.module_id = m.id AND l2.is_active = 1 ORDER BY l2.display_order ASC LIMIT 1) as first_lesson_video
                FROM lms_modules m
                WHERE m.is_active = 1
                ORDER BY m.is_exclusive ASC, m.display_order ASC
            ";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$alunaId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $modules = array_map(function ($row) {
                return [
                    'id'            => $row['m_id'],
                    'title'         => $row['m_title'],
                    'description'   => $row['m_desc'],
                    'thumbnail_url' => $row['cover_image'] ? basename($row['cover_image']) : null,
                    'video_url'     => $row['first_lesson_video'],
                    'is_exclusive'  => (bool)$row['is_exclusive'],
                    'has_access'    => (bool)$row['has_access'],
                ];
            }, $rows);

            Response::json($modules);
        }
        catch (PDOException $e) {
            Response::error('Erro ao carregar catálogo.', 500);
        }
    }


    // ----------------------------------------------------------------
    // GET /v1/aluna/modules/{id}/lessons
    // ----------------------------------------------------------------
    public function lessons($moduleId)
    {
        $alunaId = $this->aluna['id'];
        error_log("[LMS_DEBUG] Aluna $alunaId acessando lições do Módulo: '$moduleId'");

        // Verifica acesso ao módulo
        $stmtAccess = $this->pdo->prepare("
            SELECT id FROM aluna_course_access
            WHERE aluna_id = ? AND module_id = ?
              AND (expires_at IS NULL OR expires_at > NOW())
        ");
        $stmtAccess->execute([$alunaId, $moduleId]);
        $hasAccess = (bool)$stmtAccess->fetchColumn();

        // Verifica se há termo de adesão pendente de assinatura para este módulo
        $stmtTerm = $this->pdo->prepare("
            SELECT uuid, sign_token, title, status FROM contracts
            WHERE aluna_id = ? AND (module_id = ? OR module_id IS NULL) AND status IN ('PENDING_SIGNATURE', 'GENERATED')
            ORDER BY id DESC LIMIT 1
        ");
        $stmtTerm->execute([$alunaId, $moduleId]);
        $pendingTerm = $stmtTerm->fetch(PDO::FETCH_ASSOC);
        $hasPendingTerm = !empty($pendingTerm);

        try {
            $stmtMod = $this->pdo->prepare("SELECT * FROM lms_modules WHERE id = ? AND is_active = 1");
            $stmtMod->execute([$moduleId]);
            $module = $stmtMod->fetch(PDO::FETCH_ASSOC);

            if (!$module) {
                Response::json(['error' => 'Módulo não encontrado ou inativo', 'id' => $moduleId], 404);
            }

            $sql = "
                SELECT
                    l.id, l.title, l.description, l.video_type, l.duration_seconds,
                    l.thumbnail_ref, l.display_order,
                    COALESCE(p.is_completed, 0)     AS is_completed,
                    COALESCE(p.progress_percent, 0) AS progress_percent
                FROM lms_lessons l
                LEFT JOIN aluna_progress p ON p.lesson_id = l.id AND p.aluna_id = ?
                WHERE l.module_id = ? AND l.is_active = 1
                ORDER BY l.display_order ASC
            ";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$alunaId, $moduleId]);
            $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::json([
                'module' => $module,
                'lessons' => $lessons,
                'locked' => (!$hasAccess || $hasPendingTerm),
                'has_pending_term' => $hasPendingTerm,
                'pending_term' => $pendingTerm ?: null
            ]);
        }
        catch (PDOException $e) {
            Response::error('Erro ao carregar aulas.', 500);
        }
    }

    // ----------------------------------------------------------------
    // GET /v1/aluna/pending-terms
    // ----------------------------------------------------------------
    public function pendingTerms()
    {
        $alunaId = $this->aluna['id'];

        try {
            $stmt = $this->pdo->prepare("
                SELECT c.id, c.uuid, c.sign_token, c.title, c.status, c.module_id, c.created_at,
                       m.title as module_title
                FROM contracts c
                LEFT JOIN lms_modules m ON c.module_id = m.id
                WHERE c.aluna_id = ?
                  AND c.status IN ('PENDING_SIGNATURE', 'GENERATED')
                ORDER BY c.created_at DESC
            ");
            $stmt->execute([$alunaId]);
            $pending = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::json($pending);
        } catch (PDOException $e) {
            Response::error('Erro ao verificar termos pendentes.', 500);
        }
    }

    // ----------------------------------------------------------------
    // POST /v1/aluna/progress
    // ----------------------------------------------------------------
    public function saveProgress()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $lessonId = $input['lesson_id'] ?? 0;
        $progress = $input['progress_percent'] ?? 0;
        $completed = isset($input['is_completed']) ? (int)$input['is_completed'] : 0;
        $alunaId = $this->aluna['id'];

        if (!$lessonId) {
            Response::error('ID da aula é obrigatório.', 400);
        }

        try {
            $stmt = $this->pdo->prepare(
                "SELECT id, is_completed FROM aluna_progress WHERE aluna_id = ? AND lesson_id = ?"
            );
            $stmt->execute([$alunaId, $lessonId]);
            $existing = $stmt->fetch();

            if ($existing) {
                $this->pdo->prepare(
                    "UPDATE aluna_progress SET progress_percent = ?, is_completed = ?, last_watched_at = NOW()
                     WHERE id = ?"
                )->execute([$progress, $completed, $existing['id']]);

                if ($completed && !$existing['is_completed']) {
                    $this->pdo->prepare(
                        "UPDATE aluna_progress SET completion_date = NOW() WHERE id = ?"
                    )->execute([$existing['id']]);
                }
            }
            else {
                $this->pdo->prepare(
                    "INSERT INTO aluna_progress (aluna_id, lesson_id, progress_percent, is_completed, last_watched_at)
                     VALUES (?, ?, ?, ?, NOW())"
                )->execute([$alunaId, $lessonId, $progress, $completed]);
            }

            Response::json(['success' => true]);
        }
        catch (PDOException $e) {
            Response::error('Erro ao salvar progresso.', 500);
        }
    }

    // POST /v1/aluna/sign-url
    // ----------------------------------------------------------------
    public function signUrl()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $lessonId = $data['lesson_id'] ?? null;
        $alunaId = $this->aluna['id'];

        if (!$lessonId) {
            Response::error('ID da aula é obrigatório.', 400);
        }

        try {
            // Verifica que a aula pertence a um módulo que a aluna tem acesso
            $stmt = $this->pdo->prepare("
                SELECT l.id, l.video_type, l.hls_path
                FROM lms_lessons l
                INNER JOIN lms_modules m ON l.module_id = m.id
                INNER JOIN aluna_course_access aca ON aca.module_id = m.id
                WHERE l.id = ? AND aca.aluna_id = ?
                  AND m.is_active = 1 AND l.is_active = 1
                  AND (aca.expires_at IS NULL OR aca.expires_at > NOW())
            ");
            $stmt->execute([$lessonId, $alunaId]);
            $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$lesson || $lesson['video_type'] !== 'hostinger') {
                Response::error('Vídeo não disponível para streaming.', 404);
            }

            $fallback = isset($data['fallback']) && ($data['fallback'] === true || $data['fallback'] === '1' || $data['fallback'] === 1);

            // V84: Check for HLS Path first (unless fallback is requested)
            if (!empty($lesson['hls_path']) && !$fallback) {
                $hlsUrl = "/private_uploads/" . ltrim($lesson['hls_path'], '/');
                Response::json(['url' => $hlsUrl, 'is_hls' => true]);
                return;
            }

            $secret = getenv('APP_SECRET') ?: 'BodyHarmonySecretKey2026';
            $expires = time() + 3600;
            $signature = hash_hmac('sha256', "$lessonId:$expires", $secret);
            $url = "/api/lms/stream.php?id=$lessonId&expires=$expires&signature=$signature";

            Response::json(['url' => $url, 'is_hls' => false]);
        }
        catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // ----------------------------------------------------------------
    // GET /v1/aluna/certificate/{module_id}
    // Emite certificado se todas as aulas do módulo estão concluídas
    // ----------------------------------------------------------------
    public function certificate($moduleId)
    {
        $alunaId = $this->aluna['id'];

        // Verifica acesso
        $stmtAccess = $this->pdo->prepare("
            SELECT id FROM aluna_course_access
            WHERE aluna_id = ? AND module_id = ?
              AND (expires_at IS NULL OR expires_at > NOW())
        ");
        $stmtAccess->execute([$alunaId, $moduleId]);
        if (!$stmtAccess->fetchColumn()) {
            Response::error('Módulo não encontrado ou sem acesso.', 403);
        }

        try {
            // Verifica se já existe certificado
            $stmtCert = $this->pdo->prepare(
                "SELECT * FROM aluna_certificates WHERE aluna_id = ? AND module_id = ?"
            );
            $stmtCert->execute([$alunaId, $moduleId]);
            $cert = $stmtCert->fetch(PDO::FETCH_ASSOC);

            if ($cert) {
                Response::json(['certificate' => $cert, 'generated' => false]);
                return;
            }

            // Verifica se todas as aulas estão concluídas (>= 80%)
            $totalLessons = (int)$this->pdo->prepare("
                SELECT COUNT(*) FROM lms_lessons WHERE module_id = ? AND is_active = 1
            ")->execute([$moduleId]) ?: 0;

            $stmtTotal = $this->pdo->prepare(
                "SELECT COUNT(*) FROM lms_lessons WHERE module_id = ? AND is_active = 1"
            );
            $stmtTotal->execute([$moduleId]);
            $totalLessons = (int)$stmtTotal->fetchColumn();

            $stmtDone = $this->pdo->prepare("
                SELECT COUNT(*) FROM aluna_progress p
                INNER JOIN lms_lessons l ON p.lesson_id = l.id
                WHERE l.module_id = ? AND p.aluna_id = ? AND p.is_completed = 1
            ");
            $stmtDone->execute([$moduleId, $alunaId]);
            $doneLessons = (int)$stmtDone->fetchColumn();

            if ($totalLessons === 0 || $doneLessons < $totalLessons) {
                Response::error(
                    'Você ainda não concluiu todas as aulas deste módulo.',
                    422
                );
            }

            // Gera certificado
            $hashCode = bin2hex(random_bytes(32));
            $this->pdo->prepare(
                "INSERT INTO aluna_certificates (aluna_id, module_id, hash_code) VALUES (?, ?, ?)"
            )->execute([$alunaId, $moduleId, $hashCode]);

            $stmtCert->execute([$alunaId, $moduleId]);
            $newCert = $stmtCert->fetch(PDO::FETCH_ASSOC);

            Response::json(['certificate' => $newCert, 'generated' => true]);
        }
        catch (PDOException $e) {
            Response::error('Erro ao processar certificado.', 500);
        }
    }
}
