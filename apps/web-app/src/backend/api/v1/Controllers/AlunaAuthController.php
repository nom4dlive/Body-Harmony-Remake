<?php
// api/v1/Controllers/AlunaAuthController.php
// V68 — Portal Aluna Individual

require_once __DIR__ . '/../libs/LoggerService.php';

class AlunaAuthController {
    private $pdo;
    private $logger;

    public function __construct() {
        global $pdo;
        $this->pdo    = $pdo;
        $this->logger = new LoggerService($pdo);
    }

    // ----------------------------------------------------------------
    // POST /v1/auth/aluna/login
    // ----------------------------------------------------------------
    public function login() {
        $input    = json_decode(file_get_contents('php://input'), true);
        $login    = trim($input['login']    ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($login) || empty($password)) {
            Response::error('Login e senha são obrigatórios.', 400);
        }

        // Busca por CPF primeiro (11 dígitos numéricos), depois por e-mail
        $loginClean = preg_replace('/\D/', '', $login);
        $aluna      = null;

        if (strlen($loginClean) === 11) {
            $stmt = $this->pdo->prepare(
                "SELECT * FROM alunas WHERE cpf = ? AND is_active = 1 LIMIT 1"
            );
            $stmt->execute([$loginClean]);
            $aluna = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        if (!$aluna) {
            $stmt = $this->pdo->prepare(
                "SELECT * FROM alunas WHERE email = ? AND is_active = 1 LIMIT 1"
            );
            $stmt->execute([$login]);
            $aluna = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        if (!$aluna) {
            Response::error('Dados de acesso não conferem.', 401, 'INVALID_CREDENTIALS');
        }

        // Lockout check
        if (!empty($aluna['locked_until']) && strtotime($aluna['locked_until']) > time()) {
            Response::error('Conta bloqueada temporariamente por excesso de tentativas.', 429, 'ACCOUNT_LOCKED');
        }

        // Verifica senha
        if (!password_verify($password, $aluna['password_hash'])) {
            $attempts = ($aluna['failed_login_attempts'] ?? 0) + 1;
            if ($attempts >= 5) {
                $lockedUntil = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                $this->pdo->prepare(
                    "UPDATE alunas SET failed_login_attempts = ?, locked_until = ? WHERE id = ?"
                )->execute([$attempts, $lockedUntil, $aluna['id']]);
            } else {
                $this->pdo->prepare(
                    "UPDATE alunas SET failed_login_attempts = ? WHERE id = ?"
                )->execute([$attempts, $aluna['id']]);
            }
            Response::error('Dados de acesso não conferem.', 401, 'INVALID_CREDENTIALS');
        }

        // Reset contadores de falha
        if (($aluna['failed_login_attempts'] ?? 0) > 0) {
            $this->pdo->prepare(
                "UPDATE alunas SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?"
            )->execute([$aluna['id']]);
        }

        // Gerencia dispositivo (FIFO limitado a max_devices)
        $currentIp   = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
        $userAgent   = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        $clientToken = $input['device_token'] ?? null;
        $limit       = $aluna['max_devices'] ?? 1;

        // Verifica se já existe token para este dispositivo
        $existingDevice = null;
        if ($clientToken) {
            $stmtDev = $this->pdo->prepare(
                "SELECT * FROM aluna_devices WHERE aluna_id = ? AND device_token = ?"
            );
            $stmtDev->execute([$aluna['id'], $clientToken]);
            $existingDevice = $stmtDev->fetch(PDO::FETCH_ASSOC);
        }

        if ($existingDevice) {
            // Reutiliza dispositivo existente
            $newToken = $clientToken;
            $this->pdo->prepare(
                "UPDATE aluna_devices SET last_used_at = NOW(), is_active = 1, ip_address = ?, user_agent = ? WHERE id = ?"
            )->execute([$currentIp, $userAgent, $existingDevice['id']]);
        } else {
            // Novo dispositivo: verificar limite FIFO
            $stmtCount = $this->pdo->prepare(
                "SELECT COUNT(*) FROM aluna_devices WHERE aluna_id = ? AND is_active = 1"
            );
            $stmtCount->execute([$aluna['id']]);
            $activeCount = (int)$stmtCount->fetchColumn();

            while ($activeCount >= $limit) {
                $stmtOldest = $this->pdo->prepare(
                    "SELECT id FROM aluna_devices WHERE aluna_id = ? AND is_active = 1 ORDER BY last_used_at ASC LIMIT 1"
                );
                $stmtOldest->execute([$aluna['id']]);
                $oldestId = $stmtOldest->fetchColumn();
                if ($oldestId) {
                    $this->pdo->prepare(
                        "UPDATE aluna_devices SET is_active = 0 WHERE id = ?"
                    )->execute([$oldestId]);
                    $activeCount--;
                } else {
                    break;
                }
            }

            $newToken = 'al_' . bin2hex(random_bytes(30));
            $this->pdo->prepare(
                "INSERT INTO aluna_devices (aluna_id, device_token, user_agent, ip_address, is_active, last_used_at)
                 VALUES (?, ?, ?, ?, 1, NOW())"
            )->execute([$aluna['id'], $newToken, $userAgent, $currentIp]);
        }

        // Atualiza last_login
        $this->pdo->prepare("UPDATE alunas SET last_login_at = NOW() WHERE id = ?")
                  ->execute([$aluna['id']]);

        unset($aluna['password_hash']);

        Response::json([
            'success'      => true,
            'aluna'        => $aluna,
            'token'        => $newToken,
            'device_token' => $newToken,
            'forceChange'  => (bool)$aluna['force_password_change'],
            'message'      => 'Login realizado com sucesso.'
        ]);
    }

    // ----------------------------------------------------------------
    // GET /v1/auth/aluna/validate
    // ----------------------------------------------------------------
    public function validate() {
        $headers     = getallheaders_robust();
        $deviceToken = $headers['X-ALUNA-TOKEN'] ?? $headers['X-Device-Token'] ?? null;

        if (!$deviceToken) {
            Response::error('Token ausente.', 401);
        }

        // Token de aluna deve começar com 'al_'
        if (strpos($deviceToken, 'al_') !== 0) {
            Response::error('Token inválido para este portal.', 401);
        }

        $stmt = $this->pdo->prepare("
            SELECT d.*, a.id as aluna_id, a.name, a.email, a.cpf, a.is_active, a.force_password_change
            FROM aluna_devices d
            INNER JOIN alunas a ON d.aluna_id = a.id
            WHERE d.device_token = ? AND d.is_active = 1
        ");
        $stmt->execute([$deviceToken]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data || !$data['is_active']) {
            Response::error('Sessão inválida ou expirada.', 401);
        }

        $this->pdo->prepare("UPDATE aluna_devices SET last_used_at = NOW() WHERE device_token = ?")
                  ->execute([$deviceToken]);

        Response::json([
            'success' => true,
            'aluna'   => [
                'id'                    => $data['aluna_id'],
                'name'                  => $data['name'],
                'email'                 => $data['email'],
                'cpf'                   => $data['cpf'],
                'force_password_change' => (bool)$data['force_password_change'],
            ],
            'valid' => true
        ]);
    }

    // ----------------------------------------------------------------
    // POST /v1/auth/aluna/change_password
    // ----------------------------------------------------------------
    public function changePassword() {
        $input           = json_decode(file_get_contents('php://input'), true);
        $currentPassword = $input['current_password'] ?? '';
        $newPassword     = $input['new_password']     ?? '';

        $headers     = getallheaders_robust();
        $deviceToken = $headers['X-ALUNA-TOKEN'] ?? $headers['X-Device-Token'] ?? null;

        if (!$deviceToken || strpos($deviceToken, 'al_') !== 0) {
            Response::error('Token inválido.', 401);
        }

        $stmtDev = $this->pdo->prepare(
            "SELECT aluna_id FROM aluna_devices WHERE device_token = ? AND is_active = 1"
        );
        $stmtDev->execute([$deviceToken]);
        $alunaId = $stmtDev->fetchColumn();

        if (!$alunaId) {
            Response::error('Sessão inválida.', 401);
        }

        $stmt  = $this->pdo->prepare("SELECT * FROM alunas WHERE id = ?");
        $stmt->execute([$alunaId]);
        $aluna = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$aluna || !password_verify($currentPassword, $aluna['password_hash'])) {
            Response::error('Senha atual incorreta.', 400);
        }

        if (strlen($newPassword) < 6) {
            Response::error('A nova senha deve ter pelo menos 6 caracteres.', 400);
        }

        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $this->pdo->prepare(
            "UPDATE alunas SET password_hash = ?, force_password_change = 0 WHERE id = ?"
        )->execute([$newHash, $alunaId]);

        Response::json(['success' => true, 'message' => 'Senha alterada com sucesso.']);
    }

    // ----------------------------------------------------------------
    // POST /v1/auth/aluna/first-access
    // ----------------------------------------------------------------
    public function firstAccess() {
        $input       = json_decode(file_get_contents('php://input'), true);
        $newPassword = $input['new_password'] ?? '';

        $headers     = getallheaders_robust();
        $deviceToken = $headers['X-ALUNA-TOKEN'] ?? $headers['X-Device-Token'] ?? null;

        if (!$deviceToken || strpos($deviceToken, 'al_') !== 0) {
            Response::error('Token inválido.', 401);
        }

        $stmtDev = $this->pdo->prepare(
            "SELECT aluna_id FROM aluna_devices WHERE device_token = ?"
        );
        $stmtDev->execute([$deviceToken]);
        $alunaId = $stmtDev->fetchColumn();

        if (!$alunaId) {
            Response::error('Sessão inválida.', 401);
        }

        if (strlen($newPassword) < 6) {
            Response::error('A nova senha deve ter pelo menos 6 caracteres.', 400);
        }

        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $this->pdo->prepare(
            "UPDATE alunas SET password_hash = ?, force_password_change = 0 WHERE id = ?"
        )->execute([$newHash, $alunaId]);

        Response::json(['success' => true, 'message' => 'Senha definida com sucesso.']);
    }
}
