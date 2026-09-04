## 2026-08-20T23:21:00Z
You are the Frontend Implementation Worker for PLAN-064 (Funil de Onboarding de Licenciadas).
Your working directory is f:\Body-Harmony-Remake\.agents\worker_frontend_1

You MUST read:
- f:\Body-Harmony-Remake\.agents\ORIGINAL_REQUEST.md
- f:\Body-Harmony-Remake\PROJECT.md
- f:\Body-Harmony-Remake\AGENTS.md
- f:\Body-Harmony-Remake\.agents\explorer_survey_frontend_1\analysis.md
- f:\Body-Harmony-Remake\.agents\spec_miner_survey_1\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Exclusively Owned Files:
1. `apps/web-app/src/frontend/src/pages/PublicOnboardingPage.jsx`
2. `apps/web-app/src/frontend/src/pages/OnboardingFunnelPage.jsx`
3. `apps/web-app/src/frontend/src/components/modals/GenerateContractModal.jsx`
4. `apps/web-app/src/frontend/src/services/api.js` (add `onboardingApi` module)
5. `apps/web-app/src/frontend/src/App.jsx` (register `/onboarding/:token` public route and `/portal-gestor/onboarding` admin route)
6. `apps/web-app/src/frontend/src/routes.js` (add ROUTES constants)

Key Implementation Details:
- Luxury aesthetics: Navy Blue `#0A3E60`, Gold `#ED7E13`, Dark `#051A29`, Light `#F8FAFC`. Mobile-first touch targets >= 44x44px.
- `PublicOnboardingPage.jsx`: Standalone mobile-first wizard for the licensee. Validates token via `onboardingApi.validatePublicToken(token)`, step 1: personal info (auto-fill from OCR), step 2: document photo upload with instant preview & OCR trigger, step 3: LGPD consent and success confirmation.
- `OnboardingFunnelPage.jsx`: Gestor dashboard with Dual View:
  - 5-Column Kanban (`Novo Lead / Link Enviado`, `Pré-Cadastro / Documentos Recebidos`, `Contrato Emitido`, `Aguardando Assinatura & Pagamento`, `Ativa / Concluído`)
  - Searchable Table View with status badges and quick action buttons.
  - Auto-polling every 15s.
  - Action buttons: "Novo Link de Onboarding", "Emitir Contrato (1-Clique)", "Confirmar Pagamento & Ativar", "Reenviar WhatsApp".
- `GenerateContractModal.jsx`: 1-Click modal with lead data auto-filled, contract template selection, value, number in words, and immediate WhatsApp dispatch link generation.
- `api.js`: Add `onboardingApi` conforming 100% to `openspec/contracts/admin/gestor-onboarding-funnel.json`.

Run `npm run build` in `apps/web-app` to verify clean compilation with exit code 0.
Document exact build output in your handoff report at `f:\Body-Harmony-Remake\.agents\worker_frontend_1\handoff.md`. Send a completion message to parent when done.
