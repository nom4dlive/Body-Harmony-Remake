import React, { useState } from 'react';
import styled from 'styled-components';
import { Search, User, Clock, AlertTriangle, CheckCircle, XCircle, Monitor, Shield, Film } from 'lucide-react';
import { api } from '../../../../services/api';

const Wrap = styled.div`
  margin-top: 30px;
  background: #16161E;
  border: 1px solid #1F1F2E;
  border-radius: 12px;
  padding: 24px;
`;

const SectionTitle = styled.h2`
  font-family: 'Bison', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 1.5px;
  color: #E0E0FF;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.5rem;

  span { color: #ED7E13; }
`;

const SearchRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 1.5rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const CpfInput = styled.input`
  flex: 1;
  background: #0A0A0F;
  border: 1px solid #1F1F2E;
  color: #E0E0FF;
  padding: 12px 16px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  letter-spacing: 2px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #00F2FF;
    box-shadow: 0 0 8px rgba(0, 242, 255, 0.2);
  }

  &::placeholder { color: #3A3A4E; letter-spacing: 1px; }
`;

const SearchBtn = styled.button`
  background: rgba(0, 242, 255, 0.1);
  color: #00F2FF;
  border: 1px solid #00F2FF;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-weight: bold;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #00F2FF;
    color: #0A0A0F;
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const AgentCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: #0A0A0F;
  border: 1px solid ${p => p.active ? '#00FF9455' : '#FF336655'};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 1.5rem;
`;

const AgentPhoto = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ED7E13;
`;

const AgentInfo = styled.div`
  flex: 1;
  h3 { color: #E0E0FF; font-size: 1.1rem; margin-bottom: 4px; }
  p { color: #8B8B9E; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; }
`;

const StatusBadge = styled.span`
  font-size: 0.7rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid ${p => p.active ? '#00FF94' : '#FF3366'};
  color: ${p => p.active ? '#00FF94' : '#FF3366'};
  background: ${p => p.active ? 'rgba(0,255,148,0.1)' : 'rgba(255,51,102,0.1)'};
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 520px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: #0A0A0F; }
  &::-webkit-scrollbar-thumb { background: #1F1F2E; border-radius: 4px; }
`;

const EventItem = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 6px;
  background: #0D0D12;
  border-left: 3px solid ${p => p.borderColor || '#1F1F2E'};
  transition: background 0.15s;

  &:hover { background: #12121A; }
`;

const EventIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.color};
  margin-top: 2px;
`;

const EventBody = styled.div`
  .label {
    color: #E0E0FF;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .detail {
    color: #8B8B9E;
    font-size: 0.75rem;
    font-family: 'JetBrains Mono', monospace;
  }
  .ip {
    color: #00F2FF;
    font-size: 0.7rem;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 2px;
    opacity: 0.7;
  }
`;

const EventTime = styled.div`
  color: #3A3A4E;
  font-size: 0.7rem;
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
  text-align: right;
`;

const TotalBadge = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: #8B8B9E;
  margin-bottom: 1rem;
  span { color: #ED7E13; font-weight: bold; }
`;

const ERROR_BOX = styled.div`
  color: #FF3366;
  background: rgba(255, 51, 102, 0.08);
  border: 1px solid #FF3366;
  padding: 12px 16px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
`;

const EVENT_CONFIG = {
    LOGIN: { icon: <CheckCircle size={16} />, color: '#00F2FF', border: '#00F2FF' },
    LOGIN_FAIL: { icon: <XCircle size={16} />, color: '#FF3366', border: '#FF3366' },
    RISK: { icon: <AlertTriangle size={16} />, color: '#ED7E13', border: '#ED7E13' },
    LMS_VIDEO: { icon: <Film size={16} />, color: '#9B59B6', border: '#9B59B6' },
    NEW_DEVICE: { icon: <Monitor size={16} />, color: '#00BCD4', border: '#00BCD4' },
    ADMIN_ACTION: { icon: <Shield size={16} />, color: '#E0E0FF', border: '#E0E0FF' },
};

const formatCpf = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
};

const ForensicTimeline = () => {
    const [cpf, setCpf] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        const cleanCpf = cpf.replace(/\D/g, '');
        if (cleanCpf.length !== 11) {
            setError('CPF inválido. Digite os 11 dígitos.');
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await api.get(`/admin/nexus/watchtower/timeline?cpf=${cleanCpf}`);
            setData(res);
        } catch (e) {
            setError(e?.message || 'Erro ao buscar timeline.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <Wrap>
            <SectionTitle>
                <Search size={22} color="#ED7E13" />
                FORENSIC // <span>TIMELINE</span>
            </SectionTitle>

            <SearchRow>
                <CpfInput
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={e => setCpf(formatCpf(e.target.value))}
                    onKeyDown={handleKeyDown}
                    maxLength={14}
                />
                <SearchBtn onClick={handleSearch} disabled={loading}>
                    <Search size={16} />
                    {loading ? 'Rastreando...' : 'Rastrear'}
                </SearchBtn>
            </SearchRow>

            {error && <ERROR_BOX>⚠️ {error}</ERROR_BOX>}

            {data && (
                <>
                    <AgentCard active={data.licenciada.is_active}>
                        <AgentPhoto
                            src={data.licenciada.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.licenciada.name)}&background=0A3E60&color=ED7E13`}
                            alt={data.licenciada.name}
                            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=?&background=1F1F2E&color=8B8B9E`; }}
                        />
                        <AgentInfo>
                            <h3>{data.licenciada.name}</h3>
                            <p>ID: {data.licenciada.id}  ·  {data.licenciada.instagram || data.licenciada.email}</p>
                            {data.licenciada.last_login_at && (
                                <p>Último acesso: {new Date(data.licenciada.last_login_at).toLocaleString('pt-BR')}</p>
                            )}
                        </AgentInfo>
                        <StatusBadge active={data.licenciada.is_active}>
                            {data.licenciada.is_active ? '● ATIVA' : '○ INATIVA'}
                        </StatusBadge>
                    </AgentCard>

                    <TotalBadge>
                        <span>{data.total_events}</span> eventos encontrados na timeline forense
                    </TotalBadge>

                    <EventList>
                        {data.events.map((ev, i) => {
                            const cfg = EVENT_CONFIG[ev.type] || EVENT_CONFIG.ADMIN_ACTION;
                            return (
                                <EventItem key={i} borderColor={cfg.border}>
                                    <EventIcon color={cfg.color}>{cfg.icon}</EventIcon>
                                    <EventBody>
                                        <div className="label">{ev.label}</div>
                                        {ev.detail && <div className="detail">{ev.detail}</div>}
                                        {ev.ip && <div className="ip">📡 {ev.ip}</div>}
                                    </EventBody>
                                    <EventTime>
                                        {new Date(ev.timestamp).toLocaleString('pt-BR', {
                                            day: '2-digit', month: '2-digit',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </EventTime>
                                </EventItem>
                            );
                        })}

                        {data.events.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#3A3A4E', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>
                                Nenhum evento registrado para esta licenciada.
                            </div>
                        )}
                    </EventList>
                </>
            )}
        </Wrap>
    );
};

export default ForensicTimeline;
