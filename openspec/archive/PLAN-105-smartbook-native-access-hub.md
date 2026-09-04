# 🎯 Objetivo Fullstack
Implementar o **Smart Book Nativo React V3.1 e Garantir Acesso Integral & Visibilidade Máxima** em todo o Portal da Licenciada (`/portal-licenciada/dashboard`, `/portal-licenciada/smartbook`, menus e carrosséis):
1. **Smart Book 100% Nativo em React:** Eliminação de dependência de iframes externos ou subdomínios não propagados (`notebook.bodyharmony.com.br`), provendo uma interface Luxury fluida, com Chat Clínico RAG (Dra. Harmony AI), Estúdio de Podcasts e Transcrições das Aulas.
2. **Visibilidade no Dashboard da Licenciada:**
   - Botão em destaque no Hero Section: `[ 🧠 ABRIR SMART BOOK (IA) ]`.
   - Card Bento no topo do grid com badge *BETA*.
   - Botão de acesso direto em cada carrossel de módulo: `[ 🧠 Caderno deste Módulo (IA) ]`.
3. **Navegação Global Desktop & Mobile:**
   - Inclusão do link `🧠 Smart Book` na Navbar Desktop, no BottomNavbar Mobile e no MobileDrawer lateral.
4. **Backend PHP 8.4 RAG Engine:**
   - Rotas `/api/v1/aluna/notebook/chat` e `/api/v1/aluna/notebook/podcast/generate` com fallback e dados clínicos precisos.

---

# 📜 Contratos de API (REGRA 1)
- [x] `POST /aluna/notebook/ticket`
- [x] `POST /aluna/notebook/chat`
- [x] `POST /aluna/notebook/podcast/generate`

---

# 🚫 Espaço Negativo (Fora de Escopo)
- [x] O loopback 127.0.0.1:3306 do banco MySQL da VPS permanece protegido.
- [x] Nenhuma alteração destrutiva em tabelas legadas.

---

# 🗄️ Camada de Dados (SQL)
- [x] Auto-migração `ensureColumns()` garantindo as colunas `ai_notebook_beta_enabled` e `ai_notebook_credits_limit`.

---

# ⚙️ Camada de Backend (PHP 8.4)
- [x] Métodos `chatWithNotebook`, `generateStudioPodcast`, `generateAuthTicket` em `LmsNotebookService.php`.
- [x] Controllers em `LmsNotebookController.php` e rotas registradas em `api/v1/index.php`.

---

# ⚛️ Camada de Interface (React V3.1 / UI/UX Pro Max)
- [x] `AiNotebookEmbed.jsx` nativo com Chat RAG, Estúdio de Podcasts e Transcrições.
- [x] `SmartBookPage.jsx` com seletor interativo de módulos.
- [x] `Dashboard.jsx` atualizado com botões no Hero, BentoGrid responsivo e Carrosséis.
- [x] `PortalNavbar.jsx`, `BottomNavbar.jsx` e `MobileDrawer.jsx` com links ativos.
- [x] `LMSNotebooksManager.jsx` com suporte ao modo nativo de personificação.

---

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Web (`45.152.44.244`):** Build de release (`npm run build:release`) e sincronização via `deploy-hostinger.ps1`.
- **Status em Produção:** 🟢 Sincronizado e Live (200 OK).

---

# ✅ Checklist de Execução Atômica
- [x] 1. Diagnosticar erro de DNS e desenhar componente nativo React
- [x] 2. Implementar endpoints de Chat RAG e Podcasts no Backend PHP 8.4
- [x] 3. Construir `AiNotebookEmbed.jsx` nativo com Chat, Estúdio e Transcrições
- [x] 4. Atualizar `SmartBookPage.jsx`, `Dashboard.jsx`, `PortalNavbar.jsx`, `BottomNavbar.jsx`, `MobileDrawer.jsx`
- [x] 5. Atualizar modo de personificação no `LMSNotebooksManager.jsx`
- [x] 6. Rodar smoke tests CLI (7/7 PASS) e compilar build de release Vite — Exit Code 0
- [x] 7. Executar deploy de produção na Hostinger (`deploy-hostinger.ps1`) — Deploy Success
- [x] 8. Validar live no navegador e registrar auditoria no Obsidian Vault
