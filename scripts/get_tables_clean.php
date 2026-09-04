<?php
require 'apps/web-app/src/backend/api/config.php';
try {
    $pdo = getDbConnection();
    $stmt = $pdo->query('SHOW TABLES');
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "=== DB CONNECTION OK ===\n";
    foreach($tables as $t) { echo "- $t\n"; }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
