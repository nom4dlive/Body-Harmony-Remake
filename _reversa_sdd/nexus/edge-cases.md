# Edge Cases: Nexus

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Firewall IP

### EC-01: IP inválido ou malformatado
- Entrada: `addRule({ip: "not-an-ip", type: "BAN"})`
- Comportamento esperado: `Response::error('IP Inválido', 400)` 🟢
- Código: `NexusOpsController.php:70-71`

### EC-02: Tipo de regra inválido
- Entrada: `addRule({ip: "192.168.1.1", type: "INVALID"})`
- Comportamento esperado: `Response::error('Tipo de regra inválida', 400)` 🟢
- Código: `NexusOpsController.php:73-75`

### EC-03: Duração negativa ou zero
- Entrada: `addRule({ip: "192.168.1.1", type: "BAN", duration_hours: -1})`
- Comportamento esperado: `expiresAt = null` (regra permanente) ou data no passado 🟡
- Observação: Código usa `intval()` sem validação de valor mínimo

### EC-04: Remover regra inexistente
- Entrada: `removeRule(99999, adminUser)`
- Comportamento esperado: `Response::error('Regra não encontrada', 404)` 🟢
- Código: `NexusOpsController.php:138-139`

### EC-05: Remover regra com erro de transação
- Entrada: Falha de conexão SQLite durante DELETE
- Comportamento esperado: rollBack() + `Response::error('Falha ao remover regra', 500)` 🟢
- Código: `NexusOpsController.php:142-159`

## Dashboard

### EC-06: Tabela de sessões não existe
- Entrada: `getSystemStatus()` sem tabela `admin_sessions`
- Comportamento esperado: Retorna 0 sem erro (tableExists check) 🟢
- Código: `NexusDashboardController.php:22-28`

### EC-07: Tabela de logs de auditoria não existe
- Entrada: `getSystemStatus()` sem tabela `audit_logs`
- Comportamento esperado: Retorna 0 sem erro (tableExists check) 🟢
- Código: `NexusDashboardController.php:33-39`

### EC-08: Falha em disk_free_space
- Entrada: `getSystemStatus()` com diretório inexistente ou sem permissão
- Comportamento esperado: Retorna 0 e diskTotal = 1 (evita divisão por zero) 🟢
- Código: `NexusDashboardController.php:42-44`

## Guardian Feed

### EC-09: SQLite indisponível para audit feed
- Entrada: `getAuditFeed()` com SQLite offline
- Comportamento esperado: Retorna apenas anomalias de login, adminActions = [] 🟢
- Código: `NexusOpsController.php:258`

### EC-10: Feed vazio
- Entrada: `getAuditFeed()` sem anomalias nem ações admin
- Comportamento esperado: Array vazio, status 'success' 🟢

## Manutenção

### EC-11: Ação de manutenção inválida
- Entrada: `systemMaintenance({action: "INVALID_ACTION"})`
- Comportamento esperado: `Response::error('Ação de manutenção inválida', 400)` 🟢
- Código: `NexusOpsController.php:313-314`

### EC-12: PURGE_DEVICES sem dispositivos para limpar
- Entrada: Nenhum dispositivo inativo >30 dias
- Comportamento esperado: affected = 0, mensagem de sucesso com 0 🟢
- Código: `NexusOpsController.php:288-291`

### EC-13: CLEAN_LOGS em banco vazio
- Entrada: Nenhum registro antigo para limpar
- Comportamento esperado: affected = 0, mensagem de sucesso 🟢
- Código: `NexusOpsController.php:294-304`

## Forense

### EC-14: CPF não encontrado
- Entrada: `analyze(cpf inexistente)`
- Comportamento esperado: Retorna análise vazia ou erro 404 🟡
- Observação: Comportamento exato depende da implementação completa

### EC-15: Hash de dispositivo não encontrado
- Entrada: `lookup(hash inexistente)`
- Comportamento esperado: 404 sem falha 🟡

## Watchtower

### EC-16: CPF sem histórico
- Entrada: `timeline(cpf de aluna inativa)`
- Comportamento esperado: Array vazio de eventos 🟡

## SQLite Fallback

### EC-17: Fallback ativo durante operação crítica
- Entrada: Todas as chamadas Ops com pdo_sqlite indisponível
- Comportamento esperado: Operações funcionam via MySQL global com warning em log 🟢
- Código: `NexusOpsController.php:14-25`

### EC-18: Transação com rollback em falha no Fallback MySQL
- Entrada: addRule() falha no MySQL fallback
- Comportamento esperado: rollBack() + error log + 500 🟢
- Código: `NexusOpsController.php:123-127`
