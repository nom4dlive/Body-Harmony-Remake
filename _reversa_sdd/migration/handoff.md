---
schemaVersion: 1
generatedAt: 2026-06-02T21:55:00-03:00
reversa:
  version: "1.2.43"
kind: handoff
producedBy: orchestrator
hash: "sha256:0000000000000"
---

# Handoff para o Agente de Codificação

> Sistema novo a ser construído em paradigma **OO com DI (Laravel 11)**, topologia **DDD Modular Monolith (11 bounded contexts)**, telas em modo **literal (React SPA preservado)**. Antes de qualquer linha de código, leia `paradigm_decision.md`, `topology_decision.md` e `screen_modernization_decision.md`.

## ⚠️ Leitura obrigatória primeiro

1. **`paradigm_decision.md`**, leitura inegociável. O paradigma alvo (OO com DI transformacional) molda toda a codificação: repositories injetados, actions classes para fluxos complexos, contracts para cada boundary, zero variáveis globais.
2. **`topology_decision.md`**, leitura inegociável. Topologia DDD Modular Monolith com 11 módulos Laravel independentes (Auth, Licenciada, Aluna, LMS, DoctorHarmony, Broadcast, Content, Media, Nexus, Leads, Analytics).
3. **`screen_modernization_decision.md`**, leitura inegociável. Modo literal: frontend React SPA preservado integralmente. Apenas chamadas de API mudam.

## Ordem de leitura recomendada

1. `paradigm_decision.md` (obrigatório, primeiro)
2. `topology_decision.md` (obrigatório, segundo)
3. `screen_modernization_decision.md` (obrigatório — sistema tem UI)
4. `migration_brief.md`
5. `target_business_rules.md`
6. `migration_strategy.md`
7. `target_architecture.md`
8. `target_domain_model.md`
9. `target_data_model.md`
10. `data_migration_plan.md`
11. `target_screens.md`
12. `parity_specs.md` + `parity_tests/`
13. `screen_deviation_log.md` (consultivo)
14. `risk_register.md` + `cutover_plan.md`
15. `discard_log.md` (consultivo)
16. `ambiguity_log.md` (consultivo)

## Lista de artefatos produzidos

| Artefato | Produzido por | Status |
|---|---|---|
| migration_brief.md | orchestrator | criado |
| paradigm_decision.md | paradigm_advisor | criado |
| target_business_rules.md | curator | criado |
| discard_log.md | curator | criado |
| ambiguity_log.md | curator | consolidado |
| migration_strategy.md | strategist | criado |
| risk_register.md | strategist | criado |
| cutover_plan.md | strategist | criado |
| topology_decision.md | designer (Fase 1) | criado |
| target_architecture.md | designer | criado |
| target_domain_model.md | designer | criado |
| target_data_model.md | designer | criado |
| data_migration_plan.md | designer | criado |
| screen_modernization_decision.md | screen_translator | criado |
| target_screens.md | screen_translator | criado (14 telas, modo literal) |
| screen_deviation_log.md | screen_translator | criado (2 deviations aprovadas) |
| _reversa_sdd/screens/inventory.json | screen_translator | criado (14 telas) |
| parity_specs.md | inspector | criado |
| parity_tests/ | inspector | 7 arquivos .feature |
| handoff.md | orchestrator | criado |

## Bloqueadores para começar a implementação

Nenhum bloqueador. Todas as decisões foram tomadas:
- Paradigma: OO com DI transformacional (aprovado)
- Topologia: DDD Modular Monolith (aprovado)
- Estratégia: Big Bang + Parallel Run (aprovado)
- Modo de telas: literal (aprovado)
- Deviations DEV-001 e DEV-002: aprovadas
- 3 ambiguidades (AMB-001, AMB-002, AMB-003): todas resolvidas

## Próximos passos para o agente de codificação

1. **Ler `paradigm_decision.md` e internalizar**: OO com DI puro. Toda escolha de código (controllers, services, repositories, models) deve usar injeção de dependências via Service Container. Proibido `global`, helpers estáticos, ou Active Record direto em controllers.

2. **Ler `topology_decision.md` e internalizar**: DDD Modular Monolith com módulos Laravel independentes. Cada bounded context tem seu próprio Service Provider, Models, Repositories, Services e Actions dentro de `app/Modules/{Module}/`.

3. **Ler `screen_modernization_decision.md` e internalizar**: modo literal. O frontend React SPA em `apps/web-app/src/frontend/src/` é preservado integralmente. Nenhuma modificação de componente, layout ou estilo.

4. **Configurar o repositório**: Laravel 11, PHP 8.4, MySQL 8.4, Sanctum para auth, API REST versionada (`/api/v1/*`).

5. **Implementar bottom-up** seguindo `target_architecture.md` e `target_domain_model.md`:
   - **Fase 0 (setup)**: Service Container, Contracts, Shared Kernel (Cache, Log, Audit, Notify)
   - **Fase 1 (auth)**: Auth Module primeiro (login, throttling, device FIFO, tokens Sanctum)
   - **Fase 2 (cadastros)**: Licenciada, Aluna, Admin modules
   - **Fase 3 (core)**: LMS, DoctorHarmony, Broadcast modules
   - **Fase 4 (suporte)**: Content, Media, Nexus, Leads, Analytics modules
   - **Fase 5 (frontend)**: Ajustar chamadas de API no React SPA (base URL, endpoints, auth flow Sanctum)
   - **Fase 6 (dados)**: Migração de dados seguindo `data_migration_plan.md`
   - **Fase 7 (parallel run)**: Configurar Parallel Run com ambos os sistemas na VPS

6. **Implementar as telas**: modo literal — o código React existente já é a implementação. Apenas refatorar services/fetch calls para apontar para os novos endpoints Laravel (`/api/v1/*`). Seguir `target_screens.md` como guia de endpoints.

7. **Escrever testes** a partir de `parity_specs.md` e `parity_tests/*.feature` desde o início. Os 7 cenários Gherkin cobrem: login (throttling, device FIFO, impersonation), LMS (progression lock, quiz, certificate), DoctorHarmony (crisis detection, hybrid review, LGPD), Broadcast (create, acknowledge, expiry, history), Nexus (firewall BAN/ALLOW, anomaly detection). Tags: `@paridade` + `@composicao` (paradigma OO com DI).

8. **Validar conformidade estrutural**: o código novo não pode conter `global $pdo`, `global $loggedUser`, ou helpers estáticos sem injeção (critério do `paradigm_decision.md`).

9. **Para a migração de dados**, seguir `data_migration_plan.md`: 23 tabelas mapeadas, 4 transformações de dados.

10. **Para o cutover**, seguir `cutover_plan.md` (30-60 min, com rollback em 15 min) e os critérios go/no-go definidos em `parity_specs.md § Critérios de paridade aceita`.

## Itens auto-decididos (apenas se executado em --auto)

Pipeline executado em modo **interativo**. Nenhum item auto-decidido.

## Notas finais

- **Prazo crítico**: 24 horas. Priorizar Fase 0 (setup DI) e Fase 1 (auth) como blocos fundacionais.
- **Parallel Run**: ambos os sistemas (legado PHP + novo Laravel) rodam na mesma VPS durante validação. O frontend React SPA é compartilhado — um proxy decide qual backend recebe a requisição.
- **Deviations aprovadas**: DEV-001 (URLs de API mudam) e DEV-002 (autenticação via Sanctum token) estão refletidas em `parity_specs.md § Exceções`.
- **KVM 4 resources**: 4 vCPUs, 8GB RAM. Usar OPcache, cache com Redis (ou file cache), workers limitados.
- **Consultar `discard_log.md`** para regras descartadas (injeção global, superadmin hardcoded) que não devem ser reimplementadas.
- **Consultar `ambiguity_log.md`** para 3 decisões humanas documentadas (certificado: bloquear re-emissão; fotos: local filesystem; broadcast: banner não-bloqueante).
