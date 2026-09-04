# PLAN-132 — Integração de Taxas de Licenciamento no Painel Financeiro

**Status:** EM EXECUCAO
**Data:** 2026-08-25
**Dependências:** PLAN-122 (Painel Financeiro), PLAN-064 (Funil de Onboarding)
**Brainstorm:** BRAINSTORM-123

---

## Escopo

Integrar o relatório jurídico de taxas iniciais (`relatorio_taxas_licenciadas.html`) ao Painel Financeiro do Gestor, permitindo que o gestor **crie, edite, altere e complemente** dados financeiros de licenciadas novas e antigas de forma totalmente integrada ao sistema existente.

### Funcionalidades

1. **Tabela `licenciada_taxas`**: Registro dedicado de taxas de licenciamento com vínculo à licenciada
2. **Hook automático no Onboarding**: Ao ativar licenciada (`ATIVO_LIBERADO`), cria registro de taxa automaticamente
3. **CRUD completo pelo gestor**: Criar, editar, excluir, complementar dados de taxas
4. **Dashboard interativo**: KPIs, tabela com filtros, modal de detalhes, status de pendências
5. **Seed histórica**: 13 registros do relatório jurídico inseridos automaticamente
6. **Vínculo com financial_transactions**: Ao registrar taxa, cria transação financeira correspondente

---

## Contratos JSON (openspec/contracts/)

### `admin_financial_license_taxes.json`
```json
{
  "endpoint": "GET /api/v1/admin/financial/license-taxes",
  "description": "Lista taxas de licenciamento com filtros e paginação",
  "query_params": {
    "status": "pending_payment|paid|contract_signed|cancelled",
    "method": "pix|card|transfer|manual",
    "search": "string (nome, cpf, cidade)",
    "page": "int (default 1)",
    "per_page": "int (default 20)"
  },
  "response": {
    "data": [
      {
        "id": "int",
        "licenciada_id": "int|null",
        "licenciada_name": "string",
        "licenciada_cpf": "string",
        "licenciada_cnpj": "string|null",
        "licenciada_location": "string",
        "valor_cents": "int",
        "valor_display": "string (R$ X.XXX,XX)",
        "valor_extenso": "string",
        "payment_method": "pix|card|transfer|manual",
        "payment_condition": "string (ex: 5x de R$ 1.400)",
        "installments": "int",
        "status": "pending_payment|paid|contract_signed|cancelled",
        "contract_signed_at": "datetime|null",
        "payment_confirmed_at": "datetime|null",
        "notes": "string|null",
        "source": "onboarding|manual|imported",
        "onboarding_request_id": "int|null",
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    ],
    "pagination": { "page": 1, "per_page": 20, "total": 13, "total_pages": 1 },
    "summary": {
      "total_contracted_cents": 6610000,
      "total_with_additionals_cents": 7440000,
      "average_ticket_cents": 661000,
      "total_pending": 3,
      "total_signed": 10,
      "distribution": {
        "R$ 7.000": { "count": 5, "total_cents": 3500000 },
        "R$ 6.200": { "count": 3, "total_cents": 1860000 },
        "R$ 6.500": { "count": 1, "total_cents": 650000 },
        "R$ 6.000": { "count": 1, "total_cents": 600000 }
      },
      "by_method": {
        "pix": { "count": 4 },
        "card": { "count": 6 }
      }
    }
  }
}
```

### `admin_financial_license_taxes_create.json`
```json
{
  "endpoint": "POST /api/v1/admin/financial/license-taxes",
  "description": "Cria ou atualiza registro de taxa de licenciamento",
  "body": {
    "licenciada_id": "int|null (null = sem vínculo, ex: Francisnara)",
    "licenciada_name": "string (obrigatório)",
    "licenciada_cpf": "string|null",
    "licenciada_cnpj": "string|null",
    "licenciada_location": "string|null",
    "valor_cents": "int (obrigatório, em centavos)",
    "valor_extenso": "string|null",
    "payment_method": "pix|card|transfer|manual (obrigatório)",
    "payment_condition": "string|null",
    "installments": "int (default 1)",
    "status": "pending_payment|paid|contract_signed|cancelled",
    "notes": "string|null",
    "onboarding_request_id": "int|null"
  },
  "response": {
    "success": true,
    "data": { "...taxa object..." },
    "transaction_created": true
  }
}
```

### `admin_financial_license_taxes_update.json`
```json
{
  "endpoint": "PATCH /api/v1/admin/financial/license-taxes/{id}",
  "description": "Atualiza registro de taxa (qualquer campo)",
  "body": {
    "licenciada_id": "int|null",
    "valor_cents": "int",
    "payment_method": "string",
    "status": "string",
    "notes": "string"
  }
}
```

---

## Delta 1 — Migração + Service + Controller (Backend)

### 1.1 Migração V123

**Arquivo:** `infrastructure/database/migrations/V123_License_Taxes_Table.sql`

```sql
CREATE TABLE IF NOT EXISTS `licenciada_taxas` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `licenciada_id` INT UNSIGNED NULL,
  `licenciada_name` VARCHAR(255) NOT NULL,
  `licenciada_cpf` VARCHAR(14) NULL,
  `licenciada_cnpj` VARCHAR(20) NULL,
  `licenciada_location` VARCHAR(200) NULL,
  `valor_cents` INT UNSIGNED NOT NULL,
  `valor_extenso` VARCHAR(255) NULL,
  `payment_method` ENUM('pix','card','transfer','manual') NOT NULL DEFAULT 'manual',
  `payment_condition` VARCHAR(255) NULL,
  `installments` INT UNSIGNED NOT NULL DEFAULT 1,
  `status` ENUM('pending_payment','paid','contract_signed','cancelled') NOT NULL DEFAULT 'pending_payment',
  `contract_signed_at` DATETIME NULL,
  `payment_confirmed_at` DATETIME NULL,
  `notes` TEXT NULL,
  `source` ENUM('onboarding','manual','imported') NOT NULL DEFAULT 'manual',
  `onboarding_request_id` INT UNSIGNED NULL,
  `financial_transaction_id` INT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_lt_licenciada` (`licenciada_id`),
  INDEX `idx_lt_status` (`status`),
  INDEX `idx_lt_cpf` (`licenciada_cpf`),
  INDEX `idx_lt_source` (`source`),
  CONSTRAINT `fk_lt_licenciada` FOREIGN KEY (`licenciada_id`) REFERENCES `licenciadas`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lt_onboarding` FOREIGN KEY (`onboarding_request_id`) REFERENCES `licenciada_onboarding_requests`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.2 LicenseTaxService.php

**Arquivo:** `apps/web-app/src/backend/api/v1/Services/LicenseTaxService.php`

Métodos:
- `list(array $filters): array` — Lista com filtros, paginação e summary
- `getById(int $id): array` — Detalhes de uma taxa
- `create(array $data): array` — Cria taxa + cria `financial_transactions` se status=paid
- `update(int $id, array $data): array` — Atualiza qualquer campo
- `delete(int $id): bool` — Soft delete (status=cancelled)
- `getSummary(): array` — KPIs consolidados
- `seedHistorical(): int` — Insere os 13 registros do relatório jurídico (idempotente)
- `syncFromOnboarding(int $onboardingId, int $licenciadaId): array` — Cria taxa a partir do onboarding

### 1.3 LicenseTaxController.php

**Arquivo:** `apps/web-app/src/backend/api/v1/Controllers/LicenseTaxController.php`

Endpoints:
| Método | Rota | Ação | Permissão |
|:---|:---|:---|:---|
| `GET` | `/admin/financial/license-taxes` | `list()` | `financial_view` |
| `GET` | `/admin/financial/license-taxes/summary` | `getSummary()` | `financial_view` |
| `GET` | `/admin/financial/license-taxes/{id}` | `getById()` | `financial_view` |
| `POST` | `/admin/financial/license-taxes` | `create()` | `financial_manage` |
| `PATCH` | `/admin/financial/license-taxes/{id}` | `update()` | `financial_manage` |
| `DELETE` | `/admin/financial/license-taxes/{id}` | `delete()` | `financial_manage` |
| `POST` | `/admin/financial/license-taxes/seed` | `seedHistorical()` | `financial_manage` |

### 1.4 Registro de Rotas

Adicionar em `index.php` após as rotas financeiras do PLAN-122:
```php
// === LICENSE TAXES (PLAN-132) ===
$router->add('GET', '/admin/financial/license-taxes/summary', function() {
    (new LicenseTaxController())->getSummary();
});
$router->add('GET', '/admin/financial/license-taxes', function() {
    (new LicenseTaxController())->list();
});
// ... etc
```

### 1.5 Integração com OnboardingService

Em `OnboardingService.php`, método que altera status para `ATIVO_LIBERADO` (~linha 935), adicionar:

```php
// Após INSERT/UPDATE em licenciadas, criar registro de taxa automaticamente
if ($licenciadaId && !empty($req['taxa_inicial_num'])) {
    $taxService = new LicenseTaxService($this->db);
    $taxService->syncFromOnboarding($onboardingRequest['id'], $licenciadaId);
}
```

### 1.6 Seed Histórica

No método `seedHistorical()` do `LicenseTaxService`, inserir os 13 registros:

| # | Licenciada | CPF/CNPJ | Local | Valor | Método | Status |
|:--|:---|:---|:---|:---|:---|:---|
| 1 | Jaqueline Leal Venturini | 38.318.572/0001-38 | Linhares/ES | 600000 | pix | contract_signed |
| 2 | Joice Aparecida Ferreira | 39.458.550/0001-94 | Maria Helena/PR | 620000 | transfer | contract_signed |
| 3 | Luana Ramos | - | Itajubá/MG | 650000 | card | contract_signed |
| 4 | Mariana Cristina Tiamazo | 22.192.183/0001-27 | Cordeirópolis/SP | 620000 | pix | contract_signed |
| 5 | Mariana Pereira Telles da Costa | - | Uberaba/MG | 700000 | card | contract_signed |
| 6 | Mariany Vieira Rahal | - | Frutal/MG | 700000 | card | contract_signed |
| 7 | Nathália Kluczkowski | - | Prudentópolis/PR | 700000 | card | contract_signed |
| 8 | Nilsuelen Barbosa Garcia | - | Araçatuba/SP | 700000 | card | contract_signed |
| 9 | Thamirez Souza Santana Silva | - | Internacional/Brasil | 620000 | card | contract_signed |
| 10 | Yonalia Santos de Oliveira | 49.930.435/0001-24 | Salvador/BA | 700000 | pix | contract_signed |
| 11 | Francisnara Isabel Paes Pereira | 40.515.491/0001-28 | Santa Bárbara/MG | 630000 | pix | paid |
| 12 | Marcela Rodrigues Coelho | - | A definir | 0 | manual | pending_payment |
| 13 | Marina Schneider | - | A definir | 0 | manual | pending_payment |

---

## Delta 2 — Frontend (React)

### 2.1 LicenseTaxesPage.jsx

**Arquivo:** `apps/web-app/src/frontend/src/pages/Admin/Financeiro/LicenseTaxesPage.jsx`

**Layout:**
- **PageHeader:** Título "Taxas de Licenciamento" + botão "Nova Taxa" (Gold)
- **KPI Grid (4 cards):**
  - Total Contratado (Gold badge)
  - Ticket Médio (Success badge)
  - Contratos Assinados (Info badge)
  - Pendências (Warning badge, CTA para ação)
- **FiltersBar:** Busca por nome/CPF/cidade + pills (Todas / PIX / Cartão / R$ 7.000 / R$ 6.200 / Pendentes)
- **Tabela Principal:** Avatar + nome, local, valor, modalidade, parcelamento, status, ações (editar/excluir)
- **Modal de Criar/Editar:** Formulário completo com todos os campos, validação inline
- **Modal de Detalhes:** Visualização completa com cláusula, dados cadastrais, observações

**Componentes reutilizados:** `AdminLayout`, padrão `styled-components` do PLAN-122

### 2.2 Integração no Sidebar e Rotas

**AdminLayout.jsx:** Adicionar sub-item "Taxas Licenciamento" no grupo Financeiro
**App.jsx:** Adicionar rota `/portal-gestor/financeiro/taxas-licenciamento` com `PermissionRouteGuard page="financial_view"`
**api.js:** Adicionar `licenseTaxesApi` com todos os métodos

---

## Delta 3 — Integrações + Deploy

### 3.1 Integração com OnboardingService
- Hook automático ao ativar licenciada
- Criação de `financial_transactions` ao confirmar pagamento

### 3.2 Seed e Validação
- Executar seed dos 13 registros históricos
- Validar que dashboard reflete os valores corretos

### 3.3 Build e Deploy
- `npm run build:hostinger` (exit code 0)
- Deploy via `deploy-pro.ps1 -SkipBuild`
- Smoke test: `https://bodyharmony.com.br/api/v1/ping`

---

## Espaço Negativo (Fora de Escopo)

- **VPS Dedicada (2.25.156.25):** Nenhum impacto
- **Traefik / Docker:** Não aplicável
- **Streaming de Vídeo LMS:** Não impactado
- **Chaves SSH / Credenciais:** Nenhuma nova necessária
- **Tabela `licenciadas`:** Schema NÃO será alterado (REGRA 12)
- **Tabela `financial_transactions`:** Schema NÃO será alterado — apenas `source_type = 'licenciamento'` será utilizado

---

## Regras Constitucionais Aplicáveis

| Regra | Impacto |
|:---|:---|
| **REGRA 8** (CPF Invariant) | Queries usam `licenciada_cpf` — coluna física `cpf` |
| **REGRA 12** (MySQL Columns) | `licenciadas` NÃO será alterada; nova tabela dedicada |
| **REGRA 13** (LazyDb/PDO) | Service usa `mixed $db` no construtor |
| **REGRA 14** (API Auth) | Todas as rotas `/admin/*` exigem Bearer token |
| **REGRA 17** (RBAC) | Rotas protegidas por `financial_view` e `financial_manage` |

---

## Matriz de Riscos

| Risco | Severidade | Mitigação |
|:---|:---|:---|
| Hook em OnboardingService quebra ativação | **ALTO** | Hook em transaction isolada com try/catch; rollback silencioso |
| Dados históricos com CPF/CNPJ inconsistente | **MÉDIO** | Validar formato antes de insert; campos nullable |
| Transação financeira duplicada | **MÉDIO** | Constraint `financial_transaction_id` unique; idempotência via `onboarding_request_id` |
| Gestor exclui taxa vinculada a contrato assinado | **BAIXO** | Bloqueio de exclusão quando `status = contract_signed` |

---

## Checklist de Execução

- [ ] **D-132.1:** Criar migração V123 + ensureFinancialTablesExist()
- [ ] **D-132.2:** Criar LicenseTaxService.php com CRUD + seed
- [ ] **D-132.3:** Criar LicenseTaxController.php + registrar rotas
- [ ] **D-132.4:** Criar LicenseTaxesPage.jsx (KPIs + tabela + filtros + modais)
- [ ] **D-132.5:** Integrar no App.jsx (rotas) + AdminLayout (sidebar) + api.js
- [ ] **D-132.6:** Integrar hook no OnboardingService + criar financial_transactions
- [ ] **D-132.7:** Seed histórica dos 13 registros + validação
- [ ] **D-132.8:** Build, smoke test, regression-watch, deploy
