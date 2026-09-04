import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Ticket, QrCode, CheckCircle, AlertCircle, Copy, ExternalLink, Calendar, MapPin, Sparkles } from 'lucide-react';
import { congressApi } from '../../../services/api';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(4, 7, 10, 0.88);
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background: #0d1117;
  border: 1px solid rgba(212, 175, 55, 0.35);
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(212, 175, 55, 0.15);
  font-family: 'Montserrat', sans-serif;
  color: #FFFFFF;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(212, 175, 55, 0.3);
  }
`;

const Header = styled.div`
  padding: 1.4rem 1.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, transparent 100%);
`;

const HeaderTitle = styled.div`
  h3 {
    font-size: 1.15rem;
    font-weight: 800;
    margin: 0;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    gap: 0.45rem;

    span {
      color: #f9e27e;
    }
  }

  p {
    font-size: 0.78rem;
    color: #a0a5ad;
    margin: 0.25rem 0 0;
  }
`;

const CloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #FFFFFF;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.2);
    border-color: #d4af37;
    color: #f9e27e;
  }
`;

const Content = styled.div`
  padding: 1.5rem 1.8rem 2rem;
`;

const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #e0e0e0;
  }

  input {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 0.85rem 1rem;
    font-size: 0.95rem;
    color: #FFFFFF;
    font-family: inherit;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #d4af37;
      background: rgba(212, 175, 55, 0.05);
      box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
    }
  }
`;

const SubmitBtn = styled.button`
  background: linear-gradient(135deg, #ED7E13 0%, #d4af37 100%);
  color: #04070a;
  font-weight: 800;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.95rem 1.5rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  min-height: 48px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(237, 126, 19, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CredentialCard = styled(motion.div)`
  background: linear-gradient(145deg, #12161a 0%, #0a0d10 100%);
  border: 2px solid #d4af37;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  position: relative;
  text-align: center;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(212, 175, 55, 0.15);

  &::before {
    content: '★ CREDENCIAL OFICIAL · INGRESSO CONFIRMADO ★';
    display: block;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.15em;
    color: #f9e27e;
    margin-bottom: 0.85rem;
    border-bottom: 1px solid rgba(212, 175, 55, 0.3);
    padding-bottom: 0.4rem;
  }
`;

export default function CongressTicketLookupModal({ isOpen, onClose }) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tickets, setTickets] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);

  const handleIdChange = (e) => {
    let v = e.target.value;
    // Se for puramente dígitos, aplica máscara de CPF
    const onlyDigits = v.replace(/\D/g, '');
    if (!v.includes('@') && onlyDigits.length > 0 && onlyDigits.length <= 11) {
      if (onlyDigits.length > 9) v = onlyDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (onlyDigits.length > 6) v = onlyDigits.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      else if (onlyDigits.length > 3) v = onlyDigits.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      else v = onlyDigits;
    }
    setIdentifier(v);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setTickets(null);

    try {
      const res = await congressApi.lookupTickets(identifier);
      if (res?.ok && Array.isArray(res.data) && res.data.length > 0) {
        setTickets(res.data);
      } else {
        setTickets([]);
        setErrorMsg(res?.message || 'Nenhum ingresso confirmado encontrado para os dados informados.');
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Erro ao realizar consulta. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (token) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Header>
            <HeaderTitle>
              <div>
                <h3>
                  <Ticket size={18} color="#f9e27e" />
                  Consultar <span>Meu Ingresso</span>
                </h3>
                <p>Recupere sua credencial oficial do Congresso Body Harmony</p>
              </div>
            </HeaderTitle>
            <CloseBtn onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </CloseBtn>
          </Header>

          <Content>
            <SearchForm onSubmit={handleSearch}>
              <InputWrapper>
                <label>CPF ou E-mail do Participante</label>
                <input
                  type="text"
                  placeholder="000.000.000-00 ou seu@email.com"
                  value={identifier}
                  onChange={handleIdChange}
                  autoFocus
                  required
                />
              </InputWrapper>
              <SubmitBtn type="submit" disabled={loading || !identifier.trim()}>
                {loading ? 'Consultando...' : <><Search size={18} /> Buscar Ingressos</>}
              </SubmitBtn>
            </SearchForm>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700 }}>{errorMsg}</div>
                  <div style={{ fontSize: '0.74rem', marginTop: '0.35rem', color: '#e5e7eb' }}>
                    Dúvidas? Fale com o suporte oficial via WhatsApp no final da página.
                  </div>
                </div>
              </motion.div>
            )}

            {tickets && tickets.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f9e27e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                  {tickets.length} Ingresso(s) Localizado(s):
                </div>

                {tickets.map((tkt, idx) => (
                  <CredentialCard
                    key={tkt.ticket_token || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f9e27e', marginBottom: '0.2rem' }}>
                      {tkt.tier_name}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {tkt.customer_name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#a0a5ad', marginBottom: '1rem' }}>
                      CPF: {tkt.customer_cpf_masked} · Status: <strong style={{ color: '#4ade80' }}>CONFIRMADO</strong>
                    </div>

                    {tkt.qr_code_url && (
                      <div style={{ margin: '1rem 0' }}>
                        <img
                          src={tkt.qr_code_url}
                          alt="QR Code do Ingresso"
                          style={{
                            width: '170px',
                            height: '170px',
                            padding: '8px',
                            background: '#FFFFFF',
                            border: '2px solid #d4af37'
                          }}
                        />
                      </div>
                    )}

                    <div style={{
                      display: 'inline-block',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.78rem',
                      fontFamily: 'monospace',
                      letterSpacing: '0.08em',
                      color: '#f9e27e',
                      border: '1px dashed rgba(212, 175, 55, 0.4)',
                      marginBottom: '1rem'
                    }}>
                      {tkt.ticket_token}
                    </div>

                    <div style={{
                      fontSize: '0.72rem',
                      color: '#a0a5ad',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      textAlign: 'left'
                    }}>
                      <div><Calendar size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {tkt.event_date}</div>
                      <div><MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {tkt.event_location}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleCopy(tkt.ticket_token)}
                        style={{
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid #d4af37',
                          color: '#f9e27e',
                          padding: '0.5rem 1rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Copy size={14} />
                        {copiedToken === tkt.ticket_token ? 'Copiado!' : 'Copiar Token'}
                      </button>
                    </div>
                  </CredentialCard>
                ))}
              </div>
            )}
          </Content>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
}
