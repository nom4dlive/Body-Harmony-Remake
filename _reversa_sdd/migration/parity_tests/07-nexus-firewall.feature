# language: pt
# spec-id: PT-007
# rastreabilidade:
#   process_flows: nexus/firewall
#   target_architecture: Nexus Module (NexusRule aggregate)
#   paradigma_alvo: OO com DI
#   regras: BR-MIGRAR-032, BR-MIGRAR-033, BR-MIGRAR-034, BR-MIGRAR-037, BR-MIGRAR-043, BR-MIGRAR-044

Funcionalidade: Firewall de IP e auditoria do Nexus
  Como admin do Nexus
  Quero gerenciar regras de firewall e auditar operações
  Para proteger o sistema contra acessos maliciosos

  @paridade @composicao @critico
  Cenário: Regra BAN é criada e aplicada
    Dado que um admin logado cria uma regra BAN para IP "192.168.1.100" com duração de 24h
    Quando o IP "192.168.1.100" tenta acessar qualquer rota autenticada
    Então o sistema retorna status 403 (Forbidden)
    E um log de auditoria registra admin_id, ação "add_rule", target_id da regra
    E o payload_before/payload_after são registrados na auditoria

  @paridade @composicao
  Cenário: Regra ALLOW sobrescreve BAN
    Dado que existe uma regra BAN ativa para IP "10.0.0.50"
    Quando um admin cria uma regra ALLOW para o mesmo IP "10.0.0.50"
    Então o IP "10.0.0.50" consegue acessar o sistema
    E a regra ALLOW tem prioridade sobre BAN

  @paridade @composicao
  Cenário: Regra temporária expira automaticamente
    Dado que existe uma regra SUSPICIOUS para IP "172.16.0.1" com expires_at = 1 hora atrás
    Quando o IP "172.16.0.1" tenta acessar o sistema
    Então o acesso é permitido (regra expirada)

  @paridade @composicao
  Cenário: Detecção de compartilhamento de conta (>3 devices ou >2 IPv4 em 72h)
    Dado que uma licenciada tem 4 dispositivos ativos com IPs diferentes nas últimas 72h
    Quando o sistema executa a verificação de anomalias
    Então um alerta de compartilhamento de conta é gerado (apenas informativo)
    E IPs IPv6 são ignorados na contagem (BR-MIGRAR-044)
