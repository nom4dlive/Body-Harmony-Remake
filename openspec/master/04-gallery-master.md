# 🖼️ Especificação Master: Sistema de Galeria (v2.0)

> **ID:** SPEC-GALLERY-MASTER
> **Status:** Ativo
> **Contexto:** Gerenciamento centralizado de mídia e resultados.

---

## 1. Visão Geral
Sistema robusto para upload, categorização e exibição de imagens. Serve tanto para a Galeria de Resultados ("Antes e Depois") quanto para o acervo de mídia do site (Heroes, Banners).

---

## 2. API e Backend

### 2.1 Endpoints
- **`GET /api/gallery.php`**: Lista imagens. Suporta filtros por `section` (ex: `hero`, `before_after`) e paginação.
- **`POST /api/upload.php`**: Recebe `multipart/form-data`. Valida extensões (JPG, PNG, WEBP) e tamanho (< 5MB). Salva em `uploads/`.
- **`DELETE /api/gallery.php?id=X`**: Remoção lógica ou física (configurável).

### 2.2 Estrutura de Banco (`gallery_images`) (V8 SCHEMA)
- `id` (INT PK)
- `filename` (VARCHAR) - Nome do arquivo físico (ex: `hero_bg_01.jpg`)
- `section` (VARCHAR) - 'hero', 'before_after', 'mentor', 'general'
- `usage_locations` (VARCHAR) - Opcional: Onde está sendo usada (ex: 'homepage.hero')
- `dimensions` (VARCHAR) - Metadados de tamanho (ex: '1920x1080')
- `alt_text` (VARCHAR) - Texto alternativo para acessibilidade/SEO
- `student_id` (INT FK) - Opcional, para vincular a licenciada
- `adjustments` (JSON) - Zoom, Crop, Overlay (Novo em v6.0)

---

## 3. Funcionalidades Avançadas

### 3.1 Live Preview & Ajustes (VE-IMG-CTRL)
- **Zoom & Pan:** Controle deslizante para ajustar o "recorte" visual da imagem sem editar o arquivo original (CSS `transform: scale()`).
- **Overlay:** Aplicação de máscaras ou sobreposições (ex: marca d'água, gradiente) via CSS.
- **Persistência:** Os ajustes são salvos na coluna `adjustments` JSON e reaplicados no frontend público.

### 3.2 Comparador "Antes e Depois"
- Componente React `<BeforeAfterSlider />`.
- Aceita duas imagens (Before, After).
- Slider interativo para revelar a transformação.

### 3.3 Image Picker Universal
- Componente Modal reutilizável no Editor Visual.
- Permite selecionar imagens já enviadas em vez de realizar novos uploads.

---

## 4. Otimização
- **Thumbnails:** O backend deve (idealmente) gerar versões minificadas para listagens.
- **Formato:** Conversão automática para WebP recomendada (Roadmap v3.0).
- **CDN:** Assets servidos diretamente do Apache (Static).
