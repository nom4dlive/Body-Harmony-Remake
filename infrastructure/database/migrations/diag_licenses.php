<?php
require_once __DIR__ . '/../../../apps/web-app/src/backend/api/config.php';
try {
    $cols = $pdo->query("SHOW COLUMNS FROM lms_licenses")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $col) {
        echo "COL: " . $col['Field'] . "\n";
    }
    
    $cols2 = $pdo->query("SHOW COLUMNS FROM lms_licenciada_licenses")->fetchAll(PDO::FETCH_ASSOC);
    echo "---\n";
    foreach ($cols2 as $col) {
        echo "L_COL: " . $col['Field'] . "\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
