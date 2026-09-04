import styled from 'styled-components'
import { useState, useRef } from 'react'
import { FaPlus, FaEdit, FaTrash, FaInstagram, FaUpload, FaTimes, FaChalkboardTeacher } from 'react-icons/fa'
import { useData } from '../../context/DataContext'
import { api } from '../../services/api'
import AdminLayout from './components/AdminLayout'

export const resolveMentorPhoto = (photo) => {
  if (!photo) return '/mentors/josi.png';
  if (photo.includes('joselene') || photo.includes('josi')) return '/mentors/josi.png';
  if (photo.includes('kaprice')) return '/mentors/kaprice.jpg';
  if (photo.includes('ulisses')) return '/mentors/ulisses.png';
  return photo;
};

// --- Styles ---
const PageWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  
  .title-area {
    h1 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0A3E60;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    p {
      color: #64748B;
      margin: 0.25rem 0 0 0;
      font-size: 0.92rem;
    }
  }
`

const AddButton = styled.button`
  background: #ED7E13;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(237, 126, 19, 0.25);
  transition: all 0.2s;
  
  &:hover {
    background: #d96f0e;
    transform: translateY(-1px);
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`

const Card = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(10, 62, 96, 0.06);
  border: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(10, 62, 96, 0.1);
  }
`

const CardImageWrapper = styled.div`
  height: 260px;
  width: 100%;
  position: relative;
  background: #0A3E60;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    transition: transform 0.3s;
  }

  &:hover img {
    transform: scale(1.03);
  }
`

const CardContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: #0A3E60;
  }

  .role {
    color: #ED7E13;
    font-weight: 700;
    font-size: 0.88rem;
  }

  .bio {
    color: #64748B;
    font-size: 0.88rem;
    line-height: 1.5;
    margin-top: 0.5rem;
  }
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #F1F5F9;
  background: #FAFAFA;
`

const ActionBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  
  &.edit {
    color: #0A3E60;
    &:hover { background: #F0F9FF; border-color: #0A3E60; }
  }
  &.delete {
    color: #EF4444;
    &:hover { background: #FEF2F2; border-color: #EF4444; }
  }
`

// --- Modal Styles ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(10, 62, 96, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
`

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
  label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: 600;
    color: #0A3E60;
    font-size: 0.9rem;
  }
  input, textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #0A3E60;
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
    }
  }
  textarea { min-height: 100px; resize: vertical; }
`

const SaveButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #0A3E60;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #ED7E13; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`

// --- Component ---
export default function MentorsManager() {
  const { mentors, addMentor, updateMentor, deleteMentor } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    instagram: '',
    photo: ''
  })

  // Image Upload Logic
  const fileInputRef = useRef()
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    try {
      const response = await api.uploadImage(file)
      setFormData(prev => ({ ...prev, photo: response.url }))
    } catch (error) {
      alert('Erro ao fazer upload da imagem')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (mentor = null) => {
    if (mentor) {
      setEditingId(mentor.id)
      setFormData({
        name: mentor.name,
        role: mentor.role || '',
        bio: mentor.bio || '',
        instagram: mentor.instagram || '',
        photo: mentor.photo || ''
      })
    } else {
      setEditingId(null)
      setFormData({ name: '', role: '', bio: '', instagram: '', photo: '' })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await updateMentor(editingId, formData)
      } else {
        await addMentor(formData)
      }
      setShowModal(false)
    } catch (error) {
      alert('Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este mentor?')) {
      await deleteMentor(id)
    }
  }

  return (
    <AdminLayout activePage="mentores">
      <PageWrapper>
        <Header>
          <div className="title-area">
            <h1><FaChalkboardTeacher style={{ color: '#ED7E13' }} /> Gestão de Mentores</h1>
            <p>Gerencie o corpo docente e mentores de alta performance da Body Harmony</p>
          </div>
          <AddButton onClick={() => handleOpen()}><FaPlus /> Novo Mentor</AddButton>
        </Header>

        <Grid>
          {mentors.map(mentor => {
            const photoSrc = resolveMentorPhoto(mentor.photo);
            return (
              <Card key={mentor.id}>
                <CardImageWrapper>
                  <img
                    src={photoSrc}
                    alt={mentor.name}
                    onError={(e) => {
                      e.target.src = '/mentors/josi.png';
                    }}
                  />
                </CardImageWrapper>
                <CardContent>
                  <h3>{mentor.name}</h3>
                  <div className="role">{mentor.role}</div>
                  {mentor.bio && <div className="bio">{mentor.bio}</div>}
                  {mentor.instagram && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', color: '#E1306C', fontWeight: 600, fontSize: '0.85rem' }}>
                      <FaInstagram /> {mentor.instagram}
                    </div>
                  )}
                </CardContent>
                <Actions>
                  <ActionBtn className="edit" onClick={() => handleOpen(mentor)} title="Editar Mentor"><FaEdit /></ActionBtn>
                  <ActionBtn className="delete" onClick={() => handleDelete(mentor.id)} title="Excluir Mentor"><FaTrash /></ActionBtn>
                </Actions>
              </Card>
            );
          })}
        </Grid>

        {showModal && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#0A3E60', fontSize: '1.4rem' }}>{editingId ? 'Editar Mentor' : 'Novo Mentor'}</h2>
                <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748B' }}><FaTimes /></button>
              </div>

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <label>Foto</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {formData.photo && (
                      <img
                        src={resolveMentorPhoto(formData.photo)}
                        alt="Preview"
                        onError={(e) => { e.target.src = '/mentors/josi.png'; }}
                        style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    )}
                    <button type="button" onClick={() => fileInputRef.current.click()} style={{ padding: '0.6rem 1rem', cursor: 'pointer', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 600, color: '#0A3E60' }}>
                      <FaUpload style={{ marginRight: '6px' }} /> Escolher Foto
                    </button>
                    <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                  </div>
                </FormGroup>

                <FormGroup>
                  <label>Nome Completo</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </FormGroup>

                <FormGroup>
                  <label>Cargo / Título</label>
                  <input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Ex: Fundadora e Especialista..." />
                </FormGroup>

                <FormGroup>
                  <label>Bio (Descrição)</label>
                  <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows={5} />
                </FormGroup>

                <FormGroup>
                  <label>Instagram</label>
                  <input value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="@usuario" />
                </FormGroup>

                <SaveButton type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Mentor'}
                </SaveButton>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}
      </PageWrapper>
    </AdminLayout>
  )
}
