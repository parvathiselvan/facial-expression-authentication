"""
Script to clear all data from the database tables without removing the tables themselves.
This script deletes all records from the users and facial_data tables without prompting for confirmation.
"""

import os
import sqlite3
import sys

# Add the parent directory to sys.path so we can import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def clear_database():
    """Clear all data from the database tables"""
    try:
        # Get absolute path to database
        app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        instance_path = os.path.join(app_root, 'instance')
        db_path = os.path.join(instance_path, 'auth_system.db')
        
        # Check if the database file exists
        if not os.path.exists(db_path):
            print(f"Database file not found at {db_path}")
            return False
        
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get table names to verify they exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        table_names = [table[0] for table in tables]
        
        print(f"Found tables: {', '.join(table_names)}")
        
        # Clear the facial_data table first (due to foreign key constraints)
        if 'facial_data' in table_names:
            cursor.execute("DELETE FROM facial_data;")
            print(f"Deleted records from facial_data table")
        else:
            print("facial_data table not found")
        
        # Clear the users table
        if 'users' in table_names:
            cursor.execute("DELETE FROM users;")
            print(f"Deleted records from users table")
        else:
            print("users table not found")
        
        # Commit the changes
        conn.commit()
        
        # Verify tables are empty
        for table in ['users', 'facial_data']:
            if table in table_names:
                cursor.execute(f"SELECT COUNT(*) FROM {table};")
                count = cursor.fetchone()[0]
                print(f"Rows remaining in {table}: {count}")
        
        # Close the connection
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error clearing database: {str(e)}")
        return False

if __name__ == "__main__":
    print("Starting database clear operation...")
    
    # No confirmation prompt - directly clear the database
    if clear_database():
        print("Database cleared successfully!")
    else:
        print("Failed to clear database.")
