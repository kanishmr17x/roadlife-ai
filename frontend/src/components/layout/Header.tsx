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
  HardHat, 
  Landmark, 
  UserCheck,
  Compass,
  FileCheck
} from 'lucide-react';

export interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, login, logout } = useAuthContext();
  const navigate = useNavigate();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleRoleSwitch = (role: UserRole) => {
    const roleUsers = {
      [UserRole.CITIZEN]: {
        id: 'usr-cit-101',
        email: 'priya.citizen@roadsense.local',
        fullName: 'Priya Sharma (Citizen Inspector)',
        role: UserRole.CITIZEN,
      },
      [UserRole.CONTRACTOR]: {
        id: 'usr-con-202',
        email: 'vikram.contractor@buildinfra.in',
        fullName: 'Vikram Patel (BuildInfra EPC)',
        role: UserRole.CONTRACTOR,
      },
      [UserRole.GOVERNMENT]: {
        id: 'usr-gov-303',
        email: 'officer.gov@pwd.karnataka.gov.in',
        fullName: 'Dr. Suresh Kumar (Superintending Engineer)',
        role: UserRole.GOVERNMENT,
      },
      [UserRole.ADMIN]: {
        id: 'usr-adm-001',
        email: 'admin@roadsense.local',
        fullName: 'System Administrator',
        role: UserRole.ADMIN,
      },
    };

    login('demo-session-token', roleUsers[role]);
    setShowRoleMenu(false);

    if (role === UserRole.CITIZEN) navigate(ROUTES.CITIZEN.DASHBOARD);
    if (role === UserRole.CONTRACTOR) navigate(ROUTES.CONTRACTOR.DASHBOARD);
    if (role === UserRole.GOVERNMENT) navigate(ROUTES.GOVERNMENT.DASHBOARD);
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

          <Link to="/" className="flex items-center gap-2.5 group">
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

          {/* Quick Action: Report Damage */}
          <Link to={ROUTES.CITIZEN.REPORT} className="hidden sm:inline-flex">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Report Defect
            </Button>
          </Link>

          {/* Role Switcher & User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1 rounded border border-[#D8D7CE] bg-[#FFFEFA] hover:bg-[#F5F3EC] transition-colors text-xs text-[#252A24]"
            >
              <UserCircle2 className="w-4 h-4 text-[#355844]" />
              <span className="hidden md:inline font-medium truncate max-w-[140px]">
                {user ? user.fullName.split(' ')[0] : 'Observer'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E5EADF] text-[#264031] uppercase font-semibold">
                {user?.role || 'CITIZEN'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-md bg-[#FFFEFA] border border-[#D8D7CE] shadow-lg p-1.5 z-50 text-xs">
                <div className="p-2 border-b border-[#D8D7CE] text-[#6F726A]">
                  <p className="text-[#252A24] font-semibold">{user?.fullName || 'Field Observer'}</p>
                  <p className="text-[11px] text-[#6F726A] truncate font-mono">{user?.email || 'citizen@roadsense.local'}</p>
                </div>

                <div className="py-1.5">
                  <p className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#9E9F97]">
                    Select Portal Viewpoint:
                  </p>
                  <button
                    onClick={() => handleRoleSwitch(UserRole.CITIZEN)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F5F3EC] text-[#252A24] flex items-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#355844]" />
                    <span>Citizen & Public Log</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch(UserRole.CONTRACTOR)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F5F3EC] text-[#252A24] flex items-center gap-2"
                  >
                    <HardHat className="w-3.5 h-3.5 text-[#B9684D]" />
                    <span>Contractor Work Orders</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch(UserRole.GOVERNMENT)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F5F3EC] text-[#252A24] flex items-center gap-2"
                  >
                    <Landmark className="w-3.5 h-3.5 text-[#355844]" />
                    <span>Municipal Authority</span>
                  </button>
                </div>

                <div className="border-t border-[#D8D7CE] pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowRoleMenu(false);
                      navigate(ROUTES.LOGIN);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#FAF0EF] text-[#A9423B] flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
