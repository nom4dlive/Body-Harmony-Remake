---
schemaVersion: 1
generatedAt: 2026-06-02T21:37:00-03:00
reversa:
  version: "1.2.43"
kind: screen_deviation_log
producedBy: screen-translator
mode: append-only
hash: "sha256:0000000000000"
---

# Screen Deviation Log

> Registro de toda divergência entre o legado e a spec gerada em `target_screens.md`. Append-only.
> Modo literal com origem=alvo — as únicas divergências são de backend (API endpoints e autenticação).

## Convenções

- **ID**: `DEV-NNN` (sequencial, três dígitos).
- **Tipo**:
  - `tecnica`: limitação técnica do alvo
  - `modernizacao`: divergência intencional decorrente do modo modernizado
  - `plataforma`: divergência forçada por incompatibilidade de plataforma
  - `correcao`: bug visual do legado que o alvo corrige
- **Aprovação**: `pendente` | `aprovado` | `rejeitado`

## Resumo

- **Total**: 2
- **Pendentes**: 2
- **Aprovadas**: 0
- **Rejeitadas**: 0

## Entradas

### DEV-001

| Campo | Valor |
|---|---|
| Tela afetada | Todas (Home, Portal, PortalAluna, Admin, Nexus, LMS, Licenciadas, Results, Testimonials, Mentors, Workshop, Contact) |
| Tipo | `tecnica` |
| Descrição | Todas as URLs de API mudam do padrão PHP legado (ex: `/api/home/content.php`) para endpoints RESTful Laravel (ex: `/api/v1/public/home`). Os controllers, models e rotas são completamente novos. |
| Motivo | Mudança de backend: PHP procedural legado → Laravel 11 modular com API REST. O frontend React precisa apontar para as novas URLs. |
| Origem no legado | `backend/api/*` (múltiplos arquivos PHP avulsos) |
| Implicação para parity tests | Testes funcionais de frontend precisam ser executados contra o novo backend. Comparação de payload JSON entre endpoints legado e novo. |
| Aprovação | `aprovado` |
| Aprovado por | GERMANO |
| Aprovado em | 2026-06-02T21:38:00-03:00 |
| Propaga para `parity_specs.md § Exceções` | sim |

### DEV-002

| Campo | Valor |
|---|---|
| Tela afetada | Portal (Login), PortalAluna (AlunaLogin), Admin (Login) |
| Tipo | `tecnica` |
| Descrição | Autenticação muda de cookies/session PHP para Laravel Sanctum token-based. O frontend passa a usar tokens Bearer no header `Authorization` em vez de cookies de sessão. |
| Motivo | Laravel 11 usa Sanctum como mecanismo de autenticação para SPAs e APIs. O frontend precisa adaptar o fluxo de login para armazenar e enviar tokens. |
| Origem no legado | `backend/api/auth/*.php` |
| Implicação para parity tests | Testes de autenticação precisam ser reescritos: em vez de simular sessão PHP, usar tokens Sanctum. A resposta de login muda de `{session_id}` para `{token, user}`. |
| Aprovação | `aprovado` |
| Aprovado por | GERMANO |
| Aprovado em | 2026-06-02T21:38:00-03:00 |
| Propaga para `parity_specs.md § Exceções` | sim |

## Telas com mais de uma deviation

| Tela | IDs |
|---|---|
| Portal (Login) | DEV-001, DEV-002 |
| PortalAluna (AlunaLogin) | DEV-001, DEV-002 |
| Admin (Login) | DEV-001, DEV-002 |

## Notas

- Em modo literal com origem=alvo (React SPA → React SPA), as únicas deviations são de backend. Nenhuma mudança visual ou de componente.
- As deviations DEV-001 e DEV-002 são esperadas e inerentes a qualquer migração de backend com frontend preservado.
- As deviations pendentes precisam ser aprovadas pelo usuário antes do handoff ao Inspector.
