import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
  User, ShieldCheck, FileText, Calendar, Send, Copy, 
  ExternalLink, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, MapPin, Phone, Mail
} from 'lucide-react';
import { crmApi } from '../../../services/api';

const Container = styled.div`
  min-height: 100vh;
  background: #070D18;
  color: #F8FAFC;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 0.85rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.875rem;
`;

const HeaderCard = styled.div`
  background: linear-gradient(135deg, rgba(10, 62, 96, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%);
  border: 1px solid rgba(237, 126, 19, 0.25);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #0A3E60;
    border: 2px solid #ED7E13;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #FFFFFF;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .info {
    flex: 1;
    min-width: 0;

    .name {
      font-size: 1rem;
      font-weight: 700;
      color: #FFFFFF;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 0.25rem;
    }

    .badge-wrapper {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${props => props.$bg || 'rgba(10, 62, 96, 0.4)'};
  color: ${props => props.$color || '#38BDF8'};
  border: 1px solid ${props => props.$border || 'rgba(56, 189, 248, 0.3)'};
`;

const SectionCard = styled.div`
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  .card-title {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94A3B8;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .data-grid {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .data-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8rem;

    .label {
      color: #94A3B8;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .value {
      font-weight: 600;
      color: #F1F5F9;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
  }
`;

const ActionButton = styled.button`
  min-height: 44px;
  width: 100%;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  padding: 0.6rem 1rem;
  box-sizing: border-box;

  background: ${props => props.$primary 
    ? 'linear-gradient(135deg, #ED7E13 0%, #D96B0A 100%)' 
    : 'rgba(10, 62, 96, 0.5)'};
  color: ${props => props.$primary ? '#FFFFFF' : '#38BDF8'};
  border: 1px solid ${props => props.$primary ? '#ED7E13' : 'rgba(56, 189, 248, 0.3)'};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.1);
    box-shadow: 0 4px 14px ${props => props.$primary ? 'rgba(237, 126, 19, 0.35)' : 'rgba(10, 62, 96, 0.4)'};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const Toast = styled.div`
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid ${props => props.$success ? '#10B981' : '#ED7E13'};
  color: #FFFFFF;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: fadeIn 0.3s ease;
`;

export default function DossierEmbedPage() {
  const [searchParams] = useSearchParams();
  const rawPhone = searchParams.get('phone') || searchParams.get('phone_number') || '';
  
  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState(null);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDossier = async () => {
    if (!rawPhone) {
      setLoading(false);
      setError('Nenhum número de telefone recebido via query param (?phone=...)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await crmApi.getDossier(rawPhone);
      if (res && res.success && res.dossier) {
        setDossier(res.dossier);
      } else {
        setError('Não foi possível resolver o dossiê.');
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados do dossiê.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [rawPhone]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setActionStatus({ success: true, message: `${label} copiado!` });
    setTimeout(() => setActionStatus(null), 3000);
  };

  const handleTriggerContract = async () => {
    if (!dossier) return;
    setSubmitting(true);
    try {
      const data = dossier.data || {};
      const res = await crmApi.triggerContract({
        phone: rawPhone,
        candidate_name: data.nome || 'Licenciada',
        sign_url: data.sign_url || 'https://bodyharmony.com.br/assinar'
      });
      if (res.success) {
        setActionStatus({ success: true, message: '✓ Contrato enviado via WhatsApp Jurídico!' });
      } else {
        setActionStatus({ success: false, message: 'Falha ao disparar contrato.' });
      }
    } catch (err) {
      setActionStatus({ success: false, message: 'Erro: ' + err.message });
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionStatus(null), 4000);
    }
  };

  const handleTriggerMentorship = async () => {
    if (!dossier) return;
    setSubmitting(true);
    try {
      const data = dossier.data || {};
      const res = await crmApi.triggerMentorship({
        phone: rawPhone,
        mentee_name: data.nome || 'Licenciada',
        datetime: 'Hoje às 19:00',
        meeting_link: 'https://meet.google.com/body-harmony-mentoria'
      });
      if (res.success) {
        setActionStatus({ success: true, message: '✓ Lembrete enviado via WhatsApp Licenciadas!' });
      } else {
        setActionStatus({ success: false, message: 'Falha ao agendar mentoria.' });
      }
    } catch (err) {
      setActionStatus({ success: false, message: 'Erro: ' + err.message });
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionStatus(null), 4000);
    }
  };

  if (loading) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <RefreshCw className="animate-spin" size={24} color="#ED7E13" />
        <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Carregando Dossiê 360º...</span>
      </Container>
    );
  }

  const data = dossier?.data || {};
  const isLicenciada = dossier?.tipo_usuario === 'LICENCIADA';
  const isAluna = dossier?.tipo_usuario === 'ALUNA';
  const isOnboarding = dossier?.tipo_usuario === 'ONBOARDING';

  return (
    <Container>
      {actionStatus && (
        <Toast $success={actionStatus.success}>
          {actionStatus.success ? <CheckCircle2 size={16} color="#10B981" /> : <AlertTriangle size={16} color="#ED7E13" />}
          <span>{actionStatus.message}</span>
        </Toast>
      )}

      {/* Header Profile */}
      <HeaderCard>
        <div className="avatar">
          {data.nome ? data.nome.charAt(0).toUpperCase() : <User size={22} />}
        </div>
        <div className="info">
          <div className="name" title={data.nome || 'Contato Desconhecido'}>
            {data.nome || 'Contato Desconhecido'}
          </div>
          <div className="badge-wrapper">
            {isLicenciada && <Badge $bg="rgba(237, 126, 19, 0.2)" $color="#ED7E13" $border="rgba(237, 126, 19, 0.4)">👑 Licenciada Oficial</Badge>}
            {isAluna && <Badge $bg="rgba(56, 189, 248, 0.2)" $color="#38BDF8" $border="rgba(56, 189, 248, 0.4)">🎓 Aluna</Badge>}
            {isOnboarding && <Badge $bg="rgba(168, 85, 247, 0.2)" $color="#C084FC" $border="rgba(168, 85, 247, 0.4)">🚀 Onboarding</Badge>}
            {dossier?.tipo_usuario === 'LEAD' && <Badge $bg="rgba(34, 197, 94, 0.2)" $color="#4ADE80" $border="rgba(34, 197, 94, 0.4)">🎯 Lead Loja</Badge>}
            {dossier?.tipo_usuario === 'DESCONHECIDO' && <Badge $bg="rgba(100, 116, 139, 0.2)" $color="#94A3B8" $border="rgba(100, 116, 139, 0.4)">❓ Não Cadastrado</Badge>}
          </div>
        </div>
      </HeaderCard>

      {/* Dados Cadastrais */}
      <SectionCard>
        <div className="card-title">
          <User size={13} color="#ED7E13" />
          <span>Dados Cadastrais</span>
        </div>
        <div className="data-grid">
          <div className="data-item">
            <span className="label"><ShieldCheck size={13} /> CPF / Doc:</span>
            <span className="value">
              {data.cpf || 'Não informado'}
              {data.cpf && (
                <Copy size={13} style={{ cursor: 'pointer', color: '#38BDF8' }} onClick={() => handleCopy(data.cpf, 'CPF')} />
              )}
            </span>
          </div>
          <div className="data-item">
            <span className="label"><MapPin size={13} /> Cidade/UF:</span>
            <span className="value">{data.cidade_uf || 'Não informada'}</span>
          </div>
          <div className="data-item">
            <span className="label"><Phone size={13} /> WhatsApp:</span>
            <span className="value">{rawPhone}</span>
          </div>
          {data.email && (
            <div className="data-item">
              <span className="label"><Mail size={13} /> E-mail:</span>
              <span className="value" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.email}</span>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Status do Contrato */}
      <SectionCard>
        <div className="card-title">
          <FileText size={13} color="#ED7E13" />
          <span>Status do Contrato</span>
        </div>
        <div className="data-grid">
          <div className="data-item">
            <span className="label">Situação:</span>
            <span className="value">
              {data.status_contrato === 'SIGNED' ? (
                <Badge $bg="rgba(16, 185, 129, 0.2)" $color="#34D399" $border="rgba(16, 185, 129, 0.4)">✓ Assinado Digitalmente</Badge>
              ) : data.status_contrato === 'PENDING' || data.status_contrato === 'PENDING_SIGNATURE' ? (
                <Badge $bg="rgba(234, 179, 8, 0.2)" $color="#FACC15" $border="rgba(234, 179, 8, 0.4)">⏳ Aguardando Assinatura</Badge>
              ) : (
                <Badge $bg="rgba(148, 163, 184, 0.2)" $color="#CBD5E1" $border="rgba(148, 163, 184, 0.4)">{data.status_contrato || 'SEM CONTRATO'}</Badge>
              )}
            </span>
          </div>

          {data.sign_url && (
            <div className="data-item" style={{ marginTop: '0.2rem' }}>
              <span className="label">Link de Assinatura:</span>
              <span className="value">
                <Copy size={13} style={{ cursor: 'pointer', color: '#ED7E13' }} onClick={() => handleCopy(data.sign_url, 'Link de Assinatura')} />
                <a href={data.sign_url} target="_blank" rel="noopener noreferrer" style={{ color: '#38BDF8', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  <ExternalLink size={13} />
                </a>
              </span>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Resumo Financeiro */}
      {data.financial_summary && (
        <SectionCard>
          <div className="card-title">
            <Sparkles size={13} color="#ED7E13" />
            <span>Resumo Financeiro</span>
          </div>
          <div className="data-grid">
            <div className="data-item">
              <span className="label">Situação de Taxas:</span>
              <span className="value">
                {data.financial_summary.status_financeiro === 'EM_DIA' || data.financial_summary.status_financeiro === 'REGULAR' ? (
                  <Badge $bg="rgba(16, 185, 129, 0.2)" $color="#34D399" $border="rgba(16, 185, 129, 0.4)">✓ Em Dia</Badge>
                ) : (
                  <Badge $bg="rgba(239, 68, 68, 0.2)" $color="#F87171" $border="rgba(239, 68, 68, 0.4)">⚠ Pendente</Badge>
                )}
              </span>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Ações Rápidas (Gatilhos Reativos) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem' }}>
        <ActionButton $primary onClick={handleTriggerContract} disabled={submitting}>
          <Send size={15} />
          <span>⚖️ Disparar Contrato (Jurídico WhatsApp)</span>
        </ActionButton>

        <ActionButton onClick={handleTriggerMentorship} disabled={submitting}>
          <Calendar size={15} />
          <span>👑 Agendar Mentoria (Licenciadas WhatsApp)</span>
        </ActionButton>
      </div>
    </Container>
  );
}
