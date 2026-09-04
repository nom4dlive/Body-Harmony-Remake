# 🚀 PLAN-192: Integração Neural Plena do Hermes no CRM (Copilot, Cockpit Simulator, Dossiê & Assistente Interno)

**Responsável:** `@antigravity`  
**Protocolo:** Nexus Protocol V3.2 / V4.9 Continuous Learning  
**Data:** 2026-09-01  
**Status:** `EM PLANEJAMENTO`

---

## 🎯 1. [OBJETIVO]
Conectar integralmente a inteligência do Hermes (Qwen Proxy na VPS) em todos os pontos do CRM web (`portal-gestor/crm`), eliminando chatbots burros, respostas estáticas e bloqueios indevidos do modo silencioso, fornecendo:
1. **Copilot Contextual na Inbox** com histórico multi-turno e identidade do operador.
2. **Cockpit Simulator 100% Neural** sem recusa no canal jurídico quando ativado e com raciocínio real de personas.
3. **Gerador de Dossiê IA** automático por contato.
4. **Widget de Assistente Interno do Hermes** para dúvidas corporativas e clínicas da equipe.

---

## 🛑 2. [ESPAÇO NEGATIVO]
- **NÃO** utilizar nenhuma API externa paga (Gemini/OpenAI). Motor 100% Qwen Proxy dedicado.
- **NÃO** alterar regras de segurança de Whitelist no WhatsApp da Evolution API.
- **NÃO** quebrar o layout Luxury ou responsividade do CRM.

---

## ⚡ 3. [MICRO-STEPS DE DOPAMINA (3 a 5 min cada)]

- [ ] **Passo 1 (Ponte de IA Backend)**: Atualizar `HermesCrmAgentService.php` para que `testPrompt`, `generateCopilotDraft`, `generateDossierSummary` e o novo `internalAssistantChat` consumam diretamente o Qwen Proxy da VPS com identidade do operador e histórico.
- [ ] **Passo 2 (Correção de Persistência & Jurídico)**: Corrigir o salvamento e leitura de `is_active` em `crm_hermes_prompts` para que a ativação do canal Jurídico no Cockpit seja refletida imediatamente no simulador sem respostas de recusa.
- [ ] **Passo 3 (Frontend Inbox Copilot & Dossiê)**: Atualizar `OmnichannelInbox.jsx` e `api.js` para passar o operador logado e histórico completo ao acionar sugestão de resposta e resumo de dossiê.
- [ ] **Passo 4 (Frontend Cockpit Simulator)**: Refatorar `HermesAgentCockpit.jsx` para exibir pensamento da IA, latência real, histórico interativo contínuo e sincronização automática com o toggle das linhas.
- [ ] **Passo 5 (Widget Assistente Interno)**: Adicionar mini-chat Copilot flutuante/lateral no CRM para suporte rápido aos atendentes.
- [ ] **Passo 6 (Deploy & Verificação Completa)**: Sincronizar via `fast_sync_api.py`, testar o simulador no canal Jurídico/Licenciadas e verificar todas as rotas com Exit Code 0.

---

## 📁 4. [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `openspec/contracts/crm/hermes_intelligence_hub.json`
- `apps/web-app/src/backend/api/v1/Services/HermesCrmAgentService.php`
- `apps/web-app/src/backend/api/v1/crm/hermes_agent_webhook.php`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/components/HermesAgentCockpit.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/OmnichannelInbox.jsx`
- `apps/web-app/src/frontend/src/services/api.js`
- `openspec/deltas/PLAN-192-hermes-full-crm-neural-integration.md`

---

## 🛡️ 5. [CRITÉRIO DE ACEITE / HARD GATE]
1. No Simulador do Cockpit, ao perguntar *"O que você sabe sobre o body harmony hermes?"* no canal Jurídico ativado, o Hermes responde com raciocínio real em vez de *"Modo Silencioso Ativo"*.
2. Na Inbox, o botão de Sugestão gera respostas personalizadas com base no operador logado e histórico real da conversa.
3. Geração de Dossiê produz análise contextual profunda da conversa.
4. Latência inferior a 3s e 0 dependências de Gemini.
