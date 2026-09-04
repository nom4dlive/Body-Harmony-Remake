import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAlunaAuth } from '../../context/AlunaAuthContext'
import { api } from '../../services/api'
import styled, { keyframes, css } from 'styled-components'
import { 
  User, LogOut, BookOpen, CheckCircle, TrendingUp, 
  ShoppingBag, MessageCircle, ArrowRight, Play, Lock, ChevronRight, FileText, AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AlunaHeader from '../../components/PortalAluna/AlunaHeader'
import SafeThumbnail from '../../components/SafeThumbnail'
import AlunaTermSignModal from './components/AlunaTermSignModal'
// ── Animations ──────────────────────────────────────────────────────────────
const shimmer = keyframes`0%{background-position:-200% 0}100%{background-position:200% 0}`

// ── Design Tokens (Stitch Cinema Mode) ────────────────────────────────────────────────
const COLORS = {
  primary: '#051A29', // Deep Navy
  primaryLight: 'rgba(10, 62, 96, 0.6)',
  secondary: '#ED7E13',
  secondaryLight: '#F59A2E',
  surface: 'rgba(255, 255, 255, 0.03)', // Glassmorphism
  surfaceHover: 'rgba(255, 255, 255, 0.08)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  textDim: 'rgba(255, 255, 255, 0.3)',
  success: '#00B090', // Stitch Success Token
  border: 'rgba(255, 255, 255, 0.08)',
}

// ── Styled Components ──────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh; background: ${COLORS.primary};
  font-family: 'Poppins', sans-serif; color: ${COLORS.text};
  padding-bottom: 80px; // Space for mobile nav
  @media (min-width: 768px) { padding-bottom: 2rem; }
`



const Main = styled.main`
  max-width: 1200px; margin: 0 auto;
  padding: 1.5rem 1.25rem;
  @media (min-width: 768px) { padding: 3rem 2rem; }
`

const WelcomeHero = styled.div`
  margin-bottom: 2.5rem;
  h1 { 
    font-family: 'Montserrat', sans-serif;
    font-size: 1.5rem; font-weight: 700; margin: 0 0 0.5rem; 
    letter-spacing: -0.02em;
    @media (min-width: 768px) { font-size: 2.2rem; }
  }
  p { color: ${COLORS.textMuted}; font-size: 0.95rem; }
`

const TabsContainer = styled.div`
  display: flex; gap: 1.5rem; margin-bottom: 2rem;
  border-bottom: 1px solid ${COLORS.border};
  position: sticky; top: 72px; background: ${COLORS.primary}; z-index: 40;
  padding-top: 0.5rem;
`

const TabBtn = styled.button`
  background: none; border: none; color: ${p => p.$active ? COLORS.secondary : COLORS.textMuted};
  padding: 1rem 0.5rem; font-size: 0.9rem; font-weight: 600; cursor: pointer;
  position: relative; transition: color 0.2s;
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase; letter-spacing: 0.05em;

  &::after {
    content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
    height: 2px; background: ${COLORS.secondary};
    transform: scaleX(${p => p.$active ? 1 : 0});
    transition: transform 0.3s ease;
  }

  &:hover { color: ${p => p.$active ? COLORS.secondary : COLORS.text}; }
`

const Grid = styled(motion.div)`
  display: grid; gap: 1.5rem;
  grid-template-columns: 1fr;
  @media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 1024px) { grid-template-columns: repeat(3, 1fr); }
`

const Card = styled(motion.div)`
  background: ${COLORS.surface}; border: 1px solid ${COLORS.border};
  backdrop-filter: blur(16px);
  border-radius: 1.25rem; overflow: hidden; position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column;

  &:hover {
    background: ${COLORS.surfaceHover};
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }
`

const CardThumb = styled.div`
  aspect-ratio: 16/9; position: relative; overflow: hidden;
  background: ${COLORS.primaryLight};
  img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
  ${Card}:hover & img { transform: scale(1.05); }
`

const Badge = styled.div`
  position: absolute; top: 12px; left: 12px;
  padding: 0.4rem 0.75rem; border-radius: 2rem;
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; backdrop-filter: blur(8px);
  background: ${p => p.$type === 'locked' ? 'rgba(0,0,0,0.6)' : 'rgba(237,126,19,0.9)'};
  color: #fff; border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; gap: 5px;
`

const CardBody = styled.div`
  padding: 1.25rem; flex-grow: 1; display: flex; flex-direction: column;
  h3 { color: ${COLORS.text}; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; line-height: 1.3; font-family: 'Montserrat', sans-serif; }
  p { font-size: 0.85rem; color: ${COLORS.textMuted}; line-height: 1.5; margin-bottom: 1.25rem; flex-grow: 1; }
`

const CardFooter = styled.div`
  padding-top: 1rem; border-top: 1px solid ${COLORS.border};
  display: flex; align-items: center; justify-content: space-between;
`

const ActionBtn = styled(Link)`
  display: flex; align-items: center; gap: 0.5rem;
  background: ${p => p.$primary ? COLORS.secondary : 'transparent'};
  color: #fff; text-decoration: none; font-size: 0.85rem; font-weight: 700;
  padding: 0.75rem 1.25rem; border-radius: 0.75rem;
  border: 1px solid ${p => p.$primary ? COLORS.secondary : COLORS.border};
  transition: all 0.2s;
  
  &:hover {
    background: ${p => p.$primary ? COLORS.secondaryLight : 'rgba(255,255,255,0.05)'};
    gap: 0.75rem;
  }
`

const WhatsAppBtn = styled.a`
  display: flex; align-items: center; justify-content: center; gap: 0.6rem;
  width: 100%; background: #25D366; color: #fff;
  text-decoration: none; font-size: 0.9rem; font-weight: 700;
  padding: 0.85rem; border-radius: 0.75rem; transition: all 0.2s;
  margin-top: 1rem;

  &:hover { background: #20ba5a; transform: scale(1.02); }
`

const ProgressBox = styled.div`
  width: 100%; margin-bottom: 1rem;
  .bar { 
    height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 0.4rem;
    .fill { height: 100%; background: ${COLORS.secondary}; transition: width 0.5s ease; }
  }
  .label { display: flex; justify-content: space-between; font-size: 0.75rem; color: ${COLORS.textMuted}; }
`

// ── Mobile Navigation ──────────────────────────────────────────────────────
const MobileNav = styled.nav`
  position: fixed; bottom: 0; left: 0; right: 0;
  height: 72px; background: rgba(10, 62, 96, 0.95); backdrop-filter: blur(12px);
  border-top: 1px solid ${COLORS.border};
  display: flex; align-items: center; justify-content: space-around;
  padding: 0 1rem; z-index: 100;
  @media (min-width: 768px) { display: none; }
`

const NavItem = styled.button`
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: none; border: none; color: ${p => p.$active ? COLORS.secondary : COLORS.textMuted};
  font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
  svg { size: 20px; }
`

// ── Skeletons ──────────────────────────────────────────────────────────────
const SkeletonCard = styled.div`
  height: 320px; border-radius: 1.25rem;
  background: linear-gradient(90deg, ${COLORS.surface} 25%, ${COLORS.surfaceHover} 50%, ${COLORS.surface} 75%);
  background-size: 200% 100%; animation: ${shimmer} 1.5s infinite;
`

const PendingTermsBanner = styled.div`
  background: linear-gradient(135deg, rgba(237, 126, 19, 0.15) 0%, rgba(217, 110, 14, 0.25) 100%);
  border: 1px solid #ED7E13;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;

  .info {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .icon {
      color: #ED7E13;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    h4 {
      margin: 0;
      color: #FFFFFF;
      font-size: 0.95rem;
      font-weight: 700;
    }

    p {
      margin: 2px 0 0 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.8rem;
    }
  }

  button {
    background: #ED7E13;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
      background: #d96e0e;
      transform: translateY(-1px);
    }
  }
`

// ── Component ──────────────────────────────────────────────────────────────
export default function AlunaDashboard() {
  const { aluna, logout } = useAlunaAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Read tab from query string or default to 'mine'
  const queryParams = new URLSearchParams(location.search)
  const initialTab = queryParams.get('tab') === 'catalog' ? 'catalog' : 'mine'
  
  const [activeTab, setActiveTab] = useState(initialTab) // 'mine' | 'catalog'
  const [modules, setModules] = useState([])
  const [catalog, setCatalog] = useState([])
  const [pendingTerms, setPendingTerms] = useState([])
  const [activeSignTerm, setActiveSignTerm] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentQueryTab = queryParams.get('tab') === 'catalog' ? 'catalog' : 'mine'
    if (activeTab !== currentQueryTab) {
      setActiveTab(currentQueryTab)
    }
  }, [location.search])

  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData() {
    setLoading(true)
    try {
      if (activeTab === 'mine') {
        const [modsData, pendingData] = await Promise.all([
          api.aluna.getModules().catch(() => []),
          api.aluna.getPendingTerms().catch(() => [])
        ])
        setModules(Array.isArray(modsData) ? modsData : [])
        setPendingTerms(Array.isArray(pendingData) ? pendingData : [])
      } else {
        const data = await api.aluna.getCatalog()
        setCatalog(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Load error', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/portal-aluna', { replace: true }) }
  const firstName = aluna?.name?.split(' ')[0] || 'Aluna'

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <Page>
      <AlunaHeader />

      <Main>
        <WelcomeHero>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {activeTab === 'mine' ? `Bem-vinda, ${firstName} ✨` : 'Explore novos cursos'}
          </motion.h1>
          <p>
            {activeTab === 'mine' 
              ? 'Continue sua jornada de transformação hoje mesmo.' 
              : 'Descubra especializações premium para elevar sua carreira.'}
          </p>
        </WelcomeHero>

        {activeTab === 'mine' && pendingTerms.length > 0 && (
          <PendingTermsBanner>
            <div className="info">
              <FileText className="icon" size={28} />
              <div>
                <h4>Você possui {pendingTerms.length} termo(s) pendente(s) de assinatura</h4>
                <p>
                  Assine eletronicamente para liberar o acesso imediato às aulas dos seus cursos adquiridos.
                </p>
              </div>
            </div>
            <button onClick={() => setActiveSignTerm(pendingTerms[0])}>
              <FileText size={16} /> Assinar Termo ({pendingTerms[0].module_title || 'Curso'})
            </button>
          </PendingTermsBanner>
        )}

        <TabsContainer>
          <TabBtn $active={activeTab === 'mine'} onClick={() => { setActiveTab('mine'); navigate('/portal-aluna/dashboard') }}>
            Meus Cursos
          </TabBtn>
          <TabBtn $active={activeTab === 'catalog'} onClick={() => { setActiveTab('catalog'); navigate('/portal-aluna/dashboard?tab=catalog') }}>
            Catálogo
          </TabBtn>
        </TabsContainer>

        <AnimatePresence mode="wait">
          {loading ? (
            <Grid key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </Grid>
          ) : activeTab === 'mine' ? (
            <Grid 
              key="mine" 
              variants={containerVariants} 
              initial="hidden" 
              animate="show"
            >
              {modules.length > 0 ? modules.map(m => (
                <Card key={m.id} variants={itemVariants}>
                  <CardThumb>
                    <SafeThumbnail 
                      src={m.thumbnail_url ? `${import.meta.env.VITE_API_BASE || '/api'}/v1/lms/thumbnail/${m.thumbnail_url}` : null} 
                      title={m.title} 
                      moduleId={m.id}
                      videoUrl={m.video_url}
                    />
                    <Badge>Ativo</Badge>
                  </CardThumb>
                  <CardBody>
                    <h3>{m.title}</h3>
                    <p>{m.description}</p>
                    <ProgressBox>
                      <div className="bar">
                        <div className="fill" style={{ width: `${m.progress_percent}%` }} />
                      </div>
                      <div className="label">
                        <span>{m.progress_percent}% Concluído</span>
                        <span>{m.completed_lessons}/{m.total_lessons} aulas</span>
                      </div>
                    </ProgressBox>
                    <CardFooter>
                      <ActionBtn to={`/portal-aluna/curso/${m.id}`} $primary>
                        Continuar <Play size={16} fill="currentColor" />
                      </ActionBtn>
                    </CardFooter>
                  </CardBody>
                </Card>
              )) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0' }}>
                  <BookOpen size={48} style={{ color: COLORS.textDim, marginBottom: '1rem' }} />
                  <p>Você ainda não possui cursos ativos.</p>
                  <button 
                    onClick={() => setActiveTab('catalog')} 
                    style={{ background: COLORS.secondary, border: 'none', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', marginTop: '1rem', cursor: 'pointer' }}
                  >
                    Ver Catálogo
                  </button>
                </motion.div>
              )}
            </Grid>
          ) : (
            <Grid 
              key="catalog" 
              variants={containerVariants} 
              initial="hidden" 
              animate="show"
            >
              {catalog.map(m => (
                <Card key={m.id} variants={itemVariants}>
                  <CardThumb>
                    <SafeThumbnail 
                      src={m.thumbnail_url ? `${import.meta.env.VITE_API_BASE || '/api'}/v1/lms/thumbnail/${m.thumbnail_url}` : null} 
                      title={m.title} 
                      moduleId={m.id}
                      videoUrl={m.video_url}
                    />
                    {m.has_access ? (
                      <Badge>Adquirido</Badge>
                    ) : (
                      <Badge $type="locked"><Lock size={12} /> Exclusivo</Badge>
                    )}
                  </CardThumb>
                  <CardBody>
                    <h3>{m.title}</h3>
                    <p>{m.description}</p>
                    {m.has_access ? (
                      <ActionBtn to={`/portal-aluna/curso/${m.id}`} $primary>
                        Acessar Agora <ChevronRight size={18} />
                      </ActionBtn>
                    ) : (
                      <>
                        <ActionBtn to={`/portal-aluna/curso/${m.id}`}>
                          Ver Conteúdo <ArrowRight size={16} />
                        </ActionBtn>
                        <WhatsAppBtn 
                          href={`https://wa.me/5518996356825?text=${encodeURIComponent(`Olá! Tenho interesse no módulo exclusivo "${m.title}" e gostaria de solicitar o acesso. CPF: ${aluna?.cpf || 'não informado'}.`)}`} 
                          target="_blank"
                        >
                          <MessageCircle size={18} fill="currentColor" /> Solicitar Acesso
                        </WhatsAppBtn>
                      </>
                    )}
                  </CardBody>
                </Card>
              ))}
            </Grid>
          )}
        </AnimatePresence>
      </Main>

      <MobileNav>
        <NavItem $active={activeTab === 'mine'} onClick={() => { setActiveTab('mine'); navigate('/portal-aluna/dashboard') }}>
          <BookOpen size={20} />
          <span>Cursos</span>
        </NavItem>
        <NavItem $active={activeTab === 'catalog'} onClick={() => { setActiveTab('catalog'); navigate('/portal-aluna/dashboard?tab=catalog') }}>
          <ShoppingBag size={20} />
          <span>Loja</span>
        </NavItem>
        <NavItem onClick={() => navigate('/portal-aluna/perfil')}>
          <User size={20} />
          <span>Perfil</span>
        </NavItem>
        <NavItem onClick={handleLogout}>
          <LogOut size={20} />
          <span>Sair</span>
        </NavItem>
      </MobileNav>

      {activeSignTerm && (
        <AlunaTermSignModal
          isOpen={!!activeSignTerm}
          term={activeSignTerm}
          onSigned={() => {
            setActiveSignTerm(null)
            loadData()
          }}
          onClose={() => {
            setActiveSignTerm(null)
          }}
        />
      )}
    </Page>
  )
}
