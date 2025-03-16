import api from './api';

/**
 * Service for handling authentication operations
 * Makes API calls to the backend for user authentication
 */
const authService = {
  /**
   * Register a new user
   * 
   * @param {Object} userData - User registration data
   * @param {string} userData.username - User's username
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} Registration result (token, user data)
   */
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Registration failed');
      } else {
        throw new Error('Network error. Please check your connection.');
      }
    }
  },
  
  /**
   * Login a user with username/email and password
   * 
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.username - User's username or email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Login result (token, user data)
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      // If facial auth is not required, store token and user data
      if (!response.data.requiresFacial && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Login failed');
      } else {
        throw new Error('Network error. Please check your connection.');
      }
    }
  },
  
  /**
   * Complete login with facial authentication
   * 
   * @param {Object} data - Facial authentication data
   * @param {number} data.userId - User ID from initial login
   * @param {string} data.imageData - Base64 encoded image data
   * @returns {Promise<Object>} Login result (token, user data)
   */
  facialLogin: async (data) => {
    try {
      console.log("Sending facial login request with userId:", data.userId);
      console.log("Image data length:", data.imageData ? data.imageData.length : 0);
      
      const response = await api.post('/api/auth/facial-login', data);
      console.log("Facial login response:", response.data);
      
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in facial login:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(error.response.data.error || 'Facial authentication failed');
      } else {
        console.error('Network error:', error.message);
        throw new Error('Network error. Please check your connection.');
      }
    }
  },
  
  /**
   * Logout the current user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login';
  },
  
  /**
   * Validate the current user's token
   * 
   * @returns {Promise<Object>} Validation result (user data)
   */
  validateToken: async () => {
    try {
      const response = await api.get('/api/auth/validate');
      return response.data;
    } catch (error) {
      console.error('Error validating token:', error);
      
      // Clear any invalid token/user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      throw error;
    }
  },
  
  /**
   * Get the current user from localStorage
   * 
   * @returns {Object|null} User object or null if not logged in
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },
  
  /**
   * Check if a user is currently logged in
   * 
   * @returns {boolean} True if user is logged in
   */
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;
