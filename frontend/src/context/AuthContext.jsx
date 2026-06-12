import { useState } from 'react';
import api from '../lib/api';
import { AuthContext } from './authStore';

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
  );
  const [authLoading, setAuthLoading] = useState(false);

  const login = (userData) => {
    setUserInfo(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  const signIn = async (payload, admin = false) => {
    setAuthLoading(true);
    try {
      const { data } = await api.post(admin ? '/users/admin-login' : '/users/login', payload);
      login(data);
      return data;
    } finally {
      setAuthLoading(false);
    }
  };

  const signUp = async (payload) => {
    setAuthLoading(true);
    try {
      const { data } = await api.post('/users', payload);
      login(data);
      return data;
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, logout, signIn, signUp, authLoading, isAdmin: !!userInfo?.isAdmin || ['admin', 'super-admin'].includes(userInfo?.role) }}>
      {children}
    </AuthContext.Provider>
  );
};
