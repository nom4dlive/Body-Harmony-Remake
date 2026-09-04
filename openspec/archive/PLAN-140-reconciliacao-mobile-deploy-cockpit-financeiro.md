# 🎯 Objetivo Fullstack

Consolidar, polir para mobile (iPhone 390–440px) e implantar em produção o **Cockpit Financeiro Unificado Body Harmony (`/portal-gestor/financeiro`)**, resolvendo a duplicidade de interfaces (PLAN-132 vs PLAN-133), estabelecendo paridade 100% no cliente de API (REGRA 24), garantindo usabilidade mobile de alto padrão (REGRA 3) e executando o deploy híbrido seguro com plano de rollback explícito (REGRA 5 e REGRA 22).

---

# 📜 Contratos de API (REGRA 1)

- [ ] `openspec/contracts/admin/financial/admin_financial_license_taxes.json` — Validado
- [ ] `openspec/contracts/admin/financial/admin_financial_dashboard.json` — Validado
- [ ] `openspec/contracts/admin/financial/admin_financial_transactions.json` — Validado
- [ ] `openspec/contracts/admin/financial/admin_financial_attachments_upload.json` — Validado (PLAN-138)
- [ ] `openspec/contracts/admin/financial/admin_financial_export.json` — Validado (PLAN-138)
- [ ] `openspec/contracts/admin/financial/admin_financial_whatsapp_receipt.json` — Validado (PLAN-138)
- [ ] `openspec/contracts/admin/financial/admin_financial_sync_all.json` — Validado (PLAN-138)
- [ ] `openspec/contracts/admin/financial/admin_financial_audit.json` — Validado (PLAN-139)

---

# 🚫 Espaço Negativo (Fora de Escopo)

- [ ] Nenhuma alteração no schema ou backend PHP adicional (backend já concluído no PLAN-139)
- [ ] Infraestrutura física Docker/Traefik e restrição de loopback `127.0.0.1:3306` (REGRA 2)
- [ ] Módulos fora do financeiro (LMS, Agenda, Shop, Contratos)
- [ ] Modificação de chaves SSH ou credenciais de produção

---

# 🗺️ Fase 1: Reconciliação do Hub de Abas Único (P4)

### 1.1 Unificação da Interface no Hub de Abas
- **Decisão:** `FinanceiroDashboard.jsx` é a **ÚNICA** superfície do Gestor Financeiro.
- **Integração:** O conteúdo operacional de `LicenseTaxesPage.jsx` vira o componente da **Aba 2 ("Taxas & Contratos")** do Hub.
- **Redirecionamento Defensivo (REGRA 18):**
  - Rota legada `/portal-gestor/financeiro/taxas-licenciamento` em `App.jsx` passa a redirecionar defensivamente:
    `<Route path="/portal-gestor/financeiro/taxas-licenciamento" element={<Navigate to="/portal-gestor/financeiro?tab=taxas" replace />} />`
- **Navegação Sidebar:**
  - O item "Financeiro" no `AdminLayout.jsx` aponta unicamente para `/portal-gestor/financeiro`. O suporte a `?tab=taxas` via URL search params permite abertura direta da aba desejada.

### 1.2 Paridade e Blindagem do Cliente API (REGRA 14 & REGRA 24)
- **Arquivo:** `src/services/api.js`
- Garantir que todos os métodos invocados no Hub existam no cliente `api` com tratamento transparente de Bearer token e sessão:
  - `licenseTaxesApi.list(filters)`
  - `licenseTaxesApi.getSummary(filters)`
  - `licenseTaxesApi.getById(id)`
  - `licenseTaxesApi.create(data)`
  - `licenseTaxesApi.update(id, data)`
  - `licenseTaxesApi.delete(id)`
  - `licenseTaxesApi.seedHistorical(payload)`
  - `licenseTaxesApi.syncAll(payload)`
  - `licenseTaxesApi.uploadAttachment(formData)`
  - `licenseTaxesApi.getAttachments(id, parentType)`
  - `licenseTaxesApi.deleteAttachment(attachId)`
  - `licenseTaxesApi.getSignedUrl(attachId)`
  - `licenseTaxesApi.getReceiptWhatsApp(id)`
  - `licenseTaxesApi.exportCsv(filters)`
  - `licenseTaxesApi.getAuditLogs(filters)`
- **Proibição Estrita:** Zero chamadas `fetch()` diretas desprotegidas no frontend React.

### 1.3 Barra de Ações Rápidas
- Cada botão (`+ Novo Lançamento`, `+ Nova Taxa`, `⚡ Sincronizar Histórico`, `📥 Exportar Relatório`) deve dispor de:
  - Estados reativos: `idle`, `loading` (spinner discreto), `error`, `success`.
  - Toast Luxury informativo com feedback acionável.
  - Nenhum botão na interface sem handler atribuído.

---

# 📱 Fase 2: Mobile UX & Matriz de Teste de Botões (P5)

### 2.1 Ergonomia Mobile (iPhone 390–440px — REGRA 3)
- **Tabela Responsiva:**
  - Em telas $\le 768$px, colapso para visualização em Cards ou container com scroll horizontal suave dourado (`min-width: 850px`).
  - Uso de `min-w-0 truncate break-words` para evitar overflow horizontal por e-mails ou nomes longos.
- **Grade de KPIs:**
  - Layout adaptativo: 4 colunas em desktop $\to$ grade 2x2 em tablets $\to$ grade 2x2 compacta em mobile (390px).
- **Alvos de Toque:**
  - Todos os botões, abas e ícones com dimensões mínimas $\ge 44\times 44$px.
- **Sanitização de Marcação (REGRA 7 & REGRA 25):**
  - Aplicação de `renderRichText()` ou strip defensivo contra tags cruas `{{...}}` e `\n` em recibos, dossiês e modais.

### 2.2 Matriz de Teste de Botões e CTAs

| # | Aba | Botão / CTA | Permissão | Estado Inicial | Ação Esperada | Casos de Borda Testados |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **B-01** | Header | `+ Nova Taxa` | `financial_manage` | Ativo | Abre modal de cadastro de taxa | Permissão negada $\to$ Toast alerta; campos vazios $\to$ validação inline |
| **B-02** | Header | `⚡ Sincronizar Histórico` | `financial_manage` (Superadmin) | Ativo | Dispara modal de confirmação e sincroniza | Não-superadmin $\to$ 403 Forbidden; confirmação cancelada $\to$ aborta |
| **B-03** | Header | `📥 Exportar Relatório` | `financial_export` | Ativo | Baixa arquivo CSV sanitizado | Lista vazia $\to$ aviso; caracteres `=+\-@` $\to$ prefixados com `'` |
| **B-04** | Aba 1 (Overview) | `Ver Dossiê Completo` | `financial_view` | Ativo | Abre gaveta/modal de detalhes da taxa | Registro inexistente $\to$ Toast 404 |
| **B-05** | Aba 2 (Taxas) | `Filtrar por Status / Método` | `financial_view` | Padrão: Todos | Atualiza listagem e KPIs dinamicamente | Filtro sem retorno $\to$ Empty State amigável |
| **B-06** | Aba 2 (Taxas) | `Editar Taxa (Ícone Lápis)` | `financial_manage` | Ativo | Abre modal de edição pré-preenchido | Taxa `paid` $\to$ bloqueia alteração de valor para não-superadmin |
| **B-07** | Aba 2 (Taxas) | `Excluir Taxa (Ícone Lixeira)` | `financial_manage` | Ativo | Pede confirmação e remove registro | Taxa com contrato `contract_signed` $\to$ bloqueia exclusão |
| **B-08** | Aba 2 (Taxas) | `Anexar Comprovante (Ícone Clips)` | `financial_manage` | Ativo | Abre modal de upload multipart | Arquivo > 10MB ou extensão inválida $\to$ rejeição imediata |
| **B-09** | Aba 2 (Taxas) | `Enviar Recibo WhatsApp` | `financial_manage` | Ativo | Compila recibo e abre link wa.me | Telefone sem DDI $\to$ auto-normalização `55...` |
| **B-10** | Aba 3 (Transações) | `+ Nova Transação` | `financial_manage` | Ativo | Registra lançamento avulso | Valor 0 ou negativo $\to$ bloqueio de validação |
| **B-11** | Aba 4 (Comprovantes) | `Baixar / Visualizar Anexo` | `financial_view` | Ativo | Gera URL assinada HMAC e abre em nova aba | URL expirada $\to$ HTTP 410; assinatura inválida $\to$ HTTP 403 |
| **B-12** | Aba 5 (DRE) | `Exportar DRE Contábil` | `financial_export` | Ativo | Exporta demonstrativo de resultados | Período sem transações $\to$ DRE zerado com feedback |

---

# 🚀 Fase 3: Deploy Híbrido, Rollback Explícito & Governança (P6)

### 3.1 Sequência Obrigatória de Deploy
1. **Pré-Gate de Verificação:**
   - `php tests/financial_cockpit_smoke_test.php` $\to$ **100% PASS (23/23)**.
   - `php tests/license_taxes_smoke_test.php` $\to$ **100% PASS (21/21)**.
   - Validação de integridade dos 8 contratos JSON em `openspec/contracts/admin/financial/`.
2. **Build do Frontend:**
   - Executar `npm run build:hostinger` em `apps/web-app/`.
   - Unificar diretórios de build entre `build/public_html` e `apps/web-app/build/public_html` (REGRA 22).
3. **Execução de Migrations:**
   - Aplicar V123, V124 e V125 via rota autenticada `/api/v1/admin/nexus/migrations` (Superadmin).
4. **Sincronização de Deploy Hostinger:**
   - Executar `Operations/deploy-hostinger.ps1` para sincronização completa de assets e backend PHP na Hostinger Web Hosting (`45.152.44.244`).
5. **Verificação em Produção (Gate de Aceite):**
   - `GET /api/v1/ping` $\to$ 200 OK.
   - Acesso a `/portal-gestor/financeiro` autenticado como gestor:
     - Conferência dos KPIs: Total contratado base = R$ 72.400,00 (10 assinados R$ 66.100 + 1 pago R$ 6.300 Francisnara + 2 pendentes).
     - Teste de upload de anexo e confirmação de bloqueio 403/404 em download direto sem URL assinada.
     - Teste do redirecionamento da rota antiga `/portal-gestor/financeiro/taxas-licenciamento`.
6. **Fechamento de Governança:**
   - Atualização do `CHANGELOG.md`.
   - Atestar os watchpoints WP-21 a WP-24 no `openspec/tracker/regression-watch.md`.
   - Arquivar deltas via `/archive`.

---

# 🛡️ Matriz de Risco & Plano de Rollback Explícito (REGRA 5)

| Componente | Procedimento de Rollback | Validação Pós-Rollback |
| :--- | :--- | :--- |
| **Frontend (SPA)** | Restaurar cópia de segurança do `index.html` e `assets/` anterior no diretório `public_html/` | Acesso à URL principal carrega a versão estável anterior sem telas brancas |
| **Migrations (Banco)** | Executar script de reversão: `DROP TABLE IF EXISTS financial_audit_log; ALTER TABLE financial_attachments DROP COLUMN download_count...;` | `SHOW TABLES;` confirma integridade das tabelas centrais do schema |
| **Rotas Backend** | Reverter arquivo `api/v1/index.php` para o commit anterior | Smoke test executado atesta 100% de integridade das rotas base |

---

# ❓ Resposta à Pergunta-Guia Final

> **Pergunta:** Cada número que a Josi vê no cockpit tem uma linha de banco que o sustenta, um contrato que o define e um log dizendo quem o criou?

**Resposta:**
**SIM, integralmente.**
1. **Banco:** Cada valor exibido em KPIs deriva diretamente de queries de agregação `SUM(valor_cents)` e `COUNT(*)` sobre as tabelas `licenciada_taxas` e `financial_transactions`.
2. **Contrato:** As respostas de API seguem com 100% de simetria os contratos JSON em `openspec/contracts/admin/financial/`.
3. **Log de Autoria:** Todas as mutações e inserções estão registradas na tabela `financial_audit_log` com `admin_id`, `admin_username` (REGRA 12), `diff_json`, IP e timestamp.

---

# ✅ Checklist de Execução Atômica

- [ ] 1. Integrar conteúdo de `LicenseTaxesPage.jsx` na Aba 2 de `FinanceiroDashboard.jsx`
- [ ] 2. Configurar redirecionamento defensivo da rota antiga em `App.jsx`
- [ ] 3. Validar e completar métodos do cliente `api.js` (paridade 100%, zero fetch solto)
- [ ] 4. Ajustar ergonomia mobile (iPhone 390px, grid 2x2, touch targets $\ge 44$px)
- [ ] 5. Executar build local e unificar diretórios `build/public_html`
- [ ] 6. Rodar suite de smoke tests CLI (23/23 PASS)
- [ ] 7. Executar deploy para Hostinger via `deploy-hostinger.ps1`
- [ ] 8. Validar produção (ping 200, KPIs reais, HMAC download, rota antiga redirecionada)
- [ ] 9. Atualizar `CHANGELOG.md` e arquivar deltas
