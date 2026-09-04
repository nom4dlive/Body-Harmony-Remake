<?php
// api/v1/Controllers/NexusDbController.php

require_once __DIR__ . '/../libs/LoggerService.php';

class NexusDbController {
    private $pdo;
    private $logger;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
        $this->logger = new LoggerService($pdo);
    }

    private function ensureSuperAdmin() {
        global $loggedUser;
        if (!$loggedUser || $loggedUser['role'] !== 'superadmin') {
            Response::error('Acesso restrito a Superadmins Nexus.', 403);
        }
    }

    public function status() {
        $this->ensureSuperAdmin();

        try {
            // 1. Get Tables and Row Count
            $stmt = $this->pdo->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $stats = [];
            $totalRows = 0;
            $totalSizeMb = 0;

            foreach ($tables as $table) {
                // Get row count and size in one query
                $tableInfo = $this->pdo->query("
                    SELECT 
                        TABLE_ROWS as table_rows,
                        (DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024 AS size_mb 
                    FROM information_schema.TABLES 
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '$table'
                ")->fetch(PDO::FETCH_ASSOC);

                $stats[] = [
                    'table' => $table,
                    'rows' => (int)($tableInfo['table_rows'] ?? 0),
                    'size_mb' => round((float)($tableInfo['size_mb'] ?? 0), 3)
                ];

                $totalRows += (int)($tableInfo['rows'] ?? 0);
                $totalSizeMb += (float)($tableInfo['size_mb'] ?? 0);
            }

            // 2. Get Schema Version
            $version = 'v0.0.0-Base';
            try {
                $vStmt = $this->pdo->query("SELECT version FROM migration_history ORDER BY executed_at DESC LIMIT 1");
                $result = $vStmt->fetch(PDO::FETCH_ASSOC);
                if ($result) $version = $result['version'];
            } catch (PDOException $e) {
                // table might not exist yet
            }
            
            $creds = get_db_credentials();
            
            Response::json([
                'success' => true,
                'schema_version' => $version,
                'db_name' => $creds['name'],
                'db_host' => $creds['host'],
                'db_label' => $creds['label'],
                'php_version' => PHP_VERSION,
                'mysql_version' => $this->pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
                'total_tables' => count($tables),
                'total_rows' => $totalRows,
                'total_size_mb' => round($totalSizeMb, 2),
                'tables' => $stats
            ]);

        } catch (Exception $e) {
            $this->logger->log(0, 'NEXUS_DB_STATUS_ERROR', ['error' => $e->getMessage()]);
            Response::error("Failed to fetch database status: " . $e->getMessage(), 500);
        }
    }

    public function rebuild() {
        $this->ensureSuperAdmin();
        
        $dbHost = getenv('DB_HOST') ?: 'db';
        $dbUser = getenv('DB_USER') ?: 'root';
        $dbPass = getenv('DB_PASS') ?: 'root';
        $dbName = getenv('DB_NAME') ?: 'body_harmony_db';
        
        // Caminho relativo ao container PHP conforme docker-compose
        $realSqlPath = '/app/database/init.sql';
        
        if (!file_exists($realSqlPath)) {
            // Tentar caminho alternativo no Hostinger se for o caso
            $realSqlPath = __DIR__ . '/../../../../../infrastructure/database/init.sql';
        }

        if (!file_exists($realSqlPath)) {
            Response::error("SQL file not found.", 500);
            return;
        }

        try {
            // Em Docker, usamos CLI se disponível. Em Hostinger, usaríamos PDO exec (multi-statement).
            if (strpos(PHP_OS, 'WIN') === false && shell_exec('which mysql')) {
                $cmd = "mysql -h {$dbHost} -u {$dbUser} -p'{$dbPass}' {$dbName} < {$realSqlPath} 2>&1";
                exec($cmd, $output, $returnVar);

                if ($returnVar !== 0) {
                    throw new Exception("MySQL CLI Error: " . implode("\n", $output));
                }
            } else {
                // Fallback para PDO (Hostinger/Ambientes sem CLI)
                $sql = file_get_contents($realSqlPath);
                $this->pdo->exec($sql);
            }

            $this->logger->log(0, 'NEXUS_DB_REBUILD', ['status' => 'success']);
            Response::json([
                'status' => 'success',
                'message' => 'Database rebuilt successfully.'
            ]);
        } catch (Exception $e) {
            $this->logger->log(0, 'NEXUS_DB_REBUILD_ERROR', ['error' => $e->getMessage()]);
            Response::error("Rebuild failed: " . $e->getMessage(), 500);
        }
    }

    public function migrations() {
        $this->ensureSuperAdmin();
        $path = __DIR__ . '/../../migrations';
        if (!is_dir($path)) mkdir($path, 0755, true);
        
        $files = glob("$path/*.sql");
        $migrations = array_map(function($f) { return basename($f); }, $files);

        // Auto-create tracking table if missing
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS migration_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            version VARCHAR(255) NOT NULL,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        $stmt = $this->pdo->query("SELECT version FROM migration_history");
        $applied = $stmt->fetchAll(PDO::FETCH_COLUMN);

        Response::json([
            'available' => $migrations,
            'applied' => $applied
        ]);
    }

    public function runMigration() {
        $this->ensureSuperAdmin();
        $input = json_decode(file_get_contents('php://input'), true);
        $file = $input['file'] ?? '';

        if (!$file) Response::error('Nenhum arquivo de migration especificado.', 400);
        $path = realpath(__DIR__ . '/../../migrations/' . $file);
        
        if (!$path || !file_exists($path)) Response::error('Migration não encontrada.', 404);

        try {
            $sql = file_get_contents($path);
            
            // Refactored to handle multi-statement SQL safely
            $this->pdo->beginTransaction();
            
            // Multi-statement support for PDO
            // Warning: Some PDO versions don't like multi-statements (;) especially if they have statements that shouldn't be split (like IFs)
            // For V65, we simplified the SQL so it's safer. Let's try executing it all at once if possible.
            // Some drivers support this directly via pdo->exec($sql);
            
            try {
                $this->pdo->exec($sql);
            } catch (Exception $e) {
                // Se falhar o exec massivo, fazemos fallback pro explode
                $cleanSql = preg_replace('/--.*$/m', '', $sql);
                $queries = explode(';', $cleanSql);
                
                foreach ($queries as $query) {
                    $q = trim($query);
                    if (!empty($q)) {
                        $this->pdo->exec($q);
                    }
                }
            }
            
            // Check if already in history before inserting
            $check = $this->pdo->prepare("SELECT COUNT(*) FROM migration_history WHERE version = ?");
            $check->execute([$file]);
            if ($check->fetchColumn() == 0) {
                $stmt = $this->pdo->prepare("INSERT INTO migration_history (version) VALUES (?)");
                $stmt->execute([$file]);
            }

            if ($this->pdo->inTransaction()) $this->pdo->commit();
            $this->logger->log(0, 'NEXUS_DB_MIGRATION', ['file' => $file, 'status' => 'success']);
            Response::json(['success' => true, 'message' => "Migration $file aplicada com sucesso."]);
        } catch (Exception $e) {
            if ($this->pdo && $this->pdo->inTransaction()) $this->pdo->rollBack();
            $this->logger->log(0, 'NEXUS_DB_MIGRATION_ERROR', ['file' => $file, 'error' => $e->getMessage()]);
            Response::error($e->getMessage(), 500);
        }
    }

    public function uploadMigration() {
        $this->ensureSuperAdmin();
        if (!isset($_FILES['file'])) Response::error('Nenhum arquivo enviado.', 400);

        $file = $_FILES['file'];
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        if (strtolower($ext) !== 'sql') Response::error('Apenas arquivos .sql são permitidos.', 400);

        $targetDir = __DIR__ . '/../../migrations/';
        if (!is_dir($targetDir)) mkdir($targetDir, 0755, true);

        $targetPath = $targetDir . basename($file['name']);
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $this->logger->log(0, 'NEXUS_DB_UPLOAD', ['file' => $file['name']]);
            Response::json(['success' => true, 'message' => 'Migration enviada com sucesso.']);
        } else {
            Response::error('Falha ao salvar arquivo no servidor.', 500);
        }
    }

    public function heal() {
        $this->ensureSuperAdmin();
        try {
            // 1. Generate Integrity Report (Simplified for CSV)
            $report = "Table,Issue,Count\n";
            
            // Check orphans in broadcast logs
            $stmt = $this->pdo->query("SELECT COUNT(*) FROM system_broadcast_logs l LEFT JOIN system_broadcasts b ON l.broadcast_id = b.id WHERE b.id IS NULL");
            $report .= "broadcast_logs,orphan_records," . $stmt->fetchColumn() . "\n";
            
            // Check sessions
            $stmt = $this->pdo->query("SELECT COUNT(*) FROM admin_sessions WHERE expires_at < NOW()");
            $report .= "admin_sessions,expired_sessions," . $stmt->fetchColumn() . "\n";

            // 2. Clear logs older than 90 days
            $cutoff = date('Y-m-d H:i:s', strtotime('-90 days'));
            
            $deleted = 0;
            $deleted += $this->pdo->exec("DELETE FROM auth_logs WHERE created_at < '$cutoff'");
            $deleted += $this->pdo->exec("DELETE FROM audit_logs WHERE created_at < '$cutoff'");
            $deleted += $this->pdo->exec("DELETE FROM system_broadcast_logs WHERE read_at < '$cutoff'");
            
            $this->logger->log(0, 'NEXUS_DB_HEAL', ['deleted_logs' => $deleted]);
            
            // 3. Return report and status
            Response::json([
                'success' => true,
                'message' => "Protocol Heal concluído. $deleted registros de log antigos removidos.",
                'report_csv' => base64_encode($report)
            ]);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function sync() {
        $this->ensureSuperAdmin();
        try {
            $path = __DIR__ . '/../../migrations';
            $files = glob("$path/*.sql");
            
            $stmt = $this->pdo->query("SELECT version FROM migration_history");
            $applied = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $pending = [];
            foreach ($files as $f) {
                $name = basename($f);
                if (!in_array($name, $applied)) {
                    $pending[] = $name;
                }
            }

            if (empty($pending)) {
                Response::json(['success' => true, 'message' => 'Sistema já está em sincronia total.']);
                return;
            }

            $count = 0;
            foreach ($pending as $file) {
                $fullPath = $path . '/' . $file;
                $sql = file_get_contents($fullPath);
                
                $this->pdo->beginTransaction();
                $cleanSql = preg_replace('/--.*$/m', '', $sql);
                $queries = explode(';', $cleanSql);
                foreach ($queries as $query) {
                    if (trim($query)) $this->pdo->exec($query);
                }
                
                $stmt = $this->pdo->prepare("INSERT INTO migration_history (version) VALUES (?)");
                $stmt->execute([$file]);
                $this->pdo->commit();
                $count++;
            }

            $this->logger->log(0, 'NEXUS_DB_SYNC', ['applied_count' => $count]);
            Response::json(['success' => true, 'message' => "Nexus Sync: $count migrations aplicadas com sucesso."]);

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            Response::error("Sync failed at half-point: " . $e->getMessage(), 500);
        }
    }

    public function seeds() {
        $this->ensureSuperAdmin();
        $path = __DIR__ . '/../../seeds';
        if (!is_dir($path)) mkdir($path, 0755, true);
        
        $files = glob("$path/*.sql");
        Response::json([
            'seeds' => array_map(function($f) { return basename($f); }, $files)
        ]);
    }

    public function runSeed() {
        $this->ensureSuperAdmin();
        $input = json_decode(file_get_contents('php://input'), true);
        $file = $input['file'] ?? '';

        $path = realpath(__DIR__ . '/../../seeds/' . $file);
        if (!$path || !file_exists($path)) Response::error('Seed não encontrada.', 404);

        try {
            $sql = file_get_contents($path);
            $this->pdo->exec($sql);
            $this->logger->log(0, 'NEXUS_DB_SEED', ['file' => $file, 'status' => 'success']);
            Response::json(['success' => true, 'message' => "Seed $file aplicada com sucesso."]);
        } catch (Exception $e) {
            $this->logger->log(0, 'NEXUS_DB_SEED_ERROR', ['file' => $file, 'error' => $e->getMessage()]);
            Response::error($e->getMessage(), 500);
        }
    }

    public function scripts() {
        $this->ensureSuperAdmin();
        $path = __DIR__ . '/../../scripts_db';
        if (!is_dir($path)) mkdir($path, 0755, true);
        
        $files = glob("$path/*.sql");
        Response::json([
            'scripts' => array_map(function($f) { return basename($f); }, $files)
        ]);
    }

    public function export() {
        $this->ensureSuperAdmin();
        
        $creds = get_db_credentials();
        $dbHost = $creds['host'];
        $dbUser = $creds['user'];
        $dbPass = $creds['pass'];
        $dbName = $creds['name'];
        
        $filename = "nexus_snapshot_" . date('Ymd_His') . ".sql";
        $exportDir = __DIR__ . '/../../exports';
        if (!is_dir($exportDir)) mkdir($exportDir, 0755, true);
        $path = $exportDir . '/' . $filename;

        try {
            if (strpos(PHP_OS, 'WIN') === false && shell_exec('which mysqldump')) {
                $cmd = "mysqldump -h {$dbHost} -u {$dbUser} -p'{$dbPass}' {$dbName} > {$path} 2>&1";
                exec($cmd, $output, $returnVar);

                if ($returnVar !== 0) {
                    throw new Exception("Mysqldump Error: " . implode("\n", $output));
                }
            } else {
                throw new Exception("Mysqldump não disponível neste ambiente.");
            }

            $this->logger->log(0, 'NEXUS_DB_EXPORT', ['filename' => $filename, 'status' => 'success']);
            Response::json([
                'success' => true, 
                'message' => "Snapshot $filename gerado com sucesso.",
                'file' => $filename
            ]);
        } catch (Exception $e) {
            $this->logger->log(0, 'NEXUS_DB_EXPORT_ERROR', ['error' => $e->getMessage()]);
            Response::error("Export failed: " . $e->getMessage(), 500);
        }
    }

    public function listExports() {
        $this->ensureSuperAdmin();
        $exportDir = __DIR__ . '/../../exports';
        if (!is_dir($exportDir)) mkdir($exportDir, 0755, true);
        
        $files = glob("$exportDir/*.sql");
        $exports = [];
        foreach ($files as $file) {
            $exports[] = [
                'name' => basename($file),
                'size' => round(filesize($file) / 1024 / 1024, 2) . ' MB',
                'date' => date("Y-m-d H:i:s", filemtime($file))
            ];
        }

        // Descending order by date
        usort($exports, function($a, $b) {
            return strcmp($b['date'], $a['date']);
        });

        Response::json([
            'success' => true,
            'exports' => $exports
        ]);
    }

    public function downloadExport() {
        $this->ensureSuperAdmin();
        $file = $_GET['file'] ?? '';
        if (!$file) Response::error('No file specified', 400);

        $exportDir = __DIR__ . '/../../exports';
        $path = realpath($exportDir . '/' . $file);

        if (!$path || !file_exists($path) || strpos($path, realpath($exportDir)) !== 0) {
            Response::error('File not found or access denied.', 404);
        }

        header('Content-Description: File Transfer');
        header('Content-Type: application/sql');
        header('Content-Disposition: attachment; filename="'.basename($path).'"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($path));
        readfile($path);
        exit;
    }

    public function switchNode() {
        $this->ensureSuperAdmin();
        $payload = json_decode(file_get_contents('php://input'), true);
        $target = strtolower($payload['target'] ?? '');

        if (!in_array($target, ['oracle', 'hostinger'])) {
            Response::error('Target must be "oracle" or "hostinger"', 400);
        }

        // Use the path that was actually loaded by config.php
        $envPath = defined('ENV_PATH') ? ENV_PATH : null;
        
        if (!$envPath || !file_exists($envPath) || !is_writable($envPath)) {
            // Manual fallback if ENV_PATH is missing or not writable
            $possiblePaths = [
                __DIR__ . '/../../.env',    // api/.env
                __DIR__ . '/../../../.env', // backend/.env
                '/app/backend/.env',        // Docker path
            ];
            
            foreach ($possiblePaths as $p) {
                if (file_exists($p) && is_writable($p)) {
                    $envPath = $p;
                    break;
                }
            }
        }

        if (!$envPath) {
            $msg = 'Nenhum arquivo .env editável detectado. ';
            if (defined('ENV_PATH')) $msg .= 'ENV_PATH: ' . ENV_PATH;
            Response::error($msg, 500);
        }

        $content = file_get_contents($envPath);
        
        // Credentials based on target
        if ($target === 'oracle') {
            $newConfig = [
                'DB_STAGE' => 'STAGE',
                'DB_HOST' => env('DB_STAGE_HOST', '127.0.0.1'),
                'DB_NAME' => env('DB_STAGE_NAME', 'u388974772_bodyharmony_db'),
                'DB_USER' => env('DB_STAGE_USER', 'nexus_user'),
                'DB_PASS' => env('DB_STAGE_PASS', ''),
                'DB_LABEL' => 'HOSTINGER_VPS'
            ];
        } else {
            $newConfig = [
                'DB_STAGE' => 'PROD',
                'DB_HOST' => env('DB_PROD_HOST', 'localhost'),
                'DB_NAME' => env('DB_PROD_NAME', 'u388974772_bodyharmony_db'),
                'DB_USER' => env('DB_PROD_USER', 'u388974772_body_db'),
                'DB_PASS' => env('DB_PROD_PASS', ''),
                'DB_LABEL' => 'HOSTINGER_PROD'
            ];
        }

        foreach ($newConfig as $key => $value) {
            if (preg_match("/^$key=/m", $content)) {
                $content = preg_replace("/^$key=.*$/m", "$key=$value", $content);
            } else {
                $content .= "\n$key=$value";
            }
        }

        if (file_put_contents($envPath, $content)) {
            $this->logger->log(0, 'NEXUS_DB_SWITCH', ['target' => strtoupper($target), 'path' => $envPath]);
            Response::json(['success' => true, 'message' => "Nexus switched to " . strtoupper($target)]);
        } else {
            Response::error('Failed to write .env file.', 500);
        }
    }

    public function exportLicenciadas() {
        $this->ensureSuperAdmin();

        try {
            $stmt = $this->pdo->query("SELECT name, email, username, state, whatsapp, cpf, rg, address, instagram, renewal_date FROM licenciadas ORDER BY name ASC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $filename = "backup_licenciadas_" . date('Ymd_His') . ".csv";

            header('Content-Description: File Transfer');
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Pragma: public');

            $out = fopen('php://output', 'w');
            
            // Injetar BOM UTF-8 para o Excel reconhecer os acentos
            fwrite($out, "\xEF\xBB\xBF");

            // Escrever cabeçalhos
            if (!empty($rows)) {
                fputcsv($out, array_keys($rows[0]), ';');
                foreach ($rows as $row) {
                    fputcsv($out, $row, ';');
                }
            } else {
                fputcsv($out, ['name', 'email', 'username', 'state', 'whatsapp', 'cpf', 'rg', 'address', 'instagram', 'renewal_date'], ';');
            }

            fclose($out);
            $this->logger->log(0, 'NEXUS_LICENCIADAS_EXPORT', ['count' => count($rows), 'status' => 'success']);
            exit;
        } catch (Exception $e) {
            $this->logger->log(0, 'NEXUS_LICENCIADAS_EXPORT_ERROR', ['error' => $e->getMessage()]);
            Response::error("Failed to export: " . $e->getMessage(), 500);
        }
    }

    public function importLicenciadas() {
        $this->ensureSuperAdmin();

        if (!isset($_FILES['file'])) {
            Response::error('Nenhum arquivo CSV enviado.', 400);
        }

        $file = $_FILES['file'];
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        if (strtolower($ext) !== 'csv') {
            Response::error('Apenas arquivos .csv são permitidos.', 400);
        }

        try {
            $handle = fopen($file['tmp_name'], 'r');
            if ($handle === false) {
                throw new Exception("Falha ao abrir arquivo temporário.");
            }

            // Ler primeira linha (BOM filter)
            $firstLine = fgets($handle);
            if ($firstLine === false) {
                fclose($handle);
                throw new Exception("Arquivo CSV vazio.");
            }

            // Remover BOM se presente
            if (substr($firstLine, 0, 3) === "\xEF\xBB\xBF") {
                $firstLine = substr($firstLine, 3);
            }

            // Detectar delimitador (ponto e vírgula ou vírgula)
            $delimiter = ';';
            if (strpos($firstLine, ';') === false && strpos($firstLine, ',') !== false) {
                $delimiter = ',';
            }

            // Parsear cabeçalho
            $headers = str_getcsv(trim($firstLine), $delimiter);
            $headers = array_map('trim', $headers);

            // Mapeamento esperado
            $expected = ['name', 'email', 'username', 'state', 'whatsapp', 'cpf', 'rg', 'address', 'instagram', 'renewal_date'];
            
            // Validar cabeçalhos mínimos
            if (!in_array('email', $headers) || !in_array('name', $headers)) {
                fclose($handle);
                Response::error('O arquivo CSV deve conter pelo menos as colunas "name" e "email".', 400);
            }

            $this->pdo->beginTransaction();

            $sql = "INSERT INTO licenciadas (name, email, username, state, whatsapp, cpf, rg, address, instagram, renewal_date) 
                    VALUES (:name, :email, :username, :state, :whatsapp, :cpf, :rg, :address, :instagram, :renewal_date)
                    ON DUPLICATE KEY UPDATE 
                        name = VALUES(name),
                        username = VALUES(username),
                        state = VALUES(state),
                        whatsapp = VALUES(whatsapp),
                        rg = VALUES(rg),
                        address = VALUES(address),
                        instagram = VALUES(instagram),
                        renewal_date = VALUES(renewal_date)";

            $stmt = $this->pdo->prepare($sql);
            $inserted = 0;
            $updated = 0;
            $rowNum = 1;

            while (($data = fgetcsv($handle, 10000, $delimiter)) !== false) {
                $rowNum++;
                if (count($data) < count($headers)) {
                    // Preencher colunas vazias se a linha vier truncada
                    $data = array_pad($data, count($headers), '');
                }

                $row = array_combine($headers, array_slice($data, 0, count($headers)));
                
                // Sanitização e fallback de campos
                $name = trim($row['name'] ?? '');
                $email = trim($row['email'] ?? '');
                if (empty($name) || empty($email)) {
                    continue; // Ignorar linhas em branco ou inválidas
                }

                $username = trim($row['username'] ?? explode('@', $email)[0]);
                $state = trim($row['state'] ?? '');
                $whatsapp = trim($row['whatsapp'] ?? '');
                $cpf = trim($row['cpf'] ?? '');
                $rg = trim($row['rg'] ?? '');
                $address = trim($row['address'] ?? '');
                $instagram = trim($row['instagram'] ?? '');
                $renewal_date = trim($row['renewal_date'] ?? '');
                if (empty($renewal_date)) {
                    $renewal_date = null;
                }

                $stmt->execute([
                    ':name' => $name,
                    ':email' => $email,
                    ':username' => $username,
                    ':state' => $state,
                    ':whatsapp' => $whatsapp,
                    ':cpf' => $cpf,
                    ':rg' => $rg,
                    ':address' => $address,
                    ':instagram' => $instagram,
                    ':renewal_date' => $renewal_date
                ]);

                // PDO: rowCount() retorna 1 para insert, 2 para update no ON DUPLICATE KEY
                $affected = $stmt->rowCount();
                if ($affected === 1) {
                    $inserted++;
                } else if ($affected === 2) {
                    $updated++;
                }
            }

            fclose($handle);
            $this->pdo->commit();

            $this->logger->log(0, 'NEXUS_LICENCIADAS_IMPORT', ['inserted' => $inserted, 'updated' => $updated]);
            
            Response::json([
                'success' => true,
                'message' => "Importação concluída. Inseridas: $inserted, Sincronizadas/Atualizadas: $updated.",
                'inserted' => $inserted,
                'updated' => $updated
            ]);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            $this->logger->log(0, 'NEXUS_LICENCIADAS_IMPORT_ERROR', ['error' => $e->getMessage()]);
            Response::error("Failed to import CSV: " . $e->getMessage(), 500);
        }
    }
}
