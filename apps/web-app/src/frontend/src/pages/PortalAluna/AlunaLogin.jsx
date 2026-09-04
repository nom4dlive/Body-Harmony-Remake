import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAlunaAuth } from '../../context/AlunaAuthContext'
import styled, { keyframes } from 'styled-components'
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaWhatsapp, FaRobot } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { ROUTES } from '../../config/routes'

// ── Animations ─────────────────────────────────────────────────────────────
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`

// ── Styled Components ──────────────────────────────────────────────────────
const SplitPage = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: ${({ theme }) => theme.fonts.body};
  background: #FFFFFF;
`

const ImageSide = styled.div`
  flex: 1;
  background: url('/login-bg.jpg') center/cover no-repeat;
  position: relative;
  display: none;
  
  @media (min-width: 1024px) {
    display: block;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(10, 62, 96, 0.6); // Navy tint for Clinical Trust vibe
  }
`

const FormSide = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #FFFFFF;
`

const FormContainer = styled(motion.div)`
  width: 100%;
  max-width: 440px;
`

const Logo = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  img { height: 42px; }
  p { 
    color: ${({ theme }) => theme.colors.textLight}; 
    font-size: 0.8rem; 
    margin: 0.75rem 0 0; 
    letter-spacing: 0.1em; 
    text-transform: uppercase; 
    font-weight: 600;
  }
`

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 0.5rem;
  font-family: ${({ theme }) => theme.fonts.heading};
`

const Sub = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 1rem;
  text-align: center;
  margin: 0 0 2.5rem;
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
  .input-wrap { position: relative; }
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
    transition: all 0.3s ease; 
    box-sizing: border-box;
    
    &::placeholder { color: #A0AEC0; }
    &:focus { 
      border-color: ${({ theme }) => theme.colors.primary}; 
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1); 
    }
    &[name="password"] { padding-right: 3.5rem; }
  }
`

const ToggleBtn = styled.button`
  position: absolute; right: 1.25rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #A0AEC0;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`

const ForgotPasswordLink = styled.a`
  display: block;
  text-align: right;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.85rem;
  margin-top: 0.5rem;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.colors.secondary}; }
`

const Btn = styled.button`
  width: 100%; padding: 1.1rem; border-radius: 0.5rem; border: none;
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff; font-size: 1rem; font-weight: 700; font-family: ${({ theme }) => theme.fonts.body};
  cursor: pointer; transition: all 0.3s ease;
  display: flex; align-items: center; justify-content: center; gap: 0.6rem;
  margin-top: 2rem;
  
  &:hover:not(:disabled) { 
    transform: translateY(-2px); 
    box-shadow: 0 10px 20px rgba(237,126,19,0.2);
    filter: brightness(1.05);
  }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const Spinner = styled.div`
  width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%; animation: ${spin} 0.8s linear infinite;
`

const ErrorBox = styled(motion.div)`
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #DC2626;
  padding: 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  display: flex; flex-direction: column; gap: 1rem;
`

const ErrorActions = styled.div`
  display: flex; gap: 0.75rem;
  a, button {
    flex: 1; padding: 0.6rem; border-radius: 0.5rem;
    font-size: 0.8rem; font-weight: 700; text-decoration: none;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    transition: all 0.2s; cursor: pointer;
  }
  .primary { background: ${({ theme }) => theme.colors.secondary}; color: #fff; border: none; }
  .secondary { background: #FFFFFF; color: ${({ theme }) => theme.colors.primary}; border: 1px solid #E2E8F0; }
`

export default function AlunaLogin() {
  const { login } = useAlunaAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/portal-aluna/dashboard'

  const [form, setForm] = useState({ login: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.login, form.password)
    setLoading(false)
    if (result.success) {
      navigate(result.forceChange ? '/portal-aluna/nova-senha' : from, { replace: true })
    } else {
      setError(result.error || 'Dados de acesso não conferem.')
    }
  }

  return (
    <SplitPage>
      <ImageSide />
      
      <FormSide>
        <FormContainer
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Logo>
            <img src="/logo.svg" alt="Body Harmony" />
            <p>Portal Aluna</p>
          </Logo>

          <Title>Bem-vinda de volta</Title>
          <Sub>Acesse a plataforma e continue sua evolução.</Sub>

          <AnimatePresence mode="wait">
            {error && (
              <ErrorBox
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FaExclamationTriangle />
                  <span>{error}</span>
                </div>

                {(error.includes('conferen') || error.includes('Senha')) && (
                  <ErrorActions>
                    <a
                      href="https://api.whatsapp.com/send/?phone=5518996356825&text=Olá! Preciso de ajuda para acessar o Portal da Aluna."
                      target="_blank"
                      rel="noreferrer"
                      className="primary"
                    >
                      <FaWhatsapp /> Suporte
                    </a>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => navigate(ROUTES.PORTAL_SUPPORT_IA)}
                    >
                      <FaRobot /> IA
                    </button>
                  </ErrorActions>
                )}
              </ErrorBox>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} id="aluna-login-form">
            <Field>
              <label>E-mail ou CPF</label>
              <input
                name="login"
                type="text"
                placeholder="Digite seu acesso"
                value={form.login}
                onChange={handleChange}
                required
              />
            </Field>
            
            <Field>
              <label>Senha</label>
              <div className="input-wrap">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <ToggleBtn
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </ToggleBtn>
              </div>
              <ForgotPasswordLink href="#">Esqueci minha senha</ForgotPasswordLink>
            </Field>
            
            <Btn type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Entrar'}
            </Btn>
          </form>
        </FormContainer>
      </FormSide>
    </SplitPage>
  )
}
