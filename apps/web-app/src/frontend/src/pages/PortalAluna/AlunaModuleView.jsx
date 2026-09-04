import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAlunaAuth } from '../../context/AlunaAuthContext'
import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import { ChevronLeft, Play, Lock, Clock, CheckCircle, MessageCircle } from 'lucide-react'
import AlunaHeader from '../../components/PortalAluna/AlunaHeader'

// ── Animations ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`

// ── Design Tokens (Stitch Cinema Mode) ──────────────────────────────────────────────────────────
const COLORS = {
  primary: '#051A29', // Deep Navy
  primaryLight: 'rgba(10, 62, 96, 0.6)',
  secondary: '#ED7E13',
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceHover: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.08)',
}

// ── Styled Components ──────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh; background: ${COLORS.primary};
  font-family: 'Montserrat', sans-serif; color: #fff;
  padding-bottom: 3rem;
`

const Breadcrumb = styled.div`
  display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;
  a { 
    color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.85rem; 
    display: flex; align-items: center; gap: 0.4rem;
    &:hover { color: #fff; }
  }
  span { opacity: 0.5; font-size: 0.85rem; }
`

const Hero = styled.div`
  padding: 3rem 1.5rem 2rem;
  max-width: 900px; margin: 0 auto;
  @media (min-width: 768px) { padding: 4rem 2rem 3rem; }
`

const ModuleTitle = styled.h1`
  color: #fff;
  font-size: 1.8rem; font-weight: 800; margin: 0 0 0.75rem; 
  letter-spacing: -0.02em; line-height: 1.2;
  @media (min-width: 768px) { font-size: 2.5rem; }
`

const Meta = styled.div`
  display: flex; align-items: center; gap: 1.5rem;
  color: rgba(255,255,255,0.5); font-size: 0.9rem;
  div { display: flex; align-items: center; gap: 0.5rem; }
`

const Main = styled.main`
  max-width: 900px; margin: 0 auto; padding: 0 1.5rem;
`

const LessonList = styled.div`
  display: flex; flex-direction: column; gap: 0.75rem;
  margin-top: 2rem;
`

const LessonItem = styled(motion.div)`
  background: ${p => p.$locked ? 'rgba(0,0,0,0.2)' : COLORS.surface};
  border: 1px solid ${p => p.$locked ? 'rgba(255,255,255,0.04)' : COLORS.border};
  backdrop-filter: blur(16px);
  border-radius: 1.25rem; overflow: hidden;
  transition: all 0.2s;
  opacity: ${p => p.$locked ? 0.7 : 1};

  &:hover {
    background: ${p => p.$locked ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.07)'};
    border-color: ${p => p.$locked ? 'rgba(255,255,255,0.04)' : 'rgba(237,126,19,0.4)'};
  }
`

const LessonLink = styled(Link)`
  display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem;
  text-decoration: none; color: #ffffff;
  pointer-events: ${p => p.$disabled ? 'none' : 'auto'};
`

const IconBox = styled.div`
  width: 48px; height: 48px; border-radius: 1rem; flex-shrink: 0;
  background: ${p => p.$done ? 'rgba(0, 176, 144, 0.1)' : p.$locked ? 'rgba(255,255,255,0.05)' : 'rgba(237,126,19,0.1)'};
  border: 1px solid ${p => p.$done ? 'rgba(0, 176, 144, 0.3)' : p.$locked ? 'rgba(255,255,255,0.1)' : 'rgba(237,126,19,0.3)'};
  display: flex; align-items: center; justify-content: center;
  color: ${p => p.$done ? '#00B090' : p.$locked ? 'rgba(255,255,255,0.3)' : COLORS.secondary};
`

const LessonInfo = styled.div`
  flex: 1;
  h3 { color: #ffffff; font-size: 1rem; font-weight: 600; margin: 0 0 0.25rem; line-height: 1.4; }
  span { font-size: 0.8rem; color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 0.4rem; }
`

const LockedOverlay = styled.div`
  background: rgba(0,0,0,0.4); backdrop-filter: blur(8px);
  padding: 2.5rem 2rem; border-radius: 1.5rem; text-align: center;
  border: 1px solid rgba(255,255,255,0.05); margin-top: 2rem;
  
  h2 { font-size: 1.5rem; margin-bottom: 1rem; font-family: 'Montserrat', sans-serif; }
  p { color: rgba(255,255,255,0.6); margin-bottom: 2rem; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto; }
`

const WhatsAppBtn = styled.a`
  display: inline-flex; align-items: center; gap: 0.75rem;
  background: #25D366; color: #fff; text-decoration: none;
  padding: 1rem 2rem; border-radius: 1rem; font-weight: 700;
  transition: all 0.2s;
  &:hover { background: #20ba5a; transform: translateY(-2px); }
`

// ── Skeleton ──────────────────────────────────────────────────────────────
const SkeletonLine = styled.div`
  height: 80px; border-radius: 1.25rem; background: ${COLORS.surface};
  margin-bottom: 0.75rem; opacity: 0.5;
`

export default function AlunaModuleView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { aluna } = useAlunaAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.aluna.getLessons(id)
      .then(res => {
        if (!res?.module) throw new Error('Not found')
        setData(res)
      })
      .catch(() => navigate('/portal-aluna/dashboard', { replace: true }))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <Page>
      <AlunaHeader />
      <Main style={{ paddingTop: '4rem' }}>
        <Breadcrumb><Link to="/portal-aluna/dashboard"><ChevronLeft size={18}/> Voltar</Link></Breadcrumb>
        {[1,2,3,4,5].map(i => <SkeletonLine key={i} />)}
      </Main>
    </Page>
  )

  if (!data?.module) {
    return (
      <Page>
        <AlunaHeader />
        <Main style={{ paddingTop: '8rem', textAlign: 'center' }}>
          <ModuleTitle>Conteúdo Indisponível</ModuleTitle>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
            Não foi possível carregar as aulas deste módulo. Verifique sua conexão ou acesso.
          </p>
          <Link to="/portal-aluna/dashboard" style={{ color: COLORS.secondary, textDecoration: 'none', fontWeight: 700 }}>
            <ChevronLeft size={18} style={{ verticalAlign: 'middle' }} /> Voltar para o Painel
          </Link>
        </Main>
      </Page>
    )
  }

  const { module: mod, lessons, locked } = data

  return (
    <Page>
      <AlunaHeader />

      <Hero>
        <Breadcrumb>
          <Link to="/portal-aluna/dashboard"><ChevronLeft size={18}/> Voltar</Link>
          <span>/</span>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{mod?.title}</span>
        </Breadcrumb>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ModuleTitle>{mod?.title}</ModuleTitle>
          <Meta>
            <div><Play size={14} fill="currentColor"/> {lessons?.length} aulas</div>
            <div><Clock size={14}/> {Math.round(lessons?.reduce((acc, l) => acc + (l.duration_seconds || 0), 0) / 60)} min total</div>
          </Meta>
        </motion.div>
      </Hero>

      <Main>
        <LessonList>
          {lessons?.map((l, i) => (
            <LessonItem 
              key={l.id} 
              $locked={locked}
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <LessonLink 
                to={locked ? '#' : `/portal-aluna/aula/${l.id}`} 
                $disabled={locked}
              >
                <IconBox $done={l.is_completed} $locked={locked}>
                  {l.is_completed ? <CheckCircle size={20} /> : locked ? <Lock size={18} /> : <Play size={18} fill="currentColor" />}
                </IconBox>
                <LessonInfo>
                  <h3>{l.title}</h3>
                  <span>
                    <Clock size={12} /> {Math.round((l.duration_seconds || 0) / 60)} min
                    {l.is_completed && <em style={{ color: '#00B090', fontStyle: 'normal', marginLeft: 'auto' }}>Concluído</em>}
                  </span>
                </LessonInfo>
              </LessonLink>
            </LessonItem>
          ))}
        </LessonList>

        {locked && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <LockedOverlay>
              <Lock size={48} style={{ color: COLORS.secondary, marginBottom: '1.5rem', opacity: 0.6 }} />
              <h2>Conteúdo Exclusivo</h2>
              <p>Este curso premium ainda não está disponível na sua conta. Confirme o pagamento e solicite a liberação ao gestor via WhatsApp.</p>
              <WhatsAppBtn 
                href={`https://wa.me/5518996356825?text=${encodeURIComponent(`Olá! Gostaria de solicitar a liberação do módulo exclusivo ${mod?.title} no meu portal de aluna (CPF: ${aluna?.cpf || 'não informado'}).`)}`} 
                target="_blank"
              >
                <MessageCircle size={20} fill="currentColor" /> Solicitar Liberação via WhatsApp
              </WhatsAppBtn>
            </LockedOverlay>
          </motion.div>
        )}
      </Main>
    </Page>
  )
}
