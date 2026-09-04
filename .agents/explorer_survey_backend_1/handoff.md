# Handoff Report — Backend Architecture Explorer (PLAN-064)

**Agent:** `explorer_survey_backend_1`  
**Recipient:** `parent` (`cfbb8f91-87f5-4919-900c-bc45c32f58fd`)  
**Type:** Hard Handoff (Investigation Complete)  
**Date:** 2026-08-20  

---

## 1. Observation

1. **Autoloading and Namespace Architecture:**
   - In `apps/web-app/src/backend/composer.json`, lines 11-15:
     ```json
     "autoload": {
         "psr-4": {
             "BodyHarmony\\": "api/v1/"
         }
     }
     ```
   - In `apps/web-app/src/backend/api/v1/index.php`, lines 30-45:
     `spl_autoload_register` resolves `BodyHarmony\Services\*` and `Controllers\*` directly from `Core/`, `Controllers/`, `Services/`.
2. **Database Connection Pattern:**
   - In `apps/web-app/src/backend/api/config.php`, lines 328-449:
     `LazyDb` implements a lazy-loading proxy for `PDO` with 2-second timeout and charset `utf8mb4`.
   - Global accessor functions defined on lines 567-599: `getDbConnection()` and `get_db_connection()` return `$pdo`.
3. **Existing Table Schemas and Invariants:**
   - In `infrastructure/database/DATABASE_MASTER_V36_1.sql`, line 90:
     Table `licenciadas` strictly uses column `cpf varchar(14)` (Constitution REGRA 8 forbids using `document`).
   - In `infrastructure/database/migrations/V101_Create_Contracts_And_Signatures.sql`, lines 9-66:
     Tables `contract_templates`, `contracts`, `contract_signatures` defined with statuses `DRAFT`, `GENERATED`, `PENDING_SIGNATURE`, `SIGNED`, `CANCELLED`, `ARCHIVED`.
   - In `infrastructure/database/migrations/V105_Create_Gestor_Agenda_Events_Table.sql`, lines 6-29:
     Table `gestor_agenda_events` with `event_type`, `priority`, `status`, `client_id`, `client_type`, `assigned_to_admin_id`.
4. **Existing Services Integration:**
   - `BodyHarmony\Services\AgendaService` (`apps/web-app/src/backend/api/v1/Services/AgendaService.php`, lines 129-201):
     Method `createEvent(array $data, int $adminId): int` creates agenda tasks and triggers `logStatusChange`.
   - `BodyHarmony\Services\ContractPdfService` (`apps/web-app/src/backend/api/v1/Services/ContractPdfService.php`, lines 354-360):
     Methods `renderTemplate(string $html, array $vars)` and `generatePdf(string $html, string $uuid, string $title, ...)` compile PDF and compute cryptographic SHA-256 hash.
5. **Contract Specifications:**
   - `openspec/contracts/admin/gestor-onboarding-funnel.json` specifies contract for:
     `POST /admin/onboarding/links` (or `/tokens`), `POST /public/onboarding/submit` (or `/{token}`), `GET /admin/onboarding/funnel`, `POST /admin/onboarding/{id}/generate-contract`, `POST /admin/onboarding/{id}/confirm-payment`.
6. **CLI Smoke Test Architecture:**
   - `tests/agenda_smoke_test.php` and `tests/contracts_crud_smoke_test.php`:
     Use standalone `MockPDO` classes to test service logic in CLI without external network or MySQL dependencies, asserting with exit code 0.

---

## 2. Logic Chain

1. From **Observation 1 & 2**, all new backend services (`OnboardingService.php`, `SimpleOcrService.php`) must reside in namespace `BodyHarmony\Services` under `apps/web-app/src/backend/api/v1/Services/`, receive a `PDO` instance in their constructor, and be callable by both Controllers and CLI test runners.
2. From **Observation 3**, the new migration `V107_Create_Licenciada_Onboarding_Funnel_Table.sql` must create `licenciada_onboarding_tokens` (for signed time-limited public links) and `licenciada_onboarding_requests` (for the 5 Kanban stages). When a licensee is activated in Step 2, the insert/update to `licenciadas` must target column `cpf` to satisfy Constitutional REGRA 8.
3. From **Observation 4**, `OnboardingService` can cleanly orchestrate:
   - When a public form is submitted (`submitPublicOnboarding`), it automatically invokes `AgendaService::createEvent` with priority `alta` and title `"Emitir contrato para: [Nome]"`.
   - When 1-click contract generation is requested (`generateContract1Click`), it merges extracted variables with `licenciamento-padrao`, delegates PDF rendering to `ContractPdfService`, creates a record in `contracts`, sets status to `AGUARDANDO_ASSINATURA`, and generates the WhatsApp signature link.
   - In Step 2 (`confirmPaymentAndActivate`), it confirms the payment, ensures `licenciadas` entry is active, transitions request to `ATIVO_LIBERADO`, and concludes the agenda event.
4. From **Observation 4 & 5**, `SimpleOcrService` should be implemented in pure PHP using defensive heuristics (regex matching for CPF/RG/Nome, checksum validation for CPF) to satisfy the constraint of no paid external OCR services.
5. From **Observation 6**, the test suite `tests/onboarding_funnel_smoke_test.php` can test all 7 core capabilities of `OnboardingService` and `SimpleOcrService` using an in-memory `MockPDO` statement emulator, guaranteeing 100% PASS on CLI (`php tests/onboarding_funnel_smoke_test.php`).

---

## 3. Caveats

1. **Tesseract / System OCR Dependency:** Tesseract CLI may or may not be present on local development or remote VPS. Therefore, `SimpleOcrService` must be built defensively with fallback heuristics that extract metadata and validate regex patterns even without system binaries.
2. **Multi-host Sync (Hostinger vs VPS):** Uploaded document images are saved in `private_uploads/onboarding/` on the VPS/backend filesystem.
3. **Frontend Integration:** The exact React props for `PublicOnboardingPage.jsx`, `OnboardingFunnelPage.jsx`, and `GenerateContractModal.jsx` will be detailed by the Frontend Explorer.

---

## 4. Conclusion

The backend architecture for PLAN-064 is fully specified and ready for implementation.
Key deliverables designed:
- **Migration:** `infrastructure/database/migrations/V107_Create_Licenciada_Onboarding_Funnel_Table.sql`
- **Services:**
  - `apps/web-app/src/backend/api/v1/Services/SimpleOcrService.php`
  - `apps/web-app/src/backend/api/v1/Services/OnboardingService.php`
- **Controller & Routes:**
  - `apps/web-app/src/backend/api/v1/Controllers/OnboardingController.php`
  - Endpoints in `apps/web-app/src/backend/api/v1/index.php`
- **Contracts:** Aligned with `openspec/contracts/admin/gestor-onboarding-funnel.json`
- **Test Suite:** `tests/onboarding_funnel_smoke_test.php`

---

## 5. Verification Method

To independently verify the investigation findings and specifications:
1. Inspect the analysis report at:
   `f:\Body-Harmony-Remake\.agents\explorer_survey_backend_1\analysis.md`
2. Verify existing service implementations:
   - `apps/web-app/src/backend/api/v1/Services/AgendaService.php`
   - `apps/web-app/src/backend/api/v1/Services/ContractPdfService.php`
3. Verify test execution pattern by running an existing smoke test:
   ```pwsh
   php tests/agenda_smoke_test.php
   php tests/contracts_crud_smoke_test.php
   ```
4. Verify schema conformity against:
   - `infrastructure/database/DATABASE_MASTER_V36_1.sql`
   - `infrastructure/database/migrations/V101_Create_Contracts_And_Signatures.sql`
