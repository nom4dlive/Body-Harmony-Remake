<?php
// infrastructure/database/migrations/20260220_fix_lms_v2.php
require_once __DIR__ . '/../../../apps/web-app/src/backend/api/config.php';

try {
    echo "Iniciando migração V2: Fix lms_lessons and licenses...\n";
    
    // 1. Add attachment_count to lms_lessons
    $stmt = $pdo->query("DESCRIBE lms_lessons");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (in_array('attachment_count', $columns)) {
        echo "Aviso: Coluna attachment_count já existe em lms_lessons.\n";
    } else {
        $pdo->exec("ALTER TABLE lms_lessons ADD COLUMN attachment_count INT DEFAULT 0 AFTER duration_seconds");
        echo "Sucesso: Coluna attachment_count adicionada a lms_lessons.\n";
    }

    // 2. Ensure default licenses exist in lms_licenses
    $stmt = $pdo->query("SELECT COUNT(*) FROM lms_licenses");
    if ($stmt->fetchColumn() == 0) {
        echo "Semeando lms_licenses com planos padrão...\n";
        $pdo->exec("
            INSERT INTO lms_licenses (license_key, status, ai_plan_type, ai_credits_total, ai_credits_used) 
            VALUES 
            ('STANDARD_PORTAL', 'active', 'BASIC', 50, 0),
            ('PREMIUM_NEXUS', 'active', 'PRO', 999, 0)
        ");
        echo "Sucesso: lms_licenses semeada.\n";
    }

    // 3. Assign license to first available student if missing
    $stmt = $pdo->query("SELECT id FROM licenciadas LIMIT 1");
    $studentId = $stmt->fetchColumn();
    
    if ($studentId) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM lms_licenciada_licenses WHERE licenciada_id = ?");
        $stmt->execute([$studentId]);
        if ($stmt->fetchColumn() == 0) {
            echo "Atribuindo licença padrão para licenciada ID $studentId...\n";
            $stmtL = $pdo->query("SELECT id FROM lms_licenses LIMIT 1");
            $licenseId = $stmtL->fetchColumn();
            if ($licenseId) {
                $stmtIns = $pdo->prepare("INSERT INTO lms_licenciada_licenses (licenciada_id, license_id) VALUES (?, ?)");
                $stmtIns->execute([$studentId, $licenseId]);
                echo "Sucesso: Licença atribuída.\n";
            }
        }
    }

} catch (Exception $e) {
    echo "ERRO CRÍTICO na migração V2: " . $e->getMessage() . "\n";
    exit(1);
}
