# Requirements: Broadcast

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Sistema de comunicados e broadcasts do Body Harmony. Admin cria mensagens direcionadas por perfil de usuário (role) com tracking de leitura obrigatório e suporte a broadcasts bloqueantes.

## Responsabilidades

- Criar comunicados com targeting por role (target_roles em JSON)
- Listar broadcasts ativos (não lidos pelo usuário logado)
- Listar histórico de broadcasts lidos
- Marcar broadcast como lido (acknowledge)
- Gerenciar (criar/editar) e excluir broadcasts
- Deleção em transação (broadcast + logs)

## Regras de Negócio

- Broadcasts são filtrados por target_roles (JSON array de roles) 🟢
- GET `/v1/broadcasts/active` retorna apenas NÃO LIDOS (LEFT JOIN com NULL check) 🟢
- Deleção de broadcast remove logs em transação 🟢
- Broadcasts bloqueantes (is_blocking=1) impedem o usuário de navegar até fazer acknowledge 🟢
- Histórico mantém log de leitura por usuário (system_broadcast_logs) 🟢
- Tipo de broadcast define comportamento visual (info, warning, alert) 🟢
- Broadcasts expiram automaticamente após 7 dias 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listar broadcasts ativos (GET público autenticado) | Must | Retorna broadcasts não lidos, filtrados por role do usuário |
| RF-02 | Listar histórico (GET autenticado) | Should | Retorna broadcasts já lidos pelo usuário |
| RF-03 | Marcar como lido (POST acknowledge) | Must | Registra leitura em system_broadcast_logs |
| RF-04 | Criar/editar broadcast (POST manage) | Must | Admin cria comunicado com título, mensagem, tipo, target_roles |
| RF-05 | Excluir broadcast (DELETE admin) | Should | Remove broadcast e logs associados em transação |
| RF-06 | Broadcasts bloqueantes | Should | Impede fluxo até usuário acknowledge |

## Critérios de Aceitação

```gherkin
Dado que um usuário logado acessa o sistema
Quando existem broadcasts ativos não lidos
Então os broadcasts são exibidos filtrados por sua role

Dado que um usuário visualiza um broadcast
Quando clica em acknowledge
Então registro de leitura é criado e broadcast não aparece mais como ativo

Dado que admin cria um broadcast
Quando define target_roles como ["admin", "licenciada"]
Então apenas admins e licenciadas veem o broadcast

Dado que admin exclui um broadcast
Quando confirma a exclusão
Então broadcast e seus logs de leitura são removidos em transação
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Listar broadcasts ativos | Must | Funcionalidade principal |
| Acknowledge | Must | Tracking obrigatório |
| Criar/editar broadcast | Must | Admin precisa comunicar |
| Histórico | Should | Consulta de leituras |
| Excluir broadcast | Should | Limpeza de comunicados |
| Broadcasts bloqueantes | Should | Bloqueio de navegação até acknowledge |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/BroadcastController.php` | `index`, `getActive`, `getHistory`, `acknowledge`, `manage`, `delete` | 🟢 |
| `admin/signal_tower/broadcasts.php` | Signal Tower broadcasts | 🟢 |
