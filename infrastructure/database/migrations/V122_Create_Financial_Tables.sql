-- V122: Tabelas do Modulo Financeiro - Portal do Gestor
-- Nexus Protocol V3.1 -- PLAN-122: Painel Financeiro Portal Gestor
-- Data: 2026-08-25

-- ============================================================
-- 1. financial_transactions — Registro unificado de entradas
-- ============================================================
CREATE TABLE IF NOT EXISTS `financial_transactions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `source_type` ENUM('shop_order','onboarding','licenciamento','manual','subscription') NOT NULL,
  `source_id` INT UNSIGNED NULL,
  `type` ENUM('revenue','refund','chargeback','expense') NOT NULL DEFAULT 'revenue',
  `amount_cents` INT UNSIGNED NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'BRL',
  `description` VARCHAR(500) NULL,
  `category` VARCHAR(100) NULL,
  `tax_tag` ENUM('estetica_cosmetica','servicos_medicos_educacionais','nao_definido') NOT NULL DEFAULT 'nao_definido',
  `cost_center_id` INT UNSIGNED NULL,
  `event_tag` VARCHAR(100) NULL,
  `payment_method` ENUM('card','pix','boleto','manual','transfer') NULL,
  `installments` INT UNSIGNED NOT NULL DEFAULT 1,
  `status` ENUM('pending','confirmed','refunded','cancelled') NOT NULL DEFAULT 'confirmed',
  `confirmed_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ft_source` (`source_type`, `source_id`),
  INDEX `idx_ft_date` (`created_at`),
  INDEX `idx_ft_category` (`category`),
  INDEX `idx_ft_event_tag` (`event_tag`),
  INDEX `idx_ft_status` (`status`),
  INDEX `idx_ft_tax_tag` (`tax_tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. financial_cost_centers — Centros de custo por evento
-- ============================================================
CREATE TABLE IF NOT EXISTS `financial_cost_centers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `tag` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX `idx_fcc_tag` (`tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. financial_expenses — Despesas por centro de custo
-- ============================================================
CREATE TABLE IF NOT EXISTS `financial_expenses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `cost_center_id` INT UNSIGNED NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `amount_cents` INT UNSIGNED NOT NULL,
  `category` VARCHAR(100) NULL,
  `receipt_path` VARCHAR(255) NULL,
  `expense_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_fe_cost_center` (`cost_center_id`),
  INDEX `idx_fe_date` (`expense_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. financial_daily_closes — Fechamento diario de caixa
-- ============================================================
CREATE TABLE IF NOT EXISTS `financial_daily_closes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `close_date` DATE NOT NULL,
  `total_revenue_cents` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_expenses_cents` INT UNSIGNED NOT NULL DEFAULT 0,
  `net_result_cents` INT NOT NULL DEFAULT 0,
  `alerts` JSON NULL,
  `status` ENUM('pending','closed','reviewed') NOT NULL DEFAULT 'pending',
  `closed_by_admin_id` INT UNSIGNED NULL,
  `closed_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX `idx_fdc_date` (`close_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. financial_subscriptions — Schema preparado (Fase 4)
-- ============================================================
CREATE TABLE IF NOT EXISTS `financial_subscriptions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `licenciada_id` INT UNSIGNED NOT NULL,
  `plan_name` VARCHAR(200) NOT NULL,
  `amount_cents` INT UNSIGNED NOT NULL,
  `billing_cycle` ENUM('monthly','quarterly','annual') NOT NULL DEFAULT 'monthly',
  `status` ENUM('active','paused','cancelled','past_due') NOT NULL DEFAULT 'active',
  `next_billing_date` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_fs_licenciada` (`licenciada_id`),
  INDEX `idx_fs_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. financial_invoices — Schema preparado (Fase 4)
-- ============================================================
CREATE TABLE IF NOT EXISTS `financial_invoices` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `subscription_id` INT UNSIGNED NULL,
  `transaction_id` INT UNSIGNED NULL,
  `invoice_number` VARCHAR(50) NOT NULL,
  `amount_cents` INT UNSIGNED NOT NULL,
  `due_date` DATE NOT NULL,
  `paid_at` DATETIME NULL,
  `status` ENUM('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_fin_subscription` (`subscription_id`),
  INDEX `idx_fin_transaction` (`transaction_id`),
  INDEX `idx_fin_status` (`status`),
  INDEX `idx_fin_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
