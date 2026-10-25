import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { UserRole } from '../constants/roles';
import { ROUTES } from '../constants/routes';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

function normalizeRoleString(role: string): string {
  if (role === UserRole.GOVERNMENT || role === UserRole.MUNICIPAL_AUTHORITY || role === UserRole.ADMIN) {
    return 'MUNICIPAL_TIER';
  }
  return role;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#355844] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#6F726A] uppercase tracking-wider">
            Authorizing Credentials...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const userNorm = normalizeRoleString(user.role);
  const isAuthorized =
    user.role === UserRole.ADMIN ||
    allowedRoles.some((role) => normalizeRoleString(role) === userNorm);

  if (!isAuthorized) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
