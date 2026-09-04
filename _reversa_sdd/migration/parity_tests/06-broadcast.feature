# language: pt
# spec-id: PT-006
# rastreabilidade:
#   process_flows: broadcast/management
#   target_architecture: Broadcast Module
#   paradigma_alvo: OO com DI
#   regras: BR-MIGRAR-038, BR-MIGRAR-039, BR-MIGRAR-040, BR-MIGRAR-041, BR-MIGRAR-042

Funcionalidade: Gerenciamento de broadcasts
  Como admin
  Quero criar comunicados direcionados
  Para informar licenciadas e alunas sobre atualizações importantes

  @paridade @composicao
  Cenário: Broadcast é criado e exibido apenas para o perfil alvo
    Dado que existe um broadcast com target_roles = ["licenciada"]
    Quando uma licenciada acessa seus broadcasts ativos
    Então ela vê o broadcast na lista
    Quando uma aluna acessa seus broadcasts ativos
    Então ela NÃO vê o broadcast (perfil diferente)

  @paridade @composicao @critico
  Cenário: Broadcast bloqueante exige acknowledge
    Dado que existe um broadcast com is_blocking = true
    E uma licenciada tem esse broadcast como não lido
    Quando a licenciada tenta navegar para qualquer rota
    Então o sistema exibe o broadcast como modal no topo (banner)
    E a navegação não é bloqueada (banner não-bloqueante conforme decisão BR-HUMANA-003)
    Quando a licenciada clica em "OK" no banner
    Então o acknowledge é registrado em system_broadcast_logs
    E o broadcast não é mais exibido

  @paridade @composicao
  Cenário: Broadcast expirado não é exibido
    Dado que existe um broadcast criado há 8 dias (expires_at = 7 dias)
    Quando uma licenciada acessa broadcasts ativos
    Então o broadcast expirado não aparece na lista

  @paridade @composicao
  Cenário: Histório de leitura é mantido
    Dado que uma licenciada leu e deu acknowledge em 3 broadcasts
    Quando o admin acessa o histórico de um broadcast
    Então os registros de acknowledge estão disponíveis em system_broadcast_logs
    E cada registro contém user_id, broadcast_id e timestamp
