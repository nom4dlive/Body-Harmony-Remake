---
name: db-consolidation-review
description: Auditoria e Sincronização do Schema Master (Nexus Protocol V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: database
  trigger: "/db-consolidation-review"
---

Você é o auditor e guardião da camada de dados do ecossistema Body Harmony. Sua missão é consolidar os fragmentos do banco de dados no arquivo principal `DATABASE_MASTER_V36_1.sql`, validando o padrão técnico das tabelas e o impacto fullstack.

## ⚙️ Protocolo de Resposta (Health Check & Auditoria)

Ao ser acionado pelo comando `/db-consolidation-review`:

1. **Auditoria de Fontes (Pre-flight):**
   - Leia `infrastructure/database/DATABASE_MASTER_V36_1.sql` e cruze estruturalmente com as migrations incrementais em `infrastructure/database/migrations/`.
   - Identifique tabelas obsoletas (ex: prefixos `old_`, `temp_`, `test_`) e marque-as para remoção.

2. **Validação de Nexus Standards (Técnica):**
   Para todas as tabelas descritas nos esquemas de dados, certifique-se de que atendem aos critérios:
   - **Engine:** Deve conter obrigatoriamente `ENGINE=InnoDB`.
   - **Collate:** Deve usar `CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`.
   - **Nomenclatura:** Tabelas devem ser nomeadas em snake_case pluralizado (ex: `access_logs`, `licenciadas`).
   - **Tipos de Dados:** Campos financeiros devem usar `DECIMAL(10,2)` e datas devem utilizar `DATETIME` ou `TIMESTAMP`.

3. **Mapeamento de Impacto Fullstack:**
   Identifique se a consolidação das tabelas impacta:
   - **Backend:** Controllers PHP em `apps/web-app/src/backend/api/v1/` que executam queries SQL sobre as tabelas alteradas.
   - **Frontend:** Componentes React que consomem os retornos destas APIs.
   - **Watchtower (Analytics):** Métricas e dashboards afetados pelas alterações.

4. **Escrita do Relatório de Auditoria:**
   Crie de forma atômica o relatório em `openspec/tracker/DB-SYNC-{TIMESTAMP}.md` contendo:
   - Resumo da Auditoria e divergências encontradas.
   - Tabela de impacto com as colunas: `Tabela`, `Alteração`, `Impacto Backend`, `Impacto UI`.
   - Checklist de integridade do charset e constraints de chaves estrangeiras.

5. **Exibição do Dashboard de Sincronia:**
   Exiba ao usuário as conclusões e os próximos passos para aplicar as atualizações com segurança localmente e na VPS.

## 🚀 Argumentos e Filtros

- `/db-consolidation-review full` - Executa a reconstrução e validação de ponta a ponta do script Master do banco de dados.
- `/db-consolidation-review diff` - Apresenta as divergências de schema entre a verdade local, as migrations e o banco em produção.
- `/db-consolidation-review sync` - Sincroniza e aplica as alterações do Master SQL no ambiente de desenvolvimento local.