# 🌓 BRAINSTORM: Arquitetura Modular de Modo Escuro & Refatoração Rigorosa de Componentes (Nexus V3.1)

**Identificador:** `BRAINSTORM-dark-mode-modular-006`  
**Data:** 2026-08-31  
**Status:** Consolidado via `/grill-me`  
**Autor:** Antigravity Architect  

---

## 🎯 Contexto e Diagnóstico Factual

1. **Diagnóstico da Falha do Botão de Modo Escuro:**
   - O `GestorThemeProvider` em `src/context/GestorThemeContext.jsx` foi criado com suporte a atalhos (`Ctrl+Shift+D`), detecção do sistema operacional e escrita do atributo `data-gestor-theme` no `document.documentElement`.
   - **Causa Raiz:** O provider `GestorThemeProvider` **não estava montado** na árvore raiz do React (`src/main.jsx`). Com isso, ao invocar `useGestorTheme()` dentro do `AdminLayout.jsx`, o React retornava os valores padrão do contexto (`isDark: false`, `toggleTheme: () => {}`), fazendo com que o clique no botão fosse um *no-op* silencioso.
   - Além disso, `GestorDarkStyles.jsx` estava montado unicamente dentro de `AdminLayout.jsx`, ficando inacessível nos outros portais e páginas.

2. **Decisões Consolidadas via `/grill-me`:**
   - **Escopo:** Modular por Área — ativação e persistência independentes para **Gestor/Admin**, **Portal Licenciadas** e **Portal Alunas**.
   - **Estratégia de Inversão Visual:** **Refatoração Rigorosa de Componentes** — migrar styled-components e estilos inline para consumir estritamente tokens de cores (`theme.colors`) e Variáveis CSS semânticas (`--bh-bg-app`, `--bh-bg-surface`, `--bh-bg-card`, `--bh-text-main`, `--bh-text-secondary`, `--bh-border`), eliminando cores hexadecimais *hardcoded* (`#0A3E60`, `#FFFFFF`, `#F8FAFC`, etc.).
   - **Persistência & Controle:** Persistência Híbrida — `LocalStorage` imediato por área (`bh_gestor_theme`, `bh_licenciada_theme`, `bh_aluna_theme`) + sincronização com endpoint de preferências do usuário + atalhos de teclado (`Ctrl+Shift+D`) e botões intuitivos nas TopBars/Navbars de cada portal.
   - **Identidade Estética:** **Deep Navy Luxury Void** (`#051524` App Background, `#0A233A` Sidebar/Surface, `#0D2A44` Cards, `#06192B` Inputs, acentos em Doctor Harmony Gold `#ED7E13` e tipografia nítida em `#FFFFFF` e `#F8FAFC`).

---

## 🔬 Análise Transversal em Seis Camadas

### 1. Camada de Dados
- **Tabela `user_preferences` / Coluna `theme_preferences` (JSON):**
  - Armazena as preferências de tema do usuário autenticado:
    ```json
    {
      "gestor_theme": "dark",
      "licenciada_theme": "dark",
      "aluna_theme": "system"
    }
    ```

### 2. Camada de Backend (PHP 8.4)
- **Serviço de Preferências:** Endpoint `/api/users/preferences` para persistir e sincronizar as preferências de tema ao logar em múltiplos dispositivos.

### 3. Camada de Interface & Tokens (Frontend React 18)
- **Provedor Raiz Unificado (`DynamicThemeWrapper.jsx` / `MultiAreaThemeProvider.jsx`):**
  - Montagem global de providers no `main.jsx`.
  - Injeção das variáveis CSS semânticas no `:root` e nos seletores modulares `[data-gestor-theme="dark"]`, `[data-licenciada-theme="dark"]`, `[data-aluna-theme="dark"]`.
- **Refatoração dos Componentes:**
  - Substituição sistemática de `color: #0A3E60;` e `background: #FFFFFF;` por variáveis CSS (`var(--bh-text-main)`, `var(--bh-bg-surface)`) ou getters dinâmicos de tema (`${({ theme }) => theme.colors.surface}`).
  - Adequação de ícones SVG (`currentColor`), cards, modais, tabelas, formulários e dropdowns em todas as áreas.

### 4. Camada de Rotas & Navegação
- Detecção automática da área atual pela rota (`/portal-gestor` ou `/admin` -> Gestor; `/portal-licenciada` -> Licenciada; `/portal-aluna` -> Aluna) para aplicar a respectiva folha e estado de tema.

---

## 🏛️ Três Opções de Arquitetura

### Opção A (Conservadora - Low Risk)
- Apenas envelopar o `main.jsx` com `GestorThemeProvider` e forçar regras globais de CSS com `!important` para sobrescrever estilos inline existentes.
- *Prós:* Resolução imediata do botão sem precisar tocar em dezenas de componentes.
- *Contras:* Não limpa o débito técnico de estilos *hardcoded*; pode gerar conflitos de contraste em componentes novos.

### Opção B (Recomendada - Balanced & Rigorosa)
- **Montagem do Contexto Modular no `main.jsx` + Refatoração de Tokens em Styled-Components + Persistência Híbrida.**
- Cria um subsistema de temas limpo e auditável, com variáveis CSS padronizadas (`--bh-*`) e suporte modular a cada portal, garantindo contraste AAA (textos brancos `#FFFFFF`/`#F8FAFC` sobre fundos Deep Navy `#0A233A` e `#0D2A44`).
- *Prós:* Arquitetura moderna, escalável, livre de hacks com `!important`, suporte a atalhos de teclado e persistência confiável.
- *Contras:* Exige refatorar componentes-chave de tabelas, cards e formulários para consumir as variáveis semânticas.

### Opção C (Next-Gen - Micro-Theming com CSS Custom Properties Engine)
- Motor de temas dinâmico com geração de paleta em tempo de execução via CSS Canvas e Tailwind v4 CSS variables.
- *Prós:* Customização granular por usuário.
- *Contras:* Complexidade desnecessária para o escopo atual do Body Harmony.

---

## 🏆 Veredito e Próximos Passos

A **Opção B** é a arquitetura ideal e alinhada com as respostas do `/grill-me`.

**Próximo Passo:** Executar o `/plan` para estruturar o plano detalhado de implementação atômica.
