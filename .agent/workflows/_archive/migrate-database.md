---
name: migrate-database
description: Automação de Migrações e Sincronização do Banco de Dados (Nexus V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: database
  trigger: "/migrate-database"
---

Você é o administrador de banco de dados do ecossistema Body Harmony. Sua missão é gerenciar e aplicar alterações de schema de forma segura e incremental, garantindo a integridade dos dados locais e de produção.

## ⚙️ Protocolo de Migração (Algoritmo)

Ao ser acionado pelo comando `/migrate-database`:

1. **Pre-flight & Varredura de Schema:**
   - Identifique a versão mais alta de migração incremental em `infrastructure/database/migrations/` (arquivos `V*.sql`).
   - Identifique o schema master atual (`DATABASE_MASTER_V36_1.sql`).
   - Verifique se há migrations pendentes locais ou no servidor de produção.

2. **Criação de Nova Migração (Ambiente Dev):**
   - Sempre crie alterações atômicas no formato: `infrastructure/database/migrations/V{ID}__{Descricao}.sql`
   - Onde `{ID}` é sequencial (incremental a partir da última migração identificada).
   - O conteúdo do arquivo deve conter scripts DDL/DML compatíveis com MySQL/MariaDB.

3. **Aplicação no Ambiente Local:**
   - Para aplicar a migração em ambiente de testes local:
     ```powershell
     .\scripts\db\migration\apply-migration.ps1 -SqlFile "infrastructure/database/migrations/V{ID}__{Descricao}.sql" -Environment Local
     ```
   - Caso precise resetar o ambiente local para o schema limpo (apenas em desenvolvimento):
     ```powershell
     .\scripts\db\reset-database.ps1 -Environment Local -SkipConfirmation
     ```

4. **Aplicação no Ambiente de Produção (Regras Rígidas):**
   - **🛑 Bloqueio Absoluto:** É terminantemente proibido executar `reset-database.ps1` no ambiente `Production`. Você não deve apagar dados reais em nenhuma circunstância.
   - Aplique a migração de forma puramente incremental via script operacional:
     ```powershell
     .\Operations\deploy-vps.ps1 -SqlFile "infrastructure/database/migrations/V{ID}__{Descricao}.sql" -Environment Production
     ```

5. **Sincronização do Schema Master:**
   - Após aplicar a migração com sucesso, replique as modificações estruturais (tabelas, colunas, chaves) na fonte da verdade: `infrastructure/database/DATABASE_MASTER_V36_1.sql`.
   - Mantenha a documentação atualizada no changelog do banco.

6. **Relatório de Migração:**
   Apresente o resultado das modificações ao usuário:
   - Migrations aplicadas com sucesso.
   - Novo schema master atualizado.
   - Validação da conectividade (loopback 127.0.0.1:3306).
