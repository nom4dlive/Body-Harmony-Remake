# 🎯 Objetivo Fullstack (PLAN-187)
Consolidação das guias de administração do CRM V4 em uma única **⚙️ Configurações & Gestão** com menu lateral interno compacto, integração 100% fullstack do painel do Google Workspace com a conta oficial `bodyharmony36@gmail.com` e People API/Drive/Calendar reais, eliminação total de mock data e hardcoded strings dos painéis de métricas e remoção definitiva do banner de onboarding e do título "Body Harmony CRM V4" para maximizar a área útil de trabalho.

---

# 📜 Contratos de API (REGRA 1)
- [x] Contrato JSON criado em [`openspec/contracts/crm/settings-workspace-fullstack.json`](file:///f:/Body-Harmony-Remake/openspec/contracts/crm/settings-workspace-fullstack.json)
- [x] Endpoints `api/v1/crm/google_status.php`, `api/v1/crm/google_contacts.php` e `api/v1/crm/analytics_export.php`.

---

# 🚫 Espaço Negativo (Fora de Escopo)
- [ ] Alteração de portas e credenciais de infraestrutura SSH/Docker (Imutável)
- [ ] Alterações nas tabelas essenciais de contratos e alunas fora do escopo do CRM

---

# 🗄️ Camada de Dados (SQL)
- [ ] Queries consolidadas no banco de dados para puxar estatísticas reais de contatos sincronizados, leads atendidos e faturamento da loja.

---

# ⚙️ Camada de Backend (PHP 8.4)
- [ ] `GoogleWorkspaceService.php`:
  - Garantir retorno de status em tempo real da conta `bodyharmony36@gmail.com` com tokens e chaves ativas.
- [ ] `CrmAnalyticsService.php`:
  - Consultar `shop_orders` e `licenciadas` reais para os KPIs executivos.

---

# ⚛️ Camada de Interface (React V3.1)
- [ ] `CRMWorkspaceV4.jsx`:
  - Remoção do ícone e texto "Body Harmony CRM V4" do TopBar.
  - Remoção completa do banner "Checklist Rápido de 1º Acesso das Atendentes".
  - Barra de navegação principal condensada em apenas 3 abas essenciais:
    1. 💬 **Atendimento Omnichannel**
    2. 📊 **Funil & Kanban**
    3. ⚙️ **Configurações & Gestão**
- [ ] `UnifiedSettingsHub.jsx` [NOVO]:
  - Painel de configurações com menu vertical/lateral compacto:
    - 📱 **4 Linhas & Conexões** (instâncias Evolution API, QR Code, CRUD de números)
    - 👥 **Equipe & Roteamento** (atendentes, silos, permissões)
    - ☁️ **Google Workspace** (status em tempo real, sincronização People API, Google Drive, Calendar)
    - 📊 **Analytics & BI** (KPIs reais e exportação de dados)
    - 🎨 **Cores & Balões do Chat** (personalização visual)
- [ ] `GoogleWorkspaceHub.jsx`:
  - Consumo de dados 100% reais de `crmApi.getGoogleStatus()`, sincronização real de contatos com badge de progresso e links diretos para pastas de clientes e Google Calendar.
- [ ] `AnalyticsCockpit.jsx`:
  - Carregamento de dados reais de `crmAnalyticsApi.getMetrics()`, sem números hardcoded estáticos.

---

# 🧪 Metodologia TDD & Verificação
- [ ] Teste unitário Vitest para o novo hub unificado de configurações e integração Google Workspace.
- [ ] Teste de fumaça PHP dos endpoints de status.

---

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Premium (Site/Frontend):** `CRMWorkspaceV4.jsx`, `UnifiedSettingsHub.jsx`, `GoogleWorkspaceHub.jsx`, `AnalyticsCockpit.jsx` via `deploy-hostinger.ps1`.

---

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Regressão na navegação dos atendentes.
- **Mitigação:** Preservação de todos os sub-componentes existentes com sub-abas reativas.
- **Rollback:** `git checkout HEAD~1`.

---

# ✅ Checklist de Execução Atômica
- [ ] 1. Criar novo componente `UnifiedSettingsHub.jsx` com menu lateral interno e seções compactas
- [ ] 2. Conectar `GoogleWorkspaceHub.jsx` aos endpoints reais do backend (zero mock data)
- [ ] 3. Conectar `AnalyticsCockpit.jsx` à API real de métricas
- [ ] 4. Atualizar `CRMWorkspaceV4.jsx` (remover logo/título, remover onboarding banner e reduzir para 3 abas principais)
- [ ] 5. Executar testes Vitest
- [ ] 6. Executar build de release e deploy na Hostinger
- [ ] 7. Validar em produção e registrar no Obsidian Vault
