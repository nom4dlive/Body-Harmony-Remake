<?php

use BodyHarmony\Services\OnboardingService;
use BodyHarmony\Services\SimpleOcrService;

/**
 * OnboardingController (PLAN-064)
 * 
 * Thin HTTP controller for the Licenciada Onboarding Funnel (Nexus Protocol V3.1).
 * Delegates 100% of business and database logic to OnboardingService.
 * Strictly complies with Constitution REGRA 6 (Service Decoupling) and REGRA 1 (Strict Contracts).
 * 
 * @author Antigravity Agent
 */
class OnboardingController {
    private $db;
    private OnboardingService $onboardingService;
    private SimpleOcrService $ocrService;

    public function __construct($pdo = null) {
        global $pdo;
        $this->db = $pdo;
        $this->onboardingService = new OnboardingService($this->db);
        $this->ocrService = new SimpleOcrService();
    }

    /**
     * Checks if current user/session has Admin/SuperAdmin privileges.
     */
    private function isAdmin(): bool {
        global $loggedUser;
        if (!empty($loggedUser['is_admin']) || in_array($loggedUser['role'] ?? '', ['superadmin', 'admin'], true)) {
            return true;
        }
        $role = $_SESSION['role'] ?? $_SESSION['user_role'] ?? '';
        return in_array($role, ['superadmin', 'admin'], true) || !empty($_SESSION['admin_user_id']) || !empty($_SESSION['user_id']);
    }

    private function getAdminId(): int {
        global $loggedUser;
        if (!empty($loggedUser['id'])) {
            return (int)$loggedUser['id'];
        }
        return (int)($_SESSION['admin_user_id'] ?? $_SESSION['user_id'] ?? 1);
    }

    /**
     * Helper to read JSON or form-data input.
     */
    private function getInput(): array {
        $json = json_decode(file_get_contents('php://input'), true);
        if (is_array($json)) {
            return array_merge($_POST, $json);
        }
        return $_POST;
    }

    // =========================================================================
    // PUBLIC ENDPOINTS
    // =========================================================================

    /**
     * GET /api/v1/public/onboarding/{token}
     */
    public function getPublicTokenInfo(string $token) {
        try {
            $res = $this->onboardingService->validateToken($token);
            if (!$res || empty($res['valid'])) {
                $reason = $res['reason'] ?? 'invalid_token';
                if ($reason === 'already_used') {
                    Response::error('Este link de pré-cadastro já foi utilizado.', 409);
                    return;
                }
                if ($reason === 'expired') {
                    Response::error('Este link de pré-cadastro expirou. Solicite um novo link via WhatsApp.', 410);
                    return;
                }
                Response::error('Link de onboarding inválido ou não encontrado.', 404);
                return;
            }

            Response::json([
                'success' => true,
                'valid' => true,
                'data' => [
                    'token' => $res['token'],
                    'categoria' => $res['categoria'],
                    'telefone_whatsapp' => $res['telefone_whatsapp'],
                    'nome_candidata' => $res['nome_candidata'],
                    'expires_at' => $res['expires_at']
                ]
            ]);
        } catch (Throwable $e) {
            Response::error('Erro ao validar link: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/v1/public/onboarding/{token} OR POST /api/v1/public/onboarding/submit
     */
    public function submitPublicOnboarding(?string $token = null) {
        try {
            $input = $this->getInput();
            $tokenParam = $token ?: ($input['token'] ?? '');

            if (empty($tokenParam)) {
                Response::error('Token de onboarding é obrigatório.', 400);
                return;
            }

            $files = !empty($_FILES) ? $_FILES : null;
            $result = $this->onboardingService->submitPublicOnboarding($tokenParam, $input, $files);

            Response::json($result, 201);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * POST /api/v1/public/onboarding/ocr
     */
    public function processOcrDocument() {
        try {
            $file = $_FILES['documento_img'] ?? null;
            $input = $this->getInput();
            $fileOrText = $file ?: ($input['documento_img'] ?? $input['text'] ?? '');

            if (empty($fileOrText)) {
                Response::error('Nenhum documento ou imagem fornecido para OCR.', 400);
                return;
            }

            $result = $this->ocrService->processDocument($fileOrText);
            Response::json($result);
        } catch (Throwable $e) {
            Response::error('Erro ao processar OCR: ' . $e->getMessage(), 500);
        }
    }

    // =========================================================================
    // ADMIN ENDPOINTS
    // =========================================================================

    /**
     * POST /api/v1/admin/onboarding/tokens OR /api/v1/admin/onboarding/links
     */
    public function generateToken() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado. Requer permissão de Administrador.', 403);
            return;
        }

        try {
            $input = $this->getInput();
            $adminId = $this->getAdminId();
            $result = $this->onboardingService->createToken($input, $adminId);

            Response::json($result, 201);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * GET /api/v1/admin/onboarding/funnel
     */
    public function listFunnel() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado. Requer permissão de Administrador.', 403);
            return;
        }

        try {
            $filters = [
                'search' => $_GET['search'] ?? null,
                'status' => $_GET['status'] ?? null,
                'categoria' => $_GET['categoria'] ?? null,
                'view_mode' => $_GET['view_mode'] ?? null,
                'assigned_admin_id' => !empty($_GET['assigned_admin_id']) ? (int)$_GET['assigned_admin_id'] : null,
                'future_cohort_tag' => $_GET['future_cohort_tag'] ?? null
            ];

            $result = $this->onboardingService->listFunnel($filters);
            Response::json($result);
        } catch (Throwable $e) {
            Response::error('Erro ao listar funil: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/v1/admin/onboarding/requests/{id} OR /api/v1/admin/onboarding/{id}
     */
    public function getRequestDetail($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $detail = $this->onboardingService->getRequestById((int)$id);
            if (!$detail) {
                Response::error("Solicitação de Onboarding #{$id} não encontrada.", 404);
                return;
            }

            Response::json([
                'success' => true,
                'request' => $detail['request'],
                'contract' => $detail['contract']
            ]);
        } catch (Throwable $e) {
            Response::error('Erro ao carregar detalhes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/v1/admin/onboarding/{id}/generate-contract OR /admin/onboarding/requests/{id}/generate-contract
     */
    public function generateContract1Click($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $input = $this->getInput();
            $adminId = $this->getAdminId();
            $result = $this->onboardingService->generateContract1Click((int)$id, $input, $adminId);

            Response::json($result);
        } catch (Throwable $e) {
            Response::error('Erro ao emitir contrato: ' . $e->getMessage(), 400);
        }
    }

    /**
     * POST /api/v1/admin/onboarding/{id}/whatsapp-reminder OR /admin/onboarding/requests/{id}/whatsapp-reminder
     */
    public function sendWhatsAppReminder($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $input = $this->getInput();
            $templateType = $input['template_type'] ?? 'lembrete_24h';
            $result = $this->onboardingService->sendWhatsAppReminder((int)$id, $templateType);

            Response::json($result);
        } catch (Throwable $e) {
            Response::error('Erro ao gerar lembrete WhatsApp: ' . $e->getMessage(), 400);
        }
    }

    /**
     * POST /api/v1/admin/onboarding/{id}/confirm-payment OR /admin/onboarding/requests/{id}/confirm-payment
     */
    public function confirmPaymentAndActivate($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $input = $this->getInput();
            $adminId = $this->getAdminId();
            $result = $this->onboardingService->confirmPaymentAndActivate((int)$id, $input, $adminId);

            Response::json($result);
        } catch (Throwable $e) {
            Response::error('Erro ao confirmar pagamento e ativar licenciada: ' . $e->getMessage(), 400);
        }
    }

    /**
     * PATCH /api/v1/admin/onboarding/{id}/status OR /admin/onboarding/requests/{id}/status
     */
    public function updateStatus($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $input = $this->getInput();
            if (empty($input['status'])) {
                Response::error('Campo status é obrigatório.', 400);
                return;
            }

            $adminId = $this->getAdminId();
            $this->onboardingService->updateStatus((int)$id, $input['status'], $adminId, $input['notes'] ?? null);

            Response::json([
                'success' => true,
                'message' => 'Status atualizado com sucesso.'
            ]);
        } catch (Throwable $e) {
            Response::error('Erro ao atualizar status: ' . $e->getMessage(), 400);
        }
    }

    // =========================================================================
    // MÉTRICAS DO FUNIL (PLAN-066)
    // =========================================================================

    /**
     * GET /api/v1/admin/onboarding/metrics
     * Retorna métricas agregadas do funil de onboarding para o Dashboard do Gestor.
     */
    public function getMetrics() {
        try {
            $periodoDias = max(1, (int)($_GET['periodo_dias'] ?? 30));
            $result = $this->onboardingService->getMetrics($periodoDias);
            Response::json($result);
        } catch (Throwable $e) {
            Response::error('Erro ao obter métricas do funil: ' . $e->getMessage(), 500);
        }
    }

    // =========================================================================
    // INTEGRAÇÃO & DOWNLOAD ZIP (PLAN-067)
    // =========================================================================

    /**
     * GET /api/v1/admin/onboarding/{id}/download-zip
     * Faz o streaming de todos os documentos e anexos do pré-cadastro compactados em arquivo ZIP.
     */
    public function downloadZip($id) {
        try {
            $result = $this->onboardingService->generateDocumentsZip((int)$id);
            $zipPath = $result['zip_path'];
            $filename = $result['filename'];

            if (!file_exists($zipPath)) {
                Response::error('Arquivo ZIP não pôde ser gerado.', 500);
                return;
            }

            // Headers para download do ZIP
            header('Content-Type: application/zip');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Length: ' . filesize($zipPath));
            header('Pragma: no-cache');
            header('Expires: 0');

            // Limpa buffer de saída
            if (ob_get_level()) {
                ob_end_clean();
            }

            readfile($zipPath);
            @unlink($zipPath); // Remove arquivo temporário após envio
            exit;
        } catch (Throwable $e) {
            Response::error('Erro ao baixar documentos em ZIP: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/v1/admin/onboarding/{id}/document/{type}
     * Faz o streaming inline autenticado de um documento/anexo do pré-cadastro da licenciada.
     */
    public function serveDocument($id, $type) {
        try {
            $doc = $this->onboardingService->getDocumentPath((int)$id, (string)$type);
            if (!$doc || !file_exists($doc['full_path'])) {
                http_response_code(404);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Documento não localizado no servidor.']);
                exit;
            }

            // Headers para exibição segura inline
            header('Content-Type: ' . $doc['mime_type']);
            header('Content-Disposition: inline; filename="' . $doc['filename'] . '"');
            header('Content-Length: ' . $doc['size']);
            header('Cache-Control: private, max-age=3600');
            header('Pragma: public');

            if (ob_get_level()) {
                ob_end_clean();
            }

            readfile($doc['full_path']);
            exit;
        } catch (Throwable $e) {
            Response::error('Erro ao exibir documento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/v1/admin/onboarding/{id}/approve-and-integrate
     * Aprova o pré-cadastro com dados validados pelo gestor, cadastra a licenciada na tabela central
     * `licenciadas` e gera o contrato DRAFT correspondente.
     */
    public function approveAndIntegrate($id) {
        try {
            $input = $this->getInput();
            $adminId = $this->getAdminId();

            $result = $this->onboardingService->approveAndIntegrateLicenciada((int)$id, $input, $adminId);

            Response::json($result, 200);
        } catch (Throwable $e) {
            Response::error('Erro ao aprovar e integrar licenciada: ' . $e->getMessage(), 400);
        }
    }

    // =========================================================================
    // SANDBOX, TESTES & DELEGAÇÃO (PLAN-083)
    // =========================================================================

    /**
     * DELETE /api/v1/admin/onboarding/requests/{id} OR /api/v1/admin/onboarding/{id}
     */
    public function deleteRequest($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $adminId = $this->getAdminId();
            $result = $this->onboardingService->deleteRequest($id, $adminId);
            Response::json($result, 200);
        } catch (Throwable $e) {
            Response::error('Erro ao excluir solicitação: ' . $e->getMessage(), 400);
        }
    }

    /**
     * POST /api/v1/admin/onboarding/sandbox/generate-quick
     */
    public function generateQuickMock() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $input = $this->getInput();
            $adminId = $this->getAdminId();
            $categoria = $input['categoria'] ?? 'Licenciamento';
            $futureCohortTag = $input['future_cohort_tag'] ?? null;

            $result = $this->onboardingService->generateQuickMockLead($adminId, $categoria, $futureCohortTag);
            Response::json($result, 201);
        } catch (Throwable $e) {
            Response::error('Erro ao gerar lead de teste: ' . $e->getMessage(), 400);
        }
    }

    /**
     * POST /api/v1/admin/onboarding/sandbox/purge-tests
     */
    public function purgeTestRequests() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado. Requer privilégios de Administrador.', 403);
            return;
        }

        try {
            $adminId = $this->getAdminId();
            $result = $this->onboardingService->purgeAllTestRequests($adminId);
            Response::json($result, 200);
        } catch (Throwable $e) {
            Response::error('Erro ao purgar leads de teste: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PATCH /api/v1/admin/onboarding/requests/{id}/assign OR /api/v1/admin/onboarding/{id}/assign
     */
    public function assignRequest($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $input = $this->getInput();
            $targetAdminId = (int)($input['assigned_admin_id'] ?? 0);
            if ($targetAdminId <= 0) {
                Response::error('Campo assigned_admin_id é obrigatório.', 400);
                return;
            }

            $futureCohortTag = $input['future_cohort_tag'] ?? null;
            $currentAdminId = $this->getAdminId();

            $ok = $this->onboardingService->assignRequest((int)$id, $targetAdminId, $futureCohortTag, $currentAdminId);

            Response::json([
                'success' => $ok,
                'message' => 'Gestor responsável atribuído com sucesso.',
                'assigned_admin_id' => $targetAdminId,
                'future_cohort_tag' => $futureCohortTag
            ], 200);
        } catch (Throwable $e) {
            Response::error('Erro ao atribuir gestor: ' . $e->getMessage(), 400);
        }
    }
}


