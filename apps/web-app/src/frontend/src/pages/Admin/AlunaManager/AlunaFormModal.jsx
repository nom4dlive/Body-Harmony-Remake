import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { UserPlus, Edit3, Save, Loader2, Users } from 'lucide-react'
import { api } from '../../../services/api'
import ResponsiveModal from '../../../components/ui/ResponsiveModal'

const spin = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  input, select, textarea {
    padding: 0.75rem 0.9rem;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    font-size: 0.9rem;
    outline: none;
    font-family: inherit;
    min-height: 44px;
    background: #FFFFFF;
    color: #1E293B;
    transition: all 0.15s ease;

    &:focus {
      border-color: #ED7E13;
      box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.12);
    }

    &:disabled {
      background: #F8FAFC;
      color: #94A3B8;
    }
  }

  textarea {
    resize: vertical;
    min-height: 70px;
  }

  .hint {
    font-size: 0.72rem;
    color: #94A3B8;
  }
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.$cols || 2}, 1fr);
  gap: 0.85rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const Section = styled.div`
  border-top: 1px solid #F1F5F9;
  padding-top: 1rem;
  margin-top: 0.25rem;

  h3 {
    margin: 0 0 0.75rem;
    font-size: 0.8rem;
    color: #0A3E60;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
`

const MetaRow = styled.div`
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  padding: 0.75rem 1rem;
  background: #F8FAFC;
  border-radius: 8px;
  border: 1px solid #F1F5F9;

  .meta {
    font-size: 0.75rem;
    color: #64748B;
    span {
      font-weight: 700;
      color: #1E293B;
    }
  }
`

const Btn = styled.button`
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.15s ease;
  border: ${({ $primary }) => ($primary ? 'none' : '1px solid #E2E8F0')};
  background: ${({ $primary }) => ($primary ? '#ED7E13' : '#FFFFFF')};
  color: ${({ $primary }) => ($primary ? '#FFFFFF' : '#475569')};

  &:hover {
    background: ${({ $primary }) => ($primary ? '#D97706' : '#F8FAFC')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`

const Err = styled.p`
  color: #DC2626;
  font-size: 0.82rem;
  margin: 0;
  padding: 0.5rem 0.75rem;
  background: #FEE2E2;
  border-radius: 6px;
  border: 1px solid #FCA5A5;
`

// ── Máscaras ───────────────────────────────────────────────────────────────
const maskCPF = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

const maskPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function AlunaFormModal({ aluna, onClose, onSaved }) {
  const isEdit = !!aluna
  const [form, setForm] = useState({
    name:         aluna?.name         || '',
    email:        aluna?.email        || '',
    cpf:          aluna?.cpf ? maskCPF(aluna.cpf) : '',
    phone:        aluna?.phone ? maskPhone(aluna.phone) : '',
    password:     '',
    is_active:    aluna?.is_active    ?? 1,
    max_devices:  aluna?.max_devices  ?? 1,
    admin_notes:  aluna?.admin_notes  || '',
  })
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  const onChange = (e) => {
    const { name, value } = e.target
    if (name === 'cpf') return setForm(p => ({ ...p, cpf: maskCPF(value) }))
    if (name === 'phone') return setForm(p => ({ ...p, phone: maskPhone(value) }))
    setForm(p => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email) { setError('Nome e e-mail são obrigatórios.'); return }
    if (!isEdit && !form.password) { setError('Senha inicial é obrigatória.'); return }
    if (!isEdit && form.password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return }

    const cpfClean   = form.cpf.replace(/\D/g, '')
    const phoneClean = form.phone.replace(/\D/g, '')

    if (cpfClean && cpfClean.length !== 11) { setError('CPF deve ter 11 dígitos.'); return }

    setSaving(true)
    try {
      if (isEdit) {
        await api.admin.alunas.update(aluna.id, {
          name:        form.name,
          email:       form.email,
          cpf:         cpfClean || null,
          phone:       phoneClean || null,
          is_active:   parseInt(form.is_active),
          max_devices: parseInt(form.max_devices),
          admin_notes: form.admin_notes || null,
        })
      } else {
        await api.admin.alunas.create({
          name:     form.name,
          email:    form.email,
          cpf:      cpfClean,
          phone:    phoneClean,
          password: form.password,
        })
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const footerContent = (
    <>
      <Btn type="button" onClick={onClose}>Cancelar</Btn>
      <Btn $primary type="submit" form="aluna-form" id="aluna-form-submit" disabled={saving}>
        {saving ? (
          <>
            <Loader2 size={16} className="spin" />
            <span>Salvando...</span>
          </>
        ) : (
          <>
            <Save size={16} />
            <span>{isEdit ? 'Salvar Alterações' : 'Criar Aluna'}</span>
          </>
        )}
      </Btn>
    </>
  )

  return (
    <ResponsiveModal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Editar Aluna' : 'Nova Aluna'}
      subtitle={isEdit ? `ID #${aluna.id} — ${aluna.email}` : 'Preencha os dados de acesso'}
      icon={isEdit ? Edit3 : UserPlus}
      size="md"
      footer={footerContent}
    >
      <FormContainer onSubmit={handleSubmit} id="aluna-form">
        {/* ── Dados Pessoais ─────────────────────────────────── */}
        <Field>
          <label htmlFor="af-name">Nome completo *</label>
          <input id="af-name" name="name" value={form.name} onChange={onChange} placeholder="Maria da Silva" required />
        </Field>

        <Field>
          <label htmlFor="af-email">E-mail *</label>
          <input id="af-email" name="email" type="email" value={form.email} onChange={onChange} placeholder="aluna@exemplo.com" required />
        </Field>

        <ResponsiveGrid $cols={2}>
          <Field>
            <label htmlFor="af-cpf">CPF</label>
            <input id="af-cpf" name="cpf" value={form.cpf} onChange={onChange} placeholder="000.000.000-00" />
            <span className="hint">Usado para login no LMS</span>
          </Field>
          <Field>
            <label htmlFor="af-phone">Telefone / WhatsApp</label>
            <input id="af-phone" name="phone" value={form.phone} onChange={onChange} placeholder="(00) 00000-0000" />
          </Field>
        </ResponsiveGrid>

        {/* ── Senha (só criação) ──────────────────────────────── */}
        {!isEdit && (
          <Field>
            <label htmlFor="af-password">Senha inicial *</label>
            <input id="af-password" name="password" type="password" value={form.password} onChange={onChange} placeholder="Mínimo de 6 caracteres" required={!isEdit} />
          </Field>
        )}

        {/* ── Configurações (só edição) ───────────────────────── */}
        {isEdit && (
          <Section>
            <h3>Configurações de Acesso</h3>
            <ResponsiveGrid $cols={3}>
              <Field>
                <label htmlFor="af-status">Status</label>
                <select id="af-status" name="is_active" value={form.is_active} onChange={onChange}>
                  <option value={1}>Ativa</option>
                  <option value={0}>Inativa</option>
                </select>
              </Field>
              <Field>
                <label htmlFor="af-devices">Máx. Dispositivos</label>
                <input id="af-devices" name="max_devices" type="number" min={1} max={5} value={form.max_devices} onChange={onChange} />
              </Field>
              <Field>
                <label>Cursos</label>
                <input disabled value={`${aluna?.course_count || 0} curso(s)`} />
              </Field>
            </ResponsiveGrid>
            <Field style={{ marginTop: '0.75rem' }}>
              <label htmlFor="af-notes">Observações Administrativas</label>
              <textarea id="af-notes" name="admin_notes" value={form.admin_notes} onChange={onChange} placeholder="Notas internas sobre a aluna..." rows={2} />
            </Field>
          </Section>
        )}

        {/* ── Metadados (só edição, read-only) ────────────────── */}
        {isEdit && (
          <MetaRow>
            <div className="meta">Criada em: <span>{formatDate(aluna?.created_at)}</span></div>
            <div className="meta">Último login: <span>{formatDate(aluna?.last_login_at)}</span></div>
          </MetaRow>
        )}

        {error && <Err>{error}</Err>}
      </FormContainer>
    </ResponsiveModal>
  )
}
