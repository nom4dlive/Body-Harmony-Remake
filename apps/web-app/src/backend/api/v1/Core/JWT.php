<?php
/**
 * JWT.php - JSON Web Token Helper
 * 
 * Simple JWT implementation for licenciada authentication
 * Uses HMAC-SHA256 for signing
 */

class JWT {
    private static $secret = null;
    
    /**
     * Initialize JWT with secret key
     * @param string $secret Secret key from .env
     */
    public static function init($secret) {
        self::$secret = $secret;
    }
    
    /**
     * Encode payload into JWT
     * @param array $payload Data to encode (licenciada_id, device_token, etc)
     * @param int $expiry Expiry time in seconds (default 24h)
     * @return string JWT token
     */
    public static function encode($payload, $expiry = 86400) {
        if (self::$secret === null) {
            throw new Exception('JWT secret not initialized');
        }
        
        // Header
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];
        $headerEncoded = self::base64UrlEncode(json_encode($header));
        
        // Payload with expiry
        $payload['exp'] = time() + $expiry;
        $payload['iat'] = time(); // Issued at
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        
        // Signature
        $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", self::$secret, true);
        $signatureEncoded = self::base64UrlEncode($signature);
        
        return "$headerEncoded.$payloadEncoded.$signatureEncoded";
    }
    
    /**
     * Decode and validate JWT
     * @param string $token JWT token
     * @return array|false Decoded payload or false if invalid
     */
    public static function decode($token) {
        if (self::$secret === null) {
            throw new Exception('JWT secret not initialized');
        }
        
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false; // Invalid format
        }
        
        [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;
        
        // Verify signature
        $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", self::$secret, true);
        $signatureCheck = self::base64UrlEncode($signature);
        
        if ($signatureEncoded !== $signatureCheck) {
            return false; // Invalid signature
        }
        
        // Decode payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);
        
        if (!$payload) {
            return false; // Invalid JSON
        }
        
        // Check expiry
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false; // Token expired
        }
        
        return $payload;
    }
    
    /**
     * Base64 URL-safe encode
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL-safe decode
     */
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
