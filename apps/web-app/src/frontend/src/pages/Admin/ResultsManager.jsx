import styled from 'styled-components'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaImage, FaUserMd, FaStar, FaRegStar, FaUpload, FaSpinner } from 'react-icons/fa'
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
  grid-template-columns: 80px 1.5fr 1fr 1.5fr 100px;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.light};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  min-width: 700px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1.5fr 1fr 1.5fr 100px;
  padding: 1rem;
  align-items: center;
  border-bottom: 1px solid #eee;
  min-width: 700px;
  
  &:last-child {
    border-bottom: none;
  }
  
  img {
    width: 60px;
    height: 60px;
    border-radius: 8px;
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
      width: 100%;
      height: 200px;
      margin-bottom: 0.5rem;
      object-fit: cover;
    }
    
    // Description
    & > div:nth-child(2) {
      font-weight: 700;
      color: ${({ theme }) => theme.colors.primary};
      font-size: 1.1rem;
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
  max-height: 90vh;
  overflow-y: auto;
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

const CATEGORIES = [
  'Celulite',
  'Flacidez',
  'Gordura Localizada',
  'Emagrecimento',
  'Pós-Operatório',
  'Outros'
]

export default function ResultsManager() {
  const { results = [], students = [], addResult, updateResult, deleteResult } = useData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    description: '',
    category: 'Gordura Localizada',
    studentId: '', // ID da licenciada
    image: '', // URL
    date: new Date().toISOString().split('T')[0]
  })

  // Helper to find student name by ID
  const getStudentName = (id) => {
    const s = students.find(st => st.id === id)
    return s ? s.name : 'N/A'
  }

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({
      description: '',
      category: 'Gordura Localizada',
      studentId: students.length > 0 ? students[0].id : '',
      image: '',
      date: new Date().toISOString().split('T')[0]
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (result) => {
    setEditingId(result.id)
    setFormData(result)
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
        setFormData(prev => ({ ...prev, image: response.url }))
      }
    } catch (error) {
      alert('Erro ao fazer upload da imagem')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja remover este resultado?')) {
      deleteResult(id)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateResult(editingId, formData)
    } else {
      addResult(formData)
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
          <h1 style={{ color: '#1B4E6B' }}>Galeria de Transformações</h1>
          <AddButton onClick={handleOpenAdd}>
            <FaPlus /> Novo Resultado
          </AddButton>
        </Header>

        <Table>
          <TableHeader>
            <div>Foto</div>
            <div>Descrição</div>
            <div>Categoria</div>
            <div>Feito por</div>
            <div>Ações</div>
          </TableHeader>
          {results.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
              Nenhum resultado cadastrado. Adicione o primeiro! 📸
            </div>
          ) : (
            results.map(result => (
              <TableRow key={result.id}>
                <img src={result.image} alt="Resultado" onError={(e) => e.target.src = 'https://placehold.co/100?text=Foto'} />
                <div>{result.description}</div>
                <div>
                  <span style={{ 
                    background: '#e3f2fd', 
                    color: '#1565c0', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem' 
                  }}>
                    {result.category}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaUserMd style={{ color: '#1B4E6B' }} />
                  {getStudentName(result.studentId)}
                </div>
                <Actions>
                  <button 
                    className="edit" 
                    onClick={() => updateResult(result.id, { pinned: !result.pinned })}
                    style={{ color: result.pinned ? '#ffd700' : '#ccc' }}
                    title="Fixar no topo"
                  >
                    {result.pinned ? <FaStar /> : <FaRegStar />}
                  </button>
                  <button className="edit" onClick={() => handleOpenEdit(result)}>
                    <FaEdit />
                  </button>
                  <button className="delete" onClick={() => handleDelete(result.id)}>
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
            <ModalTitle>{editingId ? 'Editar Resultado' : 'Novo Resultado'}</ModalTitle>
            
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Descrição do Resultado (Ex: -15cm de abdomen em 4 sessões)</label>
                <input 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required 
                  placeholder="Resumo impactante do resultado"
                />
              </FormGroup>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <label>Categoria</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Profissional Responsável</label>
                  <select 
                    value={formData.studentId} 
                    onChange={e => setFormData({...formData, studentId: e.target.value})}
                    required
                  >
                    <option value="">Selecione...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.state})</option>)}
                  </select>
                </FormGroup>
              </div>
              
              <FormGroup>
                <label>Data do Resultado</label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </FormGroup>

              <FormGroup>
                <label>URL da Foto (Antes & Depois unificados ou Resultado Final)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    placeholder="https://..." 
                    required
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
                {formData.image && (
                  <div style={{ marginTop: '1rem', height: '150px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={formData.image} alt="Preview" style={{ maxHeight: '100%' }} />
                  </div>
                )}
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
