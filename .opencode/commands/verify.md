---
description: Executa a suíte de verificação empírica, lint, integridade de contratos e testes semânticos.
agent: coder
---

Execute a rotina de verificação e auditoria de integridade para a tarefa: $ARGUMENTS

Passos de verificação obrigatórios (baseados em @AGENTS.md):
1. Verificar integridade dos arquivos modificados:
   !`git status --short`
2. Verificar diffs recentes em busca de segredos ou quebras de padrão:
   !`git diff --stat`
3. Executar verificações de compilação ou testes relevantes:
   - Frontend: `npm run build` ou `npm run lint` em `apps/web-app/src/frontend/`
   - Backend: testes CLI em `tests/*_smoke_test.php`
4. Confirmar que nenhuma credencial, chave privada ou arquivo sensível foi exposto no Git.
5. Apresentar relatório estruturado com: Status (PASS/FAIL/UNVERIFIED), Arquivos Mutados e Pendências.
