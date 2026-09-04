import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, AlertCircle, CheckCircle2, QrCode, Search, 
  RefreshCw, User, Calendar, MapPin, Ticket, Crown, Check, X
} from 'lucide-react';
import { congressApi } from '../../../../services/api';

const pulseSuccess = keyframes`
  0% { transform: scale(0.98); box-shadow: 0 0 0 rgba(74, 222, 128, 0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 35px rgba(74, 222, 128, 0.6); }
  100% { transform: scale(1); box-shadow: 0 0 15px rgba(74, 222, 128, 0.3); }
`;

const pulseDanger = keyframes`
  0% { transform: scale(0.98); box-shadow: 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 35px rgba(239, 68, 68, 0.6); }
  100% { transform: scale(1); box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }
`;

const ScannerCard = styled.div`
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(212, 175, 55, 0.3);
  padding: 1.75rem;
  margin-bottom: 2rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  font-family: 'Montserrat', sans-serif;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  h3 {
    font-size: 1.15rem;
    font-weight: 800;
    color: #f9e27e;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    font-size: 0.8rem;
    color: #94a3b8;
    margin: 0.25rem 0 0;
  }
`;

const InputForm = styled.form`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  input {
    flex: 1;
    background: rgba(4, 7, 10, 0.8);
    border: 1px solid rgba(212, 175, 55, 0.4);
    color: #FFFFFF;
    font-size: 1.1rem;
    padding: 0.85rem 1.2rem;
    font-family: monospace;
    font-weight: 700;
    letter-spacing: 0.05em;

    &:focus {
      outline: none;
      border-color: #f9e27e;
      box-shadow: 0 0 15px rgba(249, 226, 126, 0.3);
    }

    &::placeholder {
      color: #64748b;
      font-size: 0.88rem;
      font-family: 'Montserrat', sans-serif;
    }
  }

  button {
    background: linear-gradient(135deg, #d4af37 0%, #aa8010 100%);
    border: none;
    color: #0b0f17;
    font-weight: 800;
    font-size: 0.95rem;
    padding: 0 1.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      filter: brightness(1.15);
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const ResultBox = styled(motion.div)`
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  border-radius: 4px;

  ${props => props.$status === 'SUCCESS' && `
    background: rgba(34, 197, 94, 0.12);
    border: 2px solid #22c55e;
    animation: ${pulseSuccess} 0.5s ease-out;
  `}

  ${props => props.$status === 'ALREADY_CHECKED_IN' && `
    background: rgba(239, 68, 68, 0.15);
    border: 2px solid #ef4444;
    animation: ${pulseDanger} 0.5s ease-out;
  `}

  ${props => (props.$status === 'UNPAID' || props.$status === 'NOT_FOUND') && `
    background: rgba(234, 179, 8, 0.15);
    border: 2px solid #eab308;
  `}
`;

const RecentList = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);

  h4 {
    font-size: 0.82rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.75rem;
  }
`;

const RecentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.85rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 0.4rem;
  font-size: 0.82rem;

  .name {
    font-weight: 700;
    color: #FFFFFF;
  }
  .tier {
    color: #f9e27e;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .time {
    color: #64748b;
    font-size: 0.75rem;
  }
`;

export default function CongressCheckinScanner() {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const token = tokenInput.trim();
    if (!token) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await congressApi.processCheckIn(token);
      if (res?.ok) {
        setResult({
          status: 'SUCCESS',
          message: res.message || 'Entrada Liberada!',
          ticket: res.data
        });
        if (res.data) {
          setRecentCheckins(prev => [
            {
              token: res.data.ticket_token,
              name: res.data.customer_name,
              tier: res.data.tier_name,
              time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            },
            ...prev.slice(0, 7)
          ]);
        }
        setTokenInput('');
      } else {
        setResult({
          status: res?.status || 'ERROR',
          message: res?.message || 'Falha ao processar credencial.',
          ticket: res?.data || null
        });
      }
    } catch (err) {
      setResult({
        status: 'ERROR',
        message: err?.message || 'Erro de comunicação ao validar ingresso.',
        ticket: null
      });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  return (
    <ScannerCard>
      <HeaderRow>
        <div>
          <h3>
            <ShieldCheck size={20} color="#f9e27e" /> 
            Scanner de Credenciamento & Portaria
          </h3>
          <p>Bipe o QR Code ou digite o código do ingresso para validar a entrada física em tempo real.</p>
        </div>
      </HeaderRow>

      <InputForm onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Bipe o QR Code ou digite TKT-CONG-..."
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={loading || !tokenInput.trim()}>
          {loading ? <RefreshCw size={18} className="animate-spin" /> : <><Check size={18} /> Validar Entrada</>}
        </button>
      </InputForm>

      {/* Exibição do Resultado da Validação */}
      <AnimatePresence>
        {result && (
          <ResultBox
            $status={result.status}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {result.status === 'SUCCESS' && <CheckCircle2 size={32} color="#22c55e" />}
              {result.status === 'ALREADY_CHECKED_IN' && <AlertCircle size={32} color="#ef4444" />}
              {(result.status === 'UNPAID' || result.status === 'NOT_FOUND') && <AlertCircle size={32} color="#eab308" />}
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: result.status === 'SUCCESS' ? '#4ade80' : result.status === 'ALREADY_CHECKED_IN' ? '#f87171' : '#fef08a' }}>
                  {result.status === 'SUCCESS' ? '✓ ENTRADA LIBERADA' : result.status === 'ALREADY_CHECKED_IN' ? '🛑 INGRESSO JÁ UTILIZADO' : '⚠️ ATENÇÃO: NÃO AUTORIZADO'}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#FFFFFF', marginTop: '0.2rem' }}>
                  {result.message}
                </div>
              </div>
            </div>

            {result.ticket && (
              <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '1rem', marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Participante</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>{result.ticket.customer_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>CPF: {result.ticket.customer_cpf_masked || '***'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Lote / Categoria</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f9e27e' }}>{result.ticket.tier_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Token: {result.ticket.ticket_token}</div>
                </div>
              </div>
            )}
          </ResultBox>
        )}
      </AnimatePresence>

      {/* Histórico dos Últimos Check-ins na Sessão */}
      {recentCheckins.length > 0 && (
        <RecentList>
          <h4>Últimos Credenciamentos Aprovados:</h4>
          {recentCheckins.map((item, idx) => (
            <RecentItem key={idx}>
              <div>
                <span className="name">{item.name}</span>
                <span style={{ margin: '0 0.5rem', color: '#475569' }}>·</span>
                <span className="tier">{item.tier}</span>
              </div>
              <div className="time">
                Entrada às {item.time}
              </div>
            </RecentItem>
          ))}
        </RecentList>
      )}
    </ScannerCard>
  );
}
