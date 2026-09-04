import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { BookOpen, Check, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import { api } from '../../../services/api'
import LMSService from '../../../services/LMSService'
import ResponsiveModal from '../../../components/ui/ResponsiveModal'

const spin = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`

const ModuleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const ModuleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  gap: 0.75rem;
  transition: all 0.15s ease;

  &:hover {
    border-color: #CBD5E1;
    background: #F1F5F9;
  }
`

const ModInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;

  .title {
    font-size: 0.88rem;
    font-weight: 700;
    color: #0A3E60;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    font-size: 0.72rem;
    color: #64748B;
  }
`

const ToggleBtn = styled.button`
  padding: 0.45rem 0.9rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
  flex-shrink: 0;

  background: ${({ $granted }) => ($granted ? 'rgba(220, 38, 38, 0.08)' : 'rgba(10, 62, 96, 0.08)')};
  border: 1px solid ${({ $granted }) => ($granted ? 'rgba(220, 38, 38, 0.25)' : 'rgba(10, 62, 96, 0.25)')};
  color: ${({ $granted }) => ($granted ? '#DC2626' : '#0A3E60')};

  &:hover {
    background: ${({ $granted }) => ($granted ? 'rgba(220, 38, 38, 0.15)' : 'rgba(10, 62, 96, 0.15)')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`

const EmptyBox = styled.div`
  text-align: center;
  padding: 2.5rem 1rem;
  color: #64748B;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  .spin {
    animation: ${spin} 1s linear infinite;
  }

  p {
    margin: 0;
    font-size: 0.85rem;
  }
`

const ToastBanner = styled.div`
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  color: #1E40AF;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
`

const CloseBtn = styled.button`
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  min-height: 44px;
  background: #0A3E60;
  color: #FFFFFF;
  border: none;
  transition: all 0.15s ease;

  &:hover {
    background: #06283D;
  }
`

export default function AlunaAccessModal({ aluna, onClose }) {
  const [modules, setModules] = useState([])
  const [granted, setGranted] = useState([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(null)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [modsRes, accessesRes] = await Promise.allSettled([
          LMSService.getModules(),
          api.admin.alunas.accesses(aluna.id),
        ])
        const rawMods = modsRes.status === 'fulfilled' ? modsRes.value : []
        const rawAccesses = accessesRes.status === 'fulfilled' ? accessesRes.value : []
        
        const modsList = Array.isArray(rawMods) ? rawMods : (rawMods?.modules || rawMods?.data || [])
        setModules(modsList)
        setGranted((Array.isArray(rawAccesses) ? rawAccesses : []).map(a => a.module_id))
      } catch (err) {
        console.error('Erro ao carregar módulos da aluna:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [aluna.id])

  const toggle = async (moduleId) => {
    setWorking(moduleId)
    try {
      if (granted.includes(moduleId)) {
        await api.admin.alunas.revokeAccess(aluna.id, moduleId)
        setGranted(p => p.filter(id => id !== moduleId))
        showToast('Acesso revogado com sucesso.')
      } else {
        await api.admin.alunas.grantAccess(aluna.id, { module_id: moduleId })
        setGranted(p => [...p, moduleId])
        showToast('Acesso concedido com sucesso!')
      }
    } catch {
      showToast('Erro ao alterar acesso.')
    } finally {
      setWorking(null)
    }
  }

  const footerContent = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
        {granted.length} de {modules.length} módulos liberados
      </span>
      <CloseBtn type="button" onClick={onClose}>
        Fechar
      </CloseBtn>
    </div>
  )

  return (
    <ResponsiveModal
      isOpen={true}
      onClose={onClose}
      title="Gerenciar Acessos LMS"
      subtitle={`${aluna?.name} — ${granted.length} curso(s) liberado(s)`}
      icon={BookOpen}
      size="md"
      footer={footerContent}
    >
      {loading ? (
        <EmptyBox>
          <Loader2 size={32} color="#0A3E60" className="spin" />
          <p>Carregando catálogo de módulos...</p>
        </EmptyBox>
      ) : modules.length === 0 ? (
        <EmptyBox>
          <AlertCircle size={32} color="#94A3B8" />
          <p>Nenhum módulo encontrado no sistema LMS.</p>
        </EmptyBox>
      ) : (
        <ModuleList>
          {modules.map(m => {
            const isGranted = granted.includes(m.id)
            const isBusy = working === m.id
            return (
              <ModuleRow key={m.id} id={`access-row-${m.id}`}>
                <ModInfo>
                  <span className="title">{m.title}</span>
                  <span className="meta">{m.slug || `Módulo #${m.id}`}</span>
                </ModInfo>
                <ToggleBtn
                  $granted={isGranted}
                  onClick={() => toggle(m.id)}
                  disabled={isBusy}
                  id={`toggle-module-${m.id}`}
                  type="button"
                >
                  {isBusy ? (
                    <Loader2 size={14} className="spin" />
                  ) : isGranted ? (
                    <>
                      <X size={14} />
                      <span>Revogar</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Conceder</span>
                    </>
                  )}
                </ToggleBtn>
              </ModuleRow>
            )
          })}
        </ModuleList>
      )}

      {toast && <ToastBanner>{toast}</ToastBanner>}
    </ResponsiveModal>
  )
}
