import React, { useState } from 'react';
import { login } from '../services/api';

const Login = ({ onToggle, onLogin, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await login(email, password);
      
      // Store token and call the login handler
      localStorage.setItem('token', data.token);
      onLogin(data.user); // ✅ This should now work
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      <p>
        <a href="#" onClick={onForgotPassword}>Forgot Password?</a>
      </p>
      
      <p>
        Don't have an account? <a href="#" onClick={onToggle}>Register</a>
      </p>
    </form>
  );
};

export default Login;