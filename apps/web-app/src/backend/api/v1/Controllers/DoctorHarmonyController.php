<?php
// apps/web-app/src/backend/api/v1/Controllers/DoctorHarmonyController.php


require_once __DIR__ . '/../libs/GeminiService.php';

class DoctorHarmonyController {
    private $db;
    private $uploadDir;
    private $confidenceThreshold = 0.80; // Option C: Higher rigor

    public function __construct() {
        global $pdo;
        $this->db = $pdo;
        // Base directory for private uploads (Gold Rule #2)
        $this->uploadDir = PRIVATE_UPLOADS_DIR . '/mentoria-ia/';
        
        $ensureWritable = function($dir) {
            if (!file_exists($dir)) @mkdir($dir, 0755, true);
            return is_writable($dir);
        };

        if (!$ensureWritable($this->uploadDir)) {
            // Determine fallback (System Temp)
            $sysTemp = sys_get_temp_dir() . '/bodyharmony_uploads/mentoria-ia/';
            
            if ($ensureWritable($sysTemp)) {
                $this->uploadDir = $sysTemp;
            } else {
                 error_log("[DOCTOR HARMONY CRITICAL] Upload directory not writable and fallback failed: " . $this->uploadDir);
            }
        }
    }

    /**
     * Get Doctor Harmony dashboard data for student
     * GET /api/v1/lms/ai/credits
     */
    public function getCredits() {
        global $loggedUser; // AuthMiddleware populates this
        $studentId = $loggedUser['id'] ?? $_SESSION['licenciada_id'] ?? null;
        if (!$studentId) Response::error('Licenciada não autenticada.', 401);

        try {
            // Credits are tied to the license
            $stmt = $this->db->prepare("
                SELECT l.ai_plan_type, l.ai_credits_total, l.ai_credits_used 
                FROM lms_licenses l
                JOIN lms_licenciada_licenses al ON l.id = al.license_id
                WHERE al.licenciada_id = ? AND l.status = 'active'
                LIMIT 1
            ");
            $stmt->execute([$studentId]);
            $status = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$status) {
              Response::json([
                'success' => true,
                'credits' => [
                  'ai_plan_type' => 'none',
                  'ai_credits_total' => 0,
                  'ai_credits_used' => 0
                ],
                'history' => []
              ]);
            }

            // Recent cases
            $stmt = $this->db->prepare("
                SELECT id, case_title, confidence_score, status, created_at 
                FROM ai_clinical_cases 
                WHERE licenciada_id = ? 
                ORDER BY created_at DESC LIMIT 5
            ");
            $stmt->execute([$studentId]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::json([
                'success' => true, 
                'credits' => $status,
                'history' => $history
            ]);
        } catch (Exception $e) {
            Response::error('Erro ao buscar status: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get interaction history for the student
     * GET /api/v1/mentor/history
     */
    public function getHistory() {
        global $loggedUser;
        $studentId = $loggedUser['id'] ?? $_SESSION['licenciada_id'] ?? null;
        if (!$studentId) Response::error('Licenciada não autenticada.', 401);

        try {
            $stmt = $this->db->prepare("
                SELECT id, case_description as user_msg, photo_path, doctor_harmony_response as ai_msg, status, created_at 
                FROM ai_clinical_cases 
                WHERE licenciada_id = ? 
                ORDER BY created_at ASC
            ");
            $stmt->execute([$studentId]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format for frontend
            $messages = [];
            foreach ($history as $case) {
                // User message
                $messages[] = [
                    'id' => $case['id'] . '_u',
                    'type' => 'user',
                    'content' => $case['user_msg'],
                    'image' => $case['photo_path'] ? '/api/v1/mentoria/image/' . $case['id'] : null,
                    'timestamp' => $case['created_at']
                ];
                // AI response
                $messages[] = [
                    'id' => $case['id'] . '_ai',
                    'type' => 'ai',
                    'content' => $case['ai_msg'],
                    'timestamp' => $case['created_at']
                ];
            }

            Response::json(['success' => true, 'messages' => $messages]);
        } catch (Exception $e) {
            Response::error('Erro ao buscar histórico: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get contextual information for current lesson
     * GET /api/v1/mentor/context?lesson_id=X
     */
    public function getContext() {
        $lessonId = $_GET['lesson_id'] ?? null;
        if (!$lessonId) Response::error('ID da aula necessário.', 400);

        try {
            $stmt = $this->db->prepare("
                SELECT l.title, l.description, m.title as module_title 
                FROM lms_lessons l
                JOIN lms_modules m ON l.module_id = m.id
                WHERE l.id = ?
            ");
            $stmt->execute([$lessonId]);
            $context = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$context) Response::error('Aula não encontrada.', 404);

            Response::json(['success' => true, 'context' => $context]);
        } catch (Exception $e) {
            Response::error('Erro ao buscar contexto: ' . $e->getMessage(), 500);
        }
    }
    public function analyze() {
        global $loggedUser;
        $studentId = $loggedUser['id'] ?? $_SESSION['licenciada_id'] ?? null;
        if (!$studentId) Response::error('Licenciada não autenticada.', 401);

        // 1. Validate Credits & License
        $userRole = $loggedUser['role'] ?? $_SESSION['role'] ?? '';
        $isAdmin = ($userRole === 'superadmin' || $userRole === 'admin');
        
        $stmt = $this->db->prepare("
            SELECT l.id as license_id, l.ai_credits_total, l.ai_credits_used 
            FROM lms_licenses l
            JOIN lms_licenciada_licenses al ON l.id = al.license_id
            WHERE al.licenciada_id = ? AND l.status = 'active'
            LIMIT 1
        ");
        $stmt->execute([$studentId]);
        $license = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$license && !$isAdmin) Response::error('Licença não encontrada.', 404);
        
        // Admin bypass: Skip credit depletion check
        if (!$isAdmin && $license && $license['ai_credits_used'] >= $license['ai_credits_total']) {
            Response::error('Créditos de IA esgotados para este mês.', 403);
        }

        // 2. Handle Multimodal Input
        $file = $_FILES['file'] ?? null;
        if (!$file) Response::error('Arquivo de imagem ou áudio obrigatório.', 400);

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $safeName = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        
        $licenseDir = $this->uploadDir . $license['license_id'] . '/';
        if (!file_exists($licenseDir)) mkdir($licenseDir, 0755, true);
        
        $targetPath = $licenseDir . $safeName;
        $dbPath = 'mentoria-ia/' . $license['license_id'] . '/' . $safeName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Falha ao processar arquivo.', 500);
        }

        // --- CRISIS ALERT (Phase 4) ---
        $userNotes = $_POST['notes'] ?? "Avalie este caso clínico.";
        $crisisPhrases = ['desistir', 'parar', 'cancelar', 'não aguento', 'muito difícil', 'estorno'];
        $isCrisis = 0;
        foreach ($crisisPhrases as $phrase) {
            if (stripos($userNotes, $phrase) !== false) {
                $isCrisis = 1;
                error_log("[DOCTOR HARMONY CRISIS] Licenciada $studentId used phrase: $phrase");
                break;
            }
        }
        // ------------------------------

        try {
            // 3. Contextual Enrichment (Personalization & Lesson Context)
            $studentName = 'Licenciada';
            $lessonContext = "";

            // LGPD Consent Check
            $stmtC = $this->db->prepare("SELECT lgpd_status FROM licenciadas WHERE id = ?");
            $stmtC->execute([$studentId]);
            $lgpdStatus = json_decode($stmtC->fetchColumn() ?: '{}', true);
            $aiConsent = !empty($lgpdStatus['ai_usage']);

            if ($aiConsent) {
                // Permissions Granted: Fetch Personal Data & Context
                $stmt = $this->db->prepare("SELECT name as full_name FROM licenciadas WHERE id = ?");
                $stmt->execute([$studentId]);
                if ($row = $stmt->fetch()) $studentName = $row['full_name'];

                $lessonId = $_POST['lesson_id'] ?? null;
                if ($lessonId) {
                    $stmt = $this->db->prepare("
                        SELECT l.title as lesson_title, m.title as module_title 
                        FROM lms_lessons l 
                        JOIN lms_modules m ON l.module_id = m.id 
                        WHERE l.id = ?
                    ");
                    $stmt->execute([$lessonId]);
                    if ($lesson = $stmt->fetch()) {
                        $lessonContext = "CONTEÚDO ATUAL: A licenciada está assistindo a aula '{$lesson['lesson_title']}' do módulo '{$lesson['module_title']}'. Responda às dúvidas dela considerando este contexto.";
                    }
                }
            } else {
                // Permission Denied: Anonymized Mode
                $lessonContext = "NOTA PRIVACIDADE: A licenciada optou por não compartilhar dados de contexto. Responda de forma genérica e técnica.";
            }

            $gemini = new GeminiService();
            
            // Neural Oversight: Load dynamic settings
            $stmt = $this->db->query("SELECT config_key, config_value FROM ai_config");
            $configs = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            
            if (isset($configs['gemini_model'])) $gemini->setModel($configs['gemini_model']);
            if (isset($configs['gemini_api_key'])) $gemini->setApiKey($configs['gemini_api_key']);
            if (isset($configs['ai_provider'])) $gemini->setProvider($configs['ai_provider']);
            if (isset($configs['nvidia_api_key'])) $gemini->setNvidiaKey($configs['nvidia_api_key']);
            if (isset($configs['nvidia_model'])) $gemini->setNvidiaModel($configs['nvidia_model']);
            $basePrompt = $configs['doctor_harmony_system_prompt'] ?? $this->loadPrompt();
            $threshold = floatval($configs['confidence_threshold'] ?? $this->confidenceThreshold);

            $systemPrompt = "DADOS DA LICENCIADA: Nome '{$studentName}'.\n" . $lessonContext . "\n\n" . $basePrompt;
            if ($isCrisis) {
                $systemPrompt .= "\n\nALERTA: A licenciada demonstrou sinais de desmotivação ou intenção de desistência. Responda com empatia extra, reforce o apoio da comunidade e ofereça ajuda técnica imediata para superar o obstáculo atual.";
            }
            
            $userNotes = $_POST['notes'] ?? "Avalie este caso clínico.";

            $aiResult = $gemini->analyze(
                $targetPath, 
                $file['type'], 
                $systemPrompt, 
                $userNotes
            );

            // 4. Hybrid Review Logic (Option C)
            $confidence = $aiResult['confidence'] ?? 0;
            $needsReview = ($confidence < $threshold) ? 1 : 0;
            
            // 5. Transactional Save & Credit Update
            $this->db->beginTransaction();

            // Save Case
            $caseTitle = $_POST['case_title'] ?? ('Caso Clínico ' . date('d/m Y H:i'));
            $stmt = $this->db->prepare("
                INSERT INTO ai_clinical_cases 
                (license_id, licenciada_id, case_title, case_description, photo_path, doctor_harmony_response, confidence_score, needs_review, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $license['license_id'],
                $studentId,
                $caseTitle,
                $userNotes,
                $dbPath,
                $aiResult['opinion'] ?? 'Resposta não gerada.',
                $confidence,
                $needsReview,
                ($needsReview || $isCrisis) ? 'PENDING' : 'ANALYZED'
            ]);
            
            // If crisis, force needs_review
            if ($isCrisis) {
                $this->db->prepare("UPDATE ai_clinical_cases SET needs_review = 1 WHERE id = LAST_INSERT_ID()")->execute();
            }

            // Increment Credits (Admin Bypass)
            if (!$isAdmin && $license) {
                $stmt = $this->db->prepare("UPDATE lms_licenses SET ai_credits_used = ai_credits_used + 1 WHERE id = ?");
                $stmt->execute([$license['license_id']]);
            }

            // Audit Log
            $stmt = $this->db->prepare("
                INSERT INTO ai_mentorship_logs (license_id, interaction_type, image_path) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([
                $license['license_id'],
                strpos($file['type'], 'image') !== false ? 'VISION' : 'TEXT',
                $dbPath
            ]);

            $this->db->commit();

            Response::json([
                'success' => true,
                'response' => $aiResult['opinion'],
                'confidence' => $confidence,
                'needs_review' => (bool)$needsReview,
                'warnings' => $aiResult['safety_warnings'] ?? []
            ]);

        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            error_log("[DOCTOR HARMONY ERROR] " . $e->getMessage());
            Response::error('A análise da Doctor Harmony falhou: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get pending cases for Nexus Review (Option C)
     * GET /api/v1/nexus/doctor-harmony/pending
     */
    public function getPendingCases() {
        global $loggedUser;
        // Authenticate as Admin/Nexus via standard session check (handled by router usually, 
        // but here we ensure access)
        $userRole = $loggedUser['role'] ?? $_SESSION['role'] ?? '';
        if ($userRole !== 'superadmin' && $userRole !== 'admin') {
            Response::error('Acesso negado.', 403);
        }

        try {
            $stmt = $this->db->query("
                SELECT c.*, l.id as license_id, s.name as licenciada_name 
                FROM ai_clinical_cases c
                JOIN lms_licenses l ON c.license_id = l.id
                JOIN licenciadas s ON c.licenciada_id = s.id
                WHERE c.needs_review = 1 
                AND c.status = 'PENDING'
                ORDER BY c.created_at DESC
            ");
            $cases = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::json(['success' => true, 'cases' => $cases]);
        } catch (Exception $e) {
            Response::error('Erro ao buscar casos pendentes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Submit mentor review for a clinical case
     * POST /api/v1/nexus/ana/review/{id}
     */
    public function submitReview($id) {
        if (($_SESSION['role'] ?? '') !== 'superadmin' && ($_SESSION['role'] ?? '') !== 'admin') {
            Response::error('Acesso negado.', 403);
        }

        $notes = $_POST['notes'] ?? '';
        if (!$notes) Response::error('O parecer do mentor é obrigatório.', 400);

        try {
            $stmt = $this->db->prepare("
                UPDATE ai_clinical_cases 
                SET mentor_feedback = ?, needs_review = 0, status = 'REVIEWED', mentor_id = ? 
                WHERE id = ?
            ");
            $userId = $loggedUser['id'] ?? $_SESSION['user_id'] ?? 0;
            $stmt->execute([$notes, $userId, $id]);
            Response::json(['success' => true, 'message' => 'Revisão enviada com sucesso.']);
        } catch (Exception $e) {
            Response::error('Erro ao salvar revisão: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Log widget events for metrics
     * POST /api/v1/mentor/log-event
     */
    public function logWidgetEvent() {
        global $loggedUser;
        $studentId = $loggedUser['id'] ?? $_SESSION['student_id'] ?? null;
        if (!$studentId) Response::error('Unauthorized', 401);

        $event = $_POST['event'] ?? 'UNKNOWN';
        
        try {
            $stmt = $this->db->prepare("
                INSERT INTO ai_mentorship_logs (license_id, interaction_type, image_path) 
                SELECT l.id, ?, 'WIDGET_EVENT'
                FROM lms_licenses l
                JOIN lms_licenciada_licenses al ON l.id = al.license_id
                WHERE al.licenciada_id = ? AND l.status = 'active'
                LIMIT 1
            ");
            $stmt->execute([$event, $studentId]);
            Response::json(['success' => true]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function getSession() {
        global $loggedUser;
        $licenciadaId = $loggedUser['id'] ?? $_SESSION['licenciada_id'] ?? null;
        if (!$licenciadaId) Response::error('Não autenticada.', 401);

        try {
            $stmt = $this->db->prepare("SELECT session_data FROM ai_mentorship_sessions WHERE licenciada_id = ? ORDER BY id DESC LIMIT 1");
            $stmt->execute([$licenciadaId]);
            $data = $stmt->fetchColumn();
            
            Response::json([
                'success' => true, 
                'session' => $data ? json_decode($data, true) : null
            ]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function saveSession() {
        global $loggedUser;
        $licenciadaId = $loggedUser['id'] ?? $_SESSION['licenciada_id'] ?? null;
        if (!$licenciadaId) Response::error('Não autenticada.', 401);

        $data = file_get_contents('php://input');
        if (!$data) Response::error('Dados ausentes.', 400);

        try {
            // Update or Insert
            $stmt = $this->db->prepare("SELECT id FROM ai_mentorship_sessions WHERE licenciada_id = ? LIMIT 1");
            $stmt->execute([$licenciadaId]);
            $id = $stmt->fetchColumn();

            if ($id) {
                $stmt = $this->db->prepare("UPDATE ai_mentorship_sessions SET session_data = ?, last_interaction = CURRENT_TIMESTAMP WHERE id = ?");
                $stmt->execute([$data, $id]);
            } else {
                $stmt = $this->db->prepare("INSERT INTO ai_mentorship_sessions (licenciada_id, session_data) VALUES (?, ?)");
                $stmt->execute([$licenciadaId, $data]);
            }

            Response::json(['success' => true]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    private function loadPrompt() {
        $path = __DIR__ . '/../prompts/system_prompt_clinico.txt';
        return file_exists($path) ? file_get_contents($path) : "Você é a Doctor Harmony, mentora técnica em fisiologia estética.";
    }
}
