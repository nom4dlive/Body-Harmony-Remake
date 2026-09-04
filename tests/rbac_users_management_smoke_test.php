<?php
// tests/rbac_users_management_smoke_test.php

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/RbacService.php';

use BodyHarmony\Services\RbacService;

echo "=================================================================\n";
echo "   SMOKE TEST: RBAC USER MANAGEMENT & ROLES UI (PLAN-079)        \n";
echo "   Cadastro, Edição, Alteração de Status e Reset de Senha        \n";
echo "=================================================================\n\n";

class MockUserMgmtPDO extends PDO {
    public array $departments = [];
    public array $roles = [];
    public array $users = [];
    public int $lastInsertId = 0;

    public function __construct() {
        $this->departments = [
            1 => ['id' => 1, 'name' => 'Diretoria & Presidência', 'slug' => 'diretoria', 'color' => '#0A3E60', 'created_at' => date('Y-m-d H:i:s')],
            2 => ['id' => 2, 'name' => 'Comercial & Vendas', 'slug' => 'comercial', 'color' => '#ED7E13', 'created_at' => date('Y-m-d H:i:s')],
            3 => ['id' => 3, 'name' => 'Atendimento & Suporte', 'slug' => 'suporte', 'color' => '#10B981', 'created_at' => date('Y-m-d H:i:s')]
        ];

        $this->roles = [
            1 => ['id' => 1, 'department_id' => 1, 'name' => 'Diretora Executiva', 'slug' => 'diretora-executiva', 'hierarchy_level' => 1, 'permissions_json' => '{"agenda":"all","rbac":"manage"}'],
            2 => ['id' => 2, 'department_id' => 2, 'name' => 'Gerente Comercial', 'slug' => 'gerente-comercial', 'hierarchy_level' => 3, 'permissions_json' => '{"agenda":"team","rbac":"none"}'],
            3 => ['id' => 3, 'department_id' => 2, 'name' => 'Consultora de Vendas', 'slug' => 'consultora-vendas', 'hierarchy_level' => 4, 'permissions_json' => '{"agenda":"own","rbac":"none"}']
        ];

        $this->users = [
            1 => ['id' => 1, 'username' => 'josi_master', 'password' => 'hash1', 'email' => 'josi@bodyharmony.com.br', 'legacy_role' => 'superadmin', 'role' => 'superadmin', 'department_id' => 1, 'role_id' => 1, 'supervisor_id' => null, 'is_active' => 1],
            2 => ['id' => 2, 'username' => 'carlos_gerente', 'password' => 'hash2', 'email' => 'carlos@bodyharmony.com.br', 'legacy_role' => 'admin', 'role' => 'admin', 'department_id' => 2, 'role_id' => 2, 'supervisor_id' => 1, 'is_active' => 1]
        ];
    }

    public function exec(string $statement): int|false { return 1; }
    public function query(string $statement, ?int $mode = PDO::FETCH_DEFAULT, mixed ...$fetch_mode_args): PDOStatement|false {
        return new MockUserMgmtStatement($this, $statement);
    }
    public function prepare(string $statement, array $options = []): PDOStatement|false {
        return new MockUserMgmtStatement($this, $statement);
    }
    public function lastInsertId(?string $name = null): string|false {
        return (string)$this->lastInsertId;
    }
}

class MockUserMgmtStatement extends PDOStatement {
    private MockUserMgmtPDO $pdo;
    private string $sql;
    private array $params = [];

    public function __construct(MockUserMgmtPDO $pdo, string $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute(?array $params = null): bool {
        $this->params = $params ?? [];

        if (stripos($this->sql, 'INSERT INTO admin_users') !== false) {
            $newId = count($this->pdo->users) + 1;
            $this->pdo->lastInsertId = $newId;
            $this->pdo->users[$newId] = [
                'id' => $newId,
                'username' => $params[0],
                'password' => $params[1],
                'email' => $params[2],
                'role' => $params[3],
                'department_id' => $params[4],
                'role_id' => $params[5],
                'supervisor_id' => $params[6],
                'is_active' => $params[7]
            ];
            return true;
        }

        if (stripos($this->sql, 'UPDATE admin_users SET is_active') !== false) {
            $status = $params[0];
            $userId = (int)$params[1];
            if (isset($this->pdo->users[$userId])) {
                $this->pdo->users[$userId]['is_active'] = $status;
            }
            return true;
        }

        if (stripos($this->sql, 'UPDATE admin_users SET password') !== false) {
            $hash = $params[0];
            $userId = (int)$params[1];
            if (isset($this->pdo->users[$userId])) {
                $this->pdo->users[$userId]['password'] = $hash;
            }
            return true;
        }

        if (stripos($this->sql, 'UPDATE admin_users SET') !== false) {
            $userId = (int)end($params);
            if (isset($this->pdo->users[$userId])) {
                if (stripos($this->sql, 'department_id = ?') !== false) {
                    $this->pdo->users[$userId]['department_id'] = $params[0] ?? null;
                }
            }
            return true;
        }

        return true;
    }

    public function fetchAll(int $mode = PDO::FETCH_DEFAULT, mixed ...$args): array {
        if (stripos($this->sql, 'FROM admin_departments') !== false) {
            return array_values($this->pdo->departments);
        }
        if (stripos($this->sql, 'FROM admin_roles') !== false) {
            $out = [];
            foreach ($this->pdo->roles as $r) {
                $deptId = $r['department_id'];
                $r['department_name'] = $this->pdo->departments[$deptId]['name'] ?? 'Geral';
                $r['department_color'] = $this->pdo->departments[$deptId]['color'] ?? '#0A3E60';
                $r['department_slug'] = $this->pdo->departments[$deptId]['slug'] ?? 'geral';
                $out[] = $r;
            }
            return $out;
        }
        if (stripos($this->sql, 'FROM admin_users') !== false && stripos($this->sql, 'WHERE u.id IN') !== false) {
            $out = [];
            foreach ($this->params as $id) {
                if (isset($this->pdo->users[$id])) {
                    $u = $this->pdo->users[$id];
                    $roleId = $u['role_id'] ?? null;
                    $u['hierarchy_level'] = $this->pdo->roles[$roleId]['hierarchy_level'] ?? 5;
                    $out[] = $u;
                }
            }
            return $out;
        }
        if (stripos($this->sql, 'FROM admin_users') !== false) {
            $out = [];
            foreach ($this->pdo->users as $u) {
                $deptId = $u['department_id'] ?? null;
                $roleId = $u['role_id'] ?? null;
                $u['department_name'] = $this->pdo->departments[$deptId]['name'] ?? null;
                $u['department_color'] = $this->pdo->departments[$deptId]['color'] ?? null;
                $u['role_name'] = $this->pdo->roles[$roleId]['name'] ?? null;
                $u['role_slug'] = $this->pdo->roles[$roleId]['slug'] ?? null;
                $u['hierarchy_level'] = $this->pdo->roles[$roleId]['hierarchy_level'] ?? 5;
                $u['permissions_json'] = $this->pdo->roles[$roleId]['permissions_json'] ?? null;
                $u['supervisor_name'] = $this->pdo->users[$u['supervisor_id'] ?? 0]['username'] ?? null;
                $out[] = $u;
            }
            return $out;
        }
        return [];
    }

    public function fetch(int $mode = PDO::FETCH_DEFAULT, int $cursorOrientation = PDO::FETCH_ORI_NEXT, int $cursorOffset = 0): mixed {
        if (stripos($this->sql, 'SELECT id FROM admin_users WHERE username = ?') !== false) {
            $username = $this->params[0] ?? '';
            foreach ($this->pdo->users as $u) {
                if ($u['username'] === $username) return ['id' => $u['id']];
            }
            return false;
        }

        if (stripos($this->sql, 'SELECT is_active, username FROM admin_users WHERE id = ?') !== false ||
            stripos($this->sql, 'SELECT id, username, role, is_active FROM admin_users WHERE id = ?') !== false) {
            $id = (int)($this->params[0] ?? 0);
            return $this->pdo->users[$id] ?? false;
        }

        if (stripos($this->sql, 'FROM admin_users') !== false && stripos($this->sql, 'WHERE u.id = ?') !== false) {
            $id = (int)($this->params[0] ?? 0);
            if (isset($this->pdo->users[$id])) {
                $u = $this->pdo->users[$id];
                $roleId = $u['role_id'] ?? null;
                $deptId = $u['department_id'] ?? null;
                $u['department_name'] = $this->pdo->departments[$deptId]['name'] ?? 'Geral';
                $u['department_slug'] = $this->pdo->departments[$deptId]['slug'] ?? 'geral';
                $u['role_name'] = $this->pdo->roles[$roleId]['name'] ?? 'Cargo';
                $u['hierarchy_level'] = $this->pdo->roles[$roleId]['hierarchy_level'] ?? 5;
                $u['permissions_json'] = $this->pdo->roles[$roleId]['permissions_json'] ?? '{}';
                return $u;
            }
        }

        if (stripos($this->sql, 'SELECT hierarchy_level FROM admin_roles WHERE id = ?') !== false) {
            $id = (int)($this->params[0] ?? 0);
            return $this->pdo->roles[$id] ?? false;
        }

        return false;
    }
}

$mockDb = new MockUserMgmtPDO();
$rbac = new RbacService($mockDb);

$testUsername = 'operador_vendas_' . time();
$testEmail = $testUsername . '@bodyharmony.com.br';
$testPass = 'SenhaForte123!';

try {
    // 1. List departments & roles
    echo "[TEST 1/5] Listing departments & roles... ";
    $depts = $rbac->listDepartments();
    $roles = $rbac->listRoles();
    if (empty($depts) || empty($roles)) {
        throw new Exception("Departments or roles empty");
    }
    echo "PASS (Depts: " . count($depts) . ", Roles: " . count($roles) . ")\n";

    // 2. Create User
    echo "[TEST 2/5] Creating user '{$testUsername}'... ";
    $resCreate = $rbac->createUser([
        'username' => $testUsername,
        'email' => $testEmail,
        'password' => $testPass,
        'department_id' => 2, // Comercial
        'role_id' => 3,       // Consultora de Vendas
        'supervisor_id' => 1,
        'is_active' => 1
    ], 1);
    if (empty($resCreate['success']) || empty($resCreate['user_id'])) {
        throw new Exception("Failed to create user: " . json_encode($resCreate));
    }
    $createdId = (int)$resCreate['user_id'];
    echo "PASS (User ID #{$createdId})\n";

    // 3. Update User
    echo "[TEST 3/5] Updating user #{$createdId} to Atendimento... ";
    $resUpd = $rbac->updateUser($createdId, [
        'department_id' => 3,
        'email' => 'novo_' . $testEmail
    ], 1);
    if (empty($resUpd['success'])) {
        throw new Exception("Failed to update user");
    }
    echo "PASS\n";

    // 4. Toggle Status (Active -> Inactive -> Active)
    echo "[TEST 4/5] Toggling status of user #{$createdId}... ";
    $resToggle1 = $rbac->toggleUserStatus($createdId, 1);
    if ((int)$resToggle1['is_active'] !== 0) {
        throw new Exception("Expected is_active 0, got " . $resToggle1['is_active']);
    }
    $resToggle2 = $rbac->toggleUserStatus($createdId, 1);
    if ((int)$resToggle2['is_active'] !== 1) {
        throw new Exception("Expected is_active 1, got " . $resToggle2['is_active']);
    }
    echo "PASS (Toggled 0 -> 1)\n";

    // 5. Reset Password & Permissions Check
    echo "[TEST 5/5] Resetting password & checking permissions... ";
    $resPass = $rbac->resetUserPassword($createdId, 'NovaSenha456!', 1);
    if (empty($resPass['success'])) {
        throw new Exception("Failed to reset password");
    }
    $perms = $rbac->getUserPermissions(1);
    if (!$perms['is_superadmin']) {
        throw new Exception("Expected superadmin permissions for ID 1");
    }
    echo "PASS\n";

    echo "\n=================================================================\n";
    echo "🎉 ALL 5/5 SMOKE TESTS PASSED WITH 100% SUCCESS!\n";
    echo "=================================================================\n";

} catch (Throwable $e) {
    echo "\n❌ FAIL: " . $e->getMessage() . "\n";
    exit(1);
}
