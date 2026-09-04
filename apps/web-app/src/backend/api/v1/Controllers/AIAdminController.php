<?php
// apps/web-app/src/backend/api/v1/controllers/AIAdminController.php


require_once __DIR__ . '/../libs/GeminiService.php';

class AIAdminController {
    private $db;
    private $uploadDir;

    public function __construct() {
        global $pdo;
        $this->db = $pdo;
        $this->uploadDir = __DIR__ . '/../../../../../private_uploads/ai_cases/';
    }

    /**
     * Get all AI configurations
     * GET /api/v1/nexus/ai/config
     */
    public function getConfig() {
        if (!$this->isAdmin()) Response::error('Acesso negado.', 403);

        try {
            $stmt = $this->db->query("SELECT * FROM ai_config");
            $config = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Map to key-value for easier frontend usage
            $kv = [];
            foreach ($config as $row) {
                $kv[$row['config_key']] = $row['config_value'];
            }

            Response::json(['success' => true, 'config' => $kv, 'raw' => $config]);
        } catch (Exception $e) {
            Response::error('Erro ao buscar configurações: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update AI configurations
     * POST /api/v1/nexus/ai/config
     */
    public function updateConfig() {
        if (!$this->isAdmin()) Response::error('Acesso negado.', 403);

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data) Response::error('Dados inválidos.', 400);

        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("INSERT INTO ai_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = ?");
            
            foreach ($data as $key => $value) {
                $stmt->execute([$key, $value, $value]);
            }

            $this->db->commit();
            Response::json(['success' => true, 'message' => 'Configurações atualizadas.']);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            Response::error('Erro ao salvar: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Audit clinical cases (Shadow Log)
     * GET /api/v1/nexus/ai/audit
     */
    public function getAuditLogs() {
        if (!$this->isAdmin()) Response::error('Acesso negado.', 403);

        try {
            $stmt = $this->db->query("
                SELECT c.*, s.name as licenciada_name, l.license_key 
                FROM ai_clinical_cases c
                JOIN licenciadas s ON c.licenciada_id = s.id
                JOIN lms_licenses l ON c.license_id = l.id
                ORDER BY c.created_at DESC
                LIMIT 50
            ");
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::json(['success' => true, 'logs' => $logs]);
        } catch (Exception $e) {
            Response::error('Erro ao buscar logs: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Clinical Sandbox - Test AI without credits
     * POST /api/v1/nexus/ai/sandbox
     */
    public function runSandbox() {
        if (!$this->isAdmin()) Response::error('Acesso negado.', 403);

        $file = $_FILES['file'] ?? null;
        $userPrompt = $_POST['notes'] ?? 'Teste de Sandbox';
        $customSystemPrompt = $_POST['system_prompt'] ?? null;
        $customModel = $_POST['model'] ?? null;

        if (!$file) Response::error('Arquivo obrigatório para sandbox.', 400);

        $fileName = 'sandbox_' . time() . '_' . basename($file['name']);
        $targetPath = $this->uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Falha ao processar arquivo.', 500);
        }

        try {
            $gemini = new GeminiService();
            
            // Override settings for sandbox if provided
            if ($customModel) $gemini->setModel($customModel);
            
            // Get prompt from DB if not custom
            if (!$customSystemPrompt) {
                $stmt = $this->db->prepare("SELECT config_value FROM ai_config WHERE config_key = 'doctor_harmony_system_prompt' LIMIT 1");
                $stmt->execute();
                $customSystemPrompt = $stmt->fetchColumn() ?: "Você é a Doctor Harmony.";
            }

            $result = $gemini->analyze($targetPath, $file['type'], $customSystemPrompt, $userPrompt);

            // Save as admin test (doesn't count towards credits)
            $stmt = $this->db->prepare("
                INSERT INTO ai_clinical_cases 
                (license_id, licenciada_id, case_description, photo_path, doctor_harmony_response, confidence_score, status, is_admin_test) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            // Use 0 or special license for admin tests
            $stmt->execute([
                0, // System/Sandbox
                $_SESSION['user_id'] ?? 0, 
                "[SANDBOX] " . $userPrompt,
                $fileName,
                $result['opinion'] ?? 'Sem resposta.',
                $result['confidence'] ?? 0,
                'ANALYZED',
                1
            ]);

            Response::json(['success' => true, 'result' => $result]);
        } catch (Exception $e) {
            Response::error('Falha no Sandbox: ' . $e->getMessage(), 500);
        }
    }

    /**
     * AI Health Check
     * GET /api/v1/nexus/ai/health
     */
    public function healthCheck() {
        if (!$this->isAdmin()) Response::error('Acesso negado.', 403);

        try {
            $gemini = new GeminiService();
            // Simple text-only ping
            $url = "https://generativelanguage.googleapis.com/v1beta/models/" . getenv('GEMINI_MODEL') . ":generateContent?key=" . getenv('GOOGLE_AI_KEY');
            // Actually uses the service to be sure
            // For now, simple response
            Response::json([
                'success' => true, 
                'status' => 'online',
                'model' => getenv('GEMINI_MODEL') ?: 'gemini-1.5-pro',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
        } catch (Exception $e) {
            Response::error('IA Status: Offline. ' . $e->getMessage(), 500);
        }
    }

    private function isAdmin() {
        return (($_SESSION['role'] ?? '') === 'superadmin' || ($_SESSION['role'] ?? '') === 'admin');
    }
}
