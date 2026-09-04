<?php
// apps/web-app/src/backend/api/v1/admin/contracts/upload_signed.php

require_once __DIR__ . '/../../../cors.php';
require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../../../auth_check.php';
require_once __DIR__ . '/ensure_tables.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$pdo = getDbConnection();
ensureContractsTablesExist($pdo);
$uuid = trim($_POST['contract_uuid'] ?? '');
$licenciadaId = (int)($_POST['licenciada_id'] ?? 0);
$notes = trim($_POST['notes'] ?? 'Assinatura digital externa / gov.br / contrato físico anexado');

if (empty($uuid) && $licenciadaId <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'UUID do contrato ou ID da licenciada é obrigatório.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Nenhum arquivo enviado ou erro no upload.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$tmpPath = $_FILES['file']['tmp_name'];
$fileSize = $_FILES['file']['size'];

// Max size 25MB
if ($fileSize > 25 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Arquivo excede o limite máximo de 25MB.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Strict MIME check
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $tmpPath);
finfo_close($finfo);

if ($mimeType !== 'application/pdf') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'O arquivo enviado não é um PDF válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Magic bytes verification (%PDF-)
$handle = fopen($tmpPath, 'rb');
$header = fread($handle, 5);
fclose($handle);

if ($header !== '%PDF-') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Assinatura de cabeçalho PDF inválida.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Find or create contract
    $contract = null;
    if (!empty($uuid)) {
        $stmt = $pdo->prepare("SELECT * FROM contracts WHERE uuid = ?");
        $stmt->execute([$uuid]);
        $contract = $stmt->fetch(PDO::FETCH_ASSOC);
    } elseif ($licenciadaId > 0) {
        $stmt = $pdo->prepare("SELECT * FROM contracts WHERE licenciada_id = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$licenciadaId]);
        $contract = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$contract) {
            $lStmt = $pdo->prepare("SELECT * FROM licenciadas WHERE id = ? LIMIT 1");
            $lStmt->execute([$licenciadaId]);
            $lic = $lStmt->fetch(PDO::FETCH_ASSOC);

            if (!$lic) {
                http_response_code(404);
                echo json_encode(['ok' => false, 'error' => 'Licenciada não encontrada.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $uuid = 'bh-lic-' . bin2hex(random_bytes(8));
            $varPayload = json_encode([
                'LICENCIADA_NOME_COMPLETO' => $lic['name'],
                'LICENCIADA_CPF' => $lic['cpf'],
                'LICENCIADA_CIDADE_UF' => ($lic['location'] ?? '') . ($lic['state'] ? ' - ' . $lic['state'] : '')
            ], JSON_UNESCAPED_UNICODE);

            $insStmt = $pdo->prepare("
                INSERT INTO contracts (
                    uuid, licenciada_id, category, template_slug, status,
                    variables_payload, created_at, updated_at
                ) VALUES (?, ?, 'LICENCIAMENTO', 'contrato-licenciamento-padrao', 'PENDING_SIGNATURE', ?, NOW(), NOW())
            ");
            $insStmt->execute([$uuid, $licenciadaId, $varPayload]);
            $newContractId = (int)$pdo->lastInsertId();

            $stmt = $pdo->prepare("SELECT * FROM contracts WHERE id = ?");
            $stmt->execute([$newContractId]);
            $contract = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            $uuid = $contract['uuid'];
        }
    }

    if (!$contract) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Contrato não encontrado.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $destDir = __DIR__ . '/../../../../private_uploads/contracts';
    if (!file_exists($destDir)) {
        @mkdir($destDir, 0750, true);
    }

    $destFile = $destDir . '/' . $uuid . '.pdf';
    if (!move_uploaded_file($tmpPath, $destFile)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Falha ao salvar arquivo assinado.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $newSha256 = hash_file('sha256', $destFile);

    // Register signature audit record
    $vars = json_decode($contract['variables_payload'] ?? '{}', true) ?: [];
    $signerName = $vars['LICENCIADA_NOME_RAZAO'] ?? $vars['LICENCIADA_NOME_COMPLETO'] ?? 'Licenciada (Upload Externo)';
    $signerDoc = $vars['LICENCIADA_CNPJ_CPF'] ?? $vars['LICENCIADA_CPF'] ?? 'N/A';
    $signerEmail = $vars['LICENCIADA_EMAIL'] ?? null;

    $sigStmt = $pdo->prepare("
        INSERT INTO contract_signatures (
            contract_id, signer_type, signer_name, signer_document, signer_email,
            signature_mode, ip_address, user_agent, signed_at, audit_trail_json, checksum_signature
        ) VALUES (?, 'LICENCIADA', ?, ?, ?, 'GOV_BR_UPLOAD', ?, ?, NOW(), ?, ?)
    ");

    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Admin Panel';
    $auditJson = json_encode(['notes' => $notes, 'uploaded_by_admin' => $current_user_id ?? 1]);
    $checksum = hash('sha256', $newSha256 . $uuid . time());

    $sigStmt->execute([
        $contract['id'],
        $signerName,
        $signerDoc,
        $signerEmail,
        $ip,
        $ua,
        $auditJson,
        $checksum
    ]);

    // Update contract status
    $upStmt = $pdo->prepare("
        UPDATE contracts 
        SET status = 'SIGNED', sha256_hash = ?, pdf_path = ?, signed_at = NOW(), updated_at = NOW() 
        WHERE id = ?
    ");
    $upStmt->execute([$newSha256, 'private_uploads/contracts/' . $uuid . '.pdf', $contract['id']]);

    // Cascade to licenciada_taxas
    $targetLicId = !empty($contract['licenciada_id']) ? (int)$contract['licenciada_id'] : $licenciadaId;
    if ($targetLicId > 0) {
        $taxUp = $pdo->prepare("
            UPDATE licenciada_taxas
            SET status = 'contract_signed', contract_signed_at = NOW(), contract_uuid = ?
            WHERE licenciada_id = ? OR contract_uuid = ?
        ");
        $taxUp->execute([$uuid, $targetLicId, $uuid]);
    }

    if (class_exists('ResponseCache')) {
        ResponseCache::clear('admin_financial_');
        ResponseCache::clear('admin_license_taxes_');
    }

    echo json_encode([
        'ok' => true,
        'message' => 'Contrato assinado anexado com sucesso!',
        'contract_status' => 'SIGNED',
        'contract_uuid' => $uuid,
        'pdf_url' => "/api/v1/contracts/download.php?uuid={$uuid}",
        'sha256_hash' => $newSha256
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Erro ao processar documento: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

