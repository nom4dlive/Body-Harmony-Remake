import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Calendar, 
  MapPin, 
  User, 
  ShieldCheck, 
  QrCode as QrIcon, 
  ArrowLeft,
  Clock,
  ExternalLink
} from 'lucide-react';
import { shopApi } from '../../services/api';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8FAFC;
  font-family: 'Montserrat', sans-serif;
  padding: 2rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Card = styled.div`
  background: #FFFFFF;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 20px 40px -10px rgba(10, 62, 96, 0.12);
  border: 1px solid #E2E8F0;
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #0A3E60 0%, #051A29 100%);
  color: #FFFFFF;
  padding: 2.25rem 1.5rem 1.75rem;
  text-align: center;
  position: relative;
  border-bottom: 2px dashed rgba(237, 126, 19, 0.4);

  &::before, &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    width: 24px;
    height: 24px;
    background: #F8FAFC;
    border-radius: 50%;
  }

  &::before { left: -12px; }
  &::after { right: -12px; }
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%);
  color: #FFFFFF;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.3rem 0.85rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
`;

const StatusBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  font-weight: 800;
  font-size: 0.95rem;
  background: ${props => props.$valid ? 'rgba(37, 211, 102, 0.12)' : 'rgba(239, 68, 68, 0.12)'};
  color: ${props => props.$valid ? '#166534' : '#991B1B'};
  border-bottom: 1px solid ${props => props.$valid ? '#BBF7D0' : '#FECACA'};
`;

const Body = styled.div`
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const QrWrapper = styled.div`
  background: #FFFFFF;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 14px rgba(10, 62, 96, 0.06);
  text-align: center;

  img {
    display: block;
    width: 200px;
    height: 200px;
    border-radius: 0.5rem;
  }
`;

const DetailsTable = styled.div`
  width: 100%;
  background: #F8FAFC;
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.9rem;

  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 0.5rem;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .k {
      color: #64748B;
      font-weight: 600;
    }

    .v {
      font-weight: 800;
      color: #0A3E60;
    }
  }
`;

export default function PublicTicketValidatePage() {
  const { ticketToken } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await shopApi.getPublicTicket(ticketToken);
        if (res && res.data) {
          setTicket(res.data);
        } else {
          setError('Ingresso não encontrado ou inválido.');
        }
      } catch (err) {
        setError('Ingresso não encontrado ou código inválido.');
      } finally {
        setLoading(false);
      }
    }
    if (ticketToken) load();
  }, [ticketToken]);

  if (loading) {
    return (
      <PageContainer>
        <div style={{ color: '#0A3E60', fontWeight: 700, marginTop: '5rem' }}>
          Consultando autenticidade do ingresso...
        </div>
      </PageContainer>
    );
  }

  if (error || !ticket) {
    return (
      <PageContainer>
        <Card>
          <Header style={{ background: '#991B1B' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Ingresso Inválido
            </h1>
          </Header>
          <Body>
            <XCircle size={64} color="#EF4444" />
            <p style={{ color: '#64748B', textAlign: 'center', margin: 0 }}>
              {error || 'Não foi possível encontrar as informações deste ingresso.'}
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#0A3E60',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} /> Voltar ao Início
            </button>
          </Body>
        </Card>
      </PageContainer>
    );
  }

  const isValid = ticket.payment_status === 'PAID';
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}`;

  return (
    <PageContainer>
      <Card>
        <Header>
          <Badge>
            <Sparkles size={14} /> Passaporte Oficial Autenticado
          </Badge>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.35rem 0', color: '#FFFFFF' }}>
            {ticket.product_name || 'Congresso Brasileiro de Musculação Elétrica'}
          </h1>
          <div style={{ fontSize: '0.85rem', color: '#ED7E13', fontWeight: 700 }}>
            07 de Novembro de 2026 · São Paulo / SP
          </div>
        </Header>

        <StatusBanner $valid={isValid}>
          {isValid ? (
            <>
              <CheckCircle2 size={20} /> INGRESSO OFICIAL VÁLIDO E CONFIRMADO
            </>
          ) : (
            <>
              <Clock size={20} /> PAGAMENTO PENDENTE DE VALIDAÇÃO
            </>
          )}
        </StatusBanner>

        <Body>
          <QrWrapper>
            <img src={qrApiUrl} alt={`QR Code ${ticket.ticket_code}`} />
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', color: '#0A3E60', marginTop: '0.5rem' }}>
              {ticket.ticket_code}
            </div>
          </QrWrapper>

          <DetailsTable>
            <div className="item">
              <span className="k">Participante:</span>
              <span className="v">{ticket.customer_name}</span>
            </div>
            <div className="item">
              <span className="k">Código do Ingresso:</span>
              <span className="v" style={{ fontFamily: 'monospace' }}>{ticket.ticket_code}</span>
            </div>
            <div className="item">
              <span className="k">Status de Pagamento:</span>
              <span className="v" style={{ color: isValid ? '#166534' : '#854D0E' }}>
                {isValid ? '✓ Confirmado / Validado' : '⏳ Aguardando'}
              </span>
            </div>
            <div className="item">
              <span className="k">Credenciamento no Evento:</span>
              <span className="v" style={{ color: ticket.checked_in ? '#166534' : '#ED7E13' }}>
                {ticket.checked_in ? '✓ Check-in Realizado' : '⏳ Disponível para Entrada'}
              </span>
            </div>
            {ticket.checked_in && ticket.checked_in_at && (
              <div className="item">
                <span className="k">Data do Check-in:</span>
                <span className="v">{new Date(ticket.checked_in_at).toLocaleString('pt-BR')}</span>
              </div>
            )}
          </DetailsTable>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748B' }}>
            <ShieldCheck size={16} color="#25D366" /> Autenticação Oficial por Criptografia Body Harmony
          </div>
        </Body>
      </Card>
    </PageContainer>
  );
}
