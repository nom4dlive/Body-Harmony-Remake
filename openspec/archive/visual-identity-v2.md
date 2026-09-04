# Visual Identity V2 Specification

**Source:** Manual_Marca_Body_Harmony (Jan 2026)
**Type:** Branding Core

---

## 🎨 Cores Oficiais

A paleta Premium (Preto/Dourado) será substituída pela identidade "Clinical Trust" (Azul/Laranja).

| Nome | Hex | Uso |
| :--- | :--- | :--- |
| **Azul Escuro** | `#0A3E60` | Cor Primária, Fundos, Cabeçalhos Fortes |
| **Azul Claro** | `#316B9C` | Cor Secundária, Destaques Suaves |
| **Laranja Vivo** | `#ED7E13` | Ação (CTA), Alertas, Detalhes Vibrantes |
| **Laranja Suave** | `#DD8F39` | Gradientes, Bordas, Ícones Secundários |
| **Branco** | `#FFFFFF` | Fundo Geral (Clean) |
| **Cinza Neutro** | `#F5F5F5` | Fundo Alternativo (Seções) |

### Regras de Combinação
- **Hero/Nav:** Fundo Azul Escuro (`#0A3E60`) com Texto Branco.
- **CTAs:** Laranja Vivo (`#ED7E13`) com Texto Branco ou Azul Escuro.
- **Divisores:** Devem transicionar entre Branco e Azul, ou usar o Laranja como "fio condutor" em substituição ao Dourado.

---

## 🔤 Tipografia

### Fontes
1.  **Heading:** `Bison` (Bold)
    - *Fallback:* `Oswald` (Se Bison não disponível via Webfont).
    - *Uso:* Títulos de seções, banners.
2.  **Body:** `Montserrat` (Regular/Bold)
    - *Uso:* Textos corridos, botões, menus.
3.  **Detail:** `Poppins` (Light)
    - *Uso:* Legendas, itálicos, detalhes finos.

### Pesos
- **Bold:** 700 (Títulos)
- **Regular:** 400 (Texto)
- **Light:** 300 (Detalhes)

---

## 🚫 Proibições (Brand Safety)
- **NÃO USAR:** Preto Absoluto (`#000000`). Substituir por Azul Escuro (`#0A3E60`).
- **NÃO USAR:** Dourado (`#D4AF37`) da versão anterior. Substituir por Laranja (`#ED7E13`).
- **IMAGENS:** Proibido fotos de clientes em roupas íntimas (exceto biquíni profissional de avaliação, se aplicável, mas evitar).

---

## 🔄 Migração Técnica
O arquivo `theme.js` deve ser atualizado para refletir essas constantes, removendo as chaves `premium`, `premiumLight`, `accentGold`.
