# Dicionário de Dados — Auth/Aluna/Licenciada

> Gerado pelo Archaeologist em 2026-06-02
> Confiança: 🟢 CONFIRMADO

## Tabelas do Sistema

### admin_users
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| id | int | sim | auto | Chave primária |
| username | varchar | sim | — | Nome de usuário |
| password_hash | varchar | sim | — | Hash bcrypt |
| role | varchar | não | 'admin' | Papel (admin, superadmin) |

### admin_sessions
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| id | int | sim | auto | Chave primária |
| user_id | int | sim | — | FK → admin_users.id |
| token | varchar(64) | sim | — | Token de sessão (hex) |
| expires_at | datetime | sim | — | Expiração (6h após criação) |
| is_active | tinyint | não | 1 | Sessão ativa? |

### licenciadas
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| id | int | sim | auto | Chave primária |
| name | varchar | sim | — | Nome completo |
| cpf | varchar(11) | não | — | CPF (11 dígitos) |
| email | varchar | não | — | E-mail |
| username | varchar | não | — | Nome de usuário alternativo |
| password_hash | varchar(255) | não | — | Hash bcrypt |
| is_active | tinyint | não | 1 | Conta ativa? |
| force_password_change | tinyint | não | 0 | Forçar troca de senha? |
| max_devices | int | não | 2 | Limite de dispositivos |
| failed_login_attempts | int | não | 0 | Tentativas falhas consecutivas |
| locked_until | datetime | não | NULL | Bloqueio temporário até |
| last_login_at | datetime | não | NULL | Último login |
| photo_url | varchar(500) | não | '' | URL da foto |
| whatsapp | varchar | não | '' | WhatsApp |
| instagram | varchar | não | '' | Instagram |
| instagram_embed_url | varchar | não | NULL | URL embed Instagram |
| video_url | varchar | não | '' | URL de vídeo |
| mini_gallery | json | não | '[]' | Galeria de miniaturas |
| state | varchar(2) | não | 'SP' | Estado (UF) |
| location | varchar | não | '' | Cidade/Localização |
| pinned | tinyint | não | 0 | Destacado no site? |
| is_tester | tinyint | não | 0 | É testador? |
| telegram_user_id | bigint | não | NULL | ID Telegram |
| admin_notes | text | não | NULL | Notas administrativas |
| progress_percent | decimal | não | 0 | % de progresso (cached) |
| renewal_date | date | não | NULL | Data de renovação |
| lgpd_status | json | não | '{}' | Consentimentos LGPD |
| last_active_lesson_id | int | não | NULL | Última aula acessada |
| created_at | datetime | sim | CURRENT_TIMESTAMP | Data de criação |

### licenciada_devices
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| id | int | sim | auto | Chave primária |
| licenciada_id | int | sim | — | FK → licenciadas.id |
| device_token | varchar(64) | sim | — | Token único do dispositivo |
| user_agent | varchar(500) | não | — | User-Agent do navegador |
| ip_address | varchar(45) | não | — | Último IP |
| fingerprint_hash | varchar(64) | não | NULL | Hash do RiskEngine |
| is_active | tinyint | não | 1 | Dispositivo ativo? |
| last_used_at | datetime | não | CURRENT_TIMESTAMP | Último uso |
| created_at | datetime | sim | CURRENT_TIMESTAMP | Data de criação |

### alunas
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| id | int | sim | auto | Chave primária |
| name | varchar | sim | — | Nome completo |
| cpf | varchar(11) | não | — | CPF (11 dígitos) |
| email | varchar | não | — | E-mail |
| password_hash | varchar(255) | não | — | Hash bcrypt |
| is_active | tinyint | não | 1 | Conta ativa? |
| force_password_change | tinyint | não | 0 | Forçar troca de senha? |
| max_devices | int | não | 1 | Limite de dispositivos |
| failed_login_attempts | int | não | 0 | Tentativas falhas consecutivas |
| locked_until | datetime | não | NULL | Bloqueio temporário até |
| last_login_at | datetime | não | NULL | Último login |

### aluna_devices
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| id | int | sim | auto | Chave primária |
| aluna_id | int | sim | — | FK → alunas.id |
| device_token | varchar(64) | sim | — | Token (prefixo `al_`) |
| user_agent | varchar(500) | não | — | User-Agent |
| ip_address | varchar(45) | não | — | Último IP |
| is_active | tinyint | não | 1 | Dispositivo ativo? |
| last_used_at | datetime | não | CURRENT_TIMESTAMP | Último uso |
| created_at | datetime | sim | CURRENT_TIMESTAMP | Data de criação |

### aluna_course_access
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| id | int | sim | auto | Chave primária |
| aluna_id | int | sim | — | FK → alunas.id |
| module_id | int | sim | — | FK → lms_modules.id |
| granted_at | datetime | não | CURRENT_TIMESTAMP | Quando foi concedido |
| expires_at | datetime | não | NULL | Expiração do acesso |
| granted_by | int | não | NULL | Admin que concedeu |

### aluna_progress
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| id | int | sim | auto | Chave primária |
| aluna_id | int | sim | — | FK → alunas.id |
| lesson_id | int | sim | — | FK → lms_lessons.id |
| progress_percent | decimal | não | 0 | % assistido (0-100) |
| is_completed | tinyint | não | 0 | Concluído? |
| last_watched_at | datetime | não | CURRENT_TIMESTAMP | Último acesso |
| completion_date | datetime | não | NULL | Data de conclusão |

### aluna_certificates
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| id | int | sim | auto | Chave primária |
| aluna_id | int | sim | — | FK → alunas.id |
| module_id | int | sim | — | FK → lms_modules.id |
| hash_code | varchar(64) | sim | — | Código de verificação |
| created_at | datetime | sim | CURRENT_TIMESTAMP | Data de emissão |

### lms_progress (legado licenciada)
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| id | int | sim | auto | Chave primária |
| licenciada_id | int | sim | — | FK → licenciadas.id |
| lesson_id | int | sim | — | FK → lms_lessons.id |
| is_completed | tinyint | não | 0 | Concluído? |
| progress_percent | decimal | não | 0 | % assistido |
| last_watched_at | datetime | não | CURRENT_TIMESTAMP | Último acesso |

### auth_logs
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| id | int | sim | auto | Chave primária |
| user_id | int | não | NULL | ID do usuário (admin/licenciada/aluna) |
| email | varchar(255) | sim | — | Email/Login usado |
| ip_address | varchar(45) | sim | — | IP de origem |
| user_agent | text | não | NULL | User-Agent |
| status | varchar(50) | sim | — | success | failure_credentials |
| risk_score | int | não | 0 | Score de risco comportamental |
| risk_details | json | não | NULL | Detalhes do risco |
| created_at | datetime | sim | CURRENT_TIMESTAMP | Data |

### nexus_security_rules
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| rule_key | varchar | sim | MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION, WHITELIST_IPS |
| rule_value | text | sim | Valor da regra |
| is_active | tinyint | não | 1 = ativa |
| file_path | varchar | não | Caminho interno do arquivo |
| attachment_count | int | não | 0 | Contagem de anexos |
| last_modified_by | int | não | FK → admin_users.id |
| last_modified_at | datetime | não | Última modificação |
| created_at | datetime | sim | CURRENT_TIMESTAMP | Criação |

### lms_quizzes
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| module_id | int | sim | FK → lms_modules.id |
| title | varchar | sim | Título da avaliação |
| min_score | int | não | 70 | Nota mínima para aprovação |
| created_at | datetime | sim | CURRENT_TIMESTAMP |
| updated_at | datetime | sim | CURRENT_TIMESTAMP ON UPDATE |

### lms_questions
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| quiz_id | int | sim | FK → lms_quizzes.id |
| question_text | text | sim | Enunciado |
| question_type | varchar | não | 'multiple_choice' |
| order_index | int | não | Ordem |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### lms_question_options
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| question_id | int | sim | FK → lms_questions.id |
| option_text | text | sim | Texto da opção |
| is_correct | tinyint | não | 0 | É a correta? |
| order_index | int | não | Ordem |

### lms_quiz_attempts
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| quiz_id | int | sim | FK → lms_quizzes.id |
| licenciada_id | int | sim | FK → licenciadas.id |
| score | decimal(5,2) | não | 0 | Pontuação |
| passed | tinyint | não | 0 | Aprovado? |
| answers | json | não | Respostas |
| attempted_at | datetime | sim | CURRENT_TIMESTAMP |

### lms_certificates
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| licenciada_id | int | sim | FK → licenciadas.id |
| module_id | int | sim | FK → lms_modules.id |
| hash_code | varchar(64) | sim | Hash SHA-256 |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### lms_attachments
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| lesson_id | int | sim | FK → lms_lessons.id |
| title | varchar | sim | Nome |
| file_type | varchar | não | MIME |
| file_path | varchar | não | Caminho |
| is_downloadable | tinyint | não | 1 | Downloadável? |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### lms_resources
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| title | varchar | sim | Título |
| description | text | não | Descrição |
| file_type | varchar | não | MIME |
| file_path | varchar | não | Caminho |
| status | varchar | não | 'pending' | pending|approved|rejected |
| is_active | tinyint | não | 1 | Ativo? |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### lms_resource_access
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| resource_id | int | sim | FK → lms_resources.id |
| licenciada_id | int | sim | FK → licenciadas.id |
| granted_at | datetime | não | CURRENT_TIMESTAMP |

### mentors
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| name | varchar | sim | Nome |
| nickname | varchar | não | Apelido |
| role | varchar | não | Cargo |
| bio | text | não | Bio |
| photo_url | varchar | não | Foto |
| instagram | varchar | não | Instagram |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### site_config
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| config_key | varchar | sim | Chave |
| config_value | text | não | Valor |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### system_broadcasts
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| title | varchar | sim | Título |
| message | text | sim | Mensagem |
| target_roles | json | não | Roles alvo |
| is_active | tinyint | não | 1 | Ativo? |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### system_broadcast_logs
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| broadcast_id | int | sim | FK → system_broadcasts.id |
| user_id | int | sim | ID do usuário |
| user_type | varchar | sim | Tipo |
| read_at | datetime | não | Lido em |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### site_content
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| section | varchar | sim | Seção |
| key | varchar | sim | Chave |
| value | text | não | Valor |

### security_ip_rules
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| ip_address | varchar(45) | sim | IP bloqueado |
| rule_type | varchar(10) | sim | 'BAN' |
| expires_at | datetime | não | NULL = permanente |
| created_at | datetime | sim | Data de criação |

### audit_logs
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| user_id | int | sim | FK → admin_users.id |
| action | varchar | sim | Ação (ex: NEXUS_BREACH_ATTEMPT) |
| details | text | não | Detalhes |
| ip_address | varchar(45) | sim | IP de origem |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### system_broadcasts
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| is_active | tinyint | sim | Broadcast ativo? |
| target_roles | json | não | Roles alvo (ex: ["licenciada"]) |

### system_broadcast_logs
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| broadcast_id | int | sim | FK → system_broadcasts.id |
| user_id | int | sim | ID do usuário alvo |
| user_type | varchar | sim | 'licenciada' |

### lms_modules
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| title | varchar | sim | Título do módulo |
| description | text | não | Descrição |
| cover_image | varchar | não | URL da imagem de capa |
| display_order | int | não | Ordem de exibição |
| is_active | tinyint | não | 1 = ativo |

### lms_lessons
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| module_id | int | sim | FK → lms_modules.id |
| title | varchar | sim | Título da aula |
| description | text | não | Descrição |
| video_type | varchar | não | 'hostinger' |
| video_ref | varchar | não | Referência do vídeo |
| hls_path | varchar | não | Caminho HLS |
| duration_seconds | int | não | 0 | Duração em segundos |
| thumbnail_ref | varchar | não | Thumbnail |
| display_order | int | não | Ordem de exibição |
| is_active | tinyint | não | 1 = ativa |
| file_path | varchar | não | Caminho interno do arquivo |
| attachment_count | int | não | 0 | Contagem de anexos |
| last_modified_by | int | não | FK → admin_users.id |
| last_modified_at | datetime | não | Última modificação |
| created_at | datetime | sim | CURRENT_TIMESTAMP | Criação |

### lms_quizzes
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| module_id | int | sim | FK → lms_modules.id |
| title | varchar | sim | Título da avaliação |
| min_score | int | não | 70 | Nota mínima para aprovação |
| created_at | datetime | sim | CURRENT_TIMESTAMP |
| updated_at | datetime | sim | CURRENT_TIMESTAMP ON UPDATE |

### lms_questions
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| quiz_id | int | sim | FK → lms_quizzes.id |
| question_text | text | sim | Enunciado |
| question_type | varchar | não | 'multiple_choice' |
| order_index | int | não | Ordem |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### lms_question_options
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| question_id | int | sim | FK → lms_questions.id |
| option_text | text | sim | Texto da opção |
| is_correct | tinyint | não | 0 | É a correta? |
| order_index | int | não | Ordem |

### lms_quiz_attempts
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| quiz_id | int | sim | FK → lms_quizzes.id |
| licenciada_id | int | sim | FK → licenciadas.id |
| score | decimal(5,2) | não | 0 | Pontuação |
| passed | tinyint | não | 0 | Aprovado? |
| answers | json | não | Respostas |
| attempted_at | datetime | sim | CURRENT_TIMESTAMP |

### lms_certificates
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| licenciada_id | int | sim | FK → licenciadas.id |
| module_id | int | sim | FK → lms_modules.id |
| hash_code | varchar(64) | sim | Hash SHA-256 |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### lms_attachments
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| lesson_id | int | sim | FK → lms_lessons.id |
| title | varchar | sim | Nome |
| file_type | varchar | não | MIME |
| file_path | varchar | não | Caminho |
| is_downloadable | tinyint | não | 1 | Downloadável? |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### lms_resources
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| title | varchar | sim | Título |
| description | text | não | Descrição |
| file_type | varchar | não | MIME |
| file_path | varchar | não | Caminho |
| status | varchar | não | 'pending' | pending|approved|rejected |
| is_active | tinyint | não | 1 | Ativo? |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### lms_resource_access
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| resource_id | int | sim | FK → lms_resources.id |
| licenciada_id | int | sim | FK → licenciadas.id |
| granted_at | datetime | não | CURRENT_TIMESTAMP |

### mentors
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| name | varchar | sim | Nome |
| nickname | varchar | não | Apelido |
| role | varchar | não | Cargo |
| bio | text | não | Bio |
| photo_url | varchar | não | Foto |
| instagram | varchar | não | Instagram |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### site_config
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| config_key | varchar | sim | Chave |
| config_value | text | não | Valor |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### system_broadcasts
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| title | varchar | sim | Título |
| message | text | sim | Mensagem |
| target_roles | json | não | Roles alvo |
| is_active | tinyint | não | 1 | Ativo? |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### system_broadcast_logs
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| broadcast_id | int | sim | FK → system_broadcasts.id |
| user_id | int | sim | ID do usuário |
| user_type | varchar | sim | Tipo |
| read_at | datetime | não | Lido em |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### site_content
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| section | varchar | sim | Seção |
| key | varchar | sim | Chave |
| value | text | não | Valor |

### faq
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| question | text | sim | Pergunta |
| answer | text | sim | Resposta |
| category | varchar | não | Categoria |
| display_order | int | não | Ordem |
| active | tinyint | não | 1 | Ativo? |

### lms_access_logs
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| licenciada_id | int | não | FK → licenciadas.id |
| admin_id | int | não | FK → admin_users.id |
| action | varchar | sim | Ação |
| ip_address | varchar(45) | não | IP |
| user_agent | text | não | User-Agent |
| metadata | json | não | Metadados |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### storage_files
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| file_name | varchar | sim | Nome |
| file_type | varchar | não | MIME |
| file_size | bigint | não | 0 | Bytes |
| media_category | varchar | não | Categoria |
| width | int | não | Largura |
| height | int | não | Altura |
| hash | varchar(64) | não | SHA-256 |
| access_count | int | não | 0 | Acessos |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### bot_cadastro_staging
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| status | varchar | sim | pending|approved|rejected |
| data | json | não | Dados |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### leads
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| name | varchar | sim | Nome |
| whatsapp | varchar | não | WhatsApp |
| email | varchar | não | E-mail |
| source | varchar(50) | não | 'site' | Origem do lead |
| status | varchar | não | 'new' | new|contacted|qualified|
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### ai_clinical_cases
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| license_id | int | sim | FK → lms_licenses.id |
| licenciada_id | int | sim | FK → licenciadas.id |
| case_title | varchar | sim | Título |
| case_description | text | não | Descrição |
| photo_path | varchar | não | Caminho da foto |
| doctor_harmony_response | text | não | Resposta IA |
| confidence_score | decimal(5,2) | não | 0 | Confiança |
| needs_review | tinyint | não | 0 | Precisa revisão? |
| mentor_feedback | text | não | Feedback mentor |
| mentor_id | int | não | FK → admin_users.id |
| status | varchar | não | 'ANALYZED' | ANALYZED|PENDING|REVIEWED |
| is_admin_test | tinyint | não | 0 | Teste admin? |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### ai_mentorship_logs
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| license_id | int | sim | FK → lms_licenses.id |
| interaction_type | varchar | sim | VISION|TEXT|WIDGET_EVENT |
| image_path | varchar | não | Caminho |
| created_at | datetime | sim | CURRENT_TIMESTAMP |

### ai_mentorship_sessions
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| licenciada_id | int | sim | FK → licenciadas.id |
| session_data | json | não | Dados da sessão |
| last_interaction | datetime | sim | CURRENT_TIMESTAMP ON UPDATE |

### ai_config
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | sim | Chave primária |
| config_key | varchar | sim | Chave (UNIQUE) |
| config_value | text | não | Valor |
| updated_at | datetime | sim | CURRENT_TIMESTAMP ON UPDATE |
