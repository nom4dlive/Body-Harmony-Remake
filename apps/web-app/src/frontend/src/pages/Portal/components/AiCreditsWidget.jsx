import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FaBrain, FaCamera, FaMicrophone, FaPlusCircle } from 'react-icons/fa'
import { api } from '../../../services/api'

const WidgetCard = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(49, 107, 156, 0.3);
  border-radius: 12px;
  padding: 1.25rem;
  backdrop-filter: blur(10px);
  margin-bottom: 1.5rem;
`

const TabTitle = styled.h4`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const CreditItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  
  &:last-child { margin-bottom: 0; }
`

const Label = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #E2E8F0;
  font-size: 0.9rem;
  
  svg { color: #94A3B8; }
`

const Value = styled.div`
  font-weight: 700;
  color: #FFFFFF;
  background: rgba(237, 126, 19, 0.15);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid rgba(237, 126, 19, 0.3);
`

const BuyButton = styled.button`
  width: 100%;
  margin-top: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  color: #94A3B8;
  padding: 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    border-style: solid;
  }
`

export function AiCreditsWidget() {
  const [credits, setCredits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    fetchCredits()
  }, [])

  const fetchCredits = async () => {
    try {
      const res = await api.doctorHarmony.getCredits()
      if (res.success) {
        setCredits(res.credits)
        setAvailable(res.available !== false)
      }
    } catch (err) {
      console.warn('[AiCredits] Failed to fetch credits (non-blocking):', err)
      setCredits({ evals_remaining: 0, audio_remaining: 0 })
      setAvailable(false)
      // Do NOT throw - allow Dashboard to continue loading
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  return (
    <WidgetCard style={{ opacity: available ? 1 : 0.6 }}>
      <TabTitle><FaBrain /> Doctor Harmony: Mentoria Clínica</TabTitle>

      <CreditItem>
        <Label><FaCamera /> Avaliações de Foto</Label>
        <Value>{credits?.evals_remaining || 0}</Value>
      </CreditItem>

      <CreditItem>
        <Label><FaMicrophone /> Notas de Áudio</Label>
        <Value>{credits?.audio_remaining || 0}</Value>
      </CreditItem>

      <BuyButton
        disabled={!available}
        onClick={() => {
          const msg = encodeURIComponent('Olá! Gostaria de adquirir mais créditos para a Doctor Harmony (Mentoria IA).')
          window.open(`https://wa.me/5518996356825?text=${msg}`, '_blank')
        }}
      >
        <FaPlusCircle /> {available ? 'Adquirir mais créditos' : 'Recurso Indisponível'}
      </BuyButton>
    </WidgetCard>
  )
}
