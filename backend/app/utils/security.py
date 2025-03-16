import os
import jwt
import bcrypt
import datetime
import logging
from functools import wraps
from flask import request, jsonify, current_app

# Configure logging
logger = logging.getLogger(__name__)

def hash_password(password):
    """
    Hash a password using bcrypt
    
    Args:
        password (str): Plain text password
        
    Returns:
        str: Hashed password
    """
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    return hashed.decode('utf-8')

def verify_password(hashed_password, password):
    """
    Verify a password against its hash
    
    Args:
        hashed_password (str): Hashed password
        password (str): Plain text password to check
        
    Returns:
        bool: True if password matches hash, False otherwise
    """
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_token(user_id, expiration=24):
    """
    Generate a JWT token for user authentication
    
    Args:
        user_id (int): User ID to encode in the token
        expiration (int): Hours until token expires
        
    Returns:
        str: JWT token
    """
    try:
        # Set up payload with expiration time
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=expiration),
            'iat': datetime.datetime.utcnow(),
            'sub': user_id
        }
        
        # Create JWT token
        token = jwt.encode(
            payload,
            current_app.config.get('JWT_SECRET_KEY'),
            algorithm='HS256'
        )
        
        return token
    except Exception as e:
        logger.error(f"Error generating token: {str(e)}")
        return None

def decode_token(token):
    """
    Decode a JWT token
    
    Args:
        token (str): JWT token
        
    Returns:
        dict: Token payload if valid
        None: If token is invalid
    """
    try:
        # Decode and verify token
        payload = jwt.decode(
            token, 
            current_app.config.get('JWT_SECRET_KEY'),
            algorithms=['HS256']
        )
        
        return payload['sub']
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid token")
        return None

def token_required(f):
    """
    Decorator for routes that require token authentication
    
    Args:
        f: Function to decorate
        
    Returns:
        function: Decorated function
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            
            # Check if header is in format "Bearer [token]"
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        # Return 401 if token is missing
        if not token:
            return jsonify({'error': 'Authentication token is missing'}), 401
        
        # Decode and verify token
        user_id = decode_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid authentication token'}), 401
        
        # Add user_id to kwargs
        kwargs['user_id'] = user_id
        
        return f(*args, **kwargs)
    
    return decorated
