import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import facialService from '../services/facialService';
import Card from '../components/Card';
import Button from '../components/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [facialData, setFacialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch detailed facial data when component mounts
  useEffect(() => {
    const fetchFacialData = async () => {
      // Only attempt to fetch if user is logged in and has facial auth set up
      if (!user || !user.hasFacialAuth) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await facialService.getDetailedFacialData();
        setFacialData(data);
      } catch (err) {
        console.error('Error fetching facial data:', err);
        setError('Could not load facial authentication details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFacialData();
  }, [user]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="animate-fade-in">
      <section className="mb-6">
        <div className="bg-primary text-white py-6 px-5 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome, {user?.username || 'User'}!</h1>
          <p>You've successfully logged in to your secure account using facial authentication.</p>
        </div>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Account Info Card */}
        <Card title="Account Information">
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 mb-1">Username</p>
              <p className="font-medium">{user?.username || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-gray-600 mb-1">Email</p>
              <p className="font-medium">{user?.email || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-gray-600 mb-1">Account Created</p>
              <p className="font-medium">{formatDate(user?.createdAt) || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-gray-600 mb-1">Last Login</p>
              <p className="font-medium">{formatDate(user?.lastLogin) || 'N/A'}</p>
            </div>
          </div>
        </Card>
        
        {/* Authentication Status Card */}
        <Card title="Authentication Status">
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 mb-1">Two-Factor Authentication</p>
              <div className="flex items-center">
                {user?.hasFacialAuth ? (
                  <>
                    <span className="inline-block h-3 w-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="font-medium text-green-600">Enabled</span>
                  </>
                ) : (
                  <>
                    <span className="inline-block h-3 w-3 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="font-medium text-yellow-600">Not Set Up</span>
                  </>
                )}
              </div>
            </div>
            
            {user?.hasFacialAuth && (
              <div>
                <p className="text-gray-600 mb-1">Facial Expression</p>
                <p className="font-medium capitalize">{user?.facialExpression || 'Unknown'}</p>
              </div>
            )}
            
            <div>
              <p className="text-gray-600 mb-1">Authentication Method</p>
              <p className="font-medium">
                {user?.hasFacialAuth 
                  ? 'Password + Facial Expression (2FA)' 
                  : 'Password Only (Basic)'}
              </p>
            </div>
            
            <div className="pt-2">
              {!user?.hasFacialAuth ? (
              <Button 
                onClick={() => navigate('/facial-setup')}
                className="w-full text-sm py-2"
              >
                Set Up Facial Authentication
              </Button>
              ) : (
                <Button 
                  variant="outline-primary"
                  className="w-full text-sm py-2"
                  onClick={() => navigate('/facial-setup')}
                >
                  Update Facial Authentication
                </Button>
              )}
            </div>
          </div>
        </Card>
      </section>
      
      {/* Facial Authentication Status section removed as requested */}
      
      {/* Security Tips - Reduced Size */}
      <section className="mb-3">
        <Card title="Security Tips" className="p-4">
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="text-primary mr-2 flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-xs">Use a strong, unique password</p>
                <p className="text-xs text-gray-600">Create a password that is at least 8 characters long with a mix of letters, numbers, and symbols.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-primary mr-2 flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-xs">Enable facial authentication</p>
                <p className="text-xs text-gray-600">Add an extra layer of security to your account by setting up facial expression authentication.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-primary mr-2 flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-xs">Log out when not using the app</p>
                <p className="text-xs text-gray-600">Always log out when you're done, especially on shared or public devices.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
      
      {/* Account Actions - Smaller Buttons with Red Color for Logout */}
      <section className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline-primary"
            className="flex-1 text-xs py-1 px-2"
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
          
          <Button 
            className="flex-1 text-xs py-1 px-2"
            onClick={logout}
            style={{ backgroundColor: '#e53935', color: 'white', border: 'none' }}
          >
            Log Out
          </Button>
        </div>
      </section>
      
      <div className="text-center text-gray-500 text-sm mt-6">
        <p>This is a demo application for the "Communication Beyond Words" hackathon.</p>
        <p>© {new Date().getFullYear()} Facial Authentication System</p>
      </div>
    </div>
  );
};

export default Dashboard;
