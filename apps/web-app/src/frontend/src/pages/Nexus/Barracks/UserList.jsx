import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import NexusLayout from '../NexusLayout';
import { api } from '../../../services/api';
import { Ghost, Shield, Smartphone, RefreshCw, Key, Plus, Trash2, UserCog, Stethoscope, Search, RotateCcw, ArrowDownUp, ArrowDown, ArrowUp } from 'lucide-react';
import ErrorModal from '../components/ErrorModal';
import { pt } from '../../../i18n/translations';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #111;
  border: 1px solid #222;
  border-radius: 8px;
  overflow: hidden;

  th {
    background: #1a1a1a;
    padding: 12px;
    text-align: left;
    color: #888;
    font-size: 0.8rem;
    text-transform: uppercase;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #222;
    color: #ccc;
    font-size: 0.9rem;
  }
  
  tr:hover { background: #161616; }
`;

const Badge = styled.span`
  background: ${props => props.$active ? '#1b3a1b' : '#3a1b1b'};
  color: ${props => props.$active ? '#4caf50' : '#f44336'};
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
`;

const ActionBtn = styled.button`
  background: #222;
  border: 1px solid #333;
  color: #ccc;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  margin-right: 8px;
  transition: all 0.2s;

  &:hover { background: #333; border-color: #444; color: #fff; }
  &.primary { border-color: #00bcd4; color: #00bcd4; &:hover { background: #00bcd4; color: #000; } }
  &.danger { border-color: #b71c1c; color: #ef9a9a; &:hover { background: #c62828; color: white; } }
  &.ghost { border-color: #6a1b9a; color: #ce93d8; &:hover { background: #4a148c; } }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 5px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  z-index: 100;
  overflow: hidden;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 10px 15px;
  background: none;
  border: none;
  color: #ccc;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  transition: all 0.2s;
  
  &:hover {
    background: #252525;
    color: #fff;
  }
  
  &.danger:hover {
    background: #3a1b1b;
    color: #f44336;
  }
  
  &.primary:hover {
    background: #1b3a3a;
    color: #00bcd4;
  }
`;

const StatusBadgeWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Tabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
`;

const Tab = styled.button`
  background: none;
  border: none;
  color: ${props => props.$active ? '#fff' : '#666'};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  padding: 5px 10px;
  border-bottom: 2px solid ${props => props.$active ? '#00bcd4' : 'transparent'};

  &:hover { color: #fff; }
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1a1a1a; padding: 25px; border-radius: 8px; border: 1px solid #333; width: 400px;
  h2 { margin-top: 0; color: #fff; margin-bottom: 20px; }
  input, select { 
    width: 100%; padding: 10px; margin-bottom: 15px; 
    background: #111; border: 1px solid #333; color: #fff; 
  }
  .actions { display: flex; justify-content: flex-end; gap: 10px; }
`;

const Card = styled.div`
  background: #111;
  border: 1px solid #222;
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
`;

const Button = styled.button`
  background: ${props => props.$primary ? '#ED7E13' : 'transparent'};
  color: ${props => props.$primary ? '#fff' : '#ccc'};
  border: 1px solid ${props => props.$primary ? '#ED7E13' : '#333'};
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
    background: ${props => props.$primary ? '#d66d0c' : '#222'};
    color: #fff;
  }
`;

const StatusBadgeDropdown = ({ user, onRefresh }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAction = async (action) => {
        setLoading(true);
        try {
            if (action === 'ban') {
                await api.nexus.banUser(user.id);
            } else if (action === 'unban') {
                await api.nexus.unbanUser(user.id);
            } else if (action === 'clear_devices') {
                await api.nexus.clearDevices(user.id);
            } else if (action === 'toggle_tester') {
                await api.request('/v1/admin/users', {
                    method: 'POST',
                    body: JSON.stringify({ action: 'toggle_tester', user_id: user.id })
                });
            }

            setShowMenu(false);
            onRefresh();
            alert(`✅ ${pt.nexus.barracks.messages.actionSuccess}`);
        } catch (e) {
            // Use ErrorModal for structured errors
            if (e.response && e.response.error) {
                setError(e.response.error);
            } else {
                setError({
                    type: 'UNKNOWN_ERROR',
                    message: e.message || 'Erro desconhecido. Tente novamente.'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showMenu && !e.target.closest('.status-badge-wrapper')) {
                setShowMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showMenu]);

    return (
        <StatusBadgeWrapper className="status-badge-wrapper">
            <Badge
                $active={user?.active == 1}
                onClick={() => setShowMenu(!showMenu)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to manage access"
            >
                {user?.active == 1 ? `🟢 ${pt.nexus.barracks.status.active}` : `🔴 ${pt.nexus.barracks.status.banned}`} ▼
            </Badge>

            {showMenu && (
                <DropdownMenu>
                    {user.active == 1 ? (
                        <MenuItem
                            className="danger"
                            onClick={() => handleAction('ban')}
                            disabled={loading}
                        >
                            <Shield size={14} /> {pt.nexus.barracks.actions.ban}
                        </MenuItem>
                    ) : (
                        <MenuItem
                            className="primary"
                            onClick={() => handleAction('unban')}
                            disabled={loading}
                        >
                            <Shield size={14} /> {pt.nexus.barracks.actions.unban}
                        </MenuItem>
                    )}
                    <MenuItem
                        onClick={() => handleAction('clear_devices')}
                        disabled={loading}
                        className="danger"
                        title="Kick focus from all active sessions"
                    >
                        <RefreshCw size={14} /> Revogar Todas as Sessões ({user?.device_count || 0})
                    </MenuItem>
                    <MenuItem
                        onClick={() => handleAction('toggle_tester')}
                        disabled={loading}
                        className="primary"
                        title="Mark as test account to skip security alerts"
                    >
                        <UserCog size={14} /> {user.is_tester ? 'Remover Flag TESTER' : 'Marcar como TESTER'}
                    </MenuItem>
                </DropdownMenu>
            )}

            {error && <ErrorModal error={error} onClose={() => setError(null)} />}
        </StatusBadgeWrapper>
    );
};

const UserList = () => {
    const [tab, setTab] = useState('students');
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastSeenSortMode, setLastSeenSortMode] = useState('default'); // 'default', 'recent', 'oldest'

    const [modal, setModal] = useState(null); // { type: 'create_student' | 'create_admin' | 'reset', target: {} }
    const [resetModal, setResetModal] = useState(null);
    const [resetOptions, setResetOptions] = useState({
        force_password: true,
        revoke_lgpd: true,
        clear_devices: false,
        clear_throttling: true,
        max_devices: 2
    });
    const [formData, setFormData] = useState({});
    const [report, setReport] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (tab === 'students') {
                const res = await api.nexus.getUsers();
                setUsers(res.users || []);
            } else {
                const res = await api.nexus.getAdmins();
                setAdmins(res.admins || []);
            }
        } catch (e) {
            console.error('Barracks communication error:', e);
            setUsers([]);
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [tab]);

    const submitCreate = async () => {
        try {
            if (tab === 'students') {
                await api.nexus.createStudent(formData);
            } else {
                await api.nexus.createAdmin(formData);
            }
            setModal(null);
            fetchData();
            alert('User Created Successfully');
        } catch (e) { alert(e.message); }
    };

    const submitReset = async () => {
        try {
            if (tab === 'students') {
                await api.nexus.resetStudentPassword(modal.target.id, formData.password);
            } else {
                await api.nexus.resetAdminPassword(modal.target.id, formData.password);
            }
            setModal(null);
            alert('Password Reset Successfully');
        } catch (e) { alert(e.message); }
    };

    const handleResetLifecycle = async () => {
        try {
            await api.nexus.resetLifecycle(resetModal.id, resetOptions);
            setResetModal(null);
            alert('Lifecycle resetado com sucesso');
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const handleDelete = async (u) => {
        if (!u) return;
        if (!confirm(`DELETE ${u.name || u.username || 'User'}? This cannot be undone.`)) return;
        try {
            if (tab === 'students') await api.nexus.deleteStudent(u.id);
            else await api.nexus.deleteAdmin(u.id);
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const handleCheckAccess = async (userId) => {
        setReport(null);
        try {
            const res = await api.nexus.checkAccess({ student_id: userId });
            if (res.success) setReport(res.report);
        } catch (e) {
            alert('❌ Erro no diagnóstico');
        }
    };

    const handleImpersonate = async (userId) => {
        if (!confirm('👻 ENTER GHOST MODE?')) return;
        try {
            const res = await api.nexus.impersonate(userId);
            if (res.success) {
                localStorage.setItem('ghost_session', JSON.stringify({
                    token: res.device_token,
                    student: res.student,
                    active: true
                }));
                window.open('/lms/dashboard', '_blank');
            }
        } catch (e) { alert('Ghost Mode Failed'); }
    };

    const filtered = (tab === 'students' ? users : admins).filter(u => {
        if (!u) return false;
        const name = (u.name || u.username || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        // Check exact match for ID when starting with "#", e.g. "#1234"
        if (search.startsWith('#')) {
            const idQuery = search.substring(1);
            return String(u.id) === idQuery;
        }
        return name.includes(search) || (u.whatsapp && u.whatsapp.includes(search));
    });

    const sortedStudents = useMemo(() => {
        if (tab !== 'students' || lastSeenSortMode === 'default') return filtered;

        return [...filtered].sort((a, b) => {
            const timeA = a.last_seen && a.last_seen.toLowerCase() !== 'never' ? new Date(a.last_seen).getTime() : 0;
            const timeB = b.last_seen && b.last_seen.toLowerCase() !== 'never' ? new Date(b.last_seen).getTime() : 0;

            if (lastSeenSortMode === 'recent') {
                return timeB - timeA; // Descending (Newest first)
            } else {
                return timeA - timeB; // Ascending (Oldest first)
            }
        });
    }, [filtered, lastSeenSortMode, tab]);

    const toggleLastSeenSort = () => {
        setLastSeenSortMode(prev => {
            if (prev === 'default') return 'recent';
            if (prev === 'recent') return 'oldest';
            return 'default';
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: '#fff', margin: 0 }}>Barracks // User Management</h1>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>Manage Access & Security</div>
                </div>
                <div>
                    <ActionBtn className="primary" onClick={() => { setFormData({}); setModal({ type: 'create' }); }} style={{ background: '#ED7E13', color: '#fff' }}>
                        <Plus size={16} /> New {tab === 'students' ? 'Student' : 'Admin'}
                    </ActionBtn>
                    <ActionBtn onClick={fetchData}><RefreshCw size={16} /></ActionBtn>
                </div>
            </div>

            <div style={{ marginBottom: '20px', background: '#0A3E60', borderRadius: '8px', padding: '5px 15px', border: '1px solid #316B9C', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Search size={18} color="#316B9C" />
                <input
                    type="text"
                    placeholder="Search by name, whatsapp, or ID (#1445)..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', padding: '10px', width: '100%', outline: 'none' }}
                />
            </div>

            <Tabs>
                <Tab $active={tab === 'students'} onClick={() => setTab('students')}>{pt.nexus.barracks.tabs.students}</Tab>
                <Tab $active={tab === 'admins'} onClick={() => setTab('admins')}>{pt.nexus.barracks.tabs.admins}</Tab>
            </Tabs>

            {loading ? <div style={{ color: '#666', padding: '20px' }}>Scanning database...</div> : (
                <Card style={{ background: '#0A3E60', borderColor: '#316B9C', height: 'auto' }}>
                    <Table>
                        <thead>
                            <tr>
                                {tab === 'students' ? (
                                    <>
                                        <th>ID</th>
                                        <th>Status</th>
                                        <th>Name</th>
                                        <th>CPF</th>
                                        <th>Devices</th>
                                        <th
                                            onClick={toggleLastSeenSort}
                                            style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            title="Click to toggle order"
                                        >
                                            Last Seen
                                            {lastSeenSortMode === 'default' && <ArrowDownUp size={14} color="#666" />}
                                            {lastSeenSortMode === 'recent' && <ArrowDown size={14} color="#00bcd4" />}
                                            {lastSeenSortMode === 'oldest' && <ArrowUp size={14} color="#00bcd4" />}
                                        </th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </>
                                ) : (
                                    <>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Role</th>
                                        <th>Created At</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {tab === 'students' ? sortedStudents.map(u => (
                                <tr key={u.id}>
                                    <td style={{ fontFamily: 'monospace', color: '#666', fontSize: '0.8rem' }}>#{u.id}</td>
                                    <td><StatusBadgeDropdown user={u} onRefresh={fetchData} /></td>
                                    <td style={{ fontWeight: 'bold', color: u.locked_until ? '#f44336' : '#fff' }}>
                                        {u.name || 'Unnamed'}
                                        {u.is_tester == 1 && (
                                            <span style={{ marginLeft: '10px', background: '#ED7E13', color: '#000', padding: '1px 5px', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                TESTER
                                            </span>
                                        )}
                                        {u.failed_login_attempts > 0 && (
                                            <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: u.locked_until ? '#f44336' : '#ED7E13', border: '1px solid currentColor', padding: '1px 4px', borderRadius: '3px' }}>
                                                {u.locked_until ? 'BLOCK' : `${u.failed_login_attempts}nd`}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', color: '#888' }}>{u.cpf || '-'}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Smartphone size={14} color={(u.device_count || 0) >= (u.max_devices || 2) ? '#ED7E13' : '#4caf50'} />
                                            <span style={{ color: (u.device_count || 0) >= (u.max_devices || 2) ? '#ED7E13' : '#ccc' }}>
                                                {u.device_count || 0} / {u.max_devices || 2}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', color: '#888' }}>{u.last_seen || 'Never'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <ActionBtn onClick={() => handleImpersonate(u.id)} title="GHOST MODE: Entrar como aluna"><Ghost size={14} /></ActionBtn>
                                            <ActionBtn onClick={() => handleCheckAccess(u.id)} title="DIAGNÓSTICO: Verificar saúde do acesso"><Stethoscope size={14} /></ActionBtn>
                                            <ActionBtn onClick={() => {
                                                setResetOptions({
                                                    force_password: false,
                                                    revoke_lgpd: false,
                                                    clear_devices: false,
                                                    clear_throttling: (u.failed_login_attempts > 0 || u.locked_until !== null),
                                                    max_devices: u.max_devices || 2
                                                });
                                                setResetModal(u);
                                            }} title="RECOVERY: Resetar ciclo de vida/travas"><RotateCcw size={14} /></ActionBtn>
                                            <ActionBtn onClick={() => { setFormData({}); setModal({ type: 'reset', target: u }); }} title="SENHA: Definir nova senha"><Key size={14} /></ActionBtn>
                                            <ActionBtn className="danger" onClick={() => handleDelete(u)} title="EXCLUIR: Remover aluna permanentemente"><Trash2 size={14} /></ActionBtn>
                                        </div>
                                    </td>
                                </tr>
                            )) : admins.filter(a => !!a).map(a => (
                                <tr key={a.id}>
                                    <td style={{ fontFamily: 'monospace', color: '#666' }}>#{a.id}</td>
                                    <td style={{ fontWeight: 'bold', color: '#fff' }}>{a.username || 'Unnamed'}</td>
                                    <td><Badge $active={a.role === 'superadmin'}>{a.role?.toUpperCase() || 'ADMIN'}</Badge></td>
                                    <td style={{ fontFamily: 'monospace', color: '#888' }}>{a.created_at || 'N/A'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <ActionBtn onClick={() => { setFormData({}); setModal({ type: 'reset', target: a }); }} title="Reset Password"><Key size={14} /></ActionBtn>
                                            <ActionBtn className="danger" onClick={() => handleDelete(a)} title="Delete Admin"><Trash2 size={14} /></ActionBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}

            {modal && (
                <ModalOverlay onClick={() => setModal(null)}>
                    <ModalContent onClick={e => e.stopPropagation()} style={{ background: '#0A3E60', borderColor: '#316B9C' }}>
                        <h2 style={{ color: '#fff' }}>{modal.type === 'create' ? `Create ${tab === 'students' ? 'Student' : 'Admin'}` : 'Reset Password'}</h2>

                        {modal.type === 'create' && tab === 'students' && (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                <input placeholder="Full Name" onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ background: '#0A3E60', borderColor: '#316B9C' }} />
                                <input placeholder="WhatsApp (Login ID)" onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} style={{ background: '#0A3E60', borderColor: '#316B9C' }} />
                                <input type="password" placeholder="Initial Password" onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ background: '#0A3E60', borderColor: '#316B9C' }} />
                            </div>
                        )}

                        {modal.type === 'create' && tab === 'admins' && (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                <input placeholder="Username (e.g. admin.joao)" onChange={e => setFormData({ ...formData, username: e.target.value })} style={{ background: '#0A3E60', borderColor: '#316B9C' }} />
                                <select onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ background: '#0A3E60', borderColor: '#316B9C', color: '#fff' }}>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                                <input type="password" placeholder="Initial Password" onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ background: '#0A3E60', borderColor: '#316B9C' }} />
                            </div>
                        )}

                        {modal.type === 'reset' && (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                <p style={{ color: '#ccc' }}>Resetting password for: <strong>{modal.target?.name || modal.target?.username || 'User'}</strong></p>
                                <input type="password" placeholder="New Password" onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ background: '#0A3E60', borderColor: '#316B9C' }} />
                            </div>
                        )}

                        <div className="actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <Button onClick={() => setModal(null)} style={{ borderColor: '#316B9C' }}>Cancel</Button>
                            <Button $primary onClick={modal.type === 'create' ? submitCreate : submitReset} style={{ background: '#ED7E13' }}>
                                {modal.type === 'create' ? 'Create User' : 'Update Password'}
                            </Button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}

            {resetModal && (
                <ModalOverlay onClick={() => setResetModal(null)}>
                    <ModalContent onClick={e => e.stopPropagation()} style={{ background: '#0A3E60', borderColor: '#316B9C' }}>
                        <h2 style={{ color: '#fff' }}>Reset Lifecycle: {resetModal.name}</h2>
                        <div style={{ display: 'grid', gap: '15px', color: '#ccc' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={resetOptions.force_password} onChange={e => setResetOptions({ ...resetOptions, force_password: e.target.checked })} />
                                Forçar Troca de Senha (e Reset para Mudar123!)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={resetOptions.revoke_lgpd} onChange={e => setResetOptions({ ...resetOptions, revoke_lgpd: e.target.checked })} />
                                Revogar LGPD (Reexibir Termos)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={resetOptions.clear_devices} onChange={e => setResetOptions({ ...resetOptions, clear_devices: e.target.checked })} />
                                Limpar Dispositivos Conectados (Sessões)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#ED7E13' }}>
                                <input type="checkbox" checked={resetOptions.clear_throttling} onChange={e => setResetOptions({ ...resetOptions, clear_throttling: e.target.checked })} />
                                <strong>Limpar Bloqueios (Clear Throttling/Lockout)</strong>
                            </label>
                            <div style={{ marginTop: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: '#888' }}>LIMITE DE DISPOSITIVOS SIMULTÂNEOS</label>
                                <select
                                    value={resetOptions.max_devices}
                                    onChange={e => setResetOptions({ ...resetOptions, max_devices: parseInt(e.target.value) })}
                                    style={{ background: '#111', border: '1px solid #316B9C', color: '#fff', width: '100%', padding: '8px' }}
                                >
                                    <option value={1}>1 Dispositivo</option>
                                    <option value={2}>2 Dispositivos (Padrão)</option>
                                    <option value={3}>3 Dispositivos</option>
                                    <option value={5}>5 Dispositivos (Premium/Troubleshooting)</option>
                                    <option value={10}>10 Dispositivos (Forense/Admin)</option>
                                </select>
                            </div>
                        </div>
                        <div className="actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <Button onClick={() => setResetModal(null)}>Cancelar</Button>
                            <Button $primary onClick={handleResetLifecycle} style={{ background: '#ED7E13' }}>Confirmar Reset</Button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}

            {report && (
                <ModalOverlay onClick={() => setReport(null)}>
                    <ModalContent onClick={e => e.stopPropagation()} style={{ width: '350px', background: '#0A3E60', borderColor: '#316B9C' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                            <Stethoscope size={20} color="#ED7E13" /> Access Report
                        </h2>

                        <div style={{ background: '#072b42', padding: '15px', borderRadius: '6px', border: '1px solid #316B9C' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', color: '#316B9C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Account Health</label>
                                <strong style={{ color: report.account_status === 'ACTIVE' ? '#4caf50' : '#f44336' }}>
                                    {report.account_status}
                                </strong>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', color: '#316B9C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Active Devices</label>
                                <strong style={{ color: report.device_status === 'OK' ? '#fff' : '#ED7E13' }}>
                                    {report.active_devices} ({report.device_status})
                                </strong>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#316B9C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Last Heartbeat</label>
                                <strong style={{ color: '#ccc' }}>{report.recent_activity}</strong>
                            </div>
                        </div>

                        <div className="actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <Button $primary onClick={() => setReport(null)} style={{ background: '#ED7E13' }}>Close Report</Button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </div>
    );
};

export default UserList;
