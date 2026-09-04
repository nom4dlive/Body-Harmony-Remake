import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { api } from '../../../services/api'

const spin    = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`
const Overlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px);`
const Card    = styled.div`background:#111;border:1px solid #333;border-radius:12px;width:100%;max-width:500px;overflow:hidden;max-height:90vh;overflow-y:auto;`
const Head    = styled.div`padding:1.25rem 1.5rem;background:#0A3E60;color:#fff;position:sticky;top:0;z-index:1;
  h2{margin:0;font-size:1.1rem;}
  p{margin:0.25rem 0 0;font-size:0.78rem;opacity:0.6;}
`
const Body    = styled.div`padding:1.5rem;display:grid;gap:1rem;`
const Field   = styled.div`display:flex;flex-direction:column;gap:0.3rem;
  label{font-size:0.72rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.05em;}
  input,select,textarea{padding:0.65rem 0.9rem;background:#1a1a1a;border:1px solid #333;border-radius:6px;
    color:#fff;font-size:0.9rem;outline:none;font-family:inherit;
    &:focus{border-color:#ED7E13;}
    &::placeholder{color:#555;}
    &:disabled{opacity:0.5;}
  }
  textarea{resize:vertical;min-height:50px;}
  .hint{font-size:0.68rem;color:#555;margin-top:2px;}
`
const Row2    = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:1rem;@media(max-width:480px){grid-template-columns:1fr;}`
const Row3    = styled.div`display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;@media(max-width:480px){grid-template-columns:1fr;}`
const Section = styled.div`
  border-top:1px solid #222;padding-top:1rem;margin-top:0.25rem;
  h3{margin:0 0 0.75rem;font-size:0.78rem;color:#ED7E13;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;}
`
const MetaRow = styled.div`
  display:flex;gap:1.5rem;flex-wrap:wrap;padding:0.6rem 0.9rem;background:#0d0d0d;border:1px solid #222;border-radius:6px;
  .meta{font-size:0.72rem;color:#555;span{font-weight:700;color:#888;font-family:monospace;}}
`
const Foot    = styled.div`padding:1rem 1.5rem;background:#0d0d0d;border-top:1px solid #222;display:flex;justify-content:flex-end;gap:0.75rem;position:sticky;bottom:0;z-index:1;`
const Btn     = styled.button`
  padding:0.6rem 1.2rem;border-radius:6px;font-weight:700;font-size:0.85rem;cursor:pointer;
  border:${({$primary})=>$primary?'none':'1px solid #333'};
  background:${({$primary})=>$primary?'#ED7E13':'transparent'};
  color:${({$primary})=>$primary?'#fff':'#ccc'};
  &:hover{opacity:0.85;}&:disabled{opacity:0.4;cursor:not-allowed;}
`
const Spinner = styled.div`width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:${spin} 0.7s linear infinite;display:inline-block;`
const Err     = styled.p`color:#f44336;font-size:0.82rem;margin:0;`

// ── Máscaras ───────────────────────────────────────────────────────────────
const maskCPF = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

const maskPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function NexusAlunaFormModal({ aluna, onClose, onSaved }) {
  const isEdit = !!aluna
  const [form, setForm] = useState({
    name:        aluna?.name        || '',
    email:       aluna?.email       || '',
    cpf:         aluna?.cpf ? maskCPF(aluna.cpf) : '',
    phone:       aluna?.phone ? maskPhone(aluna.phone) : '',
    password:    '',
    is_active:   aluna?.is_active   ?? 1,
    max_devices: aluna?.max_devices ?? 1,
    admin_notes: aluna?.admin_notes || '',
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
    if (!form.name || !form.email) { setError('Nome e e-mail obrigatórios.'); return }
    if (!isEdit && !form.password) { setError('Senha inicial obrigatória.'); return }
    if (!isEdit && form.password.length < 6) { setError('Senha mín. 6 caracteres.'); return }

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
        const cpf = form.cpf.replace(/\D/g, '')
        await api.admin.alunas.create({
          name: form.name, email: form.email, cpf, phone: phoneClean, password: form.password
        })
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <Card onClick={e => e.stopPropagation()}>
        <Head>
          <h2>{isEdit ? '✏️ Editar Aluna' : '➕ Nova Aluna'}</h2>
          <p>{isEdit ? `ID #${aluna.id} — ${aluna.email}` : 'Dados de acesso ao Portal Aluna'}</p>
        </Head>
        <form onSubmit={handleSubmit}>
          <Body>
            <Field>
              <label>Nome completo</label>
              <input name="name" value={form.name} onChange={onChange} placeholder="Maria da Silva" required />
            </Field>
            <Field>
              <label>E-mail</label>
              <input name="email" type="email" value={form.email} onChange={onChange} placeholder="aluna@email.com" required />
            </Field>
            <Row2>
              <Field>
                <label>CPF</label>
                <input name="cpf" value={form.cpf} onChange={onChange} placeholder="000.000.000-00" />
                <span className="hint">Usado para login</span>
              </Field>
              <Field>
                <label>Telefone / WhatsApp</label>
                <input name="phone" value={form.phone} onChange={onChange} placeholder="(00) 00000-0000" />
              </Field>
            </Row2>

            {!isEdit && (
              <Field>
                <label>Senha inicial</label>
                <input name="password" type="password" value={form.password} onChange={onChange} placeholder="Mín. 6 caracteres" />
              </Field>
            )}

            {isEdit && (
              <Section>
                <h3>⚙️ Configurações</h3>
                <Row3>
                  <Field>
                    <label>Status</label>
                    <select name="is_active" value={form.is_active} onChange={onChange}>
                      <option value={1}>Ativa</option>
                      <option value={0}>Inativa</option>
                    </select>
                  </Field>
                  <Field>
                    <label>Máx. Devices</label>
                    <input name="max_devices" type="number" min={1} max={5} value={form.max_devices} onChange={onChange} />
                  </Field>
                  <Field>
                    <label>Cursos</label>
                    <input disabled value={`${aluna?.course_count || 0}`} />
                  </Field>
                </Row3>
                <Field>
                  <label>Notas Admin</label>
                  <textarea name="admin_notes" value={form.admin_notes} onChange={onChange} placeholder="Observações internas..." rows={2} />
                </Field>
              </Section>
            )}

            {isEdit && (
              <MetaRow>
                <div className="meta">Criada: <span>{formatDate(aluna?.created_at)}</span></div>
                <div className="meta">Últ. Login: <span>{formatDate(aluna?.last_login_at)}</span></div>
              </MetaRow>
            )}

            {error && <Err>{error}</Err>}
          </Body>
          <Foot>
            <Btn type="button" onClick={onClose}>Cancelar</Btn>
            <Btn $primary type="submit" disabled={saving}>
              {saving ? <Spinner /> : (isEdit ? 'Salvar' : 'Criar aluna')}
            </Btn>
          </Foot>
        </form>
      </Card>
    </Overlay>
  )
}
