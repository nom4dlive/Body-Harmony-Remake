# Regras de Negócio no Banco de Dados

> **Gerado pelo Data Master** — 🟢 CONFIRMADO via DDL e migrations

---

## Constraints de Integridade

| Tabela | Coluna | Regra | Confiança |
|--------|--------|-------|-----------|
| lms_progress | licenciada_id, lesson_id | UNIQUE KEY — uma licenciada só pode ter um registro de progresso por aula | 🟢 CONFIRMADO |
| aluna_progress | aluna_id, lesson_id | UNIQUE KEY — mesma regra para alunas | 🟢 CONFIRMADO |
| lms_certificates | licenciada_id, module_id | UNIQUE KEY — um certificado por módulo por licenciada | 🟢 CONFIRMADO |
| aluna_certificates | aluna_id, module_id | UNIQUE KEY — mesma regra para alunas | 🟢 CONFIRMADO |
| lms_quiz_attempts | (licenciada_id, quiz_id) | Sem UNIQUE — múltiplas tentativas permitidas | 🟢 CONFIRMADO |
| lms_user_badges | user_id, badge_id | UNIQUE KEY — badge conquistado uma vez | 🟢 CONFIRMADO |
| lms_resource_access | resource_id, licenciada_id | UNIQUE KEY — acesso único por recurso | 🟢 CONFIRMADO |
| aluna_course_access | aluna_id, module_id | UNIQUE KEY — acesso único por módulo | 🟢 CONFIRMADO |
| lms_question_options | (question_id, is_correct=1) | CHECK implícito via application — deve haver ao menos 1 correta | 🟡 INFERIDO |

## Regras de Negócio via DDL

### 1. Score mínimo em quizzes (`lms_quizzes.min_score` DEFAULT 70)
Regra de negócio: licenciada precisa de 70% para passar no quiz.

### 2. JSON Validation (`script_executions.params`, `script_executions.result`)
CHECK constraint: `json_valid(params)` e `json_valid(result)`.

### 3. Max login attempts (`nexus_security_rules.MAX_LOGIN_ATTEMPTS = 3`)
- Account lockout após 3 tentativas falhas
- Duração: 15 minutos (`LOCKOUT_DURATION_MINUTES = 15`)
- Armazenado em `licenciadas.failed_login_attempts` + `licenciadas.locked_until`

### 4. Max devices (`licenciadas.max_devices` DEFAULT 1 + `alunas.max_devices` DEFAULT 1)
Controla quantos dispositivos simultâneos cada perfil pode ter.

### 5. Força de troca de senha (`force_password_change` DEFAULT 1 para alunas, 0 para licenciadas)
Alunas novas recebem senha padrão e precisam trocar no primeiro login.

### 6. LGPD Consent (`lgpd_status`)
Armazenado como JSON (não estruturado) em `licenciadas.lgpd_status` e `alunas.lgpd_status`.

### 7. Chat state machine (`bot_sessions.state`)
Máquina de estados do Telegram Bot. Estados possíveis: idle + estados específicos do fluxo de conversa.

### 8. Broadcast filtering (`system_broadcasts.type`)
Comunicados filtrados por tipo (info, warning, alert). A aplicação filtra por role do usuário (não no schema).

### 9. Certificate hash (`lms_certificates.hash_code`, `aluna_certificates.hash_code`)
SHA-256(user_id + module_id + timestamp + secret) — geração no backend.

### 10. Score Rating (`support_feedback.rating`)
CHECK constraint: rating BETWEEN 1 AND 5.

## Regras Temporais (expiração)

| Tabela | Coluna | Regra |
|--------|--------|-------|
| admin_sessions | expires_at | Token expira em data determinada (backend) |
| magic_tokens | expires_at | Token de auto-login expira (TTL backend) |
| aluna_course_access | expires_at | Acesso opcionalmente expirável |
| licenciadas | locked_until | Lockout temporário após falhas |
| licenciadas | renewal_date | Data de renovação de licença |

## Gatilhos (Triggers)

Nenhum trigger detectado na base atual. Toda lógica de negócio está na camada de aplicação (PHP Controllers) ou nas constraints DDL.

## Stored Procedures / Functions

Nenhuma stored procedure ou função detectada. A aplicação usa PDO com queries preparadas diretamente nos Controllers.
