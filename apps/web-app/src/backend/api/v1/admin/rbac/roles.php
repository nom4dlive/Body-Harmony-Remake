<?php
// apps/web-app/src/backend/api/v1/admin/rbac/roles.php

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
        $departmentId = !empty($_GET['department_id']) ? (int)$_GET['department_id'] : null;
        $roles = $rbacService->listRoles($departmentId);
        echo json_encode([
            'success' => true,
            'roles' => $roles,
            'total' => count($roles)
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'POST') {
        $operatorId = (int)$current_user_id;
        $perms = $rbacService->getUserPermissions($operatorId);
        if (!$perms['is_superadmin'] && ($perms['hierarchy_level'] > 2)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Apenas a Diretoria e Superadministradores podem editar cargos.']);
            exit;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $roleId = (int)($body['role_id'] ?? 0);
        $permissions = $body['permissions'] ?? [];

        if ($roleId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'role_id é obrigatório']);
            exit;
        }

        $res = $rbacService->updateRolePermissions($roleId, $permissions);
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
        exit;
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
