---
name: rollback
description: Reversão Instantânea e Restauração de Estado Estável (Nexus Protocol V3.2). Use para restaurar o último estado funcional conhecido em caso de falha.
---

# 🛑 /rollback — Contingência Rápida em 1-Clique

Sua missão é restaurar imediatamente o último estado funcional conhecido da aplicação em caso de incidente ou anomalia em produção.

## 📋 Algoritmo de Execução

1. **Identificação do Incidente**:
   - Isole qual camada falhou (Hostinger, VPS CRM ou Banco de Dados).
2. **Execução da Reversão**:
   - Se Hostinger: restaure o backup anterior da release.
   - Se VPS: execute o rollback dos containers Docker (docker compose down && docker compose up -d).
   - Se Git: reverta o commit problemático (git revert HEAD --no-edit).
3. **Verificação de Estabilidade**:
   - Execute testes de fumaça até confirmar HTTP 200 OK nas rotas vitais.
4. **Registro de Incidente**:
   - Registre o motivo do rollback no openspec/tracker/task.md e notifique o usuário com a rota de correção sugerida.
