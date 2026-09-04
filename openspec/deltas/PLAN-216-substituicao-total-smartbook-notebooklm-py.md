# 📋 PLAN-216 — Substituição Total do Backend do SmartBook por notebooklm-py (Google NotebookLM)

## [OBJETIVO]
Substituir integralmente o backend legado do SmartBook e de Transcrição por um microserviço Python dedicado (`apps/notebook-bridge/`) baseado na biblioteca `notebooklm-py`, conectando o ecossistema Body Harmony nativamente ao Google NotebookLM (Gemini) para transcrição de vídeos em segundos, RAG clínico com citações reais e geração de podcasts (MP3), quizzes e mapas mentais, preservando 100% dos demais serviços da VPS (como o QwenProxy do Hermes Agent).

---

## 🗺️ [MAPEAMENTO DE STACKS NA VPS — ISOLAMENTO & SEGURANÇA]

### 🟢 STACKS MANTIDAS & INTOCADAS (ZERO IMPACTO)
- **`bodyharmony-qwenproxy` (Portas 8003:3000 / 4005)**:
  - Continua 100% ativo, exclusivo e intocado para o **Hermes Agent** (`HermesCrmAgentService.php`, `HermesAdvancedIntelligenceService.php`, Soul Memory e disparo proativo WhatsApp).
- **`evo-crm` / `evo-auth` (Rede 27xxx)**:
  - Mantidos operando normalmente.
- **`evolution-api` (WhatsApp Gateway)**:
  - Mantida operando normalmente.

### 🔴 STACKS ELIMINADAS (DESATIVAÇÃO DO LEGADO FALHO)
- **`bodyharmony-open-notebook` / SurrealDB legado**:
  - Desativação do container/worker quebrado na VPS.
- **Chamadas de Qwen para SmartBook no PHP**:
  - Remoção de `qwen/v1/chat/completions` de dentro do `LmsNotebookService.php`.
- **Mocks & Sementes Estáticas**:
  - Eliminação da transcrição hardcoded `"Transcrição oficial Faster-Whisper..."` e das sementes estáticas de `seedDefaultModuleArtifacts()`.

### 🔵 NOVA STACK INCLUÍDA
- **`bodyharmony-notebooklm-bridge` (FastAPI / Porta 5055)**:
  - Container/serviço Python leve que encapsula o `notebooklm-py` de `F:\Organizado\01_IA_AGENTES\notebooklm-py`.
  - Gerencia autenticação de sessão Google, criação de 1 Caderno por Módulo, ingestão de vídeos/PDFs e geração de artefatos do Studio.

---

## 🚫 [ESPAÇO NEGATIVO]
- O QUE NÃO FOI TOCADO:
  - Não modificar nem reiniciar o `qwenproxy` do Hermes CRM.
  - Não alterar a interface React nem os contratos públicos de `smartbookApi.js`.
  - Não alterar o sistema de RBAC de alunas, taxas financeiras ou DRM de PDFs.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [x] **Passo 1 (Microserviço Python)**: Criar `apps/notebook-bridge/` com FastAPI, integrando o `notebooklm-py` para sync de módulos, chat grounded e geração de artefatos (áudio MP3, quiz, mindmap, report).
- [x] **Passo 2 (Gateway PHP)**: Refatorar `LmsNotebookService.php` para encaminhar queries e transformações para o `notebook-bridge` (`http://127.0.0.1:5055`), salvando cache real no MySQL (`smartbook_generated_artifacts`) e storage de mídia.
- [x] **Passo 3 (Ingestão de Mídia LMS)**: Atualizar `AdminLmsController.php` para disparar sync assíncrono de aulas/PDFs no caderno do módulo via `POST /api/v1/notebook/sync-module`.
- [x] **Passo 4 (Infraestrutura & Configuração)**: Criar `docker-compose.notebooklm.yml` / Dockerfile e documentar variáveis de ambiente (`NOTEBOOKLM_SESSION_FILE`, `NOTEBOOK_BRIDGE_URL`).
- [x] **Passo 5 (Validação e Hard-Gate)**: Testar rotas de chat e artefatos, verificar isolamento do QwenProxy/Hermes e executar `scripts/nexus_gate.ps1` com Exit Code 0.

---

## 📦 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
1. `apps/notebook-bridge/app.py` (Novo microserviço FastAPI)
2. `apps/notebook-bridge/requirements.txt` (Dependências Python com notebooklm-py)
3. `apps/notebook-bridge/Dockerfile` (Build da imagem Docker)
4. `apps/notebook-bridge/docker-compose.notebooklm.yml` (Manifesto de deploy isolado)
5. `apps/web-app/src/backend/api/v1/Services/LmsNotebookService.php` (Gateway HTTP PHP)
6. `apps/web-app/src/backend/api/v1/Controllers/AdminLmsController.php` (Sync de Mídia)
7. `openspec/contracts/smartbook/` (Contratos JSON de Governança)

---

## 📊 [SAVE STATE]
- **Status**: 🟢 CONCLUÍDO & VERIFICADO
- **Data**: 2026-09-03
- **Nexus Protocol**: V3.2
