<?php
require_once __DIR__ . '/public_html/api/config.php';

echo "=== Columns in lms_access_logs ===\n";
$stmt = $pdo->query('DESCRIBE lms_access_logs');
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
}

echo "\n=== Encoding Test (Direct PDO) ===\n";
$testString = "Fisiologia & Metabolismo Áçêntôh 🚀 - test";
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
        // Check hexadecimal representation if mismatch
        echo "Hex Sent: " . bin2hex($testString) . "\n";
        echo "Hex Got:  " . bin2hex($recovered) . "\n";
    }
    
    $pdo->rollBack();
} catch (Exception $e) {
    echo "Error during encoding test: " . $e->getMessage() . "\n";
}
