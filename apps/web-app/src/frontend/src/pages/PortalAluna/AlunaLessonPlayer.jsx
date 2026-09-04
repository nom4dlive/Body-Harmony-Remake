/**
 * AlunaLessonPlayer — V105
 * Player de vídeo premium para alunas.
 * V105: HLS error handling + fallback automático para stream.php (Safari/iPhone fix)
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useProgressQueue } from '../../hooks/useProgressQueue'
import styled from 'styled-components'
import Hls from 'hls.js'
import { ChevronLeft, Play, CheckCircle, RotateCcw, Clock, ShieldCheck, Bot, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AiNotebookEmbed from '../../components/AiNotebookEmbed'
import AlunaTermSignModal from './components/AlunaTermSignModal'

// ── Design Tokens (Stitch Cinema Mode) ──────────────────────────────────────────────────────────
const COLORS = {
  primary: '#051A29', // Deep Navy
  primaryDark: '#031019',
  secondary: '#ED7E13',
  surface: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.08)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  success: '#00B090', // Stitch Success
}

// ── Styled Components ──────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh; background: ${COLORS.primaryDark};
  font-family: 'Montserrat', sans-serif; color: #fff;
`

const Header = styled.header`
  padding: 1rem 1.5rem; background: rgba(5, 26, 41, 0.4);
  backdrop-filter: blur(12px); border-bottom: 1px solid ${COLORS.border};
  display: flex; align-items: center; gap: 0.75rem;
  position: sticky; top: 0; z-index: 50;
  
  a { 
    color: ${COLORS.textMuted}; text-decoration: none; font-size: 0.85rem; 
    display: flex; align-items: center; gap: 0.4rem;
    &:hover { color: #fff; }
  }
  span.sep { opacity: 0.3; }
  span.title { 
    color: #fff; font-size: 0.85rem; font-weight: 500; 
    max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    @media (min-width: 768px) { max-width: 500px; }
  }
`

const PlayerArea = styled.section`
  background: #000; width: 100%; position: relative;
  aspect-ratio: 16/9; max-height: 80vh;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);

  @media (max-width: 768px) {
    position: sticky;
    top: 50px;
    z-index: 40;
    max-height: 42vh;
  }

  @media (min-width: 1440px) { max-width: 1200px; margin: 2rem auto; border-radius: 1.5rem; overflow: hidden; }
`

const Video = styled.video`
  width: 100%; height: 100%; display: block;
`

const Iframe = styled.iframe`
  width: 100%; height: 100%; border: none; display: block;
`

const Content = styled.div`
  max-width: 960px; margin: 0 auto; padding: 2.5rem 1.5rem;
`

const Title = styled.h1`
  color: #fff;
  font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; 
  letter-spacing: -0.02em; line-height: 1.3;
  @media (min-width: 768px) { font-size: 2rem; }
`

const ActionRow = styled.div`
  display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;
  margin-top: 2rem; padding: 1.5rem; background: ${COLORS.surface};
  border: 1px solid ${COLORS.border}; border-radius: 1.25rem;
  backdrop-filter: blur(16px);
`

const ProgressBox = styled.div`
  flex: 1; min-width: 200px;
  .label { display: flex; justify-content: space-between; font-size: 0.8rem; color: ${COLORS.textMuted}; margin-bottom: 0.75rem; }
  .track { 
    height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; 
    .fill { height: 100%; background: ${COLORS.secondary}; transition: width 0.3s ease; }
  }
`

const MarkDoneBtn = styled.button`
  display: flex; align-items: center; gap: 0.75rem;
  background: ${p => p.$done ? 'rgba(0, 176, 144, 0.1)' : COLORS.secondary};
  color: ${p => p.$done ? COLORS.success : '#fff'};
  border: 1px solid ${p => p.$done ? 'rgba(0, 176, 144, 0.3)' : 'transparent'};
  padding: 1rem 1.75rem; border-radius: 1rem; font-size: 0.9rem; font-weight: 700;
  cursor: ${p => p.$done ? 'default' : 'pointer'};
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    ${p => !p.$done && `background: #f59a2e; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(237,126,19,0.3);`}
  }
`

const StatusPill = styled.div`
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.4rem 0.75rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 700;
  background: ${p => p.$type === 'saved' ? 'rgba(0, 176, 144, 0.1)' : 'rgba(255,255,255,0.05)'};
  color: ${p => p.$type === 'saved' ? COLORS.success : p.$type === 'saving' ? COLORS.secondary : COLORS.textMuted};
  border: 1px solid ${p => p.$type === 'saved' ? 'rgba(0, 176, 144, 0.2)' : COLORS.border};
`

// ── Component ──────────────────────────────────────────────────────────────
export default function AlunaLessonPlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [isHls, setIsHls] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [moduleId, setModuleId] = useState(null)
  const [syncStatus, setSyncStatus] = useState('idle')
  const [pendingTerm, setPendingTerm] = useState(null)
  
  const progressRef = useRef(0)
  const saveTimer = useRef(null)
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const hlsRetryCount = useRef(0)
  const { saveProgress: queuedSave } = useProgressQueue(id)

  // V105: Fallback para stream.php quando HLS falha
  const fallbackToStream = useCallback(async () => {
    try {
      console.warn('[FALLBACK] HLS failed, requesting stream.php signed URL...')
      const data = await api.aluna.signUrl(parseInt(id), true).catch(() => null)
      if (data?.url && !data.is_hls) {
        setIsHls(false)
        setVideoUrl(data.url)
        console.log('[FALLBACK] Switched to stream.php:', data.url)
      } else if (data?.url && data.is_hls) {
        console.warn('[FALLBACK] sign_url returned HLS again despite fallback=1 request')
      }
    } catch (e) {
      console.error('[FALLBACK] Could not recover:', e)
    }
  }, [id])

  useEffect(() => {
    return () => {
      if (hlsRef.current) hlsRef.current.destroy()
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.removeAttribute('src')
        videoRef.current.load()
      }
    }
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (String(e.detail?.lessonId) === String(id)) {
        setSyncStatus(e.detail.status)
        if (e.detail.status === 'saved') setTimeout(() => setSyncStatus('idle'), 3000)
      }
    }
    window.addEventListener('bh:progressSync', handler)
    return () => window.removeEventListener('bh:progressSync', handler)
  }, [id])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setIsHls(false)
        const signRes = await api.aluna.signUrl(parseInt(id)).catch(() => null)
        if (signRes?.url) {
          setVideoUrl(signRes.url)
          setIsHls(!!signRes.is_hls)
        }

        const mods = await api.aluna.getModules()
        for (const m of mods) {
          const lessonsRes = await api.aluna.getLessons(m.id)
          const found = lessonsRes?.lessons?.find(l => String(l.id) === String(id))
          if (found) {
            setLesson(found)
            setModuleId(m.id)
            if (lessonsRes?.has_pending_term && lessonsRes?.pending_term) {
              setPendingTerm(lessonsRes.pending_term)
            }
            setProgress(found.progress_percent || 0)
            setCompleted(found.is_completed || false)
            progressRef.current = found.progress_percent || 0
            if (!signRes?.url && found.video_ref) {
              setVideoUrl(found.video_ref)
              if (found.video_ref.endsWith('.m3u8')) setIsHls(true)
            }
            break
          }
        }
      } catch {
        navigate('/portal-aluna/dashboard', { replace: true })
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [id])

  useEffect(() => {
    if (loading || !videoUrl || !isHls || !videoRef.current) return
    hlsRetryCount.current = 0
    let mediaRetryCount = 0
    let hls = null
    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        enableWorker: true,
        backBufferLength: 10
      })
      hlsRef.current = hls
      hls.loadSource(videoUrl)
      hls.attachMedia(videoRef.current)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[HLS] Manifest parsed successfully')
      })
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (hlsRetryCount.current >= 3) {
                console.error('[HLS] Exceeded retry limit, falling back to stream.php')
                hls.destroy()
                hlsRef.current = null
                fallbackToStream()
              } else {
                hlsRetryCount.current += 1
                console.error(`[HLS] Fatal network error, trying recovery (attempt ${hlsRetryCount.current})...`)
                hls.startLoad()
              }
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              if (mediaRetryCount >= 3) {
                console.error('[HLS] Exceeded media recovery limit, falling back to stream.php')
                hls.destroy()
                hlsRef.current = null
                fallbackToStream()
              } else {
                mediaRetryCount += 1
                console.error(`[HLS] Fatal media error, trying recovery (attempt ${mediaRetryCount})...`)
                hls.recoverMediaError()
              }
              break
            default:
              console.error('[HLS] Fatal error, falling back to stream.php')
              hls.destroy()
              hlsRef.current = null
              fallbackToStream()
              break
          }
        }
      })
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      videoRef.current.src = videoUrl
      videoRef.current.addEventListener('error', () => {
        console.error('[HLS] Safari native error, falling back to stream.php')
        fallbackToStream()
      })
    }
    return () => { if (hls) hls.destroy() }
  }, [videoUrl, isHls, loading, fallbackToStream])

  const saveProgress = useCallback((pct, isCompleted = false) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => queuedSave(pct, isCompleted), 5000)
  }, [id, queuedSave])

  const handleTimeUpdate = (e) => {
    const video = e.target
    if (!video.duration) return
    const pct = Math.round((video.currentTime / video.duration) * 100)
    if (pct > progressRef.current) {
      progressRef.current = pct
      setProgress(pct)
      if (pct >= 85 && !completed) {
        setCompleted(true)
        saveProgress(pct, true)
      } else {
        saveProgress(pct)
      }
    }
  }

  const [showAiAssistant, setShowAiAssistant] = useState(false)

  const handleSeekVideo = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds
      videoRef.current.play()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading) return <Page style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity }}>Carregando experiência...</motion.div></Page>
  if (!lesson) return null

  const isInternalRender = videoUrl && (videoUrl.includes('/api/lms/stream.php') || isHls)

  return (
    <Page>
      <Header>
        <Link to={moduleId ? `/portal-aluna/curso/${moduleId}` : '/portal-aluna/dashboard'}>
          <ChevronLeft size={18}/> Voltar
        </Link>
        <span className="sep">/</span>
        <span className="title">{lesson.title}</span>
      </Header>

      <PlayerArea>
        {isInternalRender ? (
          <Video
            ref={videoRef}
            src={!isHls ? videoUrl : undefined}
            controls
            playsInline
            onTimeUpdate={handleTimeUpdate}
            controlsList="nodownload"
            autoPlay
          />
        ) : videoUrl ? (
          <Iframe src={videoUrl} allowFullScreen allow="autoplay; encrypted-media" />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: COLORS.textMuted }}>
            Vídeo indisponível no momento
          </div>
        )}
      </PlayerArea>

      <Content>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Title>{lesson.title}</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: COLORS.textMuted, fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16}/> {Math.round((lesson.duration_seconds || 0) / 60)} minutos</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ShieldCheck size={16}/> Conteúdo Protegido</span>
          </div>

          <ActionRow>
            <ProgressBox>
              <div className="label">
                <span>Progresso da Aula</span>
                <span>{progress}%</span>
              </div>
              <div className="track">
                <div className="fill" style={{ width: `${progress}%` }} />
              </div>
            </ProgressBox>

            <MarkDoneBtn $done={completed} onClick={() => !completed && (setCompleted(true), setProgress(100), queuedSave(100, true))}>
              {completed ? <><CheckCircle size={20}/> Concluída</> : 'Marcar como concluída'}
            </MarkDoneBtn>

            <AnimatePresence>
              {syncStatus !== 'idle' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <StatusPill $type={syncStatus}>
                    {syncStatus === 'saving' ? 'Sincronizando...' : syncStatus === 'saved' ? 'Salvo no Nexus' : 'Aguardando Conexão'}
                  </StatusPill>
                </motion.div>
              )}
            </AnimatePresence>
          </ActionRow>

          {/* Central Pedagógica & Dra. Harmony AI (Player Híbrido) */}
          <div style={{ marginTop: '2rem', background: 'linear-gradient(135deg, rgba(10, 62, 96, 0.5) 0%, rgba(5, 26, 41, 0.9) 100%)', border: '1px solid rgba(237, 126, 19, 0.35)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(237, 126, 19, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ED7E13', fontSize: '1.2rem' }}>
                  <Bot size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Dra. Harmony AI <Sparkles size={14} style={{ color: '#ED7E13' }} />
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
                    Tutora Clínica & Central Pedagógica da Aula (clique nas minutagens para saltar o vídeo).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAiAssistant(prev => !prev)}
                style={{ background: showAiAssistant ? 'rgba(237, 126, 19, 0.2)' : 'linear-gradient(135deg, #ED7E13 0%, #D96E0E 100%)', border: showAiAssistant ? '1px solid #ED7E13' : 'none', color: '#FFFFFF', padding: '0.55rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease' }}
              >
                <Bot size={16} /> {showAiAssistant ? 'Ocultar Tutora' : 'Tirar Dúvida Desta Aula'}
              </button>
            </div>

            {showAiAssistant && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: '0.5rem' }}
              >
                <AiNotebookEmbed
                  moduleId={lesson.module_id || moduleId || 1}
                  moduleTitle={lesson.title}
                  onSeek={handleSeekVideo}
                />
              </motion.div>
            )}
          </div>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
             <Link to={moduleId ? `/portal-aluna/curso/${moduleId}` : '/portal-aluna/dashboard'} style={{ color: COLORS.secondary, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
               <RotateCcw size={18} /> Ver todas as aulas do módulo
             </Link>
          </div>
        </motion.div>
      </Content>

      {pendingTerm && (
        <AlunaTermSignModal
          isOpen={!!pendingTerm}
          term={pendingTerm}
          onSigned={() => {
            setPendingTerm(null)
            window.location.reload()
          }}
          onClose={() => {
            navigate('/portal-aluna/dashboard')
          }}
        />
      )}
    </Page>
  )
}
