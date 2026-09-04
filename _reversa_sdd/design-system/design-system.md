# Design System — Body Harmony

## Arquitetura

O sistema de design do Body Harmony é gerenciado via **styled-components** (v6.1.13) com um objeto de tema central exportado de `styles/theme.js`.

### Fluxo de Tema

```
theme.js (base)
  └─ DynamicThemeWrapper.jsx (merge com siteConfig.theme_settings.colors da API)
       └─ ThemeProvider (styled-components) → app inteira

NexusThemeContext.jsx (dark/cyber)
  └─ NexusThemeProvider → rotas de superadmin (/admin/nexus/*)

NexusLayout.jsx (Void Runner)
  └─ ThemeProvider inline → rotas filhas do Nexus
```

### Temas

| Tema | Público | Arquivo | Tokens |
|------|---------|---------|--------|
| **Base** | Site público + admin | `theme.js` | 24 cores, 3 fontes, 4 breakpoints, 3 shadows, 3 transitions |
| **Nexus Dark** | Superadmin | `NexusThemeContext.jsx` | 10 cores dark, monospace, spacing 8px-grid |
| **Void Runner** | Nexus cyber | `NexusLayout.jsx` | Cyan neon, pink accent, JetBrains Mono |

### Personalização Dinâmica

- Admin pode alterar cores via **VisualEditor** (4 presets + custom)
- `DataContext` carrega `siteConfig.theme_settings` da API
- `DynamicThemeWrapper` faz merge dinâmico dos valores no `ThemeProvider`

## Princípios de Design

- **Clinical Trust** — Azul Navy (`#0A3E60`) transmite profissionalismo e confiança
- **Gold Luxury** — Laranja/Dourado (`#ED7E13`) para CTAs e destinos premium
- **Mobile-First** — Touch targets >= 44px, breakpoints progressivos (480/768/1024/1280)
- **High Contrast (WCAG AAA)** — Textos em superfícies escuras (Sidebar `#072B44`) usam estritamente Slate Claro (`#E2E8F0`) ou Branco (`#FFFFFF`); textos em superfícies claras usam Slate 900 (`#0F172A`). É proibido texto mudo/escuro sobre fundo escuro.
- **Dark Mode opcional** — Cinema/Dark Mode V3 com glassmorphism

## Glassmorphism

Presente no TWA e Nexus: `backdrop-filter: blur(12px)`, bordas semi-transparentes (`rgba(255,255,255,0.15)`), fundos com baixa opacidade.

## Diretrizes de Uso e Cores

| Elemento | Cor | Contexto | Contraste Mínimo |
|----------|-----|----------|-------------------|
| CTAs principais (Primary) | `#ED7E13` (Gold) | Botões de ação principal (Texto Branco `#FFF`) | $\ge 4.5:1$ |
| Links informativos | `#0A3E60` (Navy) | Links de navegação em superfícies claras | $\ge 7:1$ |
| Backgrounds | `#FFFFFF` / `#F8FAFC` | Superfícies limpas | - |
| Headings | `#0A3E60` ou `#0F172A` | Títulos em fundo claro | $\ge 10:1$ |
| Sidebar Inativo | `#E2E8F0` (Slate 200) | Menus inativos em fundo escuro (`#072B44`) | $\ge 10.5:1$ |
| Sidebar Ativo | `#FFB366` / `#FFFFFF` | Menu selecionado com pill ouro `rgba(237,126,19,0.2)` | $\ge 7:1$ |


## Arquivos de Origem

| Arquivo | Conteúdo |
|---------|----------|
| `frontend/src/styles/theme.js` | Tema base (cores, fontes, breakpoints, shadows, transitions) |
| `frontend/src/styles/GlobalStyles.jsx` | Estilos globais, `@font-face`, resets, hierarquia tipográfica |
| `frontend/src/styles/twa-styles.css` | Variáveis CSS TWA, glassmorphism, touch targets |
| `frontend/src/context/NexusThemeContext.jsx` | Tema dark Nexus |
| `frontend/src/context/DynamicThemeWrapper.jsx` | Merge de tema dinâmico |
| `frontend/src/pages/Nexus/NexusLayout.jsx` | Void Runner (terceiro tema) |
| `frontend/src/pages/Admin/VisualEditor/VisualEditor.jsx` | 4 presets de tema editáveis |
| `DESIGN.md` | Documentação de design do projeto |
