<?php

class NexusForensicsController {
    private $pdo;
    private $user;

    public function __construct() {
        global $pdo, $loggedUser;
        $this->pdo = $pdo;
        $this->user = $loggedUser;
    }

    /**
     * POST /admin/nexus/forensics/analyze
     * Analyzes an uploaded PDF to extract forensic fingerprint.
     */
    public function analyze() {
        // Validation: Admin Only
        if (!$this->user || !$this->user['is_admin']) {
            Response::error('Unauthorized access.', 403);
        }

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $errorCode = $_FILES['file']['error'] ?? 'NONE';
            error_log("[FORENSICS] Upload failed. Error Code: $errorCode. REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
            Response::error('No file uploaded or upload error.', 400);
        }

        $tmpPath = $_FILES['file']['tmp_name'];
        $originalName = $_FILES['file']['name'];

        // Validate PDF type
        $mime = mime_content_type($tmpPath);
        if ($mime !== 'application/pdf') {
            Response::error('Invalid file type. Only PDFs are allowed.', 400);
        }

        try {
            // 1. Calculate Hash of Uploaded File
            $uploadHash = hash_file('sha256', $tmpPath);

            // 2. Check Database for Hash Match
            // Refactored to use JOIN to avoid "Unknown column 'l.student_id' in 'WHERE'" error
            $stmt = $this->pdo->prepare("
                SELECT l.*, s.name as student_name, s.cpf as student_cpf
                FROM ai_mentorship_logs l
                LEFT JOIN licenciadas s ON COALESCE(l.licenciada_id, l.license_id) = s.id
                WHERE l.file_hash = ?
                LIMIT 1
            ");
            $stmt->execute([$uploadHash]);
            $dbMatch = $stmt->fetch(PDO::FETCH_ASSOC);

            // 3. Extract Internal Fingerprint (Metadata)
            $service = new \BodyHarmony\Services\PdfFingerprintService();
            $fingerprint = $service->extractFingerprint($tmpPath);

            $evidence = [];
            
            // Correlate Evidence
            if ($fingerprint) {
                // Enrich fingerprint with DB data if possible (to get name)
                if (!isset($fingerprint['student_name']) && isset($fingerprint['licenciada_id'])) {
                    $sStmt = $this->pdo->prepare("SELECT name FROM licenciadas WHERE id = ?");
                    $sStmt->execute([$fingerprint['licenciada_id']]);
                    if ($name = $sStmt->fetchColumn()) {
                        $fingerprint['student_name'] = $name;
                    }
                }

                $evidence['fingerprint_valid'] = true;
                $evidence['extracted_data'] = $fingerprint;
                $evidence['licenciada_id'] = $fingerprint['licenciada_id'] ?? 'Unknown';
                $evidence['cpf'] = $fingerprint['cpf'] ?? 'Unknown';
            } else {
                $evidence['fingerprint_valid'] = false;
                $evidence['note'] = 'No valid forensic fingerprint found in metadata.';
            }

            // Build Report
            $report = [
                'file_name' => $originalName,
                'file_hash' => $uploadHash,
                'database_match' => $dbMatch ? [
                    'found' => true,
                    'licenciada' => $dbMatch['student_name'],
                    'cpf' => $dbMatch['student_cpf'],
                    'downloaded_at' => $dbMatch['created_at'],
                    'ip' => $dbMatch['ip_address'],
                    'location' => $dbMatch['geolocation']
                ] : ['found' => false],
                'fingerprint_analysis' => $evidence,
                'verdict' => ($dbMatch || ($fingerprint && isset($fingerprint['licenciada_id']))) 
                    ? 'POSITIVE_IDENTIFICATION' 
                    : 'INCONCLUSIVE'
            ];

            Response::json($report);

        } catch (Exception $e) {
            Response::error("Analysis failed: " . $e->getMessage(), 500);
        }
    }

    /**
     * GET /admin/nexus/forensics/students
     * Lists all students for the matrix lab.
     */
    public function listStudents() {
        if (!$this->user || !$this->user['is_admin']) {
            Response::error('Unauthorized access.', 403);
        }

        try {
            $stmt = $this->pdo->query("SELECT id, name, cpf FROM licenciadas WHERE is_active = 1 ORDER BY name ASC");
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::json($students);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /admin/nexus/forensics/generate-batch
     * Generates multiple PDF matrices and returns a TAR file.
     */
    public function generateBatch() {
        if (!$this->user || !$this->user['is_admin']) {
            Response::error('Unauthorized access.', 403);
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $studentIds = $data['student_ids'] ?? [];
        $config = $data['config'] ?? [];

        if (empty($studentIds)) {
            Response::error('No students selected.', 400);
        }

        try {
            $service = new \BodyHarmony\Services\PdfFingerprintService();
            $adminData = [
                'name' => $this->user['username'] ?? 'Admin',
                'ip' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'
            ];

            // Prepare Temporary Tar
            $tempDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'nexus_batch_' . uniqid();
            if (!mkdir($tempDir, 0755, true)) {
                throw new Exception("Failed to create temporary directory: " . $tempDir);
            }
            
            $tarPath = $tempDir . '.tar';
            if (!class_exists('PharData')) {
                throw new Exception("PHP extension 'Phar' is not enabled. Batch generation requires it.");
            }
            $tar = new PharData($tarPath);

            $placeholders = implode(',', array_fill(0, count($studentIds), '?'));
            $stmt = $this->pdo->prepare("SELECT id, name, cpf FROM licenciadas WHERE id IN ($placeholders)");
            $stmt->execute($studentIds);
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $generatedFiles = [];

            foreach ($students as $student) {
                $result = $service->generateMatrix($student, $adminData, $config);
                $tar->addFile($result['path'], $result['name']);
                $generatedFiles[] = $result['path'];

                // Audit Log for each generation
                $logStmt = $this->pdo->prepare("
                    INSERT INTO ai_mentorship_logs (license_id, interaction_type, file_hash, ip_address, created_at)
                    VALUES (?, 'GENERATION_MATRIX', ?, ?, NOW())
                ");
                $logStmt->execute([$student['id'], $result['hash'], $adminData['ip']]);
            }

            // Clean up individual temp files (PharData copied them)
            foreach ($generatedFiles as $f) {
                if (file_exists($f)) unlink($f);
            }

            // Since we are in an API, we can't easily return a file and keep the process.
            // We'll move the tar to a public-accessible temp folder or return it as base64 (not ideal).
            // Proper way: return a download link.
            
            $publicTempDir = dirname(__DIR__, 4) . '/public_html/temp_downloads';
            if (!is_dir($publicTempDir)) mkdir($publicTempDir, 0755, true);
            
            $finalTarName = 'Forensics_Lab_' . date('Ymd_His') . '.tar';
            $finalPath = $publicTempDir . '/' . $finalTarName;
            
            rename($tarPath, $finalPath);
            rmdir($tempDir);

            Response::json([
                'success' => true,
                'download_url' => '/temp_downloads/' . $finalTarName,
                'count' => count($students)
            ]);

        } catch (Exception $e) {
            Response::error("Batch generation failed: " . $e->getMessage(), 500);
        }
    }
    /**
     * GET /admin/nexus/forensics/logs
     * Returns recent forensics logs for auditing.
     */
    public function getRecentLogs() {
        if (!$this->user || !$this->user['is_admin']) {
            Response::error('Unauthorized access.', 403);
        }

        try {
            $stmt = $this->pdo->query("
                SELECT l.*, s.name as student_name, s.cpf as student_cpf
                FROM ai_mentorship_logs l
                LEFT JOIN licenciadas s ON COALESCE(l.licenciada_id, l.license_id) = s.id
                WHERE l.interaction_type = 'GENERATION_MATRIX' 
                   OR l.action IN ('DOWNLOAD_PROTECTED', 'DOWNLOAD_RAW', 'DOWNLOAD_SIGNATURE')
                ORDER BY l.created_at DESC
                LIMIT 50
            ");
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Decodar detalhes se necessário
            foreach ($logs as &$log) {
                if ($log['details'] && is_string($log['details'])) {
                    $log['details'] = json_decode($log['details'], true);
                }
            }

            Response::json(['logs' => $logs]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /admin/nexus/forensics/lookup/{hash}
     * Looks up forensics data by file hash without requiring a file upload.
     */
    public function lookupHash($hash) {
        if (!$this->user || !$this->user['is_admin']) {
            Response::error('Unauthorized access.', 403);
        }

        if (empty($hash)) {
            Response::error('Hash is required.', 400);
        }

        try {
            $stmt = $this->pdo->prepare("
                SELECT l.*, s.name as student_name, s.cpf as student_cpf
                FROM ai_mentorship_logs l
                LEFT JOIN licenciadas s ON COALESCE(l.licenciada_id, l.license_id) = s.id
                WHERE l.file_hash = ?
                LIMIT 1
            ");
            $stmt->execute([$hash]);
            $dbMatch = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$dbMatch) {
                Response::error('No record found for this hash.', 404);
            }

            // Build Report (Simulating analyze output format)
            $report = [
                'file_name' => 'Arquivo Identificado via Hash',
                'file_hash' => $hash,
                'database_match' => [
                    'found' => true,
                    'licenciada' => $dbMatch['student_name'],
                    'cpf' => $dbMatch['student_cpf'],
                    'downloaded_at' => $dbMatch['created_at'],
                    'ip' => $dbMatch['ip_address'],
                    'location' => $dbMatch['geolocation'] ?? 'Desconhecida'
                ],
                'fingerprint_analysis' => [
                    'fingerprint_valid' => true,
                    'extracted_data' => [
                        'student_name' => $dbMatch['student_name'],
                        'cpf' => $dbMatch['student_cpf']
                    ]
                ],
                'verdict' => 'POSITIVE_IDENTIFICATION'
            ];

            Response::json($report);

        } catch (Exception $e) {
            Response::error("Lookup failed: " . $e->getMessage(), 500);
        }
    }

    /**
     * GET /admin/nexus/forensics/config
     */
    public function getDefaultConfig() {
        if (!$this->user || !$this->user['is_admin']) Response::error('Unauthorized', 403);

        $stmt = $this->pdo->prepare("SELECT config_value FROM site_config WHERE config_key = 'forensics_default_layout'");
        $stmt->execute();
        $config = $stmt->fetchColumn();

        $default = [
            'text' => ['x' => 105, 'y' => 148, 'opacity' => 0.4, 'visible' => true, 'size' => 10],
            'logo' => ['x' => 25, 'y' => 25, 'opacity' => 0.1, 'visible' => true, 'size' => 30],
            'security' => ['x' => 185, 'y' => 275, 'opacity' => 0.05, 'visible' => true, 'size' => 20]
        ];

        Response::json($config ? json_decode($config, true) : $default);
    }

    /**
     * POST /admin/nexus/forensics/config
     */
    public function updateDefaultConfig() {
        if (!$this->user || !$this->user['is_admin']) Response::error('Unauthorized', 403);

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) Response::error('Invalid configuration data', 400);

        $stmt = $this->pdo->prepare("
            INSERT INTO site_config (config_key, config_value) 
            VALUES ('forensics_default_layout', ?)
            ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)
        ");
        $stmt->execute([json_encode($input)]);

        Response::json(['success' => true]);
    }
}
