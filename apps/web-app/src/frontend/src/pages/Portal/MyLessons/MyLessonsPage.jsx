import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PortalNavbar } from '../components/PortalNavbar';
import { FaPlayCircle, FaCheckCircle, FaSpinner, FaBookOpen, FaLayerGroup, FaStar, FaLock, FaAward, FaAngleRight } from 'react-icons/fa';
import LMSService from '../../../services/LMSService';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';
import { BottomNavbar } from '../../../components/BottomNavbar/BottomNavbar';

const Container = styled.div`
  padding: 2rem max(4%, 20px);
  padding-bottom: 100px;
  color: white;
  min-height: 100vh;
  background: linear-gradient(to bottom, #051A29 0%, #0A3E60 100%);
`;

const Header = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
  
  h1 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #fff;
    
    svg { color: ${({ theme }) => theme.colors.secondary}; }
  }
  
  p {
    color: ${({ theme }) => theme.colors.darkTextMuted};
    margin-top: 0.5rem;
  }
`;

const Section = styled.div`
  margin-bottom: 4rem;
  
  h2 {
    font-size: 1.4rem;
    margin-bottom: 1.5rem;
    color: #fff;
    border-left: 4px solid ${({ theme }) => theme.colors.secondary};
    padding-left: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
`;

const LessonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ModuleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const LessonCard = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    border-color: ${({ theme }) => theme.colors.secondary};
    
    .thumb img { transform: scale(1.05); }
    .play-btn { transform: scale(1.1); background: ${({ theme }) => theme.colors.secondary}; }
  }

  .thumb {
    width: 100%;
    aspect-ratio: 16/9;
    background: #000;
    position: relative;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .play-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      transition: all 0.3s;
    }

    .duration {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(0,0,0,0.8);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      background: ${({ theme }) => theme.colors.secondary};
      z-index: 10;
    }
  }

  .content {
    padding: 1rem;
    
    h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #F1F5F9;
      margin-bottom: 0.5rem;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: #94A3B8;
    }
  }
`;

const ModuleCard = styled.div`
  background: ${props => props.$isPremiumActive ? 'rgba(10, 62, 96, 0.25)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${props => props.$isPremiumActive ? 'rgba(237, 126, 19, 0.35)' : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &:hover {
    background: ${props => props.$isPremiumActive ? 'rgba(10, 62, 96, 0.35)' : 'rgba(255, 255, 255, 0.06)'};
    border-color: ${props => props.$isPremiumActive ? 'rgba(237, 126, 19, 0.7)' : 'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
    box-shadow: ${props => props.$isPremiumActive ? '0 10px 25px rgba(237, 126, 19, 0.15)' : '0 10px 20px rgba(0,0,0,0.2)'};
  }

  ${props => props.$isPremiumLocked && `
    opacity: 0.65;
    background: rgba(5, 26, 41, 0.6);
    border-color: rgba(255, 255, 255, 0.04);
    &:hover {
      opacity: 0.85;
      border-color: rgba(237, 126, 19, 0.3);
      background: rgba(5, 26, 41, 0.8);
    }
  `}

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;

    .icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: ${props => props.$isPremiumActive ? 'rgba(237, 126, 19, 0.15)' : 'rgba(10, 62, 96, 0.5)'};
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${props => props.$isPremiumActive ? '#ED7E13' : props.theme.colors.secondary};
      font-size: 1.2rem;
    }
    
    .count {
      background: rgba(255,255,255,0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #ccc;
    }
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
    font-family: ${({ theme }) => theme.fonts.heading};
  }

  p {
    font-size: 0.9rem;
    color: #94A3B8;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .progress-container {
    background: rgba(255, 255, 255, 0.1);
    height: 6px;
    border-radius: 3px;
    margin-top: auto;
    
    .bar {
      height: 100%;
      background: ${props => props.$isPremiumActive ? '#ED7E13' : props.theme.colors.secondary};
      border-radius: 3px;
      transition: width 0.5s ease;
    }
  }
  
  .footer {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #94A3B8;
  }

  .premium-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: linear-gradient(135deg, #ED7E13 0%, #FFB347 100%);
    color: white;
    font-size: 0.55rem;
    font-weight: 800;
    text-transform: uppercase;
    padding: 4px 10px;
    border-bottom-left-radius: 8px;
    letter-spacing: 0.05em;
    box-shadow: -2px 2px 8px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .locked-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.1);
    border-bottom-left-radius: 8px;
    color: #ED7E13;
    font-size: 0.55rem;
    font-weight: 800;
    text-transform: uppercase;
    padding: 4px 10px;
    display: flex;
    align-items: center;
    gap: 4px;
    border: 1px solid rgba(237, 126, 19, 0.25);
    border-top: none;
    border-right: none;
  }
`;

const MyLessonsPage = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const navigate = useNavigate();

  const regularModules = modules.filter(m => !m.is_exclusive);
  const premiumActiveModules = modules.filter(m => m.is_exclusive && m.has_access);
  const premiumLockedModules = modules.filter(m => m.is_exclusive && !m.has_access);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      // Fetch all content structure
      const data = await LMSService.getContent();
      
      if (Array.isArray(data)) {
        setModules(data);

        // Extract in-progress lessons across all modules
        const activeLessons = [];
        data.forEach(mod => {
          if (mod && mod.lessons && Array.isArray(mod.lessons)) {
            mod.lessons.forEach(lesson => {
              // Keep lessons that are started but not finished, OR finished recently?
              // For "Continue Watching", usually implies > 0 and < 100.
              if (lesson && lesson.progress_percent > 0 && !lesson.is_completed) {
                activeLessons.push({ ...lesson, moduleTitle: mod.title, moduleId: mod.id });
              }
            });
          }
        });

        // Sort by last watched if available (not in current API but good practice)
        // For now just take top 3
        setInProgress(activeLessons.slice(0, 3));
      } else {
        console.warn('API returned non-array structure for LMS content:', data);
        setModules([]);
        setInProgress([]);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const calculateModuleProgress = (mod) => {
    if (!mod.lessons || mod.lessons.length === 0) return 0;
    const total = mod.lessons.length * 100;
    const current = mod.lessons.reduce((acc, l) => acc + (l.progress_percent || (l.is_completed ? 100 : 0)), 0);
    return Math.round((current / total) * 100);
  };

  const LessonItem = ({ lesson }) => (
    <LessonCard onClick={() => navigate(`${ROUTES.LMS}/lesson/${lesson.id}`, { state: { moduleId: lesson.moduleId } })}>
      <div className="thumb">
        <img
          src={
            lesson.thumbnail_ref ? `${import.meta.env.VITE_API_BASE || '/api'}/../${lesson.thumbnail_ref}` :
              lesson.thumbnail_base64 && lesson.thumbnail_base64.startsWith('data:image/') ? lesson.thumbnail_base64 :
                (lesson.video_type === 'youtube' && lesson.video_ref
                  ? `https://img.youtube.com/vi/${getYouTubeId(lesson.video_ref)}/hqdefault.jpg`
                  : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect fill="%230F172A" width="320" height="180"/%3E%3Cpath d="M160 70v40m-20-20h40" stroke="%23316B9C" stroke-width="2"/%3E%3C/svg%3E')
          }
          alt={lesson.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect fill="%230F172A" width="320" height="180"/%3E%3C/svg%3E';
          }}
        />
        <div className="overlay">
          <div className="play-btn">
            <FaPlayCircle />
          </div>
        </div>
        <div className="progress-bar" style={{ width: `${lesson.progress_percent}%` }} />
        <div className="duration">
          {Math.floor(lesson.duration_seconds / 60)}:{(lesson.duration_seconds % 60).toString().padStart(2, '0')}
        </div>
      </div>
      <div className="content">
        <h3>{lesson.title}</h3>
        <div className="meta">
          <span>{lesson.moduleTitle}</span>
          <span>{lesson.progress_percent}%</span>
        </div>
      </div>
    </LessonCard>
  );

  if (loading) return (
    <Container style={{ justifyContent: 'center', height: '80vh', display: 'flex', alignItems: 'center' }}>
      <FaSpinner className="spin" size={40} style={{ color: '#ED7E13' }} />
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </Container>
  );

  return (
    <Container>
      <PortalNavbar />
      <Header>
        <h1><FaBookOpen /> Minhas Aulas</h1>
        <p>Acesse seus cursos e continue sua jornada de aprendizado.</p>
      </Header>

      {/* Hero Section: Continue Watching (Only if active) */}
      {Array.isArray(inProgress) && inProgress.length > 0 && (
        <Section>
          <h2><FaPlayCircle /> Continue Assistindo</h2>
          <LessonGrid>
            {inProgress.map(lesson => <LessonItem key={lesson.id} lesson={lesson} />)}
          </LessonGrid>
        </Section>
      )}

      {/* Main Section: All Courses (Meus Cursos) */}
      {/* 1. Formação Principal */}
      {regularModules.length > 0 && (
        <Section>
          <h2><FaLayerGroup /> Formação Geral</h2>
          <ModuleGrid>
            {regularModules.map(mod => {
              const progress = calculateModuleProgress(mod);
              return (
                <ModuleCard key={mod.id} onClick={() => navigate(`${ROUTES.LMS}/module/${mod.id}`)}>
                  <div className="header">
                    <div className="icon"><FaBookOpen /></div>
                    <div className="count">{mod.lessons?.length || 0} Aulas</div>
                  </div>
                  <h3>{mod.title}</h3>
                  <p>{mod.description || 'Sem descrição.'}</p>

                  <div className="progress-container">
                    <div className="bar" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="footer">
                    <span>{progress}% Concluído</span>
                    <span>{progress === 100 ? 'Finalizado' : 'Em andamento'}</span>
                  </div>
                </ModuleCard>
              );
            })}
          </ModuleGrid>
        </Section>
      )}

      {/* 2. Módulos Premium Ativos */}
      {premiumActiveModules.length > 0 && (
        <Section>
          <h2><FaStar style={{ color: '#ED7E13' }} /> Módulos Premium Ativos</h2>
          <ModuleGrid>
            {premiumActiveModules.map(mod => {
              const progress = calculateModuleProgress(mod);
              return (
                <ModuleCard key={mod.id} $isPremiumActive={true} onClick={() => navigate(`${ROUTES.LMS}/module/${mod.id}`)}>
                  <div className="premium-badge">
                    <FaStar size={8} /> Premium
                  </div>
                  <div className="header" style={{ marginTop: '4px' }}>
                    <div className="icon"><FaStar /></div>
                    <div className="count">{mod.lessons?.length || 0} Aulas</div>
                  </div>
                  <h3>{mod.title}</h3>
                  <p>{mod.description || 'Sem descrição.'}</p>

                  <div className="progress-container">
                    <div className="bar" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="footer">
                    <span>{progress}% Concluído</span>
                    <span>{progress === 100 ? 'Finalizado' : 'Em andamento'}</span>
                  </div>
                </ModuleCard>
              );
            })}
          </ModuleGrid>
        </Section>
      )}

      {/* 3. Módulos Premium Bloqueados (Vitrines no LMS) */}
      {premiumLockedModules.length > 0 && (
        <Section>
          <h2><FaLock style={{ color: '#ED7E13' }} /> Módulos Premium Disponíveis</h2>
          <ModuleGrid>
            {premiumLockedModules.map(mod => {
              return (
                <ModuleCard key={mod.id} $isPremiumLocked={true} onClick={() => navigate(ROUTES.PORTAL_PREMIUM)}>
                  <div className="locked-badge">
                    <FaLock size={8} /> Restrito
                  </div>
                  <div className="header" style={{ marginTop: '4px' }}>
                    <div className="icon"><FaLock style={{ color: '#ED7E13' }} /></div>
                    <div className="count">{mod.lessons?.length || 0} Aulas</div>
                  </div>
                  <h3>{mod.title}</h3>
                  <p>{mod.description || 'Sem descrição.'}</p>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ED7E13', fontWeight: '700' }}>
                    <span>Adquirir Especialização</span>
                    <FaAngleRight />
                  </div>
                </ModuleCard>
              );
            })}
          </ModuleGrid>
        </Section>
      )}

      {modules.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          <p>Nenhum curso disponível no momento.</p>
        </div>
      )}

      <BottomNavbar />
    </Container>
  );
};

export default MyLessonsPage;
