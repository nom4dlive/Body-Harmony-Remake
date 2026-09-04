<?php
// src/backend/api/v1/Services/RiskEngineService.php

class RiskEngineService {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Calculates risk score for a login attempt.
     * 
     * @param int|null $userId
     * @param string $email
     * @param string $ip
     * @param string $userAgent
     * @param array $headers Mixed headers for fingerprinting
     * @return array ['score' => int, 'details' => array]
     */
    public function calculateScore($userId, $email, $ip, $userAgent, $headers = []) {
        $score = 0;
        $details = [];

        // 0. Check Firewall Whitelist (Nexus Protocol V3.1)
        try {
            $stmtWL = $this->pdo->prepare("
                SELECT COUNT(*) FROM security_ip_rules 
                WHERE ip_address = ? AND rule_type = 'ALLOW' 
                AND (expires_at IS NULL OR expires_at > NOW())
            ");
            $stmtWL->execute([$ip]);
            if ($stmtWL->fetchColumn() > 0) {
                // If IP is explicitly allowed in Firewall, bypass risk engine
                return [
                    'score' => 0,
                    'details' => ['TRUSTED_IP_WHITELIST'],
                    'fingerprint' => hash('sha256', $userAgent . ($headers['X-SCREEN-RESOLUTION'] ?? '') . ($headers['X-DEVICE-ID'] ?? '')),
                    'location' => ['city' => 'Trusted', 'region' => 'Nexus', 'isp' => 'Internal']
                ];
            }
        } catch (Exception $e) {
            // Silently continue if rule check fails
        }
        
        // 0. GeoIP Lookup
        $location = GeoIPService::getLocation($ip);

        // 1. Fingerprint Generation
        $fingerprint = hash('sha256', $userAgent . ($headers['X-SCREEN-RESOLUTION'] ?? '') . ($headers['X-DEVICE-ID'] ?? ''));
        
        // 2. Check Device Confidence
        $isTrusted = false;
        if ($userId) {
            $stmt = $this->pdo->prepare("SELECT is_trusted FROM licenciada_devices WHERE licenciada_id = ? AND fingerprint_hash = ?");
            $stmt->execute([$userId, $fingerprint]);
            $isTrusted = (bool)$stmt->fetchColumn();
        }

        if ($isTrusted) {
            $score -= 20; // Confidence bonus
            $details[] = "TRUSTED_DEVICE";
        } else {
            // 3. New Device Check
            if ($userId) {
                $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM licenciada_devices WHERE licenciada_id = ?");
                $stmt->execute([$userId]);
                if ($stmt->fetchColumn() > 0) {
                    $score += 30; // New device for existing user
                    $details[] = "NEW_DEVICE";
                }
            }
        }

        // 4. Geographic Velocity (Impossible travel)
        if ($userId) {
            $stmt = $this->pdo->prepare("
                SELECT ip_address, created_at 
                FROM auth_logs 
                WHERE email = ? AND status = 'success' 
                ORDER BY created_at DESC LIMIT 1
            ");
            $stmt->execute([$email]);
            $lastLogin = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($lastLogin && $lastLogin['ip_address'] !== $ip) {
                $lastLocation = GeoIPService::getLocation($lastLogin['ip_address']);
                
                if ($lastLocation['city'] !== $location['city']) {
                    $score += 40; // High suspicion if city changed
                    $details[] = "IMPOSSIBLE_TRAVEL_SUSPECTED";
                    $details[] = "FROM_" . strtoupper(str_replace(' ', '_', $lastLocation['city']));
                } else {
                    $score += 10; // Low suspicion if same city but different IP
                    $details[] = "LOCATION_IP_ROTATION";
                }
            }
        }

        // 5. IP Reputation (Local Throttling History)
        $stmt = $this->pdo->prepare("
            SELECT COUNT(DISTINCT email) 
            FROM auth_logs 
            WHERE ip_address = ? AND status != 'success' AND created_at > NOW() - INTERVAL 1 HOUR
        ");
        $stmt->execute([$ip]);
        $credentialStuffingCount = $stmt->fetchColumn();
        
        if ($credentialStuffingCount > 3) {
            $score += 50;
            $details[] = "IP_DIRTY_MULTIPLE_ACCOUNTS";
        }

        // 6. Concurrent Access
        if ($userId) {
            $stmt = $this->pdo->prepare("
                SELECT COUNT(DISTINCT ip_address) 
                FROM auth_logs 
                WHERE email = ? AND status = 'success' AND created_at > NOW() - INTERVAL 30 MINUTE
            ");
            $stmt->execute([$email]);
            $concurrentIps = $stmt->fetchColumn();
            if ($concurrentIps >= 2) {
                $score += 60;
                $details[] = "CONCURRENT_ACCESS_DETECTION";
            }
        }

        // Final normalization 0-100
        $score = max(0, min(100, $score));

        // Add location metadata to details for UI tooltips
        $details[] = "LOC:" . ($location['city'] ?? 'Unknown');
        $details[] = "ISP:" . ($location['isp'] ?? 'Unknown');

        // Update device record with latest location/isp
        if ($userId && $fingerprint) {
            try {
                $stmt = $this->pdo->prepare("
                    UPDATE licenciada_devices 
                    SET city = ?, 
                        region = ?, 
                        isp = ?, 
                        ip_address = ?,
                        last_used_at = NOW()
                    WHERE licenciada_id = ? AND fingerprint_hash = ?
                ");
                $stmt->execute([$location['city'], $location['region'], $location['isp'], $ip, $userId, $fingerprint]);
            } catch (Exception $e) {
                // Silently skip if update fails
            }
        }

        return [
            'score' => $score,
            'details' => $details,
            'fingerprint' => $fingerprint,
            'location' => $location
        ];
    }
}
