# 📄 Contratos de API — Body Harmony

Esta pasta hospeda as especificações de contrato de dados (assinaturas JSON) de todas as APIs do ecossistema. Todo endpoint novo ou modificado deve possuir um arquivo de payload correspondente aqui **antes** da codificação do frontend e backend.

---

## 🛠️ Como Definir um Contrato

Os contratos de API devem ser salvos em formato JSON (ou Markdown contendo os JSON Mocks) com a seguinte convenção de nomenclatura:
`openspec/contracts/{modulo}/{endpoint_path}.json`

### Exemplo de Estrutura de Contrato (`openspec/contracts/licenciada/dashboard_summary.json`):

```json
{
  "endpoint": "GET /v1/admin/analytics/dashboard-summary",
  "auth_required": true,
  "roles_allowed": ["superadmin", "admin"],
  "request": {
    "headers": {
      "Authorization": "Bearer {token}"
    },
    "query_params": {
      "period": "30d"
    }
  },
  "response": {
    "status": 200,
    "body": {
      "active_users": 12,
      "ops_completed": 196,
      "global_progress": 76.78,
      "security_alerts": 2,
      "recent_activity": [
        {
          "timestamp": "2026-06-01T01:11:13Z",
          "user": "nom4d",
          "action": "RESET_PASSWORD",
          "target": "simonesantosmassage"
        }
      ]
    }
  }
}
```

---

## 🛡️ Validação Obrigatória
O código backend (PHP) e o frontend (React) devem ser programados de forma estrita contra o contrato especificado, tratando erros sintáticos e exceptions caso o payload real difira do esperado.
