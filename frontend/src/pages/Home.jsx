import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-heading">Face is the new <span className="accent">Password</span></h1>
            <p className="hero-description">
              Secure your accounts with next-generation facial recognition technology.
              Our system combines traditional passwords with unique facial expressions 
              for unparalleled security.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn-primary">Get Started</Link>
              <Link to="/login" className="btn-secondary">Sign In</Link>
            </div>
          </div>
          <div className="hero-right" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="hero-image" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="lock-icon" style={{ position: 'absolute', left: '28%', top: '5%', transform: 'translate(-50%, -50%)', zIndex: 5 }}>🔒</div>
              <div className="face-icon" style={{ position: 'absolute', left: '28%', top: '45%', transform: 'translate(-50%, -50%)', zIndex: 5 }}>😊</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Why Choose Facial Authentication?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon security-icon">🔐</div>
            <h3>Enhanced Security</h3>
            <p>Multi-factor authentication provides significantly stronger protection than passwords alone.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon unique-icon">👤</div>
            <h3>Uniquely You</h3>
            <p>Your facial expressions create a biometric key that can't be easily replicated or stolen.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon fast-icon">⚡</div>
            <h3>Fast & Convenient</h3>
            <p>Simple authentication process that takes just seconds to complete.</p>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Register with your email and create a secure password</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Set Up Facial Recognition</h3>
            <p>Capture your unique facial expression as your biometric key</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Login Securely</h3>
            <p>Use your password and facial expression to authenticate</p>
          </div>
        </div>
        
        <div className="cta-container">
          <Link to="/register" className="btn-primary">Secure Your Account Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
