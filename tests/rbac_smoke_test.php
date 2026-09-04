<?php
// tests/rbac_smoke_test.php

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/RbacService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/AgendaService.php';

use BodyHarmony\Services\RbacService;
use BodyHarmony\Services\AgendaService;

echo "=================================================================\n";
echo "   SMOKE TEST: RBAC DEPARTAMENTAL & MULTI-AGENDA (PLAN-076)     \n";
echo "   Perfis Customizados, Isolamento, Compartilhamento & Supervisão \n";
echo "=================================================================\n\n";

class MockRbacPDO extends PDO {
    public array $departments = [];
    public array $roles = [];
    public array $users = [];
    public array $agendaEvents = [];
    public array $agendaShares = [];
    public array $eventParticipants = [];
    public int $lastInsertId = 0;

    public function __construct() {
        // In-memory mock
        $this->departments = [
            1 => ['id' => 1, 'name' => 'Diretoria & Presidência', 'slug' => 'diretoria', 'color' => '#0A3E60', 'created_at' => date('Y-m-d H:i:s')],
            2 => ['id' => 2, 'name' => 'Comercial & Vendas', 'slug' => 'comercial', 'color' => '#ED7E13', 'created_at' => date('Y-m-d H:i:s')],
            3 => ['id' => 3, 'name' => 'Atendimento & Suporte', 'slug' => 'suporte', 'color' => '#10B981', 'created_at' => date('Y-m-d H:i:s')]
        ];

        $this->roles = [
            1 => ['id' => 1, 'department_id' => 1, 'name' => 'Diretora Executiva', 'slug' => 'diretora-executiva', 'hierarchy_level' => 1, 'permissions_json' => '{"agenda":"all","rbac":"manage"}'],
            2 => ['id' => 2, 'department_id' => 2, 'name' => 'Gerente Comercial', 'slug' => 'gerente-comercial', 'hierarchy_level' => 3, 'permissions_json' => '{"agenda":"team","rbac":"none"}'],
            3 => ['id' => 3, 'department_id' => 2, 'name' => 'Consultora de Vendas', 'slug' => 'consultora-vendas', 'hierarchy_level' => 4, 'permissions_json' => '{"agenda":"own","rbac":"none"}'],
            4 => ['id' => 4, 'department_id' => 3, 'name' => 'Atendente de Suporte', 'slug' => 'atendente-suporte', 'hierarchy_level' => 5, 'permissions_json' => '{"agenda":"own","rbac":"none"}']
        ];

        $this->users = [
            1 => ['id' => 1, 'username' => 'josi_diretora', 'legacy_role' => 'superadmin', 'role' => 'superadmin', 'department_id' => 1, 'role_id' => 1, 'supervisor_id' => null],
            2 => ['id' => 2, 'username' => 'carlos_gerente', 'legacy_role' => 'admin', 'role' => 'admin', 'department_id' => 2, 'role_id' => 2, 'supervisor_id' => 1],
            3 => ['id' => 3, 'username' => 'ana_vendedora', 'legacy_role' => 'admin', 'role' => 'admin', 'department_id' => 2, 'role_id' => 3, 'supervisor_id' => 2],
            4 => ['id' => 4, 'username' => 'lucas_suporte', 'legacy_role' => 'editor', 'role' => 'editor', 'department_id' => 3, 'role_id' => 4, 'supervisor_id' => 1]
        ];

        $this->agendaEvents = [
            1 => [
                'id' => 1,
                'title' => 'Reunião de Expansão de Franquias',
                'start_datetime' => '2026-08-25 10:00:00',
                'end_datetime' => '2026-08-25 11:30:00',
                'event_type' => 'evento_geral',
                'priority' => 'alta',
                'status' => 'pendente',
                'created_by_admin_id' => 1,
                'assigned_to_admin_id' => 2,
                'deleted_at' => null
            ],
            2 => [
                'id' => 2,
                'title' => 'Follow-up de Fechamento Lead VIP',
                'start_datetime' => '2026-08-25 14:00:00',
                'end_datetime' => '2026-08-25 15:00:00',
                'event_type' => 'agendamento_cliente',
                'priority' => 'critica',
                'status' => 'pendente',
                'created_by_admin_id' => 3,
                'assigned_to_admin_id' => 3,
                'deleted_at' => null
            ]
        ];
    }

    public function exec(string $statement): int|false {
        return 1;
    }

    public function query(string $statement, ?int $mode = PDO::FETCH_DEFAULT, mixed ...$fetch_mode_args): PDOStatement|false {
        return new MockRbacStatement($this, $statement);
    }

    public function prepare(string $statement, array $options = []): PDOStatement|false {
        return new MockRbacStatement($this, $statement);
    }
}

class MockRbacStatement extends PDOStatement {
    private MockRbacPDO $pdo;
    private string $sql;
    private array $params = [];

    public function __construct(MockRbacPDO $pdo, string $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute(?array $params = null): bool {
        $this->params = $params ?? [];

        if (stripos($this->sql, 'INSERT INTO gestor_agenda_shares') !== false) {
            $this->pdo->agendaShares[] = [
                'owner_admin_id' => $params[0],
                'shared_with_admin_id' => $params[1],
                'permission_level' => $params[2]
            ];
            return true;
        }

        if (stripos($this->sql, 'INSERT INTO gestor_agenda_event_participants') !== false) {
            $this->pdo->eventParticipants[] = [
                'event_id' => $params[0],
                'admin_id' => $params[1],
                'role_type' => $params[2],
                'status' => 'accepted'
            ];
            return true;
        }

        if (stripos($this->sql, 'UPDATE admin_users SET role_id') !== false) {
            $roleId = $params[0];
            $deptId = $params[1];
            $supId = $params[2];
            $userId = (int)$params[3];
            if (isset($this->pdo->users[$userId])) {
                $this->pdo->users[$userId]['role_id'] = $roleId;
                $this->pdo->users[$userId]['department_id'] = $deptId;
                $this->pdo->users[$userId]['supervisor_id'] = $supId;
            }
            return true;
        }

        return true;
    }

    public function fetchAll(int $mode = PDO::FETCH_DEFAULT, mixed ...$args): array {
        if (stripos($this->sql, 'FROM admin_departments') !== false) {
            $out = [];
            foreach ($this->pdo->departments as $d) {
                $count = 0;
                foreach ($this->pdo->users as $u) {
                    if (($u['department_id'] ?? null) === $d['id']) $count++;
                }
                $d['members_count'] = $count;
                $out[] = $d;
            }
            return $out;
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
            $ids = $this->params;
            $out = [];
            foreach ($ids as $id) {
                if (isset($this->pdo->users[$id])) {
                    $u = $this->pdo->users[$id];
                    $roleId = $u['role_id'] ?? null;
                    $u['hierarchy_level'] = $this->pdo->roles[$roleId]['hierarchy_level'] ?? 5;
                    $out[] = $u;
                }
            }
            return $out;
        }

        if (stripos($this->sql, 'FROM gestor_agenda_shares') !== false) {
            $out = [];
            foreach ($this->pdo->agendaShares as $s) {
                $s['owner_username'] = $this->pdo->users[$s['owner_admin_id']]['username'] ?? 'User';
                $s['shared_with_username'] = $this->pdo->users[$s['shared_with_admin_id']]['username'] ?? 'User';
                $out[] = $s;
            }
            return $out;
        }

        if (stripos($this->sql, 'FROM gestor_agenda_events') !== false || stripos($this->sql, 'SELECT e.*') !== false) {
            $results = [];
            $curId = $this->params['cur_user_1'] ?? $this->params[':cur_user_1'] ?? null;
            $tgtId = $this->params['tgt_user_1'] ?? $this->params[':tgt_user_1'] ?? null;

            foreach ($this->pdo->agendaEvents as $evt) {
                $evt['created_by_name'] = $this->pdo->users[$evt['created_by_admin_id']]['username'] ?? 'Admin';
                $evt['assigned_to_name'] = $this->pdo->users[$evt['assigned_to_admin_id']]['username'] ?? null;
                $evt['updated_by_name'] = null;

                if ($curId !== null) {
                    if ((int)$evt['created_by_admin_id'] === (int)$curId || (int)$evt['assigned_to_admin_id'] === (int)$curId) {
                        $results[] = $evt;
                    }
                } elseif ($tgtId !== null) {
                    if ((int)$evt['created_by_admin_id'] === (int)$tgtId || (int)$evt['assigned_to_admin_id'] === (int)$tgtId) {
                        $results[] = $evt;
                    }
                } else {
                    $results[] = $evt;
                }
            }
            return $results;
        }

        if (stripos($this->sql, 'FROM gestor_agenda_event_participants') !== false) {
            $out = [];
            foreach ($this->pdo->eventParticipants as $p) {
                $p['username'] = $this->pdo->users[$p['admin_id']]['username'] ?? 'User';
                $out[] = $p;
            }
            return $out;
        }

        return [];
    }

    public function fetchColumn(int $column = 0): mixed { return 0; }
    public function fetch(int $mode = PDO::FETCH_DEFAULT, int $cursorOrientation = PDO::FETCH_ORI_NEXT, int $cursorOffset = 0): mixed {
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
        return false;
    }
}

$mockDb = new MockRbacPDO();
$rbacService = new RbacService($mockDb);
$agendaService = new AgendaService($mockDb);

$passed = 0;
$total = 6;

// [TEST 1] Listar Departamentos e Contagem de Membros
echo "[TEST 1] Listar Departamentos Oficiais e Membros... ";
$depts = $rbacService->listDepartments();
if (count($depts) === 3 && $depts[1]['members_count'] === 2) {
    echo "OK (3 Departamentos, Comercial com 2 membros)\n";
    $passed++;
} else {
    echo "FAIL: Estrutura de departamentos incorreta.\n";
}

// [TEST 2] Listar Roles com Matriz de Permissões
echo "[TEST 2] Listar Cargos e Matriz de Permissões Granulares... ";
$roles = $rbacService->listRoles();
if (count($roles) === 4 && isset($roles[0]['permissions']['agenda'])) {
    echo "OK (4 Roles mapeadas com permissões de módulo)\n";
    $passed++;
} else {
    echo "FAIL: Matriz de permissões não foi parseada.\n";
}

// [TEST 3] Hierarquia e Supervisão de Usuários
echo "[TEST 3] Verificação de Hierarquia e Gestão de Subordinados... ";
$canGerenteManageVendedora = $rbacService->canManageUser(2, 3); // Gerente Comercial -> Consultora Vendas (Nível 3 < Nível 4)
$canVendedoraManageGerente = $rbacService->canManageUser(3, 2); // Consultora Vendas -> Gerente (Nível 4 > Nível 3)
$canDiretoraManageAll = $rbacService->canManageUser(1, 4);      // Diretora Executiva -> Suporte (Nível 1)

if ($canGerenteManageVendedora === true && $canVendedoraManageGerente === false && $canDiretoraManageAll === true) {
    echo "OK (Supervisão por nível hierárquico validada com 100% de precisão)\n";
    $passed++;
} else {
    echo "FAIL: Falha na validação de supervisão hierárquica.\n";
}

// [TEST 4] Atribuição de Usuário a Departamento e Cargo
echo "[TEST 4] Atribuição de Usuário a Departamento e Supervisor... ";
$assignRes = $rbacService->assignUserRole(4, 4, 3, 1);
if ($assignRes['success'] && $mockDb->users[4]['department_id'] === 3) {
    echo "OK (Usuário #4 atribuído ao departamento Suporte sob supervisão da Diretora)\n";
    $passed++;
} else {
    echo "FAIL: Atribuição de usuário falhou.\n";
}

// [TEST 5] Isolamento de Agenda (Minha Agenda vs Toda a Equipe)
echo "[TEST 5] Isolamento de Agenda por Usuário (scope=mine vs scope=all)... ";
$myEvents = $agendaService->listEvents(['scope' => 'mine'], 3); // Ana Vendedora
$teamEvents = $agendaService->listEvents(['scope' => 'all'], 3);
if (count($myEvents) === 1 && count($teamEvents) === 2) {
    echo "OK (Minha Agenda: 1 evento próprio | Toda a Equipe: 2 eventos)\n";
    $passed++;
} else {
    echo "FAIL: count(myEvents)=" . count($myEvents) . ", count(teamEvents)=" . count($teamEvents) . "\n";
}

// [TEST 6] Compartilhamento de Agenda e Co-responsabilidade
echo "[TEST 6] Delegação de Agenda e Inclusão de Co-responsáveis... ";
$shareOk = $agendaService->shareAgenda(1, 2, 'can_edit');
$partOk = $agendaService->addEventParticipant(1, 3, 'co_responsible');
$shares = $agendaService->listAgendaShares(1);

if ($shareOk && $partOk && count($shares) === 1) {
    echo "OK (Agenda da Diretora compartilhada com Gerente e Consultora adicionada como Co-responsável)\n";
    $passed++;
} else {
    echo "FAIL: Delegação ou co-responsabilidade falhou.\n";
}

echo "\n-----------------------------------------------------------------\n";
if ($passed === $total) {
    echo "  ALL RBAC & MULTI-AGENDA SMOKE TESTS PASSED ($passed/$total) — 100% SUCCESS  \n";
} else {
    echo "  SOME TESTS FAILED ($passed/$total)\n";
    exit(1);
}
echo "-----------------------------------------------------------------\n";
