<?php
// apps/web-app/src/backend/api/v1/crm/seed_team.php
// Body Harmony Nexus V3.1 — Gestor Team Users Provisioning Endpoint (PLAN-157)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/RbacService.php';

use BodyHarmony\Services\RbacService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

if (!$dbConn) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Não foi possível estabelecer conexão com o banco MySQL.'
    ]);
    exit;
}

try {
    // 1. Ensure RBAC tables and columns exist
    $rbacService = new RbacService($dbConn);
    $rbacService->ensureRbacTablesExist();

    // 2. Team Users definition
    $teamUsers = [
        [
            'username' => 'nom4d',
            'email' => 'nom4d@bodyharmony.com.br',
            'password' => 'nom4d010203',
            'role' => 'superadmin',
            'department_slug' => 'diretoria'
        ],
        [
            'username' => 'admin',
            'email' => 'admin@bodyharmony.com.br',
            'password' => 'BodyHarmony2026!Master',
            'role' => 'superadmin',
            'department_slug' => 'diretoria'
        ],
        [
            'username' => 'comercial',
            'email' => 'comercial@bodyharmony.com.br',
            'password' => 'y4f6XPmr*L:7',
            'role' => 'admin',
            'department_slug' => 'comercial'
        ],
        [
            'username' => 'giovanna',
            'email' => 'giovanna@bodyharmony.com.br',
            'password' => 'Gi010203*',
            'role' => 'admin',
            'department_slug' => 'comercial'
        ],
        [
            'username' => 'cibele',
            'email' => 'cibele@bodyharmony.com.br',
            'password' => 'Ci010203*',
            'role' => 'admin',
            'department_slug' => 'operacoes'
        ],
        [
            'username' => 'guilherme',
            'email' => 'guilherme@bodyharmony.com.br',
            'password' => 'Gui010203*',
            'role' => 'admin',
            'department_slug' => 'comercial'
        ],
        [
            'username' => 'eliadynne',
            'email' => 'eliadynne@bodyharmony.com.br',
            'password' => 'Li010203*',
            'role' => 'admin',
            'department_slug' => 'juridico'
        ],
        [
            'username' => 'juridico',
            'email' => 'juridico@bodyharmony.com.br',
            'password' => 'Jur010203*',
            'role' => 'admin',
            'department_slug' => 'juridico'
        ],
        [
            'username' => 'kaprice',
            'email' => 'kaprice@bodyharmony.com.br',
            'password' => 'Ka010203*',
            'role' => 'admin',
            'department_slug' => 'diretoria'
        ]
    ];

    $results = [];

    foreach ($teamUsers as $u) {
        $username = $u['username'];
        $email = $u['email'];
        $password = $u['password'];
        $role = $u['role'] ?? 'admin';
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        // Resolve Department ID if exists
        $deptStmt = $dbConn->prepare("SELECT id FROM admin_departments WHERE slug = ? LIMIT 1");
        $deptStmt->execute([$u['department_slug']]);
        $dept = $deptStmt->fetch(PDO::FETCH_ASSOC);
        $deptId = $dept ? (int)$dept['id'] : null;

        // Check if user exists by email or username
        $checkStmt = $dbConn->prepare("SELECT id, username, role FROM admin_users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1");
        $checkStmt->execute([$username, $email]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $updateStmt = $dbConn->prepare("
                UPDATE admin_users 
                SET password_hash = ?, email = ?, role = ?, is_active = 1, department_id = COALESCE(?, department_id)
                WHERE id = ?
            ");
            $updateStmt->execute([$passwordHash, $email, $role, $deptId, $existing['id']]);
            $status = 'UPDATED';
            $userId = (int)$existing['id'];
        } else {
            $insertStmt = $dbConn->prepare("
                INSERT INTO admin_users (username, email, password_hash, role, is_active, department_id)
                VALUES (?, ?, ?, ?, 1, ?)
            ");
            $insertStmt->execute([$username, $email, $passwordHash, $role, $deptId]);
            $userId = (int)$dbConn->lastInsertId();
            $status = 'CREATED';
        }

        $results[] = [
            'user_id' => $userId,
            'username' => $username,
            'email' => $email,
            'status' => $status
        ];
    }

    echo json_encode([
        'success' => true,
        'synced_count' => count($results),
        'users' => $results
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao sincronizar usuários: ' . $e->getMessage()
    ]);
}
