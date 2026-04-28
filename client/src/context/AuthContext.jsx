import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('cctv_token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          sessionStorage.removeItem('cctv_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    const res = await API.post('/auth/login', { username, password });
    sessionStorage.setItem('cctv_token', res.data.token);
    setUser(res.data);
    return res.data;
  };

  const register = async (name, username, password) => {
    const res = await API.post('/auth/register', { name, username, password });
    sessionStorage.setItem('cctv_token', res.data.token);
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    sessionStorage.removeItem('cctv_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
