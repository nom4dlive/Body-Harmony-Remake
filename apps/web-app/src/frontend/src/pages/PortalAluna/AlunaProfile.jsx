import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlunaAuth } from '../../context/AlunaAuthContext'
import { api } from '../../services/api'
import styled, { keyframes } from 'styled-components'
import { LGPD_CONTENT_V2 } from '../../components/Legal/LGPD_Text_v2'
import AlunaHeader from '../../components/PortalAluna/AlunaHeader'

const spin    = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`
const fadeIn  = keyframes`from{opacity:0}to{opacity:1}`
const slideUp = keyframes`from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}`

const Page = styled.div`
  min-height: 100vh;
  background: #F8FAFC;
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.primary};
`

const Main = styled.main`
  max-width: 720px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
`

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 2rem;
  font-family: ${({ theme }) => theme.fonts.heading};
`

const ProfileHero = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
`

const ProfileInfo = styled.div`
  h2 { font-size: 1.3rem; margin: 0 0 0.25rem; }
  .badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: ${({ theme }) => theme.colors.secondary};
    color: #fff;
    border-radius: 2rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`

const Section = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
`

const STitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #F1F5F9;
  padding-bottom: 0.75rem;
`

const Field = styled.div`
  margin-bottom: 1.5rem;
  label {
    display: block;
    color: ${({ theme }) => theme.colors.textLight};
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
    transition: all 0.2s;
    &:focus { border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1); }
  }
`

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  border: none;
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(237,126,19,0.2); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const DangerBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #FCA5A5;
  background: #FEF2F2;
  color: #DC2626;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #FEE2E2; }
`

const Spinner = styled.div`
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff; border-radius: 50%; animation: ${spin} 0.7s linear infinite;
`

const Toast = styled.div`
  background: #F0FDF4; border: 1px solid #86EFAC; color: #166534;
  border-radius: 0.5rem; padding: 1rem; font-size: 0.9rem; margin-bottom: 1.5rem;
`

const Error = styled.div`
  background: #FEF2F2; border: 1px solid #FCA5A5; color: #DC2626;
  border-radius: 0.5rem; padding: 1rem; font-size: 0.9rem; margin-bottom: 1.5rem;
`

const InfoRow = styled.div`
  display: flex; justify-content: space-between; padding: 0.75rem 0;
  border-bottom: 1px solid #F1F5F9; font-size: 0.95rem;
  &:last-child { border: none; }
  span:first-child { color: ${({ theme }) => theme.colors.textLight}; font-weight: 500; }
  span:last-child { color: ${({ theme }) => theme.colors.primary}; font-weight: 600; }
`

const ReviewBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: #FFF7ED; border: 1px solid #FED7AA;
  color: ${({ theme }) => theme.colors.secondary}; font-size: 0.85rem; font-weight: 600;
  padding: 8px 16px; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;
  &:hover { background: #FFEDD5; border-color: ${({ theme }) => theme.colors.secondary}; }
`

/* ── Terms Modal (Omitted styles implementation for brevity, keeping same logic but updated colors) ── */
const Overlay = styled.div`position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1rem;`
const ModalCard = styled.div`background:#fff;border-radius:1rem;width:100%;max-width:640px;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 40px rgba(0,0,0,0.1);`
const MHeader = styled.div`display:flex;align-items:center;justify-content:space-between;padding:1.5rem;border-bottom:1px solid #F1F5F9;h3{color:${({ theme }) => theme.colors.primary};font-size:1.2rem;margin:0;}`
const CloseBtn = styled.button`background:#F1F5F9;border:none;width:32px;height:32px;border-radius:0.5rem;color:${({ theme }) => theme.colors.textLight};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.2rem;&:hover{background:#E2E8F0;}`
const TabBar = styled.div`display:flex;border-bottom:1px solid #F1F5F9;padding:0 1.5rem;gap:1rem;`
const Tab = styled.button`padding:1rem 0;border:none;background:none;color:${p=>p.active?'#ED7E13':'#64748B'};font-size:0.9rem;font-weight:600;cursor:pointer;border-bottom:2px solid ${p=>p.active?'#ED7E13':'transparent'};transition:all 0.2s;&:hover{color:#ED7E13;}`
const MBody = styled.div`flex:1;overflow-y:auto;padding:1.5rem;color:#334155;font-size:0.9rem;line-height:1.6;h3{color:${({ theme }) => theme.colors.primary};font-size:1rem;margin:1.2rem 0 0.5rem;}a{color:#ED7E13;}`
const MFooter = styled.div`padding:1rem 1.5rem;border-top:1px solid #F1F5F9;text-align:center;span{color:#94A3B8;font-size:0.8rem;}`

function TermsModal({ onClose }) {
  const [tab, setTab] = useState('terms')
  const tabs = [
    { key: 'terms',   label: LGPD_CONTENT_V2.terms.title },
    { key: 'privacy', label: LGPD_CONTENT_V2.privacy.title },
    { key: 'ai',      label: LGPD_CONTENT_V2.ai_usage.title },
  ]
  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <MHeader>
          <h3>📄 Revisão dos Termos</h3>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </MHeader>
        <TabBar>
          {tabs.map(t => <Tab key={t.key} active={tab===t.key} onClick={()=>setTab(t.key)}>{t.label}</Tab>)}
        </TabBar>
        <MBody>
          {tab === 'terms' && (<>
            <p>{LGPD_CONTENT_V2.terms.intro}</p>
            {LGPD_CONTENT_V2.terms.sections.map((s,i) => <div key={i}><h3>{s.heading}</h3><div dangerouslySetInnerHTML={{__html:s.content}}/></div>)}
          </>)}
          {tab === 'privacy' && (<>
            <p>{LGPD_CONTENT_V2.privacy.intro}</p>
            {LGPD_CONTENT_V2.privacy.sections.map((s,i) => <div key={i}><h3>{s.heading}</h3><div dangerouslySetInnerHTML={{__html:s.content}}/></div>)}
          </>)}
          {tab === 'ai' && <div dangerouslySetInnerHTML={{__html:LGPD_CONTENT_V2.ai_usage.content}}/>}
        </MBody>
        <MFooter><span>Versão {LGPD_CONTENT_V2.version} · Body Harmony Educacao LTDA</span></MFooter>
      </ModalCard>
    </Overlay>
  )
}

export default function AlunaProfile() {
  const { aluna, logout } = useAlunaAuth()
  const navigate  = useNavigate()
  const [pwForm, setPwForm] = useState({ current: '', pass1: '', pass2: '' })
  const [toast, setToast]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading]= useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const onChange = (e) => setPwForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (pwForm.pass1 !== pwForm.pass2) { setError('As senhas não coincidem.'); return }
    if (pwForm.pass1.length < 6)       { setError('Mínimo 6 caracteres.'); return }
    setError(''); setLoading(true)
    try {
      await api.aluna.changePassword(pwForm.current, pwForm.pass1)
      setToast('Senha alterada com sucesso!')
      setPwForm({ current:'', pass1:'', pass2:'' })
      setTimeout(() => setToast(''), 4000)
    } catch (err) {
      setError(err.message || 'Erro ao alterar senha.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/portal-aluna', { replace: true }) }
  const firstName = aluna?.name?.split(' ')[0] || 'A'
  const initials = aluna?.name ? aluna.name.split(' ').map(n=>n[0]).slice(0,2).join('') : 'BH'

  return (
    <Page>
      <AlunaHeader />
      <Main>
        <ProfileHero>
          <Avatar>{initials}</Avatar>
          <ProfileInfo>
            <h2>{aluna?.name}</h2>
            <span className="badge">Aluna Premium</span>
          </ProfileInfo>
        </ProfileHero>

        <Section>
          <STitle>Dados da Conta</STitle>
          <InfoRow id="profile-name"><span>Nome Completo</span><span>{aluna?.name}</span></InfoRow>
          <InfoRow id="profile-email"><span>E-mail</span><span>{aluna?.email}</span></InfoRow>
        </Section>

        <Section>
          <STitle>Segurança e Senha</STitle>
          {toast && <Toast>{toast}</Toast>}
          {error && <Error>{error}</Error>}
          <form onSubmit={handleSave} id="profile-change-password-form">
            <Field>
              <label htmlFor="profile-current">Senha atual</label>
              <input id="profile-current" name="current" type="password" placeholder="••••••••" value={pwForm.current} onChange={onChange} required />
            </Field>
            <Field>
              <label htmlFor="profile-pass1">Nova senha</label>
              <input id="profile-pass1" name="pass1" type="password" placeholder="Mínimo 6 caracteres" value={pwForm.pass1} onChange={onChange} required />
            </Field>
            <Field>
              <label htmlFor="profile-pass2">Confirmar nova senha</label>
              <input id="profile-pass2" name="pass2" type="password" placeholder="Repita a senha" value={pwForm.pass2} onChange={onChange} required />
            </Field>
            <Btn type="submit" id="profile-save-btn" disabled={loading}>
              {loading ? <Spinner /> : 'Salvar Alterações'}
            </Btn>
          </form>
        </Section>

        <Section>
          <STitle>🛡️ Privacidade & Dados</STitle>
          <InfoRow style={{ border: 'none', alignItems: 'center' }}>
            <span>Revisar Termos de Uso e Política de Privacidade</span>
            <ReviewBtn onClick={() => setShowTerms(true)}>📄 Revisar</ReviewBtn>
          </InfoRow>
        </Section>

        <Section style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0, marginTop: '2rem' }}>
          <DangerBtn id="profile-logout-btn" type="button" onClick={handleLogout}>Sair da conta</DangerBtn>
        </Section>
      </Main>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </Page>
  )
}
