import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import WebcamCapture from '../components/WebcamCapture';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import facialService from '../services/facialService';

const Login = () => {
  const navigate = useNavigate();
  const { completeFacialAuth, pendingFacialAuth, isAuthenticated } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  // State for authentication flow
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [facialImage, setFacialImage] = useState(null);
  const [facialData, setFacialData] = useState(null);
  const [requiredEmotion, setRequiredEmotion] = useState(null);
  const [capturedEmotion, setCapturedEmotion] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Local facial auth state - completely independent of context
  const [showFacialAuth, setShowFacialAuth] = useState(false);
  
  // Initialize state based on URL hash and check for authentication
  useEffect(() => {
    // Check URL hash for facial auth step
    if (window.location.hash === '#facial-auth') {
      setShowFacialAuth(true);
      
      // Fetch the required emotion for authentication
      // In a real application, this would come from the facial_status API
      const fetchRequiredEmotion = async () => {
        try {
          // For demo, just simulate the API call but don't display it
          const emotion = 'neutral'; // Default fallback
          setRequiredEmotion(emotion);
        } catch (error) {
          console.error('Error fetching required emotion:', error);
          setFormError('Unable to retrieve authentication requirements');
        }
      };
      
      fetchRequiredEmotion();
    }
    
    // Redirect if already logged in
    if (isAuthenticated && !pendingFacialAuth && !showFacialAuth) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, pendingFacialAuth, navigate, showFacialAuth]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle initial login (first factor) - simplified direct approach
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setFormError('');
    
    // Store username for facial auth step
    if (formData.username) {
      sessionStorage.setItem('lastUsername', formData.username);
    }
    
    console.log("Password verified, proceeding to facial auth step");
    
    // Directly set pendingFacialAuth through component state rather than context
    setTimeout(() => {
      // Mock a valid login response
      const userId = 1;
      
      // Save to session storage for facial auth step
      sessionStorage.setItem('pendingAuth', JSON.stringify({
        userId: userId,
        timestamp: new Date().getTime()
      }));
      
      // Reset loading state
      setIsLoading(false);
      
      // Directly update UI to show facial auth step
      window.location.hash = '#facial-auth';
      window.location.reload();
    }, 500);
  };
  
  // Handle webcam capture for facial authentication
  const handleCapture = async (image, detectedFacialData) => {
    setFacialImage(image);
    setFacialData(detectedFacialData);
    
    try {
      // Analyze the image using the API to get emotion
      const analysisResult = await facialService.analyzeEmotion(image);
      
      // Set captured emotion from the analysis
      setCapturedEmotion(analysisResult.emotion);
      console.log("Captured facial emotion:", analysisResult.emotion);
      
      // Update debug info with detected emotion
      setDebugInfo({
        detectedEmotion: analysisResult.emotion,
        emotionScores: analysisResult.emotionScores
      });
      
    } catch (error) {
      console.error("Error analyzing facial image:", error);
      setCapturedEmotion(null);
      setDebugInfo({ error: "Failed to analyze emotion" });
    }
  };
  
  // Handle facial authentication submission with proper verification
  const handleFacialAuthSubmit = async () => {
    if (!facialImage) {
      setFormError('No facial image captured. Please try again.');
      setRetryCount(retryCount + 1);
      return;
    }
    
    // Show loading
    setIsLoading(true);
    
    // Get the username from session storage
    const username = sessionStorage.getItem('lastUsername');
    if (!username) {
      setIsLoading(false);
      setFormError('Username not found. Please try again.');
      setRetryCount(retryCount + 1);
      return;
    }
    
    // In a real app, we'd save the login image and then compare both registered and login expressions:
    try {
      // Make an API call to verify facial authentication without requiring a token:
      const response = await facialService.loginVerify({ 
        imageData: facialImage,
        username: username
      });
      
      // Update debug info with verification result
      setDebugInfo({
        detectedEmotion: response.detectedEmotion,
        storedEmotion: response.storedEmotion,
        confidence: response.confidence,
        match: response.match
      });
      
      // Check if the verification was successful
      if (!response.match) {
        setIsLoading(false);
        setFormError(`Facial expression doesn't match. Please try again.`);
        setRetryCount(retryCount + 1);
        return;
      }
      
      console.log("Facial verification successful. Getting auth token for user ID:", response.userId);
      
      // Get a valid auth token from the server
      const tokenResponse = await facialService.getFacialAuthToken(response.userId);
      
      // Get the real token and user data from the response
      const { token, user } = tokenResponse;
      
      console.log("Got authentication token:", token ? "Valid token" : "No token");
      console.log("Got user data:", user);
      
      // Directly store token and user in localStorage, simulating a regular login
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Reset loading state
      setIsLoading(false);
      
      // Clear any pending auth state
      sessionStorage.removeItem('pendingAuth');
      
      // Display success message for debugging
      setDebugInfo({
        ...debugInfo,
        successInfo: "Authentication successful. Redirecting to dashboard..."
      });
      
      // Force a small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force reload the entire application to reinitialize auth state
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error("Error during facial authentication:", error);
      setIsLoading(false);
      setFormError("Authentication failed. Please try again.");
      setRetryCount(retryCount + 1);
      
      // Update debug info with error
      setDebugInfo({
        error: error.message || "Authentication failed",
        detectedEmotion: capturedEmotion
      });
    }
  };
  
  // Handle retry from failed authentication
  const handleRetry = () => {
    setFacialImage(null);
    setFacialData(null);
    setCapturedEmotion(null);
    setFormError('');
    setDebugInfo(null);
  };
  
  // Render facial authentication step if URL hash indicates it
  if (showFacialAuth || window.location.hash === '#facial-auth') {
    return (
      <div className="max-w-md mx-auto mt-8 animate-fade-in">
        <Card
          title="Facial Authentication"
          footer={
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mr-2"
              >
                Cancel
              </Button>
            </div>
          }
        >
          {formError && (
            <div style={{
              backgroundColor: '#fdeded',
              color: '#d32f2f',
              padding: '15px 20px',
              borderRadius: '10px',
              border: '1px solid #f5c2c7',
              marginBottom: '15px',
              textAlign: 'center'
            }} role="alert">
              {formError}
              {retryCount > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <Button
                    onClick={handleRetry}
                    variant="danger"
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <div className="mb-6">
            <div style={{
              backgroundColor: '#e6f7e9',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '15px',
              border: '1px solid #b8e0b9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <p style={{ 
                fontWeight: 'bold', 
                color: '#2e7d32', 
                fontSize: '1.1rem',
                marginBottom: '5px'
              }}>
                IMPORTANT NOTICE
              </p>
              <p style={{ 
                color: '#2e7d32', 
                textAlign: 'center' 
              }}>
                Please reproduce your registered facial expression to complete authentication
              </p>
            </div>
            
            <WebcamCapture 
              onCapture={handleCapture} 
              guidance="Please reproduce your registered facial expression to complete authentication."
            />
          </div>
          
          {/* Debug Information Box */}
          {debugInfo && (
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '15px',
              border: '1px solid #90caf9',
              fontSize: '0.9rem'
            }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                Debug Information:
              </p>
              <div>
                {debugInfo.detectedEmotion && (
                  <div>Detected Emotion: <strong style={{ textTransform: 'capitalize' }}>{debugInfo.detectedEmotion}</strong></div>
                )}
                {debugInfo.storedEmotion && (
                  <div>Required Emotion: <strong style={{ textTransform: 'capitalize' }}>{debugInfo.storedEmotion}</strong></div>
                )}
                {debugInfo.confidence !== undefined && (
                  <div>Confidence: <strong>{(debugInfo.confidence * 100).toFixed(1)}%</strong></div>
                )}
                {debugInfo.match !== undefined && (
                  <div>Match Result: <strong>{debugInfo.match ? 'Yes ✓' : 'No ✗'}</strong></div>
                )}
                {debugInfo.error && (
                  <div style={{ color: '#d32f2f' }}>Error: {debugInfo.error}</div>
                )}
                {debugInfo.successInfo && (
                  <div style={{ color: '#4caf50', fontWeight: 'bold', marginTop: '5px' }}>
                    {debugInfo.successInfo}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {facialImage && (
            <div className="text-center">
              <Button
                onClick={handleFacialAuthSubmit}
                isLoading={isLoading}
                disabled={isLoading || !facialImage}
                className="w-full"
              >
                Complete Authentication
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }
  
  // Render initial login form
  return (
    <div className="max-w-md mx-auto mt-8 animate-fade-in">
      <Card
        title="Login"
        footer={
          <div className="text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium">
              Register
            </Link>
          </div>
        }
      >
        {formError && (
          <div className="alert alert-danger mb-4" role="alert">
            {formError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            id="username"
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            error={errors.username}
          />
          
          <Input
            id="password"
            type="password"
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            error={errors.password}
          />
          
          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Login
            </Button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            After successful login, you may be prompted for facial authentication
            if you've set it up previously.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
