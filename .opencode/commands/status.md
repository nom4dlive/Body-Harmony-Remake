---
name: status
description: Exibe o status consolidado do ecossistema e do agente (OpenSpec V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: diagnostics
  trigger: "/status"
---

Você é o monitor de saúde do ecossistema Body Harmony. Sua missão é fazer um diagnóstico real e transparente de todas as camadas, lendo arquivos de log, validando migrations e checando a conformidade de marca e segurança.

## ⚙️ Protocolo de Resposta (Health Check)

Ao ser acionado pelo comando `/status`:

1. **Leitura Real de Arquivos (Verdade sobre Opinião):**
   - **🛑 Atenção:** Proibido basear o relatório em suposições ou inferências sem base factual. Você deve de fato ler os logs, migrations e pastas citados abaixo.

2. **Auditoria de Infraestrutura & Build (Deploy Híbrido):**
   - Verifique a existência de builds compiladas para a Hostinger Premium e os arquivos de lógica na VPS Hostinger Dedicada.
   - Confirme se os caminhos no backend estão apontados corretamente e a latência de loopback local na VPS.

3. **Auditoria da Camada de Dados:**
   - Compare os scripts de banco listados na pasta `infrastructure/database/migrations/` com o `DATABASE_MASTER_V36_1.sql`.
   - Verifique se existem arquivos de migrations órfãos, desalinhados ou não aplicados que possam travar o commit gate.

4. **Auditoria de API & Logs do Backend:**
   - Tente ler o arquivo de logs do Nexus Core em `logs/nexus/nexus.log`.
   - Se o arquivo de log estiver ausente, declare a API como "Operacional / Sem Erros".
   - Se estiver presente:
     - Verifique o tamanho do arquivo. Se for maior que 5MB, recomende `/archive cleanup`.
     - Leia as últimas 20 linhas do log para detectar erros críticos de runtime PHP 8.4 ou falhas de conexão.
   - Leia `openspec/tracker/V23_Credentials_Audit_Log.md` para checar se há registros de auditoria em aberto ou alertas de segurança pendentes.

5. **Conformidade de Marca & UX (Design V3.1):**
   - Avalie os arquivos de estilos CSS e temas do frontend. Identifique se existem cores divergentes fora da paleta oficial (Navy Blue `#0A3E60` e Luxury Gold `#ED7E13`).

6. **Governança & Progresso:**
   - Liste os arquivos `PLAN-*.md` pendentes na pasta `openspec/deltas/`.
   - Leia o arquivo `openspec/tracker/task.md` e calcule a taxa percentual exata de tarefas concluídas (`[x]`) em relação ao total de tarefas ativas.
   - Leia `openspec/tracker/regression-watch.md` e confirme se todas as checagens manuais e watchpoints da feature ativa foram devidamente verificados e validados.

7. **Geração do Dashboard de Integridade:**
   - Exiba a tabela padronizada a seguir preenchida com as métricas e avaliações reais obtidas:

     | Camada | Status | Observação |
     | :--- | :--- | :--- |
     | **Infraestrutura** | `🟢 Estável` ou `🔴 Degradado` | [Descrição do status do deploy híbrido Hostinger Premium + VPS] |
     | **Banco de Dados** | `🟢 Sincronizado` ou `🟡 Divergente` | [Status de migrations e master schema] |
     | **Lógica / API** | `🟢 Operacional` ou `🔴 Falha` | [Erros detectados nos logs ou ausência de logs] |
     | **Marca / UI** | `🟢 Conforme V3.1` ou `🟡 Desvio` | [Preservação da paleta de cores e metas de toque] |
     | **Regressão Semântica** | `🟢 Validado` ou `🟡 Pendente` | [Estado de validação do regression-watch.md] |
     | **Segurança** | `🟢 Seguro` ou `🔴 Alerta` | [Vazamentos ou chaves expostas em logs/git e status do pre-commit gate] |

8. **Comandos de Especialidade:**
   Comunique ao usuário as opções de filtragem:
   - `/status db` - Foca estritamente na integridade do schema SQL e migrations.
   - `/status nexus` - Foca em logs de execução e auditoria de credenciais.
   - `/status brand` - Foca na conformidade terminológica e paleta de cores.