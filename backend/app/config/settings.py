import os
import secrets

class Config:
    """Base configuration."""
    
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', secrets.token_hex(32))
    DEBUG = os.environ.get('FLASK_DEBUG', True)
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///instance/auth_system.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', secrets.token_hex(32))
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 24  # 24 hours
    
    # CORS
    CORS_HEADERS = 'Content-Type'
    
    # Facial Authentication
    FACIAL_AUTH_THRESHOLD = 0.6  # Confidence threshold for facial expression matching
    FACIAL_DETECTION_MODEL = 'hog'  # 'hog' is faster, 'cnn' is more accurate but requires GPU
    FACIAL_EMOTION_WEIGHT = 0.3  # Weight for emotion match in authentication (face similarity is 1-this value)
    FACIAL_ALLOW_NO_EMOTION = True  # Whether to allow authentication when emotion can't be detected
    
class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///instance/test.db'
    
class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    TESTING = False
    
    # In production, these should be set as environment variables
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    # More secure settings for production
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_HTTPONLY = True

# Default to development config
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
