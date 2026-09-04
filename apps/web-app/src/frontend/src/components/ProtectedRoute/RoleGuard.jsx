import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../config/routes'

export const ROLES = {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    SUPPORT: 'support'
}

export default function RoleGuard({ children, requiredRole }) {
    const { user, isAuthenticated, loading } = useAuth()

    if (loading) return <div style={{ background: '#0D0D12', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F2FF' }}>Initializing Nexus...</div>

    if (!isAuthenticated) return <Navigate to={ROUTES.ADMIN} replace />

    // Superadmin bypasses everything
    if (user.role === ROLES.SUPERADMIN) return children

    // Check required role
    const hasRole = Array.isArray(requiredRole)
        ? requiredRole.includes(user.role)
        : user.role === requiredRole

    if (!hasRole) {
        // Redirect to generic dashboard or unauthorized page
        return <div style={{ paddding: '2rem', textAlign: 'center', color: 'red' }}>Acesso Negado. Contate o Superadmin.</div>
    }

    return children
}
