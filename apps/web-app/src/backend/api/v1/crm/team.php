<?php
// apps/web-app/src/backend/api/v1/crm/team.php
// CRM V4 Dynamic Team & Portal Gestor Users Provider (PLAN-190)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $team = [];

    if ($dbConn) {
        // Buscar usuários do sistema (admin_users) com suas roles
        try {
            $stmt = $dbConn->query("
                SELECT u.id, u.username, u.email, u.is_active,
                       COALESCE(r.name, 'Atendente') as role_name
                FROM admin_users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.is_active = 1
                ORDER BY u.id ASC
            ");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Mapeamento de linhas padrão e cores por username/cargo
            $lineMapping = [
                'guilherme' => ['title' => 'Jurídico, Finanças & Suporte', 'line' => 'Linha 02 — Jurídico & Finanças', 'color' => '#8B5CF6'],
                'giovanna'  => ['title' => 'Vendas & Comercial VIP', 'line' => 'Linha 03 — Vendas & Comercial', 'color' => '#ED7E13'],
                'cibele'    => ['title' => 'Recepção, Clínica & Acolhimento', 'line' => 'Linha 01 — Clínica & Pacientes', 'color' => '#0A3E60'],
                'admin'     => ['title' => 'Administrador Geral', 'line' => 'Todas as Linhas', 'color' => '#0A3E60']
            ];

            foreach ($users as $u) {
                $usr = strtolower($u['username']);
                $meta = $lineMapping[$usr] ?? [
                    'title' => $u['role_name'] ?: 'Especialista de Atendimento',
                    'line' => 'Linha Geral',
                    'color' => '#0A3E60'
                ];

                $team[] = [
                    'id' => (string)$u['id'],
                    'username' => $u['username'],
                    'name' => ucfirst($u['username']),
                    'email' => $u['email'] ?? '',
                    'roleDescription' => $meta['title'],
                    'accentColor' => $meta['color'],
                    'accentBg' => 'rgba(10, 62, 96, 0.1)',
                    'status' => 'ONLINE',
                    'primaryLine' => $meta['line'],
                    'isSupervisor' => ($usr === 'guilherme' || $usr === 'admin' || stripos($u['role_name'], 'admin') !== false)
                ];
            }
        } catch (\Throwable $e) {
            error_log("[TEAM_FETCH_WARN] " . $e->getMessage());
        }
    }

    if (empty($team)) {
        // Fallback robusto se a tabela admin_users não for acessível
        $team = [
            [
                'id' => '1',
                'username' => 'guilherme',
                'name' => 'Guilherme',
                'roleDescription' => 'Admin • Jurídico, Finanças & Suporte',
                'accentColor' => '#8B5CF6',
                'accentBg' => 'rgba(139, 92, 246, 0.1)',
                'status' => 'ONLINE',
                'primaryLine' => 'Linha 02 — Jurídico & Finanças',
                'isSupervisor' => true
            ],
            [
                'id' => '2',
                'username' => 'giovanna',
                'name' => 'Giovanna',
                'roleDescription' => 'Especialista em Vendas & Cursos VIP',
                'accentColor' => '#ED7E13',
                'accentBg' => 'rgba(237, 126, 19, 0.1)',
                'status' => 'ONLINE',
                'primaryLine' => 'Linha 03 — Vendas & Comercial',
                'isSupervisor' => false
            ],
            [
                'id' => '3',
                'username' => 'cibele',
                'name' => 'Cibele',
                'roleDescription' => 'Recepção, Clínica & Acolhimento',
                'accentColor' => '#0A3E60',
                'accentBg' => 'rgba(10, 62, 96, 0.1)',
                'status' => 'ONLINE',
                'primaryLine' => 'Linha 01 — Clínica & Pacientes',
                'isSupervisor' => false
            ]
        ];
    }

    echo json_encode([
        'success' => true,
        'attendants' => $team
    ]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
