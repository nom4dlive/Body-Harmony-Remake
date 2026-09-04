import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAlunaAuth } from '../../context/AlunaAuthContext'
import { api } from '../../services/api'
import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`
const spin   = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`

const Page = styled.div`
  min-height: 100vh;
  background: #F8FAFC; // Light clean background for Clinical Trust
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.body};
  padding: 1rem;
`

const Card = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 1rem;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  animation: ${fadeIn} 0.5s ease;
`

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  img { height: 42px; }
`

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 0.5rem;
  font-family: ${({ theme }) => theme.fonts.heading};
`

const Sub = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.95rem;
  text-align: center;
  margin: 0 0 2rem;
  line-height: 1.5;
`

const Field = styled.div`
  margin-bottom: 1.5rem;
  label {
    display: block;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  input {
    width: 100%;
    padding: 1rem 1.25rem;
    border-radius: 0.5rem;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1rem;
    font-family: inherit;
    outline: none;
    box-sizing: border-box;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
    }
  }
`

const Btn = styled.button`
  width: 100%;
  padding: 1.1rem;
  border-radius: 0.5rem;
  border: none;
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.body};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(237,126,19,0.2);
    filter: brightness(1.05);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Spinner = styled.div`
  width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff; border-radius: 50%; animation: ${spin} 0.7s linear infinite;
`

const Error = styled.p`
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #DC2626;
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-align: center;
`

export default function AlunaForceChangePassword() {
  const { aluna, clearForceChange } = useAlunaAuth()
  const navigate = useNavigate()
  const [form, setForm]   = useState({ pass1: '', pass2: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.pass1 !== form.pass2) { setError('As senhas não coincidem.'); return }
    if (form.pass1.length < 6)     { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setError(''); setLoading(true)
    try {
      await api.aluna.firstAccess(form.pass1)
      clearForceChange()
      navigate('/portal-aluna/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Erro ao redefinir senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page>
      <Card>
        <Logo><img src="/logo.svg" alt="Body Harmony" /></Logo>
        <Title>Defina sua Nova Senha</Title>
        <Sub>Olá, {aluna?.name?.split(' ')[0]}! Crie uma senha segura para continuar.</Sub>
        {error && <Error>{error}</Error>}
        <form onSubmit={handleSubmit}>
          <Field>
            <label htmlFor="fp-pass1">Nova senha</label>
            <input id="fp-pass1" name="pass1" type="password" placeholder="Mínimo 6 caracteres" value={form.pass1} onChange={onChange} required />
          </Field>
          <Field>
            <label htmlFor="fp-pass2">Confirmar senha</label>
            <input id="fp-pass2" name="pass2" type="password" placeholder="Repita a senha" value={form.pass2} onChange={onChange} required />
          </Field>
          <Btn type="submit" disabled={loading}>{loading ? <Spinner /> : 'Atualizar Senha'}</Btn>
        </form>
      </Card>
    </Page>
  )
}
