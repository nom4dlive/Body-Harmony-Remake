import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { api } from '../../../services/api'
import {
  RefreshCw, Smartphone, Key, UserX, ChevronDown, ChevronUp,
  Shield, Search, Trash2, BookOpen, Edit3, Unlock, UserPlus
} from 'lucide-react'
import AlunaDevicePanel from './AlunaDevicePanel'
import NexusAlunaAccessPanel from './NexusAlunaAccessPanel'
import NexusAlunaFormModal from './NexusAlunaFormModal'

// ── Styled (dark Nexus theme) ───────────────────────────────────────────────
const Wrap      = styled.div`padding:20px;`
const PageHead  = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;`
const PageTitle = styled.h1`color:#fff;margin:0;font-size:1.6rem;`
const Sub       = styled.div`color:#666;font-size:0.85rem;margin-top:4px;`
const Controls  = styled.div`display:flex;gap:8px;`
const ActionBtn = styled.button`
  background:#222;border:1px solid #333;color:#ccc;padding:8px 14px;
  border-radius:4px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;
  font-size:0.82rem;transition:all 0.2s;
  &:hover{background:#333;border-color:#444;color:#fff;}
  &.primary{border-color:#ED7E13;color:#ED7E13;&:hover{background:#ED7E13;color:#000;}}
  &.danger{border-color:#b71c1c;color:#ef9a9a;&:hover{background:#c62828;color:#fff;}}
  &.gold{border-color:#ED7E13;color:#fff;background:#ED7E13;&:hover{background:#d96d0c;}}
`

// ── Stats Bar ──────────────────────────────────────────────────────────────
const StatsBar = styled.div`
  display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;
  @media(max-width:700px){grid-template-columns:repeat(2,1fr);}
`
const Stat = styled.div`
  background:#111;border:1px solid ${({$color})=>$color||'#222'};border-radius:8px;
  padding:12px 16px;text-align:center;
  .val{font-size:1.5rem;font-weight:800;color:${({$color})=>$color||'#fff'};font-family:monospace;}
  .lbl{font-size:0.7rem;color:#666;text-transform:uppercase;letter-spacing:0.05em;margin-top:2px;}
`

const SearchBar = styled.div`
  display:flex;align-items:center;gap:10px;background:#0A3E60;
  border:1px solid #316B9C;border-radius:8px;padding:8px 14px;
  margin-bottom:16px;flex:1;
  input{background:none;border:none;color:#fff;outline:none;width:100%;font-size:0.9rem;
    &::placeholder{color:#555;}}
`
const SearchRow = styled.div`display:flex;gap:10px;margin-bottom:16px;align-items:center;`

const Table     = styled.table`width:100%;border-collapse:collapse;background:#111;border:1px solid #222;border-radius:8px;overflow:hidden;
  th{background:#1a1a1a;padding:10px 12px;text-align:left;color:#888;font-size:0.78rem;text-transform:uppercase;}
  td{padding:10px 12px;border-bottom:1px solid #1e1e1e;color:#ccc;font-size:0.88rem;}
  tr:hover td{background:#161616;}
`
const StatusBadge = styled.span`
  padding:2px 10px;border-radius:4px;font-size:0.72rem;font-weight:700;
  background:${({$v})=>({ativa:'#1b3a1b',bloqueada:'#3a1b1b','sem-acesso':'#3a3000'}[$v]||'#222')};
  color:${({$v})=>({ativa:'#4caf50',bloqueada:'#f44336','sem-acesso':'#FFB800'}[$v]||'#aaa')};
`
const ExpandBtn = styled.button`
  background:none;border:none;color:#666;cursor:pointer;padding:4px;
  display:inline-flex;align-items:center;gap:4px;font-size:0.78rem;
  &:hover{color:#fff;}
`
const ModalOverlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:1000;`
const Modal     = styled.div`background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:24px;width:360px;
  h2{color:#fff;margin:0 0 16px;font-size:1.1rem;}
  input{width:100%;padding:10px;background:#111;border:1px solid #333;color:#fff;border-radius:4px;font-size:0.9rem;outline:none;box-sizing:border-box;&:focus{border-color:#ED7E13;}}
  .actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px;}
`
const MBtn      = styled.button`padding:8px 18px;border-radius:4px;cursor:pointer;font-weight:700;font-size:0.85rem;
  background:${({$primary})=>$primary?'#ED7E13':'transparent'};
  border:${({$primary})=>$primary?'none':'1px solid #333'};
  color:${({$primary})=>$primary?'#fff':'#ccc'};
`
const Toast = styled.div`
  position:fixed;bottom:24px;right:24px;background:#1b3a1b;border:1px solid #2e7d32;
  color:#66bb6a;padding:12px 20px;border-radius:8px;font-size:0.88rem;z-index:9999;
  font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.4);
`

const getStatus = (a) => {
  if (a.locked_until && new Date(a.locked_until) > new Date()) return 'bloqueada'
  if (!a.is_active) return 'bloqueada'
  if (!a.course_count || a.course_count == 0) return 'sem-acesso'
  return 'ativa'
}
const statusLabel = { ativa:'🟢 ATIVA', bloqueada:'🔴 BLOQUEADA', 'sem-acesso':'🟡 SEM CURSOS' }

export default function NexusAlunas() {
  const [alunas, setAlunas]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [expandedDevices, setExpandedDevices] = useState(null)
  const [expandedAccess, setExpandedAccess]   = useState(null)
  const [resetModal, setResetModal]           = useState(null)
  const [newPw, setNewPw]       = useState('')
  const [formModal, setFormModal] = useState(null) // null | { aluna?: object }
  const [toast, setToast]       = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.admin.alunas.list()
      setAlunas(Array.isArray(data) ? data : [])
    } catch { setAlunas([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = alunas.filter(a =>
    !search ||
    (a.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (a.email||'').toLowerCase().includes(search.toLowerCase()) ||
    (a.cpf||'').includes(search.replace(/\D/g, '')) ||
    (a.phone||'').includes(search.replace(/\D/g, ''))
  )

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = {
    total:    alunas.length,
    ativas:   alunas.filter(a => getStatus(a) === 'ativa').length,
    bloq:     alunas.filter(a => getStatus(a) === 'bloqueada').length,
    sem:      alunas.filter(a => getStatus(a) === 'sem-acesso').length,
  }

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleResetPw = async () => {
    if (!newPw || newPw.length < 6 || !resetModal) return
    try {
      await api.admin.alunas.resetPassword(resetModal.id, { password: newPw })
      setResetModal(null); setNewPw('')
      showToast('✅ Senha redefinida.')
    } catch (e) { showToast('❌ ' + e.message) }
  }

  const handleRevokeDevices = async (a) => {
    if (!confirm(`Revogar TODOS os dispositivos de ${a.name}?`)) return
    try {
      await api.admin.alunas.revokeDevices(a.id)
      showToast('✅ Dispositivos revogados.')
    } catch (e) { showToast('❌ ' + e.message) }
  }

  const handleDeactivate = async (a) => {
    if (!confirm(`Desativar conta de ${a.name}?`)) return
    try {
      await api.admin.alunas.destroy(a.id)
      load()
      showToast('Conta desativada.')
    } catch (e) { showToast('❌ ' + e.message) }
  }

  const handleHardDelete = async (a) => {
    if (!confirm(`EXCLUIR PERMANENTEMENTE ${a.name}?\nTodos os dados serão apagados.`)) return
    if (!confirm(`CONFIRMAÇÃO NEXUS: Apagar ${a.email} do banco de dados?`)) return
    try {
      await api.admin.alunas.hardDelete(a.id)
      showToast('✅ Aluna excluída permanentemente.')
      load()
    } catch (e) { showToast('❌ ' + e.message) }
  }

  const handleUnlock = async (a) => {
    try {
      await api.admin.alunas.unlock(a.id)
      showToast('🔓 Conta desbloqueada.')
      load()
    } catch (e) { showToast('❌ ' + e.message) }
  }

  return (
    <Wrap>
      <PageHead>
        <div>
          <PageTitle>🎓 Alunas // Portal Individual</PageTitle>
          <Sub>Gestão técnica de alunas V69</Sub>
        </div>
        <Controls>
          <ActionBtn onClick={load}><RefreshCw size={14} />Refresh</ActionBtn>
          <ActionBtn className="gold" onClick={() => setFormModal({ aluna: null })}>
            <UserPlus size={14} />Nova Aluna
          </ActionBtn>
        </Controls>
      </PageHead>

      {/* Stats Bar */}
      <StatsBar>
        <Stat $color="#ccc">
          <div className="val">{stats.total}</div>
          <div className="lbl">Total</div>
        </Stat>
        <Stat $color="#4caf50">
          <div className="val">{stats.ativas}</div>
          <div className="lbl">Ativas</div>
        </Stat>
        <Stat $color="#f44336">
          <div className="val">{stats.bloq}</div>
          <div className="lbl">Bloqueadas</div>
        </Stat>
        <Stat $color="#FFB800">
          <div className="val">{stats.sem}</div>
          <div className="lbl">Sem Cursos</div>
        </Stat>
      </StatsBar>

      <SearchRow>
        <SearchBar>
          <Search size={16} color="#316B9C" />
          <input
            placeholder="Buscar por nome, e-mail, CPF ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </SearchBar>
      </SearchRow>

      {loading ? (
        <div style={{ color:'#666', padding:'20px' }}>Scanning database...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color:'#555', padding:'40px', textAlign:'center' }}>
          {alunas.length === 0 ? 'Nenhuma aluna cadastrada. Clique "Nova Aluna" para começar.' : 'Nenhum resultado para a busca.'}
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Cursos</th>
              <th>Últ. Login</th>
              <th style={{ textAlign:'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const st = getStatus(a)
              const isDevExpanded = expandedDevices === a.id
              const isAccessExpanded = expandedAccess === a.id
              const isLocked = a.locked_until && new Date(a.locked_until) > new Date()
              return [
                <tr key={a.id} id={`nexus-aluna-${a.id}`}>
                  <td style={{ fontFamily:'monospace', color:'#666', fontSize:'0.78rem' }}>#{a.id}</td>
                  <td><StatusBadge $v={st}>{statusLabel[st]}</StatusBadge></td>
                  <td style={{ fontWeight:'bold', color: isLocked ? '#f44336' : '#fff' }}>
                    {a.name}
                    {a.failed_login_attempts > 0 && (
                      <span style={{ marginLeft:8, fontSize:'0.68rem', color:'#ED7E13', border:'1px solid #ED7E13', padding:'1px 4px', borderRadius:3 }}>
                        {a.failed_login_attempts}x falha
                      </span>
                    )}
                  </td>
                  <td style={{ fontFamily:'monospace', color:'#888', fontSize:'0.82rem' }}>{a.email}</td>
                  <td style={{ fontFamily:'monospace', color:'#666', fontSize:'0.78rem' }}>{a.cpf ? `***.${a.cpf.slice(3,6)}.${a.cpf.slice(6,9)}-${a.cpf.slice(9)}` : '—'}</td>
                  <td style={{ fontFamily:'monospace', color:'#666', fontSize:'0.78rem' }}>{a.phone ? `(${a.phone.slice(0,2)}) ${a.phone.slice(2,7)}-${a.phone.slice(7)}` : '—'}</td>
                  <td style={{ color:'#ccc' }}>{a.course_count || 0}</td>
                  <td style={{ fontFamily:'monospace', color:'#666', fontSize:'0.78rem' }}>{a.last_login_at ? new Date(a.last_login_at).toLocaleString('pt-BR') : '—'}</td>
                  <td style={{ textAlign:'right' }}>
                    <div style={{ display:'flex', gap:5, justifyContent:'flex-end', flexWrap:'wrap' }}>
                      <ActionBtn onClick={() => setFormModal({ aluna: a })} title="Editar"><Edit3 size={13} /></ActionBtn>
                      <ActionBtn className="primary" onClick={() => setExpandedAccess(isAccessExpanded ? null : a.id)} title="Gerenciar cursos">
                        <BookOpen size={13} />{isAccessExpanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                      </ActionBtn>
                      <ExpandBtn onClick={() => setExpandedDevices(isDevExpanded ? null : a.id)} title="Ver dispositivos">
                        <Smartphone size={13} />{isDevExpanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                      </ExpandBtn>
                      {isLocked && (
                        <ActionBtn className="primary" onClick={() => handleUnlock(a)} title="Desbloquear conta"><Unlock size={13} /></ActionBtn>
                      )}
                      <ActionBtn onClick={() => { setResetModal(a); setNewPw('') }} title="Reset senha"><Key size={13} /></ActionBtn>
                      <ActionBtn className="danger" onClick={() => handleRevokeDevices(a)} title="Revogar dispositivos"><Shield size={13} /></ActionBtn>
                      <ActionBtn className="danger" onClick={() => handleDeactivate(a)} title="Desativar conta"><UserX size={13} /></ActionBtn>
                      <ActionBtn className="danger" onClick={() => handleHardDelete(a)} title="Excluir permanentemente" style={{ borderColor:'#7f0000', color:'#ff6b6b' }}><Trash2 size={13} /></ActionBtn>
                    </div>
                  </td>
                </tr>,
                isAccessExpanded && (
                  <tr key={`access-${a.id}`}>
                    <td colSpan={9} style={{ background:'#0d0d0d', padding:0 }}>
                      <NexusAlunaAccessPanel alunaId={a.id} alunaName={a.name} onAccessChanged={load} />
                    </td>
                  </tr>
                ),
                isDevExpanded && (
                  <tr key={`dev-${a.id}`}>
                    <td colSpan={9} style={{ background:'#0d0d0d', padding:0 }}>
                      <AlunaDevicePanel alunaId={a.id} alunaName={a.name} onRevokeAll={() => handleRevokeDevices(a)} />
                    </td>
                  </tr>
                )
              ]
            })}
          </tbody>
        </Table>
      )}

      {/* Reset Password Modal */}
      {resetModal && (
        <ModalOverlay onClick={() => setResetModal(null)}>
          <Modal onClick={e => e.stopPropagation()}>
            <h2>🔑 Reset Senha</h2>
            <p style={{ color:'#888', fontSize:'0.85rem', marginBottom:12 }}>
              Redefinir senha de: <strong style={{ color:'#fff' }}>{resetModal.name}</strong>
            </p>
            <input
              type="password" placeholder="Nova senha (mín. 6 caracteres)"
              value={newPw} onChange={e => setNewPw(e.target.value)}
            />
            <div className="actions">
              <MBtn onClick={() => setResetModal(null)}>Cancelar</MBtn>
              <MBtn $primary onClick={handleResetPw} disabled={newPw.length < 6}>Confirmar</MBtn>
            </div>
          </Modal>
        </ModalOverlay>
      )}

      {/* Create/Edit Form Modal */}
      {formModal && (
        <NexusAlunaFormModal
          aluna={formModal.aluna}
          onClose={() => setFormModal(null)}
          onSaved={() => { setFormModal(null); load(); showToast('✅ Aluna salva.') }}
        />
      )}

      {toast && <Toast>{toast}</Toast>}
    </Wrap>
  )
}
