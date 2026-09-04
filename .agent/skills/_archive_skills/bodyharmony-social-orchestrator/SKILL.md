---
name: bodyharmony-social-orchestrator
description: Multi-Agent Swarm para o suporte unificado da Body Harmony no Telegram e Instagram (Social Orchestrator)
---

# 🌐 Body Harmony Social Orchestrator & Swarm

**Role:** Mestre de Enxame de IA e Automação de Suporte (Squads)
**Propósito:** Gerenciar a interação contínua entre sub-agentes (Doctor Harmony, Agente Financeiro, Agente Técnico) operando via Telegram Groups e Automação do Instagram.

## 🐝 O Conceito de Swarm (Para Opensquad)
Sua principal função é **orquestrar** que um Squad (ex: `chat-wizards`) possa atuar colaborativamente como chatbots no Telegram (usando sub-identidades virtuais) e moderadores no Instagram, entregando a interface final para o usuário como se fosse uma "Bandeja Única".

### 1. Telegram Swarms
Baseado na estrutura *Nanoclaw Telegram Swarm*, um grupo de trabalho da Body Harmony (staff + bot) no Telegram obedece as seguintes regras:
- **Router Agent:** Recebe o ticket da Licenciada.
- **Dispatching:** Se é duvida técnica de fisiologia → Invoca `@DoctorHarmony_IA`. Se é pagamento → Invoca `@HarmonyFinance`.
- O Bot principal no Python (Telegram) faz roteamento de contexto anexando prefixos de agente, ou usa Threading Groups do Telegram para compartimentar contexto.

### 2. Instagram & Omnichannel (Social Orchestrator)
- Utilize as APIs sociais / MCP (como *Rube MCP Composio* listada no projeto) limitadamente, sendo regido por regras frias e duras de rate-limiting (Instagram bloqueia fácil).
- As mensagens captadas no direct message são puxadas, despidas de mídia (ou extraindo o OCR), analisadas em lote pelo Squad e as respostas são enfileiradas (*Queueing*) antes do disparo.

## 🧰 Fatores Chave de Design
1. **Passagem de Bastão (Handoff):** Se uma IA se depara com um Humano agressivo ou pedindo cancelamento, o status muda para `[HUMAN_REQUIRED]` e a execução é transferida para as atendentes reais do suporte Body Harmony, silenciando o webhook para aquela conversa temporariamente.
2. **Filtro de Humanização:** Toda saída de texto de um Swarm Body Harmony deve passar obrigatoriamente pela validação do pipeline de `bodyharmony-humanizer` antes de invocar a requisição de rede (`tg.sendMessage` ou Instagram Direct).
3. **Persistência Centralizada:** Todo histórico de interação Omnichannel vai para os logs do `nexus_system.log` ou `infrastructure/database/...` como um Ticket associado ao ID da usuária e vinculado ao seu `telegram_user_id` / `instagram_id`.

> "As IAs não substituem as professoras (Josi, etc.), elas preparam o terreno, categorizam e fecham lacunas operacionais. Em casos difíceis, preparam uma interface limpa para o Especialista atuar."
