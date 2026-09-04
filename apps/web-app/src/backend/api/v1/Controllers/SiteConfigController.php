<?php
// api/v1/Controllers/SiteConfigController.php
// Nexus Guard V3.1 - Site Config Controller with Revision History

class SiteConfigController {
    private $pdo;
    private $table = 'site_config';

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    // GET /site_config — retorna array para uso pelo ResponseCache
    public function getData(): array {
        $stmt = $this->pdo->query("SELECT config_key, config_value FROM {$this->table}");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $config = [];
        foreach ($results as $row) {
            $val = $row['config_value'];
            $decoded = json_decode($val, true);
            $config[$row['config_key']] = (json_last_error() === JSON_ERROR_NONE) ? $decoded : $val;
        }
        return $config ?: [];
    }

    // GET /site_config — legado, mantido para compatibilidade
    public function index() {
        try {
            Response::json($this->getData());
        } catch (Exception $e) {
            Response::json([]);
        }
    }

    // POST /admin/site_config (Bulk update or single key)
    public function update() {
        global $loggedUser;
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) Response::error('Invalid JSON', 400);

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)");
            
            // Single key support { key: '...', value: '...' }
            if (isset($data['key']) && isset($data['value'])) {
                $data = [$data['key'] => $data['value']];
            }

            foreach ($data as $key => $value) {
                if ($key === 'id') continue;
                
                if (is_bool($value)) {
                    $valToSave = $value ? '1' : '0';
                } elseif (is_array($value) || is_object($value)) {
                    $valToSave = json_encode($value, JSON_UNESCAPED_UNICODE);
                } else {
                    $valToSave = (string)$value;
                }
                
                $stmt->execute([$key, $valToSave]);
            }
            
            $this->pdo->commit();

            // Write Revision History
            try {
                $currentConfig = $this->getData();
                $adminId = $loggedUser['id'] ?? 1;
                $stmtHist = $this->pdo->prepare("
                    INSERT INTO site_config_history (config_data, updated_by)
                    VALUES (?, ?)
                ");
                $stmtHist->execute([json_encode($currentConfig, JSON_UNESCAPED_UNICODE), $adminId]);
            } catch (Exception $e) {
                error_log("[CONFIG_HISTORY_ERROR] Failed to save revision: " . $e->getMessage());
            }

            Response::json(['success' => true]);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /v1/admin/site_config/history
     */
    public function getHistory() {
        try {
            $stmt = $this->pdo->query("
                SELECT h.id, h.created_at, a.username as admin_name
                FROM site_config_history h
                LEFT JOIN admin_users a ON h.updated_by = a.id
                ORDER BY h.created_at DESC
                LIMIT 30
            ");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $history = [];
            foreach ($rows as $row) {
                $history[] = [
                    'id' => intval($row['id']),
                    'created_at' => $row['created_at'],
                    'admin_name' => $row['admin_name'] ?: 'System/Admin',
                    'summary_diff' => 'Revisao de layout #' . $row['id']
                ];
            }
            Response::json(['history' => $history]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /v1/admin/site_config/rollback
     */
    public function rollback() {
        $input = json_decode(file_get_contents("php://input"), true);
        $revisionId = $input['revision_id'] ?? 0;
        
        if (!$revisionId) {
            Response::error('Revision ID required', 400);
            return;
        }

        try {
            $stmt = $this->pdo->prepare("SELECT config_data FROM site_config_history WHERE id = ?");
            $stmt->execute([$revisionId]);
            $configJson = $stmt->fetchColumn();

            if (!$configJson) {
                Response::error('Revision not found', 404);
                return;
            }

            $configData = json_decode($configJson, true);
            if (!$configData) {
                Response::error('Invalid revision data', 500);
                return;
            }

            $this->pdo->beginTransaction();
            
            // Truncate current table and restore revision
            $this->pdo->exec("DELETE FROM {$this->table}");
            
            $stmtIns = $this->pdo->prepare("INSERT INTO {$this->table} (config_key, config_value) VALUES (?, ?)");
            foreach ($configData as $key => $value) {
                if ($key === 'id') continue;
                if (is_bool($value)) {
                    $valToSave = $value ? '1' : '0';
                } elseif (is_array($value) || is_object($value)) {
                    $valToSave = json_encode($value, JSON_UNESCAPED_UNICODE);
                } else {
                    $valToSave = (string)$value;
                }
                $stmtIns->execute([$key, $valToSave]);
            }
            
            $this->pdo->commit();
            
            Response::json([
                'ok' => true,
                'message' => 'Rollback completed successfully.',
                'config' => $configData
            ]);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            Response::error('Rollback failed: ' . $e->getMessage(), 500);
        }
    }
}
