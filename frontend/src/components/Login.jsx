import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
// Import an icon for the button if you want to match the landing page (Optional)
import { FiLogIn } from 'react-icons/fi'; 

const Login = ({ onToggle, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.message || 'Login failed');
      }
      // If successful, AuthContext automatically updates user state and App.jsx will show dashboard
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. Wrap the entire form structure in the 'auth-card' container
    <div className="auth-card"> 
      <h2 style={{ marginBottom: '5px' }}>Welcome Back</h2>
      <p style={{ color: '#888', marginBottom: '25px', fontSize: '0.95rem' }}>Sign in to continue to SecureEscrow.</p>

      <form onSubmit={onSubmit}>
        {/* Custom error style */}
        {error && <div style={{ color: '#d9534f', backgroundColor: '#f9e6e6', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}
        
        {/* 2. Apply 'form-group' class to the input wrappers */}
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="user@example.com" // Good UX
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="••••••••"
          />
        </div>
        
        {/* 3. Apply 'auth-link' style to Forgot Password link */}
        <p style={{ textAlign: 'right', marginBottom: '20px' }}>
          <a className="auth-link" onClick={onForgotPassword}>Forgot Password?</a>
        </p>
        
        {/* 4. Apply 'form-submit-btn' class to the main button */}
        <button type="submit" disabled={loading} className="form-submit-btn">
          {loading ? 'Logging in...' : (
            <>
              <FiLogIn style={{ marginRight: '5px' }}/> 
              Log In
            </>
          )}
        </button>
      </form>
      
      {/* 5. Apply 'auth-link' style to the Register link */}
      <p style={{ marginTop: '25px', color: '#666', fontSize: '0.95rem' }}>
        Don't have an account? 
        <a className="auth-link" style={{ display: 'inline', marginLeft: '5px' }} onClick={onToggle}>
          Register
        </a>
      </p>
    </div>
  );
};

export default Login;