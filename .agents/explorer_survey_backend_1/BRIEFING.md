# BRIEFING — 2026-08-21T02:20:00Z

## Mission
Investigate PHP backend architecture, database patterns, services, contracts, routing, and smoke tests for PLAN-064 (Licenciada Onboarding Funnel).

## 🔒 My Identity
- Archetype: explorer
- Roles: Backend Architecture Explorer, Read-only investigation, Synthesis
- Working directory: f:\Body-Harmony-Remake\.agents\explorer_survey_backend_1
- Original parent: cfbb8f91-87f5-4919-900c-bc45c32f58fd
- Milestone: Survey Phase (PLAN-064)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Constitution in AGENTS.md: Nexus Protocol V3.1, Strict Contracts (JSON in openspec/contracts/), services in `BodyHarmony\Services\*`, Licenciadas `cpf` column invariant, Heredoc invariant, CLI test isolation.
- Write only inside `.agents/explorer_survey_backend_1/`.

## Current Parent
- Conversation ID: cfbb8f91-87f5-4919-900c-bc45c32f58fd
- Updated: 2026-08-21T02:20:00Z

## Investigation State
- **Explored paths**:
  - `apps/web-app/src/backend/api/config.php`
  - `apps/web-app/src/backend/composer.json`
  - `apps/web-app/src/backend/api/v1/index.php`
  - `apps/web-app/src/backend/api/v1/Core/*` (Router, AuthMiddleware, Response, db)
  - `apps/web-app/src/backend/api/v1/Services/*` (AgendaService, AgendaTriggerService, ContractPdfService, etc.)
  - `apps/web-app/src/backend/api/v1/Controllers/*` (GestorAgendaController, LicenciadasController, AdminController)
  - `infrastructure/database/DATABASE_MASTER_V36_1.sql`
  - `infrastructure/database/migrations/*` (V101, V105, V106)
  - `openspec/contracts/admin/gestor-onboarding-funnel.json`
  - `tests/*` (agenda_smoke_test.php, agenda_advanced_smoke_test.php, contracts_crud_smoke_test.php)
- **Key findings**:
  - `LazyDb` PDO proxy pattern with `getDbConnection()`.
  - Service classes namespaced under `BodyHarmony\Services\*` and loaded via Composer and index.php autoloader.
  - Strict `cpf` column on `licenciadas` table (REGRA 8).
  - Clean integration points between `OnboardingService`, `AgendaService::createEvent`, `ContractPdfService::generatePdf`, and `contracts` table.
  - Complete mock-driven CLI test strategy for `tests/onboarding_funnel_smoke_test.php`.
- **Unexplored areas**: None for backend scope. Ready for implementation phase.

## Key Decisions Made
- Designed V107 migration schema with `licenciada_onboarding_tokens` and `licenciada_onboarding_requests`.
- Designed `SimpleOcrService` in pure defensive PHP (regex and validation heuristics without paid APIs).
- Designed `OnboardingService` with 5-column funnel state machine, 1-click contract generation, and 2-step activation.
- Designed `OnboardingController` and router mappings in `api/v1/index.php`.

## Artifact Index
- DISPATCH.md — Initial dispatch instructions
- progress.md — Liveness heartbeat and step tracking
- analysis.md — Backend architecture investigation report
- handoff.md — 5-component handoff report
