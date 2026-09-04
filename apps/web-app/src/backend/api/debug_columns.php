<?php
// apps/web-app/src/backend/api/debug_columns.php
require_once __DIR__ . '/config.php';
try {
    $stmt = $pdo->query("DESCRIBE licenciadas");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'columns' => $columns]);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
