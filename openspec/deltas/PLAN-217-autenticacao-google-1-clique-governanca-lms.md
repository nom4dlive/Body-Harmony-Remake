# 📋 PLAN-217 — Autenticação Google 1-Clique Vitalícia & Saneamento de Governança no LMS

## [OBJETIVO]
Implementar o fluxo de autenticação 1-Clique com a conta Google para o Google NotebookLM diretamente no Portal do Gestor LMS (`/portal-gestor/lms` > Governança & Persona IA), com salvamento permanente do Refresh Token no `site_config` do MySQL e renovação automática silenciosa, eliminando configurações legadas de Qwen/OpenNotebook e sem expiração de 30 dias.

---

## 🗺️ [SANEAMENTO & ELIMINAÇÃO DE CONFIGURAÇÕES LEGADAS]
- ❌ **Eliminado**: Exibição e campos do modelo legado `Qwen/Qwen2.5-32B-Instruct-GPTQ-Int4 (Proxy Local VPS)`.
- ❌ **Eliminado**: Badges obsoletos de Grafo SurrealDB/OpenNotebook na visão geral.
- ❌ **Eliminado**: Sementes estáticas de governança no `LmsNotebookService.php`.
- 🔵 **Novo Padrão Ativo**: Motor Google Gemini NotebookLM com Card Visual 1-Clique, status da sessão e renovação contínua de credenciais.

---

## 🚫 [ESPAÇO NEGATIVO]
- O QUE NÃO FOI TOCADO:
  - Não alterar nem interferir no `qwenproxy` do Hermes Agent.
  - Não modificar as rotas de Alunas, Módulos ou Certificados do LMS.
  - Não alterar a tabela de usuários administradores ou financeiro.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [x] **Passo 1 (Endpoints OAuth PHP & Contratos)**: Criar endpoints `/auth/google/url`, `/auth/google/callback`, `/auth/status` e `/auth/disconnect` em `LmsNotebookController.php` e registrá-los em `api/v1/index.php`.
- [x] **Passo 2 (Sincronização no FastAPI Bridge)**: Implementar endpoint `/api/v1/notebook/auth/set-tokens` no `apps/notebook-bridge/app.py` para recarregar o cliente NotebookLM automaticamente.
- [x] **Passo 3 (Card 1-Clique no Frontend)**: Atualizar a aba "Governança & Persona IA" em `LMSNotebooksManager.jsx` com o Card de Conexão Google 1-Clique e remoção dos campos obsoletos de Qwen.
- [x] **Passo 4 (Validação e Hard-Gate)**: Testar fluxo de autenticação, verificar build do frontend e rodar `scripts/nexus_gate.ps1` com Exit Code 0.

---

## 📦 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
1. `openspec/contracts/admin/lms-notebook-google-auth.json` (Contrato API First)
2. `apps/web-app/src/backend/api/v1/Controllers/LmsNotebookController.php` (Endpoints OAuth)
3. `apps/web-app/src/backend/api/v1/Services/LmsNotebookService.php` (Gestão de Tokens em `site_config`)
4. `apps/web-app/src/backend/api/v1/index.php` (Registro de Rotas)
5. `apps/notebook-bridge/app.py` (Recepção de Tokens no Microserviço)
6. `apps/web-app/src/frontend/src/pages/Admin/LMS/LMSNotebooksManager.jsx` (Card 1-Clique)

---

## 📊 [SAVE STATE]
- **Status**: 🟢 CONCLUÍDO & VERIFICADO
- **Data**: 2026-09-03
- **Nexus Protocol**: V3.2
