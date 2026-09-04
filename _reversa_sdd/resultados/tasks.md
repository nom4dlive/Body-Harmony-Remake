# Tasks: Resultados

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabela `results` criada no MySQL com schema: id, description, category, image_url, date, licenciada_id, pinned
- [ ] Core Response.php e ResponseCache.php disponíveis

## Tarefas

### T01: Listar resultados com ordenação e normalização
- **Arquivo legado:** `Controllers/ResultController.php`
- **Descrição:** Implementar `getData()`: SELECT com ORDER BY pinned DESC, date DESC. Normalizar pinned → bool, image_url → image. `index()`: wrapper que retorna JSON. Público via ResponseCache.
- **Critério de pronto:** GET `/licenciadas/results` retorna array ordenado com pinned no topo; campo 'image' no lugar de 'image_url'
- **Confidência:** 🟢 CONFIRMADO

### T02: Cadastrar resultado
- **Arquivo legado:** `Controllers/ResultController.php`
- **Descrição:** Implementar `store()`: recebe JSON, valida image/image_url, INSERT com description, category, image_url, date, licenciada_id, pinned. Retorna id.
- **Critério de pronto:** POST `/admin/results` com dados válidos retorna `{success, id}`
- **Confidência:** 🟢 CONFIRMADO

### T03: Atualizar resultado com mapeamento dinâmico
- **Arquivo legado:** `Controllers/ResultController.php`
- **Descrição:** Implementar `update(id)`: recebe JSON com campos parciais, mapeia via array (front→db): description, category, image/image_url, date, licenciadaId/licenciada_id, pinned. UPDATE apenas campos fornecidos.
- **Critério de pronto:** PUT `/admin/results/:id` com campos parciais atualiza apenas eles
- **Confidência:** 🟢 CONFIRMADO

### T04: Excluir resultado
- **Arquivo legado:** `Controllers/ResultController.php`
- **Descrição:** Implementar `destroy(id)`: DELETE FROM results WHERE id = ?.
- **Critério de pronto:** DELETE `/admin/results/:id` retorna `{success}`
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Testar listagem com pinned e ordenação
- [ ] TT-02: Testar CRUD completo de resultado

## Ordem Sugerida

1. T01 (listagem) — funcionalidade principal pública
2. T02 (store) — cadastro admin
3. T03 (update) — atualização
4. T04 (destroy) — exclusão

## Lacunas Pendentes (🔴)

- Estratégia de upload de imagem (URL externa vs upload local) não confirmada
- Validação de dimensões/formato de imagem não identificada
