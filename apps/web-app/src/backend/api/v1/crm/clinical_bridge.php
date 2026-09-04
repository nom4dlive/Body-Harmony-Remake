<?php
// apps/web-app/src/backend/api/v1/crm/clinical_bridge.php
// Body Harmony CRM — Bridge Relacional Protocolo 3S <-> Funil de Vendas & NLP Clínico (PLAN-195)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/HermesAdvancedIntelligenceService.php';

use BodyHarmony\Services\HermesAdvancedIntelligenceService;

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    $intelService = new HermesAdvancedIntelligenceService($dbConn);

    // POST: Ingestão NLP ou sincronização manual da ponte
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $raw = file_get_contents('php://input');
        $payload = json_decode($raw, true) ?: $_POST;

        $action = $payload['action'] ?? 'save_bridge';

        if ($action === 'nlp_extract') {
            $phone = $payload['phone'] ?? '';
            $text = $payload['text'] ?? '';
            $name = $payload['name'] ?? 'Cliente';
            $res = $intelService->extractStructuredClinicalProfile($phone, $text, $name);
            echo json_encode($res);
            exit;
        }

        $res = $intelService->saveProtocolSalesBridge($payload);
        echo json_encode($res);
        exit;
    }

    // GET: Buscar ponte clínica-comercial do contato
    $phone = $_GET['phone'] ?? '';
    if (empty($phone)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Parâmetro phone obrigatório.']);
        exit;
    }

    $res = $intelService->getProtocolSalesBridge($phone);
    echo json_encode($res);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao processar ponte clínica-vendas: ' . $e->getMessage()
    ]);
}
