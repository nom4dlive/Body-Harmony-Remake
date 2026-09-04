---
color:
  # Paleta Base Brand
  primary: "#0A3E60"              # Deep Navy Blue (Brand Principal)
  secondary: "#ED7E13"            # Metallic Luxury Gold (CTAs & Destaques)
  primary-dark: "#072B44"         # Deepest Navy (Sidebar / Headers Escuros)
  background: "#F8FAFC"           # Slate Clean Surface (Fundo da Aplicação)
  surface: "#FFFFFF"              # Pure White Cards (Superfícies de Conteúdo)
  
  # Tipografia em Superfícies Claras (#FFFFFF / #F8FAFC) - WCAG AAA
  text: "#0F172A"                 # Slate 900 (Texto Principal / Títulos - Alto Contraste)
  text-heading: "#0A3E60"         # Navy Intenso para H1, H2, H3
  text-light: "#475569"           # Slate 600 (Subtítulos e Metadados - Contraste >= 7:1)
  text-muted: "#64748B"           # Slate 500 (Legendas e Placeholders - Contraste >= 4.6:1)
  
  # Tipografia em Superfícies Escuras (#072B44 / #0A3E60 / #051A29) - WCAG AAA
  dark-bg: "#072B44"              # Deep Navy Background
  dark-surface: "rgba(10, 62, 96, 0.6)"
  dark-text: "#FFFFFF"            # 100% Branco Puro (Títulos e Textos Principais - Contraste >= 14:1)
  dark-text-secondary: "#E2E8F0"  # Slate 200 (Itens Inativos de Menu / Subtítulos - Contraste >= 10.5:1)
  dark-text-muted: "#94A3B8"      # Slate 400 (Ícones e Apoio Leve - Contraste >= 5.2:1)
  dark-active-pill: "rgba(237, 126, 19, 0.20)" # Fundo translúcido do item ativo
  dark-active-text: "#FFB366"     # Ouro Vibrante em Negrito para Menu Ativo
  dark-active-border: "#ED7E13"   # Borda Esquerda de Destaque
  
  # Status Semânticos & Badges (Alto Contraste)
  success: "#10B981"              # Emerald Green
  success-bg: "#D1FAE5"           # Fundo Badge Verde
  success-text: "#065F46"         # Texto Badge Verde
  warning: "#F59E0B"              # Amber Gold
  warning-bg: "#FEF3C7"           # Fundo Badge Âmbar
  warning-text: "#92400E"         # Texto Badge Âmbar
  error: "#EF4444"                # Ruby Red
  error-bg: "#FEE2E2"             # Fundo Badge Vermelho
  error-text: "#991B1B"           # Texto Badge Vermelho
  
  # Glassmorphism & Bordas Nítidas
  border: "#E2E8F0"               # Linhas Divisórias em Superfícies Claras
  border-strong: "#CBD5E1"        # Bordas de Inputs e Containers
  glass-bg: "rgba(255, 255, 255, 0.08)"
  glass-border: "rgba(255, 255, 255, 0.15)"

typography:
  font-family:
    heading: "'Outfit', 'Bison', 'Oswald', sans-serif"
    body: "'Montserrat', 'Inter', sans-serif"
    detail: "'Poppins', sans-serif"

shadow:
  small: "0 2px 6px rgba(0, 0, 0, 0.06)"
  medium: "0 4px 14px rgba(0, 0, 0, 0.10)"
  large: "0 10px 25px rgba(0, 0, 0, 0.15)"
  gold-glow: "0 4px 14px rgba(237, 126, 19, 0.35)"

motion:
  fast: "0.15s cubic-bezier(0.16, 1, 0.3, 1)"
  normal: "0.25s cubic-bezier(0.16, 1, 0.3, 1)"
  slow: "0.4s cubic-bezier(0.16, 1, 0.3, 1)"

breakpoints:
  mobile: "480px"
  tablet: "768px"
  desktop: "1024px"
  wide: "1280px"
---

# 🏛️ Body Harmony — Global Visual Identity & Design System (V4 Luxury)

O Design System global do ecossistema Body Harmony é fundamentado em **Confiança Clínica (Clinical Trust)**, **Exclusividade de Alto Padrão (Gold Luxury)** e **Acessibilidade Visual Inegociável (WCAG AAA)**.

---

## 🚫 REGRA DE OURO DE CONTRASTE (ZERO TEXTO MUDO EM FUNDOS ESCUROS)

> [!CAUTION]
> **PROIBIÇÃO CONSTITUCIONAL DE TEXTO ESCURO SOBRE FUNDO ESCURO:**
> É expressamente proibido utilizar tons de azul escuro, cinza escuro ou opacidades reduzidas ($\le 0.70$) para renderizar rótulos de texto sobre superfícies escuras (como Sidebar `#072B44`, Headers Navy `#0A3E60` ou Dark Mode).
> 
> - **No Sidebar Escuro (`#072B44`):**
>   * Rótulos inativos de navegação **DEVEM** ser renderizados estritamente em **Slate 200 (`#E2E8F0`)** ou **Branco Puro (`#FFFFFF`)**.
>   * Rótulos ativos **DEVEM** utilizar **Ouro Vibrante (`#FFB366`)** ou **Branco Puro (`#FFFFFF`)** com fundo translúcido ouro (`rgba(237, 126, 19, 0.20)`) e borda lateral `#ED7E13`.
>   * Ícones inativos utilizam **Slate 400 (`#94A3B8`)**, transitando para `#FFFFFF` no estado de hover.
>   * Botões de ação primária (ex: `+ Novo Lead`, `+ Agendar`) utilizam **Fundo Ouro (`#ED7E13`)** com **Texto Branco Puro (`#FFFFFF`)**.

---

## 🎨 1. Aplicação em Superfícies Claras (Light Mode / Workspace)

- **Fundo Global da Aplicação:** `#F8FAFC` (Clean Slate — suave para leitura contínua).
- **Cards e Painéis:** `#FFFFFF` com borda sutil `1px solid #E2E8F0` e raio `10px` a `14px`.
- **Hierarquia de Texto:**
  - **Títulos e Destaques:** `#0F172A` (Slate 900) ou `#0A3E60` (Navy Brand).
  - **Corpo de Texto e Mensagens:** `#0F172A` (Legibilidade máxima).
  - **Metadados, Horários e Subtítulos:** `#475569` (Slate 600 — contraste $\ge 7:1$).
- **Balões de Conversa no Atendimento / CRM:**
  - *Mensagens do Cliente / Entrada:* Fundo `#FFFFFF`, Borda `1px solid #CBD5E1`, Texto `#0F172A`.
  - *Mensagens do Atendente / Saída:* Fundo `#0A3E60` (Navy), Texto `#FFFFFF` (Branco), Hora `#93C5FD`.
  - *Notas Internas (Whisper Notes):* Fundo `#FEF3C7`, Borda `1px dashed #D97706`, Texto `#78350F`.

---

## 🌓 2. Aplicação em Superfícies Escuras (Dark Mode / Sidebar / TopBar)

- **Fundo Primário Escuro:** `#072B44` / `#051A29` (Deep Navy).
- **Vidro / Glassmorphism:** `rgba(10, 62, 96, 0.6)` com borda `rgba(255, 255, 255, 0.15)` e `backdrop-filter: blur(12px)`.
- **Textos e Rótulos:**
  - **Títulos / Headers:** `#FFFFFF` (100% Branco).
  - **Itens de Menu Inativos:** `#E2E8F0` (Slate Claro — contraste $10.5:1$).
  - **Item de Menu Ativo:** Fundo `rgba(237, 126, 19, 0.20)`, Borda Esquerda `3px solid #ED7E13`, Texto `#FFB366` / `#FFFFFF`.

---

## ✍️ 3. Tipografia Oficial

1. **Headings & Impacto (H1, H2, H3, Números de KPIs):**
   - Fonte: `'Outfit', 'Bison', 'Oswald', sans-serif`
   - Características: Imponente, moderna, estruturada.
2. **Body & UI (Leitura, Parágrafos, Chat, Formulários):**
   - Fonte: `'Montserrat', 'Inter', sans-serif`
   - Características: Geométrica, nítida, altamente legível em telas de qualquer resolução.
3. **Detalhes e Apoio (Badges, Tooltips, Legendas):**
   - Fonte: `'Poppins', sans-serif`

---

## 🕹️ 4. Ergonomia e Microinterações

- **Touch Targets:** Tamanho mínimo de clique $\ge 44 \times 44\text{px}$ para todos os botões, chips e ícones.
- **Transições:** Transições rápidas e fluidas de `0.25s cubic-bezier(0.16, 1, 0.3, 1)` em hovers, abertura de modais e recolhimento de sidebar (`Ctrl+B`).
- **Sombras:** Sombras limpas e difusas (`0 4px 14px rgba(0, 0, 0, 0.08)`), evitando bordas pesadas ou aspecto sujo.
