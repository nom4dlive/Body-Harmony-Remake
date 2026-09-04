<?php
// api/v1/Controllers/AdminAlunaController.php
// V70 — CRUD Completo de Alunas (Nexus + Portal Gestor)

class AdminAlunaController {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    // ----------------------------------------------------------------
    // GET /v1/admin/alunas
    // ----------------------------------------------------------------
    public function index() {
        try {
            $stmt = $this->pdo->query("
                SELECT
                    a.id, a.name, a.email, a.cpf, a.phone, a.is_active,
                    a.last_login_at, a.created_at, a.updated_at,
                    a.failed_login_attempts, a.locked_until,
                    a.max_devices, a.admin_notes,
                    COUNT(DISTINCT aca.module_id) AS course_count
                FROM alunas a
                LEFT JOIN aluna_course_access aca ON aca.aluna_id = a.id
                GROUP BY a.id
                ORDER BY a.created_at DESC
            ");
            $alunas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::json($alunas);
        } catch (PDOException $e) {
            Response::error('Erro ao listar alunas.', 500);
        }
    }

    // ----------------------------------------------------------------
    // GET /v1/admin/alunas/{id}
    // ----------------------------------------------------------------
    public function show($id) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT
                    a.id, a.name, a.email, a.cpf, a.phone, a.is_active,
                    a.last_login_at, a.created_at, a.updated_at,
                    a.failed_login_attempts, a.locked_until,
                    a.max_devices, a.admin_notes, a.telegram_user_id,
                    a.force_password_change, a.lgpd_status,
                    COUNT(DISTINCT aca.module_id) AS course_count,
                    COUNT(DISTINCT ad.id) AS device_count
                FROM alunas a
                LEFT JOIN aluna_course_access aca ON aca.aluna_id = a.id
                LEFT JOIN aluna_devices ad ON ad.aluna_id = a.id AND ad.is_active = 1
                WHERE a.id = ?
                GROUP BY a.id
            ");
            $stmt->execute([$id]);
            $aluna = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$aluna) {
                Response::error('Aluna não encontrada.', 404);
            }

            Response::json($aluna);
        } catch (PDOException $e) {
            Response::error('Erro ao buscar aluna.', 500);
        }
    }

    // ----------------------------------------------------------------
    // POST /v1/admin/alunas
    // Body: { name, email, cpf, phone, password, module_ids[] }
    // ----------------------------------------------------------------
    public function store() {
        $input    = json_decode(file_get_contents('php://input'), true);
        $name     = trim($input['name']     ?? '');
        $email    = trim($input['email']    ?? '');
        $cpf      = preg_replace('/\D/', '', $input['cpf'] ?? '');
        $phone    = preg_replace('/\D/', '', $input['phone'] ?? '');
        $password = $input['password']      ?? '';
        $modules  = $input['module_ids']    ?? [];

        if (!$name || !$email || !$password) {
            Response::error('Nome, e-mail e senha são obrigatórios.', 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('E-mail inválido.', 400);
        }
        if ($cpf && strlen($cpf) !== 11) {
            Response::error('CPF deve ter 11 dígitos.', 400);
        }

        try {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmtIns = $this->pdo->prepare(
                "INSERT INTO alunas (name, email, cpf, phone, password_hash, is_active, force_password_change)
                 VALUES (?, ?, ?, ?, ?, 1, 0)"
            );
            $stmtIns->execute([$name, $email, $cpf ?: null, $phone ?: null, $hash]);
            $alunaId = (int)$this->pdo->lastInsertId();

            // Concede acesso aos módulos indicados
            foreach ($modules as $moduleId) {
                $this->grantModuleAccess($alunaId, (int)$moduleId);
            }

            Response::json(['success' => true, 'aluna_id' => $alunaId], 201);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                Response::error('E-mail ou CPF já cadastrado.', 409);
            }
            Response::error('Erro ao criar aluna.', 500);
        }
    }

    // ----------------------------------------------------------------
    // POST /v1/admin/alunas/{id}  (update via POST para compatibilidade multipart)
    // ----------------------------------------------------------------
    public function update($id) {
        $input  = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = [];
        $values = [];

        if (!empty($input['name'])) {
            $fields[] = 'name = ?';
            $values[] = trim($input['name']);
        }
        if (!empty($input['email'])) {
            if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                Response::error('E-mail inválido.', 400);
            }
            $fields[] = 'email = ?';
            $values[] = trim($input['email']);
        }
        if (isset($input['cpf'])) {
            $cpfClean = preg_replace('/\D/', '', $input['cpf']);
            if ($cpfClean && strlen($cpfClean) !== 11) {
                Response::error('CPF deve ter 11 dígitos.', 400);
            }
            $fields[] = 'cpf = ?';
            $values[] = $cpfClean ?: null;
        }
        if (isset($input['phone'])) {
            $phoneClean = preg_replace('/\D/', '', $input['phone']);
            $fields[] = 'phone = ?';
            $values[] = $phoneClean ?: null;
        }
        if (!empty($input['is_active']) || isset($input['is_active'])) {
            $fields[] = 'is_active = ?';
            $values[] = (int)$input['is_active'];
        }
        if (isset($input['admin_notes'])) {
            $fields[] = 'admin_notes = ?';
            $values[] = $input['admin_notes'] ?: null;
        }
        if (isset($input['max_devices'])) {
            $fields[] = 'max_devices = ?';
            $values[] = max(1, (int)$input['max_devices']);
        }
        if (isset($input['telegram_user_id'])) {
            $fields[] = 'telegram_user_id = ?';
            $values[] = $input['telegram_user_id'] ?: null;
        }

        if (!$fields) {
            Response::error('Nenhum campo para atualizar.', 400);
        }

        try {
            $values[] = $id;
            $sql = "UPDATE alunas SET " . implode(', ', $fields) . " WHERE id = ?";
            $this->pdo->prepare($sql)->execute($values);

            Response::json(['success' => true]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                Response::error('E-mail ou CPF já cadastrado por outra aluna.', 409);
            }
            Response::error('Erro ao atualizar aluna.', 500);
        }
    }

    // ----------------------------------------------------------------
    // DELETE /v1/admin/alunas/{id}
    // (desativa, não apaga — preserva histórico LGPD)
    // ----------------------------------------------------------------
    public function destroy($id) {
        try {
            $this->pdo->prepare("UPDATE alunas SET is_active = 0 WHERE id = ?")
                      ->execute([$id]);
            // Revoga todos os tokens ativos
            $this->pdo->prepare(
                "UPDATE aluna_devices SET is_active = 0 WHERE aluna_id = ?"
            )->execute([$id]);

            Response::json(['success' => true]);
        } catch (PDOException $e) {
            Response::error('Erro ao desativar aluna.', 500);
        }
    }

    // ----------------------------------------------------------------
    // POST /v1/admin/alunas/{id}/grant-access
    // Body: { module_id, expires_at? }
    // ----------------------------------------------------------------
    public function grantAccess($id) {
        $input    = json_decode(file_get_contents('php://input'), true);
        $moduleId = (int)($input['module_id'] ?? 0);
        $expiresAt= $input['expires_at'] ?? null;

        if (!$moduleId) {
            Response::error('module_id obrigatório.', 400);
        }

        try {
            global $loggedUser;
            $grantedBy = $loggedUser['id'] ?? null;
            $this->grantModuleAccess($id, $moduleId, $grantedBy, $expiresAt);
            Response::json(['success' => true]);
        } catch (PDOException $e) {
            Response::error('Erro ao conceder acesso.', 500);
        }
    }

    // ----------------------------------------------------------------
    // DELETE /v1/admin/alunas/{id}/revoke-access/{module_id}
    // ----------------------------------------------------------------
    public function revokeAccess($id, $moduleId) {
        try {
            $this->pdo->prepare(
                "DELETE FROM aluna_course_access WHERE aluna_id = ? AND module_id = ?"
            )->execute([$id, $moduleId]);
            Response::json(['success' => true]);
        } catch (PDOException $e) {
            Response::error('Erro ao revogar acesso.', 500);
        }
    }

    // ----------------------------------------------------------------
    // POST /v1/admin/alunas/{id}/reset-password
    // Body: { password }
    // ----------------------------------------------------------------
    public function resetPassword($id) {
        $input    = json_decode(file_get_contents('php://input'), true);
        $password = $input['password'] ?? '';

        if (strlen($password) < 6) {
            Response::error('A senha deve ter pelo menos 6 caracteres.', 400);
        }

        try {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $this->pdo->prepare(
                "UPDATE alunas SET password_hash = ?, force_password_change = 1 WHERE id = ?"
            )->execute([$hash, $id]);
            Response::json(['success' => true]);
        } catch (PDOException $e) {
            Response::error('Erro ao redefinir senha.', 500);
        }
    }

    // ----------------------------------------------------------------
    // GET /v1/admin/alunas/{id}/accesses
    // ----------------------------------------------------------------
    public function accesses($id) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT aca.*, m.title AS module_title
                FROM aluna_course_access aca
                INNER JOIN lms_modules m ON aca.module_id = m.id
                WHERE aca.aluna_id = ?
                ORDER BY aca.granted_at DESC
            ");
            $stmt->execute([$id]);
            Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (PDOException $e) {
            Response::error('Erro ao listar acessos.', 500);
        }
    }

    // ----------------------------------------------------------------
    // Helper privado
    // ----------------------------------------------------------------
    private function grantModuleAccess($alunaId, $moduleId, $grantedBy = null, $expiresAt = null) {
        $this->pdo->prepare("
            INSERT INTO aluna_course_access (aluna_id, module_id, granted_by, expires_at)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE granted_at = NOW(), expires_at = VALUES(expires_at)
        ")->execute([$alunaId, $moduleId, $grantedBy, $expiresAt]);

        $this->ensureStudentModuleContract($alunaId, $moduleId);
    }

    public function ensureStudentModuleContract($alunaId, $moduleId) {
        try {
            // Check if contract already exists
            $stmt = $this->pdo->prepare("
                SELECT id FROM contracts WHERE aluna_id = ? AND module_id = ? LIMIT 1
            ");
            $stmt->execute([$alunaId, $moduleId]);
            if ($stmt->fetchColumn()) {
                return;
            }

            // Fetch aluna details
            $stmtA = $this->pdo->prepare("SELECT * FROM alunas WHERE id = ?");
            $stmtA->execute([$alunaId]);
            $aluna = $stmtA->fetch(PDO::FETCH_ASSOC);
            if (!$aluna) return;

            // Fetch module details
            $stmtM = $this->pdo->prepare("SELECT * FROM lms_modules WHERE id = ?");
            $stmtM->execute([$moduleId]);
            $module = $stmtM->fetch(PDO::FETCH_ASSOC);
            if (!$module) return;

            // Fetch template
            $stmtT = $this->pdo->prepare("SELECT * FROM contract_templates WHERE slug = 'termo-ciencia-modulo-individual' AND is_active = 1 LIMIT 1");
            $stmtT->execute();
            $template = $stmtT->fetch(PDO::FETCH_ASSOC);
            if (!$template) return;

            $moduleTitle = strtoupper($module['title'] ?? 'CURSO / MÓDULO');
            $moduleDesc = !empty($module['description']) ? $module['description'] : 'voltada à aplicação estratégica e prática profissional da metodologia Body Harmony';
            $now = date('Y-m-d H:i:s');
            $dateExtenso = date('d/m/Y');
            
            $vars = [
                'ALUNA_NOME' => $aluna['name'],
                'ALUNA_CPF' => $aluna['cpf'] ?: 'NÃO INFORMADO',
                'ALUNA_EMAIL' => $aluna['email'] ?: '',
                'ALUNA_TELEFONE' => $aluna['phone'] ?: '',
                'CURSO_NOME' => $moduleTitle,
                'CURSO_DESCRICAO' => $moduleDesc,
                'CIDADE_CELEBRACAO' => 'Assis/SP',
                'DATA_CELEBRACAO_EXTENSO' => $dateExtenso,
                'ASSINATURA_LICENCIANTE_IMG' => '',
                'ASSINATURA_LICENCIADA_IMG' => ''
            ];

            // Replace vars in HTML
            $renderedHtml = $template['content_html'];
            foreach ($vars as $k => $v) {
                $renderedHtml = str_replace(["{{{$k}}}", "{{ {$k} }}"], $v, $renderedHtml);
            }

            $uuid = 'BH-TRM-' . strtoupper(substr(bin2hex(random_bytes(6)), 0, 10));
            $signToken = 'st_' . bin2hex(random_bytes(24));
            $title = "Termo de Ciência - {$moduleTitle} ({$aluna['name']})";

            $ins = $this->pdo->prepare("
                INSERT INTO contracts (
                    uuid, template_id, aluna_id, module_id, title, status,
                    variables_payload, rendered_html, sign_token, created_at
                ) VALUES (?, ?, ?, ?, ?, 'PENDING_SIGNATURE', ?, ?, ?, ?)
            ");
            $ins->execute([
                $uuid,
                $template['id'],
                $alunaId,
                $moduleId,
                $title,
                json_encode($vars, JSON_UNESCAPED_UNICODE),
                $renderedHtml,
                $signToken,
                $now
            ]);
        } catch (Throwable $e) {
            error_log("[AdminAlunaController] Erro ao gerar termo automático da aluna: " . $e->getMessage());
        }
    }

    // ----------------------------------------------------------------
    // POST /v1/admin/alunas/{id}/revoke-devices
    // ----------------------------------------------------------------
    public function revokeDevices($id) {
        try {
            $this->pdo->prepare(
                "UPDATE aluna_devices SET is_active = 0 WHERE aluna_id = ?"
            )->execute([$id]);
            Response::json(['success' => true, 'message' => 'Todos os dispositivos revogados.']);
        } catch (PDOException $e) {
            Response::error('Erro ao revogar dispositivos.', 500);
        }
    }

    // ----------------------------------------------------------------
    // GET /v1/admin/alunas/{id}/devices
    // ----------------------------------------------------------------
    public function devices($id) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT * FROM aluna_devices
                WHERE aluna_id = ?
                ORDER BY last_used_at DESC
            ");
            $stmt->execute([$id]);
            Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (PDOException $e) {
            Response::error('Erro ao listar dispositivos.', 500);
        }
    }

    // ----------------------------------------------------------------
    // POST /v1/admin/alunas/{id}/unlock
    // Desbloqueia conta travada por excesso de tentativas
    // ----------------------------------------------------------------
    public function unlock($id) {
        try {
            $this->pdo->prepare(
                "UPDATE alunas SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?"
            )->execute([$id]);
            Response::json(['success' => true, 'message' => 'Conta desbloqueada.']);
        } catch (PDOException $e) {
            Response::error('Erro ao desbloquear conta.', 500);
        }
    }

    // ----------------------------------------------------------------
    // DELETE /v1/admin/alunas/{id}/permanent  (hard delete com cascade)
    // ⚠️ Exclusão permanente — requer superadmin confirmado
    // ----------------------------------------------------------------
    public function hardDelete($id) {
        try {
            // Cascade manual (FK pode estar sem ON DELETE CASCADE)
            $this->pdo->prepare("DELETE FROM aluna_devices       WHERE aluna_id = ?")->execute([$id]);
            $this->pdo->prepare("DELETE FROM aluna_course_access WHERE aluna_id = ?")->execute([$id]);
            $this->pdo->prepare("DELETE FROM aluna_progress      WHERE aluna_id = ?")->execute([$id]);
            $this->pdo->prepare("DELETE FROM aluna_certificates  WHERE aluna_id = ?")->execute([$id]);
            $this->pdo->prepare("DELETE FROM alunas              WHERE id = ?")      ->execute([$id]);

            Response::json(['success' => true, 'message' => 'Aluna excluída permanentemente.']);
        } catch (PDOException $e) {
            Response::error('Erro ao excluir aluna permanentemente.', 500);
        }
    }
}
