<?php
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json; charset=utf-8');

try {
    global $pdo, $db;
    $conn = $pdo ?? $db;

    if (!$conn) {
        echo json_encode(['error' => 'Sem conexão com banco']);
        exit;
    }

    // 1. Listar todas as tabelas do banco
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(\PDO::FETCH_COLUMN);

    // 2. Procurar tabelas com 'msg', 'chat', 'conv', 'licenc', 'suporte', 'atend'
    $relevantTables = [];
    foreach ($tables as $t) {
        if (preg_match('/(msg|message|chat|conv|licenc|suport|atend|ticket|evo|lead|whatsapp)/i', $t)) {
            $relevantTables[] = $t;
        }
    }

    // 3. Obter amostra de dados de cada tabela relevante
    $samples = [];
    foreach ($relevantTables as $rt) {
        try {
            $s = $conn->query("SELECT * FROM `{$rt}` ORDER BY 1 DESC LIMIT 10");
            $samples[$rt] = $s->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Throwable $e) {
            $samples[$rt] = ['error' => $e->getMessage()];
        }
    }

    echo json_encode([
        'all_tables' => $tables,
        'relevant_tables' => $relevantTables,
        'samples' => $samples
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (\Throwable $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
