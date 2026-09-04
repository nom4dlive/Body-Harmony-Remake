# PLAN-205: Auditoria Fullstack & Centro de Comando Visual do Google Workspace no CRM

## 🎯 [OBJETIVO]
Criar um Centro de Comando Visual e transparente para o Google Workspace (Drive, Calendar, People API) no `/portal-gestor/crm` voltado para `bodyharmony36@gmail.com`, eliminando mocks silenciosos e provendo diagnóstico e gestão de credenciais em tempo real.

---

## 🛡️ [ESPAÇO NEGATIVO]
- Não alterar regras de mensagens WhatsApp ou automações do Hermes AI.
- Não alterar tabelas do banco não relacionadas aos contatos/agendamentos Google.
- Não expor credenciais no Git nem no frontend.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Step 1**: Contrato OpenSpec e teste de fumaça diagnóstico (`tests/google_workspace_live_audit_test.php`).
- [ ] **Step 2**: Backend `GoogleWorkspaceService.php` e `google_status.php` com suporte a probe real, salvamento seguro de tokens e `bodyharmony36@gmail.com`.
- [ ] **Step 3**: Frontend `services/api.js` com rotas de diagnóstico e credenciais transparentes.
- [ ] **Step 4**: Frontend `GoogleWorkspaceHub.jsx` com Command Center visual, badge Live/Fallback, Teste de Latência e Modal de Conexão.
- [ ] **Step 5**: Validação via `nexus_gate.ps1` com Exit Code 0.

---

## 📁 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `openspec/contracts/crm/google-oauth-status.json`
- `apps/web-app/src/backend/api/v1/Services/GoogleWorkspaceService.php`
- `apps/web-app/src/backend/api/v1/crm/google_status.php`
- `apps/web-app/src/frontend/src/services/api.js`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/GoogleWorkspaceHub.jsx`
- `tests/google_workspace_live_audit_test.php`
