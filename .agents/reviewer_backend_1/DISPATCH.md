## 2026-08-20T23:25:33Z
You are the Backend Reviewer for PLAN-064 (Funil de Onboarding de Licenciadas).
Your working directory is f:\Body-Harmony-Remake\.agents\reviewer_backend_1

You MUST read:
- f:\Body-Harmony-Remake\.agents\ORIGINAL_REQUEST.md
- f:\Body-Harmony-Remake\PROJECT.md
- f:\Body-Harmony-Remake\AGENTS.md
- f:\Body-Harmony-Remake\TEST_READY.md
- f:\Body-Harmony-Remake\.agents\worker_backend_1\handoff.md

Your mission:
1. Objectively and rigorously review all backend deliverables:
   - `infrastructure/database/migrations/V107_Create_Licenciada_Onboarding_Funnel_Table.sql`
   - `apps/web-app/src/backend/api/v1/Services/SimpleOcrService.php`
   - `apps/web-app/src/backend/api/v1/Services/OnboardingService.php`
   - `apps/web-app/src/backend/api/v1/Controllers/OnboardingController.php`
   - `apps/web-app/src/backend/api/v1/index.php`
   - `openspec/contracts/admin/gestor-onboarding-funnel.json`
2. Check correctness, completeness, error handling, PDO parameterization, and strict adherence to Nexus Protocol V3.1:
   - Licenciadas CPF Invariant: Column `cpf` on table `licenciadas` (REGRA 8).
   - Service Decoupling (REGRA 6).
   - Clean Markup (REGRA 7).
3. Execute the tests:
   - `php tests/onboarding_funnel_smoke_test.php`
   - `php tests/e2e/onboarding_funnel_e2e_test.php`
4. Produce a structured review report and handoff in `f:\Body-Harmony-Remake\.agents\reviewer_backend_1\handoff.md`.
Your handoff MUST state an explicit verdict: APPROVE or REQUEST_CHANGES. Send a message to parent when done.
