# 🎨 Especificação Master: Editor Visual (v2.0)

> **ID:** SPEC-VE-MASTER
> **Status:** Ativo
> **Contexto:** Admin UI para personalização No-Code do site.

---

## 1. Visão Geral
O Editor Visual é o coração da experiência administrativa do Body Harmony v6.0. Ele permite que o administrador personalize textos, imagens, cores, layouts e funcionalidades do site público em tempo real, com preview instantâneo.

---

## 2. Arquitetura do Editor

### 2.1 Componentes Core
- **`VisualEditor.jsx`:** Container principal. Gerencia o estado `localConfig` (rascunho) e `siteConfig` (produção).
- **`LivePreview`:** Iframe ou renderização direta dos componentes reais (`Hero`, `Navbar`, etc) injetando o `localConfig` via `DataContext`.
- **`Sidebar`:** Painel de controle lateral com abas (Conteúdo, Design, Configurações).

### 2.2 Persistência
- **Rascunho:** Estado React (`useState`).
- **Salvar:** `POST /api/configuration.php` (Atualiza `site_config` no MySQL).
- **Reset:** Capacidade de descartar alterações não salvas.

---

## 3. Funcionalidades (Features)

### 3.1 🖼️ Gerenciador de Mídia (VE-MEDIA)
- **Integração:** Substitui inputs de URL por um "Media Picker".
- **Galeria:** Modal que lista imagens de `public_html/api/uploads/`.
- **Upload:** Drag-and-drop para enviar novas imagens diretamente do editor.
- **Metadados:** Edição de `alt_text` para SEO.

### 3.2 🎨 Seletor de Temas (VE-THEMES)
- **Presets:** Conjuntos predefinidos de cores e estilos.
    - *Original Navy* (Padrão)
    - *Dark Premium* (Noturno)
    - *Medical Clean* (Branco/Azul Claro)
    - *Royal Purple* (Roxo/Dourado)
- **Preview:** Aplicação instantânea de variáveis CSS (Design Tokens).

### 3.3 🧭 Super Navbar (VE-NAV)
- **Layouts:** Padrão (Split), Centralizado, Minimalista (Hambúrguer).
- **Estilo:** Glassmorphism (Vidro), Cores Sólidas, Transparência.
- **Densidade:** Compacta, Normal, Espaçosa.
- **Logo Universal:** Tecnologia de Máscara CSS para colorir SVG on-the-fly.
- **Modo Alternativo:** Controle total da faixa de logo quando o menu está oculto.

### 3.4 📱 Preview Multidispositivo (VE-DP)
- **Viewport Controls:** Barra de ferramentas para simular dispositivos.
    - Mobile (375px)
    - Tablet (768px)
    - Desktop (100%)
- **Animação:** Transições suaves de redimensionamento (`transition: width 0.3s`).
- **Scroll Sync:** Manter posição de rolagem ao trocar de view.

### 3.5 🖱️ Edição Inline (VE-INLINE)
- **Click-to-Focus:** Clicar em um elemento no Preview (ex: Título do Hero) abre/foca o campo correspondente na Sidebar.
- **Highlight:** Outline visual ao passar o mouse sobre elementos editáveis.
- **Instrumentação:** Uso de atributos `data-sb-field="hero.title"` nos componentes React.

---

## 4. Estrutura de Dados (`site_config`)

O Editor manipula um objeto JSON com a seguinte estrutura base:

```json
{
  "theme": { "primary": "#...", "secondary": "#..." },
  "navbar": {
    "enabled": true,
    "style": { "layout": "standard", "glass": true, ... },
    "links": { "contact": true, ... }
  },
  "home_hero": {
    "title": "Texto...",
    "backgroundImage": "/server/uploads/img.jpg"
  },
  "seo": { "title": "Body Harmony", "description": "..." }
}
```

## 5. Roadmap Futuro (v3.0)
- **Histórico de Versões:** Undo/Redo robusto.
- **A/B Testing:** Configurações alternativas para testes.
- **Multi-Language:** Suporte a i18n no JSON de config.
