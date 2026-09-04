<?php
// apps/web-app/src/backend/api/v1/crm/history_import.php
// Body Harmony Nexus V3.1 — CRM History Ingestion Endpoint (PLAN-165 / V4.2)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../Services/CrmHistorySyncService.php';

use BodyHarmony\Services\CrmHistorySyncService;

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: [];

$inboxId = (int)($body['inbox_id'] ?? ($_POST['inbox_id'] ?? ($_GET['inbox_id'] ?? 1)));
$messages = $body['messages'] ?? [];
$phone = trim($body['phone'] ?? ($_POST['phone'] ?? ''));

// 1. Suporte a Upload de Arquivo (.txt do WhatsApp ou .json)
if (empty($messages) && isset($_FILES['file'])) {
    $uploadedFile = $_FILES['file']['tmp_name'] ?? '';
    $originalName = $_FILES['file']['name'] ?? '';
    
    if (file_exists($uploadedFile)) {
        $fileContent = file_get_contents($uploadedFile);

        // Se for JSON
        $decoded = json_decode($fileContent, true);
        if (is_array($decoded)) {
            $messages = isset($decoded['messages']) ? $decoded['messages'] : $decoded;
        } else {
            // Parser de WhatsApp .txt (iOS & Android)
            $lines = explode("\n", $fileContent);
            $parsedMessages = [];

            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line)) continue;

                // Formato iOS: [24/05/2026, 14:32:10] Cibele: Olá, tudo bem?
                // Formato Android: 24/05/2026 14:32 - Cibele: Olá, tudo bem?
                $match = [];
                if (preg_match('/^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(?:-)?\s*([^:]+):\s*(.+)$/i', $line, $match)) {
                    $datePart = $match[1];
                    $timePart = $match[2];
                    $senderName = trim($match[3]);
                    $text = trim($match[4]);

                    // Converter data para timestamp
                    $dateParts = explode('/', $datePart);
                    $year = strlen($dateParts[2]) == 2 ? '20' . $dateParts[2] : $dateParts[2];
                    $isoDate = "{$year}-{$dateParts[1]}-{$dateParts[0]} {$timePart}";
                    $timestamp = strtotime($isoDate) ?: time();

                    $parsedMessages[] = [
                        'phone' => $phone ?: '5518997000000',
                        'sender_name' => $senderName,
                        'content' => $text,
                        'created_at' => $timestamp,
                        'type' => 'TEXT'
                    ];
                }
            }

            if (!empty($parsedMessages)) {
                $messages = $parsedMessages;
            }
        }
    }
}

if ($inboxId <= 0 || empty($messages)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Nenhuma mensagem válida encontrada para importação. Verifique o arquivo .txt ou JSON.'
    ]);
    exit();
}

try {
    $service = new CrmHistorySyncService($dbConn);
    $result = $service->importHistory($inboxId, $messages);
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

