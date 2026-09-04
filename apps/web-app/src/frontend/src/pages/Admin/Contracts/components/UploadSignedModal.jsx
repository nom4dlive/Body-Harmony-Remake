import React, { useState } from 'react'
import styled from 'styled-components'
import { FaTimes, FaCloudUploadAlt, FaFilePdf, FaCheckCircle, FaSpinner } from 'react-icons/fa'
import { contractsApi } from '../../../../services/api'

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 26, 41, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`

const ModalCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  max-width: 540px;
  width: 100%;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0a3e60;
    margin: 0;
  }
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`

const DropZone = styled.div`
  border: 2px dashed ${({ isDragging, hasFile }) => (hasFile ? '#0A3E60' : isDragging ? '#ED7E13' : '#cbd5e1')};
  background: ${({ isDragging, hasFile }) => (hasFile ? '#f0fdf4' : isDragging ? '#fffbeb' : '#f8fafc')};
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.25rem;

  &:hover {
    border-color: #0a3e60;
  }
`

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #0a3e60;
  font-weight: 600;
  font-size: 0.95rem;
`

const HiddenInput = styled.input`
  display: none;
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.4rem;
  }

  input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #1e293b;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: #0a3e60;
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
    }
  }
`

const SubmitBtn = styled.button`
  width: 100%;
  background: #ed7e13;
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  transition: filter 0.2s;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ErrorMsg = styled.div`
  background: #fef2f2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  border: 1px solid #fecaca;
`

export default function UploadSignedModal({ isOpen, onClose, contract, onSuccess }) {
  const [file, setFile] = useState(null)
  const [notes, setNotes] = useState('Assinado via gov.br / digitalizado')
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !contract) return null

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0]
      if (selected.type === 'application/pdf' || selected.name.endsWith('.pdf')) {
        setFile(selected)
        setError('')
      } else {
        setError('Apenas arquivos PDF são aceitos.')
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      if (selected.type === 'application/pdf' || selected.name.endsWith('.pdf')) {
        setFile(selected)
        setError('')
      } else {
        setError('Apenas arquivos PDF são aceitos.')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Por favor, selecione o arquivo PDF assinado.')
      return
    }

    try {
      setLoading(true)
      setError('')
      const res = await contractsApi.uploadSignedContract(contract.uuid, file, notes)
      if (res && res.ok) {
        if (onSuccess) onSuccess(res)
        onClose()
      } else {
        setError(res?.error || res?.message || 'Erro ao anexar arquivo.')
      }
    } catch (err) {
      setError(err?.response?.error || err?.message || 'Falha ao processar upload do contrato.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>Anexar Contrato Assinado</h2>
          <CloseBtn onClick={onClose}>
            <FaTimes />
          </CloseBtn>
        </Header>

        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Contrato: <strong style={{ color: '#0A3E60' }}>{contract.title}</strong>
        </div>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="pdf-upload">
            <DropZone
              isDragging={isDragging}
              hasFile={!!file}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <FileInfo>
                  <FaFilePdf size={28} style={{ color: '#ED7E13' }} />
                  <div>
                    <div>{file.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </FileInfo>
              ) : (
                <>
                  <FaCloudUploadAlt size={40} style={{ color: '#0A3E60', marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 600, color: '#0A3E60', fontSize: '0.95rem' }}>
                    Arraste o PDF assinado aqui ou clique para selecionar
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    PDFs assinados via gov.br ou digitalizados de cartório (até 25MB)
                  </div>
                </>
              )}
            </DropZone>
          </label>
          <HiddenInput
            id="pdf-upload"
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
          />

          <FormGroup>
            <label>Observações / Origem da Assinatura:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Assinado digitalmente pela aluna via gov.br"
            />
          </FormGroup>

          <SubmitBtn type="submit" disabled={loading || !file}>
            {loading ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />}
            {loading ? 'Processando Upload...' : 'Confirmar e Arquivar Assinado'}
          </SubmitBtn>
        </form>
      </ModalCard>
    </ModalOverlay>
  )
}
