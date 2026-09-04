import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  X, User, Phone, Mail, MapPin, FileText, DollarSign,
  Calendar, Award, CheckCircle, RefreshCw, Save, ExternalLink,
  MessageSquare, ChevronRight, ShieldCheck, Download, AlertTriangle,
  Clock, BookOpen, Edit2, Paperclip, UploadCloud, Check, Plus
} from 'lucide-react';
import { licenciadas360Api, licenseTaxesApi, contractsApi } from '../services/api';

// ==========================================
// STYLED COMPONENTS (LUXURY EXECUTIVE DRAWER)
// ==========================================

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 62, 96, 0.45);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 62, 96, 0.65);
  backdrop-filter: blur(3px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalBox = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  font-family: 'Montserrat', sans-serif;
`;

const ModalHeader = styled.div`
  padding: 1rem 1.25rem;
  background: #0A3E60;
  color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 0.9rem;
`;

const ModalBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DiagnosticCard = styled.div`
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DiagnosticGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.6rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const DiagnosticItem = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DiagnosticLabel = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const DiagnosticValue = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ $color }) => $color || '#0A3E60'};
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const Drawer = styled.div`
  width: 100%;
  max-width: 620px;
  height: 100vh;
  background: #FFFFFF;
  box-shadow: -10px 0 35px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
`;

const DrawerHeader = styled.div`
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #0A3E60 0%, #06283D 100%);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #ED7E13;
`;

const HeaderProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ED7E13;
  color: #FFFFFF;
  font-weight: 800;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const HeaderName = styled.h2`
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  color: #FFFFFF;
  letter-spacing: -0.01em;
`;

const HeaderSub = styled.div`
  font-size: 0.75rem;
  color: #CBD5E1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: none;
  color: #FFFFFF;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }
`;

const TabNav = styled.div`
  display: flex;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const TabButton = styled.button`
  flex: 1;
  min-width: 100px;
  min-height: 44px;
  padding: 0.75rem 0.5rem;
  border: none;
  border-bottom: 2px solid ${({ $active }) => $active ? '#ED7E13' : 'transparent'};
  background: ${({ $active }) => $active ? '#FFFFFF' : 'transparent'};
  color: ${({ $active }) => $active ? '#0A3E60' : '#64748B'};
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: ${({ $active }) => $active ? 800 : 600};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    color: #0A3E60;
    background: #FFFFFF;
  }
`;

const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Card = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 1.1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
`;

const CardTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 800;
  color: #0A3E60;
  margin: 0 0 0.85rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
`;

const Label = styled.label`
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const Input = styled.input`
  padding: 0.55rem 0.8rem;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  font-size: 0.82rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;

  &:focus {
    border-color: #ED7E13;
    outline: none;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  background: ${({ $color }) => `${$color || '#0A3E60'}15`};
  color: ${({ $color }) => $color || '#0A3E60'};
  border: 1px solid ${({ $color }) => `${$color || '#0A3E60'}35`};
`;

const DrawerFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #E2E8F0;
  background: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const ActionBtn = styled.button`
  min-height: 44px;
  padding: 0.6rem 1.1rem;
  border-radius: 7px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: all 0.15s;
  border: none;

  ${({ $variant }) => $variant === 'gold' && `
    background: #ED7E13;
    color: #FFFFFF;
    &:hover { background: #D96F0E; transform: translateY(-1px); }
  `}

  ${({ $variant }) => $variant === 'navy' && `
    background: #0A3E60;
    color: #FFFFFF;
    &:hover { background: #072B43; transform: translateY(-1px); }
  `}

  ${({ $variant }) => $variant === 'whatsapp' && `
    background: #25D366;
    color: #FFFFFF;
    &:hover { background: #1EBE5B; transform: translateY(-1px); }
  `}

  ${({ $variant }) => $variant === 'outline' && `
    background: #FFFFFF;
    color: #475569;
    border: 1px solid #CBD5E1;
    &:hover { border-color: #0A3E60; color: #0A3E60; }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ==========================================
// COMPONENT
// ==========================================

export default function LicenciadaDossierDrawer({ licenciadaId, isOpen, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dossier, setDossier] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    whatsapp: '',
    cpf: '',
    cnpj: '',
    email: '',
    location: '',
    cidade: '',
    state: '',
    is_active: 1
  });

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractFile, setContractFile] = useState(null);
  const [contractNotes, setContractNotes] = useState('');
  const [uploadingContract, setUploadingContract] = useState(false);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptNotes, setReceiptNotes] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [taxValueInput, setTaxValueInput] = useState('');
  const [taxMethodInput, setTaxMethodInput] = useState('pix');
  const [taxConditionInput, setTaxConditionInput] = useState('À vista');
  const [savingTax, setSavingTax] = useState(false);

  const loadDossier = useCallback(async () => {
    if (!licenciadaId) return;
    try {
      setLoading(true);
      const res = await licenciadas360Api.getDossier(licenciadaId);
      if (res && res.data) {
        setDossier(res.data);
        const p = res.data.profile || {};
        setEditForm({
          name: p.name || '',
          whatsapp: p.whatsapp || '',
          cpf: p.cpf || '',
          cnpj: p.cnpj || '',
          email: p.email || '',
          location: p.location || '',
          cidade: p.cidade || '',
          state: p.state || '',
          is_active: p.is_active ?? 1
        });
        if (res.data.financial?.total_contracted_cents) {
          setTaxValueInput((res.data.financial.total_contracted_cents / 100).toFixed(2));
        }
      }
    } catch (err) {
      console.error('[LicenciadaDossierDrawer] Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  }, [licenciadaId]);

  useEffect(() => {
    if (isOpen && licenciadaId) {
      loadDossier();
    }
  }, [isOpen, licenciadaId, loadDossier]);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await licenciadas360Api.updateDossier(licenciadaId, editForm);
      setFeedback('✓ Dados cadastrais atualizados e propagados em cascata!');
      if (res && res.data) {
        setDossier(res.data);
      }
      if (onUpdated) onUpdated();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      alert(err.message || 'Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadContract = async (e) => {
    if (e) e.preventDefault();
    if (!contractFile) {
      alert('Selecione o arquivo PDF do contrato assinado.');
      return;
    }
    try {
      setUploadingContract(true);
      await licenciadas360Api.uploadSignedContract(licenciadaId, contractFile, contractNotes);
      setFeedback('✓ Contrato físico assinado anexado com sucesso!');
      setIsContractModalOpen(false);
      setContractFile(null);
      setContractNotes('');
      await loadDossier();
      if (onUpdated) onUpdated();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      alert(err.message || 'Erro ao anexar contrato.');
    } finally {
      setUploadingContract(false);
    }
  };

  const handleUploadReceipt = async (e) => {
    if (e) e.preventDefault();
    if (!receiptFile) {
      alert('Selecione o arquivo do comprovante.');
      return;
    }
    try {
      setUploadingReceipt(true);
      await licenciadas360Api.uploadReceipt(licenciadaId, receiptFile, receiptNotes);
      setFeedback('✓ Comprovante anexado e taxa quitada com sucesso!');
      setIsReceiptModalOpen(false);
      setReceiptFile(null);
      setReceiptNotes('');
      await loadDossier();
      if (onUpdated) onUpdated();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      alert(err.message || 'Erro ao anexar comprovante.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleDefineTax = async (e) => {
    if (e) e.preventDefault();
    const cleanVal = String(taxValueInput).replace(/\D/g, '');
    const cents = parseInt(cleanVal, 10);
    if (isNaN(cents) || cents < 0) {
      alert('Informe um valor válido em centavos.');
      return;
    }
    try {
      setSavingTax(true);
      await licenseTaxesApi.update(licenciadaId, {
        licenciada_id: licenciadaId,
        licenciada_name: profile.name,
        valor_cents: cents,
        payment_method: taxMethodInput,
        payment_condition: taxConditionInput,
        status: cents > 0 ? (dossier?.document_diagnostic?.receipt?.is_paid ? 'paid' : 'pending_payment') : 'pending_payment'
      });
      setFeedback('✓ Valor da taxa definido com sucesso!');
      setIsTaxModalOpen(false);
      await loadDossier();
      if (onUpdated) onUpdated();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      alert(err.message || 'Erro ao definir taxa.');
    } finally {
      setSavingTax(false);
    }
  };

  if (!isOpen) return null;

  const profile = dossier?.profile || {};
  const financial = dossier?.financial || {};
  const contracts = dossier?.contracts || [];
  const onboarding = dossier?.onboarding || null;
  const agenda = dossier?.agenda || { history: [] };
  const lms = dossier?.lms || {};
  const diagnostic = dossier?.document_diagnostic || {
    contract: { is_signed: false, label: '⏳ Aguardando Anexo do Contrato' },
    receipt: { is_paid: false, label: '🟡 Aguardando Comprovante' },
    value: { has_value: false, label: 'A Definir / Em Levantamento' },
    overall_status: 'aguardando_anexos'
  };

  const cleanPhone = (profile.whatsapp || '').replace(/\D/g, '');
  const waUrl = cleanPhone ? `https://wa.me/55${cleanPhone.startsWith('55') ? cleanPhone.substring(2) : cleanPhone}` : null;

  return (
    <Backdrop onClick={onClose}>
      <Drawer onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <DrawerHeader>
          <HeaderProfile>
            <Avatar>{(profile.name || 'BH').substring(0, 2).toUpperCase()}</Avatar>
            <HeaderInfo>
              <HeaderName>{profile.name || 'Carregando Licenciada...'}</HeaderName>
              <HeaderSub>
                <MapPin size={13} color="#ED7E13" />
                {profile.location || profile.cidade || 'Localidade não definida'}
                <span>•</span>
                <span>CPF: {profile.cpf || 'Não informado'}</span>
              </HeaderSub>
            </HeaderInfo>
          </HeaderProfile>
          <CloseButton onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </CloseButton>
        </DrawerHeader>

        {/* TAB NAVIGATION */}
        <TabNav>
          <TabButton $active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
            <User size={15} /> Ficha Cadastral
          </TabButton>
          <TabButton $active={activeTab === 'contracts'} onClick={() => setActiveTab('contracts')}>
            <FileText size={15} /> Contratos ({contracts.length})
          </TabButton>
          <TabButton $active={activeTab === 'financial'} onClick={() => setActiveTab('financial')}>
            <DollarSign size={15} /> Financeiro
          </TabButton>
          <TabButton $active={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')}>
            <Calendar size={15} /> Mentorias ({agenda.total_events || 0})
          </TabButton>
          <TabButton $active={activeTab === 'lms'} onClick={() => setActiveTab('lms')}>
            <Award size={15} /> LMS & Aulas
          </TabButton>
        </TabNav>

        {/* FEEDBACK TOAST */}
        {feedback && (
          <div style={{ background: '#ECFDF5', borderLeft: '4px solid #10B981', padding: '0.75rem 1.25rem', color: '#065F46', fontSize: '0.78rem', fontWeight: 700 }}>
            {feedback}
          </div>
        )}

        {/* BODY */}
        <DrawerBody>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
              <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 0.5rem' }} />
              <div>Carregando Dossiê 360º...</div>
            </div>
          ) : (
            <>
              {/* DIAGNÓSTICO DOCUMENTAL & SANEAMENTO (PLAN-154) */}
              <DiagnosticCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0A3E60', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} color="#ED7E13" /> Diagnóstico de Regularidade Documental
                  </span>
                  <Badge $color={diagnostic.overall_status === 'regularizado' ? '#10B981' : (diagnostic.overall_status === 'em_analise' ? '#ED7E13' : '#64748B')}>
                    {diagnostic.overall_status === 'regularizado' ? '✓ 100% Regularizada' : (diagnostic.overall_status === 'em_analise' ? 'Em Análise' : 'Aguardando Anexos')}
                  </Badge>
                </div>

                <DiagnosticGrid>
                  <DiagnosticItem>
                    <DiagnosticLabel>Contrato</DiagnosticLabel>
                    <DiagnosticValue $color={diagnostic.contract.is_signed ? '#059669' : '#D97706'}>
                      {diagnostic.contract.label}
                    </DiagnosticValue>
                  </DiagnosticItem>

                  <DiagnosticItem>
                    <DiagnosticLabel>Comprovante</DiagnosticLabel>
                    <DiagnosticValue $color={diagnostic.receipt.is_paid ? '#059669' : '#D97706'}>
                      {diagnostic.receipt.label}
                    </DiagnosticValue>
                  </DiagnosticItem>

                  <DiagnosticItem>
                    <DiagnosticLabel>Valor da Taxa</DiagnosticLabel>
                    <DiagnosticValue $color={diagnostic.value.has_value ? '#0A3E60' : '#64748B'}>
                      {diagnostic.value.label}
                    </DiagnosticValue>
                  </DiagnosticItem>
                </DiagnosticGrid>

                {/* BOTÕES DE ENRIQUECIMENTO MANUAL */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  <ActionBtn
                    $variant="outline"
                    style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}
                    onClick={() => setIsContractModalOpen(true)}
                  >
                    <Paperclip size={13} color="#0A3E60" /> Anexar Contrato PDF
                  </ActionBtn>

                  <ActionBtn
                    $variant="outline"
                    style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}
                    onClick={() => setIsReceiptModalOpen(true)}
                  >
                    <UploadCloud size={13} color="#10B981" /> Anexar Comprovante
                  </ActionBtn>

                  <ActionBtn
                    $variant="outline"
                    style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}
                    onClick={() => setIsTaxModalOpen(true)}
                  >
                    <Edit2 size={13} color="#ED7E13" /> Definir Valor da Taxa
                  </ActionBtn>
                </div>
              </DiagnosticCard>

              {/* TAB 1: FICHA CADASTRAL */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile}>
                  <Card>
                    <CardTitle>
                      <span>Identidade Oficial & Contato</span>
                      <Badge $color={profile.is_active ? '#10B981' : '#EF4444'}>
                        {profile.is_active ? '✓ Ativa' : 'Inativa'}
                      </Badge>
                    </CardTitle>

                    <FormGroup>
                      <Label>Nome Completo (Oficial) *</Label>
                      <Input
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </FormGroup>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <FormGroup>
                        <Label>WhatsApp (Com DDD) *</Label>
                        <Input
                          required
                          value={editForm.whatsapp}
                          onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>E-mail *</Label>
                        <Input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      </FormGroup>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <FormGroup>
                        <Label>CPF *</Label>
                        <Input
                          value={editForm.cpf}
                          onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>CNPJ (Pessoa Jurídica)</Label>
                        <Input
                          placeholder="00.000.000/0001-00"
                          value={editForm.cnpj}
                          onChange={(e) => setEditForm({ ...editForm, cnpj: e.target.value })}
                        />
                      </FormGroup>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                      <FormGroup>
                        <Label>Cidade / Praça</Label>
                        <Input
                          value={editForm.cidade || editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, cidade: e.target.value, location: e.target.value })}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Estado (UF)</Label>
                        <Input
                          maxLength={2}
                          placeholder="SP"
                          value={editForm.state}
                          onChange={(e) => setEditForm({ ...editForm, state: e.target.value.toUpperCase() })}
                        />
                      </FormGroup>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <ActionBtn $variant="gold" type="submit" disabled={saving}>
                        {saving ? <RefreshCw className="animate-spin" size={15} /> : <Save size={15} />}
                        Salvar e Propagar em Cascata
                      </ActionBtn>
                    </div>
                  </Card>
                </form>
              )}

              {/* TAB 2: CONTRATOS */}
              {activeTab === 'contracts' && (
                <Card>
                  <CardTitle>
                    <span>Histórico Jurídico de Contratos</span>
                    <Badge $color="#0A3E60">{contracts.length} emitidos</Badge>
                  </CardTitle>

                  {contracts.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem' }}>
                      <p>Nenhum contrato digital formal vinculado a esta licenciada.</p>
                      <ActionBtn
                        $variant="gold"
                        style={{ margin: '0.5rem auto 0' }}
                        onClick={() => setIsContractModalOpen(true)}
                      >
                        <Paperclip size={14} /> Anexar Contrato Físico Assinado
                      </ActionBtn>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {contracts.map((c) => (
                        <div key={c.id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0A3E60', fontSize: '0.82rem' }}>
                              Contrato de {c.category === 'ouvinte' ? 'Aluna Ouvinte' : 'Licenciamento Body Harmony'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.15rem' }}>
                              UUID: {c.contract_uuid} • Criado em: {new Date(c.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Badge $color={c.status === 'SIGNED' ? '#10B981' : '#ED7E13'}>
                              {c.status === 'SIGNED' ? '✓ Assinado' : c.status}
                            </Badge>
                            {c.pdf_url && (
                              <a href={c.pdf_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                <ActionBtn $variant="outline" style={{ minHeight: '34px', padding: '0.3rem 0.6rem' }}>
                                  <Download size={13} /> PDF
                                </ActionBtn>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* TAB 3: FINANCEIRO */}
              {activeTab === 'financial' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <Card style={{ background: '#F8FAFC' }}>
                      <Label>Total Mapeado / Confirmado</Label>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0A3E60', marginTop: '0.2rem' }}>
                        {financial.total_contracted_formatted || 'A Definir'}
                      </div>
                    </Card>

                    <Card style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}>
                      <Label style={{ color: '#065F46' }}>Total Quitado em Caixa</Label>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                        {financial.total_paid_formatted || 'R$ 0,00'}
                      </div>
                    </Card>
                  </div>

                  <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <CardTitle style={{ margin: 0 }}>Taxas & Quitações Vinculadas</CardTitle>
                      <ActionBtn
                        $variant="outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.74rem' }}
                        onClick={() => setIsTaxModalOpen(true)}
                      >
                        <Edit2 size={13} /> Editar / Definir Taxa
                      </ActionBtn>
                    </div>

                    {(!financial.taxes || financial.taxes.length === 0) ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem' }}>
                        Nenhuma taxa registrada no cockpit financeiro.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {financial.taxes.map((t) => (
                          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #F1F5F9' }}>
                            <div>
                              <strong style={{ color: '#0A3E60' }}>{t.valor_display || 'A Definir'}</strong>
                              <span style={{ fontSize: '0.72rem', color: '#64748B', marginLeft: '0.5rem' }}>
                                ({t.payment_method?.toUpperCase()} • {t.payment_condition || 'À vista'})
                              </span>
                            </div>
                            <Badge $color={t.status === 'contract_signed' || t.status === 'paid' ? '#10B981' : '#ED7E13'}>
                              {t.status === 'contract_signed' ? '✓ Quitado (Contrato)' : (t.status === 'paid' ? '💰 Quitado' : '⏳ Pendente')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </>
              )}

              {/* TAB 4: AGENDA */}
              {activeTab === 'agenda' && (
                <Card>
                  <CardTitle>
                    <span>Histórico de Mentorias & Capacitações</span>
                    <Badge $color="#8B5CF6">{agenda.total_events || 0} sessões</Badge>
                  </CardTitle>

                  {(!agenda.history || agenda.history.length === 0) ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem' }}>
                      Nenhuma mentoria ou evento individual agendado na Gestor Agenda.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {agenda.history.map((ev) => (
                        <div key={ev.id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: '#0A3E60', fontSize: '0.82rem' }}>{ev.title}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={12} />
                            {new Date(ev.start_time).toLocaleString('pt-BR')}
                            <span>•</span>
                            <span style={{ textTransform: 'capitalize' }}>{ev.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* TAB 5: LMS ALUNA */}
              {activeTab === 'lms' && (
                <Card>
                  <CardTitle>
                    <span>Progresso no Curso de Formação Body Harmony®</span>
                    <Badge $color="#10B981">{lms.progress_percentage || 0}% concluído</Badge>
                  </CardTitle>

                  <div style={{ background: '#F1F5F9', height: '10px', borderRadius: '5px', overflow: 'hidden', margin: '0.75rem 0' }}>
                    <div style={{ background: '#ED7E13', height: '100%', width: `${lms.progress_percentage || 0}%`, transition: 'width 0.3s' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B' }}>
                    <span>{lms.completed_lessons || 0} de {lms.total_lessons || 24} aulas assistidas</span>
                    <span>Status: <strong>{lms.enrolled ? 'Matriculada' : 'Acesso Pendente'}</strong></span>
                  </div>
                </Card>
              )}
            </>
          )}
        </DrawerBody>

        {/* FOOTER */}
        <DrawerFooter>
          {waUrl ? (
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <ActionBtn $variant="whatsapp">
                <MessageSquare size={16} /> Abrir WhatsApp
              </ActionBtn>
            </a>
          ) : <div />}

          <ActionBtn $variant="outline" onClick={onClose}>
            Fechar Dossiê
          </ActionBtn>
        </DrawerFooter>
      </Drawer>

      {/* MODAL: UPLOAD CONTRATO FÍSICO */}
      {isContractModalOpen && (
        <ModalOverlay onClick={() => setIsContractModalOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <span>📎 Anexar Contrato Físico Assinado</span>
              <CloseButton onClick={() => setIsContractModalOpen(false)}><X size={16} /></CloseButton>
            </ModalHeader>
            <form onSubmit={handleUploadContract}>
              <ModalBody>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
                  Faça o upload do documento PDF digitalizado com a assinatura física/externa da licenciada. O status será marcado como <strong>SIGNED</strong> e sincronizado no financeiro.
                </p>
                <FormGroup>
                  <Label>Arquivo PDF do Contrato *</Label>
                  <Input
                    type="file"
                    accept="application/pdf"
                    required
                    onChange={(e) => setContractFile(e.target.files[0])}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Observações / Origem</Label>
                  <Input
                    placeholder="Ex: Assinado em cartório / Gov.br"
                    value={contractNotes}
                    onChange={(e) => setContractNotes(e.target.value)}
                  />
                </FormGroup>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <ActionBtn $variant="outline" type="button" onClick={() => setIsContractModalOpen(false)}>Cancelar</ActionBtn>
                  <ActionBtn $variant="gold" type="submit" disabled={uploadingContract}>
                    {uploadingContract ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                    Salvar Contrato Assinado
                  </ActionBtn>
                </div>
              </ModalBody>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* MODAL: UPLOAD COMPROVANTE */}
      {isReceiptModalOpen && (
        <ModalOverlay onClick={() => setIsReceiptModalOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <span>🧾 Anexar Comprovante Financeiro</span>
              <CloseButton onClick={() => setIsReceiptModalOpen(false)}><X size={16} /></CloseButton>
            </ModalHeader>
            <form onSubmit={handleUploadReceipt}>
              <ModalBody>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
                  Anexe o comprovante bancário (PIX, TED ou Cartão) para confirmar a quitação da taxa da licenciada.
                </p>
                <FormGroup>
                  <Label>Arquivo do Comprovante (PDF, JPG, PNG) *</Label>
                  <Input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    required
                    onChange={(e) => setReceiptFile(e.target.files[0])}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Observações do Lançamento</Label>
                  <Input
                    placeholder="Ex: Comprovante PIX banco Santander"
                    value={receiptNotes}
                    onChange={(e) => setReceiptNotes(e.target.value)}
                  />
                </FormGroup>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <ActionBtn $variant="outline" type="button" onClick={() => setIsReceiptModalOpen(false)}>Cancelar</ActionBtn>
                  <ActionBtn $variant="gold" type="submit" disabled={uploadingReceipt}>
                    {uploadingReceipt ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                    Confirmar Quitação
                  </ActionBtn>
                </div>
              </ModalBody>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* MODAL: DEFINIR VALOR DA TAXA */}
      {isTaxModalOpen && (
        <ModalOverlay onClick={() => setIsTaxModalOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <span>✏️ Definir Valor da Taxa de Licenciamento</span>
              <CloseButton onClick={() => setIsTaxModalOpen(false)}><X size={16} /></CloseButton>
            </ModalHeader>
            <form onSubmit={handleDefineTax}>
              <ModalBody>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
                  Preencha o valor contratado oficial para este licenciamento.
                </p>
                <FormGroup>
                  <Label>Valor da Taxa (em R$) *</Label>
                  <Input
                    placeholder="Ex: 7000.00"
                    required
                    value={taxValueInput}
                    onChange={(e) => setTaxValueInput(e.target.value)}
                  />
                </FormGroup>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <FormGroup>
                    <Label>Forma de Pagamento</Label>
                    <select
                      style={{ height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 0.5rem', fontFamily: 'Montserrat', fontSize: '0.8rem' }}
                      value={taxMethodInput}
                      onChange={(e) => setTaxMethodInput(e.target.value)}
                    >
                      <option value="pix">PIX</option>
                      <option value="card">Cartão de Crédito</option>
                      <option value="transfer">Transferência Bancária</option>
                      <option value="manual">Manual / Outros</option>
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Condição</Label>
                    <Input
                      placeholder="Ex: À vista ou 12x"
                      value={taxConditionInput}
                      onChange={(e) => setTaxConditionInput(e.target.value)}
                    />
                  </FormGroup>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <ActionBtn $variant="outline" type="button" onClick={() => setIsTaxModalOpen(false)}>Cancelar</ActionBtn>
                  <ActionBtn $variant="gold" type="submit" disabled={savingTax}>
                    {savingTax ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                    Salvar Valor
                  </ActionBtn>
                </div>
              </ModalBody>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </Backdrop>
  );
}
