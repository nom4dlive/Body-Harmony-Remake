# 🎨 Visual Identity V3 - Body Harmony

**Status:** ACTIVE  
**Last Update:** 2026-05-29 (V123 Spec Alignment & Core Audit)  
**Source:** Brand Manual Images

---

## 1. Paleta de Cores (Fonte da Verdade)

Devem ser usadas exatamente estes códigos. Não improvisar tonalidades.

### Primárias (Azuis)

> **COD. AZUL ESCURO** (Primary / Navbar / Footer / Strong Backgrounds)
>
> - **HEX:** `#0A3E60`
> - **RGB:** 10, 62, 96
> - **CMYK:** 99, 72, 37, 28

> **COD. AZUL CLARO** (Secondary / Details / Soft UI)
>
> - **HEX:** `#316B9C`
> - **RGB:** 49, 107, 156
> - **CMYK:** 84, 53, 18, 4

### Destaque (Laranjas/Amarelos)

> **COD. AMARELO (VIVO)** (Accent / CTA / Highlights)
>
> - **HEX:** `#ED7E13`
> - **RGB:** 237, 126, 19
> - **CMYK:** 1, 59, 96, 0

> **COD. AMARELO (MOSTARDA)** (Support / Subtitles / Borders)
>
> - **HEX:** `#DD8F39`
> - **RGB:** 221, 143, 57
> - **CMYK:** 11, 49, 4, 2

---

## 2. Tipografia

A hierarquia tipográfica deve ser respeitada rigorosamente.

### Headings (Títulos / Impacto)

**Font Family:** `Bison`

- **Bison Bold:** Títulos principais (H1, H2).
- **Bison Regular:** Subtítulos de impacto ou Labels.

### Body & UI (Leitura / Interface)

**Font Family:** `Montserrat`

- **Montserrat Bold:** Botões, Links, Destaques no texto.
- **Montserrat Regular:** Texto corrido (parágrafos), descrições.

### Detalhes (Legendas / Notas)

**Font Family:** `Poppins`

- **Poppins Light:** Texto de apoio leve, legendas finas.

---

## 3. Regras de Logotipo

### Variações Permitidas

1.  **Logo Principal:** Azul Escuro + Laranja. Uso em fundos brancos/claros.
2.  **Logo Monocromático:** Todo Azul Escuro. Uso corporativo restrito.
3.  **Logo Preto e Branco:** Uso em impressos p/b.
4.  **Logo Negativo (BRANCO PURO):** **OBRIGATÓRIO** em fundos escuros (Azul Escuro ou Preto).
    - _O ponto laranja pode permanecer laranja ou ficar branco no negativo, dependendo do contraste, mas o texto deve ser branco._

### Restrições (Não Fazer)

- ❌ Não inverter cores fora do padrão.
- ❌ Não alterar proporções.
- ❌ Não trocar a fonte.
- ❌ Não adicionar sombras ou efeitos (negrito/itálico).
- ❌ Tamanho mínimo de segurança: 15mm x 50mm.

---

## 4. Aplicação no Código (GlobalStyles/Theme)

```javascript
/* theme.js Reference */
colors: {
  primary: '#0A3E60',      // Azul Escuro
  primaryLight: '#316B9C', // Azul Claro
  secondary: '#ED7E13',    // Amarelo Vivo (CTA)
  secondaryMuted: '#DD8F39', // Amarelo Mostarda
  surface: '#F5F5F5',      // Off-white para seções claras
  background: '#FFFFFF',   // Fundo padrão
  text: '#0A3E60',         // Texto padrão (Azul Escuro é mais legível que preto puro em design clínico)
  white: '#FFFFFF'
},
fonts: {
  heading: 'Bison, sans-serif',
  body: 'Montserrat, sans-serif',
  detail: 'Poppins, sans-serif'
}
```
