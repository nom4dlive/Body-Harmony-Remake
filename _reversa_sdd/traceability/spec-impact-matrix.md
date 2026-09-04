# Spec Impact Matrix — Body Harmony

> Gerado pelo Architect em 2026-06-02
> Confiança: 🟢 CONFIRMADO | 🟡 INFERIDO

## Matriz de Impacto entre Componentes

| Componente (impacta ↓) | Impacta (→) | Natureza |
|----------------------|-------------|----------|
| **AuthMiddleware** | Todos os controllers | Autenticação pré-rota |
| **Router (index.php)** | Todos os controllers | Roteamento |
| **Response** | Todos os controllers | Formato de resposta |
| **ResponseCache** | LmsController, AdminLmsController | Cache de leitura |
| **NexusLogger** | Todos os controllers | Logging |
| **NexusSQLite** | AuthMiddleware, admin/auth_nexus.php, admin/watchtower, admin/engine | Firewall + cache admin |
| **LmsController** | LmsProgress, LmsModules, LmsLessons, LmsQuizzes, LmsCertificates | LMS operations |
| **AdminLmsController** | LmsModules, LmsLessons, LmsQuizzes, LmsAttachments | CRUD admin LMS |
| **QuizController** | LmsQuizzes, LmsQuestions, LmsQuestionOptions, LmsQuizAttempts | Quiz system |
| **DoctorHarmonyController** | AiClinicalCases, AiMentorshipLogs, LmsLicenses | Mentoria IA |
| **AdminDoctorHarmonyController** | AiConfig, AiClinicalCases | Config + audit |
| **GeminiService** | DoctorHarmonyController | IA externa |
| **SimplePDF** | CertificateController | Geração de PDF |
| **ResourceService** | LmsController | Signed URLs |
| **ContentController** | Mentors | CRUD mentores |
| **LeadController** | Leads | Captura de leads |
| **BroadcastController** | SystemBroadcasts, SystemBroadcastLogs | Comunicados |
| **MediaController** | StorageFiles, FileSystem | Gerenciamento de mídia |
| **AnalyticsController** | LmsAccessLogs, LicenciadaDevices, Licenciadas | Analytics |
| **NexusForensicsController** | AuditLogs | Forense |
| **AuthController (Aluna)** | AlunaDevices, Alunas | Auth aluna |
| **AuthController (Licenciada)** | LicenciadaDevices, Licenciadas | Auth licenciada |
| **AdminController** | Licenciadas, admin_users | Gerenciamento admin |

## Impacto por Tabela

| Tabela | Acessada por |
|--------|-------------|
| admin_users | AuthMiddleware, AdminController, auth_nexus.php, admin/admins.php |
| licenciadas | AuthMiddleware, LmsController, AnalyticsController, AdminLmsController, AdminController |
| licenciada_devices | AuthMiddleware, AnalyticsController |
| alunas | AuthMiddleware, AlunaController |
| lms_modules | LmsController, AdminLmsController |
| lms_lessons | LmsController, AdminLmsController |
| lms_progress | LmsController |
| lms_quizzes | LmsController, QuizController, AdminLmsController |
| lms_questions | QuizController |
| lms_quiz_attempts | LmsController, QuizController, CertificateController |
| lms_certificates | CertificateController |
| ai_clinical_cases | DoctorHarmonyController, AdminDoctorHarmonyController |
| ai_config | AdminDoctorHarmonyController |
| system_broadcasts | BroadcastController |
| system_broadcast_logs | BroadcastController |
| audit_logs | NexusLogger, AdminController, NexusForensicsController |
| security_ip_rules | AuthMiddleware, admin/watchtower |
| leads | LeadController |
| storage_files | MediaController |
| mentors | ContentController |

## Dependências Críticas (Circular/Indiretas)
- **LmsController → ResponseCache**: cache de módulos é invalidado por saveProgress()
- **DoctorHarmonyController → AiConfig**: system prompt e modelo carregados dinamicamente
- **AuthMiddleware → NexusSQLite → MySQL**: firewall dual-engine com fallback
- **AdminLmsController → ResponseCache**: CRUD admin invalida cache público
