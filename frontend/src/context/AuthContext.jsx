import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in on component mount
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // For demo, we'll just use the token as validation
          // In a real app, you'd make an API call to validate the token
          const userData = { id: 1, username: 'demo_user' }; // Simulated user data
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        api.defaults.headers.common['Authorization'] = '';
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      // For hackathon demo, we'll use simulated response
      // const response = await authService.login(credentials);
      const simulatedResponse = {
        token: 'demo_jwt_token',
        user: { id: 1, username: credentials.username }
      };
      
      localStorage.setItem('token', simulatedResponse.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${simulatedResponse.token}`;
      setUser(simulatedResponse.user);
      setIsAuthenticated(true);
      return simulatedResponse;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // For hackathon demo, we'll use simulated response
      // const response = await authService.register(userData);
      const simulatedResponse = {
        user: { id: 1, username: userData.username }
      };
      
      return simulatedResponse;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
