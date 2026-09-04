<?php
// api/v1/Controllers/LicenciadasController.php

class LicenciadasController {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function getData(): array {
        $stmt = $this->pdo->query("SELECT * FROM licenciadas ORDER BY name ASC");
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->processRows($result);
        return $result ?: [];
    }

    public function index() {
        try {
            Response::json($this->getData());
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function show($id) {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM licenciadas WHERE id = ?");
            $stmt->execute([$id]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$student) {
                Response::error('Licenciada not found', 404);
            }

            $rows = [$student];
            $this->processRows($rows);
            Response::json($rows[0]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function export() {
        try {
            // Select all relevant fields for the Google Sheet
            // We use standard JSON format which Zapier/Make can easily parse
            $sql = "
                SELECT 
                    id, 
                    name, 
                    username, 
                    state, 
                    location, 
                    whatsapp, 
                    instagram,
                    photo_url,
                    is_active,
                    created_at as start_date,
                    last_login_at
                FROM licenciadas 
                ORDER BY name ASC
            ";
            
            $stmt = $this->pdo->query($sql);
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Access Logs Summary (Optional, but useful for 'Auditoria')
            // This might differ from the main query to keep it fast.
            // Let's just key relevant data.

            $exportData = [];
            foreach ($students as $s) {
                $exportData[] = [
                    'id' => $s['id'],
                    'full_name' => $s['name'],
                    'username' => $s['username'],
                    'instagram' => $s['instagram'],
                    'photo_url' => $s['photo_url'],
                    'location' => [
                        'city' => $s['location'], // Often merged in location field
                        'state' => $s['state']
                    ],
                    'status' => $s['is_active'] ? 'Ativa' : 'Inativa',
                    'dates' => [
                        'start' => $s['start_date'],
                        'renewal' => $s['renewal_date']
                    ],
                    'contact' => [
                        'whatsapp' => $s['whatsapp']
                    ],
                    'notes' => $s['admin_notes'],
                    'stats' => [
                        'progress' => $s['progress_percent'] . '%',
                        'last_login' => $s['last_login_at']
                    ]
                ];
            }

            Response::json(['licenciadas' => $exportData, 'generated_at' => date('Y-m-d H:i:s')]);

        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function store() {
        // multipart/form-data fields are in $_POST, files in $_FILES
        $data = $_POST;
        if (empty($data)) Response::error('Nenhum dado enviado.', 400);

        // Debug Log (Nexus V3.1)
        $debugLog = FS_ROOT . '/apps/web-app/src/backend/api/v1/storage/debug_store_new.log';
        file_put_contents($debugLog, "[" . date('Y-m-d H:i:s') . "] STORE CALLED\n", FILE_APPEND);
        file_put_contents($debugLog, "POST: " . json_encode($_POST) . "\n", FILE_APPEND);

        // Validation
        if (empty($data['name'])) Response::error('O nome é obrigatório.', 400);

        try {
            $this->pdo->beginTransaction();

            $cpf = preg_replace('/\D/', '', $data['cpf'] ?? ''); 
            // V3.1: Se não houver email, gera um seguro baseado no CPF ou UUID
            $safeEmail = $data['email'] ?? ($cpf ? "licenciada_{$cpf}@bodyharmony.com.br" : "licenciada_" . uniqid() . "@bodyharmony.com.br");
            
            $sql = "INSERT INTO licenciadas (name, state, location, photo_url, whatsapp, instagram, instagram_embed_url, video_url, mini_gallery, max_devices, is_active, pinned, password_hash, force_password_change, cpf, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);

            $gallery = $data['miniGallery'] ?? '[]';
            $isActive = isset($data['isActive']) ? (int)($data['isActive'] === 'true' || $data['isActive'] === '1') : 1;
            $pinned = isset($data['pinned']) ? (int)($data['pinned'] === 'true' || $data['pinned'] === '1') : 0;

            // Sincronização de campos: O frontend pode mandar whatsapp ou whatsapp_number
            $whatsapp = $data['whatsapp'] ?? ($data['whatsapp_number'] ?? '');

            $passwordToUse = null;
            $forcePasswordChange = 0;
            if (!empty($data['password'])) {
                $passwordToUse = password_hash($data['password'], PASSWORD_DEFAULT);
                $forcePasswordChange = 0;
            } else {
                // Default password Mudar123! (Seguro para onboarding)
                $passwordToUse = '$2y$12$luoClyG.xSRedqjR//w94O/W7ei50nf371shSMVUcYZVlryUyvYWC';
                $forcePasswordChange = 1;
            }

            $stmt->execute([
                $data['name'],
                $data['state'] ?? 'SP',
                $data['location'] ?? '',
                '', // Temporary empty photo_url
                $whatsapp,
                $data['instagram'] ?? '',
                $data['instagramEmbed'] ?? null,
                $data['videoUrl'] ?? '',
                $gallery,
                (int)($data['maxDevices'] ?? 1),
                $isActive,
                $pinned,
                $passwordToUse,
                $forcePasswordChange,
                $cpf,
                $safeEmail
            ]);

            $newId = $this->pdo->lastInsertId();

            // Auditoria de Criação
            $logMsg = "Licenciada criada: ID {$newId}, Nome: {$data['name']}, CPF: {$cpf}";
            try {
                $this->pdo->prepare("INSERT INTO tb_system_logs (log_type, message, context, user_id) VALUES ('SUCCESS', ?, 'AdminPanel', 0)")->execute([$logMsg]);
            } catch (Exception $eLog) {
                // Ignorar erro silencioso de log para não quebrar o fluxo principal
            }

            // Now handle mandatory renaming if photo is present
            if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                try {
                    $photoUrl = $this->handleUpload($_FILES['photo'], $newId, $data['name'], $cpf);
                    $this->pdo->prepare("UPDATE licenciadas SET photo_url = ? WHERE id = ?")->execute([$photoUrl, $newId]);
                } catch (Exception $eUpload) {
                    error_log("Upload failed for Licenciada {$newId}: " . $eUpload->getMessage());
                    // Não dar rollback por erro de foto, apenas logar
                }
            } elseif (!empty($data['photo_url'])) {
                 $this->pdo->prepare("UPDATE licenciadas SET photo_url = ? WHERE id = ?")->execute([$data['photo_url'], $newId]);
            }

            $this->pdo->commit();
            ResponseCache::clear('gestor_licenciadas_list_');
            Response::json(['success' => true, 'id' => $newId], 201);

        } catch (PDOException $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            
            // Especial: Tratar erro de duplicidade (MySQL Error 1062 / SQLState 23000)
            if ($e->getCode() == 23000 || str_contains($e->getMessage(), '1062')) {
                $msg = 'Erro de conflito: Já existe uma licenciada cadastrada com este CPF, Email ou WhatsApp.';
                if (str_contains($e->getMessage(), 'cpf')) $msg = 'Este CPF já está em uso por outra licenciada.';
                if (str_contains($e->getMessage(), 'email')) $msg = 'Este E-mail já está em uso.';
                if (str_contains($e->getMessage(), 'whatsapp_number')) $msg = 'Este número de WhatsApp já está cadastrado.';
                
                Response::error($msg, 409);
            }
            
            Response::error('Erro de banco de dados: ' . $e->getMessage(), 500);
            
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            $debugLog = FS_ROOT . '/apps/web-app/src/backend/api/v1/storage/debug_store_new.log';
            file_put_contents($debugLog, "[" . date('Y-m-d H:i:s') . "] GENERAL ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
            Response::error($e->getMessage(), 500);
        }
    }

    public function update($id) {
        ob_start();
        $data = $_POST;
        
        // Robustness: Handle JSON input if POST is empty (e.g. non-multipart PUT/POST)
        if (empty($data)) {
            $input = json_decode(file_get_contents("php://input"), true);
            if (!empty($input)) {
                $data = $input;
            }
        }

        if (empty($data)) Response::error('Nenhum dado enviado.', 400);

        try {
            $fields = [];
            $values = [];

            // Map fields
            $map = [
                'name' => 'name',
                'state' => 'state',
                'location' => 'location',
                'whatsapp' => 'whatsapp',
                'instagram' => 'instagram',
                'instagramEmbed' => 'instagram_embed_url',
                'videoUrl' => 'video_url',
                'maxDevices' => 'max_devices',
                'photo_url' => 'photo_url',
                'isTester' => 'is_tester',
                'telegram_user_id' => 'telegram_user_id',
                'ai_notebook_beta_enabled' => 'ai_notebook_beta_enabled',
                'aiNotebookBetaEnabled' => 'ai_notebook_beta_enabled'
            ];

            foreach ($map as $postKey => $dbKey) {
                if (isset($data[$postKey])) {
                    $val = $data[$postKey];
                    if ($dbKey === 'ai_notebook_beta_enabled') {
                        $val = ($val === true || $val === 'true' || $val === 1 || $val === '1') ? 1 : 0;
                    }
                    $fields[] = "$dbKey = ?";
                    $values[] = $val;
                }
            }

            if (isset($data['isActive'])) {
                $fields[] = "is_active = ?";
                $values[] = ($data['isActive'] === 'true' || $data['isActive'] === '1') ? 1 : 0;
            }

            if (isset($data['miniGallery'])) {
                $fields[] = "mini_gallery = ?";
                $values[] = $data['miniGallery'];
            }

            if (isset($data['pinned'])) {
                $fields[] = "pinned = ?";
                $values[] = ($data['pinned'] === 'true' || $data['pinned'] === '1') ? 1 : 0;
            }

            if (isset($data['password']) && !empty($data['password'])) {
                $fields[] = "password_hash = ?";
                $values[] = password_hash($data['password'], PASSWORD_DEFAULT);
            }

            $newCpf = isset($data['cpf']) ? preg_replace('/\D/', '', $data['cpf']) : null;
            if ($newCpf !== null) {
                $fields[] = "cpf = ?";
                $values[] = $newCpf;
            }

            // --- Renaming Logic Start ---
            // We need current student data to know if (Name or CPF) changed, and what the old photo was.
            $stmtCurrent = $this->pdo->prepare("SELECT name, cpf, photo_url FROM licenciadas WHERE id = ?");
            $stmtCurrent->execute([$id]);
            $currentStudent = $stmtCurrent->fetch(PDO::FETCH_ASSOC);

            if ($currentStudent) {
                // Determine effective Name and CPF
                $effectiveName = isset($data['name']) ? $data['name'] : $currentStudent['name'];
                $effectiveCpf = $newCpf !== null ? $newCpf : $currentStudent['cpf'];
                
                // Handle Photo Upload (New File)
                if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                    $photoUrl = $this->handleUpload($_FILES['photo'], $id, $effectiveName, $effectiveCpf);
                    $fields[] = "photo_url = ?";
                    $values[] = $photoUrl;
                    
                    // Optional: Delete old file if it's different and local?
                    // For now, let's just focus on saving the new one correctly.
                    
                } else {
                    // No new photo, but maybe we need to RENAME the existing one?
                    // Triggers: Name changed OR CPF changed OR Old file doesn't match pattern
                    $currentPhotoUrl = $currentStudent['photo_url'];
                    
                    if (!empty($currentPhotoUrl) && strpos($currentPhotoUrl, '/uploads/licenciadas/') !== false) {
                        // Extract filename
                        $oldBasename = basename($currentPhotoUrl);
                        $extension = pathinfo($oldBasename, PATHINFO_EXTENSION);
                        
                        $desiredBasename = $id . '_' . $this->sanitizeFilename($effectiveName);
                        if ($effectiveCpf) {
                            $desiredBasename .= '_' . $effectiveCpf;
                        }
                        $desiredFilename = $desiredBasename . '.' . $extension;

                        // Only rename if different
                        if ($oldBasename !== $desiredFilename && !empty($effectiveName)) {
                            try {
                                if (!defined('PUBLIC_UPLOADS_DIR')) {
                                    throw new Exception('PUBLIC_UPLOADS_DIR not defined');
                                }
                                $uploadDir = PUBLIC_UPLOADS_DIR . '/licenciadas/';
                                $oldPath = $uploadDir . $oldBasename;
                                $newPath = $uploadDir . $desiredFilename;

                                if (file_exists($oldPath)) {
                                    if (rename($oldPath, $newPath)) {
                                        $newUrl = '/uploads/licenciadas/' . $desiredFilename;
                                        $fields[] = "photo_url = ?";
                                        $values[] = $newUrl;
                                    }
                                }
                            } catch (Exception $renameEx) {
                                error_log('[LicenciadasController] Rename skipped: ' . $renameEx->getMessage());
                                // Non-fatal: skip renaming, proceed with update
                            }
                        }
                    }
                }
            }
            // --- Renaming Logic End ---

            if (empty($fields)) Response::error('Nenhum campo para atualizar.', 400);

            $values[] = $id;
            $sql = "UPDATE licenciadas SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($values);

            ResponseCache::clear('gestor_licenciadas_list_');
            Response::json(['success' => true]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function destroy($id) {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM licenciadas WHERE id = ?");
            $stmt->execute([$id]);
            ResponseCache::clear('gestor_licenciadas_list_');
            Response::json(['success' => true]);
        } catch (PDOException $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // PUT /auth/student/profile
    public function updateProfile() {
        global $loggedUser;
        if (!$loggedUser || $loggedUser['id'] <= 0) {
            Response::error('Unauthorized', 401);
        }

        $id = $loggedUser['id'];
        $input = json_decode(file_get_contents("php://input"), true);
        if (empty($input)) Response::error('Nenhum dado enviado.', 400);

        try {
            $fields = [];
            $values = [];

            // Allowed fields for self-update
            $allowed = [
                'name' => 'name',
                'whatsapp' => 'whatsapp',
                'instagram' => 'instagram',
                'location' => 'location',
                'state' => 'state',
                'username' => 'username'
            ];

            foreach ($allowed as $inputKey => $dbKey) {
                if (isset($input[$inputKey])) {
                    $fields[] = "$dbKey = ?";
                    $values[] = $input[$inputKey];
                }
            }

            if (!empty($input['password'])) {
                if (strlen($input['password']) < 6) {
                    Response::error('A senha deve ter pelo menos 6 caracteres.', 400);
                }
                $fields[] = "password_hash = ?";
                $values[] = password_hash($input['password'], PASSWORD_DEFAULT);
                $fields[] = "force_password_change = ?";
                $values[] = 0;
            }

            if (empty($fields)) {
                Response::error('Nenhum campo editável enviado.', 400);
            }

            $values[] = $id;
            $sql = "UPDATE licenciadas SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($values);

            // Fetch updated data to return
            $stmtSelect = $this->pdo->prepare("SELECT * FROM licenciadas WHERE id = ?");
            $stmtSelect->execute([$id]);
            $updated = $stmtSelect->fetch(PDO::FETCH_ASSOC);
            
            $rows = [$updated];
            $this->processRows($rows);

            ResponseCache::clear('gestor_licenciadas_list_');
            Response::json([
                'success' => true,
                'message' => 'Perfil atualizado com sucesso.',
                'student' => $rows[0]
            ]);

        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function getDevices($licenciadaId) {
        try {
            $stmt = $this->pdo->prepare("SELECT id, device_token, user_agent, ip_address, is_active, last_used_at, created_at FROM licenciada_devices WHERE licenciada_id = ? ORDER BY last_used_at DESC");
            $stmt->execute([$licenciadaId]);
            $devices = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::json(['success' => true, 'devices' => $devices]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function removeDevice($deviceId) {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM licenciada_devices WHERE id = ?");
            $stmt->execute([$deviceId]);
            Response::json(['success' => true]);
        } catch (PDOException $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function revokeDevices($licenciadaId) {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM licenciada_devices WHERE licenciada_id = ?");
            $stmt->execute([$licenciadaId]);
            Response::json(['success' => true, 'message' => 'Todos os dispositivos revogados.']);
        } catch (PDOException $e) {
            Response::error($e->getMessage(), 500);
        }
    }


    private function processRows(&$rows) {
        if (!is_array($rows)) return;
        foreach ($rows as &$row) {
            if (!is_array($row)) continue;
            $row['mini_gallery'] = json_decode($row['mini_gallery'] ?? '[]');
            $row['pinned'] = (bool)($row['pinned'] ?? 0);
            
            // CamelCase mapping (Defensive V39.1)
            $row['photo'] = $row['photo_url'] ?? ''; 
            
            $row['instagramEmbed'] = $row['instagram_embed_url'] ?? null;
            $row['videoUrl'] = $row['video_url'] ?? '';
            $row['maxDevices'] = (int)($row['max_devices'] ?? 1);
            $row['isActive'] = (bool)($row['is_active'] ?? 1);
            $row['isTester'] = (bool)($row['is_tester'] ?? 0);
            $row['lastLogin'] = $row['last_login_at'] ?? null;
            
            // Cleanup internal columns
            if (isset($row['photo_url'])) unset($row['photo_url']);
            if (isset($row['instagram_embed_url'])) unset($row['instagram_embed_url']);
            if (isset($row['video_url'])) unset($row['video_url']);
            if (isset($row['password_hash'])) unset($row['password_hash']);
        }
    }

    private function handleUpload($file, $id, $nameContext, $cpf = null) {
        $uploadDir = PUBLIC_UPLOADS_DIR . '/licenciadas/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        if (empty($extension)) {
            $extension = 'jpg'; // Default
        }

        $baseName = $id . '_' . $this->sanitizeFilename($nameContext);
        if ($cpf) {
            $baseName .= '_' . preg_replace('/\D/', '', $cpf);
        }
        
        $filename = $baseName . '.' . $extension;
        
        $targetPath = $uploadDir . $filename;
        $publicPath = '/uploads/licenciadas/' . $filename;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return $publicPath;
        }

        throw new Exception('Falha ao salvar a imagem no servidor.');
    }
    private function sanitizeFilename($string) {
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
        $string = str_replace(' ', '_', $string);
        $string = preg_replace('/[^a-zA-Z0-9_\-]/', '', $string);
        return $string;
    }

    // ----------------------------------------------------------------
    // POST /v1/admin/licenciadas/{id}/reset-password (V88 - Bot Support)
    // Body: { password }
    // ----------------------------------------------------------------
    public function resetPassword($id) {
        $input    = json_decode(file_get_contents('php://input'), true);
        $password = $input['password'] ?? '';

        if (strlen($password) < 6) {
            Response::error('A senha deve ter pelo menos 6 caracteres.', 400);
        }

        try {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $this->pdo->prepare(
                "UPDATE licenciadas SET password_hash = ?, force_password_change = 1 WHERE id = ?"
            )->execute([$hash, $id]);
            ResponseCache::clear('gestor_licenciadas_list_');
            Response::json(['success' => true]);
        } catch (PDOException $e) {
            Response::error('Erro ao redefinir senha.', 500);
        }
    }
}
