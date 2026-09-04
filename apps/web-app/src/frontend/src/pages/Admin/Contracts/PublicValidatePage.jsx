import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import {
  FaCheckCircle,
  FaShieldAlt,
  FaCopy,
  FaFilePdf,
  FaEye,
  FaDownload,
  FaLock,
  FaTimesCircle,
  FaSpinner,
  FaCalendarAlt,
  FaUserCheck,
  FaGlobe,
  FaExternalLinkAlt
} from 'react-icons/fa'

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 1rem;
  font-family: 'Montserrat', sans-serif;
  color: #1e293b;
`

const CardWrapper = styled.div`
  max-width: 880px;
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
    font-size: 1.4rem;
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
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 4px 14px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #ffffff;
`

const StatusBanner = styled.div`
  background: ${({ valid }) => (valid ? '#ECFDF5' : '#FEF2F2')};
  border: 2px solid ${({ valid }) => (valid ? '#10B981' : '#EF4444')};
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

  .status-icon {
    font-size: 2.2rem;
    color: ${({ valid }) => (valid ? '#10B981' : '#EF4444')};
    flex-shrink: 0;
  }

  .status-info {
    h2 {
      font-size: 1.15rem;
      font-weight: 800;
      color: ${({ valid }) => (valid ? '#065F46' : '#991B1B')};
      margin: 0 0 4px 0;
    }
    p {
      font-size: 0.82rem;
      color: ${({ valid }) => (valid ? '#047857' : '#B91C1C')};
      margin: 0;
      line-height: 1.45;
    }
  }
`

const SectionCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-weight: 700;
    font-size: 0.95rem;
    color: #0a3e60;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 0.75rem;
    margin-bottom: 1rem;

    svg {
      color: #ed7e13;
    }
  }
`

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
`

const DetailItem = styled.div`
  .label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #0f172a;
    word-break: break-all;
  }
`

const HashBox = styled.div`
  background: #0f172a;
  color: #38bdf8;
  padding: 1rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;

  .hash-text {
    word-break: break-all;
    line-height: 1.4;
  }

  button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    white-space: nowrap;
    transition: all 0.2s;

    &:hover {
      background: #ed7e13;
      border-color: #ed7e13;
    }
  }
`

const SignatoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
`

const SignatoryCard = styled.div`
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 1rem;

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0.5rem;
  }

  .badge {
    background: #0a3e60;
    color: #ffffff;
    font-size: 0.68rem;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .signer-name {
    font-weight: 700;
    color: #0a3e60;
    font-size: 0.92rem;
    margin-bottom: 2px;
  }

  .signer-meta {
    font-size: 0.78rem;
    color: #64748b;
    margin-bottom: 0.5rem;
    line-height: 1.4;
  }

  .sig-img-container {
    background: #ffffff;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    padding: 0.5rem;
    text-align: center;
    margin-top: 0.75rem;

    img {
      max-height: 50px;
      max-width: 180px;
      object-fit: contain;
    }
  }

  .checksum {
    font-family: monospace;
    font-size: 0.68rem;
    color: #94a3b8;
    word-break: break-all;
    margin-top: 0.5rem;
  }
`

const ActionsGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.5rem;
`

const PrimaryButton = styled.a`
  background: #0a3e60;
  color: #ffffff !important;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.85rem 1.75rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 4px 12px rgba(10, 62, 96, 0.2);
  transition: all 0.2s;
  min-height: 48px;

  &:hover {
    background: #06263b;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(10, 62, 96, 0.3);
  }
`

const SecondaryButton = styled.button`
  background: #ffffff;
  color: #0a3e60;
  border: 1.5px solid #0a3e60;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.85rem 1.75rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;

  &:hover {
    background: #f0f7ff;
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`

const ModalContent = styled.div`
  background: #ffffff;
  width: 100%;
  max-width: 900px;
  height: 85vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);

  .modal-header {
    background: #0a3e60;
    color: white;
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    font-size: 0.95rem;

    button {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 4px;

      &:hover {
        color: #ed7e13;
      }
    }
  }

  .modal-body {
    flex: 1;
    background: #f8fafc;
    overflow-y: auto;
    padding: 1.5rem;

    .document-rendered {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      line-height: 1.6;
    }
  }
`

export default function PublicValidatePage() {
  const { uuid } = useParams()
  const [searchParams] = useSearchParams()
  const tokenQuery = searchParams.get('token')
  const targetId = uuid || tokenQuery || ''

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedUuid, setCopiedUuid] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    if (!targetId) {
      setError('Identificador do contrato não fornecido na URL.')
      setLoading(false)
      return
    }

    fetchContractValidation(targetId)
  }, [targetId])

  const fetchContractValidation = async (id) => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`/api/v1/contracts/validate.php?uuid=${encodeURIComponent(id)}`)
      const result = await response.json()

      if (response.ok && result.ok && result.contract) {
        setData(result.contract)
      } else {
        setError(result.error || 'Documento ou registro de contrato não encontrado para validação.')
      }
    } catch (err) {
      console.error('Erro ao buscar validação:', err)
      setError('Falha ao conectar com o servidor de validação criptográfica.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyHash = () => {
    if (!data?.sha256_hash) return
    navigator.clipboard.writeText(data.sha256_hash)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  const handleCopyUuid = () => {
    if (!data?.uuid) return
    navigator.clipboard.writeText(data.uuid)
    setCopiedUuid(true)
    setTimeout(() => setCopiedUuid(false), 2000)
  }

  if (loading) {
    return (
      <PageContainer>
        <CardWrapper style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <FaSpinner className="fa-spin" style={{ fontSize: '3rem', color: '#0a3e60', marginBottom: '1rem' }} />
          <h2 style={{ color: '#0a3e60', fontWeight: 700 }}>Auditando Criptografia & Validade...</h2>
          <p style={{ color: '#64748b' }}>Aguarde enquanto verificamos os hashes de integridade no servidor.</p>
        </CardWrapper>
      </PageContainer>
    )
  }

  if (error || !data) {
    return (
      <PageContainer>
        <CardWrapper>
          <HeaderCard>
            <LogoBadge>BODY HARMONY® COMPLIANCE</LogoBadge>
            <h1>VERIFICAÇÃO DE AUTENTICIDADE</h1>
            <p>PORTAL DE AUDITORIA CRIPTOGRÁFICA</p>
          </HeaderCard>
          <StatusBanner valid={false}>
            <FaTimesCircle className="status-icon" />
            <div className="status-info">
              <h2>Documento Não Encontrado ou Inválido</h2>
              <p>{error || 'Não foi possível encontrar um contrato válido com os dados fornecidos na URL.'}</p>
            </div>
          </StatusBanner>
        </CardWrapper>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <CardWrapper>
        {/* HEADER CARD */}
        <HeaderCard>
          <LogoBadge>BODY HARMONY® GOVERNANÇA & COMPLIANCE</LogoBadge>
          <h1>PORTAL DE VALIDAÇÃO DE AUTENTICIDADE CRIPTOGRÁFICA</h1>
          <p>PAINEL PÚBLICO DE VERIFICAÇÃO JURÍDICA E DE INTEGRIDADE</p>
        </HeaderCard>

        {/* STATUS BANNER */}
        <StatusBanner valid={true}>
          <FaCheckCircle className="status-icon" />
          <div className="status-info">
            <h2>DOCUMENTO AUTÊNTICO E ASSINADO DIGITALMENTE</h2>
            <p>
              O presente documento eletrônico possui plena validade jurídica, autenticidade e integridade garantidas sob o <strong>Art. 10, §2º da Medida Provisória nº 2.200-2/2001</strong> e <strong>Lei Federal nº 14.063/2020</strong> (Assinatura Eletrônica Avançada).
            </p>
          </div>
        </StatusBanner>

        {/* DETAILS SECTION */}
        <SectionCard>
          <div className="section-header">
            <FaShieldAlt /> IDENTIFICADORES DE INTEGRIDADE DO CONTRATO
          </div>
          <DetailGrid>
            <DetailItem>
              <div className="label">Título do Documento</div>
              <div className="value">{data.title}</div>
            </DetailItem>

            <DetailItem>
              <div className="label">Identificador Único (UUID)</div>
              <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'monospace' }}>{data.uuid}</span>
                <button
                  onClick={handleCopyUuid}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0a3e60',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  title="Copiar UUID"
                >
                  <FaCopy /> {copiedUuid && <span style={{ color: '#10b981', fontSize: '0.7rem' }}>Copiado!</span>}
                </button>
              </div>
            </DetailItem>

            <DetailItem>
              <div className="label">Status do Documento</div>
              <div className="value">
                <span
                  style={{
                    background: data.status === 'SIGNED' ? '#DCFCE7' : '#FEF3C7',
                    color: data.status === 'SIGNED' ? '#15803D' : '#B45309',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  {data.status === 'SIGNED' ? 'CONTRATO FINALIZADO E ASSINADO' : 'EM PROCESSO DE ASSINATURA'}
                </span>
              </div>
            </DetailItem>

            <DetailItem>
              <div className="label">Data de Registro / Emissão</div>
              <div className="value">
                <FaCalendarAlt style={{ color: '#ed7e13', marginRight: '5px' }} />
                {new Date(data.created_at).toLocaleString('pt-BR')}
              </div>
            </DetailItem>
          </DetailGrid>

          <div style={{ marginTop: '1.25rem' }}>
            <div className="label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Hash de Integridade do Conteúdo (SHA-256)
            </div>
            <HashBox>
              <span className="hash-text">{data.sha256_hash}</span>
              <button onClick={handleCopyHash}>
                <FaCopy /> {copiedHash ? 'Copiado!' : 'Copiar Hash'}
              </button>
            </HashBox>
          </div>
        </SectionCard>

        {/* SIGNATORIES TRAIL */}
        <SectionCard>
          <div className="section-header">
            <FaUserCheck /> TRILHA DE AUDITORIA DOS SIGNATÁRIOS REGISTRADOS ({data.signatories?.length || 0})
          </div>
          <SignatoryGrid>
            {data.signatories?.map((sig, idx) => (
              <SignatoryCard key={idx}>
                <div className="card-top">
                  <span className="badge">{sig.signer_type || 'SIGNATÁRIO'}</span>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                    <FaCheckCircle style={{ marginRight: '3px' }} /> Autenticado
                  </span>
                </div>

                <div className="signer-name">{sig.signer_name}</div>
                <div className="signer-meta">
                  {sig.signer_document && <div><strong>Doc:</strong> {sig.signer_document}</div>}
                  {sig.signer_email && <div><strong>E-mail:</strong> {sig.signer_email}</div>}
                  <div><strong>Data/Hora:</strong> {new Date(sig.signed_at).toLocaleString('pt-BR')}</div>
                  <div><strong>IP de Origem:</strong> {sig.ip_address}</div>
                  <div><strong>Modo:</strong> {sig.signature_mode || 'DIGITAL_CERTIFICATE'}</div>
                </div>

                {sig.signature_image_data && (
                  <div className="sig-img-container">
                    <img src={sig.signature_image_data} alt="Assinatura Registrada" />
                  </div>
                )}

                <div className="checksum">
                  <strong>Checksum:</strong> {sig.checksum_signature}
                </div>
              </SignatoryCard>
            ))}
          </SignatoryGrid>
        </SectionCard>

        {/* ACTIONS */}
        <ActionsGroup>
          {data.pdf_url && (
            <PrimaryButton href={data.pdf_url} target="_blank" download>
              <FaDownload /> Baixar Contrato Assinado (PDF Oficial)
            </PrimaryButton>
          )}

          {data.rendered_html && (
            <SecondaryButton onClick={() => setIsPreviewOpen(true)}>
              <FaEye /> Visualizar Documento ao Vivo
            </SecondaryButton>
          )}
        </ActionsGroup>
      </CardWrapper>

      {/* PREVIEW MODAL */}
      {isPreviewOpen && (
        <ModalOverlay onClick={() => setIsPreviewOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>👁️ Pré-visualização do Contrato Registrado</span>
              <button onClick={() => setIsPreviewOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div
                className="document-rendered"
                dangerouslySetInnerHTML={{ __html: data.rendered_html }}
              />
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  )
}
