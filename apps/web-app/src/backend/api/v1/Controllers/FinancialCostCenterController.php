<?php
require_once __DIR__ . '/../Services/CostCenterService.php';

use BodyHarmony\Services\CostCenterService;

class FinancialCostCenterController {
    private $db;
    private CostCenterService $costCenterService;

    public function __construct() {
        global $pdo, $db;
        $this->db = $pdo ?? $db;
        $this->costCenterService = new CostCenterService($this->db);
    }

    public function list() {
        try {
            $data = $this->costCenterService->list();
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log('[FinancialCostCenterController] list error: ' . $e->getMessage());
            Response::error('Erro ao listar centros de custo.', 500);
        }
    }

    public function create() {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body || empty($body['name']) || empty($body['tag'])) {
            Response::error('Nome e tag sao obrigatorios.', 400);
            return;
        }
        try {
            $data = $this->costCenterService->create($body);
            Response::json(['success' => true, 'data' => $data], 201);
        } catch (\Throwable $e) {
            error_log('[FinancialCostCenterController] create error: ' . $e->getMessage());
            Response::error($e->getMessage(), 422);
        }
    }

    public function update($id) {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body) {
            Response::error('Dados nao fornecidos.', 400);
            return;
        }
        try {
            $result = $this->costCenterService->update((int)$id, $body);
            if ($result) {
                Response::json(['success' => true, 'data' => ['message' => 'Centro de custo atualizado.']]);
            } else {
                Response::error('Centro de custo nao encontrado.', 404);
            }
        } catch (\Throwable $e) {
            error_log('[FinancialCostCenterController] update error: ' . $e->getMessage());
            Response::error($e->getMessage(), 422);
        }
    }

    public function delete($id) {
        try {
            $result = $this->costCenterService->delete((int)$id);
            if ($result) {
                Response::json(['success' => true, 'data' => ['message' => 'Centro de custo excluido.']]);
            } else {
                Response::error('Centro de custo nao encontrado.', 404);
            }
        } catch (\Throwable $e) {
            error_log('[FinancialCostCenterController] delete error: ' . $e->getMessage());
            Response::error($e->getMessage(), 422);
        }
    }

    public function listExpenses($id) {
        try {
            $data = $this->costCenterService->listExpenses((int)$id);
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log('[FinancialCostCenterController] listExpenses error: ' . $e->getMessage());
            Response::error($e->getMessage(), 404);
        }
    }

    public function createExpense() {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body || empty($body['cost_center_id']) || empty($body['description']) || empty($body['amount_cents'])) {
            Response::error('Dados incompletos para registrar despesa.', 400);
            return;
        }
        try {
            $data = $this->costCenterService->createExpense($body);
            Response::json(['success' => true, 'data' => $data], 201);
        } catch (\Throwable $e) {
            error_log('[FinancialCostCenterController] createExpense error: ' . $e->getMessage());
            Response::error($e->getMessage(), 422);
        }
    }
}
