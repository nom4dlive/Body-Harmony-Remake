# Tasks: Conteúdo (Content)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabela `mentors` criada no MySQL com schema: id, name, nickname, role, bio, photo_url, instagram
- [ ] Core Response.php disponível

## Tarefas

### T01: Listar mentores (GET público)
- **Arquivo legado:** `Controllers/ContentController.php`
- **Descrição:** Implementar `getMentors()` que consulta tabela `mentors` e retorna JSON array. Rota pública sem autenticação.
- **Critério de pronto:** GET `/api/v1/content/mentors` retorna `{mentors: [...]}`
- **Confidência:** 🟢 CONFIRMADO

### T02: Cadastrar mentor (POST autenticado)
- **Arquivo legado:** `Controllers/ContentController.php`
- **Descrição:** Implementar `storeMentor()` que recebe multipart form com name, nickname, role, bio, photo, instagram. Faz upload da foto, salva registro, retorna id.
- **Critério de pronto:** POST com dados válidos retorna `{id}` e mentor aparece na listagem
- **Confidência:** 🟢 CONFIRMADO

### T03: Atualizar mentor (PUT autenticado)
- **Arquivo legado:** `Controllers/ContentController.php`
- **Descrição:** Implementar `updateMentor(id, data)` que atualiza campos fornecidos. Se nova foto enviada, substitui anterior.
- **Critério de pronto:** PUT com dados parciais retorna `{success}` e alterações refletem no GET
- **Confidência:** 🟢 CONFIRMADO

### T04: Excluir mentor (DELETE autenticado)
- **Arquivo legado:** `Controllers/ContentController.php`
- **Descrição:** Implementar `deleteMentor(id)` que remove registro da tabela `mentors`.
- **Critério de pronto:** DELETE retorna success e mentor não aparece mais na listagem
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Testar CRUD completo de mentor
- [ ] TT-02: Testar listagem pública sem autenticação

## Ordem Sugerida

1. T01 (GET público) — independente
2. T02 (POST) — cadastro
3. T03 (PUT) — atualização
4. T04 (DELETE) — exclusão

## Lacunas Pendentes (🔴)

- Validação de upload (tamanho máximo, tipos MIME permitidos) não identificada
- Estratégia de armazenamento de fotos (local filesystem vs CDN) não confirmada
