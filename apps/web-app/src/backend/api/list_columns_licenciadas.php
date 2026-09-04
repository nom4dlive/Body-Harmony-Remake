<?php
require_once __DIR__ . '/config.php';
try {
    $stmt = $pdo->query("SHOW COLUMNS FROM licenciadas");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $columnNames = array_column($columns, 'Field');
    echo implode(", ", $columnNames) . "\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
