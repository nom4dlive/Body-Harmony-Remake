import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { 
  FaShieldAlt, FaFilePdf, FaCheckCircle, FaSpinner, FaLock, FaPenAlt,
  FaDownload, FaInfoCircle, FaCheck, FaExclamationTriangle
} from 'react-icons/fa'
import { contractsApi } from '../../../services/api'
import DigitalSignaturePad from '../../Admin/Contracts/components/DigitalSignaturePad'
import ResponsiveModal from '../../../components/ui/ResponsiveModal'

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: 80vh;
  overflow-y: auto;
  padding: 0.5rem;
`

const HeaderBanner = styled.div`
  background: linear-gradient(135deg, #0a3e60 0%, #06263b 100%);
  color: white;
  border-radius: 12px;
  padding: 1.25rem 1rem;
  text-align: center;

  h2 {
    color: #ffffff !important;
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0;
  }

  p {
    color: #ed7e13;
    font-size: 0.8rem;
    font-weight: 600;
    margin: 4px 0 0 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

const AlertNotice = styled.div`
  background: #fefce8;
  border: 1px solid #fef08a;
  border-left: 4px solid #ca8a04;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  font-size: 0.82rem;
  color: #854d0e;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;

  svg {
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: 2px;
  }
`

const DocumentPaper = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
  max-height: 280px;
  overflow-y: auto;
  font-family: 'Times New Roman', Times, serif;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1e293b;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.04);

  h1, h2, h3 {
    color: #0a3e60;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  background: #f8fafc;
  padding: 0.85rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #334155;
  font-weight: 500;

  input {
    margin-top: 3px;
    accent-color: #0a3e60;
    width: 18px;
    height: 18px;
  }
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  input {
    padding: 0.65rem 0.85rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.9rem;
    color: #1e293b;

    &:focus {
      outline: none;
      border-color: #0a3e60;
      box-shadow: 0 0 0 2px rgba(10, 62, 96, 0.15);
    }
  }
`

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #ed7e13 0%, #d96f0b 100%);
  color: #ffffff;
  border: none;
  padding: 0.9rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  min-height: 48px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(237, 126, 19, 0.25);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(237, 126, 19, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const SuccessBox = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .icon {
    font-size: 3.5rem;
    color: #10b981;
  }

  h3 {
    font-size: 1.3rem;
    color: #0a3e60;
    margin: 0;
    font-weight: 800;
  }

  p {
    color: #64748b;
    font-size: 0.9rem;
    margin: 0;
    max-width: 420px;
    line-height: 1.5;
  }
`

const DownloadBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #0a3e60;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 0.5rem;

  &:hover {
    background: #08324f;
    color: white;
  }
`

export default function AlunaTermSignModal({ isOpen, term, onSigned, onClose }) {
  const [contractData, setContractData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)
  
  // Signer inputs
  const [signerName, setSignerName] = useState('')
  const [signerDoc, setSignerDoc] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  
  // Signature data from pad
  const [signatureData, setSignatureData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [signedResult, setSignedResult] = useState(null)

  useEffect(() => {
    if (!isOpen || !term?.sign_token) return

    const loadContract = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await contractsApi.getPublicContract(term.sign_token)
        if (res.ok && res.contract) {
          setContractData(res.contract)
          setSignerName(res.contract.signer_name_hint || '')
          setSignerDoc(res.contract.signer_doc_hint || '')
          setSignerEmail(res.contract.signer_email_hint || '')
        } else if (res.status === 'SIGNED') {
          setSignedResult({ pdf_url: res.pdf_url })
        } else {
          setError(res.error || 'Não foi possível carregar o termo de ciência.')
        }
      } catch (err) {
        setError(err.message || 'Erro ao comunicar com o servidor.')
      } finally {
        setLoading(false)
      }
    }

    loadContract()
  }, [isOpen, term?.sign_token])

  const handleSubmit = async () => {
    if (!agreed) {
      alert('Por favor, confirme a leitura e concordância com o termo.')
      return
    }
    if (!signerName.trim() || !signerDoc.trim()) {
      alert('Por favor, informe seu nome completo e CPF.')
      return
    }
    if (!signatureData?.signature_data_base64) {
      alert('Por favor, realize sua assinatura eletrônica no campo abaixo.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        sign_token: term.sign_token,
        signer_type: 'LICENCIADA',
        signer_name: signerName.trim(),
        signer_document: signerDoc.trim(),
        signer_email: signerEmail.trim(),
        signature_mode: signatureData.signature_mode || 'DRAWN_CANVAS',
        signature_data_base64: signatureData.signature_data_base64,
        client_timestamp: new Date().toISOString()
      }

      const res = await contractsApi.submitPublicSignature(payload)
      if (res.ok) {
        setSignedResult(res)
        if (onSigned) {
          onSigned(res)
        }
      } else {
        alert(res.error || 'Falha ao processar assinatura eletrônica.')
      }
    } catch (err) {
      alert(err.message || 'Erro ao registrar assinatura.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={() => {
        if (signedResult) {
          onClose()
        } else {
          if (confirm('A assinatura deste termo é obrigatória para acessar as aulas do curso. Deseja realmente fechar?')) {
            onClose()
          }
        }
      }}
      title="Assinatura Eletrônica Obrigatória"
      maxWidth="720px"
    >
      <ModalBody>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <FaSpinner className="fa-spin" style={{ fontSize: '2rem', color: '#0A3E60' }} />
            <p style={{ marginTop: '1rem', color: '#64748B', fontWeight: 600 }}>Carregando Termo de Ciência e Responsabilidade...</p>
          </div>
        ) : error ? (
          <AlertNotice style={{ background: '#fef2f2', borderColor: '#fecaca', borderLeftColor: '#ef4444', color: '#991b1b' }}>
            <FaExclamationTriangle />
            <div>
              <strong>Atenção:</strong> {error}
            </div>
          </AlertNotice>
        ) : signedResult ? (
          <SuccessBox>
            <FaCheckCircle className="icon" />
            <h3>Termo Assinado com Sucesso!</h3>
            <p>
              Sua assinatura digital foi registrada com autenticidade criptográfica (Art. 10 da MP 2.200-2/2001). Seu acesso às aulas está liberado.
            </p>
            {signedResult.signed_pdf_url || signedResult.pdf_url ? (
              <DownloadBtn 
                href={signedResult.signed_pdf_url || signedResult.pdf_url} 
                target="_blank" 
                rel="noreferrer"
              >
                <FaFilePdf /> Baixar Termo Assinado (PDF)
              </DownloadBtn>
            ) : null}
            <SubmitButton style={{ marginTop: '1rem', background: '#0A3E60' }} onClick={onClose}>
              <FaCheck /> Continuar para as Aulas
            </SubmitButton>
          </SuccessBox>
        ) : (
          <>
            <HeaderBanner>
              <h2>{contractData?.title || 'Termo de Ciência e Responsabilidade'}</h2>
              <p>Metodologia Body Harmony®</p>
            </HeaderBanner>

            <AlertNotice>
              <FaInfoCircle />
              <div>
                <strong>Aviso Legal Importante:</strong> Este termo formaliza a ciência de consumo imediato de metodologia autoral, irrevogabilidade e política de não-reembolso pós-liberação.
              </div>
            </AlertNotice>

            <DocumentPaper dangerouslySetInnerHTML={{ __html: contractData?.rendered_html }} />

            <CheckboxLabel>
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
              />
              <span>
                Declaro que li, compreendi e concordo integralmente com todas as cláusulas do Termo de Ciência e Responsabilidade.
              </span>
            </CheckboxLabel>

            <FormRow>
              <FormGroup>
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  value={signerName} 
                  onChange={(e) => setSignerName(e.target.value)} 
                  placeholder="Nome completo da aluna" 
                />
              </FormGroup>
              <FormGroup>
                <label>CPF</label>
                <input 
                  type="text" 
                  value={signerDoc} 
                  onChange={(e) => setSignerDoc(e.target.value)} 
                  placeholder="000.000.000-00" 
                />
              </FormGroup>
            </FormRow>

            <DigitalSignaturePad 
              signerName={signerName}
              onSignatureChange={(sig) => setSignatureData(sig)}
            />

            <SubmitButton 
              onClick={handleSubmit} 
              disabled={submitting || !agreed || !signatureData?.signature_data_base64}
            >
              {submitting ? (
                <>
                  <FaSpinner className="fa-spin" /> Registrando Assinatura & Gerando PDF...
                </>
              ) : (
                <>
                  <FaPenAlt /> Assinar Termo e Liberar Acesso
                </>
              )}
            </SubmitButton>
          </>
        )}
      </ModalBody>
    </ResponsiveModal>
  )
}