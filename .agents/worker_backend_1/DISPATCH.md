## 2026-08-21T02:21:00Z
You are the Backend Implementation Worker for PLAN-064 (Funil de Onboarding de Licenciadas).
Your working directory is f:\Body-Harmony-Remake\.agents\worker_backend_1

You MUST read:
- f:\Body-Harmony-Remake\.agents\ORIGINAL_REQUEST.md
- f:\Body-Harmony-Remake\PROJECT.md
- f:\Body-Harmony-Remake\AGENTS.md
- f:\Body-Harmony-Remake\.agents\explorer_survey_backend_1\analysis.md
- f:\Body-Harmony-Remake\.agents\spec_miner_survey_1\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Exclusively Owned Files:
1. `infrastructure/database/migrations/V107_Create_Licenciada_Onboarding_Funnel_Table.sql`
2. `apps/web-app/src/backend/api/v1/Services/SimpleOcrService.php`
3. `apps/web-app/src/backend/api/v1/Services/OnboardingService.php`
4. `apps/web-app/src/backend/api/v1/Controllers/OnboardingController.php`
5. `apps/web-app/src/backend/api/v1/index.php` (add route bindings for onboarding)
6. `openspec/contracts/admin/gestor-onboarding-funnel.json` (ensure 100% contract synchronization)
7. `tests/onboarding_funnel_smoke_test.php` (the standalone CLI smoke test)

Key Implementation Details:
- Migration V107: Create `licenciada_onboarding_tokens` and `licenciada_onboarding_requests` with ENUM status: `PRE_CADASTRO`, `CONTRATO_EMITIDO`, `AGUARDANDO_ASSINATURA`, `VALIDAR_PAGAMENTO`, `ATIVO_LIBERADO`. Strict adherence to Constitution REGRA 8: `cpf` column on `licenciadas` table.
- SimpleOcrService: Native PHP 8.4 regex heuristic parser extracting CPF, RG, Nome, CEP, Endereço defensively without fatal errors.
- OnboardingService: Implements `createToken()`, `validateToken()`, `submitPublicOnboarding()`, `getFunnelStages()`, `generateContract1Click()`, `confirmPaymentAndActivate()`, `sendWhatsAppReminder()`. Integrates `AgendaService` (creating gestor tasks on submission) and `ContractPdfService` (for 1-click contract issuance).
- OnboardingController: Public endpoints (`/public/onboarding/{token}`) and Admin endpoints (`/admin/onboarding/...`), with JSON responses matching `openspec/contracts/admin/gestor-onboarding-funnel.json`.
- Smoke Test: Write and execute `php tests/onboarding_funnel_smoke_test.php` using MockPDO testing all 7 funnel operations with 100% pass rate.

Run `php tests/onboarding_funnel_smoke_test.php` and document exact execution output in your handoff report at `f:\Body-Harmony-Remake\.agents\worker_backend_1\handoff.md`. Send a completion message to parent when done.
