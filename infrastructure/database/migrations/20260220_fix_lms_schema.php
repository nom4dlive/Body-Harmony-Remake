<?php
// infrastructure/database/migrations/20260220_add_is_downloadable_to_lms_attachments.php
require_once __DIR__ . '/../../../apps/web-app/src/backend/api/config.php';

try {
    echo "Iniciando migração: Adicionando is_downloadable em lms_attachments...\n";
    
    // Check if column exists
    $stmt = $pdo->query("DESCRIBE lms_attachments");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (in_array('is_downloadable', $columns)) {
        echo "Aviso: Coluna is_downloadable já existe.\n";
    } else {
        $pdo->exec("ALTER TABLE lms_attachments ADD COLUMN is_downloadable TINYINT(1) DEFAULT 0 AFTER file_path");
        echo "Sucesso: Coluna is_downloadable adicionada.\n";
    }

    // Verify other critical table mentioned in error logs: lms_licenciada_licenses
    $stmt = $pdo->query("SHOW TABLES LIKE 'lms_licenciada_licenses'");
    if ($stmt->rowCount() == 0) {
        echo "Criando tabela faltante: lms_licenciada_licenses...\n";
        $pdo->exec("
            CREATE TABLE lms_licenciada_licenses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                licenciada_id INT NOT NULL,
                license_type VARCHAR(50) DEFAULT 'standard',
                credits_total INT DEFAULT 0,
                credits_used INT DEFAULT 0,
                expires_at DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                is_active TINYINT(1) DEFAULT 1,
                INDEX (licenciada_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
        echo "Sucesso: Tabela lms_licenciada_licenses criada.\n";
    } else {
        echo "Aviso: Tabela lms_licenciada_licenses já existe.\n";
    }

} catch (Exception $e) {
    echo "ERRO CRÍTICO na migração: " . $e->getMessage() . "\n";
    exit(1);
}
