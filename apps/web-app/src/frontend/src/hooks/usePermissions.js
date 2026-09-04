import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export function usePermissions() {
  const { user } = useAuth();

  const isSuperadmin = useMemo(() => {
    if (!user) return false;
    return user.role === 'superadmin' || Number(user.hierarchy_level) === 1;
  }, [user]);

  const permissions = useMemo(() => {
    return user?.permissions || {};
  }, [user]);

  const canAccessPage = (pageKey) => {
    if (!user) return false;
    if (isSuperadmin) return true;

    // Universal bypass for admin role (REGRA 17)
    if (user.role === 'admin' || user.role === 'superadmin') return true;

    // Default pages always accessible to logged in gestor
    if (pageKey === 'dashboard') return true;

    // Check pages map first
    const pages = permissions.pages;
    if (pages && typeof pages === 'object' && pageKey in pages) {
      return Boolean(pages[pageKey]);
    }

    // Fallback: check actions map (for keys like financial_view that may be used as page guards)
    const actions = permissions.actions;
    if (actions && typeof actions === 'object' && pageKey in actions) {
      return Boolean(actions[pageKey]);
    }

    return false;
  };

  const canPerform = (actionKey) => {
    if (!user) return false;
    if (isSuperadmin) return true;

    // Universal bypass for admin role (REGRA 17)
    if (user.role === 'admin' || user.role === 'superadmin') return true;

    const actions = permissions.actions;
    if (actions && typeof actions === 'object' && actionKey in actions) {
      return Boolean(actions[actionKey]);
    }

    return false;
  };

  const agendaScope = useMemo(() => {
    if (!user) return 'own';
    if (isSuperadmin) return 'all';
    return permissions?.actions?.agenda_scope || 'own';
  }, [user, isSuperadmin, permissions]);

  return {
    isSuperadmin,
    user,
    permissions,
    canAccessPage,
    canPerform,
    agendaScope
  };
}

export default usePermissions;
