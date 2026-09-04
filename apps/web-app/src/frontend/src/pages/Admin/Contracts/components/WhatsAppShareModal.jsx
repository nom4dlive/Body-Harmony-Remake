import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FaTimes, FaWhatsapp, FaCopy, FaCheckCircle, FaHeart, FaBalanceScale } from 'react-icons/fa'

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
  max-width: 600px;
  width: 100%;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;

  h2 {
    font-size: 1.2rem;
    font-weight: 700;
    color: #0a3e60;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

const ToneTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const ToneTab = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.65rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  min-height: 44px;
  border: 2px solid ${({ active }) => (active ? '#25D366' : '#E2E8F0')};
  background: ${({ active }) => (active ? '#F0FDF4' : '#FFFFFF')};
  color: ${({ active }) => (active ? '#15803D' : '#64748B')};
  transition: all 0.2s;
`

const MessageArea = styled.textarea`
  width: 100%;
  height: 220px;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #1e293b;
  box-sizing: border-box;
  resize: vertical;
  outline: none;

  &:focus {
    border-color: #25d366;
    box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.15);
  }
`

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`

const CopyBtn = styled.button`
  flex: 1;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 48px;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`

const SendBtn = styled.button`
  flex: 1.5;
  background: #25d366;
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(1.08);
  }
`

export default function WhatsAppShareModal({ isOpen, onClose, contract, onCopy }) {
  const [tone, setTone] = useState('HUMAN') // 'HUMAN' | 'FORMAL'
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!contract) return
    const name = contract.licenciada_name || 'Licenciada'
    const title = contract.title || 'Contrato de Licenciamento'
    const signUrl = `${window.location.origin}${contract.sign_url}`

    if (tone === 'HUMAN') {
      setMessage(
        `Olá, ${name}! ✨\n\n` +
        `Acabamos de gerar o seu contrato (*${title}*) e ele já está prontinho para você dar uma olhada.\n\n` +
        `Peço que leia tudo com bastante atenção e, se estiver tudo certinho, você pode assinar diretamente pelo celular com 1 toque no link seguro abaixo:\n` +
        `👉 ${signUrl}\n\n` +
        `Você também pode assinar digitalmente pelo gov.br ou, se preferir, imprimir, rubricar todas as páginas e reconhecer firma em cartório.\n\n` +
        `⚠️ Só um lembrete importante: precisamos receber o documento assinado para que sua participação fique totalmente regularizada e você possa começar com a gente, combinado?\n\n` +
        `Qualquer dúvida que você tiver ao longo da leitura, pode me chamar por aqui. Estamos super à disposição para te ajudar! 💖`
      )
    } else {
      setMessage(
        `Prezada ${name},\n\n` +
        `Encaminhamos o contrato (*${title}*) para sua apreciação.\n\n` +
        `Solicitamos a leitura minuciosa do documento e, estando de acordo com os termos, que seja providenciada a respectiva assinatura eletrônica avançada no link seguro abaixo:\n` +
        `👉 ${signUrl}\n\n` +
        `Alternativamente, a assinatura poderá ser realizada por meio da plataforma gov.br ou assinatura física com reconhecimento de firma em cartório e remessa da via digitalizada em formato PDF.\n\n` +
        `Ressaltamos que a apresentação do contrato devidamente assinado é indispensável para a regularização e início das atividades.\n\n` +
        `Permanecemos à disposição para sanar quaisquer dúvidas ou esclarecimentos adicionais que se façam necessários.\n\n` +
        `Atenciosamente,\n` +
        `Equipe Jurídica – Body Harmony®`
      )
    }
  }, [contract, tone])

  if (!isOpen || !contract) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(message)
    if (onCopy) onCopy('Mensagem copiada para o WhatsApp!')
  }

  const handleSend = () => {
    const cleanPhone = (contract.licenciada_phone || '').replace(/\D/g, '')
    const encoded = encodeURIComponent(message)
    const url = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
    window.open(url, '_blank')
    onClose()
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2><FaWhatsapp style={{ color: '#25D366' }} /> Enviar Contrato no WhatsApp</h2>
          <CloseBtn onClick={onClose}><FaTimes /></CloseBtn>
        </Header>

        <ToneTabs>
          <ToneTab active={tone === 'HUMAN'} onClick={() => setTone('HUMAN')}>
            <FaHeart /> Tom Acolhedor / Humanizado
          </ToneTab>
          <ToneTab active={tone === 'FORMAL'} onClick={() => setTone('FORMAL')}>
            <FaBalanceScale /> Tom Formal / Jurídico
          </ToneTab>
        </ToneTabs>

        <MessageArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Actions>
          <CopyBtn type="button" onClick={handleCopy}>
            <FaCopy /> Copiar Texto
          </CopyBtn>
          <SendBtn type="button" onClick={handleSend}>
            <FaWhatsapp size={18} /> Abrir WhatsApp Web / App
          </SendBtn>
        </Actions>
      </ModalCard>
    </ModalOverlay>
  )
}
