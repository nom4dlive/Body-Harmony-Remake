# PLAN-138 — Blindagem LGPD do Cockpit Financeiro

> **Protocolo:** Nexus V3.1 | **Status:** 🟡 PLANNING
> **Autor:** @antigravity | **Data:** 2026-08-26
> **Dependências:** PLAN-132 (Taxas), PLAN-133 (Cockpit Financeiro), PLAN-137 (Auto-Healing)
> **Adendo de Segurança ao PLAN-133**

---

# 🎯 Objetivo Fullstack

Blindar as 4 superfícies de exposição de dados sensíveis (CPF, CNPJ, endereço, comprovantes bancários) do módulo financeiro `/portal-gestor/financeiro` para conformidade com a LGPD:

1. **Anexos financeiros** salvos em pasta pública — mover para `private_uploads/`
2. **Exportação CSV** sem audit trail e vulnerável a injeção de fórmula
3. **Recibo WhatsApp** com texto ad-hoc em vez do template oficial compilado
4. **Seed/Sync** exposto como endpoint destrutivo sem restrição de superadmin

**Pergunta-guia respondida:** Se a URL de um comprovante vazar, um terceiro não autenticado consegue abrir o arquivo?
- **Estado atual:** SIM ❌ (salvo em `public_html/uploads/financial/`)
- **Estado após PLAN-138:** NÃO ✅ (salvo em `private_uploads/financial/` + download via HMAC signed URL com TTL)

---

# 📜 Contratos de API (REGRA 1)

- [ ] `openspec/contracts/admin/financial/admin_financial_attachments_upload.json` — ATUALIZAR
- [ ] `openspec/contracts/admin/financial/admin_financial_export.json` — ATUALIZAR
- [ ] `openspec/contracts/admin/financial/admin_financial_whatsapp_receipt.json` — ATUALIZAR
- [ ] `openspec/contracts/admin/financial/admin_financial_sync_all.json` — ATUALIZAR

---

# 🚫 Espaço Negativo (Fora de Escopo)

- [ ] Infraestrutura Docker/Traefik e restrição localhost do container MySQL (Imutável — REGRA 2)
- [ ] Dados de produção: nenhum dado movido, nenhuma migration executada neste passo
- [ ] Template HTML do recibo (`recibo-oficial-quitacao-padrao` V103): conteúdo inalterado
- [ ] Fluxo de assinatura digital de contratos (`sign.php`, `upload_signed.php`)
- [ ] Frontend pages fora do módulo financeiro

---

# 🗄️ Camada de Dados (SQL)

## V125_Financial_Audit_And_Security.sql

```sql
-- 1. Tabela de audit trail para exportações e operações sensíveis
CREATE TABLE IF NOT EXISTS `financial_audit_log` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT UNSIGNED NOT NULL,
  `admin_username` VARCHAR(100) NOT NULL,
  `action` ENUM('export_csv','sync_all','seed_historical','receipt_sent','attachment_upload','attachment_delete') NOT NULL,
  `filters_json` JSON NULL COMMENT 'Filtros aplicados no momento da ação',
  `records_affected` INT UNSIGNED NOT NULL DEFAULT 0,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_fal_admin` (`admin_id`),
  INDEX `idx_fal_action` (`action`),
  INDEX `idx_fal_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Migrar coluna file_url para path privado (coluna existente, sem ALTER - apenas uso diferente)
-- Os dados novos serão gravados com path relativo: 'financial/{hash}_{id}.{ext}'
-- A URL pública não será mais usada

-- 3. Adicionar coluna de HMAC download tracking
ALTER TABLE `financial_attachments`
  ADD COLUMN `download_count` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `mime_type`,
  ADD COLUMN `last_downloaded_at` DATETIME NULL AFTER `download_count`,
  ADD COLUMN `last_downloaded_by` INT UNSIGNED NULL AFTER `last_downloaded_at`;
```

---

# ⚙️ Camada de Backend (PHP 8.4)

## S-138.1: Anexos → `private_uploads/financial/` + HMAC Signed URL

### Arquivos Afetados
- `LicenseTaxController.php` → `uploadAttachment()` (L126-191)
- `LicenseTaxController.php` → NOVO `downloadAttachment(string $id)`
- `LicenseTaxService.php` → `addAttachment()` (L482-515)
- `LicenseTaxService.php` → NOVO `generateSignedDownloadUrl(int $attachmentId, int $ttl = 300)`
- `index.php` → NOVA rota `GET /admin/financial/attachments/{id}/download`

### Especificação

**Upload (reescrever `uploadAttachment`):**
```
1. Validar extensão: whitelist ['pdf', 'jpg', 'jpeg', 'png', 'webp']
2. Validar MIME real via finfo_open(): whitelist [
     'application/pdf', 'image/jpeg', 'image/png', 'image/webp'
   ]
3. Validar tamanho: max 10 MB (10485760 bytes)
4. Gerar nome seguro: bin2hex(random_bytes(16)) . '_' . $parentId . '.' . $ext
   (ZERO dados pessoais no nome do arquivo)
5. Destino: PRIVATE_UPLOADS_DIR . '/financial/' . $safeName
6. Criar diretório se inexistente + .htaccess "Deny from all"
7. Gravar em financial_attachments com file_url = 'financial/' . $safeName
   (path relativo ao private_uploads, não URL pública)
8. Registrar em financial_audit_log (action='attachment_upload')
```

**Download (novo endpoint):**
```
GET /api/v1/admin/financial/attachments/{id}/download?expires=X&signature=Y

1. Validar assinatura HMAC: hash_hmac('sha256', "$id:$expires", $secret)
2. Validar expiração: time() <= $expires
3. Resolver path: PRIVATE_UPLOADS_DIR . '/' . $row['file_url']
4. Validar existência do arquivo
5. Emitir headers: Content-Type, Content-Disposition: inline, Content-Length
6. Streaming via fread() em chunks de 8 KB
7. Incrementar download_count e last_downloaded_at/by
```

**Geração de URL assinada (novo método no Service):**
```php
public function generateSignedDownloadUrl(int $attachmentId, int $ttl = 300): string {
    $secret = getenv('APP_SECRET') ?: 'BodyHarmonySecretKey2026';
    $expires = time() + $ttl;
    $signature = hash_hmac('sha256', "$attachmentId:$expires", $secret);
    return "/api/v1/admin/financial/attachments/$attachmentId/download"
         . "?expires=$expires&signature=$signature";
}
```

**Padrão reutilizado de:** `stream.php` (L14-45), `ResourceService.php` (L16-44), `AdminLmsController::signUrl()` (L421-509)

---

## S-138.2: Exportação CSV — Audit Trail + Sanitização Anti-Fórmula

### Arquivos Afetados
- `LicenseTaxService.php` → `exportCsv()` (L596-628)
- `LicenseTaxController.php` → `export()` (L228-242)

### Especificação

**Sanitização de células CSV (novo helper privado):**
```php
private function sanitizeCsvCell(string $value): string {
    $dangerous = ['=', '+', '-', '@', "\t", "\r"];
    if (!empty($value) && in_array($value[0], $dangerous, true)) {
        return "'" . $value; // Prefixar com apóstrofo
    }
    return $value;
}
```

**Aplicar em cada campo de `fputcsv()`:**
```php
foreach ($data as $row) {
    fputcsv($output, array_map([$this, 'sanitizeCsvCell'], [
        (string)$row['id'],
        $row['licenciada_name'],
        $row['licenciada_cpf'] ?? '',
        // ... demais campos
    ]), ';', '"', "\\");
}
```

**Audit trail na exportação (no Controller):**
```php
public function export() {
    global $loggedUser;
    // ... gerar CSV ...
    $this->logAudit('export_csv', $loggedUser, $filters, $data['records_count']);
    Response::json(['success' => true, 'data' => $data]);
}
```

**Método `logAudit` compartilhado (novo no Controller ou Service):**
```php
private function logAudit(string $action, array $user, ?array $filters, int $recordsAffected): void {
    global $pdo, $db;
    $dbConn = $pdo ?? $db;
    try {
        $stmt = $dbConn->prepare("
            INSERT INTO financial_audit_log
            (admin_id, admin_username, action, filters_json, records_affected, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            (int)($user['id'] ?? 0),
            $user['username'] ?? 'unknown',
            $action,
            $filters ? json_encode($filters) : null,
            $recordsAffected,
            $_SERVER['REMOTE_ADDR'] ?? null,
            substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500)
        ]);
    } catch (\Throwable $e) {
        error_log("[FinancialAudit] logAudit error: " . $e->getMessage());
    }
}
```

---

## S-138.3: Recibo WhatsApp via Template Oficial Compilado

### Arquivos Afetados
- `LicenseTaxService.php` → `getWhatsAppReceiptMessage()` (L546-594) — REESCREVER
- `LicenseTaxController.php` → `getReceiptWhatsApp()` (L214-226) — ATUALIZAR

### Especificação

**Substituir texto ad-hoc por compilação do template `recibo-oficial-quitacao-padrao`:**

```php
public function getWhatsAppReceiptMessage(int $id): ?array {
    $tax = $this->getById($id);
    if (!$tax) return null;

    // 1. Resolver telefone (lógica existente preservada)
    $phone = $this->resolvePhone($tax);

    // 2. Compilar recibo via ContractPdfService + template oficial
    $pdfService = new \BodyHarmony\Services\ContractPdfService();
    
    // Template slug = 'recibo-oficial-quitacao-padrao' (V103, Categoria Recibos)
    $tplStmt = $this->db->prepare("SELECT content_html FROM contract_templates WHERE slug = ? LIMIT 1");
    $tplStmt->execute(['recibo-oficial-quitacao-padrao']);
    $templateHtml = $tplStmt->fetchColumn();

    if (!$templateHtml) {
        // Fallback: manter texto ad-hoc anterior
        return $this->getWhatsAppReceiptMessageLegacy($id, $tax, $phone);
    }

    // 3. Variáveis com dados da Licenciante hardcoded (REGRA 11)
    $variables = [
        'RECIBO_NUMERO'             => date('Y') . '/' . str_pad($tax['id'], 3, '0', STR_PAD_LEFT),
        'CIDADE_EMISSAO'            => 'Assis/SP',
        'DATA_EMISSAO_EXTENSO'      => $this->dataExtenso(),
        'PAGADOR_NOME_RAZAO'        => $tax['licenciada_name'] ?? 'Licenciada',
        'PAGADOR_CPF_CNPJ'          => $tax['licenciada_cpf'] ?? $tax['licenciada_cnpj'] ?? '',
        'PAGADOR_ENDERECO'          => $tax['licenciada_location'] ?? '',
        'VALOR_TOTAL_NUM'           => $this->formatCurrency((int)$tax['valor_cents']),
        'VALOR_TOTAL_EXTENSO'       => $tax['valor_extenso'] ?? '',
        'FORMA_PAGAMENTO_DESCRICAO' => ucfirst($tax['payment_method'] ?? 'PIX'),
        'DESCRICAO_SERVICOS_TAXAS'  => 'Taxa de Licenciamento Body Harmony®',
        'EMISSOR_NOME_RAZAO'        => 'BODY HARMONY ELETROESTIMULAÇÃO LTDA.',
        'EMISSOR_CPF_CNPJ'          => '68.016.506/0001-22'
    ];

    $renderedHtml = $pdfService->renderTemplate($templateHtml, $variables);

    // 4. Gerar texto limpo para WhatsApp (strip HTML)
    $plainText = $this->htmlToWhatsAppText($renderedHtml);

    // 5. Registrar envio no audit log
    $this->logAudit('receipt_sent', $tax['id']);

    $waUrl = "https://wa.me/{$phone}?text=" . rawurlencode($plainText);

    return [
        'phone'           => $phone,
        'licenciada_name' => $tax['licenciada_name'] ?? '',
        'valor_display'   => $this->formatCurrency((int)$tax['valor_cents']),
        'message'         => $plainText,
        'whatsapp_url'    => $waUrl,
        'receipt_number'  => $variables['RECIBO_NUMERO'],
        'rendered_html'   => $renderedHtml  // Para preview no modal do frontend
    ];
}
```

---

## S-138.4: Seed/Sync — Restrição Superadmin + Confirmação

### Arquivos Afetados
- `LicenseTaxController.php` → `seedHistorical()` (L96-112), `syncAll()` (L114-125)
- `LicenseTaxService.php` → `syncAll()` (L431-480)
- `index.php` → Rotas `POST /seed` e `POST /sync-all`

### Especificação

**Restrição de Acesso (no Controller):**
```php
public function seedHistorical() {
    // Gate: somente superadmin
    global $loggedUser;
    if (!$loggedUser || $loggedUser['role'] !== 'superadmin') {
        Response::error('Operação restrita a Superadmins.', 403);
        return;
    }

    // Gate: confirmação explícita
    $input = json_decode(file_get_contents('php://input'), true);
    if (($input['confirm'] ?? '') !== 'CONFIRMAR_SEED_PRODUCAO') {
        Response::error('Confirmação explícita obrigatória. Envie {"confirm":"CONFIRMAR_SEED_PRODUCAO"}.', 400);
        return;
    }

    // Executar + audit
    $inserted = $this->service->seedHistorical();
    $this->logAudit('seed_historical', $loggedUser, null, $inserted);
    Response::json(['success' => true, 'data' => ['inserted' => $inserted]]);
}
```

**Algoritmo determinístico de pareamento contracts → taxas (no `syncAll`):**
```
1. Normalizar CPF/CNPJ: preg_replace('/\D/', '', $value)
2. Query: SELECT c.*, cs_lic.signer_name FROM contracts c
          JOIN contract_signatures cs_lic ON c.uuid = cs_lic.contract_uuid AND cs_lic.signer_type = 'LICENCIADA'
          JOIN contract_signatures cs_lct ON c.uuid = cs_lct.contract_uuid AND cs_lct.signer_type = 'LICENCIANTE'
          WHERE c.status = 'SIGNED'
          AND c.category = 'Licenciamento'
   (REGRA 10: somente contratos com AMBAS assinaturas)
3. Para cada contrato: normalizar CPF/CNPJ extraído das variables_json
4. Match por CPF normalizado contra licenciada_taxas.licenciada_cpf normalizado
5. Se match: vincular licenciada_id, atualizar contract_uuid, marcar status = 'contract_signed'
```

---

# ⚛️ Camada de Interface (React V3.1)

### S-138.5: Frontend — URLs assinadas para anexos

**Arquivo:** `FinanceiroDashboard.jsx`

**Mudanças:**
1. Substituir links diretos `/uploads/financial/xxx.pdf` por chamada ao endpoint que gera URL assinada:
   ```javascript
   const handleViewAttachment = async (attachmentId) => {
     const res = await licenseTaxesApi.getSignedUrl(attachmentId);
     window.open(res.data.signed_url, '_blank');
   };
   ```
2. Adicionar confirmação no botão "⚡ Sincronizar Histórico" para superadmin:
   ```javascript
   const handleSyncAll = async () => {
     if (!window.confirm('⚠️ Esta operação é destrutiva. Confirmar sincronização?')) return;
     // ... rest
   };
   ```

**Arquivo:** `api.js`
- Adicionar `licenseTaxesApi.getSignedUrl(attachmentId)`
- Atualizar `licenseTaxesApi.seedHistorical({ confirm: 'CONFIRMAR_SEED_PRODUCAO' })`

---

# 🛡️ RBAC: Nova Permissão `financial_manage`

### Arquivos Afetados
- `RbacService.php` → defaults (L200-320)
- `usePermissions.js` → fallback (L47-49)

### Especificação

**Backend — Adicionar ao array de defaults:**
```php
// Superadmin (L215): adicionar
'financial_manage' => true

// Non-superadmin default (L266): adicionar
'financial_manage' => false

// Legacy mapping (L317): adicionar
'financial_manage' => $financial === 'manage'
```

**Frontend — Uso no FinanceiroDashboard:**
```javascript
// Botões de escrita (upload, sync, seed, criar, editar, deletar) visíveis somente se:
const { canAction } = usePermissions();
const canManage = canAction('financial_manage');
```

---

# 🚀 Roteamento do Deploy Híbrido

- **Hostinger Premium (Frontend):** Build SPA atualizado com novo fluxo de download assinado
- **Hostinger Premium (Backend API):** Controllers, Services, migration V125, `.htaccess` em `private_uploads/financial/`

---

# 🔍 Monitoramento Semântico (Regression Watch)

- [ ] Rota `POST /upload` continua operacional mas salva em `private_uploads/`
- [ ] Rota `GET /export` continua gerando CSV mas com sanitização
- [ ] Rota `GET /{id}/receipt-whatsapp` retorna template compilado
- [ ] Rota `POST /sync-all` rejeita não-superadmins com 403
- [ ] Rota `POST /seed` exige `{"confirm":"CONFIRMAR_SEED_PRODUCAO"}`
- [ ] URLs diretas para `/uploads/financial/*.pdf` retornam 404 (pasta vazia/removida)
- [ ] URLs expiradas retornam HTTP 410
- [ ] Assinaturas inválidas retornam HTTP 403

---

# 🛡️ Matriz de Risco & Rollback

| Risco | Mitigação | Rollback |
|---|---|---|
| Anexos existentes em `public_html/uploads/financial/` ficam inacessíveis | Mover fisicamente durante deploy ou manter fallback de leitura no endpoint | Reverter path no controller para `public_html/` |
| Template de recibo ausente no banco (ambiente limpo) | Fallback gracioso para texto ad-hoc legado | Restaurar método `getWhatsAppReceiptMessageLegacy()` |
| `seedHistorical` travado por confirmação | Superadmin envia payload com `confirm` correto | Remover gate de confirmação |
| Expiração HMAC muito curta | TTL padrão de 300s (5min); configurável | Aumentar TTL |

---

# ✅ Checklist de Execução Atômica

- [ ] D-138.1: Atualizar 4 contratos JSON em `openspec/contracts/admin/financial/`
- [ ] D-138.2: Criar migration `V125_Financial_Audit_And_Security.sql`
- [ ] D-138.3: Criar `.htaccess` em `private_uploads/financial/` com `Deny from all`
- [ ] D-138.4: Reescrever `uploadAttachment()` para salvar em `private_uploads/`
- [ ] D-138.5: Criar endpoint `GET /attachments/{id}/download` com HMAC
- [ ] D-138.6: Adicionar `sanitizeCsvCell()` e audit trail ao `exportCsv()`
- [ ] D-138.7: Reescrever `getWhatsAppReceiptMessage()` com template compilado + REGRA 11
- [ ] D-138.8: Adicionar gate superadmin + confirmação ao `seedHistorical()` e `syncAll()`
- [ ] D-138.9: Adicionar `financial_manage` ao RBAC (backend + frontend)
- [ ] D-138.10: Atualizar `FinanceiroDashboard.jsx` para URLs assinadas + confirmação sync
- [ ] D-138.11: Build, smoke test (CLI mocks), regression watch
- [ ] D-138.12: Deploy via `deploy-hostinger.ps1` (REGRA 22)
