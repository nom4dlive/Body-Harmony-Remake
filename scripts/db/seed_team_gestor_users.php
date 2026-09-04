<?php
// scripts/db/seed_team_gestor_users.php
// Body Harmony Nexus V3.1 — Gestor Team Users Provisioning (PLAN-157)

require_once __DIR__ . '/../../apps/web-app/src/backend/api/config.php';
require_once __DIR__ . '/../../apps/web-app/src/backend/api/v1/Services/RbacService.php';

use BodyHarmony\Services\RbacService;

echo "===============================================================\n";
echo "  PROVISIONAMENTO DE USUÁRIOS DA EQUIPE NO GESTOR (PLAN-157)   \n";
echo "===============================================================\n\n";

global $pdo, $db;
$dbConn = $pdo ?? $db;

if (!$dbConn) {
    echo ">> [FATAL] Não foi possível conectar ao banco MySQL.\n";
    exit(1);
}

// 1. Ensure RBAC tables and columns exist
$rbacService = new RbacService($dbConn);
$rbacService->ensureRbacTablesExist();

// 2. Team Users definition
$teamUsers = [
    [
        'username' => 'comercial',
        'email' => 'comercial@bodyharmony.com.br',
        'password' => 'y4f6XPmr*L:7',
        'department_slug' => 'comercial'
    ],
    [
        'username' => 'giovanna',
        'email' => 'giovanna@bodyharmony.com.br',
        'password' => 'Gi010203*',
        'department_slug' => 'comercial'
    ],
    [
        'username' => 'cibele',
        'email' => 'cibele@bodyharmony.com.br',
        'password' => 'Ci010203*',
        'department_slug' => 'operacoes'
    ],
    [
        'username' => 'guilherme',
        'email' => 'guilherme@bodyharmony.com.br',
        'password' => 'Gui010203*',
        'department_slug' => 'comercial'
    ],
    [
        'username' => 'eliadynne',
        'email' => 'eliadynne@bodyharmony.com.br',
        'password' => 'Li010203*',
        'department_slug' => 'juridico'
    ],
    [
        'username' => 'juridico',
        'email' => 'juridico@bodyharmony.com.br',
        'password' => 'Jur010203*',
        'department_slug' => 'juridico'
    ],
    [
        'username' => 'kaprice',
        'email' => 'kaprice@bodyharmony.com.br',
        'password' => 'Ka010203*',
        'department_slug' => 'diretoria'
    ]
];

$results = [];

foreach ($teamUsers as $u) {
    $username = $u['username'];
    $email = $u['email'];
    $password = $u['password'];
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // Resolve Department ID if exists
    $deptStmt = $dbConn->prepare("SELECT id FROM admin_departments WHERE slug = ? LIMIT 1");
    $deptStmt->execute([$u['department_slug']]);
    $dept = $deptStmt->fetch(PDO::FETCH_ASSOC);
    $deptId = $dept ? (int)$dept['id'] : null;

    // Check if user exists by email or username
    $checkStmt = $dbConn->prepare("SELECT id, username FROM admin_users WHERE username = ? OR email = ? LIMIT 1");
    $checkStmt->execute([$username, $email]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $updateStmt = $dbConn->prepare("
            UPDATE admin_users 
            SET password_hash = ?, email = ?, role = 'admin', is_active = 1, department_id = COALESCE(?, department_id)
            WHERE id = ?
        ");
        $updateStmt->execute([$passwordHash, $email, $deptId, $existing['id']]);
        $status = 'UPDATED';
        $userId = (int)$existing['id'];
        echo ">> [UPDATE] Usuário atualizado: {$email} (ID: {$userId})\n";
    } else {
        $insertStmt = $dbConn->prepare("
            INSERT INTO admin_users (username, email, password_hash, role, is_active, department_id)
            VALUES (?, ?, ?, 'admin', 1, ?)
        ");
        $insertStmt->execute([$username, $email, $passwordHash, $deptId]);
        $userId = (int)$dbConn->lastInsertId();
        $status = 'CREATED';
        echo ">> [NEW] Usuário criado: {$email} (ID: {$userId})\n";
    }

    $results[] = [
        'user_id' => $userId,
        'username' => $username,
        'email' => $email,
        'status' => $status
    ];
}

echo "\n>> Sucesso! " . count($results) . " usuários da equipe sincronizados no Gestor.\n";
