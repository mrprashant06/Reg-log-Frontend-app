import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, logoutUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('aura_auth_token') || null;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('aura_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Validate session on initial load
  useEffect(() => {
    async function verifySession() {
      if (!authToken) {
        setIsAuthLoading(false);
        return;
      }
      try {
        const res = await getProfile(authToken);
        if (res && res.user) {
          setCurrentUser(res.user);
          localStorage.setItem('aura_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        localStorage.removeItem('aura_auth_token');
        localStorage.removeItem('aura_user');
        setAuthToken(null);
        setCurrentUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    }
    verifySession();
  }, [authToken]);

  const login = (token, user) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem('aura_auth_token', token);
    localStorage.setItem('aura_user', JSON.stringify(user));
  };

  const logout = async () => {
    try {
      if (authToken) {
        await logoutUser(authToken);
      }
    } catch {
      // Ignore network errors
    } finally {
      setAuthToken(null);
      setCurrentUser(null);
      localStorage.removeItem('aura_auth_token');
      localStorage.removeItem('aura_user');
    }
  };

  const updateUser = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('aura_user', JSON.stringify(userData));
  };

  const value = {
    currentUser,
    authToken,
    isAuthenticated: Boolean(authToken && currentUser),
    isAuthLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
