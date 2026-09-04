# PLAN-207: Assistente Visual de 1-Clique do Google OAuth no CRM Workspace

## 🎯 [OBJETIVO]
Criar assistente visual de 1-clique para autenticação OAuth2 do Google Workspace no CRM (`/portal-gestor/crm#settings-google`), com campos simplificados de Client ID/Secret, upload de arquivo, popup automático de consentimento e gravação transparente de tokens para `bodyharmony36@gmail.com`.

---

## 🛡️ [ESPAÇO NEGATIVO]
- Não alterar lógica de atendimento WhatsApp, kanban ou regras do Hermes AI.
- Não expor segredos no Git ou no frontend.
- Não quebrar suporte à Service Account já existente.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Step 1**: Contrato OpenSpec `google-oauth-flow.json` e teste web em `tests/google_oauth_web_flow_test.php`.
- [ ] **Step 2**: Controlador backend `api/v1/crm/google_oauth.php` com suporte a `get_auth_url`, `save_credentials` e `callback/exchange_code`.
- [ ] **Step 3**: Métodos OAuth no cliente `services/api.js`.
- [ ] **Step 4**: Assistente visual no modal do `GoogleWorkspaceHub.jsx` com popup de login Google.
- [ ] **Step 5**: Verificação via `nexus_gate.ps1` com Exit Code 0.

---

## 📁 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `openspec/contracts/crm/google-oauth-flow.json`
- `apps/web-app/src/backend/api/v1/crm/google_oauth.php`
- `apps/web-app/src/backend/api/v1/Services/GoogleWorkspaceService.php`
- `apps/web-app/src/frontend/src/services/api.js`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/GoogleWorkspaceHub.jsx`
- `tests/google_oauth_web_flow_test.php`
