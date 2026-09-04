import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Shield, ShieldAlert, Activity, CheckCircle, Trash2, Plus, Clock, Globe, AlertTriangle } from 'lucide-react';
import { api } from '../../../services/api';

const Container = styled.div`
  color: #E0E0FF;
  padding-bottom: 3rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid #1F1F2E;
  padding-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
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
    color: #ED7E13;
  }
`;

const Subtitle = styled.p`
  color: #8B8B9E;
  font-family: 'Montserrat', sans-serif;
  margin-top: 0.5rem;
`;

const StatusGlow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: bold;
  font-size: 1rem;
  color: ${props => props.alert ? '#FF3366' : '#00F2FF'};
  text-shadow: 0 0 10px ${props => props.alert ? '#FF336655' : '#00F2FF55'};
  border: 1px solid ${props => props.alert ? '#FF3366' : '#00F2FF'};
  padding: 8px 16px;
  border-radius: 20px;
  background: ${props => props.alert ? 'rgba(255, 51, 102, 0.1)' : 'rgba(0, 242, 255, 0.1)'};
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  background: ${props => props.active ? 'rgba(237, 126, 19, 0.1)' : 'transparent'};
  color: ${props => props.active ? '#ED7E13' : '#8B8B9E'};
  border: 1px solid ${props => props.active ? '#ED7E13' : '#1F1F2E'};
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    border-color: #ED7E13;
    color: #E0E0FF;
  }
`;

const Panel = styled.div`
  background: #050A10;
  backdrop-filter: blur(10px);
  border: 1px solid #0A3E60;
  border-radius: 8px;
  padding: 2rem;
  min-height: 400px;
`;

const RuleGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RuleCard = styled.div`
  background: rgba(10, 62, 96, 0.2);
  border: 1px solid #0A3E60;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const RuleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  strong {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.1rem;
    color: #F5F5F5;
  }
  
  span {
    font-size: 0.85rem;
    color: #8B8B9E;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => props.bg};
  color: ${props => props.color};
  border: 1px solid ${props => props.color}44;
`;

const ActionButton = styled.button`
  background: ${props => props.danger ? 'rgba(255, 51, 102, 0.1)' : 'rgba(237, 126, 19, 0.1)'};
  color: ${props => props.danger ? '#FF3366' : '#ED7E13'};
  border: 1px solid ${props => props.danger ? '#FF3366' : '#ED7E13'};
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background: ${props => props.danger ? '#FF3366' : '#ED7E13'};
    color: ${props => props.danger ? '#FFF' : '#0a0a0a'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 2rem;
  align-items: flex-end;
  background: rgba(10, 62, 96, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px dashed #0A3E60;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: ${props => props.flex || 1};
`;

const Label = styled.label`
  color: #8B8B9E;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
`;

const Input = styled.input`
  background: #050A10;
  border: 1px solid #0A3E60;
  color: #F5F5F5;
  padding: 10px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;

  &:focus {
    outline: none;
    border-color: #ED7E13;
  }
`;

const Select = styled.select`
  background: #050A10;
  border: 1px solid #0A3E60;
  color: #F5F5F5;
  padding: 10px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;

  &:focus {
    outline: none;
    border-color: #ED7E13;
  }
`;

const OpsDashboard = () => {
    const [activeTab, setActiveTab] = useState('feed');
    const [feed, setFeed] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);

    const [newRule, setNewRule] = useState({
        ip: '',
        type: 'BAN',
        reason: '',
        duration_hours: 0
    });

    useEffect(() => {
        if (activeTab === 'feed') fetchFeed();
        if (activeTab === 'firewall') fetchRules();
    }, [activeTab]);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/nexus/ops/audit-feed');
            setFeed(res.feed || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchRules = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/nexus/ops/firewall');
            setRules(res.rules || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRule = async () => {
        if (!newRule.ip) return alert('IP Required');
        try {
            setLoading(true);
            await api.post('/admin/nexus/ops/firewall', newRule);
            setNewRule({ ip: '', type: 'BAN', reason: '', duration_hours: 0 });
            alert('Regra aplicada no Firewall.');
            fetchRules();
        } catch (e) {
            alert('Falha ao aplicar regra.');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeRule = async (id) => {
        if (!window.confirm('Revogar esta regra imediatamente?')) return;
        try {
            setLoading(true);
            await api.delete(`/admin/nexus/ops/firewall/${id}`);
            fetchRules();
        } catch (e) {
            alert('Falha ao revogar regra.');
        } finally {
            setLoading(false);
        }
    };

    const handleMaintenance = async (action) => {
        const labels = {
            'FLUSH_CACHE': 'Limpar Cache de API',
            'PURGE_DEVICES': 'Expurgar Dispositivos Inativos',
            'CLEAN_LOGS': 'Faxina de Logs',
            'RESET_GEOIP': 'Resetar GeoIP'
        };

        if (!window.confirm(`Confirma a ação [${labels[action]}]? Esta operação pode ser destrutiva.`)) return;

        try {
            setLoading(true);
            const res = await api.post('/admin/nexus/ops/maintenance', { action });
            alert(res.message || 'Operação concluída.');
            if (activeTab === 'feed') fetchFeed();
        } catch (e) {
            alert('Falha na manutenção: ' + (e.response?.data?.error || e.message));
        } finally {
            setLoading(false);
        }
    };

    const isSystemAlert = feed.some(f => f.risk_score > 70);

    return (
        <Container>
            <Header>
                <div>
                    <Title>
                        <ShieldAlert size={40} color="#ED7E13" />
                        NEXUS // <span>OPS CENTER</span>
                    </Title>
                    <Subtitle>Central de Defesa Ativa e Firewall Dinâmico</Subtitle>
                </div>
                <StatusGlow alert={isSystemAlert}>
                    {isSystemAlert ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                    {isSystemAlert ? 'ALERTA DE RISCO' : 'SISTEMA PROTEGIDO'}
                </StatusGlow>
            </Header>

            <Tabs>
                <Tab active={activeTab === 'feed'} onClick={() => setActiveTab('feed')}>
                    Live Guardian Feed
                </Tab>
                <Tab active={activeTab === 'firewall'} onClick={() => setActiveTab('firewall')}>
                    Firewall Rules (IPs)
                </Tab>
                <Tab active={activeTab === 'vitality'} onClick={() => setActiveTab('vitality')}>
                    Vitalidade do Sistema
                </Tab>
            </Tabs>

            {activeTab === 'feed' && (
                <Panel>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontFamily: 'Bison', letterSpacing: '1px' }}>Auditoria em Tempo Real</h2>
                        <ActionButton onClick={fetchFeed} disabled={loading}><Activity size={16} /> Refresh</ActionButton>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <RuleGrid>
                            {feed.length === 0 && (
                                <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem', color: '#8B8B9E' }}>Nenhuma anomalia crítica recente.</div>
                            )}
                            {feed.map((log, i) => (
                                <RuleCard key={i}>
                                    <RuleInfo>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <Clock size={12} style={{ opacity: 0.7 }} />
                                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                                        </div>
                                        <strong style={{ color: '#ED7E13', fontSize: '1.1rem' }}>{log.identity || 'Desconhecido'}</strong>
                                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>{log.ip_address}</span>
                                    </RuleInfo>

                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                                        <Badge
                                            bg={log.feed_type === 'ADMIN_ACTION' ? '#00F2FF22' : '#FF336622'}
                                            color={log.feed_type === 'ADMIN_ACTION' ? '#00F2FF' : '#FF3366'}
                                        >
                                            {log.feed_type === 'ADMIN_ACTION' ? 'OPS COMMAND' : 'AUTH ANOMALY'}
                                        </Badge>

                                        {log.feed_type === 'ADMIN_ACTION' ? (
                                            <span style={{ color: '#00F2FF', fontSize: '0.8rem', fontWeight: 'bold' }}>SYSTEM AUTHORITY</span>
                                        ) : (
                                            <Badge
                                                bg={log.risk_score > 70 ? '#FF336644' : log.risk_score > 30 ? '#ED7E1344' : '#1F1F2E'}
                                                color={log.risk_score > 70 ? '#FF3366' : log.risk_score > 30 ? '#ED7E13' : '#8B8B9E'}
                                            >
                                                RISK: {log.risk_score}
                                            </Badge>
                                        )}

                                        <div style={{ textAlign: 'right', minWidth: '150px' }}>
                                            {log.city && <div style={{ fontSize: '0.8rem' }}><Globe size={10} style={{ display: 'inline', marginRight: '4px' }} /> {log.city}</div>}
                                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{log.risk_reason || '-'}</div>
                                        </div>
                                    </div>
                                </RuleCard>
                            ))}
                        </RuleGrid>
                    </div>
                </Panel>
            )}

            {activeTab === 'vitality' && (
                <Panel>
                    <h2 style={{ fontFamily: 'Bison', letterSpacing: '1px', marginBottom: '1.5rem' }}>Garbage Collection & Manutenção</h2>
                    <p style={{ color: '#8B8B9E', marginBottom: '2rem' }}>Ações de rotina para manter o banco de dados leve e a performance do servidor otimizada.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div style={{ background: '#0A0A0F', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1F1F2E' }}>
                            <h3 style={{ color: '#00F2FF', marginBottom: '10px' }}>📁 Cache de API</h3>
                            <p style={{ fontSize: '0.85rem', color: '#8B8B9E', marginBottom: '1.5rem' }}>Limpa os arquivos JSON temporários usados para acelerar as métricas dos dashboards.</p>
                            <ActionButton onClick={() => handleMaintenance('FLUSH_CACHE')} disabled={loading}>
                                <Activity size={16} /> Limpar Cache
                            </ActionButton>
                        </div>

                        <div style={{ background: '#0A0A0F', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1F1F2E' }}>
                            <h3 style={{ color: '#ED7E13', marginBottom: '10px' }}>📱 Dispositivos Órfãos</h3>
                            <p style={{ fontSize: '0.85rem', color: '#8B8B9E', marginBottom: '1.5rem' }}>Remove registros de smartphones/navegadores que não acessam o sistema há mais de 30 dias.</p>
                            <ActionButton onClick={() => handleMaintenance('PURGE_DEVICES')} disabled={loading}>
                                <Trash2 size={16} /> Expurgar Inativos
                            </ActionButton>
                        </div>

                        <div style={{ background: '#0A0A0F', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1F1F2E' }}>
                            <h3 style={{ color: '#8B8B9E', marginBottom: '10px' }}>📉 Logs Históricos</h3>
                            <p style={{ fontSize: '0.85rem', color: '#8B8B9E', marginBottom: '1.5rem' }}>Limpa logs de auditoria e acesso com mais de 90 dias para reduzir o volume do banco.</p>
                            <ActionButton danger onClick={() => handleMaintenance('CLEAN_LOGS')} disabled={loading}>
                                <Shield size={16} /> Faxina de Logs
                            </ActionButton>
                        </div>

                        <div style={{ background: '#0A0A0F', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1F1F2E' }}>
                            <h3 style={{ color: '#00F2FF', marginBottom: '10px' }}>📍 Cache GeoIP</h3>
                            <p style={{ fontSize: '0.85rem', color: '#8B8B9E', marginBottom: '1.5rem' }}>Reseta a base local de geolocalização IP (força nova identificação no próximo login).</p>
                            <ActionButton onClick={() => handleMaintenance('RESET_GEOIP')} disabled={loading}>
                                <Globe size={16} /> Resetar GeoIP
                            </ActionButton>
                        </div>
                    </div>
                </Panel>
            )}

            {activeTab === 'firewall' && (
                <Panel>
                    <h2 style={{ fontFamily: 'Bison', letterSpacing: '1px', marginBottom: '1.5rem' }}>Nova Regra Permanente / Temporária</h2>

                    <FormRow>
                        <FormGroup flex={2}>
                            <Label>Endereço IPv4 / IPv6</Label>
                            <Input
                                placeholder="Ex: 192.168.1.1"
                                value={newRule.ip}
                                onChange={e => setNewRule({ ...newRule, ip: e.target.value })}
                            />
                        </FormGroup>
                        <FormGroup flex={1}>
                            <Label>Ação (Verdict)</Label>
                            <Select
                                value={newRule.type}
                                onChange={e => setNewRule({ ...newRule, type: e.target.value })}
                            >
                                <option value="BAN">BLOCK (Ban IP)</option>
                                <option value="ALLOW">ALLOW (Whitelist)</option>
                            </Select>
                        </FormGroup>
                        <FormGroup flex={2}>
                            <Label>Motivo / Observação</Label>
                            <Input
                                placeholder="Ex: Tentativas repetidas Watchtower"
                                value={newRule.reason}
                                onChange={e => setNewRule({ ...newRule, reason: e.target.value })}
                            />
                        </FormGroup>
                        <FormGroup flex={1}>
                            <Label>Expira em (Horas)</Label>
                            <Input
                                type="number"
                                min="0"
                                placeholder="0 = Nunca"
                                value={newRule.duration_hours}
                                onChange={e => setNewRule({ ...newRule, duration_hours: e.target.value })}
                            />
                        </FormGroup>
                        <FormGroup style={{ minWidth: 'fit-content' }}>
                            <ActionButton onClick={handleAddRule} disabled={loading || !newRule.ip} style={{ height: '42px', width: '100%', justifyContent: 'center' }}>
                                <Plus size={16} /> Aplicar
                            </ActionButton>
                        </FormGroup>
                    </FormRow>

                    <h2 style={{ fontFamily: 'Bison', letterSpacing: '1px', marginBottom: '1rem', marginTop: '2rem' }}>Regras Ativas do Firewall</h2>
                    <div style={{ marginTop: '1rem' }}>
                        <RuleGrid>
                            {rules.length === 0 && (
                                <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem', color: '#8B8B9E' }}>Nenhuma regra ativa no firewall.</div>
                            )}
                            {rules.map((rule) => (
                                <RuleCard key={rule.id}>
                                    <RuleInfo>
                                        <strong>{rule.ip_address}</strong>
                                        <span>
                                            <ShieldAlert size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                            {rule.reason || 'Sem motivo especificado'}
                                        </span>
                                    </RuleInfo>

                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                                        <Badge
                                            bg={rule.rule_type === 'BAN' ? '#FF336622' : '#00F2FF22'}
                                            color={rule.rule_type === 'BAN' ? '#FF3366' : '#00F2FF'}
                                        >
                                            {rule.rule_type}
                                        </Badge>

                                        <RuleInfo>
                                            <span style={{ fontSize: '0.75rem', color: '#ED7E13' }}>AUTOR</span>
                                            <span style={{ color: '#E0E0FF' }}>{rule.admin_name || 'System'}</span>
                                        </RuleInfo>

                                        <RuleInfo>
                                            <span style={{ fontSize: '0.75rem', color: '#ED7E13' }}>EXPIRAÇÃO</span>
                                            <span style={{ color: '#E0E0FF' }}>{rule.expires_at ? new Date(rule.expires_at).toLocaleString('pt-BR') : 'Permanente'}</span>
                                        </RuleInfo>

                                        <ActionButton danger onClick={() => handleRevokeRule(rule.id)}>
                                            <Trash2 size={14} /> Revogar
                                        </ActionButton>
                                    </div>
                                </RuleCard>
                            ))}
                        </RuleGrid>
                    </div>
                </Panel>
            )}
        </Container>
    );
};

export default OpsDashboard;
