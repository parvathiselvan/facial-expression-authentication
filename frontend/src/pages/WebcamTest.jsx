import React, { useState } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import Button from '../components/Button';

/**
 * Test page for the webcam functionality
 */
const WebcamTest = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [facialData, setFacialData] = useState(null);
  
  // Handle webcam capture
  const handleCapture = (imageData, faceData) => {
    setCapturedImage(imageData);
    setFacialData(faceData);
    console.log("Image captured:", imageData);
    console.log("Facial data:", faceData);
  };
  
  // Reset captured data
  const handleReset = () => {
    setCapturedImage(null);
    setFacialData(null);
  };
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <h3>Webcam Test</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8 mb-4">
                  {/* WebcamCapture component */}
                  <WebcamCapture 
                    onCapture={handleCapture}
                    guidance="Make any facial expression for testing."
                  />
                </div>
                
                <div className="col-md-4">
                  <div className="test-panel">
                    <h4 className="mb-3">Test Panel</h4>
                    
                    {facialData && (
                      <div className="facial-data-panel mb-4">
                        <h5>Detected Data:</h5>
                        <div className="data-item">
                          <span className="data-label">Expression:</span>
                          <span className="data-value">{facialData.dominantExpression}</span>
                        </div>
                        <div className="data-item">
                          <span className="data-label">Confidence:</span>
                          <span className="data-value">{(facialData.expressionConfidence * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="test-controls">
                      <Button
                        onClick={handleReset}
                        variant="secondary"
                        className="w-100 mb-3"
                        disabled={!capturedImage}
                      >
                        Reset Test
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {capturedImage && (
                <div className="captured-result mt-4">
                  <h4 className="mb-3">Captured Result</h4>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="capture-preview">
                        <img 
                          src={capturedImage} 
                          alt="Captured facial expression" 
                          className="img-fluid rounded"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="capture-info p-3">
                        <p>
                          <strong>Expression:</strong> {facialData?.dominantExpression || 'Unknown'}
                        </p>
                        <p>
                          <strong>Timestamp:</strong> {new Date().toLocaleString()}
                        </p>
                        <p className="test-note">
                          <small>
                            <i>Note: This is a test page for the webcam capture functionality. 
                            In a production environment, this data would be processed and 
                            stored securely for authentication.</i>
                          </small>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamTest;
