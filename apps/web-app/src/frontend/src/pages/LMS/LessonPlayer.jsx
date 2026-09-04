import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { VideoPlayerWrapper } from './components/VideoPlayerWrapper'
import { LessonList } from './components/LessonList'
import { AttachmentList } from './components/AttachmentList'
import { FaChevronLeft, FaList, FaDownload, FaTimes, FaSpinner } from 'react-icons/fa'
import { ROUTES } from '../../config/routes'

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.darkBg};
  color: ${({ theme }) => theme.colors.darkText};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const TopBar = styled.div`
  background: rgba(5, 26, 41, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  padding: 0.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  border-bottom: 1px solid ${({ theme }) => theme.colors.glassBorder};

  .left, .right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  button.back {
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.darkTextMuted};
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    transition: all 0.3s;
    
    &:hover { 
      color: #FFFFFF;
      background: rgba(255,255,255,0.05); 
    }
  }
  
  h2 { 
    font-size: 0.9rem; 
    margin: 0; 
    color: ${({ theme }) => theme.colors.secondary};
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: ${({ theme }) => theme.fonts.heading};
  }
`

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr ${({ $isCollapsed }) => $isCollapsed ? '0px' : '380px'};
  flex: 1;
  height: calc(100vh - 56px);
  transition: grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: #000; // Deep black for player area
  
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    overflow-y: auto;
    height: auto;
  }
`

const ContentArea = styled.div`
  background: #000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  
  .player-wrapper {
    width: 100%;
    background: #000;
    /* Maintain 16:9 ratio in the player area if needed, or fill height */
    position: sticky;
    top: 0;
    z-index: 5;
  }

  .lesson-info {
    padding: 3rem;
    background: ${({ theme }) => theme.colors.darkBg};
    flex: 1;
    
    h1 {
      font-size: 2.2rem;
      font-family: ${({ theme }) => theme.fonts.heading};
      color: #FFFFFF;
      margin-bottom: 1rem;
      text-transform: uppercase;
    }
    
    p.desc {
      color: ${({ theme }) => theme.colors.darkTextMuted};
      line-height: 1.8;
      font-size: 1.1rem;
      max-width: 800px;
      margin-bottom: 3rem;
    }
  }
`

const Sidebar = styled.div`
  background: ${({ theme }) => theme.colors.darkSurface};
  border-left: 1px solid ${({ theme }) => theme.colors.glassBorder};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  visibility: ${({ $isCollapsed }) => $isCollapsed ? 'hidden' : 'visible'};
  opacity: ${({ $isCollapsed }) => $isCollapsed ? 0 : 1};
  transition: all 0.3s;

  @media (max-width: 1100px) {
    border-left: none;
    border-top: 1px solid ${({ theme }) => theme.colors.glassBorder};
    height: 500px;
  }

  .header {
     padding: 1.5rem 2rem;
     font-weight: 700;
     color: #FFFFFF;
     border-bottom: 1px solid rgba(255,255,255,0.05);
     display: flex;
     align-items: center;
     justify-content: space-between;
     
     .title {
       display: flex;
       align-items: center;
       gap: 0.75rem;
       font-family: ${({ theme }) => theme.fonts.heading};
       letter-spacing: 1px;
     }

     button {
       background: transparent;
       border: none;
       color: rgba(255,255,255,0.3);
       cursor: pointer;
       &:hover { color: white; }
     }
  }
  
  .list {
     flex: 1;
     overflow-y: auto;
     padding: 1rem;
  }
`

const AttachmentCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  max-width: 400px;
  
  .info {
     display: flex;
     align-items: center;
     gap: 1rem;
     color: #FFFFFF;
     font-weight: 500;
     
     svg { color: ${({ theme }) => theme.colors.secondary}; }
  }
  
  button {
     background: ${({ theme }) => theme.colors.secondary};
     color: white;
     border: none;
     padding: 0.5rem 1rem;
     border-radius: 6px;
     cursor: pointer;
     font-size: 0.85rem;
     font-weight: 600;
     transition: all 0.3s;
     
     &:hover { background: #FF9124; }
  }
`

import QuizRunner from './components/QuizRunner';

export default function LessonPlayer() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const playerRef = useRef(null)

  const [moduleId, setModuleId] = useState(location.state?.moduleId || null)
  const [moduleData, setModuleData] = useState(null)

  // Content State
  const [currentLesson, setCurrentLesson] = useState(null)
  const [viewMode, setViewMode] = useState('lesson') // 'lesson' | 'quiz'

  const [loading, setLoading] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [streamUrl, setStreamUrl] = useState(null);

  useEffect(() => {
    const fetchStreamUrl = async () => {
      if (!currentLesson || currentLesson.video_type !== 'hostinger') {
        setStreamUrl(currentLesson?.video_ref || '');
        return;
      }

      try {
        const res = await api.signLmsUrl(currentLesson.id);
        setStreamUrl(res.url);
      } catch (e) {
        console.error("Failed to sign URL", e);
        setStreamUrl('');
      }
    };

    fetchStreamUrl();
  }, [currentLesson]);

  useEffect(() => {
    const loadContext = async () => {
      try {
        let targetModuleId = moduleId;

        // Auto-detect module if context is missing
        if (!targetModuleId) {
          const allModules = await api.getLmsContent()
          for (const m of allModules) {
            const details = await api.getLmsContent(m.id);
            if (details.lessons?.find(l => String(l.id) === String(id))) {
              targetModuleId = m.id;
              setModuleId(m.id);
              break;
            }
          }
        }

        if (!targetModuleId) targetModuleId = 1;

        const res = await api.getLmsContent(targetModuleId)
        setModuleData(res)

        // Logic check: Are we trying to view a lesson or just entered the module?
        // If ID is set, try to find lesson.
        const found = res.lessons.find(l => String(l.id) === String(id))
        if (found) {
          setCurrentLesson(found)
          setViewMode('lesson')
        } else {
          // Check if it's a "quiz" route or just fallback?
          // For now fallback to first lesson
          if (res.lessons.length > 0) {
            setCurrentLesson(res.lessons[0])
            setViewMode('lesson')
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadContext()
  }, [id, moduleId])

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson)
    setViewMode('lesson')
    // Update URL without full reload if possible, or just navigate
    // navigate(`${ROUTES.LMS_LESSON}/${lesson.id}`, { state: { moduleId } })
    // Since we are inside the same module, we can just setState, but URL update is good for history.
    // But if we use navigate, it triggers useEffect re-load.
    // Optimization: replace URL silently or let useEffect handle it.
    // For simplicity, let's navigate.
    if (String(lesson.id) !== String(id)) {
      navigate(`${ROUTES.LMS_LESSON}/${lesson.id}`, { state: { moduleId } })
    }
  }

  const handleNext = () => {
    if (!moduleData) return;

    // If in Quiz mode, where to go? Dashboard or Next Module?
    if (viewMode === 'quiz') {
      alert("Módulo concluído! Parabéns.");
      navigate(ROUTES.LMS);
      return;
    }

    const idx = moduleData.lessons.findIndex(l => String(l.id) === String(currentLesson?.id))
    if (idx >= 0 && idx < moduleData.lessons.length - 1) {
      const next = moduleData.lessons[idx + 1]
      navigate(`${ROUTES.LMS_LESSON}/${next.id}`, { state: { moduleId } })
    } else {
      // End of lessons. Check for Quiz.
      if (moduleData.quiz) {
        setViewMode('quiz');
      } else {
        alert("Módulo concluído! Parabéns.")
        navigate(ROUTES.LMS)
      }
    }
  }

  // TIMESTAMP LOGIC
  const parseTime = (timeStr) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  }

  const renderDescription = (text) => {
    if (!text) return null;
    const regex = /(\d{1,2}:\d{2}(?::\d{2})?)/g;
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (regex.test(part)) {
        const seconds = parseTime(part);
        return (
          <span
            key={i}
            onClick={() => {
              if (playerRef.current) playerRef.current.seekTo(seconds);
            }}
            style={{ color: '#ED7E13', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
            title={`Ir para ${part}`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  }

  if (loading) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <FaSpinner className="spin" size={40} color="#ED7E13" />
      </Container>
    )
  }


  const getVideoUrl = () => {
    return streamUrl || '';
  }

  return (
    <Container>
      <TopBar>
        <div className="left">
          <button className="back" onClick={() => navigate(ROUTES.PORTAL_DASHBOARD)}>
            <FaChevronLeft /> Sair da Sala
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
          <h2>{moduleData?.module?.title}</h2>
        </div>
        <div className="right">
          <button
            className="back"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Mostrar Playlist" : "Ocultar Playlist"}
          >
            {isSidebarCollapsed ? <FaList /> : <FaTimes />}
          </button>
        </div>
      </TopBar>

      <MainGrid $isCollapsed={isSidebarCollapsed}>
        <ContentArea>
          {moduleData?.locked ? (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '2rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', color: '#ED7E13' }}><FaTimes /></div>
              <h1 style={{ fontFamily: 'Bison, sans-serif', fontSize: '2.5rem', marginBottom: '1rem' }}>Módulo Bloqueado</h1>
              <p style={{ fontSize: '1.2rem', color: '#ccc', maxWidth: '600px' }}>
                {moduleData.locked_reason || 'Complete o módulo anterior para acessar este conteúdo.'}
              </p>
              <button
                onClick={() => navigate(ROUTES.LMS)}
                style={{
                  marginTop: '2rem', padding: '1rem 2rem', background: 'transparent',
                  border: '1px solid white', color: 'white', borderRadius: '8px', cursor: 'pointer'
                }}
              >
                Voltar para o Dashboard
              </button>
            </div>
          ) : viewMode === 'lesson' && currentLesson ? (
            <>
              <div className="player-wrapper">
                <VideoPlayerWrapper
                  ref={playerRef}
                  url={getVideoUrl()}
                  lessonId={currentLesson.id}
                  onComplete={handleNext}
                />
              </div>

              <div className="lesson-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h1>{currentLesson.title}</h1>
                  {moduleData?.certificate_available && (
                    <button
                      onClick={() => api.generateCertificate(moduleData.module.id)}
                      style={{
                        background: '#ED7E13', color: 'white', border: 'none', padding: '0.75rem 1.5rem',
                        borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                      }}
                    >
                      <FaDownload /> Certificado
                    </button>
                  )}
                </div>

                <p className="desc" style={{ whiteSpace: 'pre-wrap' }}>
                  {renderDescription(currentLesson.description)}
                </p>

                <h3 style={{ marginBottom: '0.5rem', color: '#FFF' }}>Materiais de Apoio</h3>
                <AttachmentList attachments={currentLesson.attachments} />
              </div>
            </>
          ) : viewMode === 'quiz' && moduleData?.quiz ? (
            <div className="p-8 h-full">
              <QuizRunner
                moduleId={moduleData.module.id}
                onComplete={(result) => {
                  // Refresh data?
                  if (result.passed) {
                    // Update local state to show completion and potentially certificate
                    setModuleData(prev => ({
                      ...prev,
                      quiz: { ...prev.quiz, is_completed: true, last_score: result.score },
                      certificate_available: true // Assuming passing quiz unlocks cert immediately
                    }));
                  }
                }}
                onCancel={() => {
                  // Go back to last lesson
                  if (currentLesson) setViewMode('lesson');
                  else navigate(ROUTES.LMS);
                }}
              />
            </div>
          ) : (
            <div className="p-10 text-white">Carregando conteúdo...</div>
          )}
        </ContentArea>

        <Sidebar $isCollapsed={isSidebarCollapsed}>
          <div className="header">
            <div className="title"><FaList /> Playlist</div>
            <button onClick={() => setIsSidebarCollapsed(true)}><FaTimes /></button>
          </div>
          <div className="list">
            <LessonList
              lessons={moduleData?.lessons}
              moduleId={moduleData?.module?.id}
              moduleQuiz={moduleData?.quiz}
              activeQuiz={viewMode === 'quiz'}
              onQuizClick={() => setViewMode('quiz')}
            />
          </div>
        </Sidebar>
      </MainGrid>
      <style>{`
              .spin { animation: spin 1s linear infinite; }
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
    </Container>
  )
}
