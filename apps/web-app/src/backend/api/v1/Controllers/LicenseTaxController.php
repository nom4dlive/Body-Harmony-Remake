<?php
require_once __DIR__ . '/../Services/LicenseTaxService.php';

use BodyHarmony\Services\LicenseTaxService;

class LicenseTaxController {
    private $db;
    private LicenseTaxService $service;

    public function __construct() {
        global $pdo, $db;
        $this->db = $pdo ?? $db;
        LicenseTaxService::ensureTableExists($this->db);
        $this->service = new LicenseTaxService($this->db);
    }

    public function list() {
        try {
            $filters = [
                'page' => $_GET['page'] ?? 1,
                'per_page' => $_GET['per_page'] ?? 20,
                'status' => $_GET['status'] ?? null,
                'method' => $_GET['method'] ?? null,
                'search' => $_GET['search'] ?? null,
                'source' => $_GET['source'] ?? null,
                'start_date' => $_GET['start_date'] ?? null,
                'end_date' => $_GET['end_date'] ?? null
            ];
            $data = $this->service->list($filters);
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] list error: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine());
            Response::error("Erro ao listar taxas de licenciamento: " . $e->getMessage(), 500);
        }
    }

    public function getSummary() {
        try {
            $filters = [
                'status' => $_GET['status'] ?? null,
                'start_date' => $_GET['start_date'] ?? null,
                'end_date' => $_GET['end_date'] ?? null
            ];
            $data = $this->service->getSummary($filters);
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] getSummary error: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine());
            Response::error("Erro ao carregar resumo: " . $e->getMessage(), 500);
        }
    }

    public function getById(string $id) {
        try {
            $data = $this->service->getById((int)$id);
            if (!$data) {
                Response::error("Taxa não encontrada.", 404);
                return;
            }
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] getById error: " . $e->getMessage());
            Response::error("Erro ao buscar taxa.", 500);
        }
    }

    public function create() {
        try {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?: $_POST;
            $result = $this->service->create($data);
            ResponseCache::clear('admin_financial_');
            ResponseCache::clear('admin_license_taxes_');
            Response::json(['success' => true, 'data' => $result], 201);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] create error: " . $e->getMessage());
            Response::error($e->getMessage(), 400);
        }
    }

    public function update(string $id) {
        try {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?: $_POST;
            $result = $this->service->update((int)$id, $data);
            ResponseCache::clear('admin_financial_');
            ResponseCache::clear('admin_license_taxes_');
            Response::json(['success' => true, 'data' => $result]);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] update error: " . $e->getMessage());
            Response::error($e->getMessage(), 400);
        }
    }

    public function delete(string $id) {
        try {
            $this->service->delete((int)$id);
            ResponseCache::clear('admin_financial_');
            ResponseCache::clear('admin_license_taxes_');
            Response::json(['success' => true, 'message' => 'Taxa removida com sucesso.']);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] delete error: " . $e->getMessage());
            Response::error($e->getMessage(), 400);
        }
    }

    public function seedHistorical() {
        try {
            global $loggedUser;
            $role = strtolower($loggedUser['role'] ?? $loggedUser['cargo'] ?? '');
            $isAllowed = in_array($role, ['superadmin', 'admin', 'gestor', 'diretoria']) ||
                         !empty($loggedUser['is_superadmin']) ||
                         !empty($loggedUser['permissions']['financial_manage']) ||
                         !empty($loggedUser['permissions']['financial']);

            if (!$isAllowed) {
                Response::error('Operação restrita a Administradores com permissão financeira.', 403);
                return;
            }

            $inserted = $this->service->seedHistorical();
            $this->service->logAudit('seed_historical', null, null, ['inserted' => $inserted], null, $inserted, $loggedUser);
            ResponseCache::clear('admin_financial_');
            ResponseCache::clear('admin_license_taxes_');
            Response::json([
                'success' => true,
                'data' => [
                    'inserted' => $inserted,
                    'message' => $inserted > 0
                        ? "{$inserted} registros históricos importados com sucesso."
                        : "Nenhum registro inserido (já existente)."
                ]
            ]);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] seedHistorical error: " . $e->getMessage());
            Response::error("Erro ao importar dados históricos: " . $e->getMessage(), 500);
        }
    }

    public function syncAll() {
        try {
            global $loggedUser;
            $role = strtolower($loggedUser['role'] ?? $loggedUser['cargo'] ?? '');
            $isAllowed = in_array($role, ['superadmin', 'admin', 'gestor', 'diretoria']) ||
                         !empty($loggedUser['is_superadmin']) ||
                         !empty($loggedUser['permissions']['financial_manage']) ||
                         !empty($loggedUser['permissions']['financial']);

            if (!$isAllowed) {
                Response::error('Operação restrita a Administradores com permissão financeira.', 403);
                return;
            }

            $result = $this->service->syncAll();
            $totalAffected = ($result['seed_inserted'] ?? 0) + ($result['licenciadas_linked'] ?? 0) + ($result['transactions_created'] ?? 0);
            $this->service->logAudit('sync_all', null, null, $result, null, $totalAffected, $loggedUser);
            ResponseCache::clear('admin_financial_');
            ResponseCache::clear('admin_license_taxes_');
            Response::json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] syncAll error: " . $e->getMessage());
            Response::error("Erro ao sincronizar dados: " . $e->getMessage(), 500);
        }
    }

    public function uploadReceipt() {
        try {
            if (empty($_FILES['file'])) {
                Response::error("Nenhum arquivo de comprovante enviado.", 400);
                return;
            }
            $licenciadaId = (int)($_POST['licenciada_id'] ?? $_POST['tax_id'] ?? 0);
            if ($licenciadaId <= 0) {
                Response::error("Identificador da licenciada é obrigatório.", 400);
                return;
            }
            global $loggedUser;
            $notes = $_POST['notes'] ?? null;
            $result = $this->service->uploadReceipt($licenciadaId, $_FILES['file'], $notes, $loggedUser);
            ResponseCache::clear('admin_financial_');
            ResponseCache::clear('admin_license_taxes_');
            Response::json(['success' => true, 'data' => $result], 201);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] uploadReceipt error: " . $e->getMessage());
            Response::error($e->getMessage(), 400);
        }
    }

    public function uploadAttachment() {
        try {
            if (empty($_FILES['file'])) {
                Response::error("Nenhum arquivo enviado.", 400);
                return;
            }

            $file = $_FILES['file'];
            if ($file['error'] !== UPLOAD_ERR_OK) {
                Response::error("Falha no upload do arquivo. Código: " . $file['error'], 400);
                return;
            }

            // Allowed extensions
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowed = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
            if (!in_array($ext, $allowed)) {
                Response::error("Tipo de arquivo não permitido. Apenas PDF, JPG, PNG e WebP.", 400);
                return;
            }

            $uploadDir = __DIR__ . '/../../../../../../public_html/uploads/financial/';
            if (!is_dir($uploadDir)) {
                @mkdir($uploadDir, 0755, true);
            }

            $uniqueName = 'recibo_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
            $destPath = $uploadDir . $uniqueName;

            if (!move_uploaded_file($file['tmp_name'], $destPath)) {
                // Fallback local relative
                $fallbackDir = __DIR__ . '/../../uploads/financial/';
                if (!is_dir($fallbackDir)) @mkdir($fallbackDir, 0755, true);
                $destPath = $fallbackDir . $uniqueName;
                move_uploaded_file($file['tmp_name'], $destPath);
            }

            $fileUrl = '/uploads/financial/' . $uniqueName;
            $parentType = $_POST['parent_type'] ?? 'license_tax';
            $parentId = (int)($_POST['parent_id'] ?? $_POST['tax_id'] ?? 0);

            if ($parentId > 0) {
                $attach = $this->service->addAttachment($parentType, $parentId, [
                    'file_name' => $file['name'],
                    'file_url' => $fileUrl,
                    'file_size_bytes' => $file['size'],
                    'mime_type' => $file['type'] ?: 'application/octet-stream'
                ]);
                ResponseCache::clear('admin_financial_');
                ResponseCache::clear('admin_license_taxes_');
                Response::json(['success' => true, 'data' => $attach], 201);
            } else {
                Response::json([
                    'success' => true,
                    'data' => [
                        'file_name' => $file['name'],
                        'file_url' => $fileUrl,
                        'file_size_bytes' => $file['size'],
                        'mime_type' => $file['type']
                    ]
                ], 201);
            }
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] uploadAttachment error: " . $e->getMessage());
            Response::error("Erro ao processar anexo.", 500);
        }
    }

    public function getAttachments(string $id) {
        try {
            $parentType = $_GET['parent_type'] ?? 'license_tax';
            $data = $this->service->getAttachments($parentType, (int)$id);
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] getAttachments error: " . $e->getMessage());
            Response::error("Erro ao listar anexos.", 500);
        }
    }

    public function deleteAttachment(string $attachId) {
        try {
            $ok = $this->service->deleteAttachment((int)$attachId);
            ResponseCache::clear('admin_financial_');
            ResponseCache::clear('admin_license_taxes_');
            Response::json(['success' => $ok]);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] deleteAttachment error: " . $e->getMessage());
            Response::error("Erro ao excluir anexo.", 500);
        }
    }

    public function getReceiptWhatsApp(string $id) {
        try {
            $data = $this->service->getWhatsAppReceiptMessage((int)$id);
            if (!$data) {
                Response::error("Taxa não encontrada para recibo.", 404);
                return;
            }
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] getReceiptWhatsApp error: " . $e->getMessage());
            Response::error("Erro ao gerar recibo WhatsApp.", 500);
        }
    }

    public function export() {
        try {
            $filters = [
                'status' => $_GET['status'] ?? null,
                'method' => $_GET['method'] ?? null,
                'search' => $_GET['search'] ?? null,
                'source' => $_GET['source'] ?? null,
                'start_date' => $_GET['start_date'] ?? null,
                'end_date' => $_GET['end_date'] ?? null
            ];
            $data = $this->service->exportCsv($filters);
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] export error: " . $e->getMessage());
            Response::error("Erro ao exportar dados.", 500);
        }
    }

    public function getAuditLogs() {
        try {
            $filters = [
                'page' => $_GET['page'] ?? 1,
                'per_page' => $_GET['per_page'] ?? 20,
                'action' => $_GET['action'] ?? null,
                'target_id' => $_GET['target_id'] ?? null,
                'admin_id' => $_GET['admin_id'] ?? null,
                'date_from' => $_GET['date_from'] ?? null,
                'date_to' => $_GET['date_to'] ?? null
            ];
            $data = $this->service->getAuditLogs($filters);
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log("[LicenseTaxController] getAuditLogs error: " . $e->getMessage());
            Response::error("Erro ao listar logs de auditoria.", 500);
        }
    }
}
