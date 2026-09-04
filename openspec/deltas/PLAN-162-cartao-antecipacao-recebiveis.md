# 🎯 PLAN-162: Elegibilidade Imediata para Antecipação de Recebíveis de Cartão de Crédito no Asaas

## [OBJETIVO]
Garantir que todas as transações de cartão de crédito (tanto diretas transparentes quanto as geradas por links de contingência/fallback 3DS) sejam criadas estritamente com `billingType: 'CREDIT_CARD'` e especificação de parcelamento canônica (`installmentCount` + `installmentValue`), tornando 100% das parcelas futuras imediatamente elegíveis para antecipação de recebíveis no painel do Asaas assim que aprovadas.

---

## 🚫 [ESPAÇO NEGATIVO]
- NÃO alterar o fluxo nativo de PIX (`createPixCharge`), que continua com QR Code dinâmico e expiração de 24h.
- NÃO alterar os cálculos financeiros de juros repassados das 12 faixas de parcelamento já aprovados.
- NÃO alterar regras de cupons ou credenciamento de atletas.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Passo 1 (Backend - Fallback 3DS)**: Atualizar `createHostedInvoice` em `AsaasGatewayService.php` para usar `'billingType' => 'CREDIT_CARD'` e ajustar a estrutura de payload de parcelamento para padrão estrito do Asaas (remover `value` quando `installments > 1`, enviando `installmentCount` e `installmentValue`).
- [ ] **Passo 2 (Backend - Checkout Transparente)**: Harmonizar `createCreditCardCharge` para remover o campo `value` quando `$installments > 1`, enviando estritamente `installmentCount` e `installmentValue`.
- [ ] **Passo 3 (Testes & Asserções)**: Atualizar a suíte de testes de fumaça `tests/congress_third_party_card_smoke_test.php` para validar que `billingType` de faturas hospedadas é estritamente `CREDIT_CARD`.
- [ ] **Passo 4 (Nexus Hard-Gate & Deploy)**: Executar `nexus_gate.ps1` (Exit Code 0), publicar em produção via `deploy-pro.ps1` e auditar ao vivo na API da Hostinger.
- [ ] **Passo 5 (Guia Operacional)**: Orientar o suporte sobre como cancelar o carnê `UNDEFINED` pendente da Monica Schneider no Asaas para que a nova cobrança seja gerada como cartão elegível a antecipação.

---

## 📁 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `apps/web-app/src/backend/api/v1/Services/Payment/AsaasGatewayService.php`
- `tests/congress_third_party_card_smoke_test.php`
- `openspec/tracker/task.md`
