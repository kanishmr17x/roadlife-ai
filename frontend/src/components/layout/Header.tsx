import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuthContext } from '../../context/AuthContext';
import { UserRole } from '../../constants/roles';
import { HealthStatusPill } from '../common/HealthStatusPill';
import { Button } from '../common/Button';
import { 
  Menu, 
  LogOut, 
  UserCircle2, 
  Plus, 
  Compass, 
  LayoutDashboard,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getDashboardRoute = () => {
    if (!user) return ROUTES.LOGIN;
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

  const getRoleDisplayName = (role?: UserRole | string) => {
    if (!role) return 'Observer';
    if (role === UserRole.CITIZEN) return 'Citizen Observer';
    if (role === UserRole.CONTRACTOR) return 'Road Contractor';
    if (role === UserRole.MUNICIPAL_AUTHORITY || role === UserRole.GOVERNMENT) return 'Municipal Authority';
    if (role === UserRole.ADMIN) return 'System Admin';
    return String(role);
  };

  const handleSignOut = () => {
    logout();
    setShowUserMenu(false);
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D8D7CE] bg-[#FFFEFA]/95 backdrop-blur-sm">
      <div className="flex h-15 items-center justify-between px-4 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded text-[#6F726A] hover:text-[#252A24] hover:bg-[#F5F3EC] lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={getDashboardRoute()} className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded bg-[#EDF3EE] border border-[#C6D8CC] text-[#355844]">
              <Compass className="w-4 h-4" />
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-[#252A24] font-serif">
                  RoadSense
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F5F3EC] text-[#6F726A] border border-[#D8D7CE]">
                  CIVIC REGISTRY
                </span>
              </div>
              <p className="text-[10px] text-[#6F726A] mt-0.5 hidden sm:block">
                Municipal Road Lifecycle & Pavement Distress System
              </p>
            </div>
          </Link>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live Express backend health indicator */}
          <HealthStatusPill />

          {/* Quick Action: Report Damage (Available to Citizens and unauthenticated observers) */}
          {(!user || user.role === UserRole.CITIZEN) && (
            <Link to={ROUTES.CITIZEN.REPORT} className="hidden sm:inline-flex">
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Report Defect
              </Button>
            </Link>
          )}

          {/* Authenticated User Menu or Sign In Button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1 rounded border border-[#D8D7CE] bg-[#FFFEFA] hover:bg-[#F5F3EC] transition-colors text-xs text-[#252A24]"
                aria-expanded={showUserMenu}
              >
                <UserCircle2 className="w-4 h-4 text-[#355844]" />
                <span className="hidden md:inline font-medium truncate max-w-[140px]">
                  {user.fullName}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E5EADF] text-[#264031] uppercase font-semibold">
                  {user.role}
                </span>
              </button>

              {/* User Profile Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-1.5 w-64 rounded-md bg-[#FFFEFA] border border-[#D8D7CE] shadow-lg p-1.5 z-50 text-xs">
                  <div className="p-2 border-b border-[#D8D7CE]">
                    <p className="text-[#252A24] font-semibold truncate">{user.fullName}</p>
                    <p className="text-[11px] text-[#6F726A] truncate font-mono">{user.email}</p>
                    <div className="pt-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F3EC] text-[#252A24] border border-[#D8D7CE] font-semibold">
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                  </div>

                  <div className="py-1.5 space-y-0.5">
                    <Link
                      to={getDashboardRoute()}
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F5F3EC] text-[#252A24] flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#355844]" />
                      <span>Role Dashboard</span>
                    </Link>

                    {user.role === UserRole.CITIZEN && (
                      <Link
                        to={ROUTES.CITIZEN.PROFILE}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F5F3EC] text-[#252A24] flex items-center gap-2"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#6F726A]" />
                        <span>Observer Profile</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-[#D8D7CE] pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-[#FAF0EF] text-[#A9423B] flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to={ROUTES.LOGIN}>
              <Button size="sm" variant="outline">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
