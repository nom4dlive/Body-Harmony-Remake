# language: pt
# spec-id: PT-001
# rastreabilidade:
#   process_flows: autenticacao/login
#   target_architecture: Auth Module
#   paradigma_alvo: OO com DI
#   regras: BR-MIGRAR-001, BR-MIGRAR-002, BR-MIGRAR-007

Funcionalidade: Login com controle de tentativas e throttling
  Como licenciada ou aluna
  Quero fazer login no sistema
  Para acessar meu dashboard e conteúdo

  @paridade @composicao @critico
  Cenário: Login bem-sucedido com credenciais válidas
    Dado que existe uma licenciada ativa com email "maria@exemplo.com" e senha "Senha123!"
    Quando a licenciada faz login com email "maria@exemplo.com" e senha "Senha123!"
    Então o sistema retorna status 200 com um token de acesso
    E o token tem o prefixo "lic_" (ou "al_" para aluna)
    E o dispositivo é registrado com fingerprint hash

  @paridade @composicao @critico
  Cenário: Bloqueio de conta após 3 tentativas falhas consecutivas
    Dado que existe uma licenciada ativa com email "maria@exemplo.com" e senha "Senha123!"
    Quando a licenciada tenta login com senha incorreta 3 vezes consecutivas
    Então na terceira tentativa o sistema retorna status 429 (Too Many Requests)
    E a conta fica bloqueada por 15 minutos
    E mesmo com senha correta, o login é recusado durante o bloqueio
    E após 15 minutos, o login com senha correta funciona novamente

  @paridade @composicao
  Cenário: Dual-layer throttling (conta + IP)
    Dado que existem 3 contas diferentes no mesmo IP
    Quando cada conta tenta login com senha incorreta 20 vezes
    Então a partir da 50ª tentativa total do IP, o sistema retorna status 429
    E throttling de conta individual também é respeitado (3 falhas por conta)
