# Sistema Tipográfico — Body Harmony

> Confidência: 🟢 CONFIRMADO (extraído de `theme.js`, `GlobalStyles.jsx`, `NexusThemeContext.jsx`)

## Famílias

| Role | Font Stack | Uso |
|------|-----------|-----|
| `heading` | `'Bison', 'Oswald', sans-serif` | Títulos, headings, uppercase |
| `body` | `'Montserrat', sans-serif` | Corpo de texto, parágrafos |
| `detail` | `'Poppins', sans-serif` | Detalhes, labels, captions |

### Variações

- `Bison` carregado via `@font-face` de `/fonts/Bison-Bold.ttf`, `font-display: swap`
- `Bison Bold` mesmo arquivo, registrado como `font-weight: bold`

### Nexus Dark Theme

| Role | Font Stack |
|------|-----------|
| `fontFamily` | `'Courier New', monospace` |
| `headingFont` | `'Montserrat', sans-serif` |

### Nexus Void Runner (NexusLayout)

| Role | Font Stack |
|------|-----------|
| Heading | `'Bison', sans-serif` |
| Body | `'Montserrat', sans-serif` |
| Detail | `'JetBrains Mono', monospace` |

## Hierarquia

| Elemento | Tamanho | Weight | Line-height | Transform |
|----------|---------|--------|-------------|-----------|
| `h1` | `clamp(2.5rem, 5vw, 4rem)` | 700 | 1.1 | uppercase, letter-spacing 1px |
| `h2` | `clamp(2rem, 4vw, 3rem)` | 700 | 1.1 | uppercase |
| `h3` | `clamp(1.5rem, 3vw, 2.25rem)` | 700 | 1.1 | uppercase |
| `h4` | `clamp(1.25rem, 2.5vw, 1.75rem)` | 700 | 1.1 | uppercase |
| `body` | `16px` (base) | normal (`body` = Montserrat) | 1.6 | normal |
| `body (mobile)` | `14px` (breakpoint tablet < 768px) | normal | 1.6 | normal |

## Estilo de Títulos

- Headings usam a fonte display **Bison** (condensed bold)
- **Text-transform: uppercase** em todos os headings
- Cor dos headings: `theme.colors.primary` (`#0A3E60`)

## Corpo de Texto

- Fonte base: **Montserrat** (sans-serif moderna, limpa)
- Tamanho base: `16px`
- Line-height: `1.6`
- Cor: `theme.colors.text` (`#0A3E60` — Navy Blue sobre fundo branco)
- `-webkit-font-smoothing: antialiased`
