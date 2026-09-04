-- ============================================================
-- Migration: V108_Enhance_Licenciadas_And_Onboarding_Attachments.sql
-- Description: Suporte a múltiplos anexos, dados PJ (CNPJ, Razão Social, Instagram) e integração com tabela de Licenciadas (PLAN-067)
-- Date: 2026-08-21
-- Protocol: Nexus Protocol V3.1 (Doctor Harmony Protocol / PHP 8.4)
-- Constitution Invariants: REGRA 8 (Licenciadas CPF Invariant), REGRA 9 (Contract PJ Invariant)
-- ============================================================

-- 1. Expansão da tabela de solicitações de onboarding para dados PJ e anexos adicionais
ALTER TABLE `licenciada_onboarding_requests`
  ADD COLUMN IF NOT EXISTS `instagram` VARCHAR(100) NULL COMMENT 'Perfil do Instagram (@usuario)' AFTER `telefone_whatsapp`,
  ADD COLUMN IF NOT EXISTS `cnpj` VARCHAR(30) NULL COMMENT 'CNPJ da empresa' AFTER `cpf`,
  ADD COLUMN IF NOT EXISTS `razao_social` VARCHAR(255) NULL COMMENT 'Razao Social da Pessoa Juridica' AFTER `nome`,
  ADD COLUMN IF NOT EXISTS `nome_fantasia` VARCHAR(255) NULL COMMENT 'Nome Fantasia da Unidade/Clinica' AFTER `razao_social`,
  ADD COLUMN IF NOT EXISTS `is_cnpj_em_abertura` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica se a candidata esta em processo de abertura de CNPJ' AFTER `cnpj`,
  ADD COLUMN IF NOT EXISTS `comprovante_pagamento_img` VARCHAR(255) NULL COMMENT 'Caminho do comprovante de pagamento da taxa inicial' AFTER `documento_img`,
  ADD COLUMN IF NOT EXISTS `comprovante_residencia_img` VARCHAR(255) NULL COMMENT 'Caminho do comprovante de residencia/endereco' AFTER `comprovante_pagamento_img`,
  ADD COLUMN IF NOT EXISTS `contrato_social_img` VARCHAR(255) NULL COMMENT 'Caminho do Cartao CNPJ ou Contrato Social' AFTER `comprovante_residencia_img`,
  ADD COLUMN IF NOT EXISTS `certificados_imgs` JSON NULL COMMENT 'Array JSON com caminhos de certificados de cursos e fotos adicionais' AFTER `contrato_social_img`;

-- 2. Expansão da tabela licenciadas para espelhar todos os dados cadastrais (REGRA 8: estritamente mantendo coluna 'cpf')
ALTER TABLE `licenciadas`
  ADD COLUMN IF NOT EXISTS `cnpj` VARCHAR(30) NULL COMMENT 'CNPJ da Licenciada' AFTER `cpf`,
  ADD COLUMN IF NOT EXISTS `razao_social` VARCHAR(255) NULL COMMENT 'Razao Social PJ' AFTER `name`,
  ADD COLUMN IF NOT EXISTS `nome_fantasia` VARCHAR(255) NULL COMMENT 'Nome Fantasia da Unidade' AFTER `razao_social`,
  ADD COLUMN IF NOT EXISTS `instagram` VARCHAR(100) NULL COMMENT 'Instagram da Licenciada' AFTER `email`,
  ADD COLUMN IF NOT EXISTS `cep` VARCHAR(20) NULL COMMENT 'CEP' AFTER `location`,
  ADD COLUMN IF NOT EXISTS `endereco` TEXT NULL COMMENT 'Logradouro' AFTER `cep`,
  ADD COLUMN IF NOT EXISTS `numero` VARCHAR(30) NULL COMMENT 'Numero' AFTER `endereco`,
  ADD COLUMN IF NOT EXISTS `complemento` VARCHAR(100) NULL COMMENT 'Complemento' AFTER `numero`,
  ADD COLUMN IF NOT EXISTS `bairro` VARCHAR(100) NULL COMMENT 'Bairro' AFTER `complemento`,
  ADD COLUMN IF NOT EXISTS `documentos_anexos` JSON NULL COMMENT 'Caminhos de todos os documentos validados no onboarding' AFTER `photo_url`,
  ADD COLUMN IF NOT EXISTS `origem_onboarding_request_id` BIGINT UNSIGNED NULL COMMENT 'Vinculo com a solicitacao de onboarding que originou o cadastro' AFTER `documentos_anexos`;
