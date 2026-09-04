-- ============================================================
-- Migration: V107_Create_Licenciada_Onboarding_Funnel_Table.sql
-- Description: Funil de Onboarding de Licenciadas, Tokens de Pré-cadastro com OCR e Integração de Contratos (PLAN-064)
-- Date: 2026-08-20
-- Protocol: Nexus Protocol V3.1 (Doctor Harmony Protocol / PHP 8.4)
-- Constitution Invariant: REGRA 8 - Licenciadas CPF Invariant (Strict 'cpf' column)
-- ============================================================

-- 1. Tabela de Tokens Públicos de Acesso ao Onboarding
CREATE TABLE IF NOT EXISTS `licenciada_onboarding_tokens` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `token` VARCHAR(64) NOT NULL UNIQUE COMMENT 'Token criptografico seguro de 64 caracteres hex',
  `categoria` VARCHAR(60) NOT NULL DEFAULT 'Licenciamento' COMMENT 'Categoria do contrato pretendido',
  `telefone_whatsapp` VARCHAR(30) NOT NULL COMMENT 'Telefone WhatsApp da candidata',
  `nome_candidata` VARCHAR(255) NULL COMMENT 'Nome inicial da candidata fornecido pelo gestor',
  `created_by_admin_id` INT UNSIGNED NULL COMMENT 'ID do gestor que emitiu o convite',
  `expires_at` DATETIME NOT NULL COMMENT 'Data e hora limite de validade do link',
  `used_at` DATETIME NULL COMMENT 'Momento em que o formulario foi enviado',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_onboarding_token` (`token`),
  INDEX `idx_onboarding_phone` (`telefone_whatsapp`),
  INDEX `idx_onboarding_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela Principal de Solicitações de Onboarding (Funil de 5 Colunas)
CREATE TABLE IF NOT EXISTS `licenciada_onboarding_requests` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `token_id` BIGINT UNSIGNED NULL COMMENT 'Vinculo com o token de origem',
  `token_str` VARCHAR(64) NULL COMMENT 'Copia do token para rastreabilidade',
  `categoria` VARCHAR(60) NOT NULL DEFAULT 'Licenciamento' COMMENT 'Categoria do contrato',
  `template_slug` VARCHAR(80) NOT NULL DEFAULT 'licenciamento-padrao' COMMENT 'Slug do modelo em contract_templates',
  `nome` VARCHAR(255) NOT NULL COMMENT 'Nome completo ou Razao Social',
  `cpf` VARCHAR(20) NOT NULL COMMENT 'CPF formatado (Licenciadas CPF Invariant - REGRA 8)',
  `rg` VARCHAR(30) NULL COMMENT 'Documento de identidade RG / CNH',
  `email` VARCHAR(150) NOT NULL COMMENT 'E-mail principal de contato',
  `telefone_whatsapp` VARCHAR(30) NOT NULL COMMENT 'Telefone WhatsApp oficial',
  `cep` VARCHAR(20) NULL COMMENT 'CEP do endereco profissional/residencial',
  `endereco` TEXT NULL COMMENT 'Logradouro completo',
  `numero` VARCHAR(30) NULL COMMENT 'Numero do imovel',
  `complemento` VARCHAR(100) NULL COMMENT 'Complemento ou sala',
  `bairro` VARCHAR(100) NULL COMMENT 'Bairro',
  `cidade` VARCHAR(100) NULL COMMENT 'Cidade de atuacao',
  `estado` VARCHAR(10) NULL COMMENT 'UF do estado (ex: SP, RJ)',
  `nacionalidade` VARCHAR(50) NULL DEFAULT 'brasileira',
  `estado_civil` VARCHAR(50) NULL DEFAULT 'solteira',
  `profissao` VARCHAR(100) NULL DEFAULT 'Esteticista',
  `documento_img` VARCHAR(255) NULL COMMENT 'Caminho do upload seguro em private_uploads/onboarding/',
  `ocr_extracted_data` JSON NULL COMMENT 'Dados brutos extraidos pelo SimpleOcrService',
  `ocr_confidence` DECIMAL(5,2) NULL DEFAULT 0.00 COMMENT 'Nivel de confianca da extracao OCR (0.00 a 100.00)',
  `status` ENUM('PRE_CADASTRO', 'CONTRATO_EMITIDO', 'AGUARDANDO_ASSINATURA', 'VALIDAR_PAGAMENTO', 'ATIVO_LIBERADO', 'CANCELADO') NOT NULL DEFAULT 'PRE_CADASTRO' COMMENT 'Etapa do funil',
  `contract_uuid` VARCHAR(64) NULL COMMENT 'UUID do contrato gerado na tabela contracts',
  `licenciada_id` INT(11) NULL COMMENT 'ID da licenciada vinculada na tabela licenciadas',
  `agenda_event_id` BIGINT UNSIGNED NULL COMMENT 'ID da tarefa de onboarding na Agenda do Gestor',
  `taxa_inicial_num` VARCHAR(50) NULL DEFAULT '7.000,00',
  `taxa_inicial_extenso` VARCHAR(255) NULL DEFAULT 'sete mil reais',
  `condicoes_pagamento` VARCHAR(255) NULL DEFAULT 'à vista via PIX',
  `valor_minimo_sessao` VARCHAR(50) NULL DEFAULT '150,00',
  `cidade_celebracao` VARCHAR(100) NULL DEFAULT 'Assis/SP',
  `last_reminder_sent_at` DATETIME NULL COMMENT 'Data do ultimo disparo de lembrete WhatsApp',
  `payment_confirmed_at` DATETIME NULL COMMENT 'Data de confirmacao da taxa/pagamento',
  `payment_confirmed_by_admin_id` INT UNSIGNED NULL COMMENT 'Gestor que validou a 2a etapa',
  `activated_at` DATETIME NULL COMMENT 'Momento da ativacao final da licenciada',
  `admin_notes` TEXT NULL COMMENT 'Observacoes internas da equipe do gestor',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_onboarding_status` (`status`),
  INDEX `idx_onboarding_cpf` (`cpf`),
  INDEX `idx_onboarding_token_id` (`token_id`),
  INDEX `idx_onboarding_contract_uuid` (`contract_uuid`),
  INDEX `idx_onboarding_licenciada_id` (`licenciada_id`),
  CONSTRAINT `fk_onboarding_token` FOREIGN KEY (`token_id`) REFERENCES `licenciada_onboarding_tokens` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
