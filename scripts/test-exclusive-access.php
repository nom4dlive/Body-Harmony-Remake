<?php
// scripts/test-exclusive-access.php
// Validates LMS exclusive lessons database schema and basic access queries.

if (file_exists(__DIR__ . '/../apps/web-app/src/backend/api/config.php')) {
    require_once __DIR__ . '/../apps/web-app/src/backend/api/config.php';
} else {
    require_once __DIR__ . '/config.php';
}
global $pdo;

echo "=== INICIANDO TESTE DE PARIDADE DE ACESSO EXCLUSIVO ===\n";

try {
    // 1. Verificar se a coluna is_exclusive existe
    $stmt = $pdo->query("SHOW COLUMNS FROM lms_modules LIKE 'is_exclusive'");
    $column = $stmt->fetch();
    if ($column) {
        echo "✅ Coluna 'is_exclusive' existe em 'lms_modules'.\n";
    } else {
        throw new Exception("❌ Falha: Coluna 'is_exclusive' não encontrada em 'lms_modules'.");
    }

    // 2. Verificar se a tabela licenciada_course_access existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'licenciada_course_access'");
    $table = $stmt->fetch();
    if ($table) {
        echo "✅ Tabela 'licenciada_course_access' existe.\n";
    } else {
        throw new Exception("❌ Falha: Tabela 'licenciada_course_access' não encontrada.");
    }

    // 3. Testar injeção de dados de simulação (Access Check)
    echo "Simulando consulta de verificação de permissões...\n";
    
    // Fetch a real licenciada ID
    $licenciada = $pdo->query("SELECT id FROM licenciadas LIMIT 1")->fetch();
    if (!$licenciada) {
        throw new Exception("❌ Falha: Nenhuma licenciada cadastrada no banco para o teste.");
    }
    $testLicenciadaId = (int)$licenciada['id'];

    // Fetch a real module ID
    $module = $pdo->query("SELECT id FROM lms_modules LIMIT 1")->fetch();
    if (!$module) {
        throw new Exception("❌ Falha: Nenhum módulo LMS cadastrado no banco para o teste.");
    }
    $testModuleId = (int)$module['id'];
    
    // Concede acesso de teste
    $pdo->exec("
        INSERT INTO licenciada_course_access (licenciada_id, module_id, granted_by, expires_at)
        VALUES ($testLicenciadaId, $testModuleId, NULL, NULL)
        ON DUPLICATE KEY UPDATE granted_at = NOW()
    ");
    echo "✅ Concessão de acesso de teste simulada com sucesso.\n";

    // Verifica se existe o acesso
    $stmtCheck = $pdo->prepare("
        SELECT id FROM licenciada_course_access 
        WHERE licenciada_id = ? AND module_id = ? 
          AND (expires_at IS NULL OR expires_at > NOW())
    ");
    $stmtCheck->execute([$testLicenciadaId, $testModuleId]);
    if ($stmtCheck->fetchColumn()) {
        echo "✅ Verificação de acesso ativo atestada positivamente.\n";
    } else {
        throw new Exception("❌ Falha: Acesso concedido não localizado.");
    }

    // Revoga acesso de teste
    $pdo->exec("DELETE FROM licenciada_course_access WHERE licenciada_id = $testLicenciadaId AND module_id = $testModuleId");
    echo "✅ Revogação de acesso de teste simulada com sucesso.\n";

    echo "=== TODOS OS TESTES PASSARAM COM SUCESSO! ===\n";

} catch (Exception $e) {
    echo "❌ Erro durante a validação: " . $e->getMessage() . "\n";
    exit(1);
}
