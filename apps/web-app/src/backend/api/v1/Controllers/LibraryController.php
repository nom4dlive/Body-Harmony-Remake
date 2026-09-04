<?php
// api/v1/Controllers/LibraryController.php

class LibraryController {
    private $pdo;
    private $user;
    private $logger;

    public function __construct() {
        global $pdo, $loggedUser;
        $this->pdo = $pdo;
        $this->user = $loggedUser;
        $this->logger = new LoggerService($pdo);
    }

    // GET /admin/library
    public function index() {
        try {
            $stmt = $this->pdo->query("SELECT * FROM lms_resources ORDER BY created_at DESC");
            $resources = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::json($resources);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/library
    public function store() {
        $title = $_POST['title'] ?? null;
        $category = $_POST['category'] ?? 'other';
        
        if (!$title) Response::error('Título é obrigatório', 400);

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            Response::error('Erro no upload do arquivo', 400);
        }

        $file = $_FILES['file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'jpg', 'jpeg', 'png', 'webp', 'mp3', 'mp4'];
        
        if (!in_array($ext, $allowed)) Response::error('Formato não permitido', 400);

        $hash = bin2hex(random_bytes(4)); // Short hash for readability
        
        // Semantic Naming: sanitized-original-name_timestamp_hash.ext
        $originalName = pathinfo($file['name'], PATHINFO_FILENAME);
        $slug = preg_replace('/[^a-z0-9\-]/', '', str_replace(' ', '-', strtolower($originalName)));
        $safeName = "{$slug}_" . time() . "_{$hash}.{$ext}";
        
        // Use Global Constant (Consolidation V36)
        $targetDir = PRIVATE_UPLOADS_DIR . '/library/';
        if (!is_dir($targetDir)) mkdir($targetDir, 0755, true);

        if (move_uploaded_file($file['tmp_name'], $targetDir . $safeName)) {
            try {
                $stmt = $this->pdo->prepare("
                    INSERT INTO lms_resources 
                    (title, file_name, file_path, file_type, size_bytes, status, category, created_by, is_active) 
                    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, 1)
                ");
                $stmt->execute([
                    $title,
                    $file['name'], // Display Name (Original)
                    'library/' . $safeName, // Relative Path to Private Root
                    $file['type'],
                    $file['size'],
                    $category,
                    $this->user['id']
                ]);
                
                $resourceId = $this->pdo->lastInsertId();
                $this->logger->log($this->user['id'], 'ADMIN_LIBRARY_UPLOAD', ['id' => $resourceId, 'title' => $title], 'admin');
                
                Response::json(['message' => 'Recurso enviado para aprovação', 'id' => $resourceId]);
            } catch (Exception $e) {
                Response::error('Erro no banco de dados: ' . $e->getMessage(), 500);
            }
        } else {
            Response::error('Falha ao mover arquivo no servidor', 500);
        }
    }

    // PATCH /admin/library/{id}/approve
    public function approve($id) {
        try {
            $stmt = $this->pdo->prepare("UPDATE lms_resources SET status = 'approved', approved_by = ?, is_active = 1 WHERE id = ?");
            $stmt->execute([$this->user['id'], $id]);
            
            $this->logger->log($this->user['id'], 'ADMIN_LIBRARY_APPROVE', ['id' => $id], 'admin');
            Response::json(['message' => 'Recurso aprovado']);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // PATCH /admin/library/{id}/reject
    public function reject($id) {
        try {
            $stmt = $this->pdo->prepare("UPDATE lms_resources SET status = 'rejected', is_active = 0 WHERE id = ?");
            $stmt->execute([$id]);
            
            $this->logger->log($this->user['id'], 'ADMIN_LIBRARY_REJECT', ['id' => $id], 'admin');
            Response::json(['message' => 'Recurso rejeitado']);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /admin/library/{id}/grant
    public function grantAccess($id) {
        $input = json_decode(file_get_contents("php://input"), true);
        $studentIds = $input['licenciada_ids'] ?? [];

        if (empty($studentIds)) Response::error('Nenhuma licenciada selecionada', 400);

        try {
            $this->pdo->beginTransaction();
            
            $stmt = $this->pdo->prepare("INSERT IGNORE INTO lms_resource_access (resource_id, licenciada_id, granted_by) VALUES (?, ?, ?)");
            foreach ($studentIds as $sId) {
                $stmt->execute([$id, $sId, $this->user['id']]);
            }
            
            $this->logger->log($this->user['id'], 'ADMIN_LIBRARY_GRANT', ['id' => $id, 'licenciadas' => count($studentIds)], 'admin');
            
            $this->pdo->commit();
            Response::json(['message' => 'Acesso concedido com sucesso']);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    // DELETE /admin/library/{id}
    public function delete($id) {
        try {
            $this->pdo->beginTransaction();
            
            $stmt = $this->pdo->prepare("SELECT file_path FROM lms_resources WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                // Use Global Constant (Consolidation V36)
                $fullPath = PRIVATE_UPLOADS_DIR . '/' . $row['file_path'];
                if (file_exists($fullPath)) unlink($fullPath);
                
                $del = $this->pdo->prepare("DELETE FROM lms_resources WHERE id = ?");
                $del->execute([$id]);
                
                $this->logger->log($this->user['id'], 'ADMIN_LIBRARY_DELETE', ['id' => $id], 'admin');
            }
            
            $this->pdo->commit();
            Response::json(['message' => 'Recurso removido da biblioteca']);
        } catch (Exception $e) { 
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            Response::error($e->getMessage(), 500); 
        }
    }
}
