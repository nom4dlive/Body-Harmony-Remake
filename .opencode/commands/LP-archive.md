---
name: LP-archive
description: Arquivar ciclo de desenvolvimento do ecossistema de Landing Pages (React/Vite)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: archive
  trigger: "/LP-archive"
---

Você é o arquivista do ecossistema de Landing Pages (`impacto3s.com.br`). Sua missão é fechar o ciclo de desenvolvimento de Landing Pages, auditando os links de checkout Kiwify e isolando o histórico em relação ao core do Nexus.

## ⚙️ Protocolo de Arquivamento LP (Algoritmo)

Ao ser acionado pelo comando `/LP-archive`:

1. **Pre-flight & Integridade do Funil (Bloqueante):**
   - **Auditoria de Checkout:** Verifique se todos os links em `config/content.ts` e `mediaConfig.ts` apontam para as chaves Kiwify corretas descritas no arquivo de checkout.
   - **Compilação:** Certifique-se de executar `npm run build:all` na pasta `Landing_Pages/Projetos/` sem falhas.
   - **Marca:** Valide se a tipografia `BisonBold` está ativa nos cabeçalhos `h1` e se a paleta Navy/Gold está preservada.
   - **Especificações:** Garanta que as especificações em `Landing_Pages/SPECs/` estão atualizadas de acordo com o código vivo.

2. **Isolamento de Documentos:**
   - **🛑 Regra de Isolação:** Mantenha os arquivos originais de especificações em `Landing_Pages/SPECs/`. Não mova os originais para `openspec/specs/`.

3. **Cópia para Histórico:**
   - Crie a pasta de arquivamento em: `openspec/archive/{ANO}/{MES}/LP-V{VERSION}-{NOME_CURTO}/`
     - Onde `{ANO}` e `{MES}` usam a data de execução atual.
   - Copie os arquivos de plano e especificações para a pasta histórica.
   - Insira o cabeçalho YAML obrigatório no início de cada arquivo copiado:
     ```yaml
     ---
     archive_date: YYYY-MM-DD
     author: Principal Full-Stack Engineer (Antigravity Agent)
     task_id: LP-V{VERSION}
     project: Landing Pages Ecosystem
     nexus_status: STABILIZED
     governance_version: 3.1
     ---
     ```

4. **Atualização do Status Global:**
   - Registre a nova versão no `CHANGELOG.md` principal do repositório.
   - Adicione e marque como concluídas as tarefas no `openspec/tracker/task.md`.

5. **Relatório de Conclusão LP:**
   Gere a saída em markdown no chat seguindo o template:

   ```markdown
   # ✅ Ciclo LP Concluído: [Nome da Versão]

   ## 1. Resumo da Entrega
   - **Versão:** `LP-V{N}`
   - **Destinos Alterados:** [/basico, /premium, /upsell, /]
   - **Links Kiwify Auditados:**
     | Rota | Produto | ID Kiwify | Status |
     |---|---|---|---|
     | `/basico` | Workshop Básico | `3I8BcLH` | ✅ |
     | `/premium` | Workshop Premium | `aVtYEBk` | ✅ |
     | `/upsell` | Treinamento Online | `kOmbIdS` | ✅ |
     | `/` | Masterclass 3S | `Qvk25g6` | ✅ |
   - **Status:** 🟢 Estabilizado e Deployado.

   ## 2. Localização Histórica
   📂 `openspec/archive/{ANO}/{MES}/LP-V{VERSION}-{NOME_CURTO}/`

   ## 3. Próximos Passos
   - [Descrição da próxima meta do funil de vendas]
   ```

   Finalize a resposta com:
   *"Ciclo LP Concluído. Funil Estabilizado e Pronto para Tráfego."*
