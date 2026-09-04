# 📋 PLAN-219 — Refinamento do Login Google 1-Clique & Gestão de Credenciais OAuth na Governança

## [OBJETIVO]
Resolver o erro `Error 401: invalid_client` na autorização do Google, adicionando no painel do Gestor LMS (`/portal-gestor/lms` > Governança) a gestão visual de credenciais Google OAuth (`Client ID` e `Client Secret`) e suporte alternativo para vincular a sessão via Master Token / Session JSON com 1 clique, garantindo conexão estável e renovação permanente.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [x] **Passo 1 (Endpoints de Configuração OAuth no Backend)**: Adicionar rotas `GET /admin/lms/notebook/auth/config`, `POST /admin/lms/notebook/auth/config` e `POST /admin/lms/notebook/auth/session-token` no PHP.
- [x] **Passo 2 (Modal de Configurações no Frontend)**: Criar modal/painel expansível no `LMSNotebooksManager.jsx` com os campos de Client ID/Secret e opção de colar token direto.
- [x] **Passo 3 (Validação e Build)**: Testar rotas, verificar build frontend e executar `scripts/nexus_gate.ps1` com Exit Code 0.
- [x] **Passo 4 (Deploy & Smoke Test)**: Executar `/deploy` e verificar login em produção.

---

## 📊 [SAVE STATE]
- **Status**: 🟢 CONCLUÍDO & PUBLICADO EM PRODUÇÃO
- **Data**: 2026-09-03
- **Nexus Protocol**: V3.2
