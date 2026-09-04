<?php
// apps/web-app/src/backend/api/v1/Controllers/AiClinicalController.php



class AiClinicalController {
    private $db;
    private $uploadDir;
    private $confidenceThreshold = 0.75;

    public function __construct() {
        global $pdo;
        $this->db = $pdo;
        $this->uploadDir = PRIVATE_UPLOADS_DIR . '/ai_cases/';
    }

    /**
     * Get student AI credits balance
     * GET /lms/ai/credits
     */
    public function getCredits() {
        $licenciadaId = $_SESSION['licenciada_id'] ?? null;
        
        // Non-blocking: Return graceful response instead of 401
        if (!$licenciadaId) {
            Response::json([
                'success' => true,
                'credits' => [
                    'evals_remaining' => 0,
                    'audio_remaining' => 0
                ],
                'available' => false,
                'message' => 'AI features require authentication'
            ]);
            return;
        }

        try {
            $stmt = $this->db->prepare("
                SELECT c.*, p.name as plan_name, p.eval_limit, p.audio_limit 
                FROM licenciada_ai_credits c
                JOIN ai_mentorship_plans p ON c.plan_id = p.id
                WHERE c.licenciada_id = ?
            ");
            $stmt->execute([$licenciadaId]);
            $credits = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$credits) {
                // Initialize default 'Start' plan if none exists
                $this->initializeDefaultCredits($licenciadaId);
                return $this->getCredits();
            }

            Response::json(['success' => true, 'credits' => $credits, 'available' => true]);
        } catch (Exception $e) {
            // Non-blocking error: Return graceful response
            Response::json([
                'success' => true,
                'credits' => [
                    'evals_remaining' => 0,
                    'audio_remaining' => 0
                ],
                'available' => false,
                'message' => 'AI service temporarily unavailable'
            ]);
        }
    }

    /**
     * Evaluate clinical case (Image or Audio)
     * POST /lms/ai/evaluate
     */
    public function evaluate() {
        $licenciadaId = $_SESSION['licenciada_id'] ?? null;
        if (!$licenciadaId) Response::error('Licenciada not authenticated.', 401);

        // 1. Check Credits
        $credits = $this->getCreditBalance($licenciadaId);
        $type = $_POST['type'] ?? 'image'; // 'image' or 'audio'
        
        if ($type === 'image' && $credits['evals_remaining'] <= 0) {
            Response::error('No evaluation credits remaining.', 403);
        }
        if ($type === 'audio' && $credits['audio_remaining'] <= 0) {
            Response::error('No audio notes credits remaining.', 403);
        }

        // 2. Handle File Upload
        if (!isset($_FILES['file'])) Response::error('No file uploaded.', 400);
        $file = $_FILES['file'];
        
        $fileName = time() . '_' . basename($file['name']);
        $targetPath = $this->uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Failed to save file.', 500);
        }

        try {
            // 3. AI Analysis (Gemini 1.5 Pro Integration)
            $gemini = new GeminiService();
            $systemPrompt = $this->loadSystemPrompt();
            
            $aiResult = $gemini->analyze(
                $targetPath, 
                $file['type'], 
                $systemPrompt, 
                $_POST['notes'] ?? "Analise este caso clínico do Método Body Harmony."
            );

            if (!isset($aiResult['opinion'])) {
                throw new Exception("Invalid AI response structure.");
            }

            // 4. Save Case
            $stmt = $this->db->prepare("
                INSERT INTO ai_clinical_cases 
                (licenciada_id, case_title, file_path, doctor_harmony_response, confidence_score, needs_review) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            $confidence = $aiResult['confidence'] ?? 0;
            $reviewNeeded = $confidence < $this->confidenceThreshold;
            
            $stmt->execute([
                $licenciadaId,
                $type,
                $fileName,
                $aiResult['opinion'],
                $confidence,
                $reviewNeeded ? 1 : 0
            ]);

            // 5. Deduct Credit
            $this->deductCredit($licenciadaId, $type);

            Response::json([
                'success' => true,
                'opinion' => $aiResult['opinion'],
                'confidence' => $confidence,
                'review_needed' => $reviewNeeded,
                'muscle_groups' => $aiResult['muscle_groups'] ?? [],
                'safety_warnings' => $aiResult['safety_warnings'] ?? [],
                'remaining' => ($type === 'image' ? $credits['evals_remaining'] - 1 : $credits['audio_remaining'] - 1)
            ]);

        } catch (Exception $e) {
            error_log("[DOCTOR HARMONY CLINICAL ERROR] " . $e->getMessage());
            Response::error('AI Evaluation failed: ' . $e->getMessage(), 500);
        }
    }

    private function loadSystemPrompt() {
        $path = __DIR__ . '/../prompts/system_prompt_clinico.txt';
        if (!file_exists($path)) return "Você é uma assistente clínica técnica do Método Body Harmony.";
        return file_get_contents($path);
    }

    /**
     * Get pending mentor reviews
     * GET /admin/ana/cases/pending
     */
    public function getPendingCases() {
        try {
            $stmt = $this->db->query("
                SELECT c.*, s.name as licenciada_name 
                FROM ai_clinical_cases c
                JOIN licenciadas s ON c.licenciada_id = s.id
                WHERE c.needs_review = 1 
                AND c.mentor_feedback IS NULL
                ORDER BY c.created_at DESC
            ");
            $cases = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::json(['success' => true, 'cases' => $cases]);
        } catch (Exception $e) {
            Response::error('Error fetching cases: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Submit mentor review
     * POST /admin/ana/cases/{id}/review
     */
    public function submitReview($id) {
        $notes = $_POST['notes'] ?? '';
        if (!$notes) Response::error('Notes are required.', 400);

        try {
            $stmt = $this->db->prepare("
                UPDATE ai_clinical_cases 
                SET mentor_feedback = ?, needs_review = 0 
                WHERE id = ?
            ");
            $stmt->execute([$notes, $id]);
            Response::json(['success' => true, 'message' => 'Review submitted successfully.']);
        } catch (Exception $e) {
            Response::error('Error submitting review: ' . $e->getMessage(), 500);
        }
    }

    // --- Private Helpers ---

    private function getCreditBalance($licenciadaId) {
        $stmt = $this->db->prepare("SELECT * FROM licenciada_ai_credits WHERE licenciada_id = ?");
        $stmt->execute([$licenciadaId]);
        $credits = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$credits) {
            $this->initializeDefaultCredits($licenciadaId);
            return $this->getCreditBalance($licenciadaId);
        }
        return $credits;
    }

    private function initializeDefaultCredits($licenciadaId) {
        // Find 'Start' plan
        $stmt = $this->db->query("SELECT * FROM ai_mentorship_plans WHERE name = 'Start' LIMIT 1");
        $plan = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($plan) {
            $stmt = $this->db->prepare("
                INSERT INTO licenciada_ai_credits (licenciada_id, plan_id, evals_remaining, audio_remaining, renews_at)
                VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 MONTH))
            ");
            $stmt->execute([$licenciadaId, $plan['id'], $plan['eval_limit'], $plan['audio_limit']]);
        }
    }

    private function deductCredit($licenciadaId, $type) {
        $column = ($type === 'image') ? 'evals_remaining' : 'audio_remaining';
        $stmt = $this->db->prepare("UPDATE licenciada_ai_credits SET $column = $column - 1 WHERE licenciada_id = ?");
        $stmt->execute([$licenciadaId]);
    }

    private function mockAiAnalysis($type) {
        if ($type === 'image') {
            return [
                'opinion' => 'Análise Visual (MOCK): Identificada assimetria leve no quadrante superior. Recomendada aplicação com frequência de 35Hz para foco em gordura subdérmica.',
                'confidence' => 0.82
            ];
        } else {
            return [
                'opinion' => 'Notas de Áudio (MOCK): Transcrição realizada. Paciente relata sensibilidade aumentada. Ajustar largura de pulso para maior conforto.',
                'confidence' => 0.65 // Triggering review
            ];
        }
    }
}
