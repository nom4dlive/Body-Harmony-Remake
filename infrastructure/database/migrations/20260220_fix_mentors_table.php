<?php
// infrastructure/database/migrations/20260220_fix_mentors_table.php
// Cria a tabela mentors e testimonials se não existirem

require_once __DIR__ . '/../../../apps/web-app/src/backend/api/config.php';

echo "Iniciando migração: Create mentors & testimonials tables...\n";

try {
    // Cria tabela mentors
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS mentors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            nickname VARCHAR(100) DEFAULT '',
            role VARCHAR(150) DEFAULT '',
            bio TEXT DEFAULT NULL,
            photo_url VARCHAR(500) DEFAULT '',
            instagram VARCHAR(150) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "Sucesso: Tabela 'mentors' criada (ou já existia).\n";

    // Cria tabela testimonials (usada também por ContentController)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS testimonials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(150) DEFAULT '',
            text TEXT DEFAULT NULL,
            photo_url VARCHAR(500) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "Sucesso: Tabela 'testimonials' criada (ou já existia).\n";

    echo "\nMigração concluída com sucesso!\n";
} catch (PDOException $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
    exit(1);
}
