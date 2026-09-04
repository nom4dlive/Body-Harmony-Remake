import styled, { keyframes } from 'styled-components'
import { useState, useEffect } from 'react'
import { 
  UserCheck, 
  Upload, 
  Save, 
  Lock, 
  Smartphone, 
  ShieldCheck, 
  Brain, 
  Trash2, 
  Loader2,
  CheckCircle2,
  Edit3
} from 'lucide-react'
import { licenciadasApi } from '../../../services/api'
import ResponsiveModal from '../../../components/ui/ResponsiveModal'

const spin = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 0.25rem;
`

const TabButton = styled.button`
  padding: 0.65rem 1rem;
  background: none;
  border: none;
  font-weight: 700;
  font-size: 0.85rem;
  color: ${({ $active }) => ($active ? '#0A3E60' : '#64748B')};
  border-bottom: 3px solid ${({ $active }) => ($active ? '#ED7E13' : 'transparent')};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.15s ease;
  
  &:hover {
    color: #0A3E60;
  }
`

const FormGroup = styled.div`
  margin-bottom: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  
  label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 0.75rem 0.9rem;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.9rem;
    min-height: 44px;
    background: #FFFFFF;
    color: #1E293B;
    outline: none;
    transition: all 0.15s ease;

    &:focus {
      border-color: #ED7E13;
      box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.12);
    }
  }
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$template || '1fr 1fr'};
  gap: 0.85rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const DeviceList = styled.div`
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  max-height: 180px;
  overflow-y: auto;
  margin-top: 0.5rem;
`

const DeviceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #F1F5F9;
  background: #F8FAFC;
  &:last-child { border-bottom: none; }
  
  .info {
    display: flex;
    flex-direction: column;
    font-size: 0.8rem;
    color: #1E293B;
    strong {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      color: #0A3E60;
    }
    span { color: #64748B; font-size: 0.72rem; }
  }

  button {
    background: #FEE2E2;
    color: #DC2626;
    border: 1px solid #FCA5A5;
    padding: 0.35rem 0.65rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    &:hover { background: #FECACA; }
  }
`

const SmartBookCard = styled.div`
  background: #F0FDF4;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  border: 1px solid #BBF7D0;
  margin-top: 0.5rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    cursor: pointer;
    margin: 0;
    color: #166534;
    font-weight: 700;
    font-size: 0.85rem;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #16A34A;
    margin: 0;
    min-height: auto;
  }

  small {
    display: block;
    color: #15803D;
    margin-top: 0.25rem;
    margin-left: 26px;
    font-size: 0.75rem;
    line-height: 1.3;
  }
`

const ModalButton = styled.button`
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.15s ease;
  border: none;

  &.cancel {
    background: #F1F5F9;
    color: #475569;
    border: 1px solid #CBD5E1;
    &:hover { background: #E2E8F0; }
  }

  &.save {
    background: #ED7E13;
    color: #FFFFFF;
    &:hover { background: #D97706; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export default function LicenciadaModal({ isOpen, onClose, licenciada, onSave }) {
  const [activeTab, setActiveTab] = useState('dados')
  const [formData, setFormData] = useState({
    name: '',
    state: 'SP',
    location: '',
    instagram: '',
    whatsapp: '',
    cpf: '',
    password: '',
    maxDevices: 1,
    isActive: true,
    ai_notebook_beta_enabled: false
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [devices, setDevices] = useState([])
  const [loadingDevices, setLoadingDevices] = useState(false)

  useEffect(() => {
    if (licenciada) {
      setFormData({
        name: licenciada.name || '',
        state: licenciada.state || 'SP',
        location: licenciada.location || '',
        instagram: licenciada.instagram || '',
        whatsapp: licenciada.whatsapp || '',
        cpf: licenciada.cpf || '',
        password: '',
        maxDevices: licenciada.max_devices || 1,
        isActive: licenciada.is_active !== 0 && licenciada.is_active !== false,
        ai_notebook_beta_enabled: licenciada.ai_notebook_beta_enabled === 1 || licenciada.ai_notebook_beta_enabled === true
      })
      setPhotoPreview(licenciada.photo_url || '')
      loadDevices(licenciada.id)
    } else {
      setFormData({
        name: '',
        state: 'SP',
        location: '',
        instagram: '',
        whatsapp: '',
        cpf: '',
        password: '',
        maxDevices: 1,
        isActive: true,
        ai_notebook_beta_enabled: false
      })
      setPhotoPreview('')
      setDevices([])
    }
  }, [licenciada, isOpen])

  const loadDevices = async (id) => {
    setLoadingDevices(true)
    try {
      const res = await licenciadasApi.getDevices(id)
      if (res && res.data) {
        setDevices(res.data)
      }
    } catch (e) {
      console.error('Erro ao carregar dispositivos:', e)
    } finally {
      setLoadingDevices(false)
    }
  }

  const handleRemoveDevice = async (deviceId) => {
    if (!window.confirm('Deseja realmente desvincular este dispositivo?')) return
    try {
      await licenciadasApi.removeDevice(licenciada.id, deviceId)
      setDevices(devices.filter(d => d.id !== deviceId))
    } catch (e) {
      alert('Erro ao remover dispositivo: ' + e.message)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('state', formData.state)
      data.append('location', formData.location)
      data.append('instagram', formData.instagram)
      data.append('whatsapp', formData.whatsapp)
      data.append('cpf', formData.cpf)
      data.append('max_devices', formData.maxDevices)
      data.append('is_active', formData.isActive ? '1' : '0')
      data.append('ai_notebook_beta_enabled', formData.ai_notebook_beta_enabled ? '1' : '0')

      if (formData.password) {
        data.append('password', formData.password)
      }
      if (selectedFile) {
        data.append('photo', selectedFile)
      }

      await onSave(data, licenciada?.id)
      onClose()
    } catch (error) {
      alert('Erro ao salvar licenciada: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const footerContent = (
    <>
      <ModalButton type="button" className="cancel" onClick={onClose}>
        Cancelar
      </ModalButton>
      <ModalButton type="submit" form="licenciada-form" className="save" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="spin" />
            <span>Salvando...</span>
          </>
        ) : (
          <>
            <Save size={16} />
            <span>Salvar</span>
          </>
        )}
      </ModalButton>
    </>
  )

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={licenciada ? 'Editar Licenciada' : 'Nova Licenciada'}
      subtitle={licenciada ? `ID #${licenciada.id} — ${licenciada.name}` : 'Cadastrar credencial de franqueada'}
      icon={licenciada ? Edit3 : UserCheck}
      size="lg"
      footer={footerContent}
    >
      <TabContainer>
        <TabButton
          $active={activeTab === 'dados'}
          onClick={() => setActiveTab('dados')}
          type="button"
        >
          <UserCheck size={15} />
          <span>Dados Cadastrais</span>
        </TabButton>
        <TabButton
          $active={activeTab === 'acesso'}
          onClick={() => setActiveTab('acesso')}
          type="button"
        >
          <ShieldCheck size={15} />
          <span>Acesso & Dispositivos</span>
        </TabButton>
      </TabContainer>

      <form onSubmit={handleSubmit} id="licenciada-form">
        {activeTab === 'dados' ? (
          <>
            <FormGroup>
              <label>Nome Completo *</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Dra. Marcela Silveira"
              />
            </FormGroup>

            <ResponsiveGrid $template="1fr 2fr">
              <FormGroup>
                <label>Estado *</label>
                <select
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                >
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormGroup>
              <FormGroup>
                <label>Cidade</label>
                <input
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: São Paulo"
                />
              </FormGroup>
            </ResponsiveGrid>

            <ResponsiveGrid $template="1fr 1fr">
              <FormGroup>
                <label>Instagram (@usuario) *</label>
                <input
                  value={formData.instagram}
                  onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                  required
                  placeholder="@clinica.bodyharmony"
                />
              </FormGroup>
              <FormGroup>
                <label>WhatsApp (números)</label>
                <input
                  value={formData.whatsapp || ''}
                  onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="5511999999999"
                />
              </FormGroup>
            </ResponsiveGrid>

            <FormGroup>
              <label>CPF (Apenas números)</label>
              <input
                value={formData.cpf || ''}
                onChange={e => setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, '') })}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </FormGroup>

            <FormGroup>
              <label>Foto de Perfil</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ED7E13' }}
                  />
                )}
                <label style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer', flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', minHeight: '44px' }}>
                  <Upload size={16} />
                  <span>{selectedFile ? 'Trocar Foto' : 'Selecionar Foto'}</span>
                  <input type="file" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                </label>
              </div>
            </FormGroup>
          </>
        ) : (
          <>
            <FormGroup>
              <label>Senha {licenciada && '(opcional)'}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Nova senha..."
                />
              </div>
            </FormGroup>

            <ResponsiveGrid $template="1fr 1fr">
              <FormGroup>
                <label>Limite Dispositivos</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.maxDevices}
                  onChange={e => setFormData({ ...formData, maxDevices: parseInt(e.target.value) })}
                />
              </FormGroup>
              <FormGroup>
                <label>Status</label>
                <select
                  value={formData.isActive ? '1' : '0'}
                  onChange={e => setFormData({ ...formData, isActive: e.target.value === '1' })}
                >
                  <option value="1">Ativa</option>
                  <option value="0">Bloqueada</option>
                </select>
              </FormGroup>
            </ResponsiveGrid>

            <SmartBookCard>
              <label>
                <input
                  type="checkbox"
                  checked={formData.ai_notebook_beta_enabled}
                  onChange={e => setFormData({ ...formData, ai_notebook_beta_enabled: e.target.checked })}
                />
                <Brain size={16} color="#16A34A" />
                <span>Liberar Acesso ao Smart Book (IA)</span>
              </label>
              <small>
                Permite que esta licenciada veja o botão Smart Book e acesse a base de conhecimento/RAG.
              </small>
            </SmartBookCard>

            {licenciada && (
              <FormGroup style={{ marginTop: '1rem' }}>
                <label>Dispositivos Pareados ({devices.length}/{formData.maxDevices})</label>
                {loadingDevices ? (
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Carregando dispositivos...</p>
                ) : devices.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Nenhum dispositivo registrado.</p>
                ) : (
                  <DeviceList>
                    {devices.map(dev => (
                      <DeviceItem key={dev.id}>
                        <div className="info">
                          <strong><Smartphone size={14} /> Dispositivo</strong>
                          <span>Último uso: {dev.last_used_at}</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveDevice(dev.id)}>
                          <Trash2 size={13} />
                          <span>Desvincular</span>
                        </button>
                      </DeviceItem>
                    ))}
                  </DeviceList>
                )}
              </FormGroup>
            )}
          </>
        )}
      </form>
    </ResponsiveModal>
  )
}
