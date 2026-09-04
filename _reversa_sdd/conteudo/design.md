# Design: Conteúdo (Content)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/api/v1/content/mentors` | — | `{mentors[]}` | 200 |
| POST | `/api/v1/content/mentors` | `{name, nickname, role, bio, photo, instagram}` (multipart) | `{id}` | 201, 400 |
| PUT | `/api/v1/content/mentors/:id` | `{name, nickname, role, bio, photo?, instagram}` | `{success}` | 200, 400 |
| DELETE | `/api/v1/content/mentors/:id` | — | `void (exit)` | 200, 404 |

## Entidade: mentors

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | Sim | PK auto-increment |
| name | varchar | Sim | Nome completo |
| nickname | varchar | Não | Apelido |
| role | varchar | Sim | Cargo/função |
| bio | text | Não | Biografia |
| photo_url | varchar | Não | URL da foto |
| instagram | varchar | Não | Usuário do Instagram |

## Fluxo Principal: Listar Mentores

1. GET `/api/v1/content/mentors` sem autenticação 🟢
2. `ContentController::getMentors()` consulta tabela `mentors` 🟢
3. Retorna JSON com array de mentores 🟢

## Fluxo Principal: Cadastrar Mentor

1. POST `/api/v1/content/mentors` multipart com dados + foto 🟢
2. `ContentController::storeMentor()` recebe dados, faz upload da foto 🟢
3. Salva registro na tabela `mentors` 🟢
4. Retorna `{id}` do novo mentor 🟢

## Fluxo Principal: Atualizar Mentor

1. PUT `/api/v1/content/mentors/:id` com dados parciais 🟢
2. `ContentController::updateMentor()` atualiza campos fornecidos 🟢
3. Se nova foto enviada, substitui a anterior 🟢
4. Retorna `{success}` 🟢

## Dependências

- Core: `Response.php`

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Upload de foto como parte do cadastro (multipart) | `ContentController.php` | 🟢 |
| GET público sem autenticação | `ContentController.php` | 🟡 |

## Riscos e Lacunas

- 🟡 Validação de upload (tamanho, tipo MIME) não confirmada no código analisado
- 🔴 Como o upload de foto é processado (armazenamento local vs cloud)?
- 🔴 Existe cache na listagem pública?
