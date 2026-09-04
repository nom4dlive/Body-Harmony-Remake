---
name: stone-payments-api
description: Padrões, arquitetura, autenticação e operações da API Stone Online 4.0 (Payments / Charges) para o ecossistema Body Harmony. Use sempre que implementar, integrar, depurar ou testar cobranças com Cartão de Crédito, PIX, parcelamentos, captura, cancelamento, 3DS, verificação de cartão (/cards/verify), MIT/CIT e webhooks da Stone.
---

# 💳 Stone Payments API — Guia Operacional Master & Padrões Body Harmony

Este skill documenta os padrões estritos para integração da **Stone Payments API (Online 4.0)** no ecossistema Body Harmony (Nexus V3.1 / PHP 8.4 & React 19).

---

## 🌐 1. Ambientes & Endpoints

A Stone opera com separação de ambientes e roteamento condicional via **Header `Host`**.

| Ambiente | Base URL | Header `Host` (Gateway) | Header `Host` (Subadquirente) |
| :--- | :--- | :--- | :--- |
| **Sandbox (Homologação)** | `https://payments.stone.com.br/v1` | `sdx-ecommerce-payments.stone.com.br` | `sdx-payments.stone.com.br` |
| **Produção** | `https://payments.stone.com.br/v1` | `ecommerce-payments.stone.com.br` | `payments.stone.com.br` |

> ⚠️ **IMPORTANTE (Header Host Obrigatório)**: O endpoint base é sempre `https://payments.stone.com.br/v1`, porém o Header `Host` **deve** ser enviado explicitamente para direcionar entre Sandbox e Produção.

---

## 🔑 2. Autenticação

### A. Modelo Gateway (Lojista com Afiliação Direta)
Utiliza **HTTP Basic Authentication** com a `SecretKey` (formato `sk_xxxxxx`):
```http
Authorization: Basic base64(sk_xxxxxx:)
```
*Em PHP cURL:*
```php
$headers = [
    'Content-Type: application/json',
    'Host: ' . $stoneHost, // ex: sdx-ecommerce-payments.stone.com.br
    'Authorization: Basic ' . base64_encode($secretKey . ':')
];
```

### B. Modelo Subadquirente (Identity Provider - IDP)
Utiliza **OAuth2 Bearer Token** gerado via IDP Stone com `client_id` e `client_secret`:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## ⚡ 3. Operações Principais (`/charges`)

### 3.1 Autorização & Captura (`POST /charges`)
Cria uma nova cobrança. Suporta **Cartão de Crédito** e **PIX**.

#### Exemplo de Payload - Cartão de Crédito com Captura Imediata:
```json
{
  "amount": 199700,
  "initiator_id": "bh_order_882910_a1",
  "local_datetime": "2026-08-23T21:00:00",
  "payment_method": "card",
  "card_transaction": {
    "type": "credit",
    "operation_type": "auth_and_capture",
    "installments": 12,
    "installments_type": "merchant",
    "statement_descriptor": "BODY HARMONY",
    "card": {
      "entry_mode": "ecommerce",
      "number": "4705980000007171",
      "expiration_date": "2812",
      "cvv": "123",
      "holder_name": "NOME DO CLIENTE"
    }
  }
}
```

*Parâmetros Críticos:*
- `amount`: Valor em centavos (inteiro). Ex: `R$ 1.997,00` = `199700`.
- `initiator_id`: Identificador único no sistema Body Harmony para correlação e idempotência.
- `operation_type`: `auth_and_capture` para captura instantânea ou `pre_auth` para reserva de limite.
- `installments`: Número de parcelas (1 a 12).
- `installments_type`: `merchant` (sem juros para o comprador) ou `account_holder` (com juros da emissora).

### 3.2 Verificação de Cartão (`POST /cards/verify`)
Validação de cartão com Zero Dollar Auth antes de cobrança. Consulte [references/advanced-features.md](file:///f:/Body-Harmony-Remake/.agent/skills/stone-payments-api/references/advanced-features.md).

### 3.3 Captura Posterior (`POST /charges/{id}/capture`)
Captura o valor previamente autorizado (`pre_auth`).

### 3.4 Cancelamento / Estorno (`POST /charges/cancel`)
Cancela ou estorna uma cobrança aprovada.

### 3.5 Consulta de Status (`GET /charges?ids[]={id}` ou `?initiator_ids[]={initiator_id}`)
Sonda de status para reconciliação periódica ou verificação síncrona.

---

## 📚 4. Arquivos de Referência Detalhados

Para aprofundamento operacional, consulte os arquivos de referência:
- [Códigos de Retorno & Políticas de Retentativa](file:///f:/Body-Harmony-Remake/.agent/skills/stone-payments-api/references/response-codes.md): Mapeamento de códigos `0000`, `1000` a `1061`, `1804` a `1820` e regras de retry.
- [Cartões de Teste & Sandbox](file:///f:/Body-Harmony-Remake/.agent/skills/stone-payments-api/references/test-cards.md): PANs de teste (Visa, Master, Elo, Amex) e regra de centavos para simulação de status.
- [Recursos Avançados](file:///f:/Body-Harmony-Remake/.agent/skills/stone-payments-api/references/advanced-features.md): Autenticação 3DS EMV 2.x, Zero Dollar Auth `/cards/verify`, e indicadores de transação CIT/MIT.

---

## 🛡️ 5. Diretrizes de Segurança & Invariantes Body Harmony

1. **Nunca armazenar dados brutos de cartão (`PAN`/`CVV`) no MySQL**: O backend PHP apenas trafega o payload de forma transiente via TLS para a Stone.
2. **Idempotência**: Todo checkout deve gerar um `initiator_id` único no padrão `bh_order_{TIMESTAMP}_{RANDOM}` antes de disparar o cURL para a Stone.
3. **Persistência de Logs de Auditoria**: Respostas da Stone (com `charge_id`, `authorization_code` e códigos de retorno) devem ser persistidas em `stone_raw_response` na tabela `shop_orders`.
4. **Isolamento de Credenciais**: `STONE_SECRET_KEY`, `STONE_HOST` e `STONE_MODE` (`sandbox` ou `production`) devem ser carregados estritamente via `.env` / `config.php`.
