<?php
// apps/web-app/src/backend/api/v1/crm/inbox_actions.php
// CRM V4 Inbox Actions Controller (Direct MySQL Actions) - PLAN-224

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    if (!$dbConn) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database connection failed']);
        exit;
    }

    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?: [];

    $conversationId = trim((string)($input['conversation_id'] ?? ''));
    $action = trim((string)($input['action'] ?? ''));

    if (empty($conversationId) || empty($action)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'conversation_id e action são obrigatórios.']);
        exit;
    }

    $numericId = preg_replace('/^(cw_|conv_)/', '', $conversationId);
    $result = ['success' => true];

    // 1. ALTERNAR STATUS DA CONVERSA (OPEN, RESOLVED, SNOOZED, PENDING)
    if ($action === 'toggle_status') {
        $status = strtoupper(trim((string)($input['status'] ?? 'RESOLVED')));
        if (!in_array($status, ['OPEN', 'RESOLVED', 'SNOOZED', 'PENDING'])) {
            $status = 'RESOLVED';
        }

        $stmt = $dbConn->prepare("UPDATE crm_conversations SET status = :st, updated_at = NOW() WHERE id = :id");
        $stmt->execute([':st' => $status, ':id' => (int)$numericId]);
        $result['new_status'] = strtolower($status);
    }

    // 2. ATRIBUIR ATENDENTE / AGENTE
    elseif ($action === 'assign_agent') {
        $attendantUsername = trim((string)($input['agent_username'] ?? ($input['attendant_username'] ?? ($input['agent_id'] ?? ''))));
        $stmt = $dbConn->prepare("UPDATE crm_conversations SET attendant_username = :att, updated_at = NOW() WHERE id = :id");
        $stmt->execute([':att' => $attendantUsername, ':id' => (int)$numericId]);
        $result['assigned_attendant'] = $attendantUsername;
    }

    // 3. ADICIONAR / ATUALIZAR TAGS
    elseif ($action === 'add_labels' || $action === 'update_tags') {
        $tags = $input['labels'] ?? ($input['tags'] ?? []);
        $stmt = $dbConn->prepare("UPDATE crm_conversations SET tags_json = :tags, updated_at = NOW() WHERE id = :id");
        $stmt->execute([':tags' => json_encode($tags), ':id' => (int)$numericId]);
        $result['tags'] = $tags;
    }

    echo json_encode($result);
    exit;

} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno ao executar ação no CRM: ' . $e->getMessage()
    ]);
}
