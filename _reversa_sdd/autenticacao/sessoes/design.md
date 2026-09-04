# Design: Gerenciamento de Sessões

> Identificador: `001-autenticacao-sessoes`
> Confidência: 🟢 CONFIRMADO

## 1. Fluxo de middleware

```
Request → Router.php → rota requer auth?
  ├─ Sim → AuthMiddleware.handle(requiredRole?)
  │        ├─ Extrair token:
  │        │   ├─ admin: header "Authorization: Bearer <token>"
  │        │   │   → admin_sessions WHERE token = :token AND expires_at > NOW()
  │        │   ├─ licenciada: header "X-Device-Token: <token>"
  │        │   │   → licenciada_devices WHERE device_token = :token AND is_active = 1
  │        │   └─ aluna: header "X-Device-Token: <token>"
  │        │       → aluna_devices WHERE device_token = :token AND is_active = 1
  │        │
  │        ├─ Token inválido/expirado → Response::error("Unauthorized", 401, "token_expired")
  │        │
  │        ├─ Token válido → $GLOBALS['loggedUser'] populado
  │        │
  │        └─ requiredRole definida?
  │             ├─ Sim → NexusGuard.verify(role, requiredRole)
  │             │        └─ falha → 403 Forbidden
  │             └─ Não → request prossegue
  │
  └─ Não → request prossegue sem autenticação
```

## 2. Logout

```
POST /v1/auth/logout
  │
  ├─ Admin: DELETE FROM admin_sessions WHERE token = :token
  ├─ Licenciada: UPDATE licenciada_devices SET is_active = 0 WHERE device_token = :token
  └─ Aluna: UPDATE aluna_devices SET is_active = 0 WHERE device_token = :token
```

## 3. Dependências

| Componente | Uso |
|-----------|-----|
| AuthMiddleware.php | Interceptação e validação |
| Auth.php | Helpers de sessão |
| NexusGuard.php | RBAC verification |
| Response.php | JSON error/success |
| Router.php | Roteamento com requiredRole |
