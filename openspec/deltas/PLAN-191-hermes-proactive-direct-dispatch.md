# 🚀 PLAN-191: Disparo Direto Proativo Autônomo do Hermes via Evolution API v2

**Responsável:** `@antigravity`  
**Protocolo:** Nexus Protocol V3.2 / V4.9 Continuous Learning  
**Data:** 2026-09-01  
**Status:** `EM PLANEJAMENTO`

---

## 🎯 1. [OBJETIVO]
Implementar função e endpoint de disparo proativo autônomo do agente Hermes via Evolution API v2 (`POST /message/sendText/{instance}`), permitindo início imediato de conversas geradas por IA (Qwen Proxy) direcionadas exclusivamente ao número administrativo do gestor (`+5518996959486`) sem dependência de webhooks prévios.

---

## 🛑 2. [ESPAÇO NEGATIVO]
- **NÃO** disparar mensagens para nenhum número que não esteja na Whitelist (`+5518996959486`).
- **NÃO** alterar regras de roteamento de webhook já ativas na VPS (`http://172.16.9.1:3008`).
- **NÃO** introduzir dependência de chaves externas pagas (Gemini). O motor é 100% Qwen Proxy na VPS.
- **NÃO** remover as diretrizes invariantes de conduta (sem "Doutor", sem descontos não autorizados).

---

## ⚡ 3. [MICRO-STEPS DE DOPAMINA (3 a 5 min cada)]

- [ ] **Passo 1 (Backend Service)**: Adicionar método `dispatchProactiveMessage(string $instance, string $targetPhone, string $objective, array $context)` em `HermesCrmAgentService.php` integrando geração via Qwen Proxy e envio via `EvolutionApiService::sendTextMessage()`.
- [ ] **Passo 2 (REST API Endpoint)**: Criar `apps/web-app/src/backend/api/v1/crm/admin_direct_dispatch.php` com validação de contrato JSON, verificação estrita de Whitelist administrativa e resposta padronizada.
- [ ] **Passo 3 (CLI Test Script)**: Criar script executável `apps/web-app/src/backend/scripts/hermes_direct_dispatch.php` para acionamento via linha de comando no ambiente de desenvolvimento/VPS.
- [ ] **Passo 4 (Deploy & Sync)**: Sincronizar os novos arquivos para o ambiente de produção na Hostinger e VPS via `fast_sync_api.py`.
- [ ] **Passo 5 (Verificação Real & Gate)**: Executar um disparo proativo de teste com objetivo contextual para `+5518996959486` e confirmar recebimento real no WhatsApp com Exit Code 0.

---

## 📁 4. [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `openspec/contracts/crm/admin_direct_dispatch.json`
- `apps/web-app/src/backend/api/v1/Services/HermesCrmAgentService.php`
- `apps/web-app/src/backend/api/v1/crm/admin_direct_dispatch.php`
- `apps/web-app/src/backend/scripts/hermes_direct_dispatch.php`
- `openspec/deltas/PLAN-191-hermes-proactive-direct-dispatch.md`

---

## 🛡️ 5. [CRITÉRIO DE ACEITE / HARD GATE]
1. `POST /api/v1/crm/admin_direct_dispatch.php` com payload válido retorna HTTP 200 `{ "success": true, "action": "proactive_dispatched", "generated_message": "...", "delivery_status": 200 }`.
2. Tentativa de envio para qualquer número diferente de `+5518996959486` retorna HTTP 403 `{ "error": "DISPATCH_FORBIDDEN_NON_ADMIN" }`.
3. Mensagem chega instantaneamente no WhatsApp do gestor com texto gerado organicamente pelo Qwen Proxy.
