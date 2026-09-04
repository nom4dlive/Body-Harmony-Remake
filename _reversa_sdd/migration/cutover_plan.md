---
schemaVersion: 1
generatedAt: 2026-06-02T21:15:00-03:00
reversa:
  version: "1.2.43"
kind: cutover_plan
producedBy: strategist
hash: "sha256:a9b0c1d2e3f4"
---

# Cutover Plan

> Plano de corte do legado para o sistema novo, alinhado à estratégia escolhida em `migration_strategy.md`.

## Estratégia base
- **Estratégia confirmada**: B — Big Bang + Parallel Run (a confirmar pelo usuário)

## Pré-requisitos
- [ ] Sistema Laravel 11 construído com paridade funcional das rotas core
- [ ] Script de migração de dados MySQL (ETL) pronto e testado em staging
- [ ] Parallel run configurado: ambos os sistemas rodando na mesma VPS com portas diferentes
- [ ] Configuração do Nginx/Traefik para roteamento seletivo durante parallel run
- [ ] Smoke tests automatizados para verificar endpoints críticos
- [ ] Dump do banco legado antes de qualquer migração

## Janela de cutover
- **Data alvo**: a definir (após parallel run validar paridade)
- **Duração estimada**: 30-60 minutos (troca de DNS/Traefik + verificação)
- **Ambiente afetado**: produção (VPS Hostinger KVM 4)
- **Comunicação prévia**: broadcast via sistema de comunicados (BR-MIGRAR-038) informando janela de manutenção

## Passos do cutover

| # | Passo | Owner | Duração | Reversível? |
|---|---|---|---|---|
| 1 | Congelar escritas no legado (modo maintenance) | GERMANO | 2 min | sim (desativar maintenance) |
| 2 | Executar ETL final incremental (dados desde o início do parallel run) | GERMANO | 5-15 min | sim (re-executável) |
| 3 | Verificar consistência dos dados migrados | GERMANO | 5 min | sim (comparação de counts) |
| 4 | Ajustar DNS/Traefik para apontar para o novo sistema | GERMANO | 2 min | sim (reverter DNS) |
| 5 | Executar smoke tests automáticos no novo sistema | GERMANO | 5 min | sim |
| 6 | Verificar logs do novo sistema (erros, warnings) | GERMANO | 3 min | N/A |
| 7 | Desabilitar maintenance mode | GERMANO | 1 min | sim |
| 8 | Monitorar por 30 min | GERMANO | 30 min | N/A |

## Plano de rollback
- **Critérios de acionamento**: qualquer erro crítico (500 generalizado, dados inconsistentes, falha de autenticação)
- **Passos**:
  1. Re-ativar maintenance mode
  2. Reverter DNS/Traefik para o legado
  3. Verificar que o legado está operacional
  4. Investigar causa no sistema novo
- **Tempo máximo aceitável até rollback**: 15 minutos
- **Owner do rollback**: GERMANO

## Critérios de go / no-go
- **Go**:
  - ETL concluído sem erros e com counts consistentes
  - Todos os endpoints críticos respondem 200 (auth, LMS, doctor-harmony, broadcast)
  - Logs do sistema novo sem erros fatais
  - Legado em modo maintenance com aviso prévio publicado
- **No-go**:
  - ETL com perda de dados ou inconsistências
  - Endpoints core retornando erro
  - Performance degradada (latência > 2x do legado nos endpoints core)
  - Qualquer funcionalidade crítica bloqueada (login, progresso, IA)

## Pós-cutover
- [ ] Monitoramento estendido por 24h
- [ ] Validação de paridade conforme `parity_specs.md`
- [ ] Parallel run desativado (legado desligado) após 7 dias sem incidentes
- [ ] Decommission do legado (remoção de containers, limpeza de disco) em D+7
- [ ] Backup do sistema novo pós-cutover

## Notas

O parallel run (passo 0, que dura dias) não está listado nos passos de cutover — ocorre antes. Durante o parallel run, ambos os sistemas recebem tráfego real e os outputs são comparados. O cutover é o momento de *desligar* o legado e *promover* o novo, após validação suficiente.
