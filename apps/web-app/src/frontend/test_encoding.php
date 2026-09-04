<?php
require_once __DIR__ . '/public_html/api/config.php';

echo "=== Event Types in lms_access_logs ===\n";
$stmt = $pdo->query('SELECT DISTINCT event_type FROM lms_access_logs');
while($row = $stmt->fetch(PDO::FETCH_NUM)) echo "- " . $row[0] . PHP_EOL;

echo "\n=== Encoding Test ===\n";
$testString = "Fisiologia & Metabolismo Áçêntôh - test";
try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("INSERT INTO lms_modules (title, description) VALUES (?, ?)");
    $stmt->execute([$testString, "Test description with symbols: @#$%^&*()"]);
    $lastId = $pdo->lastInsertId();
    
    $stmt = $pdo->prepare("SELECT title FROM lms_modules WHERE id = ?");
    $stmt->execute([$lastId]);
    $recovered = $stmt->fetchColumn();
    
    if ($recovered === $testString) {
        echo "SUCCESS: Encoding is working correctly for: $recovered\n";
    } else {
        echo "FAILURE: Encoding mismatch!\n";
        echo "Sent: $testString\n";
        echo "Got: $recovered\n";
    }
    
    $pdo->rollBack(); // Don't actually keep it
} catch (Exception $e) {
    echo "Error during encoding test: " . $e->getMessage() . "\n";
}
