import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setFormError('');
    
    try {
      // Register the user
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // Navigate to facial setup on success
      navigate('/facial-setup');
    } catch (error) {
      // Handle registration errors
      console.error('Registration error:', error);
      
      if (error.status === 409) {
        // Duplicate username or email
        setFormError('Username or email already exists');
      } else {
        setFormError(error.message || 'Registration failed. Please try again.');
      }
      
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-8 animate-fade-in">
      <Card
        title="Create Account"
        footer={
          <div className="text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium">
              Login
            </Link>
          </div>
        }
      >
        {formError && (
          <div className="alert alert-danger mb-4" role="alert">
            {formError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            id="username"
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            error={errors.username}
          />
          
          <Input
            id="email"
            type="email"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            error={errors.email}
          />
          
          <Input
            id="password"
            type="password"
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            error={errors.password}
            helpText="Password must be at least 6 characters"
          />
          
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            error={errors.confirmPassword}
          />
          
          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            By registering, you'll be prompted to set up facial authentication
            after creating your account.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
