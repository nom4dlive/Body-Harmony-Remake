# PLAN-214: Feedback Visual no Chat, Dossiê com Ações Reais & Refinamento do Kanban

## 🎯 Objetivo
Implementar indicadores de envio de mensagem no chat (relógio, check simples, duplo e erro com reenvio), unificar o dossiê com links clicáveis de Meet/Drive e adicionar drop zones visuais no Kanban.

## 🛡️ Espaço Negativo
- Nenhuma alteração nas tabelas SQL ou no sistema de autenticação.

## ⚡ Micro-Steps de Dopamina (3-5 min)
- [ ] **Step 1**: Indicadores de status de envio e empty state acolhedor em `OmnichannelInbox.jsx`.
- [ ] **Step 2**: Modal de feedback para links de Meet e Drive gerados.
- [ ] **Step 3**: Drop zones visuais e cards limpos em `KanbanPipeline.jsx`.
- [ ] **Step 4**: Consolidação das seções do Dossiê lateral em 3 fluxos claros.
- [ ] **Step 5**: Verificação Deterministica (`vite build` + `nexus_gate.ps1`).

## 📁 Arquivos Envolvidos
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/OmnichannelInbox.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/KanbanPipeline.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/CRMCockpitSidebar.jsx`
