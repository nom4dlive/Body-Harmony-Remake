import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  CheckCircle2, Copy, Check, ExternalLink, 
  Send, Sparkles, X, ShieldCheck, Loader2,
  AlertCircle, User
} from 'lucide-react';
import { onboardingApi, contractsApi } from '../../services/api';

// ── Animations ─────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

const overlayFade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ── Styled Components (Luxury UI/UX Pro Max) ───────────────────────────────
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(10, 25, 41, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  overflow-y: auto;
  animation: ${overlayFade} 0.2s ease-out;
`;

const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 680px;
  background: var(--bh-bg-card, #ffffff);
  border-radius: 20px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
  border: 1px solid var(--bh-border, #e2e8f0);
  overflow: hidden;
  margin: auto;
  animation: ${fadeIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'Montserrat', sans-serif;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #0A3E60 0%, #062338 100%);
  padding: 1.5rem 1.75rem;
  color: #ffffff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(237, 126, 19, 0.2);

  @media (max-width: 640px) {
    padding: 1.25rem 1rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
`;

const HeaderIconBox = styled.div`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 12px;
  background: rgba(237, 126, 19, 0.15);
  border: 1px solid rgba(237, 126, 19, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bh-gold, #ed7e13);
  box-shadow: 0 4px 12px rgba(237, 126, 19, 0.2);
`;

const HeaderTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.3px;
  color: #ffffff;
  font-family: 'Montserrat', sans-serif;

  @media (max-width: 640px) {
    font-size: 1.1rem;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 0.75rem;
  color: var(--bh-gold, #ed7e13);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 3px 0 0 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem 1.75rem;
  max-height: calc(85vh - 120px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--bh-bg-card, #ffffff);

  @media (max-width: 640px) {
    padding: 1.25rem 1rem;
    gap: 1rem;
  }
`;

const LeadCard = styled.div`
  background: var(--bh-bg-subtle, #f8fafc);
  border: 1px solid var(--bh-border, #e2e8f0);
  border-radius: 14px;
  padding: 1.1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
`;

const LeadCardHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--bh-border, #e2e8f0);
`;

const LeadInfoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const LeadName = styled.span`
  font-weight: 800;
  color: var(--bh-text-title, #0a3e60);
  font-size: 0.95rem;
`;

const CategoryBadge = styled.span`
  background: rgba(10, 62, 96, 0.08);
  color: var(--bh-text-title, #0a3e60);
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid rgba(10, 62, 96, 0.15);
`;

const ValidatedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #047857;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-weight: 700;
`;

const LeadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const LeadGridItem = styled.div`
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  .label {
    color: #64748b;
    font-weight: 600;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .value {
    color: var(--bh-text-primary, #1e293b);
    font-weight: 700;
    word-break: break-word;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--bh-text-secondary, #475569);
  display: block;
`;

const Select = styled.select`
  width: 100%;
  background: var(--bh-bg-card, #ffffff);
  border: 1.5px solid var(--bh-border, #cbd5e1);
  color: var(--bh-text-primary, #0f172a);
  font-size: 0.875rem;
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  min-height: 46px;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.2s ease;
  outline: none;

  &:focus {
    border-color: var(--bh-primary, #0a3e60);
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.12);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  width: 100%;
  background: var(--bh-bg-card, #ffffff);
  border: 1.5px solid var(--bh-border, #cbd5e1);
  color: var(--bh-text-primary, #0f172a);
  font-size: 0.875rem;
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  min-height: 46px;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.2s ease;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: var(--bh-primary, #0a3e60);
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.12);
  }

  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }
`;

const CurrencyWrapper = styled.div`
  position: relative;
  width: 100%;

  .currency-prefix {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-weight: 700;
    font-size: 0.875rem;
    pointer-events: none;
  }

  input {
    padding-left: 2.5rem;
    font-weight: 800;
    color: var(--bh-text-title, #0a3e60);
    font-size: 0.95rem;
  }
`;

const ExtensoCard = styled.div`
  background: rgba(237, 126, 19, 0.07);
  border: 1px solid rgba(237, 126, 19, 0.25);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  .title {
    color: #b45309;
    font-weight: 700;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .extenso-text {
    color: #78350f;
    font-weight: 800;
    font-style: italic;
    font-size: 0.875rem;
    line-height: 1.4;
  }
`;

const PaymentOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const PaymentOptionButton = styled.button`
  padding: 0.75rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: inherit;
  border: 1.5px solid ${props => props.$active ? 'var(--bh-primary, #0A3E60)' : 'var(--bh-border, #e2e8f0)'};
  background: ${props => props.$active ? 'var(--bh-primary, #0A3E60)' : 'var(--bh-bg-subtle, #f8fafc)'};
  color: ${props => props.$active ? '#ffffff' : 'var(--bh-text-secondary, #475569)'};
  box-shadow: ${props => props.$active ? '0 4px 12px rgba(10, 62, 96, 0.2)' : 'none'};

  &:hover {
    border-color: ${props => props.$active ? 'var(--bh-primary, #0A3E60)' : 'var(--bh-gold, #ed7e13)'};
    background: ${props => props.$active ? 'var(--bh-primary, #0A3E60)' : '#ffffff'};
  }
`;

const ErrorBanner = styled.div`
  padding: 0.85rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.85rem;
  color: #b91c1c;
  font-weight: 600;
`;

const FooterActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--bh-border, #e2e8f0);

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    align-items: stretch;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.25rem;
  color: var(--bh-text-secondary, #64748b);
  background: transparent;
  border: 1.5px solid transparent;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: var(--bh-bg-subtle, #f1f5f9);
    color: var(--bh-text-primary, #1e293b);
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.65rem;
  background: linear-gradient(135deg, #ED7E13 0%, #D96B08 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 14px rgba(237, 126, 19, 0.35);
  transition: all 0.2s ease;
  font-family: inherit;
  letter-spacing: 0.2px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(237, 126, 19, 0.45);
    background: linear-gradient(135deg, #f58922 0%, #e07410 100%);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    animation: ${spin} 1s linear infinite;
  }
`;

// ── Success State Styled Components ─────────────────────────────────────────
const SuccessCard = styled.div`
  padding: 1.25rem;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  .icon-circle {
    width: 48px;
    height: 48px;
    background: #d1fae5;
    color: #059669;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h3 {
    font-size: 1.05rem;
    font-weight: 800;
    color: #065f46;
    margin: 0;
  }

  p {
    font-size: 0.8rem;
    color: #047857;
    margin: 0;
    max-width: 480px;
    line-height: 1.4;
  }
`;

const LinkBox = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  input {
    flex: 1;
    background: #f8fafc;
    border: 1.5px solid #cbd5e1;
    color: #334155;
    font-size: 0.8rem;
    border-radius: 12px;
    padding: 0.65rem 0.85rem;
    font-family: monospace;
    min-height: 44px;
    box-sizing: border-box;
  }
`;

const CopyButton = styled.button`
  padding: 0.65rem 1rem;
  background: var(--bh-primary, #0a3e60);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: #062338;
  }
`;

const MessagePreviewBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem;
  font-size: 0.8rem;
  color: #334155;
  white-space: pre-line;
  line-height: 1.5;
  max-height: 140px;
  overflow-y: auto;
  font-family: system-ui, -apple-system, sans-serif;
`;

const WhatsAppSendButton = styled.a`
  flex: 1;
  background: #25D366;
  color: #ffffff;
  font-weight: 800;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
  font-size: 0.875rem;
  min-height: 48px;
  transition: all 0.2s ease;

  &:hover {
    background: #1eb956;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(37, 211, 102, 0.4);
  }
`;

const SecondaryCloseButton = styled.button`
  padding: 0.85rem 1.25rem;
  background: #e2e8f0;
  color: #334155;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  cursor: pointer;
  min-height: 48px;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: #cbd5e1;
  }
`;

// ── Helper: Conversão defensiva de valor monetário para extenso em português ─
function numeroPorExtenso(valorNumerico) {
  if (!valorNumerico || isNaN(valorNumerico)) return 'zero reais';
  const val = Math.floor(valorNumerico);
  
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  if (val === 100) return 'cem reais';
  if (val === 1000) return 'um mil reais';

  const converterCentena = (n) => {
    let out = [];
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) {
      if (c === 1 && d === 0 && u === 0) {
        out.push('cem');
      } else {
        out.push(centenas[c]);
      }
    }

    if (d === 1) {
      out.push(especiais[u]);
    } else {
      if (d > 1) out.push(dezenas[d]);
      if (u > 0) out.push(unidades[u]);
    }
    return out.join(' e ');
  };

  if (val < 1000) {
    return converterCentena(val) + (val === 1 ? ' real' : ' reais');
  }

  if (val >= 1000 && val < 1000000) {
    const milhar = Math.floor(val / 1000);
    const resto = val % 1000;
    let parteMilhar = milhar === 1 ? 'um mil' : converterCentena(milhar) + ' mil';
    if (resto === 0) return parteMilhar + ' reais';
    let parteResto = converterCentena(resto);
    return `${parteMilhar}${resto <= 100 || resto % 100 === 0 ? ' e ' : ' '}${parteResto} reais`;
  }

  return `${val.toLocaleString('pt-BR')} reais`;
}

export default function GenerateContractModal({ isOpen, onClose, lead, onSuccess }) {
  if (!isOpen || !lead) return null;

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('contrato-licenciamento-padrao');
  const [valor, setValor] = useState('15000');
  const [condicoesPagamento, setCondicoesPagamento] = useState('A_VISTA_PIX');
  const [customCondicoes, setCustomCondicoes] = useState('');
  const [vigenciaMeses, setVigenciaMeses] = useState('12');
  const [foro, setForo] = useState('São Paulo / SP');
  const [observacoes, setObservacoes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado pós-emissão
  const [generatedContract, setGeneratedContract] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    // Reset states on open
    setGeneratedContract(null);
    setError(null);
    setCopiedLink(false);
    setCopiedMsg(false);

    // Sugerir valor por taxa pré-cadastrada ou categoria
    if (lead.taxa_inicial_num) {
      const cleanNum = String(lead.taxa_inicial_num).replace(/\./g, '').replace(',', '.');
      const parsed = parseFloat(cleanNum);
      if (!isNaN(parsed) && parsed > 0) {
        setValor(String(parsed));
      } else if (lead.categoria?.toLowerCase().includes('diamond')) {
        setValor('45000');
      } else if (lead.categoria?.toLowerCase().includes('ouro') || lead.categoria?.toLowerCase().includes('gold')) {
        setValor('30000');
      } else if (lead.categoria?.toLowerCase().includes('prata')) {
        setValor('20000');
      } else {
        setValor('15000');
      }
    } else if (lead.categoria?.toLowerCase().includes('diamond')) {
      setValor('45000');
    } else if (lead.categoria?.toLowerCase().includes('ouro') || lead.categoria?.toLowerCase().includes('gold')) {
      setValor('30000');
    } else if (lead.categoria?.toLowerCase().includes('prata')) {
      setValor('20000');
    } else {
      setValor('15000');
    }

    // Carregar modelos ativos
    const loadTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const res = await contractsApi.getTemplates();
        if (res && Array.isArray(res.templates) && res.templates.length > 0) {
          setTemplates(res.templates);
          setSelectedTemplate(res.templates[0].slug || res.templates[0].id);
        } else {
          setTemplates([
            { id: '1', slug: 'contrato-licenciamento-padrao', title: 'Contrato Padrão de Licenciamento Body Harmony' },
            { id: '2', slug: 'contrato-licenciamento-premium', title: 'Contrato Master de Licenciamento Premium' },
            { id: '3', slug: 'termo-adesao-clinica', title: 'Termo de Adesão & Credenciamento de Clínica' }
          ]);
        }
      } catch (err) {
        console.warn('Fallback templates:', err);
        setTemplates([
          { id: '1', slug: 'contrato-licenciamento-padrao', title: 'Contrato Padrão de Licenciamento Body Harmony' },
          { id: '2', slug: 'contrato-licenciamento-premium', title: 'Contrato Master de Licenciamento Premium' },
          { id: '3', slug: 'termo-adesao-clinica', title: 'Termo de Adesão & Credenciamento de Clínica' }
        ]);
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, [lead, isOpen]);

  const numVal = parseFloat(valor) || 0;
  const valorExtenso = numeroPorExtenso(numVal);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formattedNum = numVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const payload = {
        template_slug: selectedTemplate,
        valor: numVal,
        valor_num: formattedNum,
        taxa_inicial_num: formattedNum,
        taxa_inicial_extenso: valorExtenso,
        valor_extenso: valorExtenso,
        condicoes_pagamento: condicoesPagamento === 'OUTRO' ? customCondicoes : condicoesPagamento,
        vigencia_meses: parseInt(vigenciaMeses, 10) || 12,
        foro: foro,
        observacoes: observacoes,
        categoria: lead.categoria || 'Licenciamento'
      };

      const response = await onboardingApi.generateContract(lead.id, payload);

      if (response && (response.success || response.contract_uuid)) {
        const signToken = response.sign_token || response.contract_uuid || 'token-preview';
        const signUrl = `${window.location.origin}/assinar/${signToken}`;
        
        // Monta mensagem personalizada oficial para WhatsApp
        const cleanPhone = (lead.telefone_whatsapp || '').replace(/\D/g, '');
        const leadFirstName = (lead.nome || 'Licenciada').split(' ')[0];
        
        const whatsAppText = `Olá, ${leadFirstName}! Tudo bem? ✨\n\nSeu Contrato de Licenciamento Body Harmony foi gerado com sucesso e já está pronto para assinatura digital com total validade jurídica! 🔒📄\n\nVocê pode ler o documento e assinar direto na tela do seu celular pelo link seguro abaixo:\n\n🔗 *Link para Assinatura Digital:*\n${signUrl}\n\nAssim que você assinar, nosso sistema já avança para a liberação dos seus acessos. Qualquer dúvida, conte comigo! 🌿💖`;

        const contractData = {
          contract_uuid: response.contract_uuid,
          sign_token: signToken,
          sign_url: signUrl,
          whatsapp_text: whatsAppText,
          whatsapp_url: `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(whatsAppText)}`
        };

        setGeneratedContract(contractData);
        if (onSuccess) onSuccess(contractData);
      } else {
        throw new Error(response?.error || response?.message || 'Falha ao gerar contrato');
      }
    } catch (err) {
      console.error('Erro na emissão 1-clique:', err);
      setError(err.message || 'Erro ao conectar ao servidor de contratos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedContract?.sign_url) return;
    navigator.clipboard.writeText(generatedContract.sign_url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyMsg = () => {
    if (!generatedContract?.whatsapp_text) return;
    navigator.clipboard.writeText(generatedContract.whatsapp_text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 3000);
  };

  return (
    <Overlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalContainer>
        
        {/* HEADER */}
        <ModalHeader>
          <HeaderContent>
            <HeaderIconBox>
              <Sparkles size={22} />
            </HeaderIconBox>
            <div>
              <HeaderTitle>
                Emissão de Contrato em 1-Clique
              </HeaderTitle>
              <HeaderSubtitle>
                Nexus Protocol V3.1 • Compilação Jurídica Digital
              </HeaderSubtitle>
            </div>
          </HeaderContent>
          <CloseButton onClick={onClose} title="Fechar modal">
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        {/* BODY */}
        <ModalBody>
          
          {/* LEAD SUMMARY CARD */}
          <LeadCard>
            <LeadCardHeader>
              <LeadInfoLeft>
                <User size={16} color="var(--bh-text-title, #0a3e60)" />
                <LeadName>{lead.nome || 'Nome não informado'}</LeadName>
                <CategoryBadge>{lead.categoria || 'Licenciamento'}</CategoryBadge>
              </LeadInfoLeft>
              <ValidatedBadge>
                <ShieldCheck size={14} />
                <span>Dados & OCR Validados</span>
              </ValidatedBadge>
            </LeadCardHeader>

            <LeadGrid>
              <LeadGridItem>
                <span className="label">CPF / Documento:</span>
                <span className="value">{lead.cpf || 'Não informado'}</span>
              </LeadGridItem>
              <LeadGridItem>
                <span className="label">WhatsApp:</span>
                <span className="value">{lead.telefone_whatsapp || 'Não informado'}</span>
              </LeadGridItem>
              <LeadGridItem>
                <span className="label">Cidade / Estado:</span>
                <span className="value">
                  {lead.cidade ? `${lead.cidade}/${lead.estado || 'SP'}` : 'Não informada'}
                </span>
              </LeadGridItem>
            </LeadGrid>
          </LeadCard>

          {error && (
            <ErrorBanner>
              <AlertCircle size={18} />
              <span>{error}</span>
            </ErrorBanner>
          )}

          {/* SUCESSO / DISPARO WHATSAPP */}
          {generatedContract ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <SuccessCard>
                <div className="icon-circle">
                  <CheckCircle2 size={26} />
                </div>
                <h3>Contrato Emitido com Sucesso!</h3>
                <p>
                  O documento foi compilado com validade jurídica SHA-256 e o token de assinatura foi gerado.
                </p>
              </SuccessCard>

              {/* LINK DE ASSINATURA */}
              <FormGroup>
                <Label>Link de Assinatura Digital da Licenciada</Label>
                <LinkBox>
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedContract.sign_url} 
                  />
                  <CopyButton type="button" onClick={handleCopyLink}>
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                  </CopyButton>
                </LinkBox>
              </FormGroup>

              {/* PRÉVIA DA MENSAGEM WHATSAPP */}
              <FormGroup>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Label>Mensagem Pronta para WhatsApp (Régua PLAN-064)</Label>
                  <button
                    type="button"
                    onClick={handleCopyMsg}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--bh-text-title, #0a3e60)', 
                      fontWeight: 700, 
                      fontSize: '0.75rem', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}
                  >
                    {copiedMsg ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    <span>{copiedMsg ? 'Mensagem copiada!' : 'Copiar texto'}</span>
                  </button>
                </div>
                <MessagePreviewBox>
                  {generatedContract.whatsapp_text}
                </MessagePreviewBox>
              </FormGroup>

              {/* AÇÕES PÓS-EMISSÃO */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
                <WhatsAppSendButton
                  href={generatedContract.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send size={16} />
                  <span>Enviar Agora no WhatsApp</span>
                  <ExternalLink size={14} style={{ opacity: 0.8 }} />
                </WhatsAppSendButton>
                <SecondaryCloseButton type="button" onClick={onClose}>
                  Concluir & Fechar
                </SecondaryCloseButton>
              </div>
            </div>
          ) : (
            /* FORMULÁRIO DE EMISSÃO 1-CLIQUE */
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {/* SELEÇÃO DO MODELO */}
              <FormGroup>
                <Label>Modelo de Contrato Jurídico</Label>
                <Select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  disabled={loadingTemplates || loading}
                >
                  {templates.map(tpl => (
                    <option key={tpl.slug || tpl.id} value={tpl.slug || tpl.id}>
                      {tpl.title || tpl.name || tpl.slug}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              {/* VALOR E CONVERSÃO EXTENSO */}
              <FormRow>
                <FormGroup>
                  <Label>Valor Total da Licença (R$)</Label>
                  <CurrencyWrapper>
                    <span className="currency-prefix">R$</span>
                    <Input 
                      type="number"
                      min="0"
                      step="any"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      required
                    />
                  </CurrencyWrapper>
                </FormGroup>

                <FormGroup>
                  <Label>Vigência Contratual</Label>
                  <Select
                    value={vigenciaMeses}
                    onChange={(e) => setVigenciaMeses(e.target.value)}
                  >
                    <option value="12">12 Meses (1 Ano)</option>
                    <option value="24">24 Meses (2 Anos)</option>
                    <option value="36">36 Meses (3 Anos)</option>
                    <option value="6">6 Meses (Experimental)</option>
                  </Select>
                </FormGroup>
              </FormRow>

              {/* VALOR POR EXTENSO AUTO */}
              <ExtensoCard>
                <span className="title">Valor por extenso (auto-injetado no contrato):</span>
                <span className="extenso-text">"{valorExtenso}"</span>
              </ExtensoCard>

              {/* CONDIÇÃO DE PAGAMENTO */}
              <FormGroup>
                <Label>Condições de Pagamento</Label>
                <PaymentOptionsGrid>
                  {[
                    { id: 'A_VISTA_PIX', label: 'À Vista no PIX' },
                    { id: 'ENTRADA_CARTAO', label: 'Entrada + Cartão' },
                    { id: 'BOLETO_FATURADO', label: 'Boleto Bancário' }
                  ].map(item => (
                    <PaymentOptionButton
                      key={item.id}
                      type="button"
                      $active={condicoesPagamento === item.id}
                      onClick={() => setCondicoesPagamento(item.id)}
                    >
                      {item.label}
                    </PaymentOptionButton>
                  ))}
                </PaymentOptionsGrid>
              </FormGroup>

              {/* FORO E DETALHES */}
              <FormRow>
                <FormGroup>
                  <Label>Foro de Eleição</Label>
                  <Input 
                    type="text"
                    value={foro}
                    onChange={(e) => setForo(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Observações Internas</Label>
                  <Input 
                    type="text"
                    placeholder="Opcional..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  />
                </FormGroup>
              </FormRow>

              {/* SUBMIT BUTTON */}
              <FooterActions>
                <CancelButton
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </CancelButton>
                <SubmitButton
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      <span>Compilando PDF & Assinatura...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Emitir Contrato 1-Clique</span>
                    </>
                  )}
                </SubmitButton>
              </FooterActions>

            </form>
          )}

        </ModalBody>

      </ModalContainer>
    </Overlay>
  );
}
