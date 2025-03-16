import os
import logging
from flask import Flask, send_from_directory
from flask_cors import CORS
from app.config.settings import config
from app.utils.db import init_db, db
from app.api.auth_routes import auth_bp
from app.api.facial_routes import facial_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def create_app(config_name='default'):
    """
    Create and configure the Flask application
    
    Args:
        config_name (str): Configuration to use (default, development, testing, production)
        
    Returns:
        Flask: Configured Flask application
    """
    # Create Flask app
    app = Flask(__name__, instance_relative_config=True)
    
    # Load configuration
    app_config = config[config_name]
    app.config.from_object(app_config)
    
    # Set SQLAlchemy config
    app.config['SQLALCHEMY_DATABASE_URI'] = app_config.SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = app_config.SQLALCHEMY_TRACK_MODIFICATIONS
    
    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize the database
    try:
        init_db(app)
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(facial_bp, url_prefix='/api/facial')
    
    # Root route for health check
    @app.route('/')
    def index():
        return {
            'status': 'ok',
            'message': 'Facial Authentication System API is running',
            'version': '0.1.0'
        }
        
    # Static route for serving uploaded files
    @app.route('/static/<path:filepath>')
    def serve_static(filepath):
        """Serve static files from the uploads directory
        
        Args:
            filepath (str): Path to the file relative to the uploads directory
            
        Returns:
            Response: File response
        """
        # Get the root directory path
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return send_from_directory(os.path.join(root_dir), filepath)
    
    return app
