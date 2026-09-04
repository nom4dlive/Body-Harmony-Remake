# Tasks: Administração (Admin)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] MySQL com tabelas `audit_logs`, `site_config` criadas
- [ ] SQLite opcional com suporte a PDO SQLite
- [ ] Diretório `LOGS_DIR/cache/` com permissão de escrita

## Tarefas

### T01: Response::json padronizada
- **Arquivo legado:** `Core/Response.php`
- **Descrição:** Implementar Response::json(data, status) com ob_clean, http_response_code, Content-Type json, json_encode com JSON_UNESCAPED_UNICODE + UNESCAPED_SLASHES, exit. Response::error(message, status, code) com mesmo formato e code opcional
- **Critério de pronto:** Toda resposta JSON segue mesmo formato; error inclui `{error, code?, status}`
- **Confidência:** 🟢 CONFIRMADO

### T02: Router centralizado
- **Arquivo legado:** `Core/Router.php`
- **Descrição:** Implementar roteador que mapeia URIs para controllers/funções com suporte a parâmetros dinâmicos (:id) e requiredRole para auth middleware
- **Critério de pronto:** Rota `/admin/lms/dashboard` executa AdminLmsController::dashboard; rota inválida retorna 404
- **Confidência:** 🟢 CONFIRMADO

### T03: ResponseCache com stale-while-revalidate
- **Arquivo legado:** `Core/ResponseCache.php`
- **Descrição:** Implementar cache file-based: serve(key, callback, ttl, isPublic). Cache fresco → serve. Cache stale → serve + background revalidation. Sem cache → executa callback, salva, serve. Cache privado segmentado por token de usuário
- **Critério de pronto:** Cache armazena e serve dados; stale retorna dados + revalida async
- **Confidência:** 🟢 CONFIRMADO

### T04: ResponseCache invalidação por prefixo
- **Arquivo legado:** `Core/ResponseCache.php`
- **Descrição:** Implementar clear(keyPrefix) que varre diretório de cache e deleta arquivos com prefixo correspondente
- **Critério de pronto:** clear('api_lms_') remove todos caches LMS sem afetar outros
- **Confidência:** 🟢 CONFIRMADO

### T05: NexusLogger com sanitização
- **Arquivo legado:** `Core/NexusLogger.php`
- **Descrição:** Implementar log(action, description, details, userType, userId, severity) com sanitização automática (regex remove password, token, secret, key dos details antes de salvar). Severidade auto: ERROR se contém "ERROR", WARNING se "FAILED"/"BREACH". Fallback para syslog se banco indisponível
- **Critério de pronto:** Log salvo em audit_logs; dados sensíveis redactados; severidade inferida corretamente
- **Confidência:** 🟢 CONFIRMADO

### T06: NexusErrorHandler
- **Arquivo legado:** `Core/NexusErrorHandler.php`
- **Descrição:** Implementar handler de erros global que captura exceções, loga via NexusLogger e retorna Response::error padronizada
- **Critério de pronto:** Exceção não tratada retorna 500 JSON com log em audit_logs
- **Confidência:** 🟢 CONFIRMADO

### T07: Feature flags (maintenance_mode)
- **Arquivo legado:** `admin/engine/feature_flags.php`
- **Descrição:** Implementar GET (lê de site_config) e POST (UPSERT em site_config) para maintenance_mode. Apenas superadmin pode alterar
- **Critério de pronto:** GET retorna status atual; POST altera e persiste
- **Confidência:** 🟢 CONFIRMADO

### T08: Admin user management (manageUser)
- **Arquivo legado:** `Controllers/AdminController.php`
- **Descrição:** Implementar action router: ban (is_active=0), unban (is_active=1), reset_lifecycle (sub-ações), create (INSERT), reset_password (hash + force), delete. Registrar tudo em audit_logs
- **Critério de pronto:** Cada action executa a operação correta no banco e loga
- **Confidência:** 🟢 CONFIRMADO

### T09: Watchtower (credential sharing detection)
- **Arquivo legado:** `admin/watchtower/core.php`
- **Descrição:** Implementar GET /admin/watchtower com: active sessions (últimos 15 min), credential sharing (COUNT DISTINCT ip por user em 60 min, >1 = alerta), recent logs feed (últimos 50)
- **Critério de pronto:** Dashboard consolidado com métricas e alertas de segurança
- **Confidência:** 🟢 CONFIRMADO

### T10: NexusSQLite dual-engine
- **Arquivo legado:** `Core/NexusSQLite.php`
- **Descrição:** Implementar conexão SQLite como engine primário para admin (audit, firewall, cache) com detecção de disponibilidade. Fallback para MySQL se SQLite indisponível
- **Critério de pronto:** Admin funciona sem MySQL para audit/cache; fallback transparente se SQLite ausente
- **Confidência:** 🟢 CONFIRMADO

### T11: Conexão MySQL com retry
- **Arquivo legado:** `Core/db.php`
- **Descrição:** Implementar helper de conexão PDO MySQL com retry automático 3x em caso de falha
- **Critério de pronto:** Conexão estabelecida com retry; falha após 3 tentativas retorna erro
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Response::json retorna JSON com status code correto
- [ ] TT-02: ResponseCache serve cache fresco e revalida stale
- [ ] TT-03: NexusLogger sanitiza fields password, token, secret
- [ ] TT-04: Admin user management (ban/unban/reset) testado
- [ ] TT-05: Watchtower detecta credencial compartilhada

## Tarefas de Migração de Dados

- [ ] TM-01: Migrar `audit_logs` do MySQL para SQLite (se aplicável)

## Ordem Sugerida

1. T01 (Response) — base de toda API
2. T11 (db) + T10 (SQLite) — acesso a dados
3. T02 (Router) — roteamento
4. T05 (Logger) + T06 (ErrorHandler) — logging
5. T03 + T04 (ResponseCache) — cache
6. T08 (User Management)
7. T09 (Watchtower)
8. T07 (Feature Flags)

## Lacunas Pendentes (🔴)

- Garbage collection de cache expirado — não encontrado no código legado
