'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { login as apiLogin, apiFetch } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = () => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  };

  const scheduleRefresh = useCallback((accessToken: string) => {
    clearRefreshTimer();
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiresIn = (payload.exp * 1000) - Date.now();
      const refreshAt = Math.max(expiresIn - 2 * 60 * 1000, 30_000);
      refreshTimer.current = setTimeout(async () => {
        const rt = localStorage.getItem('admin_refresh_token');
        if (!rt) return;
        try {
          const res = await fetch(`${API_URL}/api/v1/auth/refresh?refresh_token=${encodeURIComponent(rt)}`, { method: 'POST' });
          if (!res.ok) throw new Error();
          const data = await res.json();
          localStorage.setItem('admin_token', data.access_token);
          localStorage.setItem('admin_refresh_token', data.refresh_token);
          setToken(data.access_token);
          scheduleRefresh(data.access_token);
        } catch {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
          setUser(null);
          setToken(null);
        }
      }, refreshAt);
    } catch { /* invalid token format */ }
  }, []);

  const fetchProfile = useCallback(async (t: string) => {
    try {
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
      scheduleRefresh(t);
    } catch {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      setUser(null);
      setToken(null);
    }
  }, [scheduleRefresh]);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (t) {
      fetchProfile(t).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return clearRefreshTimer;
  }, [fetchProfile]);

  const loginFn = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('admin_token', data.access_token);
    localStorage.setItem('admin_refresh_token', data.refresh_token);
    await fetchProfile(data.access_token);
  };

  const logout = () => {
    clearRefreshTimer();
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
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
