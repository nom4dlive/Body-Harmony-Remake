# Design: FAQ

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/faq` | — | `[{id, question, answer, display_order}]` | 200 |
| POST | `/admin/faq` | `{question, answer, display_order}` | `{id}` | 201, 400 |
| PUT | `/admin/faq/:id` | `{question?, answer?, display_order?}` | `{success}` | 200, 400 |
| DELETE | `/admin/faq/:id` | — | `{success}` | 200 |

## Entidade: faq

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | Sim | PK auto-increment |
| question | varchar | Sim | Pergunta |
| answer | text | Não | Resposta |
| display_order | int | Não | Ordem de exibição (padrão 0) |

## Fluxo Principal: Listar FAQs

1. GET `/faq` público 🟢
2. `FaqController::getData()`: SELECT * FROM faq ORDER BY display_order ASC, id ASC 🟢
3. Retorna JSON array de FAQs 🟢

## Fluxo Principal: Cadastrar FAQ

1. POST `/admin/faq` com `{question, answer?, display_order?}` 🟢
2. `FaqController::store()`: valida question não vazio 🟢
3. INSERT com question, answer, display_order 🟢
4. Retorna `{success, id}` 🟢

## Dependências

- Core: `Response.php`

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Ordenação composta display_order + id | `FaqController.php:17` | 🟢 |
| Question obrigatório, answer opcional | `FaqController.php:29` | 🟢 |

## Riscos e Lacunas

- 🟡 Existe cache na listagem pública?
- 🔴 Existem FAQs setoriais (por perfil de usuário)?
