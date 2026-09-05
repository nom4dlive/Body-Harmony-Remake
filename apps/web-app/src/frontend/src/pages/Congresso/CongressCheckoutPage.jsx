import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ArrowLeft, Check, AlertCircle, 
  CreditCard, QrCode, Copy, Sparkles, User, Mail, 
  Phone, Award, ExternalLink, Lock, Building, MapPin, 
  Clock, MessageSquare, ChevronRight, HelpCircle, CheckCircle2,
  RefreshCw, RotateCcw
} from 'lucide-react';
import { congressApi } from '../../services/api';
import { trackBeginCheckout, trackPurchase } from '../../services/telemetry';
import { AURA_COLORS, AuraButtonPrimary, AuraButtonGhost } from './styles/auraGrandPrixTokens';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: radial-gradient(circle at 50% 0%, #0F172A 0%, #080B10 100%);
  color: #F8FAFC;
  padding: 1.5rem 1rem 4rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  @media (min-width: 768px) {
    padding: 2.5rem 2rem 5rem;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  animation: ${fadeIn} 0.35s ease-out;
`;

const HeaderBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #94A3B8;
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 600;
    transition: color 0.2s;
    &:hover {
      color: #F8FAFC;
    }
  }

  .security-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    color: #10B981;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.25);
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-weight: 600;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 900px) {
    grid-template-columns: 1.15fr 0.85fr;
    align-items: start;
  }
`;

const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
`;

const SummaryColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  @media (min-width: 900px) {
    position: sticky;
    top: 2rem;
  }
`;

const SectionCard = styled.div`
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  .step-number {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #D4AF37;
    color: #0A0D14;
    font-size: 0.8rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h2 {
    font-size: 1.05rem;
    font-weight: 700;
    color: #F8FAFC;
    margin: 0;
  }
`;

const FormGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (min-width: 600px) {
    grid-template-columns: ${props => props.$cols === 2 ? '1fr 1fr' : '1fr'};
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #CBD5E1;
  }

  input, select {
    background: rgba(8, 11, 16, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 8px;
    padding: 0.75rem 0.9rem;
    color: #F8FAFC;
    font-size: 0.92rem;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #D4AF37;
      box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
    }
    &::placeholder {
      color: #64748B;
    }
  }
`;

const PaymentTabs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const PaymentTabBtn = styled.button`
  background: ${props => props.$active ? 'rgba(212, 175, 55, 0.12)' : 'rgba(8, 11, 16, 0.6)'};
  border: 1px solid ${props => props.$active ? '#D4AF37' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$active ? '#F8FAFC' : '#94A3B8'};
  padding: 1rem 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(212, 175, 55, 0.6);
    color: #F8FAFC;
  }

  .badge-sub {
    font-size: 0.7rem;
    font-weight: 600;
    color: ${props => props.$active ? '#D4AF37' : '#64748B'};
  }
`;

const HolderTypeSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`;

const HolderTypeOption = styled.button`
  background: ${props => props.$selected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${props => props.$selected ? '#D4AF37' : 'rgba(255, 255, 255, 0.08)'};
  color: ${props => props.$selected ? '#FDE68A' : '#94A3B8'};
  padding: 0.65rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s;
`;

const SummaryBox = styled.div`
  background: rgba(10, 14, 22, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  color: ${props => props.$total ? '#F8FAFC' : (props.$highlight ? '#10B981' : '#94A3B8')};
  font-weight: ${props => (props.$total || props.$highlight) ? 700 : 500};
  padding: ${props => props.$total ? '1rem 0 0' : '0.45rem 0'};
  border-top: ${props => props.$total ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'};

  .total-price {
    font-size: 1.4rem;
    color: #F8FAFC;
    font-weight: 800;
  }
`;

const VipHelpCard = styled.div`
  background: linear-gradient(135deg, rgba(237, 126, 19, 0.12), rgba(10, 62, 96, 0.3));
  border: 1px solid rgba(237, 126, 19, 0.45);
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: #FDE68A;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  p {
    margin: 0;
    font-size: 0.82rem;
    color: #CBD5E1;
    line-height: 1.45;
  }
`;

export default function CongressCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estados dos Lotes
  const [tiers, setTiers] = useState([]);
  const [selectedTierId, setSelectedTierId] = useState(1);
  const [loadingTiers, setLoadingTiers] = useState(true);

  // Estados do Comprador
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: ''
  });

  // Estados de Cupom
  const [couponCode, setCouponCode] = useState('');
  const [couponState, setCouponState] = useState({ applied: false, loading: false, error: '', data: null });

  // Método de Pagamento: 'pix' | 'card'
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [installments, setInstallments] = useState(1);

  // Dados do Cartão
  const [cardData, setCardData] = useState({
    number: '',
    holder_name: '',
    expiry_month: '',
    expiry_year: '',
    ccv: ''
  });

  // Titularidade: 'same' | 'third_party'
  const [holderType, setHolderType] = useState('same');
  const [holderInfo, setHolderInfo] = useState({
    name: '',
    cpf: '',
    phone: ''
  });

  // Credenciamento (100% OFF)
  const [accreditationData, setAccreditationData] = useState({
    athlete_category: '',
    instagram_handle: ''
  });

  // Estados de Submissão & Resultados
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [cardDeclineCount, setCardDeclineCount] = useState(0);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Carregar Lotes
  useEffect(() => {
    async function loadData() {
      try {
        const res = await congressApi.getTiers();
        if (res?.ok && Array.isArray(res?.data)) {
          setTiers(res.data);
          const paramTier = searchParams.get('tier');
          if (paramTier) {
            const found = res.data.find(t => String(t.id) === paramTier || t.slug === paramTier);
            if (found) setSelectedTierId(found.id);
          }
        }
      } catch (e) {
        console.error('Erro ao buscar lotes:', e);
      } finally {
        setLoadingTiers(false);
      }
    }
    loadData();
  }, [searchParams]);

  // Lote selecionado
  const activeTier = useMemo(() => {
    return tiers.find(t => t.id === selectedTierId) || tiers[0] || { id: 1, name: 'Experience', price_cents: 69700 };
  }, [tiers, selectedTierId]);

  // Cálculos de Preço
  const baseAmountCents = activeTier?.price_cents || 69700;
  const discountCents = couponState.applied ? (couponState.data?.discount_cents || 0) : 0;
  const isFree = couponState.applied && (couponState.data?.discount_percentage >= 100 || couponState.data?.discount_percent >= 100);
  const finalAmountCents = isFree ? 0 : Math.max(0, baseAmountCents - discountCents);

  // Cálculo de Parcelas (com repasse de juros padrão adquirente)
  const installmentOptions = useMemo(() => {
    const opts = [];
    const monthlyRate = 0.0249; // 2.49% a.m.
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

  // Máscaras de Input
  const handleCpfChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 11);
    const m = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
      .replace(/(\d{3})(\d{1,3})/, '$1.$2');
    setCustomer(prev => ({ ...prev, cpf: m }));
  };

  const handlePhoneChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 11);
    const m = v.length > 10 
      ? v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      : v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    setCustomer(prev => ({ ...prev, phone: m }));
  };

  const handleHolderCpfChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 11);
    const m = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
      .replace(/(\d{3})(\d{1,3})/, '$1.$2');
    setHolderInfo(prev => ({ ...prev, cpf: m }));
  };

  const handleCardNumberChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 16);
    const m = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData(prev => ({ ...prev, number: m }));
  };

  // Validar Cupom
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await congressApi.validateCoupon(
        couponCode.trim().toUpperCase(),
        activeTier.id,
        customer.cpf.replace(/\D/g, ''),
        customer.email
      );
      if (res?.ok && res?.data) {
        setCouponState({
          applied: true,
          loading: false,
          error: '',
          data: res.data
        });
      } else {
        setCouponState(prev => ({
          ...prev,
          loading: false,
          error: res?.message || 'Cupom promocional inválido ou expirado.'
        }));
      }
    } catch (err) {
      setCouponState(prev => ({
        ...prev,
        loading: false,
        error: err?.message || 'Erro ao validar cupom.'
      }));
    }
  };

  // Submissão do Checkout
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!customer.name.trim() || !customer.email.trim() || !customer.cpf || !customer.phone) {
      setFormError('Por favor, preencha todos os seus dados pessoais.');
      return;
    }

    setSubmitting(true);

    try {
      const isFreeOrder = isFree || finalAmountCents === 0;
      const payload = {
        tier_id: activeTier.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_cpf: customer.cpf,
        customer_phone: customer.phone,
        payment_method: isFreeOrder ? 'free' : paymentMethod,
        coupon_code: couponState.applied ? couponCode.trim().toUpperCase() : null,
        installments: paymentMethod === 'card' ? installments : 1,
        card_data: paymentMethod === 'card' ? cardData : null,
        holder_info: (paymentMethod === 'card' && holderType === 'third_party') ? {
          is_same_as_attendee: false,
          name: holderInfo.name,
          cpf: holderInfo.cpf,
          phone: holderInfo.phone || customer.phone
        } : null,
        accreditation_data: isFreeOrder ? accreditationData : null
      };

      const res = await congressApi.checkout(payload);

      if (res?.ok && res?.data) {
        setCheckoutResult(res.data);
        // Se for pagamento com cartão e tiver a URL oficial hospedada do Asaas, redireciona imediatamente
        if (paymentMethod === 'card' && res.data.invoice_url) {
          window.location.href = res.data.invoice_url;
          return;
        }
      } else {
        const errorMsg = res?.error || res?.message || 'O banco não autorizou a transação.';
        setFormError(errorMsg);
        if (paymentMethod === 'card') {
          setCardDeclineCount(prev => prev + 1);
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Falha de comunicação segura. Tente novamente.';
      setFormError(msg);
      if (paymentMethod === 'card') {
        setCardDeclineCount(prev => prev + 1);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Polling em background para verificar aprovação automática do PIX
  useEffect(() => {
    let interval = null;
    if (checkoutResult && checkoutResult.payment_method === 'pix' && checkoutResult.ticket_token) {
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
  }, [checkoutResult]);

  // Copiar Código PIX com Fallback Robusto 3-Tier (Mobile Safari, Chrome iOS & Android)
  const handleCopyPix = () => {
    const text = checkoutResult?.pix_copy_paste;
    if (!text) return;

    let copied = false;
    // Tier 1: Clipboard API nativa
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedPix(true);
          setTimeout(() => setCopiedPix(false), 3000);
        })
        .catch(() => {
          fallbackCopy(text);
        });
      return;
    }

    fallbackCopy(text);
  };

  const fallbackCopy = (text) => {
    try {
      const el = document.getElementById('pixCopyPasteInput');
      if (el) {
        el.focus();
        el.select();
        el.setSelectionRange(0, 99999); // Mobile iOS Safari
      }
      const successful = document.execCommand('copy');
      if (successful) {
        setCopiedPix(true);
        setTimeout(() => setCopiedPix(false), 3000);
      }
    } catch (err) {
      console.warn('Erro na copia manual:', err);
    }
  };

  // Gerar Nova Chave PIX
  const handleRegeneratePix = () => {
    setCheckoutResult(null);
    setFormError('');
  };

  // Texto WhatsApp VIP
  const vipWhatsAppUrl = useMemo(() => {
    const text = encodeURIComponent(
      `Olá equipe Body Harmony! Estou tentando finalizar minha inscrição no Congresso (${activeTier.name}) no valor de R$ ${(finalAmountCents / 100).toFixed(2).replace('.', ',')}, mas meu pagamento via PIX apresentou inconsistência. Podem me ajudar a emitir um código novo ou pagar de outra forma? Meu nome é ${customer.name || 'congressista'}.`
    );
    return `https://wa.me/5518996959486?text=${text}`;
  }, [activeTier, finalAmountCents, customer]);

  // Se PIX gerado com sucesso
  if (checkoutResult && checkoutResult.payment_method === 'pix') {
    return (
      <PageContainer>
        <ContentWrapper style={{ maxWidth: '650px' }}>
          <SectionCard style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <QrCode size={32} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 0.5rem' }}>
              Pague com PIX para Confirmar sua Vaga
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '0 0 1.75rem' }}>
              Abra o app do seu banco, escolha <strong>PIX Copia e Cola</strong> ou aponte a câmera para o QR Code abaixo.
            </p>

            {/* Imagem do QR Code em Alta Definição */}
            {checkoutResult.pix_qr_code && (
              <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', display: 'inline-block', marginBottom: '1.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
                <img 
                  src={checkoutResult.pix_qr_code} 
                  alt="QR Code PIX" 
                  style={{ width: '230px', height: '230px', display: 'block' }} 
                />
              </div>
            )}

            {/* Código Copia e Cola com 3-Tier Fallback */}
            {checkoutResult.pix_copy_paste && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    id="pixCopyPasteInput"
                    type="text" 
                    readOnly 
                    value={checkoutResult.pix_copy_paste} 
                    onClick={(e) => e.target.select()}
                    style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem', color: '#CBD5E1', fontSize: '0.8rem', fontFamily: 'monospace' }} 
                  />
                  <AuraButtonPrimary type="button" onClick={handleCopyPix} style={{ minHeight: '44px', padding: '0 1.25rem', gap: '0.4rem', fontSize: '0.85rem' }}>
                    {copiedPix ? <Check size={16} /> : <Copy size={16} />}
                    {copiedPix ? 'Copiado!' : 'Copiar Código'}
                  </AuraButtonPrimary>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', textAlign: 'left' }}>
                  Dica: Se o botão não colar no seu aplicativo do banco, toque dentro da caixa de texto para selecionar e copiar manualmente.
                </div>
              </div>
            )}

            {/* Chave PIX Direta Oficial (Zero Intermediários Bacen) */}
            <div style={{ background: 'rgba(10, 62, 96, 0.4)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', color: '#FDE68A', fontWeight: 700, marginBottom: '0.35rem' }}>
                🔑 Chave PIX Aleatória Direta (Se preferir transferir pelo app do seu banco):
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', background: 'rgba(0,0,0,0.35)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#FFFFFF', wordBreak: 'break-all' }}>
                  c15a5ca2-ba54-4501-9beb-0f07ca3d21e2
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('c15a5ca2-ba54-4501-9beb-0f07ca3d21e2');
                    setCopiedPix(true);
                    setTimeout(() => setCopiedPix(false), 2500);
                  }}
                  style={{ background: '#D4AF37', color: '#0A3E60', border: 'none', borderRadius: '4px', padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                >
                  Copiar Chave
                </button>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '0.4rem' }}>
                Favorecido: <strong>Body Harmony Eletroestimu</strong> · Valor exato: <strong>R$ {(finalAmountCents / 100).toFixed(2).replace('.', ',')}</strong>
              </div>
            </div>

            {/* Status em Tempo Real */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.65rem', 
              margin: '0 0 1.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              color: '#f9e27e',
              fontWeight: 600
            }}>
              <RefreshCw size={15} style={{ animation: 'spin 2s linear infinite' }} />
              <span>Aguardando pagamento... Sincronização bancária ativa em tempo real</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {checkoutResult.asaas_invoice_url && (
                <AuraButtonPrimary 
                  as="a" 
                  href={checkoutResult.asaas_invoice_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ textDecoration: 'none', justifyContent: 'center', minHeight: '46px', gap: '0.5rem', fontSize: '0.88rem' }}
                >
                  <ExternalLink size={16} /> Abrir Página Oficial de Pagamento Asaas
                </AuraButtonPrimary>
              )}

              <AuraButtonGhost 
                type="button" 
                onClick={handleRegeneratePix} 
                style={{ justifyContent: 'center', minHeight: '44px', gap: '0.5rem', fontSize: '0.85rem', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <RotateCcw size={15} /> Gerar Novo Código PIX / Alterar Forma de Pagamento
              </AuraButtonGhost>

              <AuraButtonGhost as="a" href={vipWhatsAppUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', justifyContent: 'center', minHeight: '46px', gap: '0.5rem', fontSize: '0.88rem' }}>
                <MessageSquare size={16} /> Dúvidas no pagamento? Falar no WhatsApp
              </AuraButtonGhost>
            </div>
          </SectionCard>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // Se Cartão ou Credenciamento Aprovado com sucesso
  if (checkoutResult && (checkoutResult.payment_status === 'CONFIRMED' || checkoutResult.payment_status === 'RECEIVED' || checkoutResult.payment_status === 'FREE_APPROVED' || checkoutResult.payment_method === 'free')) {
    return (
      <PageContainer>
        <ContentWrapper style={{ maxWidth: '650px' }}>
          <SectionCard style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle2 size={32} />
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 0.5rem' }}>
              Inscrição Confirmada com Sucesso!
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: '0 0 1.75rem' }}>
              Parabéns, {customer.name}! Seu ingresso para o <strong>1º Congresso Brasileiro de Musculação Elétrica</strong> está garantido.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed #D4AF37', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seu Código de Acesso</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', fontFamily: 'monospace', margin: '0.25rem 0' }}>
                {checkoutResult.ticket_token || 'CONFIRMADO'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Lote: {activeTier.name}</div>
            </div>
            <AuraButtonPrimary as={Link} to="/congresso" style={{ textDecoration: 'none', justifyContent: 'center', minHeight: '48px', width: '100%' }}>
              Voltar para a Página do Congresso
            </AuraButtonPrimary>
          </SectionCard>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <HeaderBar>
          <Link to="/congresso" className="back-link">
            <ArrowLeft size={16} /> Voltar ao Congresso
          </Link>
          <div className="security-badge">
            <ShieldCheck size={14} /> Pagamento 100% Blindado & Seguro
          </div>
        </HeaderBar>

        <form onSubmit={handleSubmit}>
          <GridContainer>
            {/* Coluna Esquerda: Dados do Congressista e Pagamento */}
            <FormColumn>
              {/* 1. Dados Pessoais */}
              <SectionCard>
                <SectionHeader>
                  <div className="step-number">1</div>
                  <h2>Seus Dados Pessoais</h2>
                </SectionHeader>

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
              </SectionCard>

              {/* 2. Forma de Pagamento / Credenciamento */}
              <SectionCard>
                <SectionHeader>
                  <div className="step-number">2</div>
                  <h2>{isFree ? 'Credenciamento 100% Isento' : 'Forma de Pagamento'}</h2>
                </SectionHeader>

                {isFree ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                      <Award size={24} color="#10B981" />
                      <div>
                        <div style={{ color: '#F8FAFC', fontWeight: 800, fontSize: '1rem' }}>
                          Inscrição 100% Gratuita Liberada
                        </div>
                        <div style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 600 }}>
                          Cupom {couponState.data?.coupon_code || couponCode} aplicado com sucesso!
                        </div>
                      </div>
                    </div>
                    <FormGroup $cols={2} style={{ marginTop: '1rem' }}>
                      <InputWrapper>
                        <label>Categoria / Modalidade da Atleta (Opcional)</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Bikini / Wellness / Convidada" 
                          value={accreditationData.athlete_category}
                          onChange={(e) => setAccreditationData(prev => ({ ...prev, athlete_category: e.target.value }))}
                        />
                      </InputWrapper>
                      <InputWrapper>
                        <label>Instagram Oficial (Opcional)</label>
                        <input 
                          type="text" 
                          placeholder="@seuinstagram" 
                          value={accreditationData.instagram_handle}
                          onChange={(e) => setAccreditationData(prev => ({ ...prev, instagram_handle: e.target.value }))}
                        />
                      </InputWrapper>
                    </FormGroup>
                  </div>
                ) : (
                  <PaymentTabs>
                    <PaymentTabBtn 
                      type="button" 
                      $active={paymentMethod === 'pix'} 
                      onClick={() => { setPaymentMethod('pix'); setFormError(''); }}
                    >
                      <QrCode size={22} color={paymentMethod === 'pix' ? '#D4AF37' : '#94A3B8'} />
                      <span>PIX Instantâneo</span>
                      <span className="badge-sub">Aprovação Imediata</span>
                    </PaymentTabBtn>

                    <PaymentTabBtn 
                      type="button" 
                      $active={paymentMethod === 'card'} 
                      onClick={() => { setPaymentMethod('card'); setFormError(''); }}
                    >
                      <CreditCard size={22} color={paymentMethod === 'card' ? '#D4AF37' : '#94A3B8'} />
                      <span>Cartão de Crédito</span>
                      <span className="badge-sub">Em até 12x</span>
                    </PaymentTabBtn>
                  </PaymentTabs>
                )}

                {/* Bloco de Cartão de Crédito */}
                {paymentMethod === 'card' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{
                      background: 'rgba(212, 175, 55, 0.05)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                        <ShieldCheck size={22} color="#D4AF37" />
                        <div>
                          <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: '0.95rem' }}>
                            Checkout Blindado Asaas (Até 12x)
                          </div>
                          <div style={{ color: '#94A3B8', fontSize: '0.78rem' }}>
                            Ambiente bancário oficial com autenticação 3D-Secure
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.5', marginBottom: '1rem' }}>
                        Para sua total proteção e evitar bloqueios por divergência de titularidade, você será direcionado para a <strong>fatura oficial do Asaas</strong> ao clicar no botão abaixo.
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '0.65rem',
                        background: 'rgba(10, 25, 47, 0.6)',
                        padding: '0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.78rem',
                        color: '#94A3B8'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle2 size={14} color="#10B981" /> Aceita cartão de terceiros (mãe/parente/empresa)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle2 size={14} color="#10B981" /> Parcelamento em até 12x no cartão
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle2 size={14} color="#10B981" /> Liberação imediata da sua vaga
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle2 size={14} color="#10B981" /> Sem necessidade de digitar cartão aqui
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Alerta de Erro com Ações de Resgate */}
                {formError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F87171', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      <AlertCircle size={16} /> {(formError.toLowerCase().includes('cartão') || formError.toLowerCase().includes('card')) ? 'Não foi possível autorizar o cartão' : 'Atenção na Inscrição'}
                    </div>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.4' }}>
                      {formError}. {!isFree && 'Que tal pagar com aprovação instantânea no PIX?'}
                    </p>
                    {!isFree && (
                      <AuraButtonPrimary 
                        type="button" 
                        onClick={() => { setPaymentMethod('pix'); setFormError(''); }}
                        style={{ minHeight: '38px', fontSize: '0.82rem', padding: '0 1rem', width: 'auto' }}
                      >
                        <QrCode size={15} /> Pagar com PIX Agora (Sem Erros)
                      </AuraButtonPrimary>
                    )}
                  </div>
                )}

                {/* Botão de Atendimento VIP após 2 recusas */}
                {cardDeclineCount >= 2 && (
                  <VipHelpCard>
                    <h4><Sparkles size={16} /> Dificuldades com o Cartão? Fale no WhatsApp VIP</h4>
                    <p>
                      Nossa equipe do Congresso está de plantão agora para liberar sua inscrição por link alternativo ou maquininha manual!
                    </p>
                    <AuraButtonPrimary 
                      as="a" 
                      href={vipWhatsAppUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', minHeight: '44px', justifyContent: 'center', fontSize: '0.88rem', gap: '0.5rem' }}
                    >
                      <MessageSquare size={16} /> Chamar no WhatsApp VIP Agora
                    </AuraButtonPrimary>
                  </VipHelpCard>
                )}
              </SectionCard>
            </FormColumn>

            {/* Coluna Direita: Resumo do Pedido & Cupom */}
            <SummaryColumn>
              <SummaryBox>
                <SectionHeader style={{ borderBottom: 'none', marginBottom: '0.75rem', paddingBottom: 0 }}>
                  <Award size={18} color="#D4AF37" />
                  <h2>Resumo do Ingresso</h2>
                </SectionHeader>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#D4AF37' }}>
                    {activeTier.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                    1º Congresso Brasileiro de Musculação Elétrica
                  </div>
                </div>

                {/* Motor de Cupons */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '0.4rem' }}>
                    Cupom de Licenciada ou Desconto
                  </label>
                  {!couponState.applied ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="Ex: LICENCIADA20" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#F8FAFC', fontSize: '0.85rem' }}
                      />
                      <AuraButtonPrimary 
                        type="button" 
                        onClick={handleApplyCoupon} 
                        disabled={couponState.loading}
                        style={{ minHeight: '38px', padding: '0 1rem', fontSize: '0.82rem' }}
                      >
                        {couponState.loading ? '...' : 'Aplicar'}
                      </AuraButtonPrimary>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: '8px', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: 700 }}>
                        ✓ {couponState.data?.coupon_code} ({couponState.data?.discount_percentage}% OFF)
                      </span>
                      <button 
                        type="button" 
                        onClick={() => { setCouponState({ applied: false, loading: false, error: '', data: null }); setCouponCode(''); }}
                        style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                      >
                        Remover
                      </button>
                    </div>
                  )}
                  {couponState.error && (
                    <div style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                      {couponState.error}
                    </div>
                  )}
                </div>

                {/* Discriminador Financeiro */}
                <SummaryRow>
                  <span>Valor do Lote</span>
                  <span>R$ {(baseAmountCents / 100).toFixed(2).replace('.', ',')}</span>
                </SummaryRow>
                {discountCents > 0 && (
                  <SummaryRow $highlight>
                    <span>Desconto Aplicado</span>
                    <span>- R$ {(discountCents / 100).toFixed(2).replace('.', ',')}</span>
                  </SummaryRow>
                )}
                <SummaryRow $total>
                  <span>Total Final</span>
                  <span className="total-price">
                    {isFree ? 'R$ 0,00 (100% OFF)' : `R$ ${(finalAmountCents / 100).toFixed(2).replace('.', ',')}`}
                  </span>
                </SummaryRow>

                <div style={{ marginTop: '1.5rem' }}>
                  <AuraButtonPrimary 
                    type="submit" 
                    disabled={submitting} 
                    style={{ width: '100%', minHeight: '52px', fontSize: '1rem', fontWeight: 800, justifyContent: 'center' }}
                  >
                    {submitting 
                      ? 'Processando Inscrição...' 
                      : isFree 
                        ? 'Confirmar Credenciamento Gratuito' 
                        : (paymentMethod === 'pix' ? 'Gerar PIX e Concluir Vaga' : `Pagar R$ ${(finalAmountCents / 100).toFixed(2).replace('.', ',')}`)}
                  </AuraButtonPrimary>
                </div>
              </SummaryBox>
            </SummaryColumn>
          </GridContainer>
        </form>
      </ContentWrapper>
    </PageContainer>
  );
}
