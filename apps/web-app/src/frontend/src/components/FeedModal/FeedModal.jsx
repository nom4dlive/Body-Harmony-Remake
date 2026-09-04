import styled from 'styled-components'
import { FaTimes, FaInstagram } from 'react-icons/fa'
import InstagramGrid from '../InstagramGrid/InstagramGrid'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 1rem;
`

const Content = styled.div`
  background: white;
  width: 100%;
  max-width: 800px;
  height: 80vh;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  &:hover { color: ${({ theme }) => theme.colors.error}; }
`

const IframeWrapper = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  background: #fafafa;
  overflow-y: auto;
  padding: 1rem;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`

export default function FeedModal({ isOpen, onClose, student }) {
  if (!isOpen || !student) return null

  return (
    <Overlay onClick={onClose}>
      <Content onClick={e => e.stopPropagation()}>
        <Header>
          <Title><FaInstagram /> Feed de {student.name}</Title>
          <CloseButton onClick={onClose}><FaTimes /></CloseButton>
        </Header>
        <IframeWrapper>
          <InstagramGrid username={student.instagram} />
        </IframeWrapper>
      </Content>
    </Overlay>
  )
}
