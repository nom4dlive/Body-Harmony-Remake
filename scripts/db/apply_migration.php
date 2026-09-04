<?php
// scripts/db/apply_migration.php
require_once __DIR__ . '/../../apps/web-app/src/backend/api/config.php';
global $pdo;

if ($argc < 2) {
    die("Usage: php apply_migration.php <sql_file_path>\n");
}

$sqlFile = $argv[1];
if (!file_exists($sqlFile)) {
    die("Error: File not found: $sqlFile\n");
}

echo "Applying migration: $sqlFile\n";
$sql = file_get_contents($sqlFile);

try {
    // Split by semicolon but ignore ones inside quotes or comments? 
    // Manual splitting is risky, but PDO::exec usually handles single-statement or simple multi-statement with some drivers.
    // Since we are using MySQL, we can try to run it.
    
    // For safety, we can use a more robust approach if needed, but for now exec() should work for these migrations.
    $pdo->exec($sql);
    echo "✅ Success: Migration applied.\n";
} catch (Exception $e) {
    die("❌ Error: " . $e->getMessage() . "\n");
}
?>
