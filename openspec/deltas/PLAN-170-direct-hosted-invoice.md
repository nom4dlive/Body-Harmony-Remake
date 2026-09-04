# 🎯 PLAN-170: Redirecionamento Direto para Fatura Oficial Hospedada Asaas (Zero Fricção Pix & Cartão 12x)

## [OBJETIVO]
Eliminar 100% dos erros de checkout, instabilidades bancárias do SPI e recusas de cartão antifraude redirecionando os pagamentos (Cartão até 12x e Pix) para a Fatura Oficial Hospedada do Asaas (invoiceUrl), onde o cliente escolhe livremente o meio de pagamento no ambiente oficial com 3DS autenticado.

---

## [ESPAÇO NEGATIVO]
- Proibido alterar o modelo de lotes e cupons.
- Proibido expor credenciais bancárias.
- Proibido criar carnês ou cobranças recorrentes no Asaas.

---

## [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Step 1: Backend CongressTicketService**: Ao submeter o checkout com Cartão ou Pix com Fatura Oficial, chamar createHostedInvoice com illingType: UNDEFINED e retornar imediatamente a invoice_url.
- [ ] **Step 2: Frontend CongressCheckoutPage**: 
  - Simplificar o formulário de Cartão: eliminar a digitação manual de número/CVV/titular no formulário para quem escolhe cartão, exibindo um botão de alta conversão *"Prosseguir para Pagamento Seguro em até 12x no Asaas"*.
  - Ao clicar, redireciona diretamente o comprador para a página oficial do Asaas (es.data.invoice_url).
  - Para PIX: Manter a tela com QR Code + Chave Copiável e adicionar o redirecionamento opcional com 1-clique.
- [ ] **Step 3: Nexus Gate**: Executar scripts/nexus_gate.ps1 com Exit Code 0.
- [ ] **Step 4: Deploy em Produção**: Publicar release via scripts/deploy/deploy-pro.ps1.
- [ ] **Step 5: Verificação Smoke Test**: Simular o fluxo ponta a ponta e garantir HTTP 200 e redirecionamento íntegro.

---

## [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- apps/web-app/src/backend/api/v1/Services/CongressTicketService.php
- apps/web-app/src/frontend/src/pages/Congresso/CongressCheckoutPage.jsx
