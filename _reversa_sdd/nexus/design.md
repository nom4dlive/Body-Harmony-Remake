# Design: Nexus

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

### Nexus Dashboard

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/admin/nexus/dashboard` | — | `{status, metrics, disk, memory}` | 200 |
| GET | `/admin/nexus/security` | — | `{threats, sessions, deployment, auth_alerts}` | 200 |

### Firewall (Ops)

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/admin/nexus/ops/rules` | — | `{rules[]}` | 200 |
| POST | `/admin/nexus/ops/rules` | `{ip, type, reason, duration_hours}` | `{success, message}` | 200, 400 |
| DELETE | `/admin/nexus/ops/rules/:id` | — | `{success, message}` | 200, 404 |
| GET | `/admin/nexus/ops/audit` | `?page=&limit=` | `{logs[]}` | 200 |
| GET | `/admin/nexus/ops/feed` | — | `{feed[]}` | 200 |
| POST | `/admin/nexus/ops/maintenance` | `{action}` | `{success, message}` | 200, 400 |

### Forense

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| POST | `/admin/nexus/forensics/analyze` | `{cpf}` | `{analysis}` | 200 |
| GET | `/admin/nexus/forensics/students` | — | `{students[]}` | 200 |
| POST | `/admin/nexus/forensics/generate-batch` | — | `{success}` | 200 |
| GET | `/admin/nexus/forensics/logs` | — | `{logs[]}` | 200 |
| GET | `/admin/nexus/forensics/lookup/:hash` | — | `{device}` | 200, 404 |
| GET | `/admin/nexus/forensics/config` | — | `{config}` | 200 |
| POST | `/admin/nexus/forensics/config` | `{config}` | `{success}` | 200 |

### Database Management

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| POST | `/admin/nexus/db/snapshot` | — | `{success, filename}` | 200 |
| POST | `/admin/nexus/db/staging` | `{action, user, password}` | `{success}` | 200 |

### Watchtower

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/admin/nexus/watchtower/timeline` | `?cpf=` | `{events[]}` | 200 |

### AI / Doctor Harmony

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/api/v1/nexus/ai/config` | — | `{config}` | 200 |
| POST | `/api/v1/nexus/ai/config` | `{config}` | `{success}` | 200 |
| GET | `/api/v1/nexus/ai/audit` | — | `{logs[]}` | 200 |
| POST | `/api/v1/nexus/ai/sandbox` | `{file, notes}` | `{result}` | 200 |
| GET | `/api/v1/nexus/ai/health` | — | `{status}` | 200 |

### Core Classes

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `NexusSQLite::get` | `() : PDO|null` | `PDO|null` | Conexão singleton SQLite |
| `NexusSQLite::isAvailable` | `() : bool` | `bool` | Verifica extensão pdo_sqlite |
| `NexusGuard::handle` | `(requiredRole: string\|null)` | `array\|void` | Middleware de autenticação |
| `NexusLogger::log` | `(action, description, details, userType, userId, severity)` | `void` | Logging sanitizado |
| `NexusErrorHandler::handle` | `(exception)` | `void` | Error handler global |

## Fluxo Principal: Firewall IP

1. Admin autenticado faz POST `/admin/nexus/ops/rules` com `{ip, type, reason, duration_hours?}`
2. `NexusOpsController::addRule()` valida IP (FILTER_VALIDATE_IP) e tipo (BAN/ALLOW/SUSPICIOUS) 🟢
3. Se SQLite disponível: upsert com `ON CONFLICT(ip_address) DO UPDATE` 🟢
4. Se MySQL fallback: upsert com `ON DUPLICATE KEY UPDATE` 🟢
5. Registra auditoria em `nexus_audit_ops` com action `UPSERT_FIREWALL_RULE`, admin_id, target_id (IP), payload_after 🟢
6. Commit da transação; retorna `{success, message}` 🟢

## Fluxo Principal: Guardian Feed

1. GET `/admin/nexus/ops/feed` sem parâmetros 🟢
2. Busca anomalias de login (auth_logs com status != success OU risk_score > 0) no MySQL 🟢
3. Busca ações admin (nexus_audit_ops) no SQLite 🟢
4. Combina ambos arrays, ordena por created_at DESC, limita a 50 registros 🟢
5. Retorna `{status: 'success', feed: [{id, identity, ip_address, risk_score, ...}]}` 🟢

## Fluxo Principal: Dashboard de Sistema

1. GET `/admin/nexus/dashboard` sem parâmetros 🟢
2. `NexusDashboardController::getSystemStatus()`:
   a. Mede latência DB (`SELECT 1`) 🟢
   b. Conta sessões admin ativas (admin_sessions com expires_at > NOW()) 🟢
   c. Conta taxa de erro 1h (audit_logs com severity='error') 🟢
   d. Mede disco (disk_free_space + disk_total_space) 🟢
   e. Determina status: degraded se latência >100ms OU error_rate >10 🟢
   f. Retorna `{success, status, metrics: {active_sessions, db_latency_ms, ...}}` 🟢

## Fluxos Alternativos

- **SQLite indisponível:** NexusOpsController faz fallback para MySQL global via `$pdo` 🟢
- **IP inválido:** addRule retorna 400 com 'IP Inválido' 🟢
- **Tipo de regra inválido:** addRule retorna 400 com 'Tipo de regra inválida' 🟢
- **Regra não encontrada ao remover:** removeRule retorna 404 🟢
- **Ação de manutenção inválida:** systemMaintenance retorna 400 🟢
- **Tabela de sessões inexistente:** getSystemStatus trata com tableExists() e retorna 0 🟢

## Dependências

- Core: `Response.php`, `ResponseCache.php`, `NexusSQLite.php`, `NexusLogger.php`
- Security: `NexusGuard.php`, `NexusErrorHandler.php`
- Externo: PDO SQLite (primário), MySQL/PDO (fallback)
- Frontend: `NexusLayout.jsx`, `NexusHome.jsx`, `NexusBottomNav.jsx`

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| SQLite como engine primário para admin (zero MySQL extras) | `NexusOpsController.php:3` | 🟢 |
| Dual Engine: SQLite upsert ON CONFLICT / MySQL ON DUPLICATE KEY | `NexusOpsController.php:88-114` | 🟢 |
| Auditoria obrigatória de operações em nexus_audit_ops | `NexusOpsController.php:116` | 🟢 |
| Upsert de firewall por IP (regra única por IP) | `NexusOpsController.php:92-98` | 🟢 |
| Guardian Feed combina 2 engines (MySQL + SQLite) | `NexusOpsController.php:222-267` | 🟢 |

## Estado Interno

- `nexus_audit_ops` (SQLite): auditoria de operações com admin_id, action, target_id, payload
- `security_ip_rules` (SQLite/MySQL): regras de firewall com ip_address, rule_type, expires_at
- Dashboard: sem estado próprio, métricas calculadas sob demanda

## Observabilidade

- Logs de erro em operações Nexus: `error_log("[Nexus Ops Error]: ...")` 🟢
- Auditoria completa de firewall (UPSERT + DELETE) em nexus_audit_ops 🟢
- Auditoria de manutenção (SYSTEM_MAINTENANCE) em nexus_audit_ops 🟢
- Fallback detection: log automático quando SQLite não está disponível 🟢

## Riscos e Lacunas

- 🟡 Configuração de staging (DB_STAGE_USER) precisa de validação de segurança
- 🟡 Permissões de scripts administrativos não foram completamente verificadas
- Rate limiting: 5 relatórios forenses por minuto na geração batch 🟢
