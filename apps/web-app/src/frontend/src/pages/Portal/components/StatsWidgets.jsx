import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaTrophy, FaClock, FaUniversity, FaSpinner } from 'react-icons/fa';
import { request } from '../../../services/api';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 2rem;
  position: relative;
  z-index: 20;
  padding: 0 4%;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
`;

const StatCard = styled.div`
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-4px);
    background: rgba(15, 23, 42, 0.8);
    border-color: rgba(49, 107, 156, 0.5);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
  }

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: ${props => props.$bg};
    color: ${props => props.$color};
    box-shadow: 0 0 20px ${props => props.$glow};
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    min-width: 0; /* Prevent overflow */

    h4 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94A3B8;
      margin-bottom: 0.25rem;
      font-weight: 600;
      font-family: inherit;
    }

    .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #FFFFFF;
      font-family: ${({ theme }) => theme.fonts.heading};
      line-height: 1.2;
      margin-bottom: 0.1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sub {
      font-size: 0.8rem;
      color: #64748B;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  /* Progress Bar for specific cards */
  .progress-mini {
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    margin-top: 0.5rem;
    overflow: hidden;
    
    .fill {
      height: 100%;
      background: ${props => props.$color};
      width: ${props => props.$percent}%;
      transition: width 1s ease-out;
    }
  }
`;

export const StatsWidgets = ({ modules = [] }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressStats();
  }, []);

  const fetchProgressStats = async () => {
    try {
      // Use request() directly - api object doesn't have .get() method
      const response = await request('/v1/licenciada/progress');
      if (response?.success) {
        setStats(response);
      }
    } catch (err) {
      console.warn('[StatsWidgets] Failed to fetch progress, using fallback', err);
      // Fallback to module-based calculation
      const totalLessons = modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);
      const completedLessons = modules.reduce((acc, mod) =>
        acc + (mod.lessons?.filter(l => l.is_completed)?.length || 0), 0
      );
      const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      setStats({
        percent,
        completed: completedLessons,
        total: totalLessons,
        hours: Math.floor(completedLessons * 0.5),
        next_goal: 'Certificação',
        next_goal_sub: 'Complete os módulos'
      });
    } finally {
      setLoading(false);
    }
  };

  // Use stats or fallback
  const data = stats || {
    percent: 0,
    completed: 0,
    total: 0,
    hours: 0,
    next_goal: 'Carregando...',
    next_goal_sub: ''
  };

  return (
    <StatsContainer>
      {/* 1. Overall Progress */}
      <StatCard $bg="rgba(237, 126, 19, 0.15)" $color="#ED7E13" $glow="rgba(237, 126, 19, 0.2)">
        <div className="icon-box">
          {loading ? <FaSpinner className="spin" /> : <FaTrophy />}
        </div>
        <div className="content">
          <h4>Progresso Geral</h4>
          <div className="value">{data.percent}%</div>
          <div className="sub">{data.completed} de {data.total} aulas</div>
          <div className="progress-mini">
            <div className="fill" style={{ width: `${data.percent}%`, background: '#ED7E13' }} />
          </div>
        </div>
      </StatCard>

      {/* 2. Hours Invested */}
      <StatCard $bg="rgba(49, 107, 156, 0.15)" $color="#316B9C" $glow="rgba(49, 107, 156, 0.2)">
        <div className="icon-box">
          <FaClock />
        </div>
        <div className="content">
          <h4>Dedicação</h4>
          <div className="value">{data.hours}h</div>
          <div className="sub">Horas de estudo</div>
        </div>
      </StatCard>

      {/* 3. Next Goal */}
      <StatCard $bg="rgba(16, 185, 129, 0.15)" $color="#10B981" $glow="rgba(16, 185, 129, 0.2)">
        <div className="icon-box">
          <FaUniversity />
        </div>
        <div className="content">
          <h4>Próxima Meta</h4>
          <div className="value">{data.next_goal}</div>
          <div className="sub">{data.next_goal_sub}</div>
        </div>
      </StatCard>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </StatsContainer>
  );
};
