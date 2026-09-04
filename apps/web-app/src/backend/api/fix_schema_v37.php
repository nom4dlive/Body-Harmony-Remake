<?php
// Fix critical schema gaps reported in Nexus Log (V37)
// Deploy to /api/fix_schema_v37.php and run once.

// Adjust path if needed, assuming this file ends up in /api/ alongside config.php
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
} elseif (file_exists(__DIR__ . '/../config.php')) {
    require_once __DIR__ . '/../config.php';
} else {
    // Fallback for local testing if running from src
    $possible_paths = [
        'apps/web-app/src/backend/api/config.php',
        '../../api/config.php'
    ];
    foreach ($possible_paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            break;
        }
    }
}

global $pdo;

if (!$pdo) {
    die("Database connection failed or config not loaded.");
}

function addColumn($table, $column, $definition) {
    global $pdo;
    try {
        // Check if exists
        $stmt = $pdo->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
        if ($stmt->fetch()) {
            echo "✅ Column <strong>$table.$column</strong> already exists.<br>";
            return;
        }
        $pdo->exec("ALTER TABLE `$table` ADD COLUMN $definition");
        echo "✅ Added <strong>$table.$column</strong>.<br>";
    } catch (Exception $e) {
        echo "❌ Error adding $table.$column: " . $e->getMessage() . "<br>";
    }
}

echo "<h2>🛡️ Nexus Schema Fix V37</h2>";

// 1. Students CPF (Critical for Licenciadas)
addColumn('students', 'cpf', '`cpf` VARCHAR(14) DEFAULT NULL AFTER `state`');

// 2. AI Clinical Cases (Critical for Doctor Harmony)
addColumn('ai_clinical_cases', 'doctor_harmony_response', '`doctor_harmony_response` TEXT DEFAULT NULL AFTER `ana_response`');
addColumn('ai_clinical_cases', 'mentor_feedback', '`mentor_feedback` TEXT DEFAULT NULL AFTER `doctor_harmony_response`');

echo "<h3>Status: Completed.</h3>";
echo "<p>Please delete this file after execution.</p>";
?>
