# 🗺️ Mapa de Sistema - Doctor Harmony V3.1

**Data de Geração:** 2026-05-29 (V123)  
**Protocolo:** OpenSpec V3.1  
**Arquitetura:** Nexus (React/Vite + PHP 8.4 Nativo)

---

## 1. Frontend: Rotas & Páginas

### 1.1 Rotas Públicas (Sem Autenticação)

| Rota | Componente | Função Principal | API Endpoints Relacionados | Visual Identity V3 |
|------|-----------|------------------|----------------------------|-------------------|
| `/` | `Home.jsx` | Landing page principal | `/v1/site_config`, `/v1/testimonials` | ✅ Compliant |
| `/workshop` | `Workshop.jsx` | Página de workshop/evento | `/v1/site_config` | ✅ Compliant |
| `/mentores` | `Mentors.jsx` | Galeria de mentores | `/v1/mentors` | ✅ Compliant |
| `/licenciadas-licenciadas` | `licenciadas.jsx` | Galeria de licenciadas | `/v1/licenciadas` | ✅ Compliant |
| `/licenciadas` | `licenciadas.jsx` | Alias para licenciadas | `/v1/licenciadas` | ✅ Compliant |
| `/resultados` | `ResultsGallery.jsx` | Galeria de resultados | `/v1/results`, `/v1/gallery` | ✅ Compliant |
| `/depoimentos` | `Testimonials.jsx` | Depoimentos de clientes | `/v1/testimonials` | ✅ Compliant |
| `/contato` | `Contact.jsx` | Formulário de contato | `/v1/leads` | ✅ Compliant |
| `/proposta-exclusiva` | `Proposal.jsx` | Página oculta de proposta | N/A | ✅ Compliant |

### 1.2 Rotas de Autenticação

| Rota | Componente | Função Principal | API Endpoints Relacionados | Segurança |
|------|-----------|------------------|----------------------------|-----------|
| `/admin` | `AdminLogin.jsx` | Login administrativo | `/v1/auth/login` | Public |
| `/portal-licenciada` | `PortalLogin.jsx` | Login de licenciadas | `/v1/auth/licenciada/login` | Public |

### 1.3 Rotas Admin (Protegidas - Admin Role)

| Rota | Componente | Função Principal | API Endpoints Relacionados |
|------|-----------|------------------|----------------------------|
| `/admin/dashboard` | `Dashboard.jsx` | Dashboard administrativo | `/v1/admin/analytics/stats` |
| `/admin/textos` | `ContentManager.jsx` | Gerenciamento de conteúdo | `/v1/site_config`, `/v1/admin/site_config` |
| `/admin/aparencia` | `ThemeManager.jsx` | Gerenciamento de tema | `/v1/site_config`, `/v1/admin/site_config` |
| `/admin/mentores` | `MentorsManager.jsx` | CRUD de mentores | `/v1/mentors`, `/v1/admin/mentors/*` |
| `/admin/imagens` | `ImageManager.jsx` | Gerenciamento de mídia | `/v1/admin/media/*` |
| `/admin/licenciadas` | `licenciadasManager.jsx` | CRUD de licenciadas | `/v1/admin/licenciadas/*` |
| `/admin/resultados` | `ResultsManager.jsx` | CRUD de resultados | `/v1/results/*` |
| `/admin/depoimentos` | `TestimonialManager.jsx` | CRUD de depoimentos | `/v1/testimonials`, `/v1/admin/testimonials/*` |
| `/admin/leads` | `LeadsManager.jsx` | Gerenciamento de leads | `/v1/admin/leads`, `/v1/admin/leads/*` |
| `/admin/faq` | `FaqManager.jsx` | CRUD de FAQ | `/v1/faq`, `/v1/faq/*` |
| `/admin/configuracoes` | `SiteSettings.jsx` | Configurações do site | `/v1/site_config`, `/v1/admin/site_config` |
| `/admin/lms` | `AdminLMS.jsx` | Gerenciamento LMS | `/v1/admin/lms/*` |
| `/admin/visual-editor` | `VisualEditor.jsx` | Editor visual | N/A (Frontend only) |
| `/admin/seguranca` | `SecurityDashboard.jsx` | Dashboard de segurança | N/A | Superadmin Only |

### 1.4 Rotas Portal Licenciadas (Protegidas - Licenciada Role)

| Rota | Componente | Função Principal | API Endpoints Relacionados |
|------|-----------|------------------|----------------------------|
| `/portal-licenciada/dashboard` | `PortalDashboard.jsx` | Dashboard da licenciada | `/v1/lms/modules`, `/v1/doctor-harmony/credits` |
| `/portal-licenciada/minhas-aulas` | `MyLessonsPage.jsx` | Aulas disponíveis | `/v1/lms/modules`, `/v1/lms/modules/{id}/lessons` |
| `/portal-licenciada/meu-progresso` | `ProgressPage.jsx` | Progresso da licenciada | `/v1/licenciada/progress` |
| `/portal-licenciada/biblioteca` | `ResourceLibraryPage.jsx` | Biblioteca de recursos | `/v1/lms/resources` |
| `/portal-licenciada/mentoria-ia` | `MentorIAPage.jsx` | Mentoria com Doctor Harmony | `/v1/doctor-harmony/evaluate`, `/v1/doctor-harmony/credits` |
| `/portal-licenciada/perfil` | `ProfilePage.jsx` | Perfil da licenciada | `/v1/auth/licenciada/validate`, `/v1/auth/licenciada/change_password` |
| `/portal-licenciada/nova-senha` | `ForceChangePassword.jsx` | Troca obrigatória de senha | `/v1/auth/licenciada/first-access` |

### 1.5 Rotas LMS (Protegidas - Licenciada Role)

| Rota | Componente | Função Principal | API Endpoints Relacionados |
|------|-----------|------------------|----------------------------|
| `/lms` | `PortalDashboard.jsx` | Redirect para dashboard | `/v1/lms/modules` |
| `/lms/modulo/:id` | `ModuleView.jsx` | Visualização de módulo | `/v1/lms/modules/{id}/lessons` |
| `/lms/aula/:id` | `LessonPlayer.jsx` | Player de aula | `/v1/lms/sign-url`, `/v1/lms/progress` |

### 1.6 Rotas Nexus (Protegidas - Admin/Superadmin)

| Rota | Componente | Função Principal | API Endpoints Relacionados | Role Required |
|------|-----------|------------------|----------------------------|---------------|
| `/nexus` | `NexusGatekeeper.jsx` | Autenticação Nexus | N/A | Admin/Superadmin |
| `/nexus/home` | `NexusHome.jsx` | Dashboard Nexus | `/v1/admin/nexus/system-status` | Admin/Superadmin |
| `/nexus/watchtower` | `NexusWatchtower.jsx` | Monitoramento em tempo real | `/v1/admin/analytics/watchtower` | Admin/Superadmin |
| `/nexus/war-room` | `NexusWarRoom.jsx` | Analytics e métricas | `/v1/admin/analytics/war-room`, `/v1/admin/nexus/security-metrics` | Admin/Superadmin |
| `/nexus/barracks` | `NexusBarracks.jsx` | Gerenciamento de usuários | `/v1/admin/users`, `/v1/admin/admins` | Admin/Superadmin |
| `/nexus/engine` | `NexusEngineRoom.jsx` | Status do sistema | `/v1/admin/health`, `/v1/admin/logs` | Admin/Superadmin |
| `/nexus/signal-tower` | `NexusSignalTower.jsx` | Sistema de broadcasts | `/v1/admin/broadcasts` | Admin/Superadmin |
| `/nexus/testing-hub` | `NexusTestingHub.jsx` | Testes automatizados | `/v1/admin/nexus/tests/*` | Admin/Superadmin |
| `/nexus/review-hub` | `licenciadaReviewHub.jsx` | Revisão de casos Doctor Harmony | `/v1/admin/doctor-harmony/cases/pending` | Admin/Superadmin |
| `/nexus/vault` | `NexusVault.jsx` | Gerenciamento de FAQ | `/v1/faq` | Admin/Superadmin |
| `/nexus/database` | `NexusDatabase.jsx` | Governança de banco de dados | `/v1/admin/nexus/db/*` | Admin/Superadmin |
| `/nexus/ops` | `NexusOps.jsx` | Operações e regras | `/v1/nexus/ops/*` | Admin/Superadmin |
| `/nexus/ai-control` | `NexusAIControl.jsx` | Controle Doctor Harmony | `/v1/admin/doctor-harmony/*` | Admin/Superadmin |
| `/nexus/scripts` | `NexusScriptsManager.jsx` | Execução de scripts | `/v1/nexus/scripts/*` | Admin/Superadmin |

---

## 2. Backend: API Nexus v1

### 2.1 Autenticação (`AuthController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/auth/login` | POST | Login administrativo | Public | `login()` |
| `/v1/auth/licenciada/login` | POST | Login de licenciada | Public | `loginStudent()` |
| `/v1/auth/licenciada/validate` | GET | Validação de sessão de licenciada | Licenciada Token | `validateStudentSession()` |
| `/v1/auth/licenciada/change_password` | POST | Troca de senha de licenciada | Licenciada Token | `changePasswordStudent()` |
| `/v1/auth/licenciada/first-access` | POST | Primeiro acesso de licenciada | Licenciada Token | `changePasswordFirstAccess()` |
| `/v1/auth/admin/change_password` | POST | Troca de senha admin | Admin Token | `changePasswordAdmin()` |

### 2.2 LMS - Licenciada (`LmsController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/lms/modules` | GET | Lista módulos | Licenciada Token | `index()` |
| `/v1/lms/modules/{id}/lessons` | GET | Lista aulas de um módulo | Licenciada Token | `lessons($id)` |
| `/v1/lms/resources` | GET | Lista recursos da biblioteca | Licenciada Token | `resources()` |
| `/v1/lms/thumbnail/{filename}` | GET | Serve thumbnail de aula | Public | `serveThumbnail($filename)` |
| `/v1/lms/progress` | POST | Salva progresso de aula | Licenciada Token | `saveProgress()` |
| `/v1/lms/sign-url` | POST | Gera URL assinada para vídeo | Licenciada Token | `signUrl()` |

### 2.3 LMS - Admin (`AdminLmsController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/admin/lms/dashboard` | GET | Dashboard LMS | Admin | `dashboard()` |
| `/v1/admin/lms/modules` | GET | Lista módulos (admin) | Admin | `index()` |
| `/v1/admin/lms/modules` | POST | Cria módulo | Admin | `createModule()` |
| `/v1/admin/lms/modules` | PUT | Atualiza módulo | Admin | `updateModule()` |
| `/v1/admin/lms/modules/{id}` | DELETE | Deleta módulo | Admin | `deleteModule($id)` |
| `/v1/admin/lms/modules/reorder` | PATCH | Reordena módulos | Admin | `reorderModules()` |
| `/v1/admin/lms/modules/{id}/status` | PATCH | Atualiza status de módulo | Admin | `updateModuleStatus($id)` |
| `/v1/admin/lms/lessons` | POST | Cria aula | Admin | `createLesson()` |
| `/v1/admin/lms/lessons` | PUT | Atualiza aula | Admin | `updateLesson()` |
| `/v1/admin/lms/lessons/{id}` | DELETE | Deleta aula | Admin | `deleteLesson($id)` |
| `/v1/admin/lms/lessons/reorder` | PATCH | Reordena aulas | Admin | `reorderLessons()` |
| `/v1/admin/lms/lessons/{id}/status` | PATCH | Atualiza status de aula | Admin | `updateLessonStatus($id)` |
| `/v1/admin/lms/lessons/{id}/file-info` | GET | Info de arquivo de aula | Admin | `fileInfo($id)` |
| `/v1/admin/lms/upload-chunk` | POST | Upload de chunk de vídeo | Admin | `uploadVideoChunk()` |
| `/v1/admin/lms/upload-thumbnail` | POST | Upload de thumbnail | Admin | `uploadThumbnail()` |
| `/v1/admin/lms/attachments` | POST | Upload de anexo | Admin | `uploadAttachment()` |
| `/v1/admin/lms/attachments/{id}` | DELETE | Deleta anexo | Admin | `deleteAttachment($id)` |
| `/v1/admin/lms/sign-url` | POST | Gera URL assinada (admin) | Admin | `signUrl()` |
| `/v1/gestor/lms/licenciadas` | GET | Lista licenciadas do LMS | Admin | `licenciadas()` |

### 2.4 Media Browser (`MediaController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/admin/media/list` | GET | Lista arquivos de mídia | Admin | `listFiles()` |
| `/v1/admin/media/track-usage` | POST | Rastreia uso de arquivo | Admin | `trackUsage()` |
| `/v1/admin/media/batch-delete` | DELETE | Deleta múltiplos arquivos | Admin | `batchDelete()` |
| `/v1/admin/media/update/{id}` | PUT | Atualiza metadados de arquivo | Admin | `updateFile($id)` |
| `/v1/admin/media/upload` | POST | Upload de arquivo | Admin | `upload()` |
| `/v1/admin/media/sync` | POST | Sincroniza mídia com filesystem | Admin | `sync()` |

### 2.5 Biblioteca de Recursos (`LibraryController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/admin/library` | GET | Lista recursos | Admin | `index()` |
| `/v1/admin/library` | POST | Cria recurso | Admin | `store()` |
| `/v1/admin/library/{id}` | DELETE | Deleta recurso | Admin | `delete($id)` |
| `/v1/admin/library/{id}/approve` | PATCH | Aprova recurso | Admin | `approve($id)` |
| `/v1/admin/library/{id}/reject` | PATCH | Rejeita recurso | Admin | `reject($id)` |
| `/v1/admin/library/{id}/grant` | POST | Concede acesso a recurso | Admin | `grantAccess($id)` |

### 2.6 Conteúdo Público (`ContentController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/mentors` | GET | Lista mentores | Public | `getMentors()` |
| `/v1/admin/mentors` | POST | Cria mentor | Admin | `storeMentor()` |
| `/v1/admin/mentors/{id}` | PUT | Atualiza mentor | Admin | `updateMentor($id)` |
| `/v1/admin/mentors/{id}` | DELETE | Deleta mentor | Admin | `deleteMentor($id)` |
| `/v1/testimonials` | GET | Lista depoimentos | Public | `getTestimonials()` |
| `/v1/admin/testimonials` | POST | Cria depoimento | Admin | `storeTestimonial()` |
| `/v1/admin/testimonials/{id}` | DELETE | Deleta depoimento | Admin | `deleteTestimonial($id)` |
| `/v1/gallery` | GET | Lista galeria | Public | `getGallery()` |
| `/v1/admin/gallery/{id}` | PUT | Atualiza item de galeria | Admin | `updateGallery($id)` |
| `/v1/admin/gallery/{id}` | DELETE | Deleta item de galeria | Admin | `deleteGallery($id)` |

### 2.7 Licenciadas (`LicenciadasController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/licenciadas` | GET | Lista licenciadas | Public | `LicenciadasController::index()` |
| `/v1/licenciadas/{id}` | GET | Detalhes de licenciada | Public | `LicenciadasController::show($id)` |
| `/v1/admin/licenciadas/export` | GET | Exporta licenciadas | Admin | `LicenciadasController::export()` |
| `/v1/admin/licenciadas` | POST | Cria licenciada | Admin | `LicenciadasController::store()` |
| `/v1/admin/licenciadas/{id}` | POST | Atualiza licenciada | Admin | `LicenciadasController::update($id)` |

### 2.8 Resultados (`ResultController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/results` | GET | Lista resultados | Public | `index()` |
| `/v1/results` | POST | Cria resultado | Admin Token | `store()` |
| `/v1/results/{id}` | PUT | Atualiza resultado | Admin Token | `update($id)` |
| `/v1/results/{id}` | DELETE | Deleta resultado | Admin Token | `destroy($id)` |

### 2.9 FAQ (`FaqController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/faq` | GET | Lista FAQs | Public | `index()` |
| `/v1/faq` | POST | Cria FAQ | Admin Token | `store()` |
| `/v1/faq/{id}` | PUT | Atualiza FAQ | Admin Token | `update($id)` |
| `/v1/faq/{id}` | DELETE | Deleta FAQ | Admin Token | `destroy($id)` |

### 2.10 Leads (`LeadController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/admin/leads` | GET | Lista leads | Admin | `index()` |
| `/v1/leads` | POST | Cria lead | Public | `store()` |
| `/v1/admin/leads/{id}` | PUT | Atualiza lead | Admin | `update($id)` |
| `/v1/admin/leads/{id}` | DELETE | Deleta lead | Admin | `destroy($id)` |

### 2.11 Configuração do Site (`SiteConfigController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/site_config` | GET | Obtém configurações | Public | `index()` |
| `/v1/admin/site_config` | POST | Atualiza configurações | Admin | `update()` |

### 2.12 Analytics (`AnalyticsController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/admin/analytics/watchtower` | GET | Métricas Watchtower | Admin | `watchtower()` |
| `/v1/admin/analytics/war-room` | GET | Métricas War Room | Admin | `warRoom()` |
| `/v1/admin/analytics/stats` | GET | Estatísticas gerais | Admin | `getStats()` |

### 2.13 Broadcasts (`BroadcastController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/broadcasts/active` | GET | Broadcasts ativos | Public | `getActive()` |
| `/v1/admin/broadcasts` | GET | Lista broadcasts | Admin | `index()` |
| `/v1/admin/broadcasts` | POST | Gerencia broadcast | Admin | `manage()` |
| `/v1/admin/broadcasts/{id}` | DELETE | Deleta broadcast | Admin | `delete($id)` |

### 2.14 Administração (`AdminController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/admin/users` | GET | Lista usuários | Admin | `users()` |
| `/v1/admin/users` | POST | Gerencia usuário | Admin | `manageUser()` |
| `/v1/admin/users/check-access` | POST | Diagnóstico de acesso | Admin | `checkAccessDiagnostic()` |
| `/v1/admin/impersonate` | POST | Impersonar usuário | Admin | `impersonate()` |
| `/v1/admin/health` | GET | Status de saúde do sistema | Admin | `health()` |
| `/v1/admin/logs` | GET | Logs do sistema | Admin | `logs()` |
| `/v1/admin/maintenance` | POST | Toggle modo manutenção | Admin | `toggleMaintenance()` |
| `/v1/admin/flush-cache` | POST | Limpa cache | Admin | `flushCache()` |
| `/v1/admin/admins` | GET | Lista administradores | Admin | `admins()` |
| `/v1/admin/admins` | POST | Gerencia administrador | Admin | `manageAdmin()` |

### 2.15 Sessões (`SessionController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/admin/sessions` | GET | Lista sessões ativas | Admin | `getSessions()` |
| `/v1/admin/sessions/terminate` | POST | Termina sessão | Admin | `terminateSession()` |

### 2.16 Quiz (`QuizController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/admin/quiz` | GET | Obtém quiz (admin) | Admin | `getAdminQuiz($moduleId)` |
| `/v1/admin/quiz` | POST | Salva quiz | Admin | `saveQuiz()` |
| `/v1/lms/quiz` | GET | Obtém quiz (licenciada) | Licenciada Token | `getStudentQuiz($moduleId)` |
| `/v1/lms/quiz/submit` | POST | Submete quiz | Licenciada Token | `submitQuiz()` |

### 2.17 Certificados (`CertificateController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/lms/certificate/generate` | POST | Gera certificado | Licenciada Token | `generate($user)` |

### 2.18 Database Governance — 🗑️ DEPRECATED

> **`DatabaseController.php` foi removido.** Todas as funcionalidades consolidadas em `NexusDbController.php` (seção 2.19).

### 2.19 Nexus Database (`NexusDbController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/admin/nexus/db/status` | GET | Status do banco (Nexus) | Admin | `status()` |
| `/v1/admin/nexus/db/rebuild` | POST | Rebuild do banco | Admin | `rebuild()` |
| `/v1/admin/nexus/db/migrations` | GET | Lista migrações (Nexus) | Admin | `migrations()` |
| `/v1/admin/nexus/db/migrations/run` | POST | Executa migração (Nexus) | Admin | `runMigration()` |
| `/v1/admin/nexus/db/seeds` | GET | Lista seeds (Nexus) | Admin | `seeds()` |
| `/v1/admin/nexus/db/seeds/run` | POST | Executa seed (Nexus) | Admin | `runSeed()` |
| `/v1/admin/nexus/db/scripts` | GET | Lista scripts (Nexus) | Admin | `scripts()` |
| `/v1/admin/nexus/db/export` | POST | Exporta banco (Nexus) | Admin | `export()` |
| `/v1/admin/nexus/db/download` | GET | Download de snapshot | Admin | N/A (Direct file) |

### 2.20 Nexus Dashboard (`NexusDashboardController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/admin/nexus/system-status` | GET | Status do sistema | Admin | `getSystemStatus()` |
| `/v1/admin/nexus/security-metrics` | GET | Métricas de segurança | Admin | `getSecurityMetrics()` |

### 2.21 Nexus Testing Hub (`NexusTestController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/admin/nexus/tests/suites` | GET | Lista suítes de teste | Admin | `suites()` |
| `/v1/admin/nexus/tests/run` | POST | Executa teste | Admin | `run()` |
| `/v1/admin/nexus/tests/status` | GET | Status de teste | Admin | `status()` |

### 2.22 Nexus Ops (`NexusOpsController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/nexus/ops/rules` | GET | Obtém regras de segurança | Admin | `getRules()` |
| `/v1/nexus/ops/rules` | POST | Atualiza regras | Admin | `updateRules()` |
| `/v1/nexus/ops/audit` | GET | Logs de auditoria | Admin | `getAuditLogs()` |
| `/v1/nexus/ops/ip-rules` | POST | Gerencia regras de IP | Admin | `manageIPRule()` |

### 2.23 Nexus Scripts (`NexusScriptsController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/nexus/scripts/list` | GET | Lista scripts disponíveis | Admin | `listScripts()` |
| `/v1/nexus/scripts/execute` | POST | Executa script | Admin | `executeScript()` |
| `/v1/nexus/scripts/history` | GET | Histórico de execuções | Admin | `getHistory()` |

### 2.24 Doctor Harmony - Clinical Core (`DoctorHarmonyController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/doctor-harmony/credits` | GET | Obtém créditos disponíveis | Public | `getCredits()` |
| `/v1/doctor-harmony/evaluate` | POST | Avaliação clínica | Licenciada Token | `analyze()` |
| `/v1/admin/doctor-harmony/cases/pending` | GET | Casos pendentes de revisão | Admin | `getPendingCases()` |
| `/v1/admin/doctor-harmony/cases/{id}/review` | POST | Submete revisão de caso | Admin | `submitReview($id)` |

### 2.25 Doctor Harmony - Admin (`AdminDoctorHarmonyController.php`)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/admin/doctor-harmony/config` | GET | Obtém configuração | Admin | `getConfig()` |
| `/v1/admin/doctor-harmony/config` | POST | Atualiza configuração | Admin | `updateConfig()` |
| `/v1/admin/doctor-harmony/audit` | GET | Logs de auditoria | Admin | `getAuditLogs()` |
| `/v1/admin/doctor-harmony/health` | GET | Health check | Admin | `healthCheck()` |
| `/v1/admin/doctor-harmony/sandbox` | POST | Sandbox de teste | Admin | `runSandbox()` |

### 2.26 Licenciadas (Portal Routes)

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/licenciada/progress` | GET | Progresso da licenciada | Licenciada Token | Legacy file |
| `/v1/licenciada/lessons` | GET | Aulas da licenciada | Licenciada Token | Legacy file |

### 2.27 Health Check

| Endpoint | Método | Função | Segurança | Controller Method |
|----------|--------|--------|-----------|-------------------|
| `/v1/ping` | GET | Health check | Public | Anonymous function |
| `/v1/me` | GET | Informações do usuário autenticado | Token Required | Anonymous function |

---

## 3. Matriz de Dependências

### 3.1 Fluxos Críticos Cross-Component

#### 🔐 Autenticação & Sessão
```
Frontend: AdminLogin.jsx → api.login()
Backend: /v1/auth/login → AuthController::login()
Storage: localStorage.bh_auth → JWT Token
Middleware: AuthMiddleware::handle() → Valida em todas rotas protegidas
```

#### 🎓 Fluxo de Aula (Licenciada)
```
Frontend: MyLessonsPage.jsx → api.getLmsContent()
Backend: /v1/lms/modules → LmsController::index()
Frontend: LessonPlayer.jsx → api.studentSignUrl()
Backend: /v1/lms/sign-url → LmsController::signUrl()
Storage: Vídeos em /uploads/lms/videos/ (Hostinger)
Progress: /v1/lms/progress → LmsController::saveProgress()
```

#### 🤖 Doctor Harmony (AI Clinical)
```
Frontend: MentorIAPage.jsx → api.doctorHarmony.evaluate()
Backend: /v1/doctor-harmony/evaluate → DoctorHarmonyController::analyze()
Service: DoctorHarmonyService → Gemini API (gemini-2.0-flash)
Review: /v1/admin/doctor-harmony/cases/pending → Admin oversight
```

#### 📊 Nexus Dashboard
```
Frontend: NexusHome.jsx → api.nexus.getSystemStatus()
Backend: /v1/admin/nexus/system-status → NexusDashboardController::getSystemStatus()
Analytics: /v1/admin/analytics/watchtower → AnalyticsController::watchtower()
Security: /v1/admin/nexus/security-metrics → NexusDashboardController::getSecurityMetrics()
```

### 3.2 Páginas Órfãs (Sem Backend Implementado)

| Página | Rota | Status | Observação |
|--------|------|--------|------------|
| `VisualEditor.jsx` | `/admin/visual-editor` | ⚠️ Frontend Only | Sem endpoints backend |

### 3.3 Endpoints Órfãos (Sem Frontend Implementado)

| Endpoint | Controller | Status | Observação |
|----------|-----------|--------|------------|
| `/v1/admin/nudge` | Legacy file | ⚠️ Legacy | Requer refatoração para NudgeController |

---

## 4. Inconsistências de Nomenclatura

### 4.1 Padrões Identificados

| Contexto | Padrão Atual | Recomendação OpenSpec |
|----------|-------------|----------------------|
| Frontend Routes | `camelCase` | ✅ Mantido |
| Backend Endpoints | `snake_case` | ✅ Mantido |
| Controllers | `PascalCase` | ✅ Mantido |
| Database Tables | `snake_case` | ✅ Mantido |
| Frontend Components | `PascalCase` | ✅ Mantido |

### 4.2 Aliases e Duplicações

| Rota | Alias | Motivo |
|------|-------|--------|
| `/licenciadas-licenciadas` | `/licenciadas` | SEO & Usabilidade |
| `/lms` | `/portal-licenciada/dashboard` | Redirect para dashboard |

---

## 5. Conformidade com Visual Identity V3.1

### 5.1 Cores Primárias (Verificadas)

| Componente | Navy Blue (#0A3E60) | Gold (#ED7E13) | Status |
|-----------|---------------------|----------------|--------|
| `Home.jsx` | ✅ | ✅ | Compliant |
| `PortalDashboard.jsx` | ✅ | ✅ | Compliant |
| `NexusHome.jsx` | ✅ | ✅ | Compliant |
| `AdminLogin.jsx` | ✅ | ✅ | Compliant |

### 5.2 Tipografia (Verificadas)

| Componente | Montserrat (Headings) | Poppins (Body) | Status |
|-----------|----------------------|----------------|--------|
| Global CSS | ✅ | ✅ | Compliant |
| `Home.jsx` | ✅ | ✅ | Compliant |
| `PortalDashboard.jsx` | ✅ | ✅ | Compliant |

---

## 6. Estatísticas do Sistema

| Métrica | Valor |
|---------|-------|
| **Total de Rotas Frontend** | 54 |
| **Rotas Públicas** | 9 |
| **Rotas Admin** | 13 |
| **Rotas Portal** | 7 |
| **Rotas LMS** | 3 |
| **Rotas Nexus** | 14 |
| **Total de Endpoints Backend** | 120+ |
| **Controllers** | 28 |
| **Endpoints Públicos** | 15 |
| **Endpoints Admin** | 85+ |
| **Endpoints Licenciada** | 20+ |

---

## 7. Próximos Passos (Recomendações)

### 7.1 Refatorações Prioritárias

1. **Migrar `/v1/admin/nudge`** de arquivo legacy para `NudgeController.php`
2. **Implementar backend para `VisualEditor.jsx`** (se necessário)
3. ~~**Consolidar rotas duplicadas**~~ ✅ `DatabaseController` removido, consolidado em `NexusDbController`
4. **Adicionar testes automatizados** para rotas críticas (Auth, LMS, Doctor Harmony)

### 7.2 Documentação Adicional

1. **Criar OpenAPI Spec** completo em `openspec/master/openapi.yaml`
2. **Documentar fluxos de autenticação** em `openspec/master/authentication-flows.md`
3. **Mapear permissões por role** em `openspec/master/rbac-matrix.md`

---

**Gerado por:** Antigravity (OpenSpec V3.1)  
**Última Atualização:** 2026-05-29T11:40:00-03:00 (V123 Alignment)
