---
name: lms-reset-examples
description: Limpeza e Recriação de Exemplos no Portal Gestor / LMS (Nexus V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: database
  trigger: "/lms-reset-examples"
---

Você é o administrador de conteúdo do Portal Gestor (LMS) do ecossistema Body Harmony. Sua missão é resetar o ambiente de aulas com uma base limpa e organizada, inserindo aulas e módulos de exemplo que suportem reprodução via YouTube e MP4 nativo.

## ⚙️ Protocolo de Reset do LMS (Algoritmo)

Ao ser acionado pelo comando `/lms-reset-examples`:

1. **Limpeza Segura (Soft Delete):**
   - Execute a atualização lógica no banco de dados para todas as aulas ativas, definindo `deleted_at` ou equivalente (nunca execute remoções físicas `DELETE` diretas, para manter a consistência de auditoria).
   - Garanta que as remoções sejam registradas em `audit_logs` ou tabela similar.

2. **Cadastro dos Módulos e Aulas de Exemplo:**
   - Insira os registros de módulo e suas respectivas aulas alternando formatos:
     - **Módulo 1: Introdução ao Body Harmony**
       - Aula 1.1: Boas-vindas (YouTube: `https://www.youtube.com/watch?v=6FsYk9GIv2Y`)
       - Aula 1.2: Nossa Missão (YouTube: `https://www.youtube.com/watch?v=iTHtXgnhqfM`)
     - **Módulo 2: Fundamentos da Eletroestimulação**
       - Aula 2.1: Postura e Respiração (YouTube: `https://www.youtube.com/watch?v=vrssjWvQMEc`)
       - Aula 2.2: Exercícios Básicos (MP4 local da pasta `assets/raw/videos`)
     - **Módulo 3: Protocolos de Tratamento**
       - Aula 3.1: Ética e Conduta (MP4 local da pasta `assets/raw/videos`)
       - Aula 3.2: Sessões Avançadas (MP4 local da pasta `assets/raw/videos`)

3. **Verificação de Compatibilidade de Payload:**
   - Certifique-se de que os endpoints de backend aceitam os parâmetros `video_url` e `video_type` (valores: `youtube` ou `mp4`).
   - Confirme se o componente do frontend `LessonPlayer` renderiza corretamente ambos os tipos de reprodutores de vídeo.

4. **Escrita da Documentação:**
   - Atualize o arquivo `docs/PortalGestor.md` documentando o reset realizado.
   - Adicione notas explicativas sobre os formatos suportados e registre a mudança no `CHANGELOG.md` do projeto.

5. **Relatório de Execução:**
   Retorne o relatório detalhado no chat com:
   - Contagem de aulas limpas logicamente.
   - Lista detalhada de módulos e aulas reiniciadas.
   - Confirmação de suporte do frontend/backend.

## 🚀 Argumentos e Filtros

- `/lms-reset-examples full` - Reseta todas as aulas e recria a estrutura completa mesclando YouTube e MP4.
- `/lms-reset-examples youtube-only` - Reseta as aulas e preenche apenas com referências a vídeos do YouTube.
- `/lms-reset-examples mp4-only` - Reseta as aulas e preenche utilizando links de arquivos MP4 locais.