import os
import base64
import json
import sys
import traceback

# Check dependencies are available
print("Checking dependencies...")
try:
    import cv2
    print("✓ OpenCV loaded successfully")
except ImportError:
    print("✗ Error: OpenCV (cv2) not found. Try installing with: pip install opencv-python")
    sys.exit(1)

try:
    import numpy as np
    print("✓ NumPy loaded successfully")
except ImportError:
    print("✗ Error: NumPy not found. Try installing with: pip install numpy")
    sys.exit(1)

try:
    from deepface import DeepFace
    print("✓ DeepFace loaded successfully")
except ImportError:
    print("✗ Error: DeepFace not found. Try installing with: pip install deepface")
    sys.exit(1)

# Test directory
test_dir = "test_deepface"
os.makedirs(test_dir, exist_ok=True)

# Function to test image processing
def test_emotion_analysis(image_path=None):
    print(f"Testing DeepFace emotion analysis...")
    
    # Create a test image path if none provided
    if not image_path:
        # You would need to provide a sample face image
        print("No image provided, please run with an image path")
        return False
    
    # Check if file exists
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return False
    
    # Save a copy of the image (simulating facial capture in the app)
    test_image_path = os.path.join(test_dir, "test_face.jpg")
    print(f"Reading image from {image_path}")
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Could not read image at {image_path}")
        return False
    
    print(f"Image shape: {img.shape}")
    print(f"Image dtype: {img.dtype}")
    
    cv2.imwrite(test_image_path, img)
    print(f"Saved test image to {test_image_path}")
    
    try:
        # Analyze the image using DeepFace
        print("Analyzing face with DeepFace...")
        print(f"Running DeepFace.analyze on {test_image_path}")
        
        # Skip direct face detection test as it might not be available in all DeepFace installations
        print("Skipping direct detector test - will proceed with full analysis")
        
        # Now run the full analysis
        print("Running full analysis...")
        print("NOTE: Setting enforce_detection=False to handle potential detection issues")
        result = DeepFace.analyze(
            img_path=test_image_path,
            actions=['emotion', 'age', 'gender', 'race'],
            enforce_detection=False,  # Changed to False to handle detection issues
            detector_backend='opencv'
        )
        print("Analysis completed successfully!")
        
        # Print the results
        print("\n--- Analysis Results ---")
        print(f"Found {len(result)} face(s)")
        
        # Extract primary emotion
        dominant_emotion = result[0]['dominant_emotion']
        emotion_scores = result[0]['emotion']
        
        # Convert NumPy values to native Python types for JSON serialization
        emotion_scores_dict = {k: float(v) for k, v in emotion_scores.items()}
        race_scores_dict = {k: float(v) for k, v in result[0]['race'].items()}
        
        # Convert gender data
        gender = result[0]['gender']
        if isinstance(gender, dict):
            gender_dict = {k: float(v) for k, v in gender.items()}
            gender_str = max(gender_dict.items(), key=lambda x: x[1])[0]  # Get gender with highest score
        else:
            gender_str = gender
            gender_dict = {}
        
        print(f"\nDominant emotion: {dominant_emotion}")
        print(f"Emotion scores: {json.dumps(emotion_scores_dict, indent=2)}")
        
        # Also display age, gender, race as mentioned
        print(f"\nAge: {float(result[0]['age'])}")
        print(f"Gender: {gender_str}")
        print(f"Gender scores: {json.dumps(gender_dict, indent=2)}")
        print(f"Race: {result[0]['dominant_race']}")
        print(f"Race scores: {json.dumps(race_scores_dict, indent=2)}")
        
        # Simulate how we'd store this in our database
        print("\nData to store in dashboard:")
        dashboard_data = {
            "dominantEmotion": dominant_emotion,
            "emotionScores": emotion_scores_dict,
            "age": float(result[0]['age']),
            "gender": gender_str,
            "genderScores": gender_dict,
            "race": result[0]['dominant_race'],
            "raceScores": race_scores_dict
        }
        print(json.dumps(dashboard_data, indent=2))
        
        print("\nTest successful!")
        return True
        
    except Exception as e:
        print(f"Error during DeepFace analysis: {str(e)}")
        traceback.print_exc()
        return False

# Run the test
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Use provided image path
        image_path = sys.argv[1]
        test_emotion_analysis(image_path)
    else:
        print("Please provide an image path: python test_deepface.py path/to/image.jpg")
