import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#355844] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#6F726A] uppercase tracking-wider">
            Verifying Session Security...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
