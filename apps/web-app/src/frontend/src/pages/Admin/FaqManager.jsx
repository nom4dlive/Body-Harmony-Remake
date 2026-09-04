import styled from 'styled-components'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaTrash, FaEdit, FaQuestionCircle } from 'react-icons/fa'
import { useData } from '../../context/DataContext'
import { ROUTES } from '../../config/routes'
// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  position: relative;
`

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textLight};
`

const SaveButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 1rem;
  width: 100%;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const FAQCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1rem;
    
    div:first-child {
      padding-right: 0 !important;
    }
    
    // Actions container
    div:last-child {
      align-self: flex-end;
    }
  }
`

const Question = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`

const Answer = styled.p`
  color: #666;
  line-height: 1.6;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  
  button {
    background: #f0f0f0;
    border: none;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #e0e0e0;
    }
    
    &.delete {
      color: ${({ theme }) => theme.colors.error};
      &:hover { background: #ffebee; }
    }
    
    &.edit {
      color: ${({ theme }) => theme.colors.primary};
      &:hover { background: #e3f2fd; }
    }
  }
`

// Reuse styles from other modals or define inline for simplicity
const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  input, textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: inherit;
  }
  textarea {
    min-height: 100px;
    resize: vertical;
  }
`

export default function FaqManager() {
  const { faq = [], addFaq, updateFaq, deleteFaq } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ question: '', answer: '' })

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id)
      setFormData({ question: item.question, answer: item.answer })
    } else {
      setEditingId(null)
      setFormData({ question: '', answer: '' })
    }
    setShowModal(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (editingId) {
      updateFaq(editingId, formData)
    } else {
      addFaq(formData)
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta pergunta?')) {
      deleteFaq(id)
    }
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <PageWrapper>
        <Header>
          <BackLink to={ROUTES.ADMIN_DASHBOARD}>
            <FaArrowLeft /> Voltar ao Painel
          </BackLink>
          <h1 style={{ color: '#1B4E6B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaQuestionCircle /> Gerenciar FAQ
          </h1>
          <AddButton onClick={() => handleOpenModal()}>
            <FaPlus /> Nova Pergunta
          </AddButton>
        </Header>

        <FAQList>
          {(!faq || faq.length === 0) ? (
            <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
              Nenhuma pergunta cadastrada.
            </p>
          ) : (
            faq.map(item => (
              <FAQCard key={item.id}>
                <div style={{ flex: 1, paddingRight: '2rem' }}>
                  <Question>{item.question}</Question>
                  <Answer>{item.answer}</Answer>
                </div>
                <ActionButtons>
                  <button className="edit" onClick={() => handleOpenModal(item)}>
                    <FaEdit />
                  </button>
                  <button className="delete" onClick={() => handleDelete(item.id)}>
                    <FaTrash />
                  </button>
                </ActionButtons>
              </FAQCard>
            ))
          )}
        </FAQList>

        {showModal && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>{editingId ? 'Editar Pergunta' : 'Nova Pergunta'}</h2>
                <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
              </div>
              
              <form onSubmit={handleSave}>
                <InputGroup>
                  <label>Pergunta</label>
                  <input 
                    value={formData.question} 
                    onChange={e => setFormData({...formData, question: e.target.value})}
                    required
                    placeholder="Ex: Como funciona o pagamento?"
                  />
                </InputGroup>
                
                <InputGroup>
                  <label>Resposta</label>
                  <textarea 
                    value={formData.answer} 
                    onChange={e => setFormData({...formData, answer: e.target.value})}
                    required
                    placeholder="Ex: Aceitamos PIX e Cartão..."
                  />
                </InputGroup>

                <SaveButton type="submit">
                  {editingId ? 'Salvar Alterações' : 'Adicionar Pergunta'}
                </SaveButton>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}
      </PageWrapper>
    </div>
  )
}
