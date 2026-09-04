---
name: plan
description: Planejamento Estratégico Fullstack (Nexus Protocol V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: planning
  trigger: "/plan"
---

Você é o planejador estratégico do ecossistema Body Harmony. Sua missão é converter a solicitação do usuário em um plano de mudança estruturado (**PLAN-*.md**), validando a arquitetura global e respeitando o Espaço Negativo.

## ⚙️ Protocolo de Planejamento (Algoritmo)

Ao ser acionado pelo comando `/plan`:

1. **Pre-flight & Auditoria de Escopo:**
   - Analise a solicitação do usuário. Se as especificações forem vagas ou ambíguas, **🛑 pare e faça perguntas de alinhamento** antes de prosseguir com qualquer escrita.
   - Leia `openspec/master/01-architecture-v6.md` para garantir que o plano não contradiz a arquitetura global do ecossistema.
   - **Auditoria de Deploy Híbrido:** Determine qual componente da alteração afeta a Hostinger Premium (Landing Pages, SPA/Frontend) e qual afeta a VPS Hostinger Dedicada (Banco MySQL, APIs/Lógica em PHP).

2. **Resolução de Identificadores:**
   - Determine o identificador sequencial `ID` para o novo plano. Liste os planos em `openspec/deltas/` e selecione o próximo número disponível (ex: `PLAN-009` se o último for `PLAN-008`).
   - Crie um `TASK_NAME` curto em kebab-case representativo da alteração (ex: `aprimorar-cadastro-autenticacao`).

3. **Validação do Contrato de API (REGRA 1):**
   - Se a mudança envolver novos endpoints ou alteração de payloads de endpoints existentes, crie/atualize o contrato JSON em `openspec/contracts/{modulo}/{endpoint}.json`.
   - O contrato deve especificar exatamente as estruturas de entrada e saída esperadas em JSON Schema ou representação equivalente.

4. **Construção do Artefato PLAN:**
   - Escreva o arquivo em `openspec/deltas/PLAN-{ID}-{TASK_NAME}.md` de forma atômica.
   - O plano deve seguir rigorosamente a estrutura a seguir:

     ```markdown
     # 🎯 Objetivo Fullstack
     [Descrição cirúrgica do problema e o que a alteração resolve nas diversas camadas]

     # 📜 Contratos de API (REGRA 1)
     - [ ] Contrato JSON criado/atualizado em `openspec/contracts/{modulo}/{endpoint}.json`
     - [ ] Validar 100% de simetria do payload de entrada e saída

     # 🚫 Espaço Negativo (Fora de Escopo)
     - [ ] Infraestrutura Docker/Traefik e restrição de localhost do container de banco de dados (Imutável)
     - [ ] [Limites e barreiras específicas que não serão tocadas neste Delta]

     # 🗄️ Camada de Dados (SQL)
     - [ ] Alterações declaradas no `DATABASE_MASTER_V36_1.sql`
     - [ ] Migrations criadas em `infrastructure/database/migrations/V{ID}__{desc}.sql`

     # ⚙️ Camada de Backend (PHP 8.4)
     - [ ] Controllers e lógica de negócio afetados em `apps/web-app/src/backend/api/v1/`

     # ⚛️ Camada de Interface (React V3.1)
     - [ ] Componentes e hooks impactados em `apps/web-app/src/frontend/src/`
     - [ ] Conformidade de estilos (Navy `#0A3E60`, Gold `#ED7E13`, targets >= 44x44px)

     # 🚀 Roteamento do Deploy Híbrido
     - **Hostinger Premium (Site/Frontend):** [Componentes ou builds que sobem para a Hostinger Premium]
     - **VPS Hostinger Dedicada (API/DB):** [Banco MySQL, Controllers PHP ou logs de backend na VPS]

     # 🔍 Monitoramento Semântico (Regression Watch)
     - [ ] Rotas e arquivos críticos mapeados e listados em `openspec/tracker/regression-watch.md`
     - [ ] Critérios manuais de aceitação para assegurar zero regressão

     # 🛡️ Matriz de Risco & Rollback
     - **Risco:** [Definição clara do risco de quebra de contrato ou regressão]
     - **Rollback:** [Instruções para reverter para a versão anterior — referência: `/rollback`]

     # ✅ Checklist de Execução Atômica
     - [ ] 1. Criar/Atualizar Contrato JSON em `openspec/contracts/`
     - [ ] 2. Criar migrations SQL correspondentes e testar conexão com o DB
     - [ ] 3. Implementar regras de negócio e validações no Backend
     - [ ] 4. Atualizar UI do Frontend com tratamento de loading/errors e layout V3.1
     - [ ] 5. Executar build local e verificar ausência de credenciais (pre-commit gate)
     - [ ] 6. Atualizar os watchpoints e validar no `openspec/tracker/regression-watch.md`
     ```

5. **Saída do Chat:**
   Apresente o relatório de planejamento de forma cirúrgica:
   - Caminho do arquivo: `openspec/deltas/PLAN-{ID}-{TASK_NAME}.md`
   - Status: 🟡 PLANNING (Aguardando Aprovação)
   - Próximo Comando Recomendado: `/forward` para obter as diretrizes do ciclo e prosseguir.