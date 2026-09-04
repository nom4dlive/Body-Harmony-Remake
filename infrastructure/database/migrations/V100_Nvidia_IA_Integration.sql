-- ==============================================================================
-- Migration: V100_Nvidia_IA_Integration
-- Description: Insere chaves de configuração para a API Nvidia NIM na tabela ai_config.
-- ==============================================================================

INSERT INTO `ai_config` (`config_key`, `config_value`) VALUES
('ai_provider', 'gemini'),
('nvidia_api_key', ''),
('nvidia_model', 'meta/llama-3.2-11b-vision-instruct')
ON DUPLICATE KEY UPDATE config_value=VALUES(config_value);
