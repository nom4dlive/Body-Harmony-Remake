# 🚀 Recursos Avançados — Stone Payments API Online 4.0

## 1. Verificação de Cartão com Zero Dollar Auth (`POST /cards/verify`)

Permite validar a existência e validade do cartão antes de cobrar ou salvar para compras futuras:

```json
{
  "type": "credit",
  "initiator_id": "bh_verify_882910_a1",
  "local_datetime": "2026-08-23T21:00:00",
  "card": {
    "number": "4705980000007171",
    "expiration_date": "2812",
    "cvv": "123",
    "holder_name": "ROBERTA ESTETICA"
  }
}
```

---

## 2. Autenticação 3D Secure (3DS EMV 2.x)

Para transações de alto ticket ou redução de chargebacks com transferência de responsabilidade (*liability shift*):

```json
{
  "amount": 1540000,
  "initiator_id": "bh_lic_order_123",
  "payment_method": "card",
  "card_transaction": {
    "type": "credit",
    "operation_type": "auth_and_capture",
    "card": {
      "entry_mode": "manual",
      "number": "4705980000007171",
      "expiration_date": "2812",
      "cvv": "123",
      "holder_name": "DRA JULIANA"
    },
    "authentication": {
      "type": "emv_3ds",
      "emv_3ds": {
        "cryptogram": "B5gQApKXlQAAAIzXmGCZdQAAAAA=",
        "eci": "02",
        "status": "Y",
        "directory_server_id": "4dd4df3f-583f-4970-b34f-90ff5d57aac8",
        "version": "VRS21"
      }
    }
  }
}
```

---

## 3. Indicadores de Transação (CIT vs MIT & Recorrência)

Obrigatório para transações Mastercard e programas de assinatura/recorrência:

- **CIT (Customer Initiated Transaction)**: O cliente está presente na interface digitando ou autorizando.
  ```json
  "initiator": {
    "initiating_entity": "cardholder",
    "initiating_reason": "standing_order"
  }
  ```
- **MIT (Merchant Initiated Transaction)**: Cobrança automática de mensalidade agendada (ex: Licenciamento recorrente):
  ```json
  "initiator": {
    "initiating_entity": "merchant",
    "initiating_reason": "credentials_on_file"
  }
  ```
