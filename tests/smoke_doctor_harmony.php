<?php
// tests/smoke_doctor_harmony.php

// 1. Load ENV Variables (Manual Parse)
$envPath = __DIR__ . '/../apps/web-app/src/backend/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        putenv("$name=$value");
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}

// Disable SSL Verification for Local Smoke Test (Windows PHP often lacks cacert.pem)
stream_context_set_default([
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
    ],
    'http' => [
        'ignore_errors' => true
    ]
]);

// 2. Mock Environment for POST
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST['notes'] = "SMOKE TEST (REAL API): Please confirm you are receiving this message. Reponda apenas 'Confirmado' em português.";

// Create dummy file (Pseudo Image)
$dummyFile = sys_get_temp_dir() . '/smoke_test_image.jpg';
file_put_contents($dummyFile, "\xFF\xD8\xFF\xE0\x00\x10\x4A\x46\x49\x46\x00\x01"); // Minimal JPEG header
$_FILES['file'] = [
    'name' => 'smoke_test_image.jpg',
    'type' => 'image/jpeg',
    'tmp_name' => $dummyFile,
    'error' => 0,
    'size' => 12
];

// 3. Mock Config Constants if needed
if (!defined('DB_HOST')) define('DB_HOST', 'mock_host');

// 4. Mock Response Class
class Response {
    public static function json($data, $code = 200) {
        echo json_encode(['status' => $code, 'data' => $data], JSON_PRETTY_PRINT);
        exit(0);
    }
    public static function error($message, $status = 400, $code = null) {
        echo json_encode(['error' => $message, 'code' => $code ?? $status], JSON_PRETTY_PRINT);
        exit(1);
    }
}

// Define GeminiService Class directly with SSL Fix (Insecure for Test)
class GeminiService {
    private $apiKey;
    private $model = "gemini-1.5-pro";
    private $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/";

    public function __construct() {
        $this->apiKey = getenv('GOOGLE_AI_KEY') ?: getenv('GEMINI_API_KEY');
        $this->model = "gemini-pro"; // Force Text-Only Model
    }

    public function setModel($model) { $this->model = $model; }
    public function setApiKey($key) { $this->apiKey = $key; }

    public function analyze($filePath, $mimeType, $systemPrompt, $userPrompt) {
        if (!$this->apiKey) throw new Exception("API Key missing.");

        // TEXT-ONLY PAYLOAD (Ignore File for this specific smoke test to verify API Key)
        $payload = [
            "system_instruction" => ["parts" => [["text" => $systemPrompt]]],
            "contents" => [[
                "parts" => [
                    ["text" => $userPrompt]
                    // ["inline_data" => ...] REMOVED to test gemini-pro text-only
                ]
            ]],
            "generationConfig" => ["response_mime_type" => "application/json"]
        ];

        $url = $this->apiUrl . $this->model . ":generateContent?key=" . $this->apiKey;
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        // --- SSL FIX FOR SMOKE TEST ---
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        // ------------------------------

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("Gemini API request failed: HTTP $httpCode - Curl Error: $error - Response: $response");
        }

        $result = json_decode($response, true);
        $textResponse = $result['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
        return json_decode($textResponse, true);
    }
}

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/controllers/AdminDoctorHarmonyController.php';

// 5. Mock PDO and Config (Inject Real Key)
class MockPDO extends PDO {
    public function __construct() {}
    public function query(string $query, ?int $fetchMode = null, mixed ...$fetchModeArgs): PDOStatement|false {
        return new MockStatement();
    }
    public function prepare($query, $options = null) {
        return new MockStatement();
    }
}
class MockStatement extends PDOStatement {
    public function fetchAll(int $mode = PDO::FETCH_BOTH, mixed ...$args): array {
        // Return Config with REAL KEY from Environment
        $key = getenv('GEMINI_API_KEY');
        return [
            'doctor_harmony_system_prompt' => 'You are a system test.',
            'gemini_model' => 'gemini-1.5-flash',
            'gemini_api_key' => $key 
        ];
    }
}

try {
    echo "--- STARTING SMOKE TEST (REAL API) ---\n";
    $pdo = new MockPDO();
    $controller = new AdminDoctorHarmonyController($pdo);
    $controller->runSandbox();

} catch (Exception $e) {
    echo "TEST FAILED: " . $e->getMessage() . "\n";
}

// Cleanup
@unlink($dummyFile);
?>
