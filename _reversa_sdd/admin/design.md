# Design: Administração (Admin)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

### Core System

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `Response::json` | `(data: mixed, status: int=200)` | `void (exit)` | Padrão de toda resposta |
| `Response::error` | `(message: string, status: int=400, code: string?)` | `void (exit)` | Erro padronizado |
| `ResponseCache::serve` | `(key: string, callback: callable, ttl: int=1800, isPublic: bool=false)` | `void` | Stale-while-revalidate |
| `ResponseCache::clear` | `(keyPrefix: string)` | `void` | Invalida por prefixo |
| `NexusLogger::log` | `(action: string, description: string, details: array=[], userType: string='system', userId: int=0, severity: string?)` | `void` | Sanitiza campos sensíveis |
| `Router::resolve` | `() : ControllerResponse` | `void (rota executada)` | Mapeamento central de rotas |

### Admin Endpoints

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| POST | `/admin/users/manage` | `{action, user_id, ...}` | `{success}` | 200, 400, 403 |
| GET | `/admin/lms/dashboard` | — | `{metrics}` | 200 |
| GET | `/admin/watchtower` | — | `{sessions, alerts, logs}` | 200 |
| GET | `/admin/engine/feature_flags` | — | `{maintenance_mode}` | 200 |
| POST | `/admin/engine/feature_flags` | `{maintenance_mode}` | `{success}` | 200 |

## Fluxo Principal: ResponseCache (Stale-While-Revalidate)

1. Request chega → callback de dados é passado para `ResponseCache::serve(key, callback, ttl, isPublic)`
2. Cache key é computada: se privado → `sha1($key . $userId)`; se público → `sha1($key)`
3. Arquivo cache existe?
   - Sim e fresco (mtime + ttl > now) → serve dados do arquivo, exit
   - Sim e stale (mtime + ttl < now) → serve dados do arquivo, revalida em background (include + ob_clean)
   - Não → executa callback, salva JSON em `LOGS_DIR/cache/`, serve fresh
4. `ResponseCache::clear(keyPrefix)` deleta todos arquivos cujo nome começa com o prefixo

## Fluxo Principal: Admin User Management

1. `AdminController::manageUser()` recebe `{action, user_id, ...}`
2. Switch action:
   - `ban` → `UPDATE admin_users SET is_active = 0 WHERE id = :id`
   - `unban` → `UPDATE admin_users SET is_active = 1 WHERE id = :id`
   - `reset_lifecycle` → executa sub-ações: force_password, revoke_lgpd, clear_devices, clear_throttling, max_devices
   - `create` → INSERT nova licenciada com dados do POST
   - `reset_password` → gera hash + `force_password_change = 1`
   - `delete` → DELETE da tabela licenciadas
3. Loga ação em audit_logs via NexusLogger

## Fluxo Principal: Watchtower

1. GET `/admin/watchtower` aciona `watchtower/core.php`
2. Active sessions: `SELECT * FROM access_logs WHERE created_at > NOW() - 15min GROUP BY user_id`
3. Credential sharing: `SELECT user_id, COUNT(DISTINCT ip_address) FROM access_logs WHERE created_at > NOW() - 60min GROUP BY user_id HAVING ip_count > 1`
4. Recent logs: últimos 50 registros de `audit_logs`
5. Retorna JSON consolidado

## Fluxo Alternativo: NexusSQLite Dual-Engine

- **Engine primário:** SQLite via `PDO("sqlite:". NEXUS_DB_PATH)` — usado para nexus_audit_ops, security_ip_rules, nexus_cache
- **Fallback:** Se `pdo_sqlite` não disponível → degrada para MySQL com mesma interface de tabelas
- **Detecção:** `class_exists('PDO') && in_array('sqlite', PDO::getAvailableDrivers())`

## Dependências

| Componente | Depende de | Motivo |
|-----------|-----------|--------|
| ResponseCache | Filesystem (LOGS_DIR/cache/) | Cache em disco |
| NexusLogger | MySQL (audit_logs) | Logging estruturado |
| Response | — | Sem dependências |
| Router | Response | Roteamento + resposta |
| NexusSQLite | SQLite3 PHP extension | Engine alternativo |

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Cache file-based (não Redis/Memcached) | `ResponseCache.php:LOGS_DIR/cache/` | 🟢 |
| Stale-while-revalidate com serve stale + background refresh | `ResponseCache.php:serve()` | 🟢 |
| Logging com sanitização por regex de campos sensíveis | `NexusLogger.php:44-48` | 🟢 |
| Feature flags key-value em site_config no MySQL | `feature_flags.php:UPSERT` | 🟢 |
| Dual-engine SQLite → MySQL com fallback transparente | `NexusSQLite.php:55` | 🟢 |

## Observabilidade

- `NexusLogger::log` registra toda ação administrativa em `audit_logs`
- Watchtower expõe métricas de sessões ativas e alertas
- Cache hits/misses não são logados (inferido)
- Erros do ErrorHandler logados em syslog + banco

## Riscos e Lacunas

- 🟡 Watchtower não executa ações corretivas — apenas alerta (não bloqueia)
- 🟡 Cache file-based pode escalar mal com muitos usuários simultâneos
- 🔴 Limpeza de cache expirado: não há garbage collection visível no código
