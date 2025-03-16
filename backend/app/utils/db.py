import sqlite3
import os
import logging
from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

# Set up logging
logger = logging.getLogger(__name__)

def init_db(app):
    """
    Initialize the database connection and create tables
    
    Args:
        app: Flask application instance
    """
    try:
        # Ensure instance directory exists
        instance_path = app.instance_path
        os.makedirs(instance_path, exist_ok=True)
        
        # Database file path
        db_path = os.path.join(instance_path, 'auth_system.db')
        logger.info(f"Database initialized at {db_path}")
        
        # Connect to SQLite and create tables if not exist
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            
            # Create users table if it doesn't exist
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')
            
            # Create facial_data table if it doesn't exist
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS facial_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                expression TEXT NOT NULL,
                facial_data TEXT NOT NULL,
                emotion_scores TEXT,
                image_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
            ''')
            
            conn.commit()
        
        # Set absolute path for SQLAlchemy
        app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
        
        # Initialize SQLAlchemy with the app
        db.init_app(app)
        with app.app_context():
            # Create all tables defined by SQLAlchemy models
            db.create_all()
            logger.info("SQLAlchemy tables created")
    
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

def get_db_connection():
    """
    Get a database connection
    
    Returns:
        sqlite3.Connection: Database connection
    """
    try:
        # Get absolute path to database
        app_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        instance_path = os.path.join(app_root, 'instance')
        db_path = os.path.join(instance_path, 'auth_system.db')
        
        # Ensure directory exists
        os.makedirs(instance_path, exist_ok=True)
        
        # Connect to the database
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        logger.error(f"Error connecting to database: {str(e)}")
        raise
