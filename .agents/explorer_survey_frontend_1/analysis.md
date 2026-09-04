# 🏛️ Relatório de Investigação Arquitetural do Frontend (PLAN-064)
**Projeto:** Body Harmony Remake (Nexus Protocol V3.1)  
**Módulo:** Funil de Onboarding de Licenciadas, Pré-cadastro com OCR e Automação de Contratos em 1-Clique  
**Data:** 2026-08-20  
**Autor:** Frontend Architecture Explorer (`explorer_survey_frontend_1`)

---

## 1. Visão Geral da Arquitetura Frontend (`apps/web-app`)

O frontend é uma SPA construída em **React 18.3.1** empacotada com **Vite 6.0.5**, utilizando **styled-components 6.1.13**, **Tailwind CSS utilities**, **framer-motion 12.26.2** e **lucide-react / react-icons** para componentes interativos e microinterações.

### 1.1 Roteamento e Proteção de Rotas (`App.jsx` e `config/routes.js`)
* **Roteador:** `react-router-dom` v7.1.1 configurado com `BrowserRouter`, `Routes`, `Route`, `Suspense` e `lazy()` para todas as páginas com code-splitting automático.
* **Rotas Públicas Standalone:**
  - `/assinar/:signToken` (`PublicSignPage.jsx`) — Assinatura digital pública de contratos (PLAN-036).
  - `/validar/:uuid` e `/validar` (`PublicValidatePage.jsx`) — Validação pública criptográfica de autenticidade (PLAN-061).
  - `/onboarding/:token` e `/pre-cadastro/:token` (**A SER ADICIONADO PARA O PLAN-064**) — Página pública mobile-first de pré-cadastro e upload de documentos.
* **Rotas Administrativas Protegidas:**
  - `<ProtectedRoute>` valida a sessão admin armazenada em `localStorage.getItem('bh_auth')`.
  - `${ROUTES.ADMIN}/onboarding` ou `/portal-gestor/onboarding` (**A SER ADICIONADO PARA O PLAN-064**) — Painel do Gestor com visão dupla (Kanban 5 colunas + Tabela de Licenciadas).
* **Layouts Base:**
  - `AdminLayout.jsx`: Sidebar retrátil no desktop com scrollbar dourada customizada, Header mobile responsivo, Bottom Navigation no mobile (`AdminBottomNav`), suporte a temas e modais.
  - Páginas públicas standalone (como `PublicSignPage` e `PublicOnboardingPage`) operam **fora** do layout padrão de marketing para garantir máxima conversão, foco e imersão estética mobile-first.

---

## 2. Design System, Cores de Luxo e Convenções de UI

### 2.1 Identidade Visual e Tokens (`styles/theme.js`)
* **Primary (Navy Blue):** `#0A3E60` — Cor institucional principal, fundos nobres, cabeçalhos e títulos.
* **Secondary / Gold Accent:** `#ED7E13` — Ações primárias, botões de conversão (CTAs), destaques de status ativo e barras de progresso.
* **Dark Background (Cinema/Gestor):** `#051A29` e `radial-gradient(circle at 50% 0%, #0A3E60 0%, #051A29 80%)`.
* **Superfícies Claras:** `#FFFFFF` e `#F8FAFC` com bordas sutis em `#E2E8F0` ou `#CBD5E1`.
* **Sucesso / WhatsApp:** `#25D366` (WhatsApp), `#00B090` / `#10B981` (Sucesso).
* **Tipografia:**
  - Títulos: `'Bison', 'Bison Bold', 'Oswald', sans-serif` (uppercase, condensed bold).
  - Corpo: `'Montserrat', sans-serif` (moderno e legível).
  - Detalhes/Badges: `'Poppins', sans-serif`.

### 2.2 Convenções Mobile-First
* **Touch Targets:** Todos os botões, abas e inputs interativos possuem altura mínima de `44px` a `48px` (`min-height: 44px` / `h-11`).
* **Responsividade:** Uso de media queries com breakpoints:
  - Mobile: `<= 480px` (layouts verticais de coluna única, tipografia fluida via `clamp()`).
  - Tablet: `<= 768px` (conversão de sidebar em bottom nav, grid 1-2 colunas).
  - Desktop: `>= 1024px` (grid Kanban multi-colunas, split-views).
* **Feedback Visual:** Uso de spinners pulsantes (`animate-spin`, `FaSpinner`), transições suaves de 0.2s e badges coloridos com microinterações.

---

## 3. Serviços de API e Integração com Backend (`services/api.js`)

O arquivo `src/frontend/src/services/api.js` centraliza as chamadas HTTP com:
1. **Base URL:** `/api` (com proxy automático configurado no Vite para `http://127.0.0.1:8080`).
2. **Resiliência (Stability Shield):** `fetchWithRetry()` para tentativas automáticas em caso de erro 500/503 em requisições GET.
3. **Autenticação Dinâmica:**
   - Headers com `Authorization: Bearer <token>` extraído de `bh_auth` para rotas do Gestor/Admin.
   - Headers `X-DEVICE-TOKEN` e fingerprint persistente `bh_device_uuid`.
4. **Cache em Memória:** `NEXUS_CACHE` com invalidação automática em mutações (`POST`, `PUT`, `DELETE`).

### 3.1 Especificação do Módulo de API: `onboardingApi`
Para o PLAN-064, deve ser exportado no `services/api.js`:

```javascript
export const onboardingApi = {
  // Gestor Endpoints
  getFunnel: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/v1/admin/onboarding/funnel${qs ? '?' + qs : ''}`);
  },
  getLeadDetail: (id) => request(`/v1/admin/onboarding/leads/${id}`),
  generateLink: (data) => request('/v1/admin/onboarding/links', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateLeadStatus: (id, status) => request(`/v1/admin/onboarding/leads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  generateContract: (id, payload = {}) => request(`/v1/admin/onboarding/leads/${id}/generate-contract`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  confirmPayment: (id) => request(`/v1/admin/onboarding/leads/${id}/confirm-payment`, {
    method: 'POST'
  }),
  sendWhatsAppReminder: (id, type = 'assinatura') => request(`/v1/admin/onboarding/leads/${id}/send-reminder`, {
    method: 'POST',
    body: JSON.stringify({ type })
  }),
  
  // Public Endpoints (Sem exigência de auth admin)
  validateToken: (token) => request(`/v1/public/onboarding/validate?token=${encodeURIComponent(token)}`),
  submitPublicOnboarding: (formData) => request('/v1/public/onboarding/submit', {
    method: 'POST',
    body: formData // FormData multipart para foto/OCR
  })
};
```

---

## 4. Blueprints Detalhados dos Componentes PLAN-064

### 4.1 Componente: `PublicOnboardingPage.jsx`
* **Localização:** `apps/web-app/src/frontend/src/pages/Public/PublicOnboardingPage.jsx` (ou `pages/PublicOnboarding/PublicOnboardingPage.jsx`).
* **Público-alvo:** Nova licenciada acessando link seguro via smartphone (WhatsApp).
* **Propósito:** Auto-preenchimento cadastral descomplicado com upload fotográfico do documento de identificação (RG/CNH/CPF) e extração inteligente via OCR.
* **Estrutura e UX Flow (3 Etapas):**
  1. **Gatekeeper de Validação do Token:**
     - Ao montar (`useEffect`), consulta `onboardingApi.validateToken(token)`.
     - Exibe skeleton / loading elegante em `#0A3E60`.
     - Se o token for inválido ou expirado: Renderiza `TokenExpiredCard` com mensagem explicativa e botão direto para suporte no WhatsApp oficial da Body Harmony.
  2. **Etapa 1: Dados Cadastrais & Contato:**
     - Campos: Nome Completo, CPF (com máscara automática), RG / Órgão Emissor, Data de Nascimento, WhatsApp (máscara `(99) 99999-9999`), E-mail, CEP (com busca automática de endereço via ViaCEP), Endereço, Número, Complemento, Bairro, Cidade, UF.
     - Seleção de Categoria Pretendida (ex: Licenciada Bronze, Prata, Ouro, Diamond).
  3. **Etapa 2: Captura Fotográfica de Documento (OCR Ready):**
     - Alerta visual com orientações de boa foto (documento legível, boa iluminação, sem reflexos).
     - Componente de Upload / Câmera (`<input type="file" accept="image/*" capture="environment" />`).
     - Preview da imagem capturada em tempo real com opção de trocar.
     - Validação de tamanho (máx 10MB) e tipo (JPEG/PNG/PDF).
  4. **Etapa 3: Consentimento LGPD & Confirmação:**
     - Checkbox obrigatório de aceite dos Termos de Tratamento de Dados e Privacidade para fins de credenciamento e emissão de contrato.
     - Botão CTA Gold: `Finalizar Pré-cadastro & Enviar Documento` (`min-height: 48px`, feedback de envio `isSubmitting`).
  5. **Tela de Sucesso Instantâneo:**
     - Animação de checkmark dourado/esmeralda, mensagem de boas-vindas ao ecossistema Body Harmony e explicação dos próximos passos:
       *"Seus dados e documentos foram recebidos com sucesso! Nossa equipe gerará seu Contrato Oficial de Licenciamento em instantes e enviará o link de assinatura digital direto no seu WhatsApp."*

---

### 4.2 Componente: `OnboardingFunnelPage.jsx`
* **Localização:** `apps/web-app/src/frontend/src/pages/Gestor/Onboarding/OnboardingFunnelPage.jsx`.
* **Público-alvo:** Gestores e equipe de expansão da Body Harmony.
* **Propósito:** Gestão centralizada do pipeline de novas licenciadas desde o primeiro contato até a ativação definitiva no LMS.
* **Estrutura da Página:**
  1. **Header & Ações Globais:**
     - Título com ícone: `Funil de Onboarding de Licenciadas`.
     - Alternador de Visualização (Segmented Control): `[ Kanban (5 Colunas) | 📋 Tabela Geral ]`.
     - Botão `+ Gerar Link de Pré-cadastro`: Abre modal para informar Categoria e WhatsApp do Lead e gerar URL pública com token criptografado.
     - Botão de Atualização com spinner (`RefreshCw`).
  2. **Barra de Métricas (Bento KPI Grid):**
     - **Card 1:** Total de Leads em Onboarding.
     - **Card 2:** Links Enviados (Aguardando Retorno).
     - **Card 3:** Documentos Recebidos / OCR Pronto para Emissão.
     - **Card 4:** Contratos Emitidos (Aguardando Assinatura).
     - **Card 5:** Licenciadas Ativadas & Concluídas (Mês Atual).
  3. **Visão Kanban (5 Colunas Dinâmicas):**
     - **Coluna 1 (`novo_lead` / `pre_cadastro`):** Leads cadastrados que ainda não receberam link ou estão em triagem inicial.
     - **Coluna 2 (`link_enviado` / `aguardando_dados`):** Licenciadas que receberam o link de pré-cadastro e estão preenchendo.
     - **Coluna 3 (`documentos_recebidos` / `ocr_validado`):** Formulário e fotos de documentos recebidos; dados extraídos pelo OCR prontos para conferência.
     - **Coluna 4 (`contrato_emitido` / `aguardando_assinatura`):** Contrato gerado em 1-clique; aguardando assinatura digital da licenciada via SHA-256.
     - **Coluna 5 (`ativo_liberado` / `concluido`):** Pagamento validado e acesso aos módulos LMS liberado.
  4. **Cards do Kanban (Features & Micro-Ações):**
     - Nome da Licenciada, WhatsApp com link rápido, Cidade/UF e Categoria.
     - Badge de OCR: `✅ CPF Conferido`, `📷 Foto Anexada`.
     - Ações no Card:
       - ⚡ **"Emitir Contrato 1-Clique"** (Abre `GenerateContractModal` pré-carregado).
       - 💬 **"Reenviar Cobrança / Link WhatsApp"** (Gera mensagem personalizada no WhatsApp Web / API).
       - 💳 **"Confirmar Pagamento & Liberar LMS"** (Ativação em 2 etapas com feedback visual).
  5. **Visão Tabela de Licenciadas:**
     - Tabela responsiva com busca textual (nome, CPF, telefone), ordenação por data e filtros por categoria/status.
     - Colunas: Avatar/Foto, Nome Completo, CPF/Doc, Categoria, WhatsApp, Status no Funil, Contrato Vinculado, Ações.
  6. **Sincronização em Tempo Real:**
     - Polling silencioso a cada 15 segundos para atualizar status entre múltiplos gestores simultâneos, espelhando a arquitetura robusta da `GestorAgendaPage`.

---

### 4.3 Componente: `GenerateContractModal.jsx`
* **Localização:** `apps/web-app/src/frontend/src/pages/Gestor/Onboarding/components/GenerateContractModal.jsx`.
* **Público-alvo:** Gestor emitindo contrato oficial a partir dos dados do pré-cadastro.
* **Propósito:** Emissão instantânea em 1-clique eliminando retrabalho de digitação e disparando o link de assinatura digital direto no WhatsApp.
* **Recursos e Comportamento:**
  1. **Auto-fill Inteligente:**
     - Injeta automaticamente os dados coletados no pré-cadastro / OCR: `nome`, `cpf`, `rg`, `endereco_completo`, `telefone_whatsapp`, `email`, `cidade_uf`.
  2. **Seleção de Modelo de Contrato:**
     - Carrega modelos ativos do backend via `contractsApi.getTemplates()`.
     - Modelo padrão pré-selecionado: `contrato-licenciamento-padrao`.
  3. **Configuração Financeira e Comercial:**
     - Campo de Valor Total da Licença com máscara monetária automática (`R$ 0.000,00`).
     - Conversão instantânea de valor por extenso (`numeroPorExtenso()`) para inserção no corpo jurídico do contrato.
     - Seleção de Condições de Pagamento (À vista Pix/TED, Parcelado em Cartão, Boleto Bancário).
  4. **Ação de Emissão 1-Clique:**
     - Dispara `onboardingApi.generateContract(lead.id, payload)`.
     - Gera UUID do contrato, associa token de assinatura SHA-256 e move o lead para a coluna *"Contrato Emitido"*.
  5. **Disparo Imediato no WhatsApp:**
     - Gera deep link oficial do WhatsApp (`https://wa.me/55...`) contendo mensagem personalizada com link direto:
       *"Olá, [Nome]! Seu Contrato de Licenciamento Body Harmony está pronto para assinatura digital segura. Acesse pelo link: https://bodyharmony.com.br/assinar/[TOKEN]"*
     - Botão de cópia rápida com feedback visual ("Copiado!").

---

## 5. Validação de Build e Conformidade

1. **Vite Build Baseline:**
   - Executado `npm run build` no diretório `apps/web-app`.
   - Resultado: **Exit code 0 (Sucesso)** em 21 segundos.
   - Todos os bundles e chunks minificados com sucesso na pasta `../../build/public_html`.
2. **Conformidade Constitucional (Nexus Protocol V3.1):**
   - **Regra 1 (API Contracts First):** Contrato JSON em `openspec/contracts/admin/gestor-onboarding-funnel.json`.
   - **Regra 3 (Luxury Aesthetics & Mobile-First):** Cores `#0A3E60`, `#ED7E13`, superfícies nítidas, tipografia Bison/Montserrat, alvos de toque >= 44x44px.
   - **Regra 4 (Governança Estrita):** Especificação alinhada com `openspec/deltas/PLAN-064-funil-onboarding-licenciadas.md`.
   - **Regra 6 (Desacoplamento de Serviços):** Chamadas padronizadas em `services/api.js`.

---

## 6. Próximos Passos Recomendados para Implementação

1. **Criar Módulo de Rotas e Navegação:**
   - Adicionar rota pública `/onboarding/:token` no `App.jsx` apontando para `PublicOnboardingPage`.
   - Adicionar rota protegida `/portal-gestor/onboarding` e `${ROUTES.ADMIN}/onboarding` no `App.jsx` apontando para `OnboardingFunnelPage`.
   - Adicionar item no menu de navegação do `AdminLayout.jsx` e `Dashboard.jsx`.
2. **Implementar os Componentes React:**
   - Criar `PublicOnboardingPage.jsx` com wizard 3 etapas e upload de imagem.
   - Criar `OnboardingFunnelPage.jsx` com Kanban 5 colunas e Tabela.
   - Criar `GenerateContractModal.jsx` com auto-fill e disparo WhatsApp.
   - Adicionar `onboardingApi` ao `services/api.js`.
3. **Verificação de Compilação:**
   - Executar `npm run build` para garantir 0 regressões no build do Vite.
