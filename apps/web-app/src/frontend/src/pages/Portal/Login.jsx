import React, { useState, useEffect } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import { useLicenciadaAuth as useStudentAuth } from '../../context/LicenciadaAuthContext'
import { FaLock, FaUserCircle, FaSpinner, FaExclamationTriangle, FaEye, FaEyeSlash, FaMicroscope, FaGem, FaCheckCircle, FaUsers } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

// --- Visual Identity V3 ---
// Primary: #0A3E60 (Navbar, Footer, Seções Fortes)
// Secondary: #ED7E13 (CTA, Destaques)
// Surface: #F5F5F5
// TextOnPrimary: #FFFFFF

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.colors.darkBg};
  color: ${({ theme }) => theme.colors.darkText};
  overflow: hidden;

  @media (max-width: 968px) {
    flex-direction: column;
  }
`

const LeftSection = styled.div`
  flex: 0 0 45%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: ${({ theme }) => theme.colors.darkBg};
  position: relative;
  z-index: 10;
  box-shadow: 20px 0 50px rgba(0, 0, 0, 0.5);

  @media (max-width: 968px) {
    flex: 1;
    width: 100%;
    padding: 3rem 1.5rem;
    box-shadow: none;
  }
`

const RightSection = styled.div`
  flex: 1;
  background: linear-gradient(rgba(5, 26, 41, 0.4), rgba(5, 26, 41, 0.8)), 
              url('https://i.imgur.com/2c758qu.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  position: relative;
  overflow: hidden;

  // Aesthetic glow
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 60% 40%, rgba(237, 126, 19, 0.15) 0%, transparent 60%);
    pointer-events: none;
  }

  @media (max-width: 968px) {
    display: none;
  }
`

const LoginWrapper = styled(motion.div)`
  width: 100%;
  max-width: 380px;
  text-align: left;
`

const Logo = styled.img`
  width: 180px;
  margin-bottom: 3rem;
`

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.darkText};
  margin-bottom: 0.75rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 700;
  font-size: 2.2rem;
  letter-spacing: 1px;
  text-transform: uppercase;
`

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.darkTextMuted};
  font-size: 1rem;
  margin-bottom: 2.5rem;
  line-height: 1.6;
`

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`

const InputIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 1.25rem;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.secondary};
  opacity: 0.8;
  z-index: 2;
  pointer-events: none;
`

const Input = styled.input`
  width: 100%;
  padding: 1.2rem 1.2rem 1.2rem 3.5rem;
  border: 1px solid ${({ theme }) => theme.colors.glassBorder};
  border-radius: 12px;
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.glassBg};
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  color: #FFFFFF;
  font-family: ${({ theme }) => theme.fonts.body};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 20px rgba(237, 126, 19, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`

const TogglePasswordButton = styled.button`
  position: absolute;
  top: 50%;
  right: 1.25rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.darkText};
  opacity: 0.5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.secondary};
  }
`

const SubmitButton = styled.button`
  width: 100%;
  padding: 1.2rem;
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 1.5rem;
  box-shadow: 0 10px 20px rgba(237, 126, 19, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    filter: grayscale(0.5);
  }
  
  &:hover:not(:disabled) {
    background: #FF9124;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(237, 126, 19, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`

const ErrorBox = styled(motion.div)`
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #FB7185;
  padding: 1.25rem;
  border-radius: 12px;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  div.message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  svg {
    min-width: 18px;
  }
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;

  button, a {
    padding: 0.5rem 0.8rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
  }

  .primary {
    background: ${({ theme }) => theme.colors.secondary};
    color: white;
    border: none;
    &:hover { background: #FF9124; }
  }

  .secondary {
    background: rgba(255, 255, 255, 0.05);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover { background: rgba(255, 255, 255, 0.1); }
  }
`;

const CapsLockWarning = styled(motion.div)`
  color: #ED7E13;
  font-size: 0.8rem;
  margin-top: -1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
`;

const FooterLink = styled.a`
  display: inline-block;
  margin-top: 2.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.darkTextMuted};
  text-decoration: none;
  transition: all 0.2s;
  border-bottom: 1px solid transparent;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
    border-bottom-color: ${({ theme }) => theme.colors.secondary};
  }
`

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
  z-index: 2;
`

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  color: white;
  text-align: left;
  cursor: default;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.2);
  }
`

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(237, 126, 19, 0.1);
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 1.5rem;
`

const CardTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #00BFA5;
`

const CardText = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
`

export default function PortalLogin() {
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isCapsLock, setIsCapsLock] = useState(false)

  const { login } = useStudentAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkCapsLock = (e) => {
      if (e.getModifierState && e.getModifierState('CapsLock')) {
        setIsCapsLock(true)
      } else {
        setIsCapsLock(false)
      }
    }
    window.addEventListener('keydown', checkCapsLock)
    return () => window.removeEventListener('keydown', checkCapsLock)
  }, [])

  const handleLoginChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Apenas números
    if (value.length <= 11) {
      // Máscara CPF: 000.000.000-00
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    setLoginValue(value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Clean login value (remove dots/hyphens) for backend
    const cleanLogin = loginValue.replace(/\D/g, '');
    const result = await login(cleanLogin, password)

    if (result.success) {
      navigate(ROUTES.PORTAL_DASHBOARD)
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  const features = [
    {
      title: "Ciência Avançada",
      text: "Protocolos baseados em anatomia e fisiologia de alta performance.",
      icon: <FaMicroscope />
    },
    {
      title: "Luxo & Estética",
      text: "A arte do toque refinado combinada à exclusividade terapêutica.",
      icon: <FaGem />
    },
    {
      title: "Resultados Reais",
      text: "Transformações visíveis desde a primeira sessão.",
      icon: <FaCheckCircle />
    },
    {
      title: "Comunidade",
      text: "Conecte-se com as melhores profissionais do mercado.",
      icon: <FaUsers />
    }
  ]

  return (
    <Container>
      <LeftSection>
        <LoginWrapper
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Logo src="/logo-white.svg" alt="Body Harmony" />
          <Title>Portal da Licenciada</Title>
          <Subtitle>Entre no seu ecossistema de elite e acesse o conteúdo exclusivo do método.</Subtitle>

          <AnimatePresence>
            {error && (
              <ErrorBox
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="message">
                  <FaExclamationTriangle />
                  <div>{error}</div>
                </div>

                {(error.includes('conferen') || error.includes('Senha')) && (
                  <ErrorActions>
                    <button
                      type="button"
                      className="primary"
                      onClick={() => navigate(ROUTES.PORTAL_SUPPORT_IA)}
                    >
                      Suporte IA
                    </button>
                    <a
                      href="https://api.whatsapp.com/send/?phone=5518996356825&text=Olá! Preciso recuperar minha senha do Portal."
                      target="_blank"
                      className="secondary"
                    >
                      Recuperar Senha
                    </a>
                  </ErrorActions>
                )}
              </ErrorBox>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <InputWrapper>
              <InputIcon><FaUserCircle size={20} /></InputIcon>
              <Input
                type="text"
                placeholder="Insira seu CPF"
                value={loginValue}
                onChange={handleLoginChange}
                required
                autoComplete="username"
              />
            </InputWrapper>

            <AnimatePresence>
              {isCapsLock && (
                <CapsLockWarning
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <FaLock size={12} /> Caps Lock Ativado
                </CapsLockWarning>
              )}
            </AnimatePresence>

            <InputWrapper>
              <InputIcon><FaLock size={18} /></InputIcon>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <TogglePasswordButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </TogglePasswordButton>
            </InputWrapper>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : 'Acessar Portal'}
            </SubmitButton>
          </form>

          <FooterLink
            href="https://t.me/Body_Harmony_Support_bot"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.484-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.33.016.116.029.334.017.49z"/></svg>
            Esqueceu sua senha? Suporte via Telegram.
          </FooterLink>
        </LoginWrapper>
      </LeftSection>

      <RightSection>
        <CardGrid>
          {features.map((f, i) => (
            <FeatureCard
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <CardIcon>{f.icon}</CardIcon>
              <CardTitle>{f.title}</CardTitle>
              <CardText>{f.text}</CardText>
            </FeatureCard>
          ))}
        </CardGrid>
      </RightSection>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </Container>
  )
}
