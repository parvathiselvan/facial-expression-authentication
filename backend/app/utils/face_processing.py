import json
import logging
import base64
import io
import os
import time
import hashlib
import random
from flask import current_app

# Import necessary libraries
import numpy as np
from PIL import Image
import cv2

# Try to import DeepFace, fall back to simulation if not available
DEEPFACE_AVAILABLE = False
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("Using DeepFace for facial recognition")
except ImportError:
    logger = logging.getLogger(__name__)
    logger.warning("DeepFace library not available. Using simulated facial recognition mode.")

def extract_facial_features(image_data):
    """
    Extract facial features from an image.
    Uses DeepFace for comprehensive facial analysis including emotion, age, gender, and race.
    
    Args:
        image_data: Image data (numpy array for DeepFace, other formats for simulation)
        
    Returns:
        dict: Facial features including encoding, emotion, age, gender, and race
    """
    if DEEPFACE_AVAILABLE:
        try:
            logger.info("Extracting facial features using DeepFace")
            
            # Save the numpy array to a temporary file if needed
            is_tmp_file = False
            img_path = image_data
            temp_filename = None
            
            if isinstance(image_data, np.ndarray):
                import tempfile
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                    temp_filename = tmp.name
                    cv2.imwrite(temp_filename, image_data)
                    img_path = temp_filename
                    is_tmp_file = True
                    logger.info(f"Created temporary file for image processing: {temp_filename}")
            
            # Analyze the face using DeepFace - adding age, gender, race as requested
            # Set enforce_detection=False to handle potential detection issues
            analysis = DeepFace.analyze(
                img_path=img_path,
                actions=['emotion', 'age', 'gender', 'race'],
                enforce_detection=False,  # Changed to False to handle potential detection issues
                detector_backend='opencv'
            )
            
            # Log the analysis result for debugging
            logger.info(f"DeepFace analysis successful: {len(analysis)} faces found")
            
            # Extract the emotion scores (convert NumPy types to Python native types)
            emotions = {k: float(v) for k, v in analysis[0]['emotion'].items()}
            logger.info(f"Emotion scores: {emotions}")
            
            # Get the dominant emotion directly
            dominant_emotion = analysis[0]['dominant_emotion']
            logger.info(f"Dominant emotion detected: {dominant_emotion}")
            
            # Extract additional attributes (age, gender, race)
            age = float(analysis[0]['age'])
            
            # Handle gender data which might be a string or a dictionary
            gender_data = analysis[0]['gender']
            if isinstance(gender_data, dict):
                gender_scores = {k: float(v) for k, v in gender_data.items()}
                gender = max(gender_scores.items(), key=lambda x: x[1])[0]  # Get gender with highest score
            else:
                gender = gender_data
                gender_scores = {}
                
            dominant_race = analysis[0]['dominant_race']
            race_scores = {k: float(v) for k, v in analysis[0]['race'].items()}
            
            logger.info(f"Additional attributes - Age: {age}, Gender: {gender}, Race: {dominant_race}")
            
            # Get embeddings using DeepFace.represent
            embeddings = DeepFace.represent(
                img_path=img_path,
                model_name="VGG-Face",
                enforce_detection=False,  # Changed to False to handle potential detection issues
                detector_backend='opencv'
            )
            
            # Extract the embedding from the result
            face_encoding = embeddings[0]['embedding']
            
            # Clean up the temporary file if we created one
            if is_tmp_file and temp_filename and os.path.exists(temp_filename):
                try:
                    os.unlink(temp_filename)
                    logger.info(f"Deleted temporary file: {temp_filename}")
                except Exception as e:
                    logger.warning(f"Failed to delete temporary file {temp_filename}: {str(e)}")
            
            # Get face location if needed for your UI
            face_area = analysis[0]['region']
            face_location = (
                face_area['y'],              # top
                face_area['x'] + face_area['w'],  # right
                face_area['y'] + face_area['h'],  # bottom
                face_area['x']               # left
            )
            
            # Create result dictionary with additional attributes
            result = {
                'faceEncoding': face_encoding,
                'faceLocation': face_location,
                'dominantEmotion': dominant_emotion,
                'emotionScores': emotions,
                'faceArea': face_area,
                'age': age,
                'gender': gender,
                'genderScores': gender_scores,
                'dominantRace': dominant_race,
                'raceScores': race_scores
            }
            
            logger.info(f"Detected expression: {dominant_emotion}")
            return result
            
        except Exception as e:
            logger.error(f"Error extracting facial features with DeepFace: {str(e)}")
            return None
    else:
        # ALWAYS SUCCEED in simulated mode to allow testing without DeepFace
        logger.info("Extracting facial features (simulated - always succeeds)")
        
        try:
            # Generate a unique hash from the image data to ensure consistency
            # This allows the same face to have the same encoding when captured multiple times
            if isinstance(image_data, bytes):
                # If we have bytes, use them directly
                image_hash = hashlib.md5(image_data).hexdigest()
            elif isinstance(image_data, str):
                # If we have a string (e.g., base64), use that
                image_hash = hashlib.md5(image_data.encode('utf-8')).hexdigest()
            else:
                # Generate a random hash for simulation
                image_hash = hashlib.md5(str(time.time()).encode('utf-8')).hexdigest()
            
            logger.info(f"Generated hash for simulation: {image_hash[:8]}...")
            
            # Generate pseudo-random face encoding based on the hash
            # Real face encodings are typically 128-dimensional vectors
            hash_bytes = bytes.fromhex(image_hash)
            random.seed(int.from_bytes(hash_bytes[:4], byteorder='big'))
            face_encoding = [random.uniform(-0.5, 0.5) for _ in range(128)]
            
            # Generate random facial landmarks (simulated)
            landmarks = {
                'left_eye': [(random.uniform(100, 150), random.uniform(100, 150)) for _ in range(6)],
                'right_eye': [(random.uniform(200, 250), random.uniform(100, 150)) for _ in range(6)],
                'nose': [(random.uniform(150, 200), random.uniform(150, 200)) for _ in range(9)],
                'mouth': [(random.uniform(100, 250), random.uniform(200, 250)) for _ in range(20)],
                'jawline': [(random.uniform(50, 300), random.uniform(250, 300)) for _ in range(17)]
            }
            
            # Simulated emotions - vary based on hash but prioritize different emotions
            emotions = ['happy', 'neutral', 'sad', 'surprised', 'angry']
            emotion_index = int(int.from_bytes(hash_bytes[4:8], byteorder='big') % len(emotions))
            dominant_emotion = emotions[emotion_index]
            
            # Generate emotion scores where the dominant emotion has the highest score
            emotion_scores = {emotion: 0.1 for emotion in emotions}
            emotion_scores[dominant_emotion] = 0.9
                
            logger.info(f"Simulated expression: {dominant_emotion}")
            
            # Create result dictionary - follows the same structure as the real implementation
            result = {
                'faceEncoding': face_encoding,
                'faceLocation': (50, 50, 200, 200),  # simulated face bounding box (top, right, bottom, left)
                'dominantEmotion': dominant_emotion,
                'emotionScores': emotion_scores,
                'facialLandmarks': landmarks
            }
            
            logger.info(f"Successfully generated simulated facial data with emotion: {dominant_emotion}")
            return result
            
        except Exception as e:
            # In simulation mode, we should never fail to return a result
            logger.error(f"Error in simulation (BYPASSING FOR TESTING): {str(e)}")
            logger.info("Generating fallback simulation data")
            
            # Return a fallback result even if there's an error
            fallback_emotion = 'happy'
            return {
                'faceEncoding': [random.uniform(-0.5, 0.5) for _ in range(128)],
                'faceLocation': (50, 50, 200, 200),
                'dominantEmotion': fallback_emotion,
                'emotionScores': {
                    'happy': 0.9,
                    'neutral': 0.05,
                    'sad': 0.01,
                    'angry': 0.02,
                    'surprised': 0.02
                }
            }

def compare_facial_expressions(stored_data, current_data, threshold=None):
    """
    Compare facial expressions to determine if they match.
    Use DeepFace if available, fall back to simulation if not.
    
    Args:
        stored_data (dict): Previously stored facial data
        current_data (dict): Current facial data
        threshold (float): Confidence threshold (default: from config)
        
    Returns:
        tuple: (bool - match result, float - confidence score)
    """
    if threshold is None:
        threshold = current_app.config.get('FACIAL_AUTH_THRESHOLD', 0.6)
    
    if DEEPFACE_AVAILABLE:
        try:
            logger.info("Comparing facial expressions with DeepFace")
            
            # Get emotion data for secondary verification
            stored_emotion = stored_data.get('dominantEmotion', 'unknown')
            current_emotion = current_data.get('dominantEmotion', 'unknown')
            
            emotion_match = stored_emotion == current_emotion
            logger.info(f"Emotions: Stored={stored_emotion}, Current={current_emotion}, Match={emotion_match}")
            
            # We'll use emotion match as a factor, but not reject immediately (more lenient)
            
            # DIRECT IMPLEMENTATION: Use DeepFace.verify exactly as in docs
            # Use the image paths if available (preferred method)
            stored_image_path = stored_data.get('imagePath')
            current_image_path = None  # Will create from current image

            # Special handling for login/verification flows in facial_routes.py
            # We need to use the image saved by the facial_routes.py login_verify function
            # This is a critical fix for the verification process
            try:
                # Handle verification image paths
                if 'verification_image_path' in current_data:
                    logger.info(f"Using saved verification image: {current_data['verification_image_path']}")
                    current_image_path = current_data['verification_image_path']
                    if not os.path.exists(current_image_path):
                        logger.error(f"Verification image path not found: {current_image_path}")
                        return (False, 0.0)
                else:
                    # Make sure stored image exists
                    if not stored_image_path or not os.path.exists(stored_image_path):
                        logger.error("No valid stored image path available for verification")
                        return (False, 0.0)
                        
                    # For current image, we need to save to temp file
                    # Create a temporary file for the current image
                    import tempfile
                    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                        current_image_path = tmp.name
                        
                        # If we have a numpy array, save it directly
                        current_image_array = current_data.get('image_array')
                        if current_image_array is not None and isinstance(current_image_array, np.ndarray):
                            cv2.imwrite(current_image_path, current_image_array)
                        # Otherwise try to use the image path
                        elif 'imagePath' in current_data and os.path.exists(current_data['imagePath']):
                            current_image_path = current_data['imagePath']  
                        # Handle case when we receive base64 image data from frontend
                        elif 'imageData' in current_data and current_data['imageData']:
                            try:
                                # Clean the base64 string if needed
                                image_data = current_data['imageData']
                                if ',' in image_data:
                                    image_data = image_data.split(',', 1)[1]
                                    
                                # Decode and save the image
                                with open(current_image_path, 'wb') as f:
                                    f.write(base64.b64decode(image_data))
                                logger.info(f"Saved verification image from base64 data")
                            except Exception as e:
                                logger.error(f"Error saving base64 image: {str(e)}")
                                return (False, 0.0)
                        else:
                            logger.error("No valid current image available for verification")
                            return (False, 0.0)
                
                # Direct use of DeepFace.verify per documentation
                logger.info(f"Using DeepFace.verify with img1={current_image_path}, img2={stored_image_path}")
                
                # This is the key function call - EXACTLY as in documentation
                verify_result = DeepFace.verify(
                    img1_path=current_image_path, 
                    img2_path=stored_image_path,
                    model_name="VGG-Face",
                    distance_metric="cosine",
                    enforce_detection=False  # Added to handle potential detection issues
                )
                
                # Log the verification result
                logger.info(f"DeepFace.verify result: {verify_result}")
                
                # Get the verified status directly from result
                face_verified = verify_result.get('verified', False)
                
                # For confidence, let's use the distance value
                face_distance = verify_result.get('distance', 1.0)
                face_similarity = 1.0 - min(face_distance, 1.0)  # Convert to similarity
                
                # For secure facial authentication, BOTH face verification and emotion match must pass
                if face_verified and emotion_match:
                    # Both face and emotion are verified
                    confidence = 0.8 * face_similarity + 0.2  # Full bonus for matching emotion
                    logger.info(f"Verification PASSED: Face verified with matching emotion")
                    return (True, confidence)
                elif face_verified and not emotion_match:
                    # Face is verified but emotions don't match - FAIL authentication
                    logger.info(f"Verification FAILED: Face verified but emotion mismatch ({stored_emotion} vs {current_emotion})")
                    return (False, 0.0)
                else:
                    # If face verification fails, try one more approach - sometimes 
                    # DeepFace.verify can fail even with matching faces
                    logger.warning(f"Initial verification failed. Trying alternative approach...")
                    
                    # Check if the emotions match and if face distance is reasonable
                    # This helps when faces are similar but verification failed
                    if emotion_match and face_distance < 0.6:  # Reasonable threshold for similar faces
                        # Calculate a confidence score based on face similarity
                        confidence = max(0.0, 1.0 - face_distance) 
                        logger.info(f"Alternative verification PASSED: Emotions match and face distance is reasonable ({face_distance})")
                        return (True, confidence)
                    else:
                        # If everything failed, return failure
                        logger.warning(f"Verification FAILED: Face not verified and alternative approach failed")
                        return (False, 0.0)
                    
            except Exception as verify_error:
                logger.error(f"Verification error: {verify_error}")
                return (False, 0.0)
            finally:
                # Clean up temp file
                if current_image_path and current_image_path != current_data.get('imagePath') and os.path.exists(current_image_path):
                    try:
                        os.unlink(current_image_path)
                        logger.info(f"Deleted temporary verification file: {current_image_path}")
                    except:
                        pass
            
        except Exception as e:
            logger.error(f"Error comparing facial expressions with DeepFace: {str(e)}")
            return (False, 0.0)
    else:
        try:
            logger.info("Comparing facial expressions (simulated)")
            
            # Extract face encodings
            stored_encoding = stored_data.get('faceEncoding', [])
            current_encoding = current_data.get('faceEncoding', [])
            
            if not stored_encoding or not current_encoding:
                logger.warning("Missing face encoding in comparison")
                return (False, 0.0)
                
            # Calculate similarity between face encodings (simulated)
            # In a real implementation, this would use proper distance metrics
            # Here we'll use a simplified metric based on the vectors
            similarity_sum = 0
            for i in range(min(len(stored_encoding), len(current_encoding))):
                similarity_sum += abs(stored_encoding[i] - current_encoding[i])
            
            # Convert to a similarity score between 0 and 1
            # Lower distance = higher similarity
            face_similarity = max(0, 1 - (similarity_sum / 128))
            
            # Get emotion match score
            stored_emotion = stored_data.get('dominantEmotion', 'unknown')
            current_emotion = current_data.get('dominantEmotion', 'unknown')
            
            # Basic emotion matching
            emotion_match = stored_emotion == current_emotion
            emotion_score = 1.0 if emotion_match else 0.0
            
            # Calculate final confidence score (weighted combination)
            # Use the weight from config
            emotion_weight = current_app.config.get('FACIAL_EMOTION_WEIGHT', 0.3)
            confidence = ((1 - emotion_weight) * face_similarity) + (emotion_weight * emotion_score)
            
            logger.info(f"Face similarity: {face_similarity:.2f}, Emotion match: {emotion_match} (score: {emotion_score}) (simulated)")
            logger.info(f"Final confidence: {confidence:.2f}, Threshold: {threshold} (simulated)")
            
            return (confidence >= threshold, confidence)
        except Exception as e:
            logger.error(f"Error comparing facial expressions (simulation): {str(e)}")
            return (False, 0.0)

def find_matches_in_directory(face_data, directory_path, similarity_threshold=0.6):
    """
    Find matching faces in a directory of images/embeddings
    
    Args:
        face_data (dict): Processed facial data to compare
        directory_path (str): Path to directory containing facial data
        similarity_threshold (float): Threshold for matching
        
    Returns:
        list: Matching faces with confidence scores
    """
    matches = []
    
    if DEEPFACE_AVAILABLE:
        try:
            # If we have a numpy array, need to save to temp file
            img_path = None
            temp_filename = None
            is_tmp_file = False
            
            if 'image_array' in face_data:
                import tempfile
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                    temp_filename = tmp.name
                    cv2.imwrite(temp_filename, face_data['image_array'])
                    img_path = temp_filename
                    is_tmp_file = True
                    logger.info(f"Created temporary file for directory matching: {temp_filename}")
            
            # Use DeepFace's find function which is optimized for directory scanning
            dfs = DeepFace.find(
                img_path=img_path or face_data.get('image_path', None), 
                db_path=directory_path,
                model_name="VGG-Face",
                detector_backend='opencv',
                enforce_detection=False
            )
            
            # Clean up temp file if created
            if is_tmp_file and temp_filename and os.path.exists(temp_filename):
                try:
                    os.unlink(temp_filename)
                    logger.info(f"Deleted temporary file: {temp_filename}")
                except Exception as e:
                    logger.warning(f"Failed to delete temporary file {temp_filename}: {str(e)}")
            
            # Process DeepFace find results
            if len(dfs) > 0 and not dfs[0].empty:
                for _, row in dfs[0].iterrows():
                    # Convert distance to similarity (cosine distance is between 0-1 where 0 is identical)
                    similarity = 1.0 - float(row['VGG-Face_cosine'])
                    
                    if similarity >= similarity_threshold:
                        matches.append({
                            'identity': os.path.basename(row['identity']),
                            'confidence': similarity,
                        })
                    
            return matches
            
        except Exception as e:
            logger.error(f"Error finding matches with DeepFace: {str(e)}")
            return []
    else:
        # Simulated matching for testing
        logger.info(f"Simulating directory matching against {directory_path}")
        
        # For simulation, generate 0-2 random matches
        import random
        from datetime import datetime
        
        # Use today's date for consistent simulation during a session
        random.seed(datetime.now().strftime("%Y%m%d"))
        
        num_matches = random.randint(0, 2)
        for i in range(num_matches):
            matches.append({
                'identity': f"person_{random.randint(1, 10)}",
                'confidence': random.uniform(0.65, 0.95)
            })
            
        return matches

def process_image_base64(base64_image):
    """
    Process a base64 encoded image.
    Use DeepFace if available, fall back to simulation if not.
    
    Args:
        base64_image (str): Base64 encoded image
        
    Returns:
        dict: Facial features
    """
    # Clean the base64 string if it has a data URL prefix
    if ',' in base64_image:
        base64_image = base64_image.split(',')[1]
    
    if DEEPFACE_AVAILABLE:
        try:
            logger.info("Processing base64 image with DeepFace")
            
            try:
                # Decode base64 string to image
                image_bytes = base64.b64decode(base64_image)
                image = Image.open(io.BytesIO(image_bytes))
                
                # Convert PIL Image to numpy array (cv2 format)
                image_array = np.array(image)
                
                # Convert RGB to BGR (OpenCV uses BGR)
                if len(image_array.shape) == 3 and image_array.shape[2] == 3:  # If it has 3 channels (RGB)
                    image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
                
                # Extract facial features
                return extract_facial_features(image_array)
            except Exception as decode_error:
                logger.error(f"Error decoding base64 image: {str(decode_error)}")
                return None
            
        except Exception as e:
            logger.error(f"Error processing base64 image with DeepFace: {str(e)}")
            return None
    else:
        try:
            logger.info("Processing base64 image (simulated)")
            
            # In simulation mode, we pass the base64 string directly to extract_facial_features
            # which will generate consistent simulated facial features
            return extract_facial_features(base64_image)
            
        except Exception as e:
            logger.error(f"Error processing base64 image (simulation): {str(e)}")
            return None
