import cv2
import os

def capture_image():
    # Create directory if it doesn't exist
    test_dir = "test_deepface"
    os.makedirs(test_dir, exist_ok=True)
    
    # Initialize webcam
    print("Initializing webcam...")
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam")
        return False
    
    # Output file path
    output_path = os.path.join(test_dir, "sample_face.jpg")
    print(f"Output will be saved to: {output_path}")
    
    print("\nPress SPACE to capture an image (or ESC to quit)")
    
    while True:
        # Read frame from webcam
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to grab frame")
            break
        
        # Display frame
        cv2.imshow("Capture Test Image (Press SPACE to capture, ESC to quit)", frame)
        
        # Wait for key press
        key = cv2.waitKey(1) & 0xFF
        
        # Capture when space bar is pressed
        if key == 32:  # SPACE key
            # Save image
            cv2.imwrite(output_path, frame)
            print(f"Image captured and saved to {output_path}")
            break
        
        # Exit when ESC is pressed
        elif key == 27:  # ESC key
            print("Capture cancelled")
            break
    
    # Release resources
    cap.release()
    cv2.destroyAllWindows()
    
    # Check if file was saved
    if os.path.exists(output_path):
        print(f"Test image saved successfully: {output_path}")
        return output_path
    else:
        print("Failed to save test image")
        return False

if __name__ == "__main__":
    result = capture_image()
    if result:
        print(f"You can now run: python test_deepface.py {result}")
