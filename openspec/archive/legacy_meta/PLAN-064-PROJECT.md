# Project: Funil de Onboarding de Licenciadas (PLAN-064)

## Architecture
- **Backend**: PHP 8.4 Modular Services (`BodyHarmony\Services\OnboardingService`, `BodyHarmony\Services\SimpleOcrService`) decoupled from HTTP Controllers, with LazyDb PDO connection, prepared statements, and dependency injection.
- **Data Layer**: MySQL 8.0 schema migration `V107_Create_Licenciada_Onboarding_Funnel_Table.sql` with tables `licenciada_onboarding_tokens` and `licenciada_onboarding_requests`, maintaining strict CPF Invariant on table `licenciadas`.
- **API Contracts**: RESTful endpoints adhering strictly to `openspec/contracts/admin/gestor-onboarding-funnel.json` under Nexus Protocol V3.1.
- **Frontend**: React 18 / Vite architecture with standalone public route `/onboarding/:token`, protected manager route `/portal-gestor/onboarding`, luxury design system (`#0A3E60`, `#ED7E13`), mobile-first touch targets (>= 44x44px), Kanban 5-column and Table dual-views, and 1-click contract issuance modal.
- **Testing**: Dual-track requirement-driven test suite + standalone CLI MockPDO smoke test (`tests/onboarding_funnel_smoke_test.php`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | DB Schema & Tables | Migration V107 for `licenciada_onboarding_tokens` & `licenciada_onboarding_requests` with strict CPF mapping | M1 | PLAN-064 / Survey |
| 2 | Defensive SimpleOcrService | Pure PHP 8.4 regex heuristic parser for CPF, RG, Nome, CEP, with manual fallback | M2 | PLAN-064 / Survey |
| 3 | OnboardingService Core | Service orchestrating tokens, public submissions, 2-step validation, and WhatsApp rule | M3 | PLAN-064 / Survey |
| 4 | Agenda & Contract Integration | Auto-creation of gestor agenda tasks on submit and 1-click contract generation | M3 | PLAN-064 / Survey |
| 5 | OnboardingController & Routes | Thin HTTP controller for public and admin endpoints, bound in `api/v1/index.php` | M4 | PLAN-064 / Survey |
| 6 | API Contract Symmetry | Strict synchronization with `openspec/contracts/admin/gestor-onboarding-funnel.json` | M4 | AGENTS.md / Survey |
| 7 | PublicOnboardingPage.jsx | Mobile-first public onboarding wizard with document photo upload and instant preview | M5 | PLAN-064 / Survey |
| 8 | OnboardingFunnelPage.jsx | Protected manager dashboard with Dual View (5-Column Kanban + Searchable Table + Polling) | M5 | PLAN-064 / Survey |
| 9 | GenerateContractModal.jsx | 1-Click modal with auto-fill, plan selection, currency in words, and WhatsApp dispatch | M5 | PLAN-064 / Survey |
| 10 | Frontend Router & API Integration | Route definitions in `App.jsx`, `routes.js`, sidebar links, and `onboardingApi` in `services/api.js` | M5 | PLAN-064 / Survey |
| 11 | CLI Smoke Test Suite | Self-contained MockPDO test runner `tests/onboarding_funnel_smoke_test.php` | M6 / E2E | ORIGINAL_REQUEST |
| 12 | Clean Vite Build Verification | `npm run build` in `apps/web-app` compiling with exit code 0 | M6 / E2E | ORIGINAL_REQUEST |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Database Schema & Migration | Migration SQL `V107_Create_Licenciada_Onboarding_Funnel_Table.sql` | none | PLANNED |
| M2 | Defensive SimpleOcrService | `apps/web-app/src/backend/api/v1/Services/SimpleOcrService.php` | none | PLANNED |
| M3 | OnboardingService & Integrations | `apps/web-app/src/backend/api/v1/Services/OnboardingService.php` | M1, M2 | PLANNED |
| M4 | OnboardingController & API Routing | `OnboardingController.php` + `index.php` route bindings + contracts | M3 | PLANNED |
| M5 | Frontend React Pages & Modals | `PublicOnboardingPage.jsx`, `OnboardingFunnelPage.jsx`, `GenerateContractModal.jsx`, `api.js`, `App.jsx` | M4 | PLANNED |
| M6 | Test Verification & Hardening | `tests/onboarding_funnel_smoke_test.php`, E2E test verification, Vite build | M5 | PLANNED |

## Interface Contracts
### Public API (`/public/onboarding/...`)
- `GET /public/onboarding/{token}` -> `{ status: "success", data: { token, lead_name, lead_whatsapp, expires_at } }`
- `POST /public/onboarding/{token}` -> Body: `{ nome, cpf, rg, whatsapp, email, cep, endereco, numero, complemento, bairro, cidade, uf, document_photo }` -> `{ status: "success", data: { request_id, status: "DOCUMENTOS_RECEBIDOS" } }`

### Admin API (`/admin/onboarding/...`)
- `POST /admin/onboarding/tokens` -> Body: `{ lead_name, lead_whatsapp, expires_hours? }` -> `{ status: "success", data: { token, public_url, expires_at } }`
- `GET /admin/onboarding/funnel` -> Query: `[status, search, page, limit]` -> `{ status: "success", data: { stages: {...}, items: [...], total: N } }`
- `POST /admin/onboarding/{id}/generate-contract` -> Body: `{ plan_id, value, payment_terms }` -> `{ status: "success", data: { contract_id, contract_uuid, sign_url, whatsapp_link } }`
- `POST /admin/onboarding/{id}/confirm-payment` -> Body: `{ payment_method, notes }` -> `{ status: "success", data: { request_id, licenciada_id, status: "ATIVO_LIBERADO" } }`

## Code Layout
### Backend
- Migration: `infrastructure/database/migrations/V107_Create_Licenciada_Onboarding_Funnel_Table.sql`
- Services: `apps/web-app/src/backend/api/v1/Services/SimpleOcrService.php`, `apps/web-app/src/backend/api/v1/Services/OnboardingService.php`
- Controller: `apps/web-app/src/backend/api/v1/Controllers/OnboardingController.php`
- Routes: `apps/web-app/src/backend/api/v1/index.php`
- Contract: `openspec/contracts/admin/gestor-onboarding-funnel.json`

### Frontend
- Public Page: `apps/web-app/src/frontend/src/pages/PublicOnboardingPage.jsx`
- Admin Page: `apps/web-app/src/frontend/src/pages/OnboardingFunnelPage.jsx`
- Modal: `apps/web-app/src/frontend/src/components/modals/GenerateContractModal.jsx`
- API Client: `apps/web-app/src/frontend/src/services/api.js` (`onboardingApi`)
- Router: `apps/web-app/src/frontend/src/App.jsx`, `apps/web-app/src/frontend/src/routes.js`
- Navigation: `apps/web-app/src/frontend/src/components/common/Header.jsx` or Sidebar

### Tests
- Smoke Test: `tests/onboarding_funnel_smoke_test.php`
- E2E Test Suite: `tests/e2e/onboarding_funnel_e2e_test.php`
