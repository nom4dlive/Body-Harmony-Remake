# Tasks: Autenticação

> Identificador: `001-autenticacao`
> Data: `2026-06-02`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Tasks de Implementação

### T01: Validação de credenciais de admin
- **Arquivo legado:** `Controllers/AuthController.php`
- **Descrição:** Implementar validação de username+password_hash contra tabela `admin_users` com bcrypt verify
- **Critério de pronto:** Admin com credenciais válidas recebe token de sessão; inválidas retorna 401
- **Confidência:** 🟢 CONFIRMADO

### T02: Validação de credenciais de licenciada
- **Arquivo legado:** `Controllers/AuthController.php`
- **Descrição:** Login por CPF, email ou username + password_hash com bcrypt. Suporte a device_token opcional para reuse de sessão
- **Critério de pronto:** Licenciada autentica com CPF/email+senha; device token reusado se fingerprint compatível
- **Confidência:** 🟢 CONFIRMADO

### T03: Validação de credenciais de aluna
- **Arquivo legado:** `Controllers/AlunaAuthController.php`
- **Descrição:** Login por email + password_hash. Token gerado com prefixo 'al_'
- **Critério de pronto:** Aluna autentica e recebe token iniciando com 'al_'
- **Confidência:** 🟢 CONFIRMADO

### T04: Dual-Layer Throttling
- **Arquivo legado:** `Controllers/AuthController.php` (linha 205)
- **Descrição:** Implementar account-based (3 falhas = lock 15min) + IP-based (50 falhas = block) usando `auth_logs` e `nexus_security_rules`
- **Critério de pronto:** Conta bloqueada após 3 falhas; IP banido após 50 falhas; whitelist bypass permitido
- **Confidência:** 🟢 CONFIRMADO

### T05: Gerenciamento de sessão (token)
- **Arquivo legado:** `Controllers/AuthController.php`, `Core/AuthMiddleware.php`
- **Descrição:** Gerar token SHA256, armazenar em `admin_sessions` (admin) ou `licenciada_devices`/`aluna_devices` (demais). Verificar token a cada request via middleware
- **Critério de pronto:** Token gerado no login, verificado no middleware, removido no logout
- **Confidência:** 🟢 CONFIRMADO

### T06: FIFO Session Kicker
- **Arquivo legado:** `Controllers/AuthController.php` (linha 276)
- **Descrição:** Se número de devices ativos > max_devices, desativar o mais antigo (FIFO)
- **Critério de pronto:** Dispositivo mais antigo desativado quando limite excedido
- **Confidência:** 🟢 CONFIRMADO

### T07: Admin impersonifica licenciada
- **Arquivo legado:** `Controllers/AuthController.php` (linha 176)
- **Descrição:** Se ID da licenciada for negativo, admin está logando como ela. abs(id) = admin_id. Retornar is_admin=true, max_devices=999
- **Critério de pronto:** Admin autenticado consegue login como licenciada via ID negativo
- **Confidência:** 🟢 CONFIRMADO

### T08: Fingerprint Device Reuse
- **Arquivo legado:** `Services/RiskEngineService.php`
- **Descrição:** Gerar fingerprint hash baseado em headers + user-agent. No login, buscar device existente por fingerprint antes de criar novo
- **Critério de pronto:** Login subsequente do mesmo dispositivo reusa o mesmo device_token
- **Confidência:** 🟡 INFERIDO

### T09: AuthMiddleware chain
- **Arquivo legado:** `Core/AuthMiddleware.php`
- **Descrição:** Middleware que intercepta requests, extrai token de headers (X-Device-Token ou Authorization Bearer), valida e injeta usuário logado
- **Critério de pronto:** Request sem token → 401; token inválido → 401; token válido → request prossegue com usuário
- **Confidência:** 🟢 CONFIRMADO

### T10: NexusGuard RBAC
- **Arquivo legado:** `Core/NexusGuard.php`
- **Descrição:** Verificar role do admin contra requiredRole da rota. Superadmin hardcoded como id=5
- **Critério de pronto:** Admin sem role necessária recebe 403; superadmin sempre autorizado
- **Confidência:** 🟢 CONFIRMADO

### T11: Risk scoring em auth_logs
- **Arquivo legado:** `Controllers/AuthController.php`
- **Descrição:** Registrar cada tentativa de login em `auth_logs` com status, IP, user_agent e risk_score calculado
- **Critério de pronto:** Toda tentativa de login (sucesso ou falha) registrada em auth_logs com metadados
- **Confidência:** 🟢 CONFIRMADO

### T12: Magic token auto-login (SSO Telegram)
- **Arquivo legado:** `Services/MagicTokenService.php`
- **Descrição:** Gerar token criptográfico único com expiração. Verificar e consumir no login sem senha
- **Critério de pronto:** Token gerado é válido por tempo limitado; usado uma vez é invalidado
- **Confidência:** 🟢 CONFIRMADO

### T13: Logout com invalidação
- **Arquivo legado:** `Controllers/AuthController.php`
- **Descrição:** Remover token da tabela de sessão ou marcar device como inativo
- **Critério de pronto:** Token pós-logout retorna 401
- **Confidência:** 🟢 CONFIRMADO

### T14: Configuração de throttling via nexus_security_rules
- **Arquivo legado:** `Core/AuthMiddleware.php`, `admin/engine/feature_flags.php`
- **Descrição:** Ler MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES, WHITELIST_IPS, BLACKLIST_IPS da tabela nexus_security_rules. Permitir atualização via admin
- **Critério de pronto:** Regras de segurança configuráveis sem deploy
- **Confidência:** 🟢 CONFIRMADO
