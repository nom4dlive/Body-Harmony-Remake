# 🎯 Objetivo Fullstack
Implementar o **Hub Completo de Governança, Insights Clínicos e Modo Personificação** do IA Notebook no Gestor LMS (`/portal-gestor/lms`), proporcionando ao operador controle total, testes diretos e inteligência pedagógica:
1. **Modo Personificar Licenciada (Impersonate & Test):** O Gestor pode selecionar qualquer licenciada (ex: Dra. Josi Silva) e abrir a visualização ao vivo do Smart Book exatamente como a aluna visualiza, com barra superior identificando o modo de teste.
2. **Seleção de Níveis de Cota Pré-definidos:** Dropdown elegante no Cockpit com os níveis:
   - 🟢 Básico: 50 🪙/dia
   - 🟡 Padrão: 100 🪙/dia
   - 🟠 Master: 250 🪙/dia
   - 💎 VIP: Ilimitado (9999 🪙/dia)
3. **Radar de Dúvidas Clínicas & Insights:** Painel com os termos e tópicos mais perguntados no Chat RAG para direcionar novos conteúdos das aulas.
4. **Galeria de Podcasts do Estúdio:** Painel para o Gestor ouvir os áudios gerados pelo estúdio de IA e destacar os melhores na biblioteca.
5. **Governança & Persona da IA:** Editor do Prompt do Tutor Clínico e Interruptor Geral de Manutenção (*Global Kill Switch*).

---

# 📜 Contratos de API (REGRA 1)
- [ ] Validar conformidade com `openspec/contracts/admin/lms-notebook-governance.json`
- [ ] Validar conformidade com `openspec/contracts/admin/beta-testers-credits.json`

---

# 🚫 Espaço Negativo (Fora de Escopo)
- [ ] O MySQL de produção continua protegido em loopback local na VPS.
- [ ] A arquitetura do Faster-Whisper local permanece inalterada.

---

# 🗄️ Camada de Dados (SQL)
- [ ] Tabela `ai_config` e `site_config` para persistência das configurações de governança e prompt do tutor.
- [ ] Coluna `ai_notebook_credits_limit` atualizada conforme os níveis selecionados no Cockpit.

---

# ⚙️ Camada de Backend (PHP 8.4)
- [ ] Métodos em `LmsNotebookService.php`:
  - `getGovernanceSettings()` / `updateGovernanceSettings(array $data)`
  - `getClinicalInsights()`
  - `getStudioPodcastsGallery()` / `togglePodcastFeatured(string $id)`
  - `generateImpersonateTicket(int $licenciadaId, int $moduleId)`
- [ ] Rotas em `api/v1/index.php` sob o prefixo `/admin/lms/notebooks/governance/*`.

---

# ⚛️ Camada de Interface (React V3.1 / UI/UX Pro Max)
- [ ] Sub-navegação com 5 abas ergonômicas em `LMSNotebooksManager.jsx`:
  - `[ 📚 Módulos & Cadernos ]` (com botão de Personificar)
  - `[ 👥 Licenciadas & Cotas ]` (com Dropdown de Níveis de Créditos)
  - `[ 🎙️ Podcasts do Estúdio ]` (Galeria com player de áudio)
  - `[ 💡 Radar de Insights ]` (Tópicos mais perguntados pelas alunas)
  - `[ ⚙️ Governança & Persona ]` (Editor de Prompt e Kill Switch)
- [ ] **ImpersonateModal.jsx:** Modal de tela cheia/gaveta envelopando o Smart Book em modo de personificação com badge dourado.

---

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Premium (Web):** Compilação de release (`npm run build:release`) e sincronização via `deploy-hostinger.ps1`.
- **VPS Hostinger Dedicada (API/DB):** Endpoints PHP 8.4 e serviços de IA.

---

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Modo manutenção bloquear gestores.
- **Mitigação:** Modo de personificação do gestor ignora o bloqueio de manutenção.
- **Rollback:** Reversão atômica via Git e `deploy-hostinger.ps1`.

---

# ✅ Checklist de Execução Atômica
- [ ] 1. Criar contrato JSON `openspec/contracts/admin/lms-notebook-governance.json`
- [ ] 2. Implementar métodos de governança, insights e personificação no Backend PHP
- [ ] 3. Atualizar `LMSNotebooksManager.jsx` com as 5 abas de navegação, dropdown de cotas e modal de personificação
- [ ] 4. Atualizar `lmsNotebookApi` em `src/services/api.js`
- [ ] 5. Executar smoke tests PHP CLI (100% PASS) e compilar build de release Vite
- [ ] 6. Executar deploy de produção na Hostinger (`deploy-hostinger.ps1`)
- [ ] 7. Validar live no navegador e registrar auditoria no Obsidian Vault
