# Code/Spec Matrix

> Matriz de rastreabilidade entre arquivos do legado e units de especificação.
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Backend (PHP)

| Arquivo do Legado | Unit | Cobertura |
|-------------------|------|-----------|
| `Core/AuthMiddleware.php` | `autenticacao/` | 🟢 |
| `Core/Auth.php` | `autenticacao/` | 🟢 |
| `Core/JWT.php` | `autenticacao/` | 🟢 |
| `Core/NexusGuard.php` | `nexus/` | 🟢 |
| `Core/Response.php` | `admin/` | 🟢 |
| `Core/ResponseCache.php` | `admin/` | 🟢 |
| `Core/NexusLogger.php` | `nexus/` | 🟢 |
| `Core/NexusErrorHandler.php` | `nexus/` | 🟢 |
| `Core/NexusSQLite.php` | `nexus/` | 🟢 |
| `Core/Router.php` | `admin/` | 🟢 |
| `Controllers/AuthController.php` | `autenticacao/` | 🟢 |
| `Controllers/AlunaAuthController.php` | `autenticacao/` | 🟢 |
| `Controllers/AdminController.php` | `admin/` | 🟢 |
| `Controllers/AdminAlunaController.php` | `aluna/` | 🟢 |
| `Controllers/AdminLmsController.php` | `lms/` | 🟢 |
| `Controllers/LmsController.php` | `lms/` | 🟢 |
| `Controllers/QuizController.php` | `lms/` | 🟢 |
| `Controllers/LicenciadasController.php` | `licenciada/` | 🟢 |
| `Controllers/AlunaLmsController.php` | `aluna/` | 🟢 |
| `Controllers/CertificateController.php` | `certificado/` | 🟢 |
| `Controllers/ContentController.php` | `conteudo/` | 🟢 |
| `Controllers/LeadController.php` | `leads/` | 🟢 |
| `Controllers/ResultController.php` | `resultados/` | 🟢 |
| `Controllers/FaqController.php` | `faq/` | 🟢 |
| `Controllers/MediaController.php` | `midia/` | 🟢 |
| `Controllers/BroadcastController.php` | `broadcast/` | 🟢 |
| `Controllers/NexusOpsController.php` | `nexus/` | 🟢 |
| `Controllers/NexusDashboardController.php` | `nexus/` | 🟢 |
| `Controllers/NexusDbController.php` | `nexus/` | 🟢 |
| `Controllers/NexusForensicsController.php` | `nexus/` | 🟢 |
| `Controllers/NexusScriptsController.php` | `nexus/` | 🟢 |
| `Controllers/NexusTestController.php` | `nexus/` | 🟢 |
| `Controllers/WatchtowerController.php` | `nexus/` | 🟢 |
| `Controllers/AIAdminController.php` | `nexus/` | 🟢 |
| `Controllers/DoctorHarmonyController.php` | `doctor-harmony/` | 🟢 |
| `Controllers/AdminDoctorHarmonyController.php` | `doctor-harmony/` | 🟢 |
| `Controllers/AnalyticsController.php` | `analytics/` | 🟢 |
| `Controllers/SiteConfigController.php` | `admin/` | 🟢 |
| `Controllers/ResultController.php` | `resultados/` | 🟢 |
| `Services/MagicTokenService.php` | `autenticacao/` | 🟢 |
| `Services/RiskEngineService.php` | `autenticacao/` | 🟢 |
| `libs/SimplePDF.php` | `certificado/` | 🟢 |
| `libs/GeminiService.php` | `doctor-harmony/` | 🟢 |
| `libs/ResourceService.php` | `lms/` | 🟢 |
| `admin/engine/cache_manager.php` | `admin/` | 🟢 |
| `admin/engine/feature_flags.php` | `admin/` | 🟢 |
| `admin/watchtower/core.php` | `nexus/` | 🟢 |
| `admin/signal_tower/broadcasts.php` | `broadcast/` | 🟢 |
| `licenciada/dashboard_summary.php` | `licenciada/` | 🟢 |
| `licenciada/progress.php` | `licenciada/` | 🟢 |
| `licenciada/lessons.php` | `licenciada/` | 🟢 |

## Frontend (React)

| Arquivo do Legado | Unit | Cobertura |
|-------------------|------|-----------|
| `App.jsx` | `admin/` | 🟡 |
| `services/api.js` | `admin/` | 🟡 |
| `context/AuthContext.jsx` | `autenticacao/` | 🟢 |
| `context/DataContext.jsx` | `admin/` | 🟡 |
| `components/ProtectedRoute/ProtectedRoute.jsx` | `admin/` | 🟡 |
| `pages/PortalAluna/AlunaSupport.jsx` | `aluna/` | 🟡 |
| `pages/PortalAluna/Dashboard.jsx` | `aluna/` | 🟡 |
| `pages/PortalLicenciada/Dashboard.jsx` | `licenciada/` | 🟡 |
| `pages/Admin/Dashboard.jsx` | `admin/` | 🟡 |
| `pages/Admin/FaqManager.jsx` | `faq/` | 🟢 |
| `pages/Admin/ImageManager.jsx` | `midia/` | 🟢 |
| `pages/Admin/ContentManager.jsx` | `conteudo/` | 🟢 |
| `pages/Results/ResultsGallery.jsx` | `resultados/` | 🟢 |
| `pages/Workshop/Workshop.jsx` | `workshop/` | 🟢 |
| `pages/Nexus/NexusLayout.jsx` | `nexus/` | 🟢 |
| `pages/Nexus/NexusHome.jsx` | `nexus/` | 🟢 |
| `pages/Nexus/Vault/FaqEditor.jsx` | `faq/` | 🟢 |
| `pages/Nexus/SignalTower/Console.jsx` | `broadcast/` | 🟢 |

## Cobertura Estimada

- **Total de arquivos do legado:** ~400
- **Arquivos mapeados na matriz:** ~68
- **Cobertura estimada:** ~17% (foco nos arquivos principais de cada módulo)
- **Cobertura funcional:** ~85% (arquivos de lógica de negócio principais mapeados)
- **Arquivos não mapeados:** assets, configurações, testes, componentes UI auxiliares
