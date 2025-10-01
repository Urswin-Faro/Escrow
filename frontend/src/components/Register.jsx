import React, { useState } from 'react';
import { register } from '../services/api';

const Register = ({ onToggle, onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords don't match");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await register(formData.username, formData.email, formData.password);
      localStorage.setItem('token', data.token);
      onRegister(data.user);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={onSubmit}>
        <h2>Register</h2>
        {error && <div className="error" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        
        <div className="form-group">
          <label>Username</label>
          <input 
            type="text" 
            name="username" 
            value={formData.username}
            onChange={handleChange} 
            required 
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email}
            onChange={handleChange} 
            required 
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password}
            onChange={handleChange} 
            required 
            disabled={loading}
            minLength={6}
          />
        </div>
        
        <div className="form-group">
          <label>Confirm Password</label>
          <input 
            type="password" 
            name="confirmPassword" 
            value={formData.confirmPassword}
            onChange={handleChange} 
            required 
            disabled={loading}
            minLength={6}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        
        <p>
          Already have an account? <a href="#" onClick={onToggle}>Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;