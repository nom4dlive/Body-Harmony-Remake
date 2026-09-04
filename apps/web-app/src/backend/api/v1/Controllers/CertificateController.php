<?php
// api/v1/Controllers/CertificateController.php
// Nexus Guard V3.2 - Hybrid Certificate & Template Governance Controller

require_once __DIR__ . '/../Services/CertificateService.php';
require_once __DIR__ . '/../libs/LoggerService.php';

use BodyHarmony\Services\CertificateService;

class CertificateController {

    private $db;
    private $user;
    private $logger;
    private $certService;

    public function __construct() {
        global $pdo, $loggedUser, $loggedAluna;
        $this->db = $pdo;
        $this->user = $loggedUser ?: $loggedAluna;
        $this->logger = new LoggerService($pdo);
        $this->certService = new CertificateService();
        $this->ensureTables();
    }

    private function ensureTables() {
        try {
            // 1. Ensure lms_certificate_templates exists
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `lms_certificate_templates` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `type` varchar(50) NOT NULL DEFAULT 'formacao_geral',
                    `title` varchar(255) NOT NULL DEFAULT 'Certificado de Conclusão',
                    `subtitle` varchar(255) NOT NULL DEFAULT 'Certificamos com distinção acadêmica que',
                    `course_name` varchar(255) NOT NULL DEFAULT 'Formação Profissional Método Body Harmony',
                    `body_text` text NOT NULL,
                    `workload_hours` int(11) NOT NULL DEFAULT 60,
                    `min_score_default` int(11) NOT NULL DEFAULT 70,
                    `issuer_name` varchar(150) NOT NULL DEFAULT 'Dra. Thais Borges',
                    `issuer_role` varchar(150) NOT NULL DEFAULT 'Coordenação Técnica & Mentoria',
                    `badge_text` varchar(100) NOT NULL DEFAULT 'ESTÉTICA E SAÚDE INTEGRATIVA',
                    `is_active` tinyint(1) NOT NULL DEFAULT 1,
                    `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                    PRIMARY KEY (`id`),
                    UNIQUE KEY `type` (`type`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");

            // Seed default template if empty or update to legal standard
            $defaultBody = "está devidamente habilitada na metodologia {course}, tendo cumprido todos os módulos e avaliações com {hours} de estudo e nota {score}.";
            $count = (int)$this->db->query("SELECT COUNT(*) FROM lms_certificate_templates WHERE type = 'formacao_geral'")->fetchColumn();
            if ($count === 0) {
                $stmt = $this->db->prepare("
                    INSERT INTO lms_certificate_templates 
                    (type, title, subtitle, course_name, body_text, workload_hours, min_score_default, issuer_name, issuer_role, badge_text)
                    VALUES ('formacao_geral', 'Certificado de Conclusão', 'Certificamos com distinção acadêmica que', 'Formação Profissional Método Body Harmony', ?, 60, 70, 'Dra. Thais Borges', 'Coordenação Técnica & Mentoria', 'ESTÉTICA E SAÚDE INTEGRATIVA')
                ");
                $stmt->execute([$defaultBody]);
            }

            // 2. Ensure lms_certificates structure
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `lms_certificates` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `licenciada_id` int(11) DEFAULT NULL,
                    `aluna_id` int(11) DEFAULT NULL,
                    `module_id` int(11) DEFAULT 0,
                    `type` varchar(50) NOT NULL DEFAULT 'formacao_geral',
                    `score` decimal(5,2) DEFAULT 100.00,
                    `hash` varchar(64) NOT NULL DEFAULT '',
                    `issued_at` timestamp NULL DEFAULT current_timestamp(),
                    PRIMARY KEY (`id`),
                    KEY `idx_licenciada_module` (`licenciada_id`, `module_id`),
                    KEY `idx_aluna_module` (`aluna_id`, `module_id`),
                    KEY `idx_hash` (`hash`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            ");

            $certCols = [
                "ALTER TABLE `lms_certificates` ADD COLUMN IF NOT EXISTS `licenciada_id` int(11) DEFAULT NULL",
                "ALTER TABLE `lms_certificates` ADD COLUMN IF NOT EXISTS `aluna_id` int(11) DEFAULT NULL",
                "ALTER TABLE `lms_certificates` ADD COLUMN IF NOT EXISTS `module_id` int(11) DEFAULT 0",
                "ALTER TABLE `lms_certificates` ADD COLUMN IF NOT EXISTS `type` varchar(50) NOT NULL DEFAULT 'formacao_geral'",
                "ALTER TABLE `lms_certificates` ADD COLUMN IF NOT EXISTS `score` decimal(5,2) DEFAULT 100.00",
                "ALTER TABLE `lms_certificates` ADD COLUMN IF NOT EXISTS `hash` varchar(64) NOT NULL DEFAULT ''",
                "ALTER TABLE `lms_certificates` ADD COLUMN IF NOT EXISTS `issued_at` timestamp NULL DEFAULT current_timestamp()"
            ];
            foreach ($certCols as $colSql) {
                try { $this->db->exec($colSql); } catch (Throwable $e) {}
            }

            // Ensure is_exclusive is 0 (not NULL) for base modules
            try {
                $this->db->exec("UPDATE `lms_modules` SET `is_exclusive` = 0 WHERE `is_exclusive` IS NULL");
            } catch (Throwable $e) {}
        } catch (Throwable $e) {
            error_log("Ensure Certificate Tables Error (Ignored): " . $e->getMessage());
        }
    }

    /**
     * Resolves the authenticated student ID from session or headers.
     */
    private function resolveStudentId() {
        if ($this->user && isset($this->user['id'])) {
            return $this->user['id'];
        }

        $headers = getallheaders_robust();
        $deviceToken = $headers['X-DEVICE-TOKEN'] ?? '';
        if ($deviceToken) {
            $stmt = $this->db->prepare("SELECT licenciada_id FROM licenciada_devices WHERE device_token = ? AND is_active = 1");
            $stmt->execute([$deviceToken]);
            $id = $stmt->fetchColumn();
            if ($id) return $id;
        }

        $alunaToken = $headers['X-ALUNA-TOKEN'] ?? '';
        if ($alunaToken) {
            $stmt = $this->db->prepare("SELECT aluna_id FROM aluna_devices WHERE device_token = ? AND is_active = 1");
            $stmt->execute([$alunaToken]);
            $id = $stmt->fetchColumn();
            if ($id) return $id;
        }

        return null;
    }

    /**
     * GET /v1/admin/lms/certificate-template
     * Gestor: Fetch current certificate template configuration
     */
    public function getTemplate() {
        try {
            $stmt = $this->db->query("SELECT * FROM lms_certificate_templates WHERE type = 'formacao_geral' LIMIT 1");
            $template = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$template) {
                $template = [
                    'type' => 'formacao_geral',
                    'title' => 'Certificado de Conclusão',
                    'subtitle' => 'Certificamos com distinção acadêmica que',
                    'course_name' => 'Formação Profissional Método Body Harmony',
                    'body_text' => 'concluiu com êxito a {course} no portal de capacitação técnica do ecossistema Body Harmony, cumprindo integralmente toda a carga horária de {hours} e obtendo aproveitamento avaliativo de {score} em exame formal teórico-prático.',
                    'workload_hours' => 60,
                    'min_score_default' => 70,
                    'issuer_name' => 'Dra. Thais Borges',
                    'issuer_role' => 'Coordenação Técnica & Mentoria',
                    'badge_text' => 'ESTÉTICA E SAÚDE INTEGRATIVA'
                ];
            }

            Response::json(['success' => true, 'template' => $template]);
        } catch (Exception $e) {
            Response::error('Failed to load certificate template: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /v1/admin/lms/certificate-template
     * Gestor: Update certificate template settings
     */
    public function updateTemplate() {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            Response::error('Invalid payload', 400);
            return;
        }

        $title = trim($input['title'] ?? 'Certificado de Conclusão');
        $subtitle = trim($input['subtitle'] ?? 'Certificamos com distinção acadêmica que');
        $courseName = trim($input['course_name'] ?? 'Formação Profissional Método Body Harmony');
        $bodyText = trim($input['body_text'] ?? '');
        $workloadHours = max(1, intval($input['workload_hours'] ?? 60));
        $minScore = max(0, min(100, intval($input['min_score_default'] ?? 70)));
        $issuerName = trim($input['issuer_name'] ?? 'Dra. Thais Borges');
        $issuerRole = trim($input['issuer_role'] ?? 'Coordenação Técnica & Mentoria');
        $badgeText = trim($input['badge_text'] ?? 'ESTÉTICA E SAÚDE INTEGRATIVA');

        try {
            $stmt = $this->db->prepare("
                INSERT INTO lms_certificate_templates 
                (type, title, subtitle, course_name, body_text, workload_hours, min_score_default, issuer_name, issuer_role, badge_text)
                VALUES ('formacao_geral', ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    subtitle = VALUES(subtitle),
                    course_name = VALUES(course_name),
                    body_text = VALUES(body_text),
                    workload_hours = VALUES(workload_hours),
                    min_score_default = VALUES(min_score_default),
                    issuer_name = VALUES(issuer_name),
                    issuer_role = VALUES(issuer_role),
                    badge_text = VALUES(badge_text),
                    updated_at = NOW()
            ");
            $stmt->execute([
                $title, $subtitle, $courseName, $bodyText, $workloadHours, $minScore, $issuerName, $issuerRole, $badgeText
            ]);

            Response::json(['success' => true, 'message' => 'Template de certificado atualizado com sucesso!']);
        } catch (Exception $e) {
            Response::error('Failed to update certificate template: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /v1/admin/lms/certificate-preview
     * Gestor: Generate a live PDF preview binary
     */
    public function preview() {
        try {
            $stmt = $this->db->query("SELECT * FROM lms_certificate_templates WHERE type = 'formacao_geral' LIMIT 1");
            $config = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

            $pdfBinary = $this->certService->generate(
                'Nome da Licenciada (Exemplo)',
                $config['course_name'] ?? 'Formação Profissional Método Body Harmony',
                95.0,
                date('Y-m-d H:i:s'),
                'PREVIEW-' . hash('sha256', 'SAMPLE_PREVIEW_TOKEN'),
                $config
            );

            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="Preview_Certificado.pdf"');
            header('Content-Length: ' . strlen($pdfBinary));
            echo $pdfBinary;
            exit;
        } catch (Exception $e) {
            Response::error('Preview generation failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /v1/lms/certificates/status
     * Licenciada: Returns the complete certificates status, quiz gates and download links
     */
    public function licenciadaStatus() {
        $studentId = $this->resolveStudentId();
        if (!$studentId) {
            Response::error('Unauthorized - Student ID not found', 401);
            return;
        }

        try {
            // 1. Template Config
            $stmtTpl = $this->db->query("SELECT * FROM lms_certificate_templates WHERE type = 'formacao_geral' LIMIT 1");
            $tpl = $stmtTpl->fetch(PDO::FETCH_ASSOC) ?: [];
            $minScoreDefault = (int)($tpl['min_score_default'] ?? 70);

            // 2. Base Modules & Lessons (is_exclusive = 0 OR is_exclusive IS NULL)
            $stmtBaseLessons = $this->db->prepare("
                SELECT 
                    COUNT(l.id) as total_base_lessons,
                    SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) as completed_base_lessons
                FROM lms_lessons l
                INNER JOIN lms_modules m ON l.module_id = m.id
                LEFT JOIN lms_progress p ON p.lesson_id = l.id AND p.licenciada_id = ?
                WHERE m.is_active = 1 AND l.is_active = 1 AND (m.is_exclusive = 0 OR m.is_exclusive IS NULL)
            ");
            $stmtBaseLessons->execute([$studentId]);
            $baseLessonsData = $stmtBaseLessons->fetch(PDO::FETCH_ASSOC);

            $totalBaseLessons = (int)($baseLessonsData['total_base_lessons'] ?? 0);
            $completedBaseLessons = (int)($baseLessonsData['completed_base_lessons'] ?? 0);
            $baseProgressPercent = $totalBaseLessons > 0 ? round(($completedBaseLessons / $totalBaseLessons) * 100) : 0;

            // 3. Base Modules Quizzes Status
            $stmtModules = $this->db->query("
                SELECT m.id, m.title, m.display_order
                FROM lms_modules m
                WHERE m.is_active = 1 AND (m.is_exclusive = 0 OR m.is_exclusive IS NULL)
                ORDER BY m.display_order ASC
            ");
            $baseModules = $stmtModules->fetchAll(PDO::FETCH_ASSOC);
            $totalBaseModulesCount = count($baseModules);

            $quizzesList = [];
            $totalQuizzesRequired = 0;
            $passedQuizzesCount = 0;
            $sumQuizScores = 0;

            foreach ($baseModules as $bm) {
                $mId = (int)$bm['id'];
                
                // Get Quiz for this module
                $stmtQ = $this->db->prepare("SELECT id, title, min_score FROM lms_quizzes WHERE module_id = ?");
                $stmtQ->execute([$mId]);
                $quiz = $stmtQ->fetch(PDO::FETCH_ASSOC);

                if ($quiz) {
                    $totalQuizzesRequired++;
                    $minScore = (int)($quiz['min_score'] ?: $minScoreDefault);

                    // Get best attempt
                    $stmtAtt = $this->db->prepare("
                        SELECT score, passed, attempted_at 
                        FROM lms_quiz_attempts 
                        WHERE quiz_id = ? AND licenciada_id = ? 
                        ORDER BY score DESC LIMIT 1
                    ");
                    $stmtAtt->execute([$quiz['id'], $studentId]);
                    $attempt = $stmtAtt->fetch(PDO::FETCH_ASSOC);

                    $isPassed = $attempt && ($attempt['passed'] == 1 || $attempt['score'] >= $minScore);
                    if ($isPassed) {
                        $passedQuizzesCount++;
                        $sumQuizScores += (float)$attempt['score'];
                    }

                    $quizzesList[] = [
                        'module_id' => $mId,
                        'module_title' => $bm['title'],
                        'quiz_id' => (int)$quiz['id'],
                        'quiz_title' => $quiz['title'],
                        'min_score' => $minScore,
                        'is_passed' => (bool)$isPassed,
                        'score' => $attempt ? (float)$attempt['score'] : null,
                        'attempted_at' => $attempt ? $attempt['attempted_at'] : null
                    ];
                } else {
                    // Módulo base sem quiz cadastrado
                    $quizzesList[] = [
                        'module_id' => $mId,
                        'module_title' => $bm['title'],
                        'quiz_id' => null,
                        'quiz_title' => 'Avaliação do Módulo (Pendente de Cadastro pelo Gestor)',
                        'min_score' => $minScoreDefault,
                        'is_passed' => false,
                        'score' => null,
                        'attempted_at' => null
                    ];
                }
            }

            // Average score of quizzes
            $averageScore = $passedQuizzesCount > 0 
                ? round($sumQuizScores / $passedQuizzesCount, 1) 
                : ($totalQuizzesRequired === 0 ? 100.0 : 0.0);

            // Hard Gate Estrito:
            // 1. Todas as aulas base concluídas (totalBaseLessons > 0 e completedBaseLessons >= totalBaseLessons)
            // 2. Todos os módulos base devem possuir quiz cadastrado (totalQuizzesRequired >= totalBaseModulesCount)
            // 3. Todas as avaliações devem estar aprovadas (passedQuizzesCount >= totalQuizzesRequired)
            $lessonsComplete = ($totalBaseLessons > 0 && $completedBaseLessons >= $totalBaseLessons);
            $allModulesHaveQuiz = ($totalBaseModulesCount > 0 && $totalQuizzesRequired >= $totalBaseModulesCount);
            $allQuizzesPassed = ($totalQuizzesRequired > 0 && $passedQuizzesCount >= $totalQuizzesRequired);
            $isMasterEligible = $lessonsComplete && $allModulesHaveQuiz && $allQuizzesPassed;

            // Check existing Master Certificate
            $stmtMasterCert = $this->db->prepare("
                SELECT * FROM lms_certificates 
                WHERE licenciada_id = ? AND (module_id = 0 OR module_id IS NULL)
                ORDER BY id DESC LIMIT 1
            ");
            $stmtMasterCert->execute([$studentId]);
            $masterCert = $stmtMasterCert->fetch(PDO::FETCH_ASSOC);

            // Specialization Certificates (Módulos exclusivos com acesso)
            $stmtSpec = $this->db->prepare("
                SELECT 
                    m.id, m.title, m.description, m.cover_image,
                    COUNT(l.id) as total_lessons,
                    SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons
                FROM lms_modules m
                INNER JOIN licenciada_course_access lca ON lca.module_id = m.id AND lca.licenciada_id = ?
                LEFT JOIN lms_lessons l ON l.module_id = m.id AND l.is_active = 1
                LEFT JOIN lms_progress p ON p.lesson_id = l.id AND p.licenciada_id = ?
                WHERE m.is_active = 1 AND m.is_exclusive = 1
                  AND (lca.expires_at IS NULL OR lca.expires_at > NOW())
                GROUP BY m.id, m.title, m.description, m.cover_image
                ORDER BY m.display_order ASC
            ");
            $stmtSpec->execute([$studentId, $studentId]);
            $specModules = $stmtSpec->fetchAll(PDO::FETCH_ASSOC);

            $specializations = [];
            foreach ($specModules as $sm) {
                $sId = (int)$sm['id'];
                $sTotal = (int)$sm['total_lessons'];
                $sComp = (int)$sm['completed_lessons'];

                // Check Quiz
                $stmtSQ = $this->db->prepare("SELECT id, title, min_score FROM lms_quizzes WHERE module_id = ?");
                $stmtSQ->execute([$sId]);
                $sQuiz = $stmtSQ->fetch(PDO::FETCH_ASSOC);

                $sPassed = true;
                $sScore = 100.0;
                if ($sQuiz) {
                    $sMin = (int)($sQuiz['min_score'] ?: $minScoreDefault);
                    $stmtSAtt = $this->db->prepare("
                        SELECT score, passed FROM lms_quiz_attempts 
                        WHERE quiz_id = ? AND licenciada_id = ? 
                        ORDER BY score DESC LIMIT 1
                    ");
                    $stmtSAtt->execute([$sQuiz['id'], $studentId]);
                    $sAtt = $stmtSAtt->fetch(PDO::FETCH_ASSOC);
                    $sPassed = $sAtt && ($sAtt['passed'] == 1 || $sAtt['score'] >= $sMin);
                    $sScore = $sAtt ? (float)$sAtt['score'] : 0;
                }

                $sEligible = ($sTotal > 0 && $sComp >= $sTotal && $sPassed);

                // Check Certificate
                $stmtSCert = $this->db->prepare("
                    SELECT * FROM lms_certificates WHERE licenciada_id = ? AND module_id = ? LIMIT 1
                ");
                $stmtSCert->execute([$studentId, $sId]);
                $sCert = $stmtSCert->fetch(PDO::FETCH_ASSOC);

                $specializations[] = [
                    'module_id' => $sId,
                    'title' => $sm['title'],
                    'description' => $sm['description'],
                    'total_lessons' => $sTotal,
                    'completed_lessons' => $sComp,
                    'progress_percent' => $sTotal > 0 ? round(($sComp / $sTotal) * 100) : 0,
                    'has_quiz' => (bool)$sQuiz,
                    'quiz_passed' => $sPassed,
                    'is_eligible' => $sEligible,
                    'certificate' => $sCert ? [
                        'id' => (int)$sCert['id'],
                        'hash' => $sCert['hash'],
                        'score' => (float)$sCert['score'],
                        'issued_at' => $sCert['issued_at']
                    ] : null
                ];
            }

            Response::json([
                'success' => true,
                'master_course' => [
                    'title' => $tpl['course_name'] ?? 'Formação Profissional Método Body Harmony',
                    'workload_hours' => (int)($tpl['workload_hours'] ?? 60),
                    'total_lessons' => $totalBaseLessons,
                    'completed_lessons' => $completedBaseLessons,
                    'progress_percent' => $baseProgressPercent,
                    'total_quizzes' => $totalQuizzesRequired,
                    'passed_quizzes' => $passedQuizzesCount,
                    'average_score' => $averageScore,
                    'is_eligible' => $isMasterEligible,
                    'quizzes' => $quizzesList,
                    'certificate' => $masterCert ? [
                        'id' => (int)$masterCert['id'],
                        'hash' => $masterCert['hash'],
                        'score' => (float)$masterCert['score'],
                        'issued_at' => $masterCert['issued_at']
                    ] : null
                ],
                'specializations' => $specializations
            ]);
        } catch (Exception $e) {
            Response::error('Failed to load certificates status: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /v1/lms/certificates/master/download
     * Licenciada: Generates / Downloads the Master Formation Certificate
     */
    public function downloadMaster() {
        $studentId = $this->resolveStudentId();
        if (!$studentId) {
            Response::error('Unauthorized access. Please login.', 401);
            return;
        }

        try {
            // 1. Verify eligibility
            $stmtUser = $this->db->prepare("SELECT name FROM licenciadas WHERE id = ?");
            $stmtUser->execute([$studentId]);
            $studentName = $stmtUser->fetchColumn() ?: 'Licenciada Body Harmony';

            // Check existing or generate
            $stmtCert = $this->db->prepare("
                SELECT * FROM lms_certificates 
                WHERE licenciada_id = ? AND (module_id = 0 OR module_id IS NULL) 
                LIMIT 1
            ");
            $stmtCert->execute([$studentId]);
            $cert = $stmtCert->fetch(PDO::FETCH_ASSOC);

            if (!$cert) {
                // Hard Gate 1: Ensure 100% lessons completed
                $stmtCheck = $this->db->prepare("
                    SELECT 
                        COUNT(l.id) as total_base,
                        SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) as completed_base
                    FROM lms_lessons l
                    INNER JOIN lms_modules m ON l.module_id = m.id
                    LEFT JOIN lms_progress p ON p.lesson_id = l.id AND p.licenciada_id = ?
                    WHERE m.is_active = 1 AND l.is_active = 1 AND (m.is_exclusive = 0 OR m.is_exclusive IS NULL)
                ");
                $stmtCheck->execute([$studentId]);
                $counts = $stmtCheck->fetch(PDO::FETCH_ASSOC);
                $total = (int)($counts['total_base'] ?? 0);
                $done = (int)($counts['completed_base'] ?? 0);

                if ($total === 0 || $done < $total) {
                    Response::error('Você ainda não concluiu 100% das videoaulas da formação principal.', 403);
                    return;
                }

                // Hard Gate 2: Ensure all base modules have quizzes and all are passed
                $stmtMod = $this->db->query("
                    SELECT id FROM lms_modules 
                    WHERE is_active = 1 AND (is_exclusive = 0 OR is_exclusive IS NULL)
                ");
                $baseModIds = $stmtMod->fetchAll(PDO::FETCH_COLUMN);
                
                $finalScore = 100.0;
                $sumScores = 0;
                $validQuizzes = 0;

                foreach ($baseModIds as $bModId) {
                    $stmtQ = $this->db->prepare("SELECT id, min_score FROM lms_quizzes WHERE module_id = ?");
                    $stmtQ->execute([$bModId]);
                    $q = $stmtQ->fetch(PDO::FETCH_ASSOC);
                    
                    if (!$q) {
                        Response::error('A emissão do certificado requer que todos os módulos base possuam avaliação cadastrada e aprovada.', 403);
                        return;
                    }

                    $minReq = (int)($q['min_score'] ?: 70);
                    $stmtAtt = $this->db->prepare("
                        SELECT score, passed FROM lms_quiz_attempts 
                        WHERE quiz_id = ? AND licenciada_id = ? 
                        ORDER BY score DESC LIMIT 1
                    ");
                    $stmtAtt->execute([$q['id'], $studentId]);
                    $att = $stmtAtt->fetch(PDO::FETCH_ASSOC);

                    if (!$att || ($att['passed'] != 1 && $att['score'] < $minReq)) {
                        Response::error('Você ainda não atingiu a nota mínima em todas as avaliações dos módulos base.', 403);
                        return;
                    }

                    $sumScores += (float)$att['score'];
                    $validQuizzes++;
                }

                if ($validQuizzes > 0) {
                    $finalScore = round($sumScores / $validQuizzes, 1);
                }

                $hash = hash('sha256', "MASTER_BH_{$studentId}_" . time() . "_SECRET_SALT");
                $stmtIns = $this->db->prepare("
                    INSERT INTO lms_certificates (licenciada_id, module_id, type, score, hash, issued_at)
                    VALUES (?, 0, 'formacao_geral', ?, ?, NOW())
                ");
                $stmtIns->execute([$studentId, $finalScore, $hash]);

                $cert = [
                    'hash' => $hash,
                    'score' => $finalScore,
                    'issued_at' => date('Y-m-d H:i:s')
                ];
            }

            // Fetch template
            $stmtTpl = $this->db->query("SELECT * FROM lms_certificate_templates WHERE type = 'formacao_geral' LIMIT 1");
            $config = $stmtTpl->fetch(PDO::FETCH_ASSOC) ?: [];

            $courseTitle = $config['course_name'] ?? 'Formação Profissional Método Body Harmony';

            // Calculate real liquid hours completed in base formation
            $stmtHours = $this->db->prepare("
                SELECT COALESCE(SUM(l.duration_seconds), 0)
                FROM lms_progress p
                JOIN lms_lessons l ON p.lesson_id = l.id
                JOIN lms_modules m ON l.module_id = m.id
                WHERE p.licenciada_id = ? AND p.is_completed = 1
                  AND m.is_active = 1 AND (m.is_exclusive = 0 OR m.is_exclusive IS NULL)
            ");
            $stmtHours->execute([$studentId]);
            $secWatched = (int)$stmtHours->fetchColumn();
            $realHours = max(1, round($secWatched / 3600, 1));
            $config['workload_hours'] = $realHours;

            // Log download
            $this->logger->log($studentId, 'DOWNLOAD', [
                'type' => 'master_certificate',
                'hash' => $cert['hash']
            ]);

            $pdfBinary = $this->certService->generate(
                $studentName,
                $courseTitle,
                (float)($cert['score'] ?? 100.0),
                $cert['issued_at'],
                $cert['hash'],
                $config
            );

            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="Certificado_Formacao_Body_Harmony.pdf"');
            header('Content-Length: ' . strlen($pdfBinary));
            header('Cache-Control: private, max-age=0, must-revalidate');
            echo $pdfBinary;
            exit;
        } catch (Exception $e) {
            Response::error('Falha ao gerar certificado: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Checks if a module certificate is available and returns metadata.
     * GET /v1/lms/modules/{moduleId}/certificate
     */
    public function show($moduleId) {
        $studentId = $this->resolveStudentId();
        if (!$studentId) {
            Response::error('Unauthorized access. Please login.', 401);
            return;
        }

        $moduleId = intval($moduleId);
        $isAluna = (isset($this->user['role']) && $this->user['role'] === 'aluna');

        try {
            // 1. Get Quiz
            $stmtQuiz = $this->db->prepare("SELECT id, title, min_score FROM lms_quizzes WHERE module_id = ?");
            $stmtQuiz->execute([$moduleId]);
            $quiz = $stmtQuiz->fetch(PDO::FETCH_ASSOC);

            // 2. Get passed quiz attempt if quiz exists
            $attempt = null;
            if ($quiz) {
                $sqlAttempt = $isAluna 
                    ? "SELECT passed, score, attempted_at FROM lms_quiz_attempts WHERE quiz_id = ? AND aluna_id = ? AND passed = 1 ORDER BY score DESC LIMIT 1"
                    : "SELECT passed, score, attempted_at FROM lms_quiz_attempts WHERE quiz_id = ? AND licenciada_id = ? AND passed = 1 ORDER BY score DESC LIMIT 1";
                
                $stmtAttempt = $this->db->prepare($sqlAttempt);
                $stmtAttempt->execute([$quiz['id'], $studentId]);
                $attempt = $stmtAttempt->fetch(PDO::FETCH_ASSOC);

                if (!$attempt) {
                    Response::json(['available' => false, 'certificate' => null, 'message' => 'Avaliação pendente ou não aprovada.']);
                    return;
                }
            }

            // 3. Check for existing certificate record
            $sqlCert = $isAluna 
                ? "SELECT * FROM lms_certificates WHERE aluna_id = ? AND module_id = ?"
                : "SELECT * FROM lms_certificates WHERE licenciada_id = ? AND module_id = ?";
            
            $stmtCert = $this->db->prepare($sqlCert);
            $stmtCert->execute([$studentId, $moduleId]);
            $cert = $stmtCert->fetch(PDO::FETCH_ASSOC);

            if (!$cert) {
                $hash = hash('sha256', "SPEC_{$studentId}_{$moduleId}_" . time() . "_SECRET_SALT");
                $score = $attempt ? $attempt['score'] : 100.0;

                $sqlIns = $isAluna 
                    ? "INSERT INTO lms_certificates (aluna_id, module_id, type, score, hash, issued_at) VALUES (?, ?, 'especializacao', ?, ?, NOW())"
                    : "INSERT INTO lms_certificates (licenciada_id, module_id, type, score, hash, issued_at) VALUES (?, ?, 'especializacao', ?, ?, NOW())";
                
                $stmtIns = $this->db->prepare($sqlIns);
                $stmtIns->execute([$studentId, $moduleId, $score, $hash]);
                
                $cert = [
                    'id' => $this->db->lastInsertId(),
                    'hash' => $hash,
                    'score' => $score,
                    'issued_at' => date('Y-m-d H:i:s')
                ];
            }

            Response::json([
                'available' => true,
                'certificate' => [
                    'id' => intval($cert['id']),
                    'hash' => $cert['hash'],
                    'score' => floatval($cert['score']),
                    'issued_at' => $cert['issued_at']
                ]
            ]);

        } catch (Exception $e) {
            Response::error('Certificate retrieval failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Compiles and outputs the PDF certificate binary for a specific module.
     * GET /v1/lms/modules/{moduleId}/certificate/download
     */
    public function download($moduleId) {
        $studentId = $this->resolveStudentId();
        if (!$studentId) {
            Response::error('Unauthorized access. Please login.', 401);
            return;
        }

        $moduleId = intval($moduleId);
        $isAluna = (isset($this->user['role']) && $this->user['role'] === 'aluna');

        try {
            // 1. Verify access via database
            $sqlCert = $isAluna 
                ? "SELECT * FROM lms_certificates WHERE aluna_id = ? AND module_id = ?"
                : "SELECT * FROM lms_certificates WHERE licenciada_id = ? AND module_id = ?";
            
            $stmtCert = $this->db->prepare($sqlCert);
            $stmtCert->execute([$studentId, $moduleId]);
            $cert = $stmtCert->fetch(PDO::FETCH_ASSOC);

            // Fetch Module Title
            $stmtMod = $this->db->prepare("SELECT title FROM lms_modules WHERE id = ?");
            $stmtMod->execute([$moduleId]);
            $modTitle = $stmtMod->fetchColumn() ?: "Especialização " . $moduleId;

            // Fetch Student Name
            $sqlName = $isAluna ? "SELECT name FROM alunas WHERE id = ?" : "SELECT name FROM licenciadas WHERE id = ?";
            $stmtName = $this->db->prepare($sqlName);
            $stmtName->execute([$studentId]);
            $studentName = $stmtName->fetchColumn() ?: 'Aluna Body Harmony';

            if (!$cert) {
                // Ensure lessons completed
                $stmtCheck = $this->db->prepare("
                    SELECT 
                        COUNT(l.id) as total,
                        SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) as completed
                    FROM lms_lessons l
                    LEFT JOIN lms_progress p ON p.lesson_id = l.id AND p.licenciada_id = ?
                    WHERE l.module_id = ? AND l.is_active = 1
                ");
                $stmtCheck->execute([$studentId, $moduleId]);
                $counts = $stmtCheck->fetch(PDO::FETCH_ASSOC);
                $total = (int)($counts['total'] ?? 0);
                $done = (int)($counts['completed'] ?? 0);

                if ($total === 0 || $done < $total) {
                    Response::error('Você ainda não concluiu todas as aulas deste módulo.', 403);
                    return;
                }

                $hash = hash('sha256', "SPEC_{$studentId}_{$moduleId}_" . time() . "_SECRET_SALT");
                $score = 100.0;

                $sqlIns = $isAluna 
                    ? "INSERT INTO lms_certificates (aluna_id, module_id, type, score, hash, issued_at) VALUES (?, ?, 'especializacao', ?, ?, NOW())"
                    : "INSERT INTO lms_certificates (licenciada_id, module_id, type, score, hash, issued_at) VALUES (?, ?, 'especializacao', ?, ?, NOW())";
                
                $stmtIns = $this->db->prepare($sqlIns);
                $stmtIns->execute([$studentId, $moduleId, $score, $hash]);
                
                $cert = [
                    'hash' => $hash,
                    'score' => $score,
                    'issued_at' => date('Y-m-d H:i:s')
                ];
            }

            // Fetch Template
            $stmtTpl = $this->db->query("SELECT * FROM lms_certificate_templates WHERE type = 'formacao_geral' LIMIT 1");
            $config = $stmtTpl->fetch(PDO::FETCH_ASSOC) ?: [];

            // Override body for specialization
            $specConfig = $config;
            $specConfig['title'] = 'Certificado de Especialização';
            $specConfig['body_text'] = "concluiu com êxito a especialização avançada em {course} no ecossistema Body Harmony, cumprindo a carga horária e demonstrando excelência na aplicação da metodologia.";

            // Log Download
            $this->logger->log($studentId, 'DOWNLOAD', [
                'type' => 'module_certificate', 
                'module_id' => $moduleId,
                'hash' => $cert['hash']
            ]);

            // Generate PDF
            $pdfBinary = $this->certService->generate(
                $studentName,
                $modTitle,
                floatval($cert['score'] ?? 100.0),
                $cert['issued_at'],
                $cert['hash'],
                $specConfig
            );

            // Output PDF Download Headers
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="Certificado_Especializacao_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $modTitle) . '.pdf"');
            header('Content-Length: ' . strlen($pdfBinary));
            header('Cache-Control: private, max-age=0, must-revalidate');
            echo $pdfBinary;
            exit;

        } catch (Exception $e) {
            Response::error('PDF Compilation Failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /v1/certificates/verify/{hash}
     * Public endpoint: Returns certificate authenticity data for QR Code scans
     */
    public function verifyPublic($hash) {
        if (empty($hash)) {
            Response::error('Código de validação não informado.', 400);
            return;
        }

        try {
            $stmt = $this->db->prepare("
                SELECT c.*, l.name as licenciada_name, a.name as aluna_name, m.title as module_title
                FROM lms_certificates c
                LEFT JOIN licenciadas l ON c.licenciada_id = l.id
                LEFT JOIN alunas a ON c.aluna_id = a.id
                LEFT JOIN lms_modules m ON c.module_id = m.id
                WHERE c.hash = ?
                LIMIT 1
            ");
            $stmt->execute([$hash]);
            $cert = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$cert) {
                Response::error('Certificado não encontrado ou código de validação inválido.', 404);
                return;
            }

            $stmtTpl = $this->db->query("SELECT * FROM lms_certificate_templates WHERE type = 'formacao_geral' LIMIT 1");
            $tpl = $stmtTpl->fetch(PDO::FETCH_ASSOC) ?: [];

            $studentName = $cert['licenciada_name'] ?: ($cert['aluna_name'] ?: 'Licenciada Body Harmony');
            $courseName = $cert['module_id'] > 0 
                ? ($cert['module_title'] ?: 'Especialização Método Body Harmony')
                : ($tpl['course_name'] ?? 'Formação Profissional Método Body Harmony');

            Response::json([
                'success' => true,
                'valid' => true,
                'certificate' => [
                    'hash' => $cert['hash'],
                    'student_name' => $studentName,
                    'course_name' => $courseName,
                    'type' => $cert['type'] === 'especializacao' ? 'Especialização Profissional' : 'Formação Profissional',
                    'score' => (float)$cert['score'],
                    'issued_at' => $cert['issued_at'],
                    'badge_text' => $tpl['badge_text'] ?? 'ESTÉTICA E SAÚDE INTEGRATIVA',
                    'issuer_name' => $tpl['issuer_name'] ?? 'Dra. Thais Borges',
                    'issuer_role' => $tpl['issuer_role'] ?? 'Coordenação Técnica & Mentoria',
                    'verification_url' => "https://bodyharmony.com.br/validar/certificado/{$cert['hash']}"
                ]
            ]);
        } catch (Exception $e) {
            Response::error('Erro ao consultar autenticidade: ' . $e->getMessage(), 500);
        }
    }
}


