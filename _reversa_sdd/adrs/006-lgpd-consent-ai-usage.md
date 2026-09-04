# ADR-006: LGPD Consent para Uso de Dados na IA

**Data**: Inferido ~Phase 4
**Confiança**: 🟢 CONFIRMADO

## Contexto
A Doctor Harmony precisa de dados pessoais da licenciada (nome, contexto da aula) para personalizar as respostas. No entanto, a LGPD brasileira exige consentimento explícito para uso de dados pessoais em sistemas de IA.

## Decisão
Implementar consentimento LGPD granular:
- Campo `licenciadas.lgpd_status` (JSON) armazena consentimentos individuais
- Chave `ai_usage`: true = permite usar dados pessoais na IA
- Se consentimento negado: modo anônimo com resposta genérica
- Sistema de Privacy Settings no frontend para a licenciada gerenciar

## Alternativas Consideradas
- **Ignorar LGPD**: Risco legal inaceitável
- **Consentimento único (tudo ou nada)**: Muito restritivo
- **Consentimento granular**: Licenciada escolhe o que compartilhar

## Consequências
- Positivo: Conformidade com LGPD
- Positivo: Licenciada tem controle sobre seus dados
- Positivo: IA ainda funciona em modo anônimo (embora menos personalizada)
- Negativo: Complexidade adicional de lógica (checagem de consentimento em todo analyze)
- Negativo: UX — licenciada precisa entender e configurar as permissões
