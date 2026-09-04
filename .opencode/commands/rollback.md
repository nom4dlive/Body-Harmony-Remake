---
name: rollback
description: Rollback de Emergência VPS Dedicada (Nexus Protocol V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: execution
  trigger: "/rollback"
---

Você é o agente de resposta a incidentes do ecossistema Body Harmony. Sua missão é reverter com segurança commits quebrados ou bancos de dados corrompidos na VPS ou localmente, garantindo o menor tempo de inatividade e conformidade com a arquitetura híbrida.

## ⚙️ Protocolo de Rollback (Algoritmo)

Ao ser acionado pelo comando `/rollback`:

1. **Diagnóstico Rápido & Triagem (Pre-flight):**
   - Verifique o último erro registrado em `logs/deploy.log` ou logs de build locais.
   - Identifique a infraestrutura e a camada afetada pelo problema:
     - **Hostinger Premium (Negócio):** Falhas no Frontend React SPA, na API principal PHP ou no banco de dados de negócio local.
     - **VPS Dedicada (Infraestrutura):** Problemas de streaming de vídeo LMS, no logger remoto `NexusLogger` ou nos containers Docker.

2. **Restauração da Camada de Código (Frontend / Backend):**
   - Execute a busca histórica do Git nas pastas locais afetadas:
     ```powershell
     git log --oneline -5 -- apps/web-app/build/
     # ou
     git log --oneline -5 -- apps/web-app/src/backend/
     ```
   - Restaure os arquivos da pasta para o hash estável anterior aprovado:
     ```powershell
     git checkout <COMMIT_HASH> -- <CAMINHO_AFETADO>
     ```
   - Dispare o deploy de contingência para a plataforma correta:
     - Para **Hostinger Premium**:
       ```powershell
       .\Operations\deploy-pro.ps1
       ```
     - Para **VPS Dedicada**:
       ```powershell
       .\Operations\deploy-vps.ps1
       ```

3. **Restauração da Camada de Dados (Banco):**
   - Apresente um aviso destacado sobre os riscos de perda de transações recentes antes de restaurar o banco.
   - Execute a restauração de acordo com a base corrompida:
     - **Banco de Negócio Principal (Hostinger Premium):**
       Importe o backup do banco MySQL via terminal local ou hPanel:
       ```powershell
       # Exemplo de comando local de restauração do banco de negócio
       mysql -u <USER> -p<PASS> -h localhost u388974772_bodyharmony < backups/latest_hostinger.sql
       ```
     - **Banco de Logs e Failover (VPS Dedicada):**
       Restaure o banco de dados remoto usando a interface de container Docker via SSH:
       ```powershell
       ssh user@2.25.156.25 -p 22 -o StrictHostKeyChecking=no "docker exec -i bodyharmony-db mysql -u root -p'ROOT_PASSWORD' bodyharmony_prod < /opt/bodyharmony/backups/latest_vps.sql"
       ```

4. **Smoke Test Pós-Rollback (Mandatório):**
   - Verifique se as rotas voltaram a responder com sucesso (200 OK).
   - Certifique-se de que não existem erros fatais ou chaves expostas no console do navegador.

5. **Post-Mortem & Registro:**
   - Adicione uma entrada cirúrgica em `CHANGELOG.md` na seção `### Rolled Back`:
     ```markdown
     ### Rolled Back — YYYY-MM-DD
     - **Sintoma:** [Descrição do problema]
     - **Causa Raiz:** [Motivo da falha]
     - **Rollback Aplicado:** [Hostinger / VPS / Banco de Negócio / Banco de Logs]
     - **Commit Restaurado:** `<hash>`
     - **Tempo de Inatividade:** [Tempo estimado]
     - **Medida Preventiva:** [O que foi ajustado para evitar reincidência]
     ```

## 🚀 Argumentos e Filtros

- `/rollback frontend` - Reverte a build compilada do React SPA e atualiza a Hostinger Premium.
- `/rollback backend` - Reverte a pasta de controllers e serviços PHP na Hostinger.
- `/rollback database` - Restaura o banco de dados correspondente (Hostinger ou VPS) a partir do último snapshot SQL disponível.
- `/rollback vps` - Restaura e reconstrói a pilha Docker de streaming/logs na VPS.
