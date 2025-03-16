import { useState, useEffect, createContext, useContext } from 'react';
import authService from '../services/authService';
import facialService from '../services/facialService';

// Create Authentication Context
export const AuthContext = createContext(null);

/**
 * Authentication Provider component
 * 
 * @param {Object} props - Component props
 * @param {node} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingFacialAuth, setPendingFacialAuth] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  
  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        
        if (currentUser && authService.isLoggedIn()) {
          setUser(currentUser);
          
          // Validate token with backend (optional)
          try {
            await authService.validateToken();
          } catch (validationError) {
            // Token invalid, reset user
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  /**
   * Register a new user
   * 
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.register(userData);
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Login a user with username/password
   * 
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Login result
   */
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(credentials);
      
      // If facial auth is not required, set user
      if (!result.requiresFacial) {
        setUser(result.user);
      } else {
        // Set pending facial auth state for second factor
        setPendingFacialAuth(true);
        setPendingUserId(result.userId);
        
        // Store the pending auth info in session storage for direct access
        sessionStorage.setItem('pendingAuth', JSON.stringify({
          userId: result.userId,
          timestamp: new Date().getTime()
        }));
      }
      
      return result;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Complete login with facial authentication (second factor)
   * 
   * @param {string} imageData - Base64 encoded facial image data
   * @returns {Promise<Object>} Login result
   */
  const completeFacialAuth = async (imageData) => {
    setLoading(true);
    setError(null);
    
    if (!pendingUserId) {
      throw new Error('No pending facial authentication');
    }
    
    try {
      console.log("Sending image data for verification:", imageData.substring(0, 50) + "...");
      
      console.log("Starting facial verification process with image data length:", imageData.length);
      
      try {
        // Verify facial expression with facialService
        const verifyResult = await facialService.verifyFacial(imageData);
        
        console.log("Verification result:", verifyResult);
        
        if (!verifyResult.match) {
          throw new Error(verifyResult.message || 'Facial expression does not match');
        }
        
        console.log("Verification succeeded, proceeding to login");
        
        // Complete login with authService
        const loginResult = await authService.facialLogin({
          userId: pendingUserId,
          imageData: imageData
        });
        
        console.log("Login result:", loginResult);
        
        if (!loginResult) {
          throw new Error('No login result returned from the server');
        }
        
        // Update user state
        setUser(loginResult.user);
        
        // Reset pending states
        setPendingFacialAuth(false);
        setPendingUserId(null);
        
        setLoading(false);
        return loginResult;
      } catch (verifyError) {
        console.error("Error during verification or login:", verifyError);
        setLoading(false);
        throw verifyError;
      }
    } catch (err) {
      console.error("Facial auth error:", err);
      setError(err.message || 'Facial authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Complete login with facial authentication
   * 
   * @param {Object} data - Facial login data
   * @returns {Promise<Object>} Login result
   */
  const facialLogin = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.facialLogin(data);
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err.message || 'Facial authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Set up facial authentication for the current user
   * 
   * @param {Object} facialData - Facial recognition data
   * @returns {Promise<Object>} Setup result
   */
  const setupFacialAuth = async (result) => {
    setLoading(true);
    setError(null);
    
    try {
      // Note: result is now passed directly from FacialSetup after API call
      
      // Update user with facial auth status
      if (user) {
        const updatedUser = { 
          ...user, 
          hasFacialAuth: true,
          facialExpression: result.expression
        };
        
        // Update state
        setUser(updatedUser);
        
        // Update localStorage to persist facial auth status
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return result;
    } catch (err) {
      setError(err.message || 'Failed to set up facial authentication');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Logout the current user
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  // Create context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    pendingFacialAuth,
    register,
    login,
    facialLogin,
    completeFacialAuth,
    setupFacialAuth,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the authentication context
 * 
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
