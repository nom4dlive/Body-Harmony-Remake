import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { 
  Plus, Edit, Lock, Unlock, Key, BookOpen, Search, Trash2, 
  GraduationCap, UserCheck, UserX, ShieldAlert, Phone 
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { api } from '../../../services/api'
import AlunaFormModal from './AlunaFormModal'
import AlunaAccessModal from './AlunaAccessModal'
import CompactKpiGrid from '../../../components/ui/CompactKpiGrid'
import ResponsiveDataTable from '../../../components/ui/ResponsiveDataTable'
import TableRowActionMenu from '../../../components/ui/TableRowActionMenu'

// ── Styles ─────────────────────────────────────────────────────────────────
const Wrap = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  padding-bottom: 100px;

  @media (max-width: 768px) {
    padding: 0.85rem;
    padding-bottom: 90px;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`

const Title = styled.h1`
  color: ${({ theme }) => theme?.colors?.primary || '#0A3E60'};
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const AddBtn = styled.button`
  background: #ed7e13;
  color: #fff;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 42px;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(237, 126, 19, 0.25);
  transition: all 0.15s ease;

  &:hover {
    background: #ff8f26;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(237, 126, 19, 0.35);
  }
`

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.55rem 1rem;
  margin-bottom: 1.25rem;
  width: 100%;
  max-width: 420px;

  input {
    background: none;
    border: none;
    outline: none;
    font-size: 0.88rem;
    color: #334155;
    width: 100%;
    &::placeholder {
      color: #94a3b8;
    }
  }

  svg {
    color: #94a3b8;
    flex-shrink: 0;
  }
`

const Badge = styled.span`
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${({ $active }) => ($active ? 'rgba(34,197,94,0.12)' : 'rgba(220,38,38,0.1)')};
  color: ${({ $active }) => ($active ? '#15803d' : '#dc2626')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(34,197,94,0.25)' : 'rgba(220,38,38,0.2)')};
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
`

const LockBadge = styled.span`
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(237, 126, 19, 0.12);
  color: #ed7e13;
  border: 1px solid rgba(237, 126, 19, 0.25);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
`

const CPF = styled.span`
  font-family: monospace;
  font-size: 0.82rem;
  color: #475569;
`

const Toast = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #11223a;
  color: #fff;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  border-left: 4px solid #ed7e13;
`

const maskCPF = (cpf) => {
  if (!cpf) return '—'
  const c = cpf.replace(/\D/g, '')
  if (c.length !== 11) return cpf
  return `***.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`
}

const maskPhone = (phone) => {
  if (!phone) return '—'
  const d = phone.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return phone
}

const getStatus = (a) => {
  if (a.locked_until && new Date(a.locked_until) > new Date()) return 'locked'
  if (!a.is_active || a.is_active == 0) return 'inactive'
  return 'active'
}

export default function AlunaManager() {
  const [alunas, setAlunas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.admin.alunas.list()
      setAlunas(Array.isArray(data) ? data : [])
    } catch {
      setAlunas([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = alunas.filter(
    (a) =>
      (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.cpf || '').includes(search.replace(/\D/g, '')) ||
      (a.phone || '').includes(search.replace(/\D/g, ''))
  )

  const stats = {
    total: alunas.length,
    active: alunas.filter((a) => getStatus(a) === 'active').length,
    inactive: alunas.filter((a) => getStatus(a) === 'inactive').length,
    locked: alunas.filter((a) => getStatus(a) === 'locked').length,
  }

  const handleToggleActive = async (a) => {
    try {
      await api.admin.alunas.update(a.id, { is_active: a.is_active ? 0 : 1 })
      showToast(a.is_active ? 'Aluna desativada.' : 'Aluna ativada.')
      load()
    } catch {
      showToast('Erro ao alterar status.')
    }
  }

  const handleResetPw = async (a) => {
    const pw = window.prompt(`Nova senha para ${a.name}:`)
    if (!pw || pw.length < 6) return
    try {
      await api.admin.alunas.resetPassword(a.id, { password: pw })
      showToast('Senha redefinida com sucesso.')
    } catch {
      showToast('Erro ao redefinir senha.')
    }
  }

  const handleUnlock = async (a) => {
    try {
      await api.admin.alunas.unlock(a.id)
      showToast('Conta desbloqueada com sucesso.')
      load()
    } catch {
      showToast('Erro ao desbloquear.')
    }
  }

  const handleDelete = async (a) => {
    const confirm1 = window.confirm(`Excluir permanentemente ${a.name}?\nEsta ação é IRREVERSÍVEL.`)
    if (!confirm1) return
    const confirm2 = window.confirm(`CONFIRMAÇÃO FINAL: apagar ${a.email} e todos os seus dados?`)
    if (!confirm2) return
    try {
      await api.admin.alunas.hardDelete(a.id)
      showToast('Aluna excluída permanentemente.')
      load()
    } catch (e) {
      showToast(e.message || 'Erro ao excluir.')
    }
  }

  const kpiItems = [
    { label: 'Total de Alunas', value: stats.total, color: '#0A3E60', icon: GraduationCap },
    { label: 'Alunas Ativas', value: stats.active, color: '#16A34A', icon: UserCheck },
    { label: 'Inativas / Pausadas', value: stats.inactive, color: '#DC2626', icon: UserX },
    { label: 'Bloqueadas por Tentativas', value: stats.locked, color: '#ED7E13', icon: ShieldAlert },
  ]

  const columns = [
    {
      key: 'name',
      label: 'Nome da Aluna',
      isTitle: true,
      truncate: true,
      maxWidth: '200px',
      render: (name, a) => (
        <div>
          <strong style={{ color: '#0A3E60' }}>{name}</strong>
          {a.failed_login_attempts > 0 && (
            <span
              style={{
                marginLeft: 6,
                fontSize: '0.68rem',
                color: '#ED7E13',
                border: '1px solid #ED7E13',
                padding: '1px 4px',
                borderRadius: 4,
                fontWeight: 700,
              }}
            >
              {a.failed_login_attempts}x falha
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'E-mail',
      truncate: true,
      maxWidth: '220px',
      render: (email) => <span style={{ color: '#475569' }}>{email || '—'}</span>,
    },
    {
      key: 'cpf',
      label: 'CPF',
      render: (cpf) => <CPF>{maskCPF(cpf)}</CPF>,
    },
    {
      key: 'phone',
      label: 'Telefone',
      render: (phone) => <span style={{ color: '#475569', fontSize: '0.82rem' }}>{maskPhone(phone)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      isBadge: true,
      render: (_, a) => {
        const st = getStatus(a)
        if (st === 'locked') {
          return <LockBadge><Lock size={12} /> Bloqueada</LockBadge>
        }
        return (
          <Badge $active={a.is_active == 1}>
            {a.is_active == 1 ? 'Ativa' : 'Inativa'}
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      label: 'Ações',
      isAction: true,
      width: '130px',
      render: (_, a) => {
        const isLocked = getStatus(a) === 'locked'

        const secondary = [
          {
            label: 'Cursos & Acesso',
            icon: BookOpen,
            onClick: () => setModal({ type: 'access', aluna: a }),
          },
          {
            label: 'Resetar Senha',
            icon: Key,
            onClick: () => handleResetPw(a),
          },
          ...(isLocked
            ? [
                {
                  label: 'Desbloquear Conta',
                  icon: Unlock,
                  warning: true,
                  onClick: () => handleUnlock(a),
                },
              ]
            : []),
          {
            label: a.is_active ? 'Desativar Aluna' : 'Ativar Aluna',
            icon: a.is_active ? Lock : Unlock,
            warning: a.is_active,
            onClick: () => handleToggleActive(a),
          },
          {
            label: 'Excluir Definitivamente',
            icon: Trash2,
            danger: true,
            onClick: () => handleDelete(a),
          },
        ]

        return (
          <TableRowActionMenu
            primaryAction={{
              label: 'Editar',
              icon: Edit,
              variant: 'gold',
              onClick: () => setModal({ type: 'form', aluna: a }),
            }}
            secondaryActions={secondary}
          />
        )
      },
    },
  ]

  return (
    <AdminLayout>
      <Wrap>
        <Header>
          <Title>
            <GraduationCap size={22} color="#ED7E13" /> Gerenciar Alunas
          </Title>
          <AddBtn id="btn-nova-aluna" onClick={() => setModal({ type: 'form', aluna: null })}>
            <Plus size={16} /> Nova Aluna
          </AddBtn>
        </Header>

        {/* Compact KPIs */}
        <CompactKpiGrid items={kpiItems} />

        <SearchBar>
          <Search size={16} />
          <input
            id="aluna-search"
            placeholder="Buscar por nome, e-mail, CPF ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchBar>

        <ResponsiveDataTable
          columns={columns}
          data={filtered}
          keyExtractor="id"
          emptyTitle="Nenhuma aluna encontrada"
          emptyMessage="Tente alterar os termos de busca ou adicione uma nova aluna."
        />

        {modal?.type === 'form' && (
          <AlunaFormModal
            aluna={modal.aluna}
            onClose={() => setModal(null)}
            onSaved={() => {
              setModal(null)
              load()
              showToast('Aluna salva com sucesso!')
            }}
          />
        )}
        {modal?.type === 'access' && (
          <AlunaAccessModal aluna={modal.aluna} onClose={() => setModal(null)} />
        )}
        {toast && <Toast>{toast}</Toast>}
      </Wrap>
    </AdminLayout>
  )
}
