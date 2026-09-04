import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageCircle, 
  Copy, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(5, 26, 41, 0.75);
  backdrop-filter: blur(8px);
  z-index: 2500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-end;
  }
`;

const DragHandle = styled.div`
  display: none;
  width: 44px;
  height: 5px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 9999px;
  margin: 8px auto 4px auto;

  @media (max-width: 768px) {
    display: block;
  }
`;

const ModalContainer = styled(motion.div)`
  background: #FFFFFF;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  border: 1px solid #E2E8F0;
  position: relative;

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: calc(100dvh - 20px);
    border-radius: 20px 20px 0 0;
    border-bottom: none;
  }
`;

const TicketHeader = styled.div`
  background: linear-gradient(135deg, #0A3E60 0%, #051A29 100%);
  color: #FFFFFF;
  padding: 1.75rem 1.5rem 1.5rem;
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

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(237, 126, 19, 0.8);
  }
`;

const TicketBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%);
  color: #FFFFFF;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const TicketBody = styled.div`
  padding: 2rem 1.5rem 1.5rem;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
`;

const QrWrapper = styled.div`
  background: #FFFFFF;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 12px rgba(10, 62, 96, 0.08);
  text-align: center;

  img {
    display: block;
    width: 180px;
    height: 180px;
    border-radius: 0.5rem;
  }
`;

const CodeBadge = styled.div`
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: 800;
  color: #0A3E60;
  background: #E2E8F0;
  padding: 0.35rem 1rem;
  border-radius: 0.5rem;
  letter-spacing: 1.5px;
  margin-top: 0.5rem;
`;

const DetailsGrid = styled.div`
  width: 100%;
  background: #FFFFFF;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-size: 0.85rem;

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #F1F5F9;
    padding-bottom: 0.4rem;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .label {
      color: #64748B;
      font-weight: 600;
    }

    .val {
      font-weight: 700;
      color: #0A3E60;
    }
  }
`;

const ActionsRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const PrimaryButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #25D366;
  color: #FFFFFF;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
  transition: all 0.2s;

  &:hover {
    background: #20BA59;
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #FFFFFF;
  color: #0A3E60;
  border: 1px solid #CBD5E1;
  padding: 0.65rem 1rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #ED7E13;
    color: #ED7E13;
  }
`;

export default function TicketModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const isCongress = order.source_type === 'congress_registration' || (order.ticket_token && order.ticket_token.startsWith('TKT-CONG-'));
  const ticketToken = order.ticket_token || order.ticket_code || `tok_ing_${order.id}`;
  const ticketCode = order.ticket_code || (isCongress ? ticketToken : `BH-ING-2026-${String(order.id).padStart(4, '0')}`);
  const validationUrl = `https://bodyharmony.com.br/validar-ingresso/${ticketToken}`;
  const qrData = isCongress ? `BH-CONG-2026|${ticketToken}|${order.customer_cpf || ''}` : validationUrl;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

  const customerName = order.customer_name || 'Participante';
  const customerPhone = (order.customer_phone || '').replace(/\D/g, '');
  const productName = order.product_name || (isCongress ? 'Passaporte Congresso Brasileiro de EMS' : 'Ingresso Body Harmony 2026');

  const whatsappMsg = `Olá ${customerName}! 🎉\n\nSeu *${productName}* foi confirmado e emitido com sucesso pela Body Harmony!\n\n🎟️ *Código do Ingresso:* ${ticketCode}\n📅 *Data:* 07 de Novembro de 2026\n📍 *Local:* Espaço Full Sales — Shopping JK Iguatemi, São Paulo/SP\n\n📱 *Acesse seu Ingresso Digital e QR Code oficial de credenciamento no link:*\n${validationUrl}\n\nApresente o QR Code na recepção para entrada rápida! Nos vemos lá! ✨`;

  const whatsappUrl = `https://wa.me/55${customerPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(validationUrl);
    alert('Link do Ingresso Digital copiado para a área de transferência!');
  };

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <DragHandle />
          <TicketHeader>
            <CloseButton onClick={onClose}>
              <X size={18} />
            </CloseButton>
            <TicketBadge>
              <Sparkles size={12} /> Passaporte Oficial · Body Harmony
            </TicketBadge>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.25rem 0', color: '#FFFFFF' }}>
              {productName}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#ED7E13', fontWeight: 700 }}>
              07 de Novembro de 2026 · São Paulo / SP
            </div>
          </TicketHeader>

          <TicketBody>
            <QrWrapper>
              <img src={qrApiUrl} alt={`QR Code ${ticketCode}`} />
              <CodeBadge>{ticketCode}</CodeBadge>
            </QrWrapper>

            <DetailsGrid>
              <div className="row">
                <span className="label">Titular:</span>
                <span className="val">{customerName}</span>
              </div>
              <div className="row">
                <span className="label">Pedido:</span>
                <span className="val">#{order.id}</span>
              </div>
              <div className="row">
                <span className="label">Status:</span>
                <span className="val" style={{ color: '#166534' }}>✓ Validado / Emitido</span>
              </div>
              <div className="row">
                <span className="label">Credenciamento:</span>
                <span className="val" style={{ color: order.checked_in ? '#166534' : '#ED7E13' }}>
                  {order.checked_in ? '✓ Check-in Realizado' : '⏳ Disponível para Entrada'}
                </span>
              </div>
            </DetailsGrid>

            <ActionsRow>
              {customerPhone && (
                <PrimaryButton 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} /> Enviar Ingresso via WhatsApp
                </PrimaryButton>
              )}

              <SecondaryButton onClick={handleCopyLink}>
                <Copy size={16} /> Copiar Link do Ingresso Digital
              </SecondaryButton>

              <SecondaryButton onClick={() => window.open(validationUrl, '_blank')}>
                <ExternalLink size={16} /> Visualizar Ingresso do Cliente
              </SecondaryButton>
            </ActionsRow>
          </TicketBody>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
}
