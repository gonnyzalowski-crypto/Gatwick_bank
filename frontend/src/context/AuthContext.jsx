import React, { createContext, useState, useCallback, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await apiClient.post('/auth/login', { email, password });

      // apiClient returns the parsed JSON body directly
      const { user, accessToken, refreshToken } = response || {};

      if (!user || !accessToken) {
        throw new Error('Login response missing authentication data');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (email, password, firstName, lastName, securityQuestions) => {
    try {
      setError(null);

      // First create the user account with security questions
      await apiClient.post('/auth/register', {
        email,
        password,
        confirmPassword: password,
        firstName,
        lastName,
        securityQuestions,
      });

      // Registration successful - user will need to login with 2FA
      return { success: true, message: 'Registration successful! Please log in.' };
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    }
  }, []);

  const getProfile = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const { user } = response || {};

      if (!user) {
        throw new Error('Failed to load user profile');
      }

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      return null;
    }
  }, []);

  const updateProfile = useCallback(async (firstName, lastName) => {
    try {
      setError(null);
      const response = await apiClient.put('/auth/profile', { firstName, lastName });
      const { user } = response || {};

      if (!user) {
        throw new Error('Failed to update profile');
      }

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Update failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setError(null);
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword: newPassword,
      });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Password change failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  // Dev-only helper to bypass real auth for local UI testing
  const devLogin = useCallback((mockUser) => {
    try {
      const userData = {
        id: mockUser.id || 'dev-user-id',
        email: mockUser.email || 'dev.user@gatwickbank.test',
        firstName: mockUser.firstName || 'Dev',
        lastName: mockUser.lastName || 'User',
        isAdmin: !!mockUser.isAdmin,
        createdAt: mockUser.createdAt || new Date().toISOString(),
      };

      localStorage.setItem('accessToken', 'dev-access-token');
      localStorage.setItem('refreshToken', '');
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setError(null);
      return { success: true, user: userData };
    } catch (err) {
      console.error('Dev login failed:', err);
      return { success: false, error: 'Dev login failed' };
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    devLogin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
