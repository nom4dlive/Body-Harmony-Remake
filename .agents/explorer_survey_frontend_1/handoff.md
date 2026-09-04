# Handoff Report — Frontend Architecture Explorer (PLAN-064)

**Role:** Frontend Architecture Explorer  
**Working Directory:** `f:\Body-Harmony-Remake\.agents\explorer_survey_frontend_1`  
**Milestone:** PLAN-064 (Lead-to-Contract Funnel & Self-Onboarding)  
**Timestamp:** 2026-08-20T23:20:00-03:00  

---

## 1. Observation
* **Routing (`apps/web-app/src/frontend/src/App.jsx`):**
  - Configured with `react-router-dom` v7.1.1, utilizing `Suspense` and `lazy()` imports.
  - Public standalone routes exist for digital signing (`/assinar/:signToken` in line 218) and cryptographic validation (`/validar/:uuid` in line 221).
  - Protected admin routes are wrapped in `<ProtectedRoute>` under `${ROUTES.ADMIN}/*` and `/portal-gestor/*` (e.g. lines 183-203).
* **Styling & Theme (`src/frontend/src/styles/theme.js` & `GlobalStyles.jsx`):**
  - Strict luxury palette: Primary Navy Blue `#0A3E60`, Secondary/CTA Gold `#ED7E13`, Dark Background `#051A29`, Neutrals `#FFFFFF` / `#F8FAFC`.
  - Typography: Headings use Bison / Bison Bold / Oswald, Body uses Montserrat, Details use Poppins.
  - Mobile-first touch targets >= 44x44px (`min-height: 44px` / `h-11`).
* **API Client (`src/frontend/src/services/api.js`):**
  - Central `request()` function with stability retry mechanism (`fetchWithRetry`), cache invalidation (`NEXUS_CACHE`), and authentication header injection (`bh_auth` token).
  - Sub-API modules already implemented: `contractsApi` (line 1159), `whatsappApi` (line 2116), `gestorAgendaApi` (line 1236).
* **Existing UI Patterns:**
  - `GestorAgendaPage.jsx` & `AgendaKanbanListView.jsx`: Established dual-view pattern (Kanban columns + Table / Calendar), KPI metric cards, and 15-second background auto-polling.
  - `ContractsManager.jsx` & `ContractWizard.jsx`: Plan selection, template variable replacement, auto-fill, and SHA-256 digital signing.
  - `WhatsAppMessagesManager.jsx`: Deep-linking to WhatsApp (`https://wa.me/...`) with pre-composed templates.
* **Build System (`apps/web-app/package.json`, `vite.config.js`):**
  - Executed `npm run build` with exit code 0 in 21 seconds. No compilation errors.

---

## 2. Logic Chain
1. *Observation 1 (Public Standalone Routes):* The new public self-onboarding screen (`PublicOnboardingPage.jsx`) must be accessed without authentication via a cryptographically signed token (`/onboarding/:token` and `/pre-cadastro/:token`), isolated from marketing layout and bottom bars.
2. *Observation 2 (Admin Portal Integration):* The manager's dashboard (`OnboardingFunnelPage.jsx`) must reside under protected routes (`${ROUTES.ADMIN}/onboarding` and `/portal-gestor/onboarding`), wrapped with `AdminLayout`, and integrated with the sidebar navigation.
3. *Observation 3 (Dual View & Kanban Pattern):* Adopting the proven architectural pattern from `GestorAgendaPage`, the onboarding funnel will feature a 5-column Kanban (`Novo Lead / Pré-Cadastro`, `Link Enviado`, `Documentos Recebidos / OCR`, `Contrato Emitido`, `Ativa / Concluído`) along with a full searchable Table View and 15s real-time auto-polling.
4. *Observation 4 (1-Click Contract Generation):* In `GenerateContractModal.jsx`, collecting the parsed OCR data (Nome, CPF, RG, Endereço, WhatsApp, Email) allows immediate injection into contract template variables (`contractsApi.getTemplates`), calculating currency in words (`numeroPorExtenso`), and instantly producing the SHA-256 signature link for 1-click WhatsApp dispatch.
5. *Observation 5 (API Decoupling):* Defining `onboardingApi` in `services/api.js` ensures 100% contract symmetry with `openspec/contracts/admin/gestor-onboarding-funnel.json` under Constitution Rule 1 and Rule 6.

---

## 3. Caveats
* **Camera Capture on Mobile Browsers:** When using `<input type="file" accept="image/*" capture="environment" />`, iOS Safari and Android Chrome behave differently with permissions. The component must allow both direct camera capture and selecting photos from the device gallery.
* **File Upload Payload Size:** Uploading high-resolution camera photos (e.g. 5-15MB) requires client-side validation to ensure payloads do not exceed server post limits (10MB limit advised, with clear warning).

---

## 4. Conclusion
The React 18 frontend architecture in `apps/web-app` is completely ready and structurally suited for the PLAN-064 implementation. All architectural patterns, design tokens, icons, and build pipelines have been thoroughly investigated, validated, and documented in `analysis.md`. The implementer can proceed directly to component construction without architectural ambiguity.

---

## 5. Verification Method
1. **Source Code Inspection:**
   - Review architectural report: `f:\Body-Harmony-Remake\.agents\explorer_survey_frontend_1\analysis.md`.
   - Inspect route declarations in `apps/web-app/src/frontend/src/App.jsx`.
   - Inspect API client patterns in `apps/web-app/src/frontend/src/services/api.js`.
2. **Build Verification:**
   - Execute in terminal:
     ```powershell
     cd f:\Body-Harmony-Remake\apps\web-app
     npm run build
     ```
   - Confirm exit code 0 and clean bundle creation in `build/public_html`.
