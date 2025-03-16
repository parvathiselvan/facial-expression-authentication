import os
import sys
import logging
from app import create_app

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def main():
    """
    Main entry point for the application
    """
    try:
        # Determine environment
        env = os.environ.get('FLASK_ENV', 'development')
        
        # Create the Flask app with the appropriate configuration
        app = create_app(env)
        
        # Get port from environment or use default
        port = int(os.environ.get('PORT', 5000))
        
        # Run the app
        logger.info(f"Starting Facial Authentication System API on port {port} in {env} mode")
        app.run(host='0.0.0.0', port=port, debug=(env == 'development'))
        
    except Exception as e:
        logger.error(f"Error starting application: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
