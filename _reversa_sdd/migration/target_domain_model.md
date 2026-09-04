---
schemaVersion: 1
generatedAt: 2026-06-02T21:20:00-03:00
reversa:
  version: "1.2.43"
kind: target_domain_model
producedBy: designer
hash: "sha256:d2e3f4a5b6c7"
---

# Target Domain Model

> Modelo de domínio do sistema novo. Rastreabilidade explícita para o legado (em `_reversa_sdd/domain.md`).

## Aggregates

### AGG-AdminSession
- **Aggregate root**: AdminSession
- **Invariantes**:
  - Token SHA256 único por sessão
  - Sessão expira em 6h (24h para superadmin)
  - Apenas um admin pode ter múltiplas sessões ativas simultâneas
- **Comandos aceitos**: login, logout, validate, refresh
- **Origem no legado**: `domain.md` § RN-06, `code-analysis.md` § Auth

### AGG-Licenciada
- **Aggregate root**: Licenciada
- **Invariantes**:
  - CPF, Email, WhatsApp únicos
  - max_devices = 2
  - Device FIFO: se atingir limite, expulsa o mais antigo
  - Senha padrão Mudar123! com force_password_change na criação
- **Comandos aceitos**: create, update, changePassword, manageDevices, getDashboard
- **Origem no legado**: `domain.md` § RN-03, RN-07, `licenciada/requirements.md`

### AGG-Aluna
- **Aggregate root**: Aluna
- **Invariantes**:
  - Token prefixado com 'al_'
  - max_devices = 1 (padrão)
  - Só vê módulos com aluna_course_access ativo (expires_at > now)
- **Comandos aceitos**: login, listModules, saveProgress, signUrl, getCertificate
- **Origem no legado**: `domain.md` § RN-05, `aluna/requirements.md`

### AGG-Module (LMS)
- **Aggregate root**: Module
- **Invariantes**:
  - Strict Progression Lock: módulo N+1 bloqueado até quiz N aprovado (score >= min_score)
  - min_score padrão = 70
  - Quiz questões e opções embaralhadas por tentativa
- **Comandos aceitos**: createModule, addLesson, addQuiz, submitAttempt, checkProgression
- **Eventos publicados**: ModuleCompleted, QuizPassed, CertificateEligible
- **Origem no legado**: `domain.md` § Strict Progression, `lms/requirements.md`

### AGG-ClinicalCase (DoctorHarmony)
- **Aggregate root**: ClinicalCase
- **Invariantes**:
  - Créditos de IA consumidos por análise (admin tem bypass)
  - LGPD consent obrigatório antes de enviar dados pessoais
  - Crisis detection: palavras de desistência → PENDING + needs_review
  - Hybrid Review: confidence < 0.80 → revisão humana obrigatória
- **Comandos aceitos**: submitCase, reviewCase, getCredits, getSession
- **Eventos publicados**: CaseAnalyzed, CrisisDetected, HumanReviewRequired
- **Origem no legado**: `domain.md` § Hybrid Review, Crisis Alert, `doctor-harmony/requirements.md`

### AGG-Broadcast
- **Aggregate root**: Broadcast
- **Invariantes**:
  - Filtrado por target_roles (JSON array)
  - Expira após 7 dias
  - is_blocking = banner no topo com acknowledge obrigatório
  - Deleção em transação (broadcast + logs)
- **Comandos aceitos**: create, acknowledge, delete, getActive, getHistory
- **Origem no legado**: `broadcast/requirements.md`

### AGG-NexusRule (Firewall)
- **Aggregate root**: NexusRule
- **Invariantes**:
  - Tipo: BAN, ALLOW, SUSPICIOUS com duração opcional
  - Auditoria obrigatória em toda operação CRUD
  - PURGE_DEVICES remove inativos >30 dias; CLEAN_LOGS >90 dias
- **Comandos aceitos**: addRule, removeRule, audit, maintenance
- **Origem no legado**: `nexus/requirements.md`

## Entidades

| Entidade | Aggregate dono | Atributos principais | Origem no legado |
|---|---|---|---|
| AdminUser | AGG-AdminSession | id, username, password_hash, role | admin_users |
| Licenciada | AGG-Licenciada | id, name, cpf, email, password_hash, max_devices, lgpd_status | licenciadas |
| LicenciadaDevice | AGG-Licenciada | id, licenciada_id, device_token, fingerprint_hash, is_active | licenciada_devices |
| Aluna | AGG-Aluna | id, name, cpf, email, password_hash, max_devices | alunas |
| AlunaDevice | AGG-Aluna | id, aluna_id, device_token, is_active | aluna_devices |
| AlunaCourseAccess | AGG-Aluna | id, aluna_id, module_id, expires_at | aluna_course_access |
| AlunaProgress | AGG-Aluna | id, aluna_id, lesson_id, progress_percent, is_completed | aluna_progress |
| Module | AGG-Module | id, title, display_order, is_active | lms_modules |
| Lesson | AGG-Module | id, module_id, title, video_url, duration | lms_lessons |
| Quiz | AGG-Module | id, module_id, min_score | lms_quizzes |
| QuizAttempt | AGG-Module | id, quiz_id, user_id, score, passed | lms_quiz_attempts |
| ClinicalCase | AGG-ClinicalCase | id, licenciada_id, photo, notes, confidence, status | ai_clinical_cases |
| ClinicalReview | AGG-ClinicalCase | id, case_id, mentor_id, feedback, reviewed_at | ai_clinical_reviews |
| Broadcast | AGG-Broadcast | id, title, message, type, target_roles, is_blocking, expires_at | system_broadcasts |
| BroadcastLog | AGG-Broadcast | id, broadcast_id, user_id, read_at | system_broadcast_logs |
| NexusRule | AGG-NexusRule | id, ip_address, rule_type, reason, expires_at | nexus_security_rules (partial) |

## Value objects

| Value object | Atributos | Validações | Origem |
|---|---|---|---|
| Email | address | formato email válido | leads, licenciada |
| CPF | number | 11 dígitos, validação dígito verificador | licenciada |
| Phone | number | apenas dígitos, sanitizado | leads, licenciada |
| DeviceFingerprint | hash | SHA-256 do device UA + IP | auth |
| SignedUrl | url, expiresAt | HMAC SHA-256, TTL 1h | aluna, LMS |
| Confidence | score (0-1) | entre 0 e 1 | doctor-harmony |
| Role | value | admin, superadmin, editor, licenciada, aluna | auth |

## Regras de domínio

| Regra (ID) | Local no domínio novo | Origem (target_business_rules.md) |
|---|---|---|
| BR-MIGRAR-001 | AGG-AdminSession.invariante: senha >= 6 | BR-MIGRAR-001 |
| BR-MIGRAR-002 | AGG-AdminSession → ThrottleService | BR-MIGRAR-002 |
| BR-MIGRAR-003 | AGG-Licenciada.invariante: max_devices FIFO | BR-MIGRAR-003 |
| BR-MIGRAR-004 | AuthService.impersonate() | BR-MIGRAR-004 |
| BR-MIGRAR-007 | AGG-Licenciada.invariante: force_password_change | BR-MIGRAR-007 |
| BR-MIGRAR-009 | AGG-Aluna → AlunaCourseAccess scope | BR-MIGRAR-009 |
| BR-MIGRAR-022 | AGG-Module.invariante: Strict Progression Lock | BR-MIGRAR-022 |
| BR-MIGRAR-027 | AGG-ClinicalCase → LicenseService | BR-MIGRAR-027 |
| BR-MIGRAR-028 | AGG-ClinicalCase.invariante: CrisisDetection | BR-MIGRAR-028 |
| BR-MIGRAR-029 | AGG-ClinicalCase.invariante: LGPD consent | BR-MIGRAR-029 |
| BR-MIGRAR-030 | AGG-ClinicalCase.invariante: HybridReview < 0.80 | BR-MIGRAR-030 |
| BR-MIGRAR-032 | AGG-NexusRule.invariante: tipo BAN/ALLOW/SUSPICIOUS | BR-MIGRAR-032 |
| BR-MIGRAR-038 | AGG-Broadcast.invariante: target_roles | BR-MIGRAR-038 |
| BR-MIGRAR-040 | AGG-Broadcast.invariante: is_blocking banner | BR-MIGRAR-040 |
| BR-MIGRAR-042 | AGG-Broadcast.invariante: expira 7 dias | BR-MIGRAR-042 |
| BR-MIGRAR-043 | Analytics → AnomalyDetectionService | BR-MIGRAR-043 |
| BR-MIGRAR-048 | Leads → LeadStatus enum (new/contacted/converted/closed) | BR-MIGRAR-048 |

## Rastreabilidade para o legado

| Elemento novo | Origem no legado | Tipo de mapeamento |
|---|---|---|
| AGG-AdminSession | `domain.md` § Admin + `code-analysis.md` § Auth | fundido |
| AGG-Licenciada | `domain.md` § Licenciada | 1-para-1 |
| AGG-Aluna | `domain.md` § Aluna | 1-para-1 |
| AGG-Module | `domain.md` § Strict Progression + `lms/requirements.md` | fundido |
| AGG-ClinicalCase | `domain.md` § Doctor Harmony + Hybrid Review | fundido |
| AGG-Broadcast | `broadcast/requirements.md` | 1-para-1 |
| AGG-NexusRule | `nexus/requirements.md` § Firewall | preservado |
| LeadStatus enum | `leads/requirements.md` § Transições de status | novo (explícito) |
