# 🎯 PLAN-167: Blindagem Integral de Meios de Pagamento Asaas (Cartão, PIX, Fallback 3DS & Antifraude)

## [OBJETIVO]
Adequar a integração do Asaas à documentação oficial V3 rigorosa:
1. Injetar `remoteIp` real do cliente no checkout transparente de cartão de crédito para reduzir a taxa de rejeição por antifraude.
2. Desativar notificações nativas de e-mail do Asaas (`notificationDisabled: true`) para que clientes não recebam e-mails confusos de faturas/boletos.
3. Tornar cristalina a opção de titular de cartão de terceiros (mãe, cônjuge, clínica) no checkout para zerar recusas de divergência de CPF com o banco emissor.

---

## 🚫 [ESPAÇO NEGATIVO]
- NÃO alterar a precificação dos lotes ou as regras dos cupons existentes.
- NÃO alterar a taxa de juros do parcelamento ou o limite de 12x.
- NÃO expor credenciais do Asaas no frontend.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Passo 1 (Backend - Antifraude & remoteIp)**: Em `AsaasGatewayService.php`, injetar `remoteIp` capturado de headers reais e preencher `mobilePhone`.
- [ ] **Passo 2 (Backend - Blindagem de Notificações)**: Forçar `notificationDisabled: true` em `AsaasGatewayService.php` e no `.env`.
- [ ] **Passo 3 (Frontend - Cartão de Terceiros Sem Atrito)**: Em `CongressCheckoutModal.jsx`, dar destaque visual à seleção de titular de terceiros e exibir orientações claras contra recusas.
- [ ] **Passo 4 (Validação Determinística & Gate)**: Executar `nexus_gate.ps1` com Exit Code 0.
- [ ] **Passo 5 (Deploy em Produção)**: Publicar na Hostinger via `deploy-pro.ps1` e auditar resposta ao vivo.

---

## 📁 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `apps/web-app/src/backend/api/v1/Services/Payment/AsaasGatewayService.php`
- `apps/web-app/src/backend/.env`
- `apps/web-app/src/frontend/src/pages/Congresso/components/CongressCheckoutModal.jsx`
- `openspec/tracker/task.md`
