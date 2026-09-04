-- ===================================================
-- SEED: USUÁRIAS DE TESTE DE STRESS (K6)
-- Target Table: students (licenciadas)
-- CPF Pattern: 00000000001 a 00000000050
-- Password: Mudar123!
-- Password Hash: $2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn
-- ===================================================

USE `u388974772_bodyharmony_db`;

-- Limpa registros de stress anteriores para garantir idempotência
DELETE FROM `licenciadas` WHERE `username` LIKE 'stress_user_%';

INSERT INTO `licenciadas` (
    `name`,
    `username`,
    `email`,
    `state`,
    `cpf`,
    `location`,
    `password_hash`,
    `is_active`,
    `max_devices`
) VALUES 
('Stress User 001', 'stress_user_001', 'stress.user.001@test.com', 'SP', '00000000001', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 002', 'stress_user_002', 'stress.user.002@test.com', 'SP', '00000000002', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 003', 'stress_user_003', 'stress.user.003@test.com', 'SP', '00000000003', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 004', 'stress_user_004', 'stress.user.004@test.com', 'SP', '00000000004', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 005', 'stress_user_005', 'stress.user.005@test.com', 'SP', '00000000005', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 006', 'stress_user_006', 'stress.user.006@test.com', 'SP', '00000000006', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 007', 'stress_user_007', 'stress.user.007@test.com', 'SP', '00000000007', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 008', 'stress_user_008', 'stress.user.008@test.com', 'SP', '00000000008', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 009', 'stress_user_009', 'stress.user.009@test.com', 'SP', '00000000009', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 010', 'stress_user_010', 'stress.user.010@test.com', 'SP', '00000000010', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 011', 'stress_user_011', 'stress.user.011@test.com', 'SP', '00000000011', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 012', 'stress_user_012', 'stress.user.012@test.com', 'SP', '00000000012', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 013', 'stress_user_013', 'stress.user.013@test.com', 'SP', '00000000013', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 014', 'stress_user_014', 'stress.user.014@test.com', 'SP', '00000000014', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 015', 'stress_user_015', 'stress.user.015@test.com', 'SP', '00000000015', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 016', 'stress_user_016', 'stress.user.016@test.com', 'SP', '00000000016', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 017', 'stress_user_017', 'stress.user.017@test.com', 'SP', '00000000017', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 018', 'stress_user_018', 'stress.user.018@test.com', 'SP', '00000000018', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 019', 'stress_user_019', 'stress.user.019@test.com', 'SP', '00000000019', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 020', 'stress_user_020', 'stress.user.020@test.com', 'SP', '00000000020', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 021', 'stress_user_021', 'stress.user.021@test.com', 'SP', '00000000021', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 022', 'stress_user_022', 'stress.user.022@test.com', 'SP', '00000000022', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 023', 'stress_user_023', 'stress.user.023@test.com', 'SP', '00000000023', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 024', 'stress_user_024', 'stress.user.024@test.com', 'SP', '00000000024', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 025', 'stress_user_025', 'stress.user.025@test.com', 'SP', '00000000025', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 026', 'stress_user_026', 'stress.user.026@test.com', 'SP', '00000000026', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 027', 'stress_user_027', 'stress.user.027@test.com', 'SP', '00000000027', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 028', 'stress_user_028', 'stress.user.028@test.com', 'SP', '00000000028', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 029', 'stress_user_029', 'stress.user.029@test.com', 'SP', '00000000029', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 030', 'stress_user_030', 'stress.user.030@test.com', 'SP', '00000000030', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 031', 'stress_user_031', 'stress.user.031@test.com', 'SP', '00000000031', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 032', 'stress_user_032', 'stress.user.032@test.com', 'SP', '00000000032', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 033', 'stress_user_033', 'stress.user.033@test.com', 'SP', '00000000033', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 034', 'stress_user_034', 'stress.user.034@test.com', 'SP', '00000000034', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 035', 'stress_user_035', 'stress.user.035@test.com', 'SP', '00000000035', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 036', 'stress_user_036', 'stress.user.036@test.com', 'SP', '00000000036', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 037', 'stress_user_037', 'stress.user.037@test.com', 'SP', '00000000037', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 038', 'stress_user_038', 'stress.user.038@test.com', 'SP', '00000000038', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 039', 'stress_user_039', 'stress.user.039@test.com', 'SP', '00000000039', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 040', 'stress_user_040', 'stress.user.040@test.com', 'SP', '00000000040', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 041', 'stress_user_041', 'stress.user.041@test.com', 'SP', '00000000041', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 042', 'stress_user_042', 'stress.user.042@test.com', 'SP', '00000000042', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 043', 'stress_user_043', 'stress.user.043@test.com', 'SP', '00000000043', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 044', 'stress_user_044', 'stress.user.044@test.com', 'SP', '00000000044', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 045', 'stress_user_045', 'stress.user.045@test.com', 'SP', '00000000045', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 046', 'stress_user_046', 'stress.user.046@test.com', 'SP', '00000000046', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 047', 'stress_user_047', 'stress.user.047@test.com', 'SP', '00000000047', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 048', 'stress_user_048', 'stress.user.048@test.com', 'SP', '00000000048', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 049', 'stress_user_049', 'stress.user.049@test.com', 'SP', '00000000049', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10),
('Stress User 050', 'stress_user_050', 'stress.user.050@test.com', 'SP', '00000000050', 'São Paulo', '$2y$12$IHPBXgfV5LZ/Re2ZPXXXgOzaG45WFFkCCd647agbxti7Apfx3eAGn', 1, 10);
