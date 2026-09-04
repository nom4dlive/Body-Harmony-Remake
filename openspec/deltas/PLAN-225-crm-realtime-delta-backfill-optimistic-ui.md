# 🏛️ PLAN-225: Reatividade em Tempo Real, Backfill de Chats da Evolution API v2 & Optimistic UI

## 🎯 1. [OBJETIVO]
Fechar a última milha da experiência de usuário no CRM Body Harmony, tornando o chat 100% reativo em tempo real (< 1.5s via delta polling), populando as conversas da Evolution API no MySQL via script de backfill e aplicando Optimistic UI e formatação de números de telefone no React.

---

## 🚫 2. [ESPAÇO NEGATIVO]
1. NÃO alterar as regras de negócios de outros módulos do portal.
2. NÃO recriar conexões com o Chatwoot.
3. NÃO introduzir WebSockets pesados no frontend; manter delta polling leve e eficiente.

---

## ⚡ 3. [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Passo 1 (Reatividade Leve)**: Criar `inbox_poll_delta.php` e conectar loop de 1.5s no `OmnichannelInbox.jsx`.
- [ ] **Passo 2 (Backfill Evolution API)**: Adicionar `findChats` no `EvolutionApiService.php` e criar `sync_active_chats.php`.
- [ ] **Passo 3 (Optimistic UI & Telefones)**: Implementar `formatPhoneNumber` e inserção otimista de balões no `OmnichannelInbox.jsx`.
- [ ] **Passo 4 (Auditoria & Gates)**: Executar script de backfill, rodar `npm test` e `npm run build`.

---

## 📁 4. [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `apps/web-app/src/backend/api/v1/crm/inbox_poll_delta.php`
- `apps/web-app/src/backend/api/v1/Services/EvolutionApiService.php`
- `apps/web-app/src/backend/bin/sync_active_chats.php`
- `apps/web-app/src/frontend/src/services/api.js`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/OmnichannelInbox.jsx`
