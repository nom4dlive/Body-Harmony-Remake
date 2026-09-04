import styled from 'styled-components'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaQuoteRight, FaUpload, FaSpinner } from 'react-icons/fa'
import { useData } from '../../context/DataContext'
import { api } from '../../services/api'
import { ROUTES } from '../../config/routes'

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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`

const Table = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  overflow-x: auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    background: transparent;
    box-shadow: none;
    overflow: visible;
  }
`

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1.5fr 1fr 100px;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.light};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  min-width: 600px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1.5fr 1fr 100px;
  padding: 1rem;
  align-items: center;
  border-bottom: 1px solid #eee;
  min-width: 600px;
  
  &:last-child {
    border-bottom: none;
  }
  
  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: flex;
    flex-direction: column;
    background: white;
    padding: 1.5rem;
    margin-bottom: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    min-width: auto;
    gap: 0.8rem;
    position: relative;
    border-bottom: none;
    align-items: flex-start;
    
    img {
      width: 60px;
      height: 60px;
      margin-bottom: 0.5rem;
    }
    
    // Name/Role container
    & > div:nth-child(2) {
      width: 100%;
    }

    // Text container
    & > div:nth-child(3) {
      font-style: italic;
      color: #555;
      white-space: normal; // Allow text wrap on mobile
      max-width: 100%;
    }

    // Actions
    & > div:last-child {
      flex-direction: row;
      margin-top: 1rem;
      width: 100%;
      justify-content: flex-end;
      gap: 1rem;
    }
  }
`

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  button {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: ${({ theme }) => theme.transitions.fast};
    
    &.edit {
      background: ${({ theme }) => theme.colors.light};
      color: ${({ theme }) => theme.colors.primary};
      &:hover { background: #e3f2fd; }
    }
    
    &.delete {
      background: #ffebee;
      color: ${({ theme }) => theme.colors.error};
      &:hover { background: #ffcdd2; }
    }
  }
`

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
  max-width: 600px;
  position: relative;
`

const ModalTitle = styled.h3`
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
`

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textLight};
`

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.secondary};
      outline: none;
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  
  &.cancel {
    background: #f5f5f5;
    color: ${({ theme }) => theme.colors.text};
  }
  
  &.save {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`

export default function TestimonialManager() {
  const { testimonials = [], addTestimonial, updateTestimonial, deleteTestimonial } = useData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    text: '',
    photo: ''
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({
      name: '',
      role: 'licenciada Satisfeita',
      text: '',
      photo: ''
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (testimonial) => {
    setEditingId(testimonial.id)
    setFormData(testimonial)
    setIsModalOpen(true)
  }

  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await api.uploadImage(file)
      if (response.success) {
        setFormData(prev => ({ ...prev, photo: response.url }))
      }
    } catch (error) {
      alert('Erro ao fazer upload da imagem')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja remover este depoimento?')) {
      deleteTestimonial(id)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateTestimonial(editingId, formData)
    } else {
      addTestimonial(formData)
    }
    setIsModalOpen(false)
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <PageWrapper>
        <Header>
          <BackLink to={ROUTES.ADMIN_DASHBOARD}>
            <FaArrowLeft /> Voltar ao Painel
          </BackLink>
          <h1 style={{ color: '#1B4E6B' }}>Gerenciar Depoimentos</h1>
          <AddButton onClick={handleOpenAdd}>
            <FaPlus /> Novo Depoimento
          </AddButton>
        </Header>

        <Table>
          <TableHeader>
            <div>Foto</div>
            <div>Nome/Cargo</div>
            <div>Depoimento</div>
            <div>Ações</div>
          </TableHeader>
          {testimonials.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
              Nenhum depoimento cadastrado.
            </div>
          ) : (
            testimonials.map(t => (
              <TableRow key={t.id}>
                <img src={t.photo || 'https://ui-avatars.com/api/?name=User'} alt="Avatar" />
                <div>
                  <strong>{t.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{t.role}</div>
                </div>
                <div style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '300px'
                }}>
                  "{t.text}"
                </div>
                <Actions>
                  <button className="edit" onClick={() => handleOpenEdit(t)}>
                    <FaEdit />
                  </button>
                  <button className="delete" onClick={() => handleDelete(t.id)}>
                    <FaTrash />
                  </button>
                </Actions>
              </TableRow>
            ))
          )}
        </Table>
      </PageWrapper>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={() => setIsModalOpen(false)}>
              <FaTimes />
            </CloseButton>
            <ModalTitle>{editingId ? 'Editar Depoimento' : 'Novo Depoimento'}</ModalTitle>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Nome</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Descrição/Cargo (Ex: Licenciada - SP)</label>
                <input
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <label>Depoimento</label>
                <textarea
                  value={formData.text}
                  onChange={e => setFormData({ ...formData, text: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Foto da licenciada</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    value={formData.photo}
                    onChange={e => setFormData({ ...formData, photo: e.target.value })}
                    placeholder="https://..."
                    style={{ flex: 1 }}
                  />
                  <label
                    style={{
                      background: '#e3f2fd',
                      color: '#1565c0',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: 0
                    }}
                  >
                    {uploading ? <FaSpinner className="spin" /> : <FaUpload />}
                    <span style={{ fontSize: '0.9rem' }}>Upload</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </FormGroup>

              <ButtonGroup>
                <ModalButton type="button" className="cancel" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </ModalButton>
                <ModalButton type="submit" className="save">
                  <FaSave style={{ marginRight: '0.5rem' }} /> Salvar
                </ModalButton>
              </ButtonGroup>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  )
}
