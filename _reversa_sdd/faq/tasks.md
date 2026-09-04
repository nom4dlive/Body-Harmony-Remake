# Tasks: FAQ

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabela `faq` criada no MySQL com schema: id, question, answer, display_order
- [ ] Core Response.php disponível

## Tarefas

### T01: Listar FAQs ordenadas
- **Arquivo legado:** `Controllers/FaqController.php`
- **Descrição:** Implementar `getData()` com SELECT * FROM faq ORDER BY display_order ASC, id ASC. `index()` wrapper JSON. Rota pública.
- **Critério de pronto:** GET `/faq` retorna array ordenado com todos os campos
- **Confidência:** 🟢 CONFIRMADO

### T02: Cadastrar FAQ
- **Arquivo legado:** `Controllers/FaqController.php`
- **Descrição:** Implementar `store()`: recebe JSON, valida question obrigatório, INSERT com question, answer, display_order.
- **Critério de pronto:** POST `/admin/faq` com question válido retorna `{success, id}`
- **Confidência:** 🟢 CONFIRMADO

### T03: Atualizar FAQ
- **Arquivo legado:** `Controllers/FaqController.php`
- **Descrição:** Implementar `update(id)`: UPDATE condicional por campo (question, answer, display_order). Se nenhum campo, retorna 400.
- **Critério de pronto:** PUT `/admin/faq/:id` com campos parciais atualiza apenas eles
- **Confidência:** 🟢 CONFIRMADO

### T04: Excluir FAQ
- **Arquivo legado:** `Controllers/FaqController.php`
- **Descrição:** Implementar `destroy(id)`: DELETE FROM faq WHERE id = ?.
- **Critério de pronto:** DELETE `/admin/faq/:id` retorna `{success}`
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Testar listagem com ordenação
- [ ] TT-02: Testar CRUD completo de FAQ

## Ordem Sugerida

1. T01 (listagem) — pública
2. T02 (store) — cadastro
3. T03 (update) — atualização
4. T04 (destroy) — exclusão

## Lacunas Pendentes (🔴)

- FAQs setoriais (ex: FAQ admin vs FAQ aluna) não confirmadas
