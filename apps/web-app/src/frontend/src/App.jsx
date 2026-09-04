import { Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { trackPageView } from './services/telemetry'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { StyleSheetManager } from 'styled-components'
import { MAINTENANCE_CONFIG } from './config/maintenance'
import MaintenancePage from './pages/Maintenance/Maintenance'
import { useData } from './context/DataContext'
import { CRMDevReadinessHUD } from './components/Common/CRMDevReadinessHUD'
import PixelDebugHUD from './components/Common/PixelDebugHUD'
import safeLazy from './utils/safeLazy'

// 🛡️ Self-Healing Lazy Loading (PLAN-222)
const lazy = safeLazy

// Lazy loading pages
const Home = lazy(() => import('./pages/Home/Home'))
const Mentors = lazy(() => import('./pages/Mentors/Mentors'))
const LicenciadasPage = lazy(() => import('./pages/Licenciadas/Licenciadas'))
const Contact = lazy(() => import('./pages/Contact/Contact'))
const ResultsGallery = lazy(() => import('./pages/Results/ResultsGallery'))
const Testimonials = lazy(() => import('./pages/Testimonials/Testimonials'))
const AdminLogin = lazy(() => import('./pages/Admin/Login'))
const Workshop = lazy(() => import('./pages/Workshop/Workshop'))
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'))
const ContentManager = lazy(() => import('./pages/Admin/ContentManager'))
const ImageManager = lazy(() => import('./pages/Admin/ImageManager'))
const MentorsManager = lazy(() => import('./pages/Admin/MentorsManager'))
const ThemeManager = lazy(() => import('./pages/Admin/ThemeManager'))
const LicenciadasManager = lazy(() => import('./pages/Admin/LicenciadasManager'))
const ResultsManager = lazy(() => import('./pages/Admin/ResultsManager'))
const TestimonialManager = lazy(() => import('./pages/Admin/TestimonialManager'))
const LeadsManager = lazy(() => import('./pages/Admin/LeadsManager'))
const FaqManager = lazy(() => import('./pages/Admin/FaqManager'))
const SiteSettings = lazy(() => import('./pages/Admin/SiteSettings'))
const AdminLMS = lazy(() => import('./pages/Admin/LMS/LMSContainer'))
const VisualEditor = lazy(() => import('./pages/Admin/VisualEditor/VisualEditor'))
const AlunaManager = lazy(() => import('./pages/Admin/AlunaManager/AlunaManager'))  // V68.1
const ContractsManager = lazy(() => import('./pages/Admin/Contracts/ContractsManager')) // PLAN-036
const ContractWizard = lazy(() => import('./pages/Admin/Contracts/ContractWizard'))     // PLAN-036
const PublicSignPage = lazy(() => import('./pages/Admin/Contracts/PublicSignPage'))     // PLAN-036
const PublicValidatePage = lazy(() => import('./pages/Admin/Contracts/PublicValidatePage')) // PLAN-061
const WhatsAppMessagesManager = lazy(() => import('./pages/Admin/WhatsAppMessages/WhatsAppMessagesManager')) // PLAN-051
const GestorAgendaPage = lazy(() => import('./pages/Gestor/Agenda/GestorAgendaPage')) // PLAN-062
const OnboardingFunnelPage = lazy(() => import('./pages/OnboardingFunnelPage')) // PLAN-064
const PublicOnboardingPage = lazy(() => import('./pages/PublicOnboardingPage')) // PLAN-064
const CertificateVerificationPage = lazy(() => import('./pages/Public/CertificateVerificationPage')) // PLAN-108

// Financeiro (PLAN-122 + PLAN-132)
const FinanceiroDashboard = lazy(() => import('./pages/Admin/Financeiro/FinanceiroDashboard')) // PLAN-122
const CashClosePage = lazy(() => import('./pages/Admin/Financeiro/CashClosePage')) // PLAN-122
const CostCentersPage = lazy(() => import('./pages/Admin/Financeiro/CostCentersPage')) // PLAN-122
const FinancialTransactionsPage = lazy(() => import('./pages/Admin/Financeiro/FinancialTransactionsPage')) // PLAN-122
const FinancialReportsPage = lazy(() => import('./pages/Admin/Financeiro/FinancialReportsPage')) // PLAN-122
const LicenseTaxesPage = lazy(() => import('./pages/Admin/Financeiro/LicenseTaxesPage')) // PLAN-132

// Loja Virtual, Ingressos & Congresso (PLAN-093 / PLAN-117)
const ShopPage = lazy(() => import('./pages/Shop/ShopPage'))
const ShopCheckoutPage = lazy(() => import('./pages/Shop/ShopCheckoutPage'))
const PublicTicketValidatePage = lazy(() => import('./pages/Shop/PublicTicketValidatePage')) // PLAN-142
const CongressoPage = lazy(() => import('./pages/Congresso/CongressoPage'))
const CongressCheckoutPage = lazy(() => import('./pages/Congresso/CongressCheckoutPage'))
const ShopManager = lazy(() => import('./pages/Admin/Shop/ShopManager'))


// Portal Pages
const PortalLogin = lazy(() => import('./pages/Portal/Login'))
const PortalDashboard = lazy(() => import('./pages/Portal/Dashboard'))
const PortalForceChangePassword = lazy(() => import('./pages/Portal/ForceChangePassword'))
const MyLessonsPage = lazy(() => import('./pages/Portal/MyLessons/MyLessonsPage'))
const ProgressPage = lazy(() => import('./pages/Portal/Progress/ProgressPage'))
const CertificatesPage = lazy(() => import('./pages/Portal/Certificates/CertificatesPage'))
const ResourceLibraryPage = lazy(() => import('./pages/Portal/Library/ResourceLibraryPage'))
const MentorIAPage = lazy(() => import('./pages/Portal/MentorIA/MentorIAPage'))
const PremiumPage  = lazy(() => import('./pages/Portal/Premium/PremiumPage'))  // PLAN-012
const SmartBookPage = lazy(() => import('./pages/Portal/SmartBookPage')) // PLAN-131
const SmartBookNotebookPage = lazy(() => import('./pages/Portal/SmartBookNotebookPage')) // PLAN-141
const GestorSmartBook = lazy(() => import('./pages/Admin/GestorSmartBook')) // PLAN-131
const GestorUsersPage = lazy(() => import('./pages/Admin/GestorUsersPage'))

const ProfilePage = lazy(() => import('./pages/Portal/Profile/ProfilePage'))
const FaqPage = lazy(() => import('./pages/Portal/Faq'))
const SupportIAPage = lazy(() => import('./pages/Portal/SupportIA/SupportEmbedPage'))
const LessonPlayer = lazy(() => import('./pages/LMS/LessonPlayer'))
const ModuleView = lazy(() => import('./pages/LMS/ModuleView'))
const DossierEmbedPage = lazy(() => import('./pages/Admin/CRM/DossierEmbedPage')) // PLAN-154
const CRMHubPage = lazy(() => import('./pages/Admin/CRM/CRMHubPage')) // PLAN-156
const CRMKanbanPage = lazy(() => import('./pages/Admin/CRM/CRMKanbanPage')) // PLAN-170
const CRMCockpitSidebar = lazy(() => import('./pages/Admin/CRM/CRMCockpitSidebar')) // PLAN-166
const Proposal = lazy(() => import('./pages/Hidden/Proposal'))

// Portal Aluna Individual (V68)
const AlunaLogin               = lazy(() => import('./pages/PortalAluna/AlunaLogin'))
const AlunaDashboard           = lazy(() => import('./pages/PortalAluna/AlunaDashboard'))
const AlunaModuleView          = lazy(() => import('./pages/PortalAluna/AlunaModuleView'))
const AlunaLessonPlayer        = lazy(() => import('./pages/PortalAluna/AlunaLessonPlayer'))
const AlunaSupport             = lazy(() => import('./pages/PortalAluna/AlunaSupport'))
const AlunaProfile             = lazy(() => import('./pages/PortalAluna/AlunaProfile'))
const AlunaForceChangePassword = lazy(() => import('./pages/PortalAluna/AlunaForceChangePassword'))


// Nexus Dashboard (Superadmin God Mode)
const NexusLayout = lazy(() => import('./pages/Nexus/NexusLayout'))
const NexusGatekeeper = lazy(() => import('./pages/Nexus/Gatekeeper'))
const NexusWatchtower = lazy(() => import('./pages/Nexus/Watchtower/Dashboard'))
const NexusBarracks = lazy(() => import('./pages/Nexus/Barracks/UserList'))
const NexusEngineRoom = lazy(() => import('./pages/Nexus/EngineRoom/SystemStatus'))
const NexusWarRoom = lazy(() => import('./pages/Nexus/WarRoom/Dashboard'))
const NexusSignalTower = lazy(() => import('./pages/Nexus/SignalTower/Console'))
const NexusHome = lazy(() => import('./pages/Nexus/NexusHome'))
const NexusVault = lazy(() => import('./pages/Nexus/Vault/Dashboard'))
const NexusDatabase = lazy(() => import('./pages/Nexus/Database/Dashboard'))
const NexusTestingHub = lazy(() => import('./pages/Nexus/TestingHub/Dashboard'))
const NexusOps = lazy(() => import('./pages/Nexus/Ops/OpsDashboard'))
const NexusAIControl = lazy(() => import('./pages/Nexus/AIControlTower'))
const NexusScriptsManager = lazy(() => import('./pages/Nexus/Scripts/ScriptsManager'))
const NexusAlunas = lazy(() => import('./pages/Nexus/Alunas/NexusAlunas'))      // V68.1
const NexusForensicsLab = lazy(() => import('./pages/Nexus/ForensicsLab'))


import { ROUTES } from './config/routes'
import RoleGuard, { ROLES } from './components/ProtectedRoute/RoleGuard'
import { AudioProvider } from './context/AudioContext'
import { LicenciadaAuthProvider } from './context/LicenciadaAuthContext'
import { AlunaAuthProvider } from './context/AlunaAuthContext'
import { SignalProvider } from './context/SignalContext'
import LicenciadaGuard from './components/ProtectedRoute/LicenciadaGuard'
import PortalAlunaGuard from './components/ProtectedRoute/PortalAlunaGuard'
import PermissionRouteGuard from './components/ProtectedRoute/PermissionRouteGuard'
import { GlobalAudioPlayer } from './pages/Portal/components/GlobalAudioPlayer'
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton'
import ConsentModal from './components/Legal/ConsentModal'
import NexusSignalListener from './pages/Portal/components/NexusSignalListener'
import NexusSignalDrawer from './pages/Portal/components/NexusSignalDrawer'

const LicenciadaReviewHub = lazy(() => import('./pages/Nexus/ReviewHub/LicenciadaReviewHub'))
const SecurityDashboard = lazy(() => import('./pages/Admin/Security/Dashboard'))

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', color: '#0A3E60' }}>
    <div style={{ textAlign: 'center' }}>
      <img src="/logo.svg" alt="Loading..." style={{ width: '150px', marginBottom: '1rem', opacity: 0.7 }} />
      <h3>Carregando...</h3>
    </div>
  </div>
)

function App() {
  const { pathname } = useLocation()
  const { siteConfig } = useData()
  const maintenance = siteConfig?.maintenance || MAINTENANCE_CONFIG

  // Rastreamento Universal de Visualização de Página (GTM / Meta Pixel)
  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  // Interceptador do Modo Manutenção (Portais Aluna e Licenciada)
  if ((maintenance?.licenciada?.active ?? true) && pathname.startsWith('/portal-licenciada')) {
    return <MaintenancePage type="licenciada" />
  }
  if ((maintenance?.aluna?.active ?? true) && pathname.startsWith('/portal-aluna')) {
    return <MaintenancePage type="aluna" />
  }


  const isSecureArea = pathname.startsWith('/lms') ||
    pathname.startsWith('/portal-gestor') ||
    pathname.startsWith('/portal-licenciada') ||
    pathname.startsWith('/portal-aluna') ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/nexus') ||
    pathname.startsWith('/gestor') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/bot')


  return (
    <AlunaAuthProvider>
    <LicenciadaAuthProvider>
      <SignalProvider>
        <AudioProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Home V2 (Standalone Layout) */}
              <Route index element={<Home />} />
              <Route path="/workshop" element={<Workshop />} />

              {/* Loja Virtual Oficial & Ingressos (PLAN-093 / REGRA 18) */}
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/checkout/:productId" element={<ShopCheckoutPage />} />
              <Route path="/loja" element={<Navigate to="/shop" replace />} />

              {/* Landing Page do 1º Congresso Brasileiro de Musculação Elétrica (PLAN-093 / PLAN-117) */}
              <Route path="/congresso" element={<CongressoPage />} />
              <Route path="/congresso/checkout" element={<CongressCheckoutPage />} />
              <Route path="/checkout-congresso" element={<Navigate to="/congresso/checkout" replace />} />

              {/* Global Layout for Verify/Internal Pages */}
              <Route element={<Layout />}>
                <Route path="mentores" element={<Mentors />} />
                <Route path="licenciadas-licenciadas" element={<LicenciadasPage />} />
                <Route path="licenciadas" element={<LicenciadasPage />} />
                <Route path="resultados" element={<ResultsGallery />} />
                <Route path="depoimentos" element={<Testimonials />} />
                <Route path="contato" element={<Contact />} />
              </Route>

              {/* Secure Admin Routes */}
              <Route path={ROUTES.ADMIN} element={<AdminLogin />} />

              {/* Portal Licenciadas Routes */}
              <Route path={ROUTES.PORTAL} element={<PortalLogin />} />

              {/* Protected Aluna Routes */}
              <Route path={ROUTES.PORTAL_DASHBOARD} element={<LicenciadaGuard><PortalDashboard /></LicenciadaGuard>} />
              <Route path="/portal-licenciada/minhas-aulas" element={<LicenciadaGuard><MyLessonsPage /></LicenciadaGuard>} />
              <Route path="/portal-licenciada/meu-progresso" element={<LicenciadaGuard><ProgressPage /></LicenciadaGuard>} />
              <Route path="/portal-licenciada/certificados" element={<LicenciadaGuard><CertificatesPage /></LicenciadaGuard>} />
              <Route path={ROUTES.PORTAL_CERTIFICADOS} element={<LicenciadaGuard><CertificatesPage /></LicenciadaGuard>} />
              <Route path="/portal-licenciada/biblioteca" element={<LicenciadaGuard><ResourceLibraryPage /></LicenciadaGuard>} />
              <Route path="/portal-licenciada/mentoria-ia" element={<LicenciadaGuard><MentorIAPage /></LicenciadaGuard>} />
              <Route path="/portal-licenciada/perfil" element={<LicenciadaGuard><ProfilePage /></LicenciadaGuard>} />
              <Route path={ROUTES.PORTAL_SUPPORT_IA} element={<SupportIAPage />} />
              <Route path="/portal-licenciada/nova-senha" element={<PortalForceChangePassword />} />
              <Route path="/portal-licenciada/faq" element={<LicenciadaGuard><FaqPage /></LicenciadaGuard>} />
              <Route path={ROUTES.PORTAL_PREMIUM} element={<LicenciadaGuard><PremiumPage /></LicenciadaGuard>} />  {/* PLAN-012 */}
              <Route path="/portal-licenciada/smartbook" element={<LicenciadaGuard><SmartBookPage /></LicenciadaGuard>} /> {/* PLAN-131 */}
              <Route path="/portal-licenciada/smartbook/notebook/:instanceId" element={<LicenciadaGuard><SmartBookNotebookPage /></LicenciadaGuard>} /> {/* PLAN-141 */}
              <Route path="/smartbook/notebook/:instanceId" element={<Navigate to="/portal-licenciada/smartbook/notebook/:instanceId" replace />} />
              <Route path="/smartbook" element={<Navigate to="/portal-licenciada/smartbook" replace />} /> {/* PLAN-140 */}

              {/* LMS Routes (Phase 6 Consolidation) */}
              <Route path={ROUTES.LMS} element={<LicenciadaGuard><PortalDashboard /></LicenciadaGuard>} />
              <Route path={ROUTES.LMS_MODULE + '/:id'} element={<LicenciadaGuard><ModuleView /></LicenciadaGuard>} />
              <Route path={ROUTES.LMS_LESSON + '/:id'} element={<LicenciadaGuard><LessonPlayer /></LicenciadaGuard>} />


              <Route path={`${ROUTES.ADMIN}/dashboard`} element={<ProtectedRoute><PermissionRouteGuard page="dashboard"><Dashboard /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/textos`} element={<ProtectedRoute><PermissionRouteGuard page="textos"><ContentManager /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/aparencia`} element={<ProtectedRoute><PermissionRouteGuard page="aparencia"><ThemeManager /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/mentores`} element={<ProtectedRoute><PermissionRouteGuard page="mentores"><MentorsManager /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/imagens`} element={<ProtectedRoute><PermissionRouteGuard page="imagens"><ImageManager /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/licenciadas`} element={<ProtectedRoute><PermissionRouteGuard page="licenciadas"><LicenciadasManager /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/resultados`} element={<ProtectedRoute><PermissionRouteGuard page="resultados"><ResultsManager /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/depoimentos`} element={<ProtectedRoute><PermissionRouteGuard page="depoimentos"><TestimonialManager /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/leads`} element={<ProtectedRoute><PermissionRouteGuard page="leads"><LeadsManager /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/faq`} element={<ProtectedRoute><PermissionRouteGuard page="faq"><FaqManager /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/configuracoes`} element={<ProtectedRoute><PermissionRouteGuard page="configuracoes"><SiteSettings /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/lms`} element={<ProtectedRoute><PermissionRouteGuard page="lms"><AdminLMS /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/visual-editor`} element={<ProtectedRoute><PermissionRouteGuard page="visual_editor"><VisualEditor /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/alunas`} element={<ProtectedRoute><PermissionRouteGuard page="alunas"><AlunaManager /></PermissionRouteGuard></ProtectedRoute>} />  {/* V68.1 */}
              <Route path={`${ROUTES.ADMIN}/contratos`} element={<ProtectedRoute><PermissionRouteGuard page="contratos"><ContractsManager /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-036 */}
              <Route path={`${ROUTES.ADMIN}/contratos/novo`} element={<ProtectedRoute><PermissionRouteGuard page="contratos"><ContractWizard /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-036 */}
              <Route path={`${ROUTES.ADMIN}/contratos/:uuid`} element={<ProtectedRoute><PermissionRouteGuard page="contratos"><ContractWizard /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-036 */}
              <Route path={`${ROUTES.ADMIN}/mensagens`} element={<ProtectedRoute><PermissionRouteGuard page="mensagens"><WhatsAppMessagesManager /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-051 */}
              <Route path="/portal-gestor/crm" element={<ProtectedRoute><PermissionRouteGuard page="crm"><CRMHubPage /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-156 */}
              <Route path={`${ROUTES.ADMIN}/crm`} element={<ProtectedRoute><PermissionRouteGuard page="crm"><CRMHubPage /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-156 */}
              <Route path="/portal-gestor/crm/kanban" element={<ProtectedRoute><PermissionRouteGuard page="crm"><CRMKanbanPage /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-170 */}
              <Route path={`${ROUTES.ADMIN}/crm/kanban`} element={<ProtectedRoute><PermissionRouteGuard page="crm"><CRMKanbanPage /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-170 */}
              <Route path={`${ROUTES.ADMIN}/agenda`} element={<ProtectedRoute><PermissionRouteGuard page="agenda"><GestorAgendaPage /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-062 */}
              <Route path="/portal-gestor/agenda" element={<ProtectedRoute><PermissionRouteGuard page="agenda"><GestorAgendaPage /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-062 */}
              <Route path={`${ROUTES.ADMIN}/onboarding`} element={<ProtectedRoute><PermissionRouteGuard page="onboarding"><OnboardingFunnelPage /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-064 */}
              <Route path="/portal-gestor/onboarding" element={<ProtectedRoute><PermissionRouteGuard page="onboarding"><OnboardingFunnelPage /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-064 */}
              <Route path="/portal-gestor/shop" element={<ProtectedRoute><PermissionRouteGuard page="shop"><ShopManager /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-093 */}
              <Route path={`${ROUTES.ADMIN}/shop`} element={<ProtectedRoute><PermissionRouteGuard page="shop"><ShopManager /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-093 */}

              {/* Financeiro (PLAN-122 + PLAN-132) */}
              <Route path="/portal-gestor/financeiro" element={<ProtectedRoute><PermissionRouteGuard page="financeiro"><FinanceiroDashboard /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path="/portal-gestor/financeiro/transacoes" element={<ProtectedRoute><PermissionRouteGuard page="financeiro"><FinancialTransactionsPage /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path="/portal-gestor/financeiro/fechamento" element={<ProtectedRoute><PermissionRouteGuard page="financeiro"><CashClosePage /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path="/portal-gestor/financeiro/centros-custo" element={<ProtectedRoute><PermissionRouteGuard page="financeiro"><CostCentersPage /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path="/portal-gestor/financeiro/relatorios" element={<ProtectedRoute><PermissionRouteGuard page="financeiro"><FinancialReportsPage /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path="/portal-gestor/financeiro/taxas-licenciamento" element={<Navigate to="/portal-gestor/financeiro?tab=taxas" replace />} /> {/* Reconciliação PLAN-140: Hub Único */}

              <Route path="/portal-gestor/smartbook" element={<ProtectedRoute><PermissionRouteGuard page="smartbook"><GestorSmartBook /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-131 */}
              <Route path="/admin/smartbook" element={<ProtectedRoute><PermissionRouteGuard page="smartbook"><GestorSmartBook /></PermissionRouteGuard></ProtectedRoute>} /> {/* PLAN-131 */}

              {/* Gestão de Usuários & RBAC */}
              <Route path="/portal-gestor/usuarios" element={<ProtectedRoute><PermissionRouteGuard page="usuarios"><GestorUsersPage /></PermissionRouteGuard></ProtectedRoute>} />
              <Route path={`${ROUTES.ADMIN}/usuarios`} element={<ProtectedRoute><PermissionRouteGuard page="usuarios"><GestorUsersPage /></PermissionRouteGuard></ProtectedRoute>} />


              {/* Superadmin Routes */}
              <Route path={`${ROUTES.ADMIN}/seguranca`} element={<RoleGuard requiredRole={ROLES.SUPERADMIN}><SecurityDashboard /></RoleGuard>} />

              {/* Portal Aluna Individual (V68) */}
              <Route path="/portal-aluna" element={<AlunaLogin />} />
              <Route path="/portal-aluna/nova-senha" element={<AlunaForceChangePassword />} />
              <Route path="/portal-aluna/dashboard" element={<PortalAlunaGuard><AlunaDashboard /></PortalAlunaGuard>} />
              <Route path="/portal-aluna/curso/:id" element={<PortalAlunaGuard><AlunaModuleView /></PortalAlunaGuard>} />
              <Route path="/portal-aluna/aula/:id" element={<PortalAlunaGuard><AlunaLessonPlayer /></PortalAlunaGuard>} />
              <Route path="/portal-aluna/suporte" element={<PortalAlunaGuard><AlunaSupport /></PortalAlunaGuard>} />
              <Route path="/portal-aluna/perfil" element={<PortalAlunaGuard><AlunaProfile /></PortalAlunaGuard>} />

              {/* Assinatura Pública de Contratos (PLAN-036) */}
              <Route path="/assinar/:signToken" element={<PublicSignPage />} />

              {/* Onboarding Público & Pré-cadastro (PLAN-064) */}
              <Route path="/onboarding/:token" element={<PublicOnboardingPage />} />
              <Route path="/pre-cadastro/:token" element={<PublicOnboardingPage />} />

              {/* Validação Criptográfica Pública (PLAN-061, PLAN-108 & PLAN-142) */}
              <Route path="/validar/certificado/:hash" element={<CertificateVerificationPage />} />
              <Route path="/validar-certificado/:hash" element={<CertificateVerificationPage />} />
              <Route path="/validar/:uuid" element={<PublicValidatePage />} />
              <Route path="/validar" element={<PublicValidatePage />} />
              <Route path="/validar-ingresso/:ticketToken" element={<PublicTicketValidatePage />} />
              <Route path="/validar-ingresso" element={<PublicTicketValidatePage />} />

              {/* Dossiê 360º Embed no Chatwoot (PLAN-154) */}
              <Route path="/portal-gestor/crm/dossier-embed" element={<DossierEmbedPage />} />
              <Route path="/crm/dossier-embed" element={<DossierEmbedPage />} />

              {/* Super-Cockpit 360º & Google Workspace Embed no Chatwoot (PLAN-166) */}
              <Route path="/crm-cockpit" element={<CRMCockpitSidebar />} />
              <Route path="/portal-gestor/crm/cockpit" element={<CRMCockpitSidebar />} />

              {/* Hidden & Bot Pages */}
              <Route path="/proposta-exclusiva" element={<Proposal />} />


              {/* Nexus Dashboard Routes (Stealth Mode) */}
              <Route path="/nexus">
                <Route index element={<NexusGatekeeper />} />
                <Route element={<RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPERADMIN]}><NexusLayout /></RoleGuard>}>
                  <Route path="home" element={<NexusHome />} />
                  <Route path="watchtower" element={<NexusWatchtower />} />
                  <Route path="war-room" element={<NexusWarRoom />} />
                  <Route path="barracks" element={<NexusBarracks />} />
                  <Route path="engine" element={<NexusEngineRoom />} />
                  <Route path="signal-tower" element={<NexusSignalTower />} />
                  <Route path="testing-hub" element={<NexusTestingHub />} />
                  <Route path="review-hub" element={<LicenciadaReviewHub />} />
                  <Route path="vault" element={<NexusVault />} />
                  <Route path="database" element={<NexusDatabase />} />
                  <Route path="ops" element={<NexusOps />} />
                  <Route path="ai-control" element={<NexusAIControl />} />
                  <Route path="scripts" element={<NexusScriptsManager />} />
                  <Route path="forensics" element={<NexusForensicsLab />} />
                  <Route path="alunas" element={<NexusAlunas />} />    {/* V68.1 */}
                </Route>
              </Route>

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <GlobalAudioPlayer />
          {!isSecureArea && <WhatsAppButton />}
          <ConsentModal />
          <NexusSignalListener />
          <NexusSignalDrawer />
          <CRMDevReadinessHUD />
          <PixelDebugHUD />
        </AudioProvider>
      </SignalProvider>
    </LicenciadaAuthProvider>
    </AlunaAuthProvider>
  )
}

export default App
