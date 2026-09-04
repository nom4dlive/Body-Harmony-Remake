<?php
// api/v1/Core/NexusSQLite.php
// Nexus Admin SQLite Engine — V57.5
// Zero MySQL connections para o painel administrativo.
// Armazena: nexus_audit_ops, security_ip_rules, nexus_cache.

class NexusSQLite {
    private static ?PDO $instance = null;
    private static bool $available = true;

    /**
     * Retorna true se o driver pdo_sqlite está disponível no ambiente.
     */
    public static function isAvailable(): bool {
        // No Windows Dev CLI o pdo_sqlite costuma faltar. 
        // NexusProtocol: Se não houver SQLite, o sistema DEVE degradar para MySQL usando a mesma interface.
        return self::$available && in_array('sqlite', PDO::getAvailableDrivers(), true);
    }

    /**
     * Retorna a conexão SQLite singleton.
     * Cria o arquivo e o schema automaticamente na primeira chamada.
     * Retorna null se o driver não estiver disponível (graceful degradation).
     */
    public static function get(): ?PDO {
        if (!self::isAvailable()) return null;
        if (self::$instance !== null) {
            return self::$instance;
        }

        try {
            // Caminho do arquivo SQLite — em private_uploads que já tem write permission
            $dbPath = self::getDbPath();

            // Garantir que o diretório existe
            $dir = dirname($dbPath);
            if (!is_dir($dir)) {
                @mkdir($dir, 0755, true);
            }

            $pdo = new PDO('sqlite:' . $dbPath, null, null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);

            // WAL mode: suporta leituras concorrentes sem bloquear writes
            $pdo->exec("PRAGMA journal_mode=WAL");
            $pdo->exec("PRAGMA synchronous=NORMAL");
            $pdo->exec("PRAGMA foreign_keys=ON");

            // Auto-bootstrap do schema
            self::bootstrap($pdo);

            self::$instance = $pdo;
            return $pdo;
        } catch (Exception $e) {
            self::$available = false;
            error_log("[NexusSQLite Init Error]: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Retorna o caminho absoluto do arquivo SQLite.
     * Produção: dentro de private_uploads/ (fora do public_html — já tem permissão).
     * Local: dentro de storage/ (relativo ao backend).
     */
    public static function getDbPath(): string {
        // Produção Hostinger
        if (defined('PRIVATE_UPLOADS_DIR') && PRIVATE_UPLOADS_DIR) {
            return PRIVATE_UPLOADS_DIR . '/nexus/nexus_ops.db';
        }
        // Fallback local dev
        return __DIR__ . '/../../storage/nexus_ops.db';
    }

    /**
     * Cria as tabelas necessárias se ainda não existirem.
     */
    private static function bootstrap(PDO $pdo): void {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS nexus_audit_ops (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id    INTEGER,
                action      TEXT NOT NULL,
                target_id   TEXT,
                payload_before TEXT,
                payload_after  TEXT,
                created_at  TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '-3 hours'))
            );

            CREATE TABLE IF NOT EXISTS security_ip_rules (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address  TEXT NOT NULL UNIQUE,
                rule_type   TEXT NOT NULL DEFAULT 'BAN',
                reason      TEXT,
                admin_id    INTEGER,
                admin_name  TEXT,
                expires_at  TEXT,
                created_at  TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '-3 hours'))
            );

            CREATE INDEX IF NOT EXISTS idx_rules_ip ON security_ip_rules(ip_address);
            CREATE INDEX IF NOT EXISTS idx_audit_admin ON nexus_audit_ops(admin_id);
            CREATE INDEX IF NOT EXISTS idx_audit_created ON nexus_audit_ops(created_at);

            CREATE TABLE IF NOT EXISTS nexus_cache (
                cache_key   TEXT PRIMARY KEY,
                payload     TEXT NOT NULL,
                expires_at  INTEGER NOT NULL
            );
        ");
    }

    /**
     * Lê do cache SQLite. Retorna null se expirado ou inexistente.
     */
    public static function cacheGet(string $key): ?array {
        try {
            $db = self::get();
            $stmt = $db->prepare("SELECT payload, expires_at FROM nexus_cache WHERE cache_key = ?");
            $stmt->execute([$key]);
            $row = $stmt->fetch();
            if (!$row || $row['expires_at'] < time()) {
                return null;
            }
            return json_decode($row['payload'], true);
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Grava no cache SQLite com TTL em segundos.
     */
    public static function cacheSet(string $key, array $data, int $ttlSeconds = 300): void {
        try {
            $db = self::get();
            if (self::isAvailable()) {
                $stmt = $db->prepare("
                    INSERT INTO nexus_cache (cache_key, payload, expires_at)
                    VALUES (?, ?, ?)
                    ON CONFLICT(cache_key) DO UPDATE SET payload = excluded.payload, expires_at = excluded.expires_at
                ");
            } else {
                // MySQL Fallback
                $stmt = $db->prepare("
                    INSERT INTO nexus_cache (cache_key, payload, expires_at)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE payload = VALUES(payload), expires_at = VALUES(expires_at)
                ");
            }
            $stmt->execute([$key, json_encode($data), time() + $ttlSeconds]);
        } catch (Exception $e) {
            error_log("[NexusSQLite Cache Error]: " . $e->getMessage());
        }
    }

    /**
     * Verifica se o SQLite está acessível e com permissão de escrita.
     */
    public static function healthCheck(): array {
        try {
            $db = self::get();
            $db->exec("INSERT INTO nexus_cache (cache_key, payload, expires_at) VALUES ('health_check', '1', " . (time() + 5) . ")
                       ON CONFLICT(cache_key) DO UPDATE SET expires_at = excluded.expires_at");
            return ['ok' => true, 'path' => self::getDbPath()];
        } catch (Exception $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
}
