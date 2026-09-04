import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Activity, Shield, Server, Database, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  color: #E0E0FF;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #1F1F2E;
  padding-bottom: 1rem;
`;

const Title = styled.h1`
  font-family: 'Bison', sans-serif;
  font-size: 2.5rem;
  letter-spacing: 2px;
  color: #E0E0FF;
  display: flex;
  align-items: center;
  gap: 15px;

  span {
    color: #00F2FF;
  }
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background: #16161E;
  border: 1px solid #1F1F2E;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s, border-color 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    border-color: #00F2FF44;
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #8B8B9E;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  font-family: 'Bison', sans-serif;
  letter-spacing: 1px;
  color: ${props => props.color || '#E0E0FF'};
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: ${props => props.active ? '#00FF94' : '#FF0055'};
  background: ${props => props.active ? 'rgba(0, 255, 148, 0.1)' : 'rgba(255, 0, 85, 0.1)'};
  padding: 4px 8px;
  border-radius: 4px;
  width: fit-content;
`;

const Section = styled.div`
  background: #0D0D12;
  border: 1px solid #1F1F2E;
  border-radius: 8px;
  padding: 2rem;
`;

const SectionTitle = styled.h3`
  font-family: 'Bison', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #8B8B9E;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #1F1F2E;
  
  &:last-child {
    border-bottom: none;
  }

  span:first-child {
    color: #8B8B9E;
  }
  
  span:last-child {
    color: #E0E0FF;
    font-family: 'JetBrains Mono', monospace;
  }
`;

const NexusHome = () => {
    const navigate = useNavigate();
    const [system, setSystem] = useState(null);
    const [security, setSecurity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sysRes, secRes] = await Promise.all([
                    api.nexus.getSystemStatus(),
                    api.nexus.getSecurityMetrics()
                ]);
                setSystem(sysRes.data);
                setSecurity(secRes.data);
            } catch (e) {
                console.error('Failed to load Nexus data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Carregando Nexus Core...</div>;

    return (
        <Container>
            <Header>
                <Title>
                    <Activity size={32} />
                    NEXUS // <span>CORE DASHBOARD</span>
                </Title>
                <StatusIndicator active={system?.status === 'operational'}>
                    {system?.status === 'operational' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                    SYSTEM {system?.status?.toUpperCase()}
                </StatusIndicator>
            </Header>

            <QuickStats>
                <StatCard onClick={() => navigate('/nexus/ops')}>
                    <StatHeader>
                        <Shield size={18} />
                        SECURITY THREATS (24H)
                    </StatHeader>
                    <StatValue color={security?.metrics?.failed_logins_24h > 5 ? '#FF0055' : '#00F2FF'}>
                        {security?.metrics?.failed_logins_24h || 0}
                    </StatValue>
                    <StatusIndicator active={true}>WAF ACTIVE</StatusIndicator>
                </StatCard>

                <StatCard onClick={() => navigate('/nexus/ops')}>
                    <StatHeader>
                        <Users size={18} />
                        ACTIVE SESSIONS
                    </StatHeader>
                    <StatValue>
                        {system?.metrics?.active_sessions || 0}
                    </StatValue>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Admins Online</div>
                </StatCard>

                <StatCard onClick={() => navigate('/nexus/database')}>
                    <StatHeader>
                        <Database size={18} />
                        DB LATENCY
                    </StatHeader>
                    <StatValue color={system?.metrics?.db_latency_ms > 100 ? '#FFEB3B' : '#00FF94'}>
                        {system?.metrics?.db_latency_ms || 0}ms
                    </StatValue>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Response Time</div>
                </StatCard>

                <StatCard onClick={() => navigate('/nexus/engine')}>
                    <StatHeader>
                        <Server size={18} />
                        DISK SPACE
                    </StatHeader>
                    <StatValue>
                        {system?.metrics?.disk_free_space ? Math.round(system.metrics.disk_free_space / 1024 / 1024 / 1024) + 'GB' : 'N/A'}
                    </StatValue>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Free on Server</div>
                </StatCard>
            </QuickStats>

            <Grid>
                <Section>
                    <SectionTitle><Server size={20} /> SYSTEM HEALTH</SectionTitle>
                    <MetricRow>
                        <span>PHP Version</span>
                        <span>{system?.metrics?.php_version}</span>
                    </MetricRow>
                    <MetricRow>
                        <span>Error Rate (1h)</span>
                        <span style={{ color: system?.metrics?.error_rate_1h > 0 ? '#FF0055' : '#00FF94' }}>
                            {system?.metrics?.error_rate_1h} events
                        </span>
                    </MetricRow>
                    <MetricRow>
                        <span>Database Status</span>
                        <span style={{ color: '#00FF94' }}>CONNECTED</span>
                    </MetricRow>
                </Section>

                <Section>
                    <SectionTitle><Shield size={20} /> SECURITY OVERWATCH</SectionTitle>
                    <MetricRow>
                        <span>Suspicious IPs (24h)</span>
                        <span>{security?.metrics?.suspicious_ips}</span>
                    </MetricRow>
                    <MetricRow>
                        <span>Admin Logins (24h)</span>
                        <span>{security?.metrics?.admin_logins_24h}</span>
                    </MetricRow>
                    <MetricRow>
                        <span>Firewall Status</span>
                        <span style={{ color: '#00F2FF' }}>NEXUS GUARD ACTIVE</span>
                    </MetricRow>
                </Section>
            </Grid>
        </Container>
    );
};

export default NexusHome;
