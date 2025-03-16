"""
Face Similarity Test - Critical Security Diagnostic

This script tests the face similarity verification directly with DeepFace
to confirm whether two different people are correctly distinguished.
"""

import os
import logging
import cv2
import numpy as np
from deepface import DeepFace
import matplotlib.pyplot as plt

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('face_similarity_test')

def test_face_similarity(image1_path, image2_path):
    """
    Test face similarity between two images
    
    Args:
        image1_path (str): Path to first image
        image2_path (str): Path to second image
    """
    logger.info(f"Testing face similarity between: {os.path.basename(image1_path)} and {os.path.basename(image2_path)}")
    
    # Load images
    img1 = cv2.imread(image1_path)
    img2 = cv2.imread(image2_path)
    
    if img1 is None or img2 is None:
        logger.error(f"Failed to load images: {image1_path}, {image2_path}")
        return
    
    # Display images side by side
    plt.figure(figsize=(12, 5))
    
    plt.subplot(1, 2, 1)
    plt.imshow(cv2.cvtColor(img1, cv2.COLOR_BGR2RGB))
    plt.title("Image 1")
    plt.axis('off')
    
    plt.subplot(1, 2, 2)
    plt.imshow(cv2.cvtColor(img2, cv2.COLOR_BGR2RGB))
    plt.title("Image 2")
    plt.axis('off')
    
    plt.tight_layout()
    
    try:
        logger.info("Getting face embeddings...")
        
        # Get embeddings for both images
        embedding1 = DeepFace.represent(img_path=image1_path, model_name="VGG-Face", enforce_detection=False)
        embedding2 = DeepFace.represent(img_path=image2_path, model_name="VGG-Face", enforce_detection=False)
        
        # Extract vectors
        vector1 = embedding1[0]['embedding']
        vector2 = embedding2[0]['embedding']
        
        # Convert to numpy arrays
        vector1 = np.array(vector1)
        vector2 = np.array(vector2)
        
        # Calculate cosine similarity
        similarity = np.dot(vector1, vector2) / (np.linalg.norm(vector1) * np.linalg.norm(vector2))
        normalized_similarity = (similarity + 1) / 2  # Convert from [-1,1] to [0,1]
        
        logger.info(f"Raw similarity score: {similarity:.4f}")
        logger.info(f"Normalized similarity (0-1): {normalized_similarity:.4f}")
        
        # Check verification with DeepFace.verify
        verify_result = DeepFace.verify(
            img1_path=image1_path, 
            img2_path=image2_path,
            model_name="VGG-Face", 
            detector_backend='opencv',
            enforce_detection=False
        )
        
        logger.info(f"DeepFace.verify result: {verify_result}")
        logger.info(f"Verified: {verify_result['verified']}")
        logger.info(f"Distance: {verify_result['distance']}")
        logger.info(f"Threshold: {verify_result['threshold']}")
        
        # Get emotions
        emotions1 = DeepFace.analyze(img_path=image1_path, actions=['emotion'], enforce_detection=False, detector_backend='opencv')
        emotions2 = DeepFace.analyze(img_path=image2_path, actions=['emotion'], enforce_detection=False, detector_backend='opencv')
        
        logger.info(f"Image 1 emotions: {emotions1[0]['emotion']}")
        logger.info(f"Image 1 dominant emotion: {emotions1[0]['dominant_emotion']}")
        logger.info(f"Image 2 emotions: {emotions2[0]['emotion']}")
        logger.info(f"Image 2 dominant emotion: {emotions2[0]['dominant_emotion']}")
        
        # Calculate confidence with our algorithm
        emotion_match = emotions1[0]['dominant_emotion'] == emotions2[0]['dominant_emotion']
        emotion_score = 1.0 if emotion_match else 0.0
        
        face_weight = 0.9
        emotion_weight = 0.1
        
        min_face_similarity = 0.90
        
        if normalized_similarity < min_face_similarity:
            logger.warning(f"Face similarity too low: {normalized_similarity:.4f} < {min_face_similarity}")
            confidence = 0.0
            passed = False
        else:
            confidence = (face_weight * normalized_similarity) + (emotion_weight * emotion_score)
            passed = confidence >= 0.6 and emotion_match
        
        logger.info(f"Our algorithm result:")
        logger.info(f"  Face similarity: {normalized_similarity:.4f}")
        logger.info(f"  Emotion match: {emotion_match}")
        logger.info(f"  Confidence: {confidence:.4f}")
        logger.info(f"  Pass auth: {passed}")
        
        # Show threshold lines
        plt.figure(figsize=(10, 6))
        plt.bar(['Face Similarity'], [normalized_similarity], color='blue', alpha=0.7)
        
        if emotion_match:
            plt.bar(['Emotion Match'], [1.0], color='green', alpha=0.7)
        else:
            plt.bar(['Emotion Match'], [0.0], color='red', alpha=0.7)
            
        plt.bar(['Confidence'], [confidence], color='purple', alpha=0.7)
        
        # Add threshold line
        plt.axhline(y=min_face_similarity, color='r', linestyle='-', label=f'Min Face Similarity ({min_face_similarity})')
        plt.axhline(y=0.6, color='g', linestyle='--', label='Auth Threshold (0.6)')
        
        plt.ylim(0, 1.1)
        plt.ylabel('Score')
        plt.title('Face Similarity Test Results')
        plt.legend()
        
        plt.show()
        
    except Exception as e:
        logger.error(f"Error in face similarity test: {str(e)}")

if __name__ == "__main__":
    # Paths to two test images (you may need to adjust these)
    test_dir = os.path.join("test_images")
    
    # Create test directory if it doesn't exist
    if not os.path.exists(test_dir):
        os.makedirs(test_dir)
        print(f"Created test directory: {test_dir}")
        print("Please add two different face images named 'person1.jpg' and 'person2.jpg' to this directory")
    else:
        img1 = os.path.join(test_dir, "person1.jpg")
        img2 = os.path.join(test_dir, "person2.jpg")
        
        if os.path.exists(img1) and os.path.exists(img2):
            test_face_similarity(img1, img2)
        else:
            print(f"Please add two different face images named 'person1.jpg' and 'person2.jpg' to {test_dir}")
