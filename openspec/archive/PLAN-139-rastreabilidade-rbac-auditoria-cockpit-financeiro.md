# 🎯 Objetivo Fullstack

Implementar a camada definitiva de **Rastreabilidade Forense, RBAC em Tripla Camada (REGRA 17)** e **Testes Automatizados de Isolamento (REGRA 6)** para o Cockpit Financeiro Body Harmony (`/portal-gestor/financeiro`).

Garantir que:
1. Nenhuma ação financeira (leitura, edição, upload, exclusão, sincronização, exportação ou envio de recibo) ocorra sem identificação inequívoca de autoria (`admin_id`, `u.username` conforme REGRA 12, IP, timestamp e diff de dados).
2. O acesso seja controlado pela matriz RBAC com segregação clara entre visualização (`financial_view`), operação/gestão (`financial_manage`) e exportação de dados sensíveis (`financial_export`).
3. Todos os comportamentos críticos sejam auditáveis e cobertos por suite de testes de fumaça CLI (`tests/financial_cockpit_smoke_test.php`) 100% isolada e compatível com a REGRA 6.

---

# 📜 Contratos de API (REGRA 1)

- [ ] `openspec/contracts/admin/financial/admin_financial_audit.json` — Novo contrato de auditoria e listagem de logs
- [ ] `openspec/contracts/admin/financial/admin_financial_export.json` — Validação de permissão `financial_export` e registro de audit trail
- [ ] `openspec/contracts/admin/financial/admin_financial_sync_all.json` — Validação de permissão `financial_manage` + superadmin + confirmação
- [ ] `openspec/contracts/admin/financial/admin_financial_attachments_upload.json` — Validação de permissão `financial_manage` + log de anexo

---

# 🚫 Espaço Negativo (Fora de Escopo)

- [ ] Modificação de telas públicas da vitrine `/shop` ou `/portal-licenciada`
- [ ] Alteração na infraestrutura física Docker/Traefik e restrição de loopback `127.0.0.1:3306` (REGRA 2)
- [ ] Execução de queries destrutivas não versionadas em produção
- [ ] Reescrever layouts visuais do React neste passo (apenas inclusão de guards e hooks de permissão)

---

# 🗄️ Camada de Dados (SQL)

- [ ] **Migration V125_Financial_Audit_And_Security.sql**:
  1. Criação da tabela `financial_audit_log` para trilha forense:
     - `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`
     - `admin_id INT UNSIGNED NOT NULL`
     - `admin_username VARCHAR(100) NOT NULL` (REGRA 12: mapeado de `admin_users.username`)
     - `action ENUM('tax_create', 'tax_update', 'tax_delete', 'export_csv', 'sync_all', 'seed_historical', 'receipt_sent', 'attachment_upload', 'attachment_delete') NOT NULL`
     - `target_id INT UNSIGNED NULL`
     - `diff_json JSON NULL` (contendo payload_before e payload_after)
     - `filters_json JSON NULL`
     - `records_affected INT UNSIGNED NOT NULL DEFAULT 0`
     - `ip_address VARCHAR(45) NULL`
     - `user_agent VARCHAR(500) NULL`
     - `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
  2. Adição de colunas de governança de downloads na tabela `financial_attachments`:
     - `download_count INT UNSIGNED NOT NULL DEFAULT 0`
     - `last_downloaded_at DATETIME NULL`
     - `last_downloaded_by INT UNSIGNED NULL`

---

# ⚙️ Camada de Backend (PHP 8.4)

- [ ] **RBAC Service (`RbacService.php`)**:
  - Registrar as 3 permissões canônicas financeiras:
    - `financial_view`: Acesso à leitura do painel, KPIs, listagem de taxas, dossiê e consulta de anexos.
    - `financial_manage`: Mutação de dados (criar taxa manual, editar valor/status, excluir, upload de comprovantes, disparo de recibos, sync com onboarding/contratos).
    - `financial_export`: Exportação de relatórios tabulares em CSV/Excel e dados contábeis com LGPD.
  - Atualizar os 3 caminhos de resolução: Superadmin (todas `true`), Structured JSON (com `array_merge` e defaults seguros `false`), e Legacy Mapping.

- [ ] **LicenseTaxService (`LicenseTaxService.php`)**:
  - Integrar método `logAudit(string $action, ?int $targetId, ?array $before, ?array $after, ?array $filters, int $recordsAffected)` utilizando `admin_users.username` (REGRA 12).
  - Bloqueio de mutação de valor e dados críticos quando status for `contract_signed` ou `paid` (imutabilidade pós-quitação jurídica — salvaguarda de auditoria).
  - Sanitização de células CSV anti-fórmula em `exportCsv()` (prefixando `=`, `+`, `-`, `@`, `\t`, `\r` com apóstrofo `'`).
  - Algoritmo determinístico de pareamento em `syncAll()` com normalização de CPF/CNPJ (`preg_replace('/\D/', '', ...)`) e validação de assinatura bidirecional (REGRA 10).

- [ ] **LicenseTaxController (`LicenseTaxController.php`)**:
  - Checagem granular de permissões nos métodos receptores:
    - `list()`, `getSummary()`, `getById()`, `getAttachments()`: exigem `financial_view`.
    - `create()`, `update()`, `delete()`, `uploadAttachment()`, `deleteAttachment()`, `getReceiptWhatsApp()`: exigem `financial_manage`.
    - `export()`: exige `financial_export` ou `financial_view`.
    - `seedHistorical()`, `syncAll()`: exigem `role === 'superadmin'` + `financial_manage` + confirmação explícita de payload.

- [ ] **Onboarding Hook (`OnboardingService.php`)**:
  - Validar e isolar a chamada de ativação da licenciada no estágio `ATIVO_LIBERADO`:
    ```php
    try {
        require_once __DIR__ . '/LicenseTaxService.php';
        $taxService = new \BodyHarmony\Services\LicenseTaxService($this->db);
        $taxService->syncFromOnboarding($requestId, $licenciadaId);
    } catch (\Throwable $taxErr) {
        error_log("[OnboardingService] LicenseTax sync error (non-blocking): " . $taxErr->getMessage());
    }
    ```
  - Confirmação do campo real: `taxa_inicial_num` (e `taxa_inicial_extenso`, `condicoes_pagamento`), sem código morto.

---

# ⚛️ Camada de Interface (React V3.1)

- [ ] **Guarda de Rotas e App Routing (`App.jsx`)**:
  - Garantir envelopamento das 4 rotas financeiras com `<PermissionRouteGuard page="financial_view">`:
    - `/portal-gestor/financeiro`
    - `/portal-gestor/financeiro/transacoes`
    - `/portal-gestor/financeiro/fechamento`
    - `/portal-gestor/financeiro/centros-custo`
- [ ] **Hook de Permissões (`usePermissions.js`)**:
  - Adicionar suporte a `canPerform('financial_manage')` e `canPerform('financial_export')` com fallback defensivo para administradores de hierarquia $\le 2$.
- [ ] **Sidebar & Quick Actions (`AdminLayout.jsx`)**:
  - Ocultação visual reativa do item "Financeiro" caso `!canAccessPage('financial_view')`.
  - Controle de visibilidade de botões operacionais (Upload, Sincronizar, Editar, Excluir) condicionado a `canPerform('financial_manage')`.

---

# 🚀 Roteamento do Deploy Híbrido

- **Hostinger Premium (Site/Frontend):** Build SPA sincronizado via `deploy-hostinger.ps1` (REGRA 22).
- **VPS Hostinger Dedicada (API/DB):** Migrations SQL V125 aplicadas via `/admin/nexus/migrations`, services PHP atualizados e diretório `private_uploads/financial/` blindado com `.htaccess`.

---

# 🔍 Monitoramento Semântico (Regression Watch)

Registrar no arquivo `openspec/tracker/regression-watch.md`:

| Watchpoint | Descrição da Validação Crítica | Critério de Aceitação |
| :--- | :--- | :--- |
| **WP-21 (KPI Consistency)** | Soma exata de `valor_cents` no resumo financeiro | `summary.total_contracted_cents` deve ser exatamente igual à soma de todos os registros retornados na listagem de taxas. |
| **WP-22 (No Tax Duplicates)** | Idempotência de ingestão de taxas | Executar `seedHistorical()` ou `syncAll()` múltiplas vezes deve manter rigorosamente a mesma contagem de registros (zero duplicatas). |
| **WP-23 (Attachment Shield)** | Blindagem de arquivos de comprovantes fora da web pública | Comprovantes gravados em `private_uploads/financial/` com `.htaccess` `Deny from all`; acesso direto HTTP retorna 403 Forbidden; download somente via HMAC assinado. |
| **WP-24 (Onboarding Isolation)** | Resiliência do hook `ATIVO_LIBERADO` | Falha na criação da taxa não impede a ativação da licenciada e a emissão da mensagem de boas-vindas. |

---

# 🛡️ Matriz de Risco & Rollback

- **Risco:** Administradores legados perderem acesso a botões de ação se não possuírem permissão granular configurada.
  - **Mitigação:** Fallback transparente em `usePermissions.js` e `RbacService.php` atribuindo `financial_manage` e `financial_export` para administradores com `hierarchy_level <= 2`.
- **Rollback:** Restaurar versões anteriores de `RbacService.php` e `LicenseTaxController.php` mantendo os registros de auditoria existentes intactos.

---

# 🧪 Suite de Testes de Fumaça (Smoke Test — REGRA 6)

- [ ] **Arquivo:** `tests/financial_cockpit_smoke_test.php`
- **Diretrizes Estritas (REGRA 6):**
  - Invocação exclusiva de classes de serviço (`BodyHarmony\Services\LicenseTaxService`, `RbacService`) e helpers puros.
  - Nenhum controlador HTTP ou arquivo com `auth_check.php` / headers globais pode ser incluído no script de teste CLI.
  - Mock de conexão PDO em memória (ou classe simulada) suportando transações, consultas preparadas e queries de agregação.
- **Cobertura Obrigatória:**
  1. Criação idempotente de taxa de licenciamento via `create()` e `syncFromOnboarding()`.
  2. Seed idempotente dos 13 registros históricos (execução 1x e 2x gerando mesmo count final).
  3. Bloqueio de edição pós-assinatura/quitação (tentativa de alteração de valor em taxa `paid`/`contract_signed` bloqueada ou registrada com alerta).
  4. Cálculo matemático exato do KPI de resumo (`getSummary()`).
  5. Trilha forense de auditoria (`logAudit()` persistindo `diff_json`, `admin_id` e `username`).
  6. Sanitização anti-fórmula em células de exportação CSV.

---

# ❓ Resposta à Pergunta-Guia

> **Pergunta:** Daqui a 6 meses, em uma disputa, é possível provar quem alterou o valor de uma taxa e quando?

**Resposta Técnica Comprovada:**
**SIM, categoricamente.**
Toda alteração de registro financeiro passa por `LicenseTaxService::update()`, que antes de executar o `UPDATE` no MySQL:
1. Captura o estado anterior (`payload_before`) via `SELECT`.
2. Calcula o diff exato dos campos modificados (ex: `{"valor_cents": {"before": 600000, "after": 700000}}`).
3. Grava um registro imutável na tabela `financial_audit_log` contendo:
   - `admin_id`: ID numérico do operador no `admin_users`.
   - `admin_username`: Username textual do operador (conforme REGRA 12).
   - `action`: `'tax_update'`.
   - `target_id`: ID da taxa alterada.
   - `diff_json`: JSON estruturado do diff antes/depois.
   - `ip_address`: Endereço IP do cliente.
   - `user_agent`: String de identificação do navegador/dispositivo.
   - `created_at`: Carimbo de data/hora oficial do servidor.

---

# ✅ Checklist de Execução Atômica

- [ ] 1. Criar contrato JSON de auditoria em `openspec/contracts/admin/financial/admin_financial_audit.json`
- [ ] 2. Criar migration `V125_Financial_Audit_And_Security.sql` com schema da tabela `financial_audit_log`
- [ ] 3. Atualizar `RbacService.php` com as permissões `financial_view`, `financial_manage`, `financial_export`
- [ ] 4. Atualizar `LicenseTaxService.php` com método de auditoria, diff logging, bloqueio pós-quitação e sanitização CSV
- [ ] 5. Atualizar `LicenseTaxController.php` com checagens granulares de permissão RBAC e proteção superadmin
- [ ] 6. Atualizar `usePermissions.js` e `AdminLayout.jsx` com suporte às novas ações
- [ ] 7. Criar suite de testes `tests/financial_cockpit_smoke_test.php` (REGRA 6) e executar localmente até 100% PASS
- [ ] 8. Atualizar os watchpoints WP-21 a WP-24 em `openspec/tracker/regression-watch.md`
