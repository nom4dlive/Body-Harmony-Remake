<?php
// scripts/devops/test_signing_runner.php
// Validador Sintético E2E de Assinatura Digital e Geração de PDF Luxury (PLAN-109)

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../apps/web-app/src/backend/api/config.php';
require_once __DIR__ . '/../../apps/web-app/src/backend/api/v1/admin/contracts/ensure_tables.php';
require_once __DIR__ . '/../../apps/web-app/src/backend/api/v1/Services/ContractPdfService.php';

use BodyHarmony\Services\ContractPdfService;

$pdo = getDbConnection();
ensureContractsTablesExist($pdo);

$testUuid = 'BH-TEST-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
$testSignToken = 'st_test_' . bin2hex(random_bytes(16));
$passedSteps = 0;
$totalSteps = 7;
$log = [];

try {
    // 1. Verificar se template termo-ciencia-modulo-individual existe
    $stmt = $pdo->prepare("SELECT * FROM contract_templates WHERE slug = 'termo-ciencia-modulo-individual' AND is_active = 1");
    $stmt->execute();
    $template = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$template) {
        throw new Exception("Template 'termo-ciencia-modulo-individual' não encontrado no banco.");
    }
    $passedSteps++;
    $log[] = "Passo 1/7: Template 'termo-ciencia-modulo-individual' validado.";

    // 2. Criar contrato sintético de teste
    $vars = [
        'ALUNA_NOME' => 'CAROLINE FERNANDA DOS SANTOS (TESTE SINTÉTICO)',
        'ALUNA_CPF' => '425.748.558-25',
        'ALUNA_EMAIL' => 'teste.sintetico@bodyharmony.com.br',
        'ALUNA_TELEFONE' => '11999999999',
        'CURSO_NOME' => 'PROTOCOLO 3S',
        'CURSO_DESCRICAO' => 'voltada à aplicação estratégica da eletroestimulação com foco em emagrecimento e preservação de massa magra',
        'CIDADE_CELEBRACAO' => 'Assis/SP',
        'DATA_CELEBRACAO_EXTENSO' => date('d/m/Y'),
        'ASSINATURA_LICENCIANTE_IMG' => '',
        'ASSINATURA_LICENCIADA_IMG' => ''
    ];

    $renderedHtml = $template['content_html'];
    foreach ($vars as $k => $v) {
        $renderedHtml = str_replace(["{{{$k}}}", "{{ {$k} }}"], $v, $renderedHtml);
    }

    $ins = $pdo->prepare("
        INSERT INTO contracts (
            uuid, template_id, title, status, variables_payload, rendered_html, sign_token, created_at
        ) VALUES (?, ?, ?, 'PENDING_SIGNATURE', ?, ?, ?, NOW())
    ");
    $ins->execute([
        $testUuid,
        $template['id'],
        'Termo de Ciência - PROTOCOLO 3S (TESTE SINTÉTICO)',
        json_encode($vars, JSON_UNESCAPED_UNICODE),
        $renderedHtml,
        $testSignToken
    ]);
    $contractId = (int)$pdo->lastInsertId();
    $passedSteps++;
    $log[] = "Passo 2/7: Contrato sintético criado com sucesso (ID: {$contractId}, UUID: {$testUuid}).";

    // 3. Simular consulta de pré-visualização (Token Verification)
    $stmtCheck = $pdo->prepare("SELECT id, uuid, status, rendered_html FROM contracts WHERE sign_token = ?");
    $stmtCheck->execute([$testSignToken]);
    $cRow = $stmtCheck->fetch(PDO::FETCH_ASSOC);
    if (!$cRow || $cRow['status'] !== 'PENDING_SIGNATURE') {
        throw new Exception("Falha na consulta de token do contrato.");
    }
    $passedSteps++;
    $log[] = "Passo 3/7: Validação do token de assinatura e HTML de pré-visualização OK.";

    // 4. Simular assinatura digital (Mock de Canvas 1x1 PNG Base64)
    $mockSigBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    $sigChecksum = hash('sha256', $vars['ALUNA_CPF'] . date('Y-m-d H:i:s') . $testUuid);

    $sigStmt = $pdo->prepare("
        INSERT INTO contract_signatures (
            contract_id, signer_type, signer_name, signer_document, signer_email,
            signature_mode, signature_image_path, ip_address, user_agent, signed_at,
            audit_trail_json, checksum_signature
        ) VALUES (?, 'LICENCIADA', ?, ?, ?, 'DRAWN_CANVAS', ?, '127.0.0.1', 'E2E-Automated-Test-Runner', NOW(), ?, ?)
    ");
    $sigStmt->execute([
        $contractId,
        $vars['ALUNA_NOME'],
        $vars['ALUNA_CPF'],
        $vars['ALUNA_EMAIL'],
        $mockSigBase64,
        json_encode(['test_mode' => true, 'runner' => 'Nexus E2E']),
        $sigChecksum
    ]);
    $passedSteps++;
    $log[] = "Passo 4/7: Assinatura digital persistida com metadados de auditoria e checksum.";

    // 5. Compilação do PDF assinado via mPDF com folha de chancela e QR Code
    $pdfService = new ContractPdfService();
    $signatures = [
        [
            'signer_type' => 'LICENCIADA',
            'signer_name' => $vars['ALUNA_NOME'],
            'signer_document' => $vars['ALUNA_CPF'],
            'signer_email' => $vars['ALUNA_EMAIL'],
            'signature_mode' => 'DRAWN_CANVAS',
            'signature_image_data' => $mockSigBase64,
            'ip_address' => '127.0.0.1 (E2E-TEST)',
            'signed_at' => date('Y-m-d H:i:s'),
            'checksum_signature' => $sigChecksum
        ]
    ];

    $pdfResult = $pdfService->generatePdf(
        $renderedHtml,
        $testUuid,
        "Termo de Ciência - PROTOCOLO 3S (TESTE)",
        $signatures,
        true
    );

    if (empty($pdfResult['file_path']) || !file_exists($pdfResult['file_path'])) {
        throw new Exception("PDF não foi gerado no disco.");
    }
    $fileSize = filesize($pdfResult['file_path']);
    if ($fileSize < 5000) {
        throw new Exception("PDF gerado com tamanho anômalo ($fileSize bytes).");
    }
    $passedSteps++;
    $log[] = "Passo 5/7: PDF assinado compilado com sucesso via mPDF ({$fileSize} bytes, Hash: " . substr($pdfResult['sha256_hash'], 0, 16) . "...).";

    // 6. Atualizar status para SIGNED no banco
    $upd = $pdo->prepare("
        UPDATE contracts SET 
            status = 'SIGNED',
            pdf_path = ?,
            sha256_hash = ?,
            updated_at = NOW()
        WHERE id = ?
    ");
    $upd->execute([$pdfResult['relative_path'], $pdfResult['sha256_hash'], $contractId]);
    $passedSteps++;
    $log[] = "Passo 6/7: Contrato marcado como SIGNED e vinculado ao arquivo PDF.";

    // 7. Simular validação pública de autenticidade
    $stmtVal = $pdo->prepare("SELECT id, uuid, status, sha256_hash FROM contracts WHERE uuid = ?");
    $stmtVal->execute([$testUuid]);
    $valRow = $stmtVal->fetch(PDO::FETCH_ASSOC);
    if (!$valRow || $valRow['status'] !== 'SIGNED' || $valRow['sha256_hash'] !== $pdfResult['sha256_hash']) {
        throw new Exception("Validação pública de integridade criptográfica falhou.");
    }
    $passedSteps++;
    $log[] = "Passo 7/7: Consulta pública de autenticidade validada (Hash correspondente).";

    // Limpeza segura dos dados de teste
    $pdo->prepare("DELETE FROM contract_signatures WHERE contract_id = ?")->execute([$contractId]);
    $pdo->prepare("DELETE FROM contracts WHERE id = ?")->execute([$contractId]);
    if (file_exists($pdfResult['file_path'])) {
        @unlink($pdfResult['file_path']);
    }

    echo json_encode([
        'ok' => true,
        'passed_steps' => $passedSteps,
        'total_steps' => $totalSteps,
        'log' => $log,
        'message' => "Todas as $totalSteps etapas da esteira de assinatura de termos foram aprovadas com 100% de sucesso."
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit(0);

} catch (Throwable $e) {
    // Limpeza em caso de erro
    if (!empty($contractId)) {
        $pdo->prepare("DELETE FROM contract_signatures WHERE contract_id = ?")->execute([$contractId]);
        $pdo->prepare("DELETE FROM contracts WHERE id = ?")->execute([$contractId]);
    }
    if (!empty($pdfResult['file_path']) && file_exists($pdfResult['file_path'])) {
        @unlink($pdfResult['file_path']);
    }

    echo json_encode([
        'ok' => false,
        'passed_steps' => $passedSteps,
        'total_steps' => $totalSteps,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'log' => $log
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit(1);
}