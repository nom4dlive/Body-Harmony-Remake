<?php
require_once __DIR__ . '/public_html/api/config.php';

$tables = ['lms_modules', 'lms_lessons'];
foreach ($tables as $table) {
    try {
        $stmt = $pdo->query("SHOW TABLE STATUS WHERE Name = '$table'");
        $status = $stmt->fetch();
        echo "Table: $table\n";
        echo "Collation: " . ($status['Collation'] ?? 'Unknown') . "\n\n";
        
        $stmt = $pdo->query("SHOW FULL COLUMNS FROM $table");
        $columns = $stmt->fetchAll();
        foreach ($columns as $col) {
            echo "  Column: " . $col['Field'] . "\n";
            echo "  Type: " . $col['Type'] . "\n";
            echo "  Collation: " . ($col['Collation'] ?? 'N/A') . "\n";
        }
        echo "---------------------------------\n";
    } catch (Exception $e) {
        echo "Error checking table $table: " . $e->getMessage() . "\n";
    }
}
