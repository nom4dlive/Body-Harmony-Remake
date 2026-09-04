<?php
// tests/rbac_matrix_smoke_test.php

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/RbacService.php';

use BodyHarmony\Services\RbacService;

echo "=================================================================\n";
echo "   SMOKE TEST: RBAC MATRIX & CUSTOM PERMISSIONS RESOLVER         \n";
echo "   Modo Alternado (Cargo vs Usuário), Normalização & Fallbacks   \n";
echo "=================================================================\n\n";

class MockMatrixPDO extends PDO {
    public array $roles = [];
    public array $users = [];

    public function __construct() {
        $this->roles = [
            1 => [
                'id' => 1,
                'name' => 'Diretoria Executiva',
                'slug' => 'diretoria-executiva',
                'hierarchy_level' => 1,
                'permissions_json' => '{"agenda":"all","onboarding":"manage","contracts":"manage"}'
            ],
            2 => [
                'id' => 2,
                'name' => 'Consultora Comercial',
                'slug' => 'consultora-comercial',
                'hierarchy_level' => 4,
                'permissions_json' => '{"agenda":"own","onboarding":"view","contracts":"none"}'
            ]
        ];

        $this->users = [
            1 => [
                'id' => 1,
                'username' => 'josi_super',
                'legacy_role' => 'superadmin',
                'role' => 'superadmin',
                'role_id' => 1,
                'has_custom_permissions' => 0,
                'custom_permissions_json' => null,
                'is_active' => 1
            ],
            2 => [
                'id' => 2,
                'username' => 'ana_consultora',
                'legacy_role' => 'admin',
                'role' => 'admin',
                'role_id' => 2,
                'has_custom_permissions' => 0,
                'custom_permissions_json' => null,
                'is_active' => 1
            ]
        ];
    }

    public function exec(string $statement): int|false { return 1; }
    public function query(string $statement, ?int $mode = PDO::FETCH_DEFAULT, mixed ...$fetch_mode_args): PDOStatement|false {
        return new MockMatrixStatement($this, $statement);
    }
    public function prepare(string $statement, array $options = []): PDOStatement|false {
        return new MockMatrixStatement($this, $statement);
    }
}

class MockMatrixStatement extends PDOStatement {
    private MockMatrixPDO $pdo;
    private string $sql;
    private array $params = [];

    public function __construct(MockMatrixPDO $pdo, string $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute(?array $params = null): bool {
        $this->params = $params ?? [];

        if (stripos($this->sql, 'UPDATE') !== false && stripos($this->sql, 'roles') !== false && stripos($this->sql, 'permissions_json') !== false) {
            $json = $params[0] ?? '{}';
            $id = (int)($params[1] ?? 0);
            if (isset($this->pdo->roles[$id])) {
                $this->pdo->roles[$id]['permissions_json'] = $json;
            }
            return true;
        }

        if (stripos($this->sql, 'UPDATE') !== false && stripos($this->sql, 'admin_users') !== false && stripos($this->sql, 'has_custom_permissions') !== false) {
            $hasCustom = (int)($params[0] ?? 0);
            $customJson = $params[1] ?? null;
            $userId = (int)($params[2] ?? 0);
            if (isset($this->pdo->users[$userId])) {
                $this->pdo->users[$userId]['has_custom_permissions'] = $hasCustom;
                $this->pdo->users[$userId]['custom_permissions_json'] = $customJson;
            }
            return true;
        }

        return true;
    }

    public function fetchAll(int $mode = PDO::FETCH_DEFAULT, mixed ...$args): array {
        return [];
    }

    public function fetch(int $mode = PDO::FETCH_DEFAULT, int $cursorOrientation = PDO::FETCH_ORI_NEXT, int $cursorOffset = 0): mixed {
        if (stripos($this->sql, 'FROM admin_users') !== false && stripos($this->sql, 'WHERE u.id = ?') !== false) {
            $userId = (int)($this->params[0] ?? 0);
            $u = $this->pdo->users[$userId] ?? null;
            if (!$u) return false;
            $r = $this->pdo->roles[$u['role_id']] ?? [];
            return [
                'id' => $u['id'],
                'username' => $u['username'],
                'role' => $u['role'],
                'legacy_role' => $u['legacy_role'],
                'department_id' => 1,
                'role_id' => $u['role_id'],
                'supervisor_id' => null,
                'is_active' => $u['is_active'],
                'has_custom_permissions' => $u['has_custom_permissions'],
                'custom_permissions_json' => $u['custom_permissions_json'],
                'department_name' => 'Geral',
                'department_color' => '#0A3E60',
                'role_name' => $r['name'] ?? 'Role',
                'hierarchy_level' => $r['hierarchy_level'] ?? 3,
                'role_permissions_json' => $r['permissions_json'] ?? null
            ];
        }

        return false;
    }
}

// EXECUÇÃO DOS TESTES
$mockPdo = new MockMatrixPDO();
$rbacService = new RbacService($mockPdo);

// TESTE 1: Normalização de Permissões
echo "[TEST 1/5] Normalização de permissões legadas e estruturadas...\n";
$legacyPerms = ['agenda' => 'team', 'onboarding' => 'view', 'contracts' => 'none'];
$normalized = $rbacService->normalizePermissions($legacyPerms, false);

assert($normalized['pages']['agenda'] === true, 'Página agenda deve ser true');
assert($normalized['pages']['onboarding'] === true, 'Página onboarding deve ser true');
assert($normalized['pages']['contratos'] === false, 'Página contratos deve ser false');
assert($normalized['agenda_scope'] === 'team', 'Agenda scope deve ser team');
echo " -> PASS: Normalização mapeou páginas e escopos perfeitamente.\n\n";

// TESTE 2: Resolução de Permissões do Superadmin (God Mode)
echo "[TEST 2/5] Resolução de permissões para Superadmin (God Mode)...\n";
$superPerms = $rbacService->getUserPermissions(1);
assert($superPerms['is_superadmin'] === true, 'Deve identificar superadmin');
assert($superPerms['pages']['onboarding'] === true, 'Superadmin deve ter onboarding liberado');
assert($superPerms['pages']['configuracoes'] === true, 'Superadmin deve ter configuracoes liberado');
assert($superPerms['actions']['contracts_sign'] === true, 'Superadmin deve ter assinatura liberada');
echo " -> PASS: Superadmin possui todas as páginas e ações autorizadas (God Mode).\n\n";

// TESTE 3: Resolução de Permissões por Cargo Padrão
echo "[TEST 3/5] Resolução de permissões herdadas do Cargo (has_custom_permissions = 0)...\n";
$userPerms = $rbacService->getUserPermissions(2);
assert($userPerms['is_superadmin'] === false, 'Não é superadmin');
assert($userPerms['has_custom_permissions'] === 0, 'Não deve ter permissões customizadas');
assert($userPerms['pages']['onboarding'] === true, 'Consultora tem onboarding pelo cargo');
assert($userPerms['pages']['contratos'] === false, 'Consultora não tem contratos pelo cargo');
echo " -> PASS: Usuário herdou estritamente a matriz do cargo configurado.\n\n";

// TESTE 4: Ativação do Modo Alternado (Customizar Usuário)
echo "[TEST 4/5] Ativação de permissões customizadas exclusivas para o Usuário...\n";
$customMatrix = [
    'pages' => [
        'onboarding' => true,
        'contratos' => true,
        'agenda' => true
    ],
    'actions' => [
        'contracts_create' => true,
        'contracts_sign' => false
    ],
    'agenda_scope' => 'own'
];

$updateRes = $rbacService->updateUserPermissions(2, $customMatrix, 1);
assert($updateRes['success'] === true, 'Deve atualizar com sucesso');

$resolvedCustom = $rbacService->getUserPermissions(2);
assert($resolvedCustom['has_custom_permissions'] === 1, 'Deve estar com custom ativo');
assert($resolvedCustom['pages']['contratos'] === true, 'Contratos agora deve estar liberado para Ana');
assert($resolvedCustom['actions']['contracts_create'] === true, 'contracts_create liberado');
assert($resolvedCustom['actions']['contracts_sign'] === false, 'contracts_sign bloqueado');
echo " -> PASS: Modo alternado ativado; matriz customizada do usuário tem precedência total.\n\n";

// TESTE 5: Retorno ao Cargo Padrão (Desativar Custom)
echo "[TEST 5/5] Desativação de customização e retorno imediato ao Cargo...\n";
$rbacService->updateUserPermissions(2, [], 0);

$revertedUser = $rbacService->getUserPermissions(2);
assert($revertedUser['has_custom_permissions'] === 0, 'Custom deve estar desativado');
assert($revertedUser['pages']['contratos'] === false, 'Contratos volta a ser bloqueado pelo cargo');
echo " -> PASS: Usuário voltou a seguir as regras dinâmicas do seu cargo base.\n\n";

echo "=================================================================\n";
echo "🎉 ALL 5/5 RBAC MATRIX SMOKE TESTS PASSED WITH 100% SUCCESS!\n";
echo "=================================================================\n";
