# Design: Login de Licenciada

> Identificador: `001-autenticacao-login-licenciada`
> Confidência: 🟢 CONFIRMADO

## 1. Fluxo

```
Licenciada → POST /v1/auth/login {login, password, device_token?}
  │
  ├─ 1. checkThrottling(login) → auth_logs nos últimos 15 min
  │     └─ falhas >= 3 → 423 account_locked
  │
  ├─ 2. findUser(login) → licenciadas WHERE cpf|email|username = :login
  │     └─ not found → 401 invalid_credentials
  │
  ├─ 3. password_verify(password, password_hash)
  │     └─ false → 401 + increment failed_login_attempts
  │
  ├─ 4. Device resolution:
  │     ├─ device_token enviado? → busca por device_token
  │     ├─ fingerprint existente? → busca por fingerprint_hash
  │     └─ novo device → INSERT + FIFO cleanup se necessário
  │
  ├─ 5. Reset failed_login_attempts = 0
  ├─ 6. Register auth_log (success)
  └─ 7. Response {token, user}
```

## 2. Payloads

### Request
```json
{
  "login": "string (CPF|email|username)",
  "password": "string",
  "device_token": "string|null"
}
```

### Response (200)
```json
{
  "token": "a1b2c3d4...sha256",
  "user": {
    "id": 1,
    "name": "Maria Silva",
    "profile_photo": "/uploads/photos/maria.jpg"
  }
}
```

## 3. Tabelas envolvidas

| Tabela | Operação |
|--------|----------|
| licenciadas | SELECT + UPDATE failed_login_attempts |
| licenciada_devices | SELECT/INSERT/UPDATE device_token |
| auth_logs | INSERT tentativa |
| nexus_security_rules | SELECT MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION |
