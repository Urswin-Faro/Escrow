import React, { useState } from 'react';
import { forgotPassword } from '../services/api'; // Make sure this import is correct

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await forgotPassword(email); // This should call the correct API
      setMessage(response.message);
      
      // For development - show the token
      if (response.token) {
        console.log('Reset token:', response.token);
        setMessage(`${response.message}\n\nDevelopment mode - Token: ${response.token}`);
      }
    } catch (error) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '1rem auto', padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        {error && <div className="error" style={{ color: 'red' }}>{error}</div>}
        {message && <div className="success" style={{ color: 'green', whiteSpace: 'pre-line' }}>{message}</div>}
        
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
        </div>
        
        <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>
        
        <p style={{ marginTop: 12 }}>
          <a href="#" onClick={onBack}>Back to Login</a>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
