# 🧭 Spec: Navbar White Theme

**Source:** `Manual_Marca_Body_Harmony/Nav_Bar.md`
**Implemented:** v5.2.0

## 1. Visão Geral
Navbar fixa, fundo branco sólido, com comportamento de redução ao scroll. Design limpo focado em conversão.

## 2. Cores
- **Fundo:** `#FFFFFF` (Branco Sólido).
- **Sombra:** `0 4px 20px rgba(0,0,0,0.05)`.
- **Links (Padrão):** `#0A3E60` (Azul Escuro).
- **Links (Hover/Active):** `#ED7E13` (Laranja Vivo).
- **Ícone Mobile:** `#0A3E60`.

## 3. Botão CTA ("CONHEÇA O WORKSHOP")
- **Padrão:**
  - Fundo: `#000000` (Preto).
  - Texto: `#FFFFFF` (Branco).
  - Borda: `#000000`.
- **Hover:**
  - Fundo: `#DD8F39` (Amarelo/Laranja).
  - Texto: `#0A3E60` (Azul Escuro).
  - Borda: `#DD8F39`.

## 4. Comportamento
- **Mobile Menu:** Overlay branco total. Links centralizados.
- **Scroll:** Padding reduzido quando `scrollY > 50`.
- **Logo:** Cores originais (sem filtro de inversão).

## 5. Implementação Técnica
Componente: `src/pages/Home/components/NavbarV2.jsx`
Uso Global via `Layout.jsx`.
