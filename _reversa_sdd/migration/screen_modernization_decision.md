---
schemaVersion: 1
generatedAt: 2026-06-02T21:35:00-03:00
reversa:
  version: "1.2.43"
kind: screen_modernization_decision
producedBy: screen-translator
decidedBy: GERMANO
decidedAt: 2026-06-02T21:35:00-03:00
mode: literal
sourcePlatform: web-spa
targetPlatform: web-spa
hash: "sha256:0000000000000"
---

# Decisão de Modernização de Telas

> Decisão consciente sobre como traduzir as telas do sistema legado: paridade observável byte-a-byte, redesign idiomático para a plataforma alvo, ou combinação tela-a-tela.

## Contexto

- **Plataforma origem detectada**: `web-spa` (React 18 + Vite 6 + Styled-Components + React Router 7)
- **Confiança**: 🟢 CONFIRMADO (código fonte presente em `apps/web-app/src/frontend/src/`)
- **Plataforma alvo**: `web-spa` (mesma stack — frontend preservado conforme `target_architecture.md`)
- **Telas inventariadas**: 14 módulos de páginas (Home, Portal, PortalAluna, Admin, Nexus, LMS, Licenciadas, Workshop, Results, Testimonials, Mentors, Maintenance, Contact, Hidden) + 42 componentes compartilhados
- **Origem do inventário**: código fonte legado (`apps/web-app/src/frontend/src/`)
- **Adapter aplicado**: N/A — origem e alvo são a mesma plataforma. Não há par de migração visual.

## Modos avaliados

### Modo: literal
- **Definição**: preservar o frontend React SPA exatamente como está. Apenas refatorar as chamadas de API para consumir o novo backend Laravel.
- **Trade-offs**:
  - Custo de implementação: baixo
  - Fidelidade visual: alta (100%, mesmo código)
  - Viabilidade de parity tests construtivos: sim (mesmo componente, mesmo comportamento)
  - Aceitação esperada do usuário final: alta (sem mudança visível)
  - Débito técnico futuro: baixo (frontend já moderno)
- **Recomendado**: sim
- **Justificativa**: a UI já está na stack alvo. Não há motivo para reimplementar ou redesenhar o que já funciona. O prazo de 24h é crítico.

### Modo: modernizado
- **Definição**: redesign idiomático do frontend React, repensando componentes, layout e interações.
- **Trade-offs**:
  - Custo de implementação: altíssimo (dias adicionais)
  - Fidelidade visual: baixa em relação ao legado (redesign deliberado)
  - Viabilidade de parity tests construtivos: parcial (contrato semântico apenas)
  - Aceitação esperada do usuário final: média (mudança visual sem necessidade funcional)
  - Débito técnico futuro: médio (nova base de componentes)
- **Recomendado**: não
- **Justificativa**: inviável dentro do prazo de 24h. O frontend atual já é moderno (React 18, Styled-Components, lazy loading). Redesign não agrega valor de migração.

### Modo: híbrido
- **Definição**: parte das telas preservadas, parte modernizadas, com listas explícitas.
- **Trade-offs**:
  - Custo de implementação: alto (manter dois paradigmas visuais)
  - Fidelidade visual mista: inconsistência visual entre telas
  - Viabilidade de parity tests: parcial (misto de estratégias)
  - Custo de manutenção da separação: alto
- **Recomendado**: não
- **Justificativa**: complexidade desnecessária. Todas as telas já estão na plataforma alvo. Não há ganho em segregar.

## Decisão

- **Modo escolhido**: literal
- **Justificativa do humano**: preservar o frontend React como está, só trocar as APIs
- **Alternativas descartadas**: modernizado (inviável em 24h), híbrido (complexidade sem ganho)
- **Decidido em**: 2026-06-02T21:35:00-03:00
- **Decidido por**: GERMANO

### Em modo híbrido, listas explícitas (obrigatórias)

N/A — modo literal escolhido.

## Implicações pendentes para a Fase 2

| Etapa | Implicação | Como honrar |
|---|---|---|
| Geração de `target_screens.md` | Modo literal, origem=alvo: nenhuma tela precisa ser reimplementada | Documentar cada tela como "preservada como está", listando apenas as mudanças de API |
| Captura de golden files | Golden files já existem no código fonte atual | Não há necessidade de nova captura; o código atual é o golden |
| Tokens do design-system | Design-system do legado é o design-system alvo | Nenhum token novo necessário |
| Conteúdo textual | Preservado literalmente (o texto atual é o texto final) | Sem alterações |

## Implicações para o Inspector

- **Estratégia de paridade**:
  - Modo literal → paridade observável byte-a-byte / componente-equivalente, validada por testes funcionais (mesma UI, novo backend)
  - A paridade visual é automática (mesmo frontend)
  - A paridade funcional depende dos endpoints da API (contratos entre frontend e backend)
- **Deviations conhecidas a propagar**: ver `screen_deviation_log.md`

## Notas

- O frontend React SPA é o mesmo antes e depois da migração. Não há "tradução de telas" no sentido tradicional.
- O trabalho de frente de UI se limita a: (1) atualizar base URL da API no `.env`, (2) ajustar services/fetch para os novos endpoints Laravel, (3) garantir que o fluxo de autenticação via Sanctum funcione com o frontend existente.
- O design-system legado (`_reversa_sdd/design-system/`) é integralmente válido como alvo. Nenhum token derivado é necessário.
- Landing pages (`Landing_Pages/`) e projetos de referência (`zz_Referencias/`) estão fora do escopo de migração conforme `migration_brief.md`.
