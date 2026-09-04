<?php
// tests/lms_concurrency_smoke_test.php
// Script de teste de fumaça e concorrência para API do LMS (Alunas e Vídeos)

echo "=== INICIANDO TESTE DE CONCORRÊNCIA E FUMAÇA DA API DO LMS ===\n";

// 1. Carregar variáveis do .env
$envPath = __DIR__ . '/../apps/web-app/src/backend/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        putenv(trim($name) . "=" . trim($value));
    }
}

// 2. Definir endpoints
// Usaremos a URL padrão local do backend
$baseUrl = "http://localhost:8000/api/v1"; // Servidor PHP local de teste
$lessonId = 1; // ID de lição de teste
$alunaToken = "dummy_aluna_token_for_test"; // Token de teste

// 3. Preparar multithreading leve via cURL Multi
$mh = curl_multi_init();
$handles = [];
$concurrencyCount = 10; // 10 requisições para URLs assinadas e 10 para progresso

echo "Disparando $concurrencyCount requisições simultâneas de URL assinada...\n";

// Enfileirar requisições de sign-url
for ($i = 0; $i < $concurrencyCount; $i++) {
    $ch = curl_init("$baseUrl/aluna/lessons/$lessonId/sign-url");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "X-ALUNA-TOKEN: $alunaToken",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    curl_multi_add_handle($mh, $ch);
    $handles[] = ['ch' => $ch, 'type' => 'sign-url'];
}

// Enfileirar requisições de progresso
for ($i = 0; $i < $concurrencyCount; $i++) {
    $ch = curl_init("$baseUrl/aluna/progress");
    $payload = json_encode([
        'lesson_id' => $lessonId,
        'progress_percent' => rand(10, 95),
        'is_completed' => 0
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "X-ALUNA-TOKEN: $alunaToken",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    curl_multi_add_handle($mh, $ch);
    $handles[] = ['ch' => $ch, 'type' => 'progress'];
}

// Executar as chamadas de forma concorrente
$active = null;
do {
    $mrc = curl_multi_exec($mh, $active);
} while ($mrc == CURLM_CALL_MULTI_PERFORM);

while ($active && $mrc == CURLM_OK) {
    if (curl_multi_select($mh) != -1) {
        do {
            $mrc = curl_multi_exec($mh, $active);
        } while ($mrc == CURLM_CALL_MULTI_PERFORM);
    }
}

// Analisar resultados
$successCount = 0;
$failureCount = 0;
foreach ($handles as $item) {
    $ch = $item['ch'];
    $info = curl_getinfo($ch);
    $response = curl_multi_getcontent($ch);
    $httpCode = $info['http_code'];
    
    // Como estamos rodando local e o token de teste ou o banco podem retornar 401/404,
    // o teste de concorrência é bem-sucedido se o servidor responder (HTTP < 500) e não der timeout/error 500
    if ($httpCode > 0 && $httpCode < 500) {
        $successCount++;
    } else {
        $failureCount++;
        echo "Falha detectada: Tipo {$item['type']} -> Código HTTP $httpCode, Erro: " . curl_error($ch) . "\n";
    }
    curl_multi_remove_handle($mh, $ch);
    curl_close($ch);
}

curl_multi_close($mh);

echo "=== RESULTADOS DO TESTE DE CONCORRÊNCIA ===\n";
echo "Total de Requisições: " . ($concurrencyCount * 2) . "\n";
echo "Sucesso (Conectividade do Servidor OK): $successCount\n";
echo "Falhas Críticas (Erro 500 / Timeout): $failureCount\n";

if ($failureCount === 0) {
    echo "🟢 TESTE DE FUMAÇA APROVADO: Conectividade sob carga estável!\n";
    exit(0);
} else {
    echo "🔴 TESTE DE FUMAÇA REPROVADO: Ocorrência de timeouts ou erros 500!\n";
    exit(1);
}
