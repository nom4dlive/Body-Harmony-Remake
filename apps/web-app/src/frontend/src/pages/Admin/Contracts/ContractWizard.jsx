import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import {
  FaArrowLeft, FaArrowRight, FaFileContract, FaMagic, FaCheckCircle, FaSpinner,
  FaEye, FaPen, FaUserCheck, FaMapMarkerAlt, FaDollarSign, FaEnvelope, FaPenNib,
  FaShieldAlt, FaAlignLeft, FaAlignCenter, FaAlignRight, FaImage, FaSlidersH,
  FaCheck, FaUserPlus, FaInfoCircle, FaSave
} from 'react-icons/fa'
import { useData } from '../../../context/DataContext'
import { ROUTES } from '../../../config/routes'
import { contractsApi } from '../../../services/api'
import AdminLayout from '../components/AdminLayout'

// =========================================================================
// MASK & NUMBER-TO-WORDS HELPERS
// =========================================================================
function maskCPF(v) {
  v = (v || '').replace(/\D/g, '').slice(0, 11)
  return v
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function maskCNPJ(v) {
  v = (v || '').replace(/\D/g, '').slice(0, 14)
  return v
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function maskCpfCnpj(v) {
  const clean = (v || '').replace(/\D/g, '')
  if (clean.length <= 11) return maskCPF(v)
  return maskCNPJ(v)
}

function maskCEP(v) {
  v = (v || '').replace(/\D/g, '').slice(0, 8)
  return v.replace(/(\d{5})(\d)/, '$1-$2')
}

function maskPhone(v) {
  v = (v || '').replace(/\D/g, '').slice(0, 11)
  if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  if (v.length > 5) return v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
  if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2')
  return v
}

function maskCurrency(v) {
  const clean = (v || '').replace(/\D/g, '')
  if (!clean) return ''
  const num = (parseInt(clean, 10) / 100).toFixed(2)
  const parts = num.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return parts.join(',')
}

function numeroPorExtenso(valor) {
  if (!valor) return ''
  const numericStr = String(valor).replace(/[^0-9,.]/g, '').replace(',', '.')
  const num = parseFloat(numericStr)
  if (isNaN(num)) return ''

  const inteiros = Math.floor(num)
  const centavos = Math.round((num - inteiros) * 100)

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const dezAVinte = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

  function converterCentena(n) {
    if (n === 0) return ''
    if (n === 100) return 'cem'
    let res = ''
    const c = Math.floor(n / 100)
    const d = Math.floor((n % 100) / 10)
    const u = n % 10

    if (c > 0) res += centenas[c]
    if (d === 1) {
      res += (res ? ' e ' : '') + dezAVinte[u]
    } else {
      if (d > 1) res += (res ? ' e ' : '') + dezenas[d]
      if (u > 0) res += (res ? ' e ' : '') + unidades[u]
    }
    return res
  }

  function converterMilhares(n) {
    if (n === 0) return 'zero reais'
    const partes = []
    const milhoes = Math.floor(n / 1000000)
    const milhares = Math.floor((n % 1000000) / 1000)
    const resto = n % 1000

    if (milhoes > 0) {
      partes.push(converterCentena(milhoes) + (milhoes === 1 ? ' milhão' : ' milhões'))
    }
    if (milhares > 0) {
      partes.push(milhares === 1 ? 'um mil' : converterCentena(milhares) + ' mil')
    }
    if (resto > 0) {
      partes.push(converterCentena(resto))
    }

    let texto = partes.join(' e ')
    texto += n === 1 ? ' real' : ' reais'
    return texto
  }

  let extenso = converterMilhares(inteiros)
  if (centavos > 0) {
    extenso += ' e ' + converterCentena(centavos) + (centavos === 1 ? ' centavo' : ' centavos')
  }
  return extenso
}

// =========================================================================
// STYLED COMPONENTS (LUXURY & MOBILE-FIRST)
// =========================================================================
const WizardWrapper = styled.div`
  padding: 1.5rem;
  max-width: 1440px;
  margin: 0 auto;
  padding-bottom: 100px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #0a3e60;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;

  &:hover {
    text-decoration: underline;
  }
`

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const FormCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(10, 62, 96, 0.05);
  overflow: hidden;
`

const CardHeader = styled.div`
  padding: 1.25rem 1.5rem;
  background: #0a3e60;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 1.1rem;
    margin: 0;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`

const CardBody = styled.div`
  padding: 1.5rem;
`

const ProgressBarWrapper = styled.div`
  background: #f1f5f9;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0a3e60;
`

const ProgressBarTrack = styled.div`
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
`

const ProgressBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #0a3e60, #ed7e13);
  width: ${({ pct }) => `${pct}%`};
  transition: width 0.3s ease;
`

const AutoCompleteBox = styled.div`
  background: #f0f7ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-size: 0.8rem;
    font-weight: 700;
    color: #0369a1;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.4rem;
  }

  select {
    width: 100%;
    padding: 0.65rem;
    border: 1px solid #7dd3fc;
    border-radius: 6px;
    background: #ffffff;
    font-size: 0.9rem;
    color: #0f172a;
    font-weight: 500;
    outline: none;
    cursor: pointer;

    &:focus {
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
    }
  }
`

const StepperNav = styled.div`
  display: flex;
  gap: 0.35rem;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1.25rem;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`

const StepperTab = styled.button`
  padding: 0.6rem 0.85rem;
  background: ${({ active }) => (active ? '#f8fafc' : 'transparent')};
  border: none;
  border-bottom: 3px solid ${({ active }) => (active ? '#ED7E13' : 'transparent')};
  border-radius: 6px 6px 0 0;
  color: ${({ active }) => (active ? '#0A3E60' : '#64748B')};
  font-weight: ${({ active }) => (active ? 700 : 500)};
  font-size: 0.82rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;

  &:hover {
    color: #0a3e60;
    background: #f1f5f9;
  }
`

const StatusBadge = styled.span`
  font-size: 0.72rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 700;
  background: ${({ completed }) => (completed ? '#dcfce7' : '#f1f5f9')};
  color: ${({ completed }) => (completed ? '#166534' : '#64748b')};
  border: 1px solid ${({ completed }) => (completed ? '#bbf7d0' : '#e2e8f0')};
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed #e2e8f0;

  h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: #0a3e60;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`

const FormGroup = styled.div`
  margin-bottom: 1.1rem;

  label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.82rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.35rem;

    span.req {
      color: #ef4444;
      margin-left: 2px;
    }
  }

  input, select, textarea {
    width: 100%;
    padding: 0.7rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.9rem;
    color: #1e293b;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      border-color: #0a3e60;
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
    }
  }

  .helper-text {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.25rem;
  }
`

const StepControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  gap: 0.75rem;
`

const StepNavBtn = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  transition: all 0.2s;

  &.prev {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #334155;
    &:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #0a3e60;
      color: #0a3e60;
    }
  }

  &.next {
    background: #0a3e60;
    border: 1px solid #0a3e60;
    color: #ffffff;
    &:hover:not(:disabled) {
      filter: brightness(1.15);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const PreviewCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(10, 62, 96, 0.05);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 90px;
  max-height: calc(100vh - 120px);
`

const PreviewHeader = styled.div`
  padding: 0.75rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const ViewModeToggle = styled.div`
  display: flex;
  background: #e2e8f0;
  border-radius: 6px;
  padding: 2px;
`

const ViewModeBtn = styled.button`
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: ${({ active }) => (active ? '#0A3E60' : 'transparent')};
  color: ${({ active }) => (active ? '#ffffff' : '#475569')};
  transition: all 0.2s;
`

const LogoSettingsBar = styled.div`
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.6rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.82rem;
`

const LogoOptionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;

  .label {
    font-weight: 700;
    color: #0a3e60;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8rem;
  }
`

const ControlButton = styled.button`
  padding: 0.25rem 0.55rem;
  border-radius: 4px;
  border: 1px solid ${({ active }) => (active ? '#0A3E60' : '#cbd5e1')};
  background: ${({ active }) => (active ? '#0A3E60' : '#ffffff')};
  color: ${({ active }) => (active ? '#ffffff' : '#334155')};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.15s;

  &:hover {
    border-color: #0a3e60;
  }
`

const PreviewContent = styled.div`
  padding: 2rem;
  overflow-y: auto;
  font-family: 'Times New Roman', Times, serif;
  font-size: 11pt;
  line-height: 1.6;
  color: #1e293b;
  background: #ffffff;
  flex: 1;

  .contract-logo-header {
    width: 100%;
    margin-bottom: 20px;

    img {
      height: 75px;
      width: auto;
      max-width: 280px;
      object-fit: contain;
      display: inline-block;
    }
  }

  h1 {
    font-family: Montserrat, sans-serif;
    color: #0a3e60;
    text-align: center;
    font-size: 15pt;
    margin-bottom: 6px;
  }

  h2 {
    font-family: Montserrat, sans-serif;
    color: #0a3e60;
    text-align: center;
    font-size: 13pt;
  }

  h3 {
    font-family: Montserrat, sans-serif;
    color: #0a3e60;
    font-size: 10.5pt;
    margin-top: 15px;
  }

  p {
    text-align: justify;
    margin-bottom: 10px;
  }

  .highlight-var {
    background: #fef08a;
    color: #854d0e;
    padding: 0 4px;
    border-radius: 3px;
    font-weight: bold;
    border: 1px dashed #eab308;
  }

  .filled-var {
    font-weight: 600;
    color: #0f172a;
  }
`

const WysiwygWrapper = styled.div`
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;

  .quill {
    height: 480px;
    display: flex;
    flex-direction: column;

    .ql-toolbar {
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 8px 8px 0 0;
    }
    .ql-container {
      border: 1px solid #e2e8f0;
      border-top: none;
      border-radius: 0 0 8px 8px;
      flex: 1;
      overflow-y: auto;
      font-family: 'Times New Roman', serif;
      font-size: 11pt;
    }
  }
`

const ActionFooter = styled.div`
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`

const PrimaryBtn = styled.button`
  background: #ed7e13;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  transition: filter 0.2s;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const SignedContractNoticeBanner = styled.div`
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-left: 5px solid #ed7e13;
  border-radius: 8px;
  padding: 0.85rem 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  color: #92400e;
  font-size: 0.88rem;
  line-height: 1.5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

  strong {
    color: #78350f;
    font-weight: 700;
  }
`

const ConfirmModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 62, 96, 0.6);
  backdrop-filter: blur(4px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`

const ConfirmModalCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
`

const ConfirmModalHeader = styled.div`
  background: #0A3E60;
  color: white;
  padding: 1.1rem 1.4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`

const ConfirmModalBody = styled.div`
  padding: 1.4rem;
  font-size: 0.92rem;
  color: #334155;
  line-height: 1.6;

  .mutated-list {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    margin: 0.85rem 0;
    list-style: square inside;
    color: #0f172a;
    font-weight: 600;
  }
`

const ConfirmModalFooter = styled.div`
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.4rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  user-select: none;

  input {
    width: 17px;
    height: 17px;
    accent-color: #0a3e60;
    cursor: pointer;
  }
`

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['clean']
  ]
}

// Icon mapper for section tabs
function getSectionIcon(id) {
  switch (id) {
    case 'qualificacao':
    case 'qualificacao_ouvinte':
      return <FaUserCheck />
    case 'territorialidade':
    case 'curso_observacao':
    case 'operacao':
      return <FaMapMarkerAlt />
    case 'financeiro':
    case 'financeiro_sigilo':
      return <FaDollarSign />
    case 'penalidades':
      return <FaShieldAlt />
    case 'comunicacoes':
    case 'contato':
      return <FaEnvelope />
    case 'fechamento':
    case 'fechamento_ouvinte':
      return <FaPenNib />
    default:
      return <FaFileContract />
  }
}

export default function ContractWizard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { uuid } = useParams()
  const templateQuery = searchParams.get('template')

  const { licenciadas } = useData()
  const [templates, setTemplates] = useState([])
  const [editingUuid, setEditingUuid] = useState(uuid || null)
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState(templateQuery || 'contrato-licenciamento-padrao')
  const [selectedLicenciadaId, setSelectedLicenciadaId] = useState('')
  const [contractTitle, setContractTitle] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [variables, setVariables] = useState({})
  const [isCnpjEmAbertura, setIsCnpjEmAbertura] = useState(false)
  const [autoSaveLicenciada, setAutoSaveLicenciada] = useState(false)
  const [viewMode, setViewMode] = useState('PREVIEW') // 'PREVIEW' | 'WYSIWYG'
  const [customHtml, setCustomHtml] = useState('')
  const [isCustomWysiwygModified, setIsCustomWysiwygModified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [error, setError] = useState('')
  const [existingContractStatus, setExistingContractStatus] = useState(null)
  const [initialVariables, setInitialVariables] = useState({})
  const [confirmModalData, setConfirmModalData] = useState(null)

  // Logo Customization State
  const [showLogo, setShowLogo] = useState(true)
  const [logoAlign, setLogoAlign] = useState('center') // 'left' | 'center' | 'right'
  const [logoHeight, setLogoHeight] = useState(75) // 55 | 75 | 95
  const [logoMarginBottom, setLogoMarginBottom] = useState(20)

  // Load Templates & Existing Contract Draft if UUID is provided
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const res = await contractsApi.getTemplates()
        let loadedTemplates = []
        if (res.ok && res.templates) {
          setTemplates(res.templates)
          loadedTemplates = res.templates
        }

        if (uuid) {
          const contractRes = await contractsApi.getContractByUuid(uuid)
          if (contractRes && contractRes.ok && contractRes.contract) {
            const c = contractRes.contract
            setEditingUuid(c.uuid)
            setExistingContractStatus(c.status || null)
            setContractTitle(c.title || '')
            setSelectedLicenciadaId(c.licenciada_id ? String(c.licenciada_id) : '')
            if (c.template_slug) setSelectedTemplateSlug(c.template_slug)
            
            const matchedTpl = loadedTemplates.find(t => t.slug === c.template_slug) || 
                               loadedTemplates.find(t => t.slug === 'contrato-licenciamento-padrao') || 
                               loadedTemplates[0]
            if (matchedTpl) {
              const rawHtml = matchedTpl.default_content_html || matchedTpl.content_html || ''
              const cleanHtml = rawHtml.replace(/\\n/g, ' ').replace(/\\r/g, '').replace(/\\N/g, ' ')
              setCustomHtml(cleanHtml)
            }

            if (c.variables_payload) {
              setVariables(c.variables_payload)
              setInitialVariables(c.variables_payload)
              if (c.variables_payload.IS_CNPJ_EM_ABERTURA === 'true' || c.variables_payload.IS_CNPJ_EM_ABERTURA === true) {
                setIsCnpjEmAbertura(true)
              }
            }
          }
        } else {
          const targetSlug = templateQuery || 'contrato-licenciamento-padrao'
          const defaultTpl = loadedTemplates.find(t => t.slug === targetSlug) || 
                             loadedTemplates.find(t => t.slug === 'licenciamento-padrao') || 
                             loadedTemplates[0]
          if (defaultTpl) {
            setSelectedTemplateSlug(defaultTpl.slug)
            initTemplateVariables(defaultTpl)
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do contrato:', err)
        setError('Não foi possível carregar os modelos de contrato.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [uuid, templateQuery])

  // Initialize variables from template schema
  const initTemplateVariables = (tpl) => {
    const initial = {}
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
    const today = new Date()
    const defaultDateExtenso = `${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`

    if (tpl.sections) {
      tpl.sections.forEach(sec => {
        sec.fields.forEach(f => {
          if (f.key === 'DATA_CELEBRACAO_EXTENSO' || f.key === 'DATA_EXTENSO') {
            initial[f.key] = defaultDateExtenso
          } else if (f.key === 'CIDADE_DATA_EXTENSO') {
            initial[f.key] = `Assis/SP, ${defaultDateExtenso}`
          } else {
            initial[f.key] = f.default_value || ''
          }
        })
      })
    }
    setVariables(initial)
    const rawHtml = tpl.default_content_html || tpl.content_html || ''
    const cleanHtml = rawHtml.replace(/\\n/g, ' ').replace(/\\r/g, '').replace(/\\N/g, ' ')
    setCustomHtml(cleanHtml)
    setIsCustomWysiwygModified(false)
    setContractTitle(`${tpl.title} - ${defaultDateExtenso}`)
  }

  const currentTemplate = useMemo(() => {
    return templates.find(t => t.slug === selectedTemplateSlug) || templates[0] || null
  }, [templates, selectedTemplateSlug])

  const sections = useMemo(() => {
    return currentTemplate?.sections || []
  }, [currentTemplate])

  // Handle Licenciada Auto-fill
  const handleSelectLicenciada = (licId) => {
    setSelectedLicenciadaId(licId)
    if (!licId) return

    const lic = licenciadas.find(l => String(l.id) === String(licId))
    if (!lic) return

    const updated = { ...variables }
    const docVal = lic.document || lic.cpf || ''
    const cnpjVal = lic.cnpj || ''
    const razaoVal = lic.razao_social || lic.name || ''
    const repNomeVal = lic.name || ''
    const addrStreet = lic.endereco || lic.address || ''
    const addrNum = lic.numero ? `, nº ${lic.numero}` : ''
    const addrComp = lic.complemento ? ` (${lic.complemento})` : ''
    const addrBairro = lic.bairro ? `, ${lic.bairro}` : ''
    const cityVal = lic.location || lic.city || ''
    const stateVal = lic.state || lic.uf || ''
    const cityStateVal = cityVal ? `${cityVal}/${stateVal}` : stateVal
    const fullAddrVal = addrStreet 
      ? `${addrStreet}${addrNum}${addrComp}${addrBairro}${cityStateVal ? ', ' + cityStateVal : ''}`
      : cityStateVal

    // Licenciada / Empresa
    if (updated.LICENCIADA_RAZAO_SOCIAL !== undefined) updated.LICENCIADA_RAZAO_SOCIAL = razaoVal
    if (updated.LICENCIADA_NOME_RAZAO !== undefined) updated.LICENCIADA_NOME_RAZAO = razaoVal
    if (updated.LICENCIADA_CNPJ_CPF !== undefined) updated.LICENCIADA_CNPJ_CPF = cnpjVal ? maskCNPJ(cnpjVal) : maskCPF(docVal)
    if (updated.LICENCIADA_CNPJ !== undefined) updated.LICENCIADA_CNPJ = cnpjVal ? maskCNPJ(cnpjVal) : ''
    if (updated.LICENCIADA_REPRESENTANTE_NOME !== undefined) updated.LICENCIADA_REPRESENTANTE_NOME = repNomeVal
    if (updated.LICENCIADA_REPRESENTANTE !== undefined) updated.LICENCIADA_REPRESENTANTE = repNomeVal
    if (updated.LICENCIADA_CPF !== undefined) updated.LICENCIADA_CPF = maskCPF(docVal)
    if (updated.LICENCIADA_EMAIL_OFICIAL !== undefined) updated.LICENCIADA_EMAIL_OFICIAL = lic.email || ''
    if (updated.LICENCIADA_EMAIL !== undefined) updated.LICENCIADA_EMAIL = lic.email || ''
    if (updated.LICENCIADA_TELEFONE !== undefined) updated.LICENCIADA_TELEFONE = maskPhone(lic.whatsapp || lic.phone || '')
    if (updated.LICENCIADA_INSTAGRAM !== undefined) updated.LICENCIADA_INSTAGRAM = lic.instagram || ''
    if (updated.LICENCIADA_ENDERECO !== undefined) updated.LICENCIADA_ENDERECO = fullAddrVal
    if (updated.LICENCIADA_ENDERECO_COMPLETO !== undefined) updated.LICENCIADA_ENDERECO_COMPLETO = fullAddrVal
    if (updated.LICENCIADA_CIDADE_UF !== undefined) updated.LICENCIADA_CIDADE_UF = cityStateVal
    if (updated.LICENCIADA_CEP !== undefined) updated.LICENCIADA_CEP = maskCEP(lic.cep || '')
    if (updated.ENDERECO_OPERACIONAL !== undefined) updated.ENDERECO_OPERACIONAL = fullAddrVal
    if (updated.CIDADE_OPERACIONAL !== undefined) updated.CIDADE_OPERACIONAL = cityVal || 'São Paulo'
    if (updated.ESTADO_OPERACIONAL !== undefined) updated.ESTADO_OPERACIONAL = stateVal || 'SP'
    if (updated.DELIMITACAO_TERRITORIAL !== undefined) updated.DELIMITACAO_TERRITORIAL = cityStateVal

    // Ouvinte
    if (updated.OUVINTE_NOME !== undefined) updated.OUVINTE_NOME = repNomeVal
    if (updated.OUVINTE_CPF !== undefined) updated.OUVINTE_CPF = maskCPF(docVal)
    if (updated.OUVINTE_ENDERECO !== undefined) updated.OUVINTE_ENDERECO = fullAddrVal
    if (updated.OUVINTE_CIDADE_UF !== undefined) updated.OUVINTE_CIDADE_UF = cityStateVal
    if (updated.OUVINTE_CEP !== undefined) updated.OUVINTE_CEP = maskCEP(lic.cep || '')
    if (updated.OUVINTE_EMAIL !== undefined) updated.OUVINTE_EMAIL = lic.email || ''
    if (updated.OUVINTE_TELEFONE !== undefined) updated.OUVINTE_TELEFONE = maskPhone(lic.whatsapp || lic.phone || '')

    setVariables(updated)
    setContractTitle(`${currentTemplate?.title || 'Contrato'} - ${razaoVal}`)

    // Se não tiver CNPJ, ativa automaticamente a cláusula de transição
    if (!cnpjVal) {
      handleToggleCnpjEmAbertura(true)
    } else {
      handleToggleCnpjEmAbertura(false)
    }
  }


  // Handle Toggle for Licenciada em Abertura de CNPJ
  const CLAUSULA_TRANSICAO_TEXTO = `PARÁGRAFO ÚNICO — CLÁUSULA DE TRANSIÇÃO DE PESSOA FÍSICA PARA PESSOA JURÍDICA: A LICENCIADA declara e garante estar em processo formal de constituição e abertura de empresa (Pessoa Jurídica). Fica desde já estabelecido que, assim que emitido o respectivo comprovante de inscrição no CNPJ e registro na Junta Comercial, a LICENCIADA compromete-se a notificar a LICENCIANTE no prazo máximo de 30 (trinta) dias para assinatura do Aditivo de Transição de Titularidade, mantendo-se a vigência e irrevogabilidade de todas as obrigações acordadas neste instrumento.`
  const CLAUSULA_TRANSICAO_HTML = `<p class="clausula-transicao-cnpj" style="text-align: justify; line-height: 1.6; font-family: 'Times New Roman', Times, serif; color: #1e293b; margin-top: 14px; margin-bottom: 14px;"><strong style="font-family: 'Times New Roman', Times, serif; color: #1e293b;">PARÁGRAFO ÚNICO — CLÁUSULA DE TRANSIÇÃO DE PESSOA FÍSICA PARA PESSOA JURÍDICA:</strong> A LICENCIADA declara e garante estar em processo formal de constituição e abertura de empresa (Pessoa Jurídica). Fica desde já estabelecido que, assim que emitido o respectivo comprovante de inscrição no CNPJ e registro na Junta Comercial, a LICENCIADA compromete-se a notificar a LICENCIANTE no prazo máximo de 30 (trinta) dias para assinatura do Aditivo de Transição de Titularidade, mantendo-se a vigência e irrevogabilidade de todas as obrigações acordadas neste instrumento.</p>`

  const handleToggleCnpjEmAbertura = (checked) => {
    setIsCnpjEmAbertura(checked)
    setVariables(prev => ({
      ...prev,
      IS_CNPJ_EM_ABERTURA: checked ? 'true' : 'false',
      CLAUSULA_TRANSICAO_CNPJ: checked ? CLAUSULA_TRANSICAO_HTML : ''
    }))
  }

  // Handle Field Change with Smart Masks and Auto-Extenso
  const handleFieldChange = (key, rawValue, type) => {
    let formattedVal = rawValue

    if (type === 'cpf') {
      formattedVal = maskCPF(rawValue)
    } else if (type === 'cnpj') {
      formattedVal = maskCNPJ(rawValue)
    } else if (type === 'cpf_cnpj') {
      formattedVal = maskCpfCnpj(rawValue)
    } else if (type === 'cep') {
      formattedVal = maskCEP(rawValue)
    } else if (type === 'phone') {
      formattedVal = maskPhone(rawValue)
    } else if (type === 'currency') {
      formattedVal = maskCurrency(rawValue)
    }

    setVariables(prev => {
      const next = { ...prev, [key]: formattedVal }

      // Auto-suggest extensive monetary text if currency changes
      if (key === 'VALOR_TAXA_INICIAL_NUM') {
        const ext = numeroPorExtenso(formattedVal)
        if (ext) next['VALOR_TAXA_INICIAL_EXTENSO'] = ext
      } else if (key === 'VALOR_TAXA_POS_CONTRATUAL_NUM') {
        const ext = numeroPorExtenso(formattedVal)
        if (ext) next['VALOR_TAXA_POS_CONTRATUAL_EXTENSO'] = ext
      } else if (key === 'VALOR_CURSO_NUM') {
        const ext = numeroPorExtenso(formattedVal)
        if (ext) next['VALOR_CURSO_EXTENSO'] = ext
      } else if (key === 'MULTA_SIGILO_NUM') {
        const ext = numeroPorExtenso(formattedVal)
        if (ext) next['MULTA_SIGILO_EXTENSO'] = ext
      }

      return next
    })
  }

  // Progress metrics
  const progressStats = useMemo(() => {
    let totalFields = 0
    let filledFields = 0

    sections.forEach(sec => {
      sec.fields.forEach(f => {
        if (f.required) {
          totalFields++
          const val = variables[f.key]
          if (val && String(val).trim().length > 0) {
            filledFields++
          }
        }
      })
    })

    const pct = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 100
    return { totalFields, filledFields, pct }
  }, [sections, variables])

  // Check section completion
  const isSectionComplete = (sec) => {
    if (!sec || !sec.fields) return true
    return sec.fields
      .filter(f => f.required)
      .every(f => variables[f.key] && String(variables[f.key]).trim().length > 0)
  }

  // Count section filled fields
  const getSectionStats = (sec) => {
    if (!sec || !sec.fields) return { filled: 0, total: 0 }
    const reqs = sec.fields.filter(f => f.required)
    const filled = reqs.filter(f => variables[f.key] && String(variables[f.key]).trim().length > 0).length
    return { filled, total: reqs.length }
  }

  // Render HTML preview with highlight and responsive logo header
  const renderedPreviewHtml = useMemo(() => {
    let baseHtml = (isCustomWysiwygModified && customHtml)
      ? customHtml
      : (currentTemplate?.default_content_html || currentTemplate?.content_html || customHtml || '')
    if (!baseHtml) return ''

    // Sanitize any literal escaped \n or \r from legacy template seeds
    baseHtml = baseHtml.replace(/\\n/g, ' ').replace(/\\r/g, '').replace(/\\N/g, ' ')

    // Replace or strip CLAUSULA_TRANSICAO_CNPJ
    const shouldShowTransicao = isCnpjEmAbertura || variables.IS_CNPJ_EM_ABERTURA === 'true' || variables.IS_CNPJ_EM_ABERTURA === true
    if (shouldShowTransicao) {
      const paragraphHtml = variables.CLAUSULA_TRANSICAO_CNPJ || CLAUSULA_TRANSICAO_HTML
      if (baseHtml.includes('{{CLAUSULA_TRANSICAO_CNPJ}}')) {
        baseHtml = baseHtml.replace(/\{\{CLAUSULA_TRANSICAO_CNPJ\}\}/g, paragraphHtml)
      } else if (!baseHtml.includes('clausula-transicao-cnpj')) {
        const licRegex = /(<p[^>]*>.*?<strong>LICENCIADA:<\/strong>.*?<\/p>)/si
        if (licRegex.test(baseHtml)) {
          baseHtml = baseHtml.replace(licRegex, `$1\n${paragraphHtml}`)
        } else {
          baseHtml = baseHtml + '\n' + paragraphHtml
        }
      }
    } else {
      // Unchecked: completely strip tag and any existing clausula-transicao element
      baseHtml = baseHtml.replace(/\{\{CLAUSULA_TRANSICAO_CNPJ\}\}/g, '')
      baseHtml = baseHtml.replace(/<div\s+class=['"]clausula-transicao-cnpj['"][^>]*>.*?<\/div>/si, '')
      baseHtml = baseHtml.replace(/<p\s+class=['"]clausula-transicao-cnpj['"][^>]*>.*?<\/p>/si, '')
    }

    Object.keys(variables).forEach(k => {
      if (k === 'CLAUSULA_TRANSICAO_CNPJ' || k === 'IS_CNPJ_EM_ABERTURA') return
      const val = variables[k]
      if (val && String(val).trim().length > 0) {
        baseHtml = baseHtml.split(`{{${k}}}`).join(`<span class="filled-var">${val}</span>`)
      } else {
        const cleanTag = k.replace(/_/g, ' ')
        const styledVal = `<span class="highlight-var" title="Tag {{${k}}}">[PREENCHER: ${cleanTag}]</span>`
        baseHtml = baseHtml.split(`{{${k}}}`).join(styledVal)
      }
    })

    // Clean up any remaining unhandled system tags
    baseHtml = baseHtml.replace(/\{\{CLAUSULA_TRANSICAO_CNPJ\}\}/g, '')

    // Strip existing raw logo header to prevent duplication
    baseHtml = baseHtml.replace(/<div\s+class=['"]contract-logo-header['"][^>]*>.*?<\/div>/si, '')

    if (showLogo) {
      const logoHeader = `<div class="contract-logo-header" style="text-align: ${logoAlign}; margin-bottom: ${logoMarginBottom}px;">
        <img src="/assets/images/body-harmony-logo-color.png" alt="Body Harmony®" style="height: ${logoHeight}px; width: auto; max-width: 280px; object-fit: contain;" />
      </div>`
      baseHtml = logoHeader + baseHtml
    }

    return baseHtml
  }, [currentTemplate, customHtml, isCustomWysiwygModified, variables, isCnpjEmAbertura, showLogo, logoAlign, logoHeight, logoMarginBottom])

  const getMutatedCoreFields = () => {
    if (existingContractStatus !== 'SIGNED') return []
    const coreFields = [
      { key: 'LICENCIADA_CNPJ_CPF', label: 'CNPJ/CPF da Licenciada' },
      { key: 'LICENCIADA_CPF', label: 'CPF da Licenciada' },
      { key: 'LICENCIADA_CNPJ', label: 'CNPJ da Licenciada' },
      { key: 'LICENCIADA_RAZAO_SOCIAL', label: 'Razão Social da Licenciada' },
      { key: 'LICENCIADA_REPRESENTANTE_NOME', label: 'Nome da Representante Legal' },
      { key: 'TAXA_INICIAL_NUM', label: 'Valor da Taxa Inicial' },
      { key: 'VALOR_TAXA_INICIAL_NUM', label: 'Valor da Taxa Inicial' },
      { key: 'LICENCIADA_ENDERECO', label: 'Endereço da Licenciada' }
    ]
    const changed = []
    coreFields.forEach(f => {
      const oldV = String(initialVariables[f.key] || '').trim()
      const newV = String(variables[f.key] || '').trim()
      if (oldV && newV && oldV !== newV && !changed.includes(f.label)) {
        changed.push(f.label)
      }
    })
    return changed
  }

  const handleGenerate = async (skipConfirmation = false) => {
    if (!contractTitle.trim()) {
      setError('Por favor, informe o título do contrato.')
      return
    }

    const mutated = getMutatedCoreFields()
    if (!skipConfirmation && mutated.length > 0) {
      setConfirmModalData({
        action: 'GENERATE',
        mutatedFields: mutated
      })
      return
    }

    try {
      setGenerating(true)
      setError('')

      let baseHtml = (isCustomWysiwygModified && customHtml)
        ? customHtml
        : (currentTemplate?.default_content_html || currentTemplate?.content_html || customHtml || '')
      let finalHtml = baseHtml
      const shouldShowTransicao = isCnpjEmAbertura || variables.IS_CNPJ_EM_ABERTURA === 'true' || variables.IS_CNPJ_EM_ABERTURA === true
      const transicaoContent = shouldShowTransicao ? (variables.CLAUSULA_TRANSICAO_CNPJ || CLAUSULA_TRANSICAO_HTML) : ''

      if (finalHtml.includes('{{CLAUSULA_TRANSICAO_CNPJ}}')) {
        finalHtml = finalHtml.replace(/\{\{CLAUSULA_TRANSICAO_CNPJ\}\}/g, transicaoContent)
      } else if (shouldShowTransicao && !finalHtml.includes('clausula-transicao-cnpj')) {
        const licRegex = /(<p[^>]*>.*?<strong>LICENCIADA:<\/strong>.*?<\/p>)/si
        if (licRegex.test(finalHtml)) {
          finalHtml = finalHtml.replace(licRegex, `$1\n${transicaoContent}`)
        } else {
          finalHtml = finalHtml + '\n' + transicaoContent
        }
      }

      if (!shouldShowTransicao) {
        finalHtml = finalHtml.replace(/<div\s+class=['"]clausula-transicao-cnpj['"][^>]*>.*?<\/div>/si, '')
        finalHtml = finalHtml.replace(/<p\s+class=['"]clausula-transicao-cnpj['"][^>]*>.*?<\/p>/si, '')
      }

      Object.keys(variables).forEach(k => {
        if (k === 'CLAUSULA_TRANSICAO_CNPJ' || k === 'IS_CNPJ_EM_ABERTURA') return
        const val = variables[k] || ''
        finalHtml = finalHtml.split(`{{${k}}}`).join(val)
      })

      // Clean up any remaining unhandled system tags
      finalHtml = finalHtml.replace(/\{\{CLAUSULA_TRANSICAO_CNPJ\}\}/g, '')

      // Strip existing raw logo header and prepend configured logo header
      finalHtml = finalHtml.replace(/<div\s+class=['"]contract-logo-header['"][^>]*>.*?<\/div>/si, '')
      if (showLogo) {
        finalHtml = `<div class="contract-logo-header" style="text-align: ${logoAlign}; margin-bottom: ${logoMarginBottom}px;"><img src="/assets/images/body-harmony-logo-color.png" alt="Body Harmony®" style="height: ${logoHeight}px; width: auto; max-width: 280px; object-fit: contain;" /></div>` + finalHtml
      }

      const payload = {
        template_slug: selectedTemplateSlug,
        licenciada_id: selectedLicenciadaId ? parseInt(selectedLicenciadaId, 10) : null,
        title: contractTitle,
        variables: variables,
        custom_html: isCustomWysiwygModified ? finalHtml : null,
        auto_save_licenciada: autoSaveLicenciada,
        logo_options: {
          show_logo: showLogo,
          align: logoAlign,
          height: `${logoHeight}px`,
          margin_bottom: `${logoMarginBottom}px`
        },
        status: existingContractStatus === 'SIGNED' && mutated.length === 0 ? 'SIGNED' : 'GENERATED'
      }

      let res
      if (editingUuid) {
        res = await contractsApi.updateContract(editingUuid, payload)
      } else {
        res = await contractsApi.createContract(payload)
      }

      if (res && res.ok) {
        navigate(ROUTES.ADMIN_CONTRATOS)
      } else {
        setError(res?.error || 'Falha ao compilar contrato.')
      }
    } catch (err) {
      console.error(err)
      setError('Erro de conexão ao gerar contrato.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveDraft = async (skipConfirmation = false) => {
    if (!contractTitle.trim()) {
      setError('Por favor, informe o título do contrato antes de salvar o rascunho.')
      return
    }

    const mutated = getMutatedCoreFields()
    if (!skipConfirmation && mutated.length > 0) {
      setConfirmModalData({
        action: 'DRAFT',
        mutatedFields: mutated
      })
      return
    }

    try {
      setSavingDraft(true)
      setError('')

      let baseHtml = (isCustomWysiwygModified && customHtml)
        ? customHtml
        : (currentTemplate?.default_content_html || currentTemplate?.content_html || customHtml || '')
      let finalHtml = baseHtml
      const shouldShowTransicao = isCnpjEmAbertura || variables.IS_CNPJ_EM_ABERTURA === 'true' || variables.IS_CNPJ_EM_ABERTURA === true
      const transicaoContent = shouldShowTransicao ? (variables.CLAUSULA_TRANSICAO_CNPJ || CLAUSULA_TRANSICAO_HTML) : ''

      if (finalHtml.includes('{{CLAUSULA_TRANSICAO_CNPJ}}')) {
        finalHtml = finalHtml.replace(/\{\{CLAUSULA_TRANSICAO_CNPJ\}\}/g, transicaoContent)
      } else if (shouldShowTransicao && !finalHtml.includes('clausula-transicao-cnpj')) {
        const licRegex = /(<p[^>]*>.*?<strong>LICENCIADA:<\/strong>.*?<\/p>)/si
        if (licRegex.test(finalHtml)) {
          finalHtml = finalHtml.replace(licRegex, `$1\n${transicaoContent}`)
        } else {
          finalHtml = finalHtml + '\n' + transicaoContent
        }
      }

      if (!shouldShowTransicao) {
        finalHtml = finalHtml.replace(/<div\s+class=['"]clausula-transicao-cnpj['"][^>]*>.*?<\/div>/si, '')
        finalHtml = finalHtml.replace(/<p\s+class=['"]clausula-transicao-cnpj['"][^>]*>.*?<\/p>/si, '')
      }

      Object.keys(variables).forEach(k => {
        if (k === 'CLAUSULA_TRANSICAO_CNPJ' || k === 'IS_CNPJ_EM_ABERTURA') return
        const val = variables[k] || ''
        finalHtml = finalHtml.split(`{{${k}}}`).join(val)
      })

      // Clean up any remaining unhandled system tags
      finalHtml = finalHtml.replace(/\{\{CLAUSULA_TRANSICAO_CNPJ\}\}/g, '')

      finalHtml = finalHtml.replace(/<div\s+class=['"]contract-logo-header['"][^>]*>.*?<\/div>/si, '')
      if (showLogo) {
        finalHtml = `<div class="contract-logo-header" style="text-align: ${logoAlign}; margin-bottom: ${logoMarginBottom}px;"><img src="/assets/images/body-harmony-logo-color.png" alt="Body Harmony®" style="height: ${logoHeight}px; width: auto; max-width: 280px; object-fit: contain;" /></div>` + finalHtml
      }

      const payload = {
        template_slug: selectedTemplateSlug,
        licenciada_id: selectedLicenciadaId ? parseInt(selectedLicenciadaId, 10) : null,
        title: contractTitle,
        variables: variables,
        custom_html: isCustomWysiwygModified ? finalHtml : null,
        auto_save_licenciada: autoSaveLicenciada,
        logo_options: {
          show_logo: showLogo,
          align: logoAlign,
          height: `${logoHeight}px`,
          margin_bottom: `${logoMarginBottom}px`
        },
        status: existingContractStatus === 'SIGNED' && mutated.length === 0 ? 'SIGNED' : 'DRAFT'
      }

      let res
      if (editingUuid) {
        res = await contractsApi.updateContract(editingUuid, payload)
      } else {
        res = await contractsApi.createContract(payload)
      }

      if (res && res.ok) {
        if (res.contract?.uuid && !editingUuid) {
          setEditingUuid(res.contract.uuid)
        }
        showToast('Rascunho salvo com sucesso no sistema! 📄💾')
      } else {
        setError(res?.error || 'Falha ao salvar rascunho.')
      }
    } catch (err) {
      console.error(err)
      setError('Erro de conexão ao salvar rascunho.')
    } finally {
      setSavingDraft(false)
    }
  }

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  if (loading) {
    return (
      <AdminLayout>
        <WizardWrapper>
          <div style={{ textAlign: 'center', padding: '4rem', color: '#0A3E60' }}>
            <FaSpinner className="fa-spin" size={32} />
            <p style={{ marginTop: '1rem', fontWeight: 600 }}>Carregando assistente de contratos...</p>
          </div>
        </WizardWrapper>
      </AdminLayout>
    )
  }

  const activeSection = sections[activeTab] || sections[0]

  return (
    <AdminLayout>
      <WizardWrapper>
        <Header>
          <div>
            <BackLink to={ROUTES.ADMIN_CONTRATOS}>
              <FaArrowLeft /> Voltar para Gestão de Contratos
            </BackLink>
            <h1 style={{ color: '#0A3E60', margin: '0.5rem 0 0 0', fontSize: '1.6rem' }}>
              {editingUuid ? 'Editar Contrato / Rascunho' : 'Emissor de Contratos & Termos'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <PrimaryBtn
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft || generating}
              style={{ background: '#ffffff', color: '#0A3E60', border: '1px solid #0A3E60' }}
            >
              {savingDraft ? <FaSpinner className="fa-spin" /> : <FaSave />}
              {savingDraft ? 'Salvando...' : 'Salvar Rascunho'}
            </PrimaryBtn>
            <PrimaryBtn type="button" onClick={handleGenerate} disabled={generating || savingDraft}>
              {generating ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />}
              {generating ? 'Compilando PDF...' : 'Gerar Contrato Oficial (PDF)'}
            </PrimaryBtn>
          </div>
        </Header>

        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {existingContractStatus === 'SIGNED' && (
          <SignedContractNoticeBanner>
            <FaShieldAlt style={{ fontSize: '1.4rem', color: '#ED7E13', flexShrink: 0 }} />
            <div>
              <strong>🛡️ Modo de Retificação — Contrato Assinado:</strong>
              <span> Este documento já foi assinado pelas partes. Ajustes cosméticos e institucionais preservarão a validade jurídica das assinaturas. Caso altere dados substantivos da Licenciada (CPF/CNPJ, Razão Social, Valor, Endereço), o contrato passará para <em>PENDING_SIGNATURE</em> para nova assinatura via WhatsApp.</span>
            </div>
          </SignedContractNoticeBanner>
        )}

        <MainGrid>
          {/* LEFT: FORM BUILDER */}
          <FormCard>
            <CardHeader>
              <h2><FaFileContract /> Assistente de Preenchimento</h2>
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
                {currentTemplate?.category || 'Geral'}
              </span>
            </CardHeader>
            <CardBody>
              {/* GLOBAL TEMPLATE SELECTOR */}
              <FormGroup>
                <label>Modelo de Contrato:</label>
                <select
                  value={selectedTemplateSlug}
                  onChange={(e) => {
                    setSelectedTemplateSlug(e.target.value)
                    const tpl = templates.find(t => t.slug === e.target.value)
                    if (tpl) {
                      setActiveTab(0)
                      initTemplateVariables(tpl)
                    }
                  }}
                >
                  {templates.map(t => (
                    <option key={t.slug} value={t.slug}>
                      {t.title} ({t.category})
                    </option>
                  ))}
                </select>
              </FormGroup>

              {/* AUTO-COMPLETE BOX (OPTIONAL ATALHO) */}
              {licenciadas && licenciadas.length > 0 && (
                <AutoCompleteBox>
                  <label><FaMagic /> Atalho: Licenciada Já Cadastrada:</label>
                  <select
                    value={selectedLicenciadaId}
                    onChange={(e) => handleSelectLicenciada(e.target.value)}
                  >
                    <option value="">-- Nova Licenciada (Preencher Manualmente Abaixo) --</option>
                    {licenciadas.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name} {l.location ? `(${l.location}/${l.state})` : ''}
                      </option>
                    ))}
                  </select>
                </AutoCompleteBox>
              )}

              {/* TITLE IDENTIFIER */}
              <FormGroup>
                <label>
                  <span>Título / Identificador Interno:</span>
                  <span className="req">*</span>
                </label>
                <input
                  type="text"
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  placeholder="Ex: Contrato de Licenciamento - Yonalia Santos"
                />
              </FormGroup>

              {/* PROGRESS BAR */}
              <ProgressBarWrapper>
                <ProgressHeader>
                  <span>Progresso do Preenchimento</span>
                  <span>{progressStats.filledFields} de {progressStats.totalFields} obrigatórios ({progressStats.pct}%)</span>
                </ProgressHeader>
                <ProgressBarTrack>
                  <ProgressBarFill pct={progressStats.pct} />
                </ProgressBarTrack>
              </ProgressBarWrapper>

              {/* STEPPER TABS */}
              {sections.length > 0 && (
                <>
                  <StepperNav>
                    {sections.map((sec, idx) => {
                      const stats = getSectionStats(sec)
                      const complete = isSectionComplete(sec)
                      return (
                        <StepperTab
                          key={sec.id || idx}
                          type="button"
                          active={activeTab === idx}
                          onClick={() => setActiveTab(idx)}
                        >
                          {getSectionIcon(sec.id)}
                          <span>{sec.title}</span>
                          <StatusBadge completed={complete}>
                            {complete ? <FaCheck style={{ fontSize: '0.65rem' }} /> : `${stats.filled}/${stats.total}`}
                          </StatusBadge>
                        </StepperTab>
                      )
                    })}
                  </StepperNav>

                  {/* ACTIVE SECTION HEADER */}
                  {activeSection && (
                    <SectionHeader>
                      <h3>
                        {getSectionIcon(activeSection.id)} {activeSection.title}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Etapa {activeTab + 1} de {sections.length}
                      </span>
                    </SectionHeader>
                  )}

                  {/* TOGGLE CNPJ EM ABERTURA (SEÇÃO 1) */}
                  {activeTab === 0 && (
                    <div style={{
                      background: isCnpjEmAbertura ? '#F0F7FF' : '#F8FAFC',
                      border: isCnpjEmAbertura ? '1.5px solid #0A3E60' : '1px dashed #CBD5E1',
                      borderRadius: '10px',
                      padding: '1rem 1.25rem',
                      marginBottom: '1.25rem',
                      transition: 'all 0.2s ease'
                    }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 700,
                        color: '#0A3E60',
                        fontSize: '0.9rem',
                        userSelect: 'none'
                      }}>
                        <input
                          type="checkbox"
                          checked={isCnpjEmAbertura}
                          onChange={(e) => handleToggleCnpjEmAbertura(e.target.checked)}
                          style={{ width: '20px', height: '20px', accentColor: '#ED7E13', cursor: 'pointer' }}
                        />
                        <span>🏢 Licenciada em processo de abertura de CNPJ (Adicionar Cláusula de Transição PF ➔ PJ)</span>
                      </label>
                      {isCnpjEmAbertura && (
                        <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#475569', lineHeight: '1.45', borderLeft: '3px solid #ED7E13', paddingLeft: '0.75rem' }}>
                          <strong>Cláusula de Transição Ativada:</strong> O contrato será qualificado sob a Pessoa Física (CPF). O Parágrafo Único de compromisso de migração futura para o novo CNPJ foi inserido automaticamente no documento.
                        </div>
                      )}
                    </div>
                  )}

                  {/* ACTIVE SECTION FIELDS */}
                  {activeSection && activeSection.fields && (
                    <div>
                      {activeSection.fields.map(f => {
                        const isSelect = f.type === 'select' && f.options && f.options.length > 0
                        const isTextarea = f.type === 'textarea'
                        return (
                          <FormGroup key={f.key}>
                            <label>
                              <span>{f.label}</span>
                              {f.required && <span className="req">*</span>}
                            </label>

                            {isSelect ? (
                              <select
                                value={variables[f.key] || f.default_value || ''}
                                onChange={(e) => handleFieldChange(f.key, e.target.value, f.type)}
                              >
                                {f.options.map((opt, oIdx) => (
                                  <option key={oIdx} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : isTextarea ? (
                              <textarea
                                rows={3}
                                value={variables[f.key] || ''}
                                onChange={(e) => handleFieldChange(f.key, e.target.value, f.type)}
                                placeholder={f.placeholder || `Preencha ${f.label.toLowerCase()}...`}
                              />
                            ) : (
                              <input
                                type={f.type === 'email' ? 'email' : (f.type === 'date' ? 'date' : 'text')}
                                value={variables[f.key] || ''}
                                onChange={(e) => handleFieldChange(f.key, e.target.value, f.type)}
                                placeholder={f.placeholder || `Preencha ${f.label.toLowerCase()}...`}
                              />
                            )}

                            {f.type === 'currency' && (
                              <div className="helper-text">
                                <FaInfoCircle style={{ marginRight: '3px' }} />
                                O valor por extenso será sugerido automaticamente na cláusula correspondente.
                              </div>
                            )}
                          </FormGroup>
                        )
                      })}
                    </div>
                  )}

                  {/* STEP NAVIGATION BUTTONS */}
                  <StepControls>
                    <StepNavBtn
                      type="button"
                      className="prev"
                      disabled={activeTab === 0}
                      onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
                    >
                      <FaArrowLeft /> Seção Anterior
                    </StepNavBtn>

                    {activeTab < sections.length - 1 ? (
                      <StepNavBtn
                        type="button"
                        className="next"
                        onClick={() => setActiveTab(prev => Math.min(sections.length - 1, prev + 1))}
                      >
                        Próxima Seção <FaArrowRight />
                      </StepNavBtn>
                    ) : (
                      <StepNavBtn
                        type="button"
                        className="next"
                        style={{ background: '#16a34a', borderColor: '#16a34a' }}
                        onClick={handleGenerate}
                        disabled={generating}
                      >
                        <FaCheckCircle /> Concluir & Gerar PDF
                      </StepNavBtn>
                    )}
                  </StepControls>
                </>
              )}
            </CardBody>
          </FormCard>

          {/* RIGHT: LIVE PREVIEW & WYSIWYG EDITOR */}
          <PreviewCard>
            <PreviewHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#0A3E60' }}>
                <FaFileContract style={{ color: '#ED7E13' }} /> Visualização do Documento
              </div>
              <ViewModeToggle>
                <ViewModeBtn
                  type="button"
                  active={viewMode === 'PREVIEW'}
                  onClick={() => setViewMode('PREVIEW')}
                >
                  <FaEye /> Live Preview
                </ViewModeBtn>
                <ViewModeBtn
                  type="button"
                  active={viewMode === 'WYSIWYG'}
                  onClick={() => setViewMode('WYSIWYG')}
                >
                  <FaPen /> Edição Livre (WYSIWYG)
                </ViewModeBtn>
              </ViewModeToggle>
            </PreviewHeader>

            {/* LOGO CUSTOMIZATION TOOLBAR */}
            <LogoSettingsBar>
              <LogoOptionGroup>
                <label className="label">
                  <FaImage style={{ color: '#ED7E13' }} /> Logotipo Oficial:
                </label>
                <input
                  type="checkbox"
                  id="toggleLogo"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ED7E13' }}
                />
                <label htmlFor="toggleLogo" style={{ cursor: 'pointer', fontWeight: 600, color: '#334155', fontSize: '0.78rem' }}>
                  {showLogo ? 'Exibir no Topo' : 'Ocultar'}
                </label>
              </LogoOptionGroup>

              {showLogo && (
                <>
                  <LogoOptionGroup>
                    <span className="label">Alinhamento:</span>
                    <ControlButton
                      type="button"
                      active={logoAlign === 'left'}
                      onClick={() => setLogoAlign('left')}
                      title="Alinhar à Esquerda"
                    >
                      <FaAlignLeft />
                    </ControlButton>
                    <ControlButton
                      type="button"
                      active={logoAlign === 'center'}
                      onClick={() => setLogoAlign('center')}
                      title="Alinhar ao Centro"
                    >
                      <FaAlignCenter />
                    </ControlButton>
                    <ControlButton
                      type="button"
                      active={logoAlign === 'right'}
                      onClick={() => setLogoAlign('right')}
                      title="Alinhar à Direita"
                    >
                      <FaAlignRight />
                    </ControlButton>
                  </LogoOptionGroup>

                  <LogoOptionGroup>
                    <span className="label"><FaSlidersH /> Tamanho:</span>
                    <ControlButton
                      type="button"
                      active={logoHeight === 55}
                      onClick={() => setLogoHeight(55)}
                    >
                      P (55px)
                    </ControlButton>
                    <ControlButton
                      type="button"
                      active={logoHeight === 75}
                      onClick={() => setLogoHeight(75)}
                    >
                      M (75px)
                    </ControlButton>
                    <ControlButton
                      type="button"
                      active={logoHeight === 95}
                      onClick={() => setLogoHeight(95)}
                    >
                      G (95px)
                    </ControlButton>
                  </LogoOptionGroup>
                </>
              )}
            </LogoSettingsBar>

            {viewMode === 'PREVIEW' ? (
              <PreviewContent dangerouslySetInnerHTML={{ __html: renderedPreviewHtml }} />
            ) : (
              <WysiwygWrapper>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>
                  Edite qualquer parágrafo ou adicione cláusulas sob medida. As tags <code>{"{{TAGS}}"}</code> permanecem ativas.
                </div>
                <ReactQuill
                  theme="snow"
                  value={customHtml}
                  onChange={(val) => {
                    setCustomHtml(val)
                    setIsCustomWysiwygModified(true)
                  }}
                  modules={QUILL_MODULES}
                />
              </WysiwygWrapper>
            )}

            <ActionFooter>
              {!selectedLicenciadaId ? (
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={autoSaveLicenciada}
                    onChange={(e) => setAutoSaveLicenciada(e.target.checked)}
                  />
                  <span><FaUserPlus style={{ color: '#0a3e60' }} /> Salvar dados no cadastro de Licenciadas</span>
                </CheckboxLabel>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Vinculado à Licenciada ID #{selectedLicenciadaId}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <PrimaryBtn
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={savingDraft || generating}
                  style={{ background: '#ffffff', color: '#0A3E60', border: '1px solid #0A3E60' }}
                >
                  {savingDraft ? <FaSpinner className="fa-spin" /> : <FaSave />}
                  {savingDraft ? 'Salvando...' : 'Salvar Rascunho'}
                </PrimaryBtn>
                <PrimaryBtn onClick={handleGenerate} disabled={generating || savingDraft}>
                  {generating ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />}
                  {generating ? 'Compilando...' : 'Gerar Contrato Oficial (PDF)'}
                </PrimaryBtn>
              </div>
            </ActionFooter>
          </PreviewCard>
        </MainGrid>

        {toastMsg && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: '#0A3E60',
            color: 'white',
            padding: '0.9rem 1.4rem',
            borderRadius: '8px',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            zIndex: 2000,
            fontWeight: 600,
            fontSize: '0.9rem',
            borderLeft: '4px solid #ED7E13'
          }}>
            <FaCheckCircle style={{ color: '#25D366' }} /> {toastMsg}
          </div>
        )}

        {confirmModalData && (
          <ConfirmModalOverlay onClick={() => setConfirmModalData(null)}>
            <ConfirmModalCard onClick={(e) => e.stopPropagation()}>
              <ConfirmModalHeader>
                <h3><FaShieldAlt style={{ color: '#ED7E13' }} /> Confirmação de Retificação</h3>
                <button
                  onClick={() => setConfirmModalData(null)}
                  style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
                >
                  ×
                </button>
              </ConfirmModalHeader>
              <ConfirmModalBody>
                <p style={{ marginTop: 0 }}>
                  Você está editando um contrato que já possui <strong>status ASSINADO (SIGNED)</strong> e alterou os seguintes dados cadastrais da Licenciada:
                </p>
                <ul className="mutated-list">
                  {confirmModalData.mutatedFields.map((field, idx) => (
                    <li key={idx}>{field}</li>
                  ))}
                </ul>
                <p style={{ color: '#92400e', background: '#fffbeb', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fde68a', fontSize: '0.85rem', marginBottom: 0 }}>
                  ⚠️ <strong>Atenção Jurídica (Lei 14.063/2020):</strong> Ao salvar alterações cadastrais substantivas, este contrato transicionará para <strong>PENDING_SIGNATURE</strong> e exigirá que a Licenciada assine novamente os novos termos acordados via WhatsApp.
                </p>
              </ConfirmModalBody>
              <ConfirmModalFooter>
                <button
                  type="button"
                  onClick={() => setConfirmModalData(null)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <PrimaryBtn
                  type="button"
                  onClick={() => {
                    const act = confirmModalData.action
                    setConfirmModalData(null)
                    if (act === 'GENERATE') handleGenerate(true)
                    else if (act === 'DRAFT') handleSaveDraft(true)
                  }}
                >
                  <FaCheckCircle /> Confirmar e Salvar
                </PrimaryBtn>
              </ConfirmModalFooter>
            </ConfirmModalCard>
          </ConfirmModalOverlay>
        )}
      </WizardWrapper>
    </AdminLayout>
  )
}
