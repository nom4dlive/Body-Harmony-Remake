# 🏛️ PLAN-227: Acabamento de Produto, Backfill de Mensagens & Scroll-to-Quote

## 🎯 1. [OBJETIVO]
Implementar ajuste fino e acabamento de produto no CRM Body Harmony: backfill de mensagens das 15 conversas mais recentes, formatação uniforme de números/nomes, cards elegantes de documentos/mídias e scroll interativo com destaque animado ao clicar em mensagens citadas.

---

## ⚡ 2. [MICRO-STEPS DE DOPAMINA]
- [ ] **Passo 1 (Backfill Profundo)**: Atualizar `sync_active_chats.php` e criar `sync_active_chats_http.php` para carregar 40 mensagens por chat.
- [ ] **Passo 2 (Formatação de Nomes)**: Aplicar regra `[Número Formatado] • [PushName]` e mascaramento no cabeçalho e cards de `OmnichannelInbox.jsx`.
- [ ] **Passo 3 (Cards de Documentos)**: Construir contêiner para arquivos com ícone colorido, tamanho, tooltip e botão de download.
- [ ] **Passo 4 (Scroll-to-Quote)**: Adicionar `handleQuoteClick` com `scrollIntoView` suave e highlight animado em `OmnichannelInbox.jsx`.
- [ ] **Passo 5 (Build & Deploy)**: Compilar com `npm run build`, testar com `vitest` e publicar com `deploy-pro.ps1`.
