import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import { UserRole } from '../constants/roles';

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_DEMO_USER: User = {
  id: 'usr-demo-citizen',
  email: 'citizen@roadsense.local',
  fullName: 'Priya Sharma (Citizen Inspector)',
  role: UserRole.CITIZEN,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('roadsense_user');
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return DEFAULT_DEMO_USER;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('roadsense_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('roadsense_user');
    }
  }, [user]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roadsense_user');
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    const roleProfiles: Record<UserRole, User> = {
      [UserRole.CITIZEN]: {
        id: 'usr-demo-citizen',
        email: 'citizen@roadsense.local',
        fullName: 'Priya Sharma (Citizen Inspector)',
        role: UserRole.CITIZEN,
      },
      [UserRole.CONTRACTOR]: {
        id: 'usr-demo-contractor',
        email: 'contractor@buildinfra.in',
        fullName: 'Vikram Patel (BuildInfra EPC)',
        role: UserRole.CONTRACTOR,
      },
      [UserRole.GOVERNMENT]: {
        id: 'usr-demo-gov',
        email: 'officer@pwd.gov.in',
        fullName: 'Dr. Suresh Kumar (Executive Engineer)',
        role: UserRole.GOVERNMENT,
      },
      [UserRole.ADMIN]: {
        id: 'usr-demo-admin',
        email: 'admin@roadsense.local',
        fullName: 'System Administrator',
        role: UserRole.ADMIN,
      },
    };

    const targetUser = roleProfiles[role] || DEFAULT_DEMO_USER;
    setUser(targetUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
};
