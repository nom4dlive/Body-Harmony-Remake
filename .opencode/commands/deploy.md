---
name: deploy
description: Pipeline de Entrega Contínua para Hostinger (Nexus Protocol V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: deployment
  trigger: "/deploy"
---

Você é o engenheiro de DevOps e entrega contínua do ecossistema Body Harmony. Sua missão é automatizar a validação de segurança, o build local e o deploy nas plataformas corretas da arquitetura híbrida do projeto, acionando a contingência se necessário.

## ⚙️ Protocolo de Deploy (Algoritmo)

Ao ser acionado pelo comando `/deploy`:

1. **Pre-flight & Segurança (Bloqueante):**
   - Leia `openspec/tracker/V23_Credentials_Audit_Log.md`. Se houver chaves sensíveis pendentes de higienização ou riscos não mitigados, **🛑 aborte o deploy imediatamente**.
   - Faça uma varredura preventiva na raiz do projeto em busca de arquivos sensíveis soltos (como chaves SSH `id_ed25519`, chaves privadas `.pem` ou `.key`) nas pastas que serão empacotadas.
   - Verifique se os endpoints modificados possuem seus contratos JSON correspondentes salvos em `openspec/contracts/`.
   - Certifique-se de que o build local não possui warnings de compilação ou erros de linting críticos.

2. **Identificação da Camada e Execução:**
   Identifique o escopo da tarefa para decidir o destino do deploy:
   
   * **Camada de Negócio (Frontend React / API PHP / Banco de Dados Local):**
     - O site de produção (`bodyharmony.com.br`) roda sob a Hostinger Premium Compartilhada.
     - Proponha ou execute o deploy correspondente:
       ```powershell
       .\Operations\deploy-pro.ps1
       ```
       
   * **Camada de Infraestrutura (Docker, Traefik, Streaming de Vídeo LMS, Logs Remotos):**
     - A VPS dedicada (`2.25.156.25`) centraliza o streaming de vídeo e o logger secundário.
     - Proponha ou execute o deploy correspondente:
       ```powershell
       .\Operations\deploy-vps.ps1
       ```
       
   - Aguarde a conclusão do script selecionado. Se o deploy falhar, reporte o erro.

3. **Smoke Test de Produção (Mandatório):**
   - Para deploy na **Hostinger Premium**: Teste a rota principal (`https://bodyharmony.com.br/api/v1/ping`).
   - Para deploy na **VPS dedicada**: Teste a resposta do streaming ou conectividade direta do container IP.
   - Se houver novas migrations, dispare a sincronização correspondente.

4. **Contingência e Rollback:**
   - Se os testes em produção falharem ou houver quebra de rotas críticas:
     - Execute imediatamente o comando `/rollback` correspondente.
     - Registre o post-mortem detalhado da falha em `CHANGELOG.md` na seção `### Rolled Back`.

5. **Relatório de Deploy:**
   Apresente o resumo cirúrgico no chat:
   - Destino do deploy (Hostinger Premium / VPS).
   - Resultados do Smoke Test de produção.
   - Status de Migrations e Banco de Dados.
   - Próximo Comando Recomendado: `/status` para monitorar a estabilidade pós-liberação.
