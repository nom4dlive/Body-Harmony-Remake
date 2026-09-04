<?php
// apps/web-app/src/backend/api/v1/admin/rbac/departments.php

require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../../../auth_check.php';
require_once __DIR__ . '/../../Services/RbacService.php';

use BodyHarmony\Services\RbacService;

header('Content-Type: application/json; charset=utf-8');

try {
    global $pdo, $db, $current_user_id;
    $dbConn = $pdo ?? $db;
    $rbacService = new RbacService($dbConn);

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $departments = $rbacService->listDepartments();
        echo json_encode([
            'success' => true,
            'departments' => $departments,
            'total' => count($departments)
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
