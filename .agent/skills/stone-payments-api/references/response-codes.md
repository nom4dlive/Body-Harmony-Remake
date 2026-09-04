# 📊 Códigos de Retorno & Políticas de Retentativa — Stone Payments API

## 1. Códigos Principais do Autorizador

| Código | Descrição | Mensagem do Adquirente | Ação Recomendada | Pode Retentar? |
| :--- | :--- | :--- | :--- | :--- |
| **0000** | Approved | Aprovado | Transação concluída com sucesso | N/A |
| **0001** | Approve after identity verification | Aprovar após verificação de identidade | Prosseguir com 3DS | Não |
| **0002** | Partially approved | Parcialmente aprovado | Validar valor remanescente | Não |
| **1000** | Do not honour | Contate a central do seu cartão | Informar cliente para contatar banco emissor | Não imediato |
| **1001 / 1819** | Expired card | Verifique os dados do cartão | Solicitar nova data de validade | Sim (com novos dados) |
| **1002** | Suspected fraud | Contate a central do seu cartão | Bloqueio de risco pelo emissor | Não |
| **1007 / 1809** | Refer to card issuer | Verifique os dados do cartão | Recusado pelo emissor | Não |
| **1011 / 1816** | Invalid card number | Cartão inválido | Corrigir número digitado | Sim (com correção) |
| **1014 / 1810** | No account of type requested | Utilize função crédito | Cliente tentou débito em fluxo de crédito | Sim (alterar função) |
| **1015 / 1805** | Requested function not supported | Parcelamento inválido | Ajustar número de parcelas | Sim (reduzir parcelas) |
| **1016** | Not sufficient funds | Não autorizada (Saldo insuficiente) | Solicitar outro meio de pagamento | Não |
| **1022 / 1817** | Security violation | Verifique os dados do cartão | Dados de segurança divergentes | Sim (revisar CVV) |
| **1045** | Card verification data failed | Código de segurança (CVV) inválido | Solicitar novo CVV | Sim (com novo CVV) |
| **1060** | Transaction did not complete normally | Transação não completou | Timeout / Erro transiente de rede | **Sim (Retentativa permitida)** |

---

## 2. Política de Retentativas Inteligentes (Stone Invariant)

- **Erros Fatais (Não Retentar no mesmo cartão)**: `1000` (Do not honour), `1002` (Suspected fraud), `1016` (Sem saldo), `1032` (Cartão roubado).
- **Erros Corrigíveis pelo Usuário**: `1001` (Validade), `1011` (PAN inválido), `1045` (CVV inválido), `1805` (Parcelas).
- **Limite Máximo de Retentativas**: As bandeiras (Visa/Mastercard) impõem limites de até **15 retentativas por dia** para a mesma conta. Retentativas cegas em cartões com erro fatal geram taxas de recusa da bandeira.
