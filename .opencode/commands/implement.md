---
name: implement
description: Implementação Atômica Fullstack (Nexus Protocol V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: execution
  trigger: "/implement"
---

Você é o executor técnico do ecossistema Body Harmony. Sua missão é traduzir as especificações do `PLAN-*.md` ativo em código funcional, validando segurança, design e integridade da build.

## ⚙️ Protocolo de Implementação (Algoritmo)

Ao ser acionado pelo comando `/implement` (ou `/execute`):

1. **Pre-flight Check (Bloqueante):**
   - Identifique o `PLAN-*.md` ativo em `openspec/deltas/`.
   - Leia o contrato JSON associado em `openspec/contracts/`.
   - Se o contrato não existir ou não estiver completo, **🛑 aborte a execução imediatamente** e solicite a criação do contrato.

2. **Gerenciamento de Escopo (Task Boundary):**
   - Inicialize o checklist de tarefas em `openspec/tracker/task.md` definindo o estado como `InProgress`.
   - Trate cada tarefa do plano de forma isolada e atômica.

3. **Ciclo de Mudança Atômica:**
   Para cada etapa do plano de execução:
   - **Backend (PHP 8.4):** Implemente a lógica nos controllers apropriados. Certifique-se de validar e sanitizar as entradas contra o contrato JSON.
   - **Banco de Dados (SQL):** Caso haja scripts SQL, crie e registre a nova migration. Execute localmente para sincronização do banco.
   - **Frontend (React):** Atualize a UI e os hooks. Garanta o tratamento visual correto dos estados de loading, success e error.
   - **Checagem de Logs:** Verifique ativamente `logs/nexus/nexus.log` após as modificações para garantir ausência de warnings ou errors.

4. **Blindagem de Segurança & Design System V3.1:**
   - **Higienização de Código:** Garanta que não existam logs de debug, `console.log` no frontend, ou credenciais fixas no código (use `$_ENV` e `import.meta.env`).
   - **Brand & UX Check:** Verifique se cores personalizadas usam Navy Blue (`#0A3E60`) e Gold (`#ED7E13`), e se alvos de toque têm ao menos 44x44px.

5. **Build de Homologação & Pre-commit Gate:**
   - Execute o build estático local para garantir que não há erros de tipagem, empacotamento ou lint:
     ```powershell
     cd apps/web-app; npm run build:hostinger
     ```
   - **Verificação de Migrations (Gate):** Verifique se o banco local está 100% sincronizado com as migrations e se não há discrepâncias pendentes. Apenas permita o prosseguimento se o build local estiver verde e as migrations sincronizadas.

6. **Monitoramento de Regressão Semântica (Regression Watch):**
   - Acesse o arquivo de acompanhamento em `openspec/tracker/regression-watch.md`.
   - Adicione/atualize os watchpoints específicos do delta ativo, preenchendo os relatórios de testes manuais e checagens comportamentais para atestar que as rotas críticas de login e checkout continuam operando perfeitamente.

7. **Deploy Híbrido Hostinger Premium + VPS:**
   - Efetue o deploy distribuindo os pacotes compilados:
     - Sincronize a build do frontend SPA com a infraestrutura do **Hostinger Premium**.
     - Sincronize os controllers/lógicas do backend PHP 8.4 e aplique as migrações SQL na **VPS Hostinger Dedicada** (loopback 127.0.0.1:3306).

8. **Relatório de Progresso:**
   Retorne o status da execução contendo:
   - Lista detalhada de arquivos modificados e tarefas concluídas.
   - Confirmação de segurança (Zero chaves expostas no código).
   - Resultado do build de homologação e validação de migrations (Gates).
   - Estado de preenchimento do `openspec/tracker/regression-watch.md`.
   - Próximo Comando Recomendado: `/forward` para obter as diretrizes do ciclo e prosseguir.
