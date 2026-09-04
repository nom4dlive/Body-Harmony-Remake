import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  Users, PlayCircle, CheckCircle2, Clock,
  TrendingUp, Download, UserPlus, FolderDown, BookOpen, Trophy
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatInTimeZone } from 'date-fns-tz';
import CompactKpiGrid from '../../../components/ui/CompactKpiGrid';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  font-family: 'Poppins', sans-serif;
  color: #1E293B;
`;

const ChartSection = styled.div`
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 6px rgba(10, 62, 96, 0.04);
  height: 380px;
  min-width: 0;

  h3 {
    color: #0A3E60;
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const TIMEZONE = 'America/Sao_Paulo';

const LMSDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const LMSService = (await import('../../../services/LMSService')).default;
      const data = await LMSService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!stats?.chart_data) return [];
    return stats.chart_data;
  }, [stats]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Carregando dados do LMS...</div>;

  const metrics = stats?.metrics || {};

  const kpiItems = [
    {
      label: 'Licenciadas Ativas',
      value: `${metrics.active_students || 0}/${metrics.total_students || 0}`,
      color: '#0A3E60',
      bg: 'rgba(10, 62, 96, 0.08)',
      icon: Users
    },
    {
      label: 'Aulas Assistidas',
      value: metrics.lessons_watched || 0,
      color: '#ED7E13',
      bg: 'rgba(237, 126, 19, 0.08)',
      icon: PlayCircle
    },
    {
      label: 'Taxa de Conclusão',
      value: `${metrics.completion_rate || 0}%`,
      color: '#16A34A',
      bg: 'rgba(22, 163, 74, 0.08)',
      icon: CheckCircle2
    },
    {
      label: 'Horas de Ensino',
      value: `${metrics.teaching_hours || 0}h`,
      color: '#0A3E60',
      bg: 'rgba(10, 62, 96, 0.08)',
      icon: Clock
    },
    {
      label: 'Novas Inscrições',
      value: `+${metrics.new_enrollments || 0}`,
      color: '#ED7E13',
      bg: 'rgba(237, 126, 19, 0.08)',
      icon: UserPlus
    },
    {
      label: 'Recursos na Biblioteca',
      value: metrics.library_count || 0,
      color: '#0A3E60',
      bg: 'rgba(10, 62, 96, 0.08)',
      icon: FolderDown
    }
  ];

  return (
    <Container>
      <CompactKpiGrid items={kpiItems} />

      <ChartSection>
        <h3><TrendingUp size={18} color="#ED7E13" /> Engajamento Semanal (Visualizações)</h3>
        <div style={{ width: '100%', height: '290px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                dy={5}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  fontSize: '0.85rem'
                }}
              />
              <Bar
                dataKey="aulas"
                name="Aulas Assistidas"
                fill="#0A3E60"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartSection>
    </Container>
  );
};

export default LMSDashboard;
