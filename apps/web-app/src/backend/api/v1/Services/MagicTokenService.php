<?php
/**
 * apps/web-app/src/backend/api/v1/Services/MagicTokenService.php
 * Serviço de geração e validação de Magic Links para SSO (V94).
 */

class MagicTokenService {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Gera um token único para uma licenciada.
     * Expira em 30 minutos por padrão.
     * @param int $licenciadaId
     * @param int $expiresInMinutes
     * @return string|null
     */
    public function createToken($licenciadaId, $expiresInMinutes = 30) {
        $token = bin2hex(random_bytes(32)); // 64 chars
        $expiresAt = date('Y-m-d H:i:s', strtotime("+$expiresInMinutes minutes"));

        $stmt = $this->pdo->prepare("
            INSERT INTO magic_tokens (licenciada_id, token, expires_at, created_at)
            VALUES (?, ?, ?, NOW())
        ");

        if ($stmt->execute([$licenciadaId, $token, $expiresAt])) {
            return $token;
        }
        return null;
    }

    /**
     * Valida um token e retorna o licenciada_id se for válido.
     * Marca o token como usado imediatamente.
     * @param string $token
     * @return int|null
     */
    public function validateAndUse($token) {
        $stmt = $this->pdo->prepare("
            SELECT licenciada_id FROM magic_tokens 
            WHERE token = ? AND used_at IS NULL AND expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([$token]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $licenciadaId = $row['licenciada_id'];
            
            // Invalidação imediata (uso único)
            $this->pdo->prepare("UPDATE magic_tokens SET used_at = NOW() WHERE token = ?")
                      ->execute([$token]);
                      
            return (int)$licenciadaId;
        }

        return null;
    }

    /**
     * Limpeza preventiva de tokens expirados (opcional, pode ser via Cron)
     */
    public function purgeExpired() {
        return $this->pdo->exec("DELETE FROM magic_tokens WHERE expires_at < NOW() AND used_at IS NULL");
    }
}
