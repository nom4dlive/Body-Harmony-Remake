# Design: Login de Aluna

> Identificador: `001-autenticacao-login-aluna`
> Confidência: 🟢 CONFIRMADO

## 1. Fluxo

```
Aluna → POST /v1/aluna/auth/login {login, password}
  │
  ├─ 1. SELECT * FROM alunas WHERE email = :login AND is_approved = 1
  │     └─ not found → 401
  │
  ├─ 2. password_verify(password, password_hash)
  │     └─ false → 401
  │
  ├─ 3. Gerar token = "al_" + SHA256(random + timestamp + alunas.id)
  │     └─ Prefixo 'al_' identifica perfil aluna
  │
  ├─ 4. Device resolution (similar à licenciada)
  │
  ├─ 5. Se force_password_change = true → incluir flag na response
  │
  └─ 6. Response {token, user, force_password_change?}
```

## 2. Payloads

### Request
```json
{ "login": "maria@email.com", "password": "***" }
```

### Response
```json
{
  "token": "al_a1b2c3d4...sha256",
  "user": { "id": 1, "name": "Maria", "email": "maria@email.com" },
  "force_password_change": false
}
```

## 3. Tabelas

| Tabela | Operação |
|--------|----------|
| alunas | SELECT + UPDATE failed_login_attempts |
| aluna_devices | SELECT/INSERT device_token |
