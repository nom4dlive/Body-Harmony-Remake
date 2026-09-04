import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { FaEraser, FaPen, FaFont, FaCheckCircle, FaShieldAlt } from 'react-icons/fa'

const PadContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(10, 62, 96, 0.05);
`

const ModeSelector = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
`

const ModeButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  min-height: 44px;
  transition: all 0.2s ease;
  border: 2px solid ${({ active, theme }) => (active ? '#0A3E60' : '#e2e8f0')};
  background: ${({ active }) => (active ? '#0A3E60' : '#ffffff')};
  color: ${({ active }) => (active ? '#ffffff' : '#475569')};

  &:hover {
    border-color: #0a3e60;
  }
`

const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
  background: #f8fafc;
  border: 2px dashed ${({ hasSignature }) => (hasSignature ? '#0A3E60' : '#cbd5e1')};
  border-radius: 8px;
  overflow: hidden;
  touch-action: none;
`

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: crosshair;
  display: block;
`

const Baseline = styled.div`
  position: absolute;
  bottom: 35px;
  left: 20px;
  right: 20px;
  height: 1px;
  background: #cbd5e1;
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 0.75rem;
  color: #94a3b8;
  padding-bottom: 4px;
`

const TextInputWrapper = styled.div`
  height: 180px;
  background: #f8fafc;
  border: 2px dashed #0a3e60;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`

const CursiveInput = styled.input`
  width: 90%;
  background: transparent;
  border: none;
  border-bottom: 2px solid #0a3e60;
  font-family: 'Brush Script MT', 'Great Vibes', 'Caveat', cursive;
  font-size: 2.2rem;
  color: #0a3e60;
  text-align: center;
  padding: 0.5rem;
  outline: none;

  &::placeholder {
    font-family: sans-serif;
    font-size: 1rem;
    color: #94a3b8;
  }
`

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  min-height: 44px;

  &:hover {
    background: #e2e8f0;
    color: #334155;
  }
`

const TermsBox = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-top: 1.25rem;
  padding: 0.85rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #475569;
  cursor: pointer;
  line-height: 1.4;

  input {
    margin-top: 0.15rem;
    width: 18px;
    height: 18px;
    accent-color: #ed7e13;
    cursor: pointer;
  }
`

export default function DigitalSignaturePad({
  signerName = '',
  onSignatureChange,
  onTermsChange,
  acceptedTerms = false
}) {
  const canvasRef = useRef(null)
  const [mode, setMode] = useState('DRAW') // 'DRAW' | 'TYPE'
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [typedName, setTypedName] = useState(signerName)

  // Initialize Canvas
  useEffect(() => {
    if (mode === 'DRAW' && canvasRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * 2
      canvas.height = rect.height * 2
      const ctx = canvas.getContext('2d')
      ctx.scale(2, 2)
      ctx.strokeStyle = '#0A3E60'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }, [mode])

  // Sync Typed Name initial
  useEffect(() => {
    if (signerName && !typedName) {
      setTypedName(signerName)
    }
  }, [signerName])

  // Coordinate helper
  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const { x, y } = getCoordinates(e)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      if (onSignatureChange) {
        onSignatureChange(dataUrl, 'DRAWN_CANVAS')
      }
    }
  }

  const handleClear = () => {
    if (mode === 'DRAW' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setHasSignature(false)
      if (onSignatureChange) onSignatureChange(null, 'DRAWN_CANVAS')
    } else {
      setTypedName('')
      if (onSignatureChange) onSignatureChange(null, 'TYPED_SIGNATURE')
    }
  }

  // Generate typed signature image on canvas
  const handleTypedChange = (e) => {
    const val = e.target.value
    setTypedName(val)

    if (!val.trim()) {
      if (onSignatureChange) onSignatureChange(null, 'TYPED_SIGNATURE')
      return
    }

    // Render off-screen canvas to get Data URL
    const offCanvas = document.createElement('canvas')
    offCanvas.width = 500
    offCanvas.height = 150
    const ctx = offCanvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, 500, 150)
    ctx.fillStyle = '#0A3E60'
    ctx.font = 'italic bold 44px "Brush Script MT", "Great Vibes", cursive, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(val, 250, 75)

    const dataUrl = offCanvas.toDataURL('image/png')
    if (onSignatureChange) {
      onSignatureChange(dataUrl, 'TYPED_SIGNATURE')
    }
  }

  return (
    <PadContainer>
      <ModeSelector>
        <ModeButton
          type="button"
          active={mode === 'DRAW'}
          onClick={() => setMode('DRAW')}
        >
          <FaPen /> Desenhar na Tela
        </ModeButton>
        <ModeButton
          type="button"
          active={mode === 'TYPE'}
          onClick={() => setMode('TYPE')}
        >
          <FaFont /> Digitar Assinatura
        </ModeButton>
      </ModeSelector>

      {mode === 'DRAW' ? (
        <CanvasWrapper hasSignature={hasSignature}>
          <Canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <Baseline>
            <span>Assine com a ponta dos dedos</span>
            <span>✕</span>
          </Baseline>
        </CanvasWrapper>
      ) : (
        <TextInputWrapper>
          <CursiveInput
            type="text"
            placeholder="Digite seu nome completo aqui..."
            value={typedName}
            onChange={handleTypedChange}
            maxLength={60}
          />
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            Sua assinatura será convertida em chancela digital manuscrita oficial
          </span>
        </TextInputWrapper>
      )}

      <ActionsBar>
        <ClearButton type="button" onClick={handleClear}>
          <FaEraser /> Limpar Assinatura
        </ClearButton>
        <span style={{ fontSize: '0.8rem', color: '#0A3E60', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <FaShieldAlt style={{ color: '#ED7E13' }} /> Padrão Lei 14.063/2020
        </span>
      </ActionsBar>

      <TermsBox>
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => onTermsChange && onTermsChange(e.target.checked)}
        />
        <span>
          Declaro para todos os fins jurídicos que li, compreendi e concordo integralmente com todas as cláusulas deste contrato, outorgando a presente <strong>Assinatura Eletrônica Avançada</strong> nos termos do Art. 10, §2º da Medida Provisória nº 2.200-2/2001 e da Lei Federal nº 14.063/2020.
        </span>
      </TermsBox>
    </PadContainer>
  )
}
