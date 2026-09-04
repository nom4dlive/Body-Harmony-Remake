<?php
// apps/web-app/src/backend/api/v1/contracts/sign.php

require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../admin/contracts/ensure_tables.php';
require_once __DIR__ . '/../Services/ContractPdfService.php';

use BodyHarmony\Services\ContractPdfService;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Info check for public sign page (validates token and returns basic contract preview)
    $token = trim($_GET['token'] ?? '');
    if (empty($token)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Token de assinatura não fornecido.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $pdo = getDbConnection();
        ensureContractsTablesExist($pdo);
        $stmt = $pdo->prepare("
            SELECT c.id, c.uuid, c.sign_token, c.title, c.status, c.rendered_html, c.variables_payload,
                   c.sign_token_expires_at, l.name as licenciada_name
            FROM contracts c
            LEFT JOIN licenciadas l ON c.licenciada_id = l.id
            WHERE c.sign_token = ? OR c.uuid = ?
        ");
        $stmt->execute([$token, $token]);
        $contract = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$contract) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Link de assinatura inválido ou inexistente.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($contract['status'] === 'SIGNED') {
            echo json_encode([
                'ok' => true,
                'status' => 'SIGNED',
                'title' => $contract['title'],
                'message' => 'Este contrato já foi assinado e finalizado com sucesso.',
                'pdf_url' => "/api/v1/contracts/download.php?uuid={$contract['uuid']}&token={$token}"
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!empty($contract['sign_token_expires_at']) && strtotime($contract['sign_token_expires_at']) < time()) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'Este link de assinatura expirou. Solicite um novo link ao suporte.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $vars = json_decode($contract['variables_payload'] ?? '{}', true) ?: [];

        echo json_encode([
            'ok' => true,
            'contract' => [
                'uuid' => $contract['uuid'],
                'title' => $contract['title'],
                'status' => $contract['status'],
                'rendered_html' => $contract['rendered_html'],
                'signer_name_hint' => $vars['LICENCIADA_NOME_RAZAO'] ?? ($vars['ALUNA_NOME'] ?? ($contract['licenciada_name'] ?? '')),
                'signer_doc_hint' => $vars['LICENCIADA_CNPJ_CPF'] ?? ($vars['ALUNA_CPF'] ?? ''),
                'signer_email_hint' => $vars['LICENCIADA_EMAIL'] ?? ($vars['ALUNA_EMAIL'] ?? '')
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Payload JSON inválido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$signToken = trim($input['sign_token'] ?? '');
$signerType = in_array($input['signer_type'] ?? '', ['LICENCIADA', 'LICENCIANTE', 'TESTEMUNHA_1', 'TESTEMUNHA_2']) ? $input['signer_type'] : 'LICENCIADA';
$signerName = trim($input['signer_name'] ?? '');
$signerDocument = trim($input['signer_document'] ?? '');
$signerEmail = trim($input['signer_email'] ?? '');
$signatureMode = in_array($input['signature_mode'] ?? '', ['DRAWN_CANVAS', 'TYPED_SIGNATURE', 'UPLOAD_IMAGE', 'DIGITAL_CERTIFICATE']) ? $input['signature_mode'] : 'DRAWN_CANVAS';
$signatureBase64 = $input['signature_data_base64'] ?? '';
$acceptedTerms = !empty($input['accepted_terms']) || $signerType === 'LICENCIANTE';

if (empty($signToken)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Token de assinatura é obrigatório.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($signerType === 'LICENCIANTE') {
    $pdfService = new ContractPdfService();
    if (empty($signatureBase64)) {
        $signatureBase64 = $pdfService->getJosiSignatureBase64();
    }
    // Strict official identity enforcement for Licenciante (REGRA 11)
    $signerName = ContractPdfService::LICENCIANTE_NAME;
    $signerDocument = ContractPdfService::LICENCIANTE_DOCUMENT;
    $signerEmail = ContractPdfService::LICENCIANTE_EMAIL;
    $signatureMode = 'DIGITAL_CERTIFICATE';
}

if (empty($signerName) || empty($signerDocument) || empty($signatureBase64)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Nome, Documento e Imagem da Assinatura são obrigatórios.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!$acceptedTerms) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'É obrigatório aceitar os termos de assinatura eletrônica (Lei 14.063/2020).'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = getDbConnection();

    // 1. Locate Contract
    $stmt = $pdo->prepare("SELECT * FROM contracts WHERE sign_token = ? OR uuid = ?");
    $stmt->execute([$signToken, $signToken]);
    $contract = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$contract) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Contrato não encontrado para este token.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!empty($contract['sign_token_expires_at']) && strtotime($contract['sign_token_expires_at']) < time()) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Este link de assinatura expirou.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2. Client Metadata
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    if (strpos($ip, ',') !== false) {
        $ip = trim(explode(',', $ip)[0]);
    }
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown Browser';
    $now = date('Y-m-d H:i:s');

    // 3. Save signature image
    $sigDir = __DIR__ . '/../../../../private_uploads/contracts/signatures';
    if (!file_exists($sigDir)) {
        @mkdir($sigDir, 0750, true);
    }

    $sigFilename = $contract['uuid'] . '_' . strtolower($signerType) . '_' . time() . '.png';
    $sigPath = $sigDir . '/' . $sigFilename;

    if (preg_match('/^data:image\/(\w+);base64,/', $signatureBase64, $type)) {
        $data = substr($signatureBase64, strpos($signatureBase64, ',') + 1);
        $decoded = base64_decode($data);
        if ($decoded !== false) {
            file_put_contents($sigPath, $decoded);
        }
    }

    $checksum = hash('sha256', $signerDocument . $now . $ip . $signatureBase64);
    $auditJson = json_encode([
        'ip' => $ip,
        'user_agent' => $ua,
        'signed_at_utc' => gmdate('Y-m-d H:i:s'),
        'legal_basis' => 'Lei 14.063/2020 e MP 2.200-2/2001'
    ]);

    // 4. Save Signature Record
    $sigStmt = $pdo->prepare("
        INSERT INTO contract_signatures (
            contract_id, signer_type, signer_name, signer_document, signer_email,
            signature_mode, signature_image_path, ip_address, user_agent, signed_at,
            audit_trail_json, checksum_signature
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $sigStmt->execute([
        $contract['id'],
        $signerType,
        $signerName,
        $signerDocument,
        $signerEmail,
        $signatureMode,
        'private_uploads/contracts/signatures/' . $sigFilename,
        $ip,
        $ua,
        $now,
        $auditJson,
        $checksum
    ]);

    // 5. Fetch all signatures and re-compile PDF with Chancela Jurídica
    $allSigsStmt = $pdo->prepare("SELECT * FROM contract_signatures WHERE contract_id = ? ORDER BY id ASC");
    $allSigsStmt->execute([$contract['id']]);
    $signaturesList = $allSigsStmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedSigs = [];
    foreach ($signaturesList as $s) {
        $imgPath = __DIR__ . '/../../../../' . ($s['signature_image_path'] ?? '');
        $imgDataUrl = null;
        if (file_exists($imgPath)) {
            $imgDataUrl = 'data:image/png;base64,' . base64_encode(file_get_contents($imgPath));
        }

        $formattedSigs[] = [
            'signer_type' => $s['signer_type'],
            'signer_name' => $s['signer_name'],
            'signer_document' => $s['signer_document'],
            'signer_email' => $s['signer_email'],
            'signature_mode' => $s['signature_mode'],
            'signed_at' => $s['signed_at'],
            'ip_address' => $s['ip_address'],
            'checksum_signature' => $s['checksum_signature'],
            'signature_image_data' => $imgDataUrl
        ];
    }

    $pdfService = new ContractPdfService();
    $pdfResult = $pdfService->generatePdf(
        $contract['rendered_html'],
        $contract['uuid'],
        $contract['title'],
        $formattedSigs,
        true
    );

    // Check if BOTH Licenciante and Licenciada have signed
    $hasLicenciadaSig = false;
    $hasLicencianteSig = false;
    foreach ($formattedSigs as $s) {
        if (($s['signer_type'] ?? '') === 'LICENCIADA') $hasLicenciadaSig = true;
        if (($s['signer_type'] ?? '') === 'LICENCIANTE') $hasLicencianteSig = true;
    }

    $newContractStatus = ($hasLicenciadaSig && $hasLicencianteSig) ? 'SIGNED' : 'PENDING_SIGNATURE';

    // 6. Update Contract Status
    $upStmt = $pdo->prepare("
        UPDATE contracts 
        SET status = ?, sha256_hash = ?, pdf_path = ?, updated_at = NOW() 
        WHERE id = ?
    ");
    $upStmt->execute([$newContractStatus, $pdfResult['sha256_hash'], $pdfResult['relative_path'], $contract['id']]);

    echo json_encode([
        'ok' => true,
        'message' => $newContractStatus === 'SIGNED' 
            ? 'Contrato assinado digitalmente por ambas as partes com sucesso!' 
            : 'Assinatura registrada com sucesso! Aguardando demais partes.',
        'contract_status' => $newContractStatus,
        'signed_pdf_url' => "/api/v1/contracts/download.php?uuid={$contract['uuid']}&token={$signToken}",
        'audit_checksum' => $checksum
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Erro ao processar assinatura: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
