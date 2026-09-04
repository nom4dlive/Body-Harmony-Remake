import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { 
  FaCalendarAlt, FaFileMedical, FaGoogleDrive, FaVideo, 
  FaCreditCard, FaFileContract, FaBookOpen, FaCopy, 
  FaCheck, FaUserCircle, FaSpinner, FaMapMarkerAlt, 
  FaIdCard, FaHeartbeat, FaExternalLinkAlt, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { crmApi } from '../../../services/api';

const SidebarContainer = styled.div`
  background: #F8FAFC;
  min-height: 100vh;
  padding: 0.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #0F172A;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProfileCard = styled.div`
  background: linear-gradient(135deg, #0A3E60 0%, #072B44 100%);
  border-radius: 10px;
  padding: 0.75rem;
  color: #FFFFFF;
  border-bottom: 2px solid #ED7E13;
  box-shadow: 0 2px 8px rgba(10, 62, 96, 0.15);

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.35rem;

    .badge {
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      display: flex;
      align-items: center;
      gap: 0.25rem;

      &.novo {
        background: #0284C7;
        color: #FFFFFF;
      }
      &.recorrente {
        background: #059669;
        color: #FFFFFF;
      }
      &.licenciada {
        background: #ED7E13;
        color: #FFFFFF;
      }
      &.comercial {
        background: #D97706;
        color: #FFFFFF;
      }
    }
  }

  .patient-name {
    font-size: 0.95rem;
    font-weight: 800;
    margin: 0 0 0.2rem 0;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: #FFFFFF;
  }

  .patient-meta {
    font-size: 0.72rem;
    color: #CBD5E1;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;

    span {
      display: flex;
      align-items: center;
      gap: 0.2rem;
    }
  }
`;

const NavTabs = styled.div`
  display: flex;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 0.2rem;
  border: 1px solid #E2E8F0;
`;

const TabButton = styled.button`
  flex: 1;
  min-height: 44px;
  padding: 0.5rem 0.25rem;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active ? '#0A3E60' : 'transparent'};
  color: ${props => props.$active ? '#FFFFFF' : '#64748B'};
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  transition: all 0.15s ease;

  svg {
    color: ${props => props.$active ? '#ED7E13' : 'inherit'};
  }
`;

const CardSection = styled.div`
  background: #FFFFFF;
  border-radius: 10px;
  padding: 0.75rem;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h3 {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 800;
    color: #0A3E60;
    display: flex;
    align-items: center;
    gap: 0.35rem;

    svg {
      color: #ED7E13;
    }
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #475569;
    }

    input, select {
      height: 38px;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      border: 1px solid #CBD5E1;
      font-size: 0.78rem;
      outline: none;
      background: #FFFFFF;

      &:focus {
        border-color: #ED7E13;
      }
    }
  }
`;

const PillButton = styled.button`
  background: ${props => props.$secondary ? '#FFFFFF' : (props.$accent ? '#059669' : '#ED7E13')};
  color: ${props => props.$secondary ? '#0A3E60' : '#FFFFFF'};
  border: ${props => props.$secondary ? '1px solid #CBD5E1' : 'none'};
  border-radius: 22px;
  padding: 0.5rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.15s ease;
  width: 100%;
  min-height: 44px;
  box-shadow: ${props => props.$secondary ? 'none' : '0 2px 6px rgba(237, 126, 19, 0.25)'};

  &:hover {
    filter: brightness(1.08);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CopyBox = styled.div`
  background: #F8FAFC;
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 0.74rem;
  color: #334155;
  border-left: 3px solid #ED7E13;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  .copy-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    color: #0A3E60;
  }

  p {
    margin: 0;
    white-space: pre-wrap;
    line-height: 1.35;
  }
`;

const AccordionToggle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.2rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0A3E60;
  border-top: 1px dashed #E2E8F0;
  margin-top: 0.25rem;
`;

const ExecutiveToast = styled.div`
  background: linear-gradient(135deg, #0A3E60 0%, #07131E 100%);
  border-left: 3px solid #ED7E13;
  color: #FFFFFF;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  font-size: 0.74rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  box-shadow: 0 4px 12px rgba(10, 62, 96, 0.2);
  animation: fadeIn 0.2s ease-out;

  .toast-title {
    font-weight: 800;
    color: #ED7E13;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .toast-desc {
    color: #E2E8F0;
    line-height: 1.3;
  }
`;

const RecentActionsBox = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  padding: 0.5rem 0.65rem;
  border: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  .action-title {
    font-size: 0.72rem;
    font-weight: 800;
    color: #0A3E60;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .action-item {
    font-size: 0.68rem;
    color: #475569;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed #F1F5F9;
    padding-bottom: 0.25rem;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .desc {
      font-weight: 600;
    }

    .time {
      color: #94A3B8;
      font-size: 0.64rem;
    }
  }
`;

export default function CRMCockpitSidebar() {
  const [searchParams] = useSearchParams();
  const rawPhone = searchParams.get('phone') || '';
  const initialName = searchParams.get('name') || '';
  const conversationId = searchParams.get('conversation_id');

  const [activeTab, setActiveTab] = useState('clinica'); // 'clinica', 'comercial', 'guia'
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState(null);

  const showExecutiveToast = (title, description) => {
    setToast({ title, description });
    setTimeout(() => setToast(null), 5000);
  };

  // Form Agendamento
  const [procedure, setProcedure] = useState('Eletroestimulação Muscular - Glúteos + Abdômen');
  const [schedDate, setSchedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState(60);
  const [scheduling, setScheduling] = useState(false);
  const [lastAppointment, setLastAppointment] = useState(null);

  const fetchContext = useCallback(async () => {
    if (!rawPhone) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await crmApi.getCockpitContext(rawPhone, conversationId, initialName);
      if (res?.status === 'success') {
        setContext(res.data);
      }
    } catch (err) {
      console.error("Erro ao carregar contexto:", err);
    } finally {
      setLoading(false);
    }
  }, [rawPhone, conversationId, initialName]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  const copyToClipboard = (text, key, toastTitle = null, toastDesc = null) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (toastTitle) {
      showExecutiveToast(toastTitle, toastDesc || "Texto copiado para a área de transferência.");
    }
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCreateAppointment = async () => {
    if (!context?.contact) return;
    setScheduling(true);
    try {
      const res = await crmApi.createAppointment({
        contact_phone: context.contact.phone_formatted || rawPhone,
        patient_name: context.contact.name || initialName || 'Paciente',
        procedure_name: procedure,
        scheduled_at: schedDate,
        duration_minutes: duration,
        conversation_id: conversationId ? Number(conversationId) : null
      });

      if (res?.status === 'success') {
        setLastAppointment(res.data);
        copyToClipboard(res.data.whatsapp_message, 'appointment_copy');
        showExecutiveToast(
          "Sessão Agendada com Sucesso!",
          res.data.services_summary || "Sincronizado: Google Calendar + Lembretes Anti No-Show (24h/2h) + Nota Privada no Chatwoot."
        );
        fetchContext(); // Recarregar contexto e histórico
        if (res.data.google_calendar_url) {
          window.open(res.data.google_calendar_url, '_blank');
        }
      }
    } catch (err) {
      showExecutiveToast("Falha no Agendamento", err.message);
    } finally {
      setScheduling(false);
    }
  };

  const patientName = context?.contact?.name || initialName || 'Paciente';
  const profileType = context?.profile_type || 'NOVO_PACIENTE';
  const pastAppointments = context?.appointments || [];
  const recentActions = context?.recent_actions || [];

  return (
    <SidebarContainer>
      {/* 1. Header com Perfil Inteligente */}
      <ProfileCard>
        <div className="header-top">
          <span className={`badge ${profileType.toLowerCase()}`}>
            {profileType === 'LICENCIADA' && '👑 Licenciada'}
            {profileType === 'PACIENTE_RECORRENTE' && '⭐ Recorrente'}
            {profileType === 'NOVO_PACIENTE' && '🌱 1ª Sessão'}
            {profileType === 'LEAD_COMERCIAL' && '💼 Lead Vendas'}
          </span>
          {loading && <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />}
        </div>

        <h2 className="patient-name">
          <FaUserCircle />
          <span>{patientName}</span>
        </h2>

        <div className="patient-meta">
          <span>{context?.contact?.phone_formatted || rawPhone}</span>
          {context?.contact?.cidade && (
            <span><FaMapMarkerAlt /> {context.contact.cidade}/{context.contact.uf}</span>
          )}
          {context?.contact?.cpf && (
            <span><FaIdCard /> CPF: {context.contact.cpf}</span>
          )}
        </div>
      </ProfileCard>

      {/* Toast Executivo */}
      {toast && (
        <ExecutiveToast>
          <div className="toast-title">
            <FaCheck /> {toast.title}
          </div>
          <div className="toast-desc">{toast.description}</div>
        </ExecutiveToast>
      )}

      {/* Histórico Rápido de Ações da Conversa */}
      {recentActions.length > 0 && (
        <RecentActionsBox>
          <div className="action-title">
            <FaBookOpen /> Histórico Rápido da Conversa
          </div>
          {recentActions.map((act, i) => (
            <div className="action-item" key={i}>
              <span className="desc">
                {act.type === 'anamnese' && '📋 '}
                {act.type === 'appointment' && '📅 '}
                {act.description}
              </span>
              <span className="time">{act.timestamp ? act.timestamp.slice(0, 10) : ''}</span>
            </div>
          ))}
        </RecentActionsBox>
      )}

      {/* 2. Navegação de Abas */}
      <NavTabs>
        <TabButton $active={activeTab === 'clinica'} onClick={() => setActiveTab('clinica')}>
          <FaHeartbeat />
          <span>💆 Clínico</span>
        </TabButton>
        <TabButton $active={activeTab === 'comercial'} onClick={() => setActiveTab('comercial')}>
          <FaCreditCard />
          <span>💼 Comercial</span>
        </TabButton>
        <TabButton $active={activeTab === 'guia'} onClick={() => setActiveTab('guia')}>
          <FaBookOpen />
          <span>📖 Roteiros</span>
        </TabButton>
      </NavTabs>

      {/* 3. Conteúdo da Aba Clínica */}
      {activeTab === 'clinica' && (
        <>
          {/* Card de Agendamento */}
          <CardSection>
            <h3>
              <FaCalendarAlt />
              <span>Agendar Sessão (Google Calendar)</span>
            </h3>

            <div className="form-row">
              <label>Procedimento:</label>
              <select value={procedure} onChange={(e) => setProcedure(e.target.value)}>
                <option value="Eletroestimulação Muscular - Glúteos + Abdômen">⚡ Eletroestimulação Glúteos + Abdômen</option>
                <option value="Eletroestimulação Muscular - Corpo Inteiro (Full Body)">⚡ Eletroestimulação Full Body</option>
                <option value="Avaliação Estética & Anamnese Clínica">📋 Avaliação Estética & Anamnese</option>
                <option value="Massagem Modeladora & Drenagem">🌸 Massagem Modeladora & Drenagem</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <div className="form-row" style={{ flex: 2 }}>
                <label>Data & Hora:</label>
                <input 
                  type="datetime-local" 
                  value={schedDate} 
                  onChange={(e) => setSchedDate(e.target.value)} 
                />
              </div>

              <div className="form-row" style={{ flex: 1 }}>
                <label>Duração:</label>
                <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  <option value={30}>30m</option>
                  <option value={45}>45m</option>
                  <option value={60}>1h</option>
                  <option value={90}>1h30</option>
                </select>
              </div>
            </div>

            <PillButton onClick={handleCreateAppointment} disabled={scheduling}>
              {scheduling ? (
                <>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Agendando...</span>
                </>
              ) : (
                <>
                  <FaCalendarAlt />
                  <span>Agendar no Calendar & Copiar</span>
                </>
              )}
            </PillButton>

            {lastAppointment && (
              <CopyBox>
                <div className="copy-header">
                  <span>✓ Confirmação Pronta:</span>
                  <button 
                    onClick={() => copyToClipboard(lastAppointment.whatsapp_message, 'copy_sched')}
                    style={{ background: 'none', border: 'none', color: '#ED7E13', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {copiedKey === 'copy_sched' ? '✓ Copiado!' : 'Copiar'}
                  </button>
                </div>
                <p>{lastAppointment.whatsapp_message}</p>
              </CopyBox>
            )}

            {/* Accordion Histórico */}
            {pastAppointments.length > 0 && (
              <>
                <AccordionToggle onClick={() => setShowHistory(prev => !prev)}>
                  <span>Histórico Recente ({pastAppointments.length})</span>
                  {showHistory ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                </AccordionToggle>
                {showHistory && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {pastAppointments.map((ap) => (
                      <div key={ap.id} style={{ fontSize: '0.72rem', background: '#F1F5F9', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                        <strong>{ap.procedure_name}</strong> - {new Date(ap.scheduled_at).toLocaleDateString('pt-BR')} ({ap.status})
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardSection>

          {/* Card de Ficha de Anamnese */}
          <CardSection>
            <h3>
              <FaFileMedical />
              <span>Ficha de Anamnese</span>
            </h3>
            <PillButton 
              $secondary 
              onClick={() => copyToClipboard(
                `Olá, ${patientName}! Para sua segurança e personalização do protocolo, preencha sua Ficha de Anamnese antes da sessão:\n👉 https://forms.gle/4j9XqUuRj2G2V3yMA`,
                'copy_anamnese'
              )}
            >
              {copiedKey === 'copy_anamnese' ? <FaCheck /> : <FaCopy />}
              <span>{copiedKey === 'copy_anamnese' ? 'Link Copiado!' : 'Copiar Link da Anamnese'}</span>
            </PillButton>
          </CardSection>

          {/* Card de Prontuário & Drive */}
          <CardSection>
            <h3>
              <FaGoogleDrive />
              <span>Prontuário & Fotos Drive</span>
            </h3>
            <PillButton 
              $secondary 
              onClick={() => window.open(context?.contact?.drive_folder_url || 'https://drive.google.com/', '_blank')}
            >
              <FaExternalLinkAlt />
              <span>Abrir Pasta da Paciente</span>
            </PillButton>
          </CardSection>
        </>
      )}

      {/* 4. Conteúdo da Aba Comercial */}
      {activeTab === 'comercial' && (
        <>
          {/* Card de Inscrição Congresso */}
          <CardSection>
            <h3>
              <FaCreditCard />
              <span>Ingresso Congresso (Lote VIP)</span>
            </h3>
            <PillButton 
              $accent
              onClick={() => copyToClipboard(
                `Olá, ${patientName}! Garanta sua vaga com lote promocional para o Congresso Nacional Body Harmony aqui:\n👉 https://bodyharmony.com.br/congresso`,
                'copy_congresso'
              )}
            >
              {copiedKey === 'copy_congresso' ? <FaCheck /> : <FaCopy />}
              <span>{copiedKey === 'copy_congresso' ? 'Link Copiado!' : 'Copiar Link do Congresso'}</span>
            </PillButton>
          </CardSection>

          {/* Card de Teleconsulta Google Meet */}
          <CardSection>
            <h3>
              <FaVideo />
              <span>Teleconsulta Google Meet</span>
            </h3>
            <PillButton 
              $secondary
              onClick={() => {
                window.open('https://meet.google.com/new', '_blank');
                copyToClipboard(
                  `Olá, ${patientName}! Segue o link exclusivo da nossa sala do Google Meet para nossa avaliação online:\n👉 https://meet.google.com/new`,
                  'copy_meet'
                );
              }}
            >
              <FaVideo />
              <span>Criar Sala Meet & Copiar</span>
            </PillButton>
          </CardSection>

          {/* Card de Emissão de Contrato */}
          <CardSection>
            <h3>
              <FaFileContract />
              <span>Contrato de Licenciamento</span>
            </h3>
            <PillButton 
              $secondary
              onClick={() => window.open('/portal-gestor/contratos', '_blank')}
            >
              <FaFileContract />
              <span>Abrir Wizard de Contratos</span>
            </PillButton>
          </CardSection>
        </>
      )}

      {/* 5. Conteúdo da Aba Roteiros (Tutoriais & Guias) */}
      {activeTab === 'guia' && (
        <>
          <CardSection>
            <h3>
              <FaHeartbeat />
              <span>Roteiro de Atendimento Clínico</span>
            </h3>
            
            <CopyBox>
              <div className="copy-header">
                <span>1. Boas-vindas Institucional:</span>
                <button 
                  onClick={() => copyToClipboard(`Olá, ${patientName}! Seja muito bem-vinda à Body Harmony. Sou da equipe de atendimento. Como posso te ajudar hoje? 🌸`, 'r1')}
                  style={{ background: 'none', border: 'none', color: '#ED7E13', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {copiedKey === 'r1' ? '✓ Copiado!' : 'Copiar'}
                </button>
              </div>
              <p>Olá, {patientName}! Seja muito bem-vinda à Body Harmony. Sou da equipe de atendimento...</p>
            </CopyBox>

            <CopyBox>
              <div className="copy-header">
                <span>2. Pós-Atendimento (48h):</span>
                <button 
                  onClick={() => copyToClipboard(`Olá, ${patientName}! Passando para saber como você está se sentindo após a sua sessão de eletroestimulação? Sentiu a musculatura ativada? 🌸`, 'r2')}
                  style={{ background: 'none', border: 'none', color: '#ED7E13', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {copiedKey === 'r2' ? '✓ Copiado!' : 'Copiar'}
                </button>
              </div>
              <p>Olá, {patientName}! Passando para saber como você está se sentindo...</p>
            </CopyBox>
          </CardSection>

          <CardSection>
            <h3>
              <FaCreditCard />
              <span>Roteiro Comercial & Vendas</span>
            </h3>
            
            <CopyBox>
              <div className="copy-header">
                <span>1. Apresentação Congresso:</span>
                <button 
                  onClick={() => copyToClipboard(`Olá, ${patientName}! Sou da equipe comercial da Body Harmony. É um prazer falar com você! Nós teremos o maior Congresso Nacional de Musculação Elétrica e Estética de Alta Performance. Quer receber os detalhes e condições de lote? ✨`, 'r3')}
                  style={{ background: 'none', border: 'none', color: '#ED7E13', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {copiedKey === 'r3' ? '✓ Copiado!' : 'Copiar'}
                </button>
              </div>
              <p>Olá, {patientName}! Sou da equipe comercial da Body Harmony. É um prazer falar com você...</p>
            </CopyBox>
          </CardSection>
        </>
      )}
    </SidebarContainer>
  );
}
