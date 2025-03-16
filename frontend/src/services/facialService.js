import api from './api';

/**
 * Service for handling facial authentication functionality
 * Makes API calls to the backend for facial data operations
 */
const facialService = {
  /**
   * Get the current user's facial authentication status
   * 
   * @returns {Promise<Object>} Facial status (has facial auth, expression type)
   */
  getStatus: async () => {
    try {
      const response = await api.get('/api/facial/status');
      return response.data;
    } catch (error) {
      console.error('Error getting facial status:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Failed to get facial authentication status');
      } else {
        throw new Error('Network error. Please check your connection.');
      }
    }
  },
  
  /**
   * Get detailed facial data for the current user
   * 
   * @returns {Promise<Object>} Detailed facial data including emotion scores and image path
   */
  getDetailedFacialData: async () => {
    try {
      const response = await api.get('/api/facial/detailed-data');
      return response.data;
    } catch (error) {
      console.error('Error getting detailed facial data:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Failed to get detailed facial data');
      } else {
        throw new Error('Network error. Please check your connection.');
      }
    }
  },
  
  /**
   * Set up facial authentication for the current user
   * 
   * @param {Object|string} data - Either a string with Base64 encoded image data or an object with imageData and optional overrideEmotion
   * @returns {Promise<Object>} Setup result (success message, expression type)
   */
  setupFacial: async (data) => {
    try {
      // Handle both old format (string) and new format (object)
      const requestData = typeof data === 'string' 
        ? { imageData: data } 
        : data;
        
      const response = await api.post('/api/facial/setup-facial', requestData);
      return response.data;
    } catch (error) {
      console.error('Error setting up facial auth:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Failed to set up facial authentication');
      } else {
        throw new Error('Network error. Please check your connection.');
      }
    }
  },
  
  /**
   * Analyze facial emotion without storing data
   * 
   * @param {Object|string} data - Either a string with Base64 encoded image data or an object with imageData property
   * @returns {Promise<Object>} Analysis result (emotion, emotion scores, confidence)
   */
  analyzeEmotion: async (data) => {
    try {
      // Handle both formats (string or object)
      const imageData = typeof data === 'string' ? data : data.imageData;
      
      console.log("Sending emotion analysis request to server");
      const response = await api.post('/api/facial/analyze-emotion', { imageData });
      console.log("Server response for analyze-emotion:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing facial emotion:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(error.response.data.error || 'Failed to analyze facial emotion');
      } else {
        console.error('Network error:', error.message);
        throw new Error('Network error. Please check your connection.');
      }
    }
  },
  
  /**
   * Verify a facial expression against stored data
   * 
   * @param {Object|string} data - Either a string with Base64 encoded image data or an object with imageData property
   * @returns {Promise<Object>} Verification result (match, confidence, detected emotion)
   */
  verifyFacial: async (data) => {
    try {
      // Handle both formats (string or object)
      const imageData = typeof data === 'string' ? data : data.imageData;
      
      console.log("Sending verification request to server with image data");
      const response = await api.post('/api/facial/verify-facial', { imageData });
      console.log("Server response for verify-facial:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error verifying facial expression:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(error.response.data.error || 'Failed to verify facial expression');
      } else {
        console.error('Network error:', error.message);
        throw new Error('Network error. Please check your connection.');
      }
    }
  },
  
  /**
   * Verify facial expression during login (no token required)
   * 
   * @param {Object} data - Login verification data 
   * @param {string} data.imageData - Base64 encoded image data
   * @param {string} data.username - Username for the account
   * @returns {Promise<Object>} Verification result (match, confidence, stored/detected emotions)
   */
  loginVerify: async (data) => {
    try {
      console.log("Sending login verification request with image data");
      const response = await api.post('/api/facial/login-verify', data);
      console.log("Server response for login verification:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error verifying facial login:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(error.response.data.error || 'Failed to verify facial login');
      } else {
        console.error('Network error:', error.message);
        throw new Error('Network error. Please check your connection.');
      }
    }
  },
  
  /**
   * Get a valid JWT token after successful facial authentication
   * 
   * @param {number} userId - User ID from the facial verification response
   * @returns {Promise<Object>} Authentication data including token and user info
   */
  getFacialAuthToken: async (userId) => {
    try {
      console.log("Getting facial auth token for user ID:", userId);
      const response = await api.post('/api/auth/facial-auth-token', { userId });
      console.log("Facial auth token response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting facial auth token:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(error.response.data.error || 'Failed to get facial authentication token');
      } else {
        console.error('Network error:', error.message);
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
      const response = await api.post('/api/auth/facial-login', data);
      return response.data;
    } catch (error) {
      console.error('Error during facial login:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Facial authentication failed');
      } else {
        throw new Error('Network error. Please check your connection.');
      }
    }
  }
};

export default facialService;
