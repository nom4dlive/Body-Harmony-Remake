import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { api } from '../../../services/api'
import { FaShieldAlt, FaUserShield, FaGlobe, FaServer, FaLock } from 'react-icons/fa'

const Container = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 { color: #0f172a; font-size: 1.8rem; display: flex; align-items: center; gap: 0.5rem; }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  
  h3 { color: #64748b; font-size: 0.9rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .value { font-size: 2rem; font-weight: 700; color: #0f172a; }
  .icon { float: right; font-size: 1.5rem; color: #cbd5e1; }
`

const LogTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-collapse: collapse;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  th { background: #f1f5f9; color: #475569; font-weight: 600; font-size: 0.85rem; }
  tr:last-child td { border-bottom: none; }
  
  .status-allow { color: #16a34a; font-weight: 600; }
  .status-block { color: #dc2626; font-weight: 600; }
`

export default function SecurityDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch stats (Mock for now or api.getSecurityStats if implemented in frontend api service)
        // We haven't added `getSecurityStats` to api.js yet.
        // Let's implement a fetch here directly or add to api.js?
        // Good practice: Add to api.js.
        // For now, let's assume api.get('/security.php') works if we add it. 

        // Quick inline fetch for MVP
        const fetchStats = async () => {
            try {
                const data = await api.request('/security.php')
                if (data) {
                    setStats(data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false);
            }
        }
        fetchStats()
    }, [])

    if (loading) return <div>Carregando Segurança...</div>
    if (!stats) return <div>Erro ao carregar dados.</div>

    return (
        <Container>
            <Header>
                <h1><FaShieldAlt /> Painel de Segurança (Superadmin)</h1>
            </Header>

            <Grid>
                <Card>
                    <FaUserShield className="icon" />
                    <h3>Sessões Ativas (24h)</h3>
                    <div className="value">{stats.active_devices_24h}</div>
                </Card>
                <Card>
                    <FaLock className="icon" />
                    <h3>Admins no Time</h3>
                    <div className="value">{stats.admin_count}</div>
                </Card>
                <Card>
                    <FaServer className="icon" />
                    <h3>Status do DB</h3>
                    <div className="value" style={{ fontSize: '1.2rem', color: 'green' }}>{stats.system_status}</div>
                </Card>
            </Grid>

            <h2>Logs de Acesso Recentes</h2>
            <LogTable>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Usuário</th>
                        <th>IP</th>
                        <th>Ação</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.recent_logs.map(log => (
                        <tr key={log.id}>
                            <td>{new Date(log.created_at).toLocaleString()}</td>
                            <td>{log.student_name || 'Anônimo'}</td>
                            <td>{log.ip_address}</td>
                            <td>{log.action}</td>
                            <td><span className={`status-${log.status}`}>{log.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </LogTable>
        </Container>
    )
}
