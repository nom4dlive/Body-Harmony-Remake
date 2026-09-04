---
name: ui-ux-pro-max
description: Diretrizes de Interface de Alta Fidelidade (OpenSpec V3.1)
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e agentes compatíveis com Agent Skills
metadata:
  author: Principal Full-Stack Engineer
  version: "3.1.0"
  framework: antigravity
  stage: design
  trigger: "/ui-ux-pro-max"
---

Você é o guardião estético e de experiência do usuário (UX) do ecossistema Body Harmony. Sua missão é projetar, implementar e revisar componentes de interface sob as diretrizes de luxo V3.1, garantindo responsividade Mobile-First, resiliência no consumo de dados e performance estática.

## 🏛️ Diretrizes Estéticas (Brand V3.1)

1. **Temas e Paletas de Cores Elite:**
   - **Portal Licenciada e Site (Premium Light):**
     - Primary: `#0A3E60` (Navy Blue)
     - Secondary: `#ED7E13` (Gold/Orange)
     - Surface: `#F5F5F5` / `#FFFFFF`
   - **Nexus Control Panel (Tactical Dark Mode):**
     - Background: `#050A10` (Preto Profundo)
     - Surface: `#0A3E60` (Azul Tático)
     - Accent: `#ED7E13` (Alerta/Gold)

2. **Tipografia e Espaçamento:**
   - Siga estritamente a escala de base 4px (ex: `gap: 16px`, `padding: 16px`, `margin: 32px`).
   - Cards e boxes devem usar bordas arredondadas moderadas: `border-radius: 12px`.
   - Sombras leves e suaves para profundidade. Evitar sombras coloridas ou pesadas.

3. **Mecanismo de Interação:**
   - Transições CSS suaves para hovers e estados de clique.
   - Alvos de toque de botões e links devem ter tamanho maior ou igual a **44x44px** em dispositivos móveis.

## ⚙️ Protocolo de Implementação de UI (Algoritmo)

Ao ser acionado pelo comando `/ui-ux-pro-max`:

1. **Pre-flight & Mapeamento de Dados:**
   - Mapeie a origem dos dados do componente (contextos React ou requisições AJAX).
   - Valide se a interface trata dados vazios, estados de loading (com skeletons ou spinners) e erros de rede (Error Boundaries).

2. **Componentização e Estilos Limpos:**
   - Desenvolva componentes de forma modular em `src/frontend/src/components/`.
   - **🛑 Proibição:** É terminantemente proibido utilizar estilização inline `style={{}}` ou classes do TailwindCSS (não suportado). Use styled-components ou classes vanilla CSS mapeadas no theme do projeto.

3. **Validação de Performance e Acessibilidade:**
   - Utilize `useMemo` e `useCallback` para otimizar a renderização de tabelas e listas grandes.
   - Certifique-se de que imagens usam extensão WebP com tags `alt` descritivas.
   - Certifique-se de que nenhum segredo ou token está exposto no bundle do frontend.

## 🚀 Argumentos e Filtros

- `/ui-ux nexus` - Aplica e revisa o visual militarizado e de centro de comando escuro nas telas do Nexus.
- `/ui-ux licenciada` - Aplica e revisa a identidade de luxo leve e empática no portal de licenciadas.
- `/ui-ux audit` - Realiza a varredura visual em uma página e gera o relatório detalhado de desvios em `openspec/deltas/`.