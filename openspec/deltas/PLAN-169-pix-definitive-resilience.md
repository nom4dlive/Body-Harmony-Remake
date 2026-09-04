# 🎯 PLAN-169: Blindagem Definitiva do PIX & Contingência Oficial Asaas

## [OBJETIVO]
Eliminar 100% dos erros de PIX inválido ("Esse pix copia e cola ou QR Code não é mais válido") através da disponibilização simultânea da cobrança oficial hospedada do Asaas (invoiceUrl) e saneamento de espaços e tokens de pagamento.

---

## [ESPAÇO NEGATIVO]
- Proibido alterar a precificação dos lotes (congress_tiers).
- Proibido recriar carnês ou faturas de parcelas recorrentes.
- Proibido expor credenciais bancárias ou segredos em código.

---

## [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [x] **Step 1: MCP Asaas Audit**: Consultar documentação oficial de pixQrCode e cobrancas-via-pix via MCP do Asaas.
- [x] **Step 2: Backend AsaasGatewayService & CongressTicketService**: Expor invoiceUrl e bankSlipUrl no payload retornado para o checkout.
- [x] **Step 3: Frontend CongressCheckoutPage**: Adicionar botão dourado destacado "Abrir Página Oficial de Pagamento Asaas" como contingência direta.
- [ ] **Step 4: Nexus Gate**: Validar 100% de integridade com scripts/nexus_gate.ps1 (Exit Code 0).
- [ ] **Step 5: Deploy & Smoke Test**: Publicar na Hostinger via scripts/deploy/deploy-pro.ps1 e verificar rota pública.

---

## [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- apps/web-app/src/backend/api/v1/Services/Payment/AsaasGatewayService.php
- apps/web-app/src/backend/api/v1/Services/CongressTicketService.php
- apps/web-app/src/frontend/src/pages/Congresso/CongressCheckoutPage.jsx
