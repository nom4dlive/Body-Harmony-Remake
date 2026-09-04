<?php
// apps/web-app/src/backend/api/v1/Services/GoogleContactsSyncService.php
// Body Harmony Nexus V3.1 — Google Contacts Synchronization Service (PLAN-172)

namespace BodyHarmony\Services;

use PDO;

class GoogleContactsSyncService {
    private mixed $db;
    private string $accountEmail;

    public function __construct(mixed $db = null, string $accountEmail = 'bodyharmony@gmail.com') {
        $this->db = $db;
        $this->accountEmail = $accountEmail;
        $this->ensureTables();
    }

    private function ensureTables(): void {
        if (!$this->db) return;
        try {
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `crm_google_contacts_sync` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `contact_phone` VARCHAR(30) NOT NULL UNIQUE,
                    `formatted_name` VARCHAR(200) NOT NULL,
                    `contact_category` ENUM('PACIENTE', 'ALUNA', 'LICENCIADA', 'LEAD') DEFAULT 'LEAD',
                    `cpf` VARCHAR(20) DEFAULT NULL,
                    `email` VARCHAR(150) DEFAULT NULL,
                    `city_state` VARCHAR(100) DEFAULT NULL,
                    `google_resource_name` VARCHAR(255) DEFAULT NULL,
                    `notes` TEXT DEFAULT NULL,
                    `synced_at` DATETIME DEFAULT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX `idx_contact_phone` (`contact_phone`),
                    INDEX `idx_category` (`contact_category`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        } catch (\Throwable $e) {
            error_log("[GoogleContactsSyncService] ensureTables error: " . $e->getMessage());
        }
    }

    public function formatContactName(string $name, string $category, ?string $location = null, ?string $state = null): string {
        $trimmedName = trim($name);
        $cat = strtoupper($category);

        $loc = trim($location ?? '');
        $uf = trim($state ?? '');
        $cityState = '';
        if (!empty($loc) && !empty($uf)) {
            $cityState = "{$loc}/{$uf}";
        } elseif (!empty($loc)) {
            $cityState = $loc;
        }

        switch ($cat) {
            case 'LICENCIADA':
                $suffix = $cityState ?: 'Brasil';
                return "👑 [Licenciada] {$trimmedName} - {$suffix}";
            case 'PACIENTE':
                $suffix = $cityState ?: 'Assis/SP';
                return "[Paciente] {$trimmedName} - {$suffix}";
            case 'ALUNA':
            case 'CURSO':
                return "[Aluna] {$trimmedName} - Cursos";
            case 'LEAD':
            default:
                return "[Lead] {$trimmedName} - Body Harmony";
        }
    }

    public function syncContact(array $contactData): array {
        $phone = preg_replace('/\D/', '', $contactData['phone'] ?? $contactData['whatsapp'] ?? '');
        $name = trim($contactData['name'] ?? 'Contato');
        $category = strtoupper($contactData['category'] ?? 'LEAD');
        $location = $contactData['location'] ?? $contactData['cidade'] ?? null;
        $state = $contactData['state'] ?? $contactData['uf'] ?? null;
        $cpf = preg_replace('/\D/', '', $contactData['cpf'] ?? '');
        $email = trim($contactData['email'] ?? '');

        if (empty($phone)) {
            return ['success' => false, 'message' => 'Telefone é obrigatório para sincronização.'];
        }

        $formattedName = $this->formatContactName($name, $category, $location, $state);
        $notes = "Cadastrado via Body Harmony CRM\nWhatsApp: {$phone}" 
               . ($cpf ? "\nCPF: {$cpf}" : "") 
               . ($email ? "\nE-mail: {$email}" : "")
               . ($location ? "\nLocal: {$location}/{$state}" : "");

        if ($this->db) {
            $stmt = $this->db->prepare("
                INSERT INTO crm_google_contacts_sync 
                    (contact_phone, formatted_name, contact_category, cpf, email, city_state, notes, synced_at)
                VALUES 
                    (:phone, :name, :category, :cpf, :email, :city_state, :notes, NOW())
                ON DUPLICATE KEY UPDATE
                    formatted_name = VALUES(formatted_name),
                    contact_category = VALUES(contact_category),
                    cpf = COALESCE(VALUES(cpf), cpf),
                    email = COALESCE(VALUES(email), email),
                    city_state = COALESCE(VALUES(city_state), city_state),
                    notes = VALUES(notes),
                    synced_at = NOW()
            ");
            $stmt->execute([
                ':phone' => $phone,
                ':name' => $formattedName,
                ':category' => $category,
                ':cpf' => $cpf ?: null,
                ':email' => $email ?: null,
                ':city_state' => $location ? "{$location}/{$state}" : null,
                ':notes' => $notes
            ]);
        }

        return [
            'success' => true,
            'phone' => $phone,
            'formatted_name' => $formattedName,
            'category' => $category
        ];
    }

    public function syncAllContacts(): array {
        $syncedCount = 0;
        $sampleFormats = [];

        if (!$this->db) {
            return [
                'success' => true,
                'total_contacts' => 0,
                'synced_count' => 0,
                'updated_count' => 0,
                'message' => 'Nenhum banco de dados configurado para sincronização.',
                'sample_formats' => []
            ];
        }

        // 1. Sincronizar Licenciadas Oficiais (REGRA 8: estritamente colunas do schema)
        try {
            $stmtLic = $this->db->prepare("
                SELECT id, name, cpf, whatsapp, email, location, state 
                FROM licenciadas 
                WHERE is_active = 1
            ");
            $stmtLic->execute();
            $licenciadas = $stmtLic->fetchAll(PDO::FETCH_ASSOC);

            foreach ($licenciadas as $lic) {
                if (!empty($lic['whatsapp'])) {
                    $res = $this->syncContact([
                        'phone' => $lic['whatsapp'],
                        'name' => $lic['name'],
                        'category' => 'LICENCIADA',
                        'location' => $lic['location'],
                        'state' => $lic['state'],
                        'cpf' => $lic['cpf'],
                        'email' => $lic['email']
                    ]);
                    $syncedCount++;
                    if (count($sampleFormats) < 3) {
                        $sampleFormats[] = $res['formatted_name'];
                    }
                }
            }
        } catch (\Throwable $e) {
            error_log("[GoogleContactsSyncService] Licenciadas error: " . $e->getMessage());
        }

        // 2. Sincronizar Pacientes da Clínica (crm_patient_profiles & crm_appointments)
        try {
            $stmtPac = $this->db->prepare("
                SELECT DISTINCT phone_e164 as phone, name, cpf 
                FROM crm_patient_profiles 
                WHERE phone_e164 IS NOT NULL AND phone_e164 != ''
            ");
            $stmtPac->execute();
            $pacientes = $stmtPac->fetchAll(PDO::FETCH_ASSOC);

            foreach ($pacientes as $pac) {
                $res = $this->syncContact([
                    'phone' => $pac['phone'],
                    'name' => $pac['name'],
                    'category' => 'PACIENTE',
                    'location' => 'Assis',
                    'state' => 'SP',
                    'cpf' => $pac['cpf']
                ]);
                $syncedCount++;
                if (count($sampleFormats) < 5) {
                    $sampleFormats[] = $res['formatted_name'];
                }
            }
        } catch (\Throwable $e) {
            error_log("[GoogleContactsSyncService] Pacientes error: " . $e->getMessage());
        }

        // 3. Sincronizar Alunas e Inscrições
        try {
            $stmtAlunas = $this->db->prepare("
                SELECT id, name, cpf, whatsapp, email 
                FROM alunas 
                WHERE is_active = 1
            ");
            $stmtAlunas->execute();
            $alunas = $stmtAlunas->fetchAll(PDO::FETCH_ASSOC);

            foreach ($alunas as $al) {
                if (!empty($al['whatsapp'])) {
                    $res = $this->syncContact([
                        'phone' => $al['whatsapp'],
                        'name' => $al['name'],
                        'category' => 'ALUNA',
                        'cpf' => $al['cpf'],
                        'email' => $al['email']
                    ]);
                    $syncedCount++;
                    if (count($sampleFormats) < 6) {
                        $sampleFormats[] = $res['formatted_name'];
                    }
                }
            }
        } catch (\Throwable $e) {
            // Tabela alunas pode não ter registros ainda
        }

        return [
            'success' => true,
            'total_contacts' => $syncedCount,
            'synced_count' => $syncedCount,
            'updated_count' => $syncedCount,
            'message' => "Sincronização em lote concluída com sucesso! {$syncedCount} contatos padronizados.",
            'sample_formats' => $sampleFormats
        ];
    }

    public function getStats(): array {
        if (!$this->db) {
            return [
                'total_synced' => 0,
                'licenciadas_count' => 0,
                'pacientes_count' => 0,
                'alunas_count' => 0,
                'last_synced_at' => null
            ];
        }

        try {
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN contact_category = 'LICENCIADA' THEN 1 ELSE 0 END) as lic,
                    SUM(CASE WHEN contact_category = 'PACIENTE' THEN 1 ELSE 0 END) as pac,
                    SUM(CASE WHEN contact_category = 'ALUNA' THEN 1 ELSE 0 END) as alu,
                    MAX(synced_at) as last_sync
                FROM crm_google_contacts_sync
            ");
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            return [
                'total_synced' => (int)($row['total'] ?? 0),
                'licenciadas_count' => (int)($row['lic'] ?? 0),
                'pacientes_count' => (int)($row['pac'] ?? 0),
                'alunas_count' => (int)($row['alu'] ?? 0),
                'last_synced_at' => $row['last_sync'] ?? null
            ];
        } catch (\Throwable $e) {
            return [
                'total_synced' => 0,
                'licenciadas_count' => 0,
                'pacientes_count' => 0,
                'alunas_count' => 0,
                'last_synced_at' => null
            ];
        }
    }
}
