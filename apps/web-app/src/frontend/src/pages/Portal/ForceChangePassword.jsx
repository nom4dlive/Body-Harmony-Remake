import React, { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useLicenciadaAuth as useStudentAuth } from '../../context/LicenciadaAuthContext'
import { ROUTES } from '../../config/routes'
import { FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 1rem;
`

const Card = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
`

const Title = styled.h2`
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  line-height: 1.5;
`

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
    color: #444;
  }
  
  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    
    &:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
      outline: none;
    }
  }
`

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

const ErrorBox = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export default function ForceChangePassword() {
  const { student, logout } = useStudentAuth()
  const navigate = useNavigate()

  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Security check: if not logged in or not needing force change, go away
  React.useEffect(() => {
    if (!student) {
      navigate(ROUTES.PORTAL)
    } else if (!student.forceChange) {
      navigate(ROUTES.PORTAL_DASHBOARD)
    }
  }, [student, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (pass1.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (pass1 !== pass2) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      const res = await api.studentChangePasswordFirstAccess(student.id, pass1)
      if (res.success) {
        alert('Senha alterada com sucesso! Por favor, faça login com a nova senha.')
        logout()
        navigate(ROUTES.PORTAL)
      } else {
        setError(res.error || 'Erro ao alterar senha.')
      }
    } catch (err) {
      setError('Erro de conexão ou servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Card>
        <Title><FaLock /> Segurança Primeiro</Title>
        <Subtitle>
          Para sua segurança, é necessário alterar a senha padrão antes de acessar o portal.
        </Subtitle>

        {error && <ErrorBox><FaExclamationTriangle /> {error}</ErrorBox>}

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <label>Nova Senha</label>
            <input
              type="password"
              value={pass1}
              onChange={e => setPass1(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </InputGroup>

          <InputGroup>
            <label>Confirme a Nova Senha</label>
            <input
              type="password"
              value={pass2}
              onChange={e => setPass2(e.target.value)}
              placeholder="Repita a senha"
            />
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Definir Nova Senha'}
          </Button>
        </form>
      </Card>
    </Container>
  )
}
