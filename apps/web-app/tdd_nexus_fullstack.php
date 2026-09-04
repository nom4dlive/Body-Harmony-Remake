<?php
// TDD V47: Nexus Ops Firewall API Integrado
// Executa testes contra o backend localhost rodando na 8000

function testApi($method, $url, $token, $body = null) {
    echo "  -> [$method] /api/v1$url\n";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "http://localhost:5175/api/v1" . $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $headers = [
        "Content-Type: application/json",
        "Authorization: Bearer $token"
    ];
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($body) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    } else if ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['code' => $httpCode, 'body' => $response];
}

echo "=== INICIANDO TDD V47: NEXUS OPS E FIREWALL ===\n\n";

// 1. Precisamos de um Token de SuperAdmin para bater nas rotas
// Vamos forçar a geração de um token simulando o que o Login Master faria direto no banco
require_once __DIR__ . '/src/backend/api/config.php';

$superAdminId = 1; // root
$token = bin2hex(random_bytes(32));
$pdo->prepare("INSERT INTO admin_sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))")->execute([$superAdminId, $token]);

echo "[1] Ambiente Preparado. Token Master Injétado.\n";

// 2. Testando Rota GET Firewall Rules
$res = testApi('GET', '/admin/nexus/ops/firewall', $token);
if ($res['code'] === 200) {
    echo "  [OK] /admin/nexus/ops/firewall retornou 200.\n";
} else {
    echo "  [ERRO] GET Firewall falhou: " . $res['code'] . " - " . $res['body'] . "\n";
}

// 3. Testando POST Nova Regra de BAN
$testIp = '203.0.113.100';
$payload = [
    'ip' => $testIp,
    'type' => 'BAN',
    'reason' => 'TDD Integration Test API',
    'duration_hours' => 1
];
$res = testApi('POST', '/admin/nexus/ops/firewall', $token, $payload);
if ($res['code'] === 200) {
    echo "  [OK] Regra inserida com Sucesso (IP: $testIp).\n";
} else {
    echo "  [ERRO] Falha ao inserir regra de firewall: " . $res['code'] . " - " . $res['body'] . "\n";
}

// 4. Verificando Persistencia na Rota GET
$res = testApi('GET', '/admin/nexus/ops/firewall', $token);
if (strpos($res['body'], $testIp) !== false) {
    echo "  [OK] O IP $testIp está persistido e retornando no fetch do Firewall.\n";
    // Extrair o ID gerado para excluir depois
    $json = json_decode($res['body'], true);
    $ruleId = null;
    foreach($json['rules'] as $rule) {
        if ($rule['ip_address'] === $testIp) $ruleId = $rule['id'];
    }
} else {
    echo "  [ERRO] IP não encontrado no payload de retorno.\n";
}

// 5. Testando Feed de Auditoria (Ops Audit)
$res = testApi('GET', '/admin/nexus/ops/audit-feed', $token);
if ($res['code'] === 200 && strpos($res['body'], 'ADMIN_ACTION') !== false) {
    echo "  [OK] O Audit Feed cruzou a Trilha Forense, registrou a ação do Admin e respondeu HTTP 200.\n";
} else {
    echo "  [ERRO] Falha no Audit Feed.\n";
}

// 6. Testando exclusão da regra do Firewall (Desbanir)
if (isset($ruleId)) {
    $res = testApi('DELETE', "/admin/nexus/ops/firewall/$ruleId", $token);
    if ($res['code'] === 200) {
        echo "  [OK] Regra do ID $ruleId revogada via API (DELETE).\n";
    } else {
        echo "  [ERRO] Falha na exclusão da regra: " . $res['code'] . " - " . $res['body'] . "\n";
    }
} else {
    echo "  [AVISO] Pulo do teste de DELETE, pois RuleID não foi localizado.\n";
}


// --- Limpeza de Ambiente ---
$pdo->prepare("DELETE FROM admin_sessions WHERE token = ?")->execute([$token]);
$pdo->prepare("DELETE FROM nexus_audit_ops WHERE target_id = ?")->execute([$testIp]);
echo "\n=== TDD FINALIZADO ===\n";
