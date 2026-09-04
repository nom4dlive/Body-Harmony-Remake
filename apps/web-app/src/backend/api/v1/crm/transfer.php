<?php
// apps/web-app/src/backend/api/v1/crm/transfer.php
// CRM V4 Conversation Transfer & Hand-off Endpoint (Nexus Protocol V4.0 / PLAN-183)

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

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];

    $conversationId = $data['conversation_id'] ?? $data['conversationId'] ?? '';
    $targetLine = $data['target_line'] ?? $data['targetLine'] ?? 'VENDAS';
    $targetAttendant = $data['target_attendant'] ?? $data['targetAttendantId'] ?? '';
    $contextNote = trim($data['context_note'] ?? $data['contextNote'] ?? '');
    $fromUser = $data['from_user'] ?? $data['fromUser'] ?? 'Atendente';
    $priority = $data['priority'] ?? 'NORMAL';

    if (empty($conversationId) || empty($contextNote)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'ID da conversa e Nota de Contexto são obrigatórios para realizar a transferência.'
        ]);
        exit;
    }

    // 1. Gravar registro de auditoria na tabela crm_conversation_transfers
    if ($dbConn) {
        $dbConn->exec("
            CREATE TABLE IF NOT EXISTS `crm_conversation_transfers` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `conversation_id` VARCHAR(100) NOT NULL,
                `from_user` VARCHAR(100) NOT NULL,
                `to_line` ENUM('CLINICA', 'JURIDICO', 'VENDAS', 'SUPORTE') NOT NULL,
                `to_user` VARCHAR(100) NULL,
                `context_note` TEXT NOT NULL,
                `priority` ENUM('NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        $stmt = $dbConn->prepare("
            INSERT INTO crm_conversation_transfers
            (conversation_id, from_user, to_line, to_user, context_note, priority)
            VALUES (:conv, :from_u, :to_l, :to_u, :note, :prio)
        ");
        $stmt->execute([
            ':conv' => $conversationId,
            ':from_u' => $fromUser,
            ':to_l' => $targetLine,
            ':to_u' => $targetAttendant,
            ':note' => $contextNote,
            ':prio' => $priority
        ]);
    }

    // 2. Injetar Nota Interna (Whisper) no Chatwoot / Mensagens
    $chatwootUrl = getenv('CHATWOOT_URL') ?: 'https://crm.bodyharmony.com.br';
    $apiToken = getenv('CHATWOOT_API_TOKEN') ?: 'wxvcKsycZEXjrqM7dxD72oNm';
    $accountId = 1;

    $formattedNote = "↗️ [TRANSFERÊNCIA DE DEPARTAMENTO]\nDe: {$fromUser}\nPara: {$targetLine} (" . ($targetAttendant ?: 'Fila Geral') . ")\nPrioridade: {$priority}\n\n📝 Nota de Contexto:\n{$contextNote}";

    if (str_starts_with($conversationId, 'cw_')) {
        $realCwId = substr($conversationId, 3);
        $payload = [
            'content' => $formattedNote,
            'message_type' => 'outgoing',
            'private' => true // Whisper
        ];

        $ch = curl_init("{$chatwootUrl}/api/v1/accounts/{$accountId}/conversations/{$realCwId}/messages");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "api_access_token: {$apiToken}",
            "Content-Type: application/json"
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_exec($ch);
        curl_close($ch);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Atendimento transferido com sucesso!',
        'transfer' => [
            'conversation_id' => $conversationId,
            'target_line' => $targetLine,
            'target_attendant' => $targetAttendant,
            'note' => $contextNote,
            'transferred_at' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao processar transferência: ' . $e->getMessage()
    ]);
}
