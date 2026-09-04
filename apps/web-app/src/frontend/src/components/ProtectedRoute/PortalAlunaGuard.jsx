import { useAlunaAuth } from '../../context/AlunaAuthContext'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * PortalAlunaGuard — V68
 * Guard exclusivo para rotas do Portal Aluna Individual.
 * Completamente isolado do LicenciadaGuard / StudentGuard.
 * Token: bh_aluna_token (prefixo al_*)
 */
export default function PortalAlunaGuard({ children }) {
  const { aluna, loading } = useAlunaAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: '#0A3E60'
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #ED7E13',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem'
          }} />
          <p style={{ margin: 0, opacity: 0.8 }}>Verificando acesso...</p>
        </div>
      </div>
    )
  }

  if (!aluna) {
    return <Navigate to="/portal-aluna" state={{ from: location }} replace />
  }

  if (aluna.forceChange && location.pathname !== '/portal-aluna/nova-senha') {
    return <Navigate to="/portal-aluna/nova-senha" replace />
  }

  return children
}
