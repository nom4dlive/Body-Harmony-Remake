# 🏛️ PLAN-224: Extirpação do Chatwoot & Pipeline Direto Evolution API v2 ↔ PHP/MySQL ↔ React

## 🎯 1. [OBJETIVO]
Eliminar integralmente a camada intermediária do Chatwoot (Rails, PostgreSQL, Sidekiq e proxies associados) do CRM Body Harmony, conectando a Evolution API v2 diretamente ao Backend PHP 8.4 e ao Banco MySQL em uma tubulação de 2 vias de alta performance e baixa latência, preservando 100% dos recursos do frontend (Atendimento Omnichannel, Google Workspace e Hermes Copilot).

---

## 🚫 2. [ESPAÇO NEGATIVO]
1. NÃO alterar tabelas alheias ao CRM (ex: tabelas de contratos, alunas, cursos e transações da loja/checkout).
2. NÃO alterar instâncias ou chaves da Evolution API já configuradas na VPS.
3. NÃO utilizar bibliotecas visuais pesadas além do Tailwind CSS e componentes styled já integrados.

---

## ⚡ 3. [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Passo 1 (Banco de Dados)**: Criar Migration `V192__crm_direct_pipeline_conversations_and_messages.sql` com tabelas `crm_conversations` e `crm_messages` indexadas.
- [ ] **Passo 2 (Webhook de Ingestão)**: Implementar `apps/web-app/src/backend/api/v1/crm/evolution_webhook.php` tratando `MESSAGES_UPSERT` (`fromMe`, `@g.us`, quotes, mídias), `MESSAGES_UPDATE` e `CONNECTION_UPDATE`.
- [ ] **Passo 3 (Serviço de Disparo & Endpoints)**: Refatorar `EvolutionApiService.php`, `inbox_messages.php` e `inbox_conversations.php` para escrita/leitura direta no MySQL e cURL na Evolution API.
- [ ] **Passo 4 (Frontend Luxury)**: Refatorar `OmnichannelInbox.jsx` (eliminar ActionCable/chatwootId, quotes compactos, player de áudio, cards de documento, nomes de participantes em grupos e badges limpos).
- [ ] **Passo 5 (Blindagem Google & Hermes)**: Validar integração contínua do Google Workspace e histórico multiturno do Hermes Copilot via `crm_messages`.
- [ ] **Passo 6 (Infraestrutura & Gates)**: Limpar `docker-compose.crm.yml`, `crm-bodyharmony.nginx.conf` e executar `npm run build` com validação de sintaxe PHP.

---

## 📁 4. [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `infrastructure/database/migrations/V192__crm_direct_pipeline_conversations_and_messages.sql`
- `apps/web-app/src/backend/api/v1/crm/evolution_webhook.php`
- `apps/web-app/src/backend/api/v1/crm/inbox_messages.php`
- `apps/web-app/src/backend/api/v1/crm/inbox_conversations.php`
- `apps/web-app/src/backend/api/v1/crm/inbox_actions.php`
- `apps/web-app/src/backend/api/v1/Services/EvolutionApiService.php`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/OmnichannelInbox.jsx`
- `docker-compose.crm.yml`
- `infrastructure/docker/crm/crm-bodyharmony.nginx.conf`
