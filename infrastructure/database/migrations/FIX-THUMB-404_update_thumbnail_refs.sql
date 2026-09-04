-- ============================================================================
-- Migration: FIX-THUMB-404 — Atualizar thumbnail_ref para nomes sanitizados
-- Protocolo: Nexus V3.1
-- Data: 2026-06-03
-- Descrição: Atualiza o campo thumbnail_ref das lessons para apontar 
--            para os nomes reais dos arquivos no disco (pós-sanitização).
--            O fuzzy fallback no PHP cobre o runtime, mas esta migração 
--            corrige a fonte de verdade (banco de dados).
-- ============================================================================

-- SAFETY: Dry-run query first (uncomment to preview affected rows)
-- SELECT id, title, thumbnail_ref FROM lms_lessons WHERE thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

-- ============================================================================
-- Módulo: Introdução ao Body Harmony
-- ============================================================================
UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Introducao_ao_Body_Harmony_00_Aula_1_-_Boas_vindas.png'
WHERE title LIKE '%Boas%Vindas%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Introducao_ao_Body_Harmony_01_Aula_2_-_Conhecendo_a_musculatura_esqueletica.png'
WHERE title LIKE '%Conhecendo%Musculatura%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Introducao_ao_Body_Harmony_02_Aula_3_-_Composicao_Muscular.png'
WHERE title LIKE '%Composi%Muscular%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Introducao_ao_Body_Harmony_03_Aula_4_-_Fibras_Musculares_Tipo_1_-_BRANCA.png'
WHERE title LIKE '%Fibras%Tipo 1%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Introducao_ao_Body_Harmony_04_Aula_5_-_Fibras_Musculares_-_Tipo_2_-_Vermelhas.png'
WHERE title LIKE '%Fibras%Tipo 2%Vermelhas%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

-- ============================================================================
-- Módulo: Interpretação de Exames - DR ULISSES LOPES
-- ============================================================================
UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Interpretacao_de_exames_-_DR_U_00_Aula_1_-_TGO_E_TGP_.png'
WHERE title LIKE '%TGO%TGP%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Interpretacao_de_exames_-_DR_U_01__Aula_2_-_CPK_creatinofosfoquinase.png'
WHERE title LIKE '%CPK%creatinofosfoquinase%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Interpretacao_de_exames_-_DR_U_02_Aula_3_-_Pancreas_e_Insulina.png'
WHERE title LIKE '%ncreas%Insulina%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Interpretacao_de_exames_-_DR_U_03_Aula_4_-_Glucagon_.png'
WHERE title LIKE '%Glucagon%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Interpretacao_de_exames_-_DR_U_04_Aula_5-_Testosterona.png'
WHERE title LIKE '%Testosterona%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

-- ============================================================================
-- Módulo: Fundamentos da Eletroestimulação
-- ============================================================================
UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Fundamentos_da_Eletroestimulac_00_Eletroestimulacao_e_Seus_Conceitos.png'
WHERE title LIKE '%Eletroestimula%Conceitos%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

-- ============================================================================
-- Módulo: Aulas Práticas
-- ============================================================================
UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Aulas_Praticas_00_Gluteo_-_Colocacao_de_eletrodo_e_exercicios__6993c94da566d.png'
WHERE title LIKE '%Gluteo%eletrodo%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Aulas_Praticas_01_Quadriceps_-_Colocacao_de_Eletrodo_e_Exercicios_.png'
WHERE title LIKE '%Quadriceps%Eletrodo%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Aulas_Praticas_02_Dorsais_-_Colocacao_de_Eletrodo_e_Execucao_.png'
WHERE title LIKE '%Dorsais%Eletrodo%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

-- ============================================================================
-- Módulo: EletroFace
-- ============================================================================
UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/EletroFace_-Aula_teorica_e_fun_00_Eletroface_-_Teoria__69951df5489f3.png'
WHERE title LIKE '%Eletroface%Teoria%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

-- ============================================================================
-- Módulo: Negócios & Marketing
-- ============================================================================
UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Negocios_marketing__00_Aula_1_-_CAIXA_RAPIDO.png'
WHERE title LIKE '%CAIXA%RAPIDO%' AND title LIKE '%Aula 1%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Negocios_marketing__01_Aula_2_-_CAIXA_RAPIDO.png'
WHERE title LIKE '%CAIXA%RAPIDO%' AND title LIKE '%Aula 2%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

UPDATE lms_lessons 
SET thumbnail_ref = 'thumbnails/Negocios_marketing__02_Aula_3_-CAIXA_RAPIDO.png'
WHERE title LIKE '%CAIXA%RAPIDO%' AND title LIKE '%Aula 3%' AND thumbnail_ref IS NOT NULL AND thumbnail_ref != '';

-- ============================================================================
-- Verification: Confirmar que os refs apontam para arquivos existentes
-- ============================================================================
-- SELECT id, title, thumbnail_ref FROM lms_lessons WHERE thumbnail_ref LIKE 'thumbnails/%' ORDER BY id;
