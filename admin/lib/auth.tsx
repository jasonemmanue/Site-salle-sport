'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { login as apiLogin } from './api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (t: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8010';
      const res = await fetch(`${API_URL}/api/v1/auth/profile`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.role !== 'admin') {
        throw new Error('Acces refuse');
      }
      setUser(data);
      setToken(t);
    } catch {
      localStorage.removeItem('admin_token');
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (t) {
      fetchProfile(t).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const loginFn = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('admin_token', data.access_token);
    await fetchProfile(data.access_token);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login: loginFn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
