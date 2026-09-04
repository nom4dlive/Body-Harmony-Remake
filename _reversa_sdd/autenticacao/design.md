# Design: Autenticação

> Identificador: `001-autenticacao`
> Data: `2026-06-02`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Arquitetura do componente

A autenticação segue um modelo de **Middleware Chain** com três camadas:

```
Request → Router → AuthMiddleware.handle(requiredRole?) → Controller → Response
                         │
                         ├── JWT.php (token validation)
                         ├── Auth.php (session management)
                         ├── NexusGuard.php (RBAC)
                         └── RiskEngineService.php (throttling + fingerprint)
```

### Fluxo de requisição autenticada

```
1. Router.php identifica rota
2. Rota especifica requiredRole (ou null para público)
3. AuthMiddleware.handle() busca token:
   a. Header X-Device-Token (licenciada/aluna)
   b. Header Authorization Bearer (admin)
   c. $loggedUser global (non-admin fallback)
4. AuthMiddleware.validateToken() decodifica e verifica expiração
5. NexusGuard.verify() checa role se requiredRole definido
6. RiskEngineService.check() avalia tentativas e IP
7. Request prossegue para o Controller
```

## 2. Diagrama de sequência — Login de Licenciada

```
Licenciada           AuthController        AuthMiddleware      LicenciadasDB    LicenciadaDevices
    │                     │                     │                   │                 │
    │  POST /auth/login   │                     │                   │                 │
    │────────────────────>│                     │                   │                 │
    │                     │ checkThrottling()   │                   │                 │
    │                     │────────────────────>│                   │                 │
    │                     │                     │  SELECT auth_logs │                 │
    │                     │                     │──────────────────>│                 │
    │                     │                     │<──────────────────│                 │
    │                     │<────────────────────│                   │                 │
    │                     │                     │                   │                 │
    │                     │ Authenticate()      │                   │                 │
    │                     │──────────────────────────────────────────────────────────>│
    │                     │                     │                   │                 │
    │                     │  SELECT licenciada  │                   │                 │
    │                     │────────────────────>│                   │                 │
    │                     │<────────────────────│                   │                 │
    │                     │                     │                   │                 │
    │                     │ Gerar device_token  │                   │                 │
    │                     │──────────────────────────────────────────────────────────>│
    │<────────────────────│                     │                   │                 │
    │ {token, user}       │                     │                   │                 │
```

## 3. Estrutura de dados

### Entrada (POST /v1/auth/login — licenciada)
```json
{
  "login": "string (CPF ou email)",
  "password": "string",
  "device_token": "string|null (opcional, reuse)"
}
```

### Entrada (POST /v1/auth/login — admin)
```json
{
  "username": "string",
  "password": "string"
}
```

### Entrada (POST /v1/aluna/auth/login)
```json
{
  "login": "string (email)",
  "password": "string"
}
```

### Saída (sucesso)
```json
{
  "token": "string",
  "user": {
    "id": "int",
    "name": "string",
    "role": "string|null",
    "profile_photo": "string|null"
  }
}
```

### Saída (erro)
```json
{
  "error": "string",
  "code": "invalid_credentials|account_locked|throttled|system_error",
  "remaining_attempts": "int|null"
}
```

## 4. Algoritmos

### FIFO Session Kicker
Quando uma licenciada excede `max_devices` dispositivos ativos, o mais antigo (`last_used_at ASC`) é marcado `is_active=0`.

### Dual-Layer Throttling
- **Camada 1 (Account):** Conta `failed_login_attempts` por email/username. Se >= 3, bloqueia `locked_until` = NOW() + 15min.
- **Camada 2 (IP):** Conta tentativas falhas por IP nos últimos 15 min. Se >= 50, bloqueia IP.

### Fingerprint Device Reuse
RiskEngine gera `fingerprint_hash` (SHA-256 de headers + user-agent + screen). No login, busca device existente pelo fingerprint antes de criar novo.

### Admin-as-Licenciada Fallback
Se `id` da licenciada é negativo: `admin_id = abs(id)`, licenciada lookup ignora, retorna `is_admin=true`, `max_devices=999`.

## 5. Rotas da API

| Método | Rota | Autenticação | Função |
|--------|------|-------------|--------|
| POST | /v1/auth/login | Pública | Login licenciada |
| POST | /v1/auth/login-admin | Pública | Login admin |
| POST | /v1/aluna/auth/login | Pública | Login aluna |
| POST | /v1/auth/logout | Token | Logout + invalidação |
| GET | /v1/auth/me | Token | Perfil do usuário atual |
| POST | /v1/magic-token/login | Pública | Login via magic token (SSO Telegram) |

## 6. Banco de dados

### Tabelas envolvidas

| Tabela | Uso |
|--------|-----|
| `admin_users` | Validação de credenciais de admin |
| `admin_sessions` | Sessões ativas de admin |
| `licenciadas` | Validação de credenciais de licenciada |
| `licenciada_devices` | Device tokens + fingerprints |
| `alunas` | Validação de credenciais de aluna |
| `aluna_devices` | Device tokens + fingerprints |
| `auth_logs` | Registro de tentativas com risk scoring |
| `nexus_security_rules` | Config de throttling, whitelist/blacklist |
| `magic_tokens` | Tokens de auto-login (SSO) |

### Queries críticas

```sql
-- Autenticação de licenciada
SELECT id, name, password_hash, max_devices, is_active, force_password_change,
       failed_login_attempts, locked_until
FROM licenciadas
WHERE (cpf = :login OR email = :login OR username = :login) AND is_active = 1;

-- Criação de device token
INSERT INTO licenciada_devices (licenciada_id, device_token, fingerprint_hash, ip_address, user_agent)
VALUES (:id, :token, :fingerprint, :ip, :ua);

-- FIFO cleanup
UPDATE licenciada_devices SET is_active = 0
WHERE licenciada_id = :id AND is_active = 1
ORDER BY last_used_at ASC
LIMIT (SELECT COUNT(*) - max_devices FROM licenciada_devices WHERE licenciada_id = :id AND is_active = 1);
```

## 7. Integrações

| Integração | Tipo | Descrição |
|-----------|------|-----------|
| RiskEngineService | Interna | Scoring de risco por tentativa de login |
| NexusSQLite | Interna | Cache de regras de firewall e IP rules |
| GeminiService | Indireta | Doctor Harmony usa contexto do usuário logado |
| Telegram Bot | Indireta | Magic tokens para auto-login |

## 8. Decisões arquiteturais

| ID | Decisão | Justificativa |
|----|---------|---------------|
| AD-01 | Token-based sessions (não JWT padrão) | Tokens armazenados em tabela, permitem revogação instantânea |
| AD-02 | Device token como header separado do Bearer | Separa autenticação de licenciada/aluna (X-Device-Token) de admin (Authorization) |
| AD-03 | Prefixo 'al_' em tokens de aluna | Identificação rápida do perfil sem consulta ao banco |
| AD-04 | ID negativo para impersonificação | Hack de roteamento que evita criar rota separada |
