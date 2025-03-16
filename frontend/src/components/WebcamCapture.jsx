
import React, { useRef, useState, useEffect } from 'react';
import Button from './Button';

/**
 * WebcamCapture component
 */
const WebcamCapture = ({ 
  onCapture, 
  guidance = 'Please position your face in the center of the frame',
  autoDetect = true,
  streamEnabled = false
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedExpression, setDetectedExpression] = useState("happy");
  const [facialData, setFacialData] = useState({
    dominantExpression: "happy",
    expressionConfidence: 0.95,
    expressions: {
      neutral: 0.05,
      happy: 0.95,
      sad: 0.0,
      angry: 0.0,
      surprised: 0.0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Stream mode states
  const [streamMode, setStreamMode] = useState(streamEnabled); // Initialize stream mode based on streamEnabled prop
  const [consecutiveFrames, setConsecutiveFrames] = useState(0);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(0);
  const [streamResults, setStreamResults] = useState(null);
  const [dbPath, setDbPath] = useState("");
  const [streamStatus, setStreamStatus] = useState("");
  
  // Simple face SVG for fallback display
  const faceSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
      <rect width="320" height="240" fill="#333"/>
      <circle cx="160" cy="120" r="60" fill="#555"/>
      <circle cx="140" cy="100" r="8" fill="#fff"/>
      <circle cx="180" cy="100" r="8" fill="#fff"/>
      <path d="M130 150 Q160 180 190 150" stroke="#fff" stroke-width="3" fill="none"/>
    </svg>
  `;
  
  // Convert SVG to data URL for image src
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(faceSvg)}`;
  
  // Function to capture current frame for emotion analysis
  const captureFrameForAnalysis = () => {
    if (videoRef.current && videoRef.current.srcObject && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      
      const ctx = canvas.getContext('2d');
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw video frame (mirror effect)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      // Get image data
      return canvas.toDataURL('image/jpeg');
    }
    return null;
  };
  
  // Analyze emotion using backend API
  const analyzeEmotion = async (imageData) => {
    try {
      const response = await fetch('/api/facial/analyze-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze emotion');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      return null;
    }
  };

  // Start webcam when component mounts
  useEffect(() => {
    console.log("Starting webcam...");
    let streamRef = null;
    
    // Handle camera setup
    const setupCamera = async () => {
      try {
        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.log("getUserMedia not supported");
          setIsLoading(false);
          return;
        }
        
        console.log("Requesting camera access...");
        
        // Try with exact constraint to prioritize front camera
        const constraints = {
          video: { 
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        };
        
        // Get user media with constraints
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef = stream;
        
        console.log("Camera access granted, setting up video stream");
        
        // Set video source and play
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          
          // When metadata is loaded, play the video
          video.onloadedmetadata = () => {
            console.log("Video metadata loaded, attempting to play");
            video.play()
              .then(() => {
                console.log("Camera is playing successfully");
                setIsLoading(false);
              })
              .catch(err => {
                console.error("Error playing video:", err);
                setIsLoading(false);
              });
          };
        } else {
          console.error("Video element not found");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setIsLoading(false);
      }
    };
    
    // Call setup function
    setupCamera();
    
    // Clean up when component unmounts
    return () => {
      console.log("Cleaning up camera resources");
      if (streamRef) {
        streamRef.getTracks().forEach(track => {
          console.log("Stopping track:", track.kind);
          track.stop();
        });
      }
    };
  }, []);
  
  // Stream analysis implementation
  const streamAnalyze = async (imageData, frameCount) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found for stream analysis");
        return null;
      }
      
      const response = await fetch('/api/facial/stream-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          imageData, 
          frameCount,
          dbPath: dbPath || undefined 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Stream analysis failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in stream analysis:', error);
      return null;
    }
  };
  
  // Standard real-time emotion detection (when not in stream mode)
  useEffect(() => {
    if (isLoading || capturedImage || streamMode) return;
    
    let detectionInterval = null;
    
    const performDetection = async () => {
      // Capture current frame
      const imageData = captureFrameForAnalysis();
      
      if (imageData) {
        // Analyze emotion
        const result = await analyzeEmotion(imageData);
        
        if (result && result.emotion) {
          // Update detected expression
          setDetectedExpression(result.emotion);
          
          // Update facial data
          setFacialData({
            dominantExpression: result.emotion,
            expressionConfidence: result.confidence || 0.5,
            expressions: result.emotionScores || {
              neutral: 0.1,
              happy: 0.1,
              sad: 0.1,
              angry: 0.1,
              surprised: 0.1,
              [result.emotion]: 0.5
            }
          });
        }
      }
    };
    
    // Start detection loop (only when not in stream mode)
    detectionInterval = setInterval(performDetection, 2000); // Every 2 seconds
    
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [isLoading, capturedImage, streamMode]);
  
  // DeepFace-like stream mode functionality
  useEffect(() => {
    if (!streamEnabled || !streamMode || isLoading || capturedImage) return;
    
    let frameInterval = null;
    console.log("Stream mode activated - starting frame processing");
    
    const processFrame = async () => {
      // Capture current frame
      const imageData = captureFrameForAnalysis();
      if (!imageData) return;
      
      try {
        // Call the stream analysis endpoint
        const result = await streamAnalyze(imageData, consecutiveFrames);
        
        if (!result) return;
        
        // Update UI based on result status
        setStreamStatus(result.status);
        
        if (result.status === "accumulating") {
          // Update frame counter
          setConsecutiveFrames(result.frameCount);
        }
        else if (result.status === "analyzed") {
          // Full analysis completed
          setConsecutiveFrames(result.frameCount);
          setDetectedExpression(result.emotion);
          setStreamResults(result);
          
          // Update last analysis time to enforce minimum display time
          setLastAnalysisTime(Date.now());
        }
        else if (result.status === "error") {
          // Reset on error
          setConsecutiveFrames(0);
          console.error("Stream analysis error:", result.message);
        }
      } catch (error) {
        console.error("Error in stream processing:", error);
        setStreamStatus("error");
        setConsecutiveFrames(0);
      }
    };
    
    // Process frames frequently when in stream mode
    frameInterval = setInterval(processFrame, 500); // Faster, at 2 fps
    
    return () => {
      if (frameInterval) {
        clearInterval(frameInterval);
        console.log("Stream mode deactivated");
      }
    };
  }, [streamEnabled, streamMode, isLoading, capturedImage, consecutiveFrames, dbPath]);
  
  // Capture image
  const handleCapture = () => {
    try {
      let imageData;
      
      if (videoRef.current && videoRef.current.srcObject) {
        // Use video frame if available
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw video frame (mirror effect)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Get image data
        imageData = canvas.toDataURL('image/jpeg');
      } else {
        // Use SVG fallback
        imageData = svgUrl;
      }
      
      // Set captured image
      setCapturedImage(imageData);
      
      // Call onCapture callback with both image data and facial data
      if (onCapture) {
        onCapture(imageData, facialData);
      }
    } catch (err) {
      console.error("Error capturing image:", err);
    }
  };
  
  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    
    // Ensure webcam is active when returning to capture mode
    if (!videoRef.current?.srcObject) {
      console.log("Restarting webcam after retake...");
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play()
            .then(() => {
              console.log("Camera restarted successfully");
              setIsLoading(false);
            })
            .catch(err => {
              console.error("Error restarting video:", err);
              setIsLoading(false);
            });
        }
      })
      .catch(err => {
        console.error("Error reacquiring camera:", err);
        setIsLoading(false);
      });
    }
  };
  
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Main webcam display */}
      <div style={{ 
        width: '100%',
        position: 'relative', 
        overflow: 'hidden',
        backgroundColor: '#000',
        border: '2px solid rgba(67, 97, 238, 0.2)',
        borderRadius: '8px',
        aspectRatio: '4/3'
      }}>
        {capturedImage ? (
          // Show captured image
          <img 
            src={capturedImage} 
            alt="Captured" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        ) : (
          // Show video or fallback
          <>
            {/* Video element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                zIndex: 5
              }}
            />
            
            {/* Fallback SVG (shown when video isn't available) */}
            {isLoading && (
              <img 
                src={svgUrl}
                alt="Face outline"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 1
                }}
              />
            )}
            
            {/* Canvas for capturing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {/* Loading spinner */}
            {isLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
                zIndex: 10
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(255,255,255,0.2)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            )}
            
            {/* Emotion detection indicator removed as requested */}
          </>
        )}
      </div>
      
      {/* Guidance */}
      <div style={{ 
        marginTop: '15px', 
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <p style={{ marginBottom: '10px' }}>{guidance}</p>
        <div style={{
          backgroundColor: '#e6f7e9',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #b8e0b9'
        }}>
          <p style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: '5px' }}>
            IMPORTANT NOTICE
          </p>
          <p style={{ color: '#2e7d32', fontSize: '0.9rem' }}>
            This app uses <strong>DeepFace</strong> for real emotion detection. 
            Make a clear, distinctive facial expression that you can easily reproduce later.
            The emotion detected will be used for authentication.
          </p>
        </div>
      </div>
      
      {/* Stream Results (shown when stream mode is active) */}
      {streamEnabled && streamMode && streamResults && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          border: '1px solid #90caf9'
        }}>
          <h3 style={{margin: '0 0 10px', fontWeight: 'bold'}}>Stream Results</h3>
          
          <p style={{margin: '5px 0'}}>
            <span style={{fontWeight: 'bold'}}>Status:</span> {streamStatus}
          </p>
          
          <p style={{margin: '5px 0'}}>
            <span style={{fontWeight: 'bold'}}>Emotion:</span> <span style={{textTransform: 'capitalize'}}>{streamResults.emotion}</span>
          </p>
          
          {streamResults.emotionScores && (
            <div style={{margin: '5px 0'}}>
              <p style={{fontWeight: 'bold', marginBottom: '2px'}}>Emotion Scores:</p>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                {Object.entries(streamResults.emotionScores).map(([emotion, score]) => (
                  <div key={emotion} style={{
                    padding: '2px 6px',
                    backgroundColor: '#e1f5fe',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    <span style={{textTransform: 'capitalize'}}>{emotion}:</span> {(score * 100).toFixed(1)}%
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {streamResults.selfMatch && (
            <div style={{
              margin: '10px 0 5px',
              padding: '8px',
              backgroundColor: streamResults.selfMatch.match ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px',
              border: `1px solid ${streamResults.selfMatch.match ? '#a5d6a7' : '#ffcdd2'}`
            }}>
              <p style={{
                fontWeight: 'bold', 
                color: streamResults.selfMatch.match ? '#2e7d32' : '#c62828'
              }}>
                {streamResults.selfMatch.match ? 'Face Matched!' : 'No Match'}
              </p>
              <p style={{margin: '0', fontSize: '13px'}}>
                Confidence: {(streamResults.selfMatch.confidence * 100).toFixed(1)}%
              </p>
              {streamResults.selfMatch.username && (
                <p style={{margin: '0', fontSize: '13px'}}>
                  User: {streamResults.selfMatch.username}
                </p>
              )}
            </div>
          )}
          
          {streamResults.matches && streamResults.matches.length > 0 && (
            <div style={{margin: '10px 0 5px'}}>
              <p style={{fontWeight: 'bold', marginBottom: '5px'}}>Matched Faces:</p>
              <ul style={{padding: '0 0 0 20px', margin: '0'}}>
                {streamResults.matches.map((match, idx) => (
                  <li key={idx} style={{fontSize: '13px'}}>
                    {match.identity}: {(match.confidence * 100).toFixed(1)}% match
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px',
        marginTop: '20px',
        flexWrap: 'wrap'
      }}>
        {capturedImage ? (
          <Button 
            onClick={handleRetake} 
            variant="secondary"
          >
            Retake
          </Button>
        ) : (
          <>
            <Button 
              onClick={handleCapture} 
              disabled={isLoading || streamMode} 
              variant="primary"
            >
              Capture Expression
            </Button>
            
            {/* Stream Controls (only shown when streamEnabled=true) */}
            {streamEnabled && (
              <>
                <Button
                  onClick={() => setStreamMode(!streamMode)}
                  disabled={isLoading}
                  variant={streamMode ? "danger" : "secondary"}
                  style={{
                    backgroundColor: streamMode ? '#e53935' : '#6c757d',
                    color: 'white'
                  }}
                >
                  {streamMode ? "Stop Stream" : "Start Stream"}
                </Button>
                
                {streamMode && (
                  <input
                    type="text"
                    placeholder="Database path (optional)"
                    value={dbPath}
                    onChange={(e) => setDbPath(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      marginTop: '10px',
                      width: '100%'
                    }}
                  />
                )}
                
                {/* Stream status indicator */}
                {streamMode && (
                  <div style={{
                    width: '100%',
                    padding: '8px 12px',
                    marginTop: '10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '14px'
                  }}>
                    {consecutiveFrames < 5 ? (
                      <>
                        <span style={{fontWeight: 'bold'}}>Accumulating frames: </span>
                        {consecutiveFrames}/5
                      </>
                    ) : (
                      <>
                        <span style={{fontWeight: 'bold'}}>Analyzing stream </span>
                        <span style={{color: '#4285f4'}}>●</span>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
