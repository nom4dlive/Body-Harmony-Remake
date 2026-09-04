<?php

require_once __DIR__ . '/../Services/CongressTicketService.php';
require_once __DIR__ . '/../Services/Payment/AsaasGatewayService.php';

use BodyHarmony\Services\CongressTicketService;
use BodyHarmony\Services\Payment\AsaasGatewayService;

/**
 * CongressController — Controlador REST para o Congresso Body Harmony
 * Nexus Protocol V3.1 Compliant
 */
class CongressController {
    private $db;
    private CongressTicketService $ticketService;

    public function __construct() {
        global $pdo, $db;
        $this->db = $pdo ?? $db;
        $this->ticketService = new CongressTicketService($this->db);
    }

    /**
     * GET /api/v1/congress/tiers
     */
    public function getTiers() {
        try {
            $tiers = $this->ticketService->getTiers();
            Response::json([
                'ok' => true,
                'data' => $tiers
            ]);
        } catch (Throwable $e) {
            Response::json([
                'ok' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/v1/congress/coupons/validate
     */
    public function validateCoupon() {
        try {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?: [];

            $code = $data['code'] ?? '';
            $tierId = (int)($data['tier_id'] ?? 0);
            $customerCpf = $data['customer_cpf'] ?? ($data['cpf'] ?? '');
            $customerEmail = $data['customer_email'] ?? ($data['email'] ?? '');

            if (empty($code) || $tierId <= 0) {
                Response::json([
                    'ok' => false,
                    'message' => 'Código do cupom e lote selecionado são obrigatórios.'
                ], 400);
                return;
            }

            $res = $this->ticketService->validateCoupon($code, $tierId, $customerCpf, $customerEmail);
            if (!$res['ok']) {
                Response::json($res, 400);
                return;
            }

            Response::json($res);
        } catch (Throwable $e) {
            Response::json([
                'ok' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/v1/admin/congress/coupons
     */
    public function listAdminCoupons() {
        try {
            $res = $this->ticketService->listAdminCoupons();
            Response::json($res);
        } catch (Throwable $e) {
            Response::json(['ok' => false, 'error' => $e->getMessage(), 'data' => []], 500);
        }
    }

    /**
     * POST /api/v1/admin/congress/coupons
     */
    public function saveAdminCoupon() {
        try {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?: [];
            $res = $this->ticketService->saveAdminCoupon($data);
            $status = !empty($res['ok']) ? 200 : 400;
            Response::json($res, $status);
        } catch (Throwable $e) {
            Response::json(['ok' => false, 'message' => 'Erro ao salvar cupom: ' . $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/v1/admin/congress/coupons/{id}
     */
    public function deleteAdminCoupon($id) {
        try {
            $couponId = (int)$id;
            if ($couponId <= 0) {
                Response::json(['ok' => false, 'message' => 'ID de cupom inválido.'], 400);
                return;
            }
            $res = $this->ticketService->deleteAdminCoupon($couponId);
            Response::json($res);
        } catch (Throwable $e) {
            Response::json(['ok' => false, 'message' => 'Erro ao excluir cupom: ' . $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/admin/congress/coupons/{id}/usages
     */
    public function getCouponUsages($id) {
        try {
            $couponId = (int)$id;
            if ($couponId <= 0) {
                Response::json(['ok' => false, 'message' => 'ID de cupom inválido.', 'data' => []], 400);
                return;
            }
            $res = $this->ticketService->getCouponUsages($couponId);
            Response::json($res);
        } catch (Throwable $e) {
            Response::json(['ok' => false, 'message' => 'Erro ao buscar usos: ' . $e->getMessage(), 'data' => []], 500);
        }
    }

    /**
     * POST /api/v1/congress/checkout
     */
    public function checkout() {
        try {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?: [];

            $res = $this->ticketService->checkout($data);
            Response::json($res);
        } catch (Exception $e) {
            Response::json([
                'ok' => false,
                'error' => $e->getMessage()
            ], 400);
        } catch (Throwable $e) {
            Response::json([
                'ok' => false,
                'error' => 'Erro interno ao processar inscrição: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/v1/admin/congress/checkin
     */
    public function checkIn() {
        try {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?: [];
            $token = $data['ticket_token'] ?? ($data['token'] ?? '');

            if (empty($token)) {
                Response::json(['ok' => false, 'message' => 'Token do ingresso é obrigatório.'], 400);
                return;
            }

            $res = $this->ticketService->processCheckIn($token);
            $status = !empty($res['ok']) ? 200 : 400;
            Response::json($res, $status);
        } catch (Throwable $e) {
            Response::json(['ok' => false, 'message' => 'Erro ao processar check-in: ' . $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/congress/ticket/{token}
     */
    public function getTicket(string $token) {
        try {
            $ticket = $this->ticketService->getTicketByToken($token);
            if (!$ticket) {
                Response::json([
                    'ok' => false,
                    'error' => 'Ingresso ou credencial não encontrada para o token informado.'
                ], 404);
                return;
            }

            Response::json([
                'ok' => true,
                'data' => $ticket
            ]);
        } catch (Throwable $e) {
            Response::json([
                'ok' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/v1/congress/ticket/lookup
     */
    public function lookupTicket() {
        try {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?: [];

            $identifier = $data['identifier'] ?? ($data['cpf'] ?? ($data['email'] ?? ''));
            if (empty($identifier)) {
                Response::json([
                    'ok' => false,
                    'data' => [],
                    'message' => 'Informe o CPF ou E-mail cadastrado.'
                ], 400);
                return;
            }

            $res = $this->ticketService->lookupTickets($identifier);
            $status = !empty($res['ok']) ? 200 : 400;
            Response::json($res, $status);
        } catch (Throwable $e) {
            Response::json([
                'ok' => false,
                'data' => [],
                'message' => 'Erro interno ao consultar ingressos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/v1/payments/webhook/asaas
     */
    public function handleAsaasWebhook() {
        try {
            $raw = file_get_contents('php://input');
            $eventData = json_decode($raw, true) ?: [];

            // Captura de headers HTTP para validação do token Asaas
            $headers = function_exists('getallheaders') ? getallheaders() : [];
            $receivedToken = $_SERVER['HTTP_ASAAS_ACCESS_TOKEN'] 
                ?? $headers['asaas-access-token'] 
                ?? $headers['Asaas-Access-Token'] 
                ?? null;

            $res = $this->ticketService->handleAsaasWebhook($eventData, $receivedToken);
            $statusCode = !empty($res['status']) ? (int)$res['status'] : 200;
            Response::json($res, $statusCode);
        } catch (Throwable $e) {
            Response::json([
                'ok' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/v1/admin/congress/tiers/{id}
     * Atualiza um lote de ingresso do congresso
     */
    public function updateTier($tierId) {
        try {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?: [];

            $tierId = (int)$tierId;
            if ($tierId <= 0) {
                Response::json(['ok' => false, 'message' => 'ID do lote inválido.'], 400);
                return;
            }

            $res = $this->ticketService->updateTier($tierId, $data);
            $status = !empty($res['ok']) ? 200 : 400;
            Response::json($res, $status);
        } catch (Throwable $e) {
            Response::json([
                'ok' => false,
                'message' => 'Erro ao atualizar lote: ' . $e->getMessage()
            ], 500);
        }
    }
}
