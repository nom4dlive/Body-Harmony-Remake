<?php
// apps/web-app/src/backend/api/v1/crm/hermes_audit.php
// Body Harmony Nexus V3.1 — Hermes AI Audit Trail & Advanced Intelligence API (PLAN-hermes-advanced-audit)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/HermesAdvancedIntelligenceService.php';

use BodyHarmony\Services\HermesAdvancedIntelligenceService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

$service = new HermesAdvancedIntelligenceService($dbConn);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

if (empty($action) && $method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?: [];
    $action = $body['action'] ?? '';
}

try {
    if ($method === 'GET') {
        if ($action === 'knowledge_search') {
            $q = $_GET['q'] ?? '';
            $res = $service->queryKnowledgeBase($q);
            echo json_encode($res);
            exit;
        }

        if ($action === 'patient_memory') {
            $phone = $_GET['phone'] ?? '';
            $res = $service->getPatientLongTermMemory($phone);
            echo json_encode(['success' => true, 'memory' => $res]);
            exit;
        }

        // Padrão GET: Feed e métricas do AI Audit Trail
        $res = $service->getAuditFeedAndMetrics(30);
        echo json_encode($res);
        exit;
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?: [];

        if ($action === 'transcribe_audio') {
            $audioUrl = $data['audio_url'] ?? '';
            $res = $service->transcribeAudio($audioUrl);
            echo json_encode($res);
            exit;
        }

        if ($action === 'analyze_sentiment') {
            $text = $data['text'] ?? '';
            $res = $service->analyzeSentiment($text);
            echo json_encode($res);
            exit;
        }
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno na API de Auditoria do Hermes: ' . $e->getMessage()
    ]);
}
