# ADR-004: NexusSQLite Dual-Engine (SQLite + MySQL)

**Data**: Commit `02c8b3a6` — V147
**Confiança**: 🟢 CONFIRMADO

## Contexto
O sistema superadmin (Nexus) precisava de operações rápidas de segurança e auditoria sem depender exclusivamente do MySQL principal (Oracle/Hostinger). Em falhas de conexão MySQL, o admin ficava cego.

## Decisão
Implementar NexusSQLite: banco SQLite local no servidor para operações admin críticas:
- `security_ip_rules`, `nexus_audit_ops`, `nexus_cache`
- Degradação graciosa para MySQL se pdo_sqlite indisponível
- Mesma interface de consulta para ambos

## Alternativas Consideradas
- **Apenas MySQL**: Ponto único de falha
- **Apenas SQLite**: Sem replicação para disaster recovery
- **Dual Engine**: SQLite para admin (zero conexões MySQL), MySQL para dados de negócio

## Consequências
- Positivo: Admin continua funcional mesmo com MySQL offline
- Positivo: Firewall (IP ban) opera mesmo sem MySQL
- Positivo: Zero custo de infra (SQLite é embutido no PHP)
- Negativo: SQLite não escala para escrita concorrente
- Negativo: Dados duplicados entre SQLite e MySQL em algumas tabelas
