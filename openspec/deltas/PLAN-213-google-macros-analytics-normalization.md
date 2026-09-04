# PLAN-213: Normalização de Dados Google Workspace, Autocomplete de Macros no Chat & Correção de Métricas

## 🎯 Objetivo
Corrigir inconsistências no painel Google Workspace, implementar autocomplete de macros (`/`) no chat com suporte a teclado e normalizar cálculos do painel de Analytics.

## 🛡️ Espaço Negativo
- Nenhuma alteração nas tabelas SQL ou no sistema de login.

## ⚡ Micro-Steps de Dopamina (3-5 min)
- [ ] **Step 1**: Autocomplete de Macros com `/` no `OmnichannelInbox.jsx`.
- [ ] **Step 2**: Hitbox `min-height: 40px` no `RightTabs` do `OmnichannelInbox.jsx`.
- [ ] **Step 3**: Normalização de Cálculos e Plural em `AnalyticsCockpit.jsx`.
- [ ] **Step 4**: Fallbacks e Empty State em `GoogleContactsTable.jsx` e `GoogleWorkspaceHub.jsx`.
- [ ] **Step 5**: Verificação Deterministica (`vite build` + `nexus_gate.ps1`).

## 📁 Arquivos Envolvidos
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/OmnichannelInbox.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/AnalyticsCockpit.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/components/GoogleContactsTable.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/GoogleWorkspaceHub.jsx`
