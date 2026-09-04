# PLAN-212: Auditoria Fullstack, Conexão Real de APIs e Humanização do CRM

## 🎯 Objetivo
Auditar o CRM para conectar 100% das telas a endpoints reais de backend e substituir vocabulários de engenharia por linguagem acolhedora para recepcionistas e atendentes.

## 🛡️ Espaço Negativo
- Nenhuma alteração em regras de banco de dados ou autenticação.

## ⚡ Micro-Steps de Dopamina (3-5 min)
- [ ] **Step 1**: Humanização do `OmnichannelInbox.jsx` (Assistente Virtual, Ficha do Paciente, Status do WhatsApp).
- [ ] **Step 2**: Humanização do `UnifiedSettingsHub.jsx` (Setores, Atendentes & Equipe, Relatórios).
- [ ] **Step 3**: Auditoria & Empty States em `AnalyticsCockpit.jsx`.
- [ ] **Step 4**: Auditoria & Tratamento de Desconexão em `GoogleWorkspaceHub.jsx`.
- [ ] **Step 5**: Verificação Deterministica (`vite build` + `nexus_gate.ps1`).

## 📁 Arquivos Envolvidos
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/OmnichannelInbox.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/UnifiedSettingsHub.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/AnalyticsCockpit.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/GoogleWorkspaceHub.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/SettingsManager.jsx`
