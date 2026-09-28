'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('ls_token');
    const savedUser = localStorage.getItem('ls_user');
    if (savedToken && savedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating auth from localStorage after mount is intentional; avoids SSR/client hydration mismatch
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setReady(true);
  }, []);

  function persist(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem('ls_token', nextToken);
    localStorage.setItem('ls_user', JSON.stringify(nextUser));
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    persist(data.token, data.user);
    return data.user;
  }
  async function register(payload) {
    const data = await api.register(payload);
    persist(data.token, data.user);
    return data.user;
  }
  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ls_token');
    localStorage.removeItem('ls_user');
  }

  return (
    <AuthContext.Provider value={{ token, user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
