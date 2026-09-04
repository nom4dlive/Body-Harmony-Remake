<?php
// apps/web-app/src/backend/api/v1/crm/soul_memory.php
// Body Harmony CRM — Memória Epissódica de Longo Prazo (Soul Memory) do Hermes (PLAN-197)

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

    // POST: Disparar auto-consolidação de memória epissódica
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $raw = file_get_contents('php://input');
        $payload = json_decode($raw, true) ?: $_POST;

        $phone = $payload['phone'] ?? '';
        $messages = $payload['messages'] ?? [];
        $name = $payload['name'] ?? 'Paciente';

        if (empty($phone)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Parâmetro phone obrigatório.']);
            exit;
        }

        $res = $intelService->consolidateSoulMemory($phone, $messages, $name);
        echo json_encode($res);
        exit;
    }

    // GET: Recuperar perfil de alma (Soul Memory)
    $phone = $_GET['phone'] ?? '';
    if (empty($phone)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Parâmetro phone obrigatório.']);
        exit;
    }

    $res = $intelService->getSoulMemory($phone);
    echo json_encode($res);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno na Soul Memory: ' . $e->getMessage()
    ]);
}
