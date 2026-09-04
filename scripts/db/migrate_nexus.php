<?php
// Simple Migration Runner for Hostinger Test Environment
// Usage: Upload to server and visit via browser or run via CLI if possible (but we only have FTP/HTTP usually)

// Enable Error Reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load Config (Simulated, as we are in root or public_html)
// We need the DB credentials. We'll verify if we can include the existing config or just hardcode for this maintenance script
// Safest is to read .env if available, but let's try to include the api config if possible.

$configFile = __DIR__ . '/api/config.php';
if (file_exists($configFile)) {
    require_once $configFile;
} else {
    // Fallback if we place this script in root and api is in public_html/api
    $configFilePublic = __DIR__ . '/public_html/api/config.php';
    if (file_exists($configFilePublic)) {
        require_once $configFilePublic;
    }
}

// Check if $pdo is available (from config.php)
global $pdo;

if (!$pdo) {
    echo "❌ PDO connection not available. Checking environment variables...<br>";
    // Try manual connection using env vars (strict validation)
    $host = getenv('DB_HOST');
    $db   = getenv('DB_NAME');
    $user = getenv('DB_USER');
    $pass = getenv('DB_PASS');

    if (!$host || !$db || !$user || !$pass) {
        die("❌ Database credentials not configured in .env<br>");
    }

    try {
        $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        echo "✅ Connected manually.<br>";
    } catch (PDOException $e) {
        die("❌ Connection failed: " . $e->getMessage());
    }
}

// SQL to Execute
$sql = <<<SQL
CREATE TABLE IF NOT EXISTS `nexus_security_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rule_key` varchar(50) NOT NULL,
  `rule_value` text,
  `description` varchar(255) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rule_key` (`rule_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `nexus_security_rules` (`rule_key`, `rule_value`, `description`, `updated_by`) VALUES
('WHITELIST_IPS', '[]', 'Trusted IPs', 5),
('BLACKLIST_IPS', '[]', 'Banned IPs', 5)
ON DUPLICATE KEY UPDATE rule_key=rule_key;
SQL;

try {
    $pdo->exec($sql);
    echo "✅ Migration 'nexus_security_rules' executed successfully.<br>";
} catch (PDOException $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "<br>";
}
?>
