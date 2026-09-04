<?php
// api/v1/libs/ResourceService.php

class ResourceService {
    private $pdo;
    private $secret;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->secret = getenv('APP_SECRET') ?: 'BodyHarmonySecretKey2026';
    }

    /**
     * Gera uma URL assinada para download de um recurso.
     */
    public function generateSignedUrl($resourceId, $licenciadaId = 0, $ttl = 900) {
        $expires = time() + $ttl;
        // Include licenciada_id in signature to prevent tampering
        $signature = hash_hmac('sha256', "$resourceId:$licenciadaId:$expires", $this->secret);

        $base = "/api/download.php";
        return "{$base}?lib_id={$resourceId}&licenciada_id={$licenciadaId}&expires={$expires}&signature={$signature}";
    }

    /**
     * Gera uma URL assinada para streaming de um recurso (Áudio).
     */
    public function generateStreamUrl($resourceId, $ttl = 3600) {
        $expires = time() + $ttl;
        $signature = hash_hmac('sha256', "$resourceId:$expires", $this->secret);

        $base = "/api/download.php";
        return "{$base}?lib_id={$resourceId}&expires={$expires}&signature={$signature}&mode=stream";
    }

    /**
     * Valida uma assinatura.
     */
    public function validateSignature($resourceId, $expires, $signature) {
        if (time() > $expires) return false;
        
        $expectedSig = hash_hmac('sha256', "$resourceId:$expires", $this->secret);
        return hash_equals($expectedSig, $signature);
    }

    /**
     * Verifica se uma licenciada tem acesso a um recurso específico.
     */
    public function hasAccess($resourceId, $licenciadaId) {
        $stmt = $this->pdo->prepare("SELECT 1 FROM lms_resource_access WHERE resource_id = ? AND licenciada_id = ?");
        $stmt->execute([$resourceId, $licenciadaId]);
        return (bool)$stmt->fetch();
    }
}
