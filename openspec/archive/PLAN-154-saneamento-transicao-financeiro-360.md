# 🎯 Objetivo Fullstack

Resolver de forma definitiva o erro SQL 1054 em consultas financeiras e de dossiê da licenciada, eliminando referências a colunas inexistentes na tabela mestre (`l.cnpj`, `l.cidade`), implementando o diagnóstico de regularidade documental/financeira sem invenção de dados (sem valores fixos de R$ 7.000 ou status assumidos sem comprovação), fornecendo ações de enriquecimento manual (upload de contrato físico assinado, upload de comprovante de pagamento e definição/upsert de valor de taxa) no Dossiê 360º e no Gestor Financeiro, além de filtros por Chips e KPIs transparentes.

---

# 📜 Contratos de API (REGRA 1)
- [ ] `openspec/contracts/admin/contracts-upload-signed.json` — Validação da rota `POST /api/v1/admin/contracts/upload-signed` recebendo multipart (`contract_uuid` ou `licenciada_id`, `file`, `notes`) e atualizando contrato para `SIGNED` com propagação para `licenciada_taxas`.
- [ ] `openspec/contracts/admin/financial/admin_financial_receipt_upload.json` — Validação da rota `POST /api/v1/admin/financial/receipt` para upload de comprovantes com quitação contábil.
- [ ] `openspec/contracts/admin/financial/admin_financial_license_taxes_update.json` — Validação do endpoint `PUT /api/v1/admin/financial/license-taxes/{id}` com suporte a UPSERT para licenciadas sem taxa prévia.
- [ ] `openspec/contracts/admin/financial/admin_financial_license_taxes.json` — Atualização de schema para incluir `status_documental`, `taxa_num` e flags de diagnóstico.

---

# 🚫 Espaço Negativo (Fora de Escopo)
- [ ] Infraestrutura Docker/Traefik e restrição de localhost do container de banco de dados na VPS (Imutável).
- [ ] Assinatura digital externa via Gov.br / ICP-Brasil dentro do servidor (o sistema recebe o PDF já assinado externamente).
- [ ] Alteração de dados cadastrais imutáveis da Licenciante (Regra 11).
- [ ] Invenção de valores fictícios ou suposições de quitação automática sem upload de comprovante ou contrato.

---

# 🗄️ Camada de Dados (SQL)
- [ ] `infrastructure/database/migrations/V154__saneamento_transicao_diagnostico.sql`:
  - Garantir colunas defensivas em `licenciada_taxas` (`contract_uuid`, `status_documental`, `payment_confirmed_at`, `contract_signed_at`).
  - Índices otimizados para `licenciadas` (`id`, `is_active`) e joins satélites.
- [ ] Manter paridade com `DATABASE_MASTER_V36_1.sql`.

---

# ⚙️ Camada de Backend (PHP 8.4)
- [ ] `apps/web-app/src/backend/api/v1/Services/LicenseTaxService.php`:
  - Eliminar referências a `l.cnpj` e `l.cidade`.
  - Ancorar consultas em `licenciadas l WHERE l.is_active = 1` com `LEFT JOIN` defensivo em `licenciada_taxas lt`, `contracts c` e `licenciada_onboarding_requests r`.
  - Tratamento estrito de valores: `COALESCE(lt.valor_cents, c.taxa_inicial_num * 100, NULL)` (sem fallback de 700000).
  - Cálculo de `status_documental`:
    `CASE WHEN c.status = 'SIGNED' OR lt.status = 'contract_signed' THEN 'regularizado' WHEN lt.id IS NOT NULL OR c.id IS NOT NULL THEN 'em_analise' ELSE 'aguardando_anexos' END`.
  - Suporte a UPSERT no método `updateTax($id, $data)`.
- [ ] `apps/web-app/src/backend/api/v1/Services/Licenciada360Service.php`:
  - Eliminar referências proibidas a colunas inexistentes.
  - Retornar status documental consolidado e detalhado de pendências no Dossiê 360º.
- [ ] `apps/web-app/src/backend/api/v1/Controllers/ContractsController.php` & `LicenseTaxController.php`:
  - Implementar/ajustar `uploadSignedContract()` e `uploadReceipt()`.
  - Sincronização em cascata: contrato assinado atualiza `contracts` e `licenciada_taxas`.
- [ ] `apps/web-app/src/backend/api/v1/Controllers/FinancialDashboardController.php`:
  - KPIs transparentes de topo baseados apenas em valores reais comprovados.

---

# ⚛️ Camada de Interface (React V3.1)
- [ ] `apps/web-app/src/frontend/src/components/LicenciadaDossierDrawer.jsx`:
  - Exibir status claro de cada documento:
    - **Contrato:** `✓ Assinado Digital` | `📁 PDF Físico Anexado` | `⏳ Aguardando Anexo do Contrato`
    - **Comprovante:** `🟢 Quitado` | `🟡 Aguardando Comprovante`
    - **Valor:** Exibir valor real formatado ou badge `A Definir / Em Levantamento`.
  - Implementar ações de upload manual:
    - `[📎 Anexar Contrato PDF]` -> Modal/Upload para `POST /api/v1/admin/contracts/upload-signed`
    - `[🧾 Anexar Comprovante]` -> Modal/Upload para `POST /api/v1/admin/financial/receipt`
    - `[✏️ Definir Valor da Taxa]` -> Modal de edição para `PUT /api/v1/admin/financial/license-taxes/{id}`
- [ ] `apps/web-app/src/frontend/src/pages/Admin/Financeiro/FinanceiroDashboard.jsx` & `LicenseTaxesPage.jsx`:
  - **4 KPIs Transparentes no Topo:**
    - Total Confirmado (Mapeado)
    - Recebido em Caixa
    - Em Levantamento Documental
    - Taxa de Regularidade (ex: 15/104) com barra de progresso visual.
  - **Barra de Chips de Filtro Rápido:**
    `[ 💎 Todas (104) | 🟢 100% Regularizadas (15) | 🟡 Aguardando Contrato (89) | 🧾 Aguardando Comprovante | 🔍 Por Ciclo/Data ]`
  - Conformidade estrita com paleta Luxury (`#0A3E60`, `#ED7E13`, touch targets >= 44x44px).

---

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Premium (Site/Frontend):** Build unificado de `apps/web-app` (`index.html` e `assets/`) sincronizado via `deploy-hostinger.ps1` / `deploy-pro.ps1`.
- **VPS Hostinger Dedicada (API/DB):** Controllers e Services PHP (`LicenseTaxService.php`, `Licenciada360Service.php`, etc.), Migrations SQL e execução de testes de fumaça CLI.

---

# 🔍 Monitoramento Semântico (Regression Watch)
- [ ] Rotas e arquivos críticos mapeados no `openspec/tracker/regression-watch.md`:
  - `GET /api/v1/admin/financial/license-taxes`
  - `GET /api/v1/admin/financial/dashboard`
  - `GET /api/v1/admin/licenciada-360/{id}`
  - `POST /api/v1/admin/contracts/upload-signed`
  - `POST /api/v1/admin/financial/receipt`
  - `PUT /api/v1/admin/financial/license-taxes/{id}`
- [ ] Critérios de aceitação:
  - Listagem das 104 licenciadas ativas sem erro SQL 1054 e sem duplicações.
  - Zero valores arbitrários injetados no frontend ou backend.
  - Testes de fumaça PHP CLI 100% PASS.

---

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Falha de compatibilidade com registros de taxas legadas que possuam referências nulas.
- **Mitigação:** `COALESCE` e `LEFT JOIN` defensivos com fallback seguro para valores nulos exibindo badge "Em Levantamento".
- **Rollback:** Restaurar versões anteriores dos controllers e services via Git (`git checkout HEAD~1 -- apps/web-app/src/backend/`).

---

# ✅ Checklist de Execução Atômica
- [ ] 1. Criar/Atualizar Contratos JSON em `openspec/contracts/`
- [ ] 2. Criar migration SQL `V154__saneamento_transicao_diagnostico.sql`
- [ ] 3. Ajustar `LicenseTaxService.php` e `Licenciada360Service.php` expurgando `l.cnpj`/`l.cidade` e valores hardcoded
- [ ] 4. Implementar endpoints de upload manual de contrato, comprovante e upsert de taxas
- [ ] 5. Implementar Dossiê 360º com modais de upload manual e badges de diagnóstico
- [ ] 6. Implementar KPIs de regularidade e chips de filtro em `FinanceiroDashboard.jsx` e `LicenseTaxesPage.jsx`
- [ ] 7. Executar testes de fumaça CLI (`financial_cockpit_smoke_test.php`, `license_taxes_smoke_test.php`, `licenciada_360_smoke_test.php`)
- [ ] 8. Executar build frontend Vite e sincronizar deploy
- [ ] 9. Validar HTTP 200 OK e integridade da base
