<?php
// apps/web-app/src/backend/api/v1/crm/settings.php
// CRM V4 Settings & Appearance Preferences API (Nexus Protocol V4.0 - PLAN-186)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;

    // Garantir tabela
    if ($dbConn) {
        $dbConn->exec("
            CREATE TABLE IF NOT EXISTS `crm_settings` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `setting_key` VARCHAR(100) NOT NULL UNIQUE,
                `setting_value` TEXT NOT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
    }

    $method = $_SERVER['REQUEST_METHOD'];

    $defaultSettings = [
        'sent_bubble_bg' => '#DCF8C6',
        'sent_bubble_text' => '#0F172A',
        'received_bubble_bg' => '#FFFFFF',
        'received_bubble_text' => '#0F172A',
        'whisper_bubble_bg' => '#FEF3C7',
        'default_dossier_open' => false,
        'audio_notifications_enabled' => true
    ];

    if ($method === 'GET') {
        $settings = $defaultSettings;

        if ($dbConn) {
            $stmt = $dbConn->query("SELECT setting_key, setting_value FROM crm_settings");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rows as $r) {
                $val = $r['setting_value'];
                if ($val === 'true') $val = true;
                elseif ($val === 'false') $val = false;
                $settings[$r['setting_key']] = $val;
            }
        }

        echo json_encode([
            'success' => true,
            'settings' => $settings
        ]);
        exit;
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true) ?: [];

        if ($dbConn && !empty($input)) {
            $stmt = $dbConn->prepare("
                INSERT INTO crm_settings (setting_key, setting_value)
                VALUES (:key, :value)
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            ");

            foreach ($input as $k => $v) {
                $valStr = is_bool($v) ? ($v ? 'true' : 'false') : (string)$v;
                $stmt->execute([
                    ':key' => $k,
                    ':value' => $valStr
                ]);
            }
        }

        echo json_encode([
            'success' => true,
            'message' => 'Configurações de aparência do CRM salvas com sucesso.'
        ]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao processar configurações do CRM: ' . $e->getMessage()
    ]);
}
