# Requirements: Doctor Harmony (Mentoria IA)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Sistema de mentoria clínica com IA usando Google Gemini Vision. Licenciadas enviam casos clínicos (foto + anotações), recebem análise da IA com score de confiança. Casos com baixa confiança ou crise detectada vão para revisão humana híbrida. Inclui controle de créditos por licença, sessões de mentoria e configuração admin.

## Responsabilidades

- Análise de caso clínico via Gemini Vision (foto + anotações)
- Controle de créditos de IA por licença (total/usados, admin bypass)
- Detecção de crise (palavras de desistência → revisão prioritária)
- Revisão híbrida: confiança < 80% → revisão humana obrigatória
- Sessões de mentoria (salvar/carregar estado da conversa)
- Gerenciamento admin: config, audit logs, health check, sandbox
- LGPD consent: dados pessoais só enviados se ai_usage=true

## Regras de Negócio

- Créditos de IA controlados por license (total/used); admin tem bypass 🟢
- Crisis detection: palavras de desistência forçam PENDING + needs_review 🟢
- LGPD Consent: dados pessoais só enviados se ai_usage=true 🟢
- Hybrid Review: confidence < threshold (0.80) = revisão humana obrigatória 🟢
- Apenas superadmin pode alterar configurações da IA 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Enviar caso clínico para análise IA | Must | Foto + anotações enviadas; retorna análise com confidence |
| RF-02 | Verificar créditos disponíveis | Must | Retorna total/usados/history |
| RF-03 | Histórico de mensagens da mentoria | Must | Mensagens anteriores carregadas |
| RF-04 | Detecção de crise | Must | Palavras de desistência marcam needs_review |
| RF-05 | Revisão humana de casos pendentes | Must | Mentor vê casos PENDING e submete feedback |
| RF-06 | Sessão de mentoria (save/load) | Should | Estado da conversa persiste entre interações |
| RF-07 | Admin: configurar IA | Should | Limites, prompts, parâmetros configuráveis |
| RF-08 | Admin: sandbox para testes | Should | Testar análise sem consumir créditos |
| RF-09 | Admin: audit logs da IA | Should | Logs de interações e uso |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Timeout em chamadas Gemini (30s inferido) | `GeminiService.php` | 🟡 |
| Segurança | LGPD consent check antes de enviar dados | `DoctorHarmonyController.php:223` | 🟢 |
| Disponibilidade | Health check endpoint para monitoramento | `AdminDoctorHarmonyController.php` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma licenciada com créditos disponíveis
Quando envia caso clínico com foto e anotações
Então recebe análise da IA com confidence_score

Dado que confidence_score < 0.80
Quando análise é concluída
Então caso vai para revisão humana (needs_review=1)

Dado que texto contém palavras de desistência
Quando análise é concluída
Então status=PENDING e needs_review=1
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Análise de caso | Must | Funcionalidade principal |
| Créditos | Must | Controle de uso |
| Crisis detection | Must | Segurança do aluno |
| Revisão híbrida | Must | Qualidade da mentoria |
| Sessão de mentoria | Should | Continuidade da conversa |
| Admin sandbox | Could | Testes admin |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/DoctorHarmonyController.php` | `analyze`, `getCredits`, `getHistory`, `getPendingCases`, `submitReview`, `getSession`, `saveSession` | 🟢 |
| `Controllers/AdminDoctorHarmonyController.php` | `getConfig`, `updateConfig`, `getAuditLogs`, `healthCheck`, `runSandbox` | 🟢 |
| `libs/GeminiService.php` | Integração Gemini API | 🟢 |
