# 🎯 Objetivo Fullstack
Implementar o **Painel Financeiro completo no Portal do Gestor** (Opção B — Balanced), cobrindo Fase 1 + 2 + 5 do roadmap financeiro Body Harmony v2.0:

1. **Dashboard Financeiro Consolidado:** Bento grid com KPIs executivos (Margem de Lucro, CAC, Cash Runway, Inadimplência, Receita Mensal) — Resolução do problema de sazonalidade.
2. **Fechamento Diário (Daily Close):** Painel que cruza eventos do dia (agendamentos/vendas) com entradas financeiras, gerando alertas impeditivos para vazamento de receita.
3. **Centros de Custo por Evento:** CRUD de centros de custo com tagging de eventos (ex: "Imersão Turma 04") e DRE isolado por evento.
4. **Webhook Stone Funcional:** Implementação real do webhook de notificação de pagamentos, substituindo o stub atual.
5. **Preparação para Fase 4:** Schema de assinaturas recorrentes criado mas sem lógica de negócio.

# 📜 Contratos de API (REGRA 1)
- [x] `openspec/contracts/admin/financial/admin_financial_dashboard.json` — GET /admin/financial/dashboard
- [x] `openspec/contracts/admin/financial/admin_financial_transactions.json` — GET /admin/financial/transactions
- [x] `openspec/contracts/admin/financial/admin_financial_transactions_create.json` — POST /admin/financial/transactions
- [x] `openspec/contracts/admin/financial/admin_financial_cash_close.json` — GET/POST /admin/financial/cash-close
- [x] `openspec/contracts/admin/financial/admin_financial_cost_centers.json` — CRUD /admin/financial/cost-centers
- [x] `openspec/contracts/admin/financial/admin_financial_expenses.json` — CRUD /admin/financial/expenses
- [x] `openspec/contracts/admin/financial/admin_financial_reports_dre.json` — GET /admin/financial/reports/dre

# 🚫 Espaço Negativo (Fora de Escopo)
- [x] VPS Hostinger (45.152.44.244) — Deploy via deploy-hostinger.ps1. Nenhuma alteração de infraestrutura.
- [x] VPS Dedicada (2.25.156.25) — Container Docker Compose e Traefik imutáveis.
- [x] Chaves SSH / Stone API Keys — Nunca comitar. Usar variáveis de ambiente.
- [x] Tabelas existentes do schema legado — Nunca alterar shop_orders, shop_products, licenciadas, etc.
- [x] Sistema de Estoque (Fase 3 do roadmap) — Fora de escopo.
- [x] Sistema de Assinaturas Recorrentes (Fase 4) — Schema preparado, lógica de negócio fora de escopo.

# 🗄️ Camada de Dados (MySQL)

## Tabelas Novas (via ensure_tables.php — REGRA 7)

### financial_transactions
```sql
CREATE TABLE IF NOT EXISTS financial_transactions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_type ENUM('shop_order','onboarding','licenciamento','manual','subscription') NOT NULL,
  source_id INT UNSIGNED NULL,
  type ENUM('revenue','refund','chargeback','expense') NOT NULL DEFAULT 'revenue',
  amount_cents INT UNSIGNED NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  description VARCHAR(500) NULL,
  category VARCHAR(100) NULL,
  tax_tag ENUM('estetica_cosmetica','servicos_medicos_educacionais','nao_definido') DEFAULT 'nao_definido',
  cost_center_id INT UNSIGNED NULL,
  event_tag VARCHAR(100) NULL,
  payment_method ENUM('card','pix','boleto','manual','transfer') NULL,
  installments INT UNSIGNED DEFAULT 1,
  status ENUM('pending','confirmed','refunded','cancelled') DEFAULT 'confirmed',
  confirmed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_source (source_type, source_id),
  INDEX idx_date (created_at),
  INDEX idx_category (category),
  INDEX idx_event_tag (event_tag),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### financial_cost_centers
```sql
CREATE TABLE IF NOT EXISTS financial_cost_centers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  tag VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### financial_expenses
```sql
CREATE TABLE IF NOT EXISTS financial_expenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cost_center_id INT UNSIGNED NOT NULL,
  description VARCHAR(500) NOT NULL,
  amount_cents INT UNSIGNED NOT NULL,
  category VARCHAR(100) NULL,
  receipt_path VARCHAR(255) NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cost_center (cost_center_id),
  INDEX idx_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### financial_daily_closes
```sql
CREATE TABLE IF NOT EXISTS financial_daily_closes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  close_date DATE UNIQUE NOT NULL,
  total_revenue_cents INT UNSIGNED DEFAULT 0,
  total_expenses_cents INT UNSIGNED DEFAULT 0,
  net_result_cents INT DEFAULT 0,
  alerts JSON NULL,
  status ENUM('pending','closed','reviewed') DEFAULT 'pending',
  closed_by_admin_id INT UNSIGNED NULL,
  closed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### financial_subscriptions (schema preparado — Fase 4)
```sql
CREATE TABLE IF NOT EXISTS financial_subscriptions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  licenciada_id INT UNSIGNED NOT NULL,
  plan_name VARCHAR(200) NOT NULL,
  amount_cents INT UNSIGNED NOT NULL,
  billing_cycle ENUM('monthly','quarterly','annual') DEFAULT 'monthly',
  status ENUM('active','paused','cancelled','past_due') DEFAULT 'active',
  next_billing_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Índices de Performance
```sql
CREATE INDEX IF NOT EXISTS idx_ft_created_at ON financial_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_ft_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_ft_event_tag ON financial_transactions(event_tag);
CREATE INDEX IF NOT EXISTS idx_fe_expense_date ON financial_expenses(expense_date);
```

# ⚙️ Camada de Backend (PHP 8.4)

## Services Novos

### FinancialService.php
- `getDashboardKPIs(): array` — Margem de Lucro, CAC, Cash Runway, Inadimplência, Receita Mensal
- `getCashRunway(): float` — saldo atual + recebíveis futuros / média custos fixos
- `getRevenueByPeriod(string $from, string $to): array` — Receita por período
- `getTransactions(array $filters): array` — Lista paginada com filtros
- `createTransaction(array $data): int` — Registro manual
- `getDreByEvent(string $eventTag): array` — DRE isolado por evento
- `getInadimplencia(): array` — Pagamentos pendentes

### CashCloseService.php
- `getDailyClose(string $date): array` — Status do fechamento do dia
- `performDailyClose(string $date, int $adminId): array` — Executar fechamento
- `getAlerts(string $date): array` — Alertas impeditivos

### CostCenterService.php
- `list(): array`
- `create(array $data): int`
- `update(int $id, array $data): bool`
- `delete(int $id): bool`
- `listExpenses(int $costCenterId): array`
- `createExpense(array $data): int`

### Webhook Stone (refatoração)
- `ShopService::handleWebhook()` — Implementar validação de assinatura + atualização de status + criação de `financial_transactions`

## Controllers Novos

### FinancialDashboardController.php
- `GET /admin/financial/dashboard` → `FinancialService::getDashboardKPIs()`

### FinancialTransactionsController.php
- `GET /admin/financial/transactions` → `FinancialService::getTransactions()`
- `POST /admin/financial/transactions` → `FinancialService::createTransaction()`

### FinancialCashCloseController.php
- `GET /admin/financial/cash-close` → `CashCloseService::getDailyClose()`
- `POST /admin/financial/cash-close/{date}` → `CashCloseService::performDailyClose()`

### FinancialCostCenterController.php
- `GET /admin/financial/cost-centers` → `CostCenterService::list()`
- `POST /admin/financial/cost-centers` → `CostCenterService::create()`
- `PUT /admin/financial/cost-centers/{id}` → `CostCenterService::update()`
- `DELETE /admin/financial/cost-centers/{id}` → `CostCenterService::delete()`
- `GET /admin/financial/cost-centers/{id}/expenses` → `CostCenterService::listExpenses()`
- `POST /admin/financial/expenses` → `CostCenterService::createExpense()`

### FinancialReportsController.php
- `GET /admin/financial/reports/dre` → `FinancialService::getDreByEvent()`

## Padrões de Implementação
- Controllers finos: toda lógica delegada ao Service (REGRA 6)
- Construtor: `mixed $db` (REGRA 13)
- Resposta: `Response::json()` e `Response::error()`
- Auth: `$middleware->check()` em todas as rotas
- Namespace: `BodyHarmony\Services\*`

# ⚛️ Camada de Interface (React)

## Rotas Novas (App.jsx)
```
/portal-gestor/financeiro                    → FinanceiroDashboard.jsx
/portal-gestor/financeiro/transacoes         → FinancialTransactionsPage.jsx
/portal-gestor/financeiro/fechamento-dia     → CashClosePage.jsx
/portal-gestor/financeiro/centros-custo      → CostCentersPage.jsx
/portal-gestor/financeiro/relatorios         → FinancialReportsPage.jsx
```

## Proteção RBAC (REGRA 17)
- Todas as rotas: `<PermissionRouteGuard page="financial_view">`
- Sidebar item: visível apenas para roles com `financial_view` ou `financial_manage`
- Verificação backend em todas as rotas admin

## Componentes Novos

### FinanceiroDashboard.jsx
- Bento grid luxury com 6 KPI cards
- CashRunwayGauge (medidor circular animado)
- RevenueChart (gráfico de linhas/barras — Recharts)
- InadimplenciaAlert (lista de pagamentos pendentes)
- DRE Summary (receitas - despesas = lucro por evento)
- Filtros de período (7d, 30d, 90d, 12m)

### FinancialTransactionsPage.jsx
- Tabela paginada com filtros (status, data, categoria, tag tributária)
- Modal de registro manual de transação
- Badges de status (confirmado, pendente, estornado)
- Exportação futura (placeholder)

### CashClosePage.jsx
- Timeline do dia com eventos vs entradas financeiras
- Alertas impeditivos (serviço sem baixa financeira)
- Botão "Fechar Dia" com confirmação
- Histórico de fechamentos anteriores

### CostCentersPage.jsx
- Lista de centros de custo com tags
- CRUD completo (criar, editar, excluir)
- Sub-lista de despesas por centro
- Formulário de registro de despesa

### FinancialReportsPage.jsx
- DRE por evento (tabela com Receita - Custo = Lucro)
- Filtro por evento/tag
- Gráfico de barras comparativo
- Resumo executivo

## Sidebar (AdminLayout.jsx)
- Novo item: `FaChartLine` ou `FaDollarSign` com label "Financeiro"
- Visível apenas para roles com permissão finance
- Sub-itens: Dashboard, Transações, Fechamento, Centros de Custo, Relatórios

## Padrões de Implementação
- `styled-components` com props transient `$`
- `GestorThemeProvider` + `useGestorTheme()` para dark/light mode
- Lazy loading via `React.lazy()` + `Suspense`
- `framer-motion` para animações de entrada
- `lucide-react` para ícones
- API central: `financialApi` em `services/api.js` (REGRA 14)
- Estado local: `useState`/`useEffect` (sem Redux)

## Paleta de Cores
- Fundo cards: `#FFFFFF` (light) / `#0c1d2c` (dark)
- KPI positivo: `#28a745` (verde)
- KPI negativo: `#dc3545` (vermelho)
- Destaques: Gold `#ED7E13`
- Headers: Navy `#0A3E60`
- Bordas: `rgba(10, 62, 96, 0.1)`

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Web Hosting (45.152.44.244):** Deploy do frontend React via `deploy-hostinger.ps1`.
- **Backend PHP:** Deploy via WinSCP/FTP para `public_html/api/v1/`.

# 🔍 Monitoramento Semântico (Regression Watch)
- [ ] Validar que todas as rotas `/portal-gestor/financeiro/*` retornam 401 para usuários sem permissão `financial_view`
- [ ] Validar que o Dashboard Financeiro exibe todos os 6 KPIs calculados corretamente
- [ ] Validar que o Fechamento Diário cruza eventos do dia com entradas financeiras
- [ ] Validar que centros de custo podem ser criados, editados e excluídos
- [ ] Validar que o DRE por evento mostra receita - despesa = lucro
- [ ] Validar que transações manuais são registradas corretamente
- [ ] Validar que o webhook Stone atualiza o status de pedidos existentes
- [ ] Validar que o schema de assinaturas recorrentes foi criado (tabela vazia)

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Migração corrompe schema legado → **Rollback:** DROP TABLE IF EXISTS para tabelas novas. Nunca alterar tabelas existentes.
- **Risco:** Webhook Stone exposto → **Rollback:** Reverter para stub original. Validar com IP allowlist.
- **Risco:** KPIs com dados incompletos → **Rollback:** Exibir disclaimer "Dados baseados em transações registradas".
- **Risco:** Performance de queries → **Rollback:** Criar índices adicionais. Usar cache se disponível.

# ✅ Checklist de Execução Atômica

## Delta 1 — Contratos JSON + Migrações
- [x] Criar diretório `openspec/contracts/admin/financial/`
- [x] Criar 7 arquivos de contrato JSON
- [x] Criar migration SQL em `infrastructure/database/migrations/V122_Create_Financial_Tables.sql`
- [x] Adicionar criação de tabelas em `ensure_tables.php` (padrão REGRA 7)
- [x] Validar contratos com schema existente

## Delta 2 — FinancialService + Dashboard Controller
- [x] Criar `Services/FinancialService.php` com todos os métodos
- [x] Criar `Controllers/FinancialDashboardController.php`
- [x] Registrar rotas em `api/v1/index.php`
- [x] Criar `Services/CashCloseService.php`
- [x] Criar `Services/CostCenterService.php`
- [x] Criar `Controllers/FinancialCostCenterController.php`

## Delta 3 — Dashboard Financeiro React
- [x] Criar `pages/Admin/Financeiro/FinanceiroDashboard.jsx`
- [x] Adicionar rotas em `App.jsx` com lazy loading
- [x] Adicionar item no Sidebar (AdminLayout.jsx) — desktop + mobile drawer
- [x] Adicionar `financialApi` em `services/api.js`

## Delta 4 — Fechamento Diário
- [x] Criar `pages/Admin/Financeiro/CashClosePage.jsx`

## Delta 5 — Centros de Custo
- [x] Criar `pages/Admin/Financeiro/CostCentersPage.jsx`

## Delta 6 — Webhook Stone Funcional
- [x] Refatorar `ShopController::handleWebhook()` com validação + criação automática de `financial_transactions`

## Delta 7 — Transações + Relatórios
- [x] Criar `pages/Admin/Financeiro/FinancialTransactionsPage.jsx`
- [x] Criar `pages/Admin/Financeiro/FinancialReportsPage.jsx`

## Delta 8 — Integração Final + Testes
- [ ] Build de homologacao (npm run build:hostinger)
- [ ] Smoke test completo: criar transação → ver no dashboard → gerar DRE
- [ ] Deploy Hostinger + validação em produção
