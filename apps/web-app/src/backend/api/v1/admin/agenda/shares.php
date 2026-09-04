<?php
// apps/web-app/src/backend/api/v1/admin/agenda/shares.php

require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../../../auth_check.php';
require_once __DIR__ . '/../../Services/AgendaService.php';

use BodyHarmony\Services\AgendaService;

header('Content-Type: application/json; charset=utf-8');

try {
    global $pdo, $current_user_id;
    $agendaService = new AgendaService($pdo);

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $shares = $agendaService->listAgendaShares((int)$current_user_id);
        echo json_encode([
            'success' => true,
            'shares' => $shares
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $sharedWithId = (int)($body['shared_with_admin_id'] ?? 0);
        $level = in_array($body['permission_level'] ?? '', ['read_only', 'can_edit'], true) ? $body['permission_level'] : 'read_only';

        if ($sharedWithId <= 0 || $sharedWithId === (int)$current_user_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Destinatário de compartilhamento inválido']);
            exit;
        }

        $ok = $agendaService->shareAgenda((int)$current_user_id, $sharedWithId, $level);
        echo json_encode([
            'success' => $ok,
            'message' => 'Agenda compartilhada com sucesso!'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'DELETE') {
        $sharedWithId = (int)($_GET['shared_with_admin_id'] ?? 0);
        if ($sharedWithId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'shared_with_admin_id é obrigatório']);
            exit;
        }

        $ok = $agendaService->revokeAgendaShare((int)$current_user_id, $sharedWithId);
        echo json_encode([
            'success' => $ok,
            'message' => 'Compartilhamento revogado com sucesso.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
