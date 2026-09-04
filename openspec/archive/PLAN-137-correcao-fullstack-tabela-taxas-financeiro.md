# PLAN-137 — Correção Fullstack & Auto-Healing da Tabela de Taxas Financeiras

**Status:** APROVADO
**Data:** 2026-08-25
**Dependências:** PLAN-132, PLAN-133
**Origem do Diagnóstico:** `tmp/financeiro.log`

---

## 🎯 1. Objetivo Fullstack

Mapear cirurgicamente a causa dos erros 500 e 400 em `financeiro.log` e implementar correção definitiva com auto-healing nas camadas de Banco de Dados, Backend e Frontend.

### Análise Forense do Erro
- **Erro 1:** `GET /api/v1/admin/financial/license-taxes?per_page=50` -> 500 Internal Server Error
- **Erro 2:** `POST /api/v1/admin/financial/license-taxes` -> 400 Bad Request (`SQLSTATE[42S02]: Base table or view not found: 1146 Table 'u388974772_bodyharmony_db.licenciada_taxas' doesn't exist`)
- **Causa Raiz:** Incompatibilidade de tipos de dados entre as colunas nas foreign keys do MySQL (`licenciadas.id` é `INT(11)` signed, enquanto `licenciada_id` na DDL era `INT UNSIGNED`; `licenciada_onboarding_requests.id` é `BIGINT UNSIGNED`, enquanto `onboarding_request_id` era `INT UNSIGNED`). Isso fez com que o `CREATE TABLE` falhasse em produção.

---

## 2. Checklist de Execução Atômica

- [x] **D-137.1:** Ajustar DDL em `infrastructure/database/migrations/V123_License_Taxes_Table.sql` e `V124_Financial_Hub_Attachments.sql`
- [x] **D-137.2:** Implementar auto-healing resiliente e auto-seeding em `LicenseTaxService::ensureTableExists()` e métodos de query
- [x] **D-137.3:** Adicionar fallback resiliente em `LicenseTaxController.php`
- [x] **D-137.4:** Atualizar tratamento de erro e auto-recuperação no frontend `FinanceiroDashboard.jsx`
- [x] **D-137.5:** Executar testes CLI `tests/license_taxes_smoke_test.php` e `tests/financial_cockpit_smoke_test.php`
- [x] **D-137.6:** Recompilar frontend com `npm run build` e registrar no Vault
