# language: pt
# spec-id: PT-003
# rastreabilidade:
#   process_flows: admin/impersonation
#   target_architecture: Auth Module, Admin Module
#   paradigma_alvo: OO com DI
#   regras: BR-MIGRAR-004, BR-MIGRAR-021

Funcionalidade: Impersonação de licenciada por admin
  Como admin
  Quero logar como licenciada para suporte e debug
  Para resolver problemas sem precisar da senha da licenciada

  @paridade @composicao @critico
  Cenário: Admin impersona licenciada com sucesso
    Dado que existe um admin logado com permissão de suporte
    E existe uma licenciada ativa com id 42
    Quando o admin solicita login como licenciada 42
    Então o sistema retorna um token de acesso como se fosse a licenciada
    E um log de auditoria é registrado com admin_id, ação "impersonate", target_id 42

  @paridade @composicao
  Cenário: Admin sem permissão não pode impersonar
    Dado que existe um admin logado SEM permissão de suporte
    Quando o admin tenta logar como licenciada 42
    Então o sistema retorna status 403 (Forbidden)
    E um log de auditoria é registrado com admin_id, ação "impersonate_denied"

  @paridade @composicao
  Cenário: Superadmin executa reset de lifecycle em licenciada
    Dado que existe um superadmin logado
    E existe uma licenciada com dispositivo ativo, LGPD pendente e throttling em vigor
    Quando o superadmin executa reset_lifecycle na licenciada
    Então a senha é forçada a "Mudar123!" com flag force_password_change
    E o consentimento LGPD é revogado
    E todos os dispositivos são limpos
    E o throttling é zerado
