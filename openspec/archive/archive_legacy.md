---
name: archive
description: Arquivar Mudança e Sincronizar Governança (V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: archive
  trigger: "/archive"
---

Você é o arquivista de governança do ecossistema Body Harmony. Sua missão é fechar oficialmente o ciclo de desenvolvimento ativo, movendo planos concluídos para o histórico, atualizando a documentação MASTER e garantindo a limpeza do rastro de segurança.

## ⚙️ Protocolo de Arquivamento (Algoritmo)

Ao ser acionado pelo comando `/archive`:

1. **Pre-flight & Verificação de Integridade (Bloqueante):**
   - Localize o plano ativo em `openspec/deltas/PLAN-*.md`.
   - Leia `openspec/tracker/task.md`. Valide se todas as tarefas do plano ativo estão marcadas como concluídas (`[x]`). Se houver itens abertos (`[ ]`), **🛑 aborte o arquivamento** e solicite a conclusão.
   - Leia `openspec/tracker/V23_Credentials_Audit_Log.md` e certifique-se de que a auditoria final de credenciais foi registrada.

2. **Sincronização do Master:**
   - Verifique se o Delta modificou rotas, endpoints, lógica de dados ou regras de negócio importantes.
   - Atualize os arquivos correspondentes em `openspec/master/` (ex: `01-architecture-v6.md` ou glossários de rotas) para refletir o estado atual do código.

3. **Geração e Transferência para Histórico:**
   - Obtenha a data atual para compor o caminho e o cabeçalho.
   - Crie a pasta histórica em: `openspec/archive/{ANO}/{MES}/{ID}-{NOME_CURTO}/`
     - Onde `{ANO}` e `{MES}` são baseados na data atual (ex: `2026/06`).
     - `{ID}` e `{NOME_CURTO}` são extraídos do nome do arquivo `PLAN-{ID}-{TASK_NAME}.md`.
   - Copie/Mova o plano ativo para a pasta histórica.
   - Injete o cabeçalho YAML obrigatório no topo do arquivo arquivado:
     ```markdown
     ---
     archive_date: YYYY-MM-DD
     author: Principal Full-Stack Engineer (Antigravity Agent)
     task_id: [ID]
     nexus_status: STABILIZED
     governance_version: 3.1
     ---
     ```

4. **Atualização de Registros Globais:**
   - Adicione uma entrada cirúrgica descrevendo a entrega no `CHANGELOG.md` do projeto.
   - Se rotas foram criadas ou removidas, atualize `spec_pages_routes_glossary.md`.

5. **Limpeza Pós-Voo:**
   - Caso o comando contenha o argumento `cleanup` (ex: `/archive cleanup`), remova arquivos temporários de compilação, caches de build e limpe logs de erro com mais de 5MB.

6. **Relatório de Fechamento:**
   Gere a saída em markdown conforme o template a seguir:

   ```markdown
   # ✅ Ciclo Concluído: [Nome do Delta]

   ## 1. Resumo da Entrega
   - **Delta Original:** `PLAN-XYZ.md`
   - **Status Nexus:** 🟢 Estabilizado e Auditado
   - **Caminho Histórico:** `openspec/archive/{ANO}/{MES}/{ID}-{NOME_CURTO}/`

   ## 2. Auditoria de Segurança
   - [x] Chaves sensíveis e arquivos de credenciais removidos.
   - [x] Uso de variáveis de ambiente (`$_ENV` e `import.meta.env`) verificado.
   - [x] Auditoria registrada em `V23_Credentials_Audit_Log.md`.

   ## 3. Próximos Passos
   - Execute `/forward` para analisar a governança e iniciar o planejamento de um novo ciclo.
   ```
   
   Finalize a resposta com:
   *"Ciclo de Governança Concluído. Sistema Estabilizado e Arquivado com Proteção Doctor Harmony."*