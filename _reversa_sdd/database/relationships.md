# Relacionamentos do Banco de Dados

> **Gerado pelo Data Master** — 🟢 CONFIRMADO via DDL e migrations

---

## Relacionamentos 1:N

| Tabela Pai | Tabela Filha | FK | Cardinalidade |
|-----------|-------------|-----|---------------|
| admin_users | admin_sessions | user_id | 1:N |
| admin_users | admin_nudges | (licenciada_id → licenciadas) | 1:N via nudge |
| admin_users | lms_modules | last_modified_by | 1:N |
| admin_users | lms_lessons | last_modified_by | 1:N |
| admin_users | lms_resources | created_by / approved_by | 1:N |
| admin_users | script_executions | executed_by | 1:N |
| admin_users | nexus_security_rules | updated_by | 1:N |
| admin_users | ai_clinical_cases | mentor_id | 1:N |
| licenciadas | licenciada_devices | licenciada_id (CASCADE) | 1:N |
| licenciadas | lms_progress | licenciada_id | 1:N |
| licenciadas | lms_quiz_attempts | licenciada_id | 1:N |
| licenciadas | lms_certificates | licenciada_id | 1:N |
| licenciadas | lms_user_badges | user_id | 1:N |
| licenciadas | lms_points_log | user_id | 1:N |
| licenciadas | lms_resource_access | licenciada_id | 1:N |
| licenciadas | admin_nudges | licenciada_id | 1:N |
| licenciadas | ai_clinical_cases | license_id / licenciada_id | 1:N |
| licenciadas | ai_mentorship_logs | license_id | 1:N |
| licenciadas | magic_tokens | licenciada_id (CASCADE) | 1:N |
| licenciadas | results | licenciada_id | 1:N |
| alunas | aluna_devices | aluna_id (CASCADE) | 1:N |
| alunas | aluna_course_access | aluna_id (CASCADE) | 1:N |
| alunas | aluna_progress | aluna_id (CASCADE) | 1:N |
| alunas | aluna_certificates | aluna_id (CASCADE) | 1:N |
| lms_modules | lms_lessons | module_id | 1:N |
| lms_modules | lms_quizzes | module_id | 1:N |
| lms_modules | lms_certificates | module_id | 1:N |
| lms_modules | aluna_course_access | module_id (CASCADE) | 1:N |
| lms_lessons | lms_attachments | lesson_id | 1:N |
| lms_lessons | lms_progress | lesson_id | 1:N |
| lms_lessons | aluna_progress | lesson_id (CASCADE) | 1:N |
| lms_quizzes | lms_questions | quiz_id | 1:N |
| lms_quizzes | lms_quiz_attempts | quiz_id | 1:N |
| lms_questions | lms_question_options | question_id | 1:N |
| lms_badges | lms_user_badges | badge_id | 1:N |
| lms_resources | lms_resource_access | resource_id | 1:N |
| bot_support_tickets | support_feedback | ticket_id (CASCADE) | 1:N |

## Relacionamentos 1:1

| Tabela | Coluna | Referência | Descrição |
|--------|--------|-----------|-----------|
| bot_sessions | chat_id | (único) | Um chat_id = uma sessão |

## Relacionamentos N:M (via tabela de junção)

| Entidade A | Tabela Junção | Entidade B | Descrição |
|-----------|--------------|-----------|-----------|
| licenciadas | lms_user_badges | lms_badges | Licenciadas conquistam badges |
| licenciadas | lms_resource_access | lms_resources | Licenciadas acessam recursos |
| alunas | aluna_course_access | lms_modules | Alunas acessam módulos |

## Tabelas sem FK (órfãs por design)

| Tabela | Motivo |
|--------|--------|
| auth_logs | Logs de autenticação (referenciais por email) |
| audit_logs | Auditoria genérica (user_id + user_type textuais) |
| leads | Leads do site (independentes) |
| faq | Conteúdo estático |
| gallery_images | Conteúdo institucional |
| testimonials | Conteúdo institucional |
| site_config | Chave-valor global |
| system_broadcasts | Comunicados independentes |
| media_files | Mídia referenciada por path |
