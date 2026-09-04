# language: pt
# spec-id: PT-004
# rastreabilidade:
#   process_flows: lms/progression
#   target_architecture: LMS Module, Aluna Module
#   paradigma_alvo: OO com DI
#   regras: BR-MIGRAR-009, BR-MIGRAR-010, BR-MIGRAR-022, BR-MIGRAR-023, BR-MIGRAR-024, BR-MIGRAR-025

Funcionalidade: Progressão de módulos com Strict Progression Lock
  Como aluna
  Quero progredir pelos módulos do curso
  Para completar o conteúdo e obter certificado

  @paridade @composicao @critico
  Cenário: Módulo N+1 bloqueado até quiz do módulo N ser aprovado
    Dado que existe um curso com 3 módulos (M1, M2, M3) em ordem sequencial
    E a aluna tem acesso aos 3 módulos via aluna_course_access
    Quando a aluna acessa a lista de módulos
    Então o módulo M1 está disponível (desbloqueado)
    E os módulos M2 e M3 estão bloqueados
    Quando a aluna completa todas as aulas de M1
    E submete o quiz de M1 com score >= 70 (min_score)
    Então o módulo M2 é desbloqueado
    E M3 continua bloqueado

  @paridade @composicao
  Cenário: Certificado emitido apenas quando 100% das aulas concluídas e quiz aprovado
    Dado que a aluna completou todas as aulas do módulo M1
    E o quiz de M1 foi aprovado com score >= 70
    Quando a aluna solicita o certificado de M1
    Então o sistema retorna o PDF do certificado
    E o hash do certificado é SHA-256(user_id + module_id + timestamp + secret)

  @paridade @composicao
  Cenário: Quiz com questões e opções embaralhadas
    Dado que existe um quiz com 5 questões em ordem fixa (Q1, Q2, Q3, Q4, Q5)
    Quando a aluna inicia o quiz
    Então as questões aparecem em ordem diferente da original
    E as opções de cada questão também estão embaralhadas
    E duas tentativas consecutivas da mesma aluna têm ordens diferentes

  @paridade @composicao
  Cenário: Acesso a módulo expirado é bloqueado
    Dado que a aluna tem acesso ao módulo M1 com expires_at no passado
    Quando a aluna tenta acessar o módulo M1
    Então o sistema retorna status 403 (Forbidden)
    E a mensagem informa que o acesso expirou
