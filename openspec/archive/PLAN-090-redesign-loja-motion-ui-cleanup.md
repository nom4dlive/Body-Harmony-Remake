# 🎯 Objetivo Fullstack (PLAN-090) — Concluído
Redesign estético completo e aplicação de Motion-UI na página da Loja Virtual (`/loja`), remoção de textos e badges não essenciais ("Ecossistema Oficial Body Harmony"), eliminação da duplicação do botão flutuante de WhatsApp e refinamento da hierarquia visual com transições suaves a 60fps.

# 📜 Contratos de API (REGRA 1)
- [x] Contratos existentes em `openspec/contracts/shop/` preservados (100% simetria).

# 🚫 Espaço Negativo (Fora de Escopo)
- [x] Backend PHP, endpoints REST e infraestrutura Hostinger/VPS (Imutáveis).
- [x] Fluxo de checkout com auto-redirecionamento e captura de leads no CRM (Preservado).

# 🗄️ Camada de Dados (SQL)
- [x] Sem alterações de banco; schema V112 100% aderente.

# ⚙️ Camada de Backend (PHP 8.4)
- [x] Sem alterações de backend.

# ⚛️ Camada de Interface (React V3.1, UI/UX Pro Max & Motion-UI)
- [x] **Remoção de Duplicações e Ruídos:**
  * Removido o `<FloatingWhatsApp>` local em `ShopPage.jsx` (utilizando apenas o botão global do `App.jsx`).
  * Removido o badge `"Ecossistema Oficial Body Harmony"`.
- [x] **Motion-UI & Micro-interações:**
  * Integrado `framer-motion` em `ShopPage.jsx` com `staggerChildren: 0.08s`, `whileHover={{ y: -6 }}` e `whileTap={{ scale: 0.98 }}`.
  * Hero Section enxuta com selos de garantia (*"🔒 Pagamento Seguro via Stone"*, *"🎟️ Vagas Oficiais Garantidas"*, *"⚡ Confirmação Imediata"*).
  * Filtros de categoria com botões táteis animados.
  * Cards de produtos em estilo Glass Bento com badge de escassez pulsante, lista de diferenciais com `CheckCircle2` em Luxury Gold e destaque para parcelamento em 12x.

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Premium (Site/Frontend):** Build do Vite compilado e sincronizado com 100% de sucesso.
- **VPS Hostinger Dedicada (API/DB):** Estável.

# 🔍 Monitoramento Semântico (Regression Watch)
- [x] Validado que apenas 1 botão de WhatsApp aparece no canto inferior direito.
- [x] Validado que todas as categorias filtram os produtos suavemente sem layout jump.
- [x] Validado que o clique no produto redireciona para `/loja/checkout/:id`.
- [x] Rota `https://bodyharmony.com.br/loja` respondendo HTTP 200 OK.

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Zero.
- **Rollback:** `git revert` e deploy da versão anterior.

# ✅ Checklist de Execução Atômica
- [x] 1. Atualizar `ShopPage.jsx` com o novo design Motion-UI e remoção das duplicações
- [x] 2. Executar build local `node scripts/devops/build-release.js`
- [x] 3. Executar deploy na Hostinger via `deploy-pro.ps1`
- [x] 4. Testar visualmente a rota `/loja` ao vivo
