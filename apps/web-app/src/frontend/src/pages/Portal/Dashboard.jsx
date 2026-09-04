import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useLicenciadaAuth as useStudentAuth } from '../../context/LicenciadaAuthContext'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import {
  FaSignOutAlt, FaPlay, FaDownload, FaClock, FaSpinner, FaLock,
  FaBars, FaTimes, FaCheckCircle, FaGraduationCap, FaMedal,
  FaBroadcastTower, FaBolt, FaArrowRight, FaStar, FaBookOpen,
  FaShoppingBag, FaAward
} from 'react-icons/fa';
import { ResourceLibrary } from './components/ResourceLibrary'
import { BentoCard } from './components/BentoCard'
import { motion } from 'framer-motion'
import SafeThumbnail from '../../components/SafeThumbnail'

import { BottomNavbar } from '../../components/BottomNavbar/BottomNavbar'
import { PortalNavbar } from './components/PortalNavbar'
import { api } from '../../services/api'

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.darkBg};
  background-image: 
    radial-gradient(circle at 0% 0%, rgba(49, 107, 156, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(237, 126, 19, 0.05) 0%, transparent 50%),
    linear-gradient(to bottom, #051A29 0%, #0A3E60 100%);
  background-attachment: fixed;
  color: ${({ theme }) => theme.colors.darkText};
  display: flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.fonts.body};
  position: relative;
  overflow-x: hidden;
  padding-bottom: 80px;

  @media (min-width: 769px) {
    padding-bottom: 0;
  }

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.02;
    pointer-events: none;
    z-index: 1;
  }
`

const HeroSection = styled.header`
  position: relative;
  min-height: 400px;
  padding: 4rem 4% 8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #051A29; 
  overflow: hidden;

  @media (max-width: 768px) {
    min-height: 280px;
    padding: 2rem 4% 5rem;
    flex-direction: column;
    text-align: center;
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, ${({ $themeColor }) => $themeColor === 'gold' ? '#ED7E13' : '#0A3E60'} 0%, #051A29 100%);
    background-size: cover;
    background-position: center;
    opacity: 0.4;
    mix-blend-mode: overlay;
    z-index: 0;
    animation: slowZoom 20s ease-in-out infinite alternate;
    transition: background 1s ease;
  }

  @keyframes slowZoom {
    from { transform: scale(1); }
    to { transform: scale(1.1); }
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, #051A29 0%, rgba(5, 26, 41, 0.8) 50%, rgba(5, 26, 41, 0.2) 100%);
    z-index: 1;
  }

  .bottom-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150px;
    background: linear-gradient(to top, #051A29 0%, transparent 100%);
    z-index: 2;
  }

  .hero-content {
    position: relative;
    max-width: 600px;
    z-index: 10;
    margin-top: -2rem;
    flex: 1;

    .badge {
      display: inline-block;
      padding: 6px 16px;
      background: ${({ $themeColor }) => $themeColor === 'gold' ? 'rgba(237, 126, 19, 0.2)' : 'rgba(49, 107, 156, 0.2)'};
      color: ${({ $themeColor }) => $themeColor === 'gold' ? '#ED7E13' : '#4DB8FF'};
      border: 1px solid ${({ $themeColor }) => $themeColor === 'gold' ? 'rgba(237, 126, 19, 0.4)' : 'rgba(49, 107, 156, 0.4)'};
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 1.5rem;
      backdrop-filter: blur(4px);
    }
    
    h1 {
      font-family: ${({ theme }) => theme.fonts.heading};
      font-size: clamp(2.5rem, 4vw, 4rem);
      margin-bottom: 1rem;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: -2px;
      line-height: 0.95;
      text-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    
    p {
      font-size: clamp(1rem, 2vw, 1.15rem);
      color: #E2E8F0;
      margin-bottom: 2rem;
      line-height: 1.6;
      max-width: 500px;
      font-weight: 300;
    }

    .cta-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        justify-content: center;
      }
    }
  }
`;

const PrimaryButton = styled.button`
  padding: 1rem 2.5rem;
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 20px rgba(237, 126, 19, 0.4);
  
  &:hover {
    background: #FF9124;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(237, 126, 19, 0.6);
  }
`;

const BentoGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  padding: 0 4%;
  margin-top: -3.5rem; /* Overlaps hero */
  position: relative;
  z-index: 20;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    margin-top: -3rem;
    gap: 0.75rem;
  }
`;

const BentoColSpan2 = styled.div`
  grid-column: span 2;
  @media (max-width: 768px) {
    grid-column: span 2;
  }
`;

// ... other styled components ...
const MainContent = styled.main`
  flex: 1;
  padding: 0 0 4rem 0;
`

const CarouselSection = styled.section`
  padding: 2rem 4%;
  
  h2 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-transform: uppercase;
    
    @media (max-width: 768px) {
      font-size: 1.4rem;
    }

    span {
      color: ${({ theme }) => theme.colors.darkTextMuted};
      font-size: 1rem;
      text-transform: lowercase;
      
      @media (max-width: 768px) {
        font-size: 0.85rem;
      }
    }
  }
`

const CarouselWrapper = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 1rem 0 2rem 0;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  
  &::after { content: ''; flex: 0 0 1.5rem; }
`

const LessonCard = styled(motion.div)`
  flex: 0 0 320px;
  background: #0F172A;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  @media (max-width: 768px) {
    flex: 0 0 280px;
  }
  
  .thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    background: #020617;
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
      background: rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: opacity 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;

      .play-icon {
        width: 48px;
        height: 48px;
        background: rgba(237, 126, 19, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: scale(0.8);
        transition: transform 0.3s;
      }
    }

    .status-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      color: white;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 5px;

      &.completed { color: #4ADE80; }
      &.inprogress { color: #FACC15; }
    }

    .duration {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #FFF;
      font-weight: 600;
    }
  }
  
  .details {
    padding: 1rem;
    
    h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #F1F5F9;
      margin-bottom: 0.5rem;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.8rem;
      color: #94A3B8;
      
      span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
    }
    
    .progress-bar {
      height: 2px;
      background: #334155;
      margin-top: 0.75rem;
      border-radius: 2px;
      overflow: hidden;
      
      .fill {
        height: 100%;
        background: ${({ theme }) => theme.colors.secondary};
        width: ${({ progress }) => progress || 0}%;
      }
    }
  }
  
  &:hover {
    transform: scale(1.05);
    z-index: 10;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    
    .thumb { 
      img { transform: scale(1.1); } 
      .overlay { opacity: 1; .play-icon { transform: scale(1); } }
    }
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFF;
  font-family: ${({ theme }) => theme.fonts.heading};
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
  span {
    font-size: 1rem;
    color: rgba(255,255,255,0.6);
    font-weight: 400;
  }

  @media (max-width: 768px) {
    font-size: 1.8rem;
    span {
      font-size: 0.85rem;
    }
  }
`;

const ProgressBar = styled.div`
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: auto;
  
  .fill {
    height: 100%;
    background: ${({ $themeColor, theme }) => $themeColor === 'gold' ? theme.colors.secondary : theme.colors.blueLight};
    width: ${({ progress }) => progress || 0}%;
    transition: width 1s ease-out;
  }
`;

// ── Exclusive Storefront Styled Components (PLAN-011) ──────────────────────
const ExclusiveSection = styled.section`
  padding: 2rem 4%;
  margin-top: 1rem;

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;

    h2 {
      font-family: ${({ theme }) => theme.fonts.heading};
      font-size: 1.8rem;
      color: #fff;
      text-transform: uppercase;
      margin: 0;

      @media (max-width: 768px) { font-size: 1.4rem; }
    }

    .badge-exclusive {
      background: linear-gradient(135deg, #ED7E13, #F59A2E);
      color: #fff;
      padding: 4px 12px;
      border-radius: 50px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
  }

  .section-sub {
    color: rgba(255,255,255,0.5);
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    margin-top: -1rem;
  }
`;

const ExclusiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ExclusiveCard = styled(motion.div)`
  background: rgba(5, 26, 41, 0.7);
  border: 1px solid rgba(237, 126, 19, 0.25);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(16px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: rgba(237, 126, 19, 0.6);
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(237, 126, 19, 0.1);
  }

  .card-thumb {
    position: relative;
    aspect-ratio: 16/9;
    background: #0A1929;
    overflow: hidden;

    img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.5) saturate(0.7); transition: all 0.4s; }
    &:hover img { filter: brightness(0.35) saturate(0.5); }

    .lock-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: rgba(10, 62, 96, 0.65);
      backdrop-filter: blur(2px);

      .lock-icon {
        width: 48px; height: 48px;
        background: rgba(237, 126, 19, 0.15);
        border: 1.5px solid rgba(237, 126, 19, 0.5);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: #ED7E13;
      }
      .lock-label {
        font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.1em; color: #ED7E13;
      }
    }

    .exclusive-badge {
      position: absolute; top: 10px; right: 10px;
      background: linear-gradient(135deg, #ED7E13, #F59A2E);
      color: #fff; padding: 3px 10px; border-radius: 50px;
      font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em;
    }
  }

  .card-body {
    padding: 1rem 1.25rem 1.25rem;

    h3 {
      font-family: ${({ theme }) => theme.fonts.heading};
      font-size: 1rem; font-weight: 700;
      color: #fff; margin: 0 0 0.5rem;
      line-height: 1.3;
    }

    p {
      font-size: 0.82rem; color: rgba(255,255,255,0.55);
      line-height: 1.5; margin: 0 0 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .shop-btn {
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      width: 100%; background: linear-gradient(135deg, #ED7E13 0%, #FF8F26 100%); color: #fff;
      text-decoration: none; font-size: 0.85rem; font-weight: 700;
      padding: 0.75rem; border-radius: 8px; transition: all 0.2s;
      min-height: 44px; border: none; cursor: pointer;
      box-shadow: 0 4px 14px rgba(237, 126, 19, 0.3);

      &:hover { background: linear-gradient(135deg, #FF8F26 0%, #FFA04D 100%); transform: translateY(-2px); box-shadow: 0 6px 18px rgba(237, 126, 19, 0.45); }

      svg { flex-shrink: 0; }
    }
  }
`;


const PremiumTeaserStrip = styled(motion.div)`
  background: linear-gradient(90deg, rgba(237, 126, 19, 0.9) 0%, rgba(245, 154, 46, 0.95) 50%, rgba(237, 126, 19, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin: 1rem 4% 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(237, 126, 19, 0.25);
  backdrop-filter: blur(8px);
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 1.25rem 1rem;
    margin: 1rem 4% 1.5rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(237, 126, 19, 0.4);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .teaser-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 0.5rem;
    }

    svg {
      font-size: 1.5rem;
      color: #FFFFFF;
      animation: pulseStar 1.5s infinite alternate;
      flex-shrink: 0;
    }

    @keyframes pulseStar {
      from { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 2px #FFF); }
      to { transform: scale(1.2) rotate(15deg); filter: drop-shadow(0 0 8px #FFF); }
    }

    strong {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    span {
      font-size: 0.9rem;
      opacity: 0.9;
    }
  }

  .teaser-cta {
    background: #FFFFFF;
    color: #ED7E13;
    font-weight: 700;
    font-size: 0.85rem;
    padding: 0.6rem 1.25rem;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 100%;
      justify-content: center;
    }

    &:hover {
      background: #051A29;
      color: #FFFFFF;
    }
  }
`;


const SectionCategoryTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.8rem;
  padding: 0 4%;
  margin-top: 3.5rem;
  margin-bottom: 0.5rem;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-top: 2.5rem;
  }

  &.premium-category {
    color: #ED7E13;
    text-shadow: 0 0 10px rgba(237, 126, 19, 0.2);
  }
`;

const CategorySub = styled.p`
  padding: 0 4%;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  margin-top: 0;
`;


export default function PortalDashboard() {
  const { student, loading: authLoading } = useStudentAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dataModules, setDataModules] = useState([])
  const [summary, setSummary] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)
  const hasSmartBook = Boolean(student?.ai_notebook_beta_enabled === 1 || student?.ai_notebook_beta_enabled === true)

  // Derived: módulos com aulas liberadas vs. exclusivos bloqueados (PLAN-011/PLAN-013)
  const accessibleModules = dataModules.filter(m => !m.is_exclusive || m.has_access)
  const accessibleRegularModules = dataModules.filter(m => !m.is_exclusive)
  const accessiblePremiumModules = dataModules.filter(m => m.is_exclusive && m.has_access)
  const lockedExclusiveModules = dataModules.filter(m => m.is_exclusive && !m.has_access)

  useEffect(() => {
    if (!authLoading && student) {
      fetchLmsData()
    }
  }, [authLoading, student])

  const fetchLmsData = async () => {
    try {
      setLoading(true)
      const [modulesData, summaryData] = await Promise.all([
        api.getLmsContent(),
        api.getDashboardSummary()
      ])

      if (!Array.isArray(modulesData)) {
        throw new Error("Formato de dados inválido recebido da API.")
      }
      setDataModules(modulesData)

      if (summaryData.success) {
        setSummary(summaryData.summary)
        if (summaryData.summary.next_lesson) {
          setActiveLesson(summaryData.summary.next_lesson)
        }
      }

      // Fallback local se não vier next_lesson do summary
      if (!summaryData.summary?.next_lesson) {
        let active = null;
        // Only search accessible modules for next lesson (not locked exclusive ones)
        const accessibleForFallback = modulesData.filter(m => !m.is_exclusive || m.has_access);
        for (const m of accessibleForFallback) {
          if (m.lessons && m.lessons.length > 0) {
            const incomplete = m.lessons.find(l => !l.is_completed);
            if (incomplete) { active = incomplete; break; }
          }
        }
        if (!active && accessibleForFallback.length > 0 && accessibleForFallback[0].lessons && accessibleForFallback[0].lessons.length > 0) {
          active = accessibleForFallback[0].lessons[0];
        }
        if (!activeLesson && active) setActiveLesson(active);
      }

    } catch (err) {
      console.error(err)
      setError("Não foi possível carregar seu conteúdo. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  }

  const renderModuleCarousel = (module, isPremium = false) => {
    if (!module.lessons || !Array.isArray(module.lessons) || module.lessons.length === 0) return null;
    return (
      <CarouselSection key={module.id} className={isPremium ? 'premium-carousel' : ''}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <h2 style={{ margin: 0 }}>
            {isPremium && <FaStar size={16} style={{ color: '#ED7E13', marginRight: '6px' }} />}
            {module.title}
            {isPremium && <span className="premium-label" style={{ background: 'rgba(237, 126, 19, 0.15)', color: '#ED7E13', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', marginLeft: '8px', border: '1px solid rgba(237, 126, 19, 0.3)', verticalAlign: 'middle', textTransform: 'uppercase' }}>✦ Premium</span>}
            <span style={{ marginLeft: '6px' }}>({module.lessons.length} aulas)</span>
          </h2>
          {hasSmartBook && (
            <button
              onClick={() => navigate('/portal-licenciada/smartbook', { state: { moduleId: module.id } })}
              style={{ background: 'rgba(237, 126, 19, 0.12)', border: '1px solid rgba(237, 126, 19, 0.4)', color: '#ED7E13', padding: '0.35rem 0.8rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
            >
              <FaBookOpen /> Caderno deste Módulo (IA)
            </button>
          )}
        </div>
        <CarouselWrapper>
          {module.lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              progress={lesson.progress_percent || 0}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate(`${ROUTES.LMS}/lesson/${lesson.id}`, { state: { moduleId: module.id } })}
              style={isPremium ? { borderColor: 'rgba(237, 126, 19, 0.25)', background: 'rgba(10, 62, 96, 0.15)' } : {}}
            >
              <div className="thumb">
                <SafeThumbnail 
                  src={
                    lesson.thumbnail_ref ? `${import.meta.env.VITE_API_BASE || '/api'}/v1/lms/thumbnail/${lesson.thumbnail_ref.replace('thumbnails/', '').replace('uploads/', '')}` :
                      lesson.thumbnail_base64 && lesson.thumbnail_base64.startsWith('data:image/') ? lesson.thumbnail_base64 :
                        lesson.video_poster ||
                        (lesson.video_type === 'youtube' && lesson.video_ref
                          ? `https://img.youtube.com/vi/${getYouTubeId(lesson.video_ref)}/hqdefault.jpg`
                          : null)
                  }
                  title={lesson.title}
                  lessonId={lesson.id}
                  videoUrl={lesson.video_type === 'vimeo' ? null : lesson.video_ref}
                />

                <div className="overlay">
                  <div className="play-icon"><FaPlay /></div>
                </div>
                <div className={`status-badge ${lesson.is_completed ? 'completed' : 'inprogress'}`}>
                  {lesson.is_completed ? <><FaCheckCircle /> CONCLUÍDA</> : <><FaClock /> ASSISTIR</>}
                </div>
                <div className="duration">
                  {Math.floor(lesson.duration_seconds / 60)}:{(lesson.duration_seconds % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div className="details">
                <h3 title={lesson.title}>{lesson.title}</h3>
                <div className="meta">
                  <span><FaClock size={12} /> {Math.floor(lesson.duration_seconds / 60)} min</span>
                  <span>•</span>
                  <span>Módulo {accessibleModules.indexOf(module) + 1}</span>
                </div>
                <div className="progress-bar">
                  <div className="fill" style={isPremium ? { background: '#ED7E13' } : {}} />
                </div>
              </div>
            </LessonCard>
          ))}
        </CarouselWrapper>
      </CarouselSection>
    );
  };

  if (authLoading || loading) {
    return (
      <DashboardContainer>
        <PortalNavbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'white', gap: '1rem' }}>
          <FaSpinner className="spin" size={30} /> Carregando Painel de Controle...
          <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </DashboardContainer>
    )
  }

  const isGestao = activeLesson?.module_name?.toLowerCase().includes('gestão') || false;
  const heroTheme = isGestao ? 'navy' : 'gold';

  return (
    <DashboardContainer>
      <PortalNavbar />

      <HeroSection $themeColor={heroTheme}>
        <div className="bottom-fade" />
        <div className="hero-content">
          <motion.span
            className="badge"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {activeLesson ? 'CONTINUE ASSISTINDO' : 'ÁREA EXCLUSIVA'}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {activeLesson ? activeLesson.title : 'Domine o Body Harmony'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {activeLesson
              ? 'Volte agora mesmo para o conteúdo e continue sua evolução profissional com precisão.'
              : 'Sua jornada em estética corporal começa aqui. Acesse suas aulas abaixo.'}
          </motion.p>
          <motion.div
            className="cta-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {activeLesson && (
              <PrimaryButton onClick={() => navigate(`${ROUTES.LMS}/lesson/${activeLesson.id}`)}>
                <FaPlay /> INICIAR AULA
              </PrimaryButton>
            )}
            {hasSmartBook && (
              <PrimaryButton
                onClick={() => navigate('/portal-licenciada/smartbook')}
                style={{
                  background: 'rgba(10, 62, 96, 0.7)',
                  border: '1px solid #ED7E13',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                }}
              >
                <FaBookOpen style={{ color: '#ED7E13' }} /> ABRIR SMART BOOK (IA)
              </PrimaryButton>
            )}
          </motion.div>
        </div>
      </HeroSection>

      <BentoGridContainer>
        {/* Smart Book - IA Notebook (Exibido apenas para usuárias com Beta Habilitada) */}
        {hasSmartBook && (
          <BentoCard
            title="Smart Book"
            icon={<FaBookOpen />}
            themeColor="gold"
            delay={0.05}
            onClick={() => navigate('/portal-licenciada/smartbook')}
            style={{ cursor: 'pointer', border: '1px solid rgba(237, 126, 19, 0.4)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ED7E13' }}>Smart Book</span>
              <span style={{ background: '#ED7E13', color: '#fff', fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>BETA</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', margin: '0.3rem 0 0.6rem 0' }}>
              Cadernos inteligentes com IA, RAG, tira-dúvidas e podcasts.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ED7E13', fontSize: '0.82rem', fontWeight: 700, marginTop: 'auto' }}>
              Acessar Smart Book <FaArrowRight />
            </div>
          </BentoCard>
        )}

        <BentoCard
          title="Progresso"
          icon={<FaGraduationCap />}
          themeColor="gold"
          delay={0.1}
        >
          <StatValue>{summary?.stats?.percent || 0}<span>%</span></StatValue>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
            {summary?.stats?.completed || 0} de {summary?.stats?.total || 0} aulas concluídas
          </p>
          <ProgressBar progress={summary?.stats?.percent || 0} $themeColor="gold">
            <div className="fill" />
          </ProgressBar>
        </BentoCard>

        <BentoCard
          title="Certificação"
          icon={<FaAward />}
          themeColor="gold"
          delay={0.15}
          onClick={() => navigate(ROUTES.PORTAL_CERTIFICADOS)}
          style={{ cursor: 'pointer', border: (summary?.stats?.percent >= 100) ? '1px solid rgba(237, 126, 19, 0.4)' : undefined }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: (summary?.stats?.percent >= 100) ? '#10B981' : '#ED7E13' }}>
              {(summary?.stats?.percent >= 100) ? '🏆 Liberado' : 'Em Curso'}
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', margin: '0.3rem 0 0.6rem 0' }}>
            {(summary?.stats?.percent >= 100)
              ? 'Parabéns! Emita seu certificado oficial de formação com selo digital.'
              : 'Acompanhe seus quizzes e libere sua certificação oficial.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ED7E13', fontSize: '0.82rem', fontWeight: 700, marginTop: 'auto' }}>
            Ver Certificados <FaArrowRight />
          </div>
        </BentoCard>

        <BentoCard
          title="Horas de Estudo"
          icon={<FaClock />}
          themeColor="navy"
          delay={0.2}
        >
          <StatValue>{Math.floor(summary?.stats?.hours || 0)}<span>h</span></StatValue>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
            Investidas na sua carreira
          </p>
        </BentoCard>

        {/* Signals */}
        <BentoCard
          title="Sinalizadores"
          icon={<FaBroadcastTower />}
          themeColor={summary?.signals?.unread > 0 ? "gold" : "default"}
          delay={0.3}
        >
          <StatValue>{summary?.signals?.unread || 0}</StatValue>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
            Avisos importantes
          </p>
        </BentoCard>

        {/* Substituindo Ação rápida genérica pela Próxima Meta */}
        <BentoCard
          title="Próxima Meta"
          icon={<FaMedal />}
          themeColor="navy"
          delay={0.4}
        >
          <h4 style={{ fontSize: '1rem', margin: '0.2rem 0 0.5rem 0', color: '#fff' }}>
            {summary?.next_lesson?.module_name || 'Certificação'}
          </h4>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: '1.2' }}>
            Finalize "{summary?.next_lesson?.title || 'a grade'}" para avançar.
          </p>
          <ProgressBar progress={0} $themeColor="navy" style={{ marginTop: 'auto', background: 'transparent' }} />
        </BentoCard>
      </BentoGridContainer>

      <MainContent>
        {error && (
          <div style={{ padding: '0 3rem', color: '#EF4444', marginBottom: '2rem' }}>
            ⚠ {error}
          </div>
        )}

        {lockedExclusiveModules.length > 0 && (
          <PremiumTeaserStrip
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate(ROUTES.PORTAL_PREMIUM)}
          >
            <div className="teaser-info">
              <FaStar />
              <div>
                <strong>Módulos Premium Disponíveis!</strong>{' '}
                <span>Acelere seus resultados com técnicas e protocolos estéticos avançados.</span>
              </div>
            </div>
            <div className="teaser-cta">
              Conhecer Detalhes <FaArrowRight />
            </div>
          </PremiumTeaserStrip>
        )}

        {/* Category 2: Premium Modules Unlocked (Módulos Premium Ativos) */}
        {accessiblePremiumModules.length > 0 && (
          <>
            <SectionCategoryTitle className="premium-category">
              <FaStar style={{ color: '#ED7E13' }} /> Módulos Premium Ativos
            </SectionCategoryTitle>
            <CategorySub>
              Protocolos avançados e técnicas de estética de elite liberadas para você.
            </CategorySub>
            {accessiblePremiumModules.map((module) => renderModuleCarousel(module, true))}
          </>
        )}

        {/* Category 1: Regular Modules (Formação Geral) */}
        {accessibleRegularModules.length > 0 && (
          <>
            <SectionCategoryTitle>
              <FaBookOpen style={{ color: '#ED7E13' }} /> Formação Body Harmony
            </SectionCategoryTitle>
            <CategorySub>
              Módulos fundamentais para sua capacitação e progresso de carreira.
            </CategorySub>
            {accessibleRegularModules.map((module) => renderModuleCarousel(module, false))}
          </>
        )}

        {/* ── Seção de Módulos Premium Bloqueados (PLAN-011) ─────────────────── */}
        {lockedExclusiveModules.length > 0 && (
          <ExclusiveSection>
            <div className="section-header">
              <h2><FaLock size={18} style={{ color: '#ED7E13' }} /> Módulos Premium</h2>
              <span className="badge-exclusive">Exclusivo</span>
            </div>
            <p className="section-sub">
              Conteúdo avançado disponível mediante autorização. Solicite acesso ao seu gestor.
            </p>
            <ExclusiveGrid>
              {lockedExclusiveModules.map((module, idx) => {
                const firstLesson = module.lessons?.[0]
                const thumbSrc = firstLesson?.thumbnail_ref
                  ? `${import.meta.env.VITE_API_BASE || '/api'}/v1/lms/thumbnail/${firstLesson.thumbnail_ref.replace('thumbnails/', '').replace('uploads/', '')}`
                  : null
                const whatsappMsg = encodeURIComponent(
                  `Olá! Tenho interesse no módulo exclusivo "${module.title}" e gostaria de solicitar o acesso. CPF: ${student?.cpf || student?.name || 'não informado'}.`
                )
                return (
                  <ExclusiveCard
                    key={module.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.08 }}
                  >
                    <div className="card-thumb">
                      <SafeThumbnail 
                        src={thumbSrc} 
                        title={module.title} 
                        moduleId={module.id} 
                        lessonId={firstLesson?.id}
                        videoUrl={firstLesson?.video_type === 'vimeo' ? null : firstLesson?.video_ref}
                      />
                      <div className="lock-overlay">
                        <div className="lock-icon"><FaLock size={20} /></div>
                        <span className="lock-label">Acesso Restrito</span>
                      </div>
                      <span className="exclusive-badge">Premium</span>
                    </div>
                    <div className="card-body">
                      <h3>{module.title}</h3>
                      {module.description && <p>{module.description}</p>}
                      <button
                        id={`exclusive-module-shop-${module.id}`}
                        className="shop-btn"
                        onClick={() => navigate('/shop')}
                      >
                        <FaShoppingBag size={14} />
                        Adquirir Especialização
                      </button>
                    </div>
                  </ExclusiveCard>
                )
              })}
            </ExclusiveGrid>
          </ExclusiveSection>
        )}

        {/* Resources at the very bottom in mobile, desktop can span full width */}
        <div style={{ padding: '0 4%' }}>
          <BentoCard
            title="Biblioteca de Recursos"
            icon={<FaDownload />}
            themeColor="default"
            delay={0.7}
          >
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Baixe manuais oficiais, fichas de avaliação e materiais exclusivos de marketing.
            </p>
            <ResourceLibrary />
          </BentoCard>
        </div>

      </MainContent>

      <BottomNavbar />
    </DashboardContainer>
  )
}
