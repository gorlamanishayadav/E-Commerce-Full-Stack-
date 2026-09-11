import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ecommerce_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [tokens, setTokens] = useState(() => {
    const savedTokens = localStorage.getItem('ecommerce_tokens');
    return savedTokens ? JSON.parse(savedTokens) : null;
  });

  const [loading, setLoading] = useState(true);

  // Sync state with local storage
  const saveAuth = (userData, tokenData) => {
    setUser(userData);
    setTokens(tokenData);
    if (userData) {
      localStorage.setItem('ecommerce_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('ecommerce_user');
    }
    if (tokenData) {
      localStorage.setItem('ecommerce_tokens', JSON.stringify(tokenData));
    } else {
      localStorage.removeItem('ecommerce_tokens');
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('ecommerce_user');
    localStorage.removeItem('ecommerce_tokens');
  }, []);

  // Check and fetch latest user profile on startup
  useEffect(() => {
    const verifyAuth = async () => {
      if (tokens?.access) {
        try {
          const res = await axiosClient.get('/api/accounts/profile/');
          setUser(res.data);
          localStorage.setItem('ecommerce_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Failed to verify stored session, logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();

    // Listen for automatic logout from axiosClient interceptor
    const handleAuthLogout = () => logout();
    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, [tokens?.access, logout]);

  const formatErrorMessage = (error, defaultMsg) => {
    if (!error.response) {
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        return 'Cannot connect to backend server (http://127.0.0.1:8000). Please ensure the Django server is running.';
      }
      return error.message || defaultMsg;
    }

    const data = error.response.data;
    if (!data) return `${defaultMsg} (HTTP ${error.response.status})`;

    if (typeof data === 'string') {
      return data.length < 200 ? data : `${defaultMsg} (Server error: HTTP ${error.response.status})`;
    }

    if (typeof data === 'object') {
      const errorList = [];
      for (const [field, messages] of Object.entries(data)) {
        const fieldName = field === 'detail' || field === 'non_field_errors' 
          ? '' 
          : `${field.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: `;

        if (Array.isArray(messages)) {
          errorList.push(`${fieldName}${messages.join(', ')}`);
        } else if (typeof messages === 'string') {
          errorList.push(`${fieldName}${messages}`);
        } else if (typeof messages === 'object' && messages !== null) {
          errorList.push(`${fieldName}${JSON.stringify(messages)}`);
        }
      }
      if (errorList.length > 0) {
        return errorList.join(' | ');
      }
    }

    return defaultMsg;
  };

  const login = async (username, password) => {
    try {
      const response = await axiosClient.post('/api/auth/token/', {
        username,
        password,
      });

      const { access, refresh, user: userData } = response.data;
      saveAuth(userData, { access, refresh });
      return { success: true, user: userData };
    } catch (error) {
      const message = formatErrorMessage(error, 'Invalid username or password.');
      return { success: false, error: message };
    }
  };

  const register = async (registrationData) => {
    try {
      const response = await axiosClient.post('/api/accounts/register/', registrationData);
      const { user: userData, tokens: tokenData } = response.data;
      saveAuth(userData, tokenData);
      return { success: true, user: userData };
    } catch (error) {
      const message = formatErrorMessage(error, 'Registration failed. Please check your details.');
      const fieldErrors = typeof error.response?.data === 'object' ? error.response.data : {};
      return { success: false, error: message, fieldErrors };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axiosClient.patch('/api/accounts/profile/', profileData);
      setUser(response.data);
      localStorage.setItem('ecommerce_user', JSON.stringify(response.data));
      return { success: true, user: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Failed to update profile.',
      };
    }
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('ecommerce_user', JSON.stringify(merged));
  };

  const role = user?.role || 'ANONYMOUS';
  const isAdmin = role === 'ADMIN' || Boolean(user?.is_superuser);
  const isSeller = role === 'SELLER' || isAdmin;
  const isCustomer = role === 'CUSTOMER';
  const isAuthenticated = Boolean(user && tokens?.access);

  const value = {
    user,
    tokens,
    loading,
    role,
    isAdmin,
    isSeller,
    isCustomer,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
