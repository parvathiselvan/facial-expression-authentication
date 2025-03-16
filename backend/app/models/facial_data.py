from datetime import datetime
from app.utils.db import db
import json

class FacialData(db.Model):
    """Facial data model for storing user facial authentication data."""
    __tablename__ = 'facial_data'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    expression = db.Column(db.String(20), nullable=False)  # e.g., 'happy', 'surprised', etc.
    facial_data = db.Column(db.Text, nullable=False)  # JSON string of facial landmarks/features
    emotion_scores = db.Column(db.Text, nullable=True)  # JSON string of emotion scores
    image_path = db.Column(db.String(255), nullable=True)  # Path to the saved facial image
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert facial data to dictionary for API responses."""
        emotion_scores_dict = {}
        if self.emotion_scores:
            try:
                emotion_scores_dict = json.loads(self.emotion_scores)
            except json.JSONDecodeError:
                emotion_scores_dict = {}
        
        return {
            'id': self.id,
            'userId': self.user_id,
            'expression': self.expression,
            'emotionScores': emotion_scores_dict,
            'imagePath': self.image_path,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
