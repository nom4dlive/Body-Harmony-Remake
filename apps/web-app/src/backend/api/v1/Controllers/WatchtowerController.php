<?php
// api/v1/Controllers/WatchtowerController.php
// Nexus Watchtower Forensic Timeline — V56

class WatchtowerController {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    // GET /admin/nexus/watchtower/timeline?cpf=
    public function getForensicTimeline() {
        $rawCpf = $_GET['cpf'] ?? '';
        $cpf = preg_replace('/\D/', '', $rawCpf);

        if (strlen($cpf) !== 11) {
            Response::error('CPF inválido. Informe 11 dígitos.', 400);
        }

        // 1. Buscar licenciada pelo CPF
        $stmt = $this->pdo->prepare("SELECT id, name, email, instagram, photo_url, is_active, last_login_at FROM licenciadas WHERE cpf = ? LIMIT 1");
        $stmt->execute([$cpf]);
        $licenciada = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$licenciada) {
            Response::error('Licenciada não encontrada para o CPF informado.', 404);
        }

        $id = $licenciada['id'];
        $events = [];

        // 2. Auth Logs (Logins, Falhas, Riscos)
        try {
            $stmtAuth = $this->pdo->prepare("
                SELECT 
                    status,
                    ip_address,
                    risk_score,
                    risk_details,
                    city,
                    created_at
                FROM auth_logs
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 50
            ");
            $stmtAuth->execute([$id]);
            foreach ($stmtAuth->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $type = 'LOGIN';
                $label = 'Login realizado';
                if ($row['status'] !== 'success') {
                    $type = 'LOGIN_FAIL';
                    $label = 'Tentativa falha';
                } elseif ($row['risk_score'] >= 60) {
                    $type = 'RISK';
                    $label = 'Login suspeito (RISK: ' . $row['risk_score'] . ')';
                }
                $events[] = [
                    'type'      => $type,
                    'label'     => $label,
                    'detail'    => ($row['city'] ? '📍 ' . $row['city'] : '') . ($row['risk_score'] > 0 ? ' · Score: ' . $row['risk_score'] : ''),
                    'ip'        => $row['ip_address'],
                    'risk'      => (int) $row['risk_score'],
                    'timestamp' => $row['created_at'],
                ];
            }
        } catch (Exception $e) {
            error_log("[Forensic] auth_logs query error: " . $e->getMessage());
        }

        // 3. LMS Progress (Aulas assistidas via lms_progress)
        try {
            $stmtLms = $this->pdo->prepare("
                SELECT 
                    p.lesson_id,
                    p.progress_percent,
                    p.is_completed,
                    p.last_watched_at,
                    p.updated_at,
                    COALESCE(l.title, CONCAT('Aula #', p.lesson_id)) as lesson_title,
                    COALESCE(m.title, '') as module_title
                FROM lms_progress p
                LEFT JOIN lms_lessons l ON p.lesson_id = l.id
                LEFT JOIN lms_modules m ON l.module_id = m.id
                WHERE p.licenciada_id = ?
                  AND (p.progress_percent > 0 OR p.is_completed = 1)
                ORDER BY p.updated_at DESC
                LIMIT 50
            ");
            $stmtLms->execute([$id]);
            foreach ($stmtLms->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $pct = (int)$row['progress_percent'];
                $label = $row['is_completed'] ? '✅ ' . $row['lesson_title'] : '▶️ ' . $row['lesson_title'];
                $events[] = [
                    'type'      => 'LMS_VIDEO',
                    'label'     => $label,
                    'detail'    => ($row['module_title'] ? 'Módulo: ' . $row['module_title'] . '  ·  ' : '') . $pct . '% concluído',
                    'ip'        => null,
                    'risk'      => 0,
                    'timestamp' => $row['updated_at'] ?: $row['last_watched_at'],
                ];
            }
        } catch (Exception $e) {
            error_log("[Forensic] lms_progress query error: " . $e->getMessage());
        }

        // 4. Novos Dispositivos detectados
        try {
            $stmtDev = $this->pdo->prepare("
                SELECT 
                    ip_address,
                    user_agent,
                    created_at
                FROM licenciada_devices
                WHERE licenciada_id = ?
                ORDER BY created_at DESC
                LIMIT 20
            ");
            $stmtDev->execute([$id]);
            foreach ($stmtDev->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $ua = $row['user_agent'] ?? '';
                $deviceHint = 'Desktop';
                if (preg_match('/iPhone|iPad/i', $ua)) $deviceHint = 'iOS';
                elseif (preg_match('/Android/i', $ua)) $deviceHint = 'Android';
                elseif (preg_match('/Windows/i', $ua)) $deviceHint = 'Windows';

                $events[] = [
                    'type'      => 'NEW_DEVICE',
                    'label'     => '💻 Novo dispositivo registrado',
                    'detail'    => $deviceHint,
                    'ip'        => $row['ip_address'],
                    'risk'      => 0,
                    'timestamp' => $row['created_at'],
                ];
            }
        } catch (Exception $e) {
            error_log("[Forensic] licenciada_devices query error: " . $e->getMessage());
        }

        // 5. Ações Administrativas sobre a licenciada
        try {
            $stmtOps = $this->pdo->prepare("
                SELECT 
                    n.action,
                    n.payload_after,
                    a.username as admin_name,
                    n.created_at
                FROM nexus_audit_ops n
                LEFT JOIN admin_users a ON n.admin_id = a.id
                WHERE n.target_id = ?
                ORDER BY n.created_at DESC
                LIMIT 20
            ");
            $stmtOps->execute([(string)$id]);
            foreach ($stmtOps->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $events[] = [
                    'type'      => 'ADMIN_ACTION',
                    'label'     => '🛡️ Ação Admin: ' . $row['action'],
                    'detail'    => 'por ' . ($row['admin_name'] ?? 'Sistema'),
                    'ip'        => null,
                    'risk'      => 0,
                    'timestamp' => $row['created_at'],
                ];
            }
        } catch (Exception $e) {
            error_log("[Forensic] nexus_audit_ops query error: " . $e->getMessage());
        }

        // 6. Ordenar todos os eventos por timestamp DESC
        usort($events, fn($a, $b) => strtotime($b['timestamp']) <=> strtotime($a['timestamp']));
        $events = array_slice($events, 0, 100);

        Response::json([
            'success'     => true,
            'licenciada'  => $licenciada,
            'total_events'=> count($events),
            'events'      => $events,
        ]);
    }
}
