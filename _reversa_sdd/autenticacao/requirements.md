# Requirements: Autenticação

> Identificador: `001-autenticacao`
> Data: `2026-06-02`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo executivo

Sistema de autenticação e autorização com suporte a três perfis (admin, licenciada, aluna), JWT alternativo por token de sessão, controle de dispositivos simultâneos, firewall de IP, detecção de risco (RiskEngine) e login como terceiro (admin como licenciada).

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#auth` | Middleware JWT, AuthController, AlunaAuthController, NexusGuard, RiskEngine | 🟢 |
| `_reversa_sdd/data-dictionary.md#auth` | admin_users, admin_sessions, licenciadas, alunas, auth_logs, nexus_security_rules | 🟢 |
| `.reversa/context/modules.json#auth` | 7 funções mapeadas, 3 entidades, 7 regras de negócio, 4 algoritmos | 🟢 |
| `_reversa_sdd/architecture.md#auth` | AuthMiddleware na cadeia de middleware do Router.php | 🟢 |
| `_reversa_sdd/permissions.md` | RBAC com 3 roles (superadmin, admin, editor) + perfis licenciada e aluna | 🟢 |
| `_reversa_sdd/state-machines.md` | Estados de sessão: ativa → expirada → revogada | 🟡 |
| `_reversa_sdd/database/data-dictionary.md` | auth_logs com risk scoring (V47+) | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Admin (superadmin/admin/editor) | Acessar painel administrativo | Login com username+senha, sessão token |
| Licenciada | Acessar portal LMS | Login com CPF/email+senha, device token |
| Aluna | Acessar portal de cursos avulsos | Login com email+senha, device token |
| Admin como licenciada | Debug/suporte | Login impersonificando licenciada via ID negativo |

## 4. Regras de negócio

1. **RN-01:** Senha deve ter pelo menos 6 caracteres para alteração 🟢
   - Origem no legado: AuthController.php:469
2. **RN-02:** Bloqueio de conta após 3 tentativas falhas consecutivas por 15 min 🟢
   - Origem no legado: AuthController.php:205, nexus_security_rules.MAX_LOGIN_ATTEMPTS=3
3. **RN-03:** Máximo de dispositivos simultâneos por perfil (FIFO) 🟢
   - Origem no legado: licenciadas.max_devices, alunas.max_devices
4. **RN-04:** Admin pode logar como licenciada via ID negativo (-admin_id) 🟢
   - Origem no legado: AuthController.php:176
5. **RN-05:** Token de aluna prefixado com 'al_' 🟢
   - Origem no legado: AlunaAuthController.php:162
6. **RN-06:** Superadmin hardcoded como id=5 🟢
   - Origem no legado: NexusGuard.php:39
7. **RN-07:** Senha padrão 'Mudar123!' com força de troca para novas licenciadas 🟢
   - Origem no legado: LicenciadasController.php:145
8. **RN-08:** Dual-Layer Throttling: account-based (3 falhas) + IP-based (50 falhas) 🟢
   - Origem no legado: AuthController.php + nexus_security_rules
9. **RN-09:** Fingerprint de dispositivo com reuse via hash 🟡
   - Origem no legado: RiskEngineService.php

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Login de admin com username+senha | Must | Admin autenticado recebe token de sessão | 🟢 |
| RF-02 | Login de licenciada com CPF/email+senha | Must | Licenciada autenticada recebe device_token | 🟢 |
| RF-03 | Login de aluna com email+senha | Must | Aluna autenticada recebe token prefixado 'al_' | 🟢 |
| RF-04 | Logout com invalidação de token | Must | Token removido da tabela de sessões | 🟢 |
| RF-05 | Verificação de token via AuthMiddleware | Must | Requisição sem token válido retorna 401 | 🟢 |
| RF-06 | Bloqueio por tentativas falhas | Must | Conta bloqueada por 15 min após 3 falhas | 🟢 |
| RF-07 | Admin impersonificar licenciada | Should | Admin envia ID negativo e recebe contexto de licenciada | 🟢 |
| RF-08 | Controle de dispositivos simultâneos | Should | Dispositivo mais antigo desativado se exceder limite | 🟢 |
| RF-09 | Firewall de IP (whitelist/blacklist) | Should | IPs na whitelist bypassam throttling | 🟢 |
| RF-10 | Risk scoring em tentativas de login | Could | auth_logs registra risk_score (0-100) | 🟢 |
| RF-11 | Magic token para auto-login via Telegram | Could | Token único com expiração para SSO | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | Senhas armazenadas com bcrypt ($2y$10$ ou $2y$12$) | DDL admin_users.password_hash | 🟢 |
| Segurança | Tokens de sessão armazenados como SHA256 | admin_sessions.token VARCHAR(64) | 🟢 |
| Segurança | Rate limiting por IP e conta | AuthController com dual-layer throttling | 🟢 |
| Segurança | Redação de dados sensíveis em logs | NexusLogger.php redata password, token, secret, key | 🟢 |
| Disponibilidade | Retry automático com backoff (1s, 2s) para 500/503 | Stability Shield V100 no frontend | 🟢 |
| Performance | Cache de verificação de token via ResponseCache | ResponseCache com TTL 1800s | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Login de admin com sucesso
  Dado que existe um admin com username "bodyharmony" e senha válida
  Quando o admin envia POST /v1/auth/login com {username, password}
  Então a resposta contém {token, user} com status 200
  E um registro em admin_sessions é criado

Cenário: Login de admin com senha inválida
  Dado que existe um admin com username "bodyharmony"
  Quando o admin envia POST /v1/auth/login com senha incorreta
  Então a resposta contém {error} com status 401
  E um registro em auth_logs com status "failure_credentials" é criado

Cenário: Bloqueio de conta após 3 tentativas falhas
  Dado que uma licenciada teve 3 falhas consecutivas de login
  Quando a licenciada tenta login novamente
  Então a resposta contém {error: "account_locked"} com status 423
  E o campo locked_until está preenchido com 15 min no futuro

Cenário: Admin impersonifica licenciada
  Dado que um admin está autenticado
  Quando o admin envia POST /v1/auth/login-como-com-id-negativo com id=-5
  Então a resposta contém dados da licenciada com is_admin=true e max_devices=999

Cenário: Token de aluna com prefixo
  Dado que uma aluna existe com email e senha válidos
  Quando a aluna envia POST /v1/aluna/auth/login
  Então o token retornado começa com "al_"
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 a RF-05 | Must | Caminho crítico de autenticação |
| RF-06 | Must | Segurança: bloqueio por brute force |
| RF-07 | Should | Suporte admin, não usado por usuários finais |
| RF-08, RF-09 | Should | Segurança adicional, fallback para sem |
| RF-10, RF-11 | Could | Watchtower Intelligence e Telegram SSO |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda.

## 10. Lacunas

- 🔴 [DÚVIDA] Fluxo de recuperação de senha não documentado no código legado — existe implementação?
- 🔴 [DÚVIDA] O campo `licenciada_id` duplicado em `ai_clinical_cases` (license_id + licenciada_id) — qual a diferença semântica?

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-02 | Versão inicial gerada pelo Writer | reversa |
