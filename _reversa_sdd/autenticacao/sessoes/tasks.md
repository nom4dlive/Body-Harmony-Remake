# Tasks: Gerenciamento de Sessões

> Identificador: `001-autenticacao-sessoes`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabelas de sessão criadas: `admin_sessions`, `licenciada_devices`, `aluna_devices`
- [ ] AuthMiddleware.php implementado (roteamento de tokens)
- [ ] Response.php com métodos json/error

## Tasks de Implementação

### T01: Extração de token por perfil
- **Arquivo legado:** `Core/AuthMiddleware.php`
- **Descrição:** Implementar extração de token dos headers conforme o perfil: admin usa `Authorization: Bearer <token>`, licenciada e aluna usam `X-Device-Token: <token>` (ou `X-ALUNA-TOKEN` como fallback)
- **Critério de pronto:** Cada perfil extrai token do header correto; ausência retorna 401
- **Confidência:** 🟢 CONFIRMADO

### T02: Validação de token admin
- **Arquivo legado:** `Core/AuthMiddleware.php`
- **Descrição:** Validar token admin em `admin_sessions WHERE token = :token AND expires_at > NOW()`
- **Critério de pronto:** Token admin válido popula `$GLOBALS['loggedUser']` com dados do admin; expirado retorna 401 "token_expired"
- **Confidência:** 🟢 CONFIRMADO

### T03: Validação de token licenciada
- **Arquivo legado:** `Core/AuthMiddleware.php`
- **Descrição:** Validar device_token em `licenciada_devices WHERE device_token = :token AND is_active = 1`
- **Critério de pronto:** Token licenciada ativo popula usuário; inativo/inexistente retorna 401
- **Confidência:** 🟢 CONFIRMADO

### T04: Validação de token aluna
- **Arquivo legado:** `Core/AuthMiddleware.php`
- **Descrição:** Validar token aluna (prefixo `al_`) em `aluna_devices WHERE device_token = :token AND is_active = 1`
- **Critério de pronto:** Token aluna com prefixo `al_` validado na tabela correta; demais perfis rejeitados
- **Confidência:** 🟢 CONFIRMADO

### T05: Logout com invalidação de token
- **Arquivo legado:** `Controllers/AuthController.php`, `Controllers/AlunaAuthController.php`
- **Descrição:** Implementar logout: admin → `DELETE FROM admin_sessions`; licenciada → `UPDATE is_active = 0`; aluna → `UPDATE is_active = 0`
- **Critério de pronto:** Token pós-logout retorna 401 em qualquer request protegido
- **Confidência:** 🟢 CONFIRMADO

### T06: Sessão expirada com código específico
- **Arquivo legado:** `Core/AuthMiddleware.php`
- **Descrição:** Retornar `Response::error("Unauthorized", 401, "token_expired")` quando token expirado ou sessão removida
- **Critério de pronto:** Resposta 401 contém code "token_expired" no JSON
- **Confidência:** 🟢 CONFIRMADO

### T07: Fallback de header para aluna
- **Arquivo legado:** `Core/AuthMiddleware.php`
- **Descrição:** Aluna pode enviar token via `X-ALUNA-TOKEN` como fallback além de `X-Device-Token`
- **Critério de pronto:** Token aluna em `X-ALUNA-TOKEN` é aceito e validado
- **Confidência:** 🟡 INFERIDO

### T08: Nexus Firewall (pré-validação)
- **Arquivo legado:** `Core/AuthMiddleware.php`
- **Descrição:** Antes de validar token, verificar se IP está banido em `banned_ips` (SQLite + MySQL). Se banido, rejeitar imediatamente
- **Critério de pronto:** IP banido recebe 403 antes de qualquer validação de token
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Happy path — admin com token válido acessa rota protegida
- [ ] TT-02: Happy path — licenciada com device_token ativo acessa rota
- [ ] TT-03: Token admin expirado retorna 401 com "token_expired"
- [ ] TT-04: Logout de licenciada — token posterior retorna 401
- [ ] TT-05: IP banido recebe 403 na firewall

## Ordem Sugerida

1. T02, T03, T04 primeiro (validação por perfil)
2. T01 (extração unificada)
3. T06 (código de erro)
4. T08 (firewall)
5. T05 (logout)
6. T07 (fallback)

## Lacunas Pendentes (🔴)

- Nenhuma lacuna identificada para esta sub-unit
