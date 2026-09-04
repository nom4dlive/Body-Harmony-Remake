<?php
// apps/web-app/src/backend/api/v1/crm/google_drive.php
// Body Harmony Nexus V3.1 — Google Drive Folders & Files API Controller (PLAN-177 / V4.2)

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../Services/GoogleWorkspaceService.php';

use BodyHarmony\Services\GoogleWorkspaceService;

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

global $pdo, $db;
$dbConn = $pdo ?? $db ?? null;

$service = new GoogleWorkspaceService($dbConn);
$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');

try {
    if ($method === 'GET') {
        $parentId = !empty($_GET['parent_id']) ? trim($_GET['parent_id']) : null;
        $res = $service->listDriveFoldersAndFiles($parentId);
        echo json_encode($res, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'POST') {
        // 1. Upload Multipart de arquivo
        if (isset($_FILES['file'])) {
            $uploaded = $_FILES['file'];
            $folderId = $_POST['folder_id'] ?? 'root';
            $filename = $uploaded['name'] ?? ('documento_' . date('Ymd_His') . '.pdf');
            $mimeType = $uploaded['type'] ?? 'application/pdf';
            $content = file_get_contents($uploaded['tmp_name']);

            $result = $service->uploadDriveFile($folderId, $filename, $mimeType, $content);
            echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit;
        }

        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true) ?: $_POST;
        $postAction = $input['action'] ?? $action;

        // 2. Renomear Item
        if ($postAction === 'rename') {
            $fileId = $input['file_id'] ?? '';
            $newName = $input['new_name'] ?? 'Sem Nome';
            $res = $service->renameDriveItem($fileId, $newName);
            echo json_encode($res, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit;
        }

        // 3. Garantir / Criar Pasta de Prontuário
        $patientName = $input['patient_name'] ?? 'Paciente';
        $cpf = $input['cpf'] ?? null;
        $folderType = $input['folder_type'] ?? 'PRONTUARIO';

        $result = $service->ensurePatientFolder($patientName, $cpf, $folderType);
        echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

