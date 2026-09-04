<?php
// apps/web-app/src/backend/api/v1/Controllers/LmsNotebookController.php
// Nexus Protocol V3.1 — PLAN-105: Native Smart Book & RAG Chat

use BodyHarmony\Services\LmsNotebookService;

class LmsNotebookController {
    private LmsNotebookService $service;

    public function __construct($db = null) {
        global $pdo;
        $dbConn = $db ?? $pdo;
        $this->service = new LmsNotebookService($dbConn);
    }

    /**
     * GET /api/v1/admin/lms/notebooks/modules
     */
    public function listModules() {
        try {
            $category = isset($_GET['category']) ? trim((string)$_GET['category']) : 'all';
            $result = $this->service->listModulesWithNotebookStatus($category);
            Response::json($result);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/admin/lms/notebooks/modules/{id}/sources
     */
    public function getModuleSources($moduleId) {
        try {
            $result = $this->service->getModuleSourcesAndTranscripts((int)$moduleId);
            Response::json($result);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
        }
    }

    /**
     * POST /api/v1/admin/lms/notebooks/modules/{id}/sources/pdf
     */
    public function uploadPdfSource($moduleId) {
        try {
            if (empty($_FILES['file'])) {
                Response::json(['error' => 'Nenhum arquivo enviado.'], 400);
                return;
            }
            $result = $this->service->uploadModulePdfSource((int)$moduleId, $_FILES['file']);
            Response::json($result);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
        }
    }

    /**
     * POST /api/v1/admin/lms/notebooks/modules/{id}/sync
     */
    public function syncModule($moduleId) {
        try {
            $result = $this->service->syncSingleModule((int)$moduleId);
            Response::json($result);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
        }
    }

    /**
     * POST /api/v1/admin/lms/notebooks/sync
     */
    public function syncModules($data = null) {
        try {
            $result = $this->service->syncModulesToNotebooks();
            Response::json($result);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
        }
    }

    /**
     * POST /api/v1/aluna/notebook/ticket
     */
    public function getAuthTicket($data, $licenciadaId = 0) {
        try {
            $moduleId = (int)($data['module_id'] ?? 1);
            $licId = (int)$licenciadaId;
            if ($licId <= 0 && !empty($data['licenciada_id'])) {
                $licId = (int)$data['licenciada_id'];
            }
            if ($licId <= 0) {
                $licId = 1; // Fallback seguro
            }

            $result = $this->service->generateAuthTicket($licId, $moduleId);
            Response::json($result);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/v1/aluna/notebook/chat
     */
    public function chatWithNotebook($data, $licenciadaId = 0) {
        try {
            $moduleId = (int)($data['module_id'] ?? 1);
            $message = trim((string)($data['message'] ?? ''));
            $history = (array)($data['history'] ?? []);

            $licId = (int)$licenciadaId;
            if ($licId <= 0 && !empty($data['licenciada_id'])) {
                $licId = (int)$data['licenciada_id'];
            }
            if ($licId <= 0) $licId = 1;

            if (empty($message)) {
                Response::json(['error' => 'Mensagem não informada.'], 400);
                return;
            }

            $result = $this->service->chatWithNotebook($licId, $moduleId, $message, $history);
            Response::json($result);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            $errorPayload = json_decode($e->getMessage(), true);
            if (is_array($errorPayload)) {
                Response::json($errorPayload, $code);
            } else {
                Response::json(['error' => $e->getMessage()], $code);
            }
        }
    }

    /**
     * POST /api/v1/aluna/notebook/podcast/generate
     */
    public function generatePodcast($data, $licenciadaId = 0) {
        try {
            $moduleId = (int)($data['module_id'] ?? 1);
            $topic = trim((string)($data['topic'] ?? 'Resumo do Módulo'));
            $licId = (int)$licenciadaId > 0 ? (int)$licenciadaId : 1;

            $result = $this->service->generateStudioPodcast($licId, $moduleId, $topic);
            Response::json($result);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/v1/admin/lms/notebooks/impersonate-ticket
     */
    public function getImpersonateTicket($data) {
        try {
            $licenciadaId = (int)($data['licenciada_id'] ?? 1);
            $moduleId = (int)($data['module_id'] ?? 1);
            $result = $this->service->generateAuthTicket($licenciadaId, $moduleId, true);
            Response::json($result);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/v1/admin/lms/notebooks/beta-testers
     */
    public function updateBetaTester($data) {
        try {
            $licenciadaId = (int)($data['licenciada_id'] ?? 0);
            $isActive = !empty($data['is_beta_active']);
            $creditLimit = isset($data['daily_credit_override']) ? (int)$data['daily_credit_override'] : 100;

            if ($licenciadaId <= 0) {
                Response::json(['error' => 'licenciada_id é obrigatório.'], 400);
                return;
            }

            $result = $this->service->updateBetaTesterStatus($licenciadaId, $isActive, $creditLimit);
            Response::json(['success' => true, 'updated' => $result]);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
        }
    }

    /**
     * GET /api/v1/admin/lms/notebooks/beta-testers
     */
    public function listBetaTesters() {
        try {
            $testers = $this->service->listBetaTesters();
            Response::json(['success' => true, 'beta_testers' => $testers]);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/admin/lms/notebooks/governance/settings
     */
    public function getGovernanceSettings() {
        try {
            $res = $this->service->getGovernanceSettings();
            Response::json($res);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/v1/admin/lms/notebooks/governance/settings
     */
    public function updateGovernanceSettings($data) {
        try {
            $res = $this->service->updateGovernanceSettings($data);
            Response::json($res);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/admin/lms/notebooks/governance/insights
     */
    public function getClinicalInsights() {
        try {
            $res = $this->service->getClinicalInsights();
            Response::json($res);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/admin/lms/notebooks/governance/podcasts
     */
    public function getPodcastsGallery() {
        try {
            $res = $this->service->getStudioPodcastsGallery();
            Response::json($res);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/v1/admin/lms/notebooks/governance/podcasts/{id}/feature
     */
    public function togglePodcastFeature($podcastId) {
        try {
            $res = $this->service->togglePodcastFeatured($podcastId);
            Response::json($res);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/aluna/smartbook/transformations
     */
    public function getArtifacts() {
        try {
            $moduleId = isset($_GET['module_id']) ? (int)$_GET['module_id'] : 1;
            $result = $this->service->getModuleArtifacts($moduleId);
            Response::json(['success' => true, 'artifacts' => $result]);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/v1/aluna/smartbook/transformations/execute
     */
    public function executeTransformation($data, $licenciadaId = 0) {
        try {
            $moduleId = (int)($data['module_id'] ?? 1);
            $transformationKey = trim((string)($data['transformation_key'] ?? ''));
            $forceRefresh = !empty($data['force_refresh']);
            $licId = (int)$licenciadaId > 0 ? (int)$licenciadaId : 1;

            if (empty($transformationKey)) {
                Response::json(['error' => 'Chave de transformação não informada.'], 400);
                return;
            }

            $result = $this->service->executeModuleTransformation($moduleId, $transformationKey, $forceRefresh, $licId);
            Response::json($result);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
        }
    }

    /**
     * GET /api/v1/admin/lms/notebook/auth/status
     */
    public function getGoogleAuthStatus() {
        try {
            $status = $this->service->getGoogleAuthStatus();
            Response::json($status);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/admin/lms/notebook/auth/google/url
     */
    public function getGoogleAuthUrl() {
        try {
            $urlData = $this->service->getGoogleAuthUrl();
            Response::json($urlData);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/admin/lms/notebook/auth/google/callback
     */
    public function handleGoogleCallback() {
        try {
            $code = $_GET['code'] ?? null;
            if (!$code) {
                Response::json(['error' => 'Código de autorização ausente.'], 400);
                return;
            }
            $result = $this->service->handleGoogleCallback($code);
            
            // Retorna HTML amigável para fechar o popup ou redireciona
            $siteUrl = defined('SITE_URL') ? SITE_URL : 'https://bodyharmony.com.br';
            header("Content-Type: text/html; charset=utf-8");
            echo "<!DOCTYPE html><html><head><title>Google Autenticado</title></head><body style='font-family:sans-serif;text-align:center;padding:50px;background:#051A29;color:#FFFFFF;'><h2 style='color:#ED7E13;'>Conectado com Sucesso!</h2><p>Você pode fechar esta janela.</p><script>if(window.opener){window.opener.postMessage({type:'GOOGLE_AUTH_SUCCESS',email:'" . addslashes($result['email'] ?? '') . "'},'*');window.close();}else{window.location.href='" . $siteUrl . "/portal-gestor/lms';}</script></body></html>";
            exit;
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/v1/admin/lms/notebook/auth/disconnect
     */
    public function disconnectGoogle() {
        try {
            $result = $this->service->disconnectGoogle();
            Response::json($result);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/admin/lms/notebook/auth/config
     */
    public function getAuthConfig() {
        try {
            $config = $this->service->getAuthConfig();
            Response::json($config);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/v1/admin/lms/notebook/auth/config
     */
    public function saveAuthConfig($data) {
        try {
            $result = $this->service->saveAuthConfig($data ?: []);
            Response::json($result);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/v1/admin/lms/notebook/auth/session-token
     */
    public function saveSessionToken($data) {
        try {
            $tokenRaw = $data['token'] ?? ($data['session_json'] ?? '');
            $result = $this->service->saveSessionToken((string)$tokenRaw);
            Response::json($result);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
        }
    }
}
