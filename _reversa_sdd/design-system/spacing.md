# Espaçamento, Grid e Breakpoints — Body Harmony

> Confidência: 🟢 CONFIRMADO (extraído de `theme.js`, `GlobalStyles.jsx`, `NexusThemeContext.jsx`, `twa-styles.css`)

## Breakpoints

| Token | Valor | Dispositivo |
|-------|-------|-------------|
| `mobile` | `480px` | Smartphones |
| `tablet` | `768px` | Tablets |
| `desktop` | `1024px` | Desktops |
| `wide` | `1280px` | Telas largas |

## Container

- Classe `.container`: `max-width: 1240px`, margem automática, padding lateral `0 1rem`

## Touch Targets (Mobile-First)

- Regra global: `button, input, textarea { min-height: 44px }` (alvo mínimo WCAG)

## Escala de Espaçamento

### Base Theme

Não há uma escala numérica explícita no tema base. O padding do container usa `1rem`. O espaçamento visual é delegado aos componentes individuais via styled-components.

### Nexus Theme (Superadmin)

- Função `spacing(factor)` → `${factor * 8}px` (grid 8px)
  - `spacing(1)` = `8px`
  - `spacing(2)` = `16px`
  - `spacing(3)` = `24px`
  - `spacing(4)` = `32px`
  - `spacing(6)` = `48px`
  - `spacing(8)` = `64px`

### TWA Container

- `.twa-container`: `padding: 16px`, `max-width: 100%`
- `.glass-effect`: `backdrop-filter: blur(12px)`, `box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37)`
