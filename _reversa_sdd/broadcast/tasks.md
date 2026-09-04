# Tasks: Broadcast

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabelas `system_broadcasts` e `system_broadcast_logs` criadas no MySQL
- [ ] Core Response.php disponível

## Tarefas

### T01: Listar broadcasts ativos com filtro por role e não lidos
- **Arquivo legado:** `Controllers/BroadcastController.php`
- **Descrição:** Implementar `getActive()`: SELECT de system_broadcasts com LEFT JOIN system_broadcast_logs, filtro por is_active=1, target_roles contém role do usuário, e sem log de leitura (broadcast_logs.id IS NULL). Retorna `{broadcasts[]}`.
- **Critério de pronto:** Usuário vê apenas broadcasts não lidos e compatíveis com sua role
- **Confidência:** 🟢 CONFIRMADO

### T02: Acknowledge de broadcast
- **Arquivo legado:** `Controllers/BroadcastController.php`
- **Descrição:** Implementar `acknowledge()`: recebe `{id}`, INSERT em system_broadcast_logs com broadcast_id, user_id, user_type, read_at.
- **Critério de pronto:** POST acknowledge cria log e broadcast some da lista ativa
- **Confidência:** 🟢 CONFIRMADO

### T03: Histórico de broadcasts
- **Arquivo legado:** `Controllers/BroadcastController.php`
- **Descrição:** Implementar `getHistory()`: SELECT de system_broadcasts com INNER JOIN system_broadcast_logs, filtrado pelo user_id logado. Ordenado por read_at DESC.
- **Critério de pronto:** GET history retorna broadcasts já lidos
- **Confidência:** 🟢 CONFIRMADO

### T04: Gerenciar broadcast (CRUD admin)
- **Arquivo legado:** `Controllers/BroadcastController.php`
- **Descrição:** Implementar `manage()`: recebe action (create/update) com title, message, type, target_roles (JSON), is_blocking, is_active. INSERT ou UPDATE conforme action.
- **Critério de pronto:** Admin cria/edita broadcast com todos os campos
- **Confidência:** 🟢 CONFIRMADO

### T05: Excluir broadcast com logs
- **Arquivo legado:** `Controllers/BroadcastController.php`
- **Descrição:** Implementar `delete(id)`: DELETE logs associados + DELETE broadcast em transação. Se broadcast não existir, 404.
- **Critério de pronto:** DELETE remove broadcast + logs; broadcast inexistente retorna 404
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Testar visibilidade de broadcasts por role
- [ ] TT-02: Testar acknowledge e sumiço da lista ativa
- [ ] TT-03: Testar exclusão em transação

## Ordem Sugerida

1. T01 (listagem ativa) — funcionalidade principal
2. T02 (acknowledge) — interação do usuário
3. T03 (histórico) — consulta
4. T04 (manage) — CRUD admin
5. T05 (delete) — exclusão

## Lacunas Pendentes (🔴)

- Comportamento de broadcasts bloqueantes (is_blocking) não detalhado
- Agendamento ou expiração automática de broadcasts não confirmados
