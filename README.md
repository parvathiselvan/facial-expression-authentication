# Facial Authentication System🙂

A web application for facial expression-based two-factor authentication, developed for the "Communication Beyond Words" hackathon.🗣️

## Project Overview📽️

This application provides a secure authentication system using facial expressions as a second factor of authentication. Users can register with traditional username/password credentials and then set up facial authentication by choosing a specific expression (e.g., happy, surprised, angry) that will serve as their "passkey" for future logins.

## Key Features🤞

- **Two-Factor Authentication**: Traditional password + facial expression recognition
- **Personalized Security**: Users can choose their own facial expression as a security factor
- **Privacy-Focused**: Facial processing is done client-side before sending results to the server
- **Responsive UI**: Works on mobile and desktop devices
- **Real-time Feedback**: Provides immediate visual feedback during authentication

## Tech Stack🖥️

### Frontend
- React.js for UI components
- React Router for navigation
- face-api.js for client-side facial detection and expression recognition
- Context API for state management
- Custom hooks for facial detection and authentication
- CSS for styling (custom design system)

### Backend
- Python + Flask for RESTful API
- SQLite for database storage
- JWT for secure authentication tokens
- bcrypt for password hashing
- OpenCV and face_recognition library for server-side verification

## Project Structure🌲

The project is organized into two main directories:

- `/frontend`: React application
- `/backend`: Flask API server

### Frontend Structure

```
frontend/
├── public/                  # Static assets
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── models/              # face-api.js models
│
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── NavBar.jsx
│   │   └── WebcamCapture.jsx
│   │
│   ├── context/             # React Context providers
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useFacialDetection.js
│   │
│   ├── pages/               # Application pages
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── FacialSetup.jsx
│   │
│   ├── services/            # API services
│   │   ├── authService.js
│   │   └── facialService.js
│   │
│   ├── App.jsx              # Main application component
│   ├── index.jsx            # Entry point
│   └── index.css            # Global styles
```

### Backend Structure

```
backend/
├── app/                     # Main application package
│   ├── __init__.py          # Flask app initialization
│   │
│   ├── api/                 # API endpoints
│   │   ├── auth_routes.py   # Authentication endpoints
│   │   └── facial_routes.py # Facial recognition endpoints
│   │
│   ├── config/              # Configuration settings
│   │   └── settings.py      # App settings
│   │
│   ├── models/              # Database models
│   │   ├── user.py          # User model
│   │   └── facial_data.py   # Facial data model
│   │
│   └── utils/               # Utility functions
│       ├── db.py            # Database utilities
│       ├── security.py      # Security helpers
│       └── face_processing.py # Facial processing utilities
│
├── instance/                # Instance-specific data
│   └── auth_system.db       # SQLite database
│
├── requirements.txt         # Python dependencies
└── run.py                   # Entry point to run the app
```

## Installation and Setup💽

### Prerequisites
- Python 3.8+ for the backend
- Node.js and npm for the frontend
- Modern web browser with camera access

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd facial-auth-system/backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the Flask server:
   ```
   python run.py
   ```
   The server will start at http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd facial-auth-system/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   The application will open at http://localhost:3000

## Usage👨‍💻

1. **Registration**: Create a new account with username, email, and password
2. **Facial Setup**: After registration, set up your facial authentication by selecting a specific expression
3. **Login**: Use your credentials to log in, followed by your facial expression for two-factor authentication
4. **Dashboard**: View your account information and authentication status

## Contributing💬

This project was created for the "Communication Beyond Words" hackathon. Contributions are welcome through pull requests.

## License🪪

MIT License

## Acknowledgments😃

- This project was inspired by the "Communication Beyond Words" hackathon theme
- Thanks to the face-api.js library for making facial recognition accessible in the browser
