<?php
require_once __DIR__ . '/../Services/Licenciada360Service.php';

use BodyHarmony\Services\Licenciada360Service;

class Licenciada360Controller {
    private $db;
    private Licenciada360Service $service;

    public function __construct() {
        global $pdo, $db;
        $this->db = $pdo ?? $db;
        $this->service = new Licenciada360Service($this->db);
    }

    public function getDossier(string $id) {
        try {
            $dossier = $this->service->getDossier((int)$id);
            if (!$dossier) {
                Response::error("Licenciada #{$id} não encontrada.", 404);
                return;
            }
            Response::json(['success' => true, 'data' => $dossier]);
        } catch (\Throwable $e) {
            error_log("[Licenciada360Controller] getDossier error: " . $e->getMessage());
            Response::error("Erro ao carregar Dossiê 360º: " . $e->getMessage(), 500);
        }
    }

    public function updateDossier(string $id) {
        try {
            global $loggedUser;
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?: $_POST;
            $result = $this->service->updateProfileAndPropagate((int)$id, $data, $loggedUser);
            ResponseCache::clear('admin_financial_');
            ResponseCache::clear('admin_license_taxes_');
            ResponseCache::clear('gestor_licenciadas_list_');
            Response::json($result);
        } catch (\Throwable $e) {
            error_log("[Licenciada360Controller] updateDossier error: " . $e->getMessage());
            Response::error($e->getMessage(), 400);
        }
    }

    public function sync360() {
        try {
            global $loggedUser;
            $result = $this->service->autoHealAndLinkAll();
            $this->service->logAudit('sync_360_all', null, null, $result, null, count($result), $loggedUser);
            ResponseCache::clear('admin_financial_');
            ResponseCache::clear('admin_license_taxes_');
            ResponseCache::clear('gestor_licenciadas_list_');
            Response::json(['success' => true, 'data' => $result]);
        } catch (\Throwable $e) {
            error_log("[Licenciada360Controller] sync360 error: " . $e->getMessage());
            Response::error("Erro ao sincronizar dados 360º: " . $e->getMessage(), 500);
        }
    }

    public function getView360() {
        try {
            $filters = [
                'search' => $_GET['search'] ?? null,
                'status' => $_GET['status'] ?? null,
                'method' => $_GET['method'] ?? null
            ];
            $result = $this->service->getUnifiedStream($filters);
            Response::json([
                'success' => true,
                'data' => $result['data'],
                'summary' => $result['summary']
            ]);
        } catch (\Throwable $e) {
            error_log("[Licenciada360Controller] getView360 error: " . $e->getMessage());
            Response::error("Erro ao carregar View 360º de Licenciadas: " . $e->getMessage(), 500);
        }
    }
}
