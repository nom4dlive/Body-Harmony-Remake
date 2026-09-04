<?php
require_once __DIR__ . '/../Services/FinancialService.php';

use BodyHarmony\Services\FinancialService;

class FinancialDashboardController {
    private $db;
    private FinancialService $financialService;

    public function __construct() {
        global $pdo, $db;
        $this->db = $pdo ?? $db;
        $this->financialService = new FinancialService($this->db);
    }

    public function getDashboard() {
        try {
            $period = $_GET['period'] ?? '30d';
            $data = $this->financialService->getDashboardKPIs($period);
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log('[FinancialDashboardController] getDashboard error: ' . $e->getMessage());
            Response::error('Erro ao carregar dashboard financeiro.', 500);
        }
    }

    public function getTransactions() {
        try {
            $filters = [
                'page' => $_GET['page'] ?? 1,
                'per_page' => $_GET['per_page'] ?? 20,
                'status' => $_GET['status'] ?? null,
                'type' => $_GET['type'] ?? null,
                'source_type' => $_GET['source_type'] ?? null,
                'tax_tag' => $_GET['tax_tag'] ?? null,
                'category' => $_GET['category'] ?? null,
                'event_tag' => $_GET['event_tag'] ?? null,
                'date_from' => $_GET['date_from'] ?? null,
                'date_to' => $_GET['date_to'] ?? null,
                'search' => $_GET['search'] ?? null,
                'sort' => $_GET['sort'] ?? 'created_at',
                'order' => $_GET['order'] ?? 'desc'
            ];
            $data = $this->financialService->getTransactions($filters);
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log('[FinancialDashboardController] getTransactions error: ' . $e->getMessage());
            Response::error('Erro ao listar transacoes.', 500);
        }
    }

    public function createTransaction() {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body || empty($body['amount_cents']) || empty($body['description'])) {
            Response::error('Dados incompletos para registrar transacao.', 400);
            return;
        }
        try {
            $data = $this->financialService->createTransaction($body);
            ResponseCache::clear('admin_financial_');
            ResponseCache::clear('admin_license_taxes_');
            Response::json(['success' => true, 'data' => $data], 201);
        } catch (\Throwable $e) {
            error_log('[FinancialDashboardController] createTransaction error: ' . $e->getMessage());
            Response::error('Erro ao registrar transacao.', 500);
        }
    }

    public function getCategories() {
        try {
            $data = $this->financialService->getExpenseCategories();
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log('[FinancialDashboardController] getCategories error: ' . $e->getMessage());
            Response::error('Erro ao carregar categorias de despesa.', 500);
        }
    }

    public function createExpense() {
        global $loggedUser;
        $body = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        if (!$body || empty($body['amount_cents']) || empty($body['description'])) {
            Response::error('Dados incompletos para registrar despesa.', 400);
            return;
        }
        try {
            $adminId = $loggedUser['id'] ?? null;
            $data = $this->financialService->createExpense($body, $adminId, $loggedUser);
            ResponseCache::clear('admin_financial_');
            ResponseCache::clear('admin_license_taxes_');
            Response::json(['success' => true, 'data' => $data], 201);
        } catch (\Throwable $e) {
            error_log('[FinancialDashboardController] createExpense error: ' . $e->getMessage());
            Response::error($e->getMessage(), 400);
        }
    }

    public function getDreExpanded() {
        try {
            $dateFrom = $_GET['date_from'] ?? null;
            $dateTo = $_GET['date_to'] ?? null;
            $data = $this->financialService->getDreExpanded($dateFrom, $dateTo);
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log('[FinancialDashboardController] getDreExpanded error: ' . $e->getMessage());
            Response::error('Erro ao gerar relatorio DRE expandido.', 500);
        }
    }

    public function getDre() {
        try {
            $eventTag = $_GET['event_tag'] ?? null;
            $dateFrom = $_GET['date_from'] ?? null;
            $dateTo = $_GET['date_to'] ?? null;
            $data = $this->financialService->getDreByEvent($eventTag, $dateFrom, $dateTo);
            Response::json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            error_log('[FinancialDashboardController] getDre error: ' . $e->getMessage());
            Response::error('Erro ao gerar relatorio DRE.', 500);
        }
    }
}
