# 🎯 Objetivo Fullstack — Concluído (PLAN-087)
Revisão e aprimoramento completo de UI/UX, botões e acessibilidade em todas as camadas de Frontend (Área Pública e Área Privada) do ecossistema Body Harmony, aplicando os padrões do skill `/ui-ux-pro-max` (paleta Luxury `#0A3E60` e `#ED7E13`, alvos de toque $\ge$ 44x44px, alinhamento ergonômico, navegação bidirecional e acessibilidade instantânea a todos os novos recursos como Loja Virtual, Ingressos, Gestor Stone e Áreas de Alunas).

# 📜 Contratos de API (REGRA 1)
- [x] Contratos JSON existentes preservados (`openspec/contracts/shop/*.json`)
- [x] Nenhuma alteração estrutural de backend necessária (ajuste focado em Frontend, Navegação e UX)

# 🚫 Espaço Negativo (Fora de Escopo)
- [x] Infraestrutura Docker/Traefik e restrição de localhost do container de banco de dados (Imutável)
- [x] Regras de autenticação de sessão e tokens de acesso (Preservados)
- [x] Identidade visual e paleta oficial (#0A3E60 e #ED7E13) inalteradas

# 🗄️ Camada de Dados (SQL)
- [x] Sem novas migrations; schema atual V112 100% aderente

# ⚙️ Camada de Backend (PHP 8.4)
- [x] Endpoints REST v1 existentes continuam servindo todas as páginas

# ⚛️ Camada de Interface (React V3.1 & UI/UX Pro Max)
- [x] **Área Pública (Visitantes / Alunas / Compradores):**
  * `NavbarV2.jsx`: Adicionado link destacado para **"Loja & Ingressos"** (`/loja`) com badge dourada de novidade, e atalhos diretos para **"Área do Aluno"** (`/portal-licenciada`) e **"Portal do Gestor"** (`/admin/login`).
  * `FooterV2.jsx`: Inseridos links para **"Loja & Ingressos 2026"**, **"Área do Aluno"** e **"Acesso Gestor"**, com targets de clique $\ge$ 44px e cursor-pointer.
  * `ShopPage.jsx`: Topbar de navegação com botão de retorno à Home ("← Voltar para o Site Principal"), micro-interações nos cards de produto, contraste WCAG AA e alinhamento dos CTAs "Garantir Vaga / Comprar".
- [x] **Área Privada (Portal do Gestor & Alunas):**
  * `AdminLayout.jsx`: Adicionado atalho para **Loja & Ingressos** no Mobile Drawer.
  * `GlobalSearchModal.jsx` (`Ctrl+K`): Incluída indexação e navegação rápida para a **Loja & Ingressos (Stone)**.
  * `QuickActionDrawer.jsx` (Gaveta de Ações Rápidas): Adicionada ação de **"Gerenciar Loja & Ingressos (Stone)"**.
  * `Dashboard.jsx`: Adicionado Card no Bento Grid de Operações para **"Loja & Ingressos"** e botão de topo **"Ver Loja Oficial"**.

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Premium (Site/Frontend):** Build do Vite compilado e sincronizado com 100% de sucesso.
- **VPS Hostinger Dedicada (API/DB):** Estável (sem alterações).

# 🔍 Monitoramento Semântico (Regression Watch)
- [x] Validado que nenhum elemento causa layout shift no hover
- [x] Alvos de toque $\ge$ 44x44px em mobile e desktop
- [x] Testada compatibilidade de viewport em 375px, 768px, 1024px e 1440px
- [x] Rotas respondendo HTTP 200 OK ao vivo

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Zero (testado em homologação e produção com build verificado).
- **Rollback:** `git revert` e deploy da versão anterior.

# ✅ Checklist de Execução Atômica
- [x] 1. Atualizar `NavbarV2.jsx` com link de Loja, Aluna e Gestor
- [x] 2. Atualizar `FooterV2.jsx` com links rápidos expandidos
- [x] 3. Refinar micro-interações e alinhamento visual em `ShopPage.jsx`
- [x] 4. Atualizar `GlobalSearchModal.jsx`, `QuickActionDrawer.jsx` e `AdminLayout.jsx`
- [x] 5. Adicionar Card no Bento Grid do `Dashboard.jsx` do Gestor
- [x] 6. Executar build local `node scripts/devops/build-release.js` e validar zero erros
- [x] 7. Executar deploy na Hostinger e testar navegação ao vivo
