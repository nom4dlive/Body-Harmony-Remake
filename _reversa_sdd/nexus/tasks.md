# Tasks: Nexus

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] SQLite com suporte a PDO SQLite (extensão `pdo_sqlite`)
- [ ] MySQL com tabelas: `auth_logs`, `admin_sessions`, `audit_logs`, `licenciada_devices`
- [ ] Core system rodando: `Response.php`, `ResponseCache.php`, `NexusSQLite.php`
- [ ] Diretório `storage/geoip/cache/` com permissão de escrita

## Tarefas

### T01: NexusSQLite — Conexão singleton com fallback MySQL
- **Arquivo legado:** `Core/NexusSQLite.php`
- **Descrição:** Implementar classe NexusSQLite com método estático `get()` que retorna PDO SQLite (singleton) ou null. `isAvailable()` verifica extensão pdo_sqlite. Caminho do banco SQLite configurável via constante ou env.
- **Critério de pronto:** `NexusSQLite::get()` retorna PDO válido ou null sem lançar exceção
- **Confidência:** 🟢 CONFIRMADO

### T02: NexusOpsController — Firewall IP (CRUD + upsert)
- **Arquivo legado:** `Controllers/NexusOpsController.php`
- **Descrição:** Implementar `getRules()`, `addRule()` (com validação IP + tipo, upsert ON CONFLICT/ON DUPLICATE KEY, auditoria), `removeRule()` (DELETE + auditoria com payload_before), `manageIPRule()` (endpoint legado WarRoom). Dual engine: SQLite upsert + MySQL fallback.
- **Critério de pronto:** CRUD completo de regras de IP com auditoria em ambas engines
- **Confidência:** 🟢 CONFIRMADO

### T03: NexusOpsController — Auditoria e Feed Guardian
- **Arquivo legado:** `Controllers/NexusOpsController.php`
- **Descrição:** Implementar `getAuditLogs()` com paginação (limit/offset), `getAuditFeed()` combinando anomalias de login (MySQL, auth_logs com status != success OU risk_score > 0) com ações admin (SQLite, nexus_audit_ops), ordenado por created_at DESC, limit 50.
- **Critério de pronto:** Feed retorna até 50 eventos combinados de 2 engines
- **Confidência:** 🟢 CONFIRMADO

### T04: NexusOpsController — Manutenção do Sistema
- **Arquivo legado:** `Controllers/NexusOpsController.php`
- **Descrição:** Implementar `systemMaintenance()` com 4 ações: FLUSH_CACHE (ResponseCache::flush + limpa nexus_cache SQLite), PURGE_DEVICES (DELETE dispositivos inativos >30 dias), CLEAN_LOGS (DELETE auth_logs + lms_access_logs >90 dias + nexus_audit_ops antigo), RESET_GEOIP (remove arquivos JSON de cache GeoIP). Auditoria obrigatória.
- **Critério de pronto:** Cada ação executa com sucesso e registra auditoria
- **Confidência:** 🟢 CONFIRMADO

### T05: NexusDashboardController — Status do Sistema
- **Arquivo legado:** `Controllers/NexusDashboardController.php`
- **Descrição:** Implementar `getSystemStatus()` com métricas: latência DB, sessões ativas admin, taxa de erro 1h, disco livre/total, memória. Status 'operational' ou 'degraded' baseado em thresholds. `getSecurityMetrics()` com threats (failed_logins_24h, blocked_ips_24h, suspicious_ips), sessions (active_admins, active_students), deployment info, auth_alerts.
- **Critério de pronto:** Ambos endpoints retornam JSON estruturado com métricas reais
- **Confidência:** 🟢 CONFIRMADO

### T06: NexusForensicsController — Análise Forense
- **Arquivo legado:** `Controllers/NexusForensicsController.php`
- **Descrição:** Implementar `analyze(cpf)` com histórico completo de acesso, `getStudents()` listando alunos, `generateBatch()` para geração em lote, `getLogs()` timeline, `lookup(hash)` busca por fingerprint, `getConfig()`/`updateConfig()` para regras.
- **Critério de pronto:** CRUD completo de forense com busca por CPF e hash
- **Confidência:** 🟢 CONFIRMADO

### T07: Watchtower — Timeline de Segurança
- **Arquivo legado:** `Controllers/WatchtowerController.php`
- **Descrição:** Implementar timeline de segurança filtrada por CPF, combinando dados de auth_logs, lms_access_logs e nexus_audit_ops. Exibir dispositivo, localização, risco e ações administrativas.
- **Critério de pronto:** Timeline por CPF retorna eventos ordenados com metadados
- **Confidência:** 🟢 CONFIRMADO

### T08: NexusDbController — Gerenciamento de Banco
- **Arquivo legado:** `Controllers/NexusDbController.php`
- **Descrição:** Implementar snapshot SQL (gera arquivo .sql com timestamp), staging user management (DB_STAGE_USER), alter table wizard.
- **Critério de pronto:** Snapshot gera arquivo SQL válido; staging gerencia credenciais
- **Confidência:** 🟡 INFERIDO

### T09: Core — NexusGuard, NexusLogger, NexusErrorHandler
- **Arquivo legado:** `Core/NexusGuard.php`, `Core/NexusLogger.php`, `Core/NexusErrorHandler.php`
- **Descrição:** NexusGuard: middleware de autenticação com requiredRole. NexusLogger: log estruturado com sanitização de campos sensíveis (password, token, secret, key). NexusErrorHandler: tratamento global de exceções com resposta padronizada.
- **Critério de pronto:** Middleware bloqueia rotas não autorizadas; logs sanitizam dados sensíveis
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Teste de CRUD de firewall IP (add, list, remove)
- [ ] TT-02: Teste de feed Guardian (combinação de 2 engines)
- [ ] TT-03: Teste de manutenção (cada action individualmente)
- [ ] TT-04: Teste de dashboard (métricas retornam valores esperados)
- [ ] TT-05: Teste de fallback SQLite → MySQL
- [ ] TT-06: Teste de forense lookup por hash

## Tarefas de Migração de Dados

- [ ] TM-01: Criar tabelas SQLite (nexus_audit_ops, nexus_cache, security_ip_rules) com schema compatível
- [ ] TM-02: Migrar regras de firewall existentes do MySQL para SQLite (se aplicável)

## Ordem Sugerida

1. T01 (NexusSQLite) — base para todas as outras tarefas
2. T09 (Core) — NexusGuard, Logger, ErrorHandler
3. T05 (Dashboard) — independente, usa apenas MySQL
4. T02, T03 (Firewall + Feed) — dependem de T01
5. T04 (Manutenção) — depende de T01
6. T06 (Forense) — módulo independente
7. T07 (Watchtower) — consolida dados
8. T08 (DbController) — operacional avançado

## Lacunas Pendentes (🔴)

- Quais permissões específicas cada endpoint do Nexus exige?
- Staging user management precisa de validação de segurança contra injection
- Limites de rate limiting no forense batch generation não identificados
