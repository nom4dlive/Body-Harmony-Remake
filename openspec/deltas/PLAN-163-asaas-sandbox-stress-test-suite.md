# 🎯 PLAN-163: Bateria Exaustiva de Simulações na API Sandbox Asaas (SB_BODY_HARMONY)

## [OBJETIVO]
Executar suíte de testes de estresse contra a API Sandbox real do Asaas (`https://sandbox.asaas.com/api/v3`) com a credencial Sandbox fornecida pelo usuário, cobrindo todos os cenários operacionais (PIX, Cartão à vista, Cartão parcelado de 2x a 12x, Cupons, Terceiros/CNPJ e Fallback 3DS com foco em antecipação de recebíveis).

---

## 🚫 [ESPAÇO NEGATIVO]
- NÃO comitar a chave de API no repositório Git (manter isolada no executor de teste).
- NÃO alterar contratos da API pública de produção.
- NÃO afetar a base de produção da Hostinger (testes rodam estritamente contra o sandbox Asaas).

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Passo 1 (Conexão & Pre-flight)**: Validar autenticação e saldo na conta Sandbox Asaas (`GET /v3/finance/balance`).
- [ ] **Passo 2 (Bateria PIX)**: Testar emissão de PIX sem cupom, com cupom 20% OFF e no ingresso VIP, auditando os QR Codes e Copia-e-Cola retornados pelo Sandbox.
- [ ] **Passo 3 (Bateria Cartão À Vista & Terceiros/CNPJ)**: Testar pagamentos 1x direto no cartão Sandbox com mesma titularidade, terceiro CPF e clínica CNPJ.
- [ ] **Passo 4 (Bateria Cartão Parcelado & Antecipação)**: Testar parcelamentos em 2x, 4x, 6x e 12x no Sandbox Asaas, validando `billingType: 'CREDIT_CARD'` e a estrutura de parcelas.
- [ ] **Passo 5 (Bateria Fallback 3DS & Cupons Especiais)**: Testar links de contingência hospedados e regras de cupons (100% OFF atleta, cupom expirado e limite de 1 uso).
- [ ] **Passo 6 (Dossiê de Resultados)**: Gerar relatório consolidado com links e IDs reais do Sandbox Asaas e registrar no Obsidian Vault.

---

## 📁 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `tests/asaas_sandbox_stress_test.php`
- `openspec/tracker/task.md`
