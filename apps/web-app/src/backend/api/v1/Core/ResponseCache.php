<?php
/**
 * ResponseCache V2 — File-based cache para endpoints públicos estáticos.
 * 
 * IMPORTANTE: Compatível com Response::json() que chama ob_clean() + exit.
 * Aplica cache ANTES de chamar o controller — serve JSON direto do arquivo.
 * 
 * Uso no router:
 *   ResponseCache::wrap('public_key', fn() => $controller->getData(), 300);
 * 
 * Invalida automaticamente em mutating routes (POST/PUT/DELETE).
 * Serve dados estale se DB falhar (Stale-While-Revalidate).
 */
class ResponseCache {
    private static int $defaultTtl = 1800; // 30 minutos (Stability Shield V100 - Redução extrema de DB Uplink)

    private static function getCacheDir(): string {
        static $dir = null;
        if ($dir) return $dir;
        $candidates = [
            defined('LOGS_DIR') ? LOGS_DIR . '/cache' : null,
            sys_get_temp_dir() . '/bh_api_cache',
            '/tmp/bh_api_cache',
            dirname(__DIR__, 4) . '/logs/cache',
            dirname(__DIR__, 2) . '/logs/cache',
            __DIR__ . '/cache'
        ];
        foreach ($candidates as $d) {
            if (!file_exists($d)) {
                @mkdir($d, 0755, true);
            }
            if (file_exists($d) && is_writable($d)) {
                $dir = $d;
                return $dir;
            }
        }
        $dir = sys_get_temp_dir();
        return $dir;
    }

    private static function cacheFile(string $key, bool $isPublic = false): string {
        // Segmentar cache por usuário se NÃO for público
        $sessionKey = 'global';
        if (!$isPublic) {
            $userId = $_SESSION['user_id'] ?? ($_SESSION['admin_id'] ?? 'guest');
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $sessionKey = $userId . md5($token);
        }
        
        return self::getCacheDir() . '/' . md5($key . $sessionKey) . '.json';
    }

    /**
     * Lê cache. Retorna ['data'=>..., 'stale'=>bool] ou null se não existe.
     */
    private static function read(string $key, bool $isPublic = false): ?array {
        $file = self::cacheFile($key, $isPublic);
        if (!file_exists($file)) return null;

        $raw = @file_get_contents($file);
        if (!$raw) return null;

        $entry = json_decode($raw, true);
        if (!$entry || !isset($entry['expires_at'], $entry['data'])) return null;

        $isStale = time() > $entry['expires_at'];
        return ['data' => $entry['data'], 'stale' => $isStale];
    }

    /**
     * Escreve cache.
     */
    public static function write(string $key, array $data, int $ttl = 0, bool $isPublic = false): void {
        if ($ttl <= 0) $ttl = self::$defaultTtl;
        $file = self::cacheFile($key, $isPublic);
        @file_put_contents($file, json_encode([
            'cache_key'  => $key,
            'expires_at' => time() + $ttl,
            'data'       => $data,
            'created_at' => date('c')
        ], JSON_UNESCAPED_UNICODE), LOCK_EX);
    }

    /**
     * Invalida uma chave específica.
     * Chamar em POST/PUT/DELETE que modificam os dados.
     */
    public static function invalidate(string $key, bool $isPublic = false): void {
        $file = self::cacheFile($key, $isPublic);
        
        // Cascade invalidation for the unified landing-data cache
        if ($isPublic && $key !== 'api_public_landing_data') {
            self::invalidate('api_public_landing_data', true);
        }

        if (!file_exists($file)) return;

        // Stability Shield V100: Preservar dados para fallback stale
        $raw = @file_get_contents($file);
        if ($raw) {
            $entry = json_decode($raw, true);
            if ($entry && isset($entry['data'])) {
                $entry['expires_at'] = 0; // Marca stale imediatamente, preserva dados
                @file_put_contents($file, json_encode($entry, JSON_UNESCAPED_UNICODE), LOCK_EX);
                return;
            }
        }
        @unlink($file); // Fallback: arquivo corrompido
    }

    /**
     * Limpa/invalida todas as chaves de cache que iniciam com o prefixo informado.
     * Útil para invalidar caches privados/segmentados de todos os usuários simultaneamente.
     */
    public static function clear(string $prefix): void {
        $dir = self::getCacheDir();
        $files = glob($dir . '/*.json');
        if (!$files) return;

        foreach ($files as $file) {
            $raw = @file_get_contents($file);
            if (!$raw) continue;
            $entry = json_decode($raw, true);
            if (isset($entry['cache_key']) && str_starts_with($entry['cache_key'], $prefix)) {
                @unlink($file);
            }
        }
    }

    /**
     * Invalida todo o cache público/privado.
     */
    public static function flush(): void {
        $files = glob(self::getCacheDir() . '/*.json');
        if ($files) foreach ($files as $f) @unlink($f);
    }

    /**
     * PRINCIPAL: Serve do cache se válido.
     * Se expirado mas existe → serve stale E agenda revalidação.
     * Se miss → chama $fetcher(DB), armazena e serve.
     * Se DB falha E existe stale → serve stale (resiliente a DB_CONN_LIMIT).
     *
     * @param string   $key     Chave de cache (ex: 'public_site_config')
     * @param callable $fetcher fn():array — executa query e retorna dados
     * @param int      $ttl     Segundos de validade
     */
    public static function serve(string $key, callable $fetcher, int $ttl = 300, bool $isPublic = false): void {
        $entry = self::read($key, $isPublic);
 
        // 1. Cache válido — serve direto, sem tocar DB
        if ($entry && !$entry['stale']) {
            if (!headers_sent()) {
                header('X-Cache: HIT');
                header('X-Cache-TTL: ' . max(0, $entry['data']['expires_at'] ?? 0 - time()));
            }
            Response::json($entry['data']);
            return;
        }
 
        // 2. Cache expirado OU miss — tenta DB
        try {
            $data = $fetcher();
            self::write($key, $data, $ttl, $isPublic);
            if (!headers_sent()) header('X-Cache: ' . ($entry ? 'STALE-REFRESHED' : 'MISS'));
            Response::json($data);
        } catch (Throwable $e) {
            // 3. DB falhou — serve stale se disponível (Stale-While-Revalidate)
            if ($entry) {
                if (!headers_sent()) {
                    header('X-Cache: STALE-FALLBACK');
                    header('X-Cache-Error: DB unavailable — serving stale data');
                }
                Response::json($entry['data']);
                return;
            }
            // 4. Sem cache e sem DB — erro controlado
            if (!headers_sent()) {
                http_response_code($isPublic ? 503 : 500);
                header('Retry-After: 5');
            }
            echo json_encode([
                'error' => $isPublic ? 'Nexus Service Temporarily Unavailable (Uplink Limit)' : 'Erro interno ao processar requisição no servidor',
                'message' => $e->getMessage(),
                'code'  => $isPublic ? 'DB_CONN_LIMIT' : 'SERVER_ERROR'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
