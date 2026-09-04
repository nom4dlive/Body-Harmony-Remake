<?php
// apps/web-app/src/backend/api/v1/contracts/download.php

require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../admin/contracts/ensure_tables.php';

$uuid = trim($_GET['uuid'] ?? '');
$token = trim($_GET['token'] ?? '');

if (empty($uuid)) {
    http_response_code(400);
    die('UUID do contrato não informado.');
}

try {
    $pdo = getDbConnection();
    ensureContractsTablesExist($pdo);

    // Check if admin is authenticated (via Authorization header OR query token)
    $isAdmin = false;
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $candidateAdminToken = '';
    if (isset($headers['Authorization']) && preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
        $candidateAdminToken = $matches[1];
    }
    if (empty($candidateAdminToken) && !empty($token)) {
        $candidateAdminToken = $token;
    }

    if (!empty($candidateAdminToken)) {
        try {
            $stmt = $pdo->prepare("SELECT user_id FROM admin_sessions WHERE token = ? AND expires_at > NOW()");
            $stmt->execute([$candidateAdminToken]);
            if ($stmt->fetchColumn()) {
                $isAdmin = true;
            }
        } catch (Throwable $e) {
            $isAdmin = false;
        }
    }

    // Find contract
    $stmt = $pdo->prepare("SELECT * FROM contracts WHERE uuid = ?");
    $stmt->execute([$uuid]);
    $contract = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$contract) {
        http_response_code(404);
        die('Contrato não encontrado.');
    }

    // If not admin, check sign_token or contract uuid
    if (!$isAdmin) {
        if (empty($token) || ($contract['sign_token'] !== $token && $contract['uuid'] !== $token)) {
            http_response_code(401);
            die('Acesso não autorizado ao documento.');
        }
    }

    $filePath = __DIR__ . '/../../../../' . ($contract['pdf_path'] ?? '');
    if (empty($contract['pdf_path']) || !file_exists($filePath)) {
        try {
            require_once __DIR__ . '/../Services/ContractPdfService.php';
            $sigStmt = $pdo->prepare("SELECT * FROM contract_signatures WHERE contract_id = ? ORDER BY id ASC");
            $sigStmt->execute([$contract['id']]);
            $signatures = $sigStmt->fetchAll(PDO::FETCH_ASSOC);

            $pdfService = new \BodyHarmony\Services\ContractPdfService();
            $pdfResult = $pdfService->generatePdf(
                $contract['rendered_html'] ?? '',
                $contract['uuid'],
                $contract['title'],
                $signatures,
                true
            );

            $contract['pdf_path'] = $pdfResult['relative_path'];
            $filePath = __DIR__ . '/../../../../' . $pdfResult['relative_path'];

            $upd = $pdo->prepare("UPDATE contracts SET pdf_path = ?, sha256_hash = ? WHERE id = ?");
            $upd->execute([$pdfResult['relative_path'], $pdfResult['sha256_hash'], $contract['id']]);
        } catch (Throwable $eRegen) {
            error_log("[contracts/download.php] PDF auto-regen error: " . $eRegen->getMessage());
        }
    }

    if (empty($contract['pdf_path']) || !file_exists($filePath)) {
        http_response_code(404);
        die('Arquivo PDF do contrato não localizado no servidor.');
    }

    $filename = preg_replace('/[^a-zA-Z0-9_-]/', '_', $contract['title']) . '_' . substr($uuid, 0, 8) . '.pdf';

    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: private, max-age=0, must-revalidate');
    header('Pragma: public');

    readfile($filePath);
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    die('Erro ao processar download: ' . $e->getMessage());
}
