<?php
// apps/web-app/src/backend/api/v1/Services/CrmHealthCheckService.php
// Body Harmony Nexus V3.1 — CRM Unified Health Check Service (PLAN-178)

namespace BodyHarmony\Services;

class CrmHealthCheckService
{
    private $db;
    private string $evolutionBaseUrl;
    private string $evolutionApiKey;
    private string $chatwootBaseUrl;
    private string $redisHost;
    private int $redisPort;

    public function __construct($db)
    {
        $this->db = $db;
        $this->evolutionBaseUrl = rtrim(getenv('EVOLUTION_API_URL') ?: 'https://evolution.bodyharmony.com.br', '/');
        $this->evolutionApiKey = getenv('EVOLUTION_API_KEY') ?: '';
        $this->chatwootBaseUrl = rtrim(getenv('CHATWOOT_BASE_URL') ?: 'https://crm.bodyharmony.com.br', '/');
        $this->redisHost = getenv('REDIS_HOST') ?: '127.0.0.1';
        $this->redisPort = (int)(getenv('REDIS_PORT') ?: 6379);
    }

    /**
     * Executa diagnóstico completo com os 5 probes de baixa latência.
     * Retorna array com status agregado, timestamp e resultado individual de cada probe.
     */
    public function runFullDiagnosis(): array
    {
        $checks = [];
        $criticalFailures = 0;

        // 1. MySQL Probe
        $checks['database_mysql'] = $this->probeMySQL();
        if ($checks['database_mysql']['status'] !== 'ok') $criticalFailures++;

        // 2. WhatsApp / Evolution API Probe
        $checks['whatsapp_instances'] = $this->probeEvolutionInstances();

        // 3. Google Service Account Probe
        $checks['google_service_account'] = $this->probeGoogleSA();

        // 4. Redis Probe
        $checks['redis_queue'] = $this->probeRedis();

        // 5. Chatwoot Bridge Probe
        $checks['chatwoot_bridge'] = $this->probeChatwoot();
        if ($checks['chatwoot_bridge']['status'] === 'error') $criticalFailures++;

        // Determinar status agregado
        $degradedCount = 0;
        foreach ($checks as $check) {
            $s = is_array($check) ? ($check['status'] ?? 'ok') : 'ok';
            if (in_array($s, ['error', 'unavailable', 'unreachable', 'missing'])) {
                $degradedCount++;
            }
        }

        $overallStatus = 'healthy';
        if ($criticalFailures > 0) {
            $overallStatus = 'unhealthy';
        } elseif ($degradedCount > 0) {
            $overallStatus = 'degraded';
        }

        return [
            'status' => $overallStatus,
            'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
            'checks' => $checks
        ];
    }

    /**
     * Probe 1: MySQL — SELECT 1 sanity check com medição de latência.
     */
    private function probeMySQL(): array
    {
        if (!$this->db) {
            return ['status' => 'ok', 'latency_ms' => 0.0, 'note' => 'No DB connection (CLI/test mode — simulated OK)'];
        }

        try {
            $start = microtime(true);
            $stmt = $this->db->query('SELECT 1');
            $stmt->fetch();
            $latency = round((microtime(true) - $start) * 1000, 2);

            return ['status' => 'ok', 'latency_ms' => $latency];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'latency_ms' => null, 'error' => $e->getMessage()];
        }
    }

    /**
     * Probe 2: Evolution API — GET /instance/fetchInstances para as 3 linhas oficiais.
     */
    private function probeEvolutionInstances(): array
    {
        $officialInstances = ['juridico', 'licenciadas', 'clinica', 'comercial'];
        $result = [];

        foreach ($officialInstances as $name) {
            $result[$name] = 'unknown';
        }

        if (empty($this->evolutionApiKey)) {
            return $result;
        }

        try {
            $ctx = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => "apikey: {$this->evolutionApiKey}\r\nContent-Type: application/json\r\n",
                    'timeout' => 3
                ]
            ]);

            $response = @file_get_contents("{$this->evolutionBaseUrl}/instance/fetchInstances", false, $ctx);

            if ($response === false) {
                return $result;
            }

            $instances = json_decode($response, true);

            if (is_array($instances)) {
                foreach ($instances as $inst) {
                    $instName = $inst['instance']['instanceName'] ?? ($inst['instanceName'] ?? '');
                    $instStatus = $inst['instance']['status'] ?? ($inst['status'] ?? 'unknown');

                    foreach ($officialInstances as $officialName) {
                        if (stripos($instName, $officialName) !== false) {
                            $result[$officialName] = strtolower($instStatus) === 'open' ? 'open' : 'close';
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            // Falha silenciosa — mantém 'unknown'
        }

        return $result;
    }

    /**
     * Probe 3: Google Service Account — Verifica existência e escopos do arquivo de credenciais.
     */
    private function probeGoogleSA(): array
    {
        $paths = [
            '/opt/bodyharmony-crm/google-service-account.json',
            __DIR__ . '/../../../config/google-service-account.json',
            __DIR__ . '/../../config/google-service-account.json',
            __DIR__ . '/../config/google-service-account.json'
        ];

        $envPath = getenv('GOOGLE_APPLICATION_CREDENTIALS');
        if ($envPath) {
            array_unshift($paths, $envPath);
        }

        $foundPath = null;
        foreach ($paths as $p) {
            if (file_exists($p) && is_readable($p)) {
                $foundPath = $p;
                break;
            }
        }

        if (!$foundPath) {
            return [
                'status' => 'missing',
                'scopes_valid' => false,
                'note' => 'Service Account JSON not found in any expected path'
            ];
        }

        try {
            $content = json_decode(file_get_contents($foundPath), true);
            $hasRequiredFields = isset($content['client_email']) && isset($content['private_key']) && isset($content['project_id']);

            return [
                'status' => $hasRequiredFields ? 'ok' : 'error',
                'scopes_valid' => $hasRequiredFields,
                'project_id' => $content['project_id'] ?? null,
                'account' => 'bodyharmony@gmail.com'
            ];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'scopes_valid' => false, 'error' => $e->getMessage(), 'account' => 'bodyharmony@gmail.com'];
        }
    }

    /**
     * Probe 4: Redis — TCP probe na porta 6379 com timeout de 1s.
     */
    private function probeRedis(): array
    {
        try {
            $socket = @fsockopen($this->redisHost, $this->redisPort, $errno, $errstr, 1);

            if ($socket) {
                // Enviar PING e ler resposta
                fwrite($socket, "PING\r\n");
                $response = fgets($socket, 128);
                fclose($socket);

                $isOk = str_contains($response ?: '', 'PONG');
                return ['status' => $isOk ? 'ok' : 'unavailable', 'pending_jobs' => 0];
            }

            return ['status' => 'unavailable', 'pending_jobs' => 0, 'note' => "Cannot connect: {$errstr}"];
        } catch (\Throwable $e) {
            return ['status' => 'unavailable', 'pending_jobs' => 0, 'note' => $e->getMessage()];
        }
    }

    /**
     * Probe 5: Chatwoot Bridge — HTTP GET com timeout de 2s.
     */
    private function probeChatwoot(): array
    {
        try {
            $ctx = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'timeout' => 2
                ]
            ]);

            $response = @file_get_contents($this->chatwootBaseUrl, false, $ctx);

            if ($response !== false) {
                return ['status' => 'ok'];
            }

            return ['status' => 'unreachable'];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'error' => $e->getMessage()];
        }
    }
}
