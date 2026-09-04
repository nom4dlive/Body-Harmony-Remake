<?php
// apps/web-app/src/backend/api/v1/libs/GeminiService.php

class GeminiService {
    private $apiKey;
    private $model = "models/gemini-3.6-flash";
    private $apiUrl = "https://generativelanguage.googleapis.com/v1beta/";
    
    // Nvidia NIM integration (OpenAI-compatible)
    private $provider = "gemini";
    private $nvidiaKey;
    private $nvidiaModel = "meta/llama-3.2-11b-vision-instruct";
    private $nvidiaUrl = "https://integrate.api.nvidia.com/v1/chat/completions";

    public function __construct() {
        // Load configurations from Environment with Fallbacks
        $this->provider = getenv('AI_PROVIDER') ?: "gemini";
        $this->apiKey = getenv('GOOGLE_AI_KEY') ?: getenv('GEMINI_API_KEY');
        $this->model = getenv('GEMINI_MODEL') ?: "models/gemini-3.6-flash";
        if (!str_starts_with($this->model, 'models/')) {
            $this->model = 'models/' . $this->model;
        }
        
        $this->nvidiaKey = getenv('NVIDIA_API_KEY');
        $this->nvidiaModel = getenv('NVIDIA_MODEL') ?: "meta/llama-3.2-11b-vision-instruct";
    }

    /**
     * Gera resposta de chat dinâmica via Gemini 3.6 Flash
     */
    public function generateChatCompletion(string $systemPrompt, array $conversationHistory, string $userMessage, float $temperature = 0.4): string {
        if (empty($this->apiKey)) {
            return "Hermes AI Offline: Chave de API não configurada.";
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/{$this->model}:generateContent?key={$this->apiKey}";

        $contents = [];
        
        // System instruction formatada no primeiro turno
        $fullSystemText = "DIRETRIZES DO SISTEMA (HERMES AGENT):\n" . $systemPrompt;
        
        foreach ($conversationHistory as $turn) {
            $role = ($turn['role'] === 'assistant' || $turn['role'] === 'model') ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $turn['content'] ?? '']]
            ];
        }

        // Mensagem atual do usuário com prompt do sistema
        $currentUserText = (empty($conversationHistory) ? ($fullSystemText . "\n\nMENSAGEM DO USUÁRIO:\n") : "") . $userMessage;
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $currentUserText]]
        ];

        $payload = [
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => $temperature,
                'maxOutputTokens' => 1024
            ]
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $data = json_decode($response, true);
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
            if (!empty(trim($text))) {
                return trim($text);
            }
        }

        return "Hermes em processamento. Como posso te auxiliar?";
    }

    public function setProvider($provider) {
        if ($provider) {
            $this->provider = strtolower(trim($provider));
        }
    }

    public function setModel($model) {
        if ($model) {
            $this->model = $model;
        }
    }

    public function setApiKey($key) {
        if ($key) {
            $this->apiKey = $key;
        }
    }

    public function setNvidiaKey($key) {
        if ($key) {
            $this->nvidiaKey = $key;
        }
    }

    public function setNvidiaModel($model) {
        if ($model) {
            $this->nvidiaModel = $model;
        }
    }

    /**
     * Analyze multimodal input (image/audio + text) via selected AI Provider
     * @param string $filePath Path to the file to analyze
     * @param string $mimeType Mime type of the file
     * @param string $systemPrompt System instructions for the AI
     * @param string $userPrompt Optional user prompt
     * @return array Parsed JSON response from AI
     */
    public function analyze($filePath, $mimeType, $systemPrompt, $userPrompt = "Analise este caso clínico do Método Body Harmony.") {
        if ($this->provider === 'nvidia') {
            return $this->analyzeNvidia($filePath, $mimeType, $systemPrompt, $userPrompt);
        } else {
            return $this->analyzeGemini($filePath, $mimeType, $systemPrompt, $userPrompt);
        }
    }

    /**
     * Analyze via NVIDIA NIM (OpenAI Compatible)
     */
    private function analyzeNvidia($filePath, $mimeType, $systemPrompt, $userPrompt) {
        if (!$this->nvidiaKey) {
            throw new Exception("Nvidia API Key missing. Cannot connect to Nvidia NIM.");
        }

        $fileData = base64_encode(file_get_contents($filePath));
        $imageUrl = "data:" . $mimeType . ";base64," . $fileData;

        // Structured prompt to ensure JSON output and combine instructions
        $combinedUserPrompt = "INSTRUÇÕES DO SISTEMA:\n" . $systemPrompt . "\n\nCASO CLÍNICO DO USUÁRIO:\n" . $userPrompt;

        $payload = [
            "model" => $this->nvidiaModel,
            "messages" => [
                [
                    "role" => "user",
                    "content" => [
                        [
                            "type" => "text",
                            "text" => $combinedUserPrompt
                        ],
                        [
                            "type" => "image_url",
                            "image_url" => [
                                "url" => $imageUrl
                            ]
                        ]
                    ]
                ]
            ],
            "temperature" => 0.2,
            "max_tokens" => 2048,
            "stream" => false
        ];

        // Enable response_format if compatible models are selected
        // Most NVIDIA NIM vision models support json_object mode
        if (strpos($this->nvidiaModel, 'llama') !== false || strpos($this->nvidiaModel, 'nemotron') !== false) {
            $payload["response_format"] = ["type" => "json_object"];
        }

        $ch = curl_init($this->nvidiaUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->nvidiaKey
        ]);

        // SSL verification bypass for local staging
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            error_log("[NVIDIA API ERROR] HTTP $httpCode: " . $response);
            throw new Exception("Nvidia NIM API request failed: HTTP $httpCode");
        }

        $result = json_decode($response, true);
        $textResponse = $result['choices'][0]['message']['content'] ?? '{}';

        return $this->parseJson($textResponse);
    }

    /**
     * Analyze via Google Gemini
     */
    private function analyzeGemini($filePath, $mimeType, $systemPrompt, $userPrompt) {
        if (!$this->apiKey) {
            throw new Exception("API Key missing. Cannot connect to Gemini.");
        }

        $fileData = base64_encode(file_get_contents($filePath));

        $payload = [
            "system_instruction" => [
                "parts" => [
                    ["text" => $systemPrompt]
                ]
            ],
            "contents" => [
                [
                    "parts" => [
                        ["text" => $userPrompt],
                        [
                            "inline_data" => [
                                "mime_type" => $mimeType,
                                "data" => $fileData
                            ]
                        ]
                    ]
                ]
            ],
            "generationConfig" => [
                "response_mime_type" => "application/json",
                "temperature" => 0.4,
                "topP" => 0.8,
                "topK" => 40
            ]
        ];

        $url = $this->apiUrl . $this->model . ":generateContent?key=" . $this->apiKey;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        // SSL verification bypass
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            error_log("[GEMINI API ERROR] HTTP $httpCode: " . $response);
            throw new Exception("Gemini API request failed: HTTP $httpCode");
        }

        $result = json_decode($response, true);
        $textResponse = $result['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
        
        return $this->parseJson($textResponse);
    }

    /**
     * Resilient JSON Parser
     */
    private function parseJson($textResponse) {
        $textResponse = trim($textResponse);
        
        // Strip markdown code block wrappers if present
        if (strpos($textResponse, '```json') === 0) {
            $textResponse = substr($textResponse, 7);
            if (substr($textResponse, -3) === '```') {
                $textResponse = substr($textResponse, 0, -3);
            }
        } elseif (strpos($textResponse, '```') === 0) {
            $textResponse = substr($textResponse, 3);
            if (substr($textResponse, -3) === '```') {
                $textResponse = substr($textResponse, 0, -3);
            }
        }
        
        $textResponse = trim($textResponse);
        $decoded = json_decode($textResponse, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("[AI SERVICE JSON ERROR] Failed to decode: " . $textResponse);
            return [
                "confidence" => 0.0,
                "error" => "Failed to parse AI response as JSON",
                "raw" => $textResponse
            ];
        }
        
        return $decoded;
    }
}
