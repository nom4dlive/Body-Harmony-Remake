---
schemaVersion: 1
generatedAt: 2026-06-02T21:36:00-03:00
reversa:
  version: "1.2.43"
kind: target_screens
producedBy: screen-translator
mode: literal
sourcePlatform: web-spa
targetPlatform: web-spa
adapter: N/A (origem=alvo)
screenCount: 14
hash: "sha256:0000000000000"
---

# Target Screens

> Especificação executável de cada tela do sistema novo, derivada do legado segundo o modo aprovado em `screen_modernization_decision.md`.
> Modo **literal** — o frontend React SPA é preservado integralmente. Apenas as chamadas de API mudam do backend PHP legado para o Laravel.

## Resumo

- **Modo aplicado**: literal
- **Telas geradas**: 14 (módulos de páginas)
- **Adapter**: N/A (origem = alvo = `web-spa`)
- **Tokens consumidos**: `_reversa_sdd/design-system/tokens.md` (preservados integralmente)
- **Golden files**: 0 — o código fonte atual É o golden (modo literal, mesma plataforma)
- **Deviations registradas**: 2 em `screen_deviation_log.md`

---

## Tela: Home

**Origem**: `apps/web-app/src/frontend/src/pages/Home/Home.jsx`, `HomeV2.jsx`
**Modo aplicado**: literal
**Componentes do design-system**: [color.brand-primary, color.gold, typography.h1, spacing.*]
**Pontos de interpolação**: `{{site_name}}`, `{{hero_title}}`, `{{hero_subtitle}}`
**Transições de saída**: [login, register, workshop, results]
**Tela crítica?**: sim (landing page pública)

### Especificação

```yaml
spec.kind: route-component
spec.route: /
spec.layout: public
spec.states: [idle, loading, error]
spec.component: Home / HomeV2
spec.legacy_origin: "pages/Home/"
spec.preserved: true
spec.api_changes:
  - legacy: GET /api/home/content.php
    target: GET /api/v1/public/home
    deviation: DEV-001
  - legacy: GET /api/home/testimonials.php
    target: GET /api/v1/public/testimonials
    deviation: DEV-001
  - legacy: GET /api/instagram/feed.php
    target: GET /api/v1/public/instagram-feed
    deviation: DEV-001
```

### Pontos de divergência aceitos

- DEV-001: todas as URLs de API mudam do padrão PHP legado para REST Laravel
- DEV-002: autenticação via cookies/session PHP → Sanctum token-based

---

## Tela: Portal (Aluna)

**Origem**: `apps/web-app/src/frontend/src/pages/Portal/Dashboard.jsx`, `Login.jsx`, `Faq.jsx`, `ForceChangePassword.jsx`, `MyLessons/*`, `Profile/*`, `Progress/*`, `Library/*`, `MentorIA/*`, `SupportIA/*`
**Modo aplicado**: literal
**Componentes do design-system**: [color.brand-primary, color.navy, typography.*, spacing.*]
**Pontos de interpolação**: `{{user_name}}`, `{{user_email}}`, `{{progress_percent}}`
**Transições de saída**: [aluna-dashboard, aluna-login, portal-login]
**Tela crítica?**: sim (acesso principal da aluna)

### Especificação

```yaml
spec.kind: route-component
spec.route: /portal/*
spec.layout: PortalLayout
spec.states: [idle, loading, error, success]
spec.component: Portal pages
spec.legacy_origin: "pages/Portal/"
spec.preserved: true
spec.api_changes:
  - legacy: POST /api/auth/aluno/login.php
    target: POST /api/v1/auth/aluna/login
    deviation: DEV-001
  - legacy: GET /api/aluno/dashboard.php
    target: GET /api/v1/aluna/dashboard
    deviation: DEV-001
  - legacy: GET /api/aluno/lessons.php
    target: GET /api/v1/aluna/lessons
    deviation: DEV-001
  - legacy: POST /api/aluno/progress.php
    target: POST /api/v1/aluna/progress
    deviation: DEV-001
```

---

## Tela: PortalAluna

**Origem**: `apps/web-app/src/frontend/src/pages/PortalAluna/AlunaDashboard.jsx`, `AlunaModuleView.jsx`, `AlunaLessonPlayer.jsx`, `AlunaLogin.jsx`, `AlunaProfile.jsx`, `AlunaSupport.jsx`, `AlunaCertificates.jsx`
**Modo aplicado**: literal
**Componentes do design-system**: [color.brand-primary, color.gold, typography.*]
**Pontos de interpolação**: `{{module_name}}`, `{{lesson_title}}`, `{{video_url}}`
**Transições de saída**: [aluna-login, module-view, lesson-player]
**Tela crítica?**: sim (consumo de conteúdo)

### Especificação

```yaml
spec.kind: route-component
spec.route: /aluna/*
spec.layout: AlunaLayout
spec.states: [idle, loading, error, success]
spec.component: PortalAluna pages
spec.legacy_origin: "pages/PortalAluna/"
spec.preserved: true
spec.api_changes:
  - legacy: GET /api/aluno/modules.php
    target: GET /api/v1/aluna/modules
    deviation: DEV-001
  - legacy: GET /api/aluno/lessons.php?id={id}
    target: GET /api/v1/aluna/lessons/{id}
    deviation: DEV-001
  - legacy: POST /api/aluno/certificate.php
    target: POST /api/v1/aluna/certificates
    deviation: DEV-001
```

---

## Tela: Admin

**Origem**: `apps/web-app/src/frontend/src/pages/Admin/Login.jsx`, `Dashboard.jsx`, `ContentManager.jsx`, `ImageManager.jsx`, `MentorsManager.jsx`, `ThemeManager.jsx`, `LicenciadasManager.jsx`, `ResultsManager.jsx`, `TestimonialManager.jsx`, `LeadsManager.jsx`, `FaqManager.jsx`, `SiteSettings.jsx`, `VisualEditor/*`, `Security/*`, `AlunaManager/*`, `LMS/*`
**Modo aplicado**: literal
**Componentes do design-system**: [color.navy, color.gold, typography.*, spacing.*]
**Pontos de interpolação**: `{{user_count}}`, `{{content_title}}`, `{{licenciada_name}}`
**Transições de saída**: [admin-login, admin-dashboard, crud-managers]
**Tela crítica?**: sim (backoffice core)

### Especificação

```yaml
spec.kind: route-component
spec.route: /admin/*
spec.layout: AdminLayout
spec.states: [idle, loading, error, success]
spec.component: Admin pages
spec.legacy_origin: "pages/Admin/"
spec.preserved: true
spec.api_changes:
  - legacy: POST /api/admin/auth/login.php
    target: POST /api/v1/admin/auth/login
    deviation: DEV-001
  - legacy: CRUD /api/admin/content/*.php
    target: CRUD /api/v1/admin/content/*
    deviation: DEV-001
  - legacy: CRUD /api/admin/licenciadas/*.php
    target: CRUD /api/v1/admin/licenciadas/*
    deviation: DEV-001
  - legacy: CRUD /api/admin/alunas/*.php
    target: CRUD /api/v1/admin/alunas/*
    deviation: DEV-001
  - legacy: CRUD /api/admin/lms/*.php
    target: CRUD /api/v1/admin/lms/*
    deviation: DEV-001
```

---

## Tela: Nexus

**Origem**: `apps/web-app/src/frontend/src/pages/Nexus/NexusLayout.jsx`, `NexusHome.jsx`, `AIControlTower.jsx`, `Gatekeeper.jsx`, `ForensicsLab.jsx`, `Database/*`, `Barracks/*`, `SignalTower/*`, `Ops/*`, `EngineRoom/*`, `Watchtower/*`, `WarRoom/*`, `ReviewHub/*`, `TestingHub/*`, `Vault/*`, `Scripts/*`, `Alunas/*`
**Modo aplicado**: literal
**Componentes do design-system**: [color.brand-primary, color.gold, color.navy, typography.*]
**Pontos de interpolação**: `{{signal_name}}`, `{{user_session}}`, `{{forensic_log}}`
**Transições de saída**: [nexus-home, nexus-modules]
**Tela crítica?**: sim (orquestração interna)

### Especificação

```yaml
spec.kind: route-component
spec.route: /nexus/*
spec.layout: NexusLayout
spec.states: [idle, loading, error, success]
spec.component: Nexus pages
spec.legacy_origin: "pages/Nexus/"
spec.preserved: true
spec.api_changes:
  - legacy: GET /api/nexus/dashboard.php
    target: GET /api/v1/nexus/dashboard
    deviation: DEV-001
  - legacy: GET /api/nexus/signals.php
    target: GET /api/v1/nexus/signals
    deviation: DEV-001
  - legacy: POST /api/nexus/action.php
    target: POST /api/v1/nexus/actions
    deviation: DEV-001
  - legacy: GET /api/nexus/forensics.php
    target: GET /api/v1/nexus/forensics
    deviation: DEV-001
```

---

## Tela: LMS

**Origem**: `apps/web-app/src/frontend/src/pages/LMS/LessonPlayer.jsx`, `ModuleView.jsx`
**Modo aplicado**: literal
**Componentes do design-system**: [typography.*, spacing.*, color.brand-primary]
**Pontos de interpolação**: `{{video_url}}`, `{{module_id}}`, `{{lesson_id}}`
**Transições de saída**: [admin-lms, aluna-lms]
**Tela crítica?**: sim (entrega de conteúdo)

### Especificação

```yaml
spec.kind: route-component
spec.route: /lms/*
spec.layout: AppLayout
spec.states: [idle, loading, error, success]
spec.component: LMS pages
spec.legacy_origin: "pages/LMS/"
spec.preserved: true
spec.api_changes:
  - legacy: GET /api/lms/modules.php
    target: GET /api/v1/lms/modules
    deviation: DEV-001
  - legacy: GET /api/lms/lessons.php?id={id}
    target: GET /api/v1/lms/lessons/{id}
    deviation: DEV-001
  - legacy: POST /api/lms/progress.php
    target: POST /api/v1/lms/progress
    deviation: DEV-001
```

---

## Tela: Licenciadas

**Origem**: `apps/web-app/src/frontend/src/pages/Licenciadas/Licenciadas.jsx`
**Modo aplicado**: literal
**Componentes do design-system**: [color.gold, typography.*, spacing.*]
**Pontos de interpolação**: `{{licenciada_list}}`
**Transições de saída**: [contact]
**Tela crítica?**: não (página institucional)

### Especificação

```yaml
spec.kind: route-component
spec.route: /licenciadas
spec.layout: public
spec.states: [idle, loading, error]
spec.component: Licenciadas
spec.legacy_origin: "pages/Licenciadas/"
spec.preserved: true
spec.api_changes:
  - legacy: GET /api/licenciadas/list.php
    target: GET /api/v1/public/licenciadas
    deviation: DEV-001
```

---

## Tela: Results

**Origem**: `apps/web-app/src/frontend/src/pages/Results/ResultsGallery.jsx`
**Modo aplicado**: literal
**Componentes do design-system**: [color.gold, color.brand-primary, typography.*]
**Pontos de interpolação**: `{{result_images}}`
**Transições de saída**: [home, contact]
**Tela crítica?**: não (galeria pública)

### Especificação

```yaml
spec.kind: route-component
spec.route: /resultados
spec.layout: public
spec.states: [idle, loading, error, success]
spec.component: ResultsGallery
spec.legacy_origin: "pages/Results/"
spec.preserved: true
spec.api_changes:
  - legacy: GET /api/resultados/gallery.php
    target: GET /api/v1/public/results
    deviation: DEV-001
```

---

## Tela: Testimonials

**Origem**: `apps/web-app/src/frontend/src/pages/Testimonials/Testimonials.jsx`
**Modo aplicado**: literal
**Componentes do design-system**: [color.brand-primary, typography.*, spacing.*]
**Pontos de interpolação**: `{{testimonial_list}}`
**Transições de saída**: [home, contact]
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: route-component
spec.route: /depoimentos
spec.layout: public
spec.states: [idle, loading, error, success]
spec.component: Testimonials
spec.legacy_origin: "pages/Testimonials/"
spec.preserved: true
spec.api_changes:
  - legacy: GET /api/depoimentos/list.php
    target: GET /api/v1/public/testimonials
    deviation: DEV-001
```

---

## Tela: Mentors

**Origem**: `apps/web-app/src/frontend/src/pages/Mentors/Mentors.jsx`
**Modo aplicado**: literal
**Componentes do design-system**: [color.gold, color.brand-primary, typography.*]
**Pontos de interpolação**: `{{mentor_list}}`
**Transições de saída**: [contact, licenciadas]
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: route-component
spec.route: /mentores
spec.layout: public
spec.states: [idle, loading, error, success]
spec.component: Mentors
spec.legacy_origin: "pages/Mentors/"
spec.preserved: true
spec.api_changes:
  - legacy: GET /api/mentores/list.php
    target: GET /api/v1/public/mentors
    deviation: DEV-001
```

---

## Tela: Workshop

**Origem**: `apps/web-app/src/frontend/src/pages/Workshop/Workshop.jsx`
**Modo aplicado**: literal
**Componentes do design-system**: [color.gold, color.brand-primary, typography.*]
**Pontos de interpolação**: `{{workshop_info}}`
**Transições de saída**: [contact, home]
**Tela crítica?**: não (página promocional)

### Especificação

```yaml
spec.kind: route-component
spec.route: /workshop
spec.layout: public
spec.states: [idle, loading, error]
spec.component: Workshop
spec.legacy_origin: "pages/Workshop/"
spec.preserved: true
spec.api_changes:
  - legacy: GET /api/workshop/info.php
    target: GET /api/v1/public/workshop
    deviation: DEV-001
```

---

## Tela: Contact

**Origem**: `apps/web-app/src/frontend/src/pages/Contact/Contact.jsx`
**Modo aplicado**: literal
**Componentes do design-system**: [color.brand-primary, typography.*, spacing.*]
**Pontos de interpolação**: `{{form_data}}`
**Transições de saída**: [home]
**Tela crítica?**: não

### Especificação

```yaml
spec.kind: route-component
spec.route: /contato
spec.layout: public
spec.states: [idle, loading, error, success]
spec.component: Contact
spec.legacy_origin: "pages/Contact/"
spec.preserved: true
spec.api_changes:
  - legacy: POST /api/contato/send.php
    target: POST /api/v1/public/contact
    deviation: DEV-001
```

---

## Tela: Maintenance

**Origem**: `apps/web-app/src/frontend/src/pages/Maintenance/Maintenance.jsx`
**Modo aplicado**: literal
**Componentes do design-system**: [color.brand-primary, typography.*]
**Pontos de interpolação**: nenhum
**Transições de saída**: [nenhuma]
**Tela crítica?**: sim (exibida em manutenção)

### Especificação

```yaml
spec.kind: route-component
spec.route: /maintenance
spec.layout: minimal
spec.states: [idle]
spec.component: Maintenance
spec.legacy_origin: "pages/Maintenance/"
spec.preserved: true
spec.api_changes: []
```

---

## Tela: Hidden (Proposal)

**Origem**: `apps/web-app/src/frontend/src/pages/Hidden/Proposal.jsx`
**Modo aplicado**: literal
**Componentes do design-system**: [color.gold, typography.*, spacing.*]
**Pontos de interpolação**: `{{proposal_data}}`
**Transições de saída**: [contact]
**Tela crítica?**: não (página oculta)

### Especificação

```yaml
spec.kind: route-component
spec.route: /proposta
spec.layout: public
spec.states: [idle, loading, error, success]
spec.component: Proposal
spec.legacy_origin: "pages/Hidden/"
spec.preserved: true
spec.api_changes: []
```

---

## Apêndice: rastreabilidade ao inventário

| Tela do `target_screens.md` | Origem no código fonte | Rota |
|---|---|---|
| Home | `pages/Home/Home.jsx`, `HomeV2.jsx` | `/` |
| Portal | `pages/Portal/Dashboard.jsx`, `Login.jsx`, `Faq.jsx`, etc. | `/portal/*` |
| PortalAluna | `pages/PortalAluna/AlunaDashboard.jsx`, etc. | `/aluna/*` |
| Admin | `pages/Admin/Dashboard.jsx`, `ContentManager.jsx`, etc. | `/admin/*` |
| Nexus | `pages/Nexus/NexusLayout.jsx`, `AIControlTower.jsx`, etc. | `/nexus/*` |
| LMS | `pages/LMS/LessonPlayer.jsx`, `ModuleView.jsx` | `/lms/*` |
| Licenciadas | `pages/Licenciadas/Licenciadas.jsx` | `/licenciadas` |
| Results | `pages/Results/ResultsGallery.jsx` | `/resultados` |
| Testimonials | `pages/Testimonials/Testimonials.jsx` | `/depoimentos` |
| Mentors | `pages/Mentors/Mentors.jsx` | `/mentores` |
| Workshop | `pages/Workshop/Workshop.jsx` | `/workshop` |
| Contact | `pages/Contact/Contact.jsx` | `/contato` |
| Maintenance | `pages/Maintenance/Maintenance.jsx` | `/maintenance` |
| Hidden | `pages/Hidden/Proposal.jsx` | `/proposta` |
