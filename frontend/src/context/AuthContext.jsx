import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ct_token');
    if (token) {
      api.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('ct_token')).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const r = await api.post('/auth/login', { phone, password });
    localStorage.setItem('ct_token', r.data.token);
    setUser(r.data.user);
    return r.data;
  };

  const register = async (data) => {
    const r = await api.post('/auth/register', data);
    localStorage.setItem('ct_token', r.data.token);
    setUser(r.data.user);
    return r.data;
  };

  const logout = () => { localStorage.removeItem('ct_token'); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
