# 🚀 PLAN: Auditoria de Frontend do CRM, Correção de Logs & Motor de IA Real do Hermes (V4.6)

**Identificador:** `PLAN-crm-frontend-audit-and-hermes-real-ai`  
**Data:** 2026-08-31  
**Status:** PROPOSED  
**Autor:** Antigravity Architect  

---

## 🎯 Objetivo
Corrigir e refinar a experiência do CRM Omnichannel, eliminando erros de requisição 400 mapeados em `tmp/crm.log`, corrigindo distorções visuais de avatares, adicionando parser automático de URLs de mídia nos balões de chat, zerando o contador de não lidas de forma reativa e conectando o Hermes Copilot a um motor de inferência contextual real com multi-turnos de diálogo.

---

## 📋 Lista de Tarefas (Tracker)

### 1. Camada de Backend (PHP 8.4) & Correção de Logs
- [ ] Atualizar `inbox_messages.php` para aceitar envios de mídia com texto vazio e evitar erro 400 Bad Request.
- [ ] Atualizar `inbox_conversations.php` para filtrar mensagens de atividade interna do Chatwoot no snippet e extrair `assignee_name`.
- [ ] Aprimorar `HermesCrmAgentService.php` com suporte a histórico multi-turnos e contexto de dossiê em `generateCopilotDraft`.

### 2. Camada de Frontend (React 18)
- [ ] Corrigir distorção de avatar em `OmnichannelInbox.jsx` com `flex-shrink: 0`, dimensões fixas e `aspect-ratio: 1/1`.
- [ ] Implementar parser inteligente de mídias para renderizar imagens e áudios em balões que contenham URLs de upload.
- [ ] Implementar limpeza reativa de contador de não lidas ao clicar na conversa.
- [ ] Exibir badge do atendente responsável no card da conversa e no cabeçalho.

### 3. Validação & Build
- [ ] Executar `php -l` em todos os arquivos modificados.
- [ ] Executar `npm run build` no frontend e validar Exit Code 0.
- [ ] Registrar entrega no Obsidian Vault via `agent_vault_logger.py`.
