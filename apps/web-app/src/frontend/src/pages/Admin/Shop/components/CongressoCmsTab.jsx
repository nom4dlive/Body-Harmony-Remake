import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Reorder } from 'framer-motion';
import { 
  Save, 
  ExternalLink, 
  RotateCcw, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Crown, 
  Ticket, 
  Clock, 
  HelpCircle, 
  MessageSquare, 
  MessageCircle,
  ShieldCheck, 
  Building2, 
  Mic,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  Palette,
  Monitor,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Camera,
  UploadCloud,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Eye,
  EyeOff,
  Layers,
  Check,
  Flame,
  Layout,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Undo2,
  Redo2,
  Zap,
  FileText,
  Award,
  TrendingUp,
  Dumbbell,
  Star,
  Tag
} from 'lucide-react';
import { shopApi } from '../../../../services/api';
import CongressCockpitPanel from './CongressCockpitPanel';
import RichCmsField from '../../../../components/ui/RichCmsField';
import SectionLayoutControl from '../../../../components/ui/SectionLayoutControl';
import { 
  CURATED_ICONS_LIST, 
  CURATED_EMOJIS_LIST, 
  ContextualIconBadge 
} from '../../../Congresso/utils/renderContextualIcon';

const DEFAULT_SECTIONS_ORDER = [
  'hero',
  'sobre',
  'porque',
  'espaco',
  'oferta',
  'vip',
  'resumo',
  'galeria',
  'testemunhos',
  'countdown',
  'faq',
  'footer'
];

const SECTIONS_METADATA = {
  hero: { label: 'Topo & Hero (Cabeçalho)', icon: Crown, keyActive: 'congresso_section_hero_active' },
  sobre: { label: 'Sobre o Congresso', icon: Mic, keyActive: 'congresso_section_sobre_active' },
  porque: { label: 'Por Que Participar? (Motivos)', icon: Zap, keyActive: 'congresso_section_porque_active' },
  oferta: { label: 'Oferta Experience (Card Principal)', icon: Ticket, keyActive: 'congresso_section_oferta_active' },
  vip: { label: 'Passaporte VIP Exclusive', icon: Flame, keyActive: 'congresso_section_vip_active' },
  espaco: { label: 'Local & Espaço Full Sales', icon: Building2, keyActive: 'congresso_section_espaco_active' },
  tabela: { label: 'Comparativo de Ingressos', icon: Layers, keyActive: 'congresso_section_tabela_active' },
  countdown: { label: 'Cronômetro & Urgência Final', icon: Clock, keyActive: 'congresso_section_countdown_active' },
  faq: { label: 'Perguntas Frequentes', icon: HelpCircle, keyActive: 'congresso_section_faq_active' },
  resumo: { label: 'Matriz Comparativa (Experience vs. VIP)', icon: Layers, keyActive: 'congresso_section_comparativo_active' },
  galeria: { label: 'Galeria de Fotos & Imersão', icon: Camera, keyActive: 'congresso_galeria_active' },
  testemunhos: { label: 'Depoimentos & Provas', icon: MessageSquare, keyActive: 'congresso_section_testemunhos_active' },
  footer: { label: 'Rodapé / Fechamento', icon: Sparkles, keyActive: 'congresso_section_footer_active' },
};

const StudioLayout = styled.div`
  display: flex;
  gap: 1.25rem;
  width: 100%;
  position: relative;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const NavSidebar = styled.aside`
  width: ${props => props.$collapsed ? '60px' : '260px'};
  flex-shrink: 0;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: ${props => props.$collapsed ? '0.6rem 0.25rem' : '0.75rem'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.25s cubic-bezier(0.2, 0, 0, 1), padding 0.2s ease;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 4px;
  }

  @media (max-width: 1024px) {
    width: 100%;
    position: static;
    max-height: none;
    padding: 0.5rem;
    overflow-x: auto;
    display: flex;
    gap: 0.5rem;
  }
`;

const NavItem = styled.button`
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: ${props => props.$collapsed ? 'center' : 'space-between'};
  padding: ${props => props.$collapsed ? '0.65rem 0.25rem' : '0.55rem 0.65rem'};
  border-radius: 10px;
  border: 1px solid ${props => props.$active ? '#ED7E13' : 'transparent'};
  background: ${props => props.$active ? 'linear-gradient(135deg, #0A3E60 0%, #06283D 100%)' : 'transparent'};
  color: ${props => props.$active ? '#FFFFFF' : '#334155'};
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  margin-bottom: 0.35rem;
  font-family: inherit;
  position: relative;

  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #0A3E60 0%, #06283D 100%)' : '#F8FAFC'};
    border-color: ${props => props.$active ? '#ED7E13' : '#CBD5E1'};
  }

  .left {
    display: flex;
    align-items: center;
    justify-content: ${props => props.$collapsed ? 'center' : 'flex-start'};
    gap: 0.5rem;
    font-size: 0.8rem;
    font-weight: 700;
    min-width: 0;
    flex: 1;
    overflow: hidden;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    svg {
      color: ${props => props.$active ? '#FBBF24' : '#64748B'};
      flex-shrink: 0;
    }
  }

  .modified-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #F59E0B;
    box-shadow: 0 0 6px #F59E0B;
    flex-shrink: 0;
    margin-left: 4px;
  }

  @media (max-width: 1024px) {
    width: auto;
    margin-bottom: 0;
    white-space: nowrap;
    padding: 0.5rem 0.85rem;
  }
`;

const ReorderItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.35rem;
  width: 100%;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 1024px) {
    width: auto;
    margin-bottom: 0;
  }
`;

const DragHandleBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.2rem;
  color: #94A3B8;
  cursor: grab;
  border-radius: 6px;
  flex-shrink: 0;
  transition: all 0.15s ease;

  &:hover {
    color: #0A3E60;
    background: #F1F5F9;
  }

  &:active {
    cursor: grabbing;
    color: #ED7E13;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const MoveArrowsBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex-shrink: 0;

  button {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    padding: 2px 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748B;
    cursor: pointer;
    line-height: 1;
    transition: all 0.1s ease;

    &:hover:not(:disabled) {
      background: #ED7E13;
      color: #FFFFFF;
      border-color: #ED7E13;
    }

    &:disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }
  }

  @media (max-width: 1024px) {
    flex-direction: row;
  }
`;

const StatusBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;

  ${props => props.$active ? `
    background: #DCFCE7;
    color: #166534;
  ` : `
    background: #FEE2E2;
    color: #991B1B;
  `}

  ${props => props.$selected && `
    border: 1px solid rgba(255, 255, 255, 0.4);
  `}
`;

const EditorContainer = styled.main`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 5rem; /* Espaço para barra flutuante */
`;

const SectionHeaderCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  .meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(10, 62, 96, 0.1) 0%, rgba(237, 126, 19, 0.15) 100%);
      color: #0A3E60;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    h2 {
      font-size: 1.15rem;
      font-weight: 900;
      color: #0A3E60;
      margin: 0;
    }

    p {
      font-size: 0.8rem;
      color: #64748B;
      margin: 0.15rem 0 0 0;
    }
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  background: ${props => props.$active ? '#F0FDF4' : '#FEF2F2'};
  border: 1px solid ${props => props.$active ? '#BBF7D0' : '#FECACA'};
  padding: 0.45rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 800;
  color: ${props => props.$active ? '#166534' : '#991B1B'};
  transition: all 0.2s ease;
  user-select: none;

  input {
    display: none;
  }
`;

const SubTabsNav = styled.div`
  display: flex;
  background: #F1F5F9;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  gap: 3px;

  button {
    border: none;
    padding: 0.45rem 1rem;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.15s ease;
    background: ${props => props.$active ? '#0A3E60' : 'transparent'};
    color: ${props => props.$active ? '#FFFFFF' : '#64748B'};

    &:hover {
      color: ${props => props.$active ? '#FFFFFF' : '#0F172A'};
    }
  }
`;

const ContentCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;

  .full-width {
    grid-column: 1 / -1;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.78rem;
    font-weight: 700;
    color: #475569;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1px solid #CBD5E1;
  font-size: 0.88rem;
  color: #1E293B;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
  min-height: 42px;

  &:focus {
    border-color: #ED7E13;
    box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.12);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1px solid #CBD5E1;
  font-size: 0.88rem;
  color: #1E293B;
  outline: none;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    border-color: #ED7E13;
    box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.12);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1px solid #CBD5E1;
  font-size: 0.88rem;
  color: #1E293B;
  outline: none;
  font-family: inherit;
  background: #FFFFFF;
  min-height: 42px;

  &:focus {
    border-color: #ED7E13;
    box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.12);
  }
`;

const AlignButtonGroup = styled.div`
  display: flex;
  background: #F1F5F9;
  padding: 3px;
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  gap: 3px;
`;

const AlignBtn = styled.button`
  flex: 1;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
  background: ${props => props.$active ? '#0A3E60' : 'transparent'};
  color: ${props => props.$active ? '#FFFFFF' : '#475569'};

  &:hover {
    color: ${props => props.$active ? '#FFFFFF' : '#0F172A'};
  }
`;

const FormatHintBox = styled.div`
  background: #FFFDF9;
  border: 1px solid rgba(237, 126, 19, 0.3);
  border-radius: 10px;
  padding: 0.65rem 1rem;
  font-size: 0.8rem;
  color: #92400E;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  code {
    background: rgba(237, 126, 19, 0.15);
    color: #0A3E60;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-weight: 800;
  }
`;

const StickyFooterBar = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(10, 62, 96, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(237, 126, 19, 0.4);
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.3);
  gap: 1rem;
  flex-wrap: wrap;

  .left-status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #F8FAFC;
    font-size: 0.84rem;
    font-weight: 700;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #FBBF24;
      box-shadow: 0 0 8px #FBBF24;
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    padding: 0.65rem 1rem;
    .left-status { display: none; }
    .actions { width: 100%; justify-content: space-between; }
  }
`;

const GhostActionBtn = styled.button`
  background: rgba(255, 255, 255, 0.08);
  color: #F8FAFC;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
  min-height: 42px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
`;

const SaveBtn = styled.button`
  background: linear-gradient(135deg, #ED7E13 0%, #D97706 100%);
  color: #FFFFFF;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(237, 126, 19, 0.4);
  transition: all 0.2s ease;
  min-height: 42px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(237, 126, 19, 0.6);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

function ItemIconEmojiPicker({ icon, emoji, onChangeIcon, onChangeEmoji }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '8px',
          padding: '0.35rem 0.6rem',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: '#0A3E60'
        }}
        title="Escolher Ícone ou Emoji"
      >
        <ContextualIconBadge iconName={icon} emoji={emoji} size={18} />
        <ChevronDown size={14} color="#64748B" />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 100,
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            padding: '0.75rem',
            width: '280px',
            marginTop: '4px'
          }}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Emojis Populares
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px', marginTop: '4px' }}>
              {CURATED_EMOJIS_LIST.map((em, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChangeEmoji(em);
                    onChangeIcon('');
                    setIsOpen(false);
                  }}
                  style={{
                    background: emoji === em ? '#FEF3C7' : '#F8FAFC',
                    border: emoji === em ? '1px solid #F59E0B' : '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    lineHeight: 1
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Ícones Luxury
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '4px' }}>
              {CURATED_ICONS_LIST.map((item) => {
                const IconComp = item.icon;
                const isSelected = icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChangeIcon(item.id);
                      onChangeEmoji('');
                      setIsOpen(false);
                    }}
                    title={item.label}
                    style={{
                      background: isSelected ? '#EFF6FF' : '#F8FAFC',
                      border: isSelected ? '1px solid #3B82F6' : '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <IconComp size={16} color={isSelected ? '#2563EB' : '#0A3E60'} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default function CongressoCmsTab({
  settings = {},
  onChange = () => {},
  onSave = () => {},
  onReset = () => {},
  saving = false
}) {
  const [activeSectionId, setActiveSectionId] = useState('global');
  const [sectionSubTab, setSectionSubTab] = useState('content'); // 'content' | 'design'
  const [globalTab, setGlobalTab] = useState('toggles'); // 'toggles' | 'typo' | 'spacing' | 'sizes'
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState({ ...settings });
  const [historyStack, setHistoryStack] = useState([{ ...settings }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Atualiza o snapshot salvo quando o salvar ocorre com sucesso
  useEffect(() => {
    if (!saving) {
      setSavedSnapshot({ ...settings });
    }
  }, [saving]);

  // Suporte a atalho de teclado Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave(e);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, historyIndex, historyStack]);

  const handleChange = (key, value) => {
    const nextSettings = {
      ...settings,
      [key]: value
    };
    onChange(nextSettings);

    // Adiciona ao stack de histórico (máx 20 estados)
    const newStack = historyStack.slice(0, historyIndex + 1);
    if (newStack.length >= 20) newStack.shift();
    newStack.push(nextSettings);
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = historyStack[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const next = historyStack[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(next);
    }
  };

  // Identificador de alterações pendentes por seção
  const isSectionModified = (secId) => {
    if (!savedSnapshot) return false;
    const prefixMap = {
      hero: ['congresso_hero_', 'congresso_date_text', 'congresso_location_'],
      sobre: ['congresso_sobre_', 'congresso_publico_alvo_', 'congresso_palestrante'],
      porque: ['congresso_porque_', 'congresso_pilares_'],
      espaco: ['congresso_espaco_'],
      oferta: ['congresso_oferta_', 'congresso_experience_', 'congresso_lotes_'],
      vip: ['congresso_vip_'],
      tabela: ['congresso_tabela_'],
      galeria: ['congresso_galeria_'],
      resumo: ['congresso_comparativo_', 'congresso_resumo_'],
      testemunhos: ['congresso_testemunhos_', 'congresso_depoimentos_'],
      countdown: ['congresso_countdown_'],
      faq: ['congresso_faq_'],
      footer: ['congresso_footer_'],
      global: ['congresso_typo_', 'congresso_spacing_', 'congresso_size_', 'congresso_color_'],
      cockpit_lotes: ['congresso_lotes_config_json']
    };
    const prefixes = prefixMap[secId] || [`congresso_${secId}_`];
    return Object.keys(settings).some(k => 
      prefixes.some(p => k.startsWith(p)) && settings[k] !== savedSnapshot[k]
    );
  };

  // Helper de upload para galeria do Espaço
  const handleUploadGallery = async (file) => {
    if (!file) return;
    try {
      setUploadingGallery(true);
      const res = await (shopApi.uploadCongressoPhoto || shopApi.uploadCongressGalleryImage || shopApi.uploadCongressGallery)(file);
      const uploadedUrl = res?.url || res?.data?.url;
      if (uploadedUrl) {
        let current = [];
        try {
          current = JSON.parse(settings.congresso_espaco_gallery_json || '[]');
        } catch (_) {}
        const updated = [...current, { url: uploadedUrl, caption: 'Espaço Full Sales' }];
        handleChange('congresso_espaco_gallery_json', JSON.stringify(updated));
      } else {
        alert('Erro: Servidor não retornou a URL da imagem.');
      }
    } catch (err) {
      alert('Erro no upload: ' + (err?.response?.data?.message || err.message));
    } finally {
      setUploadingGallery(false);
    }
  };

  // Obter lista ordenada das seções visuais (PLAN-166)
  const visualSectionsOrder = useMemo(() => {
    if (!settings.congresso_sections_order || typeof settings.congresso_sections_order !== 'string') {
      return DEFAULT_SECTIONS_ORDER;
    }
    const parsed = settings.congresso_sections_order.split(',').map(s => s.trim()).filter(Boolean);
    const valid = parsed.filter(id => id in SECTIONS_METADATA);
    const missing = DEFAULT_SECTIONS_ORDER.filter(id => !valid.includes(id));
    return [...valid, ...missing];
  }, [settings.congresso_sections_order]);

  const handleReorder = (newOrder) => {
    handleChange('congresso_sections_order', newOrder.join(','));
  };

  const handleMoveSection = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= visualSectionsOrder.length) return;
    const newOrder = [...visualSectionsOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    handleReorder(newOrder);
  };

  const handleResetOrder = () => {
    handleReorder(DEFAULT_SECTIONS_ORDER);
  };

  const currentSection = activeSectionId === 'cockpit_lotes'
    ? { id: 'cockpit_lotes', num: '⚡', label: '🎯 Cockpit de Lotes, Preços & Checkout', icon: Zap, keyActive: null }
    : (activeSectionId === 'global'
      ? { id: 'global', num: '0', label: 'Estilos Globais & Sliders', icon: Sliders, keyActive: null }
      : {
          id: activeSectionId,
          num: String(visualSectionsOrder.indexOf(activeSectionId) + 1),
          label: `${visualSectionsOrder.indexOf(activeSectionId) + 1}. ${SECTIONS_METADATA[activeSectionId]?.label || activeSectionId}`,
          icon: SECTIONS_METADATA[activeSectionId]?.icon || Layers,
          keyActive: SECTIONS_METADATA[activeSectionId]?.keyActive
        });
  const isCurrentActive = currentSection.keyActive ? (settings[currentSection.keyActive] !== 0) : true;

  const openLivePreview = (device = 'desktop') => {
    if (device === 'mobile') {
      window.open('/congresso', 'CongressoMobilePreview', 'width=390,height=844,resizable=yes,scrollbars=yes');
    } else {
      window.open('/congresso', '_blank');
    }
  };

  return (
    <form onSubmit={onSave} style={{ width: '100%' }}>
      <StudioLayout>
        {/* SIDEBAR NAVEGADORA DE SEÇÕES (MASTER-DETAIL COM REORDENAÇÃO NATIVA) */}
        <NavSidebar $collapsed={isSidebarCollapsed}>
          <div style={{ display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', alignItems: 'center', padding: '0.2rem 0.2rem 0.5rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.5rem' }}>
            {!isSidebarCollapsed && (
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Seções do Congresso
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px'
              }}
              title={isSidebarCollapsed ? 'Expandir Menu de Seções' : 'Recolher Menu (Mais Espaço)'}
            >
              {isSidebarCollapsed ? <Maximize2 size={13} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {/* Aba Destaque: Cockpit de Lotes, Preços e Checkout */}
          <NavItem
            type="button"
            $active={activeSectionId === 'cockpit_lotes'}
            $collapsed={isSidebarCollapsed}
            onClick={() => {
              setActiveSectionId('cockpit_lotes');
              setSectionSubTab('content');
            }}
            title="🎯 Cockpit de Lotes, Preços & Checkout"
            style={{ 
              marginBottom: '0.5rem', 
              background: activeSectionId === 'cockpit_lotes' ? '#0A3E60' : 'rgba(237, 126, 19, 0.08)', 
              borderColor: activeSectionId === 'cockpit_lotes' ? '#0A3E60' : '#ED7E13',
              color: activeSectionId === 'cockpit_lotes' ? '#FFFFFF' : '#92400E'
            }}
          >
            <div className="left">
              <Zap size={15} color={activeSectionId === 'cockpit_lotes' ? '#FBBF24' : '#ED7E13'} />
              {!isSidebarCollapsed && <span style={{ fontWeight: 800 }}>🎯 Lotes & Preços</span>}
            </div>
            {isSectionModified('cockpit_lotes') && <span className="modified-dot" title="Alterações pendentes" />}
          </NavItem>

          {/* Aba Fixa: Estilos Globais */}
          <NavItem
            type="button"
            $active={activeSectionId === 'global'}
            $collapsed={isSidebarCollapsed}
            onClick={() => {
              setActiveSectionId('global');
              setSectionSubTab('content');
            }}
            title="Estilos Globais & Sliders"
            style={{ marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}
          >
            <div className="left">
              <Sliders size={15} />
              {!isSidebarCollapsed && <span>Estilos Globais</span>}
            </div>
            {isSectionModified('global') && <span className="modified-dot" title="Alterações pendentes" />}
          </NavItem>

          {!isSidebarCollapsed && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.2rem 0.2rem 0.4rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Landing Page
              </span>
              <button
                type="button"
                onClick={handleResetOrder}
                title="Restaurar ordem recomendada original"
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '2px 5px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <RotateCcw size={9} /> Padrão
              </button>
            </div>
          )}

          <Reorder.Group
            axis="y"
            values={visualSectionsOrder}
            onReorder={handleReorder}
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            {visualSectionsOrder.map((secId, index) => {
              const meta = SECTIONS_METADATA[secId];
              if (!meta) return null;
              const isSelected = secId === activeSectionId;
              const isSecActive = meta.keyActive ? (settings[meta.keyActive] !== 0) : true;
              const Icon = meta.icon;
              const itemNumber = index + 1;
              const isMod = isSectionModified(secId);

              return (
                <Reorder.Item
                  key={secId}
                  value={secId}
                  style={{ listStyle: 'none' }}
                >
                  <ReorderItemContainer>
                    {!isSidebarCollapsed && (
                      <>
                        <DragHandleBox title="Clique e arraste para reordenar esta seção">
                          <GripVertical size={13} />
                        </DragHandleBox>

                        <MoveArrowsBox>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(index, 'up');
                            }}
                            title="Subir posição"
                          >
                            <ChevronUp size={9} />
                          </button>
                          <button
                            type="button"
                            disabled={index === visualSectionsOrder.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(index, 'down');
                            }}
                            title="Descer posição"
                          >
                            <ChevronDown size={9} />
                          </button>
                        </MoveArrowsBox>
                      </>
                    )}

                    <NavItem
                      type="button"
                      $active={isSelected}
                      $collapsed={isSidebarCollapsed}
                      onClick={() => {
                        setActiveSectionId(secId);
                        setSectionSubTab('content');
                      }}
                      title={`${itemNumber}. ${meta.label}`}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <div className="left">
                        <Icon size={14} />
                        {!isSidebarCollapsed && <span>{itemNumber}. {meta.label}</span>}
                      </div>
                      {isMod && <span className="modified-dot" title="Alterações pendentes" />}
                      {!isSidebarCollapsed && meta.keyActive && (
                        <StatusBadge $active={isSecActive} $selected={isSelected}>
                          {isSecActive ? '✓' : '—'}
                        </StatusBadge>
                      )}
                    </NavItem>
                  </ReorderItemContainer>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </NavSidebar>

        {/* ÁREA CENTRAL DE EDIÇÃO FOCADA */}
        <EditorContainer>
          {/* CABEÇALHO DA SEÇÃO */}
          <SectionHeaderCard>
            <div className="meta" style={{ minWidth: 0, flex: 1 }}>
              <div className="icon-box">
                <currentSection.icon size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: '1.05rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentSection.label}
                </h2>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                  Edite os textos, alinhamentos e aparência desta seção em tempo real.
                </p>
              </div>
            </div>

            {/* SELETOR RÁPIDO NO TOPO (PULAR PARA...) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#F8FAFC', padding: '0.35rem 0.65rem', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', whiteSpace: 'nowrap' }}>
                ⚡ PULAR:
              </span>
              <select
                value={activeSectionId}
                onChange={(e) => {
                  setActiveSectionId(e.target.value);
                  setSectionSubTab('content');
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#0A3E60',
                  cursor: 'pointer',
                  outline: 'none',
                  maxWidth: '220px'
                }}
              >
                <option value="cockpit_lotes">🎯 Cockpit Lotes & Preços {isSectionModified('cockpit_lotes') ? '●' : ''}</option>
                <option value="global">⚙️ Estilos Globais & Sliders {isSectionModified('global') ? '●' : ''}</option>
                {visualSectionsOrder.map((secId, i) => (
                  <option key={secId} value={secId}>
                    {i + 1}. {SECTIONS_METADATA[secId]?.label || secId} {isSectionModified(secId) ? '● (Alterado)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="controls">
              {currentSection.keyActive && (
                <ToggleSwitch $active={isCurrentActive}>
                  <input
                    type="checkbox"
                    checked={isCurrentActive}
                    onChange={(e) => handleChange(currentSection.keyActive, e.target.checked ? 1 : 0)}
                  />
                  {isCurrentActive ? <Eye size={15} /> : <EyeOff size={15} />}
                  <span>{isCurrentActive ? 'Seção Ativa' : 'Oculta'}</span>
                </ToggleSwitch>
              )}

              {activeSectionId !== 'global' && (
                <SubTabsNav>
                  <button
                    type="button"
                    $active={sectionSubTab === 'content'}
                    onClick={() => setSectionSubTab('content')}
                  >
                    <Type size={14} /> Textos & Copys
                  </button>
                  <button
                    type="button"
                    $active={sectionSubTab === 'design'}
                    onClick={() => setSectionSubTab('design')}
                  >
                    <Palette size={14} /> Tipografia & Design
                  </button>
                </SubTabsNav>
              )}
            </div>
          </SectionHeaderCard>

          {/* PAINEL MESTRE: COCKPIT DE LOTES, PREÇOS E CHECKOUT */}
          {activeSectionId === 'cockpit_lotes' && (
            <CongressCockpitPanel 
              settings={settings} 
              onSaveSettings={(newSettings) => onChange(newSettings)} 
            />
          )}

          {/* PAINEL 0: ESTILOS GLOBAIS, SLIDERS & VISIBILIDADE */}
          {activeSectionId === 'global' && (
            <ContentCard>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'toggles', label: '👁️ Ativar/Desativar Seções (10)', icon: Layers },
                  { id: 'typo', label: '🎨 Estilos & Layout Global', icon: Palette },
                  { id: 'spacing', label: '📏 Altura das Seções (10)', icon: Sliders },
                  { id: 'sizes', label: '🔠 Tamanhos de Letras (7)', icon: Type },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setGlobalTab(tab.id)}
                    style={{
                      border: '1px solid',
                      borderColor: globalTab === tab.id ? '#ED7E13' : '#CBD5E1',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      background: globalTab === tab.id ? '#0A3E60' : '#FFFFFF',
                      color: globalTab === tab.id ? '#FFFFFF' : '#334155',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {globalTab === 'toggles' && (
                <div>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 1rem' }}>
                    Controle de visibilidade em 1 clique para todas as 10 seções da landing page:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                    {visualSectionsOrder.map((secId, idx) => {
                      const sec = SECTIONS_METADATA[secId];
                      if (!sec || !sec.keyActive) return null;
                      const isActive = settings[sec.keyActive] !== 0;
                      return (
                        <div 
                          key={sec.keyActive}
                          style={{
                            background: isActive ? '#F0FDF4' : '#FEF2F2',
                            border: `1px solid ${isActive ? '#BBF7D0' : '#FECACA'}`,
                            borderRadius: '10px',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isActive ? '#166534' : '#991B1B' }}>
                            {idx + 1}. {sec.label}
                          </span>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={(e) => handleChange(sec.keyActive, e.target.checked ? 1 : 0)}
                            />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isActive ? '#166534' : '#991B1B' }}>
                              {isActive ? 'Ativo' : 'Oculto'}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {globalTab === 'typo' && (
                <FieldsGrid>
                  <FormGroup>
                    <label>Alinhamento Padrão dos Títulos</label>
                    <AlignButtonGroup>
                      <AlignBtn
                        type="button"
                        $active={settings.congresso_typo_hero_align === 'left'}
                        onClick={() => handleChange('congresso_typo_hero_align', 'left')}
                      >
                        <AlignLeft size={14} /> Esquerda
                      </AlignBtn>
                      <AlignBtn
                        type="button"
                        $active={!settings.congresso_typo_hero_align || settings.congresso_typo_hero_align === 'center'}
                        onClick={() => handleChange('congresso_typo_hero_align', 'center')}
                      >
                        <AlignCenter size={14} /> Centro
                      </AlignBtn>
                      <AlignBtn
                        type="button"
                        $active={settings.congresso_typo_hero_align === 'right'}
                        onClick={() => handleChange('congresso_typo_hero_align', 'right')}
                      >
                        <AlignRight size={14} /> Direita
                      </AlignBtn>
                    </AlignButtonGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>Escala do Título Principal (H1)</label>
                    <Select
                      value={settings.congresso_typo_hero_title_size || 'clamp(2rem, 5vw, 3.8rem)'}
                      onChange={(e) => handleChange('congresso_typo_hero_title_size', e.target.value)}
                    >
                      <option value="clamp(1.8rem, 4vw, 3rem)">Compacto (Menor)</option>
                      <option value="clamp(2rem, 5vw, 3.8rem)">Equilibrado (Padrão)</option>
                      <option value="clamp(2.5rem, 6vw, 4.5rem)">Grande (Impacto)</option>
                      <option value="clamp(3rem, 7vw, 5.5rem)">Titânico (Ultra)</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <label>Peso da Fonte do H1</label>
                    <Select
                      value={settings.congresso_typo_hero_title_weight || '900'}
                      onChange={(e) => handleChange('congresso_typo_hero_title_weight', e.target.value)}
                    >
                      <option value="600">Semi-Bold (600)</option>
                      <option value="700">Bold / Negrito (700)</option>
                      <option value="800">Extra-Bold (800)</option>
                      <option value="900">Black / Pesado (900)</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <label>Espaçamento Vertical das Seções</label>
                    <Select
                      value={settings.congresso_typo_section_spacing || 'standard'}
                      onChange={(e) => handleChange('congresso_typo_section_spacing', e.target.value)}
                    >
                      <option value="compact">Compacto (Mais próximo)</option>
                      <option value="standard">Padrão Luxury (Equilibrado)</option>
                      <option value="generous">Amplo (Espaçoso)</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <label>Geometria & Curvatura de Bordas</label>
                    <Select
                      value={settings.congresso_typo_border_radius || '18px'}
                      onChange={(e) => handleChange('congresso_typo_border_radius', e.target.value)}
                    >
                      <option value="0px">Sharp 0px (Aura Grand Prix Reto)</option>
                      <option value="8px">Discreto (8px)</option>
                      <option value="18px">Suave Luxury (16px - 20px) [Padrão]</option>
                      <option value="28px">Ultra Arredondado (28px)</option>
                    </Select>
                  </FormGroup>
                </FieldsGrid>
              )}

              {globalTab === 'spacing' && (
                <FieldsGrid>
                  {[
                    { key: 'congresso_spacing_hero',        label: '🏠 1. Hero (Topo da Página)', defaultPx: 80 },
                    { key: 'congresso_spacing_sobre',       label: '📖 2. Sobre o Congresso',    defaultPx: 96 },
                    { key: 'congresso_spacing_oferta',      label: '🎟️ 3. Oferta Experience',   defaultPx: 96 },
                    { key: 'congresso_spacing_vip',         label: '👑 4. Área VIP Exclusive',   defaultPx: 96 },
                    { key: 'congresso_spacing_tabela',      label: '📊 5. Tabela de Ingressos',  defaultPx: 96 },
                    { key: 'congresso_spacing_espaco',      label: '🏢 6. O Espaço Full Sales',  defaultPx: 96 },
                    { key: 'congresso_spacing_testemunhos', label: '💬 7. Depoimentos',          defaultPx: 96 },
                    { key: 'congresso_spacing_countdown',   label: '⏱️ 8. Cronômetro de Vagas',  defaultPx: 96 },
                    { key: 'congresso_spacing_faq',         label: '❓ 9. Perguntas Frequentes', defaultPx: 96 },
                    { key: 'congresso_spacing_footer',      label: '🏁 10. Rodapé / Fechamento', defaultPx: 96 },
                  ].map(({ key, label, defaultPx }) => {
                    const currentVal = settings[key] || `${defaultPx}px 24px ${Math.round(defaultPx * 0.85)}px`;
                    const currentPx = parseInt(currentVal, 10) || defaultPx;
                    return (
                      <FormGroup key={key}>
                        <label>
                          <span>{label}</span>
                          <strong style={{ color: '#ED7E13' }}>{currentPx}px</strong>
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="180"
                          step="5"
                          value={currentPx}
                          onChange={(e) => {
                            const px = e.target.value;
                            handleChange(key, `${px}px 24px ${Math.round(px * 0.85)}px`);
                          }}
                          style={{ width: '100%', accentColor: '#ED7E13' }}
                        />
                      </FormGroup>
                    );
                  })}
                </FieldsGrid>
              )}

              {globalTab === 'sizes' && (
                <FieldsGrid>
                  {[
                    { key: 'congresso_size_hero_h1',        label: 'Título Principal (H1)', defaultPx: 44, min: 28, max: 72 },
                    { key: 'congresso_size_section_h2',     label: 'Títulos de Seção (H2)', defaultPx: 36, min: 22, max: 56 },
                    { key: 'congresso_size_badge',          label: 'Badges & Selos',        defaultPx: 12, min: 10, max: 18 },
                    { key: 'congresso_size_card_title',     label: 'Títulos de Cartões',    defaultPx: 22, min: 16, max: 32 },
                    { key: 'congresso_size_body',           label: 'Textos & Descrições',   defaultPx: 16, min: 13, max: 22 },
                    { key: 'congresso_size_price',          label: 'Preços em Destaque',    defaultPx: 38, min: 24, max: 64 },
                    { key: 'congresso_size_cta',            label: 'Botões de Ação (CTAs)', defaultPx: 16, min: 13, max: 22 },
                  ].map(({ key, label, defaultPx, min, max }) => {
                    const currentVal = settings[key] || `${defaultPx}px`;
                    const currentPx = parseInt(currentVal, 10) || defaultPx;
                    return (
                      <FormGroup key={key}>
                        <label>
                          <span>{label}</span>
                          <strong style={{ color: '#ED7E13' }}>{currentPx}px</strong>
                        </label>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step="1"
                          value={currentPx}
                          onChange={(e) => {
                            const px = e.target.value;
                            handleChange(key, `${px}px`);
                          }}
                          style={{ width: '100%', accentColor: '#ED7E13' }}
                        />
                      </FormGroup>
                    );
                  })}
                </FieldsGrid>
              )}
            </ContentCard>
          )}

          {/* PAINEL 1: TOPO & HERO */}
          {activeSectionId === 'hero' && (
            <ContentCard>
              <FormatHintBox>
                <strong>💡 Editor Visual Rápido:</strong> Use os botões da barra acima de cada campo para aplicar <strong>Negrito</strong>, <span style={{ color: '#D4AF37', fontWeight: 800 }}>Ouro</span>, CAPS, Emojis ou alternar o <strong>Live Preview</strong> em tempo real!
              </FormatHintBox>

              {sectionSubTab === 'content' ? (
                <>
                  <SectionLayoutControl
                    sectionName="Topo & Hero"
                    align={settings.congresso_hero_align || 'center'}
                    onAlignChange={(val) => handleChange('congresso_hero_align', val)}
                    photoPosition={settings.congresso_hero_photo_position || 'bottom'}
                    onPhotoPositionChange={(val) => handleChange('congresso_hero_photo_position', val)}
                    ctaPosition={settings.congresso_hero_cta_position || 'after_details'}
                    onCtaPositionChange={(val) => handleChange('congresso_hero_cta_position', val)}
                    ctaPreset={settings.congresso_hero_cta_preset || 'gold'}
                    onCtaPresetChange={(val) => handleChange('congresso_hero_cta_preset', val)}
                    onResetSection={() => {
                      handleChange('congresso_hero_badge', '07 DE NOVEMBRO | SÃO PAULO');
                      handleChange('congresso_hero_location_badge', 'AUDITÓRIO DE ALTO PADRÃO');
                      handleChange('congresso_hero_title', '1º CONGRESSO BRASILEIRO DE MUSCULAÇÃO ELÉTRICA');
                      handleChange('congresso_hero_subtitle', 'Um dia para transformar conhecimento em prática, ampliar sua visão profissional e descobrir como a musculação elétrica está criando novas oportunidades nas áreas da saúde, estética, performance e negócios.');
                      handleChange('congresso_hero_cta', 'QUERO GARANTIR MEU INGRESSO');
                      handleChange('congresso_hero_photo_position', 'bottom');
                      handleChange('congresso_hero_cta_position', 'after_details');
                      handleChange('congresso_hero_align', 'center');
                    }}
                  />

                  <FieldsGrid>
                    <RichCmsField
                      label="Badge Superior de Evento"
                      value={settings.congresso_hero_badge || '07 DE NOVEMBRO | SÃO PAULO'}
                      onChange={(val) => handleChange('congresso_hero_badge', val)}
                      activeBadge={
                        <label style={{ fontSize: '0.72rem', color: settings.congresso_hero_badge_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={settings.congresso_hero_badge_active !== 0}
                            onChange={(e) => handleChange('congresso_hero_badge_active', e.target.checked ? 1 : 0)}
                          /> {settings.congresso_hero_badge_active !== 0 ? '✓ Ativo' : 'Oculto'}
                        </label>
                      }
                    />

                    <RichCmsField
                      label="Badge Secundário (Localização)"
                      value={settings.congresso_hero_location_badge || 'AUDITÓRIO DE ALTO PADRÃO'}
                      onChange={(val) => handleChange('congresso_hero_location_badge', val)}
                    />

                    <div className="full-width">
                      <RichCmsField
                        label="Título Principal (Headline H1)"
                        value={settings.congresso_hero_title || '1º CONGRESSO BRASILEIRO DE MUSCULAÇÃO ELÉTRICA'}
                        onChange={(val) => handleChange('congresso_hero_title', val)}
                        showPreviewDefault={true}
                      />
                    </div>

                    <div className="full-width">
                      <RichCmsField
                        label="Subtítulo (Proposta de Valor)"
                        value={settings.congresso_hero_subtitle || 'Um dia para transformar conhecimento em prática, ampliar sua visão profissional e descobrir como a musculação elétrica está criando novas oportunidades nas áreas da saúde, estética, performance e negócios.'}
                        onChange={(val) => handleChange('congresso_hero_subtitle', val)}
                        multiline={true}
                        rows={3}
                        showPreviewDefault={true}
                      />
                    </div>

                    <RichCmsField
                      label="Data do Evento (Texto)"
                      value={settings.congresso_date_text || 'Tenha acesso a conteúdos relevantes, demonstrações,'}
                      onChange={(val) => handleChange('congresso_date_text', val)}
                      activeBadge={
                        <label style={{ fontSize: '0.72rem', color: settings.congresso_hero_infoblock_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={settings.congresso_hero_infoblock_active !== 0 && settings.congresso_hero_infoblock_active !== '0' && settings.congresso_hero_infoblock_active !== false}
                            onChange={(e) => handleChange('congresso_hero_infoblock_active', e.target.checked ? 1 : 0)}
                          /> {settings.congresso_hero_infoblock_active !== 0 ? '✓ Card Ativo' : 'Oculto'}
                        </label>
                      }
                    />

                    <RichCmsField
                      label="Local do Evento (Endereço Principal)"
                      value={settings.congresso_location_title || 'tecnologias, marcas, profissionais de referência'}
                      onChange={(val) => handleChange('congresso_location_title', val)}
                    />

                    <RichCmsField
                      label="Detalhes de Acesso / Metrô / Horário"
                      value={settings.congresso_location_sub || 'Conexões que podem impulsionar seus próximos resultados.'}
                      onChange={(val) => handleChange('congresso_location_sub', val)}
                    />

                    <RichCmsField
                      label="Texto do Botão CTA do Hero"
                      value={settings.congresso_hero_cta || 'QUERO GARANTIR MEU INGRESSO'}
                      onChange={(val) => handleChange('congresso_hero_cta', val)}
                    />

                    {/* Slot de Fotos / Carrossel do Hero */}
                    <div className="full-width" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                          📸 Foto / Carrossel em Destaque no Topo (Hero)
                        </h4>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                          Adicione 1 foto ou um carrossel dinâmico (até 7 fotos) logo abaixo do botão de inscrição
                        </p>
                      </div>

                      <label 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.4rem', 
                          background: '#0A3E60', 
                          color: '#FFFFFF', 
                          padding: '0.45rem 0.9rem', 
                          borderRadius: '8px', 
                          fontSize: '0.8rem', 
                          fontWeight: 700, 
                          cursor: 'pointer' 
                        }}
                      >
                        <Camera size={15} /> {uploadingGallery ? 'Enviando...' : 'Adicionar Foto'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          disabled={uploadingGallery}
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setUploadingGallery(true);
                            try {
                              const res = await (shopApi.uploadCongressoPhoto || shopApi.uploadCongressGalleryImage || shopApi.uploadCongressGallery)(file);
                              const uploadedUrl = res?.url || res?.data?.url;
                              if (uploadedUrl) {
                                let current = [];
                                try {
                                  current = settings.congresso_hero_photos_json ? JSON.parse(settings.congresso_hero_photos_json) : [];
                                } catch (_) { current = []; }
                                if (current.length >= 7) {
                                  alert('Limite máximo de 7 fotos atingido para o Hero.');
                                  return;
                                }
                                const updated = [...current, { url: uploadedUrl, caption: '' }];
                                handleChange('congresso_hero_photos_json', JSON.stringify(updated));
                              } else {
                                alert('Erro: Não foi possível obter a URL da foto enviada.');
                              }
                            } catch (err) {
                              alert('Erro ao enviar imagem: ' + (err.response?.data?.message || err.message));
                            } finally {
                              setUploadingGallery(false);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                      <FormGroup>
                        <label>Tamanho / Largura no Hero</label>
                        <Select
                          value={settings.congresso_hero_photo_size || '700px'}
                          onChange={(e) => handleChange('congresso_hero_photo_size', e.target.value)}
                        >
                          <option value="400px">Pequeno (400px)</option>
                          <option value="550px">Médio (550px)</option>
                          <option value="700px">Grande Destaque (700px) [Padrão]</option>
                          <option value="900px">Muito Grande (900px)</option>
                          <option value="100%">100% Largura Total</option>
                        </Select>
                      </FormGroup>

                      <FormGroup>
                        <label>Acabamento de Borda</label>
                        <Select
                          value={settings.congresso_hero_photo_border || 'gold-border'}
                          onChange={(e) => handleChange('congresso_hero_photo_border', e.target.value)}
                        >
                          <option value="gold-border">🏆 Dourada Fina Clássica (#ED7E13)</option>
                          <option value="gold-glow">✨ Dourada Neon Glow (Halo)</option>
                          <option value="minimal">Minimalista</option>
                          <option value="none">Sem Borda</option>
                        </Select>
                      </FormGroup>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                      {(() => {
                        let photos = [];
                        try {
                          photos = settings.congresso_hero_photos_json ? JSON.parse(settings.congresso_hero_photos_json) : [];
                        } catch (_) {}

                        if (!photos.length) {
                          return (
                            <div style={{ gridColumn: '1 / -1', padding: '1.25rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '10px', color: '#64748B', fontSize: '0.82rem' }}>
                              Nenhuma foto adicionada ao Hero. (Opcional - Se não adicionar, a seção permanece limpa).
                            </div>
                          );
                        }

                        return photos.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1', background: '#FFFFFF', padding: '4px' }}>
                            <img src={img.url} alt={`Hero Foto ${idx + 1}`} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px' }} />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = photos.filter((_, i) => i !== idx);
                                handleChange('congresso_hero_photos_json', JSON.stringify(updated));
                              }}
                              style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.9)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              title="Remover foto"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </FieldsGrid>
              </>
            ) : (
                <FieldsGrid>
                  <FormGroup>
                    <label>Alinhamento do Card de Data/Local</label>
                    <AlignButtonGroup>
                      <AlignBtn
                        type="button"
                        $active={settings.congresso_hero_infoblock_align === 'left'}
                        onClick={() => handleChange('congresso_hero_infoblock_align', 'left')}
                      >
                        <AlignLeft size={14} /> Esquerda
                      </AlignBtn>
                      <AlignBtn
                        type="button"
                        $active={!settings.congresso_hero_infoblock_align || settings.congresso_hero_infoblock_align === 'center'}
                        onClick={() => handleChange('congresso_hero_infoblock_align', 'center')}
                      >
                        <AlignCenter size={14} /> Centro
                      </AlignBtn>
                      <AlignBtn
                        type="button"
                        $active={settings.congresso_hero_infoblock_align === 'right'}
                        onClick={() => handleChange('congresso_hero_infoblock_align', 'right')}
                      >
                        <AlignRight size={14} /> Direita
                      </AlignBtn>
                    </AlignButtonGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>Cor de Fundo do Card de Informações</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={settings.congresso_hero_card_bg || '#0E1318'}
                        onChange={(e) => handleChange('congresso_hero_card_bg', e.target.value)}
                        style={{ width: '42px', height: '42px', borderRadius: '8px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                      />
                      <Input
                        type="text"
                        value={settings.congresso_hero_card_bg || '#0E1318'}
                        onChange={(e) => handleChange('congresso_hero_card_bg', e.target.value)}
                      />
                    </div>
                  </FormGroup>
                </FieldsGrid>
              )}
            </ContentCard>
          )}

          {/* PAINEL 2: SOBRE O CONGRESSO & PALESTRANTES */}
          {activeSectionId === 'sobre' && (
            <ContentCard>
              {sectionSubTab === 'content' ? (
                <>
                  <SectionLayoutControl
                    sectionName="Sobre o Congresso"
                    align={settings.congresso_sobre_align || 'center'}
                    onAlignChange={(val) => handleChange('congresso_sobre_align', val)}
                    photoPosition={settings.congresso_sobre_photo_position || 'bottom'}
                    onPhotoPositionChange={(val) => handleChange('congresso_sobre_photo_position', val)}
                    onResetSection={() => {
                      handleChange('congresso_sobre_label', 'Autoridade & Ciência');
                      handleChange('congresso_sobre_title', 'Quem Vai Estar no Palco Com Você');
                      handleChange('congresso_sobre_intro', 'O Congresso de Musculação Elétrica foi criado para profissionais que não querem apenas acompanhar a evolução do setor, mas desejam entender, aplicar e aproveitar as oportunidades que esse mercado oferece.');
                      handleChange('congresso_sobre_quote', 'Enquanto muitos ainda estão tentando entender o futuro do setor, você pode estar no ambiente onde essas transformações já estão acontecendo.');
                      handleChange('congresso_publico_alvo_title', 'SE VOCÊ TRABALHA COM RESULTADOS, PERFORMANCE OU TRANSFORMAÇÃO, ESTE EVENTO FOI FEITO PARA VOCÊ.');
                      handleChange('congresso_publico_alvo_quote', 'Você não precisa ter um nível específico de experiência. Precisa apenas estar disposto a aprender, se atualizar e enxergar novas oportunidades antes que elas se tornem comuns.');
                      handleChange('congresso_sobre_align', 'center');
                      handleChange('congresso_sobre_photo_position', 'bottom');
                    }}
                  />

                  <FieldsGrid>
                    <RichCmsField
                      label="Tag / Label Superior"
                      value={settings.congresso_sobre_label || 'Autoridade & Ciência'}
                      onChange={(val) => handleChange('congresso_sobre_label', val)}
                    />

                    <RichCmsField
                      label="Título da Seção"
                      value={settings.congresso_sobre_title || 'Quem Vai Estar no Palco Com Você'}
                      onChange={(val) => handleChange('congresso_sobre_title', val)}
                      showPreviewDefault={true}
                    />

                    <div className="full-width">
                      <RichCmsField
                        label="Texto de Introdução / Apresentação"
                        value={settings.congresso_sobre_intro || 'O Congresso de Musculação Elétrica foi criado para profissionais que não querem apenas acompanhar a evolução do setor, mas desejam entender, aplicar e aproveitar as oportunidades que esse mercado oferece.'}
                        onChange={(val) => handleChange('congresso_sobre_intro', val)}
                        multiline={true}
                        rows={3}
                        showPreviewDefault={true}
                      />
                    </div>

                    <div className="full-width">
                      <RichCmsField
                        label="Citação de Impacto em Destaque (Frase Forte)"
                        value={settings.congresso_sobre_quote || 'Enquanto muitos ainda estão tentando entender o futuro do setor, você pode estar no ambiente onde essas transformações já estão acontecendo.'}
                        onChange={(val) => handleChange('congresso_sobre_quote', val)}
                        showPreviewDefault={true}
                      />
                    </div>

                    <div className="full-width">
                      <RichCmsField
                        label="Título da Seção 'Para Quem É?' (Público-Alvo)"
                        value={settings.congresso_publico_alvo_title || 'SE VOCÊ TRABALHA COM RESULTADOS, PERFORMANCE OU TRANSFORMAÇÃO, ESTE EVENTO FOI FEITO PARA VOCÊ.'}
                        onChange={(val) => handleChange('congresso_publico_alvo_title', val)}
                        showPreviewDefault={true}
                      />
                    </div>

                    <div className="full-width">
                      <RichCmsField
                        label="Frase de Fechamento do Público-Alvo"
                        value={settings.congresso_publico_alvo_quote || 'Você não precisa ter um nível específico de experiência. Precisa apenas estar disposto a aprender, se atualizar e enxergar novas oportunidades antes que elas se tornem comuns.'}
                        onChange={(val) => handleChange('congresso_publico_alvo_quote', val)}
                        multiline={true}
                        rows={2}
                      />
                    </div>

                  <FormGroup className="full-width">
                    <label>Frase de Destravamento / Fechamento do Público-Alvo</label>
                    <Textarea
                      rows={2}
                      value={settings.congresso_publico_alvo_quote || 'Você não precisa ter um nível específico de experiência. Precisa apenas estar disposto a aprender, se atualizar e enxergar novas oportunidades antes que elas se tornem comuns.'}
                      onChange={(e) => handleChange('congresso_publico_alvo_quote', e.target.value)}
                    />
                  </FormGroup>

                  {/* Gerenciador de Palestrantes */}
                  <div className="full-width" style={{ marginTop: '1rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0A3E60' }}>
                        Palestrantes Cadastrados
                      </h4>
                      <GhostActionBtn
                        type="button"
                        onClick={() => {
                          let list = [];
                          try { list = JSON.parse(settings.congresso_palestrantes_json || '[]'); } catch (_) {}
                          const newList = [...list, { name: 'Novo Palestrante', role: 'Especialista', bio: 'Biografia...', photo: '' }];
                          handleChange('congresso_palestrantes_json', JSON.stringify(newList));
                        }}
                        style={{ color: '#0A3E60', borderColor: '#CBD5E1', background: '#F8FAFC' }}
                      >
                        <Plus size={16} /> Adicionar Palestrante
                      </GhostActionBtn>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {(() => {
                        let list = [];
                        try {
                          list = JSON.parse(settings.congresso_palestrantes_json || '[]');
                        } catch (_) {
                          list = [
                            { name: 'Joselene Silva', role: 'Fundadora Body Harmony', bio: 'Pioneira no método de eletroestimulação muscular integrativa.', photo: '' },
                            { name: 'Kaprice Mendes', role: 'Diretora Científica', bio: 'Fisioterapeuta dermatofuncional com mais de 10 anos de prática.', photo: '' }
                          ];
                        }
                        return list.map((item, idx) => (
                          <div 
                            key={idx}
                            style={{ 
                              background: '#F8FAFC', 
                              border: '1px solid #E2E8F0', 
                              borderRadius: '12px', 
                              padding: '1rem', 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                              gap: '0.75rem',
                              position: 'relative'
                            }}
                          >
                            <FormGroup>
                              <label>Nome do Palestrante</label>
                              <Input
                                type="text"
                                value={item.name}
                                onChange={(e) => {
                                  const updated = [...list];
                                  updated[idx].name = e.target.value;
                                  handleChange('congresso_palestrantes_json', JSON.stringify(updated));
                                }}
                              />
                            </FormGroup>

                            <FormGroup>
                              <label>Cargo / Especialidade</label>
                              <Input
                                type="text"
                                value={item.role}
                                onChange={(e) => {
                                  const updated = [...list];
                                  updated[idx].role = e.target.value;
                                  handleChange('congresso_palestrantes_json', JSON.stringify(updated));
                                }}
                              />
                            </FormGroup>

                            <FormGroup className="full-width">
                              <label>Bio / Descrição</label>
                              <Textarea
                                rows={2}
                                value={item.bio}
                                onChange={(e) => {
                                  const updated = [...list];
                                  updated[idx].bio = e.target.value;
                                  handleChange('congresso_palestrantes_json', JSON.stringify(updated));
                                }}
                              />
                            </FormGroup>

                            <div className="full-width" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = list.filter((_, i) => i !== idx);
                                  handleChange('congresso_palestrantes_json', JSON.stringify(updated));
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={14} /> Excluir Palestrante
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Editor da Lista de Benefícios do Congresso */}
                    <div className="full-width" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                            ✨ Lista de Benefícios do Congresso (O Que Você Leva)
                          </h4>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                            Edite os tópicos com checks que aparecem ao lado dos palestrantes
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            let list = [];
                            try {
                              list = settings.congresso_sobre_beneficios_json ? JSON.parse(settings.congresso_sobre_beneficios_json) : [
                                'Palestras técnicas e científicas sobre EMS com base clínica e prática',
                                'Cases reais de licenciadas Body Harmony que transformaram suas carreiras',
                                'Estratégias de negócio para crescer no mercado fitness de alta performance',
                                'Networking exclusivo com os maiores nomes do setor',
                                'A visão de futuro da musculação elétrica para os próximos 5 anos no Brasil',
                                'Certificado de participação oficial reconhecido pelo mercado'
                              ];
                            } catch (e) { list = []; }
                            const updated = [...list, 'Novo benefício do congresso...'];
                            handleChange('congresso_sobre_beneficios_json', JSON.stringify(updated));
                          }}
                          style={{
                            background: '#0A3E60',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.5rem 0.9rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <Plus size={15} /> Adicionar Benefício
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(() => {
                          let list = [];
                          try {
                            list = settings.congresso_sobre_beneficios_json ? JSON.parse(settings.congresso_sobre_beneficios_json) : [
                              'Palestras técnicas e científicas sobre EMS com base clínica e prática',
                              'Cases reais de licenciadas Body Harmony que transformaram suas carreiras',
                              'Estratégias de negócio para crescer no mercado fitness de alta performance',
                              'Networking exclusivo com os maiores nomes do setor',
                              'A visão de futuro da musculação elétrica para os próximos 5 anos no Brasil',
                              'Certificado de participação oficial reconhecido pelo mercado'
                            ];
                          } catch (e) {
                            list = [];
                          }

                          return list.map((ben, idx) => {
                            const isObj = typeof ben === 'object' && ben !== null;
                            const text = isObj ? (ben.text || '') : String(ben);
                            const icon = isObj ? ben.icon : '';
                            const emoji = isObj ? ben.emoji : '';

                            return (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  background: '#F8FAFC',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '8px',
                                  padding: '0.4rem 0.75rem'
                                }}
                              >
                                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0A3E60' }}>#{idx + 1}</span>
                                
                                <ItemIconEmojiPicker
                                  icon={icon}
                                  emoji={emoji}
                                  onChangeIcon={(newIcon) => {
                                    const updated = [...list];
                                    updated[idx] = { text, icon: newIcon, emoji: '' };
                                    handleChange('congresso_sobre_beneficios_json', JSON.stringify(updated));
                                  }}
                                  onChangeEmoji={(newEmoji) => {
                                    const updated = [...list];
                                    updated[idx] = { text, icon: '', emoji: newEmoji };
                                    handleChange('congresso_sobre_beneficios_json', JSON.stringify(updated));
                                  }}
                                />

                                <Input
                                  type="text"
                                  value={text}
                                  onChange={(e) => {
                                    const updated = [...list];
                                    if (isObj) {
                                      updated[idx] = { ...ben, text: e.target.value };
                                    } else {
                                      updated[idx] = e.target.value;
                                    }
                                    handleChange('congresso_sobre_beneficios_json', JSON.stringify(updated));
                                  }}
                                  style={{ flex: 1 }}
                                  placeholder="Descrição do benefício..."
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = list.filter((_, i) => i !== idx);
                                    handleChange('congresso_sobre_beneficios_json', JSON.stringify(updated));
                                  }}
                                  style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.4rem' }}
                                  title="Excluir benefício"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Editor de Chips/Profissões do Público-Alvo (PLAN-196) */}
                    <div className="full-width" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                            🎯 Chips de Profissões / Público-Alvo
                          </h4>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                            Edite as tags que aparecem no bloco "Para Quem É?"
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            let list = [];
                            try {
                              list = settings.congresso_publico_alvo_json ? JSON.parse(settings.congresso_publico_alvo_json) : [
                                'Fisioterapeutas', 'Profissionais de Ed. Física', 'Profissionais de Estética', 'Biomédicos', 'Área da Saúde',
                                'Personal Trainers', 'Profissionais de Performance', 'Empresários & Gestores', 'Usuários de EMS', 'Novos Empreendedores'
                              ];
                            } catch (e) { list = []; }
                            const updated = [...list, 'Nova Área...'];
                            handleChange('congresso_publico_alvo_json', JSON.stringify(updated));
                          }}
                          style={{
                            background: '#0A3E60',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.5rem 0.9rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <Plus size={15} /> Adicionar Profissão
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                        {(() => {
                          let list = [];
                          try {
                            list = settings.congresso_publico_alvo_json ? JSON.parse(settings.congresso_publico_alvo_json) : [
                              'Fisioterapeutas', 'Profissionais de Ed. Física', 'Profissionais de Estética', 'Biomédicos', 'Área da Saúde',
                              'Personal Trainers', 'Profissionais de Performance', 'Empresários & Gestores', 'Usuários de EMS', 'Novos Empreendedores'
                            ];
                          } catch (e) { list = []; }

                          return list.map((pub, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                background: '#F8FAFC',
                                border: '1px solid #CBD5E1',
                                borderRadius: '8px',
                                padding: '0.35rem 0.6rem'
                              }}
                            >
                              <Input
                                type="text"
                                value={pub}
                                onChange={(e) => {
                                  const updated = [...list];
                                  updated[idx] = e.target.value;
                                  handleChange('congresso_publico_alvo_json', JSON.stringify(updated));
                                }}
                                style={{ flex: 1, fontSize: '0.82rem', padding: '0.35rem 0.5rem' }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = list.filter((_, i) => i !== idx);
                                  handleChange('congresso_publico_alvo_json', JSON.stringify(updated));
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.2rem' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Editor das 4 Grandes Atrações do Congresso (PLAN-196) */}
                    <div className="full-width" style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '2px solid #E2E8F0' }}>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 900, color: '#0A3E60' }}>
                        ⚡ As 4 Grandes Atrações do Congresso
                      </h4>
                      <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: '#64748B' }}>
                        Personalize os títulos, badges e textos dos 4 cards de destaque do evento
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                        {/* ATRAÇÃO 1: TALKS */}
                        <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1rem' }}>
                          <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 800, color: '#0A3E60' }}>
                            🎙️ Card 1: Talks de Alto Nível
                          </h5>
                          <FormGroup style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem' }}>Badge Superior</label>
                            <Input
                              type="text"
                              value={settings.congresso_talks_badge || '🎙️ TALKS DE ALTO NÍVEL'}
                              onChange={(e) => handleChange('congresso_talks_badge', e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem' }}>Título do Card</label>
                            <Input
                              type="text"
                              value={settings.congresso_talks_title || 'Conhecimento para Aplicar, Decidir e Crescer'}
                              onChange={(e) => handleChange('congresso_talks_title', e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem' }}>Descrição</label>
                            <Textarea
                              rows={2}
                              value={settings.congresso_talks_desc || 'Palestras e painéis além da teoria para você tomar decisões seguras e identificar caminhos reais de crescimento.'}
                              onChange={(e) => handleChange('congresso_talks_desc', e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup>
                            <label style={{ fontSize: '0.75rem' }}>Tags (separadas por vírgula)</label>
                            <Input
                              type="text"
                              value={settings.congresso_talks_tags || 'Ciência, Estética, Performance, Tecnologia, Mercado, Negócios'}
                              onChange={(e) => handleChange('congresso_talks_tags', e.target.value)}
                            />
                          </FormGroup>
                        </div>

                        {/* ATRAÇÃO 2: DEMOS AO VIVO */}
                        <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1rem' }}>
                          <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 800, color: '#0A3E60' }}>
                            ⚡ Card 2: Demonstrações Práticas
                          </h5>
                          <FormGroup style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem' }}>Badge Superior</label>
                            <Input
                              type="text"
                              value={settings.congresso_demos_badge || '⚡ DEMOS AO VIVO'}
                              onChange={(e) => handleChange('congresso_demos_badge', e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem' }}>Título do Card</label>
                            <Input
                              type="text"
                              value={settings.congresso_demos_title || 'Veja, Compare e Entenda na Prática'}
                              onChange={(e) => handleChange('congresso_demos_title', e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup>
                            <label style={{ fontSize: '0.75rem' }}>Descrição</label>
                            <Textarea
                              rows={3}
                              value={settings.congresso_demos_desc || 'Acompanhe demonstrações práticas, conheça equipamentos de ponta e entenda a musculação elétrica aplicada em saúde e estética.'}
                              onChange={(e) => handleChange('congresso_demos_desc', e.target.value)}
                            />
                          </FormGroup>
                        </div>

                        {/* ATRAÇÃO 3: COMPETIÇÃO DE ATLETAS */}
                        <div style={{ background: '#FFFBEB', border: '1px solid #F59E0B', borderRadius: '12px', padding: '1rem' }}>
                          <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 800, color: '#B45309' }}>
                            🏆 Card 3: Competição de Atletas com EMS
                          </h5>
                          <FormGroup style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem' }}>Badge Superior</label>
                            <Input
                              type="text"
                              value={settings.congresso_competicao_badge || '🏆 ATRAÇÃO INÉDITA NO BRASIL'}
                              onChange={(e) => handleChange('congresso_competicao_badge', e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem' }}>Título do Card</label>
                            <Input
                              type="text"
                              value={settings.congresso_competicao_title || 'Competição de Atletas com EMS'}
                              onChange={(e) => handleChange('congresso_competicao_title', e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup>
                            <label style={{ fontSize: '0.75rem' }}>Descrição</label>
                            <Textarea
                              rows={3}
                              value={settings.congresso_competicao_desc || 'Atletas preparadas com musculação elétrica subirão ao palco para avaliação ao vivo pelo corpo de jurados. Uma experiência exclusiva no país!'}
                              onChange={(e) => handleChange('congresso_competicao_desc', e.target.value)}
                            />
                          </FormGroup>
                        </div>

                        {/* ATRAÇÃO 4: EXPOSITORES & NETWORKING */}
                        <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1rem' }}>
                          <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 800, color: '#0A3E60' }}>
                            🤝 Card 4: Expositores & Networking
                          </h5>
                          <FormGroup style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem' }}>Badge Superior</label>
                            <Input
                              type="text"
                              value={settings.congresso_expositores_badge || '🤝 EXPOSITORES & NETWORKING'}
                              onChange={(e) => handleChange('congresso_expositores_badge', e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem' }}>Título do Card</label>
                            <Input
                              type="text"
                              value={settings.congresso_expositores_title || 'Conexões que Geram Negócios'}
                              onChange={(e) => handleChange('congresso_expositores_title', e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup>
                            <label style={{ fontSize: '0.75rem' }}>Descrição</label>
                            <Textarea
                              rows={3}
                              value={settings.congresso_expositores_desc || 'Converse diretamente com marcas e fornecedores, tire dúvidas e encontre parceiros estratégicos para impulsionar sua operação.'}
                              onChange={(e) => handleChange('congresso_expositores_desc', e.target.value)}
                            />
                          </FormGroup>
                        </div>
                      </div>
                    </div>

                    {/* Slot de Fotos / Carrossel da Seção Sobre */}
                    <div className="full-width" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                            📸 Foto / Carrossel da Seção Sobre (Abaixo dos Palestrantes)
                          </h4>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                            Adicione 1 foto ou um carrossel dinâmico (até 7 fotos) de apoio para a seção Sobre
                          </p>
                        </div>

                        <label 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.4rem', 
                            background: '#0A3E60', 
                            color: '#FFFFFF', 
                            padding: '0.45rem 0.9rem', 
                            borderRadius: '8px', 
                            fontSize: '0.8rem', 
                            fontWeight: 700, 
                            cursor: 'pointer' 
                          }}
                        >
                          <Camera size={15} /> {uploadingGallery ? 'Enviando...' : 'Adicionar Foto'}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            disabled={uploadingGallery}
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              setUploadingGallery(true);
                              try {
                                const res = await (shopApi.uploadCongressoPhoto || shopApi.uploadCongressGalleryImage || shopApi.uploadCongressGallery)(file);
                                const uploadedUrl = res?.url || res?.data?.url;
                                if (uploadedUrl) {
                                  let current = [];
                                  try {
                                    current = settings.congresso_sobre_photos_json ? JSON.parse(settings.congresso_sobre_photos_json) : [];
                                  } catch (_) { current = []; }
                                  if (current.length >= 7) {
                                    alert('Limite máximo de 7 fotos atingido para a Seção Sobre.');
                                    return;
                                  }
                                  const updated = [...current, { url: uploadedUrl, caption: '' }];
                                  handleChange('congresso_sobre_photos_json', JSON.stringify(updated));
                                } else {
                                  alert('Erro: Não foi possível obter a URL da foto enviada.');
                                }
                              } catch (err) {
                                alert('Erro ao enviar imagem: ' + (err.response?.data?.message || err.message));
                              } finally {
                                setUploadingGallery(false);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                        <FormGroup>
                          <label>Tamanho / Largura da Foto</label>
                          <Select
                            value={settings.congresso_sobre_photo_size || '750px'}
                            onChange={(e) => handleChange('congresso_sobre_photo_size', e.target.value)}
                          >
                            <option value="450px">Pequeno (450px)</option>
                            <option value="600px">Médio (600px)</option>
                            <option value="750px">Grande Destaque (750px) [Padrão]</option>
                            <option value="950px">Muito Grande (950px)</option>
                            <option value="100%">100% Largura Total</option>
                          </Select>
                        </FormGroup>

                        <FormGroup>
                          <label>Acabamento de Borda</label>
                          <Select
                            value={settings.congresso_sobre_photo_border || 'gold-border'}
                            onChange={(e) => handleChange('congresso_sobre_photo_border', e.target.value)}
                          >
                            <option value="gold-border">🏆 Dourada Fina Clássica (#ED7E13)</option>
                            <option value="gold-glow">✨ Dourada Neon Glow (Halo)</option>
                            <option value="minimal">Minimalista</option>
                            <option value="none">Sem Borda</option>
                          </Select>
                        </FormGroup>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                        {(() => {
                          let photos = [];
                          try {
                            photos = settings.congresso_sobre_photos_json ? JSON.parse(settings.congresso_sobre_photos_json) : [];
                          } catch (_) {}

                          if (!photos.length) {
                            return (
                              <div style={{ gridColumn: '1 / -1', padding: '1.25rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '10px', color: '#64748B', fontSize: '0.82rem' }}>
                                Nenhuma foto adicionada à seção Sobre. (Opcional).
                              </div>
                            );
                          }

                          return photos.map((img, idx) => (
                            <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1', background: '#FFFFFF', padding: '4px' }}>
                              <img src={img.url} alt={`Sobre Foto ${idx + 1}`} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px' }} />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = photos.filter((_, i) => i !== idx);
                                  handleChange('congresso_sobre_photos_json', JSON.stringify(updated));
                                }}
                                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.9)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                title="Remover foto"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </FieldsGrid>
              </>
            ) : (
                <FieldsGrid>
                  <FormGroup>
                    <label>Layout de Exibição dos Palestrantes</label>
                    <Select
                      value={settings.congresso_palestrante_layout || 'cards'}
                      onChange={(e) => handleChange('congresso_palestrante_layout', e.target.value)}
                    >
                      <option value="cards">Grade de Cartões Luxury</option>
                      <option value="side-by-side">Lado a Lado (Destaque)</option>
                      <option value="minimal">Minimalista (Compacto)</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <label>Tamanho do Avatar / Foto</label>
                    <Select
                      value={settings.congresso_avatar_size || 'medium'}
                      onChange={(e) => handleChange('congresso_avatar_size', e.target.value)}
                    >
                      <option value="small">Pequeno (64px)</option>
                      <option value="medium">Médio (96px) [Padrão]</option>
                      <option value="large">Grande (128px)</option>
                    </Select>
                  </FormGroup>
                </FieldsGrid>
              )}
            </ContentCard>
          )}

          {/* PAINEL 3: OFERTA & LOTES VIGENTES */}
          {activeSectionId === 'oferta' && (
            <ContentCard>
              {sectionSubTab === 'content' ? (
                <>
                  <SectionLayoutControl
                    sectionName="Oferta Experience"
                    align={settings.congresso_oferta_align || 'center'}
                    onAlignChange={(val) => handleChange('congresso_oferta_align', val)}
                    ctaPreset={settings.congresso_experience_cta_preset || 'shader_gold'}
                    onCtaPresetChange={(val) => handleChange('congresso_experience_cta_preset', val)}
                    onResetSection={() => {
                      handleChange('congresso_oferta_align', 'center');
                      handleChange('congresso_experience_cta_preset', 'shader_gold');
                    }}
                  />

                  <FieldsGrid>
                  <FormGroup>
                    <label>Badge de Destaque da Oferta</label>
                    <Input
                      type="text"
                      value={settings.congresso_oferta_badge || '1º Lote de Lançamento · Vagas Limitadas'}
                      onChange={(e) => handleChange('congresso_oferta_badge', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Título da Oferta</label>
                    <Input
                      type="text"
                      value={settings.congresso_oferta_title || 'Garanta Seu Acesso no 1º Lote com a Melhor Condição do Ano'}
                      onChange={(e) => handleChange('congresso_oferta_title', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup className="full-width">
                    <label>Texto Descritivo da Oferta</label>
                    <Textarea
                      rows={3}
                      value={settings.congresso_oferta_copy || 'Aproveite os valores de abertura para o Congresso Brasileiro de Musculação Elétrica. No Ingresso Experience você garante a melhor opção de custo-benefício para aprendizado e networking, e no VIP você garante 100% de crédito integral para a franquia.'}
                      onChange={(e) => handleChange('congresso_oferta_copy', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Texto do Botão CTA</label>
                    <Input
                      type="text"
                      value={settings.congresso_oferta_cta || 'Garantir Ingresso no 1º Lote'}
                      onChange={(e) => handleChange('congresso_oferta_cta', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Nota de Rodapé / Aviso de Vagas</label>
                    <Input
                      type="text"
                      value={settings.congresso_oferta_note || 'Parcelamento em até 12x no cartão. Virada de lote sujeita à capacidade do auditório.'}
                      onChange={(e) => handleChange('congresso_oferta_note', e.target.value)}
                    />
                  </FormGroup>
                </FieldsGrid>
                </>
              ) : (
                <FieldsGrid>
                  <FormGroup>
                    <label>Alinhamento do Card de Oferta</label>
                    <AlignButtonGroup>
                      <AlignBtn
                        type="button"
                        $active={settings.congresso_passaporte_align === 'left'}
                        onClick={() => handleChange('congresso_passaporte_align', 'left')}
                      >
                        <AlignLeft size={14} /> Esquerda
                      </AlignBtn>
                      <AlignBtn
                        type="button"
                        $active={!settings.congresso_passaporte_align || settings.congresso_passaporte_align === 'center'}
                        onClick={() => handleChange('congresso_passaporte_align', 'center')}
                      >
                        <AlignCenter size={14} /> Centro
                      </AlignBtn>
                      <AlignBtn
                        type="button"
                        $active={settings.congresso_passaporte_align === 'right'}
                        onClick={() => handleChange('congresso_passaporte_align', 'right')}
                      >
                        <AlignRight size={14} /> Direita
                      </AlignBtn>
                    </AlignButtonGroup>
                  </FormGroup>
                </FieldsGrid>
              )}
            </ContentCard>
          )}

          {/* PAINEL 4: ÁREA VIP EXCLUSIVE */}
          {activeSectionId === 'vip' && (
            <ContentCard>
              {sectionSubTab === 'content' ? (
                <>
                  <SectionLayoutControl
                    sectionName="Área VIP Exclusive"
                    align={settings.congresso_vip_align || 'center'}
                    onAlignChange={(val) => handleChange('congresso_vip_align', val)}
                    ctaPreset={settings.congresso_vip_cta_preset || 'shader_gold'}
                    onCtaPresetChange={(val) => handleChange('congresso_vip_cta_preset', val)}
                    onResetSection={() => {
                      handleChange('congresso_vip_align', 'center');
                      handleChange('congresso_vip_cta_preset', 'shader_gold');
                    }}
                  />

                  <FieldsGrid>
                  <FormGroup>
                    <label>Badge Superior VIP</label>
                    <Input
                      type="text"
                      value={settings.congresso_vip_badge || '👑 EXPERIÊNCIA VIP EXCLUSIVE · APENAS 40 VAGAS'}
                      onChange={(e) => handleChange('congresso_vip_badge', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Título da Seção VIP</label>
                    <Input
                      type="text"
                      value={settings.congresso_vip_title || 'Acesso Direto aos Bastidores e Mesa de Negócios'}
                      onChange={(e) => handleChange('congresso_vip_title', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup className="full-width">
                    <label>Subtítulo / Proposta de Valor VIP</label>
                    <Textarea
                      rows={2}
                      value={settings.congresso_vip_subtitle || 'Uma experiência de imersão restrita para empresárias que desejam estar na mesa onde as grandes parcerias são fechadas.'}
                      onChange={(e) => handleChange('congresso_vip_subtitle', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Título do Destaque de Crédito</label>
                    <Input
                      type="text"
                      value={settings.congresso_vip_highlight_headline || '🎁 R$ 1.497 DE CRÉDITO INTEGRAL'}
                      onChange={(e) => handleChange('congresso_vip_highlight_headline', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Texto do Botão CTA VIP</label>
                    <Input
                      type="text"
                      value={settings.congresso_vip_cta || 'Garantir Ingresso VIP + Crédito'}
                      onChange={(e) => handleChange('congresso_vip_cta', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup className="full-width">
                    <label>Descrição do Crédito Integral</label>
                    <Textarea
                      rows={2}
                      value={settings.congresso_vip_highlight_copy || '100% do valor do seu ingresso é convertido em desconto direto na sua adesão ao Licenciamento Body Harmony.'}
                      onChange={(e) => handleChange('congresso_vip_highlight_copy', e.target.value)}
                    />
                  </FormGroup>

                  {/* Slot de Fotos / Carrossel da Seção VIP */}
                  <div className="full-width" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                          📸 Foto / Carrossel da Seção VIP (Abaixo dos Benefícios VIP)
                        </h4>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                          Adicione 1 foto ou um carrossel dinâmico (até 7 fotos) de fotos da área VIP ou coquetel
                        </p>
                      </div>

                      <label 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.4rem', 
                          background: '#0A3E60', 
                          color: '#FFFFFF', 
                          padding: '0.45rem 0.9rem', 
                          borderRadius: '8px', 
                          fontSize: '0.8rem', 
                          fontWeight: 700, 
                          cursor: 'pointer' 
                        }}
                      >
                        <Camera size={15} /> {uploadingGallery ? 'Enviando...' : 'Adicionar Foto'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          disabled={uploadingGallery}
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setUploadingGallery(true);
                            try {
                              const res = await (shopApi.uploadCongressoPhoto || shopApi.uploadCongressGalleryImage || shopApi.uploadCongressGallery)(file);
                              const uploadedUrl = res?.url || res?.data?.url;
                              if (uploadedUrl) {
                                let current = [];
                                try {
                                  current = settings.congresso_vip_photos_json ? JSON.parse(settings.congresso_vip_photos_json) : [];
                                } catch (_) { current = []; }
                                if (current.length >= 7) {
                                  alert('Limite máximo de 7 fotos atingido para a Seção VIP.');
                                  return;
                                }
                                const updated = [...current, { url: uploadedUrl, caption: '' }];
                                handleChange('congresso_vip_photos_json', JSON.stringify(updated));
                              } else {
                                alert('Erro: Não foi possível obter a URL da foto enviada.');
                              }
                            } catch (err) {
                              alert('Erro ao enviar imagem: ' + (err.response?.data?.message || err.message));
                            } finally {
                              setUploadingGallery(false);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                      <FormGroup>
                        <label>Tamanho / Largura da Foto</label>
                        <Select
                          value={settings.congresso_vip_photo_size || '800px'}
                          onChange={(e) => handleChange('congresso_vip_photo_size', e.target.value)}
                        >
                          <option value="450px">Pequeno (450px)</option>
                          <option value="650px">Médio (650px)</option>
                          <option value="800px">Grande Destaque (800px) [Padrão]</option>
                          <option value="1000px">Muito Grande (1000px)</option>
                          <option value="100%">100% Largura Total</option>
                        </Select>
                      </FormGroup>

                      <FormGroup>
                        <label>Acabamento de Borda</label>
                        <Select
                          value={settings.congresso_vip_photo_border || 'gold-glow'}
                          onChange={(e) => handleChange('congresso_vip_photo_border', e.target.value)}
                        >
                          <option value="gold-glow">✨ Dourada Neon Glow (Halo)</option>
                          <option value="gold-border">🏆 Dourada Fina Clássica (#ED7E13)</option>
                          <option value="minimal">Minimalista</option>
                          <option value="none">Sem Borda</option>
                        </Select>
                      </FormGroup>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                      {(() => {
                        let photos = [];
                        try {
                          photos = settings.congresso_vip_photos_json ? JSON.parse(settings.congresso_vip_photos_json) : [];
                        } catch (_) {}

                        if (!photos.length) {
                          return (
                            <div style={{ gridColumn: '1 / -1', padding: '1.25rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '10px', color: '#64748B', fontSize: '0.82rem' }}>
                              Nenhuma foto adicionada à seção VIP. (Opcional).
                            </div>
                          );
                        }

                        return photos.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1', background: '#FFFFFF', padding: '4px' }}>
                            <img src={img.url} alt={`VIP Foto ${idx + 1}`} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px' }} />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = photos.filter((_, i) => i !== idx);
                                handleChange('congresso_vip_photos_json', JSON.stringify(updated));
                              }}
                              style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.9)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              title="Remover foto"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </FieldsGrid>
                </>
              ) : (
                <FieldsGrid>
                  <FormGroup>
                    <label>Alinhamento da Seção VIP</label>
                    <AlignButtonGroup>
                      <AlignBtn
                        type="button"
                        $active={settings.congresso_vip_align === 'left'}
                        onClick={() => handleChange('congresso_vip_align', 'left')}
                      >
                        <AlignLeft size={14} /> Esquerda
                      </AlignBtn>
                      <AlignBtn
                        type="button"
                        $active={!settings.congresso_vip_align || settings.congresso_vip_align === 'center'}
                        onClick={() => handleChange('congresso_vip_align', 'center')}
                      >
                        <AlignCenter size={14} /> Centro
                      </AlignBtn>
                      <AlignBtn
                        type="button"
                        $active={settings.congresso_vip_align === 'right'}
                        onClick={() => handleChange('congresso_vip_align', 'right')}
                      >
                        <AlignRight size={14} /> Direita
                      </AlignBtn>
                    </AlignButtonGroup>
                  </FormGroup>
                </FieldsGrid>
              )}
            </ContentCard>
          )}

          {/* PAINEL 5: TABELA & LOTES DE INGRESSOS */}
          {activeSectionId === 'tabela' && (
            <ContentCard>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} />
                <span><strong>Sincronização em Tempo Real:</strong> Os dados de ingressos (preço, tópicos/benefícios, parcelamento e link de pagamento) são lidos diretamente do <strong>Catálogo de Produtos</strong>. Edições feitas lá refletem imediatamente aqui e na Landing Page.</span>
              </div>

              {sectionSubTab === 'content' ? (
                <FieldsGrid>
                  <FormGroup>
                    <label>Tag / Label Superior</label>
                    <Input
                      type="text"
                      value={settings.congresso_tabela_label || 'Ingressos Oficiais'}
                      onChange={(e) => handleChange('congresso_tabela_label', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Título da Seção de Ingressos</label>
                    <Input
                      type="text"
                      value={settings.congresso_tabela_title || 'Escolha o Seu Nível de Experiência'}
                      onChange={(e) => handleChange('congresso_tabela_title', e.target.value)}
                    />
                  </FormGroup>

                  {/* Lote 1: Experience */}
                  {/* Card 1: Experience */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#0A3E60', fontWeight: 800 }}>
                      🎟️ Card 1: Ingresso Experience
                    </h4>
                    <FormGroup style={{ marginBottom: '0.5rem' }}>
                      <label>Nome / Título do Card</label>
                      <Input
                        type="text"
                        value={settings.congresso_experience_title || settings.congresso_lote_experience_name || 'Ingresso Experience'}
                        onChange={(e) => {
                          handleChange('congresso_experience_title', e.target.value);
                          handleChange('congresso_lote_experience_name', e.target.value);
                        }}
                      />
                    </FormGroup>
                    <FormGroup style={{ marginBottom: '0.5rem' }}>
                      <label>Badge Superior (Categoria)</label>
                      <Input
                        type="text"
                        value={settings.congresso_experience_badge || 'Conteúdo & Networking'}
                        onChange={(e) => handleChange('congresso_experience_badge', e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup style={{ marginBottom: '0.5rem' }}>
                      <label>Tag de Destaque / Benefício Principal</label>
                      <Input
                        type="text"
                        value={settings.congresso_experience_perk_badge || 'Melhor opção Custo-Benefício'}
                        onChange={(e) => handleChange('congresso_experience_perk_badge', e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup style={{ marginBottom: '0.5rem' }}>
                      <label>Subtítulo de Posicionamento</label>
                      <Textarea
                        rows={2}
                        value={settings.congresso_lote_experience_subtitle || 'A melhor opção para aprender, fazer contatos e dominar as novidades da musculação elétrica com um investimento acessível.'}
                        onChange={(e) => handleChange('congresso_lote_experience_subtitle', e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>Texto do Botão CTA</label>
                      <Input
                        type="text"
                        value={settings.congresso_experience_cta || 'Garantir Ingresso Experience'}
                        onChange={(e) => handleChange('congresso_experience_cta', e.target.value)}
                      />
                    </FormGroup>
                  </div>

                  {/* Card 2: VIP Exclusive */}
                  <div style={{ background: '#FFFDF9', border: '1px solid rgba(237, 126, 19, 0.4)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#ED7E13', fontWeight: 800 }}>
                      👑 Card 2: Ingresso VIP Exclusive
                    </h4>
                    <FormGroup style={{ marginBottom: '0.5rem' }}>
                      <label>Nome / Título do Card</label>
                      <Input
                        type="text"
                        value={settings.congresso_vip_title || settings.congresso_lote_vip_name || 'Ingresso VIP Exclusive'}
                        onChange={(e) => {
                          handleChange('congresso_vip_title', e.target.value);
                          handleChange('congresso_lote_vip_name', e.target.value);
                        }}
                      />
                    </FormGroup>
                    <FormGroup style={{ marginBottom: '0.5rem' }}>
                      <label>Badge Superior (Exclusividade)</label>
                      <Input
                        type="text"
                        value={settings.congresso_vip_badge || '🔥 MAIS ESCOLHIDO • APENAS 40 VAGAS'}
                        onChange={(e) => handleChange('congresso_vip_badge', e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup style={{ marginBottom: '0.5rem' }}>
                      <label>Tag de Destaque / Crédito Integral</label>
                      <Input
                        type="text"
                        value={settings.congresso_vip_perk_badge || '🎁 R$ 1.497 em Crédito Integral'}
                        onChange={(e) => handleChange('congresso_vip_perk_badge', e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>Texto do Botão CTA</label>
                      <Input
                        type="text"
                        value={settings.congresso_vip_cta || 'Garantir Ingresso VIP + Crédito'}
                        onChange={(e) => handleChange('congresso_vip_cta', e.target.value)}
                      />
                    </FormGroup>
                  </div>

                  {/* Lote centralizado no Cockpit Bento Grid — Sem duplicidade */}
                  <div className="full-width">
                    <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Clock size={20} color="#0284C7" />
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#0A3E60' }}>Lote Ativo & Cronômetro</strong>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                          O lote vigente, preços e cronômetro são gerenciados exclusivamente na aba <strong>Cockpit</strong> (card "Lote Ativo & Cronômetro"). A página pública exibe apenas o lote ativo com o cronômetro de virada.
                        </p>
                      </div>
                    </div>
                  </div>
                </FieldsGrid>
              ) : (
                <FieldsGrid>
                  <FormGroup>
                    <label>Alinhamento dos Títulos da Tabela</label>
                    <AlignButtonGroup>
                      <AlignBtn
                        type="button"
                        $active={settings.congresso_tabela_align === 'left'}
                        onClick={() => handleChange('congresso_tabela_align', 'left')}
                      >
                        <AlignLeft size={14} /> Esquerda
                      </AlignBtn>
                      <AlignBtn
                        type="button"
                        $active={!settings.congresso_tabela_align || settings.congresso_tabela_align === 'center'}
                        onClick={() => handleChange('congresso_tabela_align', 'center')}
                      >
                        <AlignCenter size={14} /> Centro
                      </AlignBtn>
                      <AlignBtn
                        type="button"
                        $active={settings.congresso_tabela_align === 'right'}
                        onClick={() => handleChange('congresso_tabela_align', 'right')}
                      >
                        <AlignRight size={14} /> Direita
                      </AlignBtn>
                    </AlignButtonGroup>
                  </FormGroup>
                </FieldsGrid>
              )}
            </ContentCard>
          )}

          {/* PAINEL 6: ESPAÇO & LOCALIZAÇÃO */}
          {activeSectionId === 'espaco' && (
            <ContentCard>
              {sectionSubTab === 'content' ? (
                <FieldsGrid>
                  <FormGroup>
                    <label>Tag / Label Superior</label>
                    <Input
                      type="text"
                      value={settings.congresso_espaco_label || 'Infraestrutura de Alto Padrão'}
                      onChange={(e) => handleChange('congresso_espaco_label', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Título do Espaço</label>
                    <Input
                      type="text"
                      value={settings.congresso_espaco_title || 'Auditório Full Sales · São Paulo / SP'}
                      onChange={(e) => handleChange('congresso_espaco_title', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup className="full-width">
                    <label>Descrição do Espaço & Conforto</label>
                    <Textarea
                      rows={3}
                      value={settings.congresso_espaco_subtitle || 'Localizado em um dos centros de eventos mais modernos da capital paulista, com fácil acesso ao metrô e aeroportos, mesas com tomadas individuais e climatização total.'}
                      onChange={(e) => handleChange('congresso_espaco_subtitle', e.target.value)}
                    />
                  </FormGroup>

                  {/* Gerenciador de Galeria de Fotos */}
                  <div className="full-width" style={{ marginTop: '1rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0A3E60' }}>
                        Galeria de Fotos do Local
                      </h4>
                      <label 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.4rem', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '8px', 
                          background: '#0A3E60', 
                          color: '#FFFFFF', 
                          fontSize: '0.82rem', 
                          fontWeight: 700, 
                          cursor: 'pointer' 
                        }}
                      >
                        <Camera size={16} /> {uploadingGallery ? 'Enviando...' : 'Adicionar Foto'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          disabled={uploadingGallery}
                          onChange={(e) => handleUploadGallery(e.target.files[0])}
                        />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                      {(() => {
                        let gallery = [];
                        try { gallery = JSON.parse(settings.congresso_espaco_gallery_json || '[]'); } catch (_) {}
                        if (!gallery.length) {
                          return (
                            <div style={{ gridColumn: '1 / -1', padding: '1.5rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '10px', color: '#64748B', fontSize: '0.84rem' }}>
                              Nenhuma foto adicionada à galeria. Clique no botão acima para fazer upload.
                            </div>
                          );
                        }
                        return gallery.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                            <img src={img.url} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = gallery.filter((_, i) => i !== idx);
                                handleChange('congresso_espaco_gallery_json', JSON.stringify(updated));
                              }}
                              style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Editor dos 6 Diferenciais do Espaço Full Sales */}
                    <div className="full-width" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                        🏢 Cards de Diferenciais & Infraestrutura do Local
                      </h4>
                      <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748B' }}>
                        Edite o título e a descrição de cada um dos cards de diferenciais do Espaço Full Sales
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                        {(() => {
                          let difs = [];
                          try {
                            difs = settings.congresso_espaco_diferenciais_json ? JSON.parse(settings.congresso_espaco_diferenciais_json) : [
                              { title: 'Edifício Triplo A', desc: 'Infraestrutura de altíssimo padrão corporativo no centro financeiro de São Paulo.' },
                              { title: 'Plenária com Mesas Prancha', desc: 'Conforto executivo com tomadas embutidas individuais em cada assento para seus dispositivos.' },
                              { title: 'Painel LED de +40m²', desc: 'Imersão visual cinematográfica em cada palestra e demonstração de tecnologia.' },
                              { title: 'A 10 Passos do Metrô/Trem', desc: 'Acesso rápido, pontual e sem preocupações com o trânsito da capital.' },
                              { title: '15 min do Aeroporto de Congonhas', desc: 'Perfeito para participantes de outros estados. Desembarque e chegue em minutos.' },
                              { title: 'Em Frente ao JK Iguatemi', desc: 'O endereço mais nobre e desejado de São Paulo. Estacionamento VIP e alta conveniência.' }
                            ];
                          } catch (e) {
                            difs = [];
                          }

                          return difs.map((dif, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: '10px',
                                padding: '0.85rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                              }}
                            >
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ED7E13', textTransform: 'uppercase' }}>
                                Diferencial #{idx + 1}
                              </div>
                              <Input
                                type="text"
                                placeholder="Título do diferencial..."
                                value={dif.title}
                                onChange={(e) => {
                                  const updated = [...difs];
                                  updated[idx].title = e.target.value;
                                  handleChange('congresso_espaco_diferenciais_json', JSON.stringify(updated));
                                }}
                                style={{ fontWeight: 700 }}
                              />
                              <Textarea
                                rows={2}
                                placeholder="Descrição do diferencial..."
                                value={dif.desc}
                                onChange={(e) => {
                                  const updated = [...difs];
                                  updated[idx].desc = e.target.value;
                                  handleChange('congresso_espaco_diferenciais_json', JSON.stringify(updated));
                                }}
                              />
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </FieldsGrid>
              ) : (
                <FieldsGrid>
                  <FormGroup>
                    <label>Alinhamento dos Textos do Espaço</label>
                    <AlignButtonGroup>
                      <AlignBtn
                        type="button"
                        $active={settings.congresso_espaco_align === 'left'}
                        onClick={() => handleChange('congresso_espaco_align', 'left')}
                      >
                        <AlignLeft size={14} /> Esquerda
                      </AlignBtn>
                      <AlignBtn
                        type="button"
                        $active={!settings.congresso_espaco_align || settings.congresso_espaco_align === 'center'}
                        onClick={() => handleChange('congresso_espaco_align', 'center')}
                      >
                        <AlignCenter size={14} /> Centro
                      </AlignBtn>
                      <AlignBtn
                        type="button"
                        $active={settings.congresso_espaco_align === 'right'}
                        onClick={() => handleChange('congresso_espaco_align', 'right')}
                      >
                        <AlignRight size={14} /> Direita
                      </AlignBtn>
                    </AlignButtonGroup>
                  </FormGroup>
                </FieldsGrid>
              )}
            </ContentCard>
          )}

          {/* PAINEL NOVO: GALERIA DE FOTOS & IMERSÃO */}
          {activeSectionId === 'galeria' && (
            <ContentCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    📸 Seção Independente de Fotos & Carrossel
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                    Ative e personalize uma galeria luxuosa com até 7 fotos e animação Fade In/Out
                  </p>
                </div>
                <ToggleSwitch $active={settings.congresso_galeria_active !== 0 && settings.congresso_galeria_active !== '0' && settings.congresso_galeria_active !== false}>
                  <input
                    type="checkbox"
                    checked={settings.congresso_galeria_active !== 0 && settings.congresso_galeria_active !== '0' && settings.congresso_galeria_active !== false}
                    onChange={(e) => handleChange('congresso_galeria_active', e.target.checked ? 1 : 0)}
                  />
                  {settings.congresso_galeria_active !== 0 && settings.congresso_galeria_active !== '0' && settings.congresso_galeria_active !== false ? <Eye size={15} /> : <EyeOff size={15} />}
                  <span>{settings.congresso_galeria_active !== 0 && settings.congresso_galeria_active !== '0' && settings.congresso_galeria_active !== false ? 'Galeria Ativa' : 'Galeria Oculta'}</span>
                </ToggleSwitch>
              </div>

              <FieldsGrid>
                <FormGroup>
                  <label>Tag / Badge Superior</label>
                  <Input
                    type="text"
                    value={settings.congresso_galeria_badge || 'IMERSÃO & BASTIDORES'}
                    onChange={(e) => handleChange('congresso_galeria_badge', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Título da Seção de Galeria</label>
                  <Input
                    type="text"
                    value={settings.congresso_galeria_title || 'A Atmosfera Exclusiva do Congresso'}
                    onChange={(e) => handleChange('congresso_galeria_title', e.target.value)}
                  />
                </FormGroup>

                <FormGroup className="full-width">
                  <label>Subtítulo / Descrição</label>
                  <Textarea
                    rows={2}
                    value={settings.congresso_galeria_subtitle || 'Momentos de alta performance, networking executivo e tecnologia que transformam a musculação elétrica.'}
                    onChange={(e) => handleChange('congresso_galeria_subtitle', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Largura Máxima da Foto / Carrossel</label>
                  <Select
                    value={settings.congresso_galeria_size || '800px'}
                    onChange={(e) => handleChange('congresso_galeria_size', e.target.value)}
                  >
                    <option value="450px">Pequeno (450px)</option>
                    <option value="650px">Médio (650px)</option>
                    <option value="850px">Grande Destaque (850px) [Padrão]</option>
                    <option value="1100px">Largura Total da Página (1100px)</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <label>Acabamento & Borda Dourada</label>
                  <Select
                    value={settings.congresso_galeria_border || 'gold-glow'}
                    onChange={(e) => handleChange('congresso_galeria_border', e.target.value)}
                  >
                    <option value="gold-glow">✨ Dourada Neon Glow (Efeito Halo)</option>
                    <option value="gold-border">🏆 Dourada Fina Clássica (#ED7E13)</option>
                    <option value="minimal">Minimalista (Borda Fina Translúcida)</option>
                    <option value="none">Sem Borda (Apenas Sombra Suave)</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <label>Alinhamento da Galeria</label>
                  <AlignButtonGroup>
                    <AlignBtn
                      type="button"
                      $active={settings.congresso_galeria_align === 'left'}
                      onClick={() => handleChange('congresso_galeria_align', 'left')}
                    >
                      <AlignLeft size={14} /> Esquerda
                    </AlignBtn>
                    <AlignBtn
                      type="button"
                      $active={!settings.congresso_galeria_align || settings.congresso_galeria_align === 'center'}
                      onClick={() => handleChange('congresso_galeria_align', 'center')}
                    >
                      <AlignCenter size={14} /> Centro
                    </AlignBtn>
                    <AlignBtn
                      type="button"
                      $active={settings.congresso_galeria_align === 'right'}
                      onClick={() => handleChange('congresso_galeria_align', 'right')}
                    >
                      <AlignRight size={14} /> Direita
                    </AlignBtn>
                  </AlignButtonGroup>
                </FormGroup>

                <FormGroup>
                  <label>Espaçamento da Seção</label>
                  <Select
                    value={settings.congresso_galeria_spacing || 'normal'}
                    onChange={(e) => handleChange('congresso_galeria_spacing', e.target.value)}
                  >
                    <option value="compact">Compacto (Menor)</option>
                    <option value="normal">Normal [Padrão]</option>
                    <option value="generous">Generoso (Maior)</option>
                  </Select>
                </FormGroup>

                {/* Upload e Gestor de até 7 fotos */}
                <div className="full-width" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                        🖼️ Fotos da Galeria (Carrossel Dinâmico até 7 Fotos)
                      </h4>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                        Envie imagens do evento. Se enviar 1 foto, será exibida estática; se enviar mais de 1, vira carrossel automático suave.
                      </p>
                    </div>

                    <label 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.4rem', 
                        background: '#0A3E60', 
                        color: '#FFFFFF', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '8px', 
                        fontSize: '0.82rem', 
                        fontWeight: 700, 
                        cursor: 'pointer' 
                      }}
                    >
                      <Camera size={16} /> {uploadingGallery ? 'Enviando...' : 'Adicionar Foto'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={uploadingGallery}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setUploadingGallery(true);
                          try {
                            const res = await (shopApi.uploadCongressoPhoto || shopApi.uploadCongressGalleryImage || shopApi.uploadCongressGallery)(file);
                            const uploadedUrl = res?.url || res?.data?.url;
                            if (uploadedUrl) {
                              let current = [];
                              try {
                                current = settings.congresso_galeria_photos_json ? JSON.parse(settings.congresso_galeria_photos_json) : [];
                              } catch (_) { current = []; }
                              if (current.length >= 7) {
                                alert('Limite máximo de 7 fotos atingido para o carrossel.');
                                return;
                              }
                              const updated = [...current, { url: uploadedUrl, caption: '' }];
                              handleChange('congresso_galeria_photos_json', JSON.stringify(updated));
                            } else {
                              alert('Erro: Não foi possível obter a URL da foto enviada.');
                            }
                          } catch (err) {
                            alert('Erro ao enviar imagem: ' + (err.response?.data?.message || err.message));
                          } finally {
                            setUploadingGallery(false);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    {(() => {
                      let gallery = [];
                      try {
                        gallery = settings.congresso_galeria_photos_json ? JSON.parse(settings.congresso_galeria_photos_json) : [];
                      } catch (_) {}

                      if (!gallery.length) {
                        return (
                          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '10px', color: '#64748B', fontSize: '0.84rem' }}>
                            Nenhuma foto enviada para a Galeria. Clique em <strong>"Adicionar Foto"</strong> acima para carregar até 7 fotos.
                          </div>
                        );
                      }

                      return gallery.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #CBD5E1', background: '#FFFFFF', padding: '6px' }}>
                          <img src={img.url} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px' }} />
                          <div style={{ marginTop: '6px' }}>
                            <Input
                              type="text"
                              placeholder="Legenda (opcional)..."
                              value={img.caption || ''}
                              onChange={(e) => {
                                const updated = [...gallery];
                                updated[idx].caption = e.target.value;
                                handleChange('congresso_galeria_photos_json', JSON.stringify(updated));
                              }}
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = gallery.filter((_, i) => i !== idx);
                              handleChange('congresso_galeria_photos_json', JSON.stringify(updated));
                            }}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Remover foto"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </FieldsGrid>
            </ContentCard>
          )}

          {/* PAINEL: POR QUE PARTICIPAR? (PLAN-197) */}
          {activeSectionId === 'porque' && (
            <ContentCard>
              <FieldsGrid>
                <FormGroup>
                  <label>Tag / Label Superior</label>
                  <Input
                    type="text"
                    value={settings.congresso_por_que_label || 'POR QUE PARTICIPAR?'}
                    onChange={(e) => handleChange('congresso_por_que_label', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Título da Seção</label>
                  <Input
                    type="text"
                    value={settings.congresso_por_que_title || 'PORQUE ESPERAR PODE CUSTAR MAIS DO QUE O SEU INGRESSO'}
                    onChange={(e) => handleChange('congresso_por_que_title', e.target.value)}
                  />
                </FormGroup>

                <FormGroup className="full-width">
                  <label>Texto de Introdução / Contexto</label>
                  <Textarea
                    rows={2}
                    value={settings.congresso_por_que_intro || 'O mercado está evoluindo rapidamente. Novas tecnologias, métodos e oportunidades estão surgindo, e quem se atualiza primeiro se prepara melhor para tomar decisões e se posicionar.'}
                    onChange={(e) => handleChange('congresso_por_que_intro', e.target.value)}
                  />
                </FormGroup>

                <FormGroup className="full-width">
                  <label>Frase de Fechamento / Manifesto</label>
                  <Textarea
                    rows={2}
                    value={settings.congresso_por_que_fechamento || 'Um único dia pode gerar ideias, contatos e aprendizados capazes de influenciar seus próximos meses de trabalho. Não espere o mercado mudar para depois tentar alcançá-lo.'}
                    onChange={(e) => handleChange('congresso_por_que_fechamento', e.target.value)}
                  />
                </FormGroup>

                {/* Editor da Lista de Motivos / Diferenciais */}
                <div className="full-width" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                        ⚡ Diferenciais / Motivos para Estar Presente
                      </h4>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                        Adicione ou edite os 9 motivos de alto impacto
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        let list = [];
                        try {
                          list = settings.congresso_por_que_items_json ? JSON.parse(settings.congresso_por_que_items_json) : [
                            'Conteúdo direcionado para sua realidade profissional',
                            'Demonstrações e experiências práticas ao vivo',
                            'Profissionais e especialistas de referência do mercado',
                            'Tecnologias e soluções inovadoras em eletroestimulação',
                            'Marcas e expositores oficiais reunidos em um único local',
                            'Networking estratégico com tomadores de decisão',
                            'Competição exclusiva de atletas no palco',
                            'Convidados especiais e revelações em primeira mão',
                            'Novas possibilidades reais de atuação, faturamento e negócios'
                          ];
                        } catch (e) { list = []; }
                        const updated = [...list, 'Novo motivo estratégico...'];
                        handleChange('congresso_por_que_items_json', JSON.stringify(updated));
                      }}
                      style={{
                        background: '#0A3E60',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '0.5rem 0.9rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Plus size={15} /> Adicionar Motivo
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(() => {
                      let list = [];
                      try {
                        list = settings.congresso_por_que_items_json ? JSON.parse(settings.congresso_por_que_items_json) : [
                          'Conteúdo direcionado para sua realidade profissional',
                          'Demonstrações e experiências práticas ao vivo',
                          'Profissionais e especialistas de referência do mercado',
                          'Tecnologias e soluções inovadoras em eletroestimulação',
                          'Marcas e expositores oficiais reunidos em um único local',
                          'Networking estratégico com tomadores de decisão',
                          'Competição exclusiva de atletas no palco',
                          'Convidados especiais e revelações em primeira mão',
                          'Novas possibilidades reais de atuação, faturamento e negócios'
                        ];
                      } catch (e) { list = []; }

                      return list.map((item, idx) => {
                        const isObj = typeof item === 'object' && item !== null;
                        const text = isObj ? (item.text || '') : String(item);
                        const icon = isObj ? item.icon : '';
                        const emoji = isObj ? item.emoji : '';

                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              padding: '0.4rem 0.75rem'
                            }}
                          >
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ED7E13' }}>#{idx + 1}</span>
                            
                            <ItemIconEmojiPicker
                              icon={icon}
                              emoji={emoji}
                              onChangeIcon={(newIcon) => {
                                const updated = [...list];
                                updated[idx] = { text, icon: newIcon, emoji: '' };
                                handleChange('congresso_por_que_items_json', JSON.stringify(updated));
                              }}
                              onChangeEmoji={(newEmoji) => {
                                const updated = [...list];
                                updated[idx] = { text, icon: '', emoji: newEmoji };
                                handleChange('congresso_por_que_items_json', JSON.stringify(updated));
                              }}
                            />

                            <Input
                              type="text"
                              value={text}
                              onChange={(e) => {
                                const updated = [...list];
                                if (isObj) {
                                  updated[idx] = { ...item, text: e.target.value };
                                } else {
                                  updated[idx] = e.target.value;
                                }
                                handleChange('congresso_por_que_items_json', JSON.stringify(updated));
                              }}
                              style={{ flex: 1 }}
                              placeholder="Motivo estratégico..."
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = list.filter((_, i) => i !== idx);
                                handleChange('congresso_por_que_items_json', JSON.stringify(updated));
                              }}
                              style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.4rem' }}
                              title="Excluir motivo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </FieldsGrid>
            </ContentCard>
          )}

          {/* PAINEL: MATRIZ COMPARATIVA DE INGRESSOS (PLAN-203) */}
          {activeSectionId === 'resumo' && (
            <ContentCard>
              <FieldsGrid>
                <FormGroup>
                  <label>Tag / Label Superior</label>
                  <Input
                    type="text"
                    value={settings.congresso_comparativo_label || settings.congresso_resumo_label || 'COMPARAÇÃO DE PASSAPORTES'}
                    onChange={(e) => {
                      handleChange('congresso_comparativo_label', e.target.value);
                      handleChange('congresso_resumo_label', e.target.value);
                    }}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Título da Seção Comparativa</label>
                  <Input
                    type="text"
                    value={settings.congresso_comparativo_title || settings.congresso_resumo_title || 'Qual Experiência é a Ideal Para o Seu Momento?'}
                    onChange={(e) => {
                      handleChange('congresso_comparativo_title', e.target.value);
                      handleChange('congresso_resumo_title', e.target.value);
                    }}
                  />
                </FormGroup>

                <FormGroup className="full-width">
                  <label>Subtítulo Explicativo</label>
                  <Textarea
                    rows={2}
                    value={settings.congresso_comparativo_subtitle || settings.congresso_resumo_subtitle || 'Compare os benefícios de cada categoria e garanta o seu acesso com condições exclusivas de virada de lote.'}
                    onChange={(e) => {
                      handleChange('congresso_comparativo_subtitle', e.target.value);
                      handleChange('congresso_resumo_subtitle', e.target.value);
                    }}
                  />
                </FormGroup>
              </FieldsGrid>
            </ContentCard>
          )}

          {/* PAINEL 7: DEPOIMENTOS */}
          {activeSectionId === 'testemunhos' && (
            <ContentCard>
              <FieldsGrid>
                <FormGroup>
                  <label>Tag / Label Superior</label>
                  <Input
                    type="text"
                    value={settings.congresso_testemunhos_label || 'Depoimentos de Licenciadas'}
                    onChange={(e) => handleChange('congresso_testemunhos_label', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Título da Seção de Provas</label>
                  <Input
                    type="text"
                    value={settings.congresso_testemunhos_title || 'Resultados Reais no Campo de Batalha'}
                    onChange={(e) => handleChange('congresso_testemunhos_title', e.target.value)}
                  />
                </FormGroup>

                <FormGroup className="full-width">
                  <label>Subtítulo</label>
                  <Textarea
                    rows={2}
                    value={settings.congresso_testemunhos_subtitle || 'Veja o que dizem as proprietárias de clínicas que já aplicam a musculação elétrica Body Harmony no seu dia a dia.'}
                    onChange={(e) => handleChange('congresso_testemunhos_subtitle', e.target.value)}
                  />
                </FormGroup>
              </FieldsGrid>
            </ContentCard>
          )}

          {/* PAINEL 8: CRONÔMETRO */}
          {activeSectionId === 'countdown' && (
            <ContentCard>
              <FieldsGrid>
                <FormGroup>
                  <label>Badge de Escassez</label>
                  <Input
                    type="text"
                    value={settings.congresso_countdown_badge || '⏱️ CONTAGEM REGRESSIVA'}
                    onChange={(e) => handleChange('congresso_countdown_badge', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Título do Cronômetro</label>
                  <Input
                    type="text"
                    value={settings.congresso_countdown_title || 'O Tempo Está Correndo para Garantir Seu Lugar'}
                    onChange={(e) => handleChange('congresso_countdown_title', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Texto do Botão CTA do Cronômetro</label>
                  <Input
                    type="text"
                    value={settings.congresso_countdown_cta || 'Garantir Ingresso Antes da Virada de Lote'}
                    onChange={(e) => handleChange('congresso_countdown_cta', e.target.value)}
                  />
                </FormGroup>
              </FieldsGrid>
            </ContentCard>
          )}

          {/* PAINEL 9: PERGUNTAS FREQUENTES (FAQ) */}
          {activeSectionId === 'faq' && (
            <ContentCard>
              <FieldsGrid>
                <FormGroup>
                  <label>Tag / Label Superior</label>
                  <Input
                    type="text"
                    value={settings.congresso_faq_label || 'Dúvidas Frequentes'}
                    onChange={(e) => handleChange('congresso_faq_label', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Título da Seção de FAQ</label>
                  <Input
                    type="text"
                    value={settings.congresso_faq_title || 'Tudo o Que Você Precisa Saber'}
                    onChange={(e) => handleChange('congresso_faq_title', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Tamanho do Título do FAQ</label>
                  <Select
                    value={settings.congresso_size_faq_title || 'normal'}
                    onChange={(e) => handleChange('congresso_size_faq_title', e.target.value)}
                  >
                    <option value="normal">Normal (2.5rem)</option>
                    <option value="2rem">Compacto (2.0rem)</option>
                    <option value="3rem">Destaque Grande (3.0rem)</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <label>Espaçamento da Seção de FAQ</label>
                  <Select
                    value={settings.congresso_spacing_faq || 'normal'}
                    onChange={(e) => handleChange('congresso_spacing_faq', e.target.value)}
                  >
                    <option value="compact">Compacto (Menor)</option>
                    <option value="normal">Normal [Padrão]</option>
                    <option value="generous">Generoso (Maior)</option>
                  </Select>
                </FormGroup>

                {/* Editor Interativo de Perguntas & Respostas */}
                <div className="full-width" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                        📋 Perguntas e Respostas do FAQ
                      </h4>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                        Adicione, edite ou remova as dúvidas frequentes exibidas no sanfona (accordion)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        let currentList = [];
                        try {
                          currentList = settings.congresso_faq_json ? JSON.parse(settings.congresso_faq_json) : [
                            { question: 'O evento é apenas para profissionais da área?', answer: 'Não. O Congresso é aberto a qualquer pessoa interessada em EMS, saúde, bem-estar ou em empreender.' },
                            { question: 'Preciso me deslocar até São Paulo? Como funciona a logística?', answer: 'O Espaço Full Sales fica em frente ao Shopping JK Iguatemi, a apenas 10 passos do metrô/trem e a 15 minutos do Aeroporto de Congonhas.' },
                            { question: 'Terei certificado de participação oficial?', answer: 'Sim. Todos os participantes recebem certificado digital oficial de participação emitido pela Body Harmony.' }
                          ];
                        } catch (e) { currentList = []; }
                        const updated = [...currentList, { question: 'Nova Pergunta Frequente', answer: 'Resposta detalhada para orientar o congressista...' }];
                        handleChange('congresso_faq_json', JSON.stringify(updated));
                      }}
                      style={{
                        background: '#0A3E60',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '0.5rem 0.9rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Plus size={15} /> Adicionar Pergunta
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {(() => {
                      let list = [];
                      try {
                        list = settings.congresso_faq_json ? JSON.parse(settings.congresso_faq_json) : [
                          { question: 'O evento é apenas para profissionais da área?', answer: 'Não. O Congresso é aberto a qualquer pessoa interessada em EMS, saúde, bem-estar ou em empreender no mercado fitness de alta performance. Profissionais de saúde, esteticistas, personal trainers, empreendedores e investidores são todos bem-vindos.' },
                          { question: 'Preciso me deslocar até São Paulo? Como funciona a logística?', answer: 'O Espaço Full Sales fica em frente ao Shopping JK Iguatemi, a apenas 10 passos do metrô/trem e a 15 minutos do Aeroporto de Congonhas — o que facilita enormemente para quem vem de outros estados. Recomendamos chegar na noite anterior para aproveitar o dia completo sem pressa.' },
                          { question: 'Terei certificado de participação oficial?', answer: 'Sim. Todos os participantes recebem certificado digital oficial de participação emitido pela Body Harmony, válido como comprovante de formação continuada em Eletroestimulação Muscular.' },
                          { question: 'Poderei praticar ou vivenciar EMS no evento?', answer: 'O Congresso inclui demonstrações práticas de EMS com aparelhos de última geração e sessões hands-on conduzidas pelas especialistas da rede.' },
                          { question: 'O que está incluído no Ingresso Experience?', answer: 'O Ingresso Experience dá acesso completo a todas as palestras científicas e práticas do Congresso, feira de expositores e tecnologias, assento reservado com mesa e tomada individual, networking ativo e certificado oficial de participação.' },
                          { question: 'Como funciona o crédito do Ingresso VIP no Licenciamento?', answer: 'O valor integral de R$ 1.497 do ingresso VIP é 100% convertido em crédito direto na adesão ao Licenciamento Territorial Body Harmony. Você não gasta nada a mais: seu ingresso vira investimento no seu próprio estúdio.' },
                          { question: 'O Ingresso VIP realmente tem apenas 40 vagas?', answer: 'Sim. O coquetel privativo com Josi e Kaprice é um ambiente intimista e executivo — por isso o número de vagas VIP é estritamente limitado a 40 pessoas. Quando esgotar, não haverá reposição.' },
                          { question: 'Posso parcelar o ingresso?', answer: 'Sim. Ambos os ingressos podem ser parcelados no cartão de crédito em até 12x via checkout seguro oficial. As condições são apresentadas no momento da compra.' }
                        ];
                      } catch (e) {
                        list = [];
                      }

                      return list.map((faqItem, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '10px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.6rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0A3E60', textTransform: 'uppercase' }}>
                              Pergunta #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = list.filter((_, i) => i !== idx);
                                handleChange('congresso_faq_json', JSON.stringify(updated));
                              }}
                              style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                            >
                              <Trash2 size={13} /> Excluir
                            </button>
                          </div>

                          <Input
                            type="text"
                            placeholder="Pergunta..."
                            value={faqItem.question}
                            onChange={(e) => {
                              const updated = [...list];
                              updated[idx].question = e.target.value;
                              handleChange('congresso_faq_json', JSON.stringify(updated));
                            }}
                            style={{ fontWeight: 700 }}
                          />

                          <Textarea
                            rows={3}
                            placeholder="Resposta detalhada..."
                            value={faqItem.answer}
                            onChange={(e) => {
                              const updated = [...list];
                              updated[idx].answer = e.target.value;
                              handleChange('congresso_faq_json', JSON.stringify(updated));
                            }}
                          />
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </FieldsGrid>
            </ContentCard>
          )}

          {/* PAINEL 10: RODAPÉ */}
          {activeSectionId === 'footer' && (
            <ContentCard>
              <FieldsGrid>
                <FormGroup>
                  <label>Badge do Rodapé</label>
                  <Input
                    type="text"
                    value={settings.congresso_footer_badge || 'BODY HARMONY CONGRESSO · 07/NOV'}
                    onChange={(e) => handleChange('congresso_footer_badge', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Título de Fechamento</label>
                  <Input
                    type="text"
                    value={settings.congresso_footer_title || 'Não Deixe Sua Clínica Ficar Para Trás'}
                    onChange={(e) => handleChange('congresso_footer_title', e.target.value)}
                  />
                </FormGroup>

                <FormGroup className="full-width">
                  <label>Subtítulo de Fechamento</label>
                  <Textarea
                    rows={2}
                    value={settings.congresso_footer_subtitle || 'Junte-se às profissionais de maior destaque e domine a tecnologia que está transformando o mercado estético.'}
                    onChange={(e) => handleChange('congresso_footer_subtitle', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Texto do Botão CTA Final</label>
                  <Input
                    type="text"
                    value={settings.congresso_footer_cta || 'Quero Estar no Congresso 2026'}
                    onChange={(e) => handleChange('congresso_footer_cta', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Texto de Copyright / Institucional</label>
                  <Input
                    type="text"
                    value={settings.congresso_footer_copyright || '© 2026 Body Harmony Eletroestimulação Ltda. Todos os direitos reservados.'}
                    onChange={(e) => handleChange('congresso_footer_copyright', e.target.value)}
                  />
                </FormGroup>
              </FieldsGrid>
            </ContentCard>
          )}
        </EditorContainer>
      </StudioLayout>

      {/* BARRA STICKY FLUTUANTE DE AÇÕES FIXA NO RODAPÉ */}
      <StickyFooterBar>
        <div className="left-status">
          <div className="dot" />
          <span>Editor de Copys do Congresso · Alterações em tempo real</span>
        </div>

        <div className="actions">
          {/* Botões Undo / Redo */}
          <div style={{ display: 'flex', gap: '3px' }}>
            <button
              type="button"
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              style={{
                border: 'none',
                background: historyIndex > 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: historyIndex > 0 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                padding: '0.4rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: historyIndex > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Desfazer última alteração (Ctrl+Z)"
            >
              <Undo2 size={13} /> Desfazer
            </button>
            <button
              type="button"
              disabled={historyIndex >= historyStack.length - 1}
              onClick={handleRedo}
              style={{
                border: 'none',
                background: historyIndex < historyStack.length - 1 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: historyIndex < historyStack.length - 1 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                padding: '0.4rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: historyIndex < historyStack.length - 1 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Refazer alteração (Ctrl+Shift+Z)"
            >
              <Redo2 size={13} /> Refazer
            </button>
          </div>

          {/* Seletor de Preview Desktop / Mobile */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <button
              type="button"
              onClick={() => openLivePreview('desktop')}
              style={{ border: 'none', background: 'transparent', color: '#F8FAFC', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Monitor size={14} /> 🖥️ Desktop
            </button>
            <button
              type="button"
              onClick={() => openLivePreview('mobile')}
              style={{ border: 'none', background: 'transparent', color: '#F8FAFC', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Smartphone size={14} /> 📱 Mobile (390px)
            </button>
          </div>

          <GhostActionBtn type="button" onClick={onReset}>
            <RotateCcw size={15} /> Restaurar Padrões
          </GhostActionBtn>

          <SaveBtn type="submit" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Salvando...' : 'Salvar Copys (Ctrl+S)'}</span>
          </SaveBtn>
        </div>
      </StickyFooterBar>
    </form>
  );
}
