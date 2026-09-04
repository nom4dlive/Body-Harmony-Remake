import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { PortalNavbar } from '../components/PortalNavbar'
import { FaUser, FaSave, FaCamera, FaInstagram, FaPhone, FaKey, FaSpinner, FaCheck } from 'react-icons/fa'
import { useLicenciadaAuth as useStudentAuth } from '../../../context/LicenciadaAuthContext'
import { api } from '../../../services/api'
import { BottomNavbar } from '../../../components/BottomNavbar/BottomNavbar'
import PrivacySettings from './PrivacySettings'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #051A29 0%, #0A3E60 100%);
  padding: 2rem max(4%, 20px);
  padding-bottom: 100px;
  color: white;
`

const Header = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
  
  h1 {
    font-family: ${({ theme }) => theme.fonts?.heading || 'sans-serif'};
    font-size: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #fff;
    
    svg { color: ${({ theme }) => theme.colors?.secondary || '#ED7E13'}; }
  }
  
  p {
    color: ${({ theme }) => theme.colors?.darkTextMuted || '#94A3B8'};
    margin-top: 0.5rem;
  }
`

const ProfileCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
`

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  
  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors?.secondary || '#ED7E13'}, #D56A0C);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: white;
    font-weight: bold;
    margin-bottom: 1rem;
    border: 4px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .name {
    font-size: 1.5rem;
    font-weight: 600;
    color: #fff;
  }
  
  .username {
    color: ${({ theme }) => theme.colors?.secondary || '#ED7E13'};
    font-size: 0.9rem;
  }
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors?.darkTextMuted || '#94A3B8'};
    margin-bottom: 0.5rem;
    
    svg { color: ${({ theme }) => theme.colors?.secondary || '#ED7E13'}; }
  }
  
  input {
    width: 100%;
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors?.secondary || '#ED7E13'};
      background: rgba(255, 255, 255, 0.12);
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
`

const SaveButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${({ theme }) => theme.colors?.secondary || '#ED7E13'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 2rem;
  
  &:hover:not(:disabled) {
    background: #FF9124;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Message = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &.success {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #34D399;
  }
  
  &.error {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #F87171;
  }
`

const ProfilePage = () => {
  const { student } = useStudentAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    instagram: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (student) {
      setForm(prev => ({
        ...prev,
        name: student.name || '',
        whatsapp: student.whatsapp || '',
        instagram: student.instagram || '',
        username: student.username || ''
      }))
    }
  }, [student])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    if (form.newPassword) {
      if (form.newPassword !== form.confirmPassword) {
        setMessage({ type: 'error', text: 'As senhas não coincidem.' })
        return
      }
      if (!form.currentPassword) {
        setMessage({ type: 'error', text: 'A senha atual é obrigatória para alterar a senha.' })
        return
      }
      if (form.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' })
        return
      }
    }

    try {
      setLoading(true)

      const payload = {
        whatsapp: form.whatsapp,
        instagram: form.instagram,
        username: form.username
      }

      if (form.newPassword) {
        await api.studentChangePassword(form.currentPassword, form.newPassword)
      }

      await api.put('/auth/licenciada/profile', payload)

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))

    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar perfil. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  return (
    <Container>
      <PortalNavbar />
      <Header>
        <h1><FaUser /> Meu Perfil</h1>
        <p>Gerencie suas informações pessoais e segurança.</p>
      </Header>

      <ProfileCard>
        <AvatarSection>
          <div className="avatar">
            {student?.photo_url ? (
              <img
                src={student.photo_url.startsWith('/') ? student.photo_url : `/${student.photo_url}`}
                alt={student.name}
                onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = getInitials(student.name) }}
              />
            ) : (
              getInitials(student?.name)
            )}
          </div>
          <span className="name">{student?.name || 'Carregando...'}</span>
          <span className="username">@{student?.username || ''}</span>
        </AvatarSection>

        {message && (
          <Message className={message.type}>
            {message.type === 'success' ? <FaCheck /> : null}
            {message.text}
          </Message>
        )}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label><FaPhone /> WhatsApp</label>
            <input
              type="tel"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="Ex: 5511999999999"
            />
          </FormGroup>

          <FormGroup>
            <label><FaInstagram /> Instagram</label>
            <input
              type="text"
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              placeholder="@seuinstagram"
            />
          </FormGroup>

          <FormGroup>
            <label><FaUser /> Nome de Usuário</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="seunome"
            />
          </FormGroup>

          <FormGroup>
            <label><FaKey /> Senha Atual</label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Digite a senha atual caso vá alterar"
              autoComplete="current-password"
            />
          </FormGroup>

          <FormGroup>
            <label><FaKey /> Nova Senha (opcional)</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Deixe em branco para manter a atual"
              autoComplete="new-password"
            />
          </FormGroup>

          <FormGroup>
            <label><FaKey /> Confirmar Nova Senha</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme a nova senha"
              autoComplete="new-password"
            />
          </FormGroup>

          <SaveButton type="submit" disabled={loading}>
            {loading ? <FaSpinner className="spin" /> : <FaSave />}
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </SaveButton>
        </form>
      </ProfileCard>

      <PrivacySettings />

      <BottomNavbar />

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </Container>
  )
}

export default ProfilePage
