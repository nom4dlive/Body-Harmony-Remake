# Design: Login de Admin

> Identificador: `001-autenticacao-login-admin`
> Confidência: 🟢 CONFIRMADO

## 1. Fluxo

```
Admin → POST /v1/auth/login-admin {username, password}
  │
  ├─ 1. SELECT * FROM admin_users WHERE username = :username
  │     └─ not found → 401
  │
  ├─ 2. password_verify(password, password_hash)
  │     └─ false → 401
  │
  ├─ 3. Gerar token = SHA256(random + time)
  ├─ 4. INSERT INTO admin_sessions (user_id, token, expires_at)
  │     └─ expires_at = NOW() + 24h (configurável)
  │
  └─ 5. Response {token, user: {id, username, role}}
```

### Impersonificação
```
Admin autenticado → POST /v1/auth/login {login: "-5"}
  │
  ├─ 1. AuthMiddleware detecta token admin no header Authorization
  ├─ 2. Interpreta login "-5" como ID negativo
  ├─ 3. Busca licenciada pelo abs(-5) ignorando senha
  ├─ 4. Retorna user da licenciada + is_admin=true + max_devices=999
  └─ 5. Response {token: admin_token, user: {..., is_admin: true}}
```

## 2. Payloads

### Request login
```json
{ "username": "bodyharmony", "password": "***" }
```

### Request impersonificação
```json
{ "login": "-5", "password": "" }
```

### Response
```json
{
  "token": "a1b2c3...sha256",
  "user": { "id": 1, "username": "bodyharmony", "role": "superadmin" }
}
```

## 3. Tabelas

| Tabela | Operação |
|--------|----------|
| admin_users | SELECT validação |
| admin_sessions | INSERT novo token |
