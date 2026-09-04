<?php
// apps/web-app/src/backend/api/v1/crm/test_ai_outbound.php
header('Content-Type: application/json');

function testCurl($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 4,
        CURLOPT_CONNECTTIMEOUT => 2,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    return ['url' => $url, 'code' => $code, 'err' => $err, 'resp_len' => strlen($resp)];
}

$results = [
    'google_ai' => testCurl('https://generativelanguage.googleapis.com/'),
    'openai' => testCurl('https://api.openai.com/v1/models'),
    'groq' => testCurl('https://api.groq.com/openai/v1/models'),
    'evolution' => testCurl('https://evolution.bodyharmony.com.br'),
    'chatwoot' => testCurl('https://crm.bodyharmony.com.br')
];

echo json_encode($results, JSON_PRETTY_PRINT);
