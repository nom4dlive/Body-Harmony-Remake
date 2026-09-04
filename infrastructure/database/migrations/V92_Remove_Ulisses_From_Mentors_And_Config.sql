-- V92_Remove_Ulisses_From_Mentors_And_Config.sql
-- Remover Dr. Ulisses Lopes do banco de dados

-- 1. Remover o mentor da tabela mentors
DELETE FROM mentors WHERE name LIKE '%Ulisses%';

-- 2. Atualizar textos armazenados em JSON no site_config
UPDATE site_config 
SET config_value = REPLACE(config_value, 'Respaldo do Dr. Ulisses Lopes.', 'Apoio com fundamentação científica e prática.') 
WHERE config_value LIKE '%Ulisses%';

UPDATE site_config 
SET config_value = REPLACE(config_value, 'Dr. Ulisses Lopes', 'Apoio Médico Especializado') 
WHERE config_value LIKE '%Ulisses%';

UPDATE site_config 
SET config_value = REPLACE(config_value, 'Dr. Ulisses', 'Equipe Body Harmony') 
WHERE config_value LIKE '%Ulisses%';

-- 3. Remover aulas de Ulisses? A solicitação pede apenas a remoção pública (site), 
-- mas as aulas "serão eliminadas manualmente depois". 
-- Nenhuma exclusão de 'lessons' será feita aqui, pois o usuário fará manualmente.
