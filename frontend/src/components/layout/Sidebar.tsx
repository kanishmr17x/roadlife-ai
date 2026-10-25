import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuthContext } from '../../context/AuthContext';
import { UserRole } from '../../constants/roles';
import { 
  Compass, 
  PlusCircle, 
  FileText, 
  Bell, 
  User, 
  Map, 
  Wrench, 
  CloudSun, 
  Award, 
  BarChart3, 
  HardHat, 
  Landmark, 
  X,
  FolderKanban,
  FileCheck2,
  Settings,
  History
} from 'lucide-react';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user } = useAuthContext();
  const role = user?.role || UserRole.CITIZEN;

  const isCitizen = role === UserRole.CITIZEN;
  const isContractor = role === UserRole.CONTRACTOR;
  const isGov =
    role === UserRole.GOVERNMENT ||
    role === UserRole.MUNICIPAL_AUTHORITY ||
    role === UserRole.ADMIN;

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors duration-150 ${
      isActive
        ? 'bg-[#FFFEFA] text-[#355844] font-semibold border border-[#D8D7CE] border-l-3 border-l-[#355844] shadow-xs'
        : 'text-[#6F726A] hover:text-[#252A24] hover:bg-[#EAE8DF]/60'
    }`;

  const content = (
    <div className="flex flex-col h-full bg-[#F5F3EC] border-r border-[#D8D7CE] p-3.5 space-y-5 overflow-y-auto">
      {/* Mobile close button */}
      <div className="flex items-center justify-between lg:hidden pb-2 border-b border-[#D8D7CE]">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#252A24]">
          Navigation Desk
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#6F726A] hover:text-[#252A24]"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Role Domain Badge */}
      <div className="px-2 py-1.5 rounded bg-[#FFFEFA] border border-[#D8D7CE] text-xs">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#78846A] block">
          Current Domain
        </span>
        <p className="font-semibold text-[#252A24] mt-0.5 truncate">
          {isCitizen && 'Citizen Observer'}
          {isContractor && 'Road Contractor'}
          {isGov && 'Municipal Authority'}
        </p>
      </div>

      {/* 01 / Citizen / Public Field Log Section */}
      {(isCitizen || role === UserRole.ADMIN) && (
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-[#78846A] flex items-center gap-1.5">
            <span>Public Civic Desk</span>
          </div>
          <div className="space-y-0.5">
            <NavLink to={ROUTES.CITIZEN.DASHBOARD} className={navItemClass} onClick={onClose}>
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>Network Overview</span>
            </NavLink>
            <NavLink to={ROUTES.CITIZEN.REPORT} className={navItemClass} onClick={onClose}>
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Report Road Defect</span>
            </NavLink>
            <NavLink to={ROUTES.CITIZEN.MY_REPORTS} className={navItemClass} onClick={onClose}>
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Incident Registry</span>
            </NavLink>
            <NavLink to={ROUTES.CITIZEN.NOTIFICATIONS} className={navItemClass} onClick={onClose}>
              <Bell className="w-3.5 h-3.5 shrink-0" />
              <span>Bulletins & Advisories</span>
            </NavLink>
            <NavLink to={ROUTES.CITIZEN.PROFILE} className={navItemClass} onClick={onClose}>
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Observer Profile</span>
            </NavLink>
          </div>
        </div>
      )}

      {/* 02 / Contractor Portal Section */}
      {(isContractor || role === UserRole.ADMIN) && (
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-[#78846A] flex items-center gap-1.5">
            <span>Contractor Operations</span>
          </div>
          <div className="space-y-0.5">
            <NavLink to={ROUTES.CONTRACTOR.DASHBOARD} className={navItemClass} onClick={onClose}>
              <FolderKanban className="w-3.5 h-3.5 shrink-0" />
              <span>Operations Desk</span>
            </NavLink>
            <NavLink to={ROUTES.CONTRACTOR.ROADS} className={navItemClass} onClick={onClose}>
              <Map className="w-3.5 h-3.5 shrink-0" />
              <span>Assigned Corridors</span>
            </NavLink>
            <NavLink to={ROUTES.CONTRACTOR.REPAIR_TASKS} className={navItemClass} onClick={onClose}>
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span>Work Orders & Tasks</span>
            </NavLink>
            <NavLink to={ROUTES.CONTRACTOR.WEATHER_SCHEDULE} className={navItemClass} onClick={onClose}>
              <CloudSun className="w-3.5 h-3.5 shrink-0" />
              <span>Paving Windows (Weather)</span>
            </NavLink>
            <NavLink to={ROUTES.CONTRACTOR.PERFORMANCE} className={navItemClass} onClick={onClose}>
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span>Performance Index (CPI)</span>
            </NavLink>
          </div>
        </div>
      )}

      {/* 03 / Government Oversight Section */}
      {isGov && (
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-[#78846A] flex items-center gap-1.5">
            <span>Municipal Oversight</span>
          </div>
          <div className="space-y-0.5">
            <NavLink to={ROUTES.GOVERNMENT.DASHBOARD} className={navItemClass} onClick={onClose}>
              <Landmark className="w-3.5 h-3.5 shrink-0" />
              <span>Authority Oversight</span>
            </NavLink>
            <NavLink to={ROUTES.GOVERNMENT.ROAD_MAP} className={navItemClass} onClick={onClose}>
              <Map className="w-3.5 h-3.5 shrink-0" />
              <span>GIS Regional Map</span>
            </NavLink>
            <NavLink to={ROUTES.GOVERNMENT.ROADS} className={navItemClass} onClick={onClose}>
              <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
              <span>Asset Management</span>
            </NavLink>
            <NavLink to={ROUTES.GOVERNMENT.ANALYTICS} className={navItemClass} onClick={onClose}>
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span>Infrastructure Analytics</span>
            </NavLink>
            <NavLink to={ROUTES.GOVERNMENT.CONTRACTORS} className={navItemClass} onClick={onClose}>
              <HardHat className="w-3.5 h-3.5 shrink-0" />
              <span>Contractor Accreditation</span>
            </NavLink>
            <NavLink to={ROUTES.GOVERNMENT.AUDIT_LOGS} className={navItemClass} onClick={onClose}>
              <History className="w-3.5 h-3.5 shrink-0" />
              <span>Executive Audit Logs</span>
            </NavLink>
            <NavLink to={ROUTES.GOVERNMENT.SETTINGS} className={navItemClass} onClick={onClose}>
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span>Municipal Settings</span>
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 h-[calc(100vh-3.75rem)] sticky top-15">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-[#252A24]/30 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-64 max-w-full h-full z-10 shadow-lg">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
