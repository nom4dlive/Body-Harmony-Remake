# Design: Resultados

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

### Endpoints

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/licenciadas/results` | — | `[{description, category, image, date, pinned}]` | 200 |
| POST | `/admin/results` | `{description, category, image, date, licenciada_id, pinned}` | `{id}` | 201, 400 |
| PUT | `/admin/results/:id` | `{description?, category?, image?, date?, pinned?}` | `{success}` | 200, 400 |
| DELETE | `/admin/results/:id` | — | `{success}` | 200 |

### Entidade: results

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | Sim | PK auto-increment |
| description | varchar | Não | Descrição do resultado |
| category | varchar | Não | Categoria (ex: corporal, facial) |
| image_url | varchar | Sim | URL da imagem |
| date | date | Sim | Data do resultado |
| licenciada_id | int | Não | FK para licenciada responsável |
| pinned | tinyint | Não | 1 = fixado no topo |

## Fluxo Principal: Listar Resultados

1. GET `/licenciadas/results` (público, via ResponseCache) 🟢
2. `ResultController::getData()` consulta `SELECT * FROM results ORDER BY pinned DESC, date DESC` 🟢
3. Normaliza: pinned → bool, image_url → image 🟢
4. Retorna array de resultados 🟢

## Fluxo Principal: Cadastrar Resultado

1. Admin autenticado faz POST `/admin/results` com `{image, description, category, date, pinned}` 🟢
2. `ResultController::store()` valida presença de image/image_url 🟢
3. INSERT na tabela `results` 🟢
4. Retorna `{success, id}` 🟢

## Fluxo Principal: Atualizar Resultado

1. PUT `/admin/results/:id` com campos a alterar 🟢
2. `ResultController::update()` mapeia campos frontend→DB dinamicamente 🟢
3. UPDATE na tabela `results` apenas com campos fornecidos 🟢
4. Retorna `{success}` 🟢

## Dependências

- Core: `Response.php`, `ResponseCache.php`

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Normalização de campo image_url → image na response | `ResultController.php:23` | 🟢 |
| Mapeamento dinâmico front→db via array de map | `ResultController.php:77-86` | 🟢 |
| Ordenação pinned + date descendente | `ResultController.php:18` | 🟢 |

## Riscos e Lacunas

- 🟡 Uso de ResponseCache na listagem não confirmado diretamente
- 🔴 Existe validação de URL de imagem (dimensões, formato)?
