# Requirements: Gerenciamento de Sessões

> Identificador: `001-autenticacao-sessoes`
> Confidência: 🟢 CONFIRMADO

## 1. Resumo executivo

Gerenciamento de sessões de todos os perfis (admin, licenciada, aluna): verificação de token via middleware, logout, refresh e revalidação de sessão expirada.

## 2. Regras de negócio

1. **RN-01:** AuthMiddleware intercepta rotas protegidas e extrai token dos headers 🟢
2. **RN-02:** Admin usa header `Authorization: Bearer <token>` 🟢
3. **RN-03:** Licenciada e aluna usam header `X-Device-Token: <token>` 🟢
4. **RN-04:** Logout remove/inativa o token da sessão 🟢
5. **RN-05:** Sessão expirada retorna 401 com código "token_expired" 🟢

## 3. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite |
|----|-----------|------------|--------------------|
| RF-01 | Validação de token via middleware | Must | Request sem token = 401 |
| RF-02 | Logout com invalidação | Must | Token pós-logout = 401 |
| RF-03 | Renovação de sessão | Should | Refresh token sem relogin |

## 4. Critérios de Aceitação

```gherkin
Cenário: Request protegido sem token
  Dado uma rota protegida por autenticação
  Quando enviar request sem header de token
  Então recebe 401 Unauthorized

Cenário: Logout de licenciada
  Dado uma licenciada autenticada com device_token
  Quando enviar POST /v1/auth/logout com X-Device-Token
  Então device_token é marcado como is_active=0
  E request subsequente com mesmo token retorna 401
```
