import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('don_bigote_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => sessionStorage.getItem('don_bigote_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token: resToken, user: resUser } = response.data;

      setToken(resToken);
      setUser(resUser);

      sessionStorage.setItem('don_bigote_token', resToken);
      sessionStorage.setItem('don_bigote_user', JSON.stringify(resUser));

      return { success: true, user: resUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al conectar con el servidor.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('don_bigote_token');
    sessionStorage.removeItem('don_bigote_user');
    localStorage.removeItem('don_bigote_token');
    localStorage.removeItem('don_bigote_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
