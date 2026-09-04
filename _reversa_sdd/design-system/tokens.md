# Tabela de Tokens — Body Harmony

> Confidência por token: 🟢 CONFIRMADO | 🟡 INFERIDO | 🔴 LACUNA

## Shadows

| Token | Valor | Confiança |
|-------|-------|-----------|
| `small` | `0 2px 8px rgba(0, 0, 0, 0.1)` | 🟢 |
| `medium` | `0 4px 16px rgba(0, 0, 0, 0.15)` | 🟢 |
| `large` | `0 8px 32px rgba(0, 0, 0, 0.2)` | 🟢 |
| glass-effect | `0 8px 32px 0 rgba(0, 0, 0, 0.37)` | 🟢 |

## Transitions

| Token | Valor | Confiança |
|-------|-------|-----------|
| `fast` | `0.15s ease` | 🟢 |
| `normal` | `0.3s ease` | 🟢 |
| `slow` | `0.5s ease` | 🟢 |

## Z-index

Não há escala de z-index documentada no tema. Observado uso local em componentes.

## Border-radius

Não há tokens globais de border-radius. Valores são definidos por componente (styled-components).

## Opacidades Semânticas

| Contexto | Valor | Confiança |
|----------|-------|-----------|
| `darkTextMuted` | 0.5 | 🟢 |
| `glassBg` | 0.03 | 🟢 |
| `glassBorder` | 0.08 | 🟢 |
| `darkSurface` | 0.4 | 🟢 |
| `--nexus-glass` | 0.05 | 🟢 |
| `--tg-theme-hint-color` | 0.5 | 🟢 |

## Animação

| Token | Definição | Confiança |
|-------|-----------|-----------|
| `twaFadeIn` | `from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) }` | 🟢 |
| `.animate-fade-in` | `animation: twaFadeIn 0.4s ease-out forwards` | 🟢 |
