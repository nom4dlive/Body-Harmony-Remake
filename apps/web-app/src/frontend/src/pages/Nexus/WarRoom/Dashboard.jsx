import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../../../services/api';
import {
    Monitor,
    Shield,
    Users,
    Activity,
    HardDrive,
    Database,
    Cpu,
    Clock,
    Lock,
    GitCommit,
    AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// V3 Visual Identity (Deep Navy + Glassmorphism)
const NEXUS = {
    bg: '#051A29', // Deep Navy
    surface: 'rgba(10, 62, 96, 0.4)', // Glass Primary
    primary: '#00F2FF',    // Cyan Neon
    accent: '#FF0055',     // Pink Neon
    success: '#00FF94',
    warning: '#FFB800',
    text: '#FFFFFF',
    textSec: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(255, 255, 255, 0.08)' // Glass Border
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: ${NEXUS.text};
  font-size: 1.1rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 800;
  border-bottom: 1px solid ${NEXUS.border};
  padding-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Card = styled.div`
  background: ${NEXUS.surface};
  border: 1px solid ${NEXUS.border};
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px); /* Glass Effect */
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid ${NEXUS.border};

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const MetricLabel = styled.div`
  color: ${NEXUS.textSec};
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricValue = styled.div`
  color: ${NEXUS.text};
  font-weight: 700;
  font-size: 1rem;
  
  &.success { color: ${NEXUS.success}; }
  &.warning { color: ${NEXUS.warning}; }
  &.danger { color: ${NEXUS.accent}; }
`;

const StatusBadge = styled.span`
  background: ${props => props.color}22;
  color: ${props => props.color};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid ${props => props.color}44;
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${NEXUS.bg};
  background-image: radial-gradient(circle at 50% 0%, #0A3E60 0%, #051A29 70%); /* V3 Mesh Gradient */
  color: ${NEXUS.text};
  padding: 20px;
`;

const ContentWrapper = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

const WarRoom = () => {
    const [system, setSystem] = useState(null);
    const [security, setSecurity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [sysRes, secRes] = await Promise.all([
                    api.nexus.getSystemStatus(),
                    api.nexus.getSecurityMetrics()
                ]);
                setSystem(sysRes);
                setSecurity(secRes);
            } catch (e) {
                console.error("Failed to load Nexus metrics", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <PageContainer>
            <div style={{ padding: '40px', textAlign: 'center', color: NEXUS.primary }}>Initializing Nexus...</div>
        </PageContainer>
    );

    if (!system || !security) return (
        <PageContainer>
            <div style={{ color: NEXUS.accent, padding: '40px', textAlign: 'center' }}>Nexus Uplink Failed.</div>
        </PageContainer>
    );

    // Preparing Chart Data for Threats
    const threatData = [
        { name: 'Login Failed', value: security?.threats?.failed_logins_24h || 0, fill: NEXUS.warning },
        { name: 'Blocked IPs', value: security?.threats?.blocked_ips_24h || 0, fill: NEXUS.accent },
        { name: 'Suspicious', value: security?.threats?.suspicious_activities || 0, fill: NEXUS.primary }
    ];

    const handleAction = async (action, ip) => {
        if (!confirm(`Are you sure you want to ${action.toUpperCase()} IP: ${ip}?`)) return;
        try {
            await api.post('/nexus/ops/ip-rules', { action, ip });

            // Optimistic Update: Remove alerts for this IP
            setSecurity(prev => ({
                ...prev,
                auth_alerts: prev.auth_alerts ? prev.auth_alerts.filter(alert => alert.ip_address !== ip) : []
            }));

            // Optional: Show smaller toast instead of alert blocking UI
        } catch (e) {
            console.error(e);
            alert(`Failed to ${action} IP`);
        }
    };

    return (
        <PageContainer>
            <ContentWrapper>
                <h1 style={{
                    color: NEXUS.text,
                    marginBottom: '30px',
                    fontWeight: 800,
                    textShadow: `0 0 10px ${NEXUS.primary}44`,
                    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                    fontFamily: 'Bison, sans-serif',
                    letterSpacing: '2px'
                }}>
                    NEXUS // <span style={{ color: NEXUS.primary }}>WAR ROOM</span>
                </h1>

                {/* SYSTEM HEALTH */}
                <SectionTitle><Monitor size={20} color={NEXUS.primary} /> System Health</SectionTitle>
                <Grid>
                    <Card>
                        <MetricRow>
                            <MetricLabel><Clock size={16} /> Uptime</MetricLabel>
                            <MetricValue>{system.uptime}</MetricValue>
                        </MetricRow>
                        <MetricRow>
                            <MetricLabel><Database size={16} /> Database</MetricLabel>
                            <StatusBadge color={system.database === 'Connected' ? NEXUS.success : NEXUS.accent}>
                                {system.database}
                            </StatusBadge>
                        </MetricRow>
                        <MetricRow>
                            <MetricLabel><Cpu size={16} /> PHP Version</MetricLabel>
                            <MetricValue>{system.php_version}</MetricValue>
                        </MetricRow>
                    </Card>

                    <Card>
                        <MetricRow>
                            <MetricLabel><HardDrive size={16} /> Disk Usage</MetricLabel>
                            <MetricValue>{system.disk.usage_percent}</MetricValue>
                        </MetricRow>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '5px' }}>
                            <div style={{
                                width: system.disk.usage_percent,
                                height: '100%',
                                background: parseFloat(system.disk.usage_percent) > 80 ? NEXUS.accent : NEXUS.primary,
                                borderRadius: '3px'
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', color: NEXUS.textSec }}>
                            <span>Used: {system.disk.used_gb} GB</span>
                            <span>Total: {system.disk.total_gb} GB</span>
                        </div>
                    </Card>

                    <Card>
                        <MetricRow>
                            <MetricLabel><Activity size={16} /> Memory (PHP)</MetricLabel>
                            <MetricValue>{system.memory.used_mb} MB</MetricValue>
                        </MetricRow>
                        <MetricRow>
                            <MetricLabel><GitCommit size={16} /> Last Deploy</MetricLabel>
                            <MetricValue style={{ fontSize: '0.8rem' }}>{security?.deployment?.last_deploy || 'Unknown'}</MetricValue>
                        </MetricRow>
                        <MetricRow>
                            <MetricLabel><Monitor size={16} /> Environment</MetricLabel>
                            <StatusBadge color={NEXUS.primary}>{security?.deployment?.environment || 'Dev'}</StatusBadge>
                        </MetricRow>
                    </Card>
                </Grid>

                {/* SECURITY & THREATS */}
                <SectionTitle><Shield size={20} color={NEXUS.accent} /> Security Matrix</SectionTitle>
                <Grid>
                    <Card>
                        <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                            {/* Height must be explicit for Recharts in dense grids */}
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={threatData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={NEXUS.border} />
                                    <XAxis type="number" stroke={NEXUS.textSec} hide />
                                    <YAxis dataKey="name" type="category" stroke={NEXUS.textSec} width={100} tick={{ fill: NEXUS.textSec, fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ background: '#051A29', border: `1px solid ${NEXUS.border}`, color: NEXUS.text }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card>
                        <MetricRow>
                            <MetricLabel><Lock size={16} /> Failed Logins (24h)</MetricLabel>
                            <MetricValue className={(security?.threats?.failed_logins_24h || 0) > 0 ? 'danger' : 'success'}>
                                {security?.threats?.failed_logins_24h || 0}
                            </MetricValue>
                        </MetricRow>
                        <MetricRow>
                            <MetricLabel><AlertTriangle size={16} /> Blocked IPs</MetricLabel>
                            <MetricValue className={(security?.threats?.blocked_ips_24h || 0) > 0 ? 'danger' : 'text'}>
                                {security?.threats?.blocked_ips_24h || 0}
                            </MetricValue>
                        </MetricRow>
                    </Card>

                    <Card>
                        <MetricRow>
                            <MetricLabel><Users size={16} /> Active Admin Sessions</MetricLabel>
                            <MetricValue>{security?.sessions?.active_admins || 0}</MetricValue>
                        </MetricRow>
                        <MetricRow>
                            <MetricLabel><Users size={16} /> Active Student Sessions</MetricLabel>
                            <MetricValue>{security?.sessions?.active_students || 0}</MetricValue>
                        </MetricRow>
                        <MetricRow>
                            <MetricLabel><Activity size={16} /> Total Concurrency</MetricLabel>
                            <MetricValue style={{ color: NEXUS.primary }}>{security?.sessions?.total_active || 0}</MetricValue>
                        </MetricRow>
                    </Card>
                </Grid>

                {/* AUTH ALERTS (LOGIN GUARDIAN) */}
                <SectionTitle><Lock size={20} color={NEXUS.success} /> Login Guardian // Live Feed</SectionTitle>
                <Card style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px' }}>
                        {security.auth_alerts && security.auth_alerts.length > 0 ? (
                            security.auth_alerts.map((alert, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 15px',
                                    borderBottom: idx === security.auth_alerts.length - 1 ? 'none' : `1px solid ${NEXUS.border}`,
                                    background: alert.success ? 'rgba(0, 255, 148, 0.05)' : 'rgba(255, 0, 85, 0.05)',
                                    borderRadius: '6px',
                                    marginBottom: '4px'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ color: NEXUS.text, fontSize: '0.9rem', fontWeight: 600, display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            {alert.email}
                                            {alert.risk_score > 0 && (
                                                <div title={alert.risk_details_parsed?.join(' | ') || 'No details'} style={{
                                                    fontSize: '0.65rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    background: alert.risk_score > 70 ? NEXUS.accent : (alert.risk_score > 30 ? NEXUS.warning : NEXUS.success),
                                                    color: '#000',
                                                    fontWeight: 'bold',
                                                    cursor: 'help',
                                                    boxShadow: '0 0 10px rgba(255,255,255,0.1)'
                                                }}>
                                                    RISK: {alert.risk_score}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: NEXUS.textSec, fontFamily: 'monospace', display: 'flex', gap: '8px' }}>
                                            <span>IP: {alert.ip_address}</span>
                                            <span>•</span>
                                            <span>{new Date(alert.created_at).toLocaleTimeString()}</span>
                                            {alert.risk_details_parsed?.find(d => d.startsWith('LOC:')) && (
                                                <>
                                                    <span>•</span>
                                                    <span style={{ color: NEXUS.primary }}>📍 {alert.risk_details_parsed.find(d => d.startsWith('LOC:')).replace('LOC:', '')}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <StatusBadge color={alert.success ? NEXUS.success : NEXUS.accent}>
                                            {alert.success ? 'Authorized' : 'Denied'}
                                        </StatusBadge>
                                        {!alert.success && (
                                            <button
                                                onClick={() => handleAction('whitelist', alert.ip_address)}
                                                style={{
                                                    background: NEXUS.success, color: '#000', border: 'none',
                                                    borderRadius: '4px', padding: '4px 8px', fontSize: '0.7rem',
                                                    fontWeight: 'bold', cursor: 'pointer'
                                                }}>
                                                ALLOW
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleAction('ban', alert.ip_address)}
                                            style={{
                                                background: 'transparent', border: `1px solid ${NEXUS.accent}`, color: NEXUS.accent,
                                                borderRadius: '4px', padding: '4px 8px', fontSize: '0.7rem',
                                                fontWeight: 'bold', cursor: 'pointer'
                                            }}>
                                            BAN
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: NEXUS.textSec }}>
                                No recent authentication attempts recorded.
                            </div>
                        )}
                    </div>
                </Card>
            </ContentWrapper>
        </PageContainer>
    );
};

export default WarRoom;
