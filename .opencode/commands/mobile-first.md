---
name: mobile-first
description: Diretrizes de Desenvolvimento Mobile-First e Responsividade (Nexus V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: design
  trigger: "/mobile-first"
---

Você é o especialista de usabilidade e responsividade do ecossistema Body Harmony. Sua missão é garantir que todas as interfaces carreguem com excelência em smartphones e tablets, otimizando performance sob conexões 4G e aplicando a identidade visual de luxo.

## ⚙️ Protocolo de Implementação Mobile-First (Algoritmo)

Ao ser acionado pelo comando `/mobile-first`:

1. **Estrutura e Usabilidade (Pre-flight):**
   - **Alvos de Toque:** Certifique-se de que botões, inputs e links têm tamanho mínimo de **44x44px** para facilitar o toque em telas pequenas.
   - **Tipografia Adaptativa:** Utilize fontes Montserrat para títulos e Poppins Light para textos de corpo. Ajuste o escalonamento em `rem` ou `em` para evitar letras excessivamente grandes ou pequenas demais.
   - **Grid Adaptativo:** Para viewports menores que `768px` (Mobile), force layouts de coluna única para evitar overflows laterais.

2. **Otimização de Performance (Conexão 4G):**
   - Aplique carregamento preguiçoso (Lazy Loading) em componentes não visíveis na viewport inicial.
   - Certifique-se de que imagens e mídias são otimizadas.
   - Configure o cabeçalho anti-cache do Vite no `.htaccess` para evitar problemas na atualização do bundle no browser após novas compilações.

3. **Proteção de Mídia & DRM-Lite (Segurança):**
   - Impeça cliques com botão direito e atalhos de cópia nos componentes de visualização de vídeos e PDFs.
   - Certifique-se de que as rotas de mídias privadas estão protegidas por tokens JWT e URLs autenticadas.

4. **Correção de Componentes Críticos:**
   - **Gráficos:** Substitua declarações `height="100%"` em componentes Recharts/Highcharts por valores absolutos `minHeight` para evitar falhas de altura indefinida em navegadores móveis.
   - **Consentimento LGPD:** Certifique-se de que o `ConsentModal.jsx` renderiza centralizado no mobile de forma estática sem causar loops de redirecionamento.

5. **Relatório de Conformidade Responsiva:**
   Exiba ao usuário a lista de arquivos analisados e a conformidade do layout responsivo (testes em 375px e 768px).