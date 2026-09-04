# Code Analysis — Body-Harmony-Remake

> Gerado pelo Archaeologist em 2026-06-02
> Confiança: 🟢 CONFIRMADO | 🟡 INFERIDO | 🔴 LACUNA

## Módulo: Auth (Autenticação)

### Arquivos analisados
- `api/v1/Core/Auth.php` (helper estático)
- `api/v1/Core/AuthMiddleware.php` (middleware, firewall, validação de token)
- `api/v1/Core/JWT.php` (JWT helper)
- `api/v1/Core/NexusGuard.php` (gatekeeper superadmin)
- `api/v1/Controllers/AuthController.php` (login admin, login licenciada, troca de senha)
- `api/v1/Controllers/AlunaAuthController.php` (login aluna, validação, troca de senha)
- `api/v1/Services/MagicTokenService.php` (magic link para licenciadas)
- `api/v1/libs/RiskEngineService.php` (detecção de risco comportamental)

### Fluxo de Controle

#### 1. Autenticação Admin (POST /auth/login)
```
input: { username, password }
→ busca em admin_users por username
→ password_verify() com bcrypt
→ sessão: INSERT em admin_sessions (token, expira em 6h)
→ retorna: { token, user: { id, username, role } }
```

#### 2. Autenticação Licenciada (POST /auth/licenciada/login)
```
input: { login, password, device_token? }
→ checkThrottling() — 3 níveis de proteção:
  a) Regras dinâmicas via nexus_security_rules (MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION)
  b) Account-based: 5 falhas → lockout
  c) IP-based: 50 falhas → lockout
→ busca por CPF (11 dígitos) → email/username → admin fallback
→ verifica locked_until
→ password_verify() com bcrypt
→ RiskEngineService: fingerprint, score comportamental
→ Device Management (FIFO):
  a) Reusa device existente por token ou fingerprint
  b) Se novo: verifica max_devices, expulsa o mais antigo se necessário
  c) ON DUPLICATE KEY para race conditions
→ Logging: auth_logs + LoggerService
→ Consentimento LGPD
→ Background: 5% de chance de purgar logs antigos
```

#### 3. Autenticação Aluna (POST /auth/aluna/login)
```
input: { login, password, device_token? }
→ checkThrottling()
→ busca CPF → email
→ password_verify()
→ Device Management FIFO (max_devices: padrão 1)
→ Token prefixado `al_` + bin2hex(random_bytes(30))
```

#### 4. Middleware Genérico (AuthMiddleware::handle)
```
→ Nexus Firewall: verifica BAN em SQLite + MySQL
→ Extrai token (Authorization Bearer | X-Device-Token | X-ALUNA-TOKEN)
→ validateToken():
  a) admin_sessions (Bearer)
  b) licenciada_devices (device_token)
  c) aluna_devices (al_* prefix)
→ Role verification (admin, student, licenciada)
→ Injeta $loggedUser global
```

#### 5. Nexus Guard (NexusGuard::handle)
```
→ Extrai Bearer
→ Valida em admin_sessions
→ Enforce Superadmin (role='superadmin' OR id=5 hardcoded)
→ Log breach em audit_logs
```

### Algoritmos

#### Throttling (checkThrottling)
- Regras dinâmicas via `nexus_security_rules` (MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION, WHITELIST_IPS)
- Dual-layer: account-based (5 tentativas) + IP-based (50 tentativas)
- Whitelist bypass para IPs confiáveis

#### Fingerprint-based Device Reuse
- RiskEngine gera fingerprint hash do dispositivo
- Na autenticação, tenta reusar device existente pelo fingerprint antes de criar novo
- Evita proliferação de registros de dispositivos

#### FIFO Session Kicker
```
if activeCount >= limit:
  while activeCount >= limit:
    find OLDEST active device → is_active = 0
```

### Estruturas de Dados

#### Tables utilizadas:
- `admin_users`: id, username, password_hash, role
- `admin_sessions`: id, user_id, token, expires_at, is_active
- `licenciadas`: id, name, cpf, email, username, password_hash, is_active, max_devices, force_password_change, locked_until, failed_login_attempts, last_login_at, lgpd_status, last_active_lesson_id
- `licenciada_devices`: id, licenciada_id, device_token, user_agent, ip_address, fingerprint_hash, is_active, last_used_at
- `alunas`: id, name, cpf, email, password_hash, is_active, max_devices, force_password_change, locked_until, failed_login_attempts, last_login_at
- `aluna_devices`: id, aluna_id, device_token, user_agent, ip_address, is_active, last_used_at
- `auth_logs`: id, user_id, email, ip_address, user_agent, status, risk_score, risk_details, created_at
- `nexus_security_rules`: id, rule_key, rule_value, is_active
- `security_ip_rules`: id, ip_address, rule_type, expires_at
- `audit_logs`: id, user_id, action, details, ip_address, created_at

---

## Módulo: Aluna (Portal Individual V68)

### Arquivos analisados
- `api/v1/Controllers/AlunaAuthController.php` (274 linhas)
- `api/v1/Controllers/AlunaLmsController.php` (375 linhas)
- `api/v1/Controllers/AdminAlunaController.php`

### Fluxo de Controle

#### AlunaLmsController::guardAluna (Middleware interno)
```
→ Valida X-ALUNA-TOKEN (prefixo `al_`)
→ Busca em aluna_devices + alunas (INNER JOIN)
→ Injeta $loggedAluna global
```

#### AlunaLmsController::modules (GET /aluna/modules)
```
→ Join: aluna_course_access → lms_modules → lms_lessons → aluna_progress
→ Filtra: is_active, expires_at > NOW()
→ Calcula: total_lessons, completed_lessons, progress_percent
→ Retorna módulos com progresso
```

#### AlunaLmsController::catalog (GET /aluna/catalog)
```
→ Todos módulos ativos
→ Subquery: verifica se aluna tem acesso (has_access boolean)
```

#### AlunaLmsController::saveProgress (POST /aluna/progress)
```
→ UPSERT em aluna_progress
→ Se completou: marca completion_date
```

#### AlunaLmsController::signUrl (POST /aluna/sign-url)
```
→ Verifica acesso via aluna_course_access
→ Se HLS: retorna URL pública
→ Se MP4: gera URL assinada HMAC (válida 1h)
```

#### AlunaLmsController::certificate (GET /aluna/certificate/{module_id})
```
→ Verifica se todas aulas concluídas (>=80%)
→ Gera hash_code verificável
→ INSERT em aluna_certificates
```

### Estruturas de Dados (adicionais)
- `aluna_course_access`: id, aluna_id, module_id, granted_at, expires_at, granted_by
- `aluna_progress`: id, aluna_id, lesson_id, progress_percent, is_completed, last_watched_at, completion_date
- `aluna_certificates`: id, aluna_id, module_id, hash_code, created_at

---

## Módulo: Licenciada (Licenciada/Student)

### Arquivos analisados
- `api/v1/Controllers/LicenciadasController.php` (566 linhas)
- `api/v1/licenciada/dashboard_summary.php` (140 linhas)
- `api/v1/licenciada/progress.php` (164 linhas)
- `api/v1/licenciada/lessons.php`

### Fluxo de Controle

#### LicenciadasController::store (POST /api/v1/licenciadas)
```
validation: name obrigatório
→ CPF sanitization (remove non-digits)
→ Email fallback se vazio: baseado em CPF ou uniqid
→ INSERT: 16 colunas (name, state, location, photo_url, whatsapp, instagram, ...)
→ Password: se enviado → bcrypt; senão → hash padrão (Mudar123!)
→ Photo upload: handleUpload() com renomeação por ID_Nome_CPF
→ Logging: tb_system_logs
```

#### LicenciadasController::update (PUT /api/v1/licenciadas/{id})
```
→ Dynamic field mapping (somente campos enviados)
→ Renaming Logic: se name/CPF mudou, renomeia foto no filesystem
→ SanitizeFilename: remove acentos → ASCII
```

#### Licenciada Dashboard (GET /api/v1/licenciada/dashboard-summary)
```
→ Token resolution (X-Device-Token → Authorization → loggedUser)
→ Stats: started_lessons, completed_lessons, total_seconds
→ Next Lesson: last_active_lesson_id → primeira aula incompleta
→ Signals: unread broadcasts count
→ Resources: featured approved resources
```

#### Progress (GET /api/v1/licenciada/progress)
```
→ Token resolution (multi-fallback)
→ Completa: calcula percentual global
→ V97 Anomaly Detection: zero progress → verifica schema lms_progress
→ Next Goal: primeiro módulo incompleto
```

### Algoritmos

#### Photo Rename on Update
```
Se nome ou CPF mudou:
  extrai extensão do arquivo atual
  gera novo nome: {id}_{name_sanitized}_{cpf}.{ext}
  rename() no filesystem
  atualiza photo_url no banco
```

#### Token Resolution (multi-fallback)
```
1. X-Device-Token header
2. Authorization Bearer 
3. $loggedUser global (apenas se não for admin)
```

---

## Módulo: Admin (Administração)

### Arquivos analisados
- `api/v1/Core/Response.php` — resposta JSON padronizada
- `api/v1/Core/ResponseCache.php` — cache file-based com stale-while-revalidate
- `api/v1/Core/NexusLogger.php` — logging estruturado com sanitização
- `api/v1/Core/NexusErrorHandler.php` — handler de erros padronizado
- `api/v1/Core/NexusSQLite.php` — SQLite para admin (audit, firewall, cache)
- `api/v1/Core/NexusGuard.php` — gatekeeper superadmin
- `api/v1/Core/Router.php` — roteador centralizado
- `api/v1/Core/db.php` — helper de conexão
- `api/v1/Core/LogCleaner.php` — limpeza de logs
- `api/v1/Controllers/AdminController.php` — administração de usuários
- `api/v1/Controllers/AdminAlunaController.php` — admin de alunas
- `api/v1/Controllers/AdminLmsController.php` — admin do LMS
- `api/v1/Controllers/AdminDoctorHarmonyController.php` — admin da IA clínica
- `api/v1/Controllers/AnalyticsController.php` — analytics
- `api/v1/Controllers/SessionController.php` — gerenciamento de sessões
- `api/v1/Controllers/BroadcastController.php` — broadcast/notificações
- `api/v1/Controllers/MediaController.php` — gerenciamento de mídia
- `api/admin/engine/cache_manager.php` — gerenciamento de cache
- `api/admin/engine/feature_flags.php` — feature flags (maintenance_mode)
- `api/admin/watchtower/core.php` — monitoramento de segurança
- `api/admin/analytics/` — analytics de watchtower
- `api/admin/signal_tower/` — sistema de broadcast
- `api/admin/vault/` — gerenciamento de FAQ
- `api/admin/war_room/` — analytics central

### Fluxo de Controle

#### Response (Response::json)
```
→ ob_clean() se buffer existir
→ http_response_code(status)
→ Header: Content-Type application/json
→ echo json_encode (UNICODE + SLASHES)
→ exit
```

#### ResponseCache (Stale-While-Revalidate)
```
→ serve(key, callback, ttl, isPublic):
  → Tenta ler cache do filesystem
  → Se cache fresco: retorna dados
  → Se cache stale (expirado): retorna stale, revalida em background
  → Se sem cache: executa callback, salva cache, serve fresh
→ Cache segmentado: público (chave pura) ou privado (chave + token do usuário)
→ Invalidação: clear(key_prefix) deleta do filesystem
```

#### NexusLogger
```
→ log(action, description, details, userType, userId, severity)
→ Sanitização automática de campos sensíveis (password, token, secret)
→ Auto-severity: ERROR se contém "ERROR", WARNING se "FAILED"/"BREACH"
→ INSERT em audit_logs (action, severity, description, details, user_id, user_type, ip_address)
→ Fallback: syslog se banco estiver indisponível
```

#### AdminController::manageUser (Action Router)
```
switch(action):
  ban → is_active = 0
  unban → is_active = 1
  reset_lifecycle → force_password | revoke_lgpd | clear_devices | clear_throttling | max_devices
  clear_devices → DELETE licenciada_devices
  create → INSERT licenciada
  reset_password → novo hash + force_password_change=1
  delete → DELETE licenciada
```

#### Feature Flags
```
GET /admin/engine/feature_flags:
  → Lê maintenance_mode de site_config
  → Retorna { maintenance_mode: bool }

POST /admin/engine/feature_flags:
  → Atualiza com UPSERT em site_config
```

#### Watchtower (Monitoramento)
```
GET /admin/watchtower:
  → Active sessions (últimos 15 min)
  → Credential sharing detection (mesmo usuário, IPs diferentes)
  → Recent logs feed (últimos 50)
```

### Entidades (adicionais)

- `site_config`: config_key, config_value — chave/valor para configurações
- `audit_logs`: id, action, severity, description, details, user_id, user_type, ip_address, created_at
- `lms_access_logs`: id, student_id, ip_address, action, created_at
- `tb_system_logs`: id, log_type, message, context, user_id, created_at

### Algoritmos

#### ResponseCache V2
- Cache em arquivos JSON no filesystem (LOGS_DIR/cache/ ou /tmp/)
- Stale-While-Revalidate: serve dado expirado enquanto revalida
- Segmentação: público (chave pura) vs privado (chave + token do usuário)
- Invalidação por prefixo: clear('gestor_licenciadas_list_') limpa todos caches relacionados
- TTL padrão: 30 min (Stability Shield)

#### NexusSQLite Dual-Engine
- Prioriza SQLite para admin (zero conexões MySQL)
- Se pdo_sqlite indisponível: degrada para MySQL com mesma interface
- Armazena: nexus_audit_ops, security_ip_rules, nexus_cache

#### Credential Sharing Detection
```
SELECT user, COUNT(DISTINCT ip)
FROM access_logs
WHERE created_at >= NOW() - 60min
GROUP BY user HAVING ip_count > 1
```

---

## Módulo: LMS (Learning Management System)

> Confiança: 🟢 CONFIRMADO
> Arquivos: Controllers/LmsController.php, Controllers/AdminLmsController.php, Controllers/QuizController.php, libs/ResourceService.php

### Visão Geral
Sistema completo de ensino à distância com módulos, aulas, quizzes, certificados, biblioteca de recursos e progressão bloqueada entre módulos.

### Estrutura de Dados
```
lms_modules (1) ──→ lms_lessons (N)
                   lms_lessons (1) ──→ lms_attachments (N)
lms_modules (1) ──→ lms_quizzes (1)
                   lms_quizzes (1) ──→ lms_questions (N)
                                      lms_questions (1) ──→ lms_question_options (N)
                                      lms_quiz_attempts (N) ── licenciadas
lms_certificates ── licenciadas, lms_modules
lms_resources ── lms_resource_access ── licenciadas
```

### Endpoints Públicos (Licenciada)

#### GET /lms/modules
- Cached via ResponseCache (`api_lms_modules_{userId}`, 300s, privado)
- Single query com LEFT JOIN para modules + lessons + progress
- Monta árvore modules[] → lessons[] com progress_percent e is_completed

#### GET /lms/modules/{id}/lessons
- Valida módulo existe
- **Strict Progression Check (Phase 4)**: se módulo anterior tem quiz, precisa ter passado para desbloquear
- Retorna lessons com attachments, quiz status e certificate_available
- Falha no progression check é logada e ignorada (stabilization bypass)

#### POST /lms/progress
- Atualiza `licenciadas.last_active_lesson_id` para o Dashboard Bento
- UPSERT em `lms_progress`: UPDATE se existe, INSERT se não
- Loga PLAY (primeiro acesso) e LESSON_COMPLETE (transição de estado)
- Invalida cache `api_lms_modules_{userId}` (V76)

#### GET /lms/resources
- Filtra por `lms_resource_access` (licenciada_id)
- Gera signed URLs via ResourceService (HMAC SHA-256, 15min TTL)
- Gera stream URLs para áudio (1h TTL)
- Sanitiza `file_path` da resposta

#### POST /lms/sign-url
- Gera URL assinada para streaming de vídeo `hostinger`
- HMAC SHA-256 com APP_SECRET, 1h expiry
- Caminho: /api/lms/stream.php

### Endpoints Admin LMS

#### GET /admin/lms/dashboard
Métricas agregadas:
- total_students, active_students (30d), lessons_watched, completion_rate
- teaching_hours, new_enrollments (24h), library_count
- chart_data: 7 dias de engajamento semanal

#### CRUD Módulos (index, createModule, updateModule, deleteModule)
- Reorder via PATCH com array de IDs
- Todos invalidam `admin_lms_modules_` cache
- Logam ação em audit_logs como ADMIN_LMS_MODULE_*

#### CRUD Aulas (AdminLmsController)
- Upload de vídeo, thumbnails, HLS
- Reorder via PATCH com array de IDs
- Suporte a attachments por aula

### Quiz System

#### GET /admin/quiz?module_id=X
- Retorna quiz + questions + options completas
- Admin-only (is_admin check)

#### POST /admin/quiz
- Upsert de quiz: cria ou atualiza
- Transação atômica: deleta questions antigas, reinsere novas + options
- min_score default: 70

#### POST /lms/quiz/start
- Cria tentativa de quiz
- Embaralha questões e opções
- Retorna perguntas sem is_correct

#### POST /lms/quiz/submit
- Corrige respostas, calcula score
- Se score >= min_score: marca passed = 1
- Transação atômica

### Progression Lock (Regra de Negócio Crucial)
- **Phase 4**: Módulo N+1 só desbloqueia se módulo N teve quiz e foi aprovado
- Verificação silenciosa (try-catch com error_log em caso de falha)
- Resposta inclui `locked: true` + `locked_reason`

### Fluxo de Certificado
```
POST /lms/certificate/generate
1. Valida module_id
2. Busca quiz do módulo
3. Verifica última tentativa com passed=1
4. Se sem certificado: gera hash SHA-256(user_id + module_id + time + secret)
5. Insere em lms_certificates
6. Gera PDF via SimplePDF::Certify(name, quiz_title, date, hash)
7. Loga evento DOWNLOAD
8. Output D (force download)
```

---

## Módulo: Content (Mentors)

> Confiança: 🟢 CONFIRMADO
> Arquivos: Controllers/ContentController.php

### Visão Geral
CRUD simples para mentores exibidos no site público.

### Endpoints
| Método | Rota | Função |
|--------|------|--------|
| GET | /content/mentors | getMentors() - Lista todos |
| POST | /content/mentors | storeMentor() - Cria |
| PUT | /content/mentors/{id} | updateMentor() - Atualiza |
| DELETE | /content/mentors/{id} | deleteMentor() - Remove |

### Tabela: mentors
- Campos: id, name, nickname, role, bio, photo_url, instagram, created_at
- Renomeia photo_url → photo na resposta

---

## Módulo: Certificate (SimplePDF)

> Confiança: 🟢 CONFIRMADO
> Arquivos: Controllers/CertificateController.php, libs/SimplePDF.php

### Fluxo
1. Valida module_id e existência do quiz
2. Verifica última tentativa com passed=1 (403 se não passou)
3. Gera ou recupera certificado existente (hash SHA-256)
4. Loga DOWNLOAD
5. SimplePDF::Certify(name, quiz_title, date, hash_code)
6. Output como download PDF

### Algoritmo de Hash
```php
hash('sha256', $userId . $moduleId . time() . 'BODY_HARMONY_SECRET')
```

---

## Módulo: Nexus (Superadmin)

> Confiança: 🟢 CONFIRMADO
> Arquivos: admin/auth_nexus.php, admin/vault/faq_manager.php, Core/NexusSQLite.php, Core/NexusLogger.php, Core/NexusErrorHandler.php

### Visão Geral
Sistema superadmin (God Mode) com autenticação exclusiva, IP whitelist, sessões 24h, FAQ management. Opera paralelamente ao sistema admin normal.

### NexusGuard Auth (`admin/auth_nexus.php`)
- **IP Whitelist**: variável de ambiente `NEXUS_ALLOWED_IPS` + localhost
- Bloqueio 403 com log `[NEXUS BLOCKED]` para IPs não autorizados
- Login: valida `admin_users` com role = `superadmin` + password_verify
- Token: `bin2hex(random_bytes(32))` — 24h de validade
- Mensagem de boas-vindas: *"Welcome back, Commander."*
- Resposta de falha: *"Invalid Credentials. Intruder Alert dispatched."*

### NexusSQLite
- Armazena em SQLite local (zero conexões MySQL)
- Degrada para MySQL se pdo_sqlite indisponível
- Tabelas: nexus_audit_ops, nexus_cache, security_ip_rules

### FAQ Manager (`admin/vault/faq_manager.php`)
- Superadmin-only RBAC (`role !== 'superadmin'`)
- CRUD completo em tabela `faq`
- Ações: create, update, delete
- Ordenado por display_order ASC, id ASC

---

## Módulo: Analytics (Watchtower / War Room)

> Confiança: 🟢 CONFIRMADO
> Arquivos: Controllers/AnalyticsController.php, admin/war_room/

### Endpoints

#### GET /admin/analytics/logs (Paginated)
- `lms_access_logs` com JOIN em `licenciadas` e `admin_users`
- Decodifica `metadata` (JSON)
- Parâmetros: page, limit (default 50)

#### GET /admin/analytics/alerts (Security Alerts)
- Detecta compartilhamento de conta via `licenciada_devices`
- Critério: >3 devices OU >2 IPv4 nas últimas 72h
- Ignora: testers (is_tester=0), IPv6 (CGNAT falsos positivos)
- Risk level: >5 devices = CRITICAL, senão HIGH

#### GET /admin/analytics/watchtower
Dashboard completo:
- active_users (24h, 7d, 30d)
- total_licenciadas, lessons_completed, avg_progress
- recent_activity (last 10)
- top_licenciadas (most lessons completed)
- security_alerts (V57 — JOIN único, sem N+1)

#### GET /admin/analytics/war-room
Deep analytics:
- DAU (Daily Active Users) — últimos 30 dias
- Device Stats (Mobile/Desktop/Tablet) por User-Agent
- Churn Risk: licenciadas inativas há >15 dias (limit 50)

#### GET /admin/analytics/bot-stats
- Bot cadastro staging: pending/approved/rejected
- Verifica existência da tabela antes de consultar (graceful fallback)
- Cache: 60s (V95)

---

## Módulo: Broadcast (Signal Tower)

> Confiança: 🟢 CONFIRMADO
> Arquivos: Controllers/BroadcastController.php, admin/signal_tower/broadcasts.php

### Dual-endpoint Architecture
- **Signal Tower** (admin/signal_tower/broadcasts.php): Superadmin cria/toggle/delete
- **BroadcastController** (v1): Rotas para licenciadas e admin via router central

### Endpoints V1

| Método | Rota | Função |
|--------|------|--------|
| GET | /admin/broadcasts | index() - Lista todos |
| GET | /v1/broadcasts/active | getActive() - Não lidos do usuário |
| GET | /v1/broadcasts/history | getHistory() - Últimos 30 |
| POST | /v1/broadcasts/acknowledge | acknowledge() - Marca como lido |
| POST | /admin/broadcasts | manage() - create/toggle |
| DELETE | /admin/broadcasts/{id} | delete() - Com logs |

### Regras de Negócio
- **Target Roles**: broadcast pode ser filtrado por role (licenciada, aluna) via JSON
- **Read Tracking**: `system_broadcast_logs` com INSERT IGNORE (evita duplicatas)
- **Is Blocking**: flag para broadcasts que bloqueiam ação do usuário
- Deleção de broadcast também remove logs associados (transação)

---

## Módulo: Media (Gerenciador de Mídia)

> Confiança: 🟢 CONFIRMADO
> Arquivos: Controllers/MediaController.php

### Visão Geral
Sistema avançado de listagem/filtro de arquivos de mídia com busca fuzzy, paginação, ordenação e multi-filtros.

### Endpoints

#### GET /admin/media/list
Filtros avançados:
- `category`: thumbnail | lesson | resource | profile | other | all
- `search`: fuzzy por file_name
- `date_from`, `date_to`: por data de upload
- `min_size`, `max_size`: por tamanho (bytes)
- `min_width`, `max_width`, `min_height`, `max_height`: por dimensão
- `type`: image | video
- `sort`: created_at | file_size | access_count | file_name
- `order`: asc | desc
- Paginação: page/limit (max 100)

#### POST /admin/media/upload
- Valida tipo de arquivo
- Limite de tamanho via MAX_UPLOAD_SIZE
- Salva em PRIVATE_UPLOADS_DIR
- Registra em media_files (ou storage_files)

#### POST /admin/media/report-unused
- Identifica mídia não referenciada por hash
- Sugere limpeza

#### DELETE /admin/media/cleanup
- Remove arquivos órfãos + registros
- Apenas superadmin

### Algoritmos
- Fuzzy search via LIKE %search%
- Validação MIME type contra lista whitelist
- Media category mapping: determina categoria baseada no contexto de uso

---

## Módulo: Doctor Harmony (Mentoria IA)

> Confiança: 🟢 CONFIRMADO
> Arquivos: Controllers/DoctorHarmonyController.php, Controllers/AdminDoctorHarmonyController.php, libs/GeminiService.php

### Visão Geral
Sistema de mentoria clínica por IA (Gemini Vision) para licenciadas. Envio de fotos/áudio de casos reais com análise multimodal, controle de créditos, e revisão híbrida (IA + mentor humano).

### Endpoints Licenciada

| Método | Rota | Função |
|--------|------|--------|
| GET | /lms/mentor/credits | getCredits() - Saldo + histórico |
| GET | /lms/mentor/history | getHistory() - Chat formatado |
| GET | /lms/mentor/context | getContext() - Contexto da aula atual |
| POST | /lms/mentor/analyze | analyze() - Envio de caso clínico |
| POST | /lms/mentor/log-event | logWidgetEvent() - Eventos do widget |
| GET | /lms/mentor/session | getSession() - Sessão do chat |
| POST | /lms/mentor/session | saveSession() - Salva sessão |

### Endpoints Admin/Nexus

| Método | Rota | Função |
|--------|------|--------|
| GET | /admin/doctor-harmony/config | getConfig() - Config neural |
| POST | /admin/doctor-harmony/config | updateConfig() - Atualiza config |
| GET | /admin/doctor-harmony/audit | getAuditLogs() - Logs de auditoria |
| GET | /admin/doctor-harmony/health | healthCheck() - Status do sistema |
| POST | /admin/doctor-harmony/sandbox | runSandbox() - Teste sem salvar |
| GET | /nexus/doctor-harmony/pending | getPendingCases() - Casos pendentes |
| POST | /nexus/doctor-harmony/review/{id} | submitReview() - Revisão de mentor |

### Fluxo analyze() — Core Business Logic

```
[POST /lms/mentor/analyze]
        |
1. [Valida autenticação + créditos]
        |
2. [Recebe multimodal: file (imagem/áudio) + notes (texto)]
        |
3. [Crisis Alert: varre notes por palavras de desistência]
        |  └── desistir, parar, cancelar, não aguento, muito difícil, estorno
        |
4. [Contextual Enrichment]
        |  ├── LGPD Consent: se ai_usage=true → busca nome + aula atual
        |  └── Se negado → modo anônimo genérico
        |
5. [Chama GeminiService::analyze(file, mime, systemPrompt, userNotes)]
        |  └── SystemPrompt: Nome + LessonContext + BasePrompt + CrisisAlert
        |
6. [Hybrid Review Logic]
        |  ├── Se confidence < threshold (default 0.80) → needs_review=1
        |  └── Se crise → needs_review=1, status=PENDING
        |
7. [Transactional Save: ai_clinical_cases + lms_licenses crédito + ai_mentorship_logs]
        |
8. [Response: {opinion, confidence, needs_review, warnings}]
```

### Regras de Negócio Cruciais
- **Créditos**: baseados em `lms_licenses.ai_credits_total/ai_credits_used`. Admin bypass.
- **LGPD**: requer consentimento `lgpd_status.ai_usage` para dados pessoais
- **Hybrid Review**: confiança < 80% → revisão humana obrigatória
- **Crisis Detection**: palavras de desistência → PENDING + emergency review
- **Fallback de Upload**: PRIVATE_UPLOADS_DIR → sys_get_temp_dir()
- **System Prompt**: carregado de `ai_config` ou fallback arquivo `prompts/system_prompt_clinico.txt`

---

## Módulo: Leads

> Confiança: 🟢 CONFIRMADO
> Arquivos: Controllers/LeadController.php

### Visão Geral
CRUD simples para captura de leads do site público.

### Endpoints
| Método | Rota | Função |
|--------|------|--------|
| GET | /admin/leads | index() - Lista todos |
| POST | /leads (público) | store() - Captura lead |
| PUT | /admin/leads/{id} | update() - Altera status |
| DELETE | /admin/leads/{id} | destroy() - Remove |

### Regras de Negócio
- **Sanitização**: email (FILTER_SANITIZE_EMAIL), name (strip_tags + htmlspecialchars), whatsapp (preg_replace não-dígitos)
- **source**: extraído do campo `message` do frontend (ex: "Capturado via LP Protocolo 3S"), truncado em 50 chars
- **status inicial**: `'new'`

---

## Módulo: Frontend (React SPA)

> Confiança: 🟢 CONFIRMADO
> Tecnologias: React 18, Vite 6, Styled-Components, React Router 6, Zustand (via context), Axios/fetch

### Estrutura de Pastas
```
src/
├── App.jsx — Rotas lazy-loaded + Maintenance Mode + ErrorBoundary
├── main.jsx — Entry point (ReactDOM.createRoot)
├── components/ — Componentes reutilizáveis compartilhados
│   ├── Layout/Layout.jsx, Header/Header.jsx, Footer/Footer.jsx
│   ├── ProtectedRoute/ (RoleGuard, AlunaGuard, LicenciadaGuard, PortalAlunaGuard)
│   ├── MediaBrowser/ (FileBrowserModal, UploadZone, FilterPanel, BulkActionsToolbar)
│   ├── DoctorHarmony/HarmonyActions.jsx
│   ├── Admin/ (ChunkUploader, RichTextEditor)
│   ├── Gallery/ (DraggableImage, DroppableSlot)
│   └── Video/ImgurPlayer.jsx, VideoModal/
├── pages/ — Páginas organizadas por domínio
│   ├── Home/ — Landing page (HomeV2, HeroSectionV2, MethodSectionV2, etc)
│   ├── Portal/ — Área logada licenciada
│   ├── PortalAluna/ — Área logada aluna
│   ├── Admin/ — Admin dashboard + CRUDs
│   ├── LMS/ — ModuleView, LessonPlayer, QuizRunner
│   ├── Nexus/ — Superadmin (Watchtower, WarRoom, SignalTower, Vault, etc)
│   └── Home/Contact/Results/Testimonials — Site público
├── context/ — React Context providers
│   ├── AuthContext.jsx — Login licenciada (JWT + device token)
│   ├── LicenciadaAuthContext.jsx
│   ├── AlunaAuthContext.jsx — Login aluna
│   ├── DataContext.jsx — Cache global de dados
│   ├── SignalContext.jsx — Broadcast signals
│   ├── AudioContext.jsx — Áudio player global
│   └── DynamicThemeWrapper.jsx — Tema dinâmico
├── hooks/
│   ├── useProgressQueue.js — Progresso de vídeo (debounce/batch)
│   ├── useVideoAutoplay.js — Autoplay controlado
│   └── useHomeAssets.js — Assets da home
├── services/
│   ├── api.js — Cliente HTTP central (1109 linhas)
│   └── LMSService.js — Serviço LMS
├── config/ — Configurações
├── styles/ — Estilos globais
├── utils/ — colorUtils.js, configUtils.js
└── i18n/ — Internacionalização
```

### Sistema de Rotas (App.jsx - 243 linhas)
- **Lazy Loading**: todas as páginas com `React.lazy()` + `<Suspense>`
- **ProtectedRoute**: wrapper com RoleGuard (admin, licenciada, aluna)
- **Maintenance Mode**: configurado via `MAINTENANCE_CONFIG`
- Rotas por domínio: site público, portal licenciada, portal aluna, admin, nexus

### Gerenciamento de Estado
- **Auth**: JWT armazenado em localStorage (`bh_auth`, `bh_student`, `bh_device_token`)
- **Device Token**: licenciada sempre usa device token via `localStorage.getItem('bh_device_token')`
- **Memória Cache (Nexus V48)**: `NEXUS_CACHE` com TTL 60s para GETs pesados
- **Context**: React Context para auth, data, signal, audio

### API Service (api.js - 1109 linhas)
- Base URL: `/api`
- **Stability Shield (V100)**: retry automático (2x) com exponential backoff (1s, 2s) para 500/503
- **Cache-aware**: cache em memória para GETs (TTL 60s)
- **Autenticação automática**: detecta rota (admin/licenciada/aluna) e anexa token correto
- Rotas licenciada: usam `bh_device_token`
- Rotas admin: usam `bh_auth` (admin) → fallback `bh_student`

### Páginas por Perfil

| Perfil | Páginas |
|--------|---------|
| **Público** | Home, Mentors, Licenciadas, Contact, ResultsGallery, Testimonials, Workshop |
| **Licenciada** | PortalLogin, Dashboard, MyLessons, LessonPlayer, ModuleView, MentorIA, Profile, Progress, Library, SupportIA, Faq |
| **Aluna** | AlunaLogin, AlunaDashboard, AlunaModuleView, AlunaLessonPlayer, AlunaSupport, AlunaProfile, AlunaCertificates, AlunaForceChangePassword |
| **Admin** | AdminLogin, Dashboard, ContentManager, ImageManager, MentorsManager, ThemeManager, LicenciadasManager, ResultsManager, TestimonialManager, LeadsManager, FaqManager, SiteSettings, AdminLMS (LMSStudio), VisualEditor, AlunaManager, Security Dashboard |
| **Nexus (Superadmin)** | Gatekeeper, NexusHome, Watchtower Dashboard, SignalTower Console, WarRoom Dashboard, EngineRoom (LogViewer, SystemStatus), Vault (Dashboard, FaqEditor), ForensicsLab, AIControlTower, TestingHub, OpsDashboard, ReviewHub (Licenciada, Aluna), Database Dashboard, ScriptsManager |

### Componentes Compartilhados Relevantes
- **MediaBrowser**: FileBrowserModal, UploadZone, FilterPanel, BulkActionsToolbar, ConfirmDialog — sistema completo de gerenciamento de mídia
- **ProtectedRoute**: RoleGuard, AlunaGuard, LicenciadaGuard, PortalAlunaGuard
- **Admin**: ChunkUploader (upload segmentado), RichTextEditor
- **Gallery**: DraggableImage + DroppableSlot (reordenação drag & drop)
- **DoctorHarmony**: HarmonyActions (ações rápidas do widget)
- **Nexus**: ForensicsLogsTable, ErrorModal, NexusBottomNav
