import os
import sqlite3
import sys
import logging

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def update_db_schema():
    """
    Add new columns to the facial_data table to match the SQLAlchemy model
    """
    try:
        # Get path to the database
        instance_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'instance')
        db_path = os.path.join(instance_path, 'auth_system.db')
        
        if not os.path.exists(db_path):
            logger.error(f"Database file not found at {db_path}")
            return False
            
        logger.info(f"Updating schema for database at {db_path}")
        
        # Connect to the database
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            
            # Check if columns already exist
            cursor.execute("PRAGMA table_info(facial_data)")
            columns = [info[1] for info in cursor.fetchall()]
            
            # Add emotion_scores column if it doesn't exist
            if 'emotion_scores' not in columns:
                logger.info("Adding emotion_scores column to facial_data table")
                cursor.execute("ALTER TABLE facial_data ADD COLUMN emotion_scores TEXT")
            else:
                logger.info("emotion_scores column already exists")
                
            # Add image_path column if it doesn't exist
            if 'image_path' not in columns:
                logger.info("Adding image_path column to facial_data table")
                cursor.execute("ALTER TABLE facial_data ADD COLUMN image_path TEXT")
            else:
                logger.info("image_path column already exists")
                
            conn.commit()
            
            # Verify the changes
            cursor.execute("PRAGMA table_info(facial_data)")
            updated_columns = [info[1] for info in cursor.fetchall()]
            logger.info(f"Updated table columns: {updated_columns}")
            
        logger.info("Database schema update completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error updating database schema: {str(e)}")
        return False

if __name__ == "__main__":
    success = update_db_schema()
    if success:
        print("Database schema updated successfully!")
    else:
        print("Failed to update database schema. Check the logs for details.")
        sys.exit(1)
