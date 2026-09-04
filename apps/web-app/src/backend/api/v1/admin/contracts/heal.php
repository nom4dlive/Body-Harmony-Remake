<?php
// apps/web-app/src/backend/api/v1/admin/contracts/heal.php
// Script & Endpoint de Correção e Normalização Automática de Contratos (REGRA 11, 51 & 52)

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../../cors.php';
require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../../../auth_check.php';
require_once __DIR__ . '/ensure_tables.php';
require_once __DIR__ . '/../../Services/ContractPdfService.php';

use BodyHarmony\Services\ContractPdfService;

try {
    $pdo = getDbConnection();
    ensureContractsTablesExist($pdo);

    $pdfService = new ContractPdfService();

    // 1. Heal Signatures
    $sigUpdateStmt = $pdo->prepare("
        UPDATE contract_signatures 
        SET signer_name = ?, 
            signer_document = ?,
            signer_email = ?
        WHERE signer_type = 'LICENCIANTE' OR signer_name LIKE '%JOSIANE%' OR signer_name LIKE '%JOSELENE%'
    ");
    $sigUpdateStmt->execute([
        ContractPdfService::LICENCIANTE_NAME,
        ContractPdfService::LICENCIANTE_DOCUMENT,
        ContractPdfService::LICENCIANTE_EMAIL
    ]);
    $signaturesAffected = $sigUpdateStmt->rowCount();

    // 2. Replacements map
    $replacements = [
        'JOSIANE PEREIRA DA SILVA' => 'JOSELENE APARECIDA DA SILVA',
        'JOSIANE APARECIDA DA SILVA' => 'JOSELENE APARECIDA DA SILVA',
        'JOSELENE PEREIRA DA SILVA' => 'JOSELENE APARECIDA DA SILVA',
        'BODY HARMONY ELETRO ESTIMULAÇÃO LTDA.' => 'BODY HARMONY ELETROESTIMULAÇÃO LTDA.',
        'BODY HARMONY ELETRO ESTIMULAÇÃO LTDA' => 'BODY HARMONY ELETROESTIMULAÇÃO LTDA.',
        'BODY HARMONY EDUCAÇÃO LTDA.' => 'BODY HARMONY ELETROESTIMULAÇÃO LTDA.',
        'BODY HARMONY EDUCAÇÃO LTDA' => 'BODY HARMONY ELETROESTIMULAÇÃO LTDA.',
        'BODY HARMONY ESTÉTICA E CURSOS LTDA.' => 'BODY HARMONY ELETROESTIMULAÇÃO LTDA.',
        'BODY HARMONY ESTÉTICA E CURSOS LTDA' => 'BODY HARMONY ELETROESTIMULAÇÃO LTDA.',
        'BODY HARMONY CURSOS LTDA' => 'BODY HARMONY ELETROESTIMULAÇÃO LTDA.'
    ];

    $htmlUpdatesCount = 0;
    foreach ($replacements as $search => $replace) {
        $stmtHtml = $pdo->prepare("UPDATE contracts SET rendered_html = REPLACE(rendered_html, ?, ?) WHERE rendered_html LIKE ?");
        $stmtHtml->execute([$search, $replace, "%{$search}%"]);
        $htmlUpdatesCount += $stmtHtml->rowCount();

        $stmtVars = $pdo->prepare("UPDATE contracts SET variables_payload = REPLACE(variables_payload, ?, ?) WHERE variables_payload LIKE ?");
        $stmtVars->execute([$search, $replace, "%{$search}%"]);
    }

    // 3. Fetch all contracts to verify / recompile PDFs
    $contractsStmt = $pdo->query("SELECT id, uuid, title, status, rendered_html, pdf_path FROM contracts WHERE status IN ('GENERATED', 'PENDING_SIGNATURE', 'SIGNED') ORDER BY id ASC");
    $allContracts = $contractsStmt ? $contractsStmt->fetchAll(PDO::FETCH_ASSOC) : [];

    $recompiledPdfs = [];
    foreach ($allContracts as $c) {
        $filePath = __DIR__ . '/../../../../' . ($c['pdf_path'] ?? '');
        $needsRecompilation = empty($c['pdf_path']) || !file_exists($filePath);

        // Fetch signatures
        $sigStmt = $pdo->prepare("SELECT * FROM contract_signatures WHERE contract_id = ? ORDER BY id ASC");
        $sigStmt->execute([$c['id']]);
        $signatures = $sigStmt->fetchAll(PDO::FETCH_ASSOC);

        try {
            $pdfResult = $pdfService->generatePdf(
                $c['rendered_html'] ?? '',
                $c['uuid'],
                $c['title'],
                $signatures,
                true
            );

            $upd = $pdo->prepare("UPDATE contracts SET pdf_path = ?, sha256_hash = ? WHERE id = ?");
            $upd->execute([$pdfResult['relative_path'], $pdfResult['sha256_hash'], $c['id']]);

            $recompiledPdfs[] = [
                'uuid' => $c['uuid'],
                'title' => $c['title'],
                'status' => $c['status'],
                'pdf_path' => $pdfResult['relative_path'],
                'sha256_hash' => $pdfResult['sha256_hash']
            ];
        } catch (Throwable $ePdf) {
            error_log("[heal.php] Error compiling PDF for contract {$c['uuid']}: " . $ePdf->getMessage());
        }
    }

    echo json_encode([
        'ok' => true,
        'message' => 'Contratos e assinaturas auditados e corrigidos automaticamente com sucesso!',
        'signatures_healed' => $signaturesAffected,
        'html_occurrences_healed' => $htmlUpdatesCount,
        'contracts_recompiled' => count($recompiledPdfs),
        'contracts' => $recompiledPdfs
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Falha na auto-correção de contratos: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
