# 🎯 Objetivo Fullstack (ARQUIVADO - CONCLUÍDO)
Implementação e integração da Loja Virtual Body Harmony (`/loja` e `/loja/checkout/:productId`) no monólito `apps/web-app`, conectada à **API de Pagamentos Stone Online 4.0** (Cartão de Crédito e PIX), com catálogo dinâmico no MySQL, módulo de gestão no Portal do Gestor (`/portal-gestor/shop`) com RBAC e atendimento oficial via WhatsApp (+55 18 99635-6825).

# 📜 Contratos de API (REGRA 1)
- [x] Contrato JSON criado em `openspec/contracts/shop/get_products.json`
- [x] Contrato JSON criado em `openspec/contracts/shop/post_checkout_stone.json`
- [x] Contrato JSON criado em `openspec/contracts/shop/post_stone_webhook.json`
- [x] 100% de simetria com as rotas REST implementadas

# 🚫 Espaço Negativo (Fora de Escopo)
- [x] Infraestrutura Docker/Traefik e restrição de localhost do container de banco de dados (Imutável)
- [x] Portais legados da Aluna e Licenciada existentes não sofrem breaking changes em suas tabelas originais
- [x] Assistente IA no checkout (desativado por decisão de governança; mantido botão flutuante direto do WhatsApp oficial)

# 🗄️ Camada de Dados (SQL)
- [x] Migration criada em `infrastructure/database/migrations/V111_Create_Shop_Tables_And_Stone_Integration.sql`
- [x] Tabelas `shop_products`, `shop_orders` e `shop_leads` com integridade referencial e auditoria

# ⚙️ Camada de Backend (PHP 8.4)
- [x] Classe de serviço `BodyHarmony\Services\StonePaymentService` em `apps/web-app/src/backend/api/v1/Services/StonePaymentService.php`
- [x] Classe de serviço `BodyHarmony\Services\ShopService` em `apps/web-app/src/backend/api/v1/Services/ShopService.php`
- [x] Controllers públicos `/api/v1/shop/products`, `/api/v1/shop/checkout`, `/api/v1/shop/webhook`
- [x] Controller administrativo `/api/v1/admin/shop` protegido por autenticação e RBAC

# ⚛️ Camada de Interface (React V3.1)
- [x] Página pública de Vitrine `/loja` (`ShopPage.jsx`) com paleta Luxury (`#0A3E60`, `#ED7E13`)
- [x] Página pública de Checkout transparente `/loja/checkout/:productId` (`ShopCheckoutPage.jsx`)
- [x] Módulo Gestor `/portal-gestor/shop` (`ShopManager.jsx`) envelopado no `AdminLayout`
- [x] Integração no Sidebar com controle de permissões e navegação ergonômica

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Premium (Site/Frontend):** Build do Vite atualizado com rotas `/loja`, `/loja/checkout/*` e `/portal-gestor/shop`.
- **VPS Hostinger Dedicada (API/DB):** Endpoints PHP 8.4 em `api/v1/shop/` e `api/v1/admin/shop.php` + Tabelas no MySQL.

# 🔍 Monitoramento Semântico (Regression Watch)
- [x] Rotas existentes do Portal do Gestor (`/admin`, `/portal-gestor/*`) continuam funcionando sem interferência
- [x] Checkout opera de modo transiente sem persistir PAN/CVV no banco

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Falha de comunicação de rede ou credencial Stone no ambiente de produção.
- **Mitigação:** Fallback controlado e logs detalhados de auditoria em `stone_raw_response` sem expor dados sensíveis.
- **Rollback:** Reversão da migration V111 e remoção das rotas `/loja` em `App.jsx`.

# ✅ Checklist de Execução Atômica
- [x] 1. Criar Contratos JSON em `openspec/contracts/shop/`
- [x] 2. Criar migration SQL `V111_Create_Shop_Tables_And_Stone_Integration.sql`
- [x] 3. Implementar `StonePaymentService` e `ShopService` no Backend PHP
- [x] 4. Criar controllers REST públicos e administrativos
- [x] 5. Implementar componentes Frontend (`ShopPage`, `ShopCheckoutPage`, `ShopManager`)
- [x] 6. Atualizar roteamento em `App.jsx` e `Sidebar.jsx`
- [x] 7. Executar testes de fumaça PHP CLI e build Vite
