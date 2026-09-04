import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { 
  FaUsers, FaUserCheck, FaFileAlt, FaPaperPlane, FaMagic, FaSearch, 
  FaFilter, FaSyncAlt, FaPlus, FaExternalLinkAlt, FaCopy, FaCheck, 
  FaShieldAlt, FaExclamationCircle, FaClock, FaCheckCircle, FaChevronRight, 
  FaCreditCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEye, FaTimes, 
  FaSpinner, FaArrowRight, FaWhatsapp, FaThLarge, FaListUl, FaAward, 
  FaCalendarAlt, FaDollarSign, FaFileDownload, FaEdit, FaTrash,
  FaFlask, FaUserTag, FaTag, FaExclamationTriangle
} from 'react-icons/fa';
import AdminLayout from './Admin/components/AdminLayout';
import { onboardingApi } from '../services/api';
import GenerateContractModal from '../components/Modals/GenerateContractModal';
import { useToast } from '../context/ToastContext';
import HelpTooltip from '../components/Common/HelpTooltip';
import SlaBadge from '../components/Common/SlaBadge';
import DocumentSplitInspector from '../components/Common/DocumentSplitInspector';
import LeadTimelineView from '../components/Common/LeadTimelineView';
import WhatsAppBubblePreview from '../components/Common/WhatsAppBubblePreview';

// ── Styled Components (Luxury Theme) ─────────────────────────────────────────
const Container = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem 1rem 4rem 1rem;
  font-family: 'Montserrat', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TitleArea = styled.div`
  .badge {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--bh-gold, #ed7e13);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  h1 {
    color: var(--bh-text-title, #0a3e60);
    font-size: 1.6rem;
    font-weight: 800;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    letter-spacing: -0.5px;

    svg {
      color: var(--bh-gold, #ed7e13);
    }
  }

  p {
    color: var(--bh-text-secondary, #64748b);
    font-size: 0.85rem;
    margin: 4px 0 0 0;
    font-weight: 500;
  }
`;

const ActionsArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
`;

const RefreshBtn = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  background: var(--bh-bg-card, white);
  border: 1px solid var(--bh-border, #cbd5e1);
  border-radius: 10px;
  color: var(--bh-text-secondary, #475569);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s;

  &:hover {
    color: var(--bh-gold, #ed7e13);
    border-color: var(--bh-gold, #ed7e13);
    transform: translateY(-1px);
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;

const PrimaryBtn = styled.button`
  height: 44px;
  min-height: 44px;
  padding: 0 1.25rem;
  background: linear-gradient(135deg, #ed7e13 0%, #d96d07 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(237, 126, 19, 0.25);
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
`;

const SandboxBtn = styled.button`
  height: 44px;
  min-height: 44px;
  padding: 0 1rem;
  background: var(--bh-bg-card, white);
  color: #7c3aed;
  border: 1.5px solid #c4b5fd;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(124, 58, 237, 0.08);
  transition: all 0.2s;

  &:hover {
    background: #f5f3ff;
    border-color: #7c3aed;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PurgeBtn = styled.button`
  height: 44px;
  min-height: 44px;
  padding: 0 0.85rem;
  background: var(--bh-bg-card, white);
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fef2f2;
    border-color: #dc2626;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TestBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(124, 58, 237, 0.12);
  color: #a78bfa;
  border: 1px solid rgba(124, 58, 237, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const ManagerPill = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--bh-bg-card-subtle, #f1f5f9);
  color: var(--bh-text-main, #0a3e60);
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

const CohortPill = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(237, 126, 19, 0.12);
  color: #fb923c;
  border: 1px solid rgba(237, 126, 19, 0.25);
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

const SegmentedFilter = styled.div`
  display: flex;
  background: var(--bh-bg-input, #e2e8f0);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid var(--bh-border, transparent);
  gap: 2px;
`;

const SegmentedTab = styled.button`
  border: none;
  background: ${props => props.$active ? 'var(--bh-bg-card, white)' : 'transparent'};
  color: ${props => props.$active ? 'var(--bh-text-title, #0a3e60)' : 'var(--bh-text-secondary, #64748b)'};
  font-weight: ${props => props.$active ? '800' : '600'};
  font-size: 0.78rem;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  box-shadow: ${props => props.$active ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'};
  transition: all 0.15s;

  &:hover {
    color: var(--bh-text-title, #0a3e60);
  }
`;

/* BENTO KPI GRID (5 COLUMNS + CONVERSION) */
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.85rem;
  margin-bottom: 1.5rem;
`;

const KpiCard = styled.div`
  background: var(--bh-bg-surface, white);
  border-radius: 14px;
  padding: 1.1rem;
  border: 1px solid ${props => props.$borderColor || 'var(--bh-border, #e2e8f0)'};
  box-shadow: var(--bh-card-shadow, 0 4px 12px rgba(0, 0, 0, 0.03));
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const KpiInfo = styled.div`
  .label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${props => props.$labelColor || 'var(--bh-text-secondary, #64748b)'};
    margin-bottom: 4px;
  }

  .value {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--bh-text-title, #0a3e60);
    line-height: 1;
  }

  .sub {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--bh-text-muted, #94a3b8);
    margin-top: 4px;
  }
`;

const KpiIconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${props => props.$bg || 'var(--bh-bg-card-subtle, #f1f5f9)'};
  color: ${props => props.$color || 'var(--bh-text-main, #0a3e60)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

/* CONTROL BAR */
const ControlBar = styled.div`
  background: var(--bh-bg-surface, white);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  border: 1px solid var(--bh-border, #e2e8f0);
  box-shadow: var(--bh-card-shadow, 0 4px 12px rgba(0, 0, 0, 0.03));
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FiltersGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex: 1;
`;

const SearchBox = styled.div`
  position: relative;
  min-width: 240px;
  flex: 1;
  max-width: 380px;

  svg {
    position: absolute;
    left: 12px;
    top: 14px;
    color: #94a3b8;
  }

  input {
    width: 100%;
    height: 44px;
    min-height: 44px;
    padding-left: 2.3rem;
    padding-right: 1rem;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    font-size: 0.85rem;
    color: #1e293b;
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s;

    &:focus {
      border-color: #0a3e60;
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
    }
  }
`;

const SelectBox = styled.select`
  height: 44px;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  color: #1e293b;
  background: white;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    border-color: #0a3e60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
  }
`;

const ViewSwitcher = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  gap: 4px;
`;

const ViewTab = styled.button`
  height: 36px;
  min-height: 36px;
  padding: 0 1rem;
  border-radius: 8px;
  border: none;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
  background: ${props => props.$active ? '#0a3e60' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#64748b'};

  &:hover {
    color: ${props => props.$active ? 'white' : '#0a3e60'};
  }
`;

/* KANBAN BOARD CONTAINER */
const KanbanScrollWrapper = styled.div`
  overflow-x: auto;
  padding-bottom: 1rem;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const KanbanBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(280px, 1fr));
  gap: 1rem;
  align-items: flex-start;
  min-width: 1440px;
`;

const ColumnWrapper = styled.div`
  background: var(--bh-bg-card-subtle, #f8fafc);
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid var(--bh-border, #e2e8f0);
  display: flex;
  flex-direction: column;
  min-height: 560px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
`;

const ColumnHeader = styled.div`
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.$borderColor || 'var(--bh-border, #cbd5e1)'};
  background: ${props => props.$bg || 'var(--bh-bg-card, white)'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  font-weight: 800;
  font-size: 0.82rem;
  color: var(--bh-text-title, #0a3e60);

  .left {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

const ColumnBadge = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bh-bg-surface, white);
  color: var(--bh-text-title, #0a3e60);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 800;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const ColumnCardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  overflow-y: auto;
  max-height: 720px;
  padding-right: 2px;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const EmptyColumn = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--bh-text-muted, #94a3b8);
  font-size: 0.8rem;
  border: 1px dashed var(--bh-border, #cbd5e1);
  border-radius: 12px;
  font-weight: 600;
  background: var(--bh-bg-card, white);
`;

/* LEAD CARD STYLES */
const LeadCard = styled.div`
  background: var(--bh-bg-surface, white);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--bh-border, #e2e8f0);
  box-shadow: var(--bh-card-shadow, 0 2px 6px rgba(0, 0, 0, 0.03));
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition: all 0.2s;

  &:hover {
    border-color: var(--bh-gold, #ed7e13);
    box-shadow: 0 6px 16px rgba(10, 62, 96, 0.12);
    transform: translateY(-1px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const CategoryBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 12px;
  color: var(--bh-text-main, #0a3e60);
  background: var(--bh-bg-card-subtle, #f1f5f9);
  border: 1px solid var(--bh-border, #e2e8f0);
  text-transform: uppercase;
`;

const LeadName = styled.h4`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--bh-text-title, #0a3e60);
  cursor: pointer;
  line-height: 1.35;
  transition: color 0.15s;

  &:hover {
    color: var(--bh-gold, #ed7e13);
  }
`;

const LeadInfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.75rem;
  color: #64748b;

  .item {
    display: flex;
    align-items: center;
    gap: 5px;

    svg {
      color: #94a3b8;
    }
  }

  a {
    color: #0a3e60;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      color: #ed7e13;
      text-decoration: underline;
    }
  }
`;

const OcrBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  background: ${props => props.$verified ? '#f0fdf4' : '#fffbeb'};
  color: ${props => props.$verified ? '#16a34a' : '#d97706'};
  border: 1px solid ${props => props.$verified ? '#bbf7d0' : '#fde68a'};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
  gap: 4px;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  height: 32px;
  padding: 0 0.55rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${props => props.$color || '#475569'};
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f8fafc;
    border-color: ${props => props.$color || '#0a3e60'};
    transform: translateY(-1px);
  }
`;

/* MODAL OVERLAYS & CARDS */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(10, 62, 96, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: 'Montserrat', sans-serif;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: ${props => props.$maxWidth || '600px'};
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: #0a3e60;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      color: #ed7e13;
    }
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #94a3b8;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    color: #0a3e60;
    background: #f1f5f9;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;

  label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #0a3e60;
    letter-spacing: 0.5px;
  }

  input, select, textarea {
    height: 44px;
    min-height: 44px;
    padding: 0 1rem;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    font-size: 0.88rem;
    color: #1e293b;
    outline: none;
    box-sizing: border-box;
    font-family: inherit;

    &:focus {
      border-color: #0a3e60;
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
    }
  }

  textarea {
    height: auto;
    min-height: 80px;
    padding: 0.75rem 1rem;
  }
`;

// Helper: Formatações defensivas
const formatCpf = (v = '') => {
  const digits = v.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return v || '—';
};

const formatPhone = (v = '') => {
  const digits = v.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return v || '—';
};

// ── 1. MODAL: CRIAR NOVO LINK DE ONBOARDING ──────────────────────────────────
function CreateLinkModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    categoria: 'Licenciada Bronze',
    telefone_whatsapp: '',
    nome_candidata: '',
    expires_in_days: 7
  });
  const [loading, setLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        categoria: formData.categoria,
        telefone_whatsapp: formData.telefone_whatsapp,
        nome_candidata: formData.nome_candidata,
        expires_in_days: parseInt(formData.expires_in_days, 10) || 7
      };

      const res = await onboardingApi.createLink(payload);

      if (res && (res.success || res.public_link || res.token)) {
        const publicUrl = res.public_link || `${window.location.origin}/onboarding/${res.token}`;
        const cleanPhone = formData.telefone_whatsapp.replace(/\D/g, '');
        const leadName = formData.nome_candidata || 'Futura Licenciada';
        
        const inviteText = `Olá, ${leadName}! ✨ Seja muito bem-vinda à família Body Harmony! 💖\n\nEstamos muito felizes com o seu interesse em se tornar uma Licenciada Oficial da nossa marca! 🌿\n\nPara iniciarmos o seu credenciamento com total agilidade, preparamos um link exclusivo e seguro para você preencher seus dados e enviar a foto dos seus documentos pelo celular em menos de 2 minutos:\n\n🔗 *Link Exclusivo de Pré-cadastro:*\n${publicUrl}\n\nSe tiver qualquer dúvida durante o preenchimento, estou por aqui para te ajudar! 😊✨`;

        const resultData = {
          token: res.token,
          public_url: publicUrl,
          whatsapp_url: `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(inviteText)}`,
          invite_text: inviteText
        };

        setCreatedResult(resultData);
        showSuccess('Link de Onboarding Criado', 'Convite gerado com sucesso.');
        if (onSuccess) onSuccess();
      } else {
        throw new Error(res?.message || 'Falha ao criar link de onboarding');
      }
    } catch (err) {
      showError('Erro ao Gerar Link', err.message || 'Erro de comunicação');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdResult?.public_url) return;
    navigator.clipboard.writeText(createdResult.public_url);
    setCopied(true);
    showSuccess('Copiado', 'Link copiado para a área de transferência.');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()} $maxWidth="520px">
        <ModalHeader>
          <h3>
            <FaMagic /> Novo Link de Pré-cadastro
          </h3>
          <CloseBtn onClick={onClose}>
            <FaTimes />
          </CloseBtn>
        </ModalHeader>

        {createdResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <FaCheckCircle size={32} color="#16a34a" style={{ marginBottom: '8px' }} />
              <h4 style={{ margin: '0 0 4px 0', color: '#15803d', fontWeight: 800 }}>Link Criado com Sucesso!</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534' }}>O link foi assinado digitalmente e possui validade de 7 dias.</p>
            </div>

            <FormGroup>
              <label>URL Pública do Pré-cadastro:</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  readOnly
                  value={createdResult.public_url}
                  style={{ background: '#f8fafc', fontFamily: 'monospace', fontSize: '0.78rem' }}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{ padding: '0 1rem', background: '#0a3e60', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {copied ? <FaCheck /> : <FaCopy />} {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </FormGroup>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <a
                href={createdResult.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: 1, background: '#25d366', color: 'white', textDecoration: 'none', padding: '0.85rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}
              >
                <FaWhatsapp size={16} /> Disparar Convite no WhatsApp
              </a>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '0 1.25rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate}>
            <FormGroup>
              <label>Nome da Candidata (Opcional):</label>
              <input
                type="text"
                placeholder="Ex: Dra. Mariana Costa"
                value={formData.nome_candidata}
                onChange={(e) => setFormData({ ...formData, nome_candidata: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <label>WhatsApp da Candidata *:</label>
              <input
                type="text"
                required
                placeholder="(11) 99999-9999"
                value={formData.telefone_whatsapp}
                onChange={(e) => setFormData({ ...formData, telefone_whatsapp: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <label>Categoria Pretendida:</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              >
                <option value="Licenciada Bronze">Licenciada Bronze</option>
                <option value="Licenciada Prata">Licenciada Prata</option>
                <option value="Licenciada Ouro">Licenciada Ouro</option>
                <option value="Licenciada Diamond">Licenciada Diamond</option>
              </select>
            </FormGroup>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '0 1.25rem', height: '44px', background: 'transparent', color: '#64748b', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <PrimaryBtn type="submit" disabled={loading}>
                {loading ? <FaSpinner className="spin" /> : <FaMagic />}
                <span>Gerar Link de Onboarding</span>
              </PrimaryBtn>
            </div>
          </form>
        )}
      </ModalCard>
    </ModalOverlay>
  );
}

// ── 2. MODAL: RÉGUA DE WHATSAPP ──────────────────────────────────────────────
function WhatsAppRuleModal({ isOpen, onClose, lead }) {
  if (!isOpen || !lead) return null;

  const [activeTab, setActiveTab] = useState('convite');
  const [copied, setCopied] = useState(false);
  const { showSuccess } = useToast();

  const cleanPhone = (lead.telefone_whatsapp || '').replace(/\D/g, '');
  const firstName = (lead.nome || 'Licenciada').split(' ')[0];
  const signUrl = lead.contract_uuid ? `${window.location.origin}/assinar/${lead.contract_uuid}` : `${window.location.origin}/assinar/token-preview`;
  const onboardingUrl = `${window.location.origin}/onboarding/${lead.token || 'token-link'}`;

  const templates = {
    convite: {
      title: '1. Convite',
      badge: 'Fase Inicial',
      text: `Olá, ${firstName}! ✨ Seja muito bem-vinda à família Body Harmony! 💖\n\nEstamos muito felizes com o seu interesse em se tornar uma Licenciada Oficial da nossa marca! 🌿\n\nPara iniciarmos o seu credenciamento com total agilidade, preparamos um link exclusivo e seguro para você preencher seus dados e enviar a foto dos seus documentos pelo celular em menos de 2 minutos:\n\n🔗 *Link Exclusivo de Pré-cadastro:*\n${onboardingUrl}\n\nSe tiver qualquer dúvida durante o preenchimento, estou por aqui para te ajudar! 😊✨`
    },
    assinatura: {
      title: '2. Assinatura',
      badge: 'Contrato Pronto',
      text: `Olá, ${firstName}! Tudo bem? ✨\n\nSeu Contrato de Licenciamento Body Harmony foi gerado com sucesso e já está pronto para assinatura digital com total validade jurídica! 🔒📄\n\nVocê pode ler o documento e assinar direto na tela do seu celular pelo link seguro abaixo:\n\n🔗 *Link para Assinatura Digital:*\n${signUrl}\n\nAssim que você assinar, nosso sistema já avança para a liberação dos seus acessos. Qualquer dúvida, conte comigo! 🌿💖`
    },
    lembrete_24h: {
      title: '3. Lembrete 24h',
      badge: 'Follow-Up',
      text: `Olá, ${firstName}! Tudo ótimo com você? 😊\n\nPassando apenas para te lembrar com carinho que o seu contrato Body Harmony está aguardando sua assinatura digital! 📄✨\n\nFalta bem pouquinho para oficializarmos sua licença e liberarmos seu acesso exclusivo ao Portal de Aulas e materiais da marca. 🚀\n\n🔗 *Acesse aqui para assinar:*\n${signUrl}\n\nSe precisar de qualquer esclarecimento sobre alguma cláusula, é só me avisar por aqui! 💖🌿`
    },
    boas_vindas: {
      title: '4. Boas-Vindas',
      badge: 'Ativação LMS',
      text: `Parabéns, ${firstName}! 🎉 Seja oficialmente bem-vinda à rede de Licenciadas Body Harmony! 👑💖\n\nSeu contrato foi formalizado e seu acesso ao Portal Exclusivo da Licenciada já está 100% liberado! 🚀✨\n\nPara fazer seu primeiro acesso:\n🔗 *Portal:* https://bodyharmony.com.br/portal-licenciada\n✉️ *Login:* ${lead.email || 'seu-email'}\n🔑 *Senha temporária:* bh2026@licenca\n\nAo entrar, você poderá cadastrar sua senha definitiva e explorar todos os módulos e certificações. Desejamos muito sucesso nessa jornada! 🌟🌿`
    }
  };

  const currentTpl = templates[activeTab];
  const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(currentTpl.text)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTpl.text);
    setCopied(true);
    showSuccess('Copiado', 'Mensagem copiada para o WhatsApp.');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()} $maxWidth="620px">
        <ModalHeader>
          <h3>
            <FaWhatsapp style={{ color: '#25d366' }} /> Régua de WhatsApp • {lead.nome || 'Lead'}
          </h3>
          <CloseBtn onClick={onClose}>
            <FaTimes />
          </CloseBtn>
        </ModalHeader>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '1rem' }}>
          {Object.keys(templates).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setActiveTab(k)}
              style={{
                flex: 1,
                padding: '0.6rem 0.5rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === k ? '#0a3e60' : 'transparent',
                color: activeTab === k ? 'white' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              {templates[k].title}
            </button>
          ))}
        </div>

        {/* PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ed7e13', textTransform: 'uppercase' }}>
              {currentTpl.badge}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#0a3e60', cursor: 'pointer' }}
            >
              {copied ? <FaCheck color="#16a34a" /> : <FaCopy />} {copied ? 'Copiado' : 'Copiar Texto'}
            </button>
          </div>

          <WhatsAppBubblePreview
            text={currentTpl.text}
            recipientName={lead.nome}
            time={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, background: '#25d366', color: 'white', textDecoration: 'none', padding: '0.85rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}
            >
              <FaPaperPlane /> Abrir WhatsApp ({formatPhone(lead.telefone_whatsapp)})
            </a>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0 1.25rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
            >
              Fechar
            </button>
          </div>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}

// ── 3. MODAL: DETALHES & SPLIT-SCREEN DO LEAD ────────────────────────────────
function LeadDetailsModal({ isOpen, onClose, lead, onOpenContract, onOpenWhatsApp, onRefresh }) {
  if (!isOpen || !lead) return null;

  const { showSuccess, showError } = useToast();
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      await onboardingApi.downloadAllFilesZip(lead.id);
      showSuccess('Download Iniciado', 'Arquivo ZIP com documentos gerado com sucesso.');
    } catch (err) {
      showError('Erro no Download', err.message || 'Falha ao baixar arquivos');
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()} $maxWidth="960px">
        <ModalHeader>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ed7e13', textTransform: 'uppercase' }}>
              Lead ID #{lead.id} • {lead.categoria || 'Licenciada'}
            </div>
            <h3 style={{ margin: '2px 0 0 0' }}>
              {lead.nome || 'Candidata sem Nome'}
            </h3>
          </div>
          <CloseBtn onClick={onClose}>
            <FaTimes />
          </CloseBtn>
        </ModalHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* TIMELINE VIEW */}
          <LeadTimelineView lead={lead} />

          {/* SPLIT INSPECTOR */}
          <DocumentSplitInspector lead={lead} onRefresh={onRefresh} />

          {/* ACTIONS FOOTER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={downloadingZip}
                style={{ padding: '0.65rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#0a3e60', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FaFileDownload /> {downloadingZip ? 'Gerando ZIP...' : 'Baixar Docs (ZIP)'}
              </button>
              <button
                type="button"
                onClick={() => onOpenWhatsApp(lead)}
                style={{ padding: '0.65rem 1rem', background: '#25d366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FaWhatsapp /> Régua WhatsApp
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => onOpenContract(lead)}
                style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #ed7e13 0%, #d96d07 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(237, 126, 19, 0.25)' }}
              >
                <FaFileAlt /> Emitir / Ver Contrato
              </button>
            </div>
          </div>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}

// ── 4. MODAL: CONFIRMAR EXCLUSÃO / ARQUIVAMENTO (PLAN-083) ───────────────────
function ConfirmDeleteModal({ isOpen, onClose, lead, onDeleted }) {
  if (!isOpen || !lead) return null;
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await onboardingApi.deleteRequest(lead.id);
      if (res?.success) {
        showSuccess(
          res.action === 'soft_deleted_archived' ? 'Lead Arquivado' : 'Lead Excluído',
          res.message || 'Operação realizada com sucesso.'
        );
        onDeleted();
        onClose();
      } else {
        throw new Error(res?.message || 'Falha ao excluir lead');
      }
    } catch (err) {
      showError('Erro ao Excluir', err.message || 'Erro de comunicação');
    } finally {
      setLoading(false);
    }
  };

  const isSigned = lead.status === 'ATIVO_LIBERADO' || (lead.contract_uuid && lead.status !== 'PRE_CADASTRO');

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()} $maxWidth="480px">
        <ModalHeader>
          <h3 style={{ color: isSigned ? '#d97706' : '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaTrash /> {isSigned ? 'Arquivar Registro de Onboarding' : 'Excluir Lead de Onboarding'}
          </h3>
          <CloseBtn onClick={onClose}><FaTimes /></CloseBtn>
        </ModalHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
          <div style={{ background: isSigned ? '#fffbeb' : '#fef2f2', padding: '1rem', borderRadius: '12px', border: isSigned ? '1px solid #fde68a' : '1px solid #fecaca' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: isSigned ? '#92400e' : '#991b1b', fontSize: '0.88rem' }}>
              {lead.nome || 'Candidata sem Nome'} (ID #{lead.id})
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: isSigned ? '#b45309' : '#b91c1c', lineHeight: 1.4 }}>
              {isSigned 
                ? 'Este lead possui contrato gerado ou matrícula vinculada. Por blindagem jurídica (Lei 14.063/2020), o registro será arquivado com segurança (soft-delete).'
                : 'Esta ação excluirá permanentemente os dados do pré-cadastro, anexos enviados e minutas DRAFT de contrato associadas.'}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '0.65rem 1.25rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              style={{ padding: '0.65rem 1.25rem', background: isSigned ? '#d97706' : '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: isSigned ? '0 4px 12px rgba(217, 119, 6, 0.25)' : '0 4px 12px rgba(220, 38, 38, 0.25)' }}
            >
              {loading ? <FaSpinner className="spin" /> : <FaTrash />} {isSigned ? 'Confirmar Arquivamento' : 'Excluir Definitivamente'}
            </button>
          </div>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}

// ── 5. MODAL: PURGA EM MASSA DE TESTES (PLAN-083) ───────────────────────────
function ConfirmPurgeModal({ isOpen, onClose, onPurged }) {
  if (!isOpen) return null;
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePurge = async () => {
    try {
      setLoading(true);
      const res = await onboardingApi.purgeTestRequests();
      if (res?.success) {
        showSuccess('Purga Concluída', res.message || 'Todos os leads de teste foram removidos.');
        onPurged();
        onClose();
      } else {
        throw new Error(res?.message || 'Falha ao purgar testes');
      }
    } catch (err) {
      showError('Erro na Purga', err.message || 'Erro de comunicação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()} $maxWidth="460px">
        <ModalHeader>
          <h3 style={{ color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaFlask /> Limpar Todos os Testes
          </h3>
          <CloseBtn onClick={onClose}><FaTimes /></CloseBtn>
        </ModalHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
          <div style={{ background: '#f5f3ff', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: '#5b21b6', fontSize: '0.88rem' }}>
              Purga em Massa do Ambiente Sandbox
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6d28d9', lineHeight: 1.4 }}>
              Esta ação removerá todos os leads gerados com a flag <strong>🧪 is_test = 1</strong>, seus uploads temporários e tokens de teste. Os leads reais de produção permanecerão 100% intactos.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '0.65rem 1.25rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handlePurge}
              disabled={loading}
              style={{ padding: '0.65rem 1.25rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}
            >
              {loading ? <FaSpinner className="spin" /> : <FaTrash />} Limpar Testes
            </button>
          </div>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}

// ── 6. MODAL: ATRIBUIR GESTOR & TURMA FUTURA (PLAN-083) ─────────────────────
function AssignManagerModal({ isOpen, onClose, lead, onAssigned }) {
  if (!isOpen || !lead) return null;
  const { showSuccess, showError } = useToast();
  const [assignedAdminId, setAssignedAdminId] = useState(lead.assigned_admin_id || 1);
  const [cohortTag, setCohortTag] = useState(lead.future_cohort_tag || '');
  const [loading, setLoading] = useState(false);

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await onboardingApi.assignRequest(lead.id, {
        assigned_admin_id: parseInt(assignedAdminId, 10),
        future_cohort_tag: cohortTag
      });
      if (res?.success) {
        showSuccess('Delegação Atualizada', 'Gestor responsável e turma vinculados com sucesso.');
        onAssigned();
        onClose();
      } else {
        throw new Error(res?.message || 'Falha ao atribuir gestor');
      }
    } catch (err) {
      showError('Erro ao Atribuir', err.message || 'Erro de comunicação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()} $maxWidth="460px">
        <ModalHeader>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUserTag /> Atribuir Gestor Responsável
          </h3>
          <CloseBtn onClick={onClose}><FaTimes /></CloseBtn>
        </ModalHeader>

        <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Candidata / Lead</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0a3e60' }}>{lead.nome || 'Sem Nome'} (ID #{lead.id})</div>
          </div>

          <FormGroup>
            <label>Gestor Responsável:</label>
            <select
              value={assignedAdminId}
              onChange={(e) => setAssignedAdminId(e.target.value)}
              style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 0.75rem', fontWeight: 600 }}
            >
              <option value="1">Joselene Silva (Diretoria / Superadmin)</option>
              <option value="2">Consultora Comercial (Vendas)</option>
              <option value="3">Líder de Atendimento (Suporte)</option>
            </select>
          </FormGroup>

          <FormGroup>
            <label>Tag de Turma Futura / Campanha:</label>
            <input
              type="text"
              placeholder="Ex: Turma Outubro 2026, Expansão Sul, Masterclass"
              value={cohortTag}
              onChange={(e) => setCohortTag(e.target.value)}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '0.65rem 1.25rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #0a3e60 0%, #072940 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(10, 62, 96, 0.25)' }}
            >
              {loading ? <FaSpinner className="spin" /> : <FaCheck />} Salvar Atribuição
            </button>
          </div>
        </form>
      </ModalCard>
    </ModalOverlay>
  );
}

// ── COMPONENTE PRINCIPAL DO FUNIL DE ONBOARDING ──────────────────────────────
export default function OnboardingFunnelPage() {
  const { showSuccess, showError } = useToast();
  const [leads, setLeads] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    links_enviados: 0,
    docs_recebidos: 0,
    contratos_emitidos: 0,
    pagamentos_validados: 0,
    ativadas_lms: 0,
    taxa_conversao: 0
  });
  const [loading, setLoading] = useState(true);
  const [generatingMock, setGeneratingMock] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [sandboxFilter, setSandboxFilter] = useState('real'); // 'real' | 'test' | 'all'
  const [managerFilter, setManagerFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Modais
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);
  const [selectedLeadWhatsApp, setSelectedLeadWhatsApp] = useState(null);
  const [selectedLeadContract, setSelectedLeadContract] = useState(null);
  const [selectedLeadAssign, setSelectedLeadAssign] = useState(null);
  const [selectedLeadDelete, setSelectedLeadDelete] = useState(null);

  const fetchFunnelData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = {
        view_mode: sandboxFilter
      };
      if (managerFilter !== 'ALL') {
        params.assigned_admin_id = managerFilter;
      }

      const [leadsRes, metricsRes] = await Promise.all([
        onboardingApi.getLeads(params),
        onboardingApi.getMetrics()
      ]);

      const items = leadsRes?.items || leadsRes?.leads || (Array.isArray(leadsRes) ? leadsRes : []);
      setLeads(items);
      if (metricsRes?.metrics) setMetrics(metricsRes.metrics);
    } catch (err) {
      console.error('Erro ao carregar funil de onboarding:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelData(false);
    const interval = setInterval(() => fetchFunnelData(true), 25000);
    return () => clearInterval(interval);
  }, [sandboxFilter, managerFilter]);

  const handleGenerateQuickMock = async () => {
    try {
      setGeneratingMock(true);
      const res = await onboardingApi.generateQuickMock({
        categoria: 'Licenciamento',
        future_cohort_tag: 'Sandbox 2026'
      });
      if (res?.success) {
        showSuccess(
          'Lead de Teste Criado',
          `${res.mock_lead?.nome || 'Lead'} gerado no Sandbox com CPF e dados válidos.`
        );
        // If viewing real only, switch to 'all' or 'test' to show the lead
        if (sandboxFilter === 'real') {
          setSandboxFilter('all');
        } else {
          fetchFunnelData(true);
        }
      } else {
        throw new Error(res?.message || 'Falha ao gerar lead de teste');
      }
    } catch (err) {
      showError('Erro no Sandbox', err.message || 'Erro ao gerar lead');
    } finally {
      setGeneratingMock(false);
    }
  };

  const getLeadStage = (ld) => {
    const s = ld?.status || '';
    if (s === 'PRE_CADASTRO' || s === 'LINK_ENVIADO' || !s) return 'LINK_ENVIADO';
    if (s === 'DADOS_PREENCHIDOS') return 'DADOS_PREENCHIDOS';
    if (s === 'CONTRATO_EMITIDO' || s === 'AGUARDANDO_ASSINATURA') return 'CONTRATO_EMITIDO';
    if (s === 'VALIDAR_PAGAMENTO' || s === 'PAGAMENTO_CONFIRMADO') return 'PAGAMENTO_CONFIRMADO';
    if (s === 'ATIVO_LIBERADO' || s === 'CONCLUIDO') return 'ATIVO_LIBERADO';
    return 'LINK_ENVIADO';
  };

  const columns = [
    { id: 'LINK_ENVIADO', title: '1. Link Enviado', borderColor: '#fde68a', bg: '#fffbeb', icon: <FaPaperPlane /> },
    { id: 'DADOS_PREENCHIDOS', title: '2. Docs / OCR', borderColor: '#bfdbfe', bg: '#eff6ff', icon: <FaShieldAlt /> },
    { id: 'CONTRATO_EMITIDO', title: '3. Contrato Emitido', borderColor: '#fed7aa', bg: '#fff7ed', icon: <FaFileAlt /> },
    { id: 'PAGAMENTO_CONFIRMADO', title: '4. Validar Pgto', borderColor: '#e9d5ff', bg: '#faf5ff', icon: <FaCreditCard /> },
    { id: 'ATIVO_LIBERADO', title: '5. Ativa & LMS', borderColor: '#bbf7d0', bg: '#f0fdf4', icon: <FaUserCheck /> }
  ];

  const filteredLeads = useMemo(() => {
    return leads.filter(ld => {
      const matchesSearch = !search || 
        (ld.nome && ld.nome.toLowerCase().includes(search.toLowerCase())) ||
        (ld.cpf && ld.cpf.includes(search)) ||
        (ld.telefone_whatsapp && ld.telefone_whatsapp.includes(search)) ||
        (ld.future_cohort_tag && ld.future_cohort_tag.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = filterCategory === 'ALL' || ld.categoria === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [leads, search, filterCategory]);

  return (
    <AdminLayout>
      <Container>
        {/* Top Header */}
        <Header>
          <TitleArea>
            <div className="badge">Nexus V3.1 • Gestão de Expansão & Sandbox</div>
            <h1>
              <FaUsers /> Funil de Onboarding de Licenciadas
            </h1>
            <p>
              Acompanhamento de pré-cadastros, extração de documentos, emissão de contratos e ativação LMS.
            </p>
          </TitleArea>

          <ActionsArea>
            <RefreshBtn
              onClick={() => fetchFunnelData(false)}
              title="Atualizar Dados"
            >
              <FaSyncAlt className={loading ? 'spin' : ''} />
            </RefreshBtn>

            <SandboxBtn
              type="button"
              onClick={handleGenerateQuickMock}
              disabled={generatingMock}
              title="Cria instantaneamente um lead fictício completo com CPF válido gerado no Sandbox"
            >
              <FaFlask /> {generatingMock ? 'Gerando...' : 'Gerar Teste Rápido'}
            </SandboxBtn>

            <PurgeBtn
              type="button"
              onClick={() => setIsPurgeOpen(true)}
              title="Limpar todos os dados de teste e simulações do sistema"
            >
              <FaTrash /> Limpar Testes
            </PurgeBtn>

            <PrimaryBtn onClick={() => setIsCreateOpen(true)}>
              <FaPlus /> Novo Link de Onboarding
            </PrimaryBtn>
          </ActionsArea>
        </Header>

        {/* Bento Grid KPI Metrics */}
        <KpiGrid>
          <KpiCard $borderColor="#e2e8f0">
            <KpiInfo>
              <div className="label">Total no Funil</div>
              <div className="value">{metrics.total || leads.length}</div>
              <div className="sub">Candidatas ativas</div>
            </KpiInfo>
            <KpiIconWrapper $bg="#f1f5f9" $color="#0a3e60">
              <FaUsers />
            </KpiIconWrapper>
          </KpiCard>

          <KpiCard $borderColor="#fde68a">
            <KpiInfo $labelColor="#d97706">
              <div className="label">1. Links Enviados</div>
              <div className="value">{leads.filter(l => getLeadStage(l) === 'LINK_ENVIADO').length}</div>
              <div className="sub">Aguardando dados</div>
            </KpiInfo>
            <KpiIconWrapper $bg="#fffbeb" $color="#d97706">
              <FaPaperPlane />
            </KpiIconWrapper>
          </KpiCard>

          <KpiCard $borderColor="#bfdbfe">
            <KpiInfo $labelColor="#2563eb">
              <div className="label">2. Docs / OCR</div>
              <div className="value">{leads.filter(l => getLeadStage(l) === 'DADOS_PREENCHIDOS').length}</div>
              <div className="sub">Prontos p/ contrato</div>
            </KpiInfo>
            <KpiIconWrapper $bg="#eff6ff" $color="#2563eb">
              <FaShieldAlt />
            </KpiIconWrapper>
          </KpiCard>

          <KpiCard $borderColor="#fed7aa">
            <KpiInfo $labelColor="#ea580c">
              <div className="label">3. Contratos Emitidos</div>
              <div className="value">{leads.filter(l => getLeadStage(l) === 'CONTRATO_EMITIDO').length}</div>
              <div className="sub">Aguardando assinatura</div>
            </KpiInfo>
            <KpiIconWrapper $bg="#fff7ed" $color="#ea580c">
              <FaFileAlt />
            </KpiIconWrapper>
          </KpiCard>

          <KpiCard $borderColor="#bbf7d0">
            <KpiInfo $labelColor="#16a34a">
              <div className="label">4. Ativadas LMS</div>
              <div className="value">{leads.filter(l => getLeadStage(l) === 'ATIVO_LIBERADO').length}</div>
              <div className="sub">Conversão: {metrics.taxa_conversao || 0}%</div>
            </KpiInfo>
            <KpiIconWrapper $bg="#f0fdf4" $color="#16a34a">
              <FaUserCheck />
            </KpiIconWrapper>
          </KpiCard>
        </KpiGrid>

        {/* Control Bar: Filters & View Switcher */}
        <ControlBar>
          <FiltersGroup>
            {/* SEGMENTED SANDBOX FILTER */}
            <SegmentedFilter>
              <SegmentedTab
                $active={sandboxFilter === 'real'}
                onClick={() => setSandboxFilter('real')}
                title="Apenas leads reais de produção"
              >
                🌟 Produção (Reais)
              </SegmentedTab>
              <SegmentedTab
                $active={sandboxFilter === 'test'}
                onClick={() => setSandboxFilter('test')}
                title="Apenas simulações e testes do Sandbox"
              >
                🧪 Testes
              </SegmentedTab>
              <SegmentedTab
                $active={sandboxFilter === 'all'}
                onClick={() => setSandboxFilter('all')}
                title="Todos os leads combinados"
              >
                📂 Todos
              </SegmentedTab>
            </SegmentedFilter>

            <SearchBox>
              <FaSearch size={13} />
              <input
                type="text"
                placeholder="Buscar por nome, CPF, turma..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </SearchBox>

            <SelectBox
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="ALL">Todas as Categorias</option>
              <option value="Licenciada Bronze">Licenciada Bronze</option>
              <option value="Licenciada Prata">Licenciada Prata</option>
              <option value="Licenciada Ouro">Licenciada Ouro</option>
              <option value="Licenciada Diamond">Licenciada Diamond</option>
              <option value="Licenciamento">Licenciamento Geral</option>
              <option value="Ouvinte">Ouvinte</option>
            </SelectBox>

            <SelectBox
              value={managerFilter}
              onChange={(e) => setManagerFilter(e.target.value)}
            >
              <option value="ALL">Todos os Gestores</option>
              <option value="1">Joselene Silva (Diretoria)</option>
              <option value="2">Consultoria Comercial</option>
              <option value="3">Suporte & Atendimento</option>
            </SelectBox>
          </FiltersGroup>

          <ViewSwitcher>
            <ViewTab
              $active={viewMode === 'kanban'}
              onClick={() => setViewMode('kanban')}
            >
              <FaThLarge /> Quadro Kanban
            </ViewTab>
            <ViewTab
              $active={viewMode === 'table'}
              onClick={() => setViewMode('table')}
            >
              <FaListUl /> Visão em Tabela
            </ViewTab>
          </ViewSwitcher>
        </ControlBar>

        {/* MAIN BOARD: KANBAN VIEW */}
        {viewMode === 'kanban' ? (
          <KanbanScrollWrapper>
            <KanbanBoard>
              {columns.map((col) => {
                const colLeads = filteredLeads.filter(l => getLeadStage(l) === col.id);

                return (
                  <ColumnWrapper key={col.id}>
                    <ColumnHeader $borderColor={col.borderColor} $bg={col.bg}>
                      <div className="left">
                        {col.icon}
                        <span>{col.title}</span>
                      </div>
                      <ColumnBadge>{colLeads.length}</ColumnBadge>
                    </ColumnHeader>

                    <ColumnCardsList>
                      {colLeads.length === 0 ? (
                        <EmptyColumn>Nenhum lead nesta etapa</EmptyColumn>
                      ) : (
                        colLeads.map((ld) => (
                          <LeadCard key={ld.id}>
                            <CardHeader>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                <CategoryBadge>{ld.categoria || 'Licenciada'}</CategoryBadge>
                                {(ld.is_test === 1 || ld.is_test === '1') && (
                                  <TestBadge><FaFlask size={9} /> Teste</TestBadge>
                                )}
                                {ld.future_cohort_tag && (
                                  <CohortPill><FaTag size={8} /> {ld.future_cohort_tag}</CohortPill>
                                )}
                              </div>
                              <SlaBadge createdAt={ld.created_at} />
                            </CardHeader>

                            <LeadName onClick={() => setSelectedLeadDetails(ld)}>
                              {ld.nome || 'Candidata sem Nome'}
                            </LeadName>

                            <LeadInfoRow>
                              <div className="item">
                                <FaWhatsapp size={12} color="#25d366" />
                                <a
                                  href={`https://wa.me/55${(ld.telefone_whatsapp || '').replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {formatPhone(ld.telefone_whatsapp)}
                                </a>
                              </div>
                              {ld.cidade && (
                                <div className="item">
                                  <FaMapMarkerAlt size={11} />
                                  <span>{ld.cidade}/{ld.estado || 'SP'}</span>
                                </div>
                              )}
                              {ld.cpf && (
                                <div className="item">
                                  <FaShieldAlt size={11} />
                                  <span>{formatCpf(ld.cpf)}</span>
                                </div>
                              )}
                              {ld.assigned_admin_name && (
                                <div className="item">
                                  <ManagerPill><FaUserTag size={9} /> {ld.assigned_admin_name}</ManagerPill>
                                </div>
                              )}
                            </LeadInfoRow>

                            {/* OCR Status */}
                            {ld.ocr_dados_json && (
                              <OcrBadge $verified={true}>
                                <FaCheckCircle size={10} /> OCR Extraído & Validado
                              </OcrBadge>
                            )}

                            {/* Card Quick Actions */}
                            <CardFooter>
                              <ActionBtn
                                onClick={() => setSelectedLeadDetails(ld)}
                                title="Ver Detalhes & Documentos"
                                $color="#0a3e60"
                              >
                                <FaEye size={10} /> Detalhes
                              </ActionBtn>

                              <ActionBtn
                                onClick={() => setSelectedLeadAssign(ld)}
                                title="Atribuir Gestor Responsável / Turma"
                                $color="#0a3e60"
                              >
                                <FaUserTag size={10} /> Atribuir
                              </ActionBtn>

                              <ActionBtn
                                onClick={() => setSelectedLeadWhatsApp(ld)}
                                title="Régua de WhatsApp"
                                $color="#25d366"
                              >
                                <FaWhatsapp size={11} /> WhatsApp
                              </ActionBtn>

                              <ActionBtn
                                onClick={() => setSelectedLeadContract(ld)}
                                title="Emitir Contrato DRAFT"
                                $color="#ed7e13"
                              >
                                <FaFileAlt size={10} /> Contrato
                              </ActionBtn>

                              <ActionBtn
                                onClick={() => setSelectedLeadDelete(ld)}
                                title="Excluir ou Arquivar Lead"
                                $color="#dc2626"
                              >
                                <FaTrash size={10} />
                              </ActionBtn>
                            </CardFooter>
                          </LeadCard>
                        ))
                      )}
                    </ColumnCardsList>
                  </ColumnWrapper>
                );
              })}
            </KanbanBoard>
          </KanbanScrollWrapper>
        ) : (
          /* TABLE VIEW */
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#0a3e60', fontWeight: 800 }}>
                  <th style={{ padding: '1rem' }}>Candidata</th>
                  <th style={{ padding: '1rem' }}>Categoria</th>
                  <th style={{ padding: '1rem' }}>WhatsApp</th>
                  <th style={{ padding: '1rem' }}>Localização</th>
                  <th style={{ padding: '1rem' }}>Status Funil</th>
                  <th style={{ padding: '1rem' }}>Gestor / Turma</th>
                  <th style={{ padding: '1rem' }}>SLA</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((ld) => (
                  <tr key={ld.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0a3e60' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {ld.nome || 'Candidata sem Nome'}
                        {(ld.is_test === 1 || ld.is_test === '1') && (
                          <TestBadge><FaFlask size={9} /> Teste</TestBadge>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <CategoryBadge>{ld.categoria || 'Licenciada'}</CategoryBadge>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {formatPhone(ld.telefone_whatsapp)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {ld.cidade ? `${ld.cidade}/${ld.estado || 'SP'}` : '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                      {ld.status}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {ld.assigned_admin_name && (
                          <ManagerPill><FaUserTag size={8} /> {ld.assigned_admin_name}</ManagerPill>
                        )}
                        {ld.future_cohort_tag && (
                          <CohortPill><FaTag size={8} /> {ld.future_cohort_tag}</CohortPill>
                        )}
                        {!ld.assigned_admin_name && !ld.future_cohort_tag && '—'}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <SlaBadge createdAt={ld.created_at} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <ActionBtn onClick={() => setSelectedLeadDetails(ld)} title="Detalhes">
                          <FaEye />
                        </ActionBtn>
                        <ActionBtn onClick={() => setSelectedLeadAssign(ld)} title="Atribuir Gestor" $color="#0a3e60">
                          <FaUserTag />
                        </ActionBtn>
                        <ActionBtn onClick={() => setSelectedLeadWhatsApp(ld)} title="WhatsApp" $color="#25d366">
                          <FaWhatsapp />
                        </ActionBtn>
                        <ActionBtn onClick={() => setSelectedLeadContract(ld)} title="Emitir Contrato" $color="#ed7e13">
                          <FaFileAlt />
                        </ActionBtn>
                        <ActionBtn onClick={() => setSelectedLeadDelete(ld)} title="Excluir/Arquivar" $color="#dc2626">
                          <FaTrash />
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODALS */}
        <CreateLinkModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => fetchFunnelData(true)}
        />

        <WhatsAppRuleModal
          isOpen={!!selectedLeadWhatsApp}
          onClose={() => setSelectedLeadWhatsApp(null)}
          lead={selectedLeadWhatsApp}
        />

        <LeadDetailsModal
          isOpen={!!selectedLeadDetails}
          onClose={() => setSelectedLeadDetails(null)}
          lead={selectedLeadDetails}
          onOpenContract={(ld) => {
            setSelectedLeadDetails(null);
            setSelectedLeadContract(ld);
          }}
          onOpenWhatsApp={(ld) => {
            setSelectedLeadDetails(null);
            setSelectedLeadWhatsApp(ld);
          }}
          onRefresh={() => fetchFunnelData(true)}
        />

        <GenerateContractModal
          isOpen={!!selectedLeadContract}
          onClose={() => setSelectedLeadContract(null)}
          lead={selectedLeadContract}
          onSuccess={() => fetchFunnelData(true)}
        />

        <AssignManagerModal
          isOpen={!!selectedLeadAssign}
          onClose={() => setSelectedLeadAssign(null)}
          lead={selectedLeadAssign}
          onAssigned={() => fetchFunnelData(true)}
        />

        <ConfirmDeleteModal
          isOpen={!!selectedLeadDelete}
          onClose={() => setSelectedLeadDelete(null)}
          lead={selectedLeadDelete}
          onDeleted={() => fetchFunnelData(true)}
        />

        <ConfirmPurgeModal
          isOpen={isPurgeOpen}
          onClose={() => setIsPurgeOpen(false)}
          onPurged={() => fetchFunnelData(true)}
        />
      </Container>
    </AdminLayout>
  );
}

