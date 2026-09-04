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
    CREATE TABLE IF NOT EXISTS faq (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        display_order INT DEFAULT 0,
        active TINYINT(1) DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sql);
    echo "Table 'faq' checked/created successfully.";

} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage());
}
?>
