<?php
// api/v1/Controllers/NexusOpsController.php
// V57.5: Audit + Firewall migrados para SQLite (zero MySQL connections para Nexus Admin)
// Fallback automático para MySQL se pdo_sqlite não estiver disponível no ambiente.

require_once __DIR__ . '/../Core/NexusSQLite.php';

class NexusOpsController {

    /**
     * Retorna o banco de dados admin: SQLite (produção) ou MySQL (fallback/dev).
     * Em produção Hostinger (PHP 8.4 Linux) o SQLite está sempre disponível.
     */
    private function getDb(): \PDO {
        if (NexusSQLite::isAvailable()) {
            $lite = NexusSQLite::get();
            if ($lite !== null) {
                return $lite;
            }
        }
        // Fallback: usar MySQL global (dev/Windows sem pdo_sqlite)
        // Nexus V66: Garantir que o Fallback usa o PDO global injetado pelo config.php
        global $pdo;
        return $pdo;
    }

    /**
     * Retorna true se a mágica "ON CONFLICT" do SQLite deve ser usada.
     * MySQL usa "ON DUPLICATE KEY UPDATE".
     */
    private function isSQLite(): bool {
        return NexusSQLite::isAvailable() && NexusSQLite::get() !== null;
    }


    // Lista regras de IP ativas (BAN, ALLOW) — SQLite e MySQL Fallback
    public function getRules() {
        $db = $this->getDb();
        
        if ($this->isSQLite()) {
            $stmt = $db->prepare("
                SELECT *, admin_name
                FROM security_ip_rules
                ORDER BY created_at DESC
                LIMIT 200
            ");
        } else {
            // MySQL fallback (admin_name doesn't exist in V47 schema)
            $stmt = $db->prepare("
                SELECT *, 'Admin/System' AS admin_name
                FROM security_ip_rules
                ORDER BY created_at DESC
                LIMIT 200
            ");
        }
        
        $stmt->execute();
        $rules = $stmt->fetchAll(PDO::FETCH_ASSOC);
        Response::json(['status' => 'success', 'rules' => $rules]);
    }

    // Adiciona nova regra de firewall — SQLite
    public function addRule($adminUser) {
        $data = json_decode(file_get_contents('php://input'), true);
        $ip         = trim($data['ip'] ?? '');
        $type       = strtoupper(trim($data['type'] ?? 'BAN'));
        $reason     = trim($data['reason'] ?? 'Manual Ops Action');
        $durationHours = (int)($data['duration_hours'] ?? 0);

        if (empty($ip) || !filter_var($ip, FILTER_VALIDATE_IP)) {
            Response::error('IP Inválido', 400);
        }
        if (!in_array($type, ['BAN', 'ALLOW', 'SUSPICIOUS'])) {
            Response::error('Tipo de regra inválida', 400);
        }

        $expiresAt = null;
        if ($durationHours > 0) {
            $expiresAt = date('Y-m-d H:i:s', strtotime("+$durationHours hours"));
        }

        $adminName = $adminUser['username'] ?? $adminUser['email'] ?? 'Admin';

        try {
            $db = $this->getDb();
            $db->beginTransaction();

            if ($this->isSQLite()) {
                $stmt = $db->prepare("
                    INSERT INTO security_ip_rules (ip_address, rule_type, reason, admin_id, admin_name, expires_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(ip_address) DO UPDATE SET
                        rule_type  = excluded.rule_type,
                        reason     = excluded.reason,
                        admin_id   = excluded.admin_id,
                        admin_name = excluded.admin_name,
                        expires_at = excluded.expires_at,
                        created_at = strftime('%Y-%m-%d %H:%M:%S', 'now', '-3 hours')
                ");
                $stmt->execute([$ip, $type, $reason, $adminUser['id'], $adminName, $expiresAt]);
            } else {
                // MySQL Fallback (sem admin_name)
                $stmt = $db->prepare("
                    INSERT INTO security_ip_rules (ip_address, rule_type, reason, admin_id, expires_at)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        rule_type  = VALUES(rule_type),
                        reason     = VALUES(reason),
                        admin_id   = VALUES(admin_id),
                        expires_at = VALUES(expires_at),
                        created_at = NOW()
                ");
                $stmt->execute([$ip, $type, $reason, $adminUser['id'], $expiresAt]);
            }

            $auditStmt = $db->prepare("INSERT INTO nexus_audit_ops (admin_id, action, target_id, payload_after) VALUES (?, ?, ?, ?)");
            $auditStmt->execute([$adminUser['id'], "UPSERT_FIREWALL_RULE", $ip,
                json_encode(['ip' => $ip, 'type' => $type, 'reason' => $reason, 'by' => $adminName])]);

            $db->commit();
            Response::json(['status' => 'success', 'message' => "IP $ip ajustado para $type"]);

        } catch (Exception $e) {
            $db->rollBack();
            error_log("[Nexus Ops Error]: " . $e->getMessage());
            Response::error('Falha ao aplicar regra no firewall: ' . $e->getMessage(), 500);
        }
    }

    // Remove regra (Desbanir) — SQLite
    public function removeRule($id, $adminUser) {
        $db = $this->getDb();

        $stmtGet = $db->prepare("SELECT ip_address, rule_type FROM security_ip_rules WHERE id = ?");
        $stmtGet->execute([$id]);
        $rule = $stmtGet->fetch(PDO::FETCH_ASSOC);

        if (!$rule) {
            Response::error('Regra não encontrada', 404);
        }

        try {
            $db->beginTransaction();

            $stmtDel = $db->prepare("DELETE FROM security_ip_rules WHERE id = ?");
            $stmtDel->execute([$id]);

            $auditStmt = $db->prepare("INSERT INTO nexus_audit_ops (admin_id, action, target_id, payload_before) VALUES (?, ?, ?, ?)");
            $auditStmt->execute([$adminUser['id'], "DELETE_FIREWALL_RULE", $rule['ip_address'], json_encode($rule)]);

            $db->commit();
            Response::json(['status' => 'success', 'message' => 'Regra revogada com sucesso']);

        } catch (Exception $e) {
            $db->rollBack();
            error_log("[Nexus Ops Error]: " . $e->getMessage());
            Response::error('Falha ao remover regra', 500);
        }
    }

    // Legacy endpoint para WarRoom — SQLite
    public function manageIPRule() {
        global $pdo; // Só para validar sessão admin
        $data   = json_decode(file_get_contents('php://input'), true);
        $ip     = trim($data['ip'] ?? '');
        $action = strtoupper(trim($data['action'] ?? 'BAN'));

        if (empty($ip) || !filter_var($ip, FILTER_VALIDATE_IP)) {
            Response::error('IP Inválido', 400);
        }

        $type = ($action === 'WHITELIST' || $action === 'ALLOW') ? 'ALLOW' : 'BAN';

        try {
            // Validar sessão via MySQL (apenas 1 query de auth)
            global $pdo;
            $headers   = getallheaders_robust();
            $token     = str_replace('Bearer ', '', $headers['AUTHORIZATION'] ?? '');
            $stmtAuth  = $pdo->prepare("SELECT user_id FROM admin_sessions WHERE token = ? AND expires_at > NOW()");
            $stmtAuth->execute([$token]);
            $adminId   = $stmtAuth->fetchColumn() ?: 1;

            // Gravar regra (Zero nova conexão MySQL se for SQLite)
            $db = $this->getDb();
            if ($this->isSQLite()) {
                $stmt = $db->prepare("
                    INSERT INTO security_ip_rules (ip_address, rule_type, reason, admin_id)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(ip_address) DO UPDATE SET
                        rule_type  = excluded.rule_type,
                        reason     = excluded.reason,
                        admin_id   = excluded.admin_id,
                        created_at = strftime('%Y-%m-%d %H:%M:%S', 'now', '-3 hours')
                ");
            } else {
                // MySQL Fallback
                $stmt = $db->prepare("
                    INSERT INTO security_ip_rules (ip_address, rule_type, reason, admin_id)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        rule_type  = VALUES(rule_type),
                        reason     = VALUES(reason),
                        admin_id   = VALUES(admin_id),
                        created_at = NOW()
                ");
            }
            $stmt->execute([$ip, $type, 'War Room Action', $adminId]);

            $auditStmt = $db->prepare("INSERT INTO nexus_audit_ops (admin_id, action, target_id, payload_after) VALUES (?, ?, ?, ?)");
            $auditStmt->execute([$adminId, "UPSERT_FIREWALL_RULE", $ip, json_encode(['ip' => $ip, 'type' => $type, 'source' => 'WarRoom'])]);

            Response::json(['status' => 'success', 'message' => "IP $ip adjusted"]);

        } catch (Exception $e) {
            error_log("[Nexus Ops Error]: " . $e->getMessage());
            Response::error('Falha ao aplicar regra: ' . $e->getMessage(), 500);
        }
    }

    // Guardian Feed — mantém MySQL (precisa de auth_logs + licenciadas)
    // Ações de admin são buscadas do SQLite local
    public function getAuditFeed() {
        global $pdo;

        // 1. Anomalias de login (MySQL — dados do portal)
        $stmtLogin = $pdo->prepare("
            SELECT a.id, COALESCE(CONCAT(s.name, ' (', a.email, ')'), a.email) as identity,
                   a.ip_address, a.risk_score, a.risk_details, a.risk_reason, a.city, a.status, a.created_at, 'LOGIN_ANOMALY' as feed_type
            FROM auth_logs a
            LEFT JOIN licenciadas s ON
                (a.email IS NOT NULL AND a.email != '') AND (
                    s.email COLLATE utf8mb4_unicode_ci = a.email COLLATE utf8mb4_unicode_ci
                    OR s.cpf   COLLATE utf8mb4_unicode_ci = a.email COLLATE utf8mb4_unicode_ci
                    OR s.username COLLATE utf8mb4_unicode_ci = a.email COLLATE utf8mb4_unicode_ci
                )
            WHERE (a.status != 'success' OR a.risk_score > 0)
            GROUP BY a.id, s.name, a.email, a.ip_address, a.risk_score, a.risk_details, a.risk_reason, a.city, a.status, a.created_at
            ORDER BY a.created_at DESC
            LIMIT 25
        ");
        $stmtLogin->execute();
        $authAnomalies = $stmtLogin->fetchAll(PDO::FETCH_ASSOC);

        // 2. Ações de admin (SQLite — zero nova conexão MySQL)
        $adminActions = [];
        try {
            $db = $this->getDb();
            $stmtOps = $db->prepare("
                SELECT id, admin_id as identity, target_id as ip_address,
                       0 as risk_score, payload_before, payload_after, action as risk_reason,
                       '' as city, 'success' as status, created_at, 'ADMIN_ACTION' as feed_type
                FROM nexus_audit_ops
                ORDER BY created_at DESC
                LIMIT 25
            ");
            $stmtOps->execute();
            $adminActions = $stmtOps->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("[NexusSQLite Feed Error]: " . $e->getMessage());
        }

        $feed = array_merge($authAnomalies, $adminActions);
        usort($feed, fn($a, $b) => strtotime($b['created_at']) <=> strtotime($a['created_at']));
        $feed = array_slice($feed, 0, 50);

        Response::json(['status' => 'success', 'feed' => $feed]);
    }

    // Ações de Vitalidade do Sistema — manutenção MySQL (intencional, é ação manual)
    public function systemMaintenance($adminUser) {
        global $pdo;
        $data   = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';

        try {
            $message  = "Ação desconhecida";
            $affected = 0;

            switch ($action) {
                case 'FLUSH_CACHE':
                    ResponseCache::flush();
                    // Limpar também o cache SQLite
                    NexusSQLite::get()->exec("DELETE FROM nexus_cache");
                    $message = "Cache de API e Nexus limpos com sucesso.";
                    break;

                case 'PURGE_DEVICES':
                    $stmt = $pdo->prepare("DELETE FROM licenciada_devices WHERE last_used_at < DATE_SUB(NOW(), INTERVAL 30 DAY) AND is_active = 0");
                    $stmt->execute();
                    $affected = $stmt->rowCount();
                    $message  = "Expurgo concluído: $affected dispositivos inativos removidos.";
                    break;

                case 'CLEAN_LOGS':
                    $stmt = $pdo->prepare("DELETE FROM auth_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)");
                    $stmt->execute();
                    $affected = $stmt->rowCount();
                    $stmt2 = $pdo->prepare("DELETE FROM lms_access_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)");
                    $stmt2->execute();
                    $affected += $stmt2->rowCount();
                    // Limpar audit SQLite antigo também
                    NexusSQLite::get()->exec("DELETE FROM nexus_audit_ops WHERE created_at < datetime('now', '-3 hours', '-90 days')");
                    $message = "Limpeza de logs concluída: $affected registros antigos removidos.";
                    break;

                case 'RESET_GEOIP':
                    $cacheDir = __DIR__ . '/../storage/geoip/cache/';
                    $files = glob($cacheDir . '*.json');
                    foreach ($files as $file) { if (is_file($file)) @unlink($file); }
                    $message = "Cache de geolocalização IP resetado.";
                    break;

                default:
                    Response::error('Ação de manutenção inválida', 400);
            }

            // Registrar auditoria no SQLite
            $db = $this->getDb();
            $auditStmt = $db->prepare("INSERT INTO nexus_audit_ops (admin_id, action, target_id, payload_after) VALUES (?, ?, ?, ?)");
            $auditStmt->execute([$adminUser['id'], "SYSTEM_MAINTENANCE", $action, json_encode(['result' => $message])]);

            Response::json(['status' => 'success', 'message' => $message]);

        } catch (Exception $e) {
            error_log("[Nexus Maint Error]: " . $e->getMessage());
            Response::error('Falha na execução da manutenção: ' . $e->getMessage(), 500);
        }
    }

    // Retorna logs de auditoria paginados (do SQLite)
    public function getAuditLogs() {
        $db    = NexusSQLite::get();
        $limit = min((int)($_GET['limit'] ?? 50), 200);
        $page  = max((int)($_GET['page'] ?? 1), 1);
        $offset = ($page - 1) * $limit;

        $stmt = $db->prepare("
            SELECT * FROM nexus_audit_ops
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        Response::json(['status' => 'success', 'logs' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }
}
