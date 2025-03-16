from datetime import datetime
from app.utils.db import db

class User(db.Model):
    """User model representing system users."""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with FacialData model
    facial_data = db.relationship('FacialData', backref='user', lazy=True, uselist=False)
    
    @property
    def has_facial_auth(self):
        """Check if user has set up facial authentication."""
        return self.facial_data is not None
    
    def to_dict(self):
        """Convert user to dictionary for API responses."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'hasFacialAuth': self.has_facial_auth,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
