---
schemaVersion: 1
generatedAt: 2026-06-02T21:40:00-03:00
reversa:
  version: "1.2.43"
kind: parity_specs
producedBy: inspector
hash: "sha256:0000000000000"
---

# Parity Specs

> Estratégia de validação de equivalência comportamental entre legado e sistema novo, adaptada ao paradigma escolhido em `paradigm_decision.md`.

## Estratégia geral

- **Modos de validação aplicáveis**:
  - [x] Shadow mode (espelhamento de tráfego com comparação assíncrona) — durante Parallel Run
  - [x] Characterization tests (suíte derivada do comportamento atual do legado)
  - [x] Contract tests (interfaces externas — API REST)
  - [ ] Data parity (snapshots e checksums)
  - [x] Outro: **Structural compliance** — verificar que código novo não usa `global`, `static::$pdo`, ou variáveis globais (conforme `paradigm_decision.md` § "ausência de variáveis globais como critério de conformidade estrutural")

## Critérios de "paridade aceita"

- **Métrica primária**: divergência funcional < 0,1% por 7 dias consecutivos em Parallel Run
- **Janela de observação**: 7 dias de tráfego espelhado após cutover, com monitoramento contínuo
- **Critério de bloqueio do cutover**: qualquer divergência em fluxos críticos (auth, LMS progression, DoctorHarmony) bloqueia o cutover. Divergências em CRUDs admin podem ser revisadas caso a caso.

## Cobertura adaptada ao paradigma

### Transição: OO clássico → OO com DI

- **Equivalência funcional padrão**: mesma entrada → mesma saída → mesmo efeito colateral observável (banco, notificação, log)
- **Composição de dependências (`@composicao`)**: cada cenário deve validar que o comportamento é equivalente **sem depender de Active Record**. A implementação alvo deve usar Services/Actions injetados com repositórios, não Eloquent diretamente nos controllers.
- **Ausência de variáveis globais**: critério de conformidade estrutural — o código novo não pode conter `global $pdo`, `global $loggedUser`, ou helpers estáticos do legado.

### Cenários mínimos por fluxo

| Fluxo | Tags |
|---|---|
| Todos os fluxos | `@paridade` |
| Fluxos com DI (todos no Laravel) | `@paridade` + `@composicao` |
| Fluxos críticos | `@paridade` + `@composicao` + `@critico` |

## Paridade de telas (modo literal)

- **Modo**: literal (frontend React SPA preservado)
- **Golden files**: 0 — o código fonte atual É o golden (mesma plataforma, mesmo frontend)
- **Validação**: testes funcionais de frontend contra endpoints novos do Laravel. Os contratos de API precisam ser validados entre frontend e backend.
- **Deviations DEV-001 e DEV-002 aprovadas**: URLs de API e autenticação Sanctum são divergências aceitas e propagadas como exceções nesta spec.

## Tipos de teste a aplicar

- **Funcionais**: PHPUnit + Pest no backend Laravel. Testes de API com `actingAs()` para autenticação Sanctum.
- **Contrato**: Laravel FormRequest validation + JSON response structure tests
- **Carga / performance**: K6 ou Laravel Dusk para cenários de alta concorrência (auth, LMS)
- **Resiliência**: testes de falha de dependência externa (API Gemini no DoctorHarmony)

## Reuso de characterization_specs do time de descoberta

- **Origem**: `_reversa_sdd/characterization_specs/` — não disponível
- **Lacuna**: sem characterization specs do legado. Cenários derivados diretamente de `code-analysis.md`, `target_business_rules.md`, `target_domain_model.md` e `target_architecture.md`.

## Saídas

- `parity_tests/*.feature`: 7 cenários em Gherkin para fluxos críticos (auth, LMS, DoctorHarmony, Broadcast, Nexus, Admin)

## Exceções (deviations aprovadas)

| DEV-ID | Descrição | Impacto na paridade |
|---|---|---|
| DEV-001 | URLs de API mudam de `/api/*.php` para `/api/v1/*` RESTful | Testes de contrato devem validar payload, não URL |
| DEV-002 | Autenticação muda de session/cookies para Sanctum token Bearer | Testes de auth devem usar `Authorization: Bearer <token>` em vez de cookies de sessão |
