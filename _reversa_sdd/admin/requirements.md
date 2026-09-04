# Requirements: Administração (Admin)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Infraestrutura administrativa do Body Harmony: Core system (Response, Router, Cache, Logger), engine de cache e feature flags, watchtower de segurança, e controllers de gerenciamento de usuários (admin, aluna). Opera com SQLite como engine auxiliar e MySQL como principal.

## Responsabilidades

- Response padronizada JSON com http_response_code e Content-Type automático
- Cache filesystem com stale-while-revalidate (cache público e privado)
- Logging estruturado com sanitização automática de dados sensíveis
- Feature flags (maintenance_mode via banco)
- Roteamento centralizado de todas as rotas da API
- Gerenciamento de usuários (ban/unban, reset_lifecycle)
- Watchtower: detecção de compartilhamento de credenciais

## Regras de Negócio

- Cache público é compartilhado globalmente; cache privado é segmentado por token de usuário 🟢
- Feature flags são limitadas a `maintenance_mode` no banco 🟢
- Dados sensíveis (password, token, secret, key) são redactados automaticamente nos logs 🟢
- Superadmin pode executar `reset_lifecycle`: force_password, revoke_lgpd, clear_devices, clear_throttling, max_devices 🟢
- Cache staleness serve dados expirados enquanto revalida em background (stale-while-revalidate) 🟢
- SQLite usado para admin (audit, firewall, cache) com fallback para MySQL se SQLite indisponível 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Response::json padronizada | Must | Toda resposta usa mesmo formato JSON com status code |
| RF-02 | Cache filesystem com stale-while-revalidate | Must | Cache expirado retorna stale enquanto revalida async |
| RF-03 | Cache público vs privado | Must | Cache privado só visível ao mesmo usuário |
| RF-04 | Logging com sanitização | Must | Log nunca expõe password, token, secret, key |
| RF-05 | Feature flag maintenance_mode | Should | Admin ativa/desativa modo de manutenção sem deploy |
| RF-06 | Roteamento centralizado | Must | Router.php mapeia todas as rotas da API |
| RF-07 | CRUD de usuários (ban/unban/reset) | Must | Admin pode banir/desbanir e resetar lifecycle |
| RF-08 | Watchtower (compartilhamento de credenciais) | Should | Detecta mesmo user em múltiplos IPs em 60 min |
| RF-09 | Fallback SQLite → MySQL | Could | Logging e cache mantidos se SQLite falhar |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Cache em disco com TTL configurável (padrão 1800s) | `ResponseCache.php:30` | 🟢 |
| Segurança | Redact automático de credenciais em logs | `NexusLogger.php:44` | 🟢 |
| Disponibilidade | Fallback SQLite → MySQL em indisponibilidade | `NexusSQLite.php:55` | 🟢 |
| Disponibilidade | Retry automático 3x em falha de banco | `db.php:22` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um request GET para rota cacheável
Quando cache está fresco
Então retorna dados do cache sem executar callback

Dado um request GET para rota cacheável
Quando cache está expirado
Então retorna stale e revalida em background

Dado um admin executando manageUser com action=ban
Quando userId é fornecido
Então usuário tem is_active = 0

Dado que um mesmo user_id acessa de 3+ IPs distintos
Quando intervalo é < 60 min
Então watchtower gera alerta de compartilhamento
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Response padronizada | Must | Toda API depende de Response.php |
| Cache stale-while-revalidate | Must | Otimização crítica de performance |
| Roteamento centralizado | Must | Toda rota passa por Router.php |
| Logging com sanitização | Must | LGPD e compliance |
| Feature flags | Should | Útil mas sem fallback necessário |
| Watchtower | Should | Detecta abuso mas não bloqueia |
| Fallback SQLite → MySQL | Could | Caso raro de falha |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Core/Response.php` | `json`, `error` | 🟢 |
| `Core/ResponseCache.php` | `serve`, `clear` | 🟢 |
| `Core/NexusLogger.php` | `log` | 🟢 |
| `Core/NexusErrorHandler.php` | `handle` | 🟢 |
| `Core/NexusSQLite.php` | `getConnection` | 🟢 |
| `Core/Router.php` | `resolve` | 🟢 |
| `Controllers/AdminController.php` | `manageUser` | 🟢 |
| `admin/watchtower/core.php` | `detectAnomalies` | 🟢 |
