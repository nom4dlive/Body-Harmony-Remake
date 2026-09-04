<?php
require 'config.php';
// Fixed path: libs are in v1/libs
require_once 'v1/libs/LoggerService.php';

try {
    echo "Starting DB Migration for Security Features...\n";
    
    // 1. Add ip_address
    try {
        $pdo->exec("ALTER TABLE student_devices ADD COLUMN ip_address VARCHAR(45) NULL AFTER user_agent");
        echo "✅ Added column 'ip_address'\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "ℹ️ Column 'ip_address' already exists.\n";
        } else {
            // throw $e; // Allow continue
            echo "Warning: " . $e->getMessage() . "\n";
        }
    }

    // 2. Add is_active
    try {
        $pdo->exec("ALTER TABLE student_devices ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER ip_address");
        echo "✅ Added column 'is_active'\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "ℹ️ Column 'is_active' already exists.\n";
        } else {
             // throw $e;
             echo "Warning: " . $e->getMessage() . "\n";
        }
    }
    
    // 3. Indexes
    try {
        $pdo->exec("CREATE INDEX idx_device_token ON student_devices(device_token)");
        echo "✅ Created index 'idx_device_token'\n";
    } catch (PDOException $e) {
        echo "ℹ️ Index 'idx_device_token' might already exist or failed: " . $e->getMessage() . "\n";
    }

    try {
        $pdo->exec("CREATE INDEX idx_student_active ON student_devices(student_id, is_active)");
        echo "✅ Created index 'idx_student_active'\n";
    } catch (PDOException $e) {
        echo "ℹ️ Index 'idx_student_active' might already exist or failed: " . $e->getMessage() . "\n";
    }

    echo "Migration Complete.\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
