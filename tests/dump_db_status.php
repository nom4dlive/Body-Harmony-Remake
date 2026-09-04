<?php
require_once __DIR__ . '/../apps/web-app/src/backend/api/config.php';
global $pdo;

if (!$pdo) {
    echo "No PDO connection" . PHP_EOL;
    exit(1);
}

echo "=== 1. TABELA LICENCIADAS ===" . PHP_EOL;
try {
    $stmt = $pdo->query("SELECT id, name, cpf, whatsapp, location, created_at FROM licenciadas ORDER BY id ASC");
    $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    echo "Total: " . count($rows) . PHP_EOL;
    foreach ($rows as $r) {
        echo sprintf("  #%d | Name: %s | CPF: %s | Zap: %s | Loc: %s | Criado: %s\n", $r['id'], $r['name'], $r['cpf'] ?? 'N/A', $r['whatsapp'] ?? 'N/A', $r['location'] ?? 'N/A', $r['created_at'] ?? 'N/A');
    }
} catch (Throwable $e) {
    echo "Erro licenciadas: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== 2. TABELA LICENCIADA_ONBOARDING_REQUESTS ===" . PHP_EOL;
try {
    $stmt = $pdo->query("SELECT id, nome_completo, cpf, taxa_inicial_num, status, licenciada_id, created_at, updated_at FROM licenciada_onboarding_requests ORDER BY id ASC");
    $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    echo "Total: " . count($rows) . PHP_EOL;
    foreach ($rows as $r) {
        echo sprintf("  #%d | Nome: %s | CPF: %s | Taxa: %s | Status: %s | LicID: %s | Criado: %s\n", $r['id'], $r['nome_completo'], $r['cpf'] ?? 'N/A', $r['taxa_inicial_num'] ?? 'N/A', $r['status'], $r['licenciada_id'] ?? 'NULL', $r['created_at'] ?? 'N/A');
    }
} catch (Throwable $e) {
    echo "Erro onboarding: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== 3. TABELA CONTRACTS ===" . PHP_EOL;
try {
    $stmt = $pdo->query("SELECT id, uuid, title, status, licenciada_id, created_at, updated_at FROM contracts ORDER BY id ASC");
    $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    echo "Total: " . count($rows) . PHP_EOL;
    foreach ($rows as $r) {
        echo sprintf("  #%d | Titulo: %s | Status: %s | LicID: %s | UUID: %s | Criado: %s\n", $r['id'], $r['title'], $r['status'], $r['licenciada_id'] ?? 'NULL', $r['uuid'], $r['created_at'] ?? 'N/A');
    }
} catch (Throwable $e) {
    echo "Erro contracts: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== 4. TABELA LICENCIADA_TAXAS ===" . PHP_EOL;
try {
    $stmt = $pdo->query("SELECT id, licenciada_name, licenciada_cpf, valor_cents, status, payment_method, source, onboarding_request_id, licenciada_id, created_at FROM licenciada_taxas ORDER BY id ASC");
    $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    echo "Total: " . count($rows) . PHP_EOL;
    foreach ($rows as $r) {
        echo sprintf("  #%d | Nome: %s | CPF: %s | Valor: %d | Status: %s | Metodo: %s | Src: %s | LicID: %s | Criado: %s\n", $r['id'], $r['licenciada_name'], $r['licenciada_cpf'] ?? 'N/A', $r['valor_cents'], $r['status'], $r['payment_method'], $r['source'], $r['licenciada_id'] ?? 'NULL', $r['created_at'] ?? 'N/A');
    }
} catch (Throwable $e) {
    echo "Erro taxas: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== 5. TABELA FINANCIAL_TRANSACTIONS ===" . PHP_EOL;
try {
    $stmt = $pdo->query("SELECT id, description, amount_cents, type, status, source_type, source_id, created_at FROM financial_transactions ORDER BY id ASC");
    $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    echo "Total: " . count($rows) . PHP_EOL;
    foreach ($rows as $r) {
        echo sprintf("  #%d | Desc: %s | Valor: %d | Tipo: %s | Status: %s | SrcType: %s | SrcID: %s | Criado: %s\n", $r['id'], $r['description'], $r['amount_cents'], $r['type'], $r['status'], $r['source_type'] ?? 'N/A', $r['source_id'] ?? 'N/A', $r['created_at'] ?? 'N/A');
    }
} catch (Throwable $e) {
    echo "Erro transactions: " . $e->getMessage() . PHP_EOL;
}
