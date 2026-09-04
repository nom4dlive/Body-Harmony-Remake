<?php
// tests/list_models.php

// 1. Load ENV Variables (Manual Parse for Key)
$envPath = __DIR__ . '/../apps/web-app/src/backend/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        putenv(trim($name)."=".trim($value));
    }
}

$apiKey = getenv('GOOGLE_AI_KEY') ?: getenv('GEMINI_API_KEY');
if (!$apiKey) die("API Key missing\n");

$url = "https://generativelanguage.googleapis.com/v1beta/models?key=" . $apiKey;

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Fix for local Windows
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

echo "Fetching models list...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo "Error: HTTP $httpCode\n";
    echo $response;
    exit(1);
}

$data = json_decode($response, true);
if (isset($data['models'])) {
    foreach ($data['models'] as $m) {
        if (strpos($m['name'], '1.5') !== false) {
            echo "- " . $m['name'];
            if (in_array("generateContent", $m['supportedGenerationMethods'])) {
                echo " [GENERATION SUPPORTED]";
            }
            echo "\n";
        }
    }
} else {
    echo "No models found in response.\n";
    echo $response;
}
?>
