# Dicionário de Dados — Body Harmony

> **Gerado pelo Data Master** — 🟢 CONFIRMADO via DDL consolidado (V36.1+V97+) e migrations sequenciais (V34-V94)

**Engine:** MySQL 8.4 / InnoDB
**Charset:** utf8mb4_unicode_ci
**Timezone:** UTC

---

## 1. Admin & Authentication (3 tabelas)

### `admin_users`
Administradores do sistema (Superadmin, Admin, Editor).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID único |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Login |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hash |
| role | ENUM('superadmin','admin','editor') | DEFAULT 'admin' | Perfil |
| lgpd_status | TEXT | NULL | JSON consentimento |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id), UNIQUE(username)

---

### `admin_sessions`
Sessões ativas de admin (token-based).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| user_id | INT(11) | FK → admin_users, NOT NULL | Admin |
| token | VARCHAR(64) | UNIQUE, NOT NULL | SHA256 token |
| expires_at | DATETIME | NOT NULL | Expiração |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id), UNIQUE(token), KEY(user_id)

---

### `admin_nudges`
Notificações de admin para licenciadas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| licenciada_id | INT(11) | FK → licenciadas, NOT NULL | Alvo |
| type | ENUM('alert','reminder','encouragement') | NOT NULL | Tipo |
| message | TEXT | NOT NULL | Conteúdo |
| is_read | TINYINT(1) | DEFAULT 0 | Lido? |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id), KEY(licenciada_id)

---

## 2. Licenciadas (Usuários do LMS) — 2 tabelas

### `licenciadas`
Profissionais licenciadas (ex-students, renomeada V41+V52).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| name | VARCHAR(100) | NOT NULL | Nome completo |
| email | VARCHAR(100) | UNIQUE, NULL | Email |
| username | VARCHAR(50) | UNIQUE, NULL | Usuário login |
| cpf | VARCHAR(14) | NOT NULL | CPF (fallback login) |
| state | VARCHAR(10) | NULL | UF |
| location | VARCHAR(100) | NULL | Cidade |
| photo_url | VARCHAR(255) | NULL | Foto perfil |
| whatsapp | VARCHAR(20) | NULL | WhatsApp |
| instagram | VARCHAR(50) | NULL | Instagram |
| instagram_embed_url | VARCHAR(255) | NULL | Embed URL |
| password_hash | VARCHAR(255) | NULL | Bcrypt hash |
| force_password_change | TINYINT(1) | DEFAULT 0 | Força troca? |
| video_url | VARCHAR(255) | NULL | Video depoimento |
| mini_gallery | TEXT | NULL | JSON galeria |
| max_devices | INT(11) | DEFAULT 1 | Limite dispositivos |
| is_active | TINYINT(1) | DEFAULT 1 | Ativo? |
| failed_login_attempts | TINYINT(4) | DEFAULT 0 | Falhas login |
| locked_until | DATETIME | NULL | Bloqueio até |
| last_login_at | DATETIME | NULL | Último login |
| last_watched_at | TIMESTAMP | NULL | Última aula |
| progress_percent | DECIMAL(5,2) | DEFAULT 0.00 | Progresso geral |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |
| renewal_date | DATE | NULL | Renovação licença |
| admin_notes | TEXT | NULL | Notas admin |
| lgpd_status | TEXT | NULL | JSON consentimento |
| telegram_user_id | BIGINT | UNIQUE, NULL | V88: Telegram ID |

**Índices:** PK(id), UNIQUE(username), UNIQUE(email), KEY(renewal_date), UNIQUE(telegram_user_id)

---

### `licenciada_devices`
Fingerprinting de dispositivos para Watchtower (ex-student_devices, renomeada V41, expandida V47).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| licenciada_id | INT(11) | FK → licenciadas, NOT NULL | Licenciada |
| device_token | VARCHAR(64) | UNIQUE, NOT NULL | Token |
| user_agent | VARCHAR(255) | NULL | Browser |
| ip_address | VARCHAR(45) | NULL | IP |
| is_active | TINYINT(1) | DEFAULT 1 | Ativo? |
| is_trusted | TINYINT(1) | DEFAULT 0 | V47: Confiável? |
| city | VARCHAR(100) | NULL | V47: Cidade |
| region | VARCHAR(100) | NULL | V47: Região |
| isp | VARCHAR(100) | NULL | V47: Provedor |
| fingerprint_hash | VARCHAR(64) | NULL | V47: Hash HW |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Primeiro visto |
| last_used_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Último uso |

**Índices:** PK(id), UNIQUE(device_token), KEY(licenciada_id), KEY(fingerprint_hash)

---

## 3. Aluna Portal (Cursos Avulsos) — 5 tabelas (V68+)

### `alunas`
Clientes que compram cursos individuais (separadas de licenciadas).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| name | VARCHAR(100) | NOT NULL | Nome |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Email |
| cpf | VARCHAR(14) | UNIQUE, NOT NULL | CPF |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt |
| is_active | TINYINT(1) | DEFAULT 1 | Ativo? |
| is_approved | TINYINT(1) | DEFAULT 1 | V91: Aprovado? |
| force_password_change | TINYINT(1) | DEFAULT 1 | Força troca? |
| failed_login_attempts | TINYINT(4) | DEFAULT 0 | Falhas |
| locked_until | DATETIME | NULL | Bloqueio |
| last_login_at | DATETIME | NULL | Último login |
| max_devices | INT(11) | DEFAULT 1 | Limite devices |
| admin_notes | TEXT | NULL | Notas |
| lgpd_status | TEXT | NULL | Consentimento |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id), UNIQUE(email), UNIQUE(cpf), KEY(is_approved)

---

### `aluna_devices`
Dispositivos de alunas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| aluna_id | INT(11) | FK → alunas CASCADE | Aluna |
| device_token | VARCHAR(64) | UNIQUE, NOT NULL | Token |
| user_agent | VARCHAR(255) | NULL | Browser |
| ip_address | VARCHAR(45) | NULL | IP |
| is_active | TINYINT(1) | DEFAULT 1 | Ativo? |
| fingerprint_hash | VARCHAR(64) | NULL | Hash HW |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |
| last_used_at | TIMESTAMP | ON UPDATE | Último uso |

**Índices:** PK(id), UNIQUE(device_token), KEY(aluna_id), KEY(fingerprint_hash)

---

### `aluna_course_access`
Acesso a módulos LMS por aluna.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| aluna_id | INT(11) | FK → alunas CASCADE | Aluna |
| module_id | INT(11) | FK → lms_modules CASCADE | Módulo |
| granted_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Concedido |
| granted_by | INT(11) | FK → admin_users SET NULL | Admin |
| expires_at | DATETIME | NULL | Expiração |

**Índices:** PK(id), UNIQUE(aluna_id, module_id), KEY(aluna_id), KEY(module_id)

---

### `aluna_progress`
Progresso de alunas por aula.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| aluna_id | INT(11) | FK → alunas CASCADE | Aluna |
| lesson_id | INT(11) | FK → lms_lessons CASCADE | Aula |
| is_completed | TINYINT(1) | DEFAULT 0 | Completou? |
| progress_percent | INT(11) | DEFAULT 0 | % assistido |
| watched_duration | INT(11) | DEFAULT 0 | Segundos |
| completion_date | TIMESTAMP | NULL | Conclusão |
| last_watched_at | TIMESTAMP | NULL | Último view |

**Índices:** PK(id), UNIQUE(aluna_id, lesson_id), KEY(lesson_id)

---

### `aluna_certificates`
Certificados de alunas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| aluna_id | INT(11) | FK → alunas CASCADE | Aluna |
| module_id | INT(11) | FK → lms_modules CASCADE | Módulo |
| hash_code | VARCHAR(64) | UNIQUE, NOT NULL | Hash antifraude |
| issued_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Emissão |
| pdf_url | VARCHAR(255) | NULL | URL PDF |

**Índices:** PK(id), UNIQUE(aluna_id, module_id), UNIQUE(hash_code)

---

## 4. LMS (Learning Management System) — 16 tabelas

### `lms_modules`
Módulos do curso (nível topo).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| title | VARCHAR(150) | NOT NULL | Título |
| description | TEXT | NULL | Descrição |
| thumbnail_url | VARCHAR(255) | NULL | Capa |
| display_order | INT(11) | DEFAULT 0 | Ordenação |
| is_active | TINYINT(1) | DEFAULT 1 | Ativo? |
| last_modified_by | INT(11) | FK → admin_users, NULL | Editor |
| last_modified_at | TIMESTAMP | NULL | Editado em |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id), KEY(last_modified_by)

**Módulos atuais:** 6 (Introdução, Eletroestimulação, Exames, EletroFace, Negócios, Práticas)

---

### `lms_lessons`
Aulas individuais dentro de módulos.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| module_id | INT(11) | FK → lms_modules, NOT NULL | Módulo pai |
| title | VARCHAR(150) | NOT NULL | Título |
| description | TEXT | NULL | Descrição |
| video_type | ENUM('youtube','vimeo','mp4','bunny','hostinger') | DEFAULT 'youtube' | Tipo vídeo |
| video_url | VARCHAR(255) | NULL | URL |
| duration_seconds | INT(11) | DEFAULT 0 | Duração |
| thumbnail_url | VARCHAR(255) | NULL | Thumbnail |
| file_path | VARCHAR(255) | NULL | Path (hostinger) |
| display_order | INT(11) | DEFAULT 0 | Ordenação |
| is_active | TINYINT(1) | DEFAULT 1 | Ativo? |
| allow_preview | TINYINT(1) | DEFAULT 0 | Preview grátis |
| points_reward | INT(11) | DEFAULT 10 | Pontos gamificação |
| views_count | INT(11) | DEFAULT 0 | Visualizações |
| last_modified_by | INT(11) | FK → admin_users, NULL | Editor |
| last_modified_at | TIMESTAMP | NULL | Editado em |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id), KEY(module_id), KEY(last_modified_by)

---

### `lms_progress`
Progresso de licenciadas por aula.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| licenciada_id | INT(11) | FK → licenciadas, NULL | Licenciada |
| lesson_id | INT(11) | FK → lms_lessons, NOT NULL | Aula |
| status | ENUM('started','completed') | DEFAULT 'started' | Status |
| is_completed | TINYINT(1) | DEFAULT 0 | Completou? |
| progress_percent | INT(11) | DEFAULT 0 | % |
| last_position_seconds | INT(11) | DEFAULT 0 | Posição vídeo |
| last_watched_at | TIMESTAMP | NULL | Último view |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Atualizado |

**Índices:** PK(id), KEY(licenciada_id), KEY(lesson_id)

---

### `lms_attachments`
Materiais complementares de aula.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| lesson_id | INT(11) | FK → lms_lessons, NOT NULL | Aula |
| type | ENUM('pdf','doc','link','image') | NOT NULL | Tipo |
| title | VARCHAR(150) | NOT NULL | Título |
| url | VARCHAR(255) | NOT NULL | URL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload |

**Índices:** PK(id), KEY(lesson_id)

---

### `lms_quizzes`
Questionários por módulo.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| module_id | INT(11) | FK → lms_modules, NOT NULL | Módulo |
| title | VARCHAR(150) | NOT NULL | Título |
| description | TEXT | NULL | Descrição |
| min_score | INT(11) | DEFAULT 70 | Nota mínima (%) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id), KEY(module_id)

---

### `lms_questions`
Perguntas de quiz.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| quiz_id | INT(11) | FK → lms_quizzes, NOT NULL | Quiz |
| text | TEXT | NOT NULL | Pergunta |
| type | ENUM('single','multiple','text') | DEFAULT 'single' | Tipo |
| order_index | INT(11) | DEFAULT 0 | Ordem |
| image_ref | VARCHAR(255) | NULL | Imagem |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id), KEY(quiz_id)

---

### `lms_question_options`
Opções de múltipla escolha.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| question_id | INT(11) | FK → lms_questions, NOT NULL | Pergunta |
| text | TEXT | NOT NULL | Texto |
| is_correct | TINYINT(1) | DEFAULT 0 | Correta? |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id), KEY(question_id)

---

### `lms_quiz_attempts`
Tentativas de quiz por licenciada.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| licenciada_id | INT(11) | FK → licenciadas, NOT NULL | Licenciada |
| quiz_id | INT(11) | FK → lms_quizzes, NOT NULL | Quiz |
| score | DECIMAL(5,2) | DEFAULT 0.00 | Nota % |
| passed | TINYINT(1) | DEFAULT 0 | Passou? |
| answers_json | LONGTEXT | NULL | JSON respostas |
| attempted_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data |

**Índices:** PK(id), KEY(licenciada_id), KEY(quiz_id)

---

### `lms_certificates`
Certificados de conclusão (licenciadas).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| licenciada_id | INT(11) | FK → licenciadas, NOT NULL | Licenciada |
| module_id | INT(11) | FK → lms_modules, NOT NULL | Módulo |
| hash_code | VARCHAR(64) | UNIQUE, NOT NULL | SHA256 |
| issued_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Emissão |
| pdf_url | VARCHAR(255) | NULL | URL PDF |

**Índices:** PK(id), UNIQUE(licenciada_id, module_id), UNIQUE(hash_code), KEY(module_id)

---

### `lms_resources`
Biblioteca de recursos para download.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| title | VARCHAR(150) | NOT NULL | Título |
| file_name | VARCHAR(255) | NULL | Nome arquivo |
| description | TEXT | NULL | Descrição |
| file_type | VARCHAR(20) | DEFAULT 'pdf' | Extensão |
| size_bytes | BIGINT(20) | DEFAULT 0 | Tamanho |
| status | ENUM('pending','approved','rejected') | DEFAULT 'approved' | Status |
| category | ENUM('manual','evaluation','marketing','template','other') | DEFAULT 'other' | Categoria |
| created_by | INT(11) | FK → admin_users, NULL | Uploader |
| approved_by | INT(11) | FK → admin_users, NULL | Aprovador |
| file_path | VARCHAR(255) | NOT NULL | Path |
| is_active | TINYINT(1) | DEFAULT 1 | Ativo? |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload |

**Índices:** PK(id), KEY(created_by), KEY(approved_by)

---

### `lms_resource_access`
Permissões de recurso por licenciada.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| resource_id | INT(11) | FK → lms_resources, NOT NULL | Recurso |
| licenciada_id | INT(11) | FK → licenciadas, NOT NULL | Licenciada |
| granted_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Concedido |
| granted_by | INT(11) | FK → admin_users, NULL | Admin |

**Índices:** PK(id), UNIQUE(resource_id, licenciada_id), KEY(licenciada_id), KEY(granted_by)

---

### `lms_badges`
Definições de badges de gamificação.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| name | VARCHAR(100) | NOT NULL | Nome |
| slug | VARCHAR(50) | NOT NULL | Slug |
| description | TEXT | NULL | Descrição |
| icon_url | VARCHAR(255) | NULL | Ícone |
| criteria_json | LONGTEXT | NULL | Critérios JSON |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id)

---

### `lms_user_badges`
Badges conquistados por licenciadas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| user_id | INT(11) | FK → licenciadas, NOT NULL | Licenciada |
| badge_id | INT(11) | FK → lms_badges, NOT NULL | Badge |
| awarded_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Conquistado |

**Índices:** PK(id), UNIQUE(user_id, badge_id), KEY(badge_id)

---

### `lms_points_log`
Histórico de pontos de gamificação.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| user_id | INT(11) | FK → licenciadas, NOT NULL | Licenciada |
| action | VARCHAR(50) | NOT NULL | Ação |
| points | INT(11) | NOT NULL | Pontos |
| reference_id | INT(11) | NULL | ID referência |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data |

**Índices:** PK(id), KEY(user_id)

---

### `lms_access_logs`
Auditoria de atividade LMS.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| licenciada_id | INT(11) | FK → licenciadas, NULL | Licenciada |
| admin_id | INT(11) | FK → admin_users, NULL | Admin |
| user_type | ENUM('licenciada','admin','system') | NOT NULL | Tipo |
| action | VARCHAR(50) | NOT NULL | Ação |
| target_resource | VARCHAR(100) | NULL | Alvo |
| details | TEXT | NULL | Detalhes |
| ip_address | VARCHAR(45) | NULL | IP |
| user_agent | TEXT | NULL | V66.5: User-Agent |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data |

**Índices:** PK(id), KEY(licenciada_id), KEY(admin_id), KEY(user_type)

---

## 5. AI & Doctor Harmony (3+1 tabelas)

### `ai_config`
Configuração global da IA (Gemini).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| config_key | VARCHAR(50) | UNIQUE, NOT NULL | Chave |
| config_value | TEXT | NULL | Valor (JSON) |
| description | VARCHAR(255) | NULL | Descrição |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Atualizado |

**Índices:** PK(id), UNIQUE(config_key)

**Chaves:** ai_name, ai_slogan, gemini_model, doctor_harmony_system_prompt

---

### `ai_clinical_cases`
Casos clínicos submetidos para análise.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| license_id | INT(11) | FK → licenciadas, NOT NULL | Licenciada |
| licenciada_id | INT(11) | FK → licenciadas, NOT NULL | Licenciada (dup?) |
| case_title | VARCHAR(255) | DEFAULT 'Caso Clínico' | Título |
| case_description | TEXT | NULL | Descrição |
| photo_path | VARCHAR(255) | NULL | Foto |
| doctor_harmony_response | TEXT | NULL | V35: Resposta IA |
| confidence_score | FLOAT | DEFAULT 0 | Confiança (0-1) |
| needs_review | TINYINT(1) | DEFAULT 0 | Requer revisão? |
| mentor_feedback | TEXT | NULL | Feedback mentor |
| mentor_id | INT(11) | FK → admin_users, NULL | Mentor |
| status | ENUM('PENDING','ANALYZED','REVIEWED','REJECTED') | DEFAULT 'PENDING' | Status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submissão |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Atualizado |

**Índices:** PK(id), KEY(license_id), KEY(licenciada_id)

---

### `ai_mentorship_logs`
Logs de uso do Doctor Harmony (créditos/tokens).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| license_id | INT(11) | FK → licenciadas, NOT NULL | Licenciada |
| interaction_type | ENUM('TEXT','VISION','DOWNLOAD_RAW','DOWNLOAD_PROTECTED','WIDGET_EVENT') | NOT NULL | Tipo |
| image_path | VARCHAR(255) | NULL | Path imagem |
| resource_id | INT(11) | NULL | ID recurso |
| file_hash | VARCHAR(64) | NULL | SHA256 |
| ip_address | VARCHAR(45) | NULL | IP |
| geolocation | VARCHAR(100) | NULL | Geo |
| prompt_tokens | INT(11) | DEFAULT 0 | Tokens input |
| completion_tokens | INT(11) | DEFAULT 0 | Tokens output |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data |

**Índices:** PK(id), KEY(license_id), KEY(resource_id), KEY(file_hash)

---

## 6. Content & Media (7 tabelas)

### `media_files`
Sistema de reuso de mídia.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| file_path | VARCHAR(500) | UNIQUE, NOT NULL | Path relativo |
| file_name | VARCHAR(255) | NOT NULL | Nome original |
| file_type | VARCHAR(100) | NOT NULL | MIME type |
| file_size | BIGINT(20) | NOT NULL | Bytes |
| media_category | ENUM('thumbnail','lesson','resource','profile','other') | NOT NULL | Categoria |
| width | INT(11) | NULL | Largura px |
| height | INT(11) | NULL | Altura px |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload |
| last_accessed | TIMESTAMP | NULL | Último uso |
| access_count | INT(11) | DEFAULT 0 | Recontagem |

**Índices:** PK(id), UNIQUE(file_path), KEY(media_category), KEY(created_at)

---

### `mentors`
Mentores/instrutores do Body Harmony.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| name | VARCHAR(100) | NOT NULL | Nome |
| nickname | VARCHAR(50) | NULL | Apelido |
| role | VARCHAR(100) | NULL | Profissão |
| photo_url | VARCHAR(255) | NULL | Foto |
| bio | TEXT | NULL | Biografia |
| instagram | VARCHAR(50) | NULL | Instagram |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id)

**Mentores:** Josi Silva, Dr. Ulisses Lopes, Kaprice Gonçalves

---

### `testimonials`
Depoimentos de alunas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| name | VARCHAR(100) | NOT NULL | Nome |
| role | VARCHAR(100) | NULL | Profissão |
| text | TEXT | NOT NULL | Depoimento |
| photo_url | VARCHAR(255) | NULL | Foto |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id)

---

### `results`
Resultados antes/depois.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| description | VARCHAR(255) | NOT NULL | Descrição |
| category | VARCHAR(50) | DEFAULT 'Gordura Localizada' | Categoria |
| image_url | VARCHAR(255) | NOT NULL | Imagem |
| date | DATE | NULL | Data |
| licenciada_id | INT(11) | FK → licenciadas, NULL | Licenciada |
| pinned | TINYINT(1) | DEFAULT 0 | Destaque? |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id), KEY(licenciada_id)

---

### `gallery_images`
Galeria de imagens institucionais.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| image_url | VARCHAR(255) | NOT NULL | URL |
| category | VARCHAR(50) | DEFAULT 'General' | Categoria |
| description | VARCHAR(255) | NULL | Descrição |
| is_active | TINYINT(1) | DEFAULT 1 | Ativo? |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload |

**Índices:** PK(id)

---

### `leads`
Leads do site público.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| name | VARCHAR(100) | NOT NULL | Nome |
| email | VARCHAR(100) | NOT NULL | Email |
| whatsapp | VARCHAR(20) | NULL | WhatsApp |
| status | ENUM('new','contacted','converted','archived') | DEFAULT 'new' | Status |
| source | VARCHAR(50) | DEFAULT 'site' | Origem |
| notes | TEXT | NULL | Notas |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submissão |

**Índices:** PK(id)

---

### `faq`
Perguntas frequentes.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| question | TEXT | NOT NULL | Pergunta |
| answer | TEXT | NOT NULL | Resposta |
| display_order | INT(11) | DEFAULT 0 | Ordem |
| is_active | TINYINT(1) | DEFAULT 1 | Ativo? |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id)

---

## 7. Security & Audit (6 tabelas)

### `nexus_security_rules`
Regras de segurança do Nexus.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| rule_key | VARCHAR(50) | UNIQUE, NOT NULL | Chave |
| rule_value | TEXT | NULL | Valor (JSON) |
| description | VARCHAR(255) | NULL | Descrição |
| is_active | TINYINT(1) | DEFAULT 1 | Ativa? |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Atualizado |
| updated_by | INT(11) | FK → admin_users, NULL | Editor |

**Índices:** PK(id), UNIQUE(rule_key), KEY(updated_by)

**Regras:** MAX_LOGIN_ATTEMPTS=3, LOCKOUT_DURATION_MINUTES=15, WHITELIST_IPS, BLACKLIST_IPS, ALLOW_REGISTRATION

---

### `audit_logs`
Auditoria global do sistema.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| user_id | INT(11) | NOT NULL | ID usuário |
| user_type | ENUM('admin','licenciada','system') | NOT NULL | Tipo |
| action | VARCHAR(50) | NOT NULL | Ação |
| severity | VARCHAR(20) | DEFAULT 'INFO' | Severidade |
| description | TEXT | NULL | Descrição |
| details | JSON | NULL | Detalhes |
| ip_address | VARCHAR(45) | NULL | IP |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data |

**Índices:** PK(id), KEY(severity), KEY(user_id, user_type)

---

### `auth_logs`
Tentativas de login com scoring.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| email | VARCHAR(100) | NOT NULL | Email/usuário |
| status | ENUM('success','failure_credentials','failure_suspended','failure_system') | NOT NULL | Status |
| ip_address | VARCHAR(45) | NULL | IP |
| user_agent | VARCHAR(255) | NULL | Browser |
| failure_reason | VARCHAR(255) | NULL | Motivo falha |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data |

**Índices:** PK(id), KEY(email), KEY(ip_address), KEY(created_at)

---

### `script_executions`
Execuções do Nexus Scripts Manager.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| script_id | VARCHAR(100) | NOT NULL | Identificador |
| executed_by | INT(11) | FK → admin_users, NOT NULL | Admin |
| params | LONGTEXT | NULL (JSON) | Parâmetros |
| result | LONGTEXT | NULL (JSON) | Resultado |
| output | TEXT | NULL | Logs |
| status | ENUM('running','success','error') | DEFAULT 'running' | Status |
| error_message | TEXT | NULL | Erro |
| executed_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Início |
| completed_at | TIMESTAMP | NULL | Fim |
| duration_ms | INT(11) | NULL | Duração ms |

**Índices:** PK(id), KEY(script_id), KEY(executed_by), KEY(status), KEY(executed_at)

---

### `lgpd_consent_logs`
Trilha de consentimento LGPD (V36, imutável).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| licenciada_id | INT(11) | FK → licenciadas CASCADE | Licenciada |
| consent_version | VARCHAR(20) | NOT NULL | Versão (v1.0) |
| ip_address | VARCHAR(45) | NOT NULL | IP |
| user_agent | TEXT | NULL | Browser |
| policy_type | ENUM('terms','privacy','data_processing','ai_usage') | NOT NULL | Tipo |
| action | ENUM('accepted','revoked') | NOT NULL | Ação |
| accepted_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Aceite |
| revoked_at | DATETIME | NULL | Revogação |
| meta_data | JSON | NULL | Contexto |

**Índices:** PK(id), KEY(licenciada_id), KEY(action)

---

## 8. System & Config (2+ tabelas)

### `site_config`
Configuração global chave-valor.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| config_key | VARCHAR(50) | PK, NOT NULL | Chave |
| config_value | LONGTEXT | NULL | Valor (JSON/text) |

**Índices:** PK(config_key)

**Chaves:** ai_name, ai_slogan, course_topics, seo, site_benefits, site_features, site_texts, theme_settings

---

### `system_broadcasts`
Comunicados sistêmicos.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| title | VARCHAR(150) | NULL | Título |
| message | TEXT | NOT NULL | Mensagem |
| type | ENUM('info','warning','alert') | DEFAULT 'info' | Tipo |
| is_active | TINYINT(1) | DEFAULT 1 | Ativo? |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Criação |

**Índices:** PK(id)

---

## 9. Bot & Support (V69+) — 4 tabelas

### `bot_sessions`
Máquina de estados das conversas do Telegram.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| chat_id | BIGINT | UNIQUE, NOT NULL | Chat ID Telegram |
| state | VARCHAR(50) | DEFAULT 'idle' | Estado |
| data_json | LONGTEXT | NULL | Dados temporários |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Atualizado |

**Índices:** PK(id), UNIQUE(chat_id)

---

### `bot_support_tickets`
Tickets de suporte do Telegram.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| chat_id | BIGINT | NOT NULL | Chat ID |
| user_name | VARCHAR(100) | NULL | Nome |
| telegram_username | VARCHAR(100) | NULL | @username |
| message | TEXT | NOT NULL | Mensagem |
| group_message_id | INT(11) | NULL | ID no grupo staff |
| status | ENUM('open','attending','closed') | DEFAULT 'open' | Status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Abertura |
| closed_at | TIMESTAMP | NULL | Fechamento |

**Índices:** PK(id), KEY(chat_id), KEY(status)

---

### `support_feedback`
CSAT (Customer Satisfaction) pós-ticket (V94).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| ticket_id | INT(11) | FK → bot_support_tickets, NOT NULL | Ticket |
| rating | TINYINT | CHECK(1-5) | Nota 1-5 |
| comment | TEXT | NULL | Comentário |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data |

**Índices:** PK(id)

---

### `magic_tokens`
Tokens de auto-login (SSO via Telegram), V94.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | INT(11) | PK, AUTO_INCREMENT | ID |
| licenciada_id | INT(11) | FK → licenciadas CASCADE | Licenciada |
| token | VARCHAR(128) | UNIQUE, NOT NULL | Token criptográfico |
| used_at | TIMESTAMP | NULL | Usado em |
| expires_at | TIMESTAMP | NOT NULL | Expiração |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Geração |

**Índices:** PK(id), UNIQUE(token), KEY(expires_at)

---

## Resumo

| Domínio | Tabelas |
|---------|---------|
| Admin & Auth | 3 |
| Licenciadas | 2 |
| Aluna Portal | 5 |
| LMS | 16 |
| AI & Doctor Harmony | 3 |
| Content & Media | 7 |
| Security & Audit | 6 |
| System & Config | 2 |
| Bot & Support | 4 |
| **Total** | **42** (após V94) |
