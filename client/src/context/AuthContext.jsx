import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('impacthub_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('impacthub_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to load authenticated user:', err);
          logout();
        }
      } else {
        const cachedUser = localStorage.getItem('impacthub_user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch (e) {
            // Ignore parse error
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      if (res.data && res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('impacthub_token', res.data.token);
        localStorage.setItem('impacthub_user', JSON.stringify(res.data.user));
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role) => {
    setLoading(true);
    try {
      const res = await authAPI.demoLogin(role);
      if (res.data && res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('impacthub_token', res.data.token);
        localStorage.setItem('impacthub_user', JSON.stringify(res.data.user));
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || `Demo login as ${role} failed.`,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      if (res.data && res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('impacthub_token', res.data.token);
        localStorage.setItem('impacthub_user', JSON.stringify(res.data.user));
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await authAPI.getMe();
      if (res.data && res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('impacthub_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('impacthub_token');
    localStorage.removeItem('impacthub_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        demoLogin,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!user && !!token,
        isStudent: user?.role === 'student',
        isManager: user?.role === 'manager',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
