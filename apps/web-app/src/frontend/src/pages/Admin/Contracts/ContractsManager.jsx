import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaArrowLeft, FaPlus, FaFilePdf, FaLink, FaWhatsapp, FaUpload, FaEye,
  FaCheckCircle, FaClock, FaSearch, FaSpinner, FaFileSignature, FaShieldAlt,
  FaFileAlt, FaEdit, FaTrash, FaFolder, FaTags
} from 'react-icons/fa'
import { 
  FileSignature, FileText, Clock, CheckCircle2, ShieldAlert, 
  Plus, ArrowLeft, Shield, Sparkles 
} from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { contractsApi } from '../../../services/api'
import AdminLayout from '../components/AdminLayout'
import UploadSignedModal from './components/UploadSignedModal'
import WhatsAppShareModal from './components/WhatsAppShareModal'
import TemplateEditorModal from './components/TemplateEditorModal'
import ScrollableTabs from '../../../components/ui/ScrollableTabs'
import CompactKpiGrid from '../../../components/ui/CompactKpiGrid'

const PageWrapper = styled.div`
  padding: 1.25rem 1.5rem;
  max-width: 1300px;
  margin: 0 auto;
  padding-bottom: 100px;

  @media (max-width: 768px) {
    padding: 0.85rem;
    padding-bottom: 90px;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #0a3e60;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.85rem;

  &:hover {
    text-decoration: underline;
  }
`

const MainTabsNav = styled.div`
  display: flex;
  gap: 0.35rem;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 0.85rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`

const MainTab = styled.button`
  padding: 0.45rem 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${({ active }) => (active ? '#ED7E13' : 'transparent')};
  color: ${({ active }) => (active ? '#0A3E60' : '#64748B')};
  font-weight: ${({ active }) => (active ? 800 : 600)};
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 40px;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    color: #0a3e60;
  }
`

const AddButton = styled(Link)`
  background: #ed7e13;
  color: white;
  text-decoration: none;
  padding: 0.45rem 1rem;
  border-radius: 7px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 44px;
  font-size: 0.82rem;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(1.08);
  }
`

const AddTemplateBtn = styled.button`
  background: #0a3e60;
  color: white;
  border: none;
  padding: 0.45rem 1rem;
  border-radius: 7px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 44px;
  font-size: 0.82rem;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(1.15);
  }
`

// Bento Grid Metrics
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.65rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
`

const MetricCard = styled.div`
  background: var(--bh-bg-surface, white);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--bh-border, #e2e8f0);
  box-shadow: var(--bh-card-shadow, 0 4px 6px -1px rgba(10, 62, 96, 0.04));
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .icon-wrap {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: ${({ bg }) => bg || 'var(--bh-bg-card-subtle, #f0f7ff)'};
    color: ${({ color }) => color || 'var(--bh-gold, #0a3e60)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    flex-shrink: 0;
  }

  .details {
    min-width: 0;
    h3 {
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--bh-text-title, #0a3e60);
      margin: 0;
      line-height: 1.2;
    }
    p {
      font-size: 0.72rem;
      color: var(--bh-text-secondary, #64748b);
      margin: 2px 0 0 0;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 240px;
  width: 100%;

  svg {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }

  input {
    width: 100%;
    padding: 0.65rem 0.85rem 0.65rem 2.4rem;
    border: 1px solid var(--bh-border, #cbd5e1);
    border-radius: 10px;
    font-size: 0.85rem;
    outline: none;
    box-sizing: border-box;
    background: var(--bh-bg-input, #ffffff);
    color: var(--bh-text-main, #1e293b);
    min-height: 44px;

    &:focus {
      border-color: var(--bh-gold, #ed7e13);
      box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.15);
    }
  }
`

const StatusPills = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
`

const Pill = styled.button`
  padding: 0.45rem 0.85rem;
  border-radius: 20px;
  border: 1px solid ${({ active }) => (active ? 'var(--bh-gold, #0A3E60)' : 'var(--bh-border, #e2e8f0)')};
  background: ${({ active }) => (active ? 'var(--bh-navy, #0A3E60)' : 'var(--bh-bg-card, #ffffff)')};
  color: ${({ active }) => (active ? '#ffffff' : 'var(--bh-text-secondary, #64748b)')};
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  min-height: 40px;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    border-color: var(--bh-gold, #0a3e60);
    color: var(--bh-text-title, #0a3e60);
  }
`

const TableCard = styled.div`
  background: var(--bh-bg-surface, white);
  border-radius: 12px;
  border: 1px solid var(--bh-border, #e2e8f0);
  box-shadow: var(--bh-card-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.05));
  overflow: hidden;
`

const DesktopTableContainer = styled.div`
  display: block;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    display: none;
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    background: var(--bh-bg-card-subtle, #f8fafc);
    padding: 1rem;
    font-weight: 700;
    color: var(--bh-text-secondary, #475569);
    font-size: 0.85rem;
    border-bottom: 1px solid var(--bh-border, #e2e8f0);
    white-space: nowrap;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid var(--bh-border-subtle, #f1f5f9);
    font-size: 0.9rem;
    color: var(--bh-text-main, #334155);
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: rgba(237, 126, 19, 0.06);
  }
`

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;

  ${({ status }) => {
    switch (status) {
      case 'SIGNED':
        return 'background: rgba(34, 197, 94, 0.15); color: #16a34a; border: 1px solid rgba(34, 197, 94, 0.3);'
      case 'PENDING_SIGNATURE':
      case 'GENERATED':
        return 'background: rgba(234, 179, 8, 0.15); color: #ca8a04; border: 1px solid rgba(234, 179, 8, 0.3);'
      case 'DRAFT':
        return 'background: rgba(148, 163, 184, 0.15); color: #64748b; border: 1px solid rgba(148, 163, 184, 0.3);'
      default:
        return 'background: rgba(239, 68, 68, 0.15); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.3);'
    }
  }}
`

const ActionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`

const ActionIconBtn = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bh-bg-card, #f8fafc);
  color: var(--bh-text-main, #0a3e60);
  border: 1px solid var(--bh-border, #e2e8f0);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;

  &:hover {
    background: var(--bh-navy, #0a3e60);
    color: white;
    border-color: var(--bh-gold, #0a3e60);
  }
`

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bh-bg-card, #f8fafc);
  color: var(--bh-text-main, #0a3e60);
  border: 1px solid var(--bh-border, #e2e8f0);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--bh-navy, #0a3e60);
    color: white;
    border-color: var(--bh-gold, #0a3e60);
  }

  &.whatsapp:hover {
    background: #25d366;
    border-color: #25d366;
    color: white;
  }
`

// ── Mobile Card View Styled Components (<= 768px) ───────────────────────────
const MobileCardsContainer = styled.div`
  display: none;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.85rem;

  @media (max-width: 768px) {
    display: flex;
  }
`

const MobileContractCard = styled.div`
  background: var(--bh-bg-surface, #ffffff);
  border: 1px solid var(--bh-border, #e2e8f0);
  border-radius: 14px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(10, 62, 96, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--bh-gold, #ed7e13);
  }
`

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;

  .title-wrap {
    flex: 1;
    min-width: 0;

    .title {
      font-size: 0.92rem;
      font-weight: 800;
      color: #0a3e60;
      margin: 0 0 0.25rem 0;
      line-height: 1.3;
      word-break: break-word;
    }

    .date {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
  }
`

const MobileCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid #f1f5f9;

  .lead-name {
    font-size: 0.88rem;
    font-weight: 700;
    color: #0a3e60;
    word-break: break-word;
  }

  .lead-doc {
    font-size: 0.78rem;
    color: #475569;
    font-family: monospace;
    font-weight: 600;
  }

  .lead-location {
    font-size: 0.78rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.15rem;
  }
`

const MobilePrimaryActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.5rem;
`

const MobilePrimaryBtn = styled.button`
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 44px;
  font-family: inherit;
  transition: all 0.2s;

  &.whatsapp {
    background: #25d366;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(37, 211, 102, 0.25);
    &:hover { background: #1eb956; }
  }

  &.copylink {
    background: #0a3e60;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(10, 62, 96, 0.2);
    &:hover { background: #072a42; }
  }

  &.josi-sign {
    background: linear-gradient(135deg, #ed7e13 0%, #d96b08 100%);
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(237, 126, 19, 0.3);
    &:hover { filter: brightness(1.1); }
  }

  &.josi-signed {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #86efac;
    cursor: default;
  }
`

const MobileSecondaryActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.6rem;
  margin-top: 0.1rem;

  .icons-left {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
`

const MobileIconButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #f8fafc;
  color: #0a3e60;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:hover {
    background: #0a3e60;
    color: #ffffff;
    border-color: #0a3e60;
  }

  &.delete {
    color: #dc2626;
    border-color: #fecaca;
    background: #fef2f2;
    &:hover {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
    }
  }
`

const MobileIconLink = styled(Link)`
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  background: #f8fafc;
  color: #0a3e60;
  border: 1px solid #e2e8f0;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 700;
  min-height: 44px;
  transition: all 0.2s;

  &:hover {
    background: #0a3e60;
    color: #ffffff;
    border-color: #0a3e60;
  }

  &.draft-continue {
    background: #fef3c7;
    border-color: #f59e0b;
    color: #b45309;
    &:hover { background: #fde68a; }
  }
`

const MobileIconAnchor = styled.a`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #f8fafc;
  color: #ed7e13;
  border: 1px solid #fed7aa;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:hover {
    background: #ed7e13;
    color: #ffffff;
    border-color: #ed7e13;
  }
`

// Templates Grid
const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`

const TemplateCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(10, 62, 96, 0.08);
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;

    .category-badge {
      background: #f0f7ff;
      color: #0369a1;
      border: 1px solid #bae6fd;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .version {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
    }
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #0a3e60;
    margin: 0 0 0.5rem 0;
  }

  p {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0 0 1.25rem 0;
    line-height: 1.4;
  }

  .footer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f1f5f9;
    padding-top: 1rem;
    margin-top: 0.5rem;
  }
`

const UseTemplateBtn = styled(Link)`
  background: #ed7e13;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    filter: brightness(1.08);
  }
`

const Toast = styled.div`
  position: fixed;
  bottom: 25px;
  right: 25px;
  background: #0a3e60;
  color: white;
  padding: 0.9rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  z-index: 1200;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-left: 4px solid #ed7e13;
`

const PreviewOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 62, 96, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 1.5rem;
`

const PreviewModalContainer = styled.div`
  background: white;
  border-radius: 14px;
  width: 92%;
  max-width: 980px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  overflow: hidden;

  .modal-header {
    padding: 1.1rem 1.5rem;
    background: #0a3e60;
    color: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    button {
      background: none;
      border: none;
      color: #ffffff;
      font-size: 1.6rem;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
    }
  }

  .modal-body {
    flex: 1;
    background: #f8fafc;
    overflow-y: auto;

    iframe {
      width: 100%;
      height: 100%;
      min-height: 500px;
      border: none;
    }
  }
`

const CATEGORIES = [
  'ALL',
  'Licenciamento',
  'Ouvinte',
  'Cursos e Eventos',
  'Clinica e Pacientes',
  'Recibos',
  'Parcerias'
]

export default function ContractsManager() {
  const navigate = useNavigate()
  const [activeMainTab, setActiveMainTab] = useState('CONTRACTS') // 'CONTRACTS' | 'TEMPLATES'
  const [contracts, setContracts] = useState([])
  const [templates, setTemplates] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [counters, setCounters] = useState({ total: 0, pending_signature: 0, signed_month: 0, draft: 0 })
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Modals state
  const [uploadContract, setUploadContract] = useState(null)
  const [whatsappContract, setWhatsappContract] = useState(null)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [previewContract, setPreviewContract] = useState(null)
  const [deleteContractItem, setDeleteContractItem] = useState(null)
  const [editContractItem, setEditContractItem] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editStatus, setEditStatus] = useState('GENERATED')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isHealing, setIsHealing] = useState(false)

  const handleAutoHealContracts = async () => {
    try {
      setIsHealing(true)
      showToast('🛡️ Iniciando auditoria e auto-correção de contratos e assinaturas...')
      const res = await contractsApi.healContracts()
      if (res && res.ok) {
        showToast(`✅ Auto-correção concluída! ${res.signatures_healed || 0} assinaturas e ${res.contracts_recompiled || 0} contratos normalizados.`)
        loadContracts()
      } else {
        showToast(res?.error || 'Falha ao executar auto-correção.')
      }
    } catch (err) {
      console.error(err)
      showToast('Erro de conexão ao auto-corrigir contratos.')
    } finally {
      setIsHealing(false)
    }
  }

  const handleDeleteContract = async () => {
    if (!deleteContractItem) return
    try {
      setDeleting(true)
      const res = await contractsApi.deleteContract(deleteContractItem.uuid)
      if (res.ok) {
        showToast(res.message || 'Contrato excluído com sucesso!')
        setDeleteContractItem(null)
        loadContracts()
      } else {
        showToast(res.error || 'Erro ao excluir contrato.')
      }
    } catch (err) {
      console.error(err)
      showToast('Falha ao comunicar com o servidor para exclusão.')
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveEditContract = async () => {
    if (!editContractItem) return
    try {
      setSavingEdit(true)
      const res = await contractsApi.updateContract(editContractItem.uuid, {
        title: editTitle,
        status: editStatus
      })
      if (res.ok) {
        showToast('Contrato atualizado e recompilado com sucesso!')
        setEditContractItem(null)
        loadContracts()
      } else {
        showToast(res.error || 'Erro ao atualizar contrato.')
      }
    } catch (err) {
      console.error(err)
      showToast('Falha ao salvar edições do contrato.')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleSignAsLicenciante = async (contractItem) => {
    try {
      setToastMessage('Assinando contrato como Licenciante (Josi)...')
      const token = contractItem.sign_token || contractItem.uuid
      const data = await contractsApi.signContract({
        sign_token: token,
        signer_type: 'LICENCIANTE'
      })
      if (data && data.ok) {
        setToastMessage('✍️ Contrato assinado com sucesso pelo Licenciante (Josi)!')
        loadContracts()
      } else {
        setToastMessage((data && data.error) || 'Erro ao assinar como Licenciante.')
      }
    } catch (err) {
      console.error(err)
      setToastMessage('Falha na comunicação ao assinar como Licenciante.')
    }
  }

  const loadContracts = async () => {
    try {
      setLoading(true)
      const res = await contractsApi.getContracts({
        status: statusFilter,
        search: search
      })
      if (res.ok) {
        setContracts(res.contracts || [])
        if (res.counters) setCounters(res.counters)
      } else {
        setToastMessage(res.error || 'Erro ao carregar lista de contratos.')
      }
    } catch (err) {
      console.error('Erro ao listar contratos:', err)
      setToastMessage('Falha ao comunicar com o servidor de contratos.')
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const res = await contractsApi.getTemplates(selectedCategory)
      if (res.ok) {
        setTemplates(res.templates || [])
      }
    } catch (err) {
      console.error('Erro ao listar templates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeMainTab === 'CONTRACTS') {
      loadContracts()
    } else {
      loadTemplates()
    }
  }, [activeMainTab, statusFilter, search, selectedCategory])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const handleCopyLink = (signUrl) => {
    const fullUrl = `${window.location.origin}${signUrl}`
    navigator.clipboard.writeText(fullUrl)
    showToast('Link de assinatura copiado para a área de transferência!')
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Deseja realmente desativar este modelo de contrato?')) return
    try {
      const res = await contractsApi.deleteTemplate(templateId)
      if (res.ok) {
        showToast('Modelo desativado com sucesso!')
        loadTemplates()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AdminLayout>
      <PageWrapper>
        <Header>
          <div>
            <BackLink to={ROUTES.ADMIN_DASHBOARD}>
              <FaArrowLeft /> Voltar ao Painel Gestor
            </BackLink>
            <h1 style={{ color: '#0A3E60', margin: '0.4rem 0 0 0', fontSize: '1.7rem' }}>
              Gestão de Contratos & Assinaturas
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleAutoHealContracts}
              disabled={isHealing}
              style={{
                background: '#ffffff',
                color: '#0A3E60',
                border: '1px solid #cbd5e1',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                minHeight: '44px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.2s'
              }}
              title="Audita e normaliza automaticamente dados de assinaturas, chancelas e recompila PDFs legados"
            >
              <FaShieldAlt style={{ color: '#ED7E13' }} />
              {isHealing ? 'Auditando...' : '🛡️ Auto-Corrigir'}
            </button>
            {activeMainTab === 'CONTRACTS' ? (
              <AddButton to={ROUTES.ADMIN_CONTRATOS_NOVO}>
                <Plus size={16} /> Novo Contrato
              </AddButton>
            ) : (
              <AddTemplateBtn onClick={() => { setEditingTemplate(null); setIsTemplateModalOpen(true) }}>
                <Plus size={16} /> Novo Modelo de Contrato
              </AddTemplateBtn>
            )}
          </div>
        </Header>

        {/* MAIN TABS NAVIGATION */}
        <ScrollableTabs
          tabs={[
            { id: 'CONTRACTS', label: 'Contratos Emitidos', count: counters.total, icon: FileSignature },
            { id: 'TEMPLATES', label: 'Modelos de Contrato', count: templates.length, icon: FileText }
          ]}
          activeTab={activeMainTab}
          onTabChange={setActiveMainTab}
        />

        {/* ── TAB 1: CONTRATOS EMITIDOS ─────────────────────────────────── */}
        {activeMainTab === 'CONTRACTS' && (
          <>
            {/* METRICS BENTO */}
            <CompactKpiGrid
              items={[
                { label: 'Total Emitidos', value: counters.total || 0, color: '#0A3E60', icon: FileSignature },
                { label: 'Aguardando Assinatura', value: counters.pending_signature || 0, color: '#B45309', icon: Clock },
                { label: 'Assinados no Mês', value: counters.signed_month || 0, color: '#15803D', icon: CheckCircle2 },
                { label: 'Rascunhos', value: counters.draft || 0, color: '#64748B', icon: ShieldAlert },
              ]}
            />

            {/* FILTERS & SEARCH */}
            <FilterBar>
              <SearchBox>
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar por Licenciada, Documento ou Título..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </SearchBox>
              <StatusPills>
                <Pill active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')}>
                  Todos ({counters.total})
                </Pill>
                <Pill active={statusFilter === 'PENDING_SIGNATURE'} onClick={() => setStatusFilter('PENDING_SIGNATURE')}>
                  Aguardando Assinatura
                </Pill>
                <Pill active={statusFilter === 'SIGNED'} onClick={() => setStatusFilter('SIGNED')}>
                  Assinados
                </Pill>
                <Pill active={statusFilter === 'DRAFT'} onClick={() => setStatusFilter('DRAFT')}>
                  Rascunhos
                </Pill>
              </StatusPills>
            </FilterBar>

            {/* CONTRACTS TABLE */}
            <TableCard>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#0A3E60' }}>
                  <FaSpinner className="fa-spin" size={28} />
                  <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Carregando contratos...</p>
                </div>
              ) : contracts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  <FaFileSignature size={40} style={{ color: '#CBD5E1', marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Nenhum contrato encontrado com os filtros atuais.</p>
                </div>
              ) : (
                <>
                  {/* 🖥️ DESKTOP TABLE VIEW (> 768px) */}
                  <DesktopTableContainer>
                    <Table>
                      <thead>
                        <tr>
                          <th>Contrato / Licenciada</th>
                          <th>Territorialidade</th>
                          <th>Status</th>
                          <th>Data de Emissão</th>
                          <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contracts.map(c => (
                          <tr key={c.id}>
                            <td>
                              <strong style={{ color: '#0A3E60' }}>{c.title}</strong>
                              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                                {c.licenciada_name} {c.licenciada_document ? `• ${c.licenciada_document}` : ''}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.85rem' }}>{c.licenciada_location || 'N/A'}</span>
                            </td>
                            <td>
                              <StatusBadge status={c.status}>
                                {c.status === 'SIGNED' && <FaCheckCircle />}
                                {c.status === 'PENDING_SIGNATURE' && <FaClock />}
                                {c.status === 'GENERATED' && <FaClock />}
                                {c.status === 'SIGNED' ? 'Assinado' : c.status === 'DRAFT' ? 'Rascunho' : 'Aguardando Assinatura'}
                              </StatusBadge>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                                {new Date(c.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <ActionsGroup style={{ justifyContent: 'flex-end' }}>
                                {c.has_pdf && (
                                  <>
                                    <ActionButton
                                      type="button"
                                      onClick={() => setPreviewContract(c)}
                                      title="Pré-visualizar Documento ao Vivo"
                                    >
                                      <FaEye style={{ color: '#0A3E60' }} />
                                    </ActionButton>
                                    <ActionIconBtn
                                      href={c.pdf_url || `/api/v1/contracts/download.php?uuid=${c.uuid}&token=${c.sign_token || ''}`}
                                      target="_blank"
                                      title="Baixar / Visualizar PDF Oficial"
                                    >
                                      <FaFilePdf style={{ color: '#ED7E13' }} />
                                    </ActionIconBtn>
                                  </>
                                )}

                                {c.sign_url && !c.has_licenciada_signature && (
                                  <>
                                    <ActionButton
                                      type="button"
                                      onClick={() => handleCopyLink(c.sign_url)}
                                      title="Copiar Link de Assinatura da Licenciada"
                                    >
                                      <FaLink />
                                    </ActionButton>
                                    <ActionButton
                                      type="button"
                                      className="whatsapp"
                                      onClick={() => setWhatsappContract(c)}
                                      title="Enviar no WhatsApp para Licenciada (Texto Humanizado)"
                                    >
                                      <FaWhatsapp style={{ color: '#25D366' }} />
                                    </ActionButton>
                                  </>
                                )}

                                {c.has_licenciante_signature ? (
                                  <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                    ✓ Josi Assinou
                                  </span>
                                ) : (
                                  <ActionButton
                                    type="button"
                                    onClick={() => handleSignAsLicenciante(c)}
                                    title="Assinar como Licenciante (Josi)"
                                    style={{ background: '#0A3E60', color: '#FFFFFF', padding: '0.35rem 0.6rem', fontSize: '0.78rem', gap: '4px' }}
                                  >
                                    <FaFileSignature style={{ color: '#ED7E13' }} /> Josi
                                  </ActionButton>
                                )}

                                {c.status !== 'SIGNED' && (
                                  <ActionButton
                                    type="button"
                                    onClick={() => setUploadContract(c)}
                                    title="Anexar PDF Assinado (gov.br / cartório)"
                                  >
                                    <FaUpload />
                                  </ActionButton>
                                )}

                                {c.status === 'DRAFT' ? (
                                  <Link
                                    to={`${ROUTES.ADMIN_CONTRATOS}/${c.uuid}`}
                                    style={{
                                      padding: '0.4rem 0.8rem',
                                      borderRadius: '6px',
                                      background: '#FEF3C7',
                                      border: '1px solid #F59E0B',
                                      color: '#B45309',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem'
                                    }}
                                    title="Continuar Preenchimento do Rascunho"
                                  >
                                    Continuar 🚀
                                  </Link>
                                ) : (
                                  <Link
                                    to={`${ROUTES.ADMIN_CONTRATOS}/${c.uuid}`}
                                    style={{
                                      padding: '0.4rem 0.6rem',
                                      borderRadius: '6px',
                                      background: 'var(--bh-bg-card, #ffffff)',
                                      border: '1px solid var(--bh-border, #cbd5e1)',
                                      color: 'var(--bh-text-main, #334155)',
                                      fontSize: '0.78rem',
                                      fontWeight: 600,
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem'
                                    }}
                                    title="Editar Contrato no Wizard Completo"
                                  >
                                    <FaEdit style={{ color: 'var(--bh-gold, #0A3E60)' }} /> Editar
                                  </Link>
                                )}

                                <ActionButton
                                  type="button"
                                  onClick={() => setDeleteContractItem(c)}
                                  title={c.status === 'SIGNED' ? 'Excluir Contrato Assinado (SuperAdmin)' : 'Excluir Contrato (SuperAdmin)'}
                                >
                                  <FaTrash style={{ color: '#EF4444' }} />
                                </ActionButton>
                              </ActionsGroup>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </DesktopTableContainer>

                  {/* 📱 MOBILE CARDS VIEW (<= 768px) */}
                  <MobileCardsContainer>
                    {contracts.map(c => (
                      <MobileContractCard key={c.id}>
                        <MobileCardHeader>
                          <div className="title-wrap">
                            <div className="title">{c.title}</div>
                            <div className="date">
                              <FaClock size={11} /> {new Date(c.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <StatusBadge status={c.status}>
                            {c.status === 'SIGNED' && <FaCheckCircle />}
                            {c.status === 'PENDING_SIGNATURE' && <FaClock />}
                            {c.status === 'GENERATED' && <FaClock />}
                            {c.status === 'SIGNED' ? 'Assinado' : c.status === 'DRAFT' ? 'Rascunho' : 'Aguardando'}
                          </StatusBadge>
                        </MobileCardHeader>

                        <MobileCardBody>
                          <div className="lead-name">
                            {c.licenciada_name || 'Licenciada não identificada'}
                          </div>
                          {c.licenciada_document && (
                            <div className="lead-doc">Doc: {c.licenciada_document}</div>
                          )}
                          {c.licenciada_location && (
                            <div className="lead-location">
                              📍 {c.licenciada_location}
                            </div>
                          )}
                        </MobileCardBody>

                        {/* Ações Primárias (WhatsApp, Copiar Link, Assinatura Josi) */}
                        <MobilePrimaryActions>
                          {c.sign_url && !c.has_licenciada_signature && (
                            <>
                              <MobilePrimaryBtn
                                type="button"
                                className="copylink"
                                onClick={() => handleCopyLink(c.sign_url)}
                              >
                                <FaLink size={13} /> Copiar Link
                              </MobilePrimaryBtn>

                              <MobilePrimaryBtn
                                type="button"
                                className="whatsapp"
                                onClick={() => setWhatsappContract(c)}
                              >
                                <FaWhatsapp size={15} /> WhatsApp
                              </MobilePrimaryBtn>
                            </>
                          )}

                          {c.has_licenciante_signature ? (
                            <MobilePrimaryBtn type="button" className="josi-signed">
                              <FaCheckCircle size={13} /> Josi Assinou
                            </MobilePrimaryBtn>
                          ) : (
                            <MobilePrimaryBtn
                              type="button"
                              className="josi-sign"
                              onClick={() => handleSignAsLicenciante(c)}
                            >
                              <FaFileSignature size={13} /> ✍️ Josi Assinar
                            </MobilePrimaryBtn>
                          )}
                        </MobilePrimaryActions>

                        {/* Ações Secundárias (Prévia, PDF, Anexar, Editar Wizard, Excluir) */}
                        <MobileSecondaryActions>
                          <div className="icons-left">
                            {c.has_pdf && (
                              <>
                                <MobileIconButton
                                  type="button"
                                  onClick={() => setPreviewContract(c)}
                                  title="Pré-visualizar Documento ao Vivo"
                                >
                                  <FaEye style={{ color: '#0A3E60' }} />
                                </MobileIconButton>

                                <MobileIconAnchor
                                  href={c.pdf_url || `/api/v1/contracts/download.php?uuid=${c.uuid}&token=${c.sign_token || ''}`}
                                  target="_blank"
                                  title="Baixar / Visualizar PDF Oficial"
                                >
                                  <FaFilePdf size={14} />
                                </MobileIconAnchor>
                              </>
                            )}

                            {c.status !== 'SIGNED' && (
                              <MobileIconButton
                                type="button"
                                onClick={() => setUploadContract(c)}
                                title="Anexar PDF Assinado"
                              >
                                <FaUpload />
                              </MobileIconButton>
                            )}

                            {c.status === 'DRAFT' ? (
                              <MobileIconLink
                                to={`${ROUTES.ADMIN_CONTRATOS}/${c.uuid}`}
                                className="draft-continue"
                              >
                                Continuar 🚀
                              </MobileIconLink>
                            ) : (
                              <MobileIconLink
                                to={`${ROUTES.ADMIN_CONTRATOS}/${c.uuid}`}
                              >
                                <FaEdit style={{ color: '#ED7E13' }} /> Editar
                              </MobileIconLink>
                            )}
                          </div>

                          <MobileIconButton
                            type="button"
                            className="delete"
                            onClick={() => setDeleteContractItem(c)}
                            title="Excluir Contrato"
                          >
                            <FaTrash size={13} />
                          </MobileIconButton>
                        </MobileSecondaryActions>
                      </MobileContractCard>
                    ))}
                  </MobileCardsContainer>
                </>
              )}
            </TableCard>
          </>
        )}

        {/* ── TAB 2: MODELOS DE CONTRATO (CRUD & 6 CATEGORIAS) ─────────── */}
        {activeMainTab === 'TEMPLATES' && (
          <>
            <FilterBar>
              <StatusPills>
                {CATEGORIES.map(cat => (
                  <Pill
                    key={cat}
                    active={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'ALL' ? 'Todas as Categorias' : cat}
                  </Pill>
                ))}
              </StatusPills>
            </FilterBar>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#0A3E60' }}>
                <FaSpinner className="fa-spin" size={28} />
                <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Carregando modelos de contrato...</p>
              </div>
            ) : (
              <TemplatesGrid>
                {templates.map(tpl => (
                  <TemplateCard key={tpl.id}>
                    <div>
                      <div className="top">
                        <span className="category-badge">{tpl.category}</span>
                        <span className="version">{tpl.version}</span>
                      </div>
                      <h3>{tpl.title}</h3>
                      <p>{tpl.description || 'Sem descrição cadastrada.'}</p>
                    </div>

                    <div className="footer-actions">
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <ActionButton
                          type="button"
                          onClick={() => { setEditingTemplate(tpl); setIsTemplateModalOpen(true) }}
                          title="Editar Modelo & Cláusulas"
                        >
                          <FaEdit />
                        </ActionButton>
                        <ActionButton
                          type="button"
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          title="Desativar Modelo"
                        >
                          <FaTrash style={{ color: '#EF4444' }} />
                        </ActionButton>
                      </div>

                      <UseTemplateBtn to={`${ROUTES.ADMIN_CONTRATOS_NOVO}?template=${tpl.slug}`}>
                        <FaFileSignature /> Emitir com Este
                      </UseTemplateBtn>
                    </div>
                  </TemplateCard>
                ))}
              </TemplatesGrid>
            )}
          </>
        )}

        {/* MODAL DE UPLOAD DE ASSINADO */}
        <UploadSignedModal
          isOpen={!!uploadContract}
          contract={uploadContract}
          onClose={() => setUploadContract(null)}
          onSuccess={() => {
            showToast('Documento assinado anexado e atualizado!')
            loadContracts()
          }}
        />

        {/* MODAL DE ENVIO WHATSAPP HUMANIZADO */}
        <WhatsAppShareModal
          isOpen={!!whatsappContract}
          contract={whatsappContract}
          onClose={() => setWhatsappContract(null)}
          onCopy={(msg) => showToast(msg)}
        />

        {/* MODAL DE EDIÇÃO DE TEMPLATES */}
        <TemplateEditorModal
          isOpen={isTemplateModalOpen}
          template={editingTemplate}
          onClose={() => { setIsTemplateModalOpen(false); setEditingTemplate(null) }}
          onSuccess={() => {
            showToast('Modelo de contrato salvo com sucesso!')
            loadTemplates()
          }}
        />

        {/* MODAL DE PRÉ-VISUALIZAÇÃO AO VIVO */}
        {previewContract && (
          <PreviewOverlay onClick={() => setPreviewContract(null)}>
            <PreviewModalContainer onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <FaEye style={{ color: '#ED7E13' }} />
                  Pré-visualização: {previewContract.title || 'Contrato'}
                </h3>
                <button onClick={() => setPreviewContract(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <iframe
                  src={previewContract.pdf_url || `/api/v1/contracts/download.php?uuid=${previewContract.uuid}&token=${previewContract.sign_token || ''}`}
                  title="Pré-visualização do Contrato"
                />
              </div>
            </PreviewModalContainer>
          </PreviewOverlay>
        )}

        {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (SUPERADMIN) */}
        {deleteContractItem && (
          <PreviewOverlay onClick={() => setDeleteContractItem(null)}>
            <PreviewModalContainer style={{ height: 'auto', maxHeight: '90vh', maxWidth: '540px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ background: '#991B1B' }}>
                <h3 style={{ color: '#FFFFFF', fontWeight: 700 }}>
                  <FaTrash style={{ color: '#FFFFFF' }} />
                  Confirmar Exclusão de Contrato
                </h3>
                <button onClick={() => setDeleteContractItem(null)} style={{ color: '#FFFFFF' }}>&times;</button>
              </div>
              <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                <p style={{ margin: 0, color: '#1E293B', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Tem certeza que deseja excluir o contrato <strong>"{deleteContractItem.title}"</strong> (UUID: {deleteContractItem.uuid})?
                </p>

                {deleteContractItem.status === 'SIGNED' && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '0.75rem', borderRadius: '8px', color: '#991B1B', fontSize: '0.85rem' }}>
                    <strong>⚠️ ATENÇÃO:</strong> Este contrato possui status <strong>ASSINADO</strong>. A exclusão removerá permanentemente a trilha de auditoria jurídica e o arquivo PDF.
                  </div>
                )}

                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                  <em>Esta ação requer privilégios de SuperAdmin. Administradores sem este papel receberão bloqueio HTTP 403.</em>
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setDeleteContractItem(null)}
                    style={{ padding: '0.6rem 1.2rem', minHeight: '44px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#475569', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteContract}
                    disabled={deleting}
                    style={{ padding: '0.6rem 1.2rem', minHeight: '44px', borderRadius: '8px', border: 'none', background: '#DC2626', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {deleting ? 'Excluindo...' : 'Sim, Excluir Contrato'}
                  </button>
                </div>
              </div>
            </PreviewModalContainer>
          </PreviewOverlay>
        )}

        {/* MODAL DE EDIÇÃO DE CONTRATO */}
        {editContractItem && (
          <PreviewOverlay onClick={() => setEditContractItem(null)}>
            <PreviewModalContainer style={{ height: 'auto', maxHeight: '90vh', maxWidth: '580px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ color: '#FFFFFF', fontWeight: 700 }}>
                  <FaEdit style={{ color: '#ED7E13' }} />
                  Editar Contrato
                </h3>
                <button onClick={() => setEditContractItem(null)} style={{ color: '#FFFFFF' }}>&times;</button>
              </div>
              <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                    Título do Contrato
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                    Status do Contrato
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', background: 'white' }}
                  >
                    <option value="DRAFT">Rascunho (DRAFT)</option>
                    <option value="GENERATED">Gerado (GENERATED)</option>
                    <option value="PENDING_SIGNATURE">Aguardando Assinatura (PENDING_SIGNATURE)</option>
                    <option value="SIGNED">Assinado (SIGNED)</option>
                    <option value="CANCELLED">Cancelado (CANCELLED)</option>
                    <option value="ARCHIVED">Arquivado (ARCHIVED)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setEditContractItem(null)}
                    style={{ padding: '0.6rem 1.2rem', minHeight: '44px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#475569', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditContract}
                    disabled={savingEdit}
                    style={{ padding: '0.6rem 1.2rem', minHeight: '44px', borderRadius: '8px', border: 'none', background: '#ED7E13', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {savingEdit ? 'Salvando...' : 'Salvar Alterações & Recompilar'}
                  </button>
                </div>
              </div>
            </PreviewModalContainer>
          </PreviewOverlay>
        )}

        {toastMessage && (
          <Toast>
            <FaCheckCircle style={{ color: '#ED7E13' }} /> {toastMessage}
          </Toast>
        )}
      </PageWrapper>
    </AdminLayout>
  )
}
