<?php
// apps/web-app/src/backend/api/v1/Services/RbacService.php

namespace BodyHarmony\Services;

use Exception;
use PDO;
use Throwable;

class RbacService {
    private mixed $db;

    public function __construct(mixed $db) {
        $this->db = $db;
        $this->ensureRbacTablesExist();
    }

    /**
     * Auto-heals and creates RBAC tables on initialization
     */
    public function ensureRbacTablesExist(): void {
        if (!is_object($this->db)) {
            return;
        }

        try {
            // 1. Departamentos
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `admin_departments` (
                  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `name` VARCHAR(100) NOT NULL,
                  `slug` VARCHAR(100) NOT NULL UNIQUE,
                  `description` TEXT NULL,
                  `color` VARCHAR(20) NOT NULL DEFAULT '#0A3E60',
                  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 2. Roles
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `admin_roles` (
                  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `department_id` INT UNSIGNED NOT NULL,
                  `name` VARCHAR(100) NOT NULL,
                  `slug` VARCHAR(100) NOT NULL,
                  `hierarchy_level` INT NOT NULL DEFAULT 4,
                  `permissions_json` JSON NULL,
                  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 3. Gestor Agenda Shares
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `gestor_agenda_shares` (
                  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `owner_admin_id` INT NOT NULL,
                  `shared_with_admin_id` INT NOT NULL,
                  `permission_level` ENUM('read_only', 'can_edit') NOT NULL DEFAULT 'read_only',
                  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE KEY `uq_agenda_share` (`owner_admin_id`, `shared_with_admin_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 4. Gestor Agenda Event Participants
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `gestor_agenda_event_participants` (
                  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `event_id` BIGINT UNSIGNED NOT NULL,
                  `admin_id` INT NOT NULL,
                  `role_type` ENUM('co_responsible', 'invited') NOT NULL DEFAULT 'co_responsible',
                  `status` ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'accepted',
                  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE KEY `uq_event_participant` (`event_id`, `admin_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

                        // 5. Auto-heal columns in admin_users and gestor_agenda_events
            $alterCols = [
                "ALTER TABLE `admin_users` ADD COLUMN `department_id` INT UNSIGNED NULL",
                "ALTER TABLE `admin_users` ADD COLUMN `role_id` INT UNSIGNED NULL",
                "ALTER TABLE `admin_users` ADD COLUMN `supervisor_id` INT NULL",
                "ALTER TABLE `admin_users` ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1",
                "ALTER TABLE `admin_users` ADD COLUMN `email` VARCHAR(191) NULL",
                "ALTER TABLE `admin_users` ADD COLUMN `has_custom_permissions` TINYINT(1) NOT NULL DEFAULT 0",
                "ALTER TABLE `admin_users` ADD COLUMN `custom_permissions_json` JSON NULL",
                "ALTER TABLE `gestor_agenda_events` ADD COLUMN `is_private` TINYINT(1) NOT NULL DEFAULT 0",
                "ALTER TABLE `gestor_agenda_events` ADD COLUMN `department_id` INT UNSIGNED NULL"
            ];
            foreach ($alterCols as $sql) {
                try {
                    $this->db->exec($sql);
                } catch (Throwable $eIgnore) {}
            }

            // 6. Default Seeds for Departments
            $this->db->exec("
                INSERT IGNORE INTO `admin_departments` (`id`, `name`, `slug`, `description`, `color`) VALUES
                (1, 'Diretoria & Presidência', 'diretoria', 'Gestão estratégica, expansão de franquias e homologações finais', '#0A3E60'),
                (2, 'Comercial & Vendas', 'comercial', 'Prospecção de candidatas, fechamento de franquias e credenciamento', '#ED7E13'),
                (3, 'Atendimento & Suporte', 'suporte', 'Suporte às licenciadas, dúvidas operacionais e relacionamento', '#10B981'),
                (4, 'Pedagógico & Treinamento', 'pedagogico', 'Gestão do LMS, cursos, aulas gravadas e materiais técnicos', '#8B5CF6')
            ");

            // 7. Default Seeds for Roles
            $this->db->exec("
                INSERT IGNORE INTO `admin_roles` (`id`, `department_id`, `name`, `slug`, `hierarchy_level`, `permissions_json`) VALUES
                (1, 1, 'Diretora Executiva', 'diretora-executiva', 1, '{\"agenda\": \"all\", \"onboarding\": \"manage\", \"contracts\": \"manage\", \"licenciadas\": \"manage\", \"financial\": \"manage\", \"rbac\": \"manage\"}'),
                (2, 1, 'Gerente Geral', 'gerente-geral', 2, '{\"agenda\": \"all\", \"onboarding\": \"manage\", \"contracts\": \"manage\", \"licenciadas\": \"manage\", \"financial\": \"manage\", \"rbac\": \"manage\"}'),
                (3, 2, 'Gerente Comercial', 'gerente-comercial', 3, '{\"agenda\": \"team\", \"onboarding\": \"manage\", \"contracts\": \"manage\", \"licenciadas\": \"view\", \"financial\": \"view\", \"rbac\": \"none\"}'),
                (4, 2, 'Consultora de Vendas', 'consultora-vendas', 4, '{\"agenda\": \"own\", \"onboarding\": \"manage\", \"contracts\": \"view\", \"licenciadas\": \"none\", \"financial\": \"none\", \"rbac\": \"none\"}'),
                (5, 3, 'Líder de Atendimento', 'lider-atendimento', 3, '{\"agenda\": \"team\", \"onboarding\": \"view\", \"contracts\": \"view\", \"licenciadas\": \"manage\", \"financial\": \"none\", \"rbac\": \"none\"}'),
                (6, 3, 'Atendente de Suporte', 'atendente-suporte', 5, '{\"agenda\": \"own\", \"onboarding\": \"none\", \"contracts\": \"none\", \"licenciadas\": \"view\", \"financial\": \"none\", \"rbac\": \"none\"}'),
                (7, 4, 'Coordenador Pedagógico', 'coordenador-pedagogico', 3, '{\"agenda\": \"team\", \"onboarding\": \"none\", \"contracts\": \"none\", \"licenciadas\": \"manage\", \"financial\": \"none\", \"rbac\": \"none\"}')
            ");

        } catch (Throwable $e) {
            error_log("Error in ensureRbacTablesExist: " . $e->getMessage());
        }
    }

    /**
     * Lists all departments with member count
     */
    public function listDepartments(): array {
        $sql = "
            SELECT d.*, COUNT(u.id) AS members_count
            FROM admin_departments d
            LEFT JOIN admin_users u ON u.department_id = d.id
            GROUP BY d.id
            ORDER BY d.id ASC
        ";
        $stmt = $this->db->query($sql);
        $depts = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        foreach ($depts as &$d) {
            $d['id'] = (int)$d['id'];
            $d['members_count'] = (int)($d['members_count'] ?? 0);
        }
        return $depts;
    }

    /**
     * Lists all roles with department info
     */
    public function listRoles(?int $departmentId = null): array {
        $sql = "
            SELECT r.*, d.name AS department_name, d.color AS department_color, d.slug AS department_slug
            FROM admin_roles r
            JOIN admin_departments d ON r.department_id = d.id
        ";
        $params = [];
        if ($departmentId !== null) {
            $sql .= " WHERE r.department_id = ?";
            $params[] = $departmentId;
        }
        $sql .= " ORDER BY r.hierarchy_level ASC, r.id ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($roles as &$r) {
            $r['id'] = (int)$r['id'];
            $r['department_id'] = (int)$r['department_id'];
            $r['hierarchy_level'] = (int)$r['hierarchy_level'];
            $r['permissions'] = !empty($r['permissions_json']) ? (is_array($r['permissions_json']) ? $r['permissions_json'] : json_decode($r['permissions_json'], true)) : [];
        }
        return $roles;
    }

    /**
     * Helper to resolve standard pages and actions from raw permissions
     */
    public function normalizePermissions(array|string|null $rawPerms, bool $isSuper = false): array {
        if ($isSuper) {
            return [
                'agenda_scope' => 'all',
                'pages' => [
                    'dashboard' => true,
                    'onboarding' => true,
                    'agenda' => true,
                    'contratos' => true,
                    'mensagens' => true,
                    'crm' => true,
                    'lms' => true,
                    'licenciadas' => true,
                    'alunas' => true,
                    'usuarios' => true,
                    'mentores' => true,
                    'financeiro' => true,
                    'shop' => true,
                    'textos' => true,
                    'aparencia' => true,
                    'visual_editor' => true,
                    'imagens' => true,
                    'resultados' => true,
                    'depoimentos' => true,
                    'leads' => true,
                    'faq' => true,
                    'configuracoes' => true,
                    'nexus' => true
                ],
                'actions' => [
                    'onboarding_create' => true,
                    'onboarding_approve' => true,
                    'onboarding_sandbox' => true,
                    'onboarding_delete' => true,
                    'contracts_create' => true,
                    'contracts_sign' => true,
                    'contracts_delete' => true,
                    'agenda_create' => true,
                    'agenda_scope' => 'all',
                    'lms_manage' => true,
                    'lms_hls_convert' => true,
                    'users_manage' => true,
                    'users_reset_password' => true,
                    'financial_view' => true,
                    'financial_manage' => true,
                    'financial_export' => true
                ]
            ];
        }

        $parsed = !empty($rawPerms) ? (is_array($rawPerms) ? $rawPerms : json_decode($rawPerms, true)) : [];
        if (!is_array($parsed)) $parsed = [];

        // If it already has pages & actions structure, merge with defaults
        if (isset($parsed['pages']) || isset($parsed['actions'])) {
            $pages = (array)($parsed['pages'] ?? []);
            $actions = (array)($parsed['actions'] ?? []);
            $scope = $parsed['agenda_scope'] ?? ($actions['agenda_scope'] ?? 'own');
            return [
                'agenda_scope' => $scope,
                'pages' => array_merge([
                    'dashboard' => true,
                    'onboarding' => false,
                    'agenda' => true,
                    'contratos' => false,
                    'mensagens' => false,
                    'lms' => false,
                    'licenciadas' => false,
                    'alunas' => false,
                    'usuarios' => false,
                    'mentores' => false,
                    'financeiro' => false,
                    'shop' => false,
                    'textos' => false,
                    'aparencia' => false,
                    'visual_editor' => false,
                    'imagens' => false,
                    'resultados' => false,
                    'depoimentos' => false,
                    'leads' => false,
                    'faq' => false,
                    'configuracoes' => false,
                    'nexus' => false
                ], $pages),
                'actions' => array_merge([
                    'onboarding_create' => false,
                    'onboarding_approve' => false,
                    'onboarding_sandbox' => false,
                    'onboarding_delete' => false,
                    'contracts_create' => false,
                    'contracts_sign' => false,
                    'contracts_delete' => false,
                    'agenda_create' => true,
                    'agenda_scope' => $scope,
                    'lms_manage' => false,
                    'lms_hls_convert' => false,
                    'users_manage' => false,
                    'users_reset_password' => false,
                    'financial_view' => false,
                    'financial_manage' => false,
                    'financial_export' => false
                ], $actions)
            ];
        }

        // Backward-compatibility: map legacy module strings (manage, view, all, team, own, none)
        $onboarding = $parsed['onboarding'] ?? 'none';
        $contracts = $parsed['contracts'] ?? 'none';
        $licenciadas = $parsed['licenciadas'] ?? 'none';
        $financial = $parsed['financial'] ?? 'none';
        $rbac = $parsed['rbac'] ?? 'none';
        $agenda = $parsed['agenda'] ?? 'own';

        return [
            'agenda_scope' => $agenda,
            'pages' => [
                'dashboard' => true,
                'onboarding' => $onboarding !== 'none',
                'agenda' => $agenda !== 'none',
                'contratos' => $contracts !== 'none',
                'mensagens' => in_array($onboarding, ['manage', 'view']) || in_array($contracts, ['manage', 'view']),
                'lms' => in_array($licenciadas, ['manage', 'view']),
                'licenciadas' => in_array($licenciadas, ['manage', 'view']),
                'alunas' => in_array($licenciadas, ['manage', 'view']),
                'usuarios' => $rbac === 'manage',
                'mentores' => in_array($licenciadas, ['manage', 'view']),
                'financeiro' => $financial !== 'none',
                'shop' => true,
                'textos' => $rbac === 'manage',
                'aparencia' => $rbac === 'manage',
                'visual_editor' => $rbac === 'manage',
                'imagens' => in_array($licenciadas, ['manage', 'view']) || $rbac === 'manage',
                'resultados' => true,
                'depoimentos' => true,
                'leads' => $onboarding !== 'none',
                'faq' => true,
                'configuracoes' => $rbac === 'manage',
                'nexus' => false
            ],
            'actions' => [
                'onboarding_create' => $onboarding === 'manage',
                'onboarding_approve' => $onboarding === 'manage',
                'onboarding_sandbox' => $onboarding === 'manage',
                'onboarding_delete' => $onboarding === 'manage',
                'contracts_create' => $contracts === 'manage',
                'contracts_sign' => $contracts === 'manage',
                'contracts_delete' => $contracts === 'manage',
                'agenda_create' => $agenda !== 'none',
                'agenda_scope' => $agenda,
                'lms_manage' => $licenciadas === 'manage',
                'lms_hls_convert' => $licenciadas === 'manage',
                'users_manage' => $rbac === 'manage',
                'users_reset_password' => $rbac === 'manage',
                'financial_view' => $financial !== 'none',
                'financial_manage' => $financial === 'manage',
                'financial_export' => in_array($financial, ['manage', 'view'], true)
            ]
        ];
    }

    /**
     * Lists all administrative users with their department, role, supervisor and effective permissions
     */
    public function listUsers(): array {
        $sql = "
            SELECT u.id, u.username, u.email, COALESCE(u.is_active, 1) AS is_active, u.role AS legacy_role, 
                   u.department_id, u.role_id, u.supervisor_id, u.created_at,
                   COALESCE(u.has_custom_permissions, 0) AS has_custom_permissions, u.custom_permissions_json,
                   d.name AS department_name, d.color AS department_color,
                   r.name AS role_name, r.slug AS role_slug, r.hierarchy_level, r.permissions_json AS role_permissions_json,
                   s.username AS supervisor_name
            FROM admin_users u
            LEFT JOIN admin_departments d ON u.department_id = d.id
            LEFT JOIN admin_roles r ON u.role_id = r.id
            LEFT JOIN admin_users s ON u.supervisor_id = s.id
            ORDER BY COALESCE(r.hierarchy_level, 99) ASC, u.id ASC
        ";
        $stmt = $this->db->query($sql);
        $users = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

        foreach ($users as &$u) {
            $u['id'] = (int)$u['id'];
            $u['is_active'] = (int)$u['is_active'];
            $u['has_custom_permissions'] = (int)$u['has_custom_permissions'];
            $u['department_id'] = $u['department_id'] ? (int)$u['department_id'] : null;
            $u['role_id'] = $u['role_id'] ? (int)$u['role_id'] : null;
            $u['supervisor_id'] = $u['supervisor_id'] ? (int)$u['supervisor_id'] : null;
            $isSuper = ($u['legacy_role'] === 'superadmin' || (int)($u['hierarchy_level'] ?? 99) === 1);
            $u['hierarchy_level'] = $isSuper ? 1 : ((int)($u['hierarchy_level'] ?? ($u['legacy_role'] === 'admin' ? 2 : 4)));
            
            $rawPerms = ($u['has_custom_permissions'] === 1 && !empty($u['custom_permissions_json']))
                ? $u['custom_permissions_json']
                : ($u['role_permissions_json'] ?? null);

            $u['permissions'] = $this->normalizePermissions($rawPerms, $isSuper);
        }
        return $users;
    }

    /**
     * Assigns role, department and supervisor to an admin user
     */
    public function assignUserRole(int $adminId, ?int $roleId, ?int $departmentId, ?int $supervisorId = null): array {
        $stmt = $this->db->prepare("
            UPDATE admin_users 
            SET role_id = ?, department_id = ?, supervisor_id = ?
            WHERE id = ?
        ");
        $stmt->execute([$roleId, $departmentId, $supervisorId, $adminId]);

        return [
            'success' => true,
            'message' => "Perfil do usuário #{$adminId} atualizado com sucesso!"
        ];
    }

    /**
     * Checks if manager can supervise / manage target user
     */
    public function canManageUser(int $managerId, int $targetId): bool {
        if ($managerId === $targetId) return true;

        $stmt = $this->db->prepare("
            SELECT u.id, u.role AS legacy_role, r.hierarchy_level, u.department_id, u.supervisor_id
            FROM admin_users u
            LEFT JOIN admin_roles r ON u.role_id = r.id
            WHERE u.id IN (?, ?)
        ");
        $stmt->execute([$managerId, $targetId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $manager = null;
        $target = null;
        foreach ($rows as $row) {
            if ((int)$row['id'] === $managerId) $manager = $row;
            if ((int)$row['id'] === $targetId) $target = $row;
        }

        if (!$manager || !$target) return false;

        // Superadmin legacy or hierarchy level 1
        if (($manager['legacy_role'] ?? '') === 'superadmin' || ((int)($manager['hierarchy_level'] ?? 99) === 1)) {
            return true;
        }

        $mgrLevel = (int)($manager['hierarchy_level'] ?? ($manager['legacy_role'] === 'admin' ? 2 : 5));
        $tgtLevel = (int)($target['hierarchy_level'] ?? ($target['legacy_role'] === 'admin' ? 2 : 5));

        // Direct supervisor
        if ((int)($target['supervisor_id'] ?? 0) === $managerId) {
            return true;
        }

        // Higher hierarchy in same department or general admin
        if ($mgrLevel < $tgtLevel) {
            if ($mgrLevel <= 2) return true;
            return ((int)($manager['department_id'] ?? 0) === (int)($target['department_id'] ?? 0));
        }

        return false;
    }

    /**
     * Gets user permissions array
     */
    public function getUserPermissions(int $adminId): array {
        $stmt = $this->db->prepare("
            SELECT u.id, u.username, u.email, u.role AS legacy_role, u.department_id, u.role_id,
                   COALESCE(u.has_custom_permissions, 0) AS has_custom_permissions, u.custom_permissions_json,
                   d.name AS department_name, d.slug AS department_slug,
                   r.name AS role_name, r.hierarchy_level, r.permissions_json AS role_permissions_json
            FROM admin_users u
            LEFT JOIN admin_departments d ON u.department_id = d.id
            LEFT JOIN admin_roles r ON u.role_id = r.id
            WHERE u.id = ? LIMIT 1
        ");
        $stmt->execute([$adminId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return [
                'id' => 0,
                'username' => '',
                'is_superadmin' => false,
                'hierarchy_level' => 99,
                'has_custom_permissions' => 0,
                'permissions' => $this->normalizePermissions(null, false)
            ];
        }

        $isSuper = ($user['legacy_role'] === 'superadmin' || (int)($user['hierarchy_level'] ?? 99) === 1);
        $level = $isSuper ? 1 : (int)($user['hierarchy_level'] ?? ($user['legacy_role'] === 'admin' ? 2 : 4));
        $hasCustom = (int)($user['has_custom_permissions'] ?? 0);

        $rawPerms = ($hasCustom === 1 && !empty($user['custom_permissions_json']))
            ? $user['custom_permissions_json']
            : ($user['role_permissions_json'] ?? null);

        $perms = $this->normalizePermissions($rawPerms, $isSuper);

        return [
            'id' => (int)$user['id'],
            'username' => $user['username'],
            'email' => $user['email'] ?? null,
            'is_superadmin' => $isSuper,
            'department_id' => $user['department_id'] ? (int)$user['department_id'] : null,
            'department_name' => $user['department_name'] ?? 'Geral',
            'role_id' => $user['role_id'] ? (int)$user['role_id'] : null,
            'role_name' => $user['role_name'] ?? ($isSuper ? 'Superadministrador' : 'Administrador'),
            'hierarchy_level' => $level,
            'has_custom_permissions' => $hasCustom,
            'pages' => $perms['pages'] ?? [],
            'actions' => $perms['actions'] ?? [],
            'agenda_scope' => $perms['agenda_scope'] ?? 'own',
            'permissions' => $perms
        ];
    }

    /**
     * Updates permissions matrix for a specific role
     */
    public function updateRolePermissions(int $roleId, array $permissions): array {
        if ($roleId <= 0) {
            throw new Exception("ID de cargo inválido.");
        }
        $json = json_encode($permissions, JSON_UNESCAPED_UNICODE);
        $stmt = $this->db->prepare("UPDATE admin_roles SET permissions_json = ? WHERE id = ?");
        $stmt->execute([$json, $roleId]);

        return [
            'success' => true,
            'message' => "Permissões do cargo #{$roleId} atualizadas com sucesso!"
        ];
    }

    /**
     * Updates custom permissions for a specific user (Modo Alternado: Cargo vs Customizado)
     */
    public function updateUserPermissions(int $userId, array $permissions, int $hasCustom = 1): array {
        if ($userId <= 0) {
            throw new Exception("ID de usuário inválido.");
        }
        $json = ($hasCustom === 1) ? json_encode($permissions, JSON_UNESCAPED_UNICODE) : null;
        $stmt = $this->db->prepare("
            UPDATE admin_users 
            SET has_custom_permissions = ?, custom_permissions_json = ?
            WHERE id = ?
        ");
        $stmt->execute([$hasCustom, $json, $userId]);

        return [
            'success' => true,
            'message' => ($hasCustom === 1) 
                ? "Permissões personalizadas do usuário #{$userId} salvas com sucesso!"
                : "Usuário #{$userId} reconfigurado para herdar as permissões do Cargo padrão."
        ];
    }

    /**
     * Creates a new administrative user with hashed password and RBAC assignments
     */
    public function createUser(array $data, ?int $operatorId = null): array {
        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';
        $email = !empty($data['email']) ? trim($data['email']) : null;
        $departmentId = !empty($data['department_id']) ? (int)$data['department_id'] : null;
        $roleId = !empty($data['role_id']) ? (int)$data['role_id'] : null;
        $supervisorId = !empty($data['supervisor_id']) ? (int)$data['supervisor_id'] : null;
        $role = !empty($data['role']) ? trim($data['role']) : 'admin';
        $isActive = isset($data['is_active']) ? (int)$data['is_active'] : 1;
        $hasCustom = isset($data['has_custom_permissions']) ? (int)$data['has_custom_permissions'] : 0;
        $customPerms = !empty($data['custom_permissions_json']) 
            ? (is_string($data['custom_permissions_json']) ? $data['custom_permissions_json'] : json_encode($data['custom_permissions_json'], JSON_UNESCAPED_UNICODE))
            : null;

        if (empty($username)) {
            throw new Exception("O nome de usuário (login) é obrigatório.");
        }
        if (empty($password) || strlen($password) < 6) {
            throw new Exception("A senha deve conter no mínimo 6 caracteres.");
        }

        // Check if username already exists
        $stmt = $this->db->prepare("SELECT id FROM admin_users WHERE username = ? LIMIT 1");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            throw new Exception("Já existe um usuário com o login '{$username}'.");
        }

        // Determine legacy role from role_id if provided
        if ($roleId) {
            $rStmt = $this->db->prepare("SELECT hierarchy_level FROM admin_roles WHERE id = ?");
            $rStmt->execute([$roleId]);
            $rData = $rStmt->fetch(PDO::FETCH_ASSOC);
            if ($rData && (int)$rData['hierarchy_level'] === 1) {
                $role = 'superadmin';
            }
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);

        $insertSql = "
            INSERT INTO admin_users (username, password_hash, email, role, department_id, role_id, supervisor_id, is_active, has_custom_permissions, custom_permissions_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ";
        $insertStmt = $this->db->prepare($insertSql);
        $insertStmt->execute([$username, $hash, $email, $role, $departmentId, $roleId, $supervisorId, $isActive, $hasCustom, $customPerms]);
        $newId = (int)$this->db->lastInsertId();

        return [
            'success' => true,
            'message' => "Usuário '{$username}' criado com sucesso!",
            'user_id' => $newId
        ];
    }

    /**
     * Updates an existing admin user's details, role, department or supervisor
     */
    public function updateUser(int $userId, array $data, ?int $operatorId = null): array {
        if ($userId <= 0) {
            throw new Exception("ID de usuário inválido.");
        }

        // Check if user exists
        $stmt = $this->db->prepare("SELECT id, username, role, is_active FROM admin_users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$existing) {
            throw new Exception("Usuário #{$userId} não encontrado.");
        }

        $fields = [];
        $params = [];

        if (isset($data['username']) && trim($data['username']) !== '') {
            $newUsername = trim($data['username']);
            // Check uniqueness
            $checkStmt = $this->db->prepare("SELECT id FROM admin_users WHERE username = ? AND id != ? LIMIT 1");
            $checkStmt->execute([$newUsername, $userId]);
            if ($checkStmt->fetch()) {
                throw new Exception("Já existe outro usuário com o login '{$newUsername}'.");
            }
            $fields[] = "username = ?";
            $params[] = $newUsername;
        }

        if (array_key_exists('email', $data)) {
            $fields[] = "email = ?";
            $params[] = !empty($data['email']) ? trim($data['email']) : null;
        }

        if (array_key_exists('password', $data) && !empty($data['password'])) {
            if (strlen((string)$data['password']) < 6) {
                throw new Exception("A nova senha deve ter no mínimo 6 caracteres.");
            }
            $fields[] = "password_hash = ?";
            $params[] = password_hash((string)$data['password'], PASSWORD_DEFAULT);
        }

        if (array_key_exists('department_id', $data)) {
            $fields[] = "department_id = ?";
            $params[] = !empty($data['department_id']) ? (int)$data['department_id'] : null;
        }

        if (array_key_exists('role_id', $data)) {
            $roleId = !empty($data['role_id']) ? (int)$data['role_id'] : null;
            $fields[] = "role_id = ?";
            $params[] = $roleId;

            if ($roleId) {
                $rStmt = $this->db->prepare("SELECT hierarchy_level FROM admin_roles WHERE id = ?");
                $rStmt->execute([$roleId]);
                $rData = $rStmt->fetch(PDO::FETCH_ASSOC);
                if ($rData && (int)$rData['hierarchy_level'] === 1) {
                    $fields[] = "role = ?";
                    $params[] = 'superadmin';
                }
            }
        }

        if (array_key_exists('supervisor_id', $data)) {
            $fields[] = "supervisor_id = ?";
            $params[] = !empty($data['supervisor_id']) ? (int)$data['supervisor_id'] : null;
        }

        if (array_key_exists('has_custom_permissions', $data)) {
            $fields[] = "has_custom_permissions = ?";
            $params[] = (int)$data['has_custom_permissions'];
        }

        if (array_key_exists('custom_permissions_json', $data)) {
            $fields[] = "custom_permissions_json = ?";
            $customVal = !empty($data['custom_permissions_json'])
                ? (is_string($data['custom_permissions_json']) ? $data['custom_permissions_json'] : json_encode($data['custom_permissions_json'], JSON_UNESCAPED_UNICODE))
                : null;
            $params[] = $customVal;
        }

        if (array_key_exists('is_active', $data)) {
            $isActive = (int)$data['is_active'];
            // Guard against self deactivation
            if ($operatorId && $operatorId === $userId && $isActive === 0) {
                throw new Exception("Você não pode desativar seu próprio usuário.");
            }
            $fields[] = "is_active = ?";
            $params[] = $isActive;
        }

        if (empty($fields)) {
            return ['success' => true, 'message' => "Nenhum campo para atualizar."];
        }

        $params[] = $userId;
        $sql = "UPDATE admin_users SET " . implode(", ", $fields) . " WHERE id = ?";
        $updateStmt = $this->db->prepare($sql);
        $updateStmt->execute($params);

        return [
            'success' => true,
            'message' => "Dados do usuário atualizados com sucesso!"
        ];
    }

    /**
     * Resets a user's password
     */
    public function resetUserPassword(int $userId, string $newPassword, ?int $operatorId = null): array {
        if ($userId <= 0) {
            throw new Exception("ID de usuário inválido.");
        }
        if (empty($newPassword) || strlen($newPassword) < 6) {
            throw new Exception("A nova senha deve ter no mínimo 6 caracteres.");
        }

        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$hash, $userId]);

        return [
            'success' => true,
            'message' => "Senha redefinida com sucesso!"
        ];
    }

    /**
     * Toggles user active/inactive status
     */
    public function toggleUserStatus(int $userId, ?int $operatorId = null): array {
        if ($userId <= 0) {
            throw new Exception("ID de usuário inválido.");
        }
        if ($operatorId && $operatorId === $userId) {
            throw new Exception("Você não pode desativar seu próprio usuário.");
        }

        $stmt = $this->db->prepare("SELECT is_active, username FROM admin_users WHERE id = ?");
        $stmt->execute([$userId]);
        $u = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$u) {
            throw new Exception("Usuário não encontrado.");
        }

        $newStatus = ((int)($u['is_active'] ?? 1) === 1) ? 0 : 1;
        $upd = $this->db->prepare("UPDATE admin_users SET is_active = ? WHERE id = ?");
        $upd->execute([$newStatus, $userId]);

        $statusText = $newStatus === 1 ? 'ativado' : 'desativado';
        return [
            'success' => true,
            'is_active' => $newStatus,
            'message' => "Usuário '{$u['username']}' foi {$statusText} com sucesso!"
        ];
    }
}
