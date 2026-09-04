import styled from 'styled-components'
import { useState } from 'react'
import { api } from '../../services/api'
import { FaLock, FaTimes, FaSave } from 'react-icons/fa'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`

const ModalCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  position: relative;
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  
  &:hover { color: ${({ theme }) => theme.colors.error}; }
`

const Title = styled.h3`
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const InputGroup = styled.div`
  margin-bottom: 1.2rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
  }
  
  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
      outline: none;
    }
  }
`

const Button = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

const ErrorMsg = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.9rem;
  background: #ffebee;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`

const SuccessMsg = styled.div`
  color: #155724;
  background: #d4edda;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`

export default function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação de senha não confere.')
      return
    }

    setLoading(true)
    try {
      await api.changePassword({ 
        current_password: currentPassword, 
        new_password: newPassword 
      })
      
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      // Auto close after 2s
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (err) {
      setError(err.message || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Overlay>
      <ModalCard>
        <CloseButton onClick={onClose}><FaTimes /></CloseButton>
        
        <Title>
          <FaLock /> Alterar Senha
        </Title>
        
        {error && <ErrorMsg>{error}</ErrorMsg>}
        {success && <SuccessMsg>Senha alterada com sucesso! Fechando...</SuccessMsg>}
        
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <label>Senha Atual</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <label>Nova Senha</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <label>Confirmar Nova Senha</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </InputGroup>

          <Button type="submit" disabled={loading || success}>
            {loading ? 'Salvando...' : <><FaSave /> Salvar Nova Senha</>}
          </Button>
        </form>
      </ModalCard>
    </Overlay>
  )
}
