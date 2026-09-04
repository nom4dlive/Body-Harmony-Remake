# PLAN-194: Sistema Universal de Fotos & Carrosséis Dinâmicos do Congresso

## 🎯 Objetivo
Implementar sistema modular e intuitivo de fotos no `/congresso` e no Portal do Gestor (`/portal-gestor/shop > CMS Congresso`):
1. **Blocos de Galeria Independentes**: Seções dedicadas de fotos/carrossel que podem ser ativadas/desativadas e posicionadas em qualquer ordem na página (drag-and-drop).
2. **Slots de Fotos In-Section**: Cada seção da landing page (Hero, Sobre, Oferta, VIP, Espaço, FAQ, etc.) ganha um slot opcional de foto/carrossel ajustável em relação ao texto.
3. **Controles de Proporção & Bordas Douradas**: Presets rápidos de tamanho (Pequeno 300px, Médio 500px, Grande 800px, 100% Full) + bordas refinadas (Dourada Fina, Dourada Neon Glow, Sem Borda).
4. **Modo Único ou Carrossel (até 7 fotos)**: Transição cruzada suave (**Fade In/Out**) clássica e minimalista com auto-play e dots de navegação.

## 🛡️ Espaço Negativo
- NÃO quebrar o layout existente se nenhuma foto for cadastrada (o slot permanece 100% oculto com zero espaço em branco).
- NÃO alterar a infraestrutura de upload já existente (`/admin/congresso/gallery/upload` / `upload.php`).

## ⚡ Micro-Steps de Dopamina (3 a 5 min cada)
- [ ] **Step 1: Componente Universal `LuxuryPhotoWidget.jsx`**
  - Criar componente reutilizável que suporta: Foto única ou Carrossel de até 7 fotos (Fade In/Out suave), controle proporcional de largura/altura, alinhamento (Esq/Centro/Dir) e acabamentos de borda dourada luxury (`gold-border`, `gold-glow`, `none`).
- [ ] **Step 2: Conectar Slots de Foto nas Seções do Congresso**
  - Integrar o `LuxuryPhotoWidget` nas seções `HeroSection`, `SobreSection`, `OfertaExperienceSection`, `VipSection` e na nova seção `GaleriaSection`.
  - Adicionar a seção `galeria` na lista de ordenação de seções (`DEFAULT_SECTIONS_ORDER`).
- [ ] **Step 3: Editor de Fotos & Carrossel no Painel do Gestor (`CongressoCmsTab.jsx`)**
  - Adicionar controle de fotos em cada aba do CMS: Upload de até 7 fotos, seletor Única/Carrossel, presets de tamanho (300px, 500px, 800px, 100%), seletor de borda dourada e alinhamento.
  - Adicionar nova aba "Galeria de Fotos" no menu lateral do CMS.
- [ ] **Step 4: Compilação, Deploy & Nexus Gate**
  - Executar `npm run build:release`, publicar via `deploy-pro.ps1 -SkipBuild` e validar com `nexus_gate.ps1`.

## 📁 Contratos & Arquivos Envolvidos
- `f:\Body-Harmony-Remake\apps\web-app\src\frontend\src\pages\Congresso\components\LuxuryPhotoWidget.jsx` [NEW]
- `f:\Body-Harmony-Remake\apps\web-app\src\frontend\src\pages\Congresso\sections\GaleriaSection.jsx` [NEW]
- `f:\Body-Harmony-Remake\apps\web-app\src\frontend\src\pages\Congresso\CongressoPage.jsx`
- `f:\Body-Harmony-Remake\apps\web-app\src\frontend\src\pages\Admin\Shop\components\CongressoCmsTab.jsx`
- `f:\Body-Harmony-Remake\apps\web-app\src\frontend\src\pages\Congresso\sections\HeroSection.jsx`
- `f:\Body-Harmony-Remake\apps\web-app\src\frontend\src\pages\Congresso\sections\SobreSection.jsx`
- `f:\Body-Harmony-Remake\apps\web-app\src\frontend\src\pages\Congresso\sections\VipSection.jsx`
