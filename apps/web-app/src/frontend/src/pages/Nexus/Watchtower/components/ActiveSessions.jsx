import React, { useState } from 'react';
import styled from 'styled-components';
import { Shield, Globe, Clock, Trash2, Smartphone } from 'lucide-react';
import { api } from '../../../../services/api';

const Container = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }
`;

const Form = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 15px;
  border-radius: 6px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: #000;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SessionItem = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid ${({ isActive, theme }) => isActive ? theme.colors.success : theme.colors.border};
  padding: 15px;
  border-radius: 8px;
  position: relative;
  opacity: ${({ isActive }) => isActive ? 1 : 0.6};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const DeviceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ isActive, theme }) => isActive ? theme.colors.success : theme.colors.textSecondary};
  box-shadow: ${({ isActive, theme }) => isActive ? `0 0 8px ${theme.colors.success}` : 'none'};
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  div {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const TerminateBtn = styled.button`
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
  border: 1px solid #ff4444;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ff4444;
    color: white;
  }
`;

export default function ActiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false); // Changed to false initially as we wait for search
  const [studentId, setStudentId] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await api.request(`/v1/admin/sessions?licenciada_id=${studentId}`);
      setSessions(res.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async (sessionId) => {
    if (!window.confirm("Deseja realmente derrubar esta sessão?")) return;
    try {
      await api.request('/v1/admin/sessions/terminate', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId })
      });
      const res = await api.request(`/v1/admin/sessions?licenciada_id=${studentId}`);
      setSessions(res.sessions || []);
    } catch (err) {
      alert("Erro ao encerrar sessão");
    }
  };

  return (
    <Container>
      <Header>
        <h3>
          <Shield size={20} color="#00F2FF" />
          Inspetor de Sessões
        </h3>
        {sessions.length > 0 && (
          <span style={{ fontSize: '0.8rem', color: '#8B8B9E' }}>
            {sessions[0].student_name}
          </span>
        )}
      </Header>

      <Form onSubmit={handleSearch}>
        <Input
          type="text"
          placeholder="Nome, CPF ou ID da licenciada..."
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
        />
        <Button type="submit">Buscar</Button>
      </Form>

      <SessionList>
        {loading && <p style={{ color: '#8B8B9E', textAlign: 'center' }}>Buscando dados...</p>}
        {!loading && sessions.length === 0 && studentId && (
          <p style={{ color: '#8B8B9E', textAlign: 'center' }}>Nenhuma sessão encontrada para este ID.</p>
        )}

        {sessions.map(session => (
          <SessionItem key={session.id} isActive={session.is_active}>
            <div style={{ flex: 1 }}>
              <DeviceInfo>
                <StatusDot isActive={session.is_active} />
                <Smartphone size={16} /> {session.device_hint || 'Desconhecido'}
              </DeviceInfo>
              <MetaGrid>
                <div>
                  <Globe size={14} /> {session.ip_address || 'N/A'}
                </div>
                <div>
                  <Clock size={14} /> {new Date(session.last_used_at).toLocaleString()}
                </div>
              </MetaGrid>
            </div>
            {session.is_active == 1 && (
              <TerminateBtn
                onClick={() => handleTerminate(session.id)}
                title="Derrubar Sessão"
              >
                <Trash2 size={16} />
              </TerminateBtn>
            )}
          </SessionItem>
        ))}
      </SessionList>
    </Container>
  );
}
