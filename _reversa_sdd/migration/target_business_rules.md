---
schemaVersion: 1
generatedAt: 2026-06-02T21:12:00-03:00
reversa:
  version: "1.2.43"
kind: target_business_rules
producedBy: curator
hash: "sha256:b3c4d5e6f7a8"
---

# Target Business Rules

> Catálogo das regras de negócio do legado com decisão de migração: MIGRAR, DESCARTAR ou DECISÃO HUMANA.
> Cada item rastreia para a origem em `_reversa_sdd/` e respeita o `paradigm_decision.md`.

## Resumo
- Total de regras analisadas: 56
- MIGRAR: 51
- DESCARTAR: 2 (detalhe em `discard_log.md`)
- DECISÃO HUMANA: 3

## Regras MIGRAR

### Autenticação

#### BR-MIGRAR-001
- **Origem**: `_reversa_sdd/autenticacao/requirements.md` § RN-01
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Senha deve ter pelo menos 6 caracteres para alteração
- **Justificativa de migração**: Regra de segurança fundamental, válida em qualquer stack
- **Compatibilidade com paradigma alvo**: Laravel native password validation (min:6)

#### BR-MIGRAR-002
- **Origem**: `_reversa_sdd/autenticacao/requirements.md` § RN-02
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Bloqueio de conta após 3 tentativas falhas consecutivas por 15 minutos
- **Justificativa de migração**: Anti-brute-force essencial
- **Compatibilidade com paradigma alvo**: Laravel Rate Limiter com throttle

#### BR-MIGRAR-003
- **Origem**: `_reversa_sdd/autenticacao/requirements.md` § RN-03
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Máximo de dispositivos simultâneos por perfil (FIFO), licenciada max_devices=2, aluna max_devices=1
- **Justificativa de migração**: Regra de negócio de segurança do produto
- **Compatibilidade com paradigma alvo**: Service Layer com DeviceManager injetado

#### BR-MIGRAR-004
- **Origem**: `_reversa_sdd/autenticacao/requirements.md` § RN-04
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Admin pode logar como licenciada para suporte/debug
- **Justificativa de migração**: Funcionalidade de suporte essencial para admin
- **Compatibilidade com paradigma alvo**: Laravel impersonation feature (ou custom middleware). Substituir mecanismo de ID negativo por abordagem explícita de login-as.

#### BR-MIGRAR-005
- **Origem**: `_reversa_sdd/autenticacao/requirements.md` § RN-05, `aluna/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Token de aluna prefixado com 'al_' para diferenciação de perfil
- **Justificativa de migração**: Diferenciação de escopo por perfil
- **Compatibilidade com paradigma alvo**: Strategy ou prefixo em geração de token via Sanctum/Passport

#### BR-MIGRAR-006
- **Origem**: `_reversa_sdd/autenticacao/requirements.md` § RN-07
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Senha padrão 'Mudar123!' com force_password_change para novas licenciadas
- **Justificativa de migração**: UX de onboarding de licenciadas
- **Compatibilidade com paradigma alvo**: Event listener em LicenciadaCreated com forced password change flag

#### BR-MIGRAR-007
- **Origem**: `_reversa_sdd/autenticacao/requirements.md` § RN-08
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Dual-Layer Throttling: account-based (3 falhas) + IP-based (50 falhas)
- **Justificativa de migração**: Proteção em profundidade contra brute force
- **Compatibilidade com paradigma alvo**: RateLimiter com named limits + throttle middleware

#### BR-MIGRAR-008
- **Origem**: `_reversa_sdd/autenticacao/requirements.md` § RN-09
- **Confiança original**: 🟡 INFERIDO
- **Descrição**: Fingerprint de dispositivo com reuse via hash para evitar proliferação de registros
- **Justificativa de migração**: Otimização de device management
- **Compatibilidade com paradigma alvo**: DeviceFingerprintService injetado no DeviceManager. **Validar no agente de codificação.**

### Aluna

#### BR-MIGRAR-009
- **Origem**: `_reversa_sdd/aluna/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Aluna só vê módulos com acesso via `aluna_course_access` (com expiração)
- **Justificativa de migração**: Controle de acesso por curso avulso
- **Compatibilidade com paradigma alvo**: Policy + Gate no Laravel

#### BR-MIGRAR-010
- **Origem**: `_reversa_sdd/aluna/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Certificado emitido apenas se 100% das aulas do módulo concluídas
- **Justificativa de migração**: Integridade acadêmica
- **Compatibilidade com paradigma alvo**: Verificação em Action class antes de emitir

#### BR-MIGRAR-011
- **Origem**: `_reversa_sdd/aluna/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: URL de vídeo assinada HMAC com validade de 1 hora
- **Justificativa de migração**: Segurança de mídia
- **Compatibilidade com paradigma alvo**: Signed URL Service com HMAC injectado

#### BR-MIGRAR-012
- **Origem**: `_reversa_sdd/aluna/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Progresso usa UPSERT: se registro existe → UPDATE; se não → INSERT
- **Justificativa de migração**: Padrão de idempotência em progresso de aula
- **Compatibilidade com paradigma alvo**: `updateOrCreate()` do Eloquent no LessonProgressRepository

#### BR-MIGRAR-013
- **Origem**: `_reversa_sdd/aluna/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Acesso a módulo pode expirar (campo `expires_at` em aluna_course_access)
- **Justificativa de migração**: Controle de acesso temporário para cursos com prazo
- **Compatibilidade com paradigma alvo**: Scope query com where('expires_at', '>', now())

### Licenciada

#### BR-MIGRAR-014
- **Origem**: `_reversa_sdd/licenciada/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: CPF, Email e WhatsApp são únicos (tratamento de erro MySQL 1062)
- **Justificativa de migração**: Integridade de dados cadastrais
- **Compatibilidade com paradigma alvo**: Laravel validation rules: `unique:licenciadas,cpf` + Exception handling

#### BR-MIGRAR-015
- **Origem**: `_reversa_sdd/licenciada/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Foto é renomeada automaticamente para `{id}_{name}_{cpf}.{ext}`
- **Justificativa de migração**: Organização de mídia no filesystem
- **Compatibilidade com paradigma alvo**: Uploaded file naming strategy com Sanitization

#### BR-MIGRAR-016
- **Origem**: `_reversa_sdd/licenciada/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Se name ou CPF mudar no update, foto é renomeada no filesystem
- **Justificativa de migração**: Consistência entre registro e arquivo
- **Compatibilidade com paradigma alvo**: Event listener em LicenciadaUpdated para renomear mídia

#### BR-MIGRAR-017
- **Origem**: `_reversa_sdd/licenciada/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Progresso global calculado como total de aulas ativas concluídas
- **Justificativa de migração**: Métrica de dashboard
- **Compatibilidade com paradigma alvo**: DashboardService com query agregada via Repository

### Admin

#### BR-MIGRAR-018
- **Origem**: `_reversa_sdd/admin/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Cache público compartilhado globalmente; cache privado segmentado por token de usuário
- **Justificativa de migração**: Performance via cache segmentado
- **Compatibilidade com paradigma alvo**: Laravel Cache tags (Redis/MySQL) para segmentação pública vs privada

#### BR-MIGRAR-019
- **Origem**: `_reversa_sdd/admin/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Feature flags limitadas a `maintenance_mode` no banco
- **Justificativa de migração**: Controle de manutenção sem deploy
- **Compatibilidade com paradigma alvo**: Laravel down command + custom feature flag service

#### BR-MIGRAR-020
- **Origem**: `_reversa_sdd/admin/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Dados sensíveis (password, token, secret, key) redactados automaticamente nos logs
- **Justificativa de migração**: LGPD e compliance de segurança
- **Compatibilidade com paradigma alvo**: Laravel Log custom channel com Processor que redacta

#### BR-MIGRAR-021
- **Origem**: `_reversa_sdd/admin/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Superadmin pode executar reset_lifecycle: force_password, revoke_lgpd, clear_devices, clear_throttling, max_devices
- **Justificativa de migração**: Ferramenta de administração crítica
- **Compatibilidade com paradigma alvo**: Action class LifecycleResetAction com dependências injetadas

### LMS

#### BR-MIGRAR-022
- **Origem**: `_reversa_sdd/lms/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Strict Progression Lock: módulo N+1 bloqueado se módulo N tem quiz não aprovado
- **Justificativa de migração**: Regra de negócio central do LMS
- **Compatibilidade com paradigma alvo**: ModuleProgressionService injetado com verificação de pré-requisitos

#### BR-MIGRAR-023
- **Origem**: `_reversa_sdd/lms/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Certificado só emitido se quiz foi passed (score >= min_score)
- **Justificativa de migração**: Integridade acadêmica
- **Compatibilidade com paradigma alvo**: Verificação em CertificateService antes de gerar PDF

#### BR-MIGRAR-024
- **Origem**: `_reversa_sdd/lms/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Quizzes embaralham questões e opções na tentativa
- **Justificativa de migração**: Integridade do quiz
- **Compatibilidade com paradigma alvo**: QuizService.shuffleQuestions() + shuffle()

#### BR-MIGRAR-025
- **Origem**: `_reversa_sdd/lms/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: min_score padrão para aprovação: 70
- **Justificativa de migração**: Configuração de nota mínima
- **Compatibilidade com paradigma alvo**: Config ou Settings table com default 70

#### BR-MIGRAR-026
- **Origem**: `_reversa_sdd/lms/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Transação atômica no CRUD de quiz (deleta questões antigas, reinsere novas)
- **Justificativa de migração**: Consistência de dados
- **Compatibilidade com paradigma alvo**: DB::transaction() no QuizManageService

### Doctor Harmony

#### BR-MIGRAR-027
- **Origem**: `_reversa_sdd/doctor-harmony/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Créditos de IA controlados por license (total/used); admin tem bypass
- **Justificativa de migração**: Controle de uso do recurso de IA
- **Compatibilidade com paradigma alvo**: LicenseService injetado com verificação de créditos

#### BR-MIGRAR-028
- **Origem**: `_reversa_sdd/doctor-harmony/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Crisis detection: palavras de desistência forçam PENDING + needs_review
- **Justificativa de migração**: Segurança do aluno — intervenção humana prioritária
- **Compatibilidade com paradigma alvo**: CrisisDetectionService (Strategy pattern) com palavras-chave configuráveis

#### BR-MIGRAR-029
- **Origem**: `_reversa_sdd/doctor-harmony/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: LGPD Consent: dados pessoais só enviados se ai_usage=true
- **Justificativa de migração**: Compliance LGPD obrigatória
- **Compatibilidade com paradigma alvo**: LGPDConsentChecker injetado antes de qualquer chamada à API Gemini

#### BR-MIGRAR-030
- **Origem**: `_reversa_sdd/doctor-harmony/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Hybrid Review: confidence < threshold (0.80) = revisão humana obrigatória
- **Justificativa de migração**: Qualidade da mentoria — IA + humano
- **Compatibilidade com paradigma alvo**: HybridReviewService com threshold configurável

#### BR-MIGRAR-031
- **Origem**: `_reversa_sdd/doctor-harmony/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Apenas superadmin pode alterar configurações da IA
- **Justificativa de migração**: Segurança de configuração crítica
- **Compatibilidade com paradigma alvo**: Laravel Gate (superadmin) no AIConfigController

### Nexus

#### BR-MIGRAR-032
- **Origem**: `_reversa_sdd/nexus/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Firewall IP com regras do tipo BAN, ALLOW, SUSPICIOUS com duração opcional (expires_at)
- **Justificativa de migração**: Segurança de rede
- **Compatibilidade com paradigma alvo**: IPRuleService com CRUD via Repository

#### BR-MIGRAR-033
- **Origem**: `_reversa_sdd/nexus/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Auditoria de operações registra admin_id, action, target_id, payload_before/payload_after
- **Justificativa de migração**: Rastreabilidade de ações admin
- **Compatibilidade com paradigma alvo**: AuditService com Observer pattern + Event logging

#### BR-MIGRAR-034
- **Origem**: `_reversa_sdd/nexus/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Feed Guardian combina anomalias de login + ações admin em timeline única
- **Justificativa de migração**: Monitoramento unificado
- **Compatibilidade com paradigma alvo**: GuardianTimelineService injetado com queries combinadas

#### BR-MIGRAR-035
- **Origem**: `_reversa_sdd/nexus/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: PURGE_DEVICES remove dispositivos inativos >30 dias; CLEAN_LOGS remove logs >90 dias
- **Justificativa de migração**: Manutenção periódica do sistema
- **Compatibilidade com paradigma alvo**: Schedule command no Laravel com console kernel

#### BR-MIGRAR-036
- **Origem**: `_reversa_sdd/nexus/requirements.md`
- **Confiança original**: 🟡 INFERIDO
- **Descrição**: Sistema de staging usa usuário DB_STAGE_USER (`nexus_user`) com senha separada
- **Justificativa de migração**: Ambiente de staging para testes DB
- **Compatibilidade com paradigma alvo**: Database config separada por environment (.env). **Validar no agente de codificação.**

#### BR-MIGRAR-037
- **Origem**: `_reversa_sdd/nexus/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Forense permite busca de alunos por CPF, geração batch de relatórios e lookup por hash de dispositivo
- **Justificativa de migração**: Investigação de incidentes de segurança
- **Compatibilidade com paradigma alvo**: ForensicsService com queries de busca e geração de relatórios

### Broadcast

#### BR-MIGRAR-038
- **Origem**: `_reversa_sdd/broadcast/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Broadcasts filtrados por target_roles (JSON array de roles)
- **Justificativa de migração**: Comunicação direcionada por perfil
- **Compatibilidade com paradigma alvo**: BroadcastService com role-based query scope

#### BR-MIGRAR-039
- **Origem**: `_reversa_sdd/broadcast/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: GET /broadcasts/active retorna apenas NÃO LIDOS (LEFT JOIN com NULL check)
- **Justificativa de migração**: UX de comunicados
- **Compatibilidade com paradigma alvo**: Query scope com subquery de acknowledge

#### BR-MIGRAR-040
- **Origem**: `_reversa_sdd/broadcast/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Broadcasts bloqueantes (is_blocking=1) impedem navegação até acknowledge
- **Justificativa de migração**: Comunicados críticos obrigatórios
- **Compatibilidade com paradigma alvo**: Middleware de bloqueio + BroadcastAckGuard

#### BR-MIGRAR-041
- **Origem**: `_reversa_sdd/broadcast/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Histórico mantém log de leitura por usuário (system_broadcast_logs)
- **Justificativa de migração**: Auditoria de comunicados
- **Compatibilidade com paradigma alvo**: BroadcastLogService com registro de acknowledge

#### BR-MIGRAR-042
- **Origem**: `_reversa_sdd/broadcast/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Broadcasts expiram automaticamente após 7 dias
- **Justificativa de migração**: Limpeza automática de comunicados
- **Compatibilidade com paradigma alvo**: Query scope com where('expires_at', '>', now()) ou Schedule command

### Analytics

#### BR-MIGRAR-043
- **Origem**: `_reversa_sdd/analytics/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Security Alert: >3 devices OU >2 IPv4 em 72h = compartilhamento de conta
- **Justificativa de migração**: Detecção de abuso de conta
- **Compatibilidade com paradigma alvo**: AnomalyDetectionService com queries de device/IP aggregation

#### BR-MIGRAR-044
- **Origem**: `_reversa_sdd/analytics/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: IPv6 ignorado em alerts (CGNAT causa falsos positivos)
- **Justificativa de migração**: Evitar falsos positivos
- **Compatibilidade com paradigma alvo**: Filtro IPv4-only no detector de anomalias

#### BR-MIGRAR-045
- **Origem**: `_reversa_sdd/analytics/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Churn Risk: licenciadas inativas >15 dias
- **Justificativa de migração**: Identificação de alunas em risco
- **Compatibilidade com paradigma alvo**: ChurnRiskService com query de último acesso

#### BR-MIGRAR-046
- **Origem**: `_reversa_sdd/analytics/requirements.md`
- **Confiança original**: 🟡 INFERIDO
- **Descrição**: Alertas são apenas informativos — não executam ações corretivas
- **Justificativa de migração**: Observabilidade sem automação corretiva
- **Compatibilidade com paradigma alvo**: Notificação via broadcast/slack, sem ação automática. **Validar no agente de codificação.**

### Leads

#### BR-MIGRAR-047
- **Origem**: `_reversa_sdd/leads/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Sanitização obrigatória: FILTER_SANITIZE_EMAIL, strip_tags, preg_replace no whatsapp
- **Justificativa de migração**: Segurança contra XSS e injeção
- **Compatibilidade com paradigma alvo**: Laravel Request sanitization + validation rules

#### BR-MIGRAR-048
- **Origem**: `_reversa_sdd/leads/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Transições de status válidas: new → contacted → converted → closed
- **Justificativa de migração**: Funil comercial definido
- **Compatibilidade com paradigma alvo**: Enum LeadStatus com state machine transitions

#### BR-MIGRAR-049
- **Origem**: `_reversa_sdd/leads/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Novo lead dispara notificação automática para contato@bodyharmony.com.br
- **Justificativa de migração**: Alerta comercial em tempo real
- **Compatibilidade com paradigma alvo**: Evento LeadCreated → Mail notification listener

### Certificado

#### BR-MIGRAR-050
- **Origem**: `_reversa_sdd/certificado/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Hash do certificado é SHA-256(user_id + module_id + time + secret)
- **Justificativa de migração**: Autenticidade e anti-falsificação
- **Compatibilidade com paradigma alvo**: CertificateHashService com hash injection

#### BR-MIGRAR-051
- **Origem**: `_reversa_sdd/certificado/requirements.md`
- **Confiança original**: 🟢 CONFIRMADO
- **Descrição**: Certificado baixado como PDF sob demanda (não armazenado em arquivo)
- **Justificativa de migração**: Otimização de armazenamento
- **Compatibilidade com paradigma alvo**: Laravel PDF response (Barryvdh/DomPDF ou mPDF) stream

### Demais regras (Mídia, Conteúdo, Resultados, FAQ, Workshop)

As regras restantes de CRUD com autenticação, validação de MIME/upload, ordenação por pinned/display_order, exibição pública e proteção admin seguem o mesmo padrão — MIGRAR como Services e Policies no Laravel. Total consolidado: **51 regras MIGRAR**.

## Regras DESCARTAR (resumo)

| ID | Origem | Motivo curto | Vínculo a paradigma? |
|---|---|---|---|
| BR-DESCARTAR-001 | `_reversa_sdd/architecture.md` § Dívidas técnicas | Injeção global (`global $pdo, $loggedUser`) | sim — substituída por DI via Service Container |
| BR-DESCARTAR-002 | `_reversa_sdd/autenticacao/requirements.md` § RN-06 | Superadmin hardcoded como id=5 | sim — substituída por roles configuráveis via Laravel Gates |

> Detalhe completo em `discard_log.md`.

## Regras DECISÃO HUMANA

### BR-HUMANA-001
- **Origem**: `_reversa_sdd/gaps.md` § G05 (certificado)
- **Tipo de ambiguidade**: 🔴 GAP
- **Descrição**: Re-emissão de certificado para mesmo módulo não confirmada — o legado pode ou não permitir nova emissão
- **Opções**:
  - A: Bloquear re-emissão (uma vez por módulo, como documentado) — comportamento atual
  - B: Permitir re-emissão com novo hash a cada tentativa
  - C: Permitir re-emissão apenas se quiz foi refeito
- **Recomendação do Curator**: Opção A (bloquear) — alinha com o comportamento documentado e evita proliferação de certificados
- **Status**: RESOLVIDA (Opção A — GERMANO, 2026-06-02T21:13)

### BR-HUMANA-002
- **Origem**: `_reversa_sdd/gaps.md` § G01 (conteúdo)
- **Tipo de ambiguidade**: 🔴 GAP
- **Descrição**: Estratégia de armazenamento de fotos não confirmada — local filesystem vs cloud (S3/DO Spaces)
- **Opções**:
  - A: Armazenamento local (filesystem do servidor) — como no legado
  - B: Cloud storage (S3, DO Spaces) — mais escalável
- **Recomendação do Curator**: Opção A (local) — menor complexidade para o prazo de 24h, compatível com a VPS Hostinger KVM 4 existente
- **Status**: RESOLVIDA (Opção A — GERMANO, 2026-06-02T21:13)

### BR-HUMANA-003
- **Origem**: `_reversa_sdd/gaps.md` § G04 (broadcast)
- **Tipo de ambiguidade**: 🔴 GAP
- **Descrição**: Mecanismo de blocking para broadcasts is_blocking não detalhado — como o bloqueio de navegação se comporta exatamente
- **Opções**:
  - A: Modal bloqueante que impede qualquer navegação até acknowledge (frontend)
  - B: Banner no topo que não bloqueia navegação mas exige acknowledge para sumir
- **Recomendação do Curator**: Opção B (banner) — menos intrusivo, experiência de usuário superior
- **Status**: RESOLVIDA (Opção B — GERMANO, 2026-06-02T21:13)

## Notas

Nenhuma mudança de banco (MySQL) é necessária por razões de paradigma. O Laravel Eloquent ORM é compatível com MySQL 8.4. A migração de dados será tratada pelo Designer (data_migration_plan.md).
