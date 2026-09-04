<?php
require_once '../../config.php';
require_once '../../auth_check.php';

// RBAC
$stmt = $pdo->prepare("SELECT role FROM admin_users WHERE id = ?");
$stmt->execute([$current_user_id]);
$user = $stmt->fetch();
if (!$user || $user['role'] !== 'superadmin') {
    die("Unauthorized");
}

try {
    $sql = "
    CREATE TABLE IF NOT EXISTS system_broadcasts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(20) DEFAULT 'info',
        message TEXT NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sql);
    echo "Table 'system_broadcasts' created successfully.";

} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage());
}
?>
