# Requirements: Nexus

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Nexus é o centro de comando administrativo do Body Harmony: dashboard de sistema, firewall IP, forense de alunos, auditoria de operações, gerenciamento de banco de dados (snapshots/staging), scripts automatizados e watchtower de segurança. Opera primariamente com SQLite como engine transacional (zero conexões MySQL extras), com fallback para MySQL.

## Responsabilidades

- Dashboard de status do sistema (latência DB, sessões ativas, disco, memória, erros)
- Security Dashboard: métricas de ameaça, tentativas de login, IPs suspeitos, sessões ativas
- Firewall IP (BAN/ALLOW/SUSPICIOUS) com auditoria completa via SQLite
- Forense de alunos: análise de acesso, busca por hash, configuração de regras
- Gerenciamento de banco de dados: snapshots SQL, staging user management, alter table wizard
- Scripts administrativos: execução e gerenciamento de scripts personalizados
- Auditoria de operações (nexus_audit_ops) com paginação e feed combinado
- Manutenção de sistema: flush de cache, purge de dispositivos, limpeza de logs, reset GeoIP
- Watchtower: timeline de segurança por CPF, feed de anomalias de login + ações admin
- Testes de conectividade e integridade do sistema

## Regras de Negócio

- Firewall IP usa SQLite com upsert ON CONFLICT; MySQL usa ON DUPLICATE KEY UPDATE como fallback 🟢
- Regras de firewall têm tipo: BAN, ALLOW, SUSPICIOUS com duração opcional (expires_at) 🟢
- Auditoria de operações registra admin_id, action, target_id, payload_before/payload_after 🟢
- Feed do Guardian combina anomalias de login (MySQL) + ações admin (SQLite) em timeline única 🟢
- Manutenção: PURGE_DEVICES remove dispositivos inativos >30 dias; CLEAN_LOGS remove logs >90 dias 🟢
- Apenas admin autenticado pode executar operações de firewall, forense e manutenção 🟢
- Sistema de staging usa usuário DB_STAGE_USER (`nexus_user`) com senha separada 🟡
- Snapshots SQL são gerados com timestamp no nome do arquivo 🟢
- Forense permite busca de alunos por CPF, geração batch de relatórios e lookup por hash de dispositivo 🟢
- Configurações de forense são persistidas e editáveis via interface admin 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Dashboard de status do sistema | Must | Exibe latência DB, sessões ativas, taxa de erro 1h, disco, memória |
| RF-02 | Security Dashboard com métricas | Must | Exibe failed_logins_24h, suspicious_ips, blocked_ips, sessões ativas |
| RF-03 | Firewall IP (CRUD de regras) | Must | Admin pode adicionar BAN/ALLOW/SUSPICIOUS com IP, razão e duração |
| RF-04 | Auditoria de operações | Must | Toda ação de firewall e manutenção é registrada em nexus_audit_ops |
| RF-05 | Feed Guardian combinado | Must | Timeline única com anomalias de login + ações admin |
| RF-06 | Forense de alunos | Must | Busca por CPF, análise de acesso, geração batch de relatórios |
| RF-07 | Lookup por hash de dispositivo | Should | Busca dispositivo por fingerprint hash |
| RF-08 | Snapshot de banco de dados | Should | Gera arquivo SQL com timestamp para backup |
| RF-09 | Staging user management | Should | Gerencia credenciais de banco de staging (DB_STAGE_USER) |
| RF-10 | Manutenção do sistema | Must | FLUSH_CACHE, PURGE_DEVICES, CLEAN_LOGS, RESET_GEOIP |
| RF-11 | Watchtower timeline por CPF | Should | Timeline de segurança filtrada por CPF de licenciada |
| RF-12 | Scripts administrativos | Could | Execução e gerenciamento de scripts personalizados |
| RF-13 | Configuração de forense | Should | Admin pode configurar regras e parâmetros do forense |
| RF-14 | Testes de conectividade | Could | Endpoint para teste de integridade do sistema |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | SQLite como engine primário (zero conexões MySQL extras) | `NexusOpsController.php:3` | 🟢 |
| Disponibilidade | Fallback automático para MySQL se pdo_sqlite indisponível | `NexusOpsController.php:4` | 🟢 |
| Disponibilidade | Firewall SQLite com upsert (ON CONFLICT) e fallback MySQL | `NexusOpsController.php:88-114` | 🟢 |
| Segurança | Auditoria obrigatória de operações de firewall e manutenção | `NexusOpsController.php:116` | 🟢 |
| Performance | Paginação de audit logs (limit 200, offset) | `NexusOpsController.php:331-344` | 🟢 |
| Performance | Guardian Feed limitado a 50 registros combinados | `NexusOpsController.php:263-264` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado que admin acessa o dashboard Nexus
Quando a página carrega
Então exibe status do sistema com latência DB, sessões ativas, métricas de disco

Dado que admin adiciona regra de firewall
Quando IP é válido e tipo é BAN/ALLOW/SUSPICIOUS
Então regra é salva em SQLite e auditoria é registrada

Dado que admin executa CLEAN_LOGS
Quando logs têm mais de 90 dias
Então registros são removidos de auth_logs, lms_access_logs e nexus_audit_ops

Dado que admin acessa forense de alunos
Quando busca por CPF
Então exibe histórico de acessos, dispositivos e alertas do aluno

Dado que admin remove regra de firewall
Quando regra existe
Então regra é deletada e auditoria registra payload_before (estado anterior)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Dashboard sistema + segurança | Must | Interface central do Nexus admin |
| Firewall IP com auditoria | Must | Segurança crítica do sistema |
| Feed Guardian | Must | Monitoramento unificado |
| Forense de alunos | Must | Investigação de incidentes |
| Manutenção do sistema | Should | Operações periódicas |
| Staging user management | Should | Ambiente de desenvolvimento |
| Snapshots SQL | Could | Backup manual opcional |
| Scripts administrativos | Could | Automação avançada |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/NexusOpsController.php` | `getRules`, `addRule`, `removeRule`, `manageIPRule`, `getAuditFeed`, `systemMaintenance`, `getAuditLogs` | 🟢 |
| `Controllers/NexusDashboardController.php` | `getSystemStatus`, `getSecurityMetrics` | 🟢 |
| `Controllers/NexusDbController.php` | Gerenciamento de banco (snapshot, staging, alter table) | 🟢 |
| `Controllers/NexusForensicsController.php` | `analyze`, `getStudents`, `generateBatch`, `getLogs`, `lookup`, `getConfig`, `updateConfig` | 🟢 |
| `Controllers/NexusScriptsController.php` | Execução e gerenciamento de scripts | 🟢 |
| `Controllers/NexusTestController.php` | Testes de conectividade | 🟢 |
| `Controllers/WatchtowerController.php` | Timeline de segurança por CPF | 🟢 |
| `Controllers/AIAdminController.php` | Configuração AI (nexus/ai) | 🟢 |
| `Core/NexusGuard.php` | Middleware de segurança/firewall | 🟢 |
| `Core/NexusLogger.php` | Logging estruturado | 🟢 |
| `Core/NexusErrorHandler.php` | Tratamento de erros | 🟢 |
| `Core/NexusSQLite.php` | Engine SQLite | 🟢 |
| `admin/watchtower/core.php` | Watchtower core | 🟢 |
