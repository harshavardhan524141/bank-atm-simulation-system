import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, BankAccount } from '../types/index.ts';
import { api, getStoredToken, setStoredToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  account: BankAccount | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ user: User; role: string }>;
  register: (payload: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    username: string;
    password: string;
    accountType?: 'SAVINGS' | 'CURRENT';
  }) => Promise<{ user: User; account: BankAccount }>;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  updateUser: (user: User) => void;
  quickLoginDemo: (role: 'customer' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.auth.me();
      setUser(data.user);
      if (data.account) {
        setAccount(data.account);
      }
    } catch (err) {
      console.warn('Session expired or invalid, logging out:', err);
      setStoredToken(null);
      setToken(null);
      setUser(null);
      setAccount(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (identifier: string, password: string) => {
    const res = await api.auth.login({ identifier, password });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    if (res.account) {
      setAccount(res.account);
    }
    return { user: res.user, role: res.user.role };
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    username: string;
    password: string;
    accountType?: 'SAVINGS' | 'CURRENT';
  }) => {
    const res = await api.auth.register(payload);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setAccount(res.account);
    return { user: res.user, account: res.account };
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      setStoredToken(null);
      setToken(null);
      setUser(null);
      setAccount(null);
    }
  };

  const refreshAccount = async () => {
    if (!token || user?.role !== 'customer') return;
    try {
      const data = await api.customer.getAccount();
      setAccount(data.account);
      if (data.user) setUser(data.user);
    } catch (err) {
      console.error('Failed to refresh account data:', err);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const quickLoginDemo = async (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      await login('admin', 'AdminPassword@123');
    } else {
      await login('john_doe', 'CustomerPassword@123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        account,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        logout,
        refreshAccount,
        updateUser,
        quickLoginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
