import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useToast } from '../../context/ToastContext';
import { ROUTES } from '../../config/routes';

export default function PermissionRouteGuard({ children, page }) {
  const { isAuthenticated, loading } = useAuth();
  const { canAccessPage, isSuperadmin } = usePermissions();
  const { showWarning } = useToast();

  const hasAccess = isSuperadmin || !page || canAccessPage(page);

  useEffect(() => {
    if (!loading && isAuthenticated && !hasAccess) {
      showWarning(
        'Acesso Restrito',
        'Seu perfil atual não possui permissão para acessar este módulo. Contate a Diretoria ou o Suporte em wa.me/5518996959486.',
        {
          duration: 7000,
          action: {
            label: 'Falar no WhatsApp',
            onClick: () => window.open('https://wa.me/5518996959486?text=Ol%C3%A1%2C%20preciso%20de%20acesso%20ao%20m%C3%B3dulo%20do%20sistema%20Body%20Harmony.', '_blank')
          }
        }
      );
    }
  }, [loading, isAuthenticated, hasAccess, showWarning]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', color: '#0A3E60' }}>
        <h3>Carregando autorização...</h3>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/portal-gestor/dashboard" replace />;
  }

  return children;
}
