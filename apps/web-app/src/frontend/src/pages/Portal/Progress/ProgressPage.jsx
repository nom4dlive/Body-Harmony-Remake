import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PortalNavbar } from '../components/PortalNavbar';
import { FaChartLine, FaCheckCircle, FaClock, FaTrophy, FaSpinner } from 'react-icons/fa';
import LMSService from '../../../services/LMSService';
import { BottomNavbar } from '../../../components/BottomNavbar/BottomNavbar';

const Container = styled.div`
  padding: 2rem max(4%, 20px);
  padding-bottom: 100px; /* Space for BottomNavbar */
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: ${({ $bg }) => $bg || 'rgba(255, 255, 255, 0.1)'};
    color: ${({ $color }) => $color || '#fff'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
  }
  
  .info {
    h3 { font-size: 2rem; margin: 0; color: #fff; }
    span { color: #94A3B8; font-size: 0.9rem; }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-top: 2rem;
  overflow: hidden;
  
  .fill {
    height: 100%;
    background: ${({ theme }) => theme.colors.secondary};
    width: ${({ progress }) => progress}%;
    transition: width 1s ease-out;
  }
`;

const ProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    hoursStudied: 0,
    overallProgress: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const modules = await LMSService.getContent();

      let total = 0;
      let completed = 0;
      let seconds = 0;

      modules.forEach(mod => {
        const hasAccess = !mod.is_exclusive || mod.has_access;
        if (hasAccess && mod.lessons) {
          total += mod.lessons.length;
          mod.lessons.forEach(l => {
            if (l.is_completed) {
              completed++;
              seconds += l.duration_seconds || 0;
            }
          });
        }
      });

      setStats({
        totalLessons: total,
        completedLessons: completed,
        hoursStudied: Math.round(seconds / 3600 * 10) / 10,
        overallProgress: total > 0 ? Math.round((completed / total) * 100) : 0
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Container style={{ justifyContent: 'center', height: '80vh' }}>
      <FaSpinner className="spin" size={40} />
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </Container>
  );

  return (
    <Container>
      <PortalNavbar />

      <Header>
        <h1><FaChartLine /> Meu Progresso</h1>
        <p>Acompanhe sua evolução na formação Body Harmony.</p>
      </Header>

      <StatsGrid>
        <StatCard $bg="rgba(16, 185, 129, 0.2)" $color="#34D399">
          <div className="icon"><FaCheckCircle /></div>
          <div className="info">
            <h3>{stats.completedLessons} <small style={{ fontSize: '1rem', color: '#64748B' }}>/ {stats.totalLessons}</small></h3>
            <span>Aulas Concluídas</span>
          </div>
        </StatCard>

        <StatCard $bg="rgba(59, 130, 246, 0.2)" $color="#60A5FA">
          <div className="icon"><FaClock /></div>
          <div className="info">
            <h3>{stats.hoursStudied}h</h3>
            <span>Horas Estudadas</span>
          </div>
        </StatCard>

        <StatCard $bg="rgba(245, 158, 11, 0.2)" $color="#FBBF24">
          <div className="icon"><FaTrophy /></div>
          <div className="info">
            <h3>{stats.overallProgress}%</h3>
            <span>Progresso Geral</span>
          </div>
        </StatCard>
      </StatsGrid>

      <h3 style={{ color: '#fff' }}>Progresso da Formação</h3>
      <ProgressBar progress={stats.overallProgress}>
        <div className="fill" />
      </ProgressBar>

      <BottomNavbar />
    </Container>
  );
};

export default ProgressPage;
