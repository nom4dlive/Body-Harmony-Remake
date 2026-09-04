# Design: Broadcast

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/v1/broadcasts/active` | — | `{broadcasts[]}` | 200 |
| GET | `/v1/broadcasts/history` | — | `{history[]}` | 200 |
| POST | `/v1/broadcasts/acknowledge` | `{id}` | `{success}` | 200 |
| POST | `/admin/broadcasts/manage` | `{action, title, message, type, target_roles, is_blocking}` | `{success}` | 200, 400 |
| DELETE | `/admin/broadcasts/:id` | — | `{success}` | 200, 404 |

## Entidades

### system_broadcasts

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | Sim | PK auto-increment |
| title | varchar | Sim | Título do comunicado |
| message | text | Sim | Corpo da mensagem |
| type | varchar | Sim | info, warning, alert |
| target_roles | json | Sim | Array JSON de roles alvo |
| is_active | tinyint | Sim | 1 = ativo, 0 = inativo |
| is_blocking | tinyint | Sim | 1 = bloqueante (acknowledge obrigatório) |

### system_broadcast_logs

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | Sim | PK auto-increment |
| broadcast_id | int | Sim | FK para system_broadcasts |
| user_id | int | Sim | ID do usuário que leu |
| user_type | varchar | Sim | Tipo de usuário (admin, licenciada) |
| read_at | datetime | Sim | Timestamp da leitura |

## Fluxo Principal: Listar Broadcasts Ativos

1. Usuário autenticado faz GET `/v1/broadcasts/active` 🟢
2. `BroadcastController::getActive()`: SELECT com LEFT JOIN em system_broadcast_logs 🟢
3. Filtra por target_roles contendo role do usuário + is_active=1 🟢
4. Filtra apenas registros SEM log de leitura (NULL check) 🟢
5. Retorna `{broadcasts: [...]}` 🟢

## Fluxo Principal: Acknowledge

1. Usuário faz POST `/v1/broadcasts/acknowledge` com `{id}` 🟢
2. INSERT em system_broadcast_logs com broadcast_id, user_id, user_type, read_at 🟢
3. Broadcast some da lista de ativos 🟢

## Fluxo Especial: Broadcast Bloqueante

1. Broadcast com is_blocking=1 é listado em `getActive()` 🟢
2. Usuário NÃO pode navegar até executar acknowledge no broadcast 🟢
3. Após acknowledge, fluxo normal é restaurado 🟢

## Expiração

- Broadcasts expiram automaticamente após 7 dias da criação 🟢
- Broadcasts expirados não aparecem mais em `getActive()` mesmo sem acknowledge 🟢

## Fluxo Principal: Gerenciar Broadcast

1. Admin faz POST `/admin/broadcasts/manage` com action (create/update) e dados 🟢
2. Se create: INSERT em system_broadcasts com title, message, type, target_roles, is_blocking 🟢
3. Se update: UPDATE broadcast existente 🟢
4. Retorna `{success}` 🟢

## Fluxo Principal: Excluir Broadcast

1. Admin faz DELETE `/admin/broadcasts/:id` 🟢
2. DELETE FROM system_broadcast_logs WHERE broadcast_id = id (transação) 🟢
3. DELETE FROM system_broadcasts WHERE id = id (transação) 🟢
4. Retorna `{success}` 🟢

## Dependências

- Core: `Response.php`
- Tabelas: `system_broadcasts`, `system_broadcast_logs`

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Targeting por role via JSON array | `BroadcastController.php:53` | 🟢 |
| Filtro de não lidos via LEFT JOIN com NULL | `BroadcastController.php:42` | 🟢 |
| Deleção em cascata manual (2 DELETEs em transação) | `BroadcastController.php:172` | 🟢 |

## Riscos e Lacunas

- 🔴 Existe agendamento de broadcasts (data programada)?
