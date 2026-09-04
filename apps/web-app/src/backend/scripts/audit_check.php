<?php
/**
 * scripts/audit_check.php
 * Internal Auditor for database and filesystem integrity.
 */

require_once __DIR__ . '/../api/config.php';

function log_audit($pdo, $action, $status, $details) {
    $stmt = $pdo->prepare("INSERT INTO audit_logs (action, user_type, description, ip_address) VALUES (?, 'system', ?, '127.0.0.1')");
    $stmt->execute([$action, "[$status] $details"]);
}

try {
    // Usa o $pdo já configurado em config.php
    if (!isset($pdo)) {
        throw new Exception("Banco de dados não configurado (PDO missing).");
    }

    $issues = [];

    // 1. Check Admin Seeds
    $stmt = $pdo->query("SELECT COUNT(*) FROM admin_users");
    $adminCount = $stmt->fetchColumn();
    if ($adminCount == 0) {
        $issues[] = "No admin users found.";
    }

    // 2. Check Licenciadas Seeds (V41)
    $stmt = $pdo->query("SELECT COUNT(*) FROM licenciadas");
    $studentCount = $stmt->fetchColumn();
    if ($studentCount == 0) {
        $issues[] = "No licenciadas found.";
    }

    // 3. Check Critical Tables Existence
    $tables = ['admin_sessions', 'system_broadcasts', 'lms_certificates', 'audit_logs', 'licenciada_devices', 'site_config'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if (!$stmt->fetch()) {
            $issues[] = "Table '$table' is missing.";
        }
    }

    // 4. Check for Fragmentation/Duplicates (Data Integrity)
    // Check for duplicate student CPF (critical for login)
    $stmt = $pdo->query("SELECT cpf, COUNT(*) as count FROM licenciadas WHERE cpf IS NOT NULL AND cpf != '' GROUP BY cpf HAVING count > 1");
    while ($row = $stmt->fetch()) {
        $issues[] = "DATA_DUPLICATION: Found duplicate student CPF: " . $row['cpf'];
    }

    // Check for duplicate emails
    $stmt = $pdo->query("SELECT email, COUNT(*) as count FROM licenciadas WHERE email IS NOT NULL AND email != '' GROUP BY email HAVING count > 1");
    while ($row = $stmt->fetch()) {
        $issues[] = "DATA_DUPLICATION: Found duplicate student Email: " . $row['email'];
    }

    // 4. Check Upload Permissions
    $uploadDir = __DIR__ . '/../uploads';
    if (!is_dir($uploadDir)) {
        $issues[] = "Upload directory missing.";
    } elseif (!is_writable($uploadDir)) {
        $issues[] = "Upload directory is not writable.";
    }

    if (empty($issues)) {
        echo "INTEGRITY_OK\n";
        log_audit($pdo, "GOVERNANCE_AUDIT", "PASS", "System integrity verified. Admins: $adminCount, Students: $studentCount.");
        exit(0);
    } else {
        echo "INTEGRITY_FAILED\n";
        foreach ($issues as $issue) {
            echo "- $issue\n";
        }
        log_audit($pdo, "GOVERNANCE_AUDIT", "FAIL", implode(" | ", $issues));
        exit(1);
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
