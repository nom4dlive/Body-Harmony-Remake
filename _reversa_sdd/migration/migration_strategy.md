---
schemaVersion: 1
generatedAt: 2026-06-02T21:15:00-03:00
reversa:
  version: "1.2.43"
kind: migration_strategy
producedBy: strategist
hash: "sha256:e7f8a9b0c1d2"
---

# Migration Strategy

> Estratégias de migração avaliadas com trade-offs explícitos. A estratégia recomendada é a sugestão do Strategist; a decisão final é humana.

## Contexto sintetizado

- **Tamanho do legado**: médio (~14 módulos, 16 unidades, 56 regras de negócio, monolito PHP + React)
- **Apetite derivado**: `transformational` (paradigma OO com DI puro)
- **Gap de paradigma**: OO clássico → OO com DI (severidade: médio — mesma linguagem PHP)
- **Restrições**: 24h prazo, VPS KVM 4 Hostinger, sistema novo em paralelo com legado na mesma VPS até cutover
- **Integrações externas**: Google Gemini API, MySQL 8.4, SQLite (firewall), Nginx, Traefik

## Estratégias avaliadas

### Estratégia A: Big Bang (Build & Switch)
- **Descrição**: Construir o sistema Laravel do zero em paralelo, testar internamente, migrar dados uma única vez no cutover
- **Quando aplica**: sistema pequeno/médio, apetite transformacional, janela de cutover tolerada
- **Custo**: baixo (esforço concentrado, sem overhead de compatibilidade retroativa)
- **Risco**: alto (tudo ou nada no cutover; 24h de desenvolvimento é prazo extremo)
- **Tempo**: curto (24h de build + cutover)
- **Adequação ao apetite derivado** (`transformational`): ✅ Excelente — estratégia preferida para apetite transformacional
- **Trade-offs**:
  - Prós: entrega mais rápida; arquitetura limpa desde o início; sem dívida de compatibilidade; permite reimaginar o sistema no novo paradigma
  - Contras: risco alto de paridade (tudo precisa funcionar no cutover); janela de teste reduzida; 24h é prazo muito agressivo; exige rollback plano

### Estratégia B: Big Bang + Parallel Run (Recomendada)
- **Descrição**: Construir o sistema Laravel do zero (Big Bang), mas rodá-lo em paralelo com o legado na mesma VPS por um período de validação antes do cutover final. Requestos reais são duplicados para ambos os sistemas durante a validação.
- **Quando aplica**: apetite transformacional + necessidade de validação de paridade (como a exigência do brief de "rodar em paralelo na mesma VPS")
- **Custo**: médio (duplicação de infra na mesma VPS durante validação)
- **Risco**: médio (validação reduz o risco de cutover, mas dobra o trabalho operacional)
- **Tempo**: curto-médio (24h build + período de validação paralela)
- **Adequação ao apetite derivado** (`transformational`): ✅ Excelente — honra o apetite transformacional com segurança extra de validação
- **Trade-offs**:
  - Prós: validação de paridade antes do cutover; alinhado à exigência do brief; risco de cutover menor que Big Bang puro; detecção precoce de regressões
  - Contras: consumo extra de recursos na VPS (banco duplicado, processos paralelos); 24h para construir + validar exige disciplina de escopo

### Estratégia C: Strangler Fig
- **Descrição**: Migrar módulo a módulo usando um proxy (Traefik) para rotear requisições entre legado e novo. Módulo por vez.
- **Quando aplica**: sistemas grandes em produção que não podem parar; apetite conservador
- **Custo**: médio (overhead de roteamento e compatibilidade bidirecional)
- **Risco**: baixo (migração incremental, risco localizado)
- **Tempo**: longo (meses para sistema médio)
- **Adequação ao apetite derivado** (`transformational`): ❌ Inadequado — apetite transformacional prefere entrega monolítica; Strangler alonga o projeto
- **Trade-offs**:
  - Prós: risco mínimo; rollback por módulo; time aprende gradualmente
  - Contras: incompatível com prazo de 24h; overhead de compatibilidade retroativa entre versões; dívida de convivência velho/novo

## Comparativo

| Critério | A (Big Bang) | B (Big Bang + Parallel) | C (Strangler) |
|---|---|---|---|
| Custo | baixo | médio | médio |
| Risco | alto | médio | baixo |
| Tempo | curto | curto-médio | longo |
| Aderência ao apetite | ✅ excelente | ✅ excelente | ❌ ruim |
| Compatível com 24h | ✅ sim | ✅ sim | ❌ não |

## Recomendação do Strategist
- **Estratégia recomendada**: **B — Big Bang + Parallel Run**
- **Justificativa**: 
  1. O prazo de 24h é incompatível com abordagens incrementais (Strangler, Branch by Abstraction)
  2. O brief exige explicitamente que o sistema novo rode em paralelo com o legado na mesma VPS até testes autorizarem o cutover — isso é uma exigência de Parallel Run
  3. O apetite transformacional permite construir o sistema novo do zero no paradigma OO com DI
  4. O gap de paradigma é médio (mesma linguagem, PHP→Laravel), então o risco de surpresas é menor que cross-language
  5. A validação paralela reduz o risco de cutover de "alto" (Big Bang puro) para "médio"

## Sinais de alerta específicos
- **Prazo de 24h**: o maior risco de toda a migração. A estratégia B depende de priorização brutal — construir o core (auth + LMS + doctor-harmony) primeiro, CRUDs depois. Se faltar tempo, o período de parallel run pode ser usado para completar funcionalidades menos críticas enquanto o core já valida.
- **Mesma VPS**: o parallel run na mesma KVM 4 exige que ambos os sistemas compartilhem recursos (CPU, RAM, disco). O novo sistema Laravel + React precisa ser otimizado para conviver com o legado sem degradação.
- **Mudança de paradigma**: a migração de `global $pdo` para DI container é suave em PHP/Laravel, mas cada controller precisa ser refeito — não há reuso de código backend.

## Decisão humana
- **Estratégia escolhida**: B — Big Bang + Parallel Run
- **Quem decidiu**: GERMANO
- **Quando**: 2026-06-02T21:15:00-03:00
- **Justificativa do decisor**: Estratégia recomendada aceita — alinha com apetite transformacional e exigência do brief de rodar em paralelo na mesma VPS
