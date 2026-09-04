-- ==============================================================================
-- BODY HARMONY -- V41 SEED MOCK DATA (2026-02-20)
-- STATUS: DEVELOPMENT/TESTING
-- OBJECTIVE: Seed mock students and clinical cases for E2E testing
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- ------------------------------------------------------------------------------
-- 1. Seed 3 Mock Students
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO students (
        id,
        name,
        email,
        username,
        cpf,
        whatsapp,
        instagram,
        password_hash,
        is_active
    )
VALUES (
        9001,
        'licenciada Teste Alpha',
        'licenciada.alpha@bodyharmony.test',
        'licenciada_alpha',
        '11111111111',
        '11999999991',
        '@licenciada_alpha',
        '$2y$10$wTf7oGv.xUT5eAdGm5/a0d.KIsL6UrSH/ofCaoZjF5xK',
        1
    ),
    (
        9002,
        'licenciada Teste Beta',
        'licenciada.beta@bodyharmony.test',
        'licenciada_beta',
        '22222222222',
        '11999999992',
        '@licenciada_beta',
        '$2y$10$wTf7oGv.xUT5eAdGm5/a0d.KIsL6UrSH/ofCaoZjF5xK',
        1
    ),
    (
        9003,
        'licenciada Teste Gama',
        'licenciada.gamma@bodyharmony.test',
        'licenciada_gama',
        '33333333333',
        '11999999993',
        '@licenciada_gama',
        '$2y$10$wTf7oGv.xUT5eAdGm5/a0d.KIsL6UrSH/ofCaoZjF5xK',
        1
    );
-- Note: The password hash used is for '@BodyHarmony2026!'
-- ------------------------------------------------------------------------------
-- 2. Seed Mock Clinical Cases for Doctor Harmony Sandbox
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO ai_clinical_cases (
        id,
        license_id,
        student_id,
        case_title,
        case_description,
        patient_name,
        age,
        gender,
        complaint,
        history,
        status
    )
VALUES (
        9001,
        1,
        9001,
        'Flacidez Abdominal',
        'Paciente apresenta flacidez grau 2 no abdômen pós-gestação. Qual o protocolo de eletroestimulação indicado?',
        'Maria Oliveira',
        35,
        'Feminino',
        'Flacidez Abdominal',
        'Gestações: 2. Sedentária.',
        'PENDING'
    ),
    (
        9002,
        1,
        9002,
        'Gordura Localizada Flancos',
        'Acúmulo de adiposidade nos flancos, paciente resistente a perda de peso apenas com dieta.',
        'Ana Souza',
        42,
        'Feminino',
        'Gordura Localizada',
        'Nenhuma comorbidade. Treina 2x por semana.',
        'ANALYZED'
    ),
    (
        9003,
        1,
        9003,
        'Celulite Glúteos',
        'Grau 3 de FEG em glúteos e posterior de coxa. Solicito sugestão de parâmetros para corrente Aussie.',
        'Carla Mendes',
        28,
        'Feminino',
        'Celulite',
        'Faz uso de anticoncepcional oral.',
        'REVIEWED'
    );
-- ------------------------------------------------------------------------------
-- 3. Audit
-- ------------------------------------------------------------------------------
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'SEED_MOCK_DATA_V41',
        'INFO',
        'system',
        'Seeded 3 mock students and 3 clinical cases for testing'
    );