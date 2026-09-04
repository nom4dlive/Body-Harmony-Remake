# PLAN-133 — Hub Financeiro Unificado & Gestão Operacional da Josi

**Status:** APROVADO
**Data:** 2026-08-25
**Dependências:** PLAN-122 (Painel Financeiro), PLAN-132 (Taxas de Licenciamento)
**Base Operacional:** `relatorio_taxas_licenciadas.html` (13 licenciadas, R$ 74.400 total)

---

## 1. Escopo e Objetivos

Transformar o Painel Financeiro (`/portal-gestor/financeiro`) em um **Cockpit Financeiro Executivo Luxury** unificado em abas, permitindo que a Josi e os administradores tenham visão total das finanças, realizem lançamentos rápidos, façam upload de comprovantes e documentos (PDF/JPG/PNG), vinculem licenciadas antigas e novas, emitam recibos no WhatsApp e exportem relatórios contábeis.

### Entregáveis Principais
1. **Navegação por Abas no Hub Principal (`/portal-gestor/financeiro`):**
   - Aba 1: *Visão Geral & Cockpit da Josi* (KPIs reais, fluxo de caixa, distribuição de métodos de pagamento, alertas de pendências).
   - Aba 2: *Taxas & Contratos de Licenciamento* (tabela executiva inspirada em `relatorio_taxas_licenciadas.html`, filtros, busca, ações).
   - Aba 3: *Transações & Lançamentos* (CRUD de receitas, despesas, pró-labore, compras).
   - Aba 4: *Comprovantes & Anexos* (galeria e upload de comprovantes bancários e contratos assinados).
   - Aba 5: *DRE & Exportação* (DRE gerencial e exportação Excel/CSV/PDF).
2. **Barra de Ações Rápidas (Topo):**
   - `+ Novo Lançamento`
   - `+ Nova Taxa`
   - `⚡ Sincronizar Histórico`
   - `📥 Exportar Relatório`
3. **Módulo de Anexos (Uploads Seguros):**
   - Tabela `financial_attachments` e suporte em `licenciada_taxas`.
   - Armazenamento em `public_html/uploads/financial/`.
4. **Baixa com Recibo WhatsApp:**
   - Geração de texto formatado oficial e link `wa.me/` com 1 clique para a licenciada.
5. **Sincronização Híbrida Automática:**
   - Ingestão dos 13 registros históricos + sincronização de contratos assinados na tabela `contracts`.

---

## 2. Contratos JSON (openspec/contracts/admin/financial/)

- `admin_financial_attachments_upload.json`
- `admin_financial_sync_all.json`
- `admin_financial_whatsapp_receipt.json`
- `admin_financial_export.json`

---

## 3. Checklist de Execução

- [ ] **D-133.1:** Migration `V124_Financial_Hub_Attachments.sql` e auto-provisionamento em `LicenseTaxService`
- [ ] **D-133.2:** Criação dos contratos JSON em `openspec/contracts/admin/financial/`
- [ ] **D-133.3:** Métodos de sync, anexos, recibo WhatsApp e exportação em `LicenseTaxService.php`
- [ ] **D-133.4:** Endpoints no `LicenseTaxController.php` e rotas em `index.php`
- [ ] **D-133.5:** Expansão de `api.js` no frontend
- [ ] **D-133.6:** Reformulação completa de `FinanceiroDashboard.jsx` com o Hub de Abas Luxury e Ações Rápidas
- [ ] **D-133.7:** Testes de fumaça CLI `tests/financial_cockpit_smoke_test.php`
- [ ] **D-133.8:** Build do frontend (`npm run build`) e registro no Vault
