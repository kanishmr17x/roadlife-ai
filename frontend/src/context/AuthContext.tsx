import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/user';
import { authService } from '../services/auth/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('roadsense_user');
      const token = localStorage.getItem('token');
      if (stored && token) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignored
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('roadsense_user');
    setUser(null);
    authService.logout().catch(() => {});
  }, []);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('roadsense_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  // Validate session against server on startup
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    authService
      .getMe()
      .then((serverUser) => {
        if (isMounted) {
          setUser(serverUser);
          localStorage.setItem('roadsense_user', JSON.stringify(serverUser));
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          // Token is expired or invalid - clear session
          localStorage.removeItem('token');
          localStorage.removeItem('roadsense_user');
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isAuthenticated = Boolean(user && localStorage.getItem('token'));

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
};
