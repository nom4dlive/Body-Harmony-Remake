# PLAN-193: CMS Universal de Textos & Controles de Estilo Rápido para o Congresso

## 🎯 Objetivo
Abrir 100% dos textos da Landing Page do Congresso (`/congresso`) para edição dinâmica no Portal do Gestor (`/portal-gestor/shop > CMS Congresso`), incluindo listas de Benefícios, Diferenciais do Espaço, Perguntas do FAQ, Vantagens VIP e barras de ajuste fino de estilo (alinhamento, tamanho de fonte, cor e espaçamento).

## 🛡️ Espaço Negativo
- NÃO alterar rotas de pagamento ou regras de gateway Asaas.
- NÃO remover os fallbacks padrão de textos caso o gestor não preencha um campo.

## ⚡ Micro-Steps de Dopamina (3 a 5 min cada)
- [ ] **Step 1: Editor Dinâmico de FAQ & Diferenciais no CMS**
  - Adicionar formulários visuais com adição/remoção para as 9 perguntas do FAQ (`congresso_faq_json`) e 6 diferenciais do Espaço Full Sales (`congresso_espaco_diferenciais_json`) em `CongressoCmsTab.jsx`.
- [ ] **Step 2: Editor de Benefícios & Vantagens dos Lotes**
  - Adicionar controle de lista para os Benefícios da Seção Sobre (`congresso_sobre_beneficios_json`) e Vantagens VIP (`congresso_vip_beneficios_json`).
- [ ] **Step 3: Conexão das Seções Públicas do Congresso**
  - Atualizar `FaqSection.jsx`, `EspacoSection.jsx`, `SobreSection.jsx` e `VipSection.jsx` para ler as propriedades dinâmicas do CMS com fallback seguro.
- [ ] **Step 4: Barra de Ajuste Fino de Estilo Rápido por Seção**
  - Implementar seletores de Alinhamento (Esq/Centro/Dir), Tamanho de Fonte (H1/H2/Corpo), Cores (Gold/Branco) e Espaçamento de Seção (Compacto/Normal/Generoso) em cada uma das 10 abas do CMS.
- [ ] **Step 5: Compilação, Deploy & Nexus Gate**
  - Executar `npm run build:release`, sincronizar com a Hostinger via `deploy-pro.ps1 -SkipBuild` e validar com `nexus_gate.ps1`.

## 📁 Contratos & Arquivos Envolvidos
- `f:\Body-Harmony-Remake\apps\web-app\src\frontend\src\pages\Admin\Shop\components\CongressoCmsTab.jsx`
- `f:\Body-Harmony-Remake\apps\web-app\src\frontend\src\pages\Congresso\sections\FaqSection.jsx`
- `f:\Body-Harmony-Remake\apps\web-app\src\frontend\src\pages\Congresso\sections\EspacoSection.jsx`
- `f:\Body-Harmony-Remake\apps\web-app\src\frontend\src\pages\Congresso\sections\SobreSection.jsx`
- `f:\Body-Harmony-Remake\apps\web-app\src\frontend\src\pages\Congresso\sections\VipSection.jsx`
- `f:\Body-Harmony-Remake\apps\web-app\src\backend\api\v1\Services\ShopService.php`
