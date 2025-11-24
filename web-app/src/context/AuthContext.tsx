import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { mockDataStore } from '../config/mockData';

interface AuthContextType {
  currentUser: User | null;
  selectedRole: UserRole | null;
  selectRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const selectRole = (role: UserRole) => {
    const user = mockDataStore.users.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      setSelectedRole(role);
      localStorage.setItem('selectedRole', role);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedRole(null);
    localStorage.removeItem('selectedRole');
  };

  // Restore role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('selectedRole') as UserRole | null;
    if (savedRole) {
      selectRole(savedRole);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, selectedRole, selectRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
