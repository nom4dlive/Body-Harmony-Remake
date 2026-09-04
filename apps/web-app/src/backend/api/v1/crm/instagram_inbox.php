<?php
// apps/web-app/src/backend/api/v1/crm/instagram_inbox.php
// Dedicated Instagram Hub & Direct Messages Provider via Zernio API (PLAN-201)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/ZernioApiService.php';
require_once __DIR__ . '/../Services/CrmBridgeService.php';

use BodyHarmony\Services\ZernioApiService;
use BodyHarmony\Services\CrmBridgeService;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $zernio = new ZernioApiService();
    $crmBridge = new CrmBridgeService($dbConn);

    $action = $_GET['action'] ?? ($_POST['action'] ?? '');
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($action)) {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        $action = $json['action'] ?? 'send_dm';
    }

    switch ($action) {
        case 'conversations':
        case 'list':
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $res = $zernio->getInstagramConversations($limit);
            if (!$res['success']) {
                http_response_code(502);
                echo json_encode($res);
                exit;
            }

            // Enriquecer conversas com dados do CRM se houver correspondência
            $conversations = $res['conversations'];
            foreach ($conversations as &$conv) {
                if (!empty($conv['username'])) {
                    $dossier = $crmBridge->resolveContactByPhone($conv['username']);
                    if (!empty($dossier['name']) && $dossier['name'] !== 'Contato Não Cadastrado') {
                        $conv['name'] = $dossier['name'];
                        $conv['category'] = $dossier['category'] ?? 'LICENCIADA / ALUNA';
                    }
                }
            }

            echo json_encode([
                'success' => true,
                'account' => '@bodyharmonyoficial',
                'platform' => 'INSTAGRAM',
                'count' => count($conversations),
                'conversations' => $conversations
            ]);
            break;

        case 'messages':
            $convId = $_GET['conversation_id'] ?? $_GET['id'] ?? '';
            if (empty($convId)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'conversation_id obrigatório']);
                exit;
            }

            $res = $zernio->getConversationMessages($convId);
            echo json_encode($res);
            break;

        case 'send_dm':
        case 'send':
            $raw = file_get_contents('php://input');
            $body = json_decode($raw, true) ?: $_POST;

            $convId = $body['conversation_id'] ?? $body['id'] ?? '';
            $message = trim($body['message'] ?? $body['text'] ?? '');
            $attachments = $body['attachments'] ?? [];

            if (empty($convId) || empty($message)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'conversation_id e message são obrigatórios']);
                exit;
            }

            $res = $zernio->sendDirectMessage($convId, $message, $attachments);
            echo json_encode($res);
            break;

        case 'mark_read':
            $raw = file_get_contents('php://input');
            $body = json_decode($raw, true) ?: $_POST;
            $convId = $body['conversation_id'] ?? $body['id'] ?? '';
            if (!empty($convId)) {
                $res = $zernio->markConversationRead($convId);
                echo json_encode($res);
            } else {
                echo json_encode(['success' => true]);
            }
            break;

        case 'telemetry':
        default:
            $accountsRes = $zernio->getAccounts();
            echo json_encode([
                'success' => true,
                'service' => 'Zernio Instagram Integration',
                'account_username' => 'bodyharmonyoficial',
                'status' => 'CONNECTED',
                'accounts' => $accountsRes['data'] ?? []
            ]);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno no Hub do Instagram: ' . $e->getMessage()
    ]);
}
