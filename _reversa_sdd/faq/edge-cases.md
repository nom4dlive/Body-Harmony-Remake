# Edge Cases: FAQ

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

### EC-01: Cadastro sem pergunta
- Entrada: POST `/admin/faq` sem question
- Comportamento esperado: `Response::error('Dados incompletos', 400)` 🟢
- Código: `FaqController.php:29`

### EC-02: Várias FAQs com mesmo display_order
- Entrada: Múltiplas FAQs com display_order = 0
- Comportamento esperado: Ordenadas por id ASC dentro do mesmo order 🟢
- Código: `FaqController.php:17`

### EC-03: Atualizar FAQ inexistente
- Entrada: PUT `/admin/faq/99999` com campos válidos
- Comportamento esperado: `{success}` (UPDATE 0 rows não é erro) 🟡

### EC-04: Excluir FAQ inexistente
- Entrada: DELETE `/admin/faq/99999`
- Comportamento esperado: `{success}` (DELETE 0 rows não falha) 🟡

### EC-05: Listagem vazia
- Entrada: GET `/faq` sem FAQs cadastradas
- Comportamento esperado: Array vazio `[]` 🟢
- Código: `FaqController.php:18`

### EC-06: Atualizar sem dados
- Entrada: PUT `/admin/faq/1` com body vazio
- Comportamento esperado: `Response::error('No data', 400)` 🟢
- Código: `FaqController.php:48`
