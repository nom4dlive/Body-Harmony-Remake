<?php
// api/v1/Controllers/SessionController.php

require_once __DIR__ . '/../libs/LoggerService.php';

class SessionController {
    private $pdo;
    private $logger;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
        $this->logger = new LoggerService($pdo);
    }

    // GET /v1/admin/sessions?licenciada_id=X
    public function getSessions() {
        $search = $_GET['licenciada_id'] ?? null;
        if (!$search) Response::error('Search term (ID, CPF or Name) required', 400);

        $studentId = null;

        // 1. Clean input for CPF check (remove . - /)
        $cleanSearch = preg_replace('/[^0-9]/', '', $search);

        // 2. Try search by numeric ID, exact CPF or cleaned CPF
        if (!empty($cleanSearch)) {
            $stmtId = $this->pdo->prepare("
                SELECT id FROM licenciadas 
                WHERE id = ? 
                OR REPLACE(REPLACE(cpf, '.', ''), '-', '') = ? 
                OR cpf = ?
                LIMIT 1
            ");
            $stmtId->execute([$search, $cleanSearch, $search]);
            $studentId = $stmtId->fetchColumn();
        }

        // 3. Try search by partial name if not found
        if (!$studentId) {
            $stmtName = $this->pdo->prepare("SELECT id FROM licenciadas WHERE name LIKE ? OR instagram LIKE ? LIMIT 1");
            $stmtName->execute(["%$search%", "%$search%"]);
            $studentId = $stmtName->fetchColumn();
        }

        if (!$studentId) Response::error('Licenciada não encontrada.', 404);

        $stmt = $this->pdo->prepare("
            SELECT sd.id, sd.device_token, sd.user_agent, sd.ip_address, sd.is_active, sd.last_used_at, sd.created_at, l.name as student_name
            FROM licenciada_devices sd
            JOIN licenciadas l ON sd.licenciada_id = l.id
            WHERE sd.licenciada_id = ?
            ORDER BY sd.last_used_at DESC
        ");
        $stmt->execute([$studentId]);
        $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Add Device Hinting (V54 Nexus Intelligence)
        $sessions = array_map(function($s) {
            $ua = $s['user_agent'] ?? '';
            $hint = 'Desktop';
            if (preg_match('/Tablet|iPad/i', $ua)) $hint = 'Tablet';
            elseif (preg_match('/Mobi|Android|iPhone/i', $ua)) $hint = 'Mobile';
            
            // OS Hint
            $os = 'Unknown';
            if (preg_match('/Windows/i', $ua)) $os = 'Windows';
            elseif (preg_match('/Macintosh|Mac OS X/i', $ua)) $os = 'macOS';
            elseif (preg_match('/Android/i', $ua)) $os = 'Android';
            elseif (preg_match('/iPhone|iPad/i', $ua)) $os = 'iOS';
            elseif (preg_match('/Linux/i', $ua)) $os = 'Linux';

            $s['device_hint'] = "$hint ($os)";
            return $s;
        }, $sessions);

        Response::json(['success' => true, 'sessions' => $sessions]);
    }

    // POST /v1/admin/sessions/terminate
    public function terminateSession() {
        $input = json_decode(file_get_contents("php://input"), true);
        $sessionId = $input['session_id'] ?? null;
        
        if (!$sessionId) Response::error('Session ID required', 400);

        // Fetch info for logging
        $stmtInfo = $this->pdo->prepare("SELECT licenciada_id FROM licenciada_devices WHERE id = ?");
        $stmtInfo->execute([$sessionId]);
        $studentId = $stmtInfo->fetchColumn();

        $stmt = $this->pdo->prepare("UPDATE licenciada_devices SET is_active = 0 WHERE id = ?");
        $stmt->execute([$sessionId]);

        if ($studentId) {
            $this->logger->log($studentId, 'SESSION_TERMINATED_ADMIN', ['device_id' => $sessionId]);
        }

        Response::json(['success' => true, 'message' => 'Sessão encerrada com sucesso.']);
    }
}
