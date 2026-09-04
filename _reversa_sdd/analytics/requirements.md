# Requirements: Analytics (Watchtower & War Room)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Sistema de analytics e monitoramento do Body Harmony: Watchtower dashboard com métricas de sessões ativas e alertas de segurança, War Room com análises profundas (DAU, dispositivos, churn risk), logs de acesso e estatísticas do bot do Telegram.

## Responsabilidades

- Watchtower: dashboard de segurança com sessões ativas e detecção de compartilhamento de credenciais
- War Room: métricas de engajamento (DAU, dispositivos por usuário, churn risk)
- Logs de acesso paginados com filtros
- Alertas de segurança: >3 dispositivos OU >2 IPv4 em 72h = compartilhamento de conta
- Estatísticas do bot do Telegram (cadastros pendentes/aprovados/rejeitados)

## Regras de Negócio

- Security Alert: >3 devices OU >2 IPv4 em 72h = compartilhamento de conta 🟢
- IPv6 ignorado em alerts (CGNAT causa falsos positivos) 🟢
- Churn Risk: licenciadas inativas >15 dias 🟢
- Alertas são apenas informativos — não executam ações corretivas 🟡

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listar logs de acesso paginados | Must | Logs com page/limit; retorna total |
| RF-02 | Watchtower full dashboard | Must | Sessões ativas, alertas, logs recentes |
| RF-03 | War Room analytics | Must | DAU, dispositivos, churn risk |
| RF-04 | Alertas de compartilhamento de conta | Must | >3 devices ou >2 IPv4 em 72h = alerta |
| RF-05 | Estatísticas do bot Telegram | Should | Pendentes, aprovados, rejeitados, total |

## Critérios de Aceitação

```gherkin
Dado que uma licenciada acessa de 3+ dispositivos diferentes
Quando watchtower é consultado
Então alerta de compartilhamento de conta é gerado

Dado uma licenciada inativa por mais de 15 dias
Quando war room calcula churn risk
Então licenciada é listada como churn_risk
```

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/AnalyticsController.php` | `getLogs`, `getSecurityAlerts`, `getStats`, `watchtower`, `warRoom`, `getBotStats` | 🟢 |
| `admin/war_room/` | War room analytics | 🟢 |
