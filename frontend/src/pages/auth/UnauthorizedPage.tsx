import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuthContext } from '../../context/AuthContext';
import { UserRole } from '../../constants/roles';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();

  const getHomeRoute = () => {
    if (!isAuthenticated || !user) return ROUTES.LOGIN;
    if (user.role === UserRole.CONTRACTOR) return ROUTES.CONTRACTOR.DASHBOARD;
    if (
      user.role === UserRole.GOVERNMENT ||
      user.role === UserRole.MUNICIPAL_AUTHORITY ||
      user.role === UserRole.ADMIN
    ) {
      return ROUTES.GOVERNMENT.DASHBOARD;
    }
    return ROUTES.CITIZEN.DASHBOARD;
  };

  const getDashboardLabel = () => {
    if (!isAuthenticated || !user) return 'Sign In to Platform';
    if (user.role === UserRole.CONTRACTOR) return 'Return to Contractor Desk';
    if (
      user.role === UserRole.GOVERNMENT ||
      user.role === UserRole.MUNICIPAL_AUTHORITY ||
      user.role === UserRole.ADMIN
    ) {
      return 'Return to Municipal Oversight';
    }
    return 'Return to Citizen Portal';
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#F5F3EC] text-[#252A24]">
      <Card className="max-w-md w-full text-center space-y-4 bg-[#FFFEFA] border border-[#D8D7CE] shadow-sm p-8">
        <div className="p-3 bg-[#A9423B]/10 border border-[#A9423B]/20 rounded-xl w-fit mx-auto text-[#A9423B]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-[#252A24]">Access Restricted</h1>
        <p className="text-xs text-[#6F726A] leading-relaxed">
          {isAuthenticated && user ? (
            <>
              Your authenticated account (<span className="font-semibold text-[#252A24]">{user.fullName}</span>, role <span className="font-mono font-semibold">{user.role}</span>) does not possess authorization to access this module.
            </>
          ) : (
            'You do not possess valid session permissions to access this module. Please sign in.'
          )}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Link to={getHomeRoute()}>
            <Button variant="primary" size="sm">
              {getDashboardLabel()}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
