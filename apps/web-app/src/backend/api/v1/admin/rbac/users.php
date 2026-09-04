<?php
// apps/web-app/src/backend/api/v1/admin/rbac/users.php

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
        $users = $rbacService->listUsers();
        $currentUserPerms = $rbacService->getUserPermissions((int)$current_user_id);

        echo json_encode([
            'success' => true,
            'current_user' => $currentUserPerms,
            'users' => $users,
            'total' => count($users)
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $body['action'] ?? 'assign_role';
        $operatorId = (int)$current_user_id;

        // Permissão global para gerenciar usuários: Nível 1 ou 2 (Superadmin ou Direção/Gerência)
        $perms = $rbacService->getUserPermissions($operatorId);
        if (!$perms['is_superadmin'] && ($perms['hierarchy_level'] > 2)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Apenas diretores e superadministradores podem gerenciar usuários da equipe.']);
            exit;
        }

        switch ($action) {
            case 'create':
                $res = $rbacService->createUser($body, $operatorId);
                echo json_encode($res, JSON_UNESCAPED_UNICODE);
                exit;

            case 'update':
                $targetId = (int)($body['user_id'] ?? $body['admin_id'] ?? 0);
                if (!$rbacService->canManageUser($operatorId, $targetId)) {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'error' => 'Você não tem permissão para gerenciar este usuário.']);
                    exit;
                }
                $res = $rbacService->updateUser($targetId, $body, $operatorId);
                echo json_encode($res, JSON_UNESCAPED_UNICODE);
                exit;

            case 'reset_password':
                $targetId = (int)($body['user_id'] ?? $body['admin_id'] ?? 0);
                $newPass = (string)($body['password'] ?? '');
                if (!$rbacService->canManageUser($operatorId, $targetId)) {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'error' => 'Você não tem permissão para alterar a senha deste usuário.']);
                    exit;
                }
                $res = $rbacService->resetUserPassword($targetId, $newPass, $operatorId);
                echo json_encode($res, JSON_UNESCAPED_UNICODE);
                exit;

            case 'save_custom_permissions':
            case 'update_permissions':
                $targetId = (int)($body['user_id'] ?? $body['admin_id'] ?? 0);
                if (!$rbacService->canManageUser($operatorId, $targetId)) {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'error' => 'Você não tem permissão para alterar permissões deste usuário.']);
                    exit;
                }
                $perms = (array)($body['permissions'] ?? []);
                $hasCustom = isset($body['has_custom_permissions']) ? (int)$body['has_custom_permissions'] : 1;
                $res = $rbacService->updateUserPermissions($targetId, $perms, $hasCustom);
                echo json_encode($res, JSON_UNESCAPED_UNICODE);
                exit;

            case 'toggle_status':
                $targetId = (int)($body['user_id'] ?? $body['admin_id'] ?? 0);
                if (!$rbacService->canManageUser($operatorId, $targetId)) {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'error' => 'Você não tem permissão para alterar o status deste usuário.']);
                    exit;
                }
                $res = $rbacService->toggleUserStatus($targetId, $operatorId);
                echo json_encode($res, JSON_UNESCAPED_UNICODE);
                exit;

            case 'assign_role':
            default:
                $targetAdminId = (int)($body['admin_id'] ?? $body['user_id'] ?? 0);
                $roleId = !empty($body['role_id']) ? (int)$body['role_id'] : null;
                $departmentId = !empty($body['department_id']) ? (int)$body['department_id'] : null;
                $supervisorId = !empty($body['supervisor_id']) ? (int)$body['supervisor_id'] : null;

                if ($targetAdminId <= 0) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'admin_id é obrigatório']);
                    exit;
                }

                if (!$rbacService->canManageUser($operatorId, $targetAdminId)) {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'error' => 'Acesso negado: sem permissão para alterar este usuário.']);
                    exit;
                }

                $res = $rbacService->assignUserRole($targetAdminId, $roleId, $departmentId, $supervisorId);
                echo json_encode($res, JSON_UNESCAPED_UNICODE);
                exit;
        }
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
