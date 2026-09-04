import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Ticket, Crown, ShieldCheck, Check, AlertCircle, 
  CreditCard, QrCode, Copy, Sparkles, User, Mail, 
  Phone, Award, ArrowRight, Download, RefreshCw, MessageSquare,
  ExternalLink, Lock, Building, MapPin, Clock
} from 'lucide-react';
import { congressApi } from '../../../services/api';
import { trackBeginCheckout, trackPurchase } from '../../../services/telemetry';
import { AURA_COLORS, AuraButtonPrimary, AuraButtonGhost } from '../styles/auraGrandPrixTokens';

// Animação de pulso para badges e seletores
const pulseGlow = keyframes`
  0% { box-shadow: 0 0 10px rgba(212, 175, 55, 0.2); }
  50% { box-shadow: 0 0 25px rgba(212, 175, 55, 0.45); }
  100% { box-shadow: 0 0 10px rgba(212, 175, 55, 0.2); }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(8, 10, 12, 0.85);
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-end;
  }
`;

const DragHandle = styled.div`
  display: none;
  width: 44px;
  height: 5px;
  background: rgba(212, 175, 55, 0.35);
  border-radius: 9999px;
  margin: 8px auto 4px auto;

  @media (max-width: 768px) {
    display: block;
  }
`;

const ModalContainer = styled(motion.div)`
  background: ${AURA_COLORS.surfaceLow || '#0c0f12'};
  border: 1px solid ${AURA_COLORS.outlineVariant || 'rgba(212, 175, 55, 0.25)'};
  border-radius: 12px;
  width: 100%;
  max-width: 680px;
  max-height: 92vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.12);
  color: #FFFFFF;
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: calc(100dvh - 20px);
    border-radius: 20px 20px 0 0;
    border-bottom: none;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d4af37;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${AURA_COLORS.goldGradient || 'linear-gradient(90deg, #d4af37, #f9e27e, #b8860b)'};
  }
`;

const Header = styled.div`
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid ${AURA_COLORS.outlineVariant || 'rgba(255, 255, 255, 0.08)'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  background: ${AURA_COLORS.surfaceLow || '#0c0f12'};
  z-index: 10;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;

  h3 {
    font-size: 1.15rem;
    font-weight: 800;
    margin: 0;
    color: #FFFFFF;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: 0.4rem;

    span {
      color: #f9e27e;
    }
  }

  p {
    font-size: 0.78rem;
    color: ${AURA_COLORS.onSurfaceVariant || '#a0a5ad'};
    margin: 0.2rem 0 0 0;
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

  @media (max-width: 600px) {
    padding: 1.2rem 1rem 1.5rem;
  }
`;

const TierSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const TierCard = styled.div`
  background: ${({ $selected }) => $selected ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid ${({ $selected }) => $selected ? '#d4af37' : 'rgba(255, 255, 255, 0.1)'};
  padding: 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  min-height: 44px;

  ${({ $selected }) => $selected && css`
    animation: ${pulseGlow} 3s infinite ease-in-out;
  `}

  &:hover {
    border-color: #d4af37;
    background: rgba(212, 175, 55, 0.06);
  }
`;

const TierBadge = styled.div`
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ $isVip }) => $isVip ? '#f9e27e' : '#FFFFFF'};
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
`;

const TierPrice = styled.div`
  font-size: 1.35rem;
  font-weight: 900;
  color: #f9e27e;
  margin: 0.2rem 0;
`;

const SectionSubtitle = styled.div`
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f9e27e;
  margin: 1.5rem 0 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const FormGroup = styled.div`
  display: grid;
  grid-template-columns: ${({ $cols }) => $cols ? `repeat(${$cols}, 1fr)` : '1fr'};
  gap: 0.85rem;
  margin-bottom: 0.85rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #e0e0e0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  input, select, textarea {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #FFFFFF;
    padding: 0.75rem 0.9rem;
    font-size: 0.88rem;
    font-family: inherit;
    min-height: 44px;
    border-radius: 0px;
    outline: none;
    transition: border 0.2s ease;

    &:focus {
      border-color: #d4af37;
      background: rgba(212, 175, 55, 0.04);
    }

    &::placeholder {
      color: #666a70;
    }
  }
`;

const CouponBox = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  input {
    flex: 1;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;
  }
`;

const CouponBadge = styled.div`
  background: ${({ $isFree }) => $isFree ? 'rgba(74, 222, 128, 0.15)' : 'rgba(212, 175, 55, 0.15)'};
  border: 1px solid ${({ $isFree }) => $isFree ? '#4ade80' : '#d4af37'};
  color: ${({ $isFree }) => $isFree ? '#4ade80' : '#f9e27e'};
  padding: 0.6rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.4rem;
`;

const MethodSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 1.2rem;
`;

const MethodBtn = styled.button`
  background: ${({ $active }) => $active ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${({ $active }) => $active ? '#d4af37' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ $active }) => $active ? '#f9e27e' : '#FFFFFF'};
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  min-height: 44px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #d4af37;
  }
`;

const SummaryBox = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(212, 175, 55, 0.2);
  padding: 1.1rem;
  margin: 1.5rem 0;
`;

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: ${({ $highlight }) => $highlight ? '#f9e27e' : '#c0c5cc'};
  margin-bottom: 0.45rem;

  ${({ $total }) => $total && css`
    font-size: 1.1rem;
    font-weight: 900;
    color: #FFFFFF;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 0.6rem;
    margin-top: 0.6rem;
    margin-bottom: 0;
  `}
`;

const PixContainer = styled.div`
  text-align: center;
  padding: 1rem 0;

  img {
    background: #FFFFFF;
    padding: 0.75rem;
    width: 200px;
    height: 200px;
    margin: 0 auto 1.2rem;
    display: block;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  }
`;

const CopyBox = styled.div`
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(212, 175, 55, 0.3);
  padding: 0.5rem 0.8rem;
  align-items: center;
  margin-bottom: 1.2rem;

  input {
    background: transparent;
    border: none;
    color: #f9e27e;
    font-family: monospace;
    font-size: 0.8rem;
    flex: 1;
    outline: none;
  }
`;

const CredentialCard = styled.div`
  background: linear-gradient(145deg, #12161a 0%, #0a0d10 100%);
  border: 2px solid #d4af37;
  padding: 1.8rem;
  position: relative;
  text-align: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.2);

  &::before {
    content: '★ 1º CONGRESSO BRASILEIRO DE MUSCULAÇÃO ELÉTRICA ★';
    display: block;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.15em;
    color: #f9e27e;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(212, 175, 55, 0.3);
    padding-bottom: 0.5rem;
  }
`;

export default function CongressCheckoutModal({ isOpen, onClose, initialTier = 'experience' }) {
  const [tiers, setTiers] = useState([
    { id: 1, slug: 'experience', name: 'Ingresso Experience', price_cents: 69700, max_slots: null },
    { id: 2, slug: 'vip', name: 'Passaporte VIP Exclusive', price_cents: 149700, max_slots: 40 }
  ]);
  const [selectedTierId, setSelectedTierId] = useState(initialTier === 'vip' || initialTier === 2 ? 2 : 1);
  
  // Dados do Comprador
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: ''
  });

  // Cupom
  const [couponCode, setCouponCode] = useState('');
  const [couponState, setCouponState] = useState({
    applied: false,
    loading: false,
    error: '',
    data: null
  });

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [installments, setInstallments] = useState(1);
  const [cardData, setCardData] = useState({
    holder_name: '',
    number: '',
    expiry_month: '',
    expiry_year: '',
    ccv: ''
  });
  const [holderInfo, setHolderInfo] = useState({
    is_same_as_attendee: true,
    name: '',
    cpf: '',
    cpf_cnpj: '',
    phone: '',
    postal_code: '',
    address_number: '',
    address_street: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_complement: ''
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepFound, setCepFound] = useState(false);
  const [fallback3dsData, setFallback3dsData] = useState(null);

  // Credenciamento (100% OFF)
  const [accreditationData, setAccreditationData] = useState({
    athlete_category: '',
    instagram_handle: '',
    notes: ''
  });

  // Estado do Fluxo
  const [checkoutStep, setCheckoutStep] = useState('form'); // 'form', 'pix_pending', 'success'
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [copyToast, setCopyToast] = useState(false);
  const [verifyingPix, setVerifyingPix] = useState(false);
  const [pixNotice, setPixNotice] = useState('');
  const [pixCountdown, setPixCountdown] = useState(420); // 7 minutos = 420s

  // Countdown regressivo de 7 minutos para expiração do PIX
  useEffect(() => {
    let timer = null;
    if (checkoutStep === 'pix_pending') {
      timer = setInterval(() => {
        setPixCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [checkoutStep]);

  // Polling reativo em background enquanto aguarda pagamento PIX (PLAN-160)
  useEffect(() => {
    let interval = null;
    if (checkoutStep === 'pix_pending' && checkoutResult?.ticket_token && pixCountdown > 0) {
      interval = setInterval(async () => {
        try {
          const res = await congressApi.getTicket(checkoutResult.ticket_token);
          if (res?.ok && res?.data) {
            const status = res.data.payment_status;
            if (res.data.is_confirmed || status === 'CONFIRMED' || status === 'RECEIVED' || status === 'FREE_APPROVED') {
              setCheckoutResult(prev => ({
                ...prev,
                ...res.data,
                payment_status: 'CONFIRMED'
              }));
              setCheckoutStep('success');
            }
          }
        } catch (err) {
          // Ignorar falhas transitórias de rede no polling
        }
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [checkoutStep, checkoutResult?.ticket_token, pixCountdown]);

  // Polling em background para o fluxo de fallback 3DS caso o usuário conclua no link do banco
  useEffect(() => {
    let interval = null;
    if (fallback3dsData?.ticket_token && checkoutStep === 'form') {
      interval = setInterval(async () => {
        try {
          const res = await congressApi.getTicket(fallback3dsData.ticket_token);
          if (res?.ok && res?.data) {
            const status = res.data.payment_status;
            if (res.data.is_confirmed || status === 'CONFIRMED' || status === 'RECEIVED' || status === 'FREE_APPROVED') {
              setCheckoutResult(res.data);
              setFallback3dsData(null);
              setCheckoutStep('success');
            }
          }
        } catch (err) {
          // Polling defensivo silencioso
        }
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fallback3dsData?.ticket_token, checkoutStep]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleVerifyPixNow = async () => {
    if (!checkoutResult?.ticket_token) return;
    setVerifyingPix(true);
    setPixNotice('');
    try {
      const res = await congressApi.getTicket(checkoutResult.ticket_token);
      if (res?.ok && res?.data) {
        const status = res.data.payment_status;
        if (res.data.is_confirmed || status === 'CONFIRMED' || status === 'RECEIVED' || status === 'FREE_APPROVED') {
          setCheckoutResult(prev => ({
            ...prev,
            ...res.data,
            payment_status: 'CONFIRMED'
          }));
          setCheckoutStep('success');
          return;
        }
      }
      setPixNotice('Aguardando compensação bancária do seu PIX. Assim que o pagamento for detectado pelo banco, sua credencial será liberada automaticamente na tela.');
    } catch (err) {
      setPixNotice('Ainda não identificamos a compensação do seu PIX. Tente novamente em instantes.');
    } finally {
      setVerifyingPix(false);
    }
  };

  // Sincronizar initialTier quando modal abre
  useEffect(() => {
    if (isOpen) {
      const targetSlug = String(initialTier).toLowerCase().includes('vip') ? 'vip' : 'experience';
      const initialMatched = tiers.find(t => t.slug === targetSlug);
      if (initialMatched) {
        setSelectedTierId(initialMatched.id);
      }
      setCheckoutStep('form');
      setFormError('');
      
      // Carregar tiers reais da API se disponíveis
      congressApi.getTiers()
        .then(res => {
          if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
            setTiers(res.data);
            const apiMatched = res.data.find(t => t.slug === targetSlug || t.slug?.includes(targetSlug));
            if (apiMatched) {
              setSelectedTierId(apiMatched.id);
            }
          }
        })
        .catch(err => {
          console.warn('[CongressCheckout] Usando tiers de fallback:', err);
        });
    }
  }, [isOpen, initialTier]);

  // Obter lote atual selecionado
  const activeTier = useMemo(() => {
    return tiers.find(t => t.id === selectedTierId) || tiers[0];
  }, [tiers, selectedTierId]);

  // Formatação de Máscaras
  const handleCpfChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    setCustomer(prev => ({ ...prev, cpf: v }));
  };

  const handlePhoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    setCustomer(prev => ({ ...prev, phone: v }));
  };

  const handleCardNumberChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData(prev => ({ ...prev, number: v }));
  };

  const formatCpfCnpj = (val) => {
    const raw = (val || '').replace(/\D/g, '').slice(0, 14);
    if (raw.length <= 11) {
      let v = raw;
      if (v.length > 9) v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
      else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3');
      else if (v.length > 3) v = v.replace(/^(\d{3})(\d{1,3})$/, '$1.$2');
      return v;
    } else {
      let v = raw;
      if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');
      else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, '$1.$2.$3/$4');
      else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{1,3})$/, '$1.$2.$3');
      else if (v.length > 2) v = v.replace(/^(\d{2})(\d{1,3})$/, '$1.$2');
      return v;
    }
  };

  const handleHolderDocChange = (e) => {
    const formatted = formatCpfCnpj(e.target.value);
    setHolderInfo(prev => ({ ...prev, cpf: formatted, cpf_cnpj: formatted }));
  };

  const handleHolderPhoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    setHolderInfo(prev => ({ ...prev, phone: v }));
  };

  const handleHolderCepChange = async (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 8);
    const formattedCep = v.length > 5 ? v.replace(/^(\d{5})(\d{1,3})$/, '$1-$2') : v;
    setHolderInfo(prev => ({ ...prev, postal_code: formattedCep }));

    if (v.length === 8) {
      setCepLoading(true);
      try {
        const resp = await fetch(`https://viacep.com.br/ws/${v}/json/`);
        const cepData = await resp.json();
        if (!cepData.erro) {
          setHolderInfo(prev => ({
            ...prev,
            address_street: cepData.logradouro || '',
            address_neighborhood: cepData.bairro || '',
            address_city: cepData.localidade || '',
            address_state: cepData.uf || ''
          }));
          setCepFound(true);
          setTimeout(() => {
            const numEl = document.getElementById('holderAddressNumberInput');
            if (numEl) numEl.focus();
          }, 150);
        } else {
          setCepFound(false);
        }
      } catch (err) {
        setCepFound(false);
      } finally {
        setCepLoading(false);
      }
    } else {
      setCepFound(false);
    }
  };

  const humanizeCheckoutError = (raw) => {
    if (!raw) return 'Não foi possível concluir a operação no momento. Verifique os dados ou tente novamente.';
    const str = String(raw);
    if (str.includes('já foi utilizado') || str.includes('already used') || str.includes('Limite: 1 uso por CPF')) {
      return '⚠️ Este cupom exclusivo já foi utilizado anteriormente pelo CPF informado. A condição promocional é limitada a 1 uso por participante.';
    }
    if (str.includes('CPF') && (str.includes('inválido') || str.includes('invalid') || str.includes('dígitos'))) {
      return '⚠️ O CPF informado parece incompleto ou inválido. Por favor, confira os 11 dígitos digitados.';
    }
    if (str.includes('Cartão') || str.includes('card') || str.includes('declined') || str.includes('recusad') || str.includes('não autorizado')) {
      return '💳 O pagamento não foi aprovado pelo banco do cartão. Se o cartão for de outra pessoa (mãe, marido ou clínica), desmarque a opção "O cartão pertence ao congressista" e coloque o CPF do dono do cartão. Ou pague com aprovação imediata via PIX!';
    }
    if (str.includes('Network') || str.includes('comunicação') || str.includes('timeout') || str.includes('Failed to fetch')) {
      return '🌐 Falha temporária de conexão com o servidor seguro. Por favor, tente novamente em alguns instantes.';
    }
    if (str.includes('expirado') || str.includes('inválido') || str.includes('não encontrado')) {
      return '🎟️ Cupom promocional inválido, expirado ou não localizado. Verifique a digitação.';
    }
    return str;
  };

  // Aplicação do Cupom
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await congressApi.validateCoupon(
        couponCode, 
        activeTier.id, 
        customer.cpf || customerInfo.cpf || '', 
        customer.email || customerInfo.email || ''
      );
      if (res?.ok && res?.data) {
        setCouponState({
          applied: true,
          loading: false,
          error: '',
          data: res.data
        });
        if (res.data.requires_accreditation || res.data.discount_percentage >= 100) {
          setPaymentMethod('free');
        }
      } else {
        setCouponState({
          applied: false,
          loading: false,
          error: humanizeCheckoutError(res?.message || 'Cupom promocional inválido ou expirado.'),
          data: null
        });
      }
    } catch (err) {
      setCouponState({
        applied: false,
        loading: false,
        error: humanizeCheckoutError(err?.message || 'Erro ao validar cupom.'),
        data: null
      });
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponState({ applied: false, loading: false, error: '', data: null });
    if (paymentMethod === 'free') {
      setPaymentMethod('pix');
    }
  };

  // Cálculo de Valores
  const baseAmountCents = activeTier.price_cents || 69700;
  const discountCents = couponState.applied && couponState.data ? couponState.data.discount_cents : 0;
  const isFree = couponState.applied && couponState.data?.discount_percentage >= 100;
  const finalAmountCents = isFree ? 0 : Math.max(0, baseAmountCents - discountCents);

  // Telemetria: Rastreia abertura do checkout (InitiateCheckout / begin_checkout)
  useEffect(() => {
    if (isOpen && activeTier) {
      trackBeginCheckout({
        tierName: activeTier.name,
        valueCents: activeTier.price_cents,
        tierId: activeTier.id
      });
    }
  }, [isOpen, activeTier?.id]);

  // Telemetria: Rastreia conversão e compra aprovada (Purchase)
  useEffect(() => {
    if (checkoutStep === 'success' && checkoutResult) {
      trackPurchase({
        orderId: checkoutResult.ticket_token || checkoutResult.id || `bh_${Date.now()}`,
        tierName: activeTier?.name || 'Ingresso Congresso',
        valueCents: checkoutResult.amount_cents || finalAmountCents,
        paymentMethod: paymentMethod
      });
    }
  }, [checkoutStep]);

  // Opções de Parcelamento com Cálculo de Juros Repassados (~2.29% a.m.)
  const installmentOptions = useMemo(() => {
    const opts = [];
    const monthlyRate = 0.0229;
    for (let n = 1; n <= 12; n++) {
      if (n === 1) {
        opts.push({
          num: 1,
          totalCents: finalAmountCents,
          installmentCents: finalAmountCents,
          label: `1x de R$ ${(finalAmountCents / 100).toFixed(2).replace('.', ',')} (sem juros)`
        });
      } else {
        const factor = (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
        const instCents = Math.ceil(finalAmountCents * factor);
        const totCents = instCents * n;
        opts.push({
          num: n,
          totalCents: totCents,
          installmentCents: instCents,
          label: `${n}x de R$ ${(instCents / 100).toFixed(2).replace('.', ',')} (total R$ ${(totCents / 100).toFixed(2).replace('.', ',')})`
        });
      }
    }
    return opts;
  }, [finalAmountCents]);

  // Submissão do Checkout
  const handleSubmitCheckout = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!customer.name.trim() || !customer.email.trim() || !customer.cpf || !customer.phone) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (isFree && !accreditationData.athlete_category.trim()) {
      setFormError('Para inscrições com 100% de isenção, informe a categoria/modalidade da atleta.');
      return;
    }

    if (paymentMethod === 'card' && !isFree) {
      if (!cardData.number || !cardData.holder_name || !cardData.expiry_month || !cardData.expiry_year || !cardData.ccv) {
        setFormError('Por favor, preencha todos os dados do cartão de crédito.');
        return;
      }
      if (!holderInfo.is_same_as_attendee) {
        const docDigits = (holderInfo.cpf_cnpj || holderInfo.cpf || '').replace(/\D/g, '');
        if (!holderInfo.name.trim() || (docDigits.length !== 11 && docDigits.length !== 14) || !holderInfo.phone || !holderInfo.postal_code || !holderInfo.address_number?.trim()) {
          setFormError('Por favor, preencha os dados completos de quem vai pagar (Nome, CPF ou CNPJ, WhatsApp, CEP e Número do Endereço).');
          return;
        }
      }
    }

    setSubmitting(true);
    setFallback3dsData(null);

    try {
      const payload = {
        tier_id: activeTier.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_cpf: customer.cpf,
        customer_phone: customer.phone,
        payment_method: isFree ? 'free' : paymentMethod,
        coupon_code: couponState.applied ? couponCode : null,
        installments: paymentMethod === 'card' ? installments : 1,
        card_data: paymentMethod === 'card' ? cardData : null,
        holder_info: (paymentMethod === 'card' && !holderInfo.is_same_as_attendee) ? holderInfo : null,
        accreditation_data: isFree ? accreditationData : null
      };

      const res = await congressApi.checkout(payload);

      if (res?.ok && res?.data) {
        setCheckoutResult(res.data);
        if (res.data.payment_method === 'pix' && res.data.payment_status === 'PENDING') {
          setCheckoutStep('pix_pending');
        } else {
          setCheckoutStep('success');
        }
      } else if (res?.can_retry_with_3ds && (res?.fallback_invoice_url || res?.data?.fallback_invoice_url)) {
        setFallback3dsData({
          invoice_url: res.fallback_invoice_url || res.data.fallback_invoice_url,
          ticket_token: res.ticket_token || res.data?.ticket_token,
          error: res.error || 'O banco solicitou validação de segurança.'
        });
        setFormError('');
      } else {
        setFormError(humanizeCheckoutError(res?.error || res?.message || 'Não foi possível processar sua inscrição. Verifique os dados e tente novamente.'));
      }
    } catch (err) {
      const errResp = err?.response || {};
      if (errResp?.can_retry_with_3ds && (errResp?.fallback_invoice_url || errResp?.data?.fallback_invoice_url)) {
        setFallback3dsData({
          invoice_url: errResp.fallback_invoice_url || errResp.data?.fallback_invoice_url,
          ticket_token: errResp.ticket_token || errResp.data?.ticket_token,
          error: errResp.error || 'O banco solicitou validação de segurança.'
        });
        setFormError('');
      } else {
        setFormError(humanizeCheckoutError(err?.message || 'Erro temporário de comunicação ao processar checkout. Tente novamente.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPix = () => {
    if (checkoutResult?.pix_copy_paste) {
      navigator.clipboard.writeText(checkoutResult.pix_copy_paste);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const phone = customer.phone?.replace(/\D/g, '') || '';
    const text = encodeURIComponent(
      `🎉 Minha inscrição no 1º Congresso Brasileiro de Musculação Elétrica está confirmada!\n\n` +
      `👤 Participante: ${checkoutResult?.customer_name || customer.name}\n` +
      `🎟️ Lote: ${checkoutResult?.tier_name || activeTier.name}\n` +
      `🔖 Código do Ingresso: ${checkoutResult?.ticket_token}\n` +
      `📅 Data: 07 de Novembro de 2026 em São Paulo/SP\n` +
      `🏢 Local: Espaço Full Sales (Em frente ao Shopping JK Iguatemi)\n\n` +
      `Ver credencial: ${window.location.origin}/congresso`
    );
    window.open(`https://wa.me/${phone ? `55${phone}` : ''}?text=${text}`, '_blank');
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
          <DragHandle />
          <Header>
            <HeaderTitle>
              <div>
                <h3>
                  <Sparkles size={18} color="#f9e27e" /> 
                  1º Congresso <span>Body Harmony</span>
                </h3>
                <p>07 de Novembro de 2026 · Espaço Full Sales, São Paulo/SP</p>
              </div>
            </HeaderTitle>
            <CloseBtn onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </CloseBtn>
          </Header>

          <Content>
            {/* ETAPA 1: FORMULÁRIO DE CHECKOUT */}
            {checkoutStep === 'form' && (
              <form onSubmit={handleSubmitCheckout}>
                {/* Seletor de Lotes */}
                <SectionSubtitle>
                  <Ticket size={16} /> 1. Escolha o Seu Ingresso
                </SectionSubtitle>
                <TierSelector>
                  {tiers.map(t => {
                    const isVip = t.slug === 'vip' || Boolean(t.name && t.name.toLowerCase().includes('vip'));
                    const isSelected = t.id === selectedTierId;
                    return (
                      <TierCard 
                        key={t.id} 
                        $selected={isSelected} 
                        onClick={() => {
                          setSelectedTierId(t.id);
                          if (couponState.applied) {
                            handleRemoveCoupon();
                          }
                        }}
                      >
                        <TierBadge $isVip={isVip}>
                          {isVip ? <Crown size={14} /> : <Ticket size={14} />}
                          {t.name}
                        </TierBadge>
                        <TierPrice>
                          R$ {(t.price_cents / 100).toFixed(2).replace('.', ',')}
                        </TierPrice>
                        <div style={{ fontSize: '0.72rem', color: isVip ? '#f9e27e' : '#a0a5ad', fontWeight: isVip ? 700 : 500 }}>
                          {isVip ? '40 Vagas · 100% de Crédito no Licenciamento' : 'Conteúdo & Networking · Acesso Individual'}
                        </div>
                      </TierCard>
                    );
                  })}
                </TierSelector>

                {/* Dados Pessoais */}
                <SectionSubtitle>
                  <User size={16} /> 2. Dados do Congressista
                </SectionSubtitle>
                <FormGroup $cols={2}>
                  <InputWrapper>
                    <label>Nome Completo *</label>
                    <input
                      type="text"
                      placeholder="Ex: Dra. Juliana Menezes"
                      value={customer.name}
                      onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <label>E-mail *</label>
                    <input
                      type="email"
                      placeholder="Ex: juliana@clinica.com.br"
                      value={customer.email}
                      onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </InputWrapper>
                </FormGroup>

                <FormGroup $cols={2}>
                  <InputWrapper>
                    <label>CPF *</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={customer.cpf}
                      onChange={handleCpfChange}
                      required
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <label>WhatsApp Oficial *</label>
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={customer.phone}
                      onChange={handlePhoneChange}
                      required
                    />
                  </InputWrapper>
                </FormGroup>

                {/* Motor de Cupons */}
                <SectionSubtitle>
                  <Sparkles size={16} /> 3. Cupom de Desconto / Licenciada / Atleta
                </SectionSubtitle>
                {!couponState.applied ? (
                  <div>
                    <CouponBox>
                      <input
                        type="text"
                        placeholder="DIGITE SEU CÓDIGO PROMOCIONAL"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <AuraButtonGhost
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponState.loading || !couponCode.trim()}
                        style={{ minHeight: '44px', padding: '0 1.2rem' }}
                      >
                        {couponState.loading ? <RefreshCw size={16} className="animate-spin" /> : 'Aplicar'}
                      </AuraButtonGhost>
                    </CouponBox>
                    {couponState.error && (
                      <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                        {couponState.error}
                      </div>
                    )}
                  </div>
                ) : (
                  <CouponBadge $isFree={isFree}>
                    <span>
                      ✓ Cupom <strong>{couponCode.toUpperCase()}</strong> ({couponState.data?.message})
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                    >
                      Remover
                    </button>
                  </CouponBadge>
                )}

                {/* Seção Obrigatória de Credenciamento para Isenção 100% */}
                {isFree && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <SectionSubtitle style={{ color: '#4ade80' }}>
                      <Award size={16} /> 4. Credenciamento Obrigatório (Atleta / Convidada)
                    </SectionSubtitle>
                    <FormGroup $cols={2}>
                      <InputWrapper>
                        <label>Categoria / Modalidade da Atleta *</label>
                        <input
                          type="text"
                          placeholder="Ex: Fisiculturismo / Bikini / Wellness"
                          value={accreditationData.athlete_category}
                          onChange={(e) => setAccreditationData(prev => ({ ...prev, athlete_category: e.target.value }))}
                          required={isFree}
                        />
                      </InputWrapper>
                      <InputWrapper>
                        <label>Instagram Oficial</label>
                        <input
                          type="text"
                          placeholder="@seuinstagram"
                          value={accreditationData.instagram_handle}
                          onChange={(e) => setAccreditationData(prev => ({ ...prev, instagram_handle: e.target.value }))}
                        />
                      </InputWrapper>
                    </FormGroup>
                  </motion.div>
                )}

                {/* Seletor de Pagamento (quando não gratuito) */}
                {!isFree && (
                  <>
                    <SectionSubtitle>
                      <CreditCard size={16} /> 4. Forma de Pagamento
                    </SectionSubtitle>
                    <MethodSelector>
                      <MethodBtn
                        type="button"
                        $active={paymentMethod === 'pix'}
                        onClick={() => setPaymentMethod('pix')}
                      >
                        <QrCode size={18} /> PIX (À Vista)
                      </MethodBtn>
                      <MethodBtn
                        type="button"
                        $active={paymentMethod === 'card'}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <CreditCard size={18} /> Cartão de Crédito
                      </MethodBtn>
                    </MethodSelector>

                    {/* Campos de Cartão de Crédito */}
                    {paymentMethod === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormGroup $cols={1}>
                          <InputWrapper>
                            <label>Número do Cartão *</label>
                            <input
                              type="text"
                              placeholder="0000 0000 0000 0000"
                              value={cardData.number}
                              onChange={handleCardNumberChange}
                              required
                            />
                          </InputWrapper>
                        </FormGroup>

                        <FormGroup $cols={1}>
                          <InputWrapper>
                            <label>Nome Impresso no Cartão *</label>
                            <input
                              type="text"
                              placeholder="Como está grafado no cartão"
                              value={cardData.holder_name}
                              onChange={(e) => setCardData(prev => ({ ...prev, holder_name: e.target.value.toUpperCase() }))}
                              required
                            />
                          </InputWrapper>
                        </FormGroup>

                        <FormGroup $cols={3}>
                          <InputWrapper>
                            <label>Mês (MM) *</label>
                            <input
                              type="text"
                              placeholder="12"
                              maxLength={2}
                              value={cardData.expiry_month}
                              onChange={(e) => setCardData(prev => ({ ...prev, expiry_month: e.target.value.replace(/\D/g, '') }))}
                              required
                            />
                          </InputWrapper>
                          <InputWrapper>
                            <label>Ano (AAAA) *</label>
                            <input
                              type="text"
                              placeholder="2028"
                              maxLength={4}
                              value={cardData.expiry_year}
                              onChange={(e) => setCardData(prev => ({ ...prev, expiry_year: e.target.value.replace(/\D/g, '') }))}
                              required
                            />
                          </InputWrapper>
                          <InputWrapper>
                            <label>CVV *</label>
                            <input
                              type="text"
                              placeholder="123"
                              maxLength={4}
                              value={cardData.ccv}
                              onChange={(e) => setCardData(prev => ({ ...prev, ccv: e.target.value.replace(/\D/g, '') }))}
                              required
                            />
                          </InputWrapper>
                        </FormGroup>

                        <FormGroup $cols={1}>
                          <InputWrapper>
                            <label>Parcelamento *</label>
                            <select
                              value={installments}
                              onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                            >
                              {installmentOptions.map(opt => (
                                <option key={opt.num} value={opt.num}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </InputWrapper>
                        </FormGroup>

                        {/* Toggle de Titularidade do Cartão (Cartão de Terceiros) */}
                        <div 
                          style={{
                            margin: '1.2rem 0 0.8rem',
                            padding: '0.85rem 1rem',
                            background: holderInfo.is_same_as_attendee ? 'rgba(255, 255, 255, 0.03)' : 'rgba(212, 175, 55, 0.08)',
                            border: `1px solid ${holderInfo.is_same_as_attendee ? 'rgba(255, 255, 255, 0.12)' : 'rgba(212, 175, 55, 0.4)'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem',
                            cursor: 'pointer',
                            userSelect: 'none',
                            transition: 'all 0.2s ease'
                          }} 
                          onClick={() => setHolderInfo(prev => ({ ...prev, is_same_as_attendee: !prev.is_same_as_attendee }))}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <input
                              type="checkbox"
                              id="sameHolderCheckbox"
                              checked={holderInfo.is_same_as_attendee}
                              onChange={(e) => setHolderInfo(prev => ({ ...prev, is_same_as_attendee: e.target.checked }))}
                              onClick={(e) => e.stopPropagation()}
                              style={{ accentColor: '#d4af37', width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="sameHolderCheckbox" style={{ fontSize: '0.84rem', color: '#f8fafc', cursor: 'pointer', margin: 0, fontWeight: 700 }}>
                              O titular do cartão é a mesma pessoa que vai ao evento
                            </label>
                          </div>
                          {holderInfo.is_same_as_attendee && (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', paddingLeft: '1.8rem', lineHeight: '1.3' }}>
                              💡 Vai usar o cartão da mãe, marido ou clínica? <strong>Desmarque aqui</strong> para colocar o CPF do titular e aprovar sem travas!
                            </span>
                          )}
                        </div>

                        {/* Campos Expandíveis de Titular de Terceiros */}
                        {!holderInfo.is_same_as_attendee && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{
                              padding: '1.1rem',
                              background: 'rgba(212, 175, 55, 0.05)',
                              border: '1px dashed rgba(212, 175, 55, 0.35)',
                              borderRadius: '8px',
                              marginBottom: '1.2rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                              <Building size={16} color="#f9e27e" />
                              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f9e27e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Dados de Quem Vai Pagar o Cartão
                              </div>
                            </div>
                            <p style={{ fontSize: '0.73rem', color: '#CBD5E1', margin: '0 0 0.85rem 0', lineHeight: '1.4' }}>
                              Preencha os dados da pessoa ou empresa dona do cartão para que o banco aprove a compra sem travas de segurança. O ingresso continuará registrado no seu nome!
                            </p>

                            <FormGroup $cols={2}>
                              <InputWrapper>
                                <label>Nome Completo do Titular *</label>
                                <input
                                  type="text"
                                  placeholder="Como impresso no cartão"
                                  value={holderInfo.name}
                                  onChange={(e) => setHolderInfo(prev => ({ ...prev, name: e.target.value }))}
                                  required={!holderInfo.is_same_as_attendee}
                                />
                              </InputWrapper>
                              <InputWrapper>
                                <label>CPF ou CNPJ do Titular *</label>
                                <input
                                  type="text"
                                  placeholder="CPF ou CNPJ da Clínica"
                                  value={holderInfo.cpf_cnpj || holderInfo.cpf}
                                  onChange={handleHolderDocChange}
                                  required={!holderInfo.is_same_as_attendee}
                                />
                                <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                                  Aceita CPF (11 dígitos) ou CNPJ da clínica (14 dígitos)
                                </span>
                              </InputWrapper>
                            </FormGroup>

                            <FormGroup $cols={2}>
                              <InputWrapper>
                                <label>WhatsApp / Telefone do Titular *</label>
                                <input
                                  type="text"
                                  placeholder="(11) 99999-9999"
                                  value={holderInfo.phone}
                                  onChange={handleHolderPhoneChange}
                                  required={!holderInfo.is_same_as_attendee}
                                />
                              </InputWrapper>
                              <InputWrapper>
                                <label>CEP da Fatura do Cartão *</label>
                                <div style={{ position: 'relative' }}>
                                  <input
                                    type="text"
                                    placeholder="00000-000"
                                    value={holderInfo.postal_code}
                                    onChange={handleHolderCepChange}
                                    required={!holderInfo.is_same_as_attendee}
                                    style={{ width: '100%' }}
                                  />
                                  {cepLoading && (
                                    <RefreshCw 
                                      size={14} 
                                      className="animate-spin" 
                                      style={{ position: 'absolute', right: '12px', top: '15px', color: '#f9e27e' }} 
                                    />
                                  )}
                                </div>
                              </InputWrapper>
                            </FormGroup>

                            {/* Endereço Encontrado pelo ViaCEP */}
                            {cepFound && (
                              <div style={{
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                borderRadius: '6px',
                                padding: '0.6rem 0.8rem',
                                marginBottom: '0.85rem',
                                fontSize: '0.74rem',
                                color: '#E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                              }}>
                                <MapPin size={14} color="#f9e27e" />
                                <span>
                                  <strong>{holderInfo.address_street}</strong>{holderInfo.address_neighborhood ? `, ${holderInfo.address_neighborhood}` : ''} - {holderInfo.address_city}/{holderInfo.address_state}
                                </span>
                              </div>
                            )}

                            <FormGroup $cols={2}>
                              <InputWrapper>
                                <label>Número da Residência / Fatura *</label>
                                <input
                                  id="holderAddressNumberInput"
                                  type="text"
                                  placeholder="Ex: 1540 ou SN"
                                  value={holderInfo.address_number}
                                  onChange={(e) => setHolderInfo(prev => ({ ...prev, address_number: e.target.value }))}
                                  required={!holderInfo.is_same_as_attendee}
                                />
                              </InputWrapper>
                              <InputWrapper>
                                <label>Complemento (Opcional)</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Apto 42, Bloco B"
                                  value={holderInfo.address_complement}
                                  onChange={(e) => setHolderInfo(prev => ({ ...prev, address_complement: e.target.value }))}
                                />
                              </InputWrapper>
                            </FormGroup>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </>
                )}

                {/* Resumo Financeiro */}
                <SummaryBox>
                  <SummaryRow>
                    <span>Lote: {activeTier.name}</span>
                    <span>R$ {(baseAmountCents / 100).toFixed(2).replace('.', ',')}</span>
                  </SummaryRow>
                  {discountCents > 0 && (
                    <SummaryRow $highlight>
                      <span>Desconto Cupom ({couponState.data?.coupon_code})</span>
                      <span>- R$ {(discountCents / 100).toFixed(2).replace('.', ',')}</span>
                    </SummaryRow>
                  )}
                  <SummaryRow $total>
                    <span>Total a Pagar</span>
                    <span>
                      {isFree ? 'GRATUITO (ISENÇÃO 100%)' : `R$ ${(finalAmountCents / 100).toFixed(2).replace('.', ',')}`}
                    </span>
                  </SummaryRow>
                </SummaryBox>

                {/* Card Inteligente de Contingência (Fallback 3DS & PIX) */}
                {fallback3dsData && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(237, 126, 19, 0.15), rgba(10, 62, 96, 0.35))',
                      border: '1px solid rgba(237, 126, 19, 0.5)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      marginBottom: '1.25rem',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.45)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(237, 126, 19, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FBBF24',
                        flexShrink: 0
                      }}>
                        <Lock size={18} />
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FDE68A' }}>
                        Validação de Segurança do seu Banco
                      </div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#E2E8F0', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                      O banco do seu cartão solicitou uma confirmação rápida de segurança para liberar o pagamento de <strong>R$ {(finalAmountCents / 100).toFixed(2).replace('.', ',')}</strong>. Escolha a opção mais fácil para você:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <AuraButtonPrimary
                        as="a"
                        href={fallback3dsData.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: 'none',
                          justifyContent: 'center',
                          minHeight: '48px',
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          gap: '0.5rem'
                        }}
                      >
                        🔒 Concluir no App do Banco (Link Seguro Asaas) <ExternalLink size={16} />
                      </AuraButtonPrimary>

                      <AuraButtonGhost
                        type="button"
                        onClick={() => {
                          setPaymentMethod('pix');
                          setFallback3dsData(null);
                          setFormError('');
                        }}
                        style={{
                          justifyContent: 'center',
                          minHeight: '44px',
                          fontSize: '0.85rem',
                          gap: '0.5rem'
                        }}
                      >
                        ⚡ Preferir Pagar via PIX com Liberação Instantânea
                      </AuraButtonGhost>
                    </div>

                    <div style={{ marginTop: '0.8rem', fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center' }}>
                      💡 Assim que você aprovar no app do banco, este modal confirmará seu ingresso automaticamente!
                    </div>
                  </motion.div>
                )}

                {formError && !fallback3dsData && (
                  <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={16} /> {formError}
                  </div>
                )}

                <AuraButtonPrimary
                  type="submit"
                  disabled={submitting}
                  style={{ width: '100%', minHeight: '52px', fontSize: '1rem', justifyContent: 'center' }}
                >
                  {submitting ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : isFree ? (
                    <>Confirmar Credenciamento Gratuito <ArrowRight size={18} /></>
                  ) : paymentMethod === 'pix' ? (
                    <>Gerar Chave PIX <QrCode size={18} /></>
                  ) : fallback3dsData ? (
                    <>Revisar e Tentar Novamente <RefreshCw size={18} /></>
                  ) : (
                    <>Pagar R$ {(finalAmountCents / 100).toFixed(2).replace('.', ',')} <ArrowRight size={18} /></>
                  )}
                </AuraButtonPrimary>
              </form>
            )}

            {/* ETAPA 2: PIX PENDENTE */}
            {checkoutStep === 'pix_pending' && checkoutResult && (
              <PixContainer>
                <div style={{ marginBottom: '1.2rem' }}>
                  <h4 style={{ color: '#f9e27e', fontSize: '1.2rem', margin: '0 0 0.4rem 0', fontWeight: 800 }}>
                    Pague com PIX para Confirmar Seu Ingresso
                  </h4>
                  <p style={{ color: '#a0a5ad', fontSize: '0.85rem', margin: 0 }}>
                    Abra o app do seu banco, escolha <strong>PIX Copia e Cola</strong> ou aponte a câmera para o QR Code abaixo:
                  </p>
                </div>

                {checkoutResult.pix_qr_code && (
                  <img src={checkoutResult.pix_qr_code} alt="QR Code PIX" />
                )}

                {checkoutResult.pix_copy_paste && (
                  <CopyBox>
                    <input type="text" readOnly value={checkoutResult.pix_copy_paste} />
                    <AuraButtonGhost
                      type="button"
                      onClick={handleCopyPix}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                    >
                      <Copy size={14} /> {copyToast ? 'Copiado!' : 'Copiar'}
                    </AuraButtonGhost>
                  </CopyBox>
                )}

                {/* Timer Regressivo de 7 Minutos */}
                {pixCountdown > 0 ? (
                  <div style={{
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    padding: '0.6rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#cbd5e1', fontSize: '0.82rem' }}>
                      <Clock size={15} color="#f9e27e" />
                      <span>Tempo restante para pagar:</span>
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f9e27e', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                      ⏳ {formatCountdown(pixCountdown)}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    padding: '0.85rem',
                    marginBottom: '1.25rem',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#f87171', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                      ⚠️ Chave PIX Expirada (Prazo de 7 minutos atingido)
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.78rem', margin: '0 0 0.6rem' }}>
                      Gere uma nova chave para concluir o pagamento com segurança.
                    </p>
                    <AuraButtonGhost
                      type="button"
                      onClick={() => { setCheckoutStep('form'); setPixCountdown(420); }}
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#FFFFFF' }}
                    >
                      Gerar Nova Chave PIX
                    </AuraButtonGhost>
                  </div>
                )}

                {/* Feedback de Polling em Tempo Real */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.65rem', 
                  margin: '0 0 1.25rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  fontSize: '0.82rem',
                  color: '#f9e27e',
                  fontWeight: 600
                }}>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Sincronizando com o Banco Central em tempo real...</span>
                </div>

                {pixNotice && (
                  <div style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(234, 179, 8, 0.12)',
                    border: '1px solid rgba(234, 179, 8, 0.35)',
                    color: '#fef08a',
                    fontSize: '0.82rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    textAlign: 'left'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#eab308' }} />
                    <div>{pixNotice}</div>
                  </div>
                )}

                <AuraButtonPrimary
                  type="button"
                  onClick={handleVerifyPixNow}
                  disabled={verifyingPix}
                  style={{ width: '100%', justifyContent: 'center', minHeight: '50px', fontSize: '0.95rem' }}
                >
                  {verifyingPix ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> Verificando com o Banco...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} /> Já Paguei / Verificar Agora
                    </>
                  )}
                </AuraButtonPrimary>
              </PixContainer>
            )}

            {/* ETAPA 3: SUCESSO & CREDENCIAL QR CODE (APENAS COM PAGAMENTO CONFIRMADO) */}
            {checkoutStep === 'success' && checkoutResult && (
              <div>
                {(checkoutResult.payment_status === 'CONFIRMED' || checkoutResult.payment_status === 'FREE_APPROVED' || checkoutResult.payment_status === 'RECEIVED' || checkoutResult.is_confirmed) ? (
                  <CredentialCard>
                    <div style={{ fontSize: '0.8rem', color: '#a0a5ad', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>
                      ★ CREDENCIAL OFICIAL DO CONGRESSISTA ★
                    </div>
                    <h3 style={{ fontSize: '1.5rem', color: '#FFFFFF', margin: '0 0 0.3rem 0', fontWeight: 900 }}>
                      {checkoutResult.customer_name || customer.name}
                    </h3>
                    <div style={{ display: 'inline-block', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #d4af37', color: '#f9e27e', padding: '0.25rem 0.8rem', fontSize: '0.78rem', fontWeight: 800, marginBottom: '1.2rem' }}>
                      {checkoutResult.tier_name || activeTier.name}
                    </div>

                    {checkoutResult.qr_code_url ? (
                      <img 
                        src={checkoutResult.qr_code_url} 
                        alt="QR Code de Credenciamento" 
                        style={{ width: '170px', height: '170px', margin: '0 auto 1rem', display: 'block', background: '#FFFFFF', padding: '8px', border: '2px solid #d4af37' }}
                      />
                    ) : (
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', color: '#a0a5ad', fontSize: '0.8rem', margin: '1rem 0' }}>
                        Gerando QR Code Oficial...
                      </div>
                    )}

                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#f9e27e', fontWeight: 700 }}>
                      {checkoutResult.ticket_token}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#a0a5ad', marginTop: '0.4rem' }}>
                      Apresente este QR Code na recepção física no dia 07/11/2026.
                    </div>
                  </CredentialCard>
                ) : (
                  <div style={{ padding: '2rem 1.5rem', textAlign: 'center', background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.3)', marginBottom: '1.5rem' }}>
                    <AlertCircle size={36} color="#eab308" style={{ margin: '0 auto 0.75rem' }} />
                    <h4 style={{ color: '#fef08a', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>
                      Pagamento em Processamento
                    </h4>
                    <p style={{ color: '#d1d5db', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                      Seu pagamento ainda está sendo compensado pela instituição bancária. O QR Code oficial será liberado assim que o pagamento for concluído.
                    </p>
                    <AuraButtonPrimary
                      type="button"
                      onClick={() => setCheckoutStep('pix_pending')}
                      style={{ justifyContent: 'center', margin: '0 auto' }}
                    >
                      <QrCode size={16} /> Voltar para o PIX
                    </AuraButtonPrimary>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <AuraButtonPrimary
                      type="button"
                      onClick={() => window.print()}
                      style={{ justifyContent: 'center', fontSize: '0.88rem' }}
                    >
                      <Download size={16} /> Salvar / Imprimir
                    </AuraButtonPrimary>
                    <AuraButtonPrimary
                      type="button"
                      onClick={handleShareWhatsApp}
                      style={{ justifyContent: 'center', background: '#25D366', color: '#FFFFFF', borderColor: '#25D366', fontSize: '0.88rem' }}
                    >
                      <MessageSquare size={16} /> Enviar no WhatsApp
                    </AuraButtonPrimary>
                  </div>
                  <AuraButtonGhost
                    type="button"
                    onClick={onClose}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Concluir & Fechar
                  </AuraButtonGhost>
                </div>
              </div>
            )}
          </Content>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
}
