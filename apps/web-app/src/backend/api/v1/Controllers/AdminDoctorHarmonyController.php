<?php
// apps/web-app/src/backend/api/v1/Controllers/AdminDoctorHarmonyController.php

class AdminDoctorHarmonyController {
    private $pdo;
    
    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }
    

    
    // reviewCase logic is handled by DoctorHarmonyController::submitReview via the router.
    // getPendingCases is also handled by DoctorHarmonyController.

    /**
     * GET /admin/doctor-harmony/config
     * Get Doctor Harmony neural config from Database
     */
    public function getConfig() {
        try {
            $stmt = $this->pdo->query("SELECT config_key, config_value FROM ai_config");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $config = [];
            foreach ($rows as $row) {
                $config[$row['config_key']] = $row['config_value'];
            }

            // Defaults if missing
            $defaults = [
                'doctor_harmony_system_prompt' => 'Você é a Doctor Harmony...',
                'gemini_model' => 'gemini-2.0-flash',
                'confidence_threshold' => 0.8,
                'gemini_api_key' => '',
                'ai_provider' => 'gemini',
                'nvidia_api_key' => '',
                'nvidia_model' => 'meta/llama-3.2-11b-vision-instruct'
            ];

            $finalConfig = array_merge($defaults, $config);

            Response::json([
                'success' => true,
                'config' => $finalConfig
            ]);
        } catch (Exception $e) {
            Response::error('Failed to load config: ' . $e->getMessage());
        }
    }
    
    /**
     * POST /admin/doctor-harmony/config
     * Update Doctor Harmony neural config
     */
    public function updateConfig() {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) Response::error('Invalid JSON');

        try {
            $this->pdo->beginTransaction();
            
            $allowedKeys = [
                'doctor_harmony_system_prompt', 
                'gemini_model', 
                'confidence_threshold', 
                'gemini_api_key',
                'ai_provider',
                'nvidia_api_key',
                'nvidia_model'
            ];
            
            $stmt = $this->pdo->prepare("
                INSERT INTO ai_config (config_key, config_value) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)
            ");

            foreach ($data as $key => $value) {
                if (in_array($key, $allowedKeys)) {
                    $stmt->execute([$key, $value]);
                }
            }
            
            // Also update site_config if ai_name changed (optional, but good for consistency)
            
            $this->pdo->commit();
            Response::json(['success' => true, 'message' => 'Configuration updated']);
        } catch (Exception $e) {
            $this->pdo->rollBack();
            Response::error('Failed to update config: ' . $e->getMessage());
        }
    }

     /**
     * GET /admin/doctor-harmony/audit
     * Get Doctor Harmony audit logs
     */
    public function getAuditLogs() {
        try {
            // Using existing logic from original AdminAnaController but targeting new column names
            // ai_clinical_cases joined with lms_licenses/students
            $stmt = $this->pdo->query("
                SELECT 
                    c.id, 
                    s.name as licenciada_name,
                    l.license_key,
                    c.case_description,
                    c.confidence_score,
                    c.status,
                    c.photo_path,
                    c.created_at,
                    c.doctor_harmony_response as ai_response
                FROM ai_clinical_cases c
                LEFT JOIN lms_licenses l ON c.license_id = l.id
                LEFT JOIN licenciadas s ON c.licenciada_id = s.id
                ORDER BY c.created_at DESC
                LIMIT 50
            ");
            
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::json(['success' => true, 'logs' => $logs]);
        } catch (Exception $e) {
            Response::error('Failed to load audit logs: ' . $e->getMessage());
        }
    }

    /**
     * GET /admin/doctor-harmony/health
     * Check System Health
     */
    public function healthCheck() {
        // Simple check: DB connection + Config presence
        try {
            $stmt = $this->pdo->query("SELECT count(*) FROM ai_config");
            $configCount = $stmt->fetchColumn();
            
            Response::json([
                'success' => true,
                'status' => 'OPERATIONAL',
                'details' => [
                    'database' => 'Connected',
                    'config_loaded' => $configCount > 0
                ]
            ]);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'status' => 'CRITICAL',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * POST /admin/doctor-harmony/sandbox
     * Run a test case without saving to DB
     */
    public function runSandbox() {
        $notes = $_POST['notes'] ?? '';
        $file = $_FILES['file'] ?? null;
        
        if (!$notes && !$file) {
            Response::error('Provide text notes or an image/audio file.', 400);
        }

        try {
            if (!class_exists('GeminiService')) {
                require_once __DIR__ . '/../libs/GeminiService.php';
            }
            $gemini = new GeminiService();

            // Load Config
            $stmt = $this->pdo->query("SELECT config_key, config_value FROM ai_config");
            $configs = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

            if (isset($configs['gemini_model'])) $gemini->setModel($configs['gemini_model']);
            if (isset($configs['gemini_api_key'])) $gemini->setApiKey($configs['gemini_api_key']);
            if (isset($configs['ai_provider'])) $gemini->setProvider($configs['ai_provider']);
            if (isset($configs['nvidia_api_key'])) $gemini->setNvidiaKey($configs['nvidia_api_key']);
            if (isset($configs['nvidia_model'])) $gemini->setNvidiaModel($configs['nvidia_model']);
            
            $systemPrompt = $configs['doctor_harmony_system_prompt'] ?? "Você é a Doctor Harmony.";
            $context = "SANDBOX TEST MODE. Provide detailed reasoning.";

            // Handle file if present, otherwise text-only (if GeminiService supports it, 
            // but analyze() requires a file. We might need a text-only method or a dummy file?)
            // Looking at GeminiService::analyze, it expects $filePath. 
            // If no file, we can't use analyze() as is. 
            // For Sandbox, we mostly test PROMPTS on CASES (which usually have images).
            // Let's enforce file for now OR support text-only via a different call if service allows.
            // Current GeminiService::analyze requires file. We will require file for Sandbox too 
            // OR create a temporary blank image if just testing text? No, safer to require file.
            
            if (!$file) {
                 Response::error('Sandbox requires a file input for now (Gemini V1 restrictions).', 400);
            }

            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $tempPath = sys_get_temp_dir() . '/sandbox_' . uniqid() . '.' . $ext;
            
            // Allow rename() for CLI testing or local dev where move_uploaded_file strict checks might fail
            if (!move_uploaded_file($file['tmp_name'], $tempPath) && !rename($file['tmp_name'], $tempPath)) {
                Response::error('Failed to process sandbox file.', 500);
            }

            $aiResult = $gemini->analyze(
                $tempPath, 
                $file['type'], 
                $systemPrompt . "\n\n" . $context, 
                $notes
            );

            // Cleanup
            @unlink($tempPath);

            Response::json([
                'success' => true,
                'result' => [
                    'confidence' => $aiResult['confidence'] ?? 0,
                    'opinion' => $aiResult['opinion'] ?? 'No response',
                    'raw' => $aiResult
                ]
            ]);

        } catch (Exception $e) {
            Response::error('Sandbox Error: ' . $e->getMessage(), 500);
        }
    }
}
