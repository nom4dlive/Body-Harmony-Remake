<?php
// apps/web-app/src/backend/api/v1/libs/GeoIPService.php

class GeoIPService {
    private static $dbPath = __DIR__ . '/../storage/geoip/GeoLite2-City.mmdb';

    /**
     * Get location data from IP
     * For now, this is a hybrid: Local Cache + Preparation for MMDB
     */
    public static function getLocation($ip) {
        $data = [
            'city' => 'Desconhecido',
            'region' => 'XX',
            'isp' => 'Provedor Desconhecido',
            'country' => 'BR'
        ];

        // 1. Skip local IPs
        if ($ip === '127.0.0.1' || $ip === '::1' || strpos($ip, '192.168.') === 0) {
            return array_merge($data, ['city' => 'Localhost', 'region' => 'Dev']);
        }

        // 2. MMDB Logic (Future Phase 2.1)
        // If file exists, we would use MaxMind\Db\Reader here.
        // For Phase 1, we use a lightweight API fallback with a simple local file cache
        // to avoid hitting limits and keep it fast.
        
        $cacheDir = __DIR__ . '/../storage/geoip/cache/';
        if (!is_dir($cacheDir)) mkdir($cacheDir, 0777, true);
        
        $cacheFile = $cacheDir . md5($ip) . '.json';
        
        // Return cache if fresh (24h)
        if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < 86400)) {
            return json_decode(file_get_contents($cacheFile), true);
        }

        // 3. Fallback to a fast API (ip-api.com is free for non-commercial/low volume)
        try {
            $ctx = stream_context_create(['http' => ['timeout' => 2]]);
            $response = @file_get_contents("http://ip-api.com/json/{$ip}?fields=status,city,region,isp,countryCode", false, $ctx);
            if ($response) {
                $res = json_decode($response, true);
                if ($res && $res['status'] === 'success') {
                    $data = [
                        'city' => $res['city'] ?? 'Desconhecido',
                        'region' => $res['region'] ?? 'XX',
                        'isp' => $res['isp'] ?? 'Provedor Desconhecido',
                        'country' => $res['countryCode'] ?? 'BR'
                    ];
                    file_put_contents($cacheFile, json_encode($data));
                }
            }
        } catch (Exception $e) {
            // Silently fail to stub
        }

        return $data;
    }
}
