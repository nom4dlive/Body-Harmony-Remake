# 🎯 Objetivo Fullstack
Realizar a integração e orquestração total e definitiva do ecossistema de comunicação (CRM V4 + Chatwoot Headless + Evolution API v2), mapeando todas as rotas ativas e inexploradas, eliminando gargalos operacionais e ativando recursos avançados (mídias ricas, áudios PTT nativos, sincronização de fotos de perfil, auto-link `/chatwoot/set`, status de conversas e atribuição inteligente de agentes).

---

# 📜 Contratos de API (REGRA 1)
- [x] `openspec/contracts/crm/channels-crud.json` (Atualizado para suportar auto-link `/chatwoot/set`)
- [ ] `openspec/contracts/crm/inbox-media-upload.json` (Envio de áudio PTT, imagens e PDFs)
- [ ] `openspec/contracts/crm/conversation-actions.json` (Atribuição, alternância de status Open/Resolved/Snoozed, Labels)
- [ ] `openspec/contracts/crm/contact-verification.json` (Checagem de número WhatsApp e foto de perfil)

---

# 🚫 Espaço Negativo (Fora de Escopo)
- [x] Infraestrutura Docker/Traefik e restrição de localhost (`127.0.0.1:3306`) do banco de dados (Imutável - REGRA 2).
- [x] Exposição de portas do Chatwoot / Evolution para a WAN sem gateway reverso seguro.
- [x] Alteração no core do roteador de contratos ou gateway de pagamento Asaas/Stone.

---

# 🗄️ Camada de Dados (SQL)
- [ ] `crm_channels`: Adição de colunas `chatwoot_inbox_id`, `chatwoot_webhook_token`, `qrcode_base64`.
- [ ] `crm_messages`: Suporte a metadados de anexos (`media_url`, `media_type`, `file_size`, `duration_seconds`).
- [ ] `crm_attendants`: Mapeamento de `chatwoot_agent_id` e status de disponibilidade (`ONLINE`, `BUSY`, `OFFLINE`).

---

# ⚙️ Camada de Backend (PHP 8.4)
- [ ] **`EvolutionApiService.php`**:
  - `setChatwootLink(instance, chatwootUrl, token, accountId)` (`/chatwoot/set/{instance}`).
  - `sendMedia(instance, phone, mediaUrl, mediaType, caption)`.
  - `sendWhatsAppAudio(instance, phone, audioUrl)`.
  - `fetchProfilePicture(instance, phone)`.
  - `checkWhatsAppNumber(instance, phone)`.
  - `fetchHistoricMessages(instance, phone, count)`.
- [ ] **`CrmBridgeService.php`**:
  - Orquestração de Caixas de Entrada Chatwoot (`createInbox`, `assignAgentToInbox`).
  - Atribuição de conversas (`assignConversation`, `toggleConversationStatus`).
- [ ] **Novos / Atualizados Controllers em `api/v1/crm/`**:
  - `inbox_messages.php`: Suporte a upload multipart/anexos (PDF, Áudio, Imagem).
  - `inbox_actions.php`: Ações de conversa (Mudar status, Atribuir atendente, Adicionar Tags).
  - `channels.php`: Execução do auto-link instantâneo com Chatwoot ao criar instância.

---

# ⚛️ Camada de Interface (React V3.1)
- [ ] **`OmnichannelInbox.jsx`**:
  - Gravador e disparador de Áudio WhatsApp nativo (PTT) com microfone.
  - Upload de anexos e documentos (PDF de contratos, comprovantes) com visualização inline.
  - Seletor de Status da Conversa (Aberto, Resolvido, Pendente) e Atribuição rápida (Guilherme, Giovanna, Cibele).
  - Exibição de Avatar real extraído do WhatsApp via `/chat/fetchProfilePictureUrl`.
- [ ] **`ChannelsManager.jsx`**:
  - Indicador de status do link Evolution ↔ Chatwoot em tempo real.
  - Botão de "Re-sincronizar Instância" e "Verificar Conexão".

---

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Web Hosting (45.152.44.244):** Build SPA React atualizado (`npm run build`), sincronizando `index.html` e `assets/` via `deploy-hostinger.ps1`.
- **VPS Hostinger Dedicada (2.25.156.25):** Atualização dos serviços PHP (`EvolutionApiService.php`, `CrmBridgeService.php`, `inbox_messages.php`, `inbox_actions.php`) e execução das migrations MySQL.

---

# 🔍 Monitoramento Semântico (Regression Watch)
- [ ] `api/v1/crm/channels.php`
- [ ] `api/v1/crm/inbox_conversations.php`
- [ ] `api/v1/crm/inbox_messages.php`
- [ ] `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/OmnichannelInbox.jsx`
- [ ] `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/ChannelsManager.jsx`

---

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Erro de autenticação na comunicação com Chatwoot/Evolution pode silenciar recebimento de mensagens.
- **Mitigação:** Tratamento defensivo de timeouts com fallback para armazenamento local no MySQL e retry queue.
- **Rollback:** `git checkout HEAD~1` nas rotas do CRM e restauração do snapshot da tabela `crm_channels`.

---

# ✅ Checklist de Execução Atômica
- [ ] 1. Implementar método `setChatwootLink` e `sendMedia` no `EvolutionApiService.php`.
- [ ] 2. Criar controller `api/v1/crm/inbox_actions.php` para gerenciar status, transferências e tags de conversas.
- [ ] 3. Estender `inbox_messages.php` para receber mídias e gravar áudios.
- [ ] 4. Atualizar `OmnichannelInbox.jsx` com player/gravador de áudio, upload de arquivos e ações de status.
- [ ] 5. Executar testes de fumaça CLI (`tests/crm_fullstack_integration_smoke_test.php`).
- [ ] 6. Realizar build do frontend e registrar no cofre do Obsidian.
