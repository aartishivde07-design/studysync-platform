import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('studysync_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('studysync_token'));
  const [loading, setLoading] = useState(true);

  // Sync session and verify current user on boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('studysync_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('studysync_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error("Auth validation failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('studysync_token', newToken);
    localStorage.setItem('studysync_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('studysync_token', newToken);
    localStorage.setItem('studysync_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('studysync_token');
      localStorage.removeItem('studysync_user');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('studysync_user', JSON.stringify(res.data.user));
      return res.data.user;
    } catch (err) {
      console.error("Failed to refresh user:", err);
      return null;
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/profiles/me', profileData);
    setUser(res.data.user);
    localStorage.setItem('studysync_user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  const addSkill = async (skillData) => {
    await api.post('/skills', skillData);
    return await refreshUser();
  };

  const removeSkill = async (skillId) => {
    await api.delete(`/skills/${skillId}`);
    return await refreshUser();
  };

  const addInterest = async (interestData) => {
    await api.post('/interests', interestData);
    return await refreshUser();
  };

  const removeInterest = async (interestId) => {
    await api.delete(`/interests/${interestId}`);
    return await refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        addSkill,
        removeSkill,
        addInterest,
        removeInterest
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
