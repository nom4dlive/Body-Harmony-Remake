# 🎯 Objetivo Fullstack (PLAN-070)
Refatorar integralmente a interface visual do **Funil de Onboarding de Licenciadas** ([`OnboardingFunnelPage.jsx`](file:///f:/Body-Harmony-Remake/apps/web-app/src/frontend/src/pages/OnboardingFunnelPage.jsx)), substituindo as mais de 300 classes utilitárias por **`styled-components`** nativos com a identidade visual **Luxury Navy (`#0A3E60`) & Gold (`#ED7E13`)**, alvos de toque >= 44x44px e encapsulamento no `<AdminLayout>`.

---

# 📜 Contratos de API (REGRA 1)
- [x] Mantida 100% de simetria com [`openspec/contracts/admin/onboarding-funnel.json`](file:///f:/Body-Harmony-Remake/openspec/contracts/admin/onboarding-funnel.json) e [`openspec/contracts/admin/gestor-ux-cockpit.json`](file:///f:/Body-Harmony-Remake/openspec/contracts/admin/gestor-ux-cockpit.json).

---

# 🚫 Espaço Negativo (Fora de Escopo)
- Nenhuma alteração nas tabelas MySQL (`lead_onboarding`, `licenciadas`, `contracts`) nem nos endpoints backend PHP 8.4 (`api/v1/admin/onboarding/*.php`).

---

# ⚛️ Camada de Interface (React V3.1)
- [ ] **`OnboardingFunnelPage.jsx`**: Envelopar com `<AdminLayout>`, Bento Grid de 5 métricas, barra de busca e filtros, visualização Kanban e Tabela.
- [ ] **Kanban de 5 Colunas Reais**: Layout CSS `display: grid; grid-template-columns: repeat(5, minmax(270px, 1fr))` com scroll horizontal suave e cabeçalhos color-coded.
- [ ] **Modais Internos**: Refatoração completa de `CreateLinkModal`, `WhatsAppRuleModal`, `LeadDetailsModal` e `GenerateContractModal` com styled-components e alvos de toque >= 44px.

---

# 🔍 Monitoramento Semântico (Regression Watch)
- [ ] Executar `npm run build:hostinger` para validação de compilação sem erros JSX/CSS.
- [ ] Executar `php tests/onboarding_funnel_smoke_test.php` para atestar integridade dos dados (10/10 PASS).

---

# ✅ Checklist de Execução Atômica
- [x] 1. Criar plano PLAN-070
- [ ] 2. Refatorar `OnboardingFunnelPage.jsx` com `AdminLayout` e styled-components
- [ ] 3. Refatorar modais internos (`CreateLinkModal`, `WhatsAppRuleModal`, `LeadDetailsModal`)
- [ ] 4. Refatorar visualização em Tabela alternativa
- [ ] 5. Executar build `npm run build:hostinger` e suite de testes de fumaça
- [ ] 6. Registrar no `regression-watch.md` e Obsidian Vault
- [ ] 7. Executar deploy de produção `deploy-pro.ps1`
