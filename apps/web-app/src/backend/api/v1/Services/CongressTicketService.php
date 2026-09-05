<?php

namespace BodyHarmony\Services;

use PDO;
use Exception;
use Throwable;
use BodyHarmony\Services\Payment\AsaasGatewayService;
use BodyHarmony\Services\Payment\PaymentGatewayInterface;

require_once __DIR__ . '/Payment/PaymentGatewayInterface.php';
require_once __DIR__ . '/Payment/AsaasGatewayService.php';

/**
 * CongressTicketService — Gestão de Ingressos, Cupons, Credenciamento e Check-in
 * 1º Congresso Brasileiro de Musculação Elétrica (Nexus Protocol V3.1)
 */
class CongressTicketService {
    private $db;
    private PaymentGatewayInterface $gateway;

    public function __construct($db, ?PaymentGatewayInterface $gateway = null) {
        $this->db = $db;
        $this->gateway = $gateway ?? new AsaasGatewayService();
        $this->ensureCongressTablesExist();
    }

    /**
     * Auto-ensure runtime tables (ADR-008).
     */
    private function ensureCongressTablesExist(): void {
        static $checked = false;
        if ($checked) return;
        if (!is_object($this->db)) return;

        try {
            // 1. Tabela de Lotes e Ingressos
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `congress_tiers` (
                  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `slug` VARCHAR(60) NOT NULL UNIQUE,
                  `name` VARCHAR(150) NOT NULL,
                  `subtitle` VARCHAR(255) DEFAULT NULL,
                  `price_cents` INT UNSIGNED NOT NULL DEFAULT 0,
                  `original_price_cents` INT UNSIGNED DEFAULT NULL,
                  `max_slots` INT UNSIGNED DEFAULT NULL,
                  `features_json` JSON DEFAULT NULL,
                  `sort_order` INT NOT NULL DEFAULT 0,
                  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_cong_tier_slug (`slug`),
                  INDEX idx_cong_tier_active (`is_active`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 2. Tabela de Cupons
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `congress_coupons` (
                  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `code` VARCHAR(50) NOT NULL UNIQUE,
                  `type` ENUM('LICENCIADA_NOMINAL', 'ATLETA_CONVIDADA', 'PARCEIRO', 'DESCONTO_FIXO') NOT NULL DEFAULT 'LICENCIADA_NOMINAL',
                  `discount_percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                  `discount_cents` INT UNSIGNED NOT NULL DEFAULT 0,
                  `max_uses` INT UNSIGNED DEFAULT NULL,
                  `current_uses` INT UNSIGNED NOT NULL DEFAULT 0,
                  `requires_accreditation` TINYINT(1) NOT NULL DEFAULT 0,
                  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_cong_coupon_code (`code`),
                  INDEX idx_cong_coupon_active (`is_active`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 3. Tabela de Inscrições e Credenciamento
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `congress_registrations` (
                  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `ticket_token` VARCHAR(64) NOT NULL UNIQUE,
                  `tier_id` INT UNSIGNED NOT NULL,
                  `customer_name` VARCHAR(255) NOT NULL,
                  `customer_email` VARCHAR(255) NOT NULL,
                  `customer_cpf` VARCHAR(20) NOT NULL,
                  `customer_phone` VARCHAR(50) NOT NULL,
                  `category` VARCHAR(100) NOT NULL DEFAULT 'Geral',
                  `athlete_category` VARCHAR(100) DEFAULT NULL,
                  `instagram_handle` VARCHAR(100) DEFAULT NULL,
                  `accreditation_notes` TEXT DEFAULT NULL,
                  `coupon_code` VARCHAR(50) DEFAULT NULL,
                  `discount_cents` INT UNSIGNED NOT NULL DEFAULT 0,
                  `amount_cents` INT UNSIGNED NOT NULL DEFAULT 0,
                  `payment_method` ENUM('pix', 'card', 'free', 'manual') NOT NULL DEFAULT 'pix',
                  `payment_status` ENUM('PENDING', 'CONFIRMED', 'FREE_APPROVED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
                  `asaas_payment_id` VARCHAR(100) DEFAULT NULL,
                  `pix_qr_code` TEXT DEFAULT NULL,
                  `pix_copy_paste` TEXT DEFAULT NULL,
                  `pix_expiration` DATETIME DEFAULT NULL,
                  `installments` INT UNSIGNED NOT NULL DEFAULT 1,
                  `installment_value_cents` INT UNSIGNED NOT NULL DEFAULT 0,
                  `checked_in` TINYINT(1) NOT NULL DEFAULT 0,
                  `checked_in_at` DATETIME DEFAULT NULL,
                  `checked_in_by_admin_id` INT UNSIGNED DEFAULT NULL,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_cong_reg_token (`ticket_token`),
                  INDEX idx_cong_reg_status (`payment_status`),
                  INDEX idx_cong_reg_cpf (`customer_cpf`),
                  INDEX idx_cong_reg_asaas (`asaas_payment_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // Seed inicial de lotes se tabela estiver vazia
            $stmtCount = $this->db->query("SELECT COUNT(*) FROM `congress_tiers`");
            if ($stmtCount && (int)$stmtCount->fetchColumn() === 0) {
                $featuresExp = json_encode([
                    "Melhor opção Custo-Benefício",
                    "Acesso completo ao Congresso & Palestras",
                    "Certificado de Participação Oficial",
                    "Acesso ao Material Exclusivo e Slides"
                ], JSON_UNESCAPED_UNICODE);

                $featuresVip = json_encode([
                    "Experiência VIP Exclusive",
                    "Acesso completo ao Congresso & Palestras",
                    "Mesa de Negócios & Coquetel VIP Privativo com Josi e Kaprice",
                    "Crédito integral de R$ 1.497 no Licenciamento",
                    "Kit Especial do Congressista",
                    "Certificado de Participação Oficial"
                ], JSON_UNESCAPED_UNICODE);

                $stmtInsert = $this->db->prepare("
                    INSERT INTO `congress_tiers` 
                    (`slug`, `name`, `subtitle`, `price_cents`, `original_price_cents`, `max_slots`, `features_json`, `sort_order`, `is_active`)
                    VALUES 
                    ('experience', 'Ingresso Experience', 'Melhor opção Custo-Benefício', 69700, 99700, NULL, ?, 1, 1),
                    ('vip', 'Passaporte VIP Exclusive', 'Apenas 40 vagas · Crédito Integral R$ 1.497', 149700, 199700, 40, ?, 2, 1)
                ");
                $stmtInsert->execute([$featuresExp, $featuresVip]);
            }

            // Seed inicial de cupons base se tabela estiver vazia
            $stmtCountCoupons = $this->db->query("SELECT COUNT(*) FROM `congress_coupons`");
            if ($stmtCountCoupons && (int)$stmtCountCoupons->fetchColumn() === 0) {
                $this->db->exec("
                    INSERT INTO `congress_coupons` 
                    (`code`, `type`, `discount_percentage`, `discount_cents`, `max_uses`, `requires_accreditation`, `is_active`)
                    VALUES 
                    ('ATLETA100', 'ATLETA_CONVIDADA', 100.00, 0, 10, 1, 1),
                    ('CONVIDADA100', 'ATLETA_CONVIDADA', 100.00, 0, 10, 1, 1),
                    ('LICENCIADA20', 'LICENCIADA_NOMINAL', 20.00, 0, NULL, 0, 1),
                    ('VIPBODY20', 'LICENCIADA_NOMINAL', 20.00, 0, NULL, 0, 1)
                ");
            }

            // Garante colunas de blindagem avançada em congress_coupons
            $extraCols = [
                "ALTER TABLE `congress_coupons` ADD COLUMN `restricted_cpf` VARCHAR(20) NULL AFTER `requires_accreditation`",
                "ALTER TABLE `congress_coupons` ADD COLUMN `restricted_email` VARCHAR(255) NULL AFTER `restricted_cpf`",
                "ALTER TABLE `congress_coupons` ADD COLUMN `expires_at` DATETIME NULL AFTER `restricted_email`",
                "ALTER TABLE `congress_coupons` ADD COLUMN `description` VARCHAR(255) NULL AFTER `expires_at`",
                "ALTER TABLE `congress_coupons` ADD COLUMN `allowed_tier_id` INT UNSIGNED NULL AFTER `description`",
                "ALTER TABLE `congress_coupons` ADD COLUMN `one_per_cpf` TINYINT(1) NOT NULL DEFAULT 1 AFTER `max_uses`"
            ];
            foreach ($extraCols as $sql) {
                try {
                    $this->db->exec($sql);
                } catch (\Throwable $ignored) {}
            }

            // Garante o cupom oficial LICENCIADA20 (20% OFF, 1 uso por CPF)
            try {
                $stmtLic = $this->db->prepare("SELECT id FROM `congress_coupons` WHERE `code` = 'LICENCIADA20' LIMIT 1");
                $stmtLic->execute();
                if (!$stmtLic->fetchColumn()) {
                    $this->db->exec("
                        INSERT INTO `congress_coupons` 
                        (`code`, `type`, `discount_percentage`, `discount_cents`, `max_uses`, `one_per_cpf`, `requires_accreditation`, `is_active`, `description`)
                        VALUES 
                        ('LICENCIADA20', 'LICENCIADA_NOMINAL', 20.00, 0, NULL, 1, 0, 1, '20% OFF Exclusivo Licenciadas Body Harmony (1 uso por CPF)')
                    ");
                }
            } catch (\Throwable $ignored) {}

            $checked = true;
        } catch (Throwable $e) {
            error_log('[CongressTicketService] ensureTables error: ' . $e->getMessage());
        }
    }

    /**
     * Retorna a lista de lotes e ingressos oficiais
     */
    public function getTiers(): array {
        try {
            $stmt = $this->db->query("
                SELECT 
                    t.id, t.slug, t.name, t.subtitle, t.price_cents, t.original_price_cents,
                    t.max_slots, t.features_json, t.is_active,
                    (
                        SELECT COUNT(*) 
                        FROM `congress_registrations` r 
                        WHERE r.tier_id = t.id AND r.payment_status IN ('CONFIRMED', 'FREE_APPROVED')
                    ) AS sold_slots
                FROM `congress_tiers` t
                WHERE t.is_active = 1
                ORDER BY t.sort_order ASC, t.id ASC
            ");
            
            $tiers = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $maxSlots = $row['max_slots'] ? (int)$row['max_slots'] : null;
                $soldSlots = (int)($row['sold_slots'] ?? 0);
                $remainingSlots = $maxSlots !== null ? max(0, $maxSlots - $soldSlots) : null;
                $features = json_decode($row['features_json'] ?? '[]', true) ?: [];

                $tiers[] = [
                    'id' => (int)$row['id'],
                    'slug' => $row['slug'],
                    'name' => $row['name'],
                    'subtitle' => $row['subtitle'],
                    'price_cents' => (int)$row['price_cents'],
                    'price_formatted' => 'R$ ' . number_format($row['price_cents'] / 100, 2, ',', '.'),
                    'original_price_cents' => $row['original_price_cents'] ? (int)$row['original_price_cents'] : null,
                    'original_price_formatted' => $row['original_price_cents'] ? 'R$ ' . number_format($row['original_price_cents'] / 100, 2, ',', '.') : null,
                    'max_slots' => $maxSlots,
                    'sold_slots' => $soldSlots,
                    'remaining_slots' => $remainingSlots,
                    'features' => $features,
                    'is_active' => (bool)$row['is_active']
                ];
            }

            return $tiers;
        } catch (Throwable $e) {
            error_log('[CongressTicketService] getTiers error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Localiza um lote por ID
     */
    public function getTierById(int $tierId): ?array {
        try {
            $stmt = $this->db->prepare("SELECT * FROM `congress_tiers` WHERE `id` = ? AND `is_active` = 1 LIMIT 1");
            $stmt->execute([$tierId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) return null;

            $row['id'] = (int)$row['id'];
            $row['price_cents'] = (int)$row['price_cents'];
            $row['features'] = json_decode($row['features_json'] ?? '[]', true) ?: [];
            return $row;
        } catch (Throwable $e) {
            return null;
        }
    }

    /**
     * Atualiza um lote de ingresso do Congresso e sincroniza com a loja
     */
    public function updateTier(int $tierId, array $data): array {
        try {
            $current = $this->getTierById($tierId);
            if (!$current) {
                return ['ok' => false, 'message' => 'Lote de ingresso não encontrado.'];
            }

            $name = isset($data['name']) ? trim($data['name']) : $current['name'];
            $subtitle = isset($data['subtitle']) ? trim($data['subtitle']) : $current['subtitle'];
            $priceCents = isset($data['price_cents']) ? (int)$data['price_cents'] : (int)$current['price_cents'];
            $originalPriceCents = isset($data['original_price_cents']) ? (int)$data['original_price_cents'] : $current['original_price_cents'];
            $maxSlots = array_key_exists('max_slots', $data) ? ($data['max_slots'] !== null ? (int)$data['max_slots'] : null) : $current['max_slots'];
            $isActive = isset($data['is_active']) ? ((bool)$data['is_active'] ? 1 : 0) : (int)$current['is_active'];

            $stmt = $this->db->prepare("
                UPDATE `congress_tiers` 
                SET `name` = ?, `subtitle` = ?, `price_cents` = ?, `original_price_cents` = ?, `max_slots` = ?, `is_active` = ?, `updated_at` = NOW()
                WHERE `id` = ?
            ");
            $stmt->execute([$name, $subtitle, $priceCents, $originalPriceCents, $maxSlots, $isActive, $tierId]);

            // Sincronizar com shop_products
            try {
                $slug = $current['slug'];
                $shopSlug = $slug === 'vip' ? 'ingresso-vip' : ($slug === 'experience' ? 'ingresso-experience' : $slug);
                $syncStmt = $this->db->prepare("
                    UPDATE `shop_products` 
                    SET `price_cents` = ?, `updated_at` = NOW()
                    WHERE `slug` = ? OR `slug` = ?
                ");
                $syncStmt->execute([$priceCents, $slug, $shopSlug]);
            } catch (\Throwable $syncErr) {
                error_log('[CongressTicketService] Sincronizacao shop_products ignorada: ' . $syncErr->getMessage());
            }

            return [
                'ok' => true,
                'message' => 'Lote do Congresso atualizado com sucesso.',
                'data' => $this->getTierById($tierId)
            ];
        } catch (Throwable $e) {
            error_log('[CongressTicketService] updateTier error: ' . $e->getMessage());
            return ['ok' => false, 'message' => 'Erro ao atualizar lote: ' . $e->getMessage()];
        }
    }

    /**
     * Valida um cupom dinamicamente com travas avançadas de segurança
     */
    public function validateCoupon(string $rawCode, int $tierId, string $customerCpf = '', string $customerEmail = ''): array {
        $code = strtoupper(trim($rawCode));
        if (empty($code)) {
            return [
                'ok' => false,
                'message' => 'Código de cupom inválido ou vazio.'
            ];
        }

        $tier = $this->getTierById($tierId);
        if (!$tier) {
            return [
                'ok' => false,
                'message' => 'Lote/Ingresso selecionado não encontrado.'
            ];
        }

        $basePriceCents = $tier['price_cents'];
        $cleanCpf = preg_replace('/\D/', '', $customerCpf);

        // 1. Busca na tabela congress_coupons
        try {
            $stmt = $this->db->prepare("SELECT * FROM `congress_coupons` WHERE `code` = ? LIMIT 1");
            $stmt->execute([$code]);
            $coupon = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {
            $coupon = null;
        }

        if ($coupon) {
            // Checar se está ativo
            if (empty($coupon['is_active'])) {
                return ['ok' => false, 'message' => 'Este cupom foi desativado.'];
            }

            // Checar expiração por data
            if (!empty($coupon['expires_at'])) {
                $expiresTime = strtotime($coupon['expires_at']);
                if ($expiresTime && $expiresTime < time()) {
                    return ['ok' => false, 'message' => 'Este cupom está expirado.'];
                }
            }

            // Checar limite de usos globais
            $maxUses = isset($coupon['max_uses']) && $coupon['max_uses'] !== null ? (int)$coupon['max_uses'] : null;
            $currentUses = (int)($coupon['current_uses'] ?? 0);
            if ($maxUses !== null && $currentUses >= $maxUses) {
                return ['ok' => false, 'message' => 'Este cupom atingiu o limite máximo de utilizações.'];
            }

            // Checar restrição por lote
            if (!empty($coupon['allowed_tier_id']) && (int)$coupon['allowed_tier_id'] !== $tierId) {
                return ['ok' => false, 'message' => 'Este cupom não é válido para o lote/ingresso selecionado.'];
            }

            // Checar restrição nominal por CPF
            if (!empty($coupon['restricted_cpf'])) {
                $restrictedCleanCpf = preg_replace('/\D/', '', $coupon['restricted_cpf']);
                if (!empty($cleanCpf) && $cleanCpf !== $restrictedCleanCpf) {
                    return ['ok' => false, 'message' => 'Este cupom é exclusivo e nominal para outro participante.'];
                }
            }

            // Checar reuso pelo mesmo CPF (Trava de 1 uso por CPF)
            // Apenas bloqueia se houver um pagamento REALMENTE aprovado/confirmado. Tentativas PENDING (recusadas no cartão ou abandonadas) não bloqueiam o cliente.
            $isOnePerCpf = isset($coupon['one_per_cpf']) ? (bool)$coupon['one_per_cpf'] : true;
            if ($isOnePerCpf && !empty($cleanCpf)) {
                try {
                    $stmtCpfCheck = $this->db->prepare("
                        SELECT COUNT(*) FROM `congress_registrations` 
                        WHERE (`customer_cpf` = ? OR `customer_cpf` = ?) 
                          AND `coupon_code` = ? 
                          AND `payment_status` IN ('CONFIRMED', 'FREE_APPROVED', 'PAID', 'RECEIVED')
                    ");
                    $stmtCpfCheck->execute([$cleanCpf, $customerCpf, $code]);
                    if ((int)$stmtCpfCheck->fetchColumn() > 0) {
                        return ['ok' => false, 'message' => 'Este cupom já foi utilizado pelo seu CPF em uma inscrição confirmada (Limite: 1 uso por CPF).'];
                    }
                } catch (Throwable $e) {}
            }

            $discPct = (float)($coupon['discount_percentage'] ?? ($coupon['discount_percent'] ?? 0));
            $requiresAccreditation = (bool)($coupon['requires_accreditation'] ?? false);
            $couponType = $coupon['type'] ?? ($coupon['coupon_type'] ?? 'STANDARD');
            
            if ($discPct >= 100.0) {
                $discountCents = $basePriceCents;
                $finalAmountCents = 0;
            } else {
                $discountCents = (int)round($basePriceCents * ($discPct / 100.0));
                $finalAmountCents = max(0, $basePriceCents - $discountCents);
            }

            return [
                'ok' => true,
                'data' => [
                    'coupon_code' => $coupon['code'],
                    'coupon_type' => $couponType,
                    'discount_percentage' => $discPct,
                    'discount_percent' => $discPct,
                    'discount_cents' => $discountCents,
                    'original_amount_cents' => $basePriceCents,
                    'final_amount_cents' => $finalAmountCents,
                    'requires_accreditation' => $requiresAccreditation,
                    'description' => $coupon['description'] ?? '',
                    'one_per_cpf' => $isOnePerCpf,
                    'message' => $discPct >= 100 ? 'Cupom de 100% aplicado com sucesso!' : "Desconto de {$discPct}% aplicado com sucesso!"
                ]
            ];
        }

        // 2. Busca dinâmica por cupom nominal de licenciada (ex: JOSI20, KAPRICE20)
        if (str_ends_with($code, '20') && strlen($code) >= 4) {
            $licPrefix = substr($code, 0, -2);
            try {
                $stmtLic = $this->db->prepare("SELECT id, name FROM `licenciadas` WHERE is_active = 1 AND UPPER(name) LIKE ? LIMIT 1");
                $stmtLic->execute([$licPrefix . '%']);
                $lic = $stmtLic->fetch(PDO::FETCH_ASSOC);
                if ($lic) {
                    $discPct = 20.0;
                    $discountCents = (int)round($basePriceCents * 0.20);
                    $finalAmountCents = max(0, $basePriceCents - $discountCents);
                    return [
                        'ok' => true,
                        'data' => [
                            'coupon_code' => $code,
                            'coupon_type' => 'LICENCIADA_NOMINAL',
                            'discount_percentage' => $discPct,
                            'discount_percent' => $discPct,
                            'discount_cents' => $discountCents,
                            'original_amount_cents' => $basePriceCents,
                            'final_amount_cents' => $finalAmountCents,
                            'requires_accreditation' => false,
                            'description' => "20% OFF — Cupom da Licenciada {$lic['name']}",
                            'one_per_cpf' => true,
                            'message' => "Desconto de 20% aplicado com sucesso (Licenciada {$lic['name']})!"
                        ]
                    ];
                }
            } catch (Throwable $e) {
                // error_log('[CongressTicketService] Licenciada coupon err: ' . $e->getMessage());
            }
        }

        return [
            'ok' => false,
            'message' => 'Cupom promocional inválido, expirado ou não encontrado.'
        ];
    }

    /**
     * Lista todos os cupons do congresso para o painel administrativo
     */
    public function listAdminCoupons(): array {
        try {
            $stmt = $this->db->query("
                SELECT 
                    c.*,
                    (
                        SELECT COUNT(*) 
                        FROM `congress_registrations` r 
                        WHERE r.coupon_code = c.code AND r.payment_status IN ('CONFIRMED', 'FREE_APPROVED')
                    ) AS confirmed_usages
                FROM `congress_coupons` c 
                ORDER BY c.id DESC
            ");
            $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            foreach ($coupons as &$coup) {
                $coup['id'] = (int)$coup['id'];
                $coup['discount_percentage'] = (float)$coup['discount_percentage'];
                $coup['max_uses'] = $coup['max_uses'] !== null ? (int)$coup['max_uses'] : null;
                $coup['current_uses'] = (int)$coup['current_uses'];
                $coup['is_active'] = (int)$coup['is_active'];
                $coup['requires_accreditation'] = (int)$coup['requires_accreditation'];
                $coup['one_per_cpf'] = isset($coup['one_per_cpf']) ? (int)$coup['one_per_cpf'] : 1;
            }
            return ['ok' => true, 'data' => $coupons];
        } catch (Throwable $e) {
            error_log('[CongressTicketService] listAdminCoupons error: ' . $e->getMessage());
            return ['ok' => false, 'error' => $e->getMessage(), 'data' => []];
        }
    }

    /**
     * Cria ou atualiza um cupom de forma administrativa
     */
    public function saveAdminCoupon(array $data): array {
        try {
            $code = strtoupper(preg_replace('/[^A-Z0-9_-]/', '', $data['code'] ?? ''));
            if (empty($code)) {
                return ['ok' => false, 'message' => 'Código do cupom é obrigatório.'];
            }

            $id = !empty($data['id']) ? (int)$data['id'] : 0;
            $type = $data['type'] ?? 'DESCONTO_FIXO';
            $discPct = isset($data['discount_percentage']) ? (float)$data['discount_percentage'] : 0.00;
            $discCents = isset($data['discount_cents']) ? (int)$data['discount_cents'] : 0;
            $maxUses = array_key_exists('max_uses', $data) && $data['max_uses'] !== '' && $data['max_uses'] !== null ? (int)$data['max_uses'] : null;
            $onePerCpf = isset($data['one_per_cpf']) ? ((bool)$data['one_per_cpf'] ? 1 : 0) : 1;
            $requiresAccreditation = !empty($data['requires_accreditation']) ? 1 : ($discPct >= 100.0 ? 1 : 0);
            $isActive = isset($data['is_active']) ? ((bool)$data['is_active'] ? 1 : 0) : 1;
            $restrictedCpf = !empty($data['restricted_cpf']) ? trim($data['restricted_cpf']) : null;
            $restrictedEmail = !empty($data['restricted_email']) ? trim($data['restricted_email']) : null;
            
            $expiresAt = !empty($data['expires_at']) && trim($data['expires_at']) !== '' ? trim($data['expires_at']) : null;
            if ($expiresAt) {
                $ts = strtotime($expiresAt);
                $expiresAt = $ts ? date('Y-m-d H:i:s', $ts) : null;
            }

            $description = !empty($data['description']) ? trim($data['description']) : null;
            $allowedTierId = !empty($data['allowed_tier_id']) ? (int)$data['allowed_tier_id'] : null;

            if ($id > 0) {
                $stmt = $this->db->prepare("
                    UPDATE `congress_coupons` 
                    SET `code` = ?, `type` = ?, `discount_percentage` = ?, `discount_cents` = ?, 
                        `max_uses` = ?, `one_per_cpf` = ?, `requires_accreditation` = ?, `is_active` = ?, 
                        `restricted_cpf` = ?, `restricted_email` = ?, `expires_at` = ?, 
                        `description` = ?, `allowed_tier_id` = ?, `updated_at` = NOW()
                    WHERE `id` = ?
                ");
                $stmt->execute([
                    $code, $type, $discPct, $discCents, $maxUses, $onePerCpf, $requiresAccreditation, $isActive,
                    $restrictedCpf, $restrictedEmail, $expiresAt, $description, $allowedTierId, $id
                ]);
            } else {
                $stmt = $this->db->prepare("
                    INSERT INTO `congress_coupons` 
                    (`code`, `type`, `discount_percentage`, `discount_cents`, `max_uses`, `one_per_cpf`, `current_uses`, 
                     `requires_accreditation`, `is_active`, `restricted_cpf`, `restricted_email`, `expires_at`, `description`, `allowed_tier_id`)
                    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $code, $type, $discPct, $discCents, $maxUses, $onePerCpf, $requiresAccreditation, $isActive,
                    $restrictedCpf, $restrictedEmail, $expiresAt, $description, $allowedTierId
                ]);
                $id = (int)$this->db->lastInsertId();
            }

            return ['ok' => true, 'message' => 'Cupom salvo com sucesso!', 'id' => $id];
        } catch (Throwable $e) {
            error_log('[CongressTicketService] saveAdminCoupon error: ' . $e->getMessage());
            return ['ok' => false, 'message' => 'Erro ao salvar cupom: ' . $e->getMessage()];
        }
    }

    /**
     * Exclui ou desativa um cupom
     */
    public function deleteAdminCoupon(int $couponId): array {
        try {
            $stmt = $this->db->prepare("DELETE FROM `congress_coupons` WHERE `id` = ?");
            $stmt->execute([$couponId]);
            return ['ok' => true, 'message' => 'Cupom removido com sucesso.'];
        } catch (Throwable $e) {
            error_log('[CongressTicketService] deleteAdminCoupon error: ' . $e->getMessage());
            return ['ok' => false, 'message' => 'Erro ao excluir cupom: ' . $e->getMessage()];
        }
    }

    /**
     * Retorna a lista de pessoas que utilizaram um cupom específico
     */
    public function getCouponUsages(int $couponId): array {
        try {
            $stmtC = $this->db->prepare("SELECT * FROM `congress_coupons` WHERE `id` = ? LIMIT 1");
            $stmtC->execute([$couponId]);
            $coupon = $stmtC->fetch(PDO::FETCH_ASSOC);
            if (!$coupon) {
                return ['ok' => false, 'message' => 'Cupom não encontrado.', 'data' => []];
            }

            $stmt = $this->db->prepare("
                SELECT 
                    r.id, r.ticket_token, r.customer_name, r.customer_email, r.customer_cpf, 
                    r.customer_phone, r.category, r.athlete_category, r.instagram_handle,
                    r.amount_cents, r.discount_cents, r.payment_method, r.payment_status,
                    r.created_at, t.name as tier_name
                FROM `congress_registrations` r
                LEFT JOIN `congress_tiers` t ON t.id = r.tier_id
                WHERE r.coupon_code = ?
                ORDER BY r.created_at DESC
            ");
            $stmt->execute([$coupon['code']]);
            $usages = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

            return [
                'ok' => true,
                'coupon' => $coupon,
                'total_usages' => count($usages),
                'data' => $usages
            ];
        } catch (Throwable $e) {
            error_log('[CongressTicketService] getCouponUsages error: ' . $e->getMessage());
            return ['ok' => false, 'message' => 'Erro ao buscar usos do cupom: ' . $e->getMessage(), 'data' => []];
        }
    }

    /**
     * Processa a compra ou credenciamento gratuito do congresso
     */
    public function checkout(array $data): array {
        $tierId = (int)($data['tier_id'] ?? 0);
        $tier = $this->getTierById($tierId);
        if (!$tier) {
            throw new Exception("Lote ou ingresso não encontrado.");
        }

        // Trava estrita de vagas esgotadas por lote (ex: Lote VIP com max_slots = 40)
        if (!empty($tier['max_slots'])) {
            $stmtCount = $this->db->prepare("
                SELECT COUNT(*) FROM `congress_registrations` 
                WHERE `tier_id` = ? AND `payment_status` IN ('CONFIRMED', 'FREE_APPROVED')
            ");
            $stmtCount->execute([$tierId]);
            $soldSlots = (int)$stmtCount->fetchColumn();
            if ($soldSlots >= (int)$tier['max_slots']) {
                throw new Exception("As vagas para o lote '{$tier['name']}' estão oficialmente esgotadas.");
            }
        }

        // Validação cadastral básica (suporte a customer array ou propriedades diretas)
        $cust = is_array($data['customer'] ?? null) ? $data['customer'] : [];
        $name = trim($cust['name'] ?? ($data['customer_name'] ?? ''));
        $email = trim($cust['email'] ?? ($data['customer_email'] ?? ''));
        $cpf = preg_replace('/\D/', '', $cust['cpf'] ?? ($data['customer_cpf'] ?? ''));
        $phone = preg_replace('/\D/', '', $cust['phone'] ?? ($cust['whatsapp'] ?? ($data['customer_phone'] ?? '')));

        if (empty($name) || empty($email) || empty($cpf) || empty($phone)) {
            throw new Exception("Nome completo, e-mail, CPF e WhatsApp são campos obrigatórios.");
        }

        $couponCode = !empty($data['coupon_code']) ? strtoupper(trim($data['coupon_code'])) : null;
        $discountCents = 0;
        $finalAmountCents = $tier['price_cents'];
        $requiresAccreditation = false;

        // Se houver cupom, valida no backend de forma mandatória com checagem de CPF
        if ($couponCode) {
            $couponVal = $this->validateCoupon($couponCode, $tierId, $cpf, $email);
            if (!$couponVal['ok']) {
                throw new Exception($couponVal['message'] ?? 'Cupom inválido.');
            }
            $discountCents = (int)$couponVal['data']['discount_cents'];
            $finalAmountCents = (int)$couponVal['data']['final_amount_cents'];
            $requiresAccreditation = (bool)$couponVal['data']['requires_accreditation'];

            // Incrementa contador de uso do cupom de forma atômica
            try {
                $stmtInc = $this->db->prepare("UPDATE `congress_coupons` SET `current_uses` = `current_uses` + 1 WHERE `code` = ?");
                $stmtInc->execute([$couponCode]);
            } catch (\Throwable $e) {}
        }

        $paymentMethod = strtolower(trim($data['payment_method'] ?? 'pix'));
        if ($paymentMethod === 'credit_card' || $paymentMethod === 'creditcard') {
            $paymentMethod = 'card';
        }
        
        $ticketToken = 'TKT-CONG-' . strtoupper(bin2hex(random_bytes(8)));
        $qrPayload = "BH-CONG-2026|{$ticketToken}|{$cpf}";
        $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($qrPayload);

        // Caso 1: ISENÇÃO TOTAL (100% OFF) / CREDENCIAMENTO GRATUITO
        if ($paymentMethod === 'free' || $finalAmountCents === 0) {
            $accreditation = $data['accreditation_data'] ?? [];
            $athleteCategory = trim($accreditation['athlete_category'] ?? ($data['category'] ?? ''));

            if (empty($athleteCategory)) {
                $athleteCategory = 'Atleta / Convidada VIP';
            }

            $stmt = $this->db->prepare("
                INSERT INTO `congress_registrations`
                (
                    `ticket_token`, `tier_id`, `customer_name`, `customer_email`, `customer_cpf`, `customer_phone`,
                    `category`, `athlete_category`, `instagram_handle`, `accreditation_notes`, `coupon_code`,
                    `discount_cents`, `amount_cents`, `payment_method`, `payment_status`
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'free', 'FREE_APPROVED')
            ");

            $categoryDesc = 'Atleta / Convidada: ' . $athleteCategory;
            $instagram = $accreditation['instagram_handle'] ?? null;
            $notes = $accreditation['notes'] ?? null;

            $stmt->execute([
                $ticketToken, $tierId, $name, $email, $cpf, $phone,
                $categoryDesc, $athleteCategory, $instagram, $notes, $couponCode,
                $discountCents, 0
            ]);

            $regId = (int)$this->db->lastInsertId();

            return [
                'ok' => true,
                'data' => [
                    'ticket_token' => $ticketToken,
                    'registration_id' => $regId,
                    'tier_name' => $tier['name'],
                    'customer_name' => $name,
                    'amount_cents' => 0,
                    'payment_method' => 'free',
                    'payment_status' => 'FREE_APPROVED',
                    'asaas_payment_id' => null,
                    'pix_qr_code' => null,
                    'pix_copy_paste' => null,
                    'pix_expiration' => null,
                    'qr_code_url' => $qrCodeUrl,
                    'is_mock' => false,
                    'message' => 'Credenciamento gratuito confirmado com sucesso!'
                ]
            ];
        }

        // Caso 2: PAGAMENTO VIA PIX
        if ($paymentMethod === 'pix') {
            $pixRes = $this->gateway->createPixCharge([
                'amount_cents' => $finalAmountCents,
                'customer_name' => $name,
                'customer_email' => $email,
                'customer_cpf' => $cpf,
                'customer_phone' => $phone,
                'description' => "Congresso Body Harmony — {$tier['name']}",
                'external_reference' => $ticketToken
            ]);

            if (!$pixRes['ok']) {
                throw new Exception($pixRes['error'] ?? 'Erro ao gerar PIX com o gateway.');
            }

            $stmt = $this->db->prepare("
                INSERT INTO `congress_registrations`
                (
                    `ticket_token`, `tier_id`, `customer_name`, `customer_email`, `customer_cpf`, `customer_phone`,
                    `category`, `coupon_code`, `discount_cents`, `amount_cents`, `payment_method`, `payment_status`,
                    `asaas_payment_id`, `pix_qr_code`, `pix_copy_paste`, `pix_expiration`
                )
                VALUES (?, ?, ?, ?, ?, ?, 'Geral', ?, ?, ?, 'pix', 'PENDING', ?, ?, ?, ?)
            ");

            $stmt->execute([
                $ticketToken, $tierId, $name, $email, $cpf, $phone,
                $couponCode, $discountCents, $finalAmountCents,
                $pixRes['payment_id'], $pixRes['pix_qr_code'], $pixRes['pix_copy_paste'], $pixRes['expiration']
            ]);

            $regId = (int)$this->db->lastInsertId();

            return [
                'ok' => true,
                'data' => [
                    'ticket_token' => $ticketToken,
                    'registration_id' => $regId,
                    'tier_name' => $tier['name'],
                    'customer_name' => $name,
                    'amount_cents' => $finalAmountCents,
                    'payment_method' => 'pix',
                    'payment_status' => 'PENDING',
                    'asaas_payment_id' => $pixRes['payment_id'],
                    'asaas_invoice_url' => $pixRes['invoice_url'] ?? null,
                    'bank_slip_url' => $pixRes['bank_slip_url'] ?? null,
                    'pix_qr_code' => $pixRes['pix_qr_code'],
                    'pix_copy_paste' => $pixRes['pix_copy_paste'],
                    'pix_expiration' => $pixRes['expiration'],
                    'qr_code_url' => null,
                    'is_mock' => (bool)($pixRes['is_mock'] ?? false),
                    'message' => 'Cobrança PIX gerada com sucesso. Efetue o pagamento para liberar seu ingresso.'
                ]
            ];
        }

        // Caso 3: PAGAMENTO VIA CARTÃO DE CRÉDITO (Redirecionamento Seguro Hospedado Asaas em até 12x)
        if ($paymentMethod === 'card' || $paymentMethod === 'hosted_card') {
            $installments = max(1, min(12, (int)($data['installments'] ?? 1)));

            // Gera cobrança oficial hospedada no Asaas com suporte a parcelamento 1x a 12x e 3DS
            $hostedRes = $this->gateway->createHostedInvoice([
                'amount_cents' => $finalAmountCents,
                'installments' => $installments,
                'billing_type' => 'UNDEFINED',
                'customer_name' => $name,
                'customer_email' => $email,
                'customer_cpf' => $cpf,
                'customer_phone' => $phone,
                'description' => "Congresso Body Harmony — {$tier['name']}",
                'external_reference' => $ticketToken
            ]);

            if (!$hostedRes['ok']) {
                $errorMsg = $hostedRes['error'] ?? 'Não foi possível gerar a fatura de pagamento no momento.';
                if ($couponCode) {
                    try {
                        $stmtDec = $this->db->prepare("UPDATE `congress_coupons` SET `current_uses` = GREATEST(0, `current_uses` - 1) WHERE `code` = ?");
                        $stmtDec->execute([$couponCode]);
                    } catch (\Throwable $eDec) {}
                }
                return [
                    'ok' => false,
                    'error' => $errorMsg,
                    'ticket_token' => $ticketToken
                ];
            }

            $stmt = $this->db->prepare("
                INSERT INTO `congress_registrations`
                (
                    `ticket_token`, `tier_id`, `customer_name`, `customer_email`, `customer_cpf`, `customer_phone`,
                    `category`, `coupon_code`, `discount_cents`, `amount_cents`, `payment_method`, `payment_status`,
                    `asaas_payment_id`, `installments`, `installment_value_cents`
                )
                VALUES (?, ?, ?, ?, ?, ?, 'Geral', ?, ?, ?, 'card', 'PENDING', ?, ?, ?)
            ");

            $stmt->execute([
                $ticketToken, $tierId, $name, $email, $cpf, $phone,
                $couponCode, $discountCents, $hostedRes['amount_cents'],
                $hostedRes['payment_id'], $installments, $hostedRes['installment_value_cents']
            ]);

            $regId = (int)$this->db->lastInsertId();

            return [
                'ok' => true,
                'data' => [
                    'ticket_token' => $ticketToken,
                    'registration_id' => $regId,
                    'tier_name' => $tier['name'],
                    'customer_name' => $name,
                    'amount_cents' => $hostedRes['amount_cents'],
                    'installments' => $installments,
                    'installment_value_cents' => $hostedRes['installment_value_cents'],
                    'payment_method' => 'card',
                    'payment_status' => 'PENDING',
                    'asaas_payment_id' => $hostedRes['payment_id'],
                    'invoice_url' => $hostedRes['invoice_url'] ?? null,
                    'is_mock' => (bool)($hostedRes['is_mock'] ?? false),
                    'message' => 'Fatura gerada com sucesso. Conclua o pagamento de forma segura.'
                ]
            ];
        }

        throw new Exception("Método de pagamento '{$paymentMethod}' não suportado.");
    }

    /**
     * Consulta detalhes de um ingresso/credencial pelo token com verificação de status ativa
     */
    public function getTicketByToken(string $token): ?array {
        try {
            $stmt = $this->db->prepare("
                SELECT r.*, t.name AS tier_name, t.slug AS tier_slug
                FROM `congress_registrations` r
                JOIN `congress_tiers` t ON t.id = r.tier_id
                WHERE r.ticket_token = ?
                LIMIT 1
            ");
            $stmt->execute([$token]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) return null;

            // Sincronização em tempo real caso o status ainda esteja PENDING e haja ID no Asaas
            if ($row['payment_status'] === 'PENDING' && !empty($row['asaas_payment_id'])) {
                try {
                    $statusCheck = $this->gateway->getPaymentStatus($row['asaas_payment_id']);
                    if (!empty($statusCheck['ok']) && !empty($statusCheck['status'])) {
                        $remoteStatus = strtoupper($statusCheck['status']);
                        if ($remoteStatus === 'CONFIRMED' || $remoteStatus === 'RECEIVED') {
                            $stmtUpd = $this->db->prepare("UPDATE `congress_registrations` SET `payment_status` = 'CONFIRMED' WHERE `id` = ?");
                            $stmtUpd->execute([$row['id']]);
                            $row['payment_status'] = 'CONFIRMED';
                        }
                    }
                } catch (Throwable $e) {
                    error_log('[CongressTicketService] Erro ao sincronizar status Asaas: ' . $e->getMessage());
                }
            }

            $isConfirmed = in_array($row['payment_status'], ['CONFIRMED', 'FREE_APPROVED', 'RECEIVED'], true);
            $cpf = $row['customer_cpf'];
            $maskedCpf = (strlen($cpf) === 11)
                ? substr($cpf, 0, 3) . '.***.***-' . substr($cpf, -2)
                : '***.***.***-**';

            $qrPayload = $isConfirmed ? "BH-CONG-2026|{$row['ticket_token']}|{$cpf}" : null;
            $qrCodeUrl = $isConfirmed ? ('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($qrPayload)) : null;

            return [
                'ticket_token' => $row['ticket_token'],
                'tier_name' => $row['tier_name'],
                'tier_slug' => $row['tier_slug'],
                'customer_name' => $row['customer_name'],
                'customer_email' => $row['customer_email'],
                'customer_cpf_masked' => $maskedCpf,
                'customer_phone' => $row['customer_phone'],
                'category' => $row['category'],
                'amount_cents' => (int)$row['amount_cents'],
                'payment_method' => $row['payment_method'],
                'payment_status' => $row['payment_status'],
                'is_confirmed' => $isConfirmed,
                'checked_in' => (bool)$row['checked_in'],
                'checked_in_at' => $row['checked_in_at'],
                'event_name' => '1º Congresso Brasileiro de Musculação Elétrica',
                'event_date' => '07 de Novembro de 2026',
                'event_location' => 'Espaço Full Sales — Shopping JK Iguatemi, São Paulo/SP',
                'pix_qr_code' => $row['pix_qr_code'] ?? null,
                'pix_copy_paste' => $row['pix_copy_paste'] ?? null,
                'pix_expiration' => $row['pix_expiration'] ?? null,
                'qr_payload' => $qrPayload,
                'qr_code_url' => $qrCodeUrl
            ];
        } catch (Throwable $e) {
            error_log('[CongressTicketService] getTicketByToken error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Localiza ingressos confirmados ou aprovados por CPF ou E-mail (PLAN-161)
     */
    public function lookupTickets(string $identifier): array {
        $cleanId = trim($identifier);
        if (empty($cleanId)) {
            return [
                'ok' => false,
                'data' => [],
                'message' => 'Informe o CPF ou E-mail cadastrado.'
            ];
        }

        $cpfDigits = preg_replace('/\D/', '', $cleanId);
        $isEmail = (filter_var($cleanId, FILTER_VALIDATE_EMAIL) !== false || strpos($cleanId, '@') !== false);
        $searchEmail = strtolower($cleanId);

        try {
            if ($isEmail) {
                $stmt = $this->db->prepare("
                    SELECT r.*, t.name AS tier_name, t.slug AS tier_slug
                    FROM `congress_registrations` r
                    JOIN `congress_tiers` t ON t.id = r.tier_id
                    WHERE LOWER(r.customer_email) = ?
                      AND r.payment_status IN ('CONFIRMED', 'FREE_APPROVED', 'RECEIVED')
                    ORDER BY r.id DESC
                ");
                $stmt->execute([$searchEmail]);
            } else {
                $stmt = $this->db->prepare("
                    SELECT r.*, t.name AS tier_name, t.slug AS tier_slug
                    FROM `congress_registrations` r
                    JOIN `congress_tiers` t ON t.id = r.tier_id
                    WHERE (r.customer_cpf = ? OR r.customer_cpf = ?)
                      AND r.payment_status IN ('CONFIRMED', 'FREE_APPROVED', 'RECEIVED')
                    ORDER BY r.id DESC
                ");
                $stmt->execute([$cpfDigits, $cleanId]);
            }

            $results = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $cpf = $row['customer_cpf'];
                $maskedCpf = (strlen($cpf) === 11)
                    ? substr($cpf, 0, 3) . '.***.***-' . substr($cpf, -2)
                    : '***.***.***-**';

                $qrPayload = "BH-CONG-2026|{$row['ticket_token']}|{$cpf}";
                $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($qrPayload);
                $amountFormatted = 'R$ ' . number_format(((int)$row['amount_cents']) / 100, 2, ',', '.');

                $results[] = [
                    'ticket_token' => $row['ticket_token'],
                    'tier_name' => $row['tier_name'],
                    'tier_slug' => $row['tier_slug'],
                    'customer_name' => $row['customer_name'],
                    'customer_email' => $row['customer_email'],
                    'customer_cpf_masked' => $maskedCpf,
                    'customer_phone' => $row['customer_phone'],
                    'category' => $row['category'],
                    'amount_cents' => (int)$row['amount_cents'],
                    'amount_formatted' => $amountFormatted,
                    'payment_method' => $row['payment_method'],
                    'payment_status' => $row['payment_status'],
                    'checked_in' => (bool)$row['checked_in'],
                    'checked_in_at' => $row['checked_in_at'],
                    'event_name' => '1º Congresso Brasileiro de Musculação Elétrica',
                    'event_date' => '07 de Novembro de 2026',
                    'event_location' => 'Espaço Full Sales — Shopping JK Iguatemi, São Paulo/SP',
                    'qr_payload' => $qrPayload,
                    'qr_code_url' => $qrCodeUrl
                ];
            }

            if (empty($results)) {
                return [
                    'ok' => true,
                    'data' => [],
                    'message' => 'Nenhum ingresso confirmado encontrado para os dados informados.'
                ];
            }

            return [
                'ok' => true,
                'data' => $results,
                'message' => count($results) . ' ingresso(s) localizado(s) com sucesso.'
            ];
        } catch (Throwable $e) {
            error_log('[CongressTicketService] lookupTickets error: ' . $e->getMessage());
            return [
                'ok' => false,
                'data' => [],
                'message' => 'Erro ao consultar ingressos: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Webhook handler para eventos Asaas com validação de token e idempotência (PLAN-160)
     */
    public function handleAsaasWebhook(array $eventData, ?string $receivedToken = null): array {
        // Validação de Token de Segurança se configurado no ambiente
        $expectedSecret = getenv('ASAAS_WEBHOOK_SECRET') ?: (defined('ASAAS_WEBHOOK_SECRET') ? ASAAS_WEBHOOK_SECRET : null);
        if (!empty($expectedSecret) && $receivedToken !== null) {
            if (!hash_equals($expectedSecret, $receivedToken)) {
                return [
                    'ok' => false,
                    'status' => 401,
                    'message' => 'Token de autenticação do webhook inválido.'
                ];
            }
        }

        $event = strtoupper($eventData['event'] ?? '');
        $payment = $eventData['payment'] ?? [];
        $paymentId = $payment['id'] ?? '';
        $externalRef = $payment['externalReference'] ?? '';

        if (empty($paymentId) && empty($externalRef)) {
            return ['ok' => false, 'message' => 'Identificador de pagamento não fornecido no payload.'];
        }

        // Buscar registro existente para garantir idempotência
        try {
            $stmtFind = $this->db->prepare("
                SELECT `id`, `ticket_token`, `payment_status` 
                FROM `congress_registrations`
                WHERE `asaas_payment_id` = ? OR `ticket_token` = ?
                LIMIT 1
            ");
            $stmtFind->execute([$paymentId, $externalRef]);
            $existing = $stmtFind->fetch(PDO::FETCH_ASSOC);

            if (!$existing) {
                return ['ok' => true, 'message' => 'Cobrança não associada a uma inscrição de congresso.'];
            }

            $currentStatus = $existing['payment_status'];

            // Mapeamento de Eventos Asaas
            $isConfirmed = in_array($event, ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED_IN_CASH'], true);
            $isCancelled = in_array($event, ['PAYMENT_DELETED', 'PAYMENT_OVERDUE', 'PAYMENT_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED', 'PAYMENT_CHARGEBACK_DISPUTE'], true);
            $isCreated = ($event === 'PAYMENT_CREATED');

            if ($isConfirmed) {
                // Idempotência: Se já confirmado, retornar sucesso sem refazer updates
                if ($currentStatus === 'CONFIRMED' || $currentStatus === 'FREE_APPROVED') {
                    return [
                        'ok' => true,
                        'message' => 'Pagamento já confirmado anteriormente (idempotente).'
                    ];
                }
                $newStatus = 'CONFIRMED';
                if (!empty($existing['coupon_code'])) {
                    try {
                        $stmtInc = $this->db->prepare("UPDATE `congress_coupons` SET `current_uses` = `current_uses` + 1 WHERE `code` = ?");
                        $stmtInc->execute([$existing['coupon_code']]);
                    } catch (\Throwable $eInc) {}
                }
            } elseif ($isCancelled) {
                $newStatus = 'CANCELLED';
            } elseif ($isCreated) {
                return [
                    'ok' => true,
                    'message' => 'Evento PAYMENT_CREATED registrado com sucesso.'
                ];
            } else {
                return [
                    'ok' => true,
                    'message' => "Evento $event recebido sem alteração necessária."
                ];
            }

            $stmtUpdate = $this->db->prepare("
                UPDATE `congress_registrations`
                SET `payment_status` = ?, `updated_at` = CURRENT_TIMESTAMP
                WHERE `id` = ?
            ");
            $stmtUpdate->execute([$newStatus, $existing['id']]);

            return [
                'ok' => true,
                'message' => "Status atualizado para $newStatus com sucesso."
            ];
        } catch (Throwable $e) {
            error_log('[CongressTicketService] Webhook error: ' . $e->getMessage());
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Processa a validação e check-in físico de uma credencial na portaria
     */
    public function processCheckIn(string $token): array {
        $cleanToken = trim($token);
        // Se vier payload completo do QR Code (ex: BH-CONG-2026|TKT-CONG-XXX|CPF), extrair o token
        if (strpos($cleanToken, '|') !== false) {
            $parts = explode('|', $cleanToken);
            $cleanToken = trim($parts[1] ?? $cleanToken);
        }

        if (empty($cleanToken)) {
            return [
                'ok' => false,
                'status' => 'INVALID_TOKEN',
                'message' => 'Token de credencial não informado.'
            ];
        }

        $ticket = $this->getTicketByToken($cleanToken);
        if (!$ticket) {
            return [
                'ok' => false,
                'status' => 'NOT_FOUND',
                'message' => 'Credencial não localizada no sistema.'
            ];
        }

        if (empty($ticket['is_confirmed'])) {
            return [
                'ok' => false,
                'status' => 'UNPAID',
                'message' => 'Pagamento pendente. Entrada NÃO autorizada!',
                'data' => $ticket
            ];
        }

        if (!empty($ticket['checked_in'])) {
            $timeStr = !empty($ticket['checked_in_at']) ? date('H:i \d\e d/m', strtotime($ticket['checked_in_at'])) : 'anteriormente';
            return [
                'ok' => false,
                'status' => 'ALREADY_CHECKED_IN',
                'message' => "ATENÇÃO: Este ingresso JÁ FOI UTILIZADO às {$timeStr}!",
                'data' => $ticket
            ];
        }

        try {
            $stmt = $this->db->prepare("
                UPDATE `congress_registrations` 
                SET `checked_in` = 1, `checked_in_at` = NOW() 
                WHERE `ticket_token` = ?
            ");
            $stmt->execute([$cleanToken]);

            $ticket['checked_in'] = true;
            $ticket['checked_in_at'] = date('Y-m-d H:i:s');

            return [
                'ok' => true,
                'status' => 'SUCCESS',
                'message' => "ENTRADA LIBERADA! Bem-vindo(a), {$ticket['customer_name']}.",
                'data' => $ticket
            ];
        } catch (Throwable $e) {
            error_log('[CongressTicketService] processCheckIn error: ' . $e->getMessage());
            return [
                'ok' => false,
                'status' => 'SERVER_ERROR',
                'message' => 'Erro interno ao registrar check-in: ' . $e->getMessage()
            ];
        }
    }
}

