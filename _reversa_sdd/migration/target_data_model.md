---
schemaVersion: 1
generatedAt: 2026-06-02T21:20:00-03:00
reversa:
  version: "1.2.43"
kind: target_data_model
producedBy: designer
hash: "sha256:e3f4a5b6c7d8"
---

# Target Data Model

> Modelo de dados do sistema novo. Schema, relacionamentos e restrições.

## Visão geral

Banco único MySQL 8.4 (`bodyharmony_novo`) com todas as tabelas. Esquema otimizado para Laravel Eloquent com migrations, índices explícitos e constraints de unicidade. Nomenclatura snake_case + plural (convenção Laravel).

## Entidades de dados

| Entidade | Tabela | Aggregate dono | PK | Bounded context |
|---|---|---|---|---|
| AdminUser | admin_users | AGG-AdminSession | id (BIGINT AI) | Auth |
| AdminSession | admin_sessions | AGG-AdminSession | id (BIGINT AI) | Auth |
| Licenciada | licenciadas | AGG-Licenciada | id (BIGINT AI) | Licenciada |
| LicenciadaDevice | licenciada_devices | AGG-Licenciada | id (BIGINT AI) | Licenciada |
| Aluna | alunas | AGG-Aluna | id (BIGINT AI) | Aluna |
| AlunaDevice | aluna_devices | AGG-Aluna | id (BIGINT AI) | Aluna |
| AlunaCourseAccess | aluna_course_access | AGG-Aluna | id (BIGINT AI) | Aluna |
| AlunaProgress | aluna_progress | AGG-Aluna | id (BIGINT AI) | Aluna |
| Module | lms_modules | AGG-Module | id (BIGINT AI) | LMS |
| Lesson | lms_lessons | AGG-Module | id (BIGINT AI) | LMS |
| Quiz | lms_quizzes | AGG-Module | id (BIGINT AI) | LMS |
| QuizAttempt | lms_quiz_attempts | AGG-Module | id (BIGINT AI) | LMS |
| ClinicalCase | ai_clinical_cases | AGG-ClinicalCase | id (BIGINT AI) | DoctorHarmony |
| ClinicalReview | ai_clinical_reviews | AGG-ClinicalCase | id (BIGINT AI) | DoctorHarmony |
| Broadcast | system_broadcasts | AGG-Broadcast | id (BIGINT AI) | Broadcast |
| BroadcastLog | system_broadcast_logs | AGG-Broadcast | id (BIGINT AI) | Broadcast |
| NexusRule | nexus_security_rules | AGG-NexusRule | id (BIGINT AI) | Nexus |
| AuditLog | audit_logs | (Shared) | id (BIGINT AI) | Shared/Core |
| Lead | leads | — | id (BIGINT AI) | Leads |
| MediaFile | media_files | — | id (BIGINT AI) | Media |
| FaqEntry | faq_entries | — | id (BIGINT AI) | Content |
| Result | results | — | id (BIGINT AI) | Content |
| Mentor | mentors | — | id (BIGINT AI) | Content |

## Schema (DDL)

```sql
-- Auth Context
CREATE TABLE admin_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin', 'editor') NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    force_password_change BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE admin_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Licenciada Context
CREATE TABLE licenciadas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    whatsapp VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    max_devices TINYINT UNSIGNED NOT NULL DEFAULT 2,
    lgpd_status BOOLEAN NOT NULL DEFAULT FALSE,
    force_password_change BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    photo_url VARCHAR(500) NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE licenciada_devices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    licenciada_id BIGINT UNSIGNED NOT NULL,
    device_token VARCHAR(64) NOT NULL,
    fingerprint_hash VARCHAR(64) NULL,
    user_agent VARCHAR(500) NULL,
    ip_address VARCHAR(45) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    FOREIGN KEY (licenciada_id) REFERENCES licenciadas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_device (licenciada_id, device_token)
);

-- Aluna Context
CREATE TABLE alunas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    max_devices TINYINT UNSIGNED NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE aluna_course_access (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    aluna_id BIGINT UNSIGNED NOT NULL,
    module_id BIGINT UNSIGNED NOT NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    FOREIGN KEY (aluna_id) REFERENCES alunas(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES lms_modules(id) ON DELETE CASCADE
);

-- LMS Context
CREATE TABLE lms_modules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE lms_quizzes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    module_id BIGINT UNSIGNED NOT NULL,
    min_score DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    created_at TIMESTAMP NULL,
    FOREIGN KEY (module_id) REFERENCES lms_modules(id) ON DELETE CASCADE
);

-- DoctorHarmony Context
CREATE TABLE ai_clinical_cases (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    licenciada_id BIGINT UNSIGNED NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    notes TEXT NULL,
    confidence DECIMAL(5,4) NULL,
    status ENUM('pending', 'analyzed', 'needs_review', 'reviewed') NOT NULL DEFAULT 'pending',
    needs_review BOOLEAN NOT NULL DEFAULT FALSE,
    crisis_detected BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (licenciada_id) REFERENCES licenciadas(id) ON DELETE CASCADE
);

-- Broadcast Context
CREATE TABLE system_broadcasts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'alert') NOT NULL DEFAULT 'info',
    target_roles JSON NOT NULL,
    is_blocking BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Nexus Context
CREATE TABLE nexus_security_rules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    rule_type ENUM('BAN', 'ALLOW', 'SUSPICIOUS') NOT NULL,
    reason TEXT NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    UNIQUE KEY unique_rule (ip_address, rule_type)
);
```

## Relacionamentos

| Origem | Destino | Cardinalidade | Integridade | Notas |
|---|---|---|---|---|
| admin_sessions.admin_id | admin_users.id | N:1 | FK ON DELETE CASCADE | |
| licenciada_devices.licenciada_id | licenciadas.id | N:1 | FK ON DELETE CASCADE | |
| aluna_course_access.aluna_id | alunas.id | N:1 | FK ON DELETE CASCADE | |
| aluna_course_access.module_id | lms_modules.id | N:1 | FK ON DELETE CASCADE | |
| lms_quizzes.module_id | lms_modules.id | 1:1 | FK ON DELETE CASCADE | |
| ai_clinical_cases.licenciada_id | licenciadas.id | N:1 | FK ON DELETE CASCADE | |
| system_broadcast_logs.broadcast_id | system_broadcasts.id | N:1 | FK ON DELETE CASCADE | Logs de leitura |

## Restrições

- **Unicidade**: admin_users(username), licenciadas(cpf, email), alunas(cpf, email), nexus_security_rules(ip_address, rule_type)
- **Integridade referencial**: ativada (InnoDB) — todas as FKs com ON DELETE CASCADE
- **Índices críticos**: admin_sessions(token), licenciada_devices(device_token), aluna_devices(device_token), ai_clinical_cases(status), system_broadcasts(target_roles) via JSON index

## Considerações específicas do paradigma alvo

- **Eloquent ORM**: todas as tabelas usam timestamps (created_at, updated_at) por convenção Laravel
- **SoftDeletes**: opcional para entidades com exclusão lógica (licenciadas, admin_users, lms_modules)
- **JSON columns**: target_roles como JSON nativo MySQL 8.4; Laravel cast nativo

## Origem no legado

| Tabela nova | Origem no legado | Transformação |
|---|---|---|
| admin_users | legado.admin_users | renomeação → snake_case |
| admin_sessions | legado.admin_sessions | renomeação |
| licenciadas | legado.licenciadas | adicionar timestamps, remover locked_until, failed_login_attempts (vai para auth_logs) |
| licenciada_devices | legado.licenciada_devices | renomeação |
| alunas | legado.alunas | adicionar timestamps |
| aluna_course_access | legado.aluna_course_access | renomeação |
| aluna_progress | legado.aluna_progress | renomeação |
| lms_modules | legado.lms_modules | renomeação |
| lms_lessons | legado.lms_lessons | renomeação |
| lms_quizzes | legado.lms_quizzes | renomeação |
| lms_quiz_attempts | legado.lms_quiz_attempts | renomeação |
| ai_clinical_cases | legado.ai_clinical_cases | adicionar timestamps |
| system_broadcasts | legado.system_broadcasts | renomeação |
| system_broadcast_logs | legado.system_broadcast_logs | renomeação |
| nexus_security_rules | legado.nexus_security_rules | remover is_active (rule_type cobre) |
| audit_logs | legado.audit_logs | manter schema |
| leads | legado.leads | adicionar timestamps |
| media_files | legado.media_files | renomeação |
| faq_entries | legado.faq | renomeação |
| results | legado.resultados | renomeação |
| mentors | legado.mentores | novo nome |
