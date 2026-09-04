import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa'
import { ROUTES } from '../../config/routes'

const LoginWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.dark};
  padding: 1rem;
`

const LoginCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  text-align: center;
`

const Logo = styled.img`
  width: 250px;
  max-width: 80%;
  margin-bottom: 2rem;
`

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  
  & > svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textLight};
    pointer-events: none;
  }
  
  input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 1px solid #ddd;
    border-radius: 10px;
    
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
  border-radius: 10px;
  font-weight: 600;
  margin-top: 1rem;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 1rem;
  font-size: 0.9rem;
`

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.ADMIN_DASHBOARD)
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const success = await login(username, password)
    if (success) {
      navigate(ROUTES.ADMIN_DASHBOARD)
    } else {
      setError('Usuário ou senha inválidos')
    }
  }

  return (
    <LoginWrapper>
      <LoginCard>
        <Logo src="/logo.svg" alt="Body Harmony" />
        <h2 style={{ marginBottom: '2rem', color: '#1B4E6B' }}>Área Restrita</h2>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <FaUser />
            <input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </InputGroup>

          <InputGroup>
            <FaLock />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#888',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </InputGroup>

          <Button type="submit">Entrar</Button>
        </form>
      </LoginCard>
    </LoginWrapper>
  )
}
