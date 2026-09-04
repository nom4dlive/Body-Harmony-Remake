import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { 
  ShieldCheck, UploadCloud, Camera, CheckCircle2, AlertCircle, 
  User, Phone, Mail, MapPin, FileText, ChevronRight, ChevronLeft, 
  Loader2, Sparkles, Building, Lock, Eye, Trash2,
  Instagram, CreditCard, Award, Plus, FileCheck, Check
} from 'lucide-react';
import { onboardingApi } from '../services/api';

// ── KEYFRAMES & ANIMATIONS ──────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 15px rgba(237, 126, 19, 0.2); }
  50% { box-shadow: 0 0 25px rgba(237, 126, 19, 0.4); }
`;

// ── LUXURY STYLED COMPONENTS ────────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  color: #1e293b;
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
`;

const TopHeader = styled.header`
  background: linear-gradient(135deg, #0a3e60 0%, #051a29 100%);
  color: white;
  padding: 2.25rem 1rem 3.5rem 1rem;
  text-align: center;
  position: relative;
  box-shadow: 0 4px 25px rgba(10, 62, 96, 0.2);

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 20px;
    background: #f8fafc;
    border-radius: 24px 24px 0 0;
  }
`;

const BrandBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(237, 126, 19, 0.15);
  border: 1px solid rgba(237, 126, 19, 0.4);
  color: #ed7e13;
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
`;

const HeaderTitle = styled.h1`
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 0.4rem;
  color: #ffffff;

  @media (min-width: 640px) {
    font-size: 2rem;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 0.88rem;
  color: #94a3b8;
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.45;
`;

const ContentContainer = styled.main`
  flex: 1;
  max-width: 720px;
  width: 100%;
  margin: -1.75rem auto 2.5rem auto;
  padding: 0 1rem;
  z-index: 10;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 1.25rem;
  box-shadow: 0 10px 30px rgba(10, 62, 96, 0.07), 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;

  @media (min-width: 640px) {
    padding: 2.25rem;
  }
`;

/* STEPPER */
const StepperWrapper = styled.div`
  margin-bottom: 2rem;
`;

const StepperTrack = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: 0.75rem;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 3px;
    background: #e2e8f0;
    transform: translateY(-50%);
    z-index: 1;
  }
`;

const StepperProgress = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #0a3e60 0%, #ed7e13 100%);
  transform: translateY(-50%);
  z-index: 2;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${props => props.$percent}%;
`;

const StepNode = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${props => props.$active ? '#0a3e60' : props.$completed ? '#ed7e13' : '#ffffff'};
  color: ${props => props.$active || props.$completed ? '#ffffff' : '#64748b'};
  border: 2px solid ${props => props.$active ? '#0a3e60' : props.$completed ? '#ed7e13' : '#cbd5e1'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  position: relative;
  z-index: 3;
  transition: all 0.25s;
  ${props => props.$active && pulseGlow}
`;

const StepLabels = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 0.2rem;
`;

const StepLabel = styled.span`
  font-size: 0.72rem;
  font-weight: ${props => props.$active ? '700' : '500'};
  color: ${props => props.$active ? '#0a3e60' : '#64748b'};
  text-align: center;
  width: 70px;
`;

/* FORM CONTROLS */
const FormGroup = styled.div`
  margin-bottom: 1.15rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #475569;
  margin-bottom: 0.4rem;
`;

const Input = styled.input`
  width: 100%;
  min-height: 46px;
  padding: 0.7rem 0.95rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 0.65rem;
  font-size: 0.92rem;
  color: #1e293b;
  font-family: inherit;
  box-sizing: border-box;
  transition: all 0.2s;

  &:focus {
    outline: none;
    background: #ffffff;
    border-color: #0a3e60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.12);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const Select = styled.select`
  width: 100%;
  min-height: 46px;
  padding: 0.7rem 0.95rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 0.65rem;
  font-size: 0.92rem;
  font-weight: 500;
  color: #1e293b;
  font-family: inherit;
  box-sizing: border-box;
  transition: all 0.2s;

  &:focus {
    outline: none;
    background: #ffffff;
    border-color: #0a3e60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.12);
  }
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Grid3 = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0a3e60;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;

  svg {
    color: #ed7e13;
  }
`;

/* BUTTONS */
const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
`;

const SecondaryButton = styled.button`
  min-height: 48px;
  padding: 0 1.25rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 0.65rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

const PrimaryButton = styled.button`
  flex: 1;
  min-height: 48px;
  padding: 0 1.5rem;
  background: linear-gradient(135deg, #0a3e60 0%, #072a42 100%);
  border: none;
  border-radius: 0.65rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(10, 62, 96, 0.2);
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(10, 62, 96, 0.25);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  min-height: 50px;
  padding: 0 1.5rem;
  background: linear-gradient(135deg, #ed7e13 0%, #d96d07 100%);
  border: none;
  border-radius: 0.65rem;
  font-weight: 700;
  font-size: 1rem;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(237, 126, 19, 0.3);
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(237, 126, 19, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

/* UPLOAD DROPZONE */
const UploadCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const UploadHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
`;

const UploadTitle = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  svg {
    color: #0a3e60;
  }
`;

const UploadBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: #16a34a;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const DropzoneLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.9rem;
  background: #ffffff;
  border: 1.5px dashed #cbd5e1;
  border-radius: 0.65rem;
  cursor: pointer;
  font-size: 0.82rem;
  color: #475569;
  transition: all 0.2s;

  &:hover {
    border-color: #0a3e60;
    color: #0a3e60;
    background: #f0fdfa;
  }

  svg {
    color: #ed7e13;
  }

  input {
    display: none;
  }
`;

const AttachedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.85rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.65rem;
  font-size: 0.82rem;
  color: #166534;
`;

const RemoveFileBtn = styled.button`
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.2rem;
  border-radius: 4px;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

/* OCR BANNER */
const OcrBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 0.75rem;
  margin-bottom: 1.25rem;
  font-size: 0.84rem;
  color: #1e40af;

  svg {
    color: #2563eb;
    flex-shrink: 0;
  }
`;

/* SUCCESS SCREEN */
const SuccessCard = styled.div`
  text-align: center;
  padding: 2.5rem 1.5rem;
`;

const SuccessIconWrap = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem auto;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
`;

// Helper: Máscaras defensivas
const maskCpf = (v = '') => {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const maskCnpj = (v = '') => {
  return v
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const maskPhone = (v = '') => {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

const maskCep = (v = '') => {
  return v
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d{3})$/, '$1-$2');
};

export default function PublicOnboardingPage() {
  const { token } = useParams();

  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [tokenError, setTokenError] = useState(null);

  // Stepper: 1: Pessoal, 2: Empresa, 3: Endereço, 4: Documentos & Envio, 5: Sucesso
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Formulário
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    telefone_whatsapp: '',
    email: '',
    instagram: '',
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
    is_cnpj_em_abertura: false,
    categoria: 'Licenciamento',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
    lgpd_consent: false
  });

  // Anexos
  const [documentFile, setDocumentFile] = useState(null);
  const [comprovantePagamentoFile, setComprovantePagamentoFile] = useState(null);
  const [comprovanteResidenciaFile, setComprovanteResidenciaFile] = useState(null);
  const [contratoSocialFile, setContratoSocialFile] = useState(null);
  const [certificadosFiles, setCertificadosFiles] = useState([]);

  const [ocrScanning, setOcrScanning] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // 1. Validação de Token na Inicialização
  useEffect(() => {
    async function validate() {
      if (!token) {
        setTokenError('Link de credenciamento não informado.');
        setTokenLoading(false);
        return;
      }

      try {
        setTokenLoading(true);
        const res = await onboardingApi.validateToken(token);
        if (res && res.valid) {
          setTokenValid(true);
          setTokenData(res);
          setFormData(prev => ({
            ...prev,
            nome: res.nome_candidata || '',
            telefone_whatsapp: res.telefone_whatsapp || '',
            categoria: res.categoria || 'Licenciamento'
          }));
        } else {
          setTokenValid(false);
          setTokenError(res?.reason || 'Link inválido ou já utilizado.');
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError(err.message || 'Erro ao validar link.');
      } finally {
        setTokenLoading(false);
      }
    }
    validate();
  }, [token]);

  // Busca CEP automático via ViaCEP
  const handleCepBlur = async () => {
    const rawCep = (formData.cep || '').replace(/\D/g, '');
    if (rawCep.length === 8) {
      try {
        setLoadingCep(true);
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro || prev.endereco,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado
          }));
        }
      } catch (e) {
        console.warn('Falha ao buscar CEP', e);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Upload e OCR do Documento Principal
  const handleDocumentChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocumentFile(file);

    try {
      setOcrScanning(true);
      const fd = new FormData();
      fd.append('documento_img', file);
      const ocrRes = await onboardingApi.processOcr(fd);
      if (ocrRes?.success && ocrRes?.data) {
        const ext = ocrRes.data;
        setFormData(prev => ({
          ...prev,
          nome: ext.nome || prev.nome,
          cpf: ext.cpf ? maskCpf(ext.cpf) : prev.cpf,
          rg: ext.rg || prev.rg
        }));
      }
    } catch (err) {
      console.warn('OCR em segundo plano finalizado.', err);
    } finally {
      setOcrScanning(false);
    }
  };

  // Submissão Final
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lgpd_consent) {
      alert('Por favor, confirme a autorização de dados conforme a LGPD para prosseguir.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        fd.append(key, formData[key]);
      });

      if (documentFile) fd.append('documento_img', documentFile);
      if (comprovantePagamentoFile) fd.append('comprovante_pagamento_img', comprovantePagamentoFile);
      if (comprovanteResidenciaFile) fd.append('comprovante_residencia_img', comprovanteResidenciaFile);
      if (contratoSocialFile) fd.append('contrato_social_img', contratoSocialFile);

      certificadosFiles.forEach((f, idx) => {
        fd.append(`certificados_${idx}`, f);
      });

      const res = await onboardingApi.submitPublic(token, fd);
      if (res && res.success) {
        setSubmittedData(res);
        setSubmitSuccess(true);
        setStep(5);
      } else {
        throw new Error(res?.error || 'Erro ao enviar dados.');
      }
    } catch (err) {
      setSubmitError(err.message || 'Falha na comunicação com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (tokenLoading) {
    return (
      <PageWrapper>
        <TopHeader>
          <BrandBadge>Body Harmony Oficial</BrandBadge>
          <HeaderTitle>Credenciamento de Licenciada</HeaderTitle>
        </TopHeader>
        <ContentContainer>
          <Card style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <Loader2 style={{ animation: 'spin 1s linear infinite', color: '#ed7e13', margin: '0 auto 1rem auto', width: 36, height: 36 }} />
            <p style={{ fontWeight: 600, color: '#475569' }}>Validando link seguro de credenciamento...</p>
          </Card>
        </ContentContainer>
      </PageWrapper>
    );
  }

  // Invalid Token State
  if (!tokenValid) {
    return (
      <PageWrapper>
        <TopHeader>
          <BrandBadge>Body Harmony Oficial</BrandBadge>
          <HeaderTitle>Credenciamento de Licenciada</HeaderTitle>
        </TopHeader>
        <ContentContainer>
          <Card style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <AlertCircle style={{ color: '#ef4444', width: 48, height: 48, margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
              Link Indisponível ou Expirado
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto 1.5rem auto' }}>
              {tokenError || 'Este link de credenciamento não é válido ou já teve seus dados enviados com sucesso.'}
            </p>
            <PrimaryButton as="a" href="https://wa.me/5518997230000" target="_blank" style={{ textDecoration: 'none', maxWidth: 280, margin: '0 auto' }}>
              Falar com o Suporte
            </PrimaryButton>
          </Card>
        </ContentContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TopHeader>
        <BrandBadge>
          <Sparkles size={13} /> Body Harmony • Credenciamento Oficial
        </BrandBadge>
        <HeaderTitle>Pré-Cadastro de Licenciada</HeaderTitle>
        <HeaderSubtitle>
          Preencha seus dados cadastrais para emissão do contrato e liberação de acesso.
        </HeaderSubtitle>
      </TopHeader>

      <ContentContainer>
        <Card>
          {/* Stepper */}
          {step <= 4 && (
            <StepperWrapper>
              <StepperTrack>
                <StepperProgress $percent={((step - 1) / 3) * 100} />
                <StepNode $active={step === 1} $completed={step > 1}>
                  {step > 1 ? <Check size={16} /> : '1'}
                </StepNode>
                <StepNode $active={step === 2} $completed={step > 2}>
                  {step > 2 ? <Check size={16} /> : '2'}
                </StepNode>
                <StepNode $active={step === 3} $completed={step > 3}>
                  {step > 3 ? <Check size={16} /> : '3'}
                </StepNode>
                <StepNode $active={step === 4} $completed={step > 4}>
                  {step > 4 ? <Check size={16} /> : '4'}
                </StepNode>
              </StepperTrack>
              <StepLabels>
                <StepLabel $active={step === 1}>Pessoal</StepLabel>
                <StepLabel $active={step === 2}>Empresa</StepLabel>
                <StepLabel $active={step === 3}>Endereço</StepLabel>
                <StepLabel $active={step === 4}>Anexos</StepLabel>
              </StepLabels>
            </StepperWrapper>
          )}

          {/* OCR Informational Banner */}
          {ocrScanning && (
            <OcrBanner>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Processando documento com inteligência visual...</span>
            </OcrBanner>
          )}

          {/* STEP 1: DADOS PESSOAIS */}
          {step === 1 && (
            <div>
              <SectionHeader>
                <User size={18} />
                <span>1. Identificação Pessoal da Titular</span>
              </SectionHeader>

              <FormGroup>
                <Label>Nome Completo da Titular *</Label>
                <Input 
                  type="text"
                  required
                  placeholder="Ex: Dra. Mariana Souza"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </FormGroup>

              <Grid2>
                <FormGroup>
                  <Label>CPF da Titular *</Label>
                  <Input 
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: maskCpf(e.target.value) })}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>RG / Órgão Emissor *</Label>
                  <Input 
                    type="text"
                    required
                    placeholder="Ex: 12.345.678-9 SSP/SP"
                    value={formData.rg}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                  />
                </FormGroup>
              </Grid2>

              <Grid2>
                <FormGroup>
                  <Label>WhatsApp Oficial *</Label>
                  <Input 
                    type="tel"
                    required
                    placeholder="(00) 00000-0000"
                    value={formData.telefone_whatsapp}
                    onChange={(e) => setFormData({ ...formData, telefone_whatsapp: maskPhone(e.target.value) })}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>E-mail Principal *</Label>
                  <Input 
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </FormGroup>
              </Grid2>

              <ButtonRow>
                <PrimaryButton 
                  type="button" 
                  onClick={() => {
                    if (!formData.nome || !formData.cpf || !formData.telefone_whatsapp || !formData.email) {
                      alert('Por favor, preencha todos os campos obrigatórios para avançar.');
                      return;
                    }
                    setStep(2);
                  }}
                >
                  <span>Avançar para Dados da Empresa</span>
                  <ChevronRight size={18} />
                </PrimaryButton>
              </ButtonRow>
            </div>
          )}

          {/* STEP 2: EMPRESA & CATEGORIA */}
          {step === 2 && (
            <div>
              <SectionHeader>
                <Building size={18} />
                <span>2. Dados da Pessoa Jurídica (Clínica/Espaço)</span>
              </SectionHeader>

              <FormGroup style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '0.65rem', border: '1px solid #e2e8f0' }}>
                <input 
                  type="checkbox"
                  id="cnpj_abertura"
                  checked={formData.is_cnpj_em_abertura}
                  onChange={(e) => setFormData({ ...formData, is_cnpj_em_abertura: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#ed7e13', cursor: 'pointer' }}
                />
                <label htmlFor="cnpj_abertura" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Ainda estou em processo de abertura de CNPJ
                </label>
              </FormGroup>

              {!formData.is_cnpj_em_abertura ? (
                <>
                  <Grid2>
                    <FormGroup>
                      <Label>CNPJ da Empresa *</Label>
                      <Input 
                        type="text"
                        placeholder="00.000.000/0001-00"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: maskCnpj(e.target.value) })}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Instagram Profissional</Label>
                      <Input 
                        type="text"
                        placeholder="@seuespaco"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      />
                    </FormGroup>
                  </Grid2>

                  <FormGroup>
                    <Label>Razão Social</Label>
                    <Input 
                      type="text"
                      placeholder="Ex: Clínica de Estética Harmony Ltda"
                      value={formData.razao_social}
                      onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                    />
                  </FormGroup>
                </>
              ) : (
                <FormGroup>
                  <Label>Instagram Profissional</Label>
                  <Input 
                    type="text"
                    placeholder="@seuespaco"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  />
                </FormGroup>
              )}

              <FormGroup>
                <Label>Categoria do Licenciamento</Label>
                <Select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="Licenciamento">Licenciamento Oficial Body Harmony</option>
                  <option value="Licenciada Bronze">Licenciada Bronze (Iniciante)</option>
                  <option value="Licenciada Prata">Licenciada Prata (Profissional)</option>
                  <option value="Licenciada Ouro">Licenciada Ouro (Clínica Master)</option>
                  <option value="Licenciada Diamond">Licenciada Diamond (Exclusiva)</option>
                </Select>
              </FormGroup>

              <ButtonRow>
                <SecondaryButton type="button" onClick={() => setStep(1)}>
                  <ChevronLeft size={18} /> Voltar
                </SecondaryButton>
                <PrimaryButton type="button" onClick={() => setStep(3)}>
                  <span>Avançar para Endereço</span>
                  <ChevronRight size={18} />
                </PrimaryButton>
              </ButtonRow>
            </div>
          )}

          {/* STEP 3: ENDEREÇO */}
          {step === 3 && (
            <div>
              <SectionHeader>
                <MapPin size={18} />
                <span>3. Endereço de Atendimento / Residencial</span>
              </SectionHeader>

              <Grid3>
                <FormGroup>
                  <Label>CEP *</Label>
                  <div style={{ position: 'relative' }}>
                    <Input 
                      type="text"
                      required
                      placeholder="00000-000"
                      value={formData.cep}
                      onBlur={handleCepBlur}
                      onChange={(e) => setFormData({ ...formData, cep: maskCep(e.target.value) })}
                    />
                    {loadingCep && (
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', position: 'absolute', right: 12, top: 15, color: '#ed7e13' }} />
                    )}
                  </div>
                </FormGroup>

                <FormGroup style={{ gridColumn: 'span 2' }}>
                  <Label>Logradouro / Rua *</Label>
                  <Input 
                    type="text"
                    required
                    placeholder="Av. Paulista"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </FormGroup>
              </Grid3>

              <Grid3>
                <FormGroup>
                  <Label>Número *</Label>
                  <Input 
                    type="text"
                    required
                    placeholder="1000"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Complemento</Label>
                  <Input 
                    type="text"
                    placeholder="Sala 102"
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Bairro *</Label>
                  <Input 
                    type="text"
                    required
                    placeholder="Bela Vista"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  />
                </FormGroup>
              </Grid3>

              <Grid2>
                <FormGroup>
                  <Label>Cidade *</Label>
                  <Input 
                    type="text"
                    required
                    placeholder="São Paulo"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>UF / Estado *</Label>
                  <Input 
                    type="text"
                    maxLength={2}
                    required
                    placeholder="SP"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                  />
                </FormGroup>
              </Grid2>

              <ButtonRow>
                <SecondaryButton type="button" onClick={() => setStep(2)}>
                  <ChevronLeft size={18} /> Voltar
                </SecondaryButton>
                <PrimaryButton 
                  type="button" 
                  onClick={() => {
                    if (!formData.cep || !formData.endereco || !formData.numero || !formData.cidade) {
                      alert('Por favor, preencha os dados do endereço para prosseguir.');
                      return;
                    }
                    setStep(4);
                  }}
                >
                  <span>Avançar para Anexos</span>
                  <ChevronRight size={18} />
                </PrimaryButton>
              </ButtonRow>
            </div>
          )}

          {/* STEP 4: ANEXOS & ENVIO */}
          {step === 4 && (
            <form onSubmit={handleSubmit}>
              <SectionHeader>
                <Camera size={18} />
                <span>4. Documentos & Comprovantes</span>
              </SectionHeader>

              {/* 1. RG/CNH */}
              <UploadCard>
                <UploadHeader>
                  <UploadTitle>
                    <FileText size={15} /> 1. Documento de Identidade (RG ou CNH) *
                  </UploadTitle>
                  {documentFile && <UploadBadge><Check size={12} /> Anexado</UploadBadge>}
                </UploadHeader>
                {!documentFile ? (
                  <DropzoneLabel>
                    <UploadCloud size={18} />
                    <span>Selecionar foto do RG/CNH ou PDF</span>
                    <input type="file" accept="image/*,application/pdf" onChange={handleDocumentChange} />
                  </DropzoneLabel>
                ) : (
                  <AttachedRow>
                    <span>{documentFile.name}</span>
                    <RemoveFileBtn type="button" onClick={() => setDocumentFile(null)}>
                      <Trash2 size={14} />
                    </RemoveFileBtn>
                  </AttachedRow>
                )}
              </UploadCard>

              {/* 2. Comprovante de Pagamento */}
              <UploadCard>
                <UploadHeader>
                  <UploadTitle>
                    <CreditCard size={15} /> 2. Comprovante de Pagamento da Taxa
                  </UploadTitle>
                  {comprovantePagamentoFile && <UploadBadge><Check size={12} /> Anexado</UploadBadge>}
                </UploadHeader>
                {!comprovantePagamentoFile ? (
                  <DropzoneLabel>
                    <UploadCloud size={18} />
                    <span>Selecionar comprovante PIX / Transferência</span>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => setComprovantePagamentoFile(e.target.files?.[0])} />
                  </DropzoneLabel>
                ) : (
                  <AttachedRow>
                    <span>{comprovantePagamentoFile.name}</span>
                    <RemoveFileBtn type="button" onClick={() => setComprovantePagamentoFile(null)}>
                      <Trash2 size={14} />
                    </RemoveFileBtn>
                  </AttachedRow>
                )}
              </UploadCard>

              {/* 3. Comprovante de Residência */}
              <UploadCard>
                <UploadHeader>
                  <UploadTitle>
                    <MapPin size={15} /> 3. Comprovante de Residência / Espaço
                  </UploadTitle>
                  {comprovanteResidenciaFile && <UploadBadge><Check size={12} /> Anexado</UploadBadge>}
                </UploadHeader>
                {!comprovanteResidenciaFile ? (
                  <DropzoneLabel>
                    <UploadCloud size={18} />
                    <span>Selecionar conta de consumo ou contrato de locação</span>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => setComprovanteResidenciaFile(e.target.files?.[0])} />
                  </DropzoneLabel>
                ) : (
                  <AttachedRow>
                    <span>{comprovanteResidenciaFile.name}</span>
                    <RemoveFileBtn type="button" onClick={() => setComprovanteResidenciaFile(null)}>
                      <Trash2 size={14} />
                    </RemoveFileBtn>
                  </AttachedRow>
                )}
              </UploadCard>

              {/* LGPD Consent */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.65rem', border: '1px solid #cbd5e1', margin: '1.5rem 0' }}>
                <label style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    required
                    checked={formData.lgpd_consent}
                    onChange={(e) => setFormData({ ...formData, lgpd_consent: e.target.checked })}
                    style={{ width: 18, height: 18, marginTop: 2, accentColor: '#ed7e13' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                    Declaro que as informações fornecidas são autênticas e autorizo o tratamento de dados pela <strong>Body Harmony Eletroestimulação Ltda.</strong> para fins de credenciamento, emissão de contrato e ativação da licença de acordo com a LGPD (Lei nº 13.709/2018).
                  </span>
                </label>
              </div>

              {submitError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem', borderRadius: '0.65rem', color: '#dc2626', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  {submitError}
                </div>
              )}

              <ButtonRow>
                <SecondaryButton type="button" onClick={() => setStep(3)}>
                  <ChevronLeft size={18} /> Voltar
                </SecondaryButton>
                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Transmitindo Dados...</span>
                    </>
                  ) : (
                    <>
                      <span>Finalizar e Enviar Credenciamento</span>
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </SubmitButton>
              </ButtonRow>
            </form>
          )}

          {/* STEP 5: SUCESSO */}
          {step === 5 && (
            <SuccessCard>
              <SuccessIconWrap>
                <CheckCircle2 size={40} />
              </SuccessIconWrap>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0a3e60', marginBottom: '0.5rem' }}>
                Pré-Cadastro Enviado com Sucesso!
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: 480, margin: '0 auto 1.75rem auto', lineHeight: 1.5 }}>
                Seus dados e documentos foram transmitidos com segurança para a central da Body Harmony. Nossa equipe jurídica já está preparando a minuta do seu contrato.
              </p>
              <PrimaryButton 
                as="a" 
                href="https://wa.me/5518997230000?text=Olá,%20acabei%20de%20enviar%20meu%20pré-cadastro%20no%20sistema%20Body%20Harmony!"
                target="_blank" 
                style={{ textDecoration: 'none', maxWidth: 320, margin: '0 auto' }}
              >
                Avisar Gestora no WhatsApp
              </PrimaryButton>
            </SuccessCard>
          )}
        </Card>
      </ContentContainer>
    </PageWrapper>
  );
}
