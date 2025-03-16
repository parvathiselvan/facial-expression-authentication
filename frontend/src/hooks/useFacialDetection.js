import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for facial detection functionality
 * 
 * Provides functionality for detecting and analyzing facial expressions
 * (Simplified for hackathon demo)
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoStart - Whether to start detection automatically
 * @param {number} options.detectionInterval - Interval between detection attempts (ms)
 * @returns {Object} Facial detection state and methods
 */
export const useFacialDetection = (options = {}) => {
  const {
    autoStart = false,
    detectionInterval = 1000
  } = options;
  
  // State for face detection
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [detectedFace, setDetectedFace] = useState(null);
  const [detectedExpression, setDetectedExpression] = useState(null);
  const [expressionConfidence, setExpressionConfidence] = useState(0);
  const [allExpressions, setAllExpressions] = useState({});
  
  // Refs for intervals and video source
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  
  // Simulate loading models - for hackathon demo
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsModelLoaded(true);
      console.log("Facial detection models loaded (simulated)");
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Simulate face detection - for hackathon demo
  useEffect(() => {
    if (!isModelLoaded || !isRunning || !videoRef.current) {
      return;
    }
    
    const simulateDetection = () => {
      try {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
          return;
        }
        
        // For demo purposes, we'll use a fixed expression
        const mockExpression = 'happy';
        
        // Create mock detection result
        const mockDetection = {
          detection: {
            box: {
              x: 100,
              y: 100,
              width: 200,
              height: 200
            }
          },
          landmarks: {
            positions: Array(68).fill().map(() => ({
              x: Math.random() * 640,
              y: Math.random() * 480
            }))
          },
          expressions: {
            neutral: 0.05,
            happy: 0.95,
            sad: 0.0,
            angry: 0.0,
            surprised: 0.0,
            disgusted: 0.0,
            fearful: 0.0
          }
        };
        
        setDetectedFace(mockDetection);
        setDetectedExpression(mockExpression);
        setExpressionConfidence(0.95);
        setAllExpressions(mockDetection.expressions);
      } catch (err) {
        console.error('Error during simulated face detection:', err);
        setError('Error during face detection simulation');
      }
    };
    
    // Run initial detection
    simulateDetection();
    
    // Set up interval for continuous detection
    intervalRef.current = setInterval(simulateDetection, detectionInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isModelLoaded, isRunning, detectionInterval]);
  
  /**
   * Start facial detection
   * @param {HTMLVideoElement} video - Video element to use for detection
   */
  const startDetection = (video) => {
    if (!video) {
      setError('No video element provided');
      return;
    }
    
    videoRef.current = video;
    setIsRunning(true);
  };
  
  /**
   * Stop facial detection
   */
  const stopDetection = () => {
    setIsRunning(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  
  /**
   * Get current facial data in a format suitable for API
   */
  const getFacialData = () => {
    if (!detectedFace) {
      return null;
    }
    
    return {
      dominantExpression: detectedExpression,
      expressionConfidence,
      expressions: allExpressions,
      landmarks: detectedFace.landmarks.positions
    };
  };
  
  return {
    isRunning,
    isModelLoaded,
    error,
    detectedFace,
    detectedExpression,
    expressionConfidence,
    allExpressions,
    startDetection,
    stopDetection,
    getFacialData
  };
};

export default useFacialDetection;
