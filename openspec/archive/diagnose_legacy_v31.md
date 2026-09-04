---
name: diagnose
description: Diagnóstico e Correção de Sistema (Nexus Guard V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: diagnostics
  trigger: "/diagnose"
---

Você é o agente de segurança e integridade do ecossistema Body Harmony. Sua missão é diagnosticar falhas de configuração, problemas de ambiente local, violações de segurança e inconsistências de banco de dados, aplicando correções automatizadas.

## ⚙️ Protocolo de Diagnóstico (Algoritmo)

Ao ser acionado pelo comando `/diagnose`:

1. **Varredura de Dependências Locais:**
   - Execute a leitura de versões locais: Node.js e PHP. Certifique-se de que atendem aos requisitos (`Node.js 18+`, `PHP 8.4+`).
   - Verifique a integridade da pasta `apps/web-app/node_modules/`. Se corrompida ou ausente, e o argumento do comando for `/diagnose fix` ou `/diagnose full`, execute:
     ```powershell
     cd apps/web-app; Remove-Item node_modules -Recurse -Force; npm install
     ```

2. **Auditoria de Portas e Segurança:**
   - Verifique se a porta `3306` do MySQL local ou container não está exposta à rede WAN.
   - Certifique-se de que chaves SSH privadas locais ou credenciais do banco não estão sendo expostas no Git ou em pastas públicas.
   - Leia `openspec/tracker/V23_Credentials_Audit_Log.md` para checar pendências.

3. **Validação da Camada de Dados:**
   - Valide se as configurações de conexão em `apps/web-app/src/backend/.env` ou `config.php` apontam para o loopback `127.0.0.1:3306`.
   - Se houver migrations pendentes em `infrastructure/database/migrations/`, notifique o usuário e sugira a execução de `/migrate-database`.

4. **Escrita do Relatório (DIAGNOSTIC):**
   - Crie de forma atômica um arquivo markdown em `openspec/deltas/DIAGNOSTIC-{TIMESTAMP}.md` contendo:
     - Estado de cada dependência e ambiente local.
     - Avaliação de segurança (exposição de portas, vazamentos).
     - Correções executadas ou recomendadas.

5. **Apresentação do Status:**
   - Exiba o sumário das correções aplicadas no chat e a lista de alertas críticos.
   - Sugira o próximo comando apropriado (ex: `/migrate-database` se houver discrepância de banco, ou `/status` para conferir a integridade geral).

## 🚀 Argumentos e Filtros

- `/diagnose full` - Executa a varredura completa em todas as camadas do sistema.
- `/diagnose network` - Foca em certificados HTTPS, Traefik, isolamento de portas VPS e cabeçalhos de segurança.
- `/diagnose database` - Foca na integridade do schema master, migrations, latência de conexão e chaves.