# PLAN-211: Refatoração Integral da Interface & Arquitetura Visual SaaS do CRM

## 🎯 Objetivo
Transformar o CRM do Portal Gestor (`/portal-gestor/crm`) em uma experiência SaaS moderna, limpa, coesa e com ergonomia de classe mundial, eliminando barras redundantes, scrollbars duplas e cortes de botões.

## 🛡️ Espaço Negativo
- Nenhuma alteração em endpoints backend `/v1/crm/*`.
- Nenhuma alteração de lógicas de WebSockets, sincronização do WhatsApp ou banco de dados.

## ⚡ Micro-Steps de Dopamina (3-5 min)
- [ ] **Step 1**: Header Global & Dropdown Responsivo "Mais Ações" no Chat (`OmnichannelInbox.jsx`).
- [ ] **Step 2**: Dossiê 360° & Telemetria com Segmented Control e Single Scroll (`OmnichannelInbox.jsx`).
- [ ] **Step 3**: Lista de Conversas SaaS & Hierarquia Tipográfica (`OmnichannelInbox.jsx`).
- [ ] **Step 4**: Padronização dos Formulários e Tabelas de Gestão (`UnifiedSettingsHub.jsx`, `GoogleWorkspaceHub.jsx`).
- [ ] **Step 5**: Verificação Deterministica, `vite build` e Hard-Gate (`nexus_gate.ps1`).

## 📁 Arquivos Envolvidos
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/OmnichannelInbox.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/CRMWorkspaceV4.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/UnifiedSettingsHub.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/GoogleWorkspaceHub.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/KanbanPipeline.jsx`
