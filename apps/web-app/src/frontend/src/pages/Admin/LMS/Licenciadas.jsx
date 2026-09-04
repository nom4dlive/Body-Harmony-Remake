import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Users, Search, Heart, UserCircle2, BookOpen, Download, 
  Award, Activity, X, Loader2, Sparkles 
} from 'lucide-react';
import { api } from '../../../services/api';
import ResponsiveDataTable from '../../../components/ui/ResponsiveDataTable';

const PageHeader = styled.div`
  margin-bottom: 1.25rem;
  .welcome-msg {
    color: #64748B;
    font-size: 0.85rem;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const Toolbar = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F8FAFC;
  border-radius: 12px 12px 0 0;
  border: 1px solid #E2E8F0;
  border-bottom: none;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
`;

const SearchInput = styled.div`
  position: relative;
  
  input {
    padding: 0.55rem 1rem 0.55rem 2.4rem;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    width: 280px;
    font-family: inherit;
    font-size: 0.85rem;
    transition: all 0.2s;
    background: white;
    
    &:focus {
      outline: none;
      border-color: #ED7E13;
      box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.1);
    }

    @media (max-width: 768px) {
      width: 100%;
    }
  }
  
  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #CBD5E1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    color: #94A3B8;
  }
`;

const ProgressInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  min-width: 120px;

  .stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
    font-weight: 600;
    color: #64748B;
  }
`;

const MiniProgressBar = styled.div`
  height: 5px;
  background: #E2E8F0;
  border-radius: 6px;
  overflow: hidden;

  .fill {
    height: 100%;
    background: ${props => (props.percent >= 100 ? '#10B981' : '#ED7E13')};
    width: ${props => props.percent || 0}%;
    transition: width 0.4s ease;
  }
`;

const ActionButton = styled.button`
  background: ${props => (props.$secondary ? '#F8FAFC' : '#0A3E60')};
  color: ${props => (props.$secondary ? '#0A3E60' : 'white')};
  border: 1px solid ${props => (props.$secondary ? '#CBD5E1' : '#0A3E60')};
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;
  min-height: 36px;
  white-space: nowrap;

  &:hover {
    background: ${props => (props.$secondary ? '#F1F5F9' : '#0C4A75')};
    transform: translateY(-1px);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 10, 16, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: #050A10;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const ModalHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);

  h3 { 
    margin: 0; 
    color: #ED7E13; 
    font-size: 0.95rem; 
    font-weight: 800; 
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  
  button { 
    background: rgba(255,255,255,0.05); 
    border: 1px solid rgba(255,255,255,0.1); 
    color: white; 
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { 
      background: #ED7E13; 
      color: black;
      border-color: #ED7E13;
    }
  }
`;

const LogList = styled.div`
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const LogItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.2s;

  &:hover {
    background: rgba(237, 126, 19, 0.05);
    border-color: rgba(237, 126, 19, 0.15);
  }

  .msg { 
    color: rgba(255, 255, 255, 0.9); 
    font-size: 0.82rem; 
    font-weight: 600;
  }
  
  .meta { 
    color: rgba(255, 255, 255, 0.4); 
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
  }

  .device-tag {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.7);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
  }
`;

const LicenciadasLMS = () => {
  const [licenciadas, setLicenciadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchLicenciadas();
  }, []);

  const fetchLicenciadas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getGestorLicenciadas();
      setLicenciadas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar licenciadas:", err);
      setError("Não conseguimos carregar a lista de licenciadas no momento. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (student, showAll = false) => {
    setSelectedStudent(student);
    setLoadingLogs(true);
    if (!showAll) setLogs([]);
    try {
      const response = await api.getStudentRecentLogs(student.id, showAll);
      if (response.success) {
        setLogs(response.logs || []);
        student.isFullHistory = response.isFullHistory;
      }
    } catch (err) {
      console.error("Erro ao carregar logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const filteredLicenciadas = (licenciadas || []).filter(s =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#0A3E60' }}>
        <Loader2 className="animate-spin" size={36} style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Carregando dados das licenciadas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FEE2E2' }}>
        <h3 style={{ color: '#991B1B', margin: '0 0 0.5rem 0' }}>Erro ao carregar licenciadas</h3>
        <p style={{ color: '#B91C1C', fontSize: '0.85rem', margin: 0 }}>{error}</p>
        <button
          onClick={fetchLicenciadas}
          style={{ marginTop: '1rem', background: '#0A3E60', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const columns = [
    {
      key: 'name',
      label: 'Nome da Profissional',
      isTitle: true,
      width: '35%',
      render: (_, s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar>
            {s.photo ? (
              <img src={s.photo} alt={s.name} onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <UserCircle2 size={22} />
            )}
          </Avatar>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, color: '#0A3E60', fontSize: '0.88rem' }}>{s.name}</span>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>@{s.username}</span>
          </div>
        </div>
      )
    },
    {
      key: 'progress_percent',
      label: 'Progresso no LMS',
      width: '30%',
      render: (percent, s) => (
        <ProgressInfo>
          <div className="stats">
            <span>{s.completed_lessons || 0}/{s.total_lessons || 0} aulas</span>
            <span>{percent || 0}%</span>
          </div>
          <MiniProgressBar percent={percent || 0}>
            <div className="fill" />
          </MiniProgressBar>
        </ProgressInfo>
      )
    },
    {
      key: 'stats',
      label: 'Estatísticas',
      width: '20%',
      render: (_, s) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: '#64748B', gap: '2px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={12} color="#0A3E60" /> {s.study_hours || 0}h estudo
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download size={12} color="#0A3E60" /> {s.download_count || 0} mats
          </span>
          {s.badge_count > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ED7E13', fontWeight: 700 }}>
              <Award size={12} /> {s.badge_count} conquistas
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      isAction: true,
      width: '15%',
      render: (_, s) => (
        <ActionButton $secondary onClick={() => fetchLogs(s)}>
          <Activity size={14} /> Atividade
        </ActionButton>
      )
    }
  ];

  return (
    <div>
      <PageHeader>
        <h2 style={{ margin: 0, color: '#0A3E60', fontWeight: 800, fontSize: '1.25rem' }}>Gestão de Licenciadas</h2>
        <div className="welcome-msg">
          <Heart size={14} color="#ED7E13" />
          Acompanhamento em tempo real da evolução e engajamento da rede de licenciadas.
        </div>
      </PageHeader>

      <Toolbar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="#ED7E13" />
          <h3 style={{ margin: 0, color: '#0A3E60', fontSize: '0.95rem', fontWeight: 700 }}>Base de Profissionais ({filteredLicenciadas.length})</h3>
        </div>
        <SearchInput>
          <Search size={15} />
          <input
            placeholder="Buscar por nome ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>
      </Toolbar>

      <ResponsiveDataTable
        columns={columns}
        data={filteredLicenciadas}
        keyExtractor="id"
        emptyTitle="Nenhuma licenciada encontrada"
        emptyMessage="Não encontramos registros para o termo pesquisado."
      />

      {/* Activity Modal */}
      {selectedStudent && (
        <ModalOverlay onClick={() => setSelectedStudent(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h3>Atividade: {selectedStudent.name}</h3>
              <button onClick={() => setSelectedStudent(null)} aria-label="Fechar">
                <X size={16} />
              </button>
            </ModalHeader>
            <LogList>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                REGISTROS FORENSES (ÚLTIMAS 24H)
              </p>

              {loadingLogs ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                  <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto' }} />
                  <p style={{ fontSize: '0.78rem', marginTop: '6px' }}>Consultando histórico...</p>
                </div>
              ) : logs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                  Nenhuma atividade registrada nas últimas 24h.
                </div>
              ) : (
                logs.map((log, idx) => (
                  <LogItem key={idx}>
                    <span className="msg">{log.message}</span>
                    <div className="meta">
                      <span className="device-tag">{log.device || 'Web'}</span>
                      {log.context && <span style={{ color: '#ED7E13', fontWeight: 600 }}>{log.context}</span>}
                      <span>{new Date(log.time).toLocaleTimeString('pt-BR')} • {new Date(log.time).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </LogItem>
                ))
              )}

              {!loadingLogs && logs.length > 0 && !selectedStudent.isFullHistory && (
                <ActionButton
                  $secondary
                  style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}
                  onClick={() => fetchLogs(selectedStudent, true)}
                >
                  <Sparkles size={14} /> Carregar Histórico Completo
                </ActionButton>
              )}
            </LogList>
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <ActionButton style={{ width: '100%', justifyContent: 'center', height: '40px' }} onClick={() => setSelectedStudent(null)}>
                FECHAR
              </ActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
};

export default LicenciadasLMS;
