# Design: Analytics (Watchtower & War Room)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/analytics/logs` | `?page,limit` | `{data[], page, limit}` | 200 |
| GET | `/analytics/security-alerts` | — | `{alerts[]}` | 200 |
| GET | `/analytics/stats` | — | `{metrics}` | 200 |
| GET | `/analytics/watchtower` | — | `{sessions, alerts, logs}` | 200 |
| GET | `/analytics/war-room` | — | `{dau[], devices[], churn_risk[]}` | 200 |
| GET | `/analytics/bot-stats` | — | `{pending, approved, rejected, total}` | 200 |

## Fluxo Principal: Watchtower

1. GET `/analytics/watchtower` → consulta 3 queries:
   - Active sessions: `SELECT user_id, ip_address, MAX(created_at) FROM lms_access_logs WHERE created_at > NOW() - 15min GROUP BY user_id`
   - Credential sharing: `SELECT user_id, COUNT(DISTINCT ip_address) as ip_count FROM lms_access_logs WHERE created_at > NOW() - 60min GROUP BY user_id HAVING ip_count > 1`
   - Recent logs: `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50`
2. Monta resposta consolidada `{sessions[], alerts[], logs[]}`

## Fluxo Principal: War Room

1. GET `/analytics/war-room` → calcula:
   - DAU (Daily Active Users): contagem de users únicos nos últimos 7 dias
   - Devices per user: distribuição de dispositivos por licenciada
   - Churn risk: licenciadas com `last_login_at < NOW() - 15days`
2. Retorna `{dau: [{date, count}], devices: [{user_id, device_count}], churn_risk: [{user_id, name, days_inactive}]}`

## Fluxo: Security Alerts

1. GET `/analytics/security-alerts` → detecta:
   - `>3 devices` em 72h para mesma licenciada
   - `>2 IPv4` em 72h (IPv6 ignorado — CGNAT falsos positivos)
2. Gera alerta com user_id, tipo, detalhes, timestamp

## Dependências

| Componente | Uso |
|-----------|-----|
| AnalyticsController.php | Todos os endpoints |
| admin/war_room/ | Cálculos de war room |
| libs/LoggerService.php | Acesso a logs |
| Core/Response.php | Respostas JSON |

## Decisões de Design

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| IPv6 ignorado em alerts de segurança | `AnalyticsController.php:62` | 🟢 |
| Churn risk = 15 dias de inatividade | `AnalyticsController.php:340` | 🟢 |
| Alertas são apenas informativos (não bloqueiam) | Inferido da ausência de ação corretiva | 🟡 |

## Riscos e Lacunas

- 🟡 Alertas não executam ações corretivas automáticas (apenas informam)
- 🟡 DAU calculado apenas sobre lms_access_logs — pode não capturar toda atividade
