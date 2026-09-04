import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../../../services/api';
import NexusLayout from '../NexusLayout';
import { pt } from '../../../i18n/translations';
import ActiveSessions from './components/ActiveSessions';
import PendingMentorship from './components/PendingMentorship';
import ForensicTimeline from './components/ForensicTimeline';

// Cores Nexus (Hardcoded para garantir Dark Mode)
const NEXUS = {
    bg: '#0D0D12',
    surface: '#16161E',
    primary: '#00F2FF',    // Cyan Neon
    accent: '#FF0055',     // Pink Neon
    text: '#E0E0FF',
    textSec: '#8B8B9E',
    border: '#1F1F2E'
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: ${NEXUS.surface};
  border: 1px solid ${NEXUS.border};
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${NEXUS.primary};
  }

  h3 {
    color: ${NEXUS.textSec};
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
  }
`;

const Stat = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${NEXUS.text};
  margin-top: 5px;
  font-family: 'Poppins', sans-serif;
  
  &.accent { color: ${NEXUS.accent}; }
  &.success { color: #00FF94; }
  &.danger { color: #FF2A2A; }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  min-width: 600px; // Ensure it doesn't squish too much
  
  th { 
    text-align: left; 
    color: ${NEXUS.textSec}; 
    font-size: 0.8rem; 
    padding: 12px; 
    border-bottom: 1px solid ${NEXUS.border};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  td { 
    padding: 12px; 
    border-bottom: 1px solid ${NEXUS.border}; 
    color: ${NEXUS.text}; 
    font-size: 0.9rem; 
  }

  tr:last-child td { border-bottom: none; }
`;

const ActionBtn = styled.button`
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
  border: 1px solid #ff4444;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
  
  &:hover { 
    background: #ff4444; 
    color: white;
  }
`;

const Title = styled.h1`
  margin-bottom: 30px;
  color: ${NEXUS.text};
  font-weight: 800;
  font-size: 2rem;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  &::before {
    content: '';
    display: block;
    width: 6px;
    height: 32px;
    background: ${NEXUS.accent};
    border-radius: 2px;
  }
`;

const Watchtower = () => {
    const [stats, setStats] = useState({
        metrics: { active_users: { last_24h: 0 }, lessons_completed: 0, total_students: 0, avg_progress: 0 },
        alerts: [],
        sessions: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchStats = async () => {
            try {
                const data = await api.nexus.getWatchtowerStats();
                if (mounted && data && data.success) {
                    setStats({
                        metrics: data.metrics || { active_users: { last_24h: 0 }, lessons_completed: 0 },
                        alerts: data.security_alerts || [],
                        sessions: data.recent_activity || []
                    });
                }
            } catch (error) {
                console.error("Watchtower Blinked:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 60000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    const activeCount = stats.metrics?.active_users?.last_24h ?? 0;
    const completedCount = stats.metrics?.lessons_completed ?? 0;
    const alertCount = stats.alerts?.length || 0;
    const avgProgress = stats.metrics?.avg_progress ?? 0;

    return (
        <div style={{ padding: '20px' }}>
            <Title>{pt.nexus.watchtower.title || 'Watchtower'}</Title>

            <Grid>
                <Card>
                    <h3>{pt.nexus.watchtower.activeUsers || 'Active Agents'} (24h)</h3>
                    <Stat>{loading ? '...' : activeCount}</Stat>
                </Card>
                <Card>
                    <h3>{pt.nexus.watchtower.lessonsCompleted || 'Ops Completed'}</h3>
                    <Stat className="accent">{loading ? '...' : completedCount}</Stat>
                </Card>
                <Card>
                    <h3>Global Progress</h3>
                    <Stat>{loading ? '...' : avgProgress}%</Stat>
                </Card>
                <Card>
                    <h3>{pt.nexus.watchtower.securityAlerts || 'Threats'}</h3>
                    <Stat className={alertCount > 0 ? 'danger' : 'success'}>
                        {loading ? '...' : alertCount}
                    </Stat>
                </Card>
            </Grid>

            {stats.alerts?.length > 0 && (
                <Card style={{ marginTop: '30px', borderColor: '#ff4444' }}>
                    <h3 style={{ color: '#ff4444' }}>⚠️ AMEAÇA DETECTADA: COMPARTILHAMENTO DE CREDENCIAIS</h3>
                    <p style={{ color: '#8B8B9E', fontSize: '0.8rem', marginBottom: '12px', fontFamily: 'monospace' }}>
                        ⚡ Algoritmo V57 — IPv6 (CGNAT/iOS) excluído. Contagem baseada em dispositivos físicos reais (72h).
                    </p>
                    <TableWrapper>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Identity</th>
                                    <th>Dispositivos</th>
                                    <th>IPs IPv4</th>
                                    <th>Risco</th>
                                    <th>Vector List (IPv4 apenas)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.alerts.map((alert, i) => {
                                    const isCritical = alert.risk_level === 'CRITICAL' || alert.device_count > 5;
                                    const color = isCritical ? '#FF0055' : '#ff4444';
                                    return (
                                        <tr key={i}>
                                            <td style={{ color, fontWeight: 'bold' }}>{alert?.name || 'Unknown'}</td>
                                            <td style={{ fontWeight: 'bold', color: isCritical ? '#FF0055' : '#ED7E13' }}>
                                                {alert.device_count ?? alert.ip_count}
                                            </td>
                                            <td style={{ color: '#00F2FF', fontFamily: 'monospace' }}>
                                                {alert.ip_count}
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontFamily: 'monospace',
                                                    fontWeight: 'bold',
                                                    padding: '3px 8px',
                                                    borderRadius: '4px',
                                                    background: isCritical ? 'rgba(255,0,85,0.15)' : 'rgba(255,68,68,0.12)',
                                                    border: `1px solid ${isCritical ? '#FF0055' : '#ff4444'}`,
                                                    color: isCritical ? '#FF0055' : '#ff4444'
                                                }}>
                                                    {isCritical ? '🔴 CRITICAL' : '🟠 HIGH'}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', opacity: 0.8, maxWidth: '360px', wordBreak: 'break-all' }}>
                                                {alert.ips || '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </TableWrapper>
                </Card>
            )}

            {/* Mentoria Clínica Doctor Harmony (Supervisão Superior) */}
            <PendingMentorship />

            {/* Security Inspector (Barracks integration) */}
            <div style={{ marginTop: '30px' }}>
                <ActiveSessions />
            </div>

            {/* Forensic Timeline — Rastreio por CPF */}
            <ForensicTimeline />

            <Card style={{ marginTop: '20px' }}>
                <h3>{pt.nexus.watchtower.liveFeed || 'Live Feed'}</h3>
                <TableWrapper>
                    <Table>
                        <thead>
                            <tr>
                                <th>Agent</th>
                                <th>IP Address</th>
                                <th>Operation</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.sessions.map((s, idx) => (
                                <tr key={idx}>
                                    <td>{s?.student_name || 'Ghost'}</td>
                                    <td style={{ fontFamily: 'monospace', color: NEXUS.primary }}>{s.ip_address || '127.0.0.1'}</td>
                                    <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>{s.action}</td>
                                    <td style={{ opacity: 0.6 }}>{new Date(s.created_at).toLocaleTimeString()}</td>
                                </tr>
                            ))}
                            {stats.sessions.length === 0 && !loading && (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>No recent activity detected.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </TableWrapper>
            </Card>
        </div>
    );
};

export default Watchtower;
