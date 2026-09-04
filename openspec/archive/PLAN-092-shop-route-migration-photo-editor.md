# 🎯 Objetivo Fullstack (PLAN-092) — Concluído
1. Migração da rota pública e links de navegação da Loja Virtual de `/loja` para `/shop` (com redirect defensivo de `/loja` -> `/shop` e `/loja/checkout/:id` -> `/shop/checkout/:id`).
2. Implementação do recurso de alteração de fotos de produtos em `/portal-gestor/shop` (aba Catálogo), permitindo ao gestor fazer upload direto de novas imagens (JPG/PNG/WEBP) ou editar a URL da foto com pré-visualização instantânea.

# 📜 Contratos de API (REGRA 1)
- [x] Contrato JSON criado em `openspec/contracts/shop/admin_product_image_upload.json`
- [x] Simetria 100% com o backend PHP e frontend React

# 🚫 Espaço Negativo (Fora de Escopo)
- [x] Infraestrutura Docker/Traefik e restrição de localhost do MySQL (Imutável)
- [x] Regras de negócio de checkout e processamento de pagamentos Stone (Preservadas)

# 🗄️ Camada de Dados (SQL)
- [x] Campo `image_url` na tabela `shop_products` já integrado e utilizado diretamente.

# ⚙️ Camada de Backend (PHP 8.4)
- [x] `ShopService.php` atualizado com suporte a `image_url` em `updateProduct()`
- [x] Método `uploadProductImage($id)` adicionado em `ShopController.php` com validação de extensão e salvamento em `public_html/uploads/shop/`
- [x] Rota `POST /api/v1/admin/shop/products/{id}/image` registrada no `index.php`

# ⚛️ Camada de Interface (React V3.1)
- [x] Roteamento atualizado em `App.jsx` com `/shop` e `/shop/checkout/:productId`, com redirecionamento de `/loja`
- [x] Links atualizados em `NavbarV2.jsx`, `FooterV2.jsx`, `Dashboard.jsx`, `ShopPage.jsx`, `ShopCheckoutPage.jsx`
- [x] Em `ShopManager.jsx` (Aba Catálogo):
  * Thumbnail de foto atual com overlay "Trocar"
  * Botão de upload de foto (`Upload Foto`) com input de arquivo e feedback de envio
  * Campo para inserção/edição rápida de URL de imagem com botão Salvar

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Premium (Site/Frontend):** Build compilado e sincronizado com 100% de sucesso.
- **VPS Hostinger Dedicada (API/DB):** API PHP sincronizada.

# 🔍 Monitoramento Semântico (Regression Watch)
- [x] Rota `https://bodyharmony.com.br/shop` respondendo HTTP 200 OK
- [x] Rota `https://bodyharmony.com.br/loja` redirecionando para `/shop`
- [x] Gestor `/portal-gestor/shop` com upload e edição de fotos de produto funcional

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Zero.
- **Rollback:** `git revert` e deploy da versão anterior.

# ✅ Checklist de Execução Atômica
- [x] 1. Validar contrato JSON `openspec/contracts/shop/admin_product_image_upload.json`
- [x] 2. Implementar endpoint de upload de foto no Backend PHP (`ShopController.php`, `ShopService.php`, `index.php`)
- [x] 3. Adicionar método `uploadProductImage` em `src/services/api.js`
- [x] 4. Atualizar rotas em `App.jsx` e links no `NavbarV2.jsx`, `FooterV2.jsx`, `Dashboard.jsx`, `ShopPage.jsx`, `ShopCheckoutPage.jsx`
- [x] 5. Implementar editor de fotos na aba de Catálogo em `ShopManager.jsx`
- [x] 6. Executar build local `node scripts/devops/build-release.js`
- [x] 7. Executar deploy na Hostinger e testar a rota `/shop` e o upload de foto ao vivo
