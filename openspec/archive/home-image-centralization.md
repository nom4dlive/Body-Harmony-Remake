# Brainstorm: Centralização de Imagens da Home

**Data:** 12/01/2026
**Contexto:** O usuário notou inconsistência entre o Admin e a Home. Imagens hardcoded (`/hero-bg.jpg`, `/gallery/treatment.png`) estão sendo exibidas em vez das imagens gerenciadas pelo CMS.

---

## 1. Mapeamento de "Dead Code" / Hardcoded Assets

Identificamos os seguintes pontos críticos em `src/pages/Home`:

| Componente | Local (Arquivo) | Fallback/Hardcoded Atual | Novo Slot Sugerido |
| :--- | :--- | :--- | :--- |
| **Hero Section** | `Home.jsx` (L30) | `url('/hero-bg-v3.jpg')` | `home_hero` |
| **Visual Strip** | `VisualStrip.jsx` (L58) | `/gallery/treatment.png` (e outros) | `home_strip` |
| **Bottom CTA** | `Home.jsx` (L199) | `url('/hero-bg.jpg')` | `home_cta_bg` (Novo Slot) |
| **Authority** | `AuthorityTestimonial.jsx` | *(Provável hardcoded)* | `home_authority_bg` (Novo Slot) |

## 2. Estratégia de Refatoração

### 2.1 Hook Centralizado `useHomePageImages`
Para evitar "prop drilling" excessivo ou múltiplos fetches, podemos criar um hook que consome o contexto da Galeria (ou faz fetch) e retorna um objeto organizado:

```javascript
const { heroBg, stripImages, ctaBg } = useHomePageImages();
// heroBg = "https://hostinger.../uploads/minha-foto.jpg" ou fallback
```

### 2.2 Atualização dos Componentes
- **`Home.jsx`:** Receberá `style={{ backgroundImage: url(heroBg) }}` dinamicamente.
- **`VisualStrip.jsx`:** Atualizar filtro para `usage_locations.includes('home_strip')`.

### 2.3 Novos Slots no Admin
Precisamos adicionar ao `ImageManager.jsx` os slots que faltam para cobrir 100% da Home:
- `home_cta_bg` ("CTA Final - Fundo")
- `home_authority_bg` ("Seção Autoridade - Fundo")

## 3. Plano de Ação
1.  **!S:** Atualizar Spec de Galeria para incluir mapeamento completo da Home.
2.  **!P:** Proposta de Refatoração "Home Dynamic Assets".
3.  **!I:** Implementar hook e atualizar componentes.
