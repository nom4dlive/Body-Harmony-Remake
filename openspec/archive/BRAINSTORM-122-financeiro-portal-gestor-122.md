# BRAINSTORM-122 — Painel Financeiro Portal Gestor

**Data:** 2026-08-25
**Solicitante:** Proprietária Body Harmony
**Status:** EM ANÁLISE

---

## 1. Contexto Técnico do Problema

O roadmap de produto Body Harmony v2.0 identifica cinco fases de evolução financeira, desde o fechamento diário de caixa (Daily Close) até um dashboard executivo com KPIs de Medical Spa. Atualmente, o ecossistema possui:

- **StonePaymentService.php** — integração completa com API Stone (cartão + PIX), mas sem agregação de receita ou relatórios
- **ShopService.php** — e-commerce funcional (produtos, pedidos, leads, CMS), mas sem consolidação financeira
- **OnboardingService.php** — fluxo de confirmação de pagamento para licenciamento, sem vínculo com centro de custo
- **RbacService.php** — módulo `financial` com permissões `manage/view/none` já definido (Diretora Executiva e Gerente Geral = manage; Gerente Comercial = view)
- **ShopManager.jsx** — abas de Produtos, Pedidos, Leads e CMS, mas sem aba financeira consolidada

**O que NÃO existe (gaps críticos):**
- Nenhum `FinancialService.php` ou `FinancialDashboardController.php`
- Nenhuma rota `/admin/financial/*` ou página `/portal-gestor/financeiro`
- Nenhum contrato JSON em `openspec/contracts/` para dados financeiros
- Nenhuma tabela dedicada para transações financeiras agregadas (receipts, cost centers, cashflow)
- Nenhum widget de KPI financeiro no Dashboard do Gestor
- Nenhum sistema de faturas/boletos ou cobrança recorrente
- Webhook Stone (`handleWebhook()`) é um stub que apenas loga

---

## 2. Análise Transversal em Seis Camadas

### 2.1 DADOS (Banco de Dados)

**Tabelas novas necessárias:**

| Tabela | Propósito | Relação com existente |
|--------|-----------|----------------------|
| `financial_transactions` | Registro unificado de todas as entradas (receitas) — agrega shop_orders + onboarding payments + licenciamento + renewals | FK → `shop_orders.id`, `licenciada_onboarding_requests.id` |
| `financial_cost_centers` | Centros de custo por evento/tag (ex: "Imersão Turma 04") | Nova tabela isolada |
| `financial_expenses` | Registro de despesas etiquetadas por centro de custo | FK → `financial_cost_centers.id` |
| `financial_subscriptions` | Planos de cobrança recorrente (SaaS future) | FK → `licenciadas.id` |
| `financial_invoices` | Faturas geradas (parcelas, recorrências) | FK → `financial_transactions.id`, `financial_subscriptions.id` |
| `financial_daily_closes` | Cache do fechamento diário (status, timestamp, alertas) | Nova tabela isolada |

**Migrações:** Criar via `ensure_tables.php` (padrão existente) ou migration SQL em `infrastructure/database/migrations/`. Usar padrão `created_at` TIMESTAMP sem `updated_at` para tabelas derivadas de `licenciadas` (REGRA 12). Para tabelas novas puras, incluir `updated_at`.

**Impacto:** Médio-alto. Criação de 6 tabelas, mas sem alteração de tabelas existentes. Compatível com o schema legado `DATABASE_MASTER_V36_1.sql`.

### 2.2 BACKEND (PHP 8.4)

**Novos serviços:**

| Classe | Responsabilidade |
|--------|-----------------|
| `FinancialService.php` | Motor principal: aggregação de receitas, cálculo de cash runway, DRE por evento, KPIs |
| `CashCloseService.php` | Fechamento diário: cruzamento agendamentos/vendas vs entradas financeiras |
| `CostCenterService.php` | CRUD de centros de custo e despesas, tagging por evento |
| `SubscriptionService.php` | Gestão de assinaturas recorrentes (fase 4, futuro) |
| `InvoiceService.php` | Geração de faturas/boletos (fase 4, futuro) |

**Novos controllers:**

| Controller | Rotas |
|-----------|-------|
| `FinancialDashboardController.php` | `GET /admin/financial/dashboard` (KPIs consolidados) |
| `FinancialTransactionsController.php` | `GET/POST /admin/financial/transactions` |
| `FinancialCashCloseController.php` | `GET /admin/financial/cash-close`, `POST /admin/financial/cash-close/{date}` |
| `FinancialCostCenterController.php` | CRUD `/admin/financial/cost-centers/*` |
| `FinancialReportsController.php` | `GET /admin/financial/reports/dre`, `GET /admin/financial/reports/cashflow` |

**Padrão de controller:** Fino (thin controller), toda lógica de negócio delegada ao Service (REGRA 6). Construtor recebe `mixed $db` (REGRA 13). Resposta via `Response::json()`.

**Segurança:** Middleware `$middleware->check()` em todas as rotas admin. Validação de permissão `financial_view` via `usePermissions()` no frontend e verificação backend.

### 2.3 APIs & CONTRATOS

**Contratos JSON em `openspec/contracts/`:**

| Contrato | Método | Path | Propósito |
|----------|--------|------|-----------|
| `admin_financial_dashboard.json` | GET | `/admin/financial/dashboard` | KPIs: receita total, margem, cash runway, CAC, inadimplência |
| `admin_financial_transactions.json` | GET | `/admin/financial/transactions` | Lista paginada de transações com filtros |
| `admin_financial_transactions_create.json` | POST | `/admin/financial/transactions` | Registro manual de transação |
| `admin_financial_cash_close.json` | GET/POST | `/admin/financial/cash-close` | Fechamento do dia |
| `admin_financial_cost_centers.json` | GET/POST | `/admin/financial/cost-centers` | Centros de custo |
| `admin_financial_expenses.json` | GET/POST | `/admin/financial/expenses` | Despesas por centro de custo |
| `admin_financial_reports_dre.json` | GET | `/admin/financial/reports/dre` | DRE por evento/tag |

**Obrigação REGRA 1:** Todo endpoint deve ter contrato validado antes da implementação. Os contratos devem espelhar exatamente a estrutura JSON de response.

### 2.4 ROTAS & NAVEGAÇÃO

**Frontend (App.jsx):**

```
/portal-gestor/financeiro                    → FinanceiroDashboard.jsx
/portal-gestor/financeiro/transacoes         → FinancialTransactionsPage.jsx
/portal-gestor/financeiro/fechamento-dia     → CashClosePage.jsx
/portal-gestor/financeiro/centros-custo      → CostCentersPage.jsx
/portal-gestor/financeiro/relatorios         → FinancialReportsPage.jsx
```

**Proteção:** Todas as rotas envolvidas com `<PermissionRouteGuard page="financial_view">` (REGRA 17).

**Sidebar (AdminLayout.jsx):** Novo item de navegação com ícone `FaChartLine` ou `FaDollarSign`, visível apenas para roles com `financial_view` ou `financial_manage`.

**Mobile:** BottomNav existente não precisa de item financeiro (é painel do gestor, acesso via sidebar). Manter compatível com o padrão mobile-first existente.

### 2.5 INTERFACE (FRONTEND - React)

**Componentes novos:**

| Componente | Responsabilidade |
|-----------|-----------------|
| `FinanceiroDashboard.jsx` | Página principal: Bento grid com KPIs (margem, CAC, inadimplência, cash runway, receita mensal) |
| `CashRunwayGauge.jsx` | Medidor circular animado "X meses de reserva" |
| `RevenueChart.jsx` | Gráfico de linhas/barras de receita mensal (Recharts ou Highcharts) |
| `DreTable.jsx` | Tabela DRE por evento (receitas - despesas = lucro) |
| `TransactionsList.jsx` | Lista filtrável de transações com status e data |
| `CashClosePanel.jsx` | Painel de fechamento diário com alertas impeditivos |
| `CostCenterManager.jsx` | CRUD de centros de custo com tags de evento |
| `InadimplenciaAlert.jsx` | Lista de pagamentos pendentes para cobrança |

**Padrões a seguir:**
- `styled-components` com props transient `$` (REGRA existente)
- `GestorThemeProvider` + `useGestorTheme()` para dark/light mode
- Lazy loading via `React.lazy()` + `Suspense`
- `framer-motion` para animações de entrada
- `lucide-react` para ícones financeiros
- Recharts ou Highcharts para gráficos (já utilizado no projeto via `reversa-highcharts-visualizer`)
- Nenhum `fetch()` nativo — usar `api` central de `services/api.js` (REGRA 14)

**Estado:** Local `useState`/`useEffect` (padrão existente, sem Redux).

### 2.6 MARCA & IDENTIDADE

**Paleta:**
- Fundo dos cards: `#FFFFFF` (light) ou `#0c1d2c` (dark mode)
- KPIs positivos (margem saudável, runway OK): `#28a745` (verde sucesso)
- KPIs negativos (inadimplência, runway crítico): `#dc3545` (vermelho alerta)
- Destaques de valor: Gold `#ED7E13`
- Headers e labels: Navy `#0A3E60`
- Bordas e divisores: `rgba(10, 62, 96, 0.1)`

**Alvos de toque:** >= 44x44px em todos os botões e filtros mobile (REGRA 3).

**Mobile-First:** Cards de KPI responsivos (grid 1 coluna mobile, 2-3 colunas desktop). Tabelas com scroll horizontal em telas pequenas. Abas com scroll horizontal.

---

## 3. Três Opções de Arquitetura

### Opção A — Conservadora (Low Risk)

**Escopo:** Apenas Fase 1 (Daily Close + Cash Runway) e Fase 5 (Dashboard KPIs básica).

**O que inclui:**
- 1 tabela nova: `financial_daily_closes`
- 1 service: `FinancialService.php` com métodos de aggregação via queries SQL existentes (shop_orders + onboarding_requests)
- 1 controller: `FinancialDashboardController.php`
- 1 página React: `FinanceiroDashboard.jsx` com 4-6 KPI cards
- Dashboard do Gestor existente ganha 2-3 widgets financeiros novos
- Contratos JSON: 2-3 arquivos

**O que NÃO inclui:**
- Sem centros de custo (Fase 2)
- Sem controle de estoque (Fase 3)
- Sem assinaturas recorrentes (Fase 4)
- Sem fechamento diário automatizado (Daily Close manual apenas)

**Prós:**
- Entrega em 1-2 sprints
- Reuso máximo de queries existentes (shop_orders, onboarding_requests)
- Baixo risco de regressão
- Validação rápida do conceito com a proprietária

**Contras:**
- Não resolve o problema de sazonalidade (sem DRE por evento)
- KPIs calculados via SQL direto, sem tabela de aggregação
- Difícil de estender para fases futuras sem refactor

**Esforço:** ~3-5 dias de desenvolvimento
**Risco:** BAIXO

---

### Opção B — Recomendada (Balanced)

**Escopo:** Fase 1 + Fase 2 + Fase 5 completa, com preparação para Fase 4.

**O que inclui:**
- 4 tabelas novas: `financial_transactions`, `financial_cost_centers`, `financial_expenses`, `financial_daily_closes`
- 3 services: `FinancialService.php`, `CashCloseService.php`, `CostCenterService.php`
- 3 controllers: `FinancialDashboardController.php`, `FinancialCashCloseController.php`, `FinancialCostCenterController.php`
- 4-5 páginas React com Bento grid luxury
- Dashboard Gestor com widgets financeiros integrados
- Contratos JSON completos para todas as rotas
- Webhook Stone funcional (não stub)
- KPIs: Margem de Lucro, CAC, Inadimplência, Cash Runway, DRE por evento
- Tags tributárias (Estética/Cosmética vs Serviços Médicos/Educacionais)
- Preparação de schema para `financial_subscriptions` e `financial_invoices`

**O que NÃO inclui (deixado para fase futura):**
- Sistema de assinaturas recorrentes (schema preparado, lógica não)
- Geração de boletos/faturas automatizadas
- Estoque e giro de produtos (Fase 3)

**Prós:**
- Resolve os problemas centrais: sazonalidade (DRE por evento), previsibilidade (cash runway), e auditoria (daily close)
- Arquitetura extensível para fases futuras sem refactor
- Código limpo, service-oriented, seguindo padrões existentes
- Webhook Stone funcional melhora confiabilidade dos pagamentos

**Contras:**
- Esforço maior que Opção A (~2-3x)
- Requer criação de tabela de aggregação (financial_transactions) que precisa de migration cuidadosa
- DRE por evento depende de tagging manual ( UX design do fluxo de tag)

**Esforço:** ~8-12 dias de desenvolvimento
**Risco:** MÉDIO

---

### Opção C — Next-Gen (High Performance)

**Escopo:** Todas as 5 fases completas, incluindo SaaS/Recorrência e Estoque.

**O que inclui:**
- 6 tabelas novas (todas listadas na seção 2.1)
- 5 services completos
- 5+ controllers
- 8+ páginas React com gráficos interativos (Highcharts)
- Sistema de assinaturas recorrentes com geração automática de faturas
- Monitoramento de giro de estoque (Fase 3)
- Webhook Stone completo com retry e reconciliação
- Dashboard financeiro com drill-down por período, evento, categoria
- Exportação CSV/PDF de relatórios
- Alertas de inadimplência via WhatsApp (integração existente)
- AI-powered forecasting (cash runway preditivo)

**Prós:**
- Sistema financeiro completo e autocontido
- Preparado para modelo SaaS futuro (cobrança recorrente de licenciadas)
- Máxima granularidade de dados para decisões executivas
- Estoque integrado evita dinheiro imobilizado

**Contras:**
- Alto custo de desenvolvimento (3-4x Opção A)
- Complexidade significativa — risco de over-engineering para fase atual
- Sistema de assinaturas recorrente requer integração adicional com Stone (recurring charges)
- Giro de estoque depende de input manual de entradas/saídas de estoque (processo operacional novo)
- Prazo de entrega longo pode atrasar validação com proprietária

**Esforço:** ~20-30 dias de desenvolvimento
**RISCO:** ALTO

---

## 4. Veredito Técnico

### **Recomendação: OPÇÃO B (Balanced)**

**Justificativa:**

1. **Resolve o problema raiz:** A sazonalidade do licenciamento (picos a cada 3-4 meses vs custos mensais) é endereçada pelo DRE por evento e pelo Cash Runway — ambos incluídos na Opção B.

2. **Alinhamento com o roadmap:** O documento de produto define 5 fases. A Opção B cobre Fase 1 + 2 + 5 (as mais urgentes), deixando Fase 3 (estoque) e 4 (recorrência) preparadas sem implementadas.

3. **Extensibilidade:** A tabela `financial_transactions` atua como fonte de verdade unificada, permitindo adicionar Fase 4 (assinaturas) e Fase 3 (estoque) sem refactor da camada de agregação.

4. **Risco controlado:** Cria novas tabelas sem alterar existentes, mantendo o schema legado intacto (REGRA 12). Service-oriented pattern segue o padrão já estabelecido.

5. **Validação rápida:** O webhook Stone funcional melhora imediatamente a confiabilidade dos pagamentos, mesmo antes do dashboard completo estar pronto.

6. **RBAC pronto:** O módulo `financial` já existe no `RbacService.php` — basta mapear as novas rotas.

**Sequência de execução recomendada (via `/plan`):**

| Delta | Escopo | Dias |
|-------|--------|------|
| D-122.1 | Contratos JSON + migrações de tabelas | 1 |
| D-122.2 | `FinancialService.php` + `FinancialDashboardController.php` | 2 |
| D-122.3 | `FinanceiroDashboard.jsx` + KPI widgets | 2 |
| D-122.4 | `CashCloseService.php` + `CashClosePage.jsx` | 2 |
| D-122.5 | `CostCenterService.php` + `CostCentersPage.jsx` | 2 |
| D-122.6 | Webhook Stone funcional + reconciliação | 1 |
| D-122.7 | Integração no Dashboard Gestor + Sidebar | 1 |
| D-122.8 | Testes smoke + validação RBAC | 1 |

**Total estimado:** ~12 dias (2 sprints de 6 dias)

---

## 5. Matriz de Segurança e Riscos

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Migração de dados corrompe schema legado | CRITICAL | Usar `ensure_tables.php` com `IF NOT EXISTS`. Nunca alterar tabelas existentes. Testar em sandbox primeiro. |
| Webhook Stone exposto sem autenticação | HIGH | Validar header `X-Stone-Signature` ou IP allowlist. Manter stub atual como fallback. |
| Cálculo de cash runway com dados incompletos | MEDIUM | Exibir disclaimer "Dados baseados em transações registradas". Permitir input manual de custos fixos. |
| DRE por evento com tags inconsistentes | MEDIUM | Validação de tags no backend ( whitelist de tags válidas). UI com autocomplete de tags existentes. |
| Performance de queries de agregação | LOW | Criar índices em `financial_transactions.created_at` e colunas de filtro. Usar cache Redis se disponível. |
| Acesso não autorizado a dados financeiros | HIGH | Tripla camada RBAC (REGRA 17): ocultação visual + guard de rotas + validação backend. |
| Exposição de dados sensíveis em logs | CRITICAL | Nunca logar valores monetários em plaintext. Usar mascaramento em `stone_raw_response`. |

---

## 6. Espaço Negativo (Fora de Escopo)

- **VPS Hostinger (45.152.44.244):** Deploy do frontend via `deploy-hostinger.ps1`. Nenhuma alteração de infraestrutura.
- **VPS Dedicada (2.25.156.25):** Container Docker Compose e Traefik são imutíveis. Nenhuma exposição de portas ou loopback.
- **Chaves SSH / Stone API Keys:** Nunca comitar. Usar variáveis de ambiente (`STONE_SECRET_KEY`, `STONE_ENVIRONMENT`).
- **Banco de dados de produção:** Migrações testadas em sandbox primeiro. Deploy manual controlado.
- **Sistema de Estoque (Fase 3):** Fora de escopo desta iteração.
- **Sistema de Assinaturas (Fase 4):** Schema preparado, lógica de negócio fora de escopo.
