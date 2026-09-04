# 🎯 PLAN-106: Blindagem & Auto-Heal do LMS Gestor (/admin/lms/modules)

## 📌 [OBJETIVO]
Eliminar o erro 503 (*Nexus Service Temporarily Unavailable / Uplink Limit*) ao carregar os módulos no LMS Gestor (`https://bodyharmony.com.br/portal-gestor/lms`), implementando auto-recuperação de schema SQL (`ensureTables`), query resiliente com fallback seguro e invalidação de cache.

---

## 🛡️ [ESPAÇO NEGATIVO]
- Proibido alterar contratos de resposta da API consumidos pelo React (`LMSService.getModules`).
- Proibido desativar a camada de segurança de autenticação do Middleware Gestor (`admin`).
- Proibido remover a proteção de cache `ResponseCache` para evitar sobrecarga de conexões.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3 a 5 min)]

- [ ] **Passo 1: Auto-Heal de Schema no `AdminLmsController`**
  - Implementar método `ensureTables()` em `AdminLmsController::__construct()` garantindo criação e colunas em `lms_modules`, `lms_lessons` e `lms_attachments` (`is_exclusive`, `hls_path`, `transcription_*`, `last_modified_*`, `is_downloadable`).

- [ ] **Passo 2: Query Resiliente com Fallback Seguro em `indexData()`**
  - Envolver a query complexa com `LEFT JOIN` em bloco resiliente; em caso de falha de coluna em runtime, acionar fallback limpo sem derrubar a API com 503.

- [ ] **Passo 3: Blindagem do `ResponseCache::serve()`**
  - Diferenciar exceções de sintaxe/coluna vs falhas reais de conexão PDO, evitando falso-positivo de "Uplink Limit".

- [ ] **Passo 4: Validação Deterministica & Deploy**
  - Rodar `php -l`, validar rotas e executar `scripts/nexus_gate.ps1` com Exit Code 0.

---

## 📁 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `apps/web-app/src/backend/api/v1/Controllers/AdminLmsController.php`
- `apps/web-app/src/backend/api/v1/Core/ResponseCache.php`
- `openspec/contracts/admin/lms_modules.json`
