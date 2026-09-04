-- ============================================================
-- V68: Portal Aluna Individual (Cursos Avulsos)
-- Data: 2026-03-02
-- Descrição: Cria entidade 'aluna' completamente isolada da
--            tabela 'licenciadas'. Alunas são clientes esporádicas
--            que compram cursos individuais. Zero contaminação.
-- ============================================================

-- 1. Tabela principal de alunas
CREATE TABLE IF NOT EXISTS alunas (
    id                    INT(11)      NOT NULL AUTO_INCREMENT,
    name                  VARCHAR(100) NOT NULL,
    email                 VARCHAR(100) NOT NULL,
    cpf                   VARCHAR(14)  NOT NULL,
    password_hash         VARCHAR(255) NOT NULL,
    is_active             TINYINT(1)   DEFAULT 1,
    force_password_change TINYINT(1)   DEFAULT 1,
    failed_login_attempts TINYINT(4)   DEFAULT 0,
    locked_until          DATETIME     NULL,
    last_login_at         DATETIME     NULL,
    max_devices           INT(11)      DEFAULT 1,
    admin_notes           TEXT         NULL,
    lgpd_status           TEXT         NULL,
    created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_aluna_email (email),
    UNIQUE KEY uq_aluna_cpf   (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Fingerprinting de dispositivos de alunas
CREATE TABLE IF NOT EXISTS aluna_devices (
    id               INT(11)      NOT NULL AUTO_INCREMENT,
    aluna_id         INT(11)      NOT NULL,
    device_token     VARCHAR(64)  NOT NULL,
    user_agent       VARCHAR(255) NULL,
    ip_address       VARCHAR(45)  NULL,
    is_active        TINYINT(1)   DEFAULT 1,
    fingerprint_hash VARCHAR(64)  NULL,
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    last_used_at     TIMESTAMP    NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_aluna_device_token (device_token),
    KEY idx_aluna_devices_aluna_id (aluna_id),
    KEY idx_aluna_devices_fingerprint (fingerprint_hash),
    CONSTRAINT fk_aluna_device_aluna
        FOREIGN KEY (aluna_id) REFERENCES alunas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Controle de acesso a módulos LMS por aluna
CREATE TABLE IF NOT EXISTS aluna_course_access (
    id          INT(11)  NOT NULL AUTO_INCREMENT,
    aluna_id    INT(11)  NOT NULL,
    module_id   INT(11)  NOT NULL,
    granted_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    granted_by  INT(11)  NULL,
    expires_at  DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_aluna_module_access (aluna_id, module_id),
    KEY idx_aluna_access_aluna  (aluna_id),
    KEY idx_aluna_access_module (module_id),
    CONSTRAINT fk_aluna_access_aluna
        FOREIGN KEY (aluna_id)  REFERENCES alunas(id)       ON DELETE CASCADE,
    CONSTRAINT fk_aluna_access_module
        FOREIGN KEY (module_id) REFERENCES lms_modules(id)  ON DELETE CASCADE,
    CONSTRAINT fk_aluna_access_admin
        FOREIGN KEY (granted_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Progresso das alunas por aula
CREATE TABLE IF NOT EXISTS aluna_progress (
    id               INT(11)        NOT NULL AUTO_INCREMENT,
    aluna_id         INT(11)        NOT NULL,
    lesson_id        INT(11)        NOT NULL,
    is_completed     TINYINT(1)     DEFAULT 0,
    progress_percent INT(11)        DEFAULT 0,
    watched_duration INT(11)        DEFAULT 0,
    completion_date  TIMESTAMP      NULL,
    last_watched_at  TIMESTAMP      NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_aluna_progress (aluna_id, lesson_id),
    KEY idx_aluna_progress_lesson (lesson_id),
    CONSTRAINT fk_aluna_progress_aluna
        FOREIGN KEY (aluna_id)  REFERENCES alunas(id)       ON DELETE CASCADE,
    CONSTRAINT fk_aluna_progress_lesson
        FOREIGN KEY (lesson_id) REFERENCES lms_lessons(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Certificados de conclusão das alunas
CREATE TABLE IF NOT EXISTS aluna_certificates (
    id        INT(11)      NOT NULL AUTO_INCREMENT,
    aluna_id  INT(11)      NOT NULL,
    module_id INT(11)      NOT NULL,
    hash_code VARCHAR(64)  NOT NULL,
    issued_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    pdf_url   VARCHAR(255) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_aluna_cert (aluna_id, module_id),
    UNIQUE KEY uq_aluna_cert_hash (hash_code),
    KEY idx_aluna_cert_module (module_id),
    CONSTRAINT fk_aluna_cert_aluna
        FOREIGN KEY (aluna_id)  REFERENCES alunas(id)       ON DELETE CASCADE,
    CONSTRAINT fk_aluna_cert_module
        FOREIGN KEY (module_id) REFERENCES lms_modules(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
