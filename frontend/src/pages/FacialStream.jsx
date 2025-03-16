import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebcamCapture from '../components/WebcamCapture';
import Card from '../components/Card';

/**
 * FacialStream component
 * Demonstrates real-time facial recognition similar to DeepFace.stream()
 */
const FacialStream = () => {
  const [results, setResults] = useState(null);
  const navigate = useNavigate();
  
  const handleCapture = (imageData, facialData) => {
    setResults({
      imageData, 
      facialData
    });
  };
  
  return (
    <div className="max-w-md mx-auto mt-8">
      <Card 
        title="Facial Stream Demo"
        footer={
          <div className="text-center text-sm text-gray-600">
            Similar to DeepFace.stream() functionality
          </div>
        }
      >
        <div className="mb-6">
          <p className="mb-2">
            This page demonstrates real-time facial recognition and emotion analysis
            similar to DeepFace's stream() function.
          </p>
          <ol className="list-decimal ml-6 space-y-1 text-sm">
            <li>The system tracks your face in consecutive frames</li>
            <li>Analysis begins after detecting a face in 5 consecutive frames</li>
            <li>Results display for 5 seconds before analyzing again</li> 
            <li>Optionally match against registered faces in a directory</li>
          </ol>
        </div>
        
        <WebcamCapture
          onCapture={handleCapture}
          guidance="Enable Stream mode to start continuous facial analysis"
          autoDetect={true}
          streamEnabled={true}
        />
      </Card>
    </div>
  );
};

export default FacialStream;
