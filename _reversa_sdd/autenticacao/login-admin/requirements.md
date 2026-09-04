# Requirements: Login de Admin

> Identificador: `001-autenticacao-login-admin`
> Confidência: 🟢 CONFIRMADO

## 1. Resumo executivo

Autenticação de administradores no painel Body Harmony, com suporte a 3 roles (superadmin, admin, editor), token de sessão armazenado em `admin_sessions` e impersonificação de licenciadas para suporte.

## 2. Regras de negócio

1. **RN-01:** Admin autentica com username + password_hash (bcrypt) 🟢
2. **RN-02:** Superadmin hardcoded como id=5 ou role='superadmin' 🟢
3. **RN-03:** Admin pode logar como licenciada via ID negativo 🟢
4. **RN-04:** Sessão admin tem expiração (admin_sessions.expires_at) 🟢

## 3. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite |
|----|-----------|------------|--------------------|
| RF-01 | Login com username + senha | Must | Admin recebe token de sessão |
| RF-02 | Sessão com expiração | Must | Token expirado retorna 401 |
| RF-03 | Impersonificação de licenciada | Should | Admin loga como licenciada via -admin_id |

## 4. Critérios de Aceitação

```gherkin
Cenário: Login admin com sucesso
  Dado um admin com username "bodyharmony" e senha válida
  Quando enviar POST /v1/auth/login-admin com {username, password}
  Então recebe {token, user} com status 200
  E admin_sessions contém novo registro

Cenário: Impersonificar licenciada
  Dado um admin autenticado com token válido
  Quando enviar POST /v1/auth/login com {login: "-5"} 
  Então recebe dados da licenciada com is_admin=true
```
