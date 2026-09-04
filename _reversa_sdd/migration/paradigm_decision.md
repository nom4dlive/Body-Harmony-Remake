---
schemaVersion: 1
generatedAt: 2026-06-02T21:08:00-03:00
reversa:
  version: "1.2.43"
kind: paradigm_decision
producedBy: paradigm_advisor
hash: "sha256:f7e8d9a0b1c2"
---

# Paradigm Decision

> Decisão consciente sobre como tratar a mudança (ou ausência) de paradigma entre o legado e a stack alvo.
> Este artefato é leitura obrigatória primeiro para qualquer agente posterior e para o agente de codificação.

## Paradigma do legado detectado
- **Paradigma principal**: OO clássico (com vestígios procedurais)
- **Confiança**: 🟢 CONFIRMADO
- **Evidências**:
  - Injeção global (`global $pdo, $loggedUser`) em todos os controllers — sem DI container (`_reversa_sdd/architecture.md:46-48`)
  - Helpers estáticos como `AuthMiddleware::handle()`, `JWT` (classes estáticas) (`_reversa_sdd/code-analysis.md:8-16`)
  - Controllers com queries SQL embutidas misturadas à lógica de negócio (`_reversa_sdd/code-analysis.md:21-46`)
  - Sem Repository Pattern, sem interfaces de abstração de camadas (`_reversa_sdd/architecture.md:63-68`)
  - Configs e conexão de banco como variáveis globais no entry point `index.php` (~1400 linhas)
- **Variações observadas** (se híbrido): N/A — monolítico OO clássico homogêneo

## Stack alvo declarada
- Linguagem: PHP 8.4
- Framework: Laravel 11
- Infra: Hostinger KVM 4 VPS, Docker Compose + Traefik (mesmo ambiente do legado, em paralelo até cutover)

## Paradigma natural inferido
- **Paradigma**: OO com DI (Dependency Injection)
- **Justificativa**: O ecossistema Laravel 11 é centrado no Service Container — providers registram dependências, facades são proxies para serviços do container, contracts definem interfaces que o container resolve. Controllers recebem dependências por injeção no construtor/método. Eloquent ORM oferece Active Record (OO clássico) mas a prática recomendada do framework é abstrair atrás de repositories e services injetados.
- **Alternativas viáveis**: OO clássico via Eloquent Active Record puro (viável mas perde testabilidade)

## Gap identificado
- **Severidade**: médio (mesma linguagem, transição gradual dentro do ecossistema PHP)
- **Implicações concretas** (não em abstrato; com exemplo do próprio sistema legado):
  1. **Active Record → Repository Pattern**: `LicenciadasController::store()` faz INSERT direto com SQL. No Laravel/DI, vira `LicenciadaRepository::create()` injetado, com validação em FormRequest.
  2. **Global injection → Service Container**: `AuthController` recebe `$pdo` e `$loggedUser` via `global`. No Laravel, `__construct(protected AuthService $auth, protected DeviceManager $devices)` — container resolve tudo.
  3. **Lógica de negócio espalhada → Services/Actions**: Fluxo de autenticação de licenciada mistura throttling, RiskEngine, fingerprint, device FIFO, LGPD check, logging no mesmo método (`_reversa_sdd/code-analysis.md:29-46`). No Laravel/DI, cada etapa vira uma Action Class injetada.
  4. **Testabilidade zero → Testes com mocks**: `global $pdo` impede testes unitários. Com Contracts + Container, `DeviceManagerInterface` é mockável em `LicenciadaAuthServiceTest`.

## Opções apresentadas ao usuário
1. **Adotar paradigma natural da stack (transformacional)** — OO com DI puro
   - Consequências: repositories injectados em todos os controllers; actions classes para fluxos complexos; contracts para cada boundary; testes unitários viáveis com mocks; curva de aprendizado inicial maior.
2. **Forçar paradigma similar ao legado (conservador)** — OO clássico via Eloquent Active Record
   - Consequências: implementação mais rápida inicialmente; reproduz acoplamento controller->model; testabilidade comprometida; migração mais direta do código legado.
3. **Híbrido (equilibrado)** — Eloquent + DI nos fluxos críticos
   - Consequências: Active Record para CRUDs simples; DI + Actions para fluxos de alta complexidade (auth, broadcast, doctor-harmony); balanceia velocidade com qualidade.

## Decisão do usuário
- **Escolha**: 1 — Adotar paradigma natural da stack (transformacional)
- **Justificativa do usuário**: optou por máxima qualidade e testabilidade, mesmo com prazo curto de 24h
- **Decidido em**: 2026-06-02T21:08:00-03:00

## Apetite derivado
- `derived_appetite`: transformational

## Implicações pendentes para próximos agentes
| Agente | Implicação | Como honrar |
|---|---|---|
| Curator | Regras de negócio que hoje usam estado global precisam ser expressas como serviços injetáveis | Garantir que `target_business_rules.md` capture dependências explícitas de cada regra, não use "estado global disponível" como premissa |
| Strategist | Estratégia de migração deve priorizar criação da infraestrutura de DI (container, providers, contracts) antes dos fluxos de negócio | Incluir "setup de Service Container e Contracts" como etapa obrigatória no roadmap |
| Designer | Arquitetura alvo deve espelhar OO com DI: camada Application (Actions/Services), Domain (Models/Contracts), Infrastructure (Repositories/Providers) | `target_architecture.md` deve declarar explicitamente camadas e boundaries orientadas a DI |
| Inspector | Critérios de paridade devem verificar que fluxos migrados usam DI e não `global` | Incluir "ausência de variáveis globais" como critério de conformidade estrutural em `parity_specs.md` |

## Notas
O prazo de 24h é o maior risco. Recomenda-se que o Strategist proponha uma abordagem com entregas incrementais mesmo dentro do prazo: primeiro a casca (roteamento, auth, container) e depois os fluxos de negócio em ordem de criticidade.
