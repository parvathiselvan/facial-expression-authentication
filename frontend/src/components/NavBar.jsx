import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * NavBar component for site navigation
 */
const NavBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle logout button click
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Check if a nav link is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Link to="/" className="navbar-brand">
          <span role="img" aria-label="lock" className="navbar-logo">🔐</span> <span className="navbar-title">FacialAuth</span>
        </Link>
        
        <ul className="navbar-nav" style={{ display: 'flex', flexDirection: 'row', gap: '2rem', margin: 0 }}>
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
              </li>
              
              <li className="nav-item">
                <Link 
                  to="/facial-setup" 
                  className={`nav-link ${isActive('/facial-setup') ? 'active' : ''}`}
                >
                  Facial Setup
                </Link>
              </li>
              
              <li className="nav-item">
                <Link 
                  to="#"
                  onClick={handleLogout} 
                  className="nav-link"
                >
                  Logout
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link 
                  to="/login" 
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                >
                  Login
                </Link>
              </li>
              
              <li className="nav-item">
                <Link 
                  to="/register" 
                  className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
