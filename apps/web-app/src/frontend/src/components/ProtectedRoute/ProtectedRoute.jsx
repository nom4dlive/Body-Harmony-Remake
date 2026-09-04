import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../config/routes'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Poppins, sans-serif'
      }}>
        Carregando...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.ADMIN} replace />
  }

  return children
}
