# 💳 Cartões de Teste & Simulação de Sandbox — Stone Payments

## 1. Cartões Oficiais de Teste (Sandbox)

| Bandeira | Número do Cartão (PAN) | Validade | CVV |
| :--- | :--- | :--- | :--- |
| **Visa** | `4705.9800.0000.7171` | `08/26` | `111` ou qualquer |
| **Mastercard** | `4024.0000.0000.4848` | `08/26` | `222` ou qualquer |
| **Elo** | `4389.3500.0000.7474` | `08/26` | `333` ou qualquer |
| **Amex** | `3742.4500.0000.131` | `08/26` | `4444` ou qualquer |

---

## 2. Regra de Simulação por Centavos no Sandbox

No ambiente de homologação (`sdx-ecommerce-payments.stone.com.br` / `sdx-payments.stone.com.br`), o valor dos centavos define a resposta da adquirente:

- **R$ 1,00 (`100` centavos)** $\rightarrow$ Retorno **`0000`** (Aprovado).
- **R$ 1,01 (`101` centavos)** $\rightarrow$ Retorno **`1007`** (Refer to issuer).
- **R$ 1,02 (`102` centavos)** $\rightarrow$ Retorno **`1002`** (Suspeita de fraude).
- **R$ 1,16 (`116` centavos)** $\rightarrow$ Retorno **`1016`** (Saldo insuficiente).
- **R$ 1,45 (`145` centavos)** $\rightarrow$ Retorno **`1045`** (CVV inválido).
