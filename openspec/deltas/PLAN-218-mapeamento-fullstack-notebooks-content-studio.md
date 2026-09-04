# 📋 PLAN-218 — Mapeamento Fullstack do Sistema de Cadernos & Content Studio (Zero Mocks / Rotas Reais)

## [OBJETIVO]
Integrar de ponta a ponta as 5 abas do Portal do Gestor LMS (`Módulos & Cadernos`, `Licenciadas & Cotas`, `Podcasts do Estúdio`, `Radar de Insights`, `Governança & Persona IA`) e o botão "Transcrever" do LMS Content Studio com o Google NotebookLM e o banco MySQL, eliminando 100% dos dados mockados, garantindo que todos os botões e rotas sejam reais e funcionais.

---

## 🚫 [INVARIANTES & ZERO-TOLERANCE]
- ❌ **Zero Mock Data**: Nenhum array fake ou valores estáticos hardcoded. Se não houver dados no banco, a UI exibe Empty State elegante.
- ❌ **Zero Botões Inúteis**: Cada botão no frontend está conectado a uma ação real do backend (`triggerSync`, `handleRetranscribeLesson`, `handleTogglePodcast`, `handleStartImpersonation`, `handleSaveGovernance`, `handleConnectGoogle`).
- ❌ **Zero Rotas Inexistentes**: Toda requisição disparada pelo frontend existe no `api/v1/index.php` e no microserviço FastAPI (`apps/notebook-bridge/app.py`).

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [x] **Passo 1 (Eliminar Mocks em LmsNotebookService)**: Substituir dados estáticos de `listBetaTesters`, `getClinicalInsights`, `getStudioPodcastsGallery` e `getModuleSourcesAndTranscripts` por consultas SQL reais.
- [x] **Passo 2 (Garantir Tabelas & Schemas)**: Criar migração defensiva (`ensureColumns`) para as tabelas `smartbook_generated_artifacts`, `lms_module_sources` e `lms_notebook_chats` com índices adequados.
- [x] **Passo 3 (Fluxo Completo de Transcrição)**: Conectar `AdminLmsController::retranscribeLesson` e `LmsNotebookService` ao microserviço FastAPI com atualização de status em tempo real.
- [x] **Passo 4 (Validação & Hard-Gate)**: Testar todas as 5 abas, verificar build frontend e rodar `scripts/nexus_gate.ps1` com Exit Code 0.

---

## 📦 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
1. `openspec/contracts/admin/lms-notebook-fullstack-spec.json` (Contrato Unificado)
2. `apps/web-app/src/backend/api/v1/Services/LmsNotebookService.php` (Queries Reais & Zero Mocks)
3. `apps/web-app/src/backend/api/v1/Controllers/AdminLmsController.php` (Botão Transcrever)
4. `apps/web-app/src/frontend/src/pages/Admin/LMS/LMSNotebooksManager.jsx` (5 Abas Reais + Empty States)
5. `apps/web-app/src/frontend/src/pages/Admin/LMS/LMSStudio.jsx` (Content Studio Transcrever)

---

## 📊 [SAVE STATE]
- **Status**: 🟢 CONCLUÍDO & VERIFICADO
- **Data**: 2026-09-03
- **Nexus Protocol**: V3.2
