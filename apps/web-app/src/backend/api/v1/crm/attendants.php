<?php
// apps/web-app/src/backend/api/v1/crm/attendants.php
// CRM V4 Attendant & Line Routing Management Endpoint (Nexus Protocol V4.0 / PLAN-183)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    // -------------------------------------------------------------------------
    // GET: LISTAR ATENDENTES E MATRIZ DE LINHAS
    // -------------------------------------------------------------------------
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $attendants = [];

        if ($dbConn) {
            // Garantir que a tabela existe
            $dbConn->exec("
                CREATE TABLE IF NOT EXISTS `crm_attendant_lines` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `username` VARCHAR(100) NOT NULL UNIQUE,
                    `name` VARCHAR(150) NOT NULL,
                    `email` VARCHAR(150) NULL,
                    `role` ENUM('ADMIN', 'SUPERVISOR', 'ATTENDANT') NOT NULL DEFAULT 'ATTENDANT',
                    `primary_line` ENUM('CLINICA', 'JURIDICO', 'VENDAS', 'SUPORTE', 'ALL') NOT NULL DEFAULT 'CLINICA',
                    `allowed_lines_json` JSON NOT NULL,
                    `status` ENUM('ONLINE', 'BUSY', 'OFFLINE') NOT NULL DEFAULT 'ONLINE',
                    `can_transfer` TINYINT(1) NOT NULL DEFAULT 1,
                    `can_view_reports` TINYINT(1) NOT NULL DEFAULT 0,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");

            $stmt = $dbConn->query("SELECT * FROM crm_attendant_lines ORDER BY id ASC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rows as $r) {
                $allowed = json_decode($r['allowed_lines_json'] ?? '[]', true) ?: [];
                $attendants[] = [
                    'id' => (string)$r['id'],
                    'username' => $r['username'],
                    'name' => $r['name'],
                    'email' => $r['email'],
                    'role' => $r['role'],
                    'primaryLine' => $r['primary_line'],
                    'allowedLines' => $allowed,
                    'status' => $r['status'],
                    'canTransfer' => (bool)$r['can_transfer'],
                    'canViewReports' => (bool)$r['can_view_reports']
                ];
            }
        }

        // Fallback defensivo com as 3 personas principais se a tabela estiver vazia
        if (empty($attendants)) {
            $attendants = [
                [
                    'id' => '1',
                    'username' => 'guilherme',
                    'name' => 'Guilherme (Jurídico & Suporte Licenciadas)',
                    'email' => 'guilherme@bodyharmony.com.br',
                    'role' => 'ADMIN',
                    'primaryLine' => 'JURIDICO',
                    'operationalLines' => ['JURIDICO', 'SUPORTE'],
                    'allowedLines' => ['CLINICA', 'JURIDICO', 'VENDAS', 'SUPORTE'],
                    'status' => 'ONLINE',
                    'canTransfer' => true,
                    'canViewReports' => true
                ],

                [
                    'id' => '2',
                    'username' => 'giovanna',
                    'name' => 'Giovanna (Vendas & Cursos VIP)',
                    'email' => 'giovanna@bodyharmony.com.br',
                    'role' => 'ATTENDANT',
                    'primaryLine' => 'VENDAS',
                    'allowedLines' => ['VENDAS'],
                    'status' => 'ONLINE',
                    'canTransfer' => true,
                    'canViewReports' => false
                ],
                [
                    'id' => '3',
                    'username' => 'cibele',
                    'name' => 'Cibele (Clínica & Acolhimento)',
                    'email' => 'cibele@bodyharmony.com.br',
                    'role' => 'ATTENDANT',
                    'primaryLine' => 'CLINICA',
                    'allowedLines' => ['CLINICA'],
                    'status' => 'ONLINE',
                    'canTransfer' => true,
                    'canViewReports' => false
                ]
            ];
        }

        // Se for solicitado o perfil do atendente logado (?action=me)
        if ((isset($_GET['action']) && $_GET['action'] === 'me') || isset($_GET['me'])) {
            $currentUsername = $_SESSION['username'] ?? $_SESSION['user']['username'] ?? (is_string($_SESSION['user'] ?? null) ? $_SESSION['user'] : 'guilherme');
            
            $me = null;
            foreach ($attendants as $att) {
                if (strtolower($att['username']) === strtolower($currentUsername)) {
                    $me = $att;
                    break;
                }
            }
            
            if (!$me) {
                $me = $attendants[0]; // fallback seguro para admin
            }

            echo json_encode([
                'success' => true,
                'me' => $me
            ]);
            exit;
        }

        echo json_encode([
            'success' => true,
            'attendants' => $attendants
        ]);
        exit;
    }

    // -------------------------------------------------------------------------
    // POST: ATUALIZAR REGRAS DE ROTEAMENTO OU STATUS DE UM ATENDENTE
    // -------------------------------------------------------------------------
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?: [];

        $username = $data['username'] ?? '';
        $primaryLine = $data['primary_line'] ?? 'CLINICA';
        $allowedLines = $data['allowed_lines'] ?? [$primaryLine];
        $status = $data['status'] ?? 'ONLINE';

        if (empty($username)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Username obrigatório.']);
            exit;
        }

        if ($dbConn) {
            $stmt = $dbConn->prepare("
                UPDATE crm_attendant_lines
                SET primary_line = :primary_line,
                    allowed_lines_json = :allowed,
                    status = :status
                WHERE username = :username
            ");
            $stmt->execute([
                ':primary_line' => $primaryLine,
                ':allowed' => json_encode($allowedLines),
                ':status' => $status,
                ':username' => $username
            ]);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Configurações de atendente atualizadas com sucesso.'
        ]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao processar atendentes: ' . $e->getMessage()
    ]);
}
