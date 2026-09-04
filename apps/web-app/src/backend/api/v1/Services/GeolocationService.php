<?php

namespace BodyHarmony\Services;

class GeolocationService {
    
    /**
     * Resolve IP address to simplified location string.
     * 
     * @param string $ip
     * @return string "City, Country" or "Unknown"
     */
    public function resolveLocation(string $ip): string {
        // For localhost or private IPs
        if ($ip === '127.0.0.1' || $ip === '::1') {
            return 'Localhost';
        }

        // Basic stub for now to avoid external dependency latency issues during dev
        // In production, uncomment the logic below to use a free API
        
        /*
        $apiUrl = "http://ip-api.com/json/{$ip}";
        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 2); // Fast timeout
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response) {
            $data = json_decode($response, true);
            if ($data && $data['status'] === 'success') {
                return $data['city'] . ', ' . $data['countryCode'];
            }
        }
        */

        return 'Unknown Location';
    }
}
