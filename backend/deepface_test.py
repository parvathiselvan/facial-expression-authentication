"""
A simple diagnostic test for DeepFace to determine the best parameters
to use for reliable face detection and analysis.
"""
import os
import sys
import json
from deepface import DeepFace

# Available backends for testing
DETECTOR_BACKENDS = [
    'opencv', 
    'ssd', 
    'dlib', 
    'mtcnn', 
    'retinaface',
    'mediapipe',
    'yolov8'
]

def test_backends(image_path):
    """Test each available detector backend with the image."""
    print(f"Testing image: {image_path}")
    
    # Ensure the file exists
    if not os.path.exists(image_path):
        print(f"Error: File not found: {image_path}")
        return
    
    results = {}
    
    for backend in DETECTOR_BACKENDS:
        print(f"\n{'='*40}")
        print(f"Testing detector backend: {backend}")
        print(f"{'='*40}")
        
        try:
            # Try without enforcing detection first
            print(f"\nTest 1: enforce_detection=False")
            result = DeepFace.analyze(
                img_path=image_path,
                actions=['emotion', 'age', 'gender', 'race'],
                enforce_detection=False,
                detector_backend=backend,
                prog_bar=False
            )
            print(f"✓ Success with {backend} (enforce_detection=False)")
            
            # Print key information
            print(f"  Dominant emotion: {result[0]['dominant_emotion']}")
            print(f"  Age: {result[0]['age']}")
            print(f"  Gender: {result[0]['gender']}")
            print(f"  Race: {result[0]['dominant_race']}")
            
            # Store for comparison
            results[f"{backend}_false"] = {
                "success": True,
                "emotion": result[0]['dominant_emotion'],
                "age": result[0]['age'],
                "gender": result[0]['gender'],
                "race": result[0]['dominant_race']
            }
            
        except Exception as e:
            print(f"✗ Failed with {backend} (enforce_detection=False)")
            print(f"  Error: {str(e)}")
            results[f"{backend}_false"] = {
                "success": False,
                "error": str(e)
            }
        
        try:
            # Try with enforcing detection
            print(f"\nTest 2: enforce_detection=True")
            result = DeepFace.analyze(
                img_path=image_path,
                actions=['emotion', 'age', 'gender', 'race'],
                enforce_detection=True,
                detector_backend=backend,
                prog_bar=False
            )
            print(f"✓ Success with {backend} (enforce_detection=True)")
            
            # Print key information
            print(f"  Dominant emotion: {result[0]['dominant_emotion']}")
            print(f"  Age: {result[0]['age']}")
            print(f"  Gender: {result[0]['gender']}")
            print(f"  Race: {result[0]['dominant_race']}")
            
            # Store for comparison
            results[f"{backend}_true"] = {
                "success": True,
                "emotion": result[0]['dominant_emotion'],
                "age": result[0]['age'],
                "gender": result[0]['gender'],
                "race": result[0]['dominant_race']
            }
            
        except Exception as e:
            print(f"✗ Failed with {backend} (enforce_detection=True)")
            print(f"  Error: {str(e)}")
            results[f"{backend}_true"] = {
                "success": False,
                "error": str(e)
            }
    
    # Summary
    print("\n\n" + "="*60)
    print(" SUMMARY OF RESULTS ")
    print("="*60)
    
    successful_configs = []
    
    for key, value in results.items():
        backend, enforce = key.split('_')
        status = "✓ Success" if value["success"] else "✗ Failed"
        print(f"{backend.ljust(10)} (enforce={enforce.ljust(5)}): {status}")
        
        if value["success"]:
            successful_configs.append((backend, enforce))
    
    print("\nRecommended configuration:")
    if successful_configs:
        backend, enforce = successful_configs[0]
        print(f"  detector_backend='{backend}', enforce_detection={enforce}")
    else:
        print("  No successful configurations found!")
        print("  Try with a clearer face image or a different image.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        test_backends(image_path)
    else:
        print("Please provide an image path: python deepface_test.py path/to/image.jpg")
