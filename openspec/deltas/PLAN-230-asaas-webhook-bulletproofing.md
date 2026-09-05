# PLAN-230: Blindagem Definitiva de Webhooks e Pagamentos Asaas (HTTP 405 Fix)

## [OBJETIVO]
Registrar e blindar as rotas de webhook do Asaas (`/payments/webhook/asaas`) no roteador central PHP (`api/v1/index.php`), adicionar tratamento nativo a requisições GET/POST/OPTIONS e blindar o repasse de headers HTTP (`asaas-access-token`) para eliminar o erro HTTP 405 Not Allowed.

## [ESPAÇO NEGATIVO]
- NÃO alterar schemas das tabelas `congress_registrations` ou `shop_orders`.
- NÃO modificar gateway de pagamento de outros provedores (Stone/Pix direto).

## [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Step 1**: Registrar as rotas `/payments/webhook/asaas` (POST, GET, OPTIONS) e aliases no roteador central `apps/web-app/src/backend/api/v1/index.php`.
- [ ] **Step 2**: Atualizar `AsaasWebhookController.php` com suporte a pings de verificação GET (`200 OK`) e validação resiliente de token/payload.
- [ ] **Step 3**: Atualizar `apps/web-app/src/backend/api/v1/.htaccess` e `.htaccess.remote` para capturar e preservar o header `asaas-access-token` e tratar rotas `/api/` sem dar fallback para `index.html`.
- [ ] **Step 4**: Criar teste de fumaça unitário `tests/asaas_webhook_resilience_smoke_test.php` para validar simulação de eventos em tempo real.
- [ ] **Step 5**: Executar `nexus_gate.ps1` e publicar via `/deploy` com validação HTTP 200 ao vivo.

## [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `openspec/contracts/payments/asaas-webhook.json`
- `apps/web-app/src/backend/api/v1/index.php`
- `apps/web-app/src/backend/api/v1/Controllers/AsaasWebhookController.php`
- `apps/web-app/src/backend/api/v1/.htaccess`
- `scripts/deploy/.htaccess.remote`
- `tests/asaas_webhook_resilience_smoke_test.php`
