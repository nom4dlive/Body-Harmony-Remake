<?php
/**
 * CLI Script: Re-render Draft Contracts with Updated PJ Template
 * PLAN-065 — rerender-draft-contracts-pj | Nexus Protocol V3.1
 * Usage: php tests/rerender_draft_contracts.php
 *
 * Fetches all DRAFT contracts, re-renders HTML using current template +
 * original variables_payload, regenerates PDF, updates rendered_html/sha256_hash/pdf_path.
 * Safe: Only touches status = DRAFT. Idempotent.
 */

declare(strict_types=1);

define('RUNNING_AS_CLI', true);
require_once __DIR__ . '/../apps/web-app/src/backend/vendor/autoload.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/config.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/ContractPdfService.php';

use BodyHarmony\Services\ContractPdfService;

$separator = str_repeat('=', 68);
echo "\n$separator\n";
echo "   PLAN-065: RE-RENDER DRAFT CONTRACTS (PJ Template Invariant)   \n";
echo "$separator\n\n";

$pdo = get_db_connection();
$pdfService = new ContractPdfService();

// 1. Fetch all DRAFT contracts with their template
$stmt = $pdo->prepare("
    SELECT c.id, c.uuid, c.title, c.variables_payload, c.sha256_hash AS old_hash,
           ct.content_html, ct.slug AS template_slug
    FROM contracts c
    INNER JOIN contract_templates ct ON ct.id = c.template_id
    WHERE c.status = 'DRAFT'
    ORDER BY c.id ASC
");
$stmt->execute();
$drafts = $stmt->fetchAll(PDO::FETCH_ASSOC);

$total = count($drafts);
echo "[INFO] Contratos em status DRAFT encontrados: {$total}\n\n";

if ($total === 0) {
    echo "[OK] Nenhum DRAFT encontrado. Nada a fazer.\n\n$separator\n";
    echo "VEREDICTO: [PASS] — Pipeline concluído sem erros.\n$separator\n";
    exit(0);
}

$FORBIDDEN = [
    '(ou pessoa física habilitada)',
    'CNPJ/CPF',
    'com sede/domicílio na',
];

$updated = 0;
$failed = 0;
$skipped = 0;

foreach ($drafts as $contract) {
    $id    = (int) $contract['id'];
    $uuid  = $contract['uuid'];
    $title = $contract['title'];
    $oldHash = $contract['old_hash'] ?? '';

    $variables = json_decode($contract['variables_payload'] ?? '{}', true);
    if (!is_array($variables)) {
        echo "[SKIP] Contract #{$id} — variables_payload inválido.\n";
        $skipped++;
        continue;
    }

    try {
        $newHtml = $pdfService->renderTemplate($contract['content_html'], $variables);

        $warnings = [];
        foreach ($FORBIDDEN as $bad) {
            if (stripos($newHtml, $bad) !== false) {
                $warnings[] = $bad;
            }
        }

        $pdfResult = $pdfService->generatePdf($newHtml, $uuid, $title, [], true);
        if (empty($pdfResult['sha256_hash'])) {
            throw new \RuntimeException("PDF gerado sem hash SHA-256.");
        }

        $newHash    = $pdfResult['sha256_hash'];
        $newPdfPath = $pdfResult['relative_path'] ?? null;

        $upd = $pdo->prepare("
            UPDATE contracts
               SET rendered_html = ?,
                   sha256_hash   = ?,
                   pdf_path      = ?,
                   updated_at    = NOW()
             WHERE id = ?
        ");
        $upd->execute([$newHtml, $newHash, $newPdfPath, $id]);

        $tag = empty($warnings) ? '[OK]' : '[WARN]';
        echo "{$tag} Contract #{$id} — \"{$title}\"\n";
        echo "     Template : {$contract['template_slug']}\n";
        echo "     Hash old : " . substr($oldHash, 0, 16) . "...\n";
        echo "     Hash new : " . substr($newHash, 0, 16) . "...\n";
        if (!empty($warnings)) {
            echo "     [!] Texto proibido ainda presente: " . implode(", ", $warnings) . "\n";
        }
        echo "\n";

        $updated++;

    } catch (\Throwable $e) {
        echo "[FAIL] Contract #{$id} — \"{$title}\": " . $e->getMessage() . "\n\n";
        $failed++;
    }
}

echo "$separator\n";
echo "RESULTADO: {$updated} atualizado(s) | {$failed} falha(s) | {$skipped} pulado(s)\n";
if ($failed > 0) {
    echo "VEREDICTO: [FAIL]\n$separator\n";
    exit(1);
}
echo "VEREDICTO: [PASS] — Todos os DRAFTs re-renderizados com template PJ definitivo.\n";
echo "$separator\n";
exit(0);
