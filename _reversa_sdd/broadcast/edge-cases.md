# Edge Cases: Broadcast

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

### EC-01: Usuário sem role correspondente
- Entrada: Broadcast com target_roles: ["admin"]; usuário é "licenciada"
- Comportamento esperado: Broadcast não aparece na lista ativa 🟢
- Código: `BroadcastController.php:53`

### EC-02: Broadcast já lido
- Entrada: GET `/v1/broadcasts/active` após acknowledge
- Comportamento esperado: Broadcast não aparece (log existe) 🟢
- Código: `BroadcastController.php:42`

### EC-03: Todos os broadcasts lidos
- Entrada: GET `/v1/broadcasts/active` com todos acknowledge
- Comportamento esperado: Array vazio `[]` 🟢

### EC-04: Excluir broadcast inexistente
- Entrada: DELETE `/admin/broadcasts/99999`
- Comportamento esperado: 404 🟢
- Código: `BroadcastController.php`

### EC-05: Broadcast sem target_roles
- Entrada: POST manage com target_roles vazio ou ausente
- Comportamento esperado: Pode ser visível para todos ou nenhum 🟡

### EC-06: Múltiplos acknowledges do mesmo broadcast
- Entrada: POST acknowledge duas vezes para o mesmo broadcast
- Comportamento esperado: Segundo INSERT (pode duplicar ou falhar se UNIQUE) 🟡

### EC-07: Broadcast inativo na listagem
- Entrada: GET `/v1/broadcasts/active` com broadcast is_active=0
- Comportamento esperado: Não aparece (filtrado por is_active=1) 🟢
