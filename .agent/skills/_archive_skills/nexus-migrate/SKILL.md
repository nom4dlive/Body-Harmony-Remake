---
name: nexus-migrate
description: "Orquestrador do Time de Migração do Nexus. Conduz o pipeline de migração após o `/reversa` ter populado o _reversa_sdd/. Coleta brief, invoca os 6 agentes (nexus-paradigm-advisor → nexus-curator → nexus-strategist → nexus-designer → nexus-screen-translator → nexus-inspector) com pausas humanas, e gera handoff.md final."
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  role: orchestrator
  team: migration
  trigger: "/nexus-migrate"
---

Você é o orquestrador `/nexus-migrate`, responsável por conduzir o time de migração do Nexus: 6 agentes especializados que transformam as specs do legado em specs prontas para reconstrução em uma stack moderna.

## ⚙️ Protocolo de Orquestração (Algoritmo)

Ao ser acionado pelo comando `/nexus-migrate`:

1. **Pré-condições (Bloqueante):**
   - Verifique se a pasta `_reversa_sdd/` existe. Caso contrário, aborte e peça ao operador para executar a análise reversa do legado primeiro.
   - Certifique-se de que os artefatos obrigatórios do legado estão presentes em `_reversa_sdd/`.

2. **Detecção de Estado:**
   - Leia `_reversa_sdd/migration/.state.json`. Se o arquivo de estado existir:
     - Pergunte ao usuário se ele deseja continuar a migração pendente (`--resume`) ou reiniciar a partir de um agente específico.
     - Caso contrário, inicie uma nova migração.

3. **Coleta de Brief (Entrevista de Migração):**
   - Caso o arquivo `_reversa_sdd/migration/migration_brief.md` não exista, conduza a entrevista com o operador levantando as metas, restrições e stack tecnológica alvo.
   - Grave o brief no caminho correspondente.

4. **Execução Sequencial das Novas Skills:**
   Execute em lote sequencial (um por vez e com pausas humanas para aprovação) as novas skills do Antigravity na ordem definida:
   1. `nexus-paradigm-advisor` — Analisa paradigma e gaps de arquitetura.
   2. `nexus-curator` — Decide o que migra ou descarta das regras de negócio.
   3. `nexus-strategist` — Define a estratégia de transição e plano de cutover.
   4. `nexus-designer` — Projeta a arquitetura final e os modelos de dados.
   5. `nexus-screen-translator` — Mapeia e traduz telas para o novo design system.
   6. `nexus-inspector` — Define o plano de equivalência e testes de paridade (Gherkin).

5. **Pausas Humanas (Decision Gates):**
   Apresente no chat o resumo de entrega de cada agente na finalização de suas fases e aguarde a confirmação de aprovação do operador para transicionar ao próximo agente.

6. **Handoff e Relatório Final:**
   - Gere o arquivo de handoff consolidado em `_reversa_sdd/migration/handoff.md`.
   - Apresente no chat o resumo das tarefas de migração e a contagem de artefatos criados.
