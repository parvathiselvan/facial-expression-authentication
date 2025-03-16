import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebcamCapture from '../components/WebcamCapture';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import facialService from '../services/facialService';

const FacialSetup = () => {
  const { setupFacialAuth } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [capturedData, setCapturedData] = useState(null);
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  
  // Available emotions for selection
  const availableEmotions = [
    { value: 'happy', label: 'Happy 😊' },
    { value: 'sad', label: 'Sad 😢' },
    { value: 'angry', label: 'Angry 😠' },
    { value: 'neutral', label: 'Neutral 😐' },
    { value: 'fear', label: 'Fearful 😨' },
    { value: 'surprise', label: 'Surprised 😲' },
    { value: 'disgust', label: 'Disgusted 🤢' },
    { value: '', label: 'Auto-detect (use system detection)' },
  ];
  
  // Handle webcam capture
  const handleCapture = (imageData, facialData) => {
    setCapturedData(imageData);
    if (facialData && facialData.dominantExpression) {
      setDetectedEmotion(facialData.dominantExpression);
    }
    setSuccess(`Image captured. Click Save to continue.`);
  };
  
  // Handle saving facial data with improved error handling
  const handleSave = async () => {
    if (!capturedData) {
      setError('Please capture your facial expression first');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    // Add a timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      setIsProcessing(false);
      setError('Operation timed out. Please try again.');
    }, 15000); // 15 seconds timeout
    
    try {
      console.log("Sending facial data to server...");
      
      // Create request data with optional emotion override
      const requestData = {
        imageData: capturedData
      };
      
      // Add emotion override if user selected one
      if (selectedEmotion) {
        requestData.overrideEmotion = selectedEmotion;
      }
      
      // Use the actual API call with potential emotion override
      const response = await facialService.setupFacial(requestData);
      
      // Update context with real facial auth status
      await setupFacialAuth(response);
      
      // Clear timeout as we've completed successfully
      clearTimeout(timeoutId);
      
      setSuccess(`Facial authentication successfully set up! Expression: ${response.expression || 'neutral'}`);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err) {
      // Clear timeout as we've completed with error
      clearTimeout(timeoutId);
      
      console.error('Error setting up facial auth:', err);
      setError(err.message || 'Failed to set up facial authentication');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="facial-setup-page">
      <div className="container">
        <h1 className="facial-setup-title">Capture Your Expression</h1>
        
        {/* Display error if any */}
        {error && (
          <div style={{
            backgroundColor: '#fdeded',
            color: '#d32f2f',
            padding: '15px 20px',
            borderRadius: '10px',
            border: '1px solid #f5c2c7',
            marginBottom: '25px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '500',
            fontSize: '1.05rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              left: '0',
              top: '0',
              bottom: '0',
              width: '6px',
              backgroundColor: '#ef5350'
            }}></div>
            <div style={{ marginLeft: '10px' }}>
              {error}
            </div>
          </div>
        )}
        
        {/* Display success message if any */}
        {success && (
          <div style={{
            backgroundColor: '#e6f7e9',
            color: '#2e7d32',
            padding: '15px 20px',
            borderRadius: '10px',
            border: '1px solid #b8e0b9',
            marginBottom: '25px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '500',
            fontSize: '1.05rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              left: '0',
              top: '0',
              bottom: '0',
              width: '6px',
              backgroundColor: '#4caf50'
            }}></div>
            <div style={{ marginLeft: '10px' }}>
              {success}
            </div>
          </div>
        )}
        
        <div className="row">
          <div className="col-lg-5 col-md-6 mb-4">
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  marginBottom: '1.5rem',
                  color: '#333',
                  textAlign: 'center'
                }}>
                  Secure Authentication
                </h2>
                <div style={{ marginTop: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '1.2rem',
                    backgroundColor: 'rgba(67, 97, 238, 0.05)',
                    padding: '15px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #0066ff, #ff6b00)',
                      color: 'white',
                      fontWeight: '700',
                      marginRight: '15px',
                      flexShrink: 0
                    }}>1</div>
                    <p style={{ margin: 0, lineHeight: 1.5, paddingTop: '0.35rem', fontSize: '1rem' }}>
                      Position your face in the center of the frame
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '1.2rem',
                    backgroundColor: 'rgba(67, 97, 238, 0.05)',
                    padding: '15px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #0066ff, #ff6b00)',
                      color: 'white',
                      fontWeight: '700',
                      marginRight: '15px',
                      flexShrink: 0
                    }}>2</div>
                    <p style={{ margin: 0, lineHeight: 1.5, paddingTop: '0.35rem', fontSize: '1rem' }}>
                      Make a facial expression you can easily reproduce
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '1.2rem',
                    backgroundColor: 'rgba(67, 97, 238, 0.05)',
                    padding: '15px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #0066ff, #ff6b00)',
                      color: 'white',
                      fontWeight: '700',
                      marginRight: '15px',
                      flexShrink: 0
                    }}>3</div>
                    <p style={{ margin: 0, lineHeight: 1.5, paddingTop: '0.35rem', fontSize: '1rem' }}>
                      Click "Capture Expression" when ready
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-7 col-md-6 mb-4">
            {/* WebcamCapture component */}
            <WebcamCapture 
              onCapture={handleCapture}
              guidance="Make a clear facial expression that you can easily reproduce during login."
            />
            
            {/* Emotion Selection (visible after capture) */}
            {capturedData && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px', color: '#3740c2' }}>
                  Select Your Expression
                </h3>
                
                <div style={{ 
                  backgroundColor: '#fff8e1', 
                  padding: '10px 15px', 
                  borderRadius: '8px', 
                  marginBottom: '15px',
                  border: '1px solid #ffe082'
                }}>
                  <p style={{ fontWeight: '500', color: '#ff6d00', marginBottom: '5px' }}>
                    ⚠️ IMPORTANT: Please select your intended expression below
                  </p>
                  <p style={{ fontSize: '0.9rem', margin: '0' }}>
                    DeepFace may not always detect your emotion correctly. For example, a sad face with downward lips
                    may be detected as neutral. Choose the expression that best matches what you're trying to show.
                  </p>
                </div>
                
                {detectedEmotion && (
                  <p style={{ marginBottom: '10px' }}>
                    <span style={{ fontWeight: '500', color: '#666' }}>System detected:</span> 
                    <span style={{ 
                      display: 'inline-block',
                      backgroundColor: 'rgba(67, 97, 238, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginLeft: '6px',
                      fontWeight: '500',
                      color: '#4361ee',
                      textTransform: 'capitalize'
                    }}>
                      {detectedEmotion}
                    </span>
                    <span style={{ 
                      fontSize: '0.8rem',
                      marginLeft: '8px',
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      (may not be accurate)
                    </span>
                  </p>
                )}
                
                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="emotion-select" style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '600',
                    fontSize: '1.05rem',
                    color: '#333'
                  }}>
                    Your Expression: <span style={{ color: '#f44336' }}>*</span>
                  </label>
                  <select
                    id="emotion-select"
                    value={selectedEmotion}
                    onChange={(e) => setSelectedEmotion(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      borderRadius: '8px',
                      border: '2px solid #4361ee',
                      backgroundColor: 'white',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                      cursor: 'pointer'
                    }}
                  >
                    {availableEmotions.map(emotion => (
                      <option key={emotion.value} value={emotion.value}>
                        {emotion.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 15px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px',
                  border: '1px solid #90caf9',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    marginRight: '12px',
                    flexShrink: 0
                  }}>
                    i
                  </div>
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: '#0d47a1',
                    margin: 0
                  }}>
                    <strong>Choose your preferred expression</strong> from the dropdown to use for authentication. 
                    This is what you'll need to reproduce during login.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="text-center mt-6 webcam-controls">
          <Button 
            onClick={handleSave} 
            disabled={!capturedData || isProcessing}
            variant="primary"
            size="lg"
            isLoading={isProcessing}
            className={capturedData ? "save-button pulse-animation" : "save-button"}
          >
            {isProcessing ? 'Saving...' : 'Save Expression'}
          </Button>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline-primary"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FacialSetup;
