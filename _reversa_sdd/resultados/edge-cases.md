# Edge Cases: Resultados

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

### EC-01: Cadastro sem imagem
- Entrada: POST `/admin/results` sem image nem image_url
- Comportamento esperado: `Response::error('Dados incompletos', 400)` 🟢
- Código: `ResultController.php:45-47`

### EC-02: Atualizar sem campos
- Entrada: PUT `/admin/results/1` com body vazio `{}`
- Comportamento esperado: `Response::error('No fields to update', 400)` 🟢
- Código: `ResultController.php:95`

### EC-03: Atualizar resultado inexistente
- Entrada: PUT `/admin/results/99999` com campos válidos
- Comportamento esperado: Retorna `{success}` (UPDATE sem rows afetadas não é erro) 🟡
- Código: `ResultController.php:98-101`

### EC-04: Excluir resultado inexistente
- Entrada: DELETE `/admin/results/99999`
- Comportamento esperado: Retorna `{success}` (DELETE sem rows não falha) 🟡
- Código: `ResultController.php:108-115`

### EC-05: Listagem vazia
- Entrada: GET `/licenciadas/results` sem resultados cadastrados
- Comportamento esperado: Array vazio `[]` 🟢
- Código: `ResultController.php:27`

### EC-06: Erro de banco na listagem
- Entrada: GET `/licenciadas/results` com conexão DB falha
- Comportamento esperado: Array vazio `[]` com erro logado 🟢
- Código: `ResultController.php:28-31`

### EC-07: Todos os resultados pinned
- Entrada: Vários resultados com pinned=1
- Comportamento esperado: Ordenados por date DESC dentro do grupo pinned 🟢
- Código: `ResultController.php:18`
