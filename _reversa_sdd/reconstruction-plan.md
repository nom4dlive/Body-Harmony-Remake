# Reconstruction Plan — Body-Harmony-Remake

**Fonte:** migração
**Paradigma alvo:** OO com DI (Laravel 11)
**Topologia:** DDD Modular Monolith (11 bounded contexts + Shared Kernel)
**Stack:** Laravel 11 + PHP 8.4 + MySQL 8.4 + Sanctum + Docker Compose + Traefik
**Estratégia:** Big Bang + Parallel Run
**Gerado em:** 2026-06-03
**Status:** 17 tarefas | 17 concluídas | 0 pendentes

---

## Alertas de pré-voo

Nenhum item bloqueante. Ambiguity log: 3 resolvidos, 0 pendentes, 0 referidos à codificação. Pode iniciar.

---

## Tarefas

### Tarefa 01 — Setup do Projeto Novo
**Status:** done
**Lê:** `_reversa_sdd/migration/topology_decision.md`, `_reversa_sdd/migration/paradigm_decision.md`
**Constrói:** estrutura inicial de pastas/módulos do Laravel 11 DDD Modular Monolith, configuração base (docker-compose, .env, Traefik), dependências mínimas (Laravel Sanctum, etc.), Service Providers vazios por módulo, Shared Kernel esqueleto
**Pronto quando:** Esqueleto do repositório novo bate com a topologia aprovada (11 módulos + Shared Kernel) e paradigma OO com DI (Service Container, Contracts)

---

### Tarefa 02 — Schema do Banco Alvo
**Status:** done
**Lê:** `_reversa_sdd/migration/target_data_model.md`
**Constrói:** migrations, schema MySQL 8.4 com tabelas prefixadas por módulo, modelos Eloquent com casts e relationships
**Pronto quando:** Todas as tabelas do modelo de dados alvo existem com tipos, constraints e relações corretos

---

### Tarefa 03 — Plano de Migração de Dados
**Status:** done
**Lê:** `_reversa_sdd/migration/data_migration_plan.md`, `_reversa_sdd/migration/target_data_model.md`
**Constrói:** scripts/jobs de ETL do banco legado para o novo, validações de integridade, rollback
**Pronto quando:** Scripts de migração testados em volume representativo, validações batem com o plano

---

### Tarefa 04 — Shared Kernel (Core Infrastructure)
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (seção Shared Kernel), `_reversa_sdd/migration/target_domain_model.md`
**Constrói:** `app/Shared/Core/` — Cache Service, Logging Service, Audit Service, Notification Service, helpers injetáveis, Contracts/Interfaces base
**Pronto quando:** Shared Kernel implementado com DI via Service Container, testável com mocks

---

### Tarefa 05 — Auth Module
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (seção BC-Auth), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** `app/Modules/Auth/` — AuthController, AuthMiddleware, Guard (admin/licenciada/aluna), ThrottleService, IPFirewallService, Sanctum tokens, impersonation, superadmin guard, device FIFO
**Pronto quando:** Login/logout funcional para admin, licenciada e aluna; tokens Sanctum; throttling; IP firewall; device FIFO

---

### Tarefa 06 — Licenciada Module
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (seção BC-Licenciada), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** `app/Modules/Licenciada/` — CRUD licenciadas, dashboard, gestão de dispositivos, progresso global
**Pronto quando:** CRUD completo com validação, dashboard com dados agregados, device management

---

### Tarefa 07 — Aluna Module
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (seção BC-Aluna), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** `app/Modules/Aluna/` — portal aluna, progresso, certificados, signed URLs, max_devices=1, token prefixado al_
**Pronto quando:** Aluna acessa portal, vê progresso, obtém certificados via signed URL

---

### Tarefa 08 — Nexus Module
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (seção BC-Nexus), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** `app/Modules/Nexus/` — Firewall IP, auditoria, forense, manutenção, watchtower, war room
**Pronto quando:** Firewall BAN/ALLOW funcional, auditoria registrada, watchtower dashboard, war room métricas

---

### Tarefa 09 — LMS Module
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (seção BC-LMS), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** `app/Modules/LMS/` — módulos, aulas, quizzes, progression lock, biblioteca, certificados (depende de Aluna e Quiz)
**Pronto quando:** Strict Progression Lock funcional, quizzes com correção, certificados emitidos

---

### Tarefa 10 — DoctorHarmony Module
**Status:** in_progress
**Lê:** `_reversa_sdd/migration/target_architecture.md` (seção BC-DoctorHarmony), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** `app/Modules/DoctorHarmony/` — análise clínica via Gemini, créditos, revisão híbrida, detecção de crise, sessões, LGPD
**Pronto quando:** Análise Gemini com créditos, revisão híbrida (IA + humano), detecção de crise, sessões com LGPD

---

### Tarefa 11 — Broadcast Module
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (seção BC-Broadcast), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** `app/Modules/Broadcast/` — comunicados, acknowledge, targeting por role, is_blocking (banner não-bloqueante), expiração
**Pronto quando:** Comunicado criado → targeting → acknowledge → expiração; banner não-bloqueante conforme AMB-003

---

### Tarefa 12 — Content Module
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (seção BC-Content), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** `app/Modules/Content/` — mentores CRUD, FAQ CRUD, resultados CRUD
**Pronto quando:** CRUDs públicos (GET) e admin (CRUD completo) funcionando

---

### Tarefa 13 — Media Module
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (seção BC-Media), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** `app/Modules/Media/` — upload, validação MIME, hash dedup, cleanup, armazenamento local (filesystem VPS conforme AMB-002)
**Pronto quando:** Upload com validação, dedup por hash, cleanup programado

---

### Tarefa 14 — Leads Module
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (seção BC-Leads), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** `app/Modules/Leads/` — formulário público, funil, notificação email
**Pronto quando:** Lead capturado → notificação → funil registrado

---

### Tarefa 15 — Analytics Module
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (seção BC-Analytics), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** `app/Modules/Analytics/` — watchtower dashboard, war room, churn, bot stats
**Pronto quando:** Dashboards com dados reais, churn calculado, bot stats

---

### Tarefa 16 — Cutover
**Status:** done
**Lê:** `_reversa_sdd/migration/cutover_plan.md`
**Constrói:** scripts/checklists de cutover, switch de tráfego (Traefik), plano de rollback executável (15 min)
**Pronto quando:** Sistema novo recebe tráfego conforme o plano e legado pode ser desligado/congelado conforme decidido

---

### Tarefa 17 — Validação de Paridade
**Status:** done
**Lê:** `_reversa_sdd/migration/parity_specs.md`, `_reversa_sdd/migration/parity_tests/`
**Constrói:** suíte de testes de paridade rodando contra legado e novo, relatório de divergências
**Pronto quando:** Todos os fluxos críticos definidos em parity_specs.md passam nos dois sistemas com resultados equivalentes
