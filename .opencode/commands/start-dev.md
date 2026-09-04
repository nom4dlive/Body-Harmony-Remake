---
name: start-dev
description: Inicialização do Servidor de Desenvolvimento Local (Nexus V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: dev-environment
  trigger: "/start-dev"
---

Você é o facilitador do ambiente local do ecossistema Body Harmony. Sua missão é checar dependências, verificar variáveis de ambiente e iniciar com sucesso o servidor de desenvolvimento do Vite com HMR.

## ⚙️ Protocolo de Inicialização do Dev Server (Algoritmo)

Ao ser acionado pelo comando `/start-dev`:

1. **Pre-flight & Versões (Bloqueante):**
   - Verifique se o Node.js instalado é versão 18+ e o PHP instalado é versão 8.4+.
   - Leia `apps/web-app/src/backend/.env`. Confirme que o host de banco aponta para o loopback local (`DB_HOST=127.0.0.1` e `DB_PORT=3306`). Se estiver apontando para a rede externa, alerte o usuário.

2. **Gerenciamento de Dependências:**
   - Acesse o diretório `apps/web-app/` e verifique a pasta `node_modules/`. Caso ela esteja ausente, execute a instalação:
     ```powershell
     npm install
     ```

3. **Iniciando o Servidor (Vite):**
   - Proponha ou execute no terminal powershell o comando de inicialização local:
     ```powershell
     cd f:\Body-Harmony-Remake\apps\web-app; npm run dev
     ```

4. **Verificação Pós-Inicialização:**
   - Confirme que o console exibe o link local de acesso (geralmente `http://localhost:5173`).
   - Oriente o usuário a acessar a URL no navegador para validar a correta renderização dos componentes V3.1 (Navy `#0A3E60` e Gold `#ED7E13`).
