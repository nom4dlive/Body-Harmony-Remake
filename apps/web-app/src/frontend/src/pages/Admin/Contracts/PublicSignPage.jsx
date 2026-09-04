import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { 
  FaShieldAlt, FaFilePdf, FaCheckCircle, FaSpinner, FaLock, FaPenAlt,
  FaSearch, FaExpand, FaCompress, FaFont, FaMoon, FaSun, FaBookOpen,
  FaDownload, FaListUl, FaChevronDown, FaChevronUp, FaInfoCircle, FaCheck
} from 'react-icons/fa'
import { contractsApi } from '../../../services/api'
import DigitalSignaturePad from './components/DigitalSignaturePad'
import { useToast } from '../../../context/ToastContext'

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Montserrat', sans-serif;
  padding: 1.5rem 1rem 4rem 1rem;
`

const Wrapper = styled.div`
  max-width: 860px;
  margin: 0 auto;
`

const HeaderCard = styled.div`
  background: linear-gradient(135deg, #0a3e60 0%, #06263b 100%);
  color: white;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(10, 62, 96, 0.25);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(237, 126, 19, 0.08));
    pointer-events: none;
  }

  h1 {
    color: #ffffff !important;
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0.6rem 0 0 0;
    letter-spacing: 0.5px;
    line-height: 1.3;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  p {
    font-size: 0.85rem;
    color: #ed7e13;
    font-weight: 700;
    margin: 6px 0 0 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`

const LogoBadge = styled.div`
  display: inline-block;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(4px);
  padding: 0.4rem 1.2rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.15);
`

/* HIGHLIGHTS CARD */
const HighlightsContainer = styled.div`
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  margin-bottom: 1.5rem;
  overflow: hidden;
`

const HighlightsHeader = styled.button`
  width: 100%;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  color: #0a3e60;

  span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`

const HighlightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  padding: 1.25rem;
  background: white;
  border-top: 1px solid #f1f5f9;
`

const HighlightItem = styled.div`
  background: #f8fafc;
  border-radius: 10px;
  padding: 0.85rem;
  border: 1px solid #e2e8f0;

  .label {
    font-size: 0.72rem;
    font-weight: 700;
    color: #ed7e13;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .value {
    font-size: 0.85rem;
    font-weight: 700;
    color: #0a3e60;
    line-height: 1.3;
  }
`

/* DOCUMENT CARD */
const DocumentCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 1.5rem;
  position: relative;
`

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background: #e2e8f0;
`

const ProgressBarFill = styled.div`
  height: 100%;
  background: #ed7e13;
  width: ${props => props.$progress}%;
  transition: width 0.15s ease-out;
`

const ToolbarHeader = styled.div`
  padding: 0.85rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: #0a3e60;
`

const ToolsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const ToolBtn = styled.button`
  background: ${props => props.$active ? '#0a3e60' : 'white'};
  color: ${props => props.$active ? 'white' : '#475569'};
  border: 1px solid ${props => props.$active ? '#0a3e60' : '#cbd5e1'};
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;
  min-height: 36px;

  &:hover {
    border-color: #0a3e60;
    color: ${props => props.$active ? 'white' : '#0a3e60'};
  }
`

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  min-height: 36px;

  input {
    border: none;
    outline: none;
    font-size: 0.8rem;
    width: 110px;
    color: #1e293b;
    padding: 0 4px;

    @media (max-width: 480px) {
      width: 80px;
    }
  }
`

const ClauseIndexBar = styled.div`
  padding: 0.6rem 1.25rem;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`

const IndexChip = styled.button`
  white-space: nowrap;
  background: #f1f5f9;
  color: #0a3e60;
  border: 1px solid #e2e8f0;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #0a3e60;
    color: white;
    border-color: #0a3e60;
  }
`

const ContractBody = styled.div`
  padding: 1.75rem;
  max-height: ${props => props.$fullscreen ? 'calc(100vh - 120px)' : '460px'};
  overflow-y: auto;
  font-family: 'Times New Roman', Times, serif;
  font-size: ${props => props.$fontSize || '11pt'};
  line-height: 1.65;
  color: ${props => {
    if (props.$theme === 'sepia') return '#433422'
    if (props.$theme === 'dark') return '#e2e8f0'
    return '#1e293b'
  }};
  background: ${props => {
    if (props.$theme === 'sepia') return '#fdfbf7'
    if (props.$theme === 'dark') return '#1e293b'
    return '#ffffff'
  }};
  transition: background 0.3s, color 0.3s;

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
    color: ${props => props.$theme === 'dark' ? '#ed7e13' : '#0a3e60'};
    font-size: 14pt;
    text-align: center;
    margin-bottom: 12px;
  }

  h2 {
    font-family: Montserrat, sans-serif;
    color: ${props => props.$theme === 'dark' ? '#ed7e13' : '#0a3e60'};
    font-size: 12pt;
    text-align: center;
    margin-bottom: 10px;
  }

  h3 {
    font-family: Montserrat, sans-serif;
    color: ${props => props.$theme === 'dark' ? '#ed7e13' : '#0a3e60'};
    font-size: 11pt;
    margin-top: 20px;
    margin-bottom: 8px;
    border-bottom: 1px solid ${props => props.$theme === 'dark' ? '#334155' : '#ed7e13'};
    padding-bottom: 4px;
  }

  p {
    text-align: justify;
    margin-bottom: 10px;
  }

  mark.search-highlight {
    background-color: #fef08a;
    color: #0f172a;
    padding: 0 2px;
    border-radius: 2px;
    font-weight: bold;
  }
`

/* FULLSCREEN MODAL */
const FullscreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`

const FullscreenCard = styled.div`
  background: white;
  width: 100%;
  max-width: 900px;
  height: 94vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`

/* FORM CARD */
const SectionTitle = styled.div`
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
  font-size: 0.95rem;
  color: #0a3e60;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  padding: 1.75rem;
  margin-bottom: 1.5rem;
`

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: 0.82rem;
    font-weight: 700;
    color: #0a3e60;
    margin-bottom: 0.35rem;
  }

  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-size: 0.95rem;
    color: #1e293b;
    box-sizing: border-box;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #0a3e60;
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.12);
    }
  }
`

const SignButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #ed7e13 0%, #d96d07 100%);
  color: white;
  border: none;
  padding: 1.1rem;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  min-height: 54px;
  margin-top: 1.5rem;
  box-shadow: 0 6px 18px rgba(237, 126, 19, 0.35);
  transition: all 0.2s;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`

const SuccessCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #bbf7d0;
  padding: 3.5rem 2rem;
  text-align: center;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);

  .icon {
    font-size: 4rem;
    color: #16a34a;
    margin-bottom: 1.25rem;
  }

  h2 {
    color: #0a3e60;
    font-size: 1.6rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
  }

  p {
    color: #64748b;
    font-size: 0.95rem;
    margin-bottom: 2rem;
    max-width: 540px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }
`

const DownloadBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  background: #0a3e60;
  color: white;
  text-decoration: none;
  padding: 1rem 2.2rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  min-height: 50px;
  box-shadow: 0 4px 12px rgba(10, 62, 96, 0.25);
  transition: all 0.2s;

  &:hover {
    background: #06263b;
    transform: translateY(-1px);
  }
`

export default function PublicSignPage() {
  const { signToken } = useParams()
  const { showSuccess, showError, showWarning } = useToast()
  const [contractData, setContractData] = useState(null)
  const [signerName, setSignerName] = useState('')
  const [signerDoc, setSignerDoc] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [signatureData, setSignatureData] = useState(null)
  const [signatureMode, setSignatureMode] = useState('DRAWN_CANVAS')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [signedSuccess, setSignedSuccess] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')

  // UX Pro Max Reading Tools State
  const [showHighlights, setShowHighlights] = useState(true)
  const [fontSizeLevel, setFontSizeLevel] = useState(11) // 10pt, 11pt, 12pt, 13pt
  const [readerTheme, setReaderTheme] = useState('light') // light, sepia, dark
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [scrollProgress, setScrollProgress] = useState(0)

  const contractBodyRef = useRef(null)
  const fullscreenBodyRef = useRef(null)

  useEffect(() => {
    async function loadContract() {
      if (!signToken) {
        setError('Token de assinatura não informado.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await contractsApi.getPublicContract(signToken)
        if (res.ok) {
          if (res.status === 'SIGNED') {
            setSignedSuccess(true)
            setDownloadUrl(res.pdf_url)
          } else if (res.contract) {
            setContractData(res.contract)
            setSignerName(res.contract.signer_name_hint || '')
            setSignerDoc(res.contract.signer_doc_hint || '')
            setSignerEmail(res.contract.signer_email_hint || '')
          }
        } else {
          setError(res.error || 'Link de assinatura inválido ou expirado.')
        }
      } catch (err) {
        console.error(err)
        setError('Falha de conexão ao carregar o contrato.')
      } finally {
        setLoading(false)
      }
    }
    loadContract()
  }, [signToken])

  // Track Reading Scroll Progress
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    if (scrollHeight > clientHeight) {
      const progress = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100))
      setScrollProgress(progress)
    }
  }

  // Jump to specific clause heading
  const scrollToClause = (clauseQuery, targetRef = contractBodyRef) => {
    if (!targetRef.current) return
    const container = targetRef.current
    const headings = container.querySelectorAll('h3, h2, p')
    for (let el of headings) {
      if (el.textContent.toUpperCase().includes(clauseQuery.toUpperCase())) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      }
    }
  }

  const handleSignSubmit = async (e) => {
    e.preventDefault()
    if (!signatureData) {
      showWarning('Assinatura Pendente', 'Por favor, desenhe ou digite sua assinatura no campo abaixo antes de confirmar.')
      setError('Por favor, desenhe ou digite sua assinatura antes de confirmar.')
      return
    }
    if (!signerName.trim() || !signerDoc.trim()) {
      showWarning('Identificação Incompleta', 'Nome completo e CPF/CNPJ são obrigatórios.')
      setError('Nome e CPF/CNPJ são obrigatórios.')
      return
    }
    if (!acceptedTerms) {
      showWarning('Termos Legais', 'É necessário marcar o consentimento dos termos conforme Lei 14.063/2020.')
      setError('É necessário aceitar os termos da Lei 14.063/2020.')
      return
    }

    try {
      setSigning(true)
      setError('')

      const payload = {
        sign_token: signToken,
        signer_type: 'LICENCIADA',
        signer_name: signerName,
        signer_document: signerDoc,
        signer_email: signerEmail,
        signature_mode: signatureMode,
        signature_data_base64: signatureData,
        accepted_terms: true
      }

      const res = await contractsApi.signContract(payload)
      if (res.ok) {
        showSuccess('Contrato Assinado com Sucesso!', 'Sua assinatura digital foi registrada e criptografada com validade jurídica.')
        setSignedSuccess(true)
        setDownloadUrl(res.signed_pdf_url)
      } else {
        showError('Erro na Assinatura', res.error || 'Erro ao processar assinatura.')
        setError(res.error || 'Erro ao processar assinatura.')
      }
    } catch (err) {
      console.error(err)
      showError('Falha de Conexão', 'Erro de comunicação ao enviar assinatura.')
      setError('Erro de conexão ao enviar assinatura.')
    } finally {
      setSigning(false)
    }
  }

  // Render HTML with Search Term Highlight if active
  const getRenderedHtml = () => {
    let rawHtml = contractData?.rendered_html || ''
    if (!searchTerm.trim()) return rawHtml

    try {
      const termRegex = new RegExp(`(${searchTerm.trim()})`, 'gi')
      // Replace non-HTML tag matches with mark class
      return rawHtml.replace(/(>[^<]+<)/g, (match) => {
        return match.replace(termRegex, '<mark class="search-highlight">$1</mark>')
      })
    } catch (e) {
      return rawHtml
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <Wrapper style={{ textAlign: 'center', paddingTop: '6rem', color: '#0A3E60' }}>
          <FaSpinner className="fa-spin" size={40} />
          <p style={{ marginTop: '1.25rem', fontWeight: 700, fontSize: '1.05rem' }}>
            Carregando ambiente seguro de assinatura...
          </p>
        </Wrapper>
      </PageContainer>
    )
  }

  if (signedSuccess) {
    return (
      <PageContainer>
        <Wrapper>
          <SuccessCard>
            <div className="icon"><FaCheckCircle /></div>
            <h2>Contrato Assinado com Sucesso!</h2>
            <p>
              Sua assinatura digital foi devidamente autenticada e criptografada com Hash SHA-256 e Folha de Chancela Jurídica oficial com amparo na Lei nº 14.063/2020.
            </p>
            {downloadUrl && (
              <DownloadBtn href={downloadUrl} target="_blank">
                <FaFilePdf size={18} /> Baixar Contrato Assinado (PDF)
              </DownloadBtn>
            )}
          </SuccessCard>
        </Wrapper>
      </PageContainer>
    )
  }

  if (error && !contractData) {
    return (
      <PageContainer>
        <Wrapper style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '2.5rem 2rem', borderRadius: '16px', border: '1px solid #fecaca' }}>
            <FaLock size={42} style={{ marginBottom: '1rem' }} />
            <h2 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>Acesso Restrito</h2>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>{error}</p>
          </div>
        </Wrapper>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Wrapper>
        <HeaderCard>
          <LogoBadge>Body Harmony® Compliance</LogoBadge>
          <h1>{contractData?.title || 'Contrato de Licenciamento Body Harmony®'}</h1>
          <p>Portal de Assinatura Digital Avançada</p>
        </HeaderCard>

        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #fecaca', fontSize: '0.9rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* RECURSO 1: CARD DE DESTAQUES EXECUTIVOS */}
        <HighlightsContainer>
          <HighlightsHeader onClick={() => setShowHighlights(!showHighlights)}>
            <span>
              <FaInfoCircle style={{ color: '#ED7E13' }} /> Resumo Executivo & Pontos Chave do Contrato
            </span>
            {showHighlights ? <FaChevronUp /> : <FaChevronDown />}
          </HighlightsHeader>
          {showHighlights && (
            <HighlightsGrid>
              <HighlightItem>
                <div className="label"><FaBookOpen size={11} /> Categoria / Objeto</div>
                <div className="value">{contractData?.categoria ? `Contrato de ${contractData.categoria}` : 'Licenciamento Body Harmony®'}</div>
              </HighlightItem>
              <HighlightItem>
                <div className="label"><FaShieldAlt size={11} /> Território / Exclusividade</div>
                <div className="value">{contractData?.custom_fields?.TERRITORIO_EXCLUSIVO || contractData?.custom_fields?.CIDADE_ATUACAO || contractData?.custom_fields?.LICENCIADA_CIDADE || 'Território Credenciado Oficial'}</div>
              </HighlightItem>
              <HighlightItem>
                <div className="label"><FaCheck size={11} /> Vigência Contratual</div>
                <div className="value">{contractData?.custom_fields?.VIGENCIA_CONTRATUAL || (contractData?.categoria === 'Ouvinte' ? 'Evento / Workshop Oficial' : '24 Meses (Renovação Isenta)')}</div>
              </HighlightItem>
              <HighlightItem>
                <div className="label"><FaLock size={11} /> Foro de Eleição</div>
                <div className="value">{contractData?.custom_fields?.FORO_CIDADE ? `Comarca de ${contractData.custom_fields.FORO_CIDADE}/${contractData.custom_fields.FORO_ESTADO || 'SP'}` : 'Comarca de Assis/SP'}</div>
              </HighlightItem>
            </HighlightsGrid>
          )}
        </HighlightsContainer>

        {/* ETAPA 1: LEITURA DO CONTRATO COM BARRA DE FERRAMENTAS UX PRO MAX */}
        <DocumentCard>
          <ProgressBarContainer>
            <ProgressBarFill $progress={scrollProgress} />
          </ProgressBarContainer>

          <ToolbarHeader>
            <TitleGroup>
              <FaShieldAlt style={{ color: '#ED7E13' }} />
              <span>1. Leia o Contrato ({scrollProgress}%)</span>
              {scrollProgress >= 90 && (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <FaCheckCircle size={10} /> Leitura Completa
                </span>
              )}
            </TitleGroup>

            <ToolsGroup>
              {/* DOWNLOAD DA MINUTA EM PDF */}
              {contractData?.uuid && (
                <ToolBtn
                  as="a"
                  href={contractsApi.getDownloadDraftUrl(contractData.uuid, signToken)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  title="Baixar Minuta em PDF para Leitura Offline"
                  style={{ background: '#0a3e60', color: 'white', border: '1px solid #0a3e60' }}
                >
                  <FaDownload size={11} />
                  <span>Minuta (PDF)</span>
                </ToolBtn>
              )}

              {/* BUSCA POR TERMOS */}
              <SearchBox>
                <FaSearch size={12} style={{ color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Buscar termo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchBox>

              {/* CONTROLE DE FONTE */}
              <ToolBtn
                title="Diminuir Fonte"
                onClick={() => setFontSizeLevel(Math.max(9, fontSizeLevel - 1))}
              >
                A-
              </ToolBtn>
              <ToolBtn
                title="Aumentar Fonte"
                onClick={() => setFontSizeLevel(Math.min(15, fontSizeLevel + 1))}
              >
                A+
              </ToolBtn>

              {/* TEMAS DE LEITURA */}
              <ToolBtn
                $active={readerTheme === 'sepia'}
                title="Tema Sepia (Conforto Visual)"
                onClick={() => setReaderTheme(readerTheme === 'sepia' ? 'light' : 'sepia')}
              >
                📜 Sepia
              </ToolBtn>
              <ToolBtn
                $active={readerTheme === 'dark'}
                title="Modo Focado"
                onClick={() => setReaderTheme(readerTheme === 'dark' ? 'light' : 'dark')}
              >
                {readerTheme === 'dark' ? <FaSun /> : <FaMoon />}
              </ToolBtn>

              {/* FULLSCREEN */}
              <ToolBtn
                title="Leitura em Tela Cheia"
                onClick={() => setIsFullscreen(true)}
              >
                <FaExpand /> Expandir
              </ToolBtn>
            </ToolsGroup>
          </ToolbarHeader>

          {/* ÍNDICE INTERATIVO DE CLÁUSULAS */}
          <ClauseIndexBar>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Atalhos:</span>
            <IndexChip onClick={() => scrollToClause('CONSIDERAÇÕES PRELIMINARES')}>Considerações</IndexChip>
            <IndexChip onClick={() => scrollToClause('CLÁUSULA PRIMEIRA')}>Cláusula 1 (Objeto)</IndexChip>
            <IndexChip onClick={() => scrollToClause('CLÁUSULA QUARTA')}>Cláusula 4 (Exclusividade)</IndexChip>
            <IndexChip onClick={() => scrollToClause('CLÁUSULA SÉTIMA')}>Cláusula 7 (Valores)</IndexChip>
            <IndexChip onClick={() => scrollToClause('CLÁUSULA DÉCIMA SEXTA')}>Cláusula 16 (Propriedade)</IndexChip>
            <IndexChip onClick={() => scrollToClause('CLÁUSULA VIGÉSIMA QUINTA')}>Cláusula 25 (Foro)</IndexChip>
          </ClauseIndexBar>

          <ContractBody
            ref={contractBodyRef}
            onScroll={handleScroll}
            $fontSize={`${fontSizeLevel}pt`}
            $theme={readerTheme}
            dangerouslySetInnerHTML={{ __html: getRenderedHtml() }}
          />
        </DocumentCard>

        {/* MODAL FULLSCREEN READER SE ATIVADO */}
        {isFullscreen && (
          <FullscreenOverlay>
            <FullscreenCard>
              <ProgressBarContainer>
                <ProgressBarFill $progress={scrollProgress} />
              </ProgressBarContainer>

              <ToolbarHeader style={{ background: '#0a3e60', color: 'white' }}>
                <TitleGroup style={{ color: 'white' }}>
                  <FaBookOpen style={{ color: '#ED7E13' }} />
                  <span>Modo Leitura Imersiva ({scrollProgress}%)</span>
                  {scrollProgress >= 90 && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.15)', padding: '0.2rem 0.6rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FaCheckCircle size={10} /> Lido
                    </span>
                  )}
                </TitleGroup>

                <ToolsGroup>
                  {contractData?.uuid && (
                    <ToolBtn
                      as="a"
                      href={contractsApi.getDownloadDraftUrl(contractData.uuid, signToken)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}
                      title="Baixar Minuta PDF"
                    >
                      <FaDownload size={11} /> Minuta
                    </ToolBtn>
                  )}
                  <ToolBtn
                    style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}
                    onClick={() => setFontSizeLevel(Math.max(9, fontSizeLevel - 1))}
                  >
                    A-
                  </ToolBtn>
                  <ToolBtn
                    style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}
                    onClick={() => setFontSizeLevel(Math.min(15, fontSizeLevel + 1))}
                  >
                    A+
                  </ToolBtn>
                  <ToolBtn
                    style={{ background: '#ED7E13', color: 'white', border: 'none' }}
                    onClick={() => setIsFullscreen(false)}
                  >
                    <FaCompress /> Sair da Tela Cheia
                  </ToolBtn>
                </ToolsGroup>
              </ToolbarHeader>

              <ClauseIndexBar>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Atalhos:</span>
                <IndexChip onClick={() => scrollToClause('CONSIDERAÇÕES PRELIMINARES', fullscreenBodyRef)}>Considerações</IndexChip>
                <IndexChip onClick={() => scrollToClause('CLÁUSULA PRIMEIRA', fullscreenBodyRef)}>Cláusula 1 (Objeto)</IndexChip>
                <IndexChip onClick={() => scrollToClause('CLÁUSULA QUARTA', fullscreenBodyRef)}>Cláusula 4 (Exclusividade)</IndexChip>
                <IndexChip onClick={() => scrollToClause('CLÁUSULA SÉTIMA', fullscreenBodyRef)}>Cláusula 7 (Valores)</IndexChip>
                <IndexChip onClick={() => scrollToClause('CLÁUSULA VIGÉSIMA QUINTA', fullscreenBodyRef)}>Cláusula 25 (Foro)</IndexChip>
              </ClauseIndexBar>

              <ContractBody
                ref={fullscreenBodyRef}
                onScroll={handleScroll}
                $fullscreen={true}
                $fontSize={`${fontSizeLevel}pt`}
                $theme={readerTheme}
                dangerouslySetInnerHTML={{ __html: getRenderedHtml() }}
              />
            </FullscreenCard>
          </FullscreenOverlay>
        )}

        {/* ETAPA 2: IDENTIFICAÇÃO E ASSINATURA */}
        <form onSubmit={handleSignSubmit}>
          <FormCard>
            <SectionTitle style={{ background: 'transparent', padding: '0 0 1rem 0' }}>
              <FaPenAlt style={{ color: '#ED7E13' }} /> 2. Confirme seus Dados & Assine Digitalmente
            </SectionTitle>

            <FormGroup>
              <label>Nome Completo / Razão Social do Signatário:</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Informe seu nome completo"
                required
              />
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormGroup>
                <label>CPF ou CNPJ do Signatário:</label>
                <input
                  type="text"
                  value={signerDoc}
                  onChange={(e) => setSignerDoc(e.target.value)}
                  placeholder="000.000.000-00"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>E-mail de Notificação:</label>
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                />
              </FormGroup>
            </div>

            <DigitalSignaturePad
              signerName={signerName}
              acceptedTerms={acceptedTerms}
              onTermsChange={setAcceptedTerms}
              onSignatureChange={(dataUrl, mode) => {
                setSignatureData(dataUrl)
                setSignatureMode(mode)
              }}
            />

            <SignButton type="submit" disabled={signing || !signatureData || !acceptedTerms}>
              {signing ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />}
              {signing ? 'Autenticando Assinatura...' : 'Confirmar e Assinar Digitalmente'}
            </SignButton>
          </FormCard>
        </form>
      </Wrapper>
    </PageContainer>
  )
}
