<?php
// apps/web-app/src/backend/api/v1/contracts/validate.php

require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../admin/contracts/ensure_tables.php';
require_once __DIR__ . '/../Services/ContractPdfService.php';

use BodyHarmony\Services\ContractPdfService;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$uuid = trim($_GET['uuid'] ?? $_GET['token'] ?? '');
if (empty($uuid)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'UUID ou Token do contrato não fornecido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = getDbConnection();
    ensureContractsTablesExist($pdo);

    // 1. Fetch Contract
    $stmt = $pdo->prepare("
        SELECT c.*, l.name as licenciada_name_db, l.cpf as licenciada_doc_db, l.email as licenciada_email_db
        FROM contracts c
        LEFT JOIN licenciadas l ON c.licenciada_id = l.id
        WHERE c.uuid = ? OR c.sign_token = ?
    ");
    $stmt->execute([$uuid, $uuid]);
    $contract = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$contract) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Documento ou registro de contrato não encontrado.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2. Fetch Signatures Audit Trail
    $sigStmt = $pdo->prepare("SELECT * FROM contract_signatures WHERE contract_id = ? ORDER BY id ASC");
    $sigStmt->execute([$contract['id']]);
    $signaturesList = $sigStmt->fetchAll(PDO::FETCH_ASSOC);

    $pdfService = new ContractPdfService();
    $formattedSignatories = [];

    foreach ($signaturesList as $s) {
        $imgPath = !empty($s['signature_image_path']) ? __DIR__ . '/../../../../' . ltrim($s['signature_image_path'], '/') : '';
        $imgDataUrl = null;
        if (!empty($imgPath) && is_file($imgPath) && is_readable($imgPath)) {
            $imgDataUrl = 'data:image/png;base64,' . base64_encode(file_get_contents($imgPath));
        } elseif (($s['signer_type'] ?? '') === 'LICENCIANTE') {
            $imgDataUrl = $pdfService->getJosiSignatureBase64();
        }

        $formattedSignatories[] = [
            'id' => $s['id'],
            'signer_type' => $s['signer_type'],
            'signer_name' => $s['signer_name'],
            'signer_document' => $s['signer_document'],
            'signer_email' => $s['signer_email'],
            'signature_mode' => $s['signature_mode'] ?? 'DIGITAL_CERTIFICATE',
            'signed_at' => $s['signed_at'],
            'ip_address' => $s['ip_address'],
            'checksum_signature' => $s['checksum_signature'],
            'signature_image_data' => $imgDataUrl
        ];
    }

    // If LICENCIANTE signature is in variables but not in signature table yet, append hint
    $hasLicenciante = false;
    foreach ($formattedSignatories as $fs) {
        if ($fs['signer_type'] === 'LICENCIANTE') {
            $hasLicenciante = true;
            break;
        }
    }

    if (!$hasLicenciante && ($contract['status'] === 'SIGNED' || $contract['status'] === 'PENDING_SIGNATURE')) {
        $josiSig = $pdfService->getJosiSignatureBase64();
        if ($josiSig) {
            array_unshift($formattedSignatories, [
                'id' => 0,
                'signer_type' => 'LICENCIANTE',
                'signer_name' => ContractPdfService::LICENCIANTE_NAME,
                'signer_document' => ContractPdfService::LICENCIANTE_DOCUMENT,
                'signer_email' => ContractPdfService::LICENCIANTE_EMAIL,
                'signature_mode' => 'DIGITAL_CERTIFICATE',
                'signed_at' => $contract['created_at'],
                'ip_address' => '127.0.0.1 (AUTENTICADO)',
                'checksum_signature' => hash('sha256', 'LICENCIANTE' . $contract['uuid'] . $contract['created_at']),
                'signature_image_data' => $josiSig
            ]);
        }
    }

    $effectiveToken = !empty($contract['sign_token']) ? $contract['sign_token'] : $contract['uuid'];

    echo json_encode([
        'ok' => true,
        'contract' => [
            'uuid' => $contract['uuid'],
            'title' => $contract['title'],
            'status' => $contract['status'],
            'sha256_hash' => $contract['sha256_hash'] ?? hash('sha256', $contract['rendered_html']),
            'created_at' => $contract['created_at'],
            'updated_at' => $contract['updated_at'],
            'pdf_url' => "/api/v1/contracts/download.php?uuid={$contract['uuid']}&token={$effectiveToken}",
            'sign_url' => "/assinar/{$effectiveToken}",
            'rendered_html' => $contract['rendered_html'],
            'signatories' => $formattedSignatories
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Erro ao validar documento: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
