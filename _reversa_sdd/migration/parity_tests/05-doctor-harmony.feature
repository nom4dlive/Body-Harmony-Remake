# language: pt
# spec-id: PT-005
# rastreabilidade:
#   process_flows: doctor-harmony/case-analysis
#   target_architecture: DoctorHarmony Module
#   paradigma_alvo: OO com DI
#   regras: BR-MIGRAR-027, BR-MIGRAR-028, BR-MIGRAR-029, BR-MIGRAR-030, BR-MIGRAR-031

Funcionalidade: Análise de caso clínico com DoctorHarmony
  Como licenciada
  Quero submeter casos clínicos para análise de IA
  Para receber orientação sobre os protocolos da aluna

  @paridade @composicao @critico
  Cenário: Caso clínico é analisado com sucesso
    Dado que a licenciada tem créditos de IA disponíveis (used < total)
    E a licenciada consentiu o uso de dados via LGPD (ai_usage = true)
    Quando a licenciada submete um caso clínico com fotos e anotações
    Então o sistema retorna a análise da IA com confidence >= 0.80
    E os créditos de IA são decrementados (used += 1)
    E o caso é registrado como COMPLETED

  @paridade @composicao @critico
  Cenário: Crisis detection ativada por palavras de desistência
    Dado que a licenciada submete um caso contendo palavras como "desistir" ou "parar"
    Quando o caso é analisado pela IA
    Então o status do caso é PENDING (não COMPLETED)
    E o caso é marcado com needs_review = true
    E uma notificação é enviada para revisão humana prioritária

  @paridade @composicao
  Cenário: Hybrid Review ativado por baixa confiança
    Dado que a licenciada submete um caso
    E a IA retorna confidence = 0.65 (abaixo do threshold 0.80)
    Quando o caso é processado
    Então o status do caso é PENDING
    E o caso é marcado com needs_review = true
    E a análise aguarda revisão humana antes de ser disponibilizada

  @paridade @composicao
  Cenário: Licenciada sem LGPD consent não pode enviar dados pessoais
    Dado que a licenciada tem ai_usage = false
    Quando a licenciada tenta submeter um caso com dados pessoais
    Então o sistema retorna status 403 (Forbidden)
    E a mensagem informa que o consentimento LGPD é obrigatório

  @paridade @composicao
  Cenário: Admin com bypass de créditos pode analisar sem limite
    Dado que um admin logado tem bypass de créditos
    Quando o admin submete um caso clínico
    Então a análise é processada mesmo sem créditos disponíveis
    E nenhum crédito é debitado
