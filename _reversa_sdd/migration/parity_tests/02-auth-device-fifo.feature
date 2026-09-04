# language: pt
# spec-id: PT-002
# rastreabilidade:
#   process_flows: autenticacao/device-management
#   target_architecture: Auth Module, Licenciada Module
#   paradigma_alvo: OO com DI
#   regras: BR-MIGRAR-003, BR-MIGRAR-008

Funcionalidade: Gerenciamento de dispositivos com FIFO
  Como licenciada
  Quero gerenciar meus dispositivos autorizados
  Para garantir segurança e limite de sessões simultâneas

  @paridade @composicao @critico
  Cenário: Licenciada atinge limite de dispositivos e expulsa o mais antigo (FIFO)
    Dado que existe uma licenciada com max_devices = 2
    E a licenciada já tem 2 dispositivos ativos (device_A e device_B)
    Quando a licenciada faz login de um novo dispositivo (device_C)
    Então o dispositivo mais antigo (device_A) é desativado
    E o novo dispositivo (device_C) é ativado
    E a licenciada ainda tem exatamente 2 dispositivos ativos

  @paridade @composicao
  Cenário: Aluna tem limite de 1 dispositivo simultâneo
    Dado que existe uma aluna com max_devices = 1
    E a aluna já tem 1 dispositivo ativo (device_X)
    Quando a aluna faz login de um novo dispositivo (device_Y)
    Então o dispositivo anterior (device_X) é desativado
    E o novo dispositivo (device_Y) é o único ativo

  @paridade @composicao
  Cenário: Fingerprint hash evita proliferação de registros
    Dado que uma licenciada já fez login do dispositivo "chrome-notebook" com fingerprint_hash "abc123"
    Quando a licenciada faz login novamente do mesmo dispositivo
    Então nenhum novo registro de dispositivo é criado
    E o dispositivo existente tem seu timestamp atualizado
