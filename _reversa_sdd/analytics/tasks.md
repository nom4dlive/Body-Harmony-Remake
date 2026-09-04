# Tasks: Analytics (Watchtower & War Room)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabelas: `lms_access_logs`, `audit_logs`, `bot_cadastro_staging`
- [ ] LoggerService disponível

## Tarefas

### T01: Logs de acesso paginados
- **Arquivo legado:** `Controllers/AnalyticsController.php`
- **Descrição:** Implementar getLogs(page, limit) com paginação, retornando `{data[], page, limit}`
- **Critério de pronto:** Logs paginados corretamente; page/limit refletidos na resposta
- **Confidência:** 🟢 CONFIRMADO

### T02: Watchtower dashboard
- **Arquivo legado:** `Controllers/AnalyticsController.php`
- **Descrição:** Implementar watchtower() com 3 queries: active sessions (15min), credential sharing (COUNT DISTINCT ip, 60min, >1), recent logs (50)
- **Critério de pronto:** Dashboard consolidado com sessões, alertas e logs
- **Confidência:** 🟢 CONFIRMADO

### T03: War Room analytics
- **Arquivo legado:** `Controllers/AnalyticsController.php`
- **Descrição:** Implementar warRoom() com DAU (7 dias), devices per user, churn risk (>15 dias inativo)
- **Critério de pronto:** Métricas de engajamento calculadas corretamente
- **Confidência:** 🟢 CONFIRMADO

### T04: Security alerts
- **Arquivo legado:** `Controllers/AnalyticsController.php`
- **Descrição:** Implementar getSecurityAlerts() detectando >3 devices ou >2 IPv4 em 72h. IPv6 ignorado
- **Critério de pronto:** Alertas gerados para compartilhamento de conta; IPv6 não gera falso positivo
- **Confidência:** 🟢 CONFIRMADO

### T05: Bot stats
- **Arquivo legado:** `Controllers/AnalyticsController.php`
- **Descrição:** Implementar getBotStats() retornando pending, approved, rejected, total de bot_cadastro_staging
- **Critério de pronto:** Estatísticas do bot retornadas corretamente
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Watchtower retorna sessões ativas nos últimos 15 min
- [ ] TT-02: Security alert gerado para >3 devices em 72h
- [ ] TT-03: Churn risk listado corretamente

## Ordem Sugerida

1. T01 (logs) — base
2. T02 + T04 (watchtower + alerts) — segurança
3. T03 + T05 (war room + bot) — métricas

## Lacunas Pendentes (🔴)

- Nenhuma lacuna identificada para esta unit
