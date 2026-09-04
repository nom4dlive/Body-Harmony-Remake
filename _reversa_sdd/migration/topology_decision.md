---
schemaVersion: 1
generatedAt: 2026-06-02T21:18:00-03:00
reversa:
  version: "1.2.43"
kind: topology_decision
producedBy: designer
hash: "sha256:b0c1d2e3f4a5"
---

# Topology Decision

> Decisão consciente sobre como organizar o sistema novo: preservar a topologia do legado, adotar uma topologia moderna ou aplicar um híbrido.
> Este artefato é leitura obrigatória do próprio Designer (para decompor bounded contexts) e do agente de codificação (para criar a árvore de pastas).

## Topologia do legado detectada
- **Padrão organizacional**: híbrido: camadas com crescimento feature-based
- **Confiança**: 🟢 CONFIRMADO
- **Evidências**:
  - Backend PHP organizado em `api/v1/Controllers/`, `api/v1/Core/`, `api/v1/libs/` (layered) com scripts feature-specific em `api/v1/admin/`, `api/v1/licenciada/` (`_reversa_sdd/architecture.md:44-50`, `_reversa_sdd/inventory.md:8-40`)
  - Router único `index.php` com ~1400 linhas atuando como entry point central (`_reversa_sdd/architecture.md:45`)
  - Frontend React organizado por perfil: `pages/Admin/`, `pages/Licenciada/`, `pages/Aluna/` (feature-based)
  - Landing Pages como projetos Vite separados em `Landing_Pages/Projetos/`
- **Mapa da árvore legada** (resumido):
  ```
  apps/web-app/src/
    backend/
      api/v1/Controllers/
      api/v1/Core/
      api/v1/libs/
      api/v1/admin/
      api/v1/licenciada/
    frontend/
      pages/ (Admin, Licenciada, Aluna, Workshop, Results, FAQ)
      components/
      services/
      context/
  Landing_Pages/
    Projetos/ (protocolo-3s, Workshop-low-ticket, Workshop-medium-ticket)
  infrastructure/
    docker/
    config/
    scripts/
  ```

## Diagnóstico estrutural
- **Acoplamento**: alto — router único centraliza todo roteamento; controllers compartilham `global $pdo` e `$loggedUser`
- **Coesão por módulo**: média — scripts em `admin/` e `licenciada/` têm responsabilidades razoavelmente focadas, mas `Core/` mistura cache, logging, auth, erro handler
- **Módulos órfãos / mortos**: nenhum identificado
- **Camadas redundantes**: `libs/` e `Services/` coexistem sem critério claro de separação
- **Violações de fronteira**: lógica de negócio em controllers (ex: licenciadas/store.php faz validação + upload + logging inline)
- **Mistura de paradigmas/estilos**: homogêneo (OO clássico)
- **Avaliação geral**: parcialmente problemática

## Topologia moderna proposta
- **Padrão**: DDD Modular Monolith (bounded contexts como módulos Laravel)
- **Justificativa**: O paradigma OO com DI e a estratégia Big Bang + Parallel Run permitem redesenhar a arquitetura sem precisar de compatibilidade retroativa. O Laravel suporta modularização nativa via Service Providers + autoloading PSR-4. Os bounded contexts mapeiam diretamente os domínios do negócio, e cada módulo é independente com seu próprio schema de dados e serviços.
- **Ganhos concretos esperados**:
  - Isolamento de domínios: cada bounded context evolui sem afetar os outros
  - Testabilidade: módulos testáveis isoladamente com mocks nas interfaces
  - Onboarding: novo dev entende um contexto de cada vez, sem o monolito inteiro
  - Potencial futuro de microsserviços: contexts podem virar serviços independentes sem rewrites
- **Custo / risco**:
  - Curva de aprendizado: DDD modular requer disciplina para não vazar dependências entre contexts
  - Overhead inicial: setup de módulos + shared kernel é maior que Laravel vanilla
  - Risco de over-engineering: módulos demais para sistema médio
- **Esboço da árvore proposta**:
  ```
  apps/web-app/
    app/Modules/
      Auth/           → login, admin_sessions, tokens, impersonation
      Licenciada/     → CRUD, dashboard, dispositivos
      Aluna/          → portal, progresso, certificados
      LMS/            → módulos, aulas, quizzes, progression lock
      DoctorHarmony/  → análise IA, créditos, revisão híbrida
      Broadcast/      → comunicados, acknowledge
      Content/        → mentores, FAQ, resultados
      Media/          → upload, gerenciamento de mídia
      Nexus/          → firewall, auditoria, forense, manutenção
      Leads/          → captura, funil comercial
      Analytics/      → watchtower, war room, churn
    app/Shared/
      Core/           → cache, logging, audit, notificações
    resources/js/
      Pages/           → Admin, Licenciada, Aluna, Workshop
      Components/
      Services/
  infrastructure/      → docker, config, scripts (mantido)
  Landing_Pages/       → projetos Vite separados (mantido)
  ```

## Opções apresentadas ao usuário
1. **Preservar topologia legada** (conservador)
   - Consequências: mantém mapa mental atual; reproduz acoplamento do router único e mistura camadas/features.
2. **Adotar topologia moderna proposta — DDD Modular Monolith** (transformacional)
   - Consequências: cada domínio vira módulo Laravel independente com Service Provider; shared kernel para cross-cutting; frontend mantido como SPA feature-based; landing pages preservadas como projetos separados.
3. **Híbrido** (equilibrado)
   - Consequências: domínios críticos (Auth, LMS, DoctorHarmony) como módulos; CRUDs simples (Content, FAQ, Leads) em controllers Laravel simples.

## Decisão do usuário
- **Escolha**: 2 — DDD Modular Monolith (transformacional)
- **Justificativa do usuário**: optou pela modularização completa para alinhar com paradigma OO com DI
- **Decidido em**: 2026-06-02T21:18:00-03:00

## Mapeamento legado → novo
| Módulo / pasta legada | Bounded context novo | Tipo | Observações |
|---|---|---|---|
| `Controllers/AuthController.php`, `AuthMiddleware.php`, `NexusGuard.php`, `JWT.php` | `Auth` | fundido | Autenticação admin, licenciada, aluna + superadmin guard |
| `Controllers/LicenciadasController.php`, `licenciada/` | `Licenciada` | preservado | CRUD + dashboard + dispositivos |
| `Controllers/Aluna*.php`, `aluna/` | `Aluna` | preservado | Portal aluna + progresso + certificados |
| `Controllers/LmsController.php`, `AdminLmsController.php`, `QuizController.php` | `LMS` | fundido | Módulos, aulas, quizzes, progression lock |
| `Controllers/DoctorHarmony*.php`, `libs/GeminiService.php` | `DoctorHarmony` | fundido | Análise IA, créditos, revisão híbrida |
| `Controllers/BroadcastController.php`, `signal_tower/` | `Broadcast` | fundido | Comunicados, acknowledge, bloqueantes |
| `Controllers/ContentController.php` | `Content` | preservado | Mentores |
| `Controllers/MediaController.php` | `Media` | preservado | Upload, gerenciamento |
| `Controllers/Nexus*.php`, `admin/watchtower/`, `admin/war_room/` | `Nexus` | fundido | Firewall, auditoria, forense, manutenção |
| `Controllers/AnalyticsController.php` | `Analytics` | preservado | Watchtower, War Room |
| `Controllers/LeadController.php` | `Leads` | preservado | Captura, funil |
| `Controllers/FaqController.php` | `Content` | fundido | Junto com Content (CRUD similar) |
| `Controllers/ResultController.php` | `Content` | fundido | Junto com Content (CRUD similar) |
| `Controllers/CertificateController.php` | `LMS` | fundido | Certificado depende de LMS e quiz |
| `Landing_Pages/` | (externo) | preservado | Projetos Vite separados, não migrados |
| (vazio) | `Shared/Core` | novo | Cache, logging, audit, notificações |

## Implicações pendentes para próximos passos do Designer
| Etapa do Designer | Implicação | Como honrar |
|---|---|---|
| Bounded contexts | 10 contexts + shared kernel | Cada context tem scope claro definido |
| target_architecture | Modular monolith com API REST + frontend SPA | Laravel modules com Service Providers |
| target_domain_model | Aggregates por context com boundaries explícitas | Sem vazamento de entidades entre contexts |
| target_data_model | Schemas por context, shared kernel para cross-cutting | Tabelas prefixadas por context ou schemas separados |

## Notas
A topologia DDD Modular Monolith permite que o desenvolvimento em 24h seja paralelizado por contexto. Cada contexto pode ser implementado independentemente (ex: Auth + Licenciada + LMS como prioridade). O Shared Kernel deve ser implementado primeiro pois é pré-requisito para todos os contexts.
