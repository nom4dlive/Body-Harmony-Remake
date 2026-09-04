# Edge Cases: Conteúdo (Content)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

### EC-01: Cadastro sem foto
- Entrada: POST sem campo photo
- Comportamento esperado: Mentor cadastrado com photo_url = null 🟡
- Observação: Código não especifica se photo é obrigatório

### EC-02: Atualizar mentor inexistente
- Entrada: PUT `/content/mentors/99999`
- Comportamento esperado: Retorno 404 ou 200 com success sem alterações 🟡

### EC-03: Excluir mentor inexistente
- Entrada: DELETE `/content/mentors/99999`
- Comportamento esperado: void exit com erro 404 ou 200 sem alterações 🟡

### EC-04: Upload de arquivo inválido
- Entrada: POST com arquivo não-imagem (ex: PDF) no campo photo
- Comportamento esperado: Validação de MIME type rejeita o upload 🟡
- Observação: Validação não confirmada no código analisado

### EC-05: Listagem pública com banco vazio
- Entrada: GET `/content/mentors` sem nenhum mentor cadastrado
- Comportamento esperado: Array vazio, status 200 🟡
